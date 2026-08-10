import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';
import { serializeDecimal } from '@/lib/serialize';

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════════════
// GET /api/wallet?userId=xxx
// Fetch user's wallet balance and recent transactions
// ═══════════════════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const userId = authUserId;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const transactions = await db.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      balance: serializeDecimal(user.walletBalance),
      transactions: serializeDecimal(transactions),
    });
  } catch (error) {
    console.error('[WALLET_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════
// POST /api/wallet
// Customer wallet deposit (top-up)
// Body: { userId, amount, paymentMethod }
// paymentMethod: "cash" | "bank_transfer"
// ═══════════════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    const body = await request.json();
    const { userId, amount, paymentMethod } = body;

    // ── Verify the authenticated user matches the requested userId ────
    if (userId !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden – you can only deposit to your own wallet' },
        { status: 403 }
      );
    }

    // ── Validate required fields ──────────────────────────────────────
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json(
        { error: 'amount is required and must be a number' },
        { status: 400 }
      );
    }

    if (amount < 10) {
      return NextResponse.json(
        { error: 'Minimum deposit amount is 10 LYD' },
        { status: 400 }
      );
    }

    if (amount > 5000) {
      return NextResponse.json(
        { error: 'Maximum deposit amount is 5,000 LYD' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !['cash', 'bank_transfer'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'paymentMethod must be "cash" or "bank_transfer"' },
        { status: 400 }
      );
    }

    // ── Verify user exists ────────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ── Create wallet transaction ─────────────────────────────────────
    const isCash = paymentMethod === 'cash';
    const status = isCash ? 'completed' : 'pending';
    const descriptionAr = isCash
      ? `إيداع نقدي - ${amount} د.ل`
      : `إيداع تحويل بنكي - ${amount} د.ل (بانتظار المراجعة)`;
    const descriptionEn = isCash
      ? `Cash deposit - ${amount} LYD`
      : `Bank transfer deposit - ${amount} LYD (pending review)`;

    const transaction = await db.walletTransaction.create({
      data: {
        userId,
        type: 'deposit',
        amount,
        currency: 'LYD',
        description: descriptionAr,
        status,
      },
    });

    // ── Update user balance (only for cash; bank_transfer stays pending) ──
    let newBalance = Number(user.walletBalance);

    if (isCash) {
      newBalance = Number(user.walletBalance) + amount;
      await db.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance },
      });
    }

    return NextResponse.json(
      {
        transaction: serializeDecimal(transaction),
        balance: newBalance,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[WALLET_POST]', error);
    return NextResponse.json(
      { error: 'Failed to process wallet deposit' },
      { status: 500 }
    );
  }
}
