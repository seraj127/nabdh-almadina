import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = "force-dynamic";

// POST /api/payment/webhook
// Webhook from payment gateway
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, gatewayTxnId, status, cardLast4, cardBrand, signature } = body as {
      transactionId?: string;
      gatewayTxnId?: string;
      status?: string;
      cardLast4?: string;
      cardBrand?: string;
      signature?: string;
    };

    // Validate webhook signature if configured
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (webhookSecret && signature !== webhookSecret) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Find transaction by ID or gateway ID
    let txn: Awaited<ReturnType<typeof db.paymentTransaction.findUnique>> | null = null;
    if (transactionId) {
      txn = await db.paymentTransaction.findUnique({ where: { id: transactionId } });
    } else if (gatewayTxnId) {
      txn = await db.paymentTransaction.findFirst({ where: { gatewayTxnId } });
    }

    if (!txn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (txn.status === 'completed') {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    const isSuccessful = status === 'completed' || status === 'paid' || status === 'success';
    const updateData: Record<string, any> = {
      status: isSuccessful ? 'completed' : 'failed',
    };

    if (gatewayTxnId) updateData.gatewayTxnId = gatewayTxnId;
    if (cardLast4) updateData.cardLast4 = cardLast4;
    if (cardBrand) updateData.cardBrand = cardBrand;
    if (isSuccessful) updateData.paidAt = new Date();

    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: updateData,
    });

    // Update order payment status
    if (isSuccessful && txn.orderId) {
      await db.order.update({
        where: { id: txn.orderId },
        data: { paymentStatus: 'paid' },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, status: updateData.status });
  } catch (error) {
    console.error('[Payment Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
