import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';
import { sendPushNotification } from '@/lib/push-notifications';
import { notificationTypeToEmailTemplate, sendEmailToUser } from '@/lib/email';

export const dynamic = "force-dynamic";

// ─── Valid order statuses ───
const VALID_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'partially_refunded',
];

// ─── Allowed refund transitions ───
// DELIVERED → REFUNDED | PARTIALLY_REFUNDED
// CONFIRMED/PROCESSING/SHIPPED → REFUNDED (cancel and refund)
const REFUND_TRANSITIONS: Record<string, string[]> = {
  delivered: ['refunded', 'partially_refunded'],
  confirmed: ['refunded'],
  processing: ['refunded'],
  shipped: ['refunded'],
};

// ─── Order select shape (shared between PATCH and GET) ───
const ORDER_SELECT = {
  id: true,
  orderNumber: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  subtotal: true,
  deliveryFee: true,
  discount: true,
  total: true,
  currency: true,
  notes: true,
  couponId: true,
  fraudScore: true,
  fraudFlagged: true,
  refundAmount: true,
  refundReason: true,
  deliveredAt: true,
  cancelledAt: true,
  refundedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, name: true, phone: true, email: true },
  },
  address: {
    select: {
      id: true,
      label: true,
      address: true,
      city: true,
      area: true,
      notes: true,
    },
  },
  items: {
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      price: true,
      quantity: true,
      total: true,
      image: true,
    },
  },
  statusLog: {
    select: {
      id: true,
      status: true,
      note: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

// ─── PATCH: Update order status by ID ───
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, note, refundAmount, refundReason } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Check order exists — include items and couponId for cancellation side-effects
    const existing = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate refund transitions
    const isRefundStatus = status === 'refunded' || status === 'partially_refunded';
    if (isRefundStatus) {
      const allowedNextStatuses = REFUND_TRANSITIONS[existing.status];
      if (!allowedNextStatuses || !allowedNextStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: `Cannot refund order in "${existing.status}" status. Refund is only allowed from: delivered, confirmed, processing, shipped.`,
          },
          { status: 400 }
        );
      }

      // Validate partial refund amount
      if (status === 'partially_refunded') {
        if (!refundAmount || refundAmount <= 0) {
          return NextResponse.json(
            { error: 'refundAmount is required and must be greater than 0 for partial refunds' },
            { status: 400 }
          );
        }
        const orderTotal = Number(existing.total);
        if (refundAmount > orderTotal) {
          return NextResponse.json(
            { error: `refundAmount (${refundAmount}) cannot exceed order total (${orderTotal})` },
            { status: 400 }
          );
        }
      }

      // Validate refund reason is provided
      if (!refundReason || refundReason.trim() === '') {
        return NextResponse.json(
          { error: 'refundReason is required for refund operations' },
          { status: 400 }
        );
      }
    }

    // Prevent transitioning away from terminal statuses (refunded, cancelled)
    if (
      (existing.status === 'refunded' || existing.status === 'partially_refunded') &&
      status !== existing.status
    ) {
      return NextResponse.json(
        { error: `Cannot change status of a ${existing.status} order` },
        { status: 400 }
      );
    }

    // Prevent re-cancelling an already cancelled order
    if (existing.status === 'cancelled' && status === 'cancelled') {
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = { status };

    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    // Handle refund-specific data
    if (isRefundStatus) {
      updateData.refundedAt = new Date();
      updateData.refundReason = refundReason;
      updateData.paymentStatus = 'refunded';

      if (status === 'refunded') {
        // Full refund: refundAmount = order total
        updateData.refundAmount = existing.total;
      } else {
        // Partial refund: use provided amount
        updateData.refundAmount = refundAmount;
      }

      // For non-delivered refunds, also mark as cancelled
      if (existing.status !== 'delivered') {
        updateData.cancelledAt = new Date();
      }
    }

    // Build audit log details
    const auditDetails: Record<string, unknown> = {
      from: existing.status,
      to: status,
    };
    if (isRefundStatus) {
      auditDetails.refundType = status === 'refunded' ? 'full' : 'partial';
      auditDetails.refundAmount = status === 'refunded' ? Number(existing.total) : refundAmount;
      auditDetails.refundReason = refundReason;
    }

    // Build status log note
    let statusLogNote = note || `Status changed to ${status}`;
    if (isRefundStatus) {
      const refundType = status === 'refunded' ? 'Full refund' : `Partial refund (${refundAmount} ${existing.currency})`;
      statusLogNote = note || `${refundType}: ${refundReason}`;
    }

    // ─── Cancellation side-effects (admin can cancel any order) ──────
    const isCancellation = status === 'cancelled';
    const wasAlreadyCancelled = existing.status === 'cancelled';

    // Find loyalty points before the transaction
    let pointsToRefund = 0;
    if (isCancellation && !wasAlreadyCancelled) {
      const loyaltyTx = await db.loyaltyTransaction.findFirst({
        where: { orderId: id, type: 'earn' },
      });
      pointsToRefund = loyaltyTx ? loyaltyTx.points : 0;
    }

    // Update order, create logs, and apply cancellation side-effects in a transaction
    const updatedOrder = await db.$transaction(async (tx) => {
      // 1. Update order status
      const order = await tx.order.update({
        where: { id },
        data: updateData,
        select: ORDER_SELECT,
      });

      // 2. Create status log
      await tx.orderStatusLog.create({
        data: {
          orderId: id,
          status,
          note: statusLogNote,
        },
      });

      // 3. Create audit log entry
      await tx.auditLog.create({
        data: {
          userId: request.headers.get('x-user-id') || undefined,
          action: isRefundStatus ? 'REFUND_ORDER' : (isCancellation ? 'CANCEL_ORDER' : 'UPDATE_ORDER_STATUS'),
          entity: 'Order',
          entityId: id,
          details: JSON.stringify(auditDetails),
          ip: request.headers.get('x-forwarded-for') || null,
        },
      });

      // 4. Cancellation side-effects
      if (isCancellation && !wasAlreadyCancelled) {
        // Restore stock — decrement reservedStock for each order item
        for (const item of existing.items) {
          const prod = await tx.product.findUnique({
            where: { id: item.productId },
            select: { reservedStock: true },
          });
          await tx.product.update({
            where: { id: item.productId },
            data: { reservedStock: Math.max(0, (prod?.reservedStock || 0) - item.quantity) },
          });
          // Inventory movement for the release
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: 'release',
              quantity: item.quantity,
              reference: existing.orderNumber,
              note: 'Stock released due to admin order cancellation',
            },
          });
        }

        // If coupon was used, decrement coupon usage count
        if (existing.couponId) {
          await tx.coupon.update({
            where: { id: existing.couponId },
            data: { usageCount: { decrement: 1 } },
          });
        }

        // Refund loyalty points if any were earned
        if (pointsToRefund > 0) {
          await tx.user.update({
            where: { id: existing.userId },
            data: { loyaltyPoints: { decrement: pointsToRefund } },
          });
          await tx.loyaltyTransaction.create({
            data: {
              userId: existing.userId,
              type: 'expire',
              points: pointsToRefund,
              orderId: id,
              description: `Points reversed due to admin cancellation of order #${existing.orderNumber}`,
            },
          });
        }
      }

      // 5. Delivery side-effects — deduct stock permanently and release reservation
      if (status === 'delivered' && existing.status !== 'delivered') {
        for (const item of existing.items) {
          const prod = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stock: true, reservedStock: true },
          });
          if (!prod) continue;
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: Math.max(0, Number(prod.stock) - item.quantity),
              reservedStock: Math.max(0, (prod.reservedStock || 0) - item.quantity),
            },
          });
          // Inventory movement for the sale
          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: 'out',
              quantity: item.quantity,
              reference: existing.orderNumber,
              note: 'Stock deducted on order delivery',
              createdBy: request.headers.get('x-user-id') || undefined,
            },
          });
        }
      }

      return order;
    });

    // Send notification to user for all status changes (non-critical)
    const statusMessages: Record<string, { titleAr: string; titleEn: string; bodyAr: string; bodyEn: string }> = {
      pending: {
        titleAr: 'طلبك قيد الانتظار',
        titleEn: 'Order Pending',
        bodyAr: `طلبك رقم ${existing.orderNumber} قيد الانتظار للمراجعة`,
        bodyEn: `Your order #${existing.orderNumber} is pending review`,
      },
      confirmed: {
        titleAr: 'تم تأكيد طلبك',
        titleEn: 'Order Confirmed',
        bodyAr: `طلبك رقم ${existing.orderNumber} تم تأكيده وسيتم تجهيزه قريباً`,
        bodyEn: `Your order #${existing.orderNumber} has been confirmed and will be prepared soon`,
      },
      processing: {
        titleAr: 'جاري تجهيز طلبك',
        titleEn: 'Order Processing',
        bodyAr: `طلبك رقم ${existing.orderNumber} جاري تجهيزه الآن`,
        bodyEn: `Your order #${existing.orderNumber} is being prepared`,
      },
      shipped: {
        titleAr: 'تم شحن طلبك',
        titleEn: 'Order Shipped',
        bodyAr: `طلبك رقم ${existing.orderNumber} تم شحنه وهو في الطريق إليك`,
        bodyEn: `Your order #${existing.orderNumber} has been shipped and is on its way`,
      },
      delivered: {
        titleAr: 'تم تسليم طلبك',
        titleEn: 'Order Delivered',
        bodyAr: `طلبك رقم ${existing.orderNumber} تم تسليمه بنجاح`,
        bodyEn: `Your order #${existing.orderNumber} has been delivered successfully`,
      },
      cancelled: {
        titleAr: 'تم إلغاء طلبك',
        titleEn: 'Order Cancelled',
        bodyAr: `طلبك رقم ${existing.orderNumber} تم إلغاؤه بواسطة الإدارة${note ? `: ${note}` : ''}`,
        bodyEn: `Your order #${existing.orderNumber} has been cancelled by admin${note ? `: ${note}` : ''}`,
      },
      refunded: {
        titleAr: 'تم استرداد مبلغ طلبك',
        titleEn: 'Order Refunded',
        bodyAr: `تم استرداد مبلغ طلبك رقم ${existing.orderNumber} بالكامل`,
        bodyEn: `Your order #${existing.orderNumber} has been fully refunded`,
      },
      partially_refunded: {
        titleAr: 'تم استرداد جزء من مبلغ طلبك',
        titleEn: 'Order Partially Refunded',
        bodyAr: `تم استرداد جزء من مبلغ طلبك رقم ${existing.orderNumber}`,
        bodyEn: `Your order #${existing.orderNumber} has been partially refunded`,
      },
    };

    const msg = statusMessages[status];
    if (msg) {
      try {
        const notif = await db.notification.create({
          data: {
            userId: existing.userId,
            titleAr: msg.titleAr,
            titleEn: msg.titleEn,
            bodyAr: msg.bodyAr,
            bodyEn: msg.bodyEn,
            type: 'order',
          },
        });

        // Send push notification to user's devices (fire-and-forget)
        sendPushNotification(existing.userId, {
          titleAr: msg.titleAr,
          titleEn: msg.titleEn,
          bodyAr: msg.bodyAr,
          bodyEn: msg.bodyEn,
          data: {
            notificationId: notif.id,
            type: 'order',
            orderId: id,
            orderNumber: existing.orderNumber,
            status,
          },
        }).catch((err) => {
          console.error('[ADMIN_ORDER] Push notification failed:', err);
        });

        // Send email notification (fire-and-forget)
        const emailTemplate = notificationTypeToEmailTemplate('order');
        if (emailTemplate) {
          sendEmailToUser(existing.userId, emailTemplate, {
            customerName: existing.userId,
            orderNumber: existing.orderNumber,
          }).catch((err) => {
            console.error('[ADMIN_ORDER] Email notification failed:', err);
          });
        }
      } catch {
        // Non-critical — don't fail the status update
      }
    }

    return NextResponse.json({
      order: serializeDecimal(updatedOrder),
      message: isRefundStatus
        ? `Order ${status === 'refunded' ? 'fully' : 'partially'} refunded successfully`
        : isCancellation
          ? 'Order cancelled successfully'
          : 'Order status updated successfully',
    });
  } catch (error) {
    console.error('[ADMIN_ORDER_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// ─── GET: Get single order details ───
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
      select: {
        ...ORDER_SELECT,
        items: {
          select: {
            id: true,
            productId: true,
            nameAr: true,
            nameEn: true,
            price: true,
            quantity: true,
            total: true,
            image: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order: serializeDecimal(order) });
  } catch (error) {
    console.error('[ADMIN_ORDER_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
