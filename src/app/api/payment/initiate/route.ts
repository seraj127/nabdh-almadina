import { NextRequest, NextResponse } from 'next/server';
import { initiatePayment, type PaymentMethod } from '@/lib/payment';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// POST /api/payment/initiate
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { orderId, userId, amount, method, cardLast4, cardExpiry, cardBrand, bankReference, receiptUrl } = body as {
      orderId: string;
      userId: string;
      amount: number;
      method: PaymentMethod;
      cardLast4?: string;
      cardExpiry?: string;
      cardBrand?: string;
      bankReference?: string;
      receiptUrl?: string;
    };

    // Verify the authenticated user matches the requested userId
    if (userId !== authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized – userId mismatch' },
        { status: 403 }
      );
    }

    if (!orderId || !userId || !amount || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, userId, amount, method' },
        { status: 400 }
      );
    }

    const validMethods: PaymentMethod[] = ['cod', 'card', 'bank_transfer', 'wallet'];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    const result = await initiatePayment({
      orderId,
      userId,
      amount,
      method,
      cardLast4,
      cardExpiry,
      cardBrand,
      bankReference,
      receiptUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, transactionId: result.transactionId },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      paymentUrl: result.paymentUrl,
      reference: result.reference,
      gatewayTxnId: result.gatewayTxnId,
    }, { status: 201 });
  } catch (error) {
    console.error('[Payment Initiate] Error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
