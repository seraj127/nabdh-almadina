import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@/generated/sqlite'

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const categorySlug = searchParams.get('category') || ''
    const subcategorySlug = searchParams.get('subcategory') || ''
    const limitParam = searchParams.get('limit') || '20'
    const offsetParam = searchParams.get('offset') || '0'
    const sort = searchParams.get('sort') || 'newest'
    const isActiveParam = searchParams.get('isActive') || ''

    const limit = Math.min(Math.max(parseInt(limitParam, 10) || 20, 1), 100)
    const offset = Math.max(parseInt(offsetParam, 10) || 0, 0)

    // Build where clause
    const where: Prisma.ProductWhereInput = {}

    // Active filter: only active by default, "all" for admin
    if (isActiveParam !== 'all') {
      where.isActive = true
      // Hide sold-out products from the public storefront (availableStock = stock - reservedStock).
      // Admin ("all") can still see and manage products that are out of stock.
      where.stock = { gt: 0 }
    }

    // Search filter
    if (search) {
      where.OR = [
        { nameAr: { contains: search } },
        { nameEn: { contains: search } },
      ]
    }

    // Category filter - support categoryId, category slug, and subcategory slug
    if (categoryId) {
      where.categoryId = categoryId
    } else if (subcategorySlug) {
      // Filter by subcategory slug — matches a category that has a parentId (i.e. it's a subcategory)
      where.category = {
        slug: subcategorySlug,
        parentId: { not: null },
      }
    } else if (categorySlug) {
      where.category = { slug: categorySlug }
    }

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
    switch (sort) {
      case 'priceAsc':
        orderBy = { price: 'asc' }
        break
      case 'priceDesc':
        orderBy = { price: 'desc' }
        break
      case 'popular':
        orderBy = { rating: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // Get total count
    const total = await db.product.count({ where })

    // Get products
    const products = await db.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            slug: true,
          },
        },
      },
    })

    // Hide any product that is effectively sold out (stock - reservedStock <= 0)
    // as an extra safety layer on top of the SQL WHERE (stock > 0) filter.
    const availableProducts = products.filter(
      (product) =>
        (Number(product.stock) || 0) - (Number(product.reservedStock) || 0) > 0
    )

    // Transform products: convert Decimal to number, parse images JSON string
    const transformedProducts = availableProducts.map((product) => {
      const { price, comparePrice, costPrice, weight, rating, images, ...rest } = product

      // Parse images field (may be JSON string or array)
      let parsedImages: string[] = []
      if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images)
          parsedImages = Array.isArray(parsed) ? parsed.map(String) : [String(parsed)]
        } catch {
          parsedImages = [images]
        }
      } else if (Array.isArray(images)) {
        parsedImages = (images as any[]).map(String)
      }

      return {
        ...rest,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        costPrice: costPrice ? Number(costPrice) : null,
        weight: weight ? Number(weight) : null,
        rating: Number(rating),
        images: parsedImages,
      }
    })

    return NextResponse.json({
      products: transformedProducts,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
