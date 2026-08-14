import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// GET: Fetch favorites for a user
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { searchParams } = request.nextUrl;
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const userId = authUserId;

    const includeObj = includeProducts ? {
      product: {
        include: {
          category: {
            select: { id: true, nameAr: true, nameEn: true, slug: true, icon: true },
          },
        },
      },
    } : undefined;

    const favorites = await db.favoriteItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: includeObj,
    });

    return NextResponse.json({
      favorites: favorites.map((f: any) => {
        const result: Record<string, unknown> = {
          id: f.id,
          productId: f.productId,
          createdAt: f.createdAt,
        };
        if (includeProducts && f.product) {
          result.product = {
            id: f.product.id,
            nameAr: f.product.nameAr,
            nameEn: f.product.nameEn,
            price: f.product.price,
            comparePrice: f.product.comparePrice,
            mainImage: f.product.mainImage,
            image: f.product.mainImage,
            images: f.product.images,
            descriptionAr: f.product.descriptionAr,
            categoryId: f.product.categoryId,
            category: f.product.category,
            stock: f.product.stock,
            rating: f.product.rating,
            reviewCount: f.product.reviewCount,
            inStock: f.product.stock > 0,
            isActive: f.product.isActive,
          };
        }
        return result;
      }),
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'فشل في جلب المفضلات' },
      { status: 500 }
    );
  }
}

// POST: Add product to favorites
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { productId } = body;
    const userId = authUserId;

    if (!productId) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      );
    }

    // Idempotent add — the client now sends an explicit ADD intent (never a
    // state-agnostic toggle), so a repeat request must be a success, not a 409.
    await db.favoriteItem.createMany({
      data: [{ userId, productId }],
      skipDuplicates: true,
    });

    return NextResponse.json({
      isFavorite: true,
      productId,
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'فشل في إضافة المنتج إلى المفضلة' },
      { status: 500 }
    );
  }
}

// PUT: Replace the user's favorites with the given list (full sync).
// The client's list is the source of truth — items not present are removed,
// items present are added. This lets removals propagate across devices.
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { productIds } = body as { productIds?: string[] };
    const userId = authUserId;

    const incoming = Array.isArray(productIds)
      ? Array.from(new Set(productIds.filter((id): id is string => typeof id === 'string' && id.length > 0)))
      : [];

    // Fetch current favorites and current products in one pass
    const [existing, products] = await Promise.all([
      db.favoriteItem.findMany({ where: { userId }, select: { id: true, productId: true } }),
      incoming.length > 0
        ? db.product.findMany({ where: { id: { in: incoming }, isActive: true }, select: { id: true } })
        : Promise.resolve([]),
    ]);

    const validIds = new Set(products.map((p) => p.id));
    const effectiveIds = incoming.filter((id) => validIds.has(id));
    const effectiveSet = new Set(effectiveIds);

    const toRemove = existing.filter((e) => !effectiveSet.has(e.productId));
    if (toRemove.length > 0) {
      await db.favoriteItem.deleteMany({
        where: { userId, productId: { in: toRemove.map((e) => e.productId) } },
      });
    }

    const existingIds = new Set(existing.map((e) => e.productId));
    const toAdd = effectiveIds.filter((id) => !existingIds.has(id));
    if (toAdd.length > 0) {
      await db.favoriteItem.createMany({
        data: toAdd.map((productId) => ({ userId, productId })),
      });
    }

    const favorites = await db.favoriteItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { productId: true },
    });

    return NextResponse.json({ favorites: favorites.map((f) => f.productId) });
  } catch (error) {
    console.error('Error replacing favorites:', error);
    return NextResponse.json(
      { error: 'فشل في مزامنة المفضلة' },
      { status: 500 }
    );
  }
}

// DELETE: Remove product from favorites
export async function DELETE(request: NextRequest) {  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { searchParams } = request.nextUrl;
    const userId = authUserId;
    const productId = searchParams.get('productId');

    if (!productId) {
      // Try to get from body as fallback
      let bodyProductId: string | null = null;
      try {
        const body = await request.json();
        bodyProductId = body.productId;
      } catch {
        // Body may be empty
      }

      const effectiveProductId = productId || bodyProductId;

      if (!effectiveProductId) {
        return NextResponse.json(
          { error: 'معرف المنتج مطلوب' },
          { status: 400 }
        );
      }

      const deleted = await db.favoriteItem.deleteMany({
        where: { userId, productId: effectiveProductId },
      });

      return NextResponse.json({ deleted: deleted.count });
    }

    const deleted = await db.favoriteItem.deleteMany({
      where: { userId, productId },
    });

    return NextResponse.json({ deleted: deleted.count });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'فشل في إزالة المنتج من المفضلة' },
      { status: 500 }
    );
  }
}
