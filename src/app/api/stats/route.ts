import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';
import { serializeDecimal } from '@/lib/serialize';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    // Run independent queries in parallel
    const [
      totalProducts,
      totalOrders,
      totalRevenueResult,
      totalUsers,
      ordersByStatusResult,
      revenueByDayResult,
      topSellingProductsResult,
      lowStockProducts,
      categoryBreakdownResult,
    ] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'paid' },
      }),
      db.user.count(),
      db.$queryRaw<{ status: string; count: bigint }[]>`
        SELECT status, COUNT(*) as count FROM \`Order\` GROUP BY status
      `,
      db.$queryRaw<{ date: string; revenue: number }[]>`
        SELECT strftime('%Y-%m-%d', createdAt / 1000, 'unixepoch') as date, CAST(SUM(total) AS REAL) as revenue
        FROM \`Order\`
        WHERE paymentStatus = 'paid'
        GROUP BY date
        ORDER BY date ASC
        LIMIT 90
      `,
      db.$queryRaw<{
        productId: string;
        nameAr: string;
        nameEn: string;
        mainImage: string | null;
        price: number;
        totalQuantity: bigint;
        totalRevenue: number;
      }[]>`
        SELECT oi.productId, p.nameAr, p.nameEn, p.mainImage, CAST(p.price AS REAL) as price,
          SUM(oi.quantity) as totalQuantity, CAST(SUM(oi.total) AS REAL) as totalRevenue
        FROM OrderItem oi
        JOIN Product p ON p.id = oi.productId
        GROUP BY oi.productId
        ORDER BY totalQuantity DESC
        LIMIT 10
      `,
      db.product.findMany({
        where: { stock: { lt: 5 }, isActive: true },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          sku: true,
          stock: true,
          mainImage: true,
        },
        take: 20,
      }),
      db.$queryRaw<{
        id: string;
        nameAr: string;
        nameEn: string;
        slug: string;
        productCount: bigint;
        revenue: number;
      }[]>`
        SELECT c.id, c.nameAr, c.nameEn, c.slug,
          COUNT(DISTINCT p.id) as productCount,
          COALESCE(CAST(SUM(oi.total) AS REAL), 0) as revenue
        FROM Category c
        LEFT JOIN Product p ON p.categoryId = c.id AND p.isActive = 1
        LEFT JOIN OrderItem oi ON oi.productId = p.id
        WHERE c.isActive = 1
        GROUP BY c.id
        ORDER BY revenue DESC
      `,
    ]);

    // Build ordersByStatus record
    const ordersByStatus: Record<string, number> = {};
    for (const row of ordersByStatusResult) {
      ordersByStatus[row.status] = Number(row.count);
    }

    // Build revenueByDay
    const revenueByDay = revenueByDayResult.map((row) => ({
      date: row.date,
      revenue: Number(row.revenue),
    }));

    // Build topSellingProducts
    const topSellingProducts = topSellingProductsResult.map((row) => ({
      productId: row.productId,
      nameAr: row.nameAr,
      nameEn: row.nameEn,
      mainImage: row.mainImage,
      price: Number(row.price),
      totalQuantity: Number(row.totalQuantity),
      totalRevenue: Number(row.totalRevenue),
    }));

    // Build lowStockProducts (serialize Decimal fields)
    const lowStockProductsData = lowStockProducts.map((p) => ({
      id: p.id,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      sku: p.sku,
      stock: p.stock,
      mainImage: p.mainImage,
    }));

    // Build categoryBreakdown
    const categoryBreakdown = categoryBreakdownResult.map((row) => ({
      id: row.id,
      nameAr: row.nameAr,
      nameEn: row.nameEn,
      slug: row.slug,
      productCount: Number(row.productCount),
      revenue: Number(row.revenue),
    }));

    const result = {
      totalProducts,
      totalOrders,
      totalRevenue: Number(totalRevenueResult._sum.total ?? 0),
      totalUsers,
      ordersByStatus,
      revenueByDay,
      topSellingProducts,
      lowStockProducts: lowStockProductsData,
      categoryBreakdown,
    };

    return NextResponse.json(serializeDecimal(result));
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
