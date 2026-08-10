import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmailToUser } from '@/lib/email'
import { requireAuth } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

// Helper to generate order number: NM-YYYYMMDD-XXXX
async function generateOrderNumber(): Promise<string> {
  const now = new Date()
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')

  // Find the count of orders today to generate a sequential number
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const todayOrderCount = await db.order.count({
    where: {
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  })

  const sequence = String(todayOrderCount + 1).padStart(4, '0')
  return `NM-${dateStr}-${sequence}`
}

interface OrderItemInput {
  productId: string
  name?: string
  quantity: number
  price?: number
}

interface AddressInput {
  fullName?: string
  phone?: string
  city?: string
  area?: string
  streetAddress?: string
  notes?: string
}

interface CreateOrderBody {
  userId: string
  items: OrderItemInput[]
  addressId?: string
  address?: AddressInput
  paymentMethod?: string
  notes?: string
  couponCode?: string
  deliveryFee?: number
  discount?: number
}

// GET: Track order by orderNumber OR list orders by userId
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const userId = searchParams.get('userId')
    const countOnly = searchParams.get('countOnly') === 'true'

    // Lightweight count-only endpoint for header stats
    if (userId && countOnly) {
      if (userId !== authUserId) {
        return NextResponse.json(
          { error: 'Forbidden – you can only view your own orders' },
          { status: 403 }
        )
      }
      const count = await db.order.count({ where: { userId } })
      return NextResponse.json({ count })
    }

    // If userId is provided, verify it matches authenticated user
    if (userId) {
      if (userId !== authUserId) {
        return NextResponse.json(
          { error: 'Forbidden – you can only view your own orders' },
          { status: 403 }
        )
      }
      const orders = await db.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                  mainImage: true,
                },
              },
            },
          },
          statusLog: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      const transformedOrders = orders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        discount: Number(order.discount),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          price: Number(item.price),
          total: Number(item.total),
        })),
      }))

      return NextResponse.json({ orders: transformedOrders })
    }

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number or userId is required' },
        { status: 400 }
      )
    }

    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                mainImage: true,
              },
            },
          },
        },
        statusLog: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        address: true,
        shipment: {
          include: {
            carrier: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                code: true,
                trackingUrl: true,
              },
            },
            logs: {
              orderBy: { occurredAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify the authenticated user owns this order
    if (order.userId !== authUserId) {
      return NextResponse.json(
        { error: 'Forbidden – you can only view your own orders' },
        { status: 403 }
      )
    }

    // Convert Decimal fields to numbers
    const transformedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
      })),
      shipment: order.shipment ? {
        ...order.shipment,
        weight: order.shipment.weight ? Number(order.shipment.weight) : null,
        shippingCost: Number(order.shipment.shippingCost),
        codAmount: Number(order.shipment.codAmount),
        logs: order.shipment.logs?.map((log: any) => ({
          ...log,
          latitude: log.latitude ? Number(log.latitude) : null,
          longitude: log.longitude ? Number(log.longitude) : null,
        })),
      } : null,
    }

    return NextResponse.json({ order: transformedOrder })
  } catch (error) {
    console.error('Error tracking order:', error)
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    )
  }
}

// POST: Create a new order
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body: CreateOrderBody = await request.json()
    const { items, addressId, address, paymentMethod, notes, couponCode, deliveryFee: clientDeliveryFee, discount: clientDiscount } = body

    // Use authenticated userId instead of body userId
    const userId = authUserId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Each item must have a valid productId and quantity' },
          { status: 400 }
        )
      }
    }

    // Check user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch all products in the order
    const productIds = items.map((item) => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    })

    // Verify all products exist and are active
    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id))
      const missingIds = productIds.filter((id) => !foundIds.has(id))
      return NextResponse.json(
        { error: `Products not found: ${missingIds.join(', ')}` },
        { status: 404 }
      )
    }

    // ─── Stock Validation ──────────────────────────────────────────────
    const productMap = new Map(products.map((p) => [p.id, p]))
    for (const item of items) {
      const product = productMap.get(item.productId)!
      const availableStock = product.stock - product.reservedStock
      if (availableStock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.nameAr}. Available: ${availableStock}, Requested: ${item.quantity}` },
          { status: 400 }
        )
      }
    }

    // Calculate subtotal and build order items
    let subtotal = 0
    const orderItemsData = items.map((item) => {
      const product = productMap.get(item.productId)!
      const price = Number(product.price)
      const total = price * item.quantity
      subtotal += total

      // Parse images to get the first image for the order item
      let image = product.mainImage || null
      if (!image) {
        try {
          const parsed = JSON.parse(product.images)
          const imgs = Array.isArray(parsed) ? parsed : [parsed]
          image = imgs[0] || null
        } catch {
          // keep null
        }
      }

      return {
        productId: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: product.price,
        quantity: item.quantity,
        total,
        image,
      }
    })

    // ─── Dynamic Delivery Fee from Delivery Zones ──────────────────────
    let deliveryFee = 10 // Default fallback
    const orderCity = address?.city

    // Use client-provided delivery fee if available (calculated from selected zone)
    if (clientDeliveryFee !== undefined && clientDeliveryFee >= 0) {
      deliveryFee = clientDeliveryFee
    } else if (orderCity) {
      // Try to find a matching delivery zone
      const citySearch = orderCity.trim()
      const zone = await db.deliveryZone.findFirst({
        where: {
          isActive: true,
          OR: [
            { city: { equals: citySearch } },
            { nameAr: { equals: citySearch } },
            { nameEn: { equals: citySearch } },
          ],
        },
      })
      if (zone) {
        deliveryFee = Number(zone.fee)
      }
    }
    // Delivery fee is always charged based on the selected zone

    // ─── Discount from coupon ──────────────────────────────────────────
    let discount = 0
    let appliedCouponId: string | null = null

    // Validate coupon if provided
    if (couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      })
      if (coupon && coupon.isActive) {
        const now = new Date()
        if (now >= coupon.startsAt && now <= coupon.expiresAt) {
          if (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) {
            // Check per-user limit
            if (coupon.perUserLimit && userId) {
              const userUsageCount = await db.order.count({
                where: {
                  userId,
                  couponId: coupon.id,
                },
              })
              if (userUsageCount >= coupon.perUserLimit) {
                // User exceeded their per-user limit — skip coupon silently
                console.warn(`[COUPON] User ${userId} exceeded perUserLimit (${coupon.perUserLimit}) for coupon ${coupon.code}`)
              } else {
                let couponDiscount = 0
                if (coupon.type === 'percentage') {
                  couponDiscount = (subtotal * Number(coupon.value)) / 100
                  if (coupon.maxDiscount && couponDiscount > Number(coupon.maxDiscount)) {
                    couponDiscount = Number(coupon.maxDiscount)
                  }
                } else {
                  // Fixed discount - clamp to subtotal so discount doesn't exceed order value
                  couponDiscount = Math.min(Number(coupon.value), subtotal)
                }
                // Check minimum order
                if (!coupon.minOrder || subtotal >= Number(coupon.minOrder)) {
                  discount = couponDiscount
                  appliedCouponId = coupon.id
                  // Increment coupon usage
                  await db.coupon.update({
                    where: { id: coupon.id },
                    data: { usageCount: { increment: 1 } },
                  })
                }
              }
            } else {
              let couponDiscount = 0
              if (coupon.type === 'percentage') {
                couponDiscount = (subtotal * Number(coupon.value)) / 100
                if (coupon.maxDiscount && couponDiscount > Number(coupon.maxDiscount)) {
                  couponDiscount = Number(coupon.maxDiscount)
                }
              } else {
                // Fixed discount - clamp to subtotal so discount doesn't exceed order value
                couponDiscount = Math.min(Number(coupon.value), subtotal)
              }
              // Check minimum order
              if (!coupon.minOrder || subtotal >= Number(coupon.minOrder)) {
                discount = couponDiscount
                appliedCouponId = coupon.id
                // Increment coupon usage
                await db.coupon.update({
                  where: { id: coupon.id },
                  data: { usageCount: { increment: 1 } },
                })
              }
            }
          }
        }
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount)

    // Generate order number
    const orderNumber = await generateOrderNumber()

    // ─── Save or find address ──────────────────────────────────────────
    let savedAddressId = addressId || null
    if (!savedAddressId && address && address.streetAddress && address.city) {
      // Create address for this user if not existing
      const newAddr = await db.address.create({
        data: {
          userId,
          label: 'منزل' , // default label
          address: address.streetAddress,
          city: address.city,
          area: address.area || null,
          notes: address.notes || null,
          isDefault: false,
        },
      })
      savedAddressId = newAddr.id
    }

    // Create order with items and initial status log
    const order = await db.order.create({
      data: {
        userId,
        orderNumber,
        status: 'pending',
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: 'pending',
        subtotal,
        deliveryFee,
        discount,
        total,
        currency: 'LYD',
        notes: notes || null,
        couponId: appliedCouponId,
        addressId: savedAddressId,
        items: {
          create: orderItemsData.map((item) => ({
            productId: item.productId,
            nameAr: item.nameAr,
            nameEn: item.nameEn,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
            image: item.image,
          })),
        },
        statusLog: {
          create: {
            status: 'pending',
            note: 'Order created',
          },
        },
      },
      include: {
        items: true,
        statusLog: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // ─── Create notification for the user ──────────────────────────────
    try {
      await db.notification.create({
        data: {
          userId,
          titleAr: 'تم استلام طلبك',
          titleEn: 'Order Received',
          bodyAr: `طلبك رقم ${orderNumber} تم استلامه بنجاح وسيتم معالجته قريباً`,
          bodyEn: `Your order #${orderNumber} has been received and will be processed soon`,
          type: 'order',
        },
      })
    } catch {
      // Non-critical - don't fail order creation
    }

    // ─── Send order confirmation email ──────────────────────────────
    try {
      sendEmailToUser(userId, 'order_confirmation', {
        orderNumber,
        items: orderItemsData.map((item) => ({
          name: item.nameAr,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        total,
        estimatedDelivery: '3-5 أيام عمل',
        customerName: user.name || 'عميل',
      }).catch((err) => {
        console.error('[Orders] Order confirmation email failed:', err)
      })
    } catch {
      // Non-critical - don't fail order creation
    }

    // ─── Award loyalty points (1 point per 10 LYD) ───────────────────
    try {
      const pointsEarned = Math.floor(subtotal / 10)
      if (pointsEarned > 0) {
        await db.user.update({
          where: { id: userId },
          data: { loyaltyPoints: { increment: pointsEarned } },
        })
        await db.loyaltyTransaction.create({
          data: {
            userId,
            type: 'earn',
            points: pointsEarned,
            orderId: order.id,
            description: `Points earned for order #${orderNumber}`,
          },
        })
      }
    } catch {
      // Non-critical - don't fail order creation
    }

    // Convert Decimal fields in response
    const transformedOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
        total: Number(item.total),
      })),
    }

    return NextResponse.json(
      { success: true, order: transformedOrder },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
