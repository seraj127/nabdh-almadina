import { db } from '@/lib/db';
import { createToken, verifyToken, type SessionPayload } from './jwt';

/**
 * JWT Session management with database backing.
 * This file imports Prisma and should ONLY be used in server-side code
 * (API routes, server actions, middleware).
 *
 * Do NOT import this file from client components.
 */

export type { SessionPayload };

/**
 * Creates a JWT session token AND records the session in the database.
 * Use this instead of createToken() when you need DB session tracking.
 */
export async function createSessionToken(user: {
  id: string;
  role: string;
  phone: string;
}, platform: 'web' | 'mobile' | 'admin' = 'web', deviceInfo?: string, ipAddress?: string): Promise<string> {
  const token = await createToken(user, platform);

  // Extract the JTI from the token (we set it during creation)
  const payload = await verifyToken(token);
  const jti = payload?.jti || 'unknown';

  // Create session record in DB
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (platform === 'admin' ? 24 : 168)); // 24h admin, 7d others

    await db.userSession.create({
      data: {
        userId: user.id,
        token: jti,
        deviceInfo: deviceInfo || null,
        ipAddress: ipAddress || null,
        platform,
        expiresAt,
        isActive: true,
      },
    });
  } catch (error) {
    console.error('Failed to create session record:', error);
    // Non-critical - session token still works without DB record
  }

  // Update user's lastLoginAt and loginCount
  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });
  } catch (error) {
    console.error('Failed to update login stats:', error);
  }

  return token;
}

/**
 * Verifies a JWT session token against the database.
 * Checks that the token is valid AND the session is still active.
 * lastSeenAt is only updated every 5 minutes to avoid DB writes on every request.
 */

// Throttle lastSeenAt updates — only update once per 5 minutes per session token
const _lastSeenCache = new Map<string, number>();
const LAST_SEEN_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const payload = await verifyToken(token);
  if (!payload) return null;

  // Check if session is still active in DB
  try {
    const session = await db.userSession.findUnique({
      where: { token: payload.jti },
      select: { isActive: true, expiresAt: true },
    });

    if (!session || !session.isActive) {
      return null; // Session was revoked
    }

    if (session.expiresAt < new Date()) {
      // Mark expired session
      await db.userSession.update({
        where: { token: payload.jti },
        data: { isActive: false },
      }).catch(() => {});
      return null;
    }

    // Update lastSeenAt — throttled to avoid DB writes on every single API call
    const now = Date.now();
    const lastUpdate = _lastSeenCache.get(payload.jti) || 0;
    if (now - lastUpdate > LAST_SEEN_THROTTLE_MS) {
      _lastSeenCache.set(payload.jti, now);
      db.userSession.update({
        where: { token: payload.jti },
        data: { lastSeenAt: new Date() },
      }).catch(() => {}); // Fire-and-forget, non-critical
    }
  } catch {
    // DB check failed - allow if token itself is valid (graceful degradation)
  }

  return payload;
}

/**
 * Revokes a specific session by its JWT ID.
 * Used during logout.
 */
export async function revokeSession(jti: string): Promise<void> {
  try {
    await db.userSession.update({
      where: { token: jti },
      data: { isActive: false },
    });
  } catch {
    // Session may not exist in DB
  }
}

/**
 * Revokes all sessions for a user except the current one.
 * Used for "logout from all devices" feature.
 */
export async function revokeAllSessionsExcept(userId: string, currentJti: string): Promise<number> {
  try {
    const result = await db.userSession.updateMany({
      where: {
        userId,
        isActive: true,
        token: { not: currentJti },
      },
      data: { isActive: false },
    });
    return result.count;
  } catch {
    return 0;
  }
}

/**
 * Revokes all sessions for a user.
 * Used for full logout.
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  try {
    const result = await db.userSession.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: { isActive: false },
    });
    return result.count;
  } catch {
    return 0;
  }
}

/**
 * Gets all active sessions for a user.
 */
export async function getUserSessions(userId: string) {
  try {
    return await db.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastSeenAt: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        platform: true,
        createdAt: true,
        lastSeenAt: true,
      },
    });
  } catch {
    return [];
  }
}

/**
 * Cleans up expired sessions from the database.
 * Should be called periodically.
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await db.userSession.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
      data: { isActive: false },
    });
    return result.count;
  } catch {
    return 0;
  }
}
