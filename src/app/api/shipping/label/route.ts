import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCarrierAdapter } from '@/lib/shipping-integration';
import { requireAdmin } from '@/lib/auth-utils';

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

// ─── GET: Get/print shipping label ────────────────────────
// Returns the shipping label as a URL or base64-encoded data
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get('shipmentId');
    const trackingNumber = searchParams.get('trackingNumber');

    let shipment;

    if (shipmentId) {
      shipment = await db.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          carrier: { select: { id: true, nameAr: true, nameEn: true, code: true, apiEndpoint: true, apiKey: true, apiSecret: true } },
          order: { include: { items: true, address: true, user: { select: { name: true, phone: true } } } },
        },
      });
    } else if (trackingNumber) {
      shipment = await db.shipment.findFirst({
        where: { trackingNumber },
        include: {
          carrier: { select: { id: true, nameAr: true, nameEn: true, code: true, apiEndpoint: true, apiKey: true, apiSecret: true } },
          order: { include: { items: true, address: true, user: { select: { name: true, phone: true } } } },
        },
      });
    }

    // Strip sensitive carrier credentials — only use them server-side for the adapter
    // NEVER include apiKey/apiSecret in any response

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!shipment.trackingNumber) {
      return NextResponse.json(
        { error: 'Shipment has no tracking number - cannot generate label' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get carrier adapter
    const adapter = getCarrierAdapter(shipment.carrier.code);

    // Get label from carrier (use createShipment or trackShipment to get label data)
    // CarrierAdapter doesn't have printLabel, so we generate a simple label URL
    const labelData = shipment.trackingNumber;

    // Return the tracking number as the label reference
    // For integrated carriers with real API, the label URL would come from carrierData
    if (!labelData) {
      return NextResponse.json(
        { error: 'Label not available for this carrier' },
        { status: 404, headers: corsHeaders }
      );
    }

    // If it's a base64 data URI, return it directly
    if (labelData.startsWith('data:')) {
      return NextResponse.json(
        {
          label: labelData,
          type: 'base64',
          shipment: {
            id: shipment.id,
            trackingNumber: shipment.trackingNumber,
            waybillNumber: shipment.waybillNumber,
            carrierName: shipment.carrier.nameAr,
            orderNumber: shipment.order.orderNumber,
          },
        },
        { headers: corsHeaders }
      );
    }

    // If it's a URL, redirect or return it
    return NextResponse.json(
      {
        label: labelData,
        type: 'url',
        shipment: {
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          waybillNumber: shipment.waybillNumber,
          carrierName: shipment.carrier.nameAr,
          orderNumber: shipment.order.orderNumber,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[SHIPPING_LABEL_GET]', error);
    return NextResponse.json(
      { error: 'Failed to get shipping label' },
      { status: 500, headers: corsHeaders }
    );
  }
}
