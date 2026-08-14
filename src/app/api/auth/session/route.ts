import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// GET: Lightweight session validity check.
// Returns 200 { valid: true } when the session is active,
// or 401 when it was revoked/expired (e.g. logged out from another device).
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  return NextResponse.json({ valid: true, userId: authResult.userId, role: authResult.role });
}
