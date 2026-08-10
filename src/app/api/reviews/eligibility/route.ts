import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';
import { serializeDecimal } from '@/lib/serialize';

export const dynamic = "force-dynamic";

// ─── GET: Check review eligibility for order items ───
// ?orderId=xxx  → returns each item's review eligibility status
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    // Verify the order belongs to this user and is delivered
    const order = await db.order.findFirst({
      where: { id: orderId, userId, status: 'delivered' },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            nameAr: true,
            nameEn: true,
            image: true,
            price: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not delivered', items: [] },
        { status: 404 }
      );
    }

    // Check review status for each product in the order
    const itemsWithEligibility = await Promise.all(
      order.items.map(async (item) => {
        const existingReview = await db.review.findUnique({
          where: { productId_userId: { productId: item.productId, userId } },
        });

        return {
          ...serializeDecimal(item),
          canReview: true, // Since order is delivered, they can always review
          hasReviewed: !!existingReview,
          existingReview: existingReview ? serializeDecimal(existingReview) : null,
        };
      })
    );

    return NextResponse.json({
      orderId: order.id,
      orderStatus: order.status,
      items: itemsWithEligibility,
    });
  } catch (error) {
    console.error('[REVIEWS_ELIGIBILITY_GET]', error);
    return NextResponse.json(
      { error: 'Failed to check review eligibility' },
      { status: 500 }
    );
  }
}
