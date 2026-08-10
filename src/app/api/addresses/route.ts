import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// GET: List addresses for a user
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const userId = authUserId;

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      addresses: addresses.map((a) => ({
        id: a.id,
        label: a.label,
        address: a.address,
        city: a.city,
        area: a.area || '',
        notes: a.notes || '',
        isDefault: a.isDefault,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

// POST: Create a new address
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { label, address, city, area, notes, isDefault } = body;
    const userId = authUserId;

    if (!label || !address || !city) {
      return NextResponse.json(
        { error: 'label, address, and city are required' },
        { status: 400 }
      );
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await db.address.create({
      data: {
        userId,
        label,
        address,
        city,
        area: area || null,
        notes: notes || null,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json({
      address: {
        id: newAddress.id,
        label: newAddress.label,
        address: newAddress.address,
        city: newAddress.city,
        area: newAddress.area || '',
        notes: newAddress.notes || '',
        isDefault: newAddress.isDefault,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}

// PATCH: Update an address
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json();
    const { id, label, address, city, area, notes, isDefault } = body;
    const userId = authUserId;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset others
    if (isDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await db.address.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(area !== undefined && { area }),
        ...(notes !== undefined && { notes }),
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return NextResponse.json({
      address: {
        id: updated.id,
        label: updated.label,
        address: updated.address,
        city: updated.city,
        area: updated.area || '',
        notes: updated.notes || '',
        isDefault: updated.isDefault,
      },
    });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

// DELETE: Delete an address
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = authUserId;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await db.address.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
