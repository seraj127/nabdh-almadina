import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: Return dashboard statistics ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run independent queries in parallel
    const [
      paidOrders,
      totalOrders,
      totalProducts,
      totalCustomers,
      ordersByStatusRaw,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      // Total revenue from paid orders
      db.order.findMany({
        where: { paymentStatus: 'paid' },
        select: { total: true, createdAt: true },
      }),

      // Total orders count
      db.order.count(),

      // Total products count (including inactive)
      db.product.count(),

      // Total customers count
      db.user.count({
        where: { role: 'customer' },
      }),

      // Orders grouped by status
      db.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Recent 10 orders
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, phone: true },
          },
          items: true,
        },
      }),

      // Low stock products (stock < 5)
      db.product.findMany({
        where: { stock: { lt: 5 }, isActive: true },
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          stock: true,
          mainImage: true,
          sku: true,
        },
        take: 20,
      }),
    ]);

    // Calculate total revenue
    const totalRevenue = paidOrders.reduce((sum, order) => {
      return sum + Number(order.total);
    }, 0);

    // Revenue by day (last 30 days)
    const revenueMap = new Map<string, number>();
    for (const order of paidOrders) {
      if (order.createdAt >= thirtyDaysAgo) {
        const day = order.createdAt.toISOString().split('T')[0];
        revenueMap.set(day, (revenueMap.get(day) || 0) + Number(order.total));
      }
    }
    const revenueByDay = Array.from(revenueMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Format orders by status
    const ordersByStatus = ordersByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    const stats = {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
    };

    return NextResponse.json({
      stats: serializeDecimal(stats),
      revenueByDay: serializeDecimal(revenueByDay),
      ordersByStatus,
      recentOrders: serializeDecimal(recentOrders),
      lowStockProducts: serializeDecimal(lowStockProducts),
    });
  } catch (error) {
    console.error('[ADMIN_DASHBOARD_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
