import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── PATCH /api/orders/[id] — Cancel an order ───────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { id } = await params;
    const userId = authUserId;

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الطلب مطلوب' },
        { status: 400 }
      );
    }

    // Parse optional reason from body
    let reason = '';
    try {
      const body = await request.json();
      reason = (body.reason as string) || '';
    } catch {
      // body is optional / may be empty
    }

    // Fetch the order with items
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    // Verify the user owns the order
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: 'غير مصرح — لا يمكنك إلغاء طلب لا يخصك' },
        { status: 403 }
      );
    }

    // Only pending or confirmed orders can be cancelled by the customer
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'لا يمكن إلغاء الطلب في حالته الحالية — فقط الطلبات المعلقة أو المؤكدة قابلة للإلغاء' },
        { status: 400 }
      );
    }

    const now = new Date();
    const statusLogNote = reason
      ? `تم إلغاء الطلب: ${reason}`
      : 'تم إلغاء الطلب بواسطة العميل';

    // ─── Find loyalty points earned for this order ──────────────
    const loyaltyTx = await db.loyaltyTransaction.findFirst({
      where: { orderId: id, type: 'earn' },
    });
    const pointsToRefund = loyaltyTx ? loyaltyTx.points : 0;

    // ─── Execute all cancellation operations in a transaction ────
    await db.$transaction(async (tx) => {
      // 1. Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: 'cancelled',
          cancelledAt: now,
        },
      });

      // 2. Create status log
      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          status: 'cancelled',
          note: statusLogNote,
        },
      });

      // 3. Restore stock — decrement reservedStock for each order item
      for (const item of order.items) {
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
          select: { reservedStock: true },
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { reservedStock: Math.max(0, (prod?.reservedStock || 0) - item.quantity) },
        });

        // Create inventory movement for the release
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'release',
            quantity: item.quantity,
            reference: order.orderNumber,
            note: 'Stock released due to order cancellation',
          },
        });
      }

      // 4. If coupon was used, decrement coupon usage count
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usageCount: { decrement: 1 } },
        });
      }

      // 5. Refund loyalty points if any were earned
      if (pointsToRefund > 0) {
        await tx.user.update({
          where: { id: order.userId },
          data: { loyaltyPoints: { decrement: pointsToRefund } },
        });
        await tx.loyaltyTransaction.create({
          data: {
            userId: order.userId,
            type: 'expire',
            points: pointsToRefund,
            orderId: id,
            description: `Points reversed due to cancellation of order #${order.orderNumber}`,
          },
        });
      }
    });

    // 6. Create notification (non-critical, wrap in try/catch)
    try {
      await db.notification.create({
        data: {
          userId: order.userId,
          titleAr: 'تم إلغاء طلبك',
          titleEn: 'Order Cancelled',
          bodyAr: `طلبك رقم ${order.orderNumber} تم إلغاؤه بنجاح${reason ? `: ${reason}` : ''}`,
          bodyEn: `Your order #${order.orderNumber} has been cancelled${reason ? `: ${reason}` : ''}`,
          type: 'order',
        },
      });
    } catch {
      // Non-critical — don't fail the cancellation
    }

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء الطلب بنجاح',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: 'cancelled',
        cancelledAt: now,
      },
      refundedPoints: pointsToRefund,
    });
  } catch (error) {
    console.error('[ORDER_CANCEL_PATCH]', error);
    return NextResponse.json(
      { error: 'فشل في إلغاء الطلب' },
      { status: 500 }
    );
  }
}

// ─── GET /api/orders/[id] ───────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'معرف الطلب مطلوب' },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: true,
        statusLog: {
          orderBy: { createdAt: 'desc' },
        },
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    // Verify the authenticated user owns this order
    if (order.userId !== authUserId) {
      return NextResponse.json(
        { error: 'Forbidden – you can only view your own orders' },
        { status: 403 }
      );
    }

    // Parse shipping address details from address notes if available
    let shippingAddress: Record<string, unknown> | null = null;
    if (order.address) {
      let parsedNotes: Record<string, unknown> = {};
      try {
        parsedNotes = JSON.parse(order.address.notes || '{}');
      } catch {
        // notes might not be JSON
      }

      shippingAddress = {
        id: order.address.id,
        fullName: (parsedNotes.fullName as string) || '',
        phone: (parsedNotes.phone as string) || '',
        city: order.address.city,
        cityId: (parsedNotes.cityId as string) || null,
        area: order.address.area,
        areaId: (parsedNotes.areaId as string) || null,
        address: order.address.address,
        notes: (parsedNotes.userNotes as string) || null,
        label: order.address.label,
      };
    }

    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      currency: order.currency,
      notes: order.notes,
      addressId: order.addressId,
      shippingAddress,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        price: Number(item.price),
        quantity: item.quantity,
        total: Number(item.total),
        image: item.image,
      })),
      statusLog: order.statusLog.map((log) => ({
        id: log.id,
        status: log.status,
        note: log.note,
        createdAt: log.createdAt,
      })),
      fraudScore: order.fraudScore,
      fraudFlagged: order.fraudFlagged,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الطلب' },
      { status: 500 }
    );
  }
}
