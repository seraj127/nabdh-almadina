import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';
import { verifySessionToken } from '@/lib/jwt-session';

export const dynamic = "force-dynamic";

async function getAuthUserId(request: NextRequest): Promise<string | undefined> {
  const headerId = request.headers.get('x-user-id');
  if (headerId) return headerId;
  const token = request.cookies.get('admin_session')?.value;
  if (token) {
    const payload = await verifySessionToken(token);
    if (payload) return payload.userId;
  }
  return undefined;
}

const VALID_TYPES = ['in', 'out', 'reservation', 'release', 'adjustment', 'return'];

// ─── GET: List inventory movements with stats ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Filter by movement type
    if (type) {
      where.type = type;
    }

    // Search by product name or SKU
    if (search) {
      where.product = {
        OR: [
          { nameAr: { contains: search } },
          { nameEn: { contains: search } },
          { sku: { contains: search } },
        ],
      };
    }

    const [movements, total] = await Promise.all([
      db.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        include: {
          product: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              sku: true,
              stock: true,
              price: true,
              mainImage: true,
            },
          },
        },
      }),
      db.inventoryMovement.count({ where }),
    ]);

    // Summary stats
    const [
      totalProducts,
      lowStockCount,
      outOfStockCount,
      movementsToday,
      totalStockValue,
    ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.product.count({ where: { stock: { lte: 5, gt: 0 }, isActive: true } }),
      db.product.count({ where: { stock: 0, isActive: true } }),
      db.inventoryMovement.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.product.aggregate({
        _sum: { price: true },
        where: { isActive: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      serializeDecimal({
        movements,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        summary: {
          totalProducts,
          lowStockCount,
          outOfStockCount,
          movementsToday,
          totalStockValue: totalStockValue._sum.price || 0,
        },
      })
    );
  } catch (error) {
    console.error('[ADMIN_INVENTORY_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// ─── POST: Create inventory movement ───
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { productId, type, quantity, reference, note } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    // Verify product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create movement and update product stock in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the movement record
      const movement = await tx.inventoryMovement.create({
        data: {
          productId,
          type,
          quantity,
          reference: reference || null,
          note: note || null,
          createdBy: await getAuthUserId(request),
        },
        include: {
          product: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              sku: true,
              stock: true,
              price: true,
            },
          },
        },
      });

      // Update product stock based on movement type
      let stockChange = 0;
      switch (type) {
        case 'in':
        case 'return':
        case 'release':
          stockChange = quantity;
          break;
        case 'out':
        case 'reservation':
          stockChange = -quantity;
          break;
        case 'adjustment':
          // For adjustment, quantity is the absolute change
          stockChange = quantity; // positive = increase
          break;
      }

      const newStock = Math.max(0, product.stock + stockChange);
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
          reservedStock: type === 'reservation'
            ? (product.reservedStock || 0) + quantity
            : type === 'release'
              ? Math.max(0, (product.reservedStock || 0) - quantity)
              : product.reservedStock,
        },
      });

      return movement;
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: await getAuthUserId(request),
        action: 'CREATE',
        entity: 'InventoryMovement',
        entityId: result.id,
        details: `Inventory ${type}: ${quantity} units for product ${product.nameAr} (${product.sku})`,
      },
    });

    return NextResponse.json(serializeDecimal(result), { status: 201 });
  } catch (error) {
    console.error('[ADMIN_INVENTORY_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create inventory movement' },
      { status: 500 }
    );
  }
}
