import { NextRequest, NextResponse } from 'next/server';
import { bulkSyncTracking } from '@/lib/shipping-integration';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// POST /api/shipping/sync
// Admin only: Bulk sync all pending shipments
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const result = await bulkSyncTracking();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Shipping Sync] Error:', error);
    return NextResponse.json({ error: 'Failed to sync shipments' }, { status: 500 });
  }
}
