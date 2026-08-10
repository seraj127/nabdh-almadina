import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── POST: Validate a coupon code ───
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const code = (body.code || '').trim().toUpperCase();
    const subtotal = parseFloat(body.subtotal || '0');

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await db.coupon.findUnique({ where: { code } });

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid coupon code',
      });
    }

    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon is not active',
      });
    }

    const now = new Date();
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon has expired',
      });
    }

    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return NextResponse.json({
        valid: false,
        error: 'Coupon is not yet active',
      });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        error: 'Usage limit reached',
      });
    }

    const minOrder = Number(coupon.minOrder || 0);
    if (minOrder > 0 && subtotal < minOrder) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order ${minOrder} LYD`,
      });
    }

    // Calculate discount
    let discount = 0;
    const value = Number(coupon.value);
    if (coupon.type === 'percentage') {
      discount = (subtotal * value) / 100;
      const maxDiscount = coupon.maxDiscount ? Number(coupon.maxDiscount) : 0;
      if (maxDiscount > 0 && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else {
      // Fixed discount - clamp to subtotal so discount doesn't exceed order value
      discount = Math.min(value, subtotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value,
        discount: Math.round(discount * 100) / 100,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
        minOrder: minOrder > 0 ? minOrder : null,
        descriptionAr: coupon.descriptionAr,
        descriptionEn: coupon.descriptionEn,
      },
    });
  } catch (error) {
    console.error('[COUPON_VALIDATE]', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
