import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── Validation constants ───
const VALID_ROLES = ['customer', 'admin', 'vendor', 'driver'] as const;
const VALID_LOYALTY_TIERS = ['bronze', 'silver', 'gold', 'platinum'] as const;
const VALID_WALLET_TYPES = ['deposit', 'withdrawal', 'adjustment'] as const;
const VALID_LOYALTY_TYPES = ['earn', 'redeem', 'expire', 'bonus'] as const;

// ─── GET: Single user with full details ───
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        walletBalance: true,
        language: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch recent wallet transactions (latest 10)
    const recentWalletTransactions = await db.walletTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Fetch recent loyalty transactions (latest 10)
    const recentLoyaltyTransactions = await db.loyaltyTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Fetch recent orders summary (latest 5)
    const recentOrders = await db.order.findMany({
      where: { userId: id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        currency: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json(
      serializeDecimal({
        user,
        recentWalletTransactions,
        recentLoyaltyTransactions,
        recentOrders,
      })
    );
  } catch (error) {
    console.error('[ADMIN_USERS_GET_ID]', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update user (ID from URL params) ───
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;

    // Verify user exists
    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const adminId = request.headers.get('x-user-id') || undefined;

    // ── Wallet Adjustment ──
    if (body.walletAdjustment) {
      const { type, amount, description } = body.walletAdjustment;

      if (!type || !VALID_WALLET_TYPES.includes(type)) {
        return NextResponse.json(
          { error: `Invalid wallet adjustment type. Must be one of: ${VALID_WALLET_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number' },
          { status: 400 }
        );
      }

      // Calculate new balance
      let newBalance = Number(existingUser.walletBalance);
      if (type === 'deposit' || type === 'adjustment') {
        newBalance += amount;
      } else if (type === 'withdrawal') {
        if (newBalance < amount) {
          return NextResponse.json(
            { error: 'Insufficient wallet balance for withdrawal' },
            { status: 400 }
          );
        }
        newBalance -= amount;
      }

      const updatedUser = await db.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id },
          data: { walletBalance: newBalance },
        });

        await tx.walletTransaction.create({
          data: {
            userId: id,
            type,
            amount: type === 'withdrawal' ? -amount : amount,
            currency: 'LYD',
            description: description || `Admin ${type} of ${amount} LYD`,
            status: 'completed',
          },
        });

        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'WALLET_ADJUSTMENT',
            entity: 'User',
            entityId: id,
            details: JSON.stringify({ type, amount, description, newBalance }),
          },
        });

        return user;
      });

      return NextResponse.json(
        serializeDecimal({
          user: updatedUser,
          message: 'Wallet adjusted successfully',
        })
      );
    }

    // ── Loyalty Points Adjustment ──
    if (body.loyaltyAdjustment) {
      const { type, points, description } = body.loyaltyAdjustment;

      if (!type || !VALID_LOYALTY_TYPES.includes(type)) {
        return NextResponse.json(
          { error: `Invalid loyalty adjustment type. Must be one of: ${VALID_LOYALTY_TYPES.join(', ')}` },
          { status: 400 }
        );
      }

      if (typeof points !== 'number' || points <= 0) {
        return NextResponse.json(
          { error: 'Points must be a positive number' },
          { status: 400 }
        );
      }

      // Calculate new points
      let newPoints = existingUser.loyaltyPoints;
      if (type === 'earn' || type === 'bonus') {
        newPoints += points;
      } else if (type === 'redeem' || type === 'expire') {
        if (newPoints < points) {
          return NextResponse.json(
            { error: 'Insufficient loyalty points' },
            { status: 400 }
          );
        }
        newPoints -= points;
      }

      const updatedUser = await db.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id },
          data: { loyaltyPoints: newPoints },
        });

        await tx.loyaltyTransaction.create({
          data: {
            userId: id,
            type,
            points: type === 'redeem' || type === 'expire' ? -points : points,
            description: description || `Admin ${type} of ${points} points`,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'LOYALTY_ADJUSTMENT',
            entity: 'User',
            entityId: id,
            details: JSON.stringify({ type, points, description, newPoints }),
          },
        });

        return user;
      });

      return NextResponse.json(
        serializeDecimal({
          user: updatedUser,
          message: 'Loyalty points adjusted successfully',
        })
      );
    }

    // ── Profile Update ──
    const { name, email, role, loyaltyTier, isActive } = body;
    const updateData: Record<string, unknown> = {};
    const changes: string[] = [];

    if (name !== undefined) {
      updateData.name = name;
      changes.push(`name: ${name}`);
    }
    if (email !== undefined) {
      updateData.email = email;
      changes.push(`email: ${email}`);
    }
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.role = role;
      changes.push(`role: ${role}`);
    }
    if (loyaltyTier !== undefined) {
      if (!VALID_LOYALTY_TIERS.includes(loyaltyTier)) {
        return NextResponse.json(
          { error: `Invalid loyalty tier. Must be one of: ${VALID_LOYALTY_TIERS.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.loyaltyTier = loyaltyTier;
      changes.push(`loyaltyTier: ${loyaltyTier}`);
    }
    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          { error: 'isActive must be a boolean' },
          { status: 400 }
        );
      }
      updateData.isActive = isActive;
      changes.push(`isActive: ${isActive}`);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update provided' },
        { status: 400 }
      );
    }

    const updatedUser = await db.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: updateData,
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'USER_UPDATE',
          entity: 'User',
          entityId: id,
          details: JSON.stringify({ changes }),
        },
      });

      return user;
    });

    return NextResponse.json(
      serializeDecimal({
        user: updatedUser,
        message: 'User updated successfully',
      })
    );
  } catch (error) {
    console.error('[ADMIN_USERS_PATCH_ID]', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Soft-delete (deactivate) a user ───
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;

    const existingUser = await db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!existingUser.isActive) {
      return NextResponse.json(
        { error: 'User is already deactivated' },
        { status: 400 }
      );
    }

    const adminId = request.headers.get('x-user-id') || undefined;

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: { isActive: false },
      });

      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: 'USER_DEACTIVATE',
          entity: 'User',
          entityId: id,
          details: JSON.stringify({ previousStatus: existingUser.isActive }),
        },
      });
    });

    return NextResponse.json(
      serializeDecimal({
        success: true,
        message: 'User deactivated successfully',
      })
    );
  } catch (error) {
    console.error('[ADMIN_USERS_DELETE_ID]', error);
    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}
