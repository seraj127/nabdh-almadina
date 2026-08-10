import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: List all vendors with product count and type breakdown ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const [vendors, typeBreakdown] = await Promise.all([
      db.vendor.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.vendor.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
    ]);

    // Convert groupBy result to Record<string, number>
    const typeBreakdownMap: Record<string, number> = {};
    for (const entry of typeBreakdown) {
      typeBreakdownMap[entry.type] = entry._count.type;
    }

    return NextResponse.json(
      serializeDecimal({
        vendors,
        typeBreakdown: typeBreakdownMap,
      })
    );
  } catch (error) {
    console.error('[ADMIN_VENDORS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}
