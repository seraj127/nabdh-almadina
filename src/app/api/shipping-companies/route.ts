import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializePublicShippingCompany } from '@/lib/shipping-company-utils';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'null',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── OPTIONS ──────────────────────────────────────────────
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── GET: List all shipping companies ─────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const where: Record<string, unknown> = {};
    if (activeOnly) {
      where.isActive = true;
    }

    const companies = await db.shippingCompany.findMany({
      where,
      include: {
        coverageZones: {
          select: { id: true },
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const serialized = companies.map((company) => {
      const base = serializePublicShippingCompany(company);
      return {
        ...base,
        _count: {
          coverageZones: company.coverageZones.length,
          orders: company._count.orders,
        },
        coverageZones: undefined,
      };
    });

    return NextResponse.json(
      { companies: serialized },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping-companies] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping companies' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── POST: Create a new shipping company ──────────────────
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate required fields
    const { nameAr, nameEn, slug } = body;
    if (!nameAr || !nameEn || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: nameAr, nameEn, slug' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check slug uniqueness
    const existing = await db.shippingCompany.findUnique({
      where: { slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Shipping company with slug "${slug}" already exists` },
        { status: 409, headers: corsHeaders }
      );
    }

    const company = await db.shippingCompany.create({
      data: {
        nameAr,
        nameEn,
        slug,
        logo: body.logo || null,
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        descriptionAr: body.descriptionAr || null,
        descriptionEn: body.descriptionEn || null,
        apiEndpoint: body.apiEndpoint || null,
        apiKey: body.apiKey || null,
        apiSecret: body.apiSecret || null,
        trackingUrl: body.trackingUrl || null,
        isActive: body.isActive ?? true,
        isDefault: body.isDefault ?? false,
        sortOrder: body.sortOrder ?? 0,
        baseFee: body.baseFee ?? 0,
        weightLimit: body.weightLimit ?? 30,
        codSupported: body.codSupported ?? true,
        codFee: body.codFee ?? 0,
        coverageType: body.coverageType ?? 'all',
        totalDeliveries: body.totalDeliveries ?? 0,
        successRate: body.successRate ?? 0,
        avgDeliveryDays: body.avgDeliveryDays ?? 3,
      },
      include: {
        coverageZones: true,
      },
    });

    const serialized = serializePublicShippingCompany(company);

    return NextResponse.json(
      { company: serialized },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping-companies] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create shipping company' },
      { status: 500, headers: corsHeaders }
    );
  }
}
