import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: Fetch reviews ───
// Supports:
//   ?productId=xxx         → reviews for a product (public)
//   ?userId=xxx            → reviews by a user (my reviews)
//   ?productId=xxx&userId=xxx → also returns canReview/hasReviewed/existingReview
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const sort = searchParams.get('sort') || 'newest';
    const skip = (page - 1) * limit;

    // If userId but no productId — fetch user's reviews
    if (userId && !productId) {
      const where = { userId, isActive: true };
      const [reviews, total] = await Promise.all([
        db.review.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip,
          include: {
            product: { select: { id: true, nameAr: true, nameEn: true, mainImage: true } },
            user: { select: { name: true, avatar: true } },
          },
        }),
        db.review.count({ where }),
      ]);

      const reviewsWithUser = reviews.map((review) => ({
        ...serializeDecimal(review),
        userName: review.user?.name || 'مستخدم',
        userAvatar: review.user?.avatar || null,
      }));

      return NextResponse.json({
        reviews: reviewsWithUser,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'productId or userId query parameter is required' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = {
      productId,
      isActive: true,
    };

    // Sort order
    let orderBy: Record<string, string>;
    switch (sort) {
      case 'highest': orderBy = { rating: 'desc' }; break;
      case 'lowest': orderBy = { rating: 'asc' }; break;
      default: orderBy = { createdAt: 'desc' }; break;
    }

    const [reviews, total, ratingStats] = await Promise.all([
      db.review.findMany({
        where,
        orderBy,
        take: limit,
        skip,
        include: {
          user: { select: { name: true, avatar: true } },
        },
      }),
      db.review.count({ where }),
      db.review.groupBy({
        by: ['rating'],
        where,
        _count: { rating: true },
      }),
    ]);

    const reviewsWithUser = reviews.map((review) => {
      const { user, ...reviewData } = review;
      return {
        ...serializeDecimal(reviewData),
        userName: user?.name || 'مستخدم',
        userAvatar: user?.avatar || null,
      };
    });

    // Build distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach((s) => {
      distribution[s.rating] = s._count.rating;
    });

    // If userId is provided, check purchase status & review eligibility
    let canReview = false;
    let hasReviewed = false;
    let existingReview: any = null;

    if (userId) {
      // ✅ Only buyers with delivered orders can review
      const deliveredOrder = await db.order.findFirst({
        where: {
          userId,
          status: 'delivered',
          items: { some: { productId } },
        },
        select: { id: true },
      });
      canReview = !!deliveredOrder;

      // Check if user already reviewed this product
      const existing = await db.review.findUnique({
        where: { productId_userId: { productId, userId } },
      });
      hasReviewed = !!existing;
      if (existing) {
        existingReview = serializeDecimal(existing);
      }
    }

    return NextResponse.json({
      reviews: reviewsWithUser,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      distribution,
      ...(userId ? { canReview, hasReviewed, existingReview } : {}),
    });
  } catch (error) {
    console.error('[REVIEWS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// ─── POST: Submit or update a review ───
// ⚠️ Only users who purchased the product (delivered order) can review
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const body = await request.json();
    const { productId, rating, title, comment, images } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json(
        { error: 'rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify the product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // ✅ ENFORCE: Only buyers with a delivered order can review
    const deliveredOrder = await db.order.findFirst({
      where: {
        userId,
        status: 'delivered',
        items: { some: { productId } },
      },
      select: { id: true },
    });

    if (!deliveredOrder) {
      return NextResponse.json(
        { error: 'يمكن فقط للمشترين الذين تم توصيل طلبهم تقييم هذا المنتج', errorEn: 'Only buyers with a delivered order can review this product' },
        { status: 403 }
      );
    }

    const isVerified = true; // Since we enforce purchase, all reviews are verified

    // Check if this is a new review or an update
    const existingReview = await db.review.findUnique({
      where: { productId_userId: { productId, userId } },
    });
    const isNewReview = !existingReview;

    // Upsert review
    const review = await db.review.upsert({
      where: {
        productId_userId: { productId, userId },
      },
      update: {
        rating,
        title: title ?? null,
        comment: comment ?? null,
        images: images ? (images as any) : undefined,
        isVerified,
      },
      create: {
        productId,
        userId,
        rating,
        title: title ?? null,
        comment: comment ?? null,
        images: images ? (images as any) : undefined,
        isVerified,
      },
    });

    // Recalculate product average rating and review count
    const activeReviews = await db.review.findMany({
      where: { productId, isActive: true },
      select: { rating: true },
    });

    const reviewCount = activeReviews.length;
    const avgRating =
      reviewCount > 0
        ? activeReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    await db.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount,
      },
    });

    // ✅ FIX: Award loyalty points only for NEW reviews (not updates)
    if (isNewReview) {
      try {
        const LOYALTY_REVIEW_POINTS = 50;
        await db.user.update({
          where: { id: userId },
          data: { loyaltyPoints: { increment: LOYALTY_REVIEW_POINTS } },
        });
      } catch { /* non-critical */ }
    }

    // Fetch user info for response
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, avatar: true },
    });

    return NextResponse.json(
      {
        review: serializeDecimal({
          ...review,
          userName: user?.name || 'مستخدم',
          userAvatar: user?.avatar || null,
        }),
        isNewReview,
      },
      { status: isNewReview ? 201 : 200 }
    );
  } catch (error) {
    console.error('[REVIEWS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
