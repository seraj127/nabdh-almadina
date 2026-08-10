import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, requireAuth } from '@/lib/auth-utils';
import { serializeDecimal } from '@/lib/serialize';
import { refundPayment } from '@/lib/payment';

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════
// GET /api/payment/[id]
// Get payment transaction details
// ═══════════════════════════════════════════════════════════
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { id } = await params;

    const txn = await db.paymentTransaction.findUnique({
      where: { id },
    });

    if (!txn) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Verify the authenticated user owns this transaction
    if (txn.userId && txn.userId !== authUserId) {
      return NextResponse.json(
        { error: 'Forbidden – you can only view your own transactions' },
        { status: 403 }
      );
    }

    return NextResponse.json({ transaction: serializeDecimal(txn) });
  } catch (error) {
    console.error('[PAYMENT_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment transaction' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════
// PATCH /api/payment/[id]
// Admin update payment status (approve bank transfer, refund, etc.)
// Body: { action, status?, reason? }
// ═══════════════════════════════════════════════════════════
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const { id } = await params;
    const body = await request.json();
    const { action, status, reason } = body;

    const txn = await db.paymentTransaction.findUnique({
      where: { id },
    });

    if (!txn) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // ── Approve bank transfer ────────────────────────────
    if (action === 'approve' || status === 'completed') {
      if (txn.method === 'bank_transfer' && txn.status === 'pending') {
        await db.paymentTransaction.update({
          where: { id },
          data: {
            status: 'completed',
            paidAt: new Date(),
            metadata: JSON.stringify({
              ...(txn.metadata ? JSON.parse(txn.metadata) : {}),
              approvedAt: new Date().toISOString(),
              approvedBy: 'admin',
            }),
          },
        });

        // Update order payment status
        if (txn.orderId) {
          await db.order.update({
            where: { id: txn.orderId },
            data: { paymentStatus: 'paid' },
          });
        }

        return NextResponse.json({ success: true, message: 'Bank transfer approved' });
      }
    }

    // ── Reject bank transfer ─────────────────────────────
    if (action === 'reject' || status === 'cancelled') {
      if (txn.status === 'pending' || txn.status === 'processing') {
        await db.paymentTransaction.update({
          where: { id },
          data: {
            status: 'cancelled',
            metadata: JSON.stringify({
              ...(txn.metadata ? JSON.parse(txn.metadata) : {}),
              cancelledAt: new Date().toISOString(),
              cancelledBy: 'admin',
              reason: reason || 'Rejected by admin',
            }),
          },
        });

        return NextResponse.json({ success: true, message: 'Payment cancelled' });
      }
    }

    // ── Refund payment ───────────────────────────────────
    if (action === 'refund') {
      if (!reason) {
        return NextResponse.json(
          { error: 'Refund reason is required' },
          { status: 400 }
        );
      }

      const result = await refundPayment(id, reason);
      return NextResponse.json(result);
    }

    // ── Generic status update ────────────────────────────
    if (status) {
      const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      const updatedTxn = await db.paymentTransaction.update({
        where: { id },
        data: {
          status,
          paidAt: status === 'completed' ? new Date() : undefined,
          refundReason: status === 'refunded' ? reason : undefined,
          refundedAt: status === 'refunded' ? new Date() : undefined,
        },
      });

      // Update order payment status accordingly
      if (txn.orderId) {
        const paymentStatusMap: Record<string, string> = {
          completed: 'paid',
          failed: 'failed',
          refunded: 'refunded',
          cancelled: 'pending',
        };
        const orderPaymentStatus = paymentStatusMap[status];
        if (orderPaymentStatus) {
          await db.order.update({
            where: { id: txn.orderId },
            data: { paymentStatus: orderPaymentStatus },
          });
        }
      }

      return NextResponse.json({ transaction: serializeDecimal(updatedTxn) });
    }

    return NextResponse.json(
      { error: 'Action or status is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[PAYMENT_PATCH]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update payment' },
      { status: 500 }
    );
  }
}
