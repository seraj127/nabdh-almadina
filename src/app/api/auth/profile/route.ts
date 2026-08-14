import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// GET: Fetch user profile data (loyalty, wallet, etc.)
// Now requires authentication via JWT session
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // 401 error
    }

    const userId = authResult.userId;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        role: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        walletBalance: true,
        language: true,
        preferences: true,
        isActive: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            items: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                price: true,
                quantity: true,
                total: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Transform Decimal fields
    const transformedOrders = user.orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
      })),
    }));

    return NextResponse.json({
      user: {
        ...user,
        walletBalance: Number(user.walletBalance),
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        orders: transformedOrders,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH: Update user profile
// Now requires authentication via JWT session
export async function PATCH(request: NextRequest) {
  try {
    // Verify user is authenticated
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult; // 401 error
    }

    const userId = authResult.userId;
    const body = await request.json();
    const { name, email, language, avatar, preferences } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (language !== undefined) updateData.language = language;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (preferences !== undefined) updateData.preferences = preferences;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        role: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        walletBalance: true,
        language: true,
        preferences: true,
      },
    });

    return NextResponse.json({
      user: {
        ...updated,
        walletBalance: Number(updated.walletBalance),
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
