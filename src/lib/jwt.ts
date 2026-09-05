import { SignJWT, jwtVerify } from 'jose';

/**
 * JWT utility library for session management.
 * Uses the `jose` library with HS256 algorithm.
 *
 * NOTE: This file is split into token-only functions (client-safe)
 * and DB-dependent functions (server-only, in jwt-session.ts).
 * Only import jwt-session.ts from server-side code (API routes, middleware).
 */

// JWT Secret — must always be provided. A hardcoded fallback would let
// anyone forge session tokens (including admin) on any misconfigured deploy.
let _jwtSecret: Uint8Array | null = null;

export function getJwtSecret(): Uint8Array {
  if (_jwtSecret) return _jwtSecret;

  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    // During `next build` (page-data collection / static export), the secret
    // may legitimately be absent: no requests are actually served then. Allow
    // the build to proceed. At request time, however, refuse to run with an
    // insecure/missing secret — otherwise attackers could forge admin tokens.
    const phase = process.env.NEXT_PHASE;
    if (phase === 'phase-production-build') {
      // Dummy key used only for type compatibility during build; it is never
      // used to sign/verify real tokens because no runtime requests occur.
      _jwtSecret = new TextEncoder().encode('build-only-placeholder-not-used');
      return _jwtSecret;
    }
    throw new Error(
      'FATAL: JWT_SECRET environment variable is missing or shorter than 32 chars. ' +
      'Refusing to run with insecure defaults. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }
  _jwtSecret = new TextEncoder().encode(secret);
  return _jwtSecret;
}

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

export { ALGORITHM, ISSUER, AUDIENCE };

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
    .sign(getJwtSecret());

  return token;
}

/**
 * Verifies a JWT session token and returns the payload.
 * NOTE: Does NOT check against DB session table. Use verifySession() from jwt-session.ts for full validation.
 * This function is safe to call from edge/serverless contexts.
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
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
