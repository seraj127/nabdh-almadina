import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic";

// ─── In-memory rate limiter: max 3 sends per phone per minute ──────────
const sendAttempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const attempt = sendAttempts.get(key)
  if (!attempt || now > attempt.resetAt) {
    sendAttempts.set(key, { count: 1, resetAt: now + 60 * 1000 })
    return false
  }
  if (attempt.count >= 3) return true
  attempt.count++
  return false
}

// ─── Generate a 6-digit OTP code ────────────────────────────────────────
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ═══════════════════════════════════════════════════════════════════════
// POST /api/auth/forgot-password
//
// Actions:
//   1. { action: 'send', phone }           → Generate & store OTP, return code (demo)
//   2. { action: 'verify', phone, code }   → Verify OTP, mark as verified
//   3. { action: 'reset', phone, code, newPassword } → Verify + reset password
// ═══════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, phone, code, newPassword } = body

    // ─── Action: Send OTP ──────────────────────────────────────────────
    if (action === 'send') {
      if (!phone || phone.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Phone number is required' },
          { status: 400 }
        )
      }

      const normalizedPhone = phone.trim()

      // ─── Check if a registered user exists with this phone ───────
      // Only send OTP to phone numbers that belong to existing accounts
      const existingUser = await db.user.findUnique({
        where: { phone: normalizedPhone },
      })

      if (!existingUser) {
        return NextResponse.json(
          { success: false, error: 'لا يوجد حساب مرتبط بهذا الرقم. يرجى التأكد من الرقم أو إنشاء حساب جديد.' },
          { status: 404 }
        )
      }

      // Rate limiting
      if (isRateLimited(normalizedPhone)) {
        return NextResponse.json(
          { success: false, error: 'Too many attempts. Please try again later.' },
          { status: 429 }
        )
      }

      // Delete any existing unverified OTPs for this phone
      await db.oTPVerification.deleteMany({
        where: { phone: normalizedPhone, verified: false },
      })

      // Generate new OTP
      const otpCode = generateOTP()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      await db.oTPVerification.create({
        data: {
          phone: normalizedPhone,
          code: otpCode,
          verified: false,
          expiresAt,
        },
      })

      // In production: send OTP via SMS gateway here
      // For demo: return the code so the frontend can display it
      const isDev = process.env.NODE_ENV === 'development'
      const response: Record<string, unknown> = {
        success: true,
        message: 'Verification code sent successfully',
      }
      // Only include code in development mode for testing
      if (isDev) {
        response.demoCode = otpCode
      }

      return NextResponse.json(response)
    }

    // ─── Action: Verify OTP ────────────────────────────────────────────
    if (action === 'verify') {
      if (!phone || !code) {
        return NextResponse.json(
          { success: false, error: 'Phone and code are required' },
          { status: 400 }
        )
      }

      const normalizedPhone = phone.trim()

      // First: try unverified OTP (normal flow)
      let otpRecord = await db.oTPVerification.findFirst({
        where: {
          phone: normalizedPhone,
          code,
          verified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      })

      // If not found, also accept already-verified OTP within 10 min
      // (handles double-submit / page refresh gracefully)
      if (!otpRecord) {
        otpRecord = await db.oTPVerification.findFirst({
          where: {
            phone: normalizedPhone,
            code,
            verified: true,
            createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
          },
          orderBy: { createdAt: 'desc' },
        })
      }

      if (!otpRecord) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired verification code' },
          { status: 401 }
        )
      }

      // Mark as verified (idempotent)
      if (!otpRecord.verified) {
        await db.oTPVerification.update({
          where: { id: otpRecord.id },
          data: { verified: true },
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Code verified successfully',
      })
    }

    // ─── Action: Reset Password ────────────────────────────────────────
    if (action === 'reset') {
      if (!phone || !code || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Phone, code, and new password are required' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters' },
          { status: 400 }
        )
      }

      // Check if OTP was verified
      const otpRecord = await db.oTPVerification.findFirst({
        where: {
          phone,
          code,
          verified: true,
          expiresAt: { gt: new Date(Date.now() - 10 * 60 * 1000) }, // 10 min window after verify
        },
        orderBy: { createdAt: 'desc' },
      })

      if (!otpRecord) {
        return NextResponse.json(
          { success: false, error: 'Verification required. Please verify your code first.' },
          { status: 401 }
        )
      }

      // Find user by phone
      const user = await db.user.findUnique({ where: { phone } })
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'No account found with this phone number' },
          { status: 404 }
        )
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(newPassword, salt)

      // Update user password
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash },
      })

      // Delete used OTP
      await db.oTPVerification.delete({
        where: { id: otpRecord.id },
      })

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use: send, verify, or reset' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in forgot-password:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
