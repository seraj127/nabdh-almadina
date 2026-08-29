import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';
import { sendPushNotification, sendMulticastPush } from '@/lib/push-notifications';
import { notificationTypeToEmailTemplate, sendEmailToUser } from '@/lib/email';

export const dynamic = "force-dynamic";

// ─── GET: List notifications with search/filter/stats ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const readFilter = searchParams.get('isRead') || '';
    const userId = searchParams.get('userId') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Search by title/body
    if (search) {
      where.OR = [
        { titleAr: { contains: search } },
        { titleEn: { contains: search } },
        { bodyAr: { contains: search } },
        { bodyEn: { contains: search } },
      ];
    }

    // Filter by type
    if (type) {
      where.type = type;
    }

    // Filter by read status — use NotificationReadStatus for per-user tracking
    // For admin, we count a notification as "unread" if it has zero read records
    if (readFilter === 'true') {
      where.reads = { some: {} };
    } else if (readFilter === 'false') {
      where.reads = { none: {} };
    }

    // Filter by userId
    if (userId) {
      where.userId = userId;
    }

    // Fetch notifications
    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      db.notification.count({ where }),
    ]);

    // Get summary stats
    const [
      totalNotifications,
      unreadCount,
      broadcastCount,
      sentTodayCount,
      typeBreakdown,
    ] = await Promise.all([
      db.notification.count(),
      db.notification.count({ where: { reads: { none: {} } } }),
      db.notification.count({ where: { userId: null } }),
      db.notification.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.notification.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
    ]);

    const byType: Record<string, number> = {};
    for (const item of typeBreakdown) {
      byType[item.type] = item._count.type;
    }

    const totalPages = Math.ceil(total / limit);

    // If userId filter, fetch user info
    let user: { id: string; name: string | null; phone: string } | null = null;
    if (userId) {
      user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, phone: true },
      });
    }

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      summary: {
        total: totalNotifications,
        unread: unreadCount,
        broadcast: broadcastCount,
        sentToday: sentTodayCount,
        byType,
      },
      user,
    });
  } catch (error) {
    console.error('[ADMIN_NOTIFICATIONS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// ─── POST: Create notification ───
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.titleAr) {
      return NextResponse.json(
        { error: 'Arabic title is required' },
        { status: 400 }
      );
    }
    if (!body.titleEn) {
      return NextResponse.json(
        { error: 'English title is required' },
        { status: 400 }
      );
    }
    if (!body.bodyAr) {
      return NextResponse.json(
        { error: 'Arabic body is required' },
        { status: 400 }
      );
    }
    if (!body.bodyEn) {
      return NextResponse.json(
        { error: 'English body is required' },
        { status: 400 }
      );
    }

    // If userId provided, verify user exists
    if (body.userId) {
      const user = await db.user.findUnique({ where: { id: body.userId } });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    const notification = await db.notification.create({
      data: {
        titleAr: body.titleAr,
        titleEn: body.titleEn,
        bodyAr: body.bodyAr,
        bodyEn: body.bodyEn,
        type: body.type || 'info',
        userId: body.userId || null,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Notification',
        entityId: notification.id,
        details: body.userId
          ? `Created notification for user: ${body.userId}`
          : 'Created broadcast notification',
      },
    });

    // Send push notification & email (fire-and-forget)
    const notifPayload = {
      titleAr: body.titleAr,
      titleEn: body.titleEn,
      bodyAr: body.bodyAr,
      bodyEn: body.bodyEn,
      data: {
        notificationId: notification.id,
        type: body.type || 'info',
      },
    };

    if (body.userId) {
      // Targeted notification to specific user
      sendPushNotification(body.userId, notifPayload).catch((err) => {
        console.error('[ADMIN_NOTIF] Push notification failed:', err);
      });

      const emailTemplate = notificationTypeToEmailTemplate(body.type || 'info');
      if (emailTemplate) {
        sendEmailToUser(body.userId, emailTemplate, {
          customerName: body.userId,
        }).catch((err) => {
          console.error('[ADMIN_NOTIF] Email notification failed:', err);
        });
      }
    } else {
      // Broadcast notification — send to all users with push tokens
      const allUserIds = await db.pushToken.findMany({
        where: { isActive: true },
        select: { userId: true },
        distinct: ['userId'],
      });
      if (allUserIds.length > 0) {
        sendMulticastPush(
          allUserIds.map(u => u.userId),
          notifPayload
        ).catch((err) => {
          console.error('[ADMIN_NOTIF] Multicast push failed:', err);
        });
      }
    }

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_NOTIFICATIONS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update notification / bulk mark-as-read ───
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();

    // Bulk mark all as read (for admin — mark for all users)
    if (body.markAllRead) {
      // Get all notification IDs that have no read records
      const unreadNotifs = await db.notification.findMany({
        where: { reads: { none: {} } },
        select: { id: true },
      });

      // Create read status for admin user or use a generic approach
      // For admin "mark all read", we create read records for the requesting admin
      const adminId = body.adminUserId || 'admin';
      const readData = unreadNotifs.map(n => ({ userId: adminId, notificationId: n.id }));

      if (readData.length > 0) {
        await Promise.all(
          readData.map((d) =>
            db.notificationReadStatus.upsert({
              where: { userId_notificationId: { userId: d.userId, notificationId: d.notificationId } },
              update: {},
              create: d,
            })
          )
        );
      }

      // Create audit log
      await db.auditLog.create({
        data: {
          action: 'BULK_UPDATE',
          entity: 'Notification',
          details: `Marked ${readData.length} notifications as read`,
        },
      });

      return NextResponse.json({
        success: true,
        count: readData.length,
        message: `${readData.length} notifications marked as read`,
      });
    }

    // Single notification update
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Check notification exists
    const existing = await db.notification.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const allowedFields = ['titleAr', 'titleEn', 'bodyAr', 'bodyEn', 'type'];

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updateData[field] = fields[field];
      }
    }

    const notification = await db.notification.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('[ADMIN_NOTIFICATIONS_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete notification ───
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Check notification exists
    const existing = await db.notification.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await db.notification.delete({ where: { id } });

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'DELETE',
        entity: 'Notification',
        entityId: id,
        details: `Deleted notification: ${existing.titleEn}`,
      },
    });

    return NextResponse.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('[ADMIN_NOTIFICATIONS_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
