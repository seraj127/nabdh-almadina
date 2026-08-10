import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: List all reviews with filters ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || '';
    const isVerified = searchParams.get('isVerified') || '';
    const isActive = searchParams.get('isActive') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: Record<string, unknown> = {};

    // Filter by product
    if (productId) {
      where.productId = productId;
    }

    // Filter by verified status
    if (isVerified === 'true') {
      where.isVerified = true;
    } else if (isVerified === 'false') {
      where.isVerified = false;
    }

    // Filter by active status
    if (isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }

    const [reviews, total, summaryStats] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              mainImage: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.review.count({ where }),
      // Summary stats (across all reviews, not filtered)
      Promise.all([
        db.review.count(),
        db.review.aggregate({ _avg: { rating: true }, where: { isActive: true } }),
        db.review.count({ where: { isVerified: true } }),
        db.review.count({ where: { isVerified: false, isActive: true } }),
      ]),
    ]);

    const [totalAll, avgResult, verifiedCount, pendingCount] = summaryStats;

    return NextResponse.json({
      reviews: serializeDecimal(reviews),
      total,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
      summary: {
        total: totalAll,
        averageRating: avgResult._avg.rating ? Math.round(avgResult._avg.rating * 10) / 10 : 0,
        verifiedCount,
        pendingCount,
      },
    });
  } catch (error) {
    console.error('[ADMIN_REVIEWS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update review (verify, toggle isActive) ───
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Check review exists
    const existing = await db.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Build update data - only update provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = ['isVerified', 'isActive', 'title', 'comment', 'rating'];

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updateData[field] = fields[field];
      }
    }

    const review = await db.review.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            mainImage: true,
          },
        },
      },
    });

    // Recalculate product average rating whenever rating OR isActive changes
    if (fields.rating !== undefined || fields.isActive !== undefined) {
      const productReviews = await db.review.findMany({
        where: { productId: existing.productId, isActive: true },
        select: { rating: true },
      });

      const avgRating = productReviews.length > 0
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
        : 0;

      await db.product.update({
        where: { id: existing.productId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: productReviews.length,
        },
      });
    }

    return NextResponse.json(serializeDecimal(review));
  } catch (error) {
    console.error('[ADMIN_REVIEWS_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
