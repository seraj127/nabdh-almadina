import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/jwt-session';

// Re-export phone utilities for convenience (these are safe for client code too)
export { normalizePhone, getPhoneVariants } from '@/lib/phone-utils';

/**
 * Extracts user info from the session token in the request.
 * Checks both session_token and admin_session cookies.
 * Falls back to x-user-id header for backward compatibility.
 *
 * Returns { userId, role, phone, platform } or null if not authenticated.
 */
export async function getSessionUser(request: NextRequest): Promise<{
  userId: string;
  role: string;
  phone: string;
  platform: string;
} | null> {
  // 1. Try JWT session token from cookies (primary method)
  const sessionToken = request.cookies.get('session_token')?.value ||
                       request.cookies.get('admin_session')?.value;

  if (sessionToken) {
    const payload = await verifySessionToken(sessionToken);
    if (payload) {
      return {
        userId: payload.userId,
        role: payload.role,
        phone: payload.phone,
        platform: payload.platform,
      };
    }
  }

  // 2. Try Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = await verifySessionToken(token);
    if (payload) {
      return {
        userId: payload.userId,
        role: payload.role,
        phone: payload.phone,
        platform: payload.platform,
      };
    }
  }

  // NOTE: x-user-id header fallback has been removed for security.
  // All authentication must go through JWT session tokens.

  return null;
}

/**
 * Validates that the request comes from an admin user.
 * Now uses JWT session token instead of just x-user-id header.
 *
 * Returns `null` if the caller is authorised, or a NextResponse (401/403) if not.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json(
      { error: 'Unauthorized – missing authentication. Please log in again.' },
      { status: 401 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.userId },
    select: { role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: 'Unauthorized – user not found or inactive' },
      { status: 401 }
    );
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden – admin access required' },
      { status: 403 }
    );
  }

  return null; // authorised – let the handler proceed
}

/**
 * Validates that the request comes from an authenticated user (any role).
 * Returns the user info or a NextResponse error.
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ userId: string; role: string; phone: string; platform: string } | NextResponse> {
  const sessionUser = await getSessionUser(request);

  if (!sessionUser) {
    return NextResponse.json(
      { error: 'Unauthorized – please log in' },
      { status: 401 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: sessionUser.userId },
    select: { isActive: true },
  });

  if (!user || !user.isActive) {
    return NextResponse.json(
      { error: 'Unauthorized – account is deactivated' },
      { status: 401 }
    );
  }

  return sessionUser;
}
