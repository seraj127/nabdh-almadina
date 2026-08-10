import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

// POST /api/admin/seed - Seed sample data for testing
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;
    const users = await db.user.findMany({ select: { id: true, role: true } })
    const products = await db.product.findMany({ 
      take: 20, 
      select: { id: true, price: true, nameAr: true, nameEn: true, mainImage: true } 
    })
    const addresses = await db.address.findMany({ select: { id: true, userId: true } })

    if (users.length === 0 || products.length === 0) {
      return NextResponse.json({ error: 'No users or products found' }, { status: 400 })
    }

    const customers = users.filter(u => u.role === 'customer' || u.role === 'CUSTOMER')
    const adminUser = users.find(u => u.role === 'admin' || u.role === 'ADMIN')
    const customerIds = customers.length > 0 ? customers.map(c => c.id) : [users[0].id]

    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    const paymentMethods = ['cod', 'card']

    const createdOrders: any[] = []
    const createdLogs: any[] = []

    // Create 15 sample orders
    for (let i = 0; i < 15; i++) {
      const customerId = customerIds[i % customerIds.length]
      const status = statuses[i % statuses.length]
      const paymentMethod = paymentMethods[i % paymentMethods.length]
      const orderNumber = `ORD-${String(1000 + i).padStart(6, '0')}`
      
      const itemCount = Math.min(1 + Math.floor(Math.random() * 4), products.length)
      const orderProducts = products.slice(i % products.length, (i % products.length) + itemCount)
      
      if (orderProducts.length === 0) continue

      let subtotal = 0
      const orderItems = orderProducts.map((product) => {
        const quantity = 1 + Math.floor(Math.random() * 3)
        const price = Number(product.price)
        const total = price * quantity
        subtotal += total
        return {
          productId: product.id,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          price: price,
          quantity,
          total,
          image: product.mainImage,
        }
      })

      const deliveryFee = subtotal > 200 ? 0 : 15
      const discount = i % 3 === 0 ? Math.round(subtotal * 0.1) : 0
      const total = subtotal + deliveryFee - discount
      const fraudScore = i === 7 ? 65 : i === 12 ? 35 : Math.floor(Math.random() * 20)

      const customerAddress = addresses.find(a => a.userId === customerId)
      
      const order = await db.order.create({
        data: {
          userId: customerId,
          orderNumber,
          status,
          paymentMethod,
          paymentStatus: status === 'delivered' ? 'paid' : status === 'cancelled' ? 'refunded' : 'pending',
          subtotal,
          deliveryFee,
          discount,
          total,
          currency: 'LYD',
          fraudScore,
          fraudFlagged: fraudScore >= 50,
          addressId: customerAddress?.id || null,
          items: {
            create: orderItems,
          },
        },
      })

      createdOrders.push(order)

      const actions = ['create_order', 'update_status', 'view_order', 'cancel_order', 'ship_order']
      const action = status === 'cancelled' ? 'cancel_order' : status === 'shipped' ? 'ship_order' : actions[i % actions.length]
      
      const log = await db.auditLog.create({
        data: {
          userId: adminUser?.id || customerId,
          action,
          entity: 'Order',
          entityId: order.id,
          details: `Order ${orderNumber} - ${status} - ${total} LYD`,
          ip: `192.168.1.${100 + i}`,
        },
      })
      createdLogs.push(log)
    }

    // Create additional audit logs
    const logActions = [
      { action: 'create_product', entity: 'Product', details: 'تم إنشاء منتج جديد' },
      { action: 'update_product', entity: 'Product', details: 'تم تحديث بيانات المنتج' },
      { action: 'delete_product', entity: 'Product', details: 'تم حذف منتج' },
      { action: 'update_user', entity: 'User', details: 'تم تحديث بيانات المستخدم' },
      { action: 'create_coupon', entity: 'Coupon', details: 'تم إنشاء كوبون خصم جديد' },
      { action: 'toggle_feature', entity: 'FeatureFlag', details: 'تم تفعيل ميزة تجريبية' },
      { action: 'login', entity: 'Auth', details: 'تسجيل دخول ناجح' },
      { action: 'update_settings', entity: 'SystemSetting', details: 'تم تحديث إعدادات النظام' },
      { action: 'view_dashboard', entity: 'Dashboard', details: 'عرض لوحة التحكم' },
      { action: 'export_data', entity: 'Report', details: 'تصدير تقرير المبيعات' },
    ]

    for (let i = 0; i < logActions.length; i++) {
      const la = logActions[i]
      const log = await db.auditLog.create({
        data: {
          userId: adminUser?.id || customerIds[0],
          action: la.action,
          entity: la.entity,
          entityId: i < products.length ? products[i].id : null,
          details: la.details,
          ip: `10.0.0.${50 + i}`,
          createdAt: new Date(Date.now() - (i * 3600000)),
        },
      })
      createdLogs.push(log)
    }

    // Create reviews
    const existingReviews = await db.review.count()
    if (existingReviews === 0) {
      const reviewData = [
        { rating: 5, title: 'منتج ممتاز', comment: 'جودة عالية جداً وتوصيل سريع', isVerified: true },
        { rating: 4, title: 'جيد جداً', comment: 'المنتج جيد لكن التغليف يحتاج تحسين', isVerified: true },
        { rating: 3, title: 'مقبول', comment: 'المنتج عادي مقارنة بالسعر', isVerified: true },
        { rating: 5, title: 'رائع', comment: 'أنصح به بشدة', isVerified: true },
        { rating: 4, title: 'جيد', comment: 'تجربة ممتعة', isVerified: true },
        { rating: 2, title: 'سيء', comment: 'المنتج لا يتطابق مع الصورة', isVerified: false },
        { rating: 5, title: 'أفضل شراء', comment: 'سأشتري مرة أخرى', isVerified: true },
        { rating: 4, title: 'ممتع', comment: 'تجربة جيدة', isVerified: false },
      ]

      for (let i = 0; i < Math.min(reviewData.length, products.length, customerIds.length); i++) {
        await db.review.create({
          data: {
            productId: products[i].id,
            userId: customerIds[i % customerIds.length],
            rating: reviewData[i].rating,
            title: reviewData[i].title,
            comment: reviewData[i].comment,
            isVerified: reviewData[i].isVerified,
            isActive: true,
          },
        })
      }
    }

    // Update product ratings
    const productReviewStats = await db.review.groupBy({
      by: ['productId'],
      _avg: { rating: true },
      _count: { id: true },
      where: { isActive: true },
    })

    for (const stat of productReviewStats) {
      await db.product.update({
        where: { id: stat.productId },
        data: {
          rating: stat._avg.rating ?? 0,
          reviewCount: stat._count.id,
        },
      })
    }

    // Create wallet and loyalty transactions
    const transactionTypes = ['deposit', 'withdrawal', 'refund', 'cashback', 'adjustment']
    const loyaltyTypes = ['earn', 'redeem', 'expire', 'bonus']
    
    for (const customerId of customerIds.slice(0, 3)) {
      for (let i = 0; i < 3; i++) {
        await db.walletTransaction.create({
          data: {
            userId: customerId,
            type: transactionTypes[i % transactionTypes.length] as 'deposit',
            amount: i === 0 ? 100 : i === 1 ? -30 : 15,
            status: 'completed',
            description: `Transaction ${i + 1}`,
          },
        })
        await db.loyaltyTransaction.create({
          data: {
            userId: customerId,
            type: loyaltyTypes[i % loyaltyTypes.length] as 'earn',
            points: i === 0 ? 50 : i === 1 ? -20 : 10,
          },
        })
      }
    }

    // Create vendors if none exist
    const existingVendors = await db.vendor.count()
    if (existingVendors === 0) {
      const vendorData = [
        { nameAr: 'متجر الأناقة', nameEn: 'Elegance Store', type: 'RETAILER', commission: 10, phone: '+218911111111', isVerified: true, rating: 4.5, totalSales: 15000 },
        { nameAr: 'العلامة الرسمية', nameEn: 'Official Brand', type: 'BRAND_OFFICIAL', commission: 5, phone: '+218922222222', isVerified: true, rating: 4.8, totalSales: 45000 },
        { nameAr: 'حرفية محلية', nameEn: 'Local Artisan', type: 'LOCAL_ARTISAN', commission: 15, phone: '+218933333333', isVerified: false, rating: 3.9, totalSales: 5000 },
      ]

      for (const vd of vendorData) {
        await db.vendor.create({
          data: {
            nameAr: vd.nameAr,
            nameEn: vd.nameEn,
            type: vd.type,
            commission: vd.commission,
            phone: vd.phone,
            isVerified: vd.isVerified,
            rating: vd.rating,
            totalSales: vd.totalSales,
            isActive: true,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم ملء قاعدة البيانات بنجاح',
      created: {
        orders: createdOrders.length,
        auditLogs: createdLogs.length,
        reviews: existingReviews === 0 ? 8 : 0,
        vendors: existingVendors === 0 ? 3 : 0,
      },
    })
  } catch (error) {
    console.error('[ADMIN_SEED_POST]', error)
    return NextResponse.json(
      { error: 'فشل في ملء قاعدة البيانات', details: String(error) },
      { status: 500 }
    )
  }
}
