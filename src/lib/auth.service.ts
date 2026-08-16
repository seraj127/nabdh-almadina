import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getPhoneVariants } from '@/lib/phone-utils';
import { createSessionToken } from '@/lib/jwt-session';

/**
 * Auth service — business logic for authentication (BE-001).
 * Kept separate from the HTTP layer so it is testable without a router.
 */

export interface AuthenticateInput {
  phone: string;
  password: string;
  platform?: string;
  deviceInfo?: string;
  ip: string;
}

export type LoginOk = {
  ok: true;
  token: string;
  cookieName: string;
  maxAge: number;
  user: {
    id: string;
    phone: string;
    name: string;
    email?: string | null;
    role: string;
    language?: string | null;
    avatar?: string | null;
    loyaltyTier?: string | null;
    loyaltyPoints?: number | null;
    walletBalance: unknown;
    lastLoginAt?: Date | null;
    loginCount: number;
  };
  isReturningUser: boolean;
};

export type LoginFail = {
  ok: false;
  status: 400 | 401 | 403;
  message: string;
};

export type LoginResult = LoginOk | LoginFail;

/** Validate credentials and, on success, mint a session token and audit. */
export async function authenticate(input: AuthenticateInput): Promise<LoginResult> {
  const { phone, password, platform = 'web', deviceInfo, ip } = input;

  // Search DB with all Libyan phone format variants
  const phoneVariants = getPhoneVariants(phone);

  let user: Awaited<ReturnType<typeof db.user.findUnique>> | null = null;
  for (const variant of phoneVariants) {
    user = await db.user.findUnique({ where: { phone: variant } });
    if (user) break;
  }

  if (!user || !user.passwordHash) {
    await safeAudit({
      action: 'login_failed',
      entity: 'User',
      details: `Failed login attempt for phone: ${phone}`,
      ip,
    });
    return { ok: false, status: 401, message: 'Invalid phone number or password' };
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    await safeAudit({
      userId: user.id,
      action: 'login_failed',
      entity: 'User',
      details: `Invalid password for user: ${user.id}`,
      ip,
    });
    return { ok: false, status: 401, message: 'Invalid phone number or password' };
  }

  if (!user.isActive) {
    return { ok: false, status: 403, message: 'Account is deactivated. Please contact support.' };
  }

  const validPlatform = ['web', 'mobile', 'admin'].includes(platform) ? platform : 'web';
  const token = await createSessionToken(
    { id: user.id, role: user.role, phone: user.phone },
    validPlatform as 'web' | 'mobile' | 'admin',
    deviceInfo,
    ip
  );

  await safeAudit({
    userId: user.id,
    action: 'login_success',
    entity: 'User',
    entityId: user.id,
    details: `User logged in via ${validPlatform}`,
    ip,
  });

  const isAdmin = validPlatform === 'admin';
  return {
    ok: true,
    token,
    cookieName: isAdmin ? 'admin_session' : 'session_token',
    maxAge: isAdmin ? 24 * 60 * 60 : 7 * 24 * 60 * 60,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      avatar: user.avatar,
      loyaltyTier: user.loyaltyTier,
      loyaltyPoints: user.loyaltyPoints,
      walletBalance: user.walletBalance,
      lastLoginAt: user.lastLoginAt,
      loginCount: user.loginCount,
    },
    isReturningUser: user.loginCount > 0,
  };
}

async function safeAudit(data: Record<string, unknown>): Promise<void> {
  try {
    await db.auditLog.create({ data: data as never });
  } catch {
    // Non-critical — audit must never block login
  }
}
