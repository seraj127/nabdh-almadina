import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: List all coupons with search/filter ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive') || '';
    const type = searchParams.get('type') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const where: Record<string, unknown> = {};

    // Search by code or description
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { descriptionAr: { contains: search } },
        { descriptionEn: { contains: search } },
      ];
    }

    // Filter by active status
    if (isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    const [coupons, total] = await Promise.all([
      db.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.coupon.count({ where }),
    ]);

    return NextResponse.json({
      coupons: serializeDecimal(coupons),
      total,
    });
  } catch (error) {
    console.error('[ADMIN_COUPONS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// ─── POST: Create new coupon ───
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    if (body.value === undefined || body.value === null) {
      return NextResponse.json(
        { error: 'Coupon value is required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await db.coupon.findUnique({ where: { code: body.code } });
    if (existing) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 409 }
      );
    }

    const coupon = await db.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        descriptionAr: body.descriptionAr || null,
        descriptionEn: body.descriptionEn || null,
        type: body.type || 'percentage',
        value: body.value,
        minOrder: body.minOrder ?? 0,
        maxDiscount: body.maxDiscount || null,
        usageLimit: body.usageLimit || null,
        usageCount: 0,
        perUserLimit: body.perUserLimit ?? 1,
        startsAt: body.startsAt ? new Date(body.startsAt) : new Date(),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(serializeDecimal(coupon), { status: 201 });
  } catch (error) {
    console.error('[ADMIN_COUPONS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update coupon ───
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    // Check coupon exists
    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'code', 'descriptionAr', 'descriptionEn', 'type', 'value',
      'minOrder', 'maxDiscount', 'usageLimit', 'usageCount',
      'perUserLimit', 'isActive',
    ];

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updateData[field] = fields[field];
      }
    }

    // Handle date fields
    if (fields.startsAt !== undefined) {
      updateData.startsAt = new Date(fields.startsAt);
    }
    if (fields.expiresAt !== undefined) {
      updateData.expiresAt = new Date(fields.expiresAt);
    }

    // Uppercase code if provided
    if (updateData.code) {
      updateData.code = (updateData.code as string).toUpperCase();
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(serializeDecimal(coupon));
  } catch (error) {
    console.error('[ADMIN_COUPONS_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete coupon ───
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    // Check coupon exists
    const existing = await db.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await db.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('[ADMIN_COUPONS_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
