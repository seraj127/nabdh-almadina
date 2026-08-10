import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';

export const dynamic = "force-dynamic";

// ─── PUT: Update a delivery zone ───
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.deliveryZone.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Delivery zone not found' },
        { status: 404 }
      );
    }

    const zone = await db.deliveryZone.update({
      where: { id },
      data: {
        ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
        ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.area !== undefined && { area: body.area }),
        ...(body.fee !== undefined && { fee: body.fee }),
        ...(body.freeAbove !== undefined && { freeAbove: body.freeAbove }),
        ...(body.estimatedDays !== undefined && { estimatedDays: body.estimatedDays }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json(serializeDecimal({ zone }));
  } catch (error) {
    console.error('[DELIVERY_ZONES_PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update delivery zone' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete a delivery zone ───
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.deliveryZone.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Delivery zone not found' },
        { status: 404 }
      );
    }

    await db.deliveryZone.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELIVERY_ZONES_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete delivery zone' },
      { status: 500 }
    );
  }
}
