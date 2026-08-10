import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

// POST: Register or update a push token
export async function POST(request: NextRequest) {
  // Auth check
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await request.json()
    const { userId, token, platform } = body as {
      userId?: string
      token?: string
      platform?: string
    }

    // Ensure the authenticated user can only register tokens for themselves (or admin)
    if (userId && userId !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden – cannot register push token for another user' },
        { status: 403 }
      )
    }

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'userId and token are required' },
        { status: 400 }
      )
    }

    const validPlatforms = ['web', 'android', 'ios']
    const normalizedPlatform = validPlatforms.includes(platform || '') ? platform! : 'web'

    // Deactivate old tokens for the same user on the same platform
    // (keep only 1 active token per platform per user)
    await db.pushToken.updateMany({
      where: {
        userId,
        platform: normalizedPlatform,
        isActive: true,
        token: { not: token },
      },
      data: { isActive: false },
    })

    // Upsert the token (unique on [userId, token])
    const pushToken = await db.pushToken.upsert({
      where: {
        userId_token: { userId, token },
      },
      create: {
        userId,
        token,
        platform: normalizedPlatform,
        isActive: true,
      },
      update: {
        platform: normalizedPlatform,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      pushToken: {
        id: pushToken.id,
        platform: pushToken.platform,
        isActive: pushToken.isActive,
      },
    })
  } catch (error) {
    console.error('Error registering push token:', error)
    return NextResponse.json(
      { error: 'Failed to register push token' },
      { status: 500 }
    )
  }
}

// DELETE: Deactivate a push token (on logout)
export async function DELETE(request: NextRequest) {
  // Auth check
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await request.json()
    const { token } = body as { token?: string }

    if (!token) {
      return NextResponse.json(
        { error: 'token is required' },
        { status: 400 }
      )
    }

    const result = await db.pushToken.updateMany({
      where: { token, isActive: true },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      deactivatedCount: result.count,
    })
  } catch (error) {
    console.error('Error deactivating push token:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate push token' },
      { status: 500 }
    )
  }
}

// GET: Check if a user has active push tokens
export async function GET(request: NextRequest) {
  // Auth check
  const authResult = await requireAuth(request)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Users can only query their own tokens (admins can query any)
    if (userId && userId !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden – cannot query push tokens for another user' },
        { status: 403 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    const tokens = await db.pushToken.findMany({
      where: { userId, isActive: true },
      select: { id: true, platform: true, createdAt: true },
    })

    return NextResponse.json({
      activeTokens: tokens,
      count: tokens.length,
    })
  } catch (error) {
    console.error('Error fetching push tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch push tokens' },
      { status: 500 }
    )
  }
}
