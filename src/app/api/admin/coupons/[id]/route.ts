import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

// PUT /api/admin/coupons/[id] - Update coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const { id } = await params
    const body = await request.json()
    const {
      code,
      descriptionAr,
      descriptionEn,
      type,
      value,
      minOrder,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startsAt,
      expiresAt,
      isActive,
    } = body

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'كوبون الخصم غير موجود' },
        { status: 404 }
      )
    }

    // If code is being changed, check uniqueness
    if (code && code !== existing.code) {
      const codeTaken = await db.coupon.findUnique({ where: { code } })
      if (codeTaken) {
        return NextResponse.json(
          { error: 'كود الخصم مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}

    if (code !== undefined) updateData.code = code.toUpperCase()
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr
    if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn
    if (type !== undefined) updateData.type = type
    if (value !== undefined) updateData.value = parseFloat(value)
    if (minOrder !== undefined) updateData.minOrder = minOrder ? parseFloat(minOrder) : 0
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit
    if (perUserLimit !== undefined) updateData.perUserLimit = perUserLimit
    if (startsAt !== undefined) updateData.startsAt = new Date(startsAt)
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt)
    if (isActive !== undefined) updateData.isActive = isActive

    // Validate dates if both are being updated or one is being updated with existing
    const finalStartsAt = updateData.startsAt
      ? new Date(updateData.startsAt as string | Date)
      : existing.startsAt
    const finalExpiresAt = updateData.expiresAt
      ? new Date(updateData.expiresAt as string | Date)
      : existing.expiresAt

    if (finalExpiresAt <= finalStartsAt) {
      return NextResponse.json(
        { error: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء' },
        { status: 400 }
      )
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('[ADMIN_COUPON_PUT]', error)
    return NextResponse.json(
      { error: 'فشل في تحديث كوبون الخصم' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/coupons/[id] - Deactivate coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const { id } = await params

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'كوبون الخصم غير موجود' },
        { status: 404 }
      )
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'تم تعطيل كوبون الخصم بنجاح',
      coupon,
    })
  } catch (error) {
    console.error('[ADMIN_COUPON_DELETE]', error)
    return NextResponse.json(
      { error: 'فشل في تعطيل كوبون الخصم' },
      { status: 500 }
    )
  }
}
