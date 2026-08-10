import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// POST /api/admin/users/loyalty — Adjust user loyalty points
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { userId, points, type, description } = body;

    if (!userId || points === undefined || !type) {
      return NextResponse.json(
        { error: 'userId, points, and type are required' },
        { status: 400 }
      );
    }

    const validTypes = ['earn', 'redeem', 'expire', 'bonus'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'redeem' && user.loyaltyPoints < points) {
      return NextResponse.json(
        { error: 'Insufficient loyalty points' },
        { status: 400 }
      );
    }

    // Determine new tier based on total points
    const newPoints =
      type === 'redeem' || type === 'expire'
        ? user.loyaltyPoints - points
        : user.loyaltyPoints + points;

    let newTier = user.loyaltyTier;
    if (newPoints >= 5000) newTier = 'platinum';
    else if (newPoints >= 2000) newTier = 'gold';
    else if (newPoints >= 500) newTier = 'silver';
    else newTier = 'bronze';

    const [transaction, updatedUser] = await db.$transaction([
      db.loyaltyTransaction.create({
        data: {
          userId,
          type,
          points: type === 'redeem' || type === 'expire' ? -points : points,
          description: description || `Admin ${type}`,
        },
      }),
      db.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: newPoints,
          loyaltyTier: newTier,
        },
      }),
    ]);

    return NextResponse.json({
      transaction,
      newPoints: updatedUser.loyaltyPoints,
      newTier: updatedUser.loyaltyTier,
    });
  } catch (error) {
    console.error('Error adjusting loyalty points:', error);
    return NextResponse.json(
      { error: 'Failed to adjust loyalty points' },
      { status: 500 }
    );
  }
}
