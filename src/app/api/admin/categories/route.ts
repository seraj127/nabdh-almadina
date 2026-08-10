import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// GET /api/admin/categories — List all categories (including inactive)
// Query params:
//   all=true — include inactive
//   parentId=<id> — get subcategories of a specific parent
//   parentsOnly=true — get only parent categories (parentId = null)
//   tree=true — include children for each parent
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    const parentId = searchParams.get('parentId');
    const parentsOnly = searchParams.get('parentsOnly') === 'true';
    const tree = searchParams.get('tree') === 'true';

    const where: Record<string, unknown> = includeInactive ? {} : { isActive: true };

    // Filter by parentId if specified
    if (parentId) {
      where.parentId = parentId;
    } else if (parentsOnly) {
      where.parentId = null;
    }

    const categories = await db.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
            children: true,
          },
        },
        ...(tree ? {
          children: {
            orderBy: { sortOrder: 'asc' },
            include: {
              _count: {
                select: {
                  products: {
                    where: { isActive: true },
                  },
                },
              },
            },
          },
        } : {}),
        parent: {
          select: { id: true, nameAr: true, nameEn: true, slug: true, icon: true },
        },
      },
    });

    const transformed = categories.map((cat) => {
      const { _count, ...rest } = cat;
      const result: Record<string, unknown> = {
        ...rest,
        productCount: _count.products,
        childrenCount: _count.children,
      };
      if ('children' in cat && Array.isArray((cat as Record<string, unknown>).children)) {
        result.children = ((cat as Record<string, unknown>).children as Array<Record<string, unknown>>).map((child: Record<string, unknown>) => {
          const childCount = (child as { _count?: { products?: number } })._count;
          const { _count: _, ...childRest } = child as { _count?: unknown };
          return { ...childRest, productCount: childCount?.products ?? 0 };
        });
      }
      return result;
    });

    return NextResponse.json({ categories: serializeDecimal(transformed) });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories — Create a new category (or subcategory)
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      nameAr,
      nameEn,
      slug,
      description,
      icon,
      image,
      sortOrder,
      phase,
      attributes,
      isActive,
      parentId,
    } = body;

    if (!nameAr || !nameEn || !slug) {
      return NextResponse.json(
        { error: 'nameAr, nameEn, and slug are required' },
        { status: 400 }
      );
    }

    // If parentId provided, validate it exists
    if (parentId) {
      const parentExists = await db.category.findUnique({ where: { id: parentId } });
      if (!parentExists) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate slug
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'Category slug already exists' },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        nameAr,
        nameEn,
        slug,
        description: description || null,
        icon: icon || null,
        image: image || null,
        sortOrder: sortOrder ?? 0,
        phase: phase || 'ACTIVE_MVP',
        attributes: attributes || null,
        isActive: isActive ?? true,
        parentId: parentId || null,
      },
      include: {
        parent: {
          select: { id: true, nameAr: true, nameEn: true, slug: true, icon: true },
        },
      },
    });

    return NextResponse.json(
      { category: serializeDecimal(category) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/categories — Update a category
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // If changing parentId, prevent making a category its own parent or creating circular refs
    if (data.parentId !== undefined) {
      // Setting parentId to null (making it a parent) is always ok
      if (data.parentId !== null) {
        // Prevent setting self as parent
        if (data.parentId === id) {
          return NextResponse.json(
            { error: 'A category cannot be its own parent' },
            { status: 400 }
          );
        }
        // Prevent circular reference — check if the new parent is a descendant
        const isCircular = await checkCircularRef(id, data.parentId);
        if (isCircular) {
          return NextResponse.json(
            { error: 'Circular reference detected — cannot set a descendant as parent' },
            { status: 400 }
          );
        }
      }
    }

    // Check slug uniqueness if changing
    if (data.slug) {
      const existing = await db.category.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Category slug already exists' },
          { status: 409 }
        );
      }
    }

    const category = await db.category.update({
      where: { id },
      data,
      include: {
        parent: {
          select: { id: true, nameAr: true, nameEn: true, slug: true, icon: true },
        },
      },
    });

    return NextResponse.json({ category: serializeDecimal(category) });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories — Delete a category
// Query params:
//   id — category ID to delete
//   reassignTo — category ID to reassign products to (optional)
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reassignTo = searchParams.get('reassignTo');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category has subcategories
    const childrenCount = await db.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      // Reassign children to grandparent or make them root categories
      await db.category.updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });
    }

    // Check if category has products
    const productCount = await db.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      if (reassignTo) {
        // Validate reassign target exists
        const targetExists = await db.category.findUnique({ where: { id: reassignTo } });
        if (!targetExists) {
          return NextResponse.json(
            { error: 'Reassignment target category not found' },
            { status: 400 }
          );
        }
        // Reassign products to the target category
        await db.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: reassignTo },
        });
        // Now safe to delete
        await db.category.delete({ where: { id } });
        return NextResponse.json({
          success: true,
          reassignedProducts: productCount,
          reassignedTo: reassignTo,
        });
      } else {
        // Soft delete — just deactivate
        const category = await db.category.update({
          where: { id },
          data: { isActive: false },
        });
        return NextResponse.json({
          category: serializeDecimal(category),
          softDeleted: true,
          message: `Category has ${productCount} products. Deactivated instead of deleting.`,
        });
      }
    }

    await db.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

// Helper: Check circular reference — does `potentialAncestorId` descend from `categoryId`?
async function checkCircularRef(categoryId: string, potentialAncestorId: string): Promise<boolean> {
  let currentId: string | null = potentialAncestorId;
  const visited = new Set<string>();

  while (currentId) {
    if (currentId === categoryId) return true;
    if (visited.has(currentId)) return false; // avoid infinite loop
    visited.add(currentId);

    const cat = await db.category.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });
    currentId = cat?.parentId ?? null;
  }

  return false;
}
