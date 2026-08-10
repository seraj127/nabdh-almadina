import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, revokeSession, revokeAllUserSessions } from '@/lib/jwt-session'
import { db } from '@/lib/db'

export const dynamic = "force-dynamic";

/**
 * Logout endpoint — revokes session and clears cookies.
 * Supports:
 * - POST /api/auth/logout — revoke current session (default)
 * - POST /api/auth/logout?all=true — revoke all sessions for the user
 */
export async function POST(request: NextRequest) {
  try {
    // Try to get session from either cookie
    const sessionToken = request.cookies.get('session_token')?.value ||
                         request.cookies.get('admin_session')?.value;

    let userId: string | null = null;
    let platform: string = 'web';

    if (sessionToken) {
      const payload = await verifySessionToken(sessionToken);
      if (payload) {
        userId = payload.userId;
        platform = payload.platform;

        const searchParams = new URL(request.url).searchParams;
        const logoutAll = searchParams.get('all') === 'true';

        if (logoutAll) {
          // Revoke all sessions for the user
          await revokeAllUserSessions(payload.userId);
        } else {
          // Revoke only the current session
          await revokeSession(payload.jti);
        }
      }
    }

    // Also try to get userId from request body (for backward compatibility)
    if (!userId) {
      try {
        const body = await request.json();
        if (body?.userId) userId = body.userId;
      } catch { /* no body */ }
    }

    // Create audit log entry
    if (userId) {
      try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        await db.auditLog.create({
          data: {
            userId,
            action: 'logout',
            entity: 'User',
            entityId: userId,
            details: `User logged out via ${platform}`,
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
