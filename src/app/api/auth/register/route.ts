import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { checkRateLimit } from '@/lib/rate-limit'
import { normalizePhone, getPhoneVariants } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter: max 3 registrations per IP per hour
const registrationAttempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const attempt = registrationAttempts.get(ip)

  if (!attempt || now > attempt.resetAt) {
    registrationAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return false
  }

  if (attempt.count >= 3) {
    return true
  }

  attempt.count++
  return false
}

interface RegisterBody {
  name: string
  phone: string
  password: string
  email?: string
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (shared)
    const rateLimitError = checkRateLimit(request, { limit: 3, windowMs: 60 * 60 * 1000 });
    if (rateLimitError) return rateLimitError;

    // Rate limiting (per-IP custom)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body: RegisterBody = await request.json()
    const { name, phone, password, email } = body

    // Validate name
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    // Validate and normalize phone format (Libyan: support +2189..., 09..., or 9...)
    let normalizedPhone = phone?.trim() || ''
    // Validate: must be a Libyan mobile number in any common format
    const phoneRegex = /^(\+218|0)?9\d{8}$/
    const cleanedPhone = normalizedPhone.replace(/[\s-]/g, '')
    if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number. Use format: 09XXXXXXXX, +2189XXXXXXXX, or 9XXXXXXXX.' },
        { status: 400 }
      )
    }
    // Normalize to +218 format for consistent storage
    normalizedPhone = normalizePhone(cleanedPhone)

    // Validate password length
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check for duplicate phone (check all format variants)
    const phoneVariants = getPhoneVariants(normalizedPhone)
    for (const variant of phoneVariants) {
      const existing = await db.user.findUnique({ where: { phone: variant } })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Phone number is already registered' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        phone: normalizedPhone,
        passwordHash,
        email: email?.trim() || null,
        role: 'customer',
      },
    })

    // Return user data (excluding sensitive fields)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error during registration:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
