'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Package, Flame, Gift, Star, Info, ShoppingCart, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';

interface Notification {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function getNotificationConfig(type: string) {
  const map: Record<string, { icon: typeof Package; color: string }> = {
    order: { icon: Package, color: 'text-emerald-600 bg-emerald-500/10' },
    promo: { icon: Flame, color: 'text-nabdh-accent bg-nabdh-accent/10' },
    info: { icon: Info, color: 'text-blue-600 bg-blue-500/10' },
    system: { icon: Star, color: 'text-purple-600 bg-purple-500/10' },
    reward: { icon: Gift, color: 'text-pink-500 bg-pink-500/10' },
    cart: { icon: ShoppingCart, color: 'text-nabdh-primary bg-nabdh-primary/10' },
  };
  return map[type] || map.info;
}

export function NotificationBell({ isAr, isRTL, userId }: { isAr: boolean; isRTL: boolean; userId: string }) {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  function formatTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return t('notifications.justNow');
    if (diffMin < 60) return t('notifications.minutesAgo', { count: diffMin });
    if (diffHr < 24) return t('notifications.hoursAgo', { count: diffHr });
    if (diffDay < 7) return t('notifications.daysAgo', { count: diffDay });
    return date.toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US', { month: 'short', day: 'numeric' });
  }

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${userId}&limit=20`);
      const data = await res.json();
      if (res.ok && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silently fail
    }
  }, [userId]);

  // Defer initial fetch + slow polling (60s)
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      setLoading(true);
      await fetchNotifications();
      if (!cancelled) setLoading(false);
    }, 3000);
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchNotifications, userId]);

  // Also fetch when user opens the dropdown
  useEffect(() => {
    if (isOpen && userId) {
      // Fetching on dropdown open is intentional — notifications may have changed
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Refresh data on dropdown open
      void fetchNotifications();
    }
  }, [isOpen, userId, fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch(`/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  const markOneRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, notificationIds: [notifId] }),
      });
      setNotifications((prev) =>
        prev.map((n) => n.id === notifId ? { ...n, isRead: true } : n)
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  return (
    <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'} open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center rounded-md h-10 w-10 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative text-foreground/70 hover:text-nabdh-primary"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 end-1 min-size-[16px] px-1 rounded-full bg-nabdh-accent text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background animate-pulse">
              {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? 'start' : 'end'}
        className="w-80 p-0 rounded-2xl border-border/50 shadow-xl shadow-nabdh-primary/10"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-nabdh-primary font-medium hover:underline flex items-center gap-1"
              >
                <Check size={10} />
                {t('notifications.markAllRead')}
              </button>
            )}
          </div>
        </div>

        {/* Notification Items */}
        <div className="max-h-72 overflow-y-auto custom-scrollbar">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="size-6 border-2 border-nabdh-primary/30 border-t-nabdh-primary rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="size-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {t('notifications.empty')}
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const config = getNotificationConfig(notif.type);
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/30 last:border-0 ${
                    !notif.isRead ? 'bg-nabdh-primary/5' : ''
                  }`}
                  onClick={() => {
                    if (!notif.isRead) markOneRead(notif.id);
                  }}
                >
                  <div className={`size-9 rounded-full flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>
                      {language === 'ar' ? notif.titleAr : notif.titleEn}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {language === 'ar' ? notif.bodyAr : notif.bodyEn}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="size-2 rounded-full bg-nabdh-accent shrink-0 mt-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border/50">
          <button
            onClick={() => { setIsOpen(false); useUIStore.getState().setAuthView('profile'); }}
            className="w-full text-center text-xs text-nabdh-primary font-medium hover:underline"
          >
            {t('notifications.viewAll')}
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
