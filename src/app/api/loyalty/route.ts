import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════════════
// GET /api/loyalty
// Fetch user's loyalty points balance, tier, stats, and transaction history
// ═══════════════════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, loyaltyPoints: true, loyaltyTier: true, walletBalance: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ── Transaction history (paginated via ?limit=N&offset=M) ────
    const url = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '30'), 1), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);

    const [transactions, totalCount] = await Promise.all([
      db.loyaltyTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.loyaltyTransaction.count({ where: { userId } }),
    ]);

    // ── Calculate tier progress ───────────────────────────────────
    const tierThresholds: Record<string, { min: number; max: number; next: string | null }> = {
      bronze: { min: 0, max: 500, next: 'silver' },
      silver: { min: 500, max: 2000, next: 'gold' },
      gold: { min: 2000, max: 5000, next: 'platinum' },
      platinum: { min: 5000, max: Infinity, next: null },
    };

    const currentTier = user.loyaltyTier || 'bronze';
    const tierInfo = tierThresholds[currentTier] || tierThresholds.bronze;
    const pointsToNext = tierInfo.next
      ? Math.max(0, tierInfo.max - user.loyaltyPoints)
      : 0;
    const tierProgress = tierInfo.max === Infinity
      ? 100
      : Math.min(100, ((user.loyaltyPoints - tierInfo.min) / (tierInfo.max - tierInfo.min)) * 100);

    // ── Compute stats ─────────────────────────────────────────────
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalEarnedResult, totalRedeemedResult, thisMonthResult] = await Promise.all([
      db.loyaltyTransaction.aggregate({
        where: { userId, type: 'earn' },
        _sum: { points: true },
      }),
      db.loyaltyTransaction.aggregate({
        where: { userId, type: 'redeem' },
        _sum: { points: true },
      }),
      db.loyaltyTransaction.aggregate({
        where: { userId, type: 'earn', createdAt: { gte: startOfMonth } },
        _sum: { points: true },
      }),
    ]);

    const totalEarned = totalEarnedResult._sum.points || 0;
    const totalRedeemed = totalRedeemedResult._sum.points || 0;
    const thisMonth = thisMonthResult._sum.points || 0;

    // ── Wallet data ───────────────────────────────────────────────
    const walletBalance = Number(user.walletBalance);

    return NextResponse.json({
      points: user.loyaltyPoints,
      tier: currentTier,
      tierProgress: Math.round(tierProgress),
      pointsToNext,
      nextTier: tierInfo.next,
      transactions,
      totalCount,
      stats: {
        totalEarned,
        totalRedeemed,
        thisMonth,
        walletBalance,
      },
    });
  } catch (error) {
    console.error('[LOYALTY_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty data' },
      { status: 500 }
    );
  }
}
