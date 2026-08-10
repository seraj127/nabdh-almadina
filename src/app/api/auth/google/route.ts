import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSessionToken } from '@/lib/jwt-session'

export const dynamic = "force-dynamic";

// ─── Google OAuth Configuration ──────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''

// Lazy-initialize the OAuth2Client so we don't crash at import time
// if google-auth-library is missing or GOOGLE_CLIENT_ID is not set.
let _client: InstanceType<typeof import('google-auth-library').OAuth2Client> | null = null

function getGoogleClient() {
  if (!GOOGLE_CLIENT_ID) return null
  if (_client) return _client
  try {
    // Dynamic require guard — google-auth-library may not be installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { OAuth2Client } = require('google-auth-library')
    _client = new OAuth2Client(GOOGLE_CLIENT_ID)
    return _client
  } catch {
    console.error('[GOOGLE AUTH] google-auth-library is not installed or failed to load')
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════
// POST /api/auth/google
//
// Verifies a Google ID token and creates/finds the user in our database.
// This endpoint is called from the frontend after the user signs in with
// Google Identity Services (GIS) popup.
//
// Body: { idToken: string }
// Response: { success: true, user: { id, name, email, phone, role, provider, avatar } }
// ═══════════════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  // ─── Graceful check: is Google OAuth configured? ──────────────────
  const client = getGoogleClient()
  if (!client) {
    console.warn('[GOOGLE AUTH] GOOGLE_CLIENT_ID is not configured or google-auth-library is unavailable')
    return NextResponse.json(
      { success: false, error: 'Google login is not configured. Please contact support.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { idToken, platform = 'web' } = body

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: 'Google ID token is required' },
        { status: 400 }
      )
    }

    // ─── Verify the Google ID token ─────────────────────────────────
    let payload: { sub?: string; email?: string; name?: string; picture?: string; email_verified?: boolean }

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      })
      payload = ticket.getPayload() || {}
    } catch (verifyError) {
      console.error('[GOOGLE AUTH] Token verification failed:', verifyError)
      return NextResponse.json(
        { success: false, error: 'Invalid Google token. Please try again.' },
        { status: 401 }
      )
    }

    const googleId = payload.sub
    const email = payload.email
    const name = payload.name || ''
    const avatar = payload.picture || ''

    if (!googleId) {
      return NextResponse.json(
        { success: false, error: 'Google authentication failed — missing user ID' },
        { status: 401 }
      )
    }

    // ─── Check if user already exists by googleId ───────────────────
    let user = await db.user.findUnique({ where: { googleId } })

    if (user) {
      // Update avatar if changed
      if (avatar && user.avatar !== avatar) {
        user = await db.user.update({
          where: { id: user.id },
          data: { avatar, name: name || user.name },
        })
      }
      // Existing user found
    } else {
      // ─── Check if user exists by email (link accounts) ───────────
      if (email) {
        user = await db.user.findUnique({ where: { email } })
      }

      if (user) {
        // Link Google account to existing user
        user = await db.user.update({
          where: { id: user.id },
          data: {
            googleId,
            provider: 'google',
            avatar: avatar || user.avatar,
            name: name || user.name,
          },
        })
        // Linked Google to existing user
      } else {
        // ─── Create new user from Google account ───────────────────
        // Generate a unique phone placeholder (Google doesn't provide phone)
        const phone = `google_${googleId.substring(0, 15)}`

        user = await db.user.create({
          data: {
            phone,
            name,
            email: email || null,
            avatar: avatar || null,
            googleId,
            provider: 'google',
            passwordHash: null, // No password for Google users
            role: 'customer',
          },
        })
        // New user created
      }
    }

    // ─── Create JWT session token ────────────────────────────────────
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const validPlatform = ['web', 'mobile', 'admin'].includes(platform) ? platform : 'web'
    const token = await createSessionToken(
      { id: user.id, role: user.role, phone: user.phone },
      validPlatform as 'web' | 'mobile' | 'admin',
      undefined,
      ip
    )

    // ─── Create audit log entry ──────────────────────────────────────
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'login_google',
          entity: 'User',
          entityId: user.id,
          details: `User logged in via Google OAuth on ${validPlatform}`,
          ip,
        },
      });
    } catch { /* non-critical */ }

    const isReturningUser = user.loginCount > 0

    // Return user data (excluding sensitive fields)
    const responseData = {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        provider: user.provider,
        avatar: user.avatar,
        language: user.language,
        loyaltyTier: user.loyaltyTier,
        loyaltyPoints: user.loyaltyPoints,
        walletBalance: Number(user.walletBalance),
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
      },
      isReturningUser,
    };

    const response = NextResponse.json(responseData)

    // Set httpOnly session cookie
    const isSecure = process.env.NODE_ENV === 'production'
    const cookieName = validPlatform === 'admin' ? 'admin_session' : 'session_token'
    const maxAge = validPlatform === 'admin' ? 24 * 60 * 60 : 7 * 24 * 60 * 60

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge,
    })

    return response
  } catch (error) {
    console.error('[GOOGLE AUTH] Error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred during Google authentication' },
      { status: 500 }
    )
  }
}
