import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/admin/seed-categories — Seed 4 new product categories
export async function GET() {
  try {
    // Get the max sortOrder among existing categories to determine next sortOrder
    const maxSortCategory = await db.category.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })
    const nextSortOrder = (maxSortCategory?.sortOrder ?? 0) + 1

    // Define the 4 new categories with the requested specifications
    const newCategories = [
      {
        nameAr: 'التحف والهدايا والجداريات',
        nameEn: 'Antiques, Gifts & Wall Decor',
        slug: 'antiques-gifts',
        description: 'تشكيلة فاخرة من التحف والهدايا والجداريات بتصاميم شرقية أصيلة',
        icon: '🎁',
        image: '/products/accessories-wallart-gifts.png',
        sortOrder: nextSortOrder,
        phase: '1',
        isActive: true,
      },
      {
        nameAr: 'نباتات الزينة',
        nameEn: 'Ornamental Plants',
        slug: 'ornamental-plants',
        description: 'تشكيلة رائعة من نباتات الزينة الداخلية والخارجية لتزيين منزلك',
        icon: '🌿',
        image: '/products/ornamental-plants.png',
        sortOrder: nextSortOrder + 1,
        phase: '1',
        isActive: true,
      },
      {
        nameAr: 'مستلزمات الحيوانات',
        nameEn: 'Pet Supplies',
        slug: 'pet-supplies',
        description: 'كل ما يحتاجه حيوانك الأليف من طعام وألعاب ومستلزمات عناية',
        icon: '🐾',
        image: '/products/pet-supplies.png',
        sortOrder: nextSortOrder + 2,
        phase: '1',
        isActive: true,
      },
      {
        nameAr: 'ألعاب الأطفال',
        nameEn: 'Kids Toys',
        slug: 'kids-toys',
        description: 'ألعاب تعليمية وترفيهية آمنة وممتعة لجميع الأعمار',
        icon: '🧸',
        image: '/products/kids-toys.png',
        sortOrder: nextSortOrder + 3,
        phase: '1',
        isActive: true,
      },
    ]

    const results: { slug: string; action: string; id?: string }[] = []

    for (const catData of newCategories) {
      // Check by slug — also check for the old slug "antiques-gifts-wallart"
      const slugVariants = [catData.slug]
      if (catData.slug === 'antiques-gifts') {
        slugVariants.push('antiques-gifts-wallart')
      }

      const existing = await db.category.findFirst({
        where: {
          slug: { in: slugVariants },
        },
      })

      if (existing) {
        // Update the existing category to match the new specs
        const updated = await db.category.update({
          where: { id: existing.id },
          data: {
            nameAr: catData.nameAr,
            nameEn: catData.nameEn,
            slug: catData.slug,
            description: catData.description,
            icon: catData.icon,
            phase: catData.phase,
            isActive: catData.isActive,
          },
        })
        results.push({ slug: catData.slug, action: 'updated', id: updated.id })
      } else {
        // Create new category
        const created = await db.category.create({
          data: catData,
        })
        results.push({ slug: catData.slug, action: 'created', id: created.id })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Categories seeded successfully',
      results,
    })
  } catch (error) {
    console.error('[SEED_CATEGORIES_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to seed categories', details: String(error) },
      { status: 500 }
    )
  }
}
