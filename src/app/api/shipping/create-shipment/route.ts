import { NextRequest, NextResponse } from 'next/server';
import { createShipmentForOrder } from '@/lib/shipping-integration';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// POST /api/shipping/create-shipment
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const body = await request.json();
    const { orderId, carrierId } = body as { orderId: string; carrierId: string };

    if (!orderId || !carrierId) {
      return NextResponse.json(
        { error: 'orderId and carrierId are required' },
        { status: 400 }
      );
    }

    const result = await createShipmentForOrder(orderId, carrierId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      trackingNumber: result.trackingNumber,
      waybillNumber: result.waybillNumber,
      shippingCost: result.shippingCost,
      estimatedDelivery: result.estimatedDelivery,
    }, { status: 201 });
  } catch (error) {
    console.error('[Create Shipment] Error:', error);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
