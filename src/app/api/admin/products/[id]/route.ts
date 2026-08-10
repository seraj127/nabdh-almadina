import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, nameAr: true, nameEn: true, slug: true },
        },
        orderItems: {
          select: { id: true, quantity: true, price: true, total: true },
          take: 20,
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('[ADMIN_PRODUCT_GET]', error)
    return NextResponse.json(
      { error: 'فشل في تحميل المنتج' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const { id } = await params
    const body = await request.json()

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    // If SKU is being changed, check uniqueness
    if (body.sku && body.sku !== existing.sku) {
      const skuTaken = await db.product.findUnique({ where: { sku: body.sku } })
      if (skuTaken) {
        return NextResponse.json(
          { error: 'رمز المنتج (SKU) مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // If categoryId is being changed, verify it exists
    if (body.categoryId && body.categoryId !== existing.categoryId) {
      const category = await db.category.findUnique({ where: { id: body.categoryId } })
      if (!category) {
        return NextResponse.json(
          { error: 'الفئة غير موجودة' },
          { status: 404 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}

    // Only update fields that are provided
    if (body.nameAr !== undefined) updateData.nameAr = body.nameAr
    if (body.nameEn !== undefined) updateData.nameEn = body.nameEn
    if (body.descriptionAr !== undefined) updateData.descriptionAr = body.descriptionAr
    if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.comparePrice !== undefined) updateData.comparePrice = body.comparePrice ? parseFloat(body.comparePrice) : null
    if (body.costPrice !== undefined) updateData.costPrice = body.costPrice ? parseFloat(body.costPrice) : null
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
    if (body.stock !== undefined) updateData.stock = body.stock
    if (body.images !== undefined) updateData.images = typeof body.images === 'string' ? body.images : JSON.stringify(body.images)
    if (body.mainImage !== undefined) updateData.mainImage = body.mainImage
    if (body.sku !== undefined) updateData.sku = body.sku
    if (body.badges !== undefined) updateData.badges = typeof body.badges === 'string' ? body.badges : JSON.stringify(body.badges)
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, nameAr: true, nameEn: true },
        },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('[ADMIN_PRODUCT_PUT]', error)
    return NextResponse.json(
      { error: 'فشل في تحديث المنتج' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/[id] - Soft delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const { id } = await params

    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    const product = await db.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'تم حذف المنتج بنجاح',
      product,
    })
  } catch (error) {
    console.error('[ADMIN_PRODUCT_DELETE]', error)
    return NextResponse.json(
      { error: 'فشل في حذف المنتج' },
      { status: 500 }
    )
  }
}
