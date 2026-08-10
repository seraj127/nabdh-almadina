import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: List shipments with filters ───────────────────────────
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const carrierId = searchParams.get('carrierId') || '';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (carrierId) where.carrierId = carrierId;
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search } },
        { waybillNumber: { contains: search } },
        { order: { orderNumber: { contains: search } } },
      ];
    }

    const [shipments, total] = await Promise.all([
      db.shipment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
              paymentMethod: true,
              user: { select: { id: true, name: true, phone: true } },
              address: true,
            },
          },
          carrier: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              code: true,
              type: true,
              trackingUrl: true,
            },
          },
          logs: {
            orderBy: { occurredAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.shipment.count({ where }),
    ]);

    return NextResponse.json({
      shipments: serializeDecimal(shipments),
      total,
    });
  } catch (error) {
    console.error('[SHIPMENTS_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

// ─── POST: Create a shipment for an order ───────────────────────
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      orderId, carrierId, trackingNumber, waybillNumber,
      weight, shippingCost, codAmount, notes,
    } = body;

    if (!orderId || !carrierId) {
      return NextResponse.json(
        { error: 'Order ID and Carrier ID are required' },
        { status: 400 }
      );
    }

    // Check order exists
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { address: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if shipment already exists for this order
    const existingShipment = await db.shipment.findUnique({
      where: { orderId },
    });

    if (existingShipment) {
      return NextResponse.json(
        { error: 'Shipment already exists for this order' },
        { status: 409 }
      );
    }

    // Check carrier exists
    const carrier = await db.shippingCarrier.findUnique({
      where: { id: carrierId },
    });

    if (!carrier) {
      return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
    }

    // Calculate shipping cost if not provided
    const calculatedCost = shippingCost ?? Number(carrier.basePrice);
    const codAmt = codAmount ?? (order.paymentMethod === 'cod' ? Number(order.total) : 0);

    // Calculate estimated delivery
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + Number(carrier.estimatedDays));

    const estimatedPickup = new Date();
    estimatedPickup.setDate(estimatedPickup.getDate() + 1);

    // Create shipment + update order status + notifications in transaction
    const result = await db.$transaction(async (tx) => {
      // Create shipment
      const shipment = await tx.shipment.create({
        data: {
          orderId,
          carrierId,
          trackingNumber: trackingNumber || null,
          waybillNumber: waybillNumber || null,
          weight: weight || null,
          shippingCost: calculatedCost,
          codAmount: codAmt,
          estimatedPickup,
          estimatedDelivery,
          notes: notes || null,
        },
      });

      // Create initial shipment log
      await tx.shipmentLog.create({
        data: {
          shipmentId: shipment.id,
          status: 'created',
          location: 'مستودع نبض المدينة',
          descriptionAr: 'تم إنشاء الشحنة وتجهيزها للتسليم لشركة الشحن',
          descriptionEn: 'Shipment created and prepared for carrier pickup',
        },
      });

      // Update order status to shipped
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'shipped' },
      });

      await tx.orderStatusLog.create({
        data: {
          orderId,
          status: 'shipped',
          note: `Shipment created with ${carrier.nameAr} - Tracking: ${trackingNumber || 'N/A'}`,
        },
      });

      // Update carrier shipment count
      await tx.shippingCarrier.update({
        where: { id: carrierId },
        data: { totalShipments: { increment: 1 } },
      });

      // Send notification to customer
      await tx.notification.create({
        data: {
          userId: order.userId,
          titleAr: 'تم شحن طلبك',
          titleEn: 'Order Shipped',
          bodyAr: `طلبك رقم ${order.orderNumber} تم شحنه عبر ${carrier.nameAr}${trackingNumber ? ` - رقم التتبع: ${trackingNumber}` : ''}`,
          bodyEn: `Your order #${order.orderNumber} has been shipped via ${carrier.nameEn}${trackingNumber ? ` - Tracking: ${trackingNumber}` : ''}`,
          type: 'order',
        },
      });

      return shipment;
    });

    // Try to push to carrier API if integrated
    if (carrier.isIntegrated && carrier.apiEndpoint) {
      try {
        await pushShipmentToCarrier(carrier, {
          id: result.id,
          trackingNumber: result.trackingNumber,
          weight: result.weight ? Number(result.weight) : null,
          shippingCost: Number(result.shippingCost),
          codAmount: Number(result.codAmount),
        }, { orderNumber: order.orderNumber, total: Number(order.total), notes: order.notes });
      } catch (apiError) {
        console.error('[CARRIER_API_PUSH_FAILED]', apiError);
        // Non-critical - shipment is still created locally
      }
    }

    const shipmentWithDetails = await db.shipment.findUnique({
      where: { id: result.id },
      include: {
        order: { select: { orderNumber: true, status: true } },
        carrier: { select: { nameAr: true, nameEn: true, code: true } },
        logs: { orderBy: { occurredAt: 'desc' } },
      },
    });

    return NextResponse.json(serializeDecimal(shipmentWithDetails), { status: 201 });
  } catch (error) {
    console.error('[SHIPMENTS_POST]', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}

// ─── PATCH: Update shipment status ──────────────────────────────
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, status, trackingNumber, waybillNumber, weight, shippingCost, notes, location, descriptionAr, descriptionEn } = body;

    if (!id) {
      return NextResponse.json({ error: 'Shipment ID is required' }, { status: 400 });
    }

    const shipment = await db.shipment.findUnique({
      where: { id },
      include: { order: true, carrier: true },
    });

    if (!shipment) {
      return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (waybillNumber !== undefined) updateData.waybillNumber = waybillNumber;
    if (weight !== undefined) updateData.weight = weight;
    if (shippingCost !== undefined) updateData.shippingCost = shippingCost;
    if (notes !== undefined) updateData.notes = notes;

    // Handle status change
    if (status && status !== shipment.status) {
      updateData.status = status;
      updateData.lastSyncedAt = new Date();

      // Set timestamps based on status
      if (status === 'picked_up') updateData.actualPickup = new Date();
      if (status === 'delivered') {
        updateData.actualDelivery = new Date();
        updateData.codCollected = Number(shipment.codAmount) > 0;
      }
      if (status === 'failed') updateData.failedAttempts = { increment: 1 };

      // Create shipment log
      await db.shipmentLog.create({
        data: {
          shipmentId: id,
          status,
          location: location || null,
          descriptionAr: descriptionAr || getStatusDescriptionAr(status),
          descriptionEn: descriptionEn || getStatusDescriptionEn(status),
        },
      });

      // Update order status if needed
      const orderStatusMap: Record<string, string> = {
        picked_up: 'shipped',
        in_transit: 'shipped',
        out_for_delivery: 'shipped',
        delivered: 'delivered',
        failed: 'shipped', // keep order as shipped
        returned: 'cancelled',
      };

      const newOrderStatus = orderStatusMap[status];
      if (newOrderStatus && newOrderStatus !== shipment.order.status) {
        await db.order.update({
          where: { id: shipment.orderId },
          data: {
            status: newOrderStatus,
            ...(newOrderStatus === 'delivered' ? { deliveredAt: new Date() } : {}),
            ...(newOrderStatus === 'cancelled' ? { cancelledAt: new Date() } : {}),
          },
        });

        await db.orderStatusLog.create({
          data: {
            orderId: shipment.orderId,
            status: newOrderStatus,
            note: `Shipment status: ${status} via ${shipment.carrier.nameAr}`,
          },
        });

        // Send notification
        const statusMessages: Record<string, { titleAr: string; titleEn: string; bodyAr: string; bodyEn: string }> = {
          out_for_delivery: {
            titleAr: 'شحنتك في الطريق إليك',
            titleEn: 'Your Shipment is Out for Delivery',
            bodyAr: `شحنة طلبك رقم ${shipment.order.orderNumber} خرجت للتوصيل`,
            bodyEn: `Your shipment for order #${shipment.order.orderNumber} is out for delivery`,
          },
          delivered: {
            titleAr: 'تم تسليم شحنتك',
            titleEn: 'Shipment Delivered',
            bodyAr: `تم تسليم شحنة طلبك رقم ${shipment.order.orderNumber} بنجاح`,
            bodyEn: `Your shipment for order #${shipment.order.orderNumber} has been delivered`,
          },
          failed: {
            titleAr: 'فشل تسليم الشحنة',
            titleEn: 'Delivery Failed',
            bodyAr: `فشل تسليم شحنة طلبك رقم ${shipment.order.orderNumber}. سيتم إعادة المحاولة`,
            bodyEn: `Delivery failed for order #${shipment.order.orderNumber}. Will retry`,
          },
        };

        const msg = statusMessages[status];
        if (msg) {
          await db.notification.create({
            data: {
              userId: shipment.order.userId,
              titleAr: msg.titleAr,
              titleEn: msg.titleEn,
              bodyAr: msg.bodyAr,
              bodyEn: msg.bodyEn,
              type: 'order',
            },
          });
        }
      }
    }

    const updatedShipment = await db.shipment.update({
      where: { id },
      data: updateData,
      include: {
        order: { select: { orderNumber: true, status: true } },
        carrier: { select: { nameAr: true, nameEn: true, code: true } },
        logs: { orderBy: { occurredAt: 'desc' } },
      },
    });

    return NextResponse.json(serializeDecimal(updatedShipment));
  } catch (error) {
    console.error('[SHIPMENTS_PATCH]', error);
    return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
  }
}

// ─── Helper: Push shipment to carrier API ───────────────────────
async function pushShipmentToCarrier(
  carrier: { apiEndpoint: string | null; apiKey: string | null; apiSecret: string | null },
  shipment: { id: string; trackingNumber: string | null; weight: number | null; shippingCost: number; codAmount: number },
  order: { orderNumber: string; total: number; notes: string | null }
) {
  if (!carrier.apiEndpoint) return;

  const response = await fetch(carrier.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(carrier.apiKey ? { 'Authorization': `Bearer ${carrier.apiKey}` } : {}),
      ...(carrier.apiSecret ? { 'X-API-Secret': carrier.apiSecret } : {}),
    },
    body: JSON.stringify({
      shipmentId: shipment.id,
      trackingNumber: shipment.trackingNumber,
      orderNumber: order.orderNumber,
      weight: shipment.weight,
      codAmount: shipment.codAmount,
      notes: order.notes,
    }),
  });

  if (!response.ok) {
    throw new Error(`Carrier API returned ${response.status}`);
  }

  const data = await response.json();

  // Update shipment with carrier response
  await db.shipment.update({
    where: { id: shipment.id },
    data: {
      carrierData: JSON.stringify(data),
      lastSyncedAt: new Date(),
      ...(data.trackingNumber ? { trackingNumber: data.trackingNumber } : {}),
      ...(data.waybillNumber ? { waybillNumber: data.waybillNumber } : {}),
    },
  });
}

// ─── Helper: Status descriptions ────────────────────────────────
function getStatusDescriptionAr(status: string): string {
  const map: Record<string, string> = {
    created: 'تم إنشاء الشحنة',
    picked_up: 'تم استلام الشحنة من المستودع',
    in_transit: 'الشحنة في الطريق',
    out_for_delivery: 'الشحنة خرجت للتوصيل',
    delivered: 'تم تسليم الشحنة',
    failed: 'فشل تسليم الشحنة',
    returned: 'تم إرجاع الشحنة',
  };
  return map[status] || status;
}

function getStatusDescriptionEn(status: string): string {
  const map: Record<string, string> = {
    created: 'Shipment created',
    picked_up: 'Shipment picked up from warehouse',
    in_transit: 'Shipment in transit',
    out_for_delivery: 'Shipment out for delivery',
    delivered: 'Shipment delivered',
    failed: 'Delivery attempt failed',
    returned: 'Shipment returned',
  };
  return map[status] || status;
}
