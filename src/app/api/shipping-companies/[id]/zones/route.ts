import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';

export const dynamic = "force-dynamic";

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── OPTIONS ──────────────────────────────────────────────
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── GET: List all coverage zones for a company ──────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify company exists
    const company = await db.shippingCompany.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!company) {
      return NextResponse.json(
        { error: 'Shipping company not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const zones = await db.shippingCoverageZone.findMany({
      where: { companyId: id },
      orderBy: [{ regionId: 'asc' }, { cityName: 'asc' }, { areaName: 'asc' }],
    });

    const serialized = serializeDecimal(zones);

    return NextResponse.json(
      { zones: serialized },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping-companies/[id]/zones] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coverage zones' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── POST: Add a coverage zone to a company ──────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify company exists
    const company = await db.shippingCompany.findUnique({
      where: { id },
      select: { id: true, nameAr: true, coverageType: true },
    });
    if (!company) {
      return NextResponse.json(
        { error: 'Shipping company not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Validate required fields
    const { cityName } = body;
    if (!cityName) {
      return NextResponse.json(
        { error: 'Missing required field: cityName' },
        { status: 400, headers: corsHeaders }
      );
    }

    const zone = await db.shippingCoverageZone.create({
      data: {
        companyId: id,
        regionId: body.regionId || null,
        regionNameAr: body.regionNameAr || null,
        cityName,
        areaName: body.areaName || null,
        fee: body.fee ?? 0,
        estimatedDays: body.estimatedDays ?? 3,
        isActive: body.isActive ?? true,
      },
    });

    const serialized = serializeDecimal(zone);

    return NextResponse.json(
      { zone: serialized },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping-companies/[id]/zones] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create coverage zone' },
      { status: 500, headers: corsHeaders }
    );
  }
}
