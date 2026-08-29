import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: List all shipping carriers ────────────────────────────
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const active = searchParams.get('active');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (active !== null && active !== '') where.isActive = active === 'true';

    const carriers = await db.shippingCarrier.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { shipments: true } },
      },
    });

    // Stats
    const [totalCarriers, activeCarriers, integratedCarriers, totalShipments] = await Promise.all([
      db.shippingCarrier.count(),
      db.shippingCarrier.count({ where: { isActive: true } }),
      db.shippingCarrier.count({ where: { isIntegrated: true } }),
      db.shipment.count(),
    ]);

    return NextResponse.json({
      carriers: serializeDecimal(carriers),
      summary: {
        totalCarriers,
        activeCarriers,
        integratedCarriers,
        totalShipments,
      },
    });
  } catch (error) {
    console.error('[CARRIERS_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch carriers' }, { status: 500 });
  }
}

// ─── POST: Create a new shipping carrier ────────────────────────
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      nameAr, nameEn, code, type, phone, email, website, logo,
      apiEndpoint, apiKey, apiSecret, webhookUrl, trackingUrl,
      coverageAreas, maxWeight, pricePerKg, basePrice,
      codFee, codFixedFee, estimatedDays,
      isIntegrated, integrationType, notes,
    } = body;

    if (!nameAr || !nameEn || !code) {
      return NextResponse.json(
        { error: 'nameAr, nameEn, and code are required' },
        { status: 400 }
      );
    }

    // Check unique code
    const existing = await db.shippingCarrier.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: 'Carrier code already exists' },
        { status: 409 }
      );
    }

    const carrier = await db.shippingCarrier.create({
      data: {
        nameAr,
        nameEn,
        code,
        type: type || 'national',
        phone: phone || null,
        email: email || null,
        website: website || null,
        logo: logo || null,
        apiEndpoint: apiEndpoint || null,
        apiKey: apiKey || null,
        apiSecret: apiSecret || null,
        webhookUrl: webhookUrl || null,
        trackingUrl: trackingUrl || null,
        coverageAreas: coverageAreas ? (coverageAreas as any) : undefined,
        maxWeight: maxWeight ?? 30,
        pricePerKg: pricePerKg ?? 1.5,
        basePrice: basePrice ?? 5,
        codFee: codFee ?? 0,
        codFixedFee: codFixedFee ?? 0,
        estimatedDays: estimatedDays ?? 3,
        isIntegrated: isIntegrated ?? false,
        integrationType: integrationType || 'manual',
        notes: notes || null,
      },
    });

    return NextResponse.json(serializeDecimal(carrier), { status: 201 });
  } catch (error) {
    console.error('[CARRIERS_POST]', error);
    return NextResponse.json({ error: 'Failed to create carrier' }, { status: 500 });
  }
}

// ─── PATCH: Update a shipping carrier ───────────────────────────
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Carrier ID is required' }, { status: 400 });
    }

    const existing = await db.shippingCarrier.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Carrier not found' }, { status: 404 });
    }

    // Serialize coverageAreas if provided
    const data: Record<string, unknown> = { ...updates };
    if (updates.coverageAreas && Array.isArray(updates.coverageAreas)) {
      data.coverageAreas = JSON.stringify(updates.coverageAreas);
    }

    const carrier = await db.shippingCarrier.update({
      where: { id },
      data,
    });

    return NextResponse.json(serializeDecimal(carrier));
  } catch (error) {
    console.error('[CARRIERS_PATCH]', error);
    return NextResponse.json({ error: 'Failed to update carrier' }, { status: 500 });
  }
}

// ─── DELETE: Remove a shipping carrier ──────────────────────────
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Carrier ID is required' }, { status: 400 });
    }

    // Check if carrier has active shipments
    const activeShipments = await db.shipment.count({
      where: {
        carrierId: id,
        status: { in: ['created', 'picked_up', 'in_transit', 'out_for_delivery'] },
      },
    });

    if (activeShipments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete carrier with active shipments' },
        { status: 400 }
      );
    }

    await db.shippingCarrier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CARRIERS_DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete carrier' }, { status: 500 });
  }
}
