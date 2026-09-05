import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serializeDecimal } from '@/lib/serialize'

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    // Validate required fields
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'رمز الكوبون مطلوب' },
        { status: 400 }
      )
    }

    const userId = body.userId || null

    if (subtotal === undefined || subtotal === null || isNaN(Number(subtotal))) {
      return NextResponse.json(
        { valid: false, error: 'المبلغ الإجمالي مطلوب' },
        { status: 400 }
      )
    }

    const subtotalNum = Number(subtotal)

    // Find the coupon
    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        error: 'كوبون غير صالح - الكوبون غير موجود',
      })
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        error: 'هذا الكوبون غير مفعّل',
      })
    }

    const now = new Date()

    // Check if coupon has started
    if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      return NextResponse.json({
        valid: false,
        error: 'هذا الكوبون لم يبدأ بعد',
      })
    }

    // Check if coupon has expired
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return NextResponse.json({
        valid: false,
        error: 'انتهت صلاحية هذا الكوبون',
      })
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        error: 'تم تجاوز الحد الأقصى لاستخدام هذا الكوبون',
      })
    }

    // Check per-user limit — ignore cancelled orders so a cancelled purchase
    // (stock reservation released, loyalty refunded) does NOT consume the
    // user's allowance for this coupon and permanently lock them out.
    if (coupon.perUserLimit && body.userId) {
      const userUsageCount = await db.order.count({
        where: {
          userId: body.userId,
          couponId: coupon.id,
          status: { notIn: ['cancelled'] },
        },
      })
      if (userUsageCount >= coupon.perUserLimit) {
        return NextResponse.json({
          valid: false,
          error: 'لقد استخدمت هذا الكوبون الحد الأقصى المسموح لك',
        })
      }
    }

    // Check minimum order value
    if (coupon.minOrder && subtotalNum < Number(coupon.minOrder)) {
      return NextResponse.json({
        valid: false,
        error: `الحد الأدنى للطلب ${Number(coupon.minOrder)} د.ل`,
      })
    }

    // Calculate discount amount
    let discount = 0
    const couponValue = Number(coupon.value)
    if (coupon.type === 'percentage') {
      discount = (subtotalNum * couponValue) / 100
      // Cap by maxDiscount if set
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount))
      }
    } else if (coupon.type === 'fixed') {
      discount = Math.min(couponValue, subtotalNum)
    }
    discount = Math.round(discount * 100) / 100 // round to 2 decimals

    // Coupon is valid - return coupon details with computed discount
    return NextResponse.json({
      valid: true,
      coupon: serializeDecimal({
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minOrder: coupon.minOrder,
        maxDiscount: coupon.maxDiscount,
        discount,
        descriptionAr: coupon.descriptionAr,
        descriptionEn: coupon.descriptionEn,
      }),
    })
  } catch (error) {
    console.error('[COUPONS_VALIDATE]', error)
    return NextResponse.json(
      { valid: false, error: 'فشل في التحقق من الكوبون' },
      { status: 500 }
    )
  }
}
