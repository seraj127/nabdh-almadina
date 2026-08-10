import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// POST /api/admin/users/wallet — Adjust user wallet balance
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { userId, amount, type, description } = body;

    if (!userId || amount === undefined || !type) {
      return NextResponse.json(
        { error: 'userId, amount, and type are required' },
        { status: 400 }
      );
    }

    const validTypes = [
      'deposit',
      'withdrawal',
      'refund',
      'cashback',
      'adjustment',
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Get current wallet balance
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // For withdrawals, check sufficient balance
    if (type === 'withdrawal' && Number(user.walletBalance) < amount) {
      return NextResponse.json(
        { error: 'Insufficient wallet balance' },
        { status: 400 }
      );
    }

    // Create wallet transaction and update balance in a transaction
    const [transaction, updatedUser] = await db.$transaction([
      db.walletTransaction.create({
        data: {
          userId,
          type,
          amount: type === 'withdrawal' ? -amount : amount,
          description: description || `Admin ${type}`,
          status: 'completed',
        },
      }),
      db.user.update({
        where: { id: userId },
        data: {
          walletBalance:
            type === 'withdrawal'
              ? { decrement: amount }
              : { increment: amount },
        },
      }),
    ]);

    return NextResponse.json({
      transaction: serializeDecimal(transaction),
      newBalance: Number(updatedUser.walletBalance),
    });
  } catch (error) {
    console.error('Error adjusting wallet:', error);
    return NextResponse.json(
      { error: 'Failed to adjust wallet' },
      { status: 500 }
    );
  }
}
