import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@/generated/sqlite'

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const parentId = searchParams.get('parentId') || ''
    const slug = searchParams.get('slug') || ''
    const includeChildrenParam = searchParams.get('includeChildren') || 'true'
    const includeSubcategoriesParam = searchParams.get('includeSubcategories') || 'false'

    const includeChildren = includeChildrenParam === 'true'
    const includeSubcategories = includeSubcategoriesParam === 'true'

    // ── Case 1: Get a single category by slug (with its children if includeChildren) ──
    if (slug) {
      const category = await db.category.findUnique({
        where: { slug },
        include: {
          ...(includeChildren && {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                _count: {
                  select: {
                    products: { where: { isActive: true } },
                  },
                },
              },
            },
          }),
          _count: {
            select: {
              products: { where: { isActive: true } },
            },
          },
        },
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }

      // Transform
      const { _count, ...rest } = category
      const categoryWithChildren = category as typeof category & { children?: Array<{ _count: { products: number }; [k: string]: unknown }> }
      const transformedChildren = includeChildren && categoryWithChildren.children
        ? categoryWithChildren.children.map((child) => {
            const { _count: childCount, ...childRest } = child as typeof child & { _count: { products: number } }
            return {
              ...childRest,
              productCount: childCount.products,
              children: [],
            }
          })
        : []

      return NextResponse.json({
        category: {
          ...rest,
          productCount: _count.products,
          ...(includeChildren && { children: transformedChildren }),
        },
      })
    }

    // ── Case 2: Get subcategories of a specific parent ──
    if (parentId) {
      const subcategories = await db.category.findMany({
        where: {
          parentId,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: {
              products: { where: { isActive: true } },
            },
          },
          ...(includeChildren && {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                _count: {
                  select: {
                    products: { where: { isActive: true } },
                  },
                },
              },
            },
          }),
        },
      })

      const transformed = subcategories.map((cat) => {
        const { _count, ...rest } = cat
        const catWithChildren = cat as typeof cat & { children?: Array<{ _count: { products: number }; [k: string]: unknown }> }
        const transformedChildArr = includeChildren && catWithChildren.children
          ? catWithChildren.children.map((child) => {
              const { _count: childCount, ...childRest } = child as typeof child & { _count: { products: number } }
              return {
                ...childRest,
                productCount: childCount.products,
                children: [],
              }
            })
          : []

        return {
          ...rest,
          productCount: _count.products,
          ...(includeChildren && { children: transformedChildArr }),
        }
      })

      return NextResponse.json({
        categories: transformed,
      })
    }

    // ── Case 3: Default — return parent categories with nested children ──
    const where: Prisma.CategoryWhereInput = {
      isActive: true,
    }

    // By default, only return top-level categories (parentId === null)
    // If includeSubcategories=true, include subcategories in the flat list too
    if (!includeSubcategories) {
      where.parentId = null
    }

    const categories = await db.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        ...(includeChildren && {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              _count: {
                select: {
                  products: { where: { isActive: true } },
                },
              },
            },
          },
        }),
        _count: {
          select: {
            products: { where: { isActive: true } },
          },
        },
      },
    })

    // Transform: flatten _count to productCount, nest children
    const transformedCategories = categories.map((category) => {
      const { _count, ...rest } = category
      const catWithChildren = category as typeof category & { children?: Array<{ _count: { products: number }; [k: string]: unknown }> }

      const transformedChildArr = includeChildren && catWithChildren.children
        ? catWithChildren.children.map((child) => {
            const { _count: childCount, ...childRest } = child as typeof child & { _count: { products: number } }
            return {
              ...childRest,
              productCount: childCount.products,
              children: [],
            }
          })
        : []

      return {
        ...rest,
        productCount: _count.products,
        ...(includeChildren && { children: transformedChildArr }),
      }
    })

    // Merge the 4 extra seed categories (defined in seed-categories) so their
    // buttons appear in the storefront marquee even before they are persisted.
    // Skipped when filtering by slug/parentId or when an explicit subcategory
    // list is requested, to avoid polluting those responses.
    const extraSeedCategories = [
      {
        id: 'seed-antiques-gifts',
        nameAr: 'التحف والهدايا والجداريات',
        nameEn: 'Antiques, Gifts & Wall Decor',
        slug: 'antiques-gifts',
        description: 'تشكيلة فاخرة من التحف والهدايا والجداريات بتصاميم شرقية أصيلة',
        icon: '🎁',
        image: '/products/accessories-wallart-gifts.png',
        sortOrder: 13,
        phase: 'ACTIVE_MVP',
        isActive: true,
        parentId: null,
        productCount: 0,
        children: [],
      },
      {
        id: 'seed-ornamental-plants',
        nameAr: 'نباتات الزينة',
        nameEn: 'Ornamental Plants',
        slug: 'ornamental-plants',
        description: 'تشكيلة رائعة من نباتات الزينة الداخلية والخارجية لتزيين منزلك',
        icon: '🌿',
        image: '/products/ornamental-plants.png',
        sortOrder: 14,
        phase: 'ACTIVE_MVP',
        isActive: true,
        parentId: null,
        productCount: 0,
        children: [],
      },
      {
        id: 'seed-pet-supplies',
        nameAr: 'مستلزمات الحيوانات',
        nameEn: 'Pet Supplies',
        slug: 'pet-supplies',
        description: 'كل ما يحتاجه حيوانك الأليف من طعام وألعاب ومستلزمات عناية',
        icon: '🐾',
        image: '/products/pet-supplies.png',
        sortOrder: 15,
        phase: 'ACTIVE_MVP',
        isActive: true,
        parentId: null,
        productCount: 0,
        children: [],
      },
      {
        id: 'seed-kids-toys',
        nameAr: 'ألعاب الأطفال',
        nameEn: 'Kids Toys',
        slug: 'kids-toys',
        description: 'ألعاب تعليمية وترفيهية آمنة وممتعة لجميع الأعمار',
        icon: '🧸',
        image: '/products/kids-toys.png',
        sortOrder: 16,
        phase: 'ACTIVE_MVP',
        isActive: true,
        parentId: null,
        productCount: 0,
        children: [],
      },
    ]

    const existingSlugs = new Set(transformedCategories.map((c) => c.slug))
    const merged = extraSeedCategories.filter((c) => !existingSlugs.has(c.slug))

    return NextResponse.json({
      categories: [...transformedCategories, ...merged],
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
