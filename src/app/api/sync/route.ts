import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── CORS ──────────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'null',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── GET: Full user sync data ──────────────────────────────
// Returns all user data needed for cross-platform sync
export async function GET(request: NextRequest) {
  // Auth check
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400, headers: corsHeaders });
    }

    // Authorization: users can only sync their own data (admins can sync any)
    if (userId !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden – can only sync your own data' }, { status: 403, headers: corsHeaders });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phone: true, name: true, email: true, avatar: true,
        role: true, loyaltyTier: true, loyaltyPoints: true, walletBalance: true,
        language: true, lastLoginAt: true, loginCount: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
    }

    // Fetch all sync data in parallel
    const [cartItems, favoriteItems, notifications, addresses, recentOrders] = await Promise.all([
      // Cart
      db.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            select: { id: true, nameAr: true, nameEn: true, price: true, mainImage: true, stock: true, isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Favorites
      db.favoriteItem.findMany({
        where: { userId },
        include: {
          product: {
            select: { id: true, nameAr: true, nameEn: true, price: true, mainImage: true, stock: true, isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Notifications (unread by this user)
      db.notification.findMany({
        where: {
          OR: [{ userId }, { userId: null }],
          reads: { none: { userId } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      // Addresses
      db.address.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } }),
      // Recent orders
      db.order.findMany({
        where: { userId },
        select: {
          id: true, orderNumber: true, status: true, total: true, currency: true,
          paymentMethod: true, paymentStatus: true, createdAt: true,
          items: { select: { productId: true, nameAr: true, nameEn: true, quantity: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Serialize cart
    const serializedCart = cartItems
      .filter(item => item.product.isActive)
      .map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        nameAr: item.product.nameAr,
        nameEn: item.product.nameEn,
        price: Number(item.product.price),
        image: item.product.mainImage || '',
        stock: item.product.stock,
      }));

    // Serialize orders
    const serializedOrders = recentOrders.map(order => ({
      ...order,
      total: Number(order.total),
    }));

    // Serialize favorites
    const serializedFavorites = favoriteItems
      .filter(item => item.product.isActive)
      .map(item => ({
        id: item.id,
        productId: item.productId,
        nameAr: item.product.nameAr,
        nameEn: item.product.nameEn,
        price: Number(item.product.price),
        image: item.product.mainImage || '',
        stock: item.product.stock,
      }));

    return NextResponse.json({
      user: {
        ...user,
        walletBalance: Number(user.walletBalance),
      },
      cart: serializedCart,
      favorites: serializedFavorites,
      notifications,
      addresses: addresses.map(a => ({
        ...a,
        id: a.id,
        label: a.label,
        address: a.address,
        city: a.city,
        area: a.area,
        notes: a.notes,
        isDefault: a.isDefault,
      })),
      recentOrders: serializedOrders,
      unreadNotifications: notifications.length,
      syncedAt: new Date().toISOString(),
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Sync GET] Error:', error);
    return NextResponse.json({ error: 'Failed to sync data' }, { status: 500, headers: corsHeaders });
  }
}

// ─── POST: Push local changes to server ────────────────────
export async function POST(request: NextRequest) {
  // Auth check
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await request.json();
    const { userId, cart, favorites, language } = body as {
      userId: string;
      cart?: Array<{ productId: string; quantity: number; nameAr: string; nameEn: string; price: number; image: string; stock: number }>;
      favorites?: string[]; // product IDs
      language?: 'ar' | 'en';
    };

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400, headers: corsHeaders });
    }

    // Authorization: users can only sync their own data (admins can sync any)
    if (userId !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden – can only sync your own data' }, { status: 403, headers: corsHeaders });
    }

    const results: Record<string, any> = {};

    // Sync cart if provided
    if (cart && Array.isArray(cart)) {
      const existingCart = await db.cartItem.findMany({ where: { userId } });
      const existingMap = new Map(existingCart.map(i => [i.productId, i]));

      for (const item of cart) {
        const product = await db.product.findUnique({ where: { id: item.productId } });
        if (!product || !product.isActive) continue;

        const existing = existingMap.get(item.productId);
        if (existing) {
          // Take max quantity
          if (item.quantity > existing.quantity) {
            await db.cartItem.update({
              where: { id: existing.id },
              data: { quantity: Math.min(item.quantity, product.stock) },
            });
          }
          existingMap.delete(item.productId);
        } else {
          await db.cartItem.create({
            data: { userId, productId: item.productId, quantity: Math.min(item.quantity, product.stock) },
          });
        }
      }

      results.cartSynced = true;
    }

    // Sync language preference
    if (language && ['ar', 'en'].includes(language)) {
      await db.user.update({
        where: { id: userId },
        data: { language },
      }).catch(() => {});
      results.languageSynced = true;
    }

    results.syncedAt = new Date().toISOString();

    return NextResponse.json({ success: true, ...results }, { headers: corsHeaders });
  } catch (error) {
    console.error('[Sync POST] Error:', error);
    return NextResponse.json({ error: 'Failed to sync data' }, { status: 500, headers: corsHeaders });
  }
}
