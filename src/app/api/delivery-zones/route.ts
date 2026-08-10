import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zones = await db.deliveryZone.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ city: 'asc' }, { nameAr: 'asc' }],
    });

    const mappedZones = zones.map((zone) => ({
      id: zone.id,
      nameAr: zone.nameAr,
      nameEn: zone.nameEn,
      city: zone.city,
      fee: Number(zone.fee),
      estimatedDays: zone.estimatedDays,
      isActive: zone.isActive,
    }));

    const serializedZones = serializeDecimal(mappedZones);

    return NextResponse.json({ zones: serializedZones });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery zones' },
      { status: 500 }
    );
  }
}
