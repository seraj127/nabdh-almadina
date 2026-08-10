import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: List all orders with pagination and filters ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: Record<string, unknown> = {};

    // Search by order number
    if (search) {
      where.orderNumber = { contains: search };
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
          items: true,
          statusLog: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          shipment: {
            include: {
              carrier: {
                select: { id: true, nameAr: true, nameEn: true, code: true, trackingUrl: true },
              },
              logs: {
                orderBy: { occurredAt: 'desc' },
                take: 3,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: serializeDecimal(orders),
      total,
    });
  } catch (error) {
    console.error('[ADMIN_ORDERS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update order status ───
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id, status, note } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Check order exists
    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order and create status log in a transaction
    const [updatedOrder] = await db.$transaction([
      db.order.update({
        where: { id },
        data: {
          status,
          ...(status === 'delivered' ? { deliveredAt: new Date() } : {}),
          ...(status === 'cancelled' ? { cancelledAt: new Date() } : {}),
        },
        include: {
          user: {
            select: { id: true, name: true, phone: true, email: true },
          },
          items: true,
        },
      }),
      db.orderStatusLog.create({
        data: {
          orderId: id,
          status,
          note: note || `Status changed to ${status}`,
        },
      }),
    ]);

    // ─── Auto-notification for customer ─────────────────────────────────
    try {
      const statusMessages: Record<string, { titleAr: string; titleEn: string; bodyAr: string; bodyEn: string }> = {
        confirmed: {
          titleAr: 'تم تأكيد طلبك',
          titleEn: 'Order Confirmed',
          bodyAr: `طلبك رقم ${existing.orderNumber} تم تأكيده وسيتم تحضيره قريباً`,
          bodyEn: `Your order #${existing.orderNumber} has been confirmed and will be prepared soon`,
        },
        processing: {
          titleAr: 'جاري تحضير طلبك',
          titleEn: 'Order Processing',
          bodyAr: `طلبك رقم ${existing.orderNumber} يتم تحضيره الآن`,
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
          bodyAr: `طلبك رقم ${existing.orderNumber} تم تسليمه بنجاح. شكراً لتسوقك معنا!`,
          bodyEn: `Your order #${existing.orderNumber} has been delivered. Thank you for shopping with us!`,
        },
        cancelled: {
          titleAr: 'تم إلغاء طلبك',
          titleEn: 'Order Cancelled',
          bodyAr: `طلبك رقم ${existing.orderNumber} تم إلغاؤه`,
          bodyEn: `Your order #${existing.orderNumber} has been cancelled`,
        },
      };
      const msg = statusMessages[status];
      if (msg) {
        await db.notification.create({
          data: {
            userId: existing.userId,
            titleAr: msg.titleAr,
            titleEn: msg.titleEn,
            bodyAr: msg.bodyAr,
            bodyEn: msg.bodyEn,
            type: status === 'cancelled' ? 'system' : 'order',
          },
        });
      }
    } catch {
      // Non-critical - don't fail the status update
    }

    return NextResponse.json(serializeDecimal(updatedOrder));
  } catch (error) {
    console.error('[ADMIN_ORDERS_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
