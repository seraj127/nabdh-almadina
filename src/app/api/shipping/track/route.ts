import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { syncShipmentTracking, getCarrierAdapter, type TrackingResult } from '@/lib/shipping-integration';

export const dynamic = "force-dynamic";

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── GET: Public shipment tracking ──────────────────────────────
// Enhanced with carrier adapter live tracking for integrated carriers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber') || '';
    const trackingNumber = searchParams.get('trackingNumber') || '';
    const live = searchParams.get('live') !== 'false'; // default: use live tracking if available

    if (!orderNumber && !trackingNumber) {
      return NextResponse.json(
        { error: 'Order number or tracking number is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find shipment by order number or tracking number
    let shipment;

    if (trackingNumber) {
      shipment = await db.shipment.findFirst({
        where: { trackingNumber },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
              currency: true,
              paymentMethod: true,
              createdAt: true,
              items: {
                select: {
                  nameAr: true,
                  nameEn: true,
                  quantity: true,
                  price: true,
                  image: true,
                },
              },
              address: {
                select: {
                  address: true,
                  city: true,
                  area: true,
                },
              },
            },
          },
          carrier: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              code: true,
              type: true,
              phone: true,
              trackingUrl: true,
              logo: true,
              isIntegrated: true,
              // NOTE: apiKey and apiSecret are EXCLUDED from public response for security
            },
          },
          logs: {
            orderBy: { occurredAt: 'desc' },
          },
        },
      });
    }

    if (!shipment && orderNumber) {
      const order = await db.order.findUnique({
        where: { orderNumber },
      });

      if (order) {
        shipment = await db.shipment.findUnique({
          where: { orderId: order.id },
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                total: true,
                currency: true,
                paymentMethod: true,
                createdAt: true,
                items: {
                  select: {
                    nameAr: true,
                    nameEn: true,
                    quantity: true,
                    price: true,
                    image: true,
                  },
                },
                address: {
                  select: {
                    address: true,
                    city: true,
                    area: true,
                  },
                },
              },
            },
            carrier: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                code: true,
                type: true,
                phone: true,
                trackingUrl: true,
                logo: true,
                isIntegrated: true,
                // NOTE: apiKey and apiSecret are EXCLUDED from public response for security
              },
            },
            logs: {
              orderBy: { occurredAt: 'desc' },
            },
          },
        });
      }
    }

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Generate tracking URL
    const trackingUrl = shipment.carrier.trackingUrl && shipment.trackingNumber
      ? shipment.carrier.trackingUrl.replace('{trackingNumber}', shipment.trackingNumber)
      : null;

    // ─── Live tracking for integrated carriers ──────────────────
    let liveTracking: TrackingResult | null = null;
    if (live && shipment.carrier.isIntegrated && shipment.trackingNumber) {
      try {
        // Fetch carrier credentials securely (not exposed in the select above)
        const carrierCreds = await db.shippingCarrier.findUnique({
          where: { id: shipment.carrier.id },
          select: { apiEndpoint: true, apiKey: true, apiSecret: true },
        });
        if (!carrierCreds?.apiKey) {
          console.warn('[SHIPPING_TRACK] Carrier has no API credentials configured');
        } else {
          const adapter = getCarrierAdapter(shipment.carrier.code);

          liveTracking = await adapter.trackShipment(shipment.trackingNumber);

          // Sync tracking data to local database (async, don't block response)
          syncShipmentTracking(shipment.id).catch((err) => {
            console.error('[SHIPPING_TRACK] Background sync error:', err);
          });
        }
      } catch (error) {
        console.error('[SHIPPING_TRACK] Live tracking error, falling back to DB:', error);
      }
    }

    // Build response with both local DB data and live tracking data
    const response: Record<string, unknown> = {
      shipment: {
        ...serializeDecimal(shipment),
        trackingUrl,
      },
    };

    if (liveTracking) {
      response.liveTracking = {
        status: liveTracking.status,
        location: liveTracking.location,
        descriptionAr: liveTracking.descriptionAr,
        descriptionEn: liveTracking.descriptionEn,
        latitude: liveTracking.latitude,
        longitude: liveTracking.longitude,
        timestamp: liveTracking.timestamp,
        history: liveTracking.history.map((h) => ({
          status: h.status,
          location: h.location,
          descriptionAr: h.descriptionAr,
          descriptionEn: h.descriptionEn,
          timestamp: h.timestamp,
        })),
      };
    }

    return NextResponse.json(response, { headers: corsHeaders });
  } catch (error) {
    console.error('[SHIPPING_TRACK_GET]', error);
    return NextResponse.json(
      { error: 'Failed to track shipment' },
      { status: 500, headers: corsHeaders }
    );
  }
}
