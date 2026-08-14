import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, revokeSession, revokeAllUserSessions } from '@/lib/jwt-session'
import { db } from '@/lib/db'

export const dynamic = "force-dynamic";

/**
 * Logout endpoint — revokes sessions and clears cookies.
 *
 * Cross-device sync: logging out from ANY device revokes ALL of the user's
 * sessions by default, so the other devices are logged out too (their next
 * authenticated request gets a 401).
 *
 * Supported:
 * - POST /api/auth/logout            — revoke ALL sessions for the user (default)
 * - POST /api/auth/logout?all=true   — same (explicit full logout)
 * - POST /api/auth/logout?single=true— revoke ONLY the current session/device
 */
export async function POST(request: NextRequest) {
  try {
    // Try to get session from either cookie
    const sessionToken = request.cookies.get('session_token')?.value ||
                         request.cookies.get('admin_session')?.value;

    let userId: string | null = null;
    let jti: string | null = null;
    let platform: string = 'web';

    if (sessionToken) {
      const payload = await verifySessionToken(sessionToken);
      if (payload) {
        userId = payload.userId;
        jti = payload.jti;
        platform = payload.platform;
      }
    }

    // Fallback: get userId from request body (for backward compatibility)
    if (!userId) {
      try {
        const body = await request.json();
        if (body?.userId) userId = body.userId;
      } catch { /* no body */ }
    }

    if (userId) {
      const searchParams = new URL(request.url).searchParams;
      const single = searchParams.get('single') === 'true';
      const all = searchParams.get('all') === 'true';

      if (single && jti) {
        // Revoke only the current session/device
        await revokeSession(jti);
      } else {
        // Default + ?all=true → revoke all sessions (full cross-device logout)
        await revokeAllUserSessions(userId);
      }

      // Create audit log entry
      try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        await db.auditLog.create({
          data: {
            userId,
            action: 'logout',
            entity: 'User',
            entityId: userId,
            details: `User logged out (${all ? 'all devices' : single ? 'this device' : 'all devices'}) via ${platform}`,
            ip,
          },
        });
      } catch { /* non-critical */ }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear both session cookies
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error during logout:', error);

    // Still clear cookies even if revocation fails
    const response = NextResponse.json({
      success: true,
      message: 'Logged out',
    });

    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  }
}
