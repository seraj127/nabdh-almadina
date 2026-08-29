import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';
import { getCarrierAdapter } from '@/lib/shipping-integration';

export const dynamic = "force-dynamic";

// ─── Simple webhook signature validation ──────────────────────
function validateWebhookSignature(
  _carrierCode: string,
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Simple HMAC-based validation, constant-time comparison
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return false;
    return timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Carrier-Signature',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── POST: Webhook for carrier status updates ───────────────────
// Enhanced to handle webhooks from different carriers with signature validation
export async function POST(request: NextRequest) {
  try {
    // Extract carrier signature header for validation
    const carrierSignature = request.headers.get('X-Carrier-Signature') || '';
    const carrierCode = request.headers.get('X-Carrier-Code') || '';

    const body = await request.json();

    // ─── Handle both unified and carrier-specific webhook formats ───
    let trackingNumber: string;
    let status: string;
    let location: string | undefined;
    let descriptionAr: string | undefined;
    let descriptionEn: string | undefined;
    let latitude: number | undefined;
    let longitude: number | undefined;
    let actualDelivery: Date | undefined;
    let failureReason: string | undefined;
    let waybillNumber: string | undefined;
    let resolvedCarrierCode: string;

    // Check if this is a carrier-specific format
    if (carrierCode) {
      // Carrier-specific webhook (e.g., Libya Express sends its own format)
      resolvedCarrierCode = carrierCode;
      const parsed = parseCarrierSpecificWebhook(carrierCode, body);
      trackingNumber = parsed.trackingNumber;
      status = parsed.status;
      location = parsed.location;
      descriptionAr = parsed.descriptionAr;
      descriptionEn = parsed.descriptionEn;
      latitude = parsed.latitude;
      longitude = parsed.longitude;
      actualDelivery = parsed.actualDelivery;
      failureReason = parsed.failureReason;
      waybillNumber = parsed.waybillNumber;
    } else {
      // Unified format (backward compatible)
      resolvedCarrierCode = body.carrierCode || '';
      trackingNumber = body.trackingNumber || '';
      status = body.status || '';
      location = body.location;
      descriptionAr = body.descriptionAr;
      descriptionEn = body.descriptionEn;
      latitude = body.latitude;
      longitude = body.longitude;
      actualDelivery = body.actualDelivery ? new Date(body.actualDelivery) : undefined;
      failureReason = body.failureReason;
      waybillNumber = body.waybillNumber;
    }

    if (!resolvedCarrierCode || !trackingNumber || !status) {
      return NextResponse.json(
        { error: 'carrierCode, trackingNumber, and status are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // ─── Verify carrier exists ───────────────────────────────────
    const carrier = await db.shippingCarrier.findUnique({
      where: { code: resolvedCarrierCode },
    });

    if (!carrier) {
      return NextResponse.json(
        { error: 'Unknown carrier' },
        { status: 404, headers: corsHeaders }
      );
    }

    // ─── Validate webhook signature if carrier has API integration ───
    // Integrated carriers with a configured secret MUST send a valid signature
    // (previously the check was skipped entirely when the header was absent).
    if (carrier.isIntegrated && carrier.apiSecret) {
      if (!carrierSignature) {
        return NextResponse.json(
          { error: 'Missing webhook signature' },
          { status: 401, headers: corsHeaders }
        );
      }
      const rawBody = JSON.stringify(body);
      const isValid = validateWebhookSignature(
        resolvedCarrierCode,
        rawBody,
        carrierSignature,
        carrier.apiSecret
      );

      if (!isValid) {
        console.warn(`[SHIPPING_WEBHOOK] Invalid signature for carrier ${resolvedCarrierCode}`);
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401, headers: corsHeaders }
        );
      }
    }

    // ─── Find shipment by tracking number ────────────────────────
    const shipment = await db.shipment.findFirst({
      where: { trackingNumber },
      include: { order: true },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // ─── Validate status ─────────────────────────────────────────
    const validStatuses = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}` },
        { status: 400, headers: corsHeaders }
      );
    }

    // ─── Auto-translate status descriptions if not provided ──────
    if (!descriptionAr || !descriptionEn) {
      const statusDescriptions = getStatusDescriptions(status, carrier.nameAr, carrier.nameEn);
      descriptionAr = descriptionAr || statusDescriptions.descriptionAr;
      descriptionEn = descriptionEn || statusDescriptions.descriptionEn;
    }

    // ─── Create shipment log and update shipment ─────────────────
    await db.$transaction(async (tx) => {
      // Create shipment log
      await tx.shipmentLog.create({
        data: {
          shipmentId: shipment.id,
          status,
          location: location || null,
          descriptionAr: descriptionAr || null,
          descriptionEn: descriptionEn || null,
          latitude: latitude || null,
          longitude: longitude || null,
        },
      });

      // Update shipment
      const updateData: Record<string, unknown> = {
        status,
        lastSyncedAt: new Date(),
      };

      if (waybillNumber) updateData.waybillNumber = waybillNumber;
      if (failureReason) updateData.failureReason = failureReason;
      if (status === 'picked_up') updateData.actualPickup = actualDelivery || new Date();
      if (status === 'delivered') {
        updateData.actualDelivery = actualDelivery || new Date();
        updateData.codCollected = Number(shipment.codAmount) > 0;
      }
      if (status === 'failed') updateData.failedAttempts = { increment: 1 };

      await tx.shipment.update({
        where: { id: shipment.id },
        data: updateData,
      });

      // ─── Update order status based on shipment status ────────────
      const orderStatusMap: Record<string, string> = {
        picked_up: 'shipped',
        in_transit: 'shipped',
        out_for_delivery: 'shipped',
        delivered: 'delivered',
        failed: 'shipped',
        returned: 'cancelled',
      };

      const newOrderStatus = orderStatusMap[status];
      if (newOrderStatus && newOrderStatus !== shipment.order.status) {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: {
            status: newOrderStatus,
            ...(newOrderStatus === 'delivered' ? { deliveredAt: new Date() } : {}),
            ...(newOrderStatus === 'cancelled' ? { cancelledAt: new Date() } : {}),
          },
        });

        await tx.orderStatusLog.create({
          data: {
            orderId: shipment.orderId,
            status: newOrderStatus,
            note: `[Webhook] Carrier ${resolvedCarrierCode}: ${status}${location ? ` at ${location}` : ''}`,
          },
        });

        // ─── Send customer notification for key status changes ──────
        const statusMessages: Record<string, { titleAr: string; titleEn: string; bodyAr: string; bodyEn: string }> = {
          picked_up: {
            titleAr: 'تم استلام شحنتك',
            titleEn: 'Shipment Picked Up',
            bodyAr: `شحنة طلبك رقم ${shipment.order.orderNumber} تم استلامها بواسطة ${carrier.nameAr}`,
            bodyEn: `Your shipment for order #${shipment.order.orderNumber} has been picked up by ${carrier.nameEn}`,
          },
          out_for_delivery: {
            titleAr: 'شحنتك في الطريق إليك!',
            titleEn: 'Your Shipment is Out for Delivery!',
            bodyAr: `شحنة طلبك رقم ${shipment.order.orderNumber} خرجت للتوصيل عبر ${carrier.nameAr}`,
            bodyEn: `Your shipment for order #${shipment.order.orderNumber} is out for delivery via ${carrier.nameEn}`,
          },
          delivered: {
            titleAr: 'تم تسليم شحنتك بنجاح',
            titleEn: 'Your Shipment Has Been Delivered',
            bodyAr: `تم تسليم شحنة طلبك رقم ${shipment.order.orderNumber} بنجاح. شكراً لتسوقك معنا!`,
            bodyEn: `Your shipment for order #${shipment.order.orderNumber} has been delivered. Thank you for shopping with us!`,
          },
          failed: {
            titleAr: 'فشل تسليم الشحنة',
            titleEn: 'Delivery Attempt Failed',
            bodyAr: `فشل تسليم شحنة طلبك رقم ${shipment.order.orderNumber}. سيتم إعادة المحاولة`,
            bodyEn: `Delivery attempt failed for order #${shipment.order.orderNumber}. Will retry`,
          },
          returned: {
            titleAr: 'تم إرجاع الشحنة',
            titleEn: 'Shipment Returned',
            bodyAr: `تم إرجاع شحنة طلبك رقم ${shipment.order.orderNumber}`,
            bodyEn: `Your shipment for order #${shipment.order.orderNumber} has been returned`,
          },
        };

        const msg = statusMessages[status];
        if (msg) {
          await tx.notification.create({
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
    });

    return NextResponse.json(
      { success: true, shipmentId: shipment.id, status },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[SHIPPING_WEBHOOK_POST]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── Helper: Parse carrier-specific webhook formats ───────
function parseCarrierSpecificWebhook(
  carrierCode: string,
  body: Record<string, any>
): {
  trackingNumber: string;
  status: string;
  location?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  latitude?: number;
  longitude?: number;
  actualDelivery?: Date;
  failureReason?: string;
  waybillNumber?: string;
} {
  // Each carrier may send webhooks in a different format
  // Normalize them into our standard format

  switch (carrierCode) {
    case 'libya_express':
    case 'libya-express': {
      // Libya Express format
      return {
        trackingNumber: body.tracking_id || body.trackingNumber || '',
        status: mapLibyaExpressStatus(body.event_type || body.status || ''),
        location: body.hub_name || body.location,
        descriptionAr: body.description_ar || body.descriptionAr,
        descriptionEn: body.description_en || body.descriptionEn,
        latitude: body.lat || body.latitude,
        longitude: body.lng || body.longitude,
        actualDelivery: body.delivered_at ? new Date(body.delivered_at) : undefined,
        failureReason: body.failure_reason || body.failureReason,
        waybillNumber: body.waybill || body.waybillNumber,
      };
    }

    case 'libya_post':
    case 'libya-post': {
      // Libya Post format
      return {
        trackingNumber: body.barcode || body.trackingNumber || '',
        status: mapLibyaPostStatus(body.state || body.status || ''),
        location: body.office_name || body.location,
        descriptionAr: body.note_ar || body.descriptionAr,
        descriptionEn: body.note_en || body.descriptionEn,
        actualDelivery: body.delivery_date ? new Date(body.delivery_date) : undefined,
        failureReason: body.fail_reason || body.failureReason,
        waybillNumber: body.shipment_no || body.waybillNumber,
      };
    }

    default: {
      // Generic format - pass through
      return {
        trackingNumber: body.trackingNumber || body.tracking_id || '',
        status: body.status || body.event_type || '',
        location: body.location || body.hub_name,
        descriptionAr: body.descriptionAr || body.description_ar,
        descriptionEn: body.descriptionEn || body.description_en,
        latitude: body.latitude || body.lat,
        longitude: body.longitude || body.lng,
        actualDelivery: body.actualDelivery ? new Date(body.actualDelivery) : undefined,
        failureReason: body.failureReason || body.failure_reason,
        waybillNumber: body.waybillNumber || body.waybill,
      };
    }
  }
}

// ─── Carrier-specific status mappers ──────────────────────
function mapLibyaExpressStatus(status: string): string {
  const map: Record<string, string> = {
    'PICKED_UP': 'picked_up',
    'pickup': 'picked_up',
    'IN_TRANSIT': 'in_transit',
    'transit': 'in_transit',
    'OUT_FOR_DELIVERY': 'out_for_delivery',
    'delivering': 'out_for_delivery',
    'DELIVERED': 'delivered',
    'delivered': 'delivered',
    'FAILED': 'failed',
    'failed': 'failed',
    'RETURNED': 'returned',
    'returned': 'returned',
  };
  return map[status] || status;
}

function mapLibyaPostStatus(status: string): string {
  const map: Record<string, string> = {
    'RECEIVED': 'picked_up',
    'received': 'picked_up',
    'ON_THE_WAY': 'in_transit',
    'on_the_way': 'in_transit',
    'DELIVERING': 'out_for_delivery',
    'delivering': 'out_for_delivery',
    'DELIVERED': 'delivered',
    'delivered': 'delivered',
    'UNDELIVERED': 'failed',
    'undelivered': 'failed',
    'RETURNED': 'returned',
    'returned': 'returned',
  };
  return map[status] || status;
}

// ─── Helper: Get default status descriptions ──────────────
function getStatusDescriptions(
  status: string,
  carrierNameAr: string,
  carrierNameEn: string
): { descriptionAr: string; descriptionEn: string } {
  const map: Record<string, { descriptionAr: string; descriptionEn: string }> = {
    picked_up: {
      descriptionAr: `تم استلام الشحنة بواسطة ${carrierNameAr}`,
      descriptionEn: `Shipment picked up by ${carrierNameEn}`,
    },
    in_transit: {
      descriptionAr: `الشحنة في الطريق عبر ${carrierNameAr}`,
      descriptionEn: `Shipment in transit via ${carrierNameEn}`,
    },
    out_for_delivery: {
      descriptionAr: `الشحنة خرجت للتوصيل عبر ${carrierNameAr}`,
      descriptionEn: `Shipment out for delivery via ${carrierNameEn}`,
    },
    delivered: {
      descriptionAr: `تم تسليم الشحنة بنجاح عبر ${carrierNameAr}`,
      descriptionEn: `Shipment delivered successfully via ${carrierNameEn}`,
    },
    failed: {
      descriptionAr: `فشل تسليم الشحنة عبر ${carrierNameAr}`,
      descriptionEn: `Delivery failed via ${carrierNameEn}`,
    },
    returned: {
      descriptionAr: `تم إرجاع الشحنة عبر ${carrierNameAr}`,
      descriptionEn: `Shipment returned via ${carrierNameEn}`,
    },
  };

  return map[status] || {
    descriptionAr: `تحديث حالة الشحنة: ${status}`,
    descriptionEn: `Shipment status update: ${status}`,
  };
}
