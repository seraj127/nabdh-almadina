import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// GET /api/admin/delivery-zones — List all delivery zones (including inactive)
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const zones = await db.deliveryZone.findMany({
      orderBy: [{ city: 'asc' }, { nameAr: 'asc' }],
    });

    return NextResponse.json({ zones: serializeDecimal(zones) });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery zones' },
      { status: 500 }
    );
  }
}

// POST /api/admin/delivery-zones — Create a delivery zone
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      nameAr,
      nameEn,
      city,
      area,
      fee,
      freeAbove,
      estimatedDays,
      isActive,
    } = body;

    if (!nameAr || !nameEn || !city) {
      return NextResponse.json(
        { error: 'nameAr, nameEn, and city are required' },
        { status: 400 }
      );
    }

    const zone = await db.deliveryZone.create({
      data: {
        nameAr,
        nameEn,
        city,
        area: area || null,
        fee: fee ?? 10,
        freeAbove: freeAbove ?? 100,
        estimatedDays: estimatedDays ?? 3,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(
      { zone: serializeDecimal(zone) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery zone' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/delivery-zones — Update a delivery zone
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    const zone = await db.deliveryZone.update({
      where: { id },
      data,
    });

    return NextResponse.json({ zone: serializeDecimal(zone) });
  } catch (error) {
    console.error('Error updating delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery zone' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/delivery-zones — Delete a delivery zone
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Zone ID is required' },
        { status: 400 }
      );
    }

    await db.deliveryZone.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    return NextResponse.json(
      { error: 'Failed to delete delivery zone' },
      { status: 500 }
    );
  }
}
