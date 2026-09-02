import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendPushNotification } from '@/lib/push-notifications'
import { sendNotificationEmail, notificationTypeToEmailTemplate, sendEmailToUser } from '@/lib/email'
import { requireAuth, requireAdmin } from '@/lib/auth-utils'

export const dynamic = "force-dynamic";

// GET: Fetch notifications for a user (with per-user read status)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const userId = authUserId
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const skip = (page - 1) * limit

    // Fetch notifications where userId matches OR userId is null (broadcast)
    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: {
          OR: [{ userId }, { userId: null }],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reads: {
            where: { userId },
            select: { id: true },
          },
        },
      }),
      db.notification.count({
        where: {
          OR: [{ userId }, { userId: null }],
        },
      }),
      // Efficiently count total unread using single query (replaces old 2-query approach)
      db.notification.count({
        where: {
          OR: [{ userId }, { userId: null }],
          reads: { none: { userId } },
        },
      }),
    ])

    // Map notifications to include isRead based on per-user read status
    const mappedNotifications = notifications.map(n => ({
      id: n.id,
      userId: n.userId,
      titleAr: n.titleAr,
      titleEn: n.titleEn,
      bodyAr: n.bodyAr,
      bodyEn: n.bodyEn,
      type: n.type,
      isRead: n.reads.length > 0,
      createdAt: n.createdAt,
    }))

    return NextResponse.json({
      notifications: mappedNotifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST: Mark notifications as read (per-user)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const body = await request.json()
    const { notificationIds, markAll } = body as {
      notificationIds?: string[]
      markAll?: boolean
    }

    const userId = authUserId

    if (markAll) {
      // Get all notification IDs visible to this user
      const allNotifs = await db.notification.findMany({
        where: {
          OR: [{ userId }, { userId: null }],
        },
        select: { id: true },
      })
      const allIds = allNotifs.map(n => n.id)

      // Find which are already read
      const alreadyRead = await db.notificationReadStatus.findMany({
        where: {
          userId,
          notificationId: { in: allIds },
        },
        select: { notificationId: true },
      })
      const alreadyReadSet = new Set(alreadyRead.map(r => r.notificationId))

      // Insert read status for unread notifications only
      const toInsert = allIds
        .filter(id => !alreadyReadSet.has(id))
        .map(id => ({ userId, notificationId: id }))

      if (toInsert.length > 0) {
        await Promise.all(
          toInsert.map((d) =>
            db.notificationReadStatus.upsert({
              where: { userId_notificationId: { userId: d.userId, notificationId: d.notificationId } },
              update: {},
              create: d,
            })
          )
        );
      }

      return NextResponse.json({
        success: true,
        markedCount: toInsert.length,
        message: 'All notifications marked as read',
      })
    }

    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark only the specified notifications as read for this user
      const data = notificationIds.map(id => ({ userId, notificationId: id }))
      await Promise.all(
        data.map((d) =>
          db.notificationReadStatus.upsert({
            where: { userId_notificationId: { userId: d.userId, notificationId: d.notificationId } },
            update: {},
            create: d,
          })
        )
      );

      return NextResponse.json({
        success: true,
        markedCount: data.length,
        message: `${data.length} notification(s) marked as read`,
      })
    }

    return NextResponse.json(
      { error: 'Provide either notificationIds array or markAll: true' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}

// PUT: Create a new notification
export async function PUT(request: NextRequest) {
  try {
    // Creating notifications must be restricted to admins. Restricting this
    // endpoint prevents any authenticated user from sending notifications to
    // arbitrary users (they only need to forge a body.userId).
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json()
    const { userId, titleAr, titleEn, bodyAr, bodyEn, type } = body as {
      userId?: string
      titleAr?: string
      titleEn?: string
      bodyAr?: string
      bodyEn?: string
      type?: string
    }

    // Validate required fields
    if (!titleAr || !titleEn || !bodyAr || !bodyEn) {
      return NextResponse.json(
        { error: 'titleAr, titleEn, bodyAr, and bodyEn are required' },
        { status: 400 }
      )
    }

    // Validate type if provided
    const validTypes = ['info', 'order', 'promo', 'system', 'reward', 'cart']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const notification = await db.notification.create({
      data: {
        userId: userId || null,
        titleAr,
        titleEn,
        bodyAr,
        bodyEn,
        type: type || 'info',
      },
    })

    // Send push notification to user's devices (fire-and-forget)
    if (userId) {
      sendPushNotification(userId, {
        titleAr,
        titleEn,
        bodyAr,
        bodyEn,
        data: {
          notificationId: notification.id,
          type: type || 'info',
        },
      }).catch((err) => {
        console.error('[Notifications] Push notification failed:', err)
      })

      // Send email notification if the type maps to an email template (fire-and-forget)
      const emailTemplate = notificationTypeToEmailTemplate(type || 'info')
      if (emailTemplate) {
        const emailData: Record<string, any> = {
          customerName: userId,
        }

        if (type === 'order' || type === 'order_shipped' || type === 'order_delivered') {
          const orderMatch = bodyAr?.match(/#?(NM-\d{8}-\d{4})/)
          if (orderMatch) {
            emailData.orderNumber = orderMatch[1]
          }
        }

        if (type === 'payment') {
          emailData.customerName = userId
        }

        sendEmailToUser(userId, emailTemplate, emailData).catch((err) => {
          console.error('[Notifications] Email notification failed:', err)
        })
      }
    }

    return NextResponse.json(
      { success: true, notification },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
