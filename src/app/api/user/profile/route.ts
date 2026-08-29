import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.userId;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        walletBalance: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const orders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        currency: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
        deliveredAt: true,
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
    });

    return NextResponse.json({
      success: true,
      user,
      orders,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching profile' },
      { status: 500 }
    );
  }
}
