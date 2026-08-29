import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'null',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── POST: Toggle favorite (add if not exists, remove if exists) ─
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { productId } = body as {
      productId: string;
    };
    const userId = authUserId;

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const existing = await db.favoriteItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    let isFavorite: boolean;

    if (existing) {
      await db.favoriteItem.delete({
        where: { id: existing.id },
      });
      isFavorite = false;
    } else {
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

      await db.favoriteItem.create({
        data: { userId, productId },
      });
      isFavorite = true;
    }

    return NextResponse.json(
      { isFavorite, productId },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /favorites/toggle] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500, headers: corsHeaders }
    );
  }
}
