import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { checkRateLimit } from '@/lib/rate-limit'
import { getPhoneVariants } from '@/lib/phone-utils'
import { createSessionToken } from '@/lib/jwt-session'

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter: max 5 attempts per IP per minute
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const attempt = loginAttempts.get(ip)

  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 60 * 1000 })
    return false
  }

  if (attempt.count >= 5) {
    return true
  }

  attempt.count++
  return false
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (shared)
    const rateLimitError = checkRateLimit(request, { limit: 5, windowMs: 60 * 1000 });
    if (rateLimitError) return rateLimitError;

    // Rate limiting (per-IP custom)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { phone, password, platform = 'web', deviceInfo } = body

    // Validate input
    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Phone and password are required' },
        { status: 400 }
      )
    }

    // Search DB with all Libyan phone format variants
    const phoneVariants = getPhoneVariants(phone)

    let user: Awaited<ReturnType<typeof db.user.findUnique>> | null = null
    for (const variant of phoneVariants) {
      user = await db.user.findUnique({ where: { phone: variant } })
      if (user) break
    }

    if (!user || !user.passwordHash) {
      // Log failed login attempt
      try {
        await db.auditLog.create({
          data: {
            action: 'login_failed',
            entity: 'User',
            details: `Failed login attempt for phone: ${phone}`,
            ip,
          },
        });
      } catch { /* non-critical */ }

      return NextResponse.json(
        { success: false, error: 'Invalid phone number or password' },
        { status: 401 }
      )
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      // Log failed login attempt
      try {
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'login_failed',
            entity: 'User',
            details: `Invalid password for user: ${user.id}`,
            ip,
          },
        });
      } catch { /* non-critical */ }

      return NextResponse.json(
        { success: false, error: 'Invalid phone number or password' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      )
    }

    // ─── Create JWT session token ────────────────────────────────────
    const validPlatform = ['web', 'mobile', 'admin'].includes(platform) ? platform : 'web';
    const token = await createSessionToken(
      { id: user.id, role: user.role, phone: user.phone },
      validPlatform as 'web' | 'mobile' | 'admin',
      deviceInfo,
      ip
    );

    // ─── Create audit log entry ──────────────────────────────────────
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'login_success',
          entity: 'User',
          entityId: user.id,
          details: `User logged in via ${validPlatform}`,
          ip,
        },
      });
    } catch { /* non-critical */ }

    // ─── Build response with session cookie ──────────────────────────
    const responseData = {
      success: true,
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
        walletBalance: Number(user.walletBalance),
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount + 1, // +1 because we just incremented it
      },
      isReturningUser: user.loginCount > 0, // Flag for "Welcome back" message
    };

    const response = NextResponse.json(responseData);

    // Set httpOnly session cookie
    const isSecure = process.env.NODE_ENV === 'production';
    const cookieName = validPlatform === 'admin' ? 'admin_session' : 'session_token';
    const maxAge = validPlatform === 'admin' ? 24 * 60 * 60 : 7 * 24 * 60 * 60; // 24h admin, 7d others

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
