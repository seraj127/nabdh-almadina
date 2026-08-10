import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/payment';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// POST /api/payment/verify
// Verify payment from gateway callback or manual verification
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { transactionId, gatewayTxnId, status, cardLast4, cardBrand } = body as {
      transactionId: string;
      gatewayTxnId?: string;
      status?: string;
      cardLast4?: string;
      cardBrand?: string;
    };

    if (!transactionId) {
      return NextResponse.json(
        { error: 'transactionId is required' },
        { status: 400 }
      );
    }

    const result = await verifyPayment(transactionId, {
      gatewayTxnId,
      status,
      cardLast4,
      cardBrand,
    });

    return NextResponse.json({
      success: result.success,
      transactionId: result.transactionId,
      status: result.status,
      error: result.error,
    });
  } catch (error) {
    console.error('[Payment Verify] Error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
