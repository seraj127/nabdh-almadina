import { NextRequest, NextResponse } from 'next/server';
import { cancelShipmentWithCarrier } from '@/lib/shipping-integration';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// POST /api/shipping/cancel-shipment
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const body = await request.json();
    const { shipmentId, reason } = body as { shipmentId: string; reason?: string };

    if (!shipmentId) {
      return NextResponse.json({ error: 'shipmentId is required' }, { status: 400 });
    }

    const cancelled = await cancelShipmentWithCarrier(shipmentId, reason);

    if (!cancelled) {
      return NextResponse.json({ error: 'Failed to cancel shipment with carrier' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Shipment cancelled' });
  } catch (error) {
    console.error('[Cancel Shipment] Error:', error);
    return NextResponse.json({ error: 'Failed to cancel shipment' }, { status: 500 });
  }
}
