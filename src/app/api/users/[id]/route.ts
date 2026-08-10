import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, getSessionUser } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

// GET /api/users/[id] — Return user profile (excluding password)
// Only the user themselves or an admin can read a profile.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth check: must be logged in
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult

    // Authorization: only self or admin
    if (authResult.userId !== id && authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden – you can only view your own profile' },
        { status: 403 }
      )
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        language: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Convert Decimal fields to numbers
    const transformedUser = {
      ...user,
      walletBalance: Number(user.walletBalance),
    }

    return NextResponse.json({ user: transformedUser })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] — Update user profile (name, email, avatar)
// Only the user themselves or an admin can update a profile.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Auth check: must be logged in
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult

    // Authorization: only self or admin
    if (authResult.userId !== id && authResult.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden – you can only update your own profile' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, avatar } = body

    // Validate user exists
    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update data — only include fields that were provided
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      updateData.name = name || null
    }
    if (email !== undefined) {
      updateData.email = email || null
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar || null
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        language: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Convert Decimal fields to numbers
    const transformedUser = {
      ...updatedUser,
      walletBalance: Number(updatedUser.walletBalance),
    }

    return NextResponse.json({ user: transformedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
