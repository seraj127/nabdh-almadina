import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── GET: Fetch user's cart from server ─────────────────────
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const userId = authUserId;

    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            price: true,
            mainImage: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = cartItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      nameAr: item.product.nameAr,
      nameEn: item.product.nameEn,
      price: Number(item.product.price),
      image: item.product.mainImage || '',
      stock: item.product.stock,
      isActive: item.product.isActive,
    }));

    return NextResponse.json({ items }, { headers: corsHeaders });
  } catch (error) {
    console.error('[API /cart/sync] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── POST: Sync cart - merge local cart with server ─────────
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { items } = body as {
      items: Array<{
        productId: string;
        quantity: number;
        nameAr: string;
        nameEn: string;
        price: number;
        image: string;
        stock: number;
      }>;
    };

    const userId = authUserId;

    // Get existing server cart
    const existingCart = await db.cartItem.findMany({
      where: { userId },
    });

    const existingMap = new Map(existingCart.map((i) => [i.productId, i]));

    const results: Array<Record<string, unknown>> = [];

    for (const item of items) {
      // Verify product exists
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive) continue;

      const existing = existingMap.get(item.productId);

      if (existing) {
        // Update quantity if local is higher (merge: take max)
        if (item.quantity > existing.quantity) {
          const updated = await db.cartItem.update({
            where: { id: existing.id },
            data: { quantity: Math.min(item.quantity, product.stock) },
          });
          results.push(updated);
        } else {
          results.push(existing);
        }
        existingMap.delete(item.productId);
      } else {
        // Add new item
        const created = await db.cartItem.create({
          data: {
            userId,
            productId: item.productId,
            quantity: Math.min(item.quantity, product.stock),
          },
        });
        results.push(created);
      }
    }

    // Items in existingMap are server-only items (not in local cart)
    // We keep them on server so they sync to other devices

    // Fetch full cart with product info
    const fullCart = await db.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            price: true,
            mainImage: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const syncedItems = fullCart
      .filter((item) => item.product.isActive)
      .map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        nameAr: item.product.nameAr,
        nameEn: item.product.nameEn,
        price: Number(item.product.price),
        image: item.product.mainImage || '',
        stock: item.product.stock,
      }));

    return NextResponse.json(
      { items: syncedItems, synced: true },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /cart/sync] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to sync cart' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── PUT: Update single cart item ───────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { productId, quantity, action } = body as {
      productId?: string;
      quantity?: number;
      action?: 'add' | 'remove' | 'update' | 'clear';
    };

    const userId = authUserId;

    if (action === 'clear') {
      await db.cartItem.deleteMany({ where: { userId } });
      return NextResponse.json({ success: true, items: [] }, { headers: corsHeaders });
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    if (action === 'remove') {
      await db.cartItem.deleteMany({
        where: { userId, productId },
      });
    } else if (action === 'add') {
      const existing = await db.cartItem.findUnique({
        where: { userId_productId: { userId, productId } },
      });

      if (existing) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.min(existing.quantity + (quantity || 1), product.stock) },
        });
      } else {
        await db.cartItem.create({
          data: {
            userId,
            productId,
            quantity: Math.min(quantity || 1, product.stock),
          },
        });
      }
    } else if (action === 'update' && quantity) {
      const existing = await db.cartItem.findUnique({
        where: { userId_productId: { userId, productId } },
      });

      if (existing) {
        const clampedQty = Math.max(1, Math.min(quantity, product.stock));
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: clampedQty },
        });
      }
    }

    // Return updated cart
    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            price: true,
            mainImage: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = cartItems
      .filter((item) => item.product.isActive)
      .map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        nameAr: item.product.nameAr,
        nameEn: item.product.nameEn,
        price: Number(item.product.price),
        image: item.product.mainImage || '',
        stock: item.product.stock,
      }));

    return NextResponse.json({ items }, { headers: corsHeaders });
  } catch (error) {
    console.error('[API /cart/sync] PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── DELETE: Remove item from cart ──────────────────────────
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { searchParams } = new URL(request.url);
    const userId = authUserId;
    const productId = searchParams.get('productId');

    if (productId) {
      await db.cartItem.deleteMany({
        where: { userId, productId },
      });
    } else {
      // Clear entire cart
      await db.cartItem.deleteMany({
        where: { userId },
      });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('[API /cart/sync] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete cart item' },
      { status: 500, headers: corsHeaders }
    );
  }
}
