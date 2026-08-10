import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

// GET /api/admin/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const { id } = await params

    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
        products: {
          where: { isActive: true },
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            price: true,
            mainImage: true,
            stock: true,
            isActive: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'الفئة غير موجودة' },
        { status: 404 }
      )
    }

    const formatted = {
      ...category,
      productCount: category._count.products,
      _count: undefined,
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[ADMIN_CATEGORY_GET]', error)
    return NextResponse.json(
      { error: 'فشل في تحميل الفئة' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const { id } = await params
    const body = await request.json()

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'الفئة غير موجودة' },
        { status: 404 }
      )
    }

    // If slug is being changed, check uniqueness
    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await db.category.findUnique({ where: { slug: body.slug } })
      if (slugTaken) {
        return NextResponse.json(
          { error: 'رابط الفئة (slug) مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}

    if (body.nameAr !== undefined) updateData.nameAr = body.nameAr
    if (body.nameEn !== undefined) updateData.nameEn = body.nameEn
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.icon !== undefined) updateData.icon = body.icon
    if (body.image !== undefined) updateData.image = body.image
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder
    if (body.isActive !== undefined) updateData.isActive = body.isActive

    const category = await db.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    const formatted = {
      ...category,
      productCount: category._count.products,
      _count: undefined,
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('[ADMIN_CATEGORY_PUT]', error)
    return NextResponse.json(
      { error: 'فشل في تحديث الفئة' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id] - Soft delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const { id } = await params

    const existing = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'الفئة غير موجودة' },
        { status: 404 }
      )
    }

    const activeProducts = await db.product.count({
      where: { categoryId: id, isActive: true },
    })

    if (activeProducts > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف الفئة لأنها تحتوي على ${activeProducts} منتج نشط` },
        { status: 400 }
      )
    }

    const category = await db.category.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      message: 'تم حذف الفئة بنجاح',
      category,
    })
  } catch (error) {
    console.error('[ADMIN_CATEGORY_DELETE]', error)
    return NextResponse.json(
      { error: 'فشل في حذف الفئة' },
      { status: 500 }
    )
  }
}
