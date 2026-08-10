import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Admin-only endpoint
  const adminError = await requireAdmin(request)
  if (adminError) return adminError

  try {
    // Total revenue from completed/delivered orders
    const revenueResult = await db.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['delivered', 'completed'] },
      },
    })

    // Order counts by status
    const orderStatusCounts = await db.order.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    // Total users
    const totalUsers = await db.user.count()

    // Total products
    const totalProducts = await db.product.count({
      where: { isActive: true },
    })

    // Recent orders (last 10)
    const recentOrders = await db.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        items: {
          select: { id: true, nameAr: true, nameEn: true, quantity: true, price: true, total: true },
        },
      },
    })

    // Top selling products by order items count
    const topProducts = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    })

    // Get product details for top sellers
    const topProductIds = topProducts.map((p) => p.productId)
    const topProductDetails = await db.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, nameAr: true, nameEn: true, mainImage: true, price: true },
    })

    const topSellingProducts = topProducts.map((tp) => {
      const details = topProductDetails.find((p) => p.id === tp.productId)
      return {
        productId: tp.productId,
        nameAr: details?.nameAr ?? '',
        nameEn: details?.nameEn ?? '',
        mainImage: details?.mainImage ?? null,
        price: details?.price ?? 0,
        totalQuantity: tp._sum.quantity ?? 0,
        totalRevenue: Number(tp._sum.total ?? 0),
      }
    })

    // Revenue by day (last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailyOrders = await db.order.findMany({
      where: {
        status: { in: ['delivered', 'completed'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { total: true, createdAt: true },
    })

    // Group by day
    const revenueByDayMap: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      revenueByDayMap[key] = 0
    }

    dailyOrders.forEach((order) => {
      const d = new Date(order.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (key in revenueByDayMap) {
        revenueByDayMap[key] += Number(order.total)
      }
    })

    const revenueByDay = Object.entries(revenueByDayMap).map(([date, revenue]) => ({
      date,
      revenue,
    }))

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const monthlyOrders = await db.order.findMany({
      where: {
        status: { in: ['delivered', 'completed'] },
        createdAt: { gte: sixMonthsAgo },
      },
      select: { total: true, createdAt: true },
    })

    // Group by month
    const revenueByMonth: Record<string, number> = {}
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      revenueByMonth[key] = 0
    }

    monthlyOrders.forEach((order) => {
      const d = new Date(order.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (key in revenueByMonth) {
        revenueByMonth[key] += Number(order.total)
      }
    })

    // New users this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const newUsersThisMonth = await db.user.count({
      where: { createdAt: { gte: startOfMonth } },
    })

    // Total orders
    const totalOrders = await db.order.count()

    // Format order status counts
    const ordersByStatus: Record<string, number> = {}
    orderStatusCounts.forEach((item) => {
      ordersByStatus[item.status] = item._count.status
    })

    // Low stock products (stock <= 10)
    const lowStockProducts = await db.product.findMany({
      where: {
        stock: { lte: 10 },
        isActive: true,
      },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        sku: true,
        stock: true,
        mainImage: true,
      },
      orderBy: { stock: 'asc' },
      take: 10,
    })

    // Category breakdown
    const categories = await db.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    })

    const categoryRevenue = await db.orderItem.groupBy({
      by: ['productId'],
      _sum: { total: true },
    })

    const productCategories = await db.product.findMany({
      select: { id: true, categoryId: true },
    })

    const categoryBreakdown = categories.map((cat) => {
      const catProducts = productCategories.filter((p) => p.categoryId === cat.id)
      const revenue = catProducts.reduce((sum, p) => {
        const item = categoryRevenue.find((cr) => cr.productId === p.id)
        return sum + Number(item?._sum.total ?? 0)
      }, 0)

      return {
        id: cat.id,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        slug: cat.slug,
        productCount: cat._count.products,
        revenue,
      }
    })

    return NextResponse.json({
      totalRevenue: revenueResult._sum.total ?? 0,
      totalOrders,
      ordersByStatus,
      totalUsers,
      totalProducts,
      recentOrders,
      topSellingProducts,
      revenueByDay,
      revenueByMonth,
      newUsersThisMonth,
      lowStockProducts,
      categoryBreakdown,
    })
  } catch (error) {
    console.error('[ADMIN_STATS_GET]', error)
    return NextResponse.json(
      { error: 'فشل في تحميل الإحصائيات' },
      { status: 500 }
    )
  }
}
