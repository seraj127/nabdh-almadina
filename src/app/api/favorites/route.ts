import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
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

    const favorite = await db.favoriteItem.create({
      data: { userId, productId },
    });

    return NextResponse.json({
      favorite: {
        id: favorite.id,
        productId: favorite.productId,
        createdAt: favorite.createdAt,
      },
    });
  } catch (error) {
    // Handle unique constraint violation (already favorited)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'المنتج مضاف للمفضلة مسبقاً' },
        { status: 409 }
      );
    }

    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'فشل في إضافة المنتج إلى المفضلة' },
      { status: 500 }
    );
  }
}

// DELETE: Remove product from favorites
export async function DELETE(request: NextRequest) {
  try {
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
