import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: List all products (including inactive) with pagination, search, category filter ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const isActiveFilter = searchParams.get('isActive') || 'all'; // all, true, false

    const where: Record<string, unknown> = {};

    // Search by name (Arabic or English) or SKU
    if (search) {
      where.OR = [
        { nameAr: { contains: search } },
        { nameEn: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by active status
    if (isActiveFilter === 'true') {
      where.isActive = true;
    } else if (isActiveFilter === 'false') {
      where.isActive = false;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products: serializeDecimal(products),
      total,
    });
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// ─── POST: Create new product ───
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();

    // Generate SKU if not provided
    if (!body.sku) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      body.sku = `PRD-${randomNum}`;
    }

    // Ensure SKU is unique
    const existingSku = await db.product.findUnique({ where: { sku: body.sku } });
    if (existingSku) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      body.sku = `PRD-${randomNum}`;
    }

    // Parse images to JSON string if array provided
    if (Array.isArray(body.images)) {
      body.images = JSON.stringify(body.images);
    }

    // Parse badges to JSON string if array provided
    if (Array.isArray(body.badges)) {
      body.badges = JSON.stringify(body.badges);
    }

    const product = await db.product.create({
      data: {
        categoryId: body.categoryId,
        vendorId: body.vendorId || null,
        nameAr: body.nameAr,
        nameEn: body.nameEn,
        descriptionAr: body.descriptionAr || null,
        descriptionEn: body.descriptionEn || null,
        sku: body.sku,
        price: body.price,
        comparePrice: body.comparePrice || null,
        costPrice: body.costPrice || null,
        images: body.images || '[]',
        mainImage: body.mainImage || null,
        video: body.video || null,
        stock: body.stock ?? 0,
        reservedStock: body.reservedStock ?? 0,
        weight: body.weight || null,
        dimensions: body.dimensions || null,
        attributes: body.attributes || null,
        badges: body.badges || null,
        rating: body.rating ?? 0,
        reviewCount: body.reviewCount ?? 0,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
      },
      include: { category: true },
    });

    return NextResponse.json(serializeDecimal(product), { status: 201 });
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update product ───
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Build update data - only update provided fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'categoryId', 'vendorId', 'nameAr', 'nameEn', 'descriptionAr', 'descriptionEn',
      'sku', 'price', 'comparePrice', 'costPrice', 'mainImage', 'video',
      'stock', 'reservedStock', 'weight', 'dimensions', 'attributes',
      'rating', 'reviewCount', 'isActive', 'isFeatured',
    ];

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updateData[field] = fields[field];
      }
    }

    // Handle images separately (convert array to JSON string)
    if (fields.images !== undefined) {
      updateData.images = Array.isArray(fields.images)
        ? JSON.stringify(fields.images)
        : fields.images;
    }

    // Handle badges separately (convert array to JSON string)
    if (fields.badges !== undefined) {
      updateData.badges = Array.isArray(fields.badges)
        ? JSON.stringify(fields.badges)
        : fields.badges;
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json(serializeDecimal(product));
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete product ───
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
