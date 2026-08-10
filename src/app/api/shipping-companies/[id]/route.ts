import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';

export const dynamic = "force-dynamic";

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── OPTIONS ──────────────────────────────────────────────
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── GET: Get single shipping company ─────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const company = await db.shippingCompany.findUnique({
      where: { id },
      include: {
        coverageZones: {
          orderBy: { cityName: 'asc' },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Shipping company not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const serialized = serializeDecimal(company);

    return NextResponse.json(
      { company: serialized },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping-companies/[id]] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping company' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── PUT: Update shipping company ─────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify company exists
    const existing = await db.shippingCompany.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Shipping company not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // If slug is being changed, check uniqueness
    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await db.shippingCompany.findUnique({
        where: { slug: body.slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: `Shipping company with slug "${body.slug}" already exists` },
          { status: 409, headers: corsHeaders }
        );
      }
    }

    // Build update data — only include fields that were provided
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'nameAr', 'nameEn', 'slug', 'logo', 'phone', 'email', 'website',
      'descriptionAr', 'descriptionEn', 'apiEndpoint', 'apiKey', 'apiSecret',
      'trackingUrl', 'isActive', 'isDefault', 'sortOrder', 'baseFee',
      'weightLimit', 'codSupported', 'codFee', 'coverageType',
      'totalDeliveries', 'successRate', 'avgDeliveryDays',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const company = await db.shippingCompany.update({
      where: { id },
      data: updateData,
      include: {
        coverageZones: {
          orderBy: { cityName: 'asc' },
        },
      },
    });

    const serialized = serializeDecimal(company);

    return NextResponse.json(
      { company: serialized },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping-companies/[id]] PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update shipping company' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── DELETE: Soft-delete shipping company ─────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify company exists
    const existing = await db.shippingCompany.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Shipping company not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Soft delete: set isActive = false
    const company = await db.shippingCompany.update({
      where: { id },
      data: { isActive: false },
    });

    const serialized = serializeDecimal(company);

    return NextResponse.json(
      { company: serialized, message: 'Shipping company deactivated successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping-companies/[id]] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipping company' },
      { status: 500, headers: corsHeaders }
    );
  }
}
