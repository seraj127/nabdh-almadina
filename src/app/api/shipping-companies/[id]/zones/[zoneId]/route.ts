import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';

export const dynamic = "force-dynamic";

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── OPTIONS ──────────────────────────────────────────────
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── PUT: Update a coverage zone ──────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id, zoneId } = await params;
    const body = await request.json();

    // Verify zone exists and belongs to the company
    const existing = await db.shippingCoverageZone.findFirst({
      where: { id: zoneId, companyId: id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Coverage zone not found for this company' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Build update data — only include fields that were provided
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'regionId', 'regionNameAr', 'cityName', 'areaName',
      'fee', 'estimatedDays', 'isActive',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const zone = await db.shippingCoverageZone.update({
      where: { id: zoneId },
      data: updateData,
    });

    const serialized = serializeDecimal(zone);

    return NextResponse.json(
      { zone: serialized },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping-companies/[id]/zones/[zoneId]] PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update coverage zone' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── DELETE: Delete a coverage zone ──────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; zoneId: string }> }
) {
  try {
    const { id, zoneId } = await params;

    // Verify zone exists and belongs to the company
    const existing = await db.shippingCoverageZone.findFirst({
      where: { id: zoneId, companyId: id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: 'Coverage zone not found for this company' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Hard delete the zone
    await db.shippingCoverageZone.delete({
      where: { id: zoneId },
    });

    return NextResponse.json(
      { message: 'Coverage zone deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping-companies/[id]/zones/[zoneId]] DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete coverage zone' },
      { status: 500, headers: corsHeaders }
    );
  }
}
