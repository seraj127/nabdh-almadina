import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'null',
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
            reservedStock: true,
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
      available: Math.max(0, item.product.stock - (item.product.reservedStock || 0)),
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

// ─── POST: Sync cart - server-authoritative full replace ─────────
// The client's cart is the source of truth at push time. Server replaces its
// cart with the payload (deleting items not present), clamps quantities to the
// available stock, and returns the resulting full cart so the client adopts it.
// This makes removals/quantity decreases propagate to all devices.
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { items } = body as {
      items?: Array<{
        productId: string;
        quantity: number;
      }>;
    };

    const userId = authUserId;

    // Aggregate the payload into a unique productId → quantity map
    const incoming = new Map<string, number>();
    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item || !item.productId) continue;
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        incoming.set(item.productId, (incoming.get(item.productId) || 0) + qty);
      }
    }

    // An empty payload means the client's cart is empty — clear the server cart.
    if (incoming.size === 0) {
      await db.cartItem.deleteMany({ where: { userId } });
      return NextResponse.json(
        { items: [], synced: true },
        { headers: corsHeaders }
      );
    }

    // Fetch current server cart
    const existingCart = await db.cartItem.findMany({
      where: { userId },
    });

    // Delete server items NOT in the payload (propagates removals across devices)
    const incomingIds = new Set(incoming.keys());
    const toRemove = existingCart.filter((i) => !incomingIds.has(i.productId));
    if (toRemove.length > 0) {
      await db.cartItem.deleteMany({
        where: { userId, productId: { in: toRemove.map((i) => i.productId) } },
      });
    }

    const existingMap = new Map(existingCart.map((i) => [i.productId, i]));

    // Upsert incoming items (clamped to available stock)
    for (const [productId, quantity] of incoming) {
      const product = await db.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.isActive) continue;

      const available = Math.max(1, product.stock - (product.reservedStock || 0));
      const clamped = Math.min(quantity, available);

      const existing = existingMap.get(productId);
      if (existing) {
        await db.cartItem.update({
          where: { id: existing.id },
          data: { quantity: clamped },
        });
      } else {
        await db.cartItem.create({
          data: {
            userId,
            productId,
            quantity: clamped,
          },
        });
      }
    }

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
            reservedStock: true,
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
        available: Math.max(0, item.product.stock - (item.product.reservedStock || 0)),
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
            reservedStock: true,
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
        available: Math.max(0, item.product.stock - (item.product.reservedStock || 0)),
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
