import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await db.product.findUnique({
      where: { id },
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

    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Parse images field
    let parsedImages: string[] = []
    try {
      if (product.images) {
        const parsed = JSON.parse(product.images)
        parsedImages = Array.isArray(parsed) ? parsed : [parsed]
      }
    } catch {
      parsedImages = product.images ? [product.images] : []
    }

    // Parse attributes field
    let parsedAttributes = null
    try {
      if (product.attributes) {
        parsedAttributes = typeof product.attributes === 'string' 
          ? JSON.parse(product.attributes) 
          : product.attributes
      }
    } catch {
      parsedAttributes = null
    }

    // Parse badges field
    let parsedBadges: string[] | null = null
    try {
      if (product.badges) {
        const parsed = typeof product.badges === 'string' ? JSON.parse(product.badges) : product.badges
        parsedBadges = Array.isArray(parsed) ? parsed : null
      }
    } catch {
      parsedBadges = null
    }

    const transformed = {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      weight: product.weight ? Number(product.weight) : null,
      rating: Number(product.rating),
      images: parsedImages,
      attributes: parsedAttributes,
      badges: parsedBadges,
    }

    return NextResponse.json({ product: transformed })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
