import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: Return loyalty, wallet, and top members data ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    // Run independent queries in parallel
    const [
      loyaltyTransactions,
      tierDistributionRaw,
      loyaltyBreakdownRaw,
      walletBreakdownRaw,
      recentWalletTransactions,
      totalWalletBalanceRaw,
      totalWalletTransactions,
      topMembers,
    ] = await Promise.all([
      // All loyalty transactions for points calculation
      db.loyaltyTransaction.findMany({
        select: { type: true, points: true },
      }),

      // Tier distribution: group users by loyaltyTier
      db.user.groupBy({
        by: ['loyaltyTier'],
        _count: { loyaltyTier: true },
      }),

      // Loyalty breakdown: group LoyaltyTransaction by type
      db.loyaltyTransaction.groupBy({
        by: ['type'],
        _count: { type: true },
        _sum: { points: true },
      }),

      // Wallet breakdown: group WalletTransaction by type
      db.walletTransaction.groupBy({
        by: ['type'],
        _count: { type: true },
        _sum: { amount: true },
      }),

      // Recent 20 wallet transactions
      db.walletTransaction.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          currency: true,
          description: true,
          createdAt: true,
        },
      }),

      // Total wallet balance: sum of all user walletBalances
      db.user.aggregate({
        _sum: { walletBalance: true },
      }),

      // Total wallet transactions count
      db.walletTransaction.count(),

      // Top 10 members by loyaltyPoints with order count
      db.user.findMany({
        where: { role: 'customer' },
        orderBy: { loyaltyPoints: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          phone: true,
          loyaltyTier: true,
          loyaltyPoints: true,
          walletBalance: true,
          _count: {
            select: { orders: true },
          },
        },
      }),
    ]);

    // Calculate total points issued (earn + bonus)
    const totalPointsIssued = loyaltyTransactions
      .filter((t) => t.type === 'earn' || t.type === 'bonus')
      .reduce((sum, t) => sum + t.points, 0);

    // Calculate total points redeemed
    const totalPointsRedeemed = loyaltyTransactions
      .filter((t) => t.type === 'redeem')
      .reduce((sum, t) => sum + t.points, 0);

    // Format tier distribution
    const tierDistribution = tierDistributionRaw.map((item) => ({
      tier: item.loyaltyTier,
      count: item._count.loyaltyTier,
    }));

    // Format loyalty breakdown
    const loyaltyBreakdown = loyaltyBreakdownRaw.map((item) => ({
      type: item.type,
      count: item._count.type,
      points: item._sum.points || 0,
    }));

    // Format wallet breakdown
    const walletBreakdown = walletBreakdownRaw.map((item) => ({
      type: item.type,
      count: item._count.type,
      amount: Number(item._sum.amount || 0),
    }));

    // Format recent wallet transactions
    const recentTransactions = recentWalletTransactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      currency: tx.currency,
      description: tx.description,
      createdAt: tx.createdAt.toISOString(),
    }));

    // Total wallet balance
    const totalBalance = Number(totalWalletBalanceRaw._sum.walletBalance || 0);

    const result = {
      loyalty: {
        totalPointsIssued,
        totalPointsRedeemed,
        tierDistribution,
        breakdown: loyaltyBreakdown,
      },
      wallet: {
        totalBalance,
        totalTransactions: totalWalletTransactions,
        recentTransactions,
        breakdown: walletBreakdown,
      },
      topMembers: topMembers.map((member) => ({
        id: member.id,
        name: member.name,
        phone: member.phone,
        loyaltyTier: member.loyaltyTier,
        loyaltyPoints: member.loyaltyPoints,
        walletBalance: Number(member.walletBalance),
        _count: { orders: member._count.orders },
      })),
    };

    return NextResponse.json(serializeDecimal(result));
  } catch (error) {
    console.error('[ADMIN_LOYALTY_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty data' },
      { status: 500 }
    );
  }
}
