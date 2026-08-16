import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { authenticate } from '@/lib/auth.service'

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

    // Validate input (boundary)
    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Phone and password are required' },
        { status: 400 }
      )
    }

    // Business logic lives in the auth service (BE-001)
    const result = await authenticate({ phone, password, platform, deviceInfo, ip });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: result.status }
      )
    }

    // ─── Build response with session cookie ──────────────────────────
    const responseData = {
      success: true,
      user: {
        id: result.user.id,
        phone: result.user.phone,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        language: result.user.language,
        avatar: result.user.avatar,
        loyaltyTier: result.user.loyaltyTier,
        loyaltyPoints: result.user.loyaltyPoints,
        walletBalance: Number(result.user.walletBalance),
        lastLoginAt: result.user.lastLoginAt,
        loginCount: result.user.loginCount + 1, // +1 because we just incremented it
      },
      isReturningUser: result.isReturningUser,
    };

    const response = NextResponse.json(responseData);

    const isSecure = process.env.NODE_ENV === 'production';
    response.cookies.set(result.cookieName, result.token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: result.maxAge,
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
