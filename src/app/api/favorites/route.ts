import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { listFavorites, addFavorite, replaceFavorites, removeFavorite, FavoriteError } from '@/lib/favorites.service';

export const dynamic = "force-dynamic";

// GET: Fetch favorites for a user
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { searchParams } = request.nextUrl;
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const favorites = await listFavorites(authUserId, includeProducts);

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

// POST: Add product to favorites (idempotent — explicit intent, never a toggle)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' },
        { status: 400 }
      );
    }

    const result = await addFavorite(authUserId, productId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FavoriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'فشل في إضافة المنتج إلى المفضلة' },
      { status: 500 }
    );
  }
}

// PUT: Replace the user's favorites with the given list (full sync).
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { productIds } = body as { productIds?: string[] };

    const favorites = await replaceFavorites(authUserId, productIds ?? []);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('Error replacing favorites:', error);
    return NextResponse.json(
      { error: 'فشل في مزامنة المفضلة' },
      { status: 500 }
    );
  }
}

// DELETE: Remove product from favorites (idempotent)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { searchParams } = request.nextUrl;
    let productId = searchParams.get('productId');

    if (!productId) {
      try {
        const body = await request.json();
        productId = body.productId;
      } catch {
        // Body may be empty
      }
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'معرف المنتج مطلوب' },
        { status: 400 }
      );
    }

    const result = await removeFavorite(authUserId, productId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'فشل في إزالة المنتج من المفضلة' },
      { status: 500 }
    );
  }
}
