import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// GET: Fetch cart items for a user
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = cartItems.map((item) => ({
      productId: item.product.id,
      nameAr: item.product.nameAr,
      nameEn: item.product.nameEn,
      price: Number(item.product.price),
      quantity: item.quantity,
      image: item.product.mainImage || '',
      stock: item.product.stock,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'فشل في جلب سلة التسوق' },
      { status: 500 }
    );
  }
}

// POST: Add item to cart
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { productId, quantity = 1 } = body;
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

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findFirst({
      where: { userId, productId },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = Math.min(
        existingItem.quantity + quantity,
        product.stock
      );
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });

      return NextResponse.json({
        item: {
          productId: updated.productId,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          price: Number(product.price),
          quantity: updated.quantity,
          image: product.mainImage || '',
          stock: product.stock,
        },
      });
    }

    // Create new cart item
    const clampedQuantity = Math.min(Math.max(quantity, 1), product.stock);
    const cartItem = await db.cartItem.create({
      data: {
        userId,
        productId,
        quantity: clampedQuantity,
      },
    });

    return NextResponse.json({
      item: {
        productId: cartItem.productId,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: Number(product.price),
        quantity: cartItem.quantity,
        image: product.mainImage || '',
        stock: product.stock,
      },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'فشل في إضافة المنتج إلى السلة' },
      { status: 500 }
    );
  }
}

// DELETE: Remove item from cart
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

      const deleted = await db.cartItem.deleteMany({
        where: { userId, productId: effectiveProductId },
      });

      return NextResponse.json({ deleted: deleted.count });
    }

    const deleted = await db.cartItem.deleteMany({
      where: { userId, productId },
    });

    return NextResponse.json({ deleted: deleted.count });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'فشل في إزالة المنتج من السلة' },
      { status: 500 }
    );
  }
}
