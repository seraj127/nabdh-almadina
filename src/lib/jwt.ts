import { SignJWT, jwtVerify } from 'jose';

/**
 * JWT utility library for session management.
 * Uses the `jose` library with HS256 algorithm.
 *
 * NOTE: This file is split into token-only functions (client-safe)
 * and DB-dependent functions (server-only, in jwt-session.ts).
 * Only import jwt-session.ts from server-side code (API routes, middleware).
 */

// JWT Secret — fail hard in production if not set
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start with insecure defaults in production.');
  }
  return new TextEncoder().encode(secret || 'nabd-al-madina-dev-secret-key-change-in-production-2024');
}

const JWT_SECRET = getJwtSecret();

const ALGORITHM = 'HS256';
const ISSUER = 'nabd-al-madina';
const AUDIENCE = 'nabd-session';

export interface SessionPayload {
  userId: string;
  role: string;
  phone: string;
  platform: 'web' | 'mobile' | 'admin';
  jti: string; // JWT ID for session tracking
}

export { JWT_SECRET, ALGORITHM, ISSUER, AUDIENCE };

/**
 * Creates a JWT session token.
 * NOTE: Does NOT create a DB session record. Use createSession() from jwt-session.ts instead.
 * This function is safe to call from edge/serverless contexts.
 */
export async function createToken(user: {
  id: string;
  role: string;
  phone: string;
}, platform: 'web' | 'mobile' | 'admin' = 'web'): Promise<string> {
  const jti = crypto.randomUUID();

  const token = await new SignJWT({
    userId: user.id,
    role: user.role,
    phone: user.phone,
    platform,
    jti,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(platform === 'admin' ? '24h' : '7d')
    .setSubject(user.id)
    .setJti(jti)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies a JWT session token and returns the payload.
 * NOTE: Does NOT check against DB session table. Use verifySession() from jwt-session.ts for full validation.
 * This function is safe to call from edge/serverless contexts.
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: [ALGORITHM],
    });

    if (!payload.userId || !payload.role || !payload.phone || !payload.jti) {
      return null;
    }

    return {
      userId: payload.userId as string,
      role: payload.role as string,
      phone: payload.phone as string,
      platform: (payload.platform as 'web' | 'mobile' | 'admin') || 'web',
      jti: payload.jti as string,
    };
  } catch {
    // Token is invalid, expired, or malformed
    return null;
  }
}
