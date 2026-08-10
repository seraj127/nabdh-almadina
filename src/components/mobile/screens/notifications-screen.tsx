'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '../lib/mobile-store';
import {
  Bell,
  Package,
  Truck,
  Tag,
  CreditCard,
  Info,
  AlertTriangle,
  Gift,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  BellOff,
  Loader2,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────
interface ApiNotification {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

type FilterTab = 'all' | 'order' | 'promo' | 'system';

// ─── Icon Mapping ──────────────────────────────────────────────────
const TYPE_ICON: Record<string, React.ElementType> = {
  order: Package,
  delivery: Truck,
  promo: Tag,
  payment: CreditCard,
  system: AlertTriangle,
  reward: Gift,
  info: Info,
};

const TYPE_COLORS: Record<string, { bg: string; icon: string }> = {
  order: { bg: 'rgba(0,75,99,0.1)', icon: '#004B63' },
  delivery: { bg: 'rgba(0,137,123,0.1)', icon: '#00897B' },
  promo: { bg: 'rgba(255,111,97,0.1)', icon: '#FF6F61' },
  payment: { bg: 'rgba(0,137,123,0.1)', icon: '#00897B' },
  system: { bg: 'rgba(210,153,34,0.1)', icon: '#D29922' },
  reward: { bg: 'rgba(139,92,246,0.1)', icon: '#8B5CF6' },
  info: { bg: 'rgba(107,114,128,0.1)', icon: '#6B7280' },
};

// ─── Animation Variants ────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: 'easeOut' as const },
  }),
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

const tabVariants = {
  active: { scale: 1, opacity: 1 },
  inactive: { scale: 0.97, opacity: 0.6 },
};

// ─── Helper: Format Relative Time from ISO date ───────────────────
function formatTimeAgo(dateStr: string, language: string, t: (k: string) => string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const isAr = language === 'ar';

  if (seconds < 60) return isAr ? 'الآن' : 'Just now';
  if (minutes < 60) return `${minutes} ${isAr ? 'دقيقة' : 'min ago'}`;
  if (hours < 24) return `${hours} ${isAr ? 'ساعة' : 'hr ago'}`;
  if (days < 30) return `${days} ${isAr ? 'يوم' : 'days ago'}`;
  return date.toLocaleDateString(isAr ? 'ar-LY' : 'en-US', { month: 'short', day: 'numeric' });
}

// ─── Filter Tabs ───────────────────────────────────────────────────
const FILTER_TABS: { key: FilterTab; labelKey: string }[] = [
  { key: 'all', labelKey: 'mobile.notifications.all' },
  { key: 'order', labelKey: 'mobile.notifications.orders' },
  { key: 'promo', labelKey: 'mobile.notifications.promos' },
  { key: 'system', labelKey: 'mobile.notifications.system' },
];

// ═══════════════════════════════════════════════════════════════════════
// NOTIFICATIONS SCREEN
// ═══════════════════════════════════════════════════════════════════════
export function NotificationsScreen() {
  const { language, t } = useLanguageStore();
  const user = useMobileStore((s) => s.user);
  const darkMode = useMobileStore((s) => s.darkMode);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // ─── Fetch notifications from API ──────────────────────────────
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}&limit=50`);
        const data = await res.json();
        if (!cancelled) {
          setNotifications(data.notifications || []);
        }
      } catch {
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

  // ─── Derived Data ───
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'order') return notifications.filter((n) => n.type === 'order' || n.type === 'delivery');
    if (activeFilter === 'promo') return notifications.filter((n) => n.type === 'promo' || n.type === 'reward');
    if (activeFilter === 'system') return notifications.filter((n) => n.type === 'system' || n.type === 'info' || n.type === 'payment');
    return notifications;
  }, [notifications, activeFilter]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // ─── Handlers ───
  const handleBack = () => {
    useMobileStore.getState().setScreen('main');
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notificationIds: [id] }),
      });
    } catch { /* optimistic update, ignore error */ }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, markAll: true }),
      });
    } catch { /* optimistic update, ignore error */ }
  };

  return (
    <div
      dir={direction}
      className="flex flex-col min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #003545 0%, #004B63 50%, #00897B 100%)',
      }}
    >
      {/* ─── Gradient Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 pt-12 pb-6"
      >
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="absolute top-12 z-10 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            [isRtl ? 'right' : 'left']: 16,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {isRtl ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* Title area */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center relative"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Bell className="w-7 h-7 text-white" />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: '#FF6F61' }}
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-white"
          >
            {t('mobile.notifications.title')}
          </motion.h1>
          {unreadCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-white/70 mt-1"
            >
              {unreadCount} {t('mobile.notifications.unread')}
            </motion.p>
          )}
        </div>

        {/* Decorative circles */}
        <div className="absolute top-4 right-8 w-20 h-20 rounded-full opacity-10 bg-white" />
        <div className="absolute top-16 left-4 w-12 h-12 rounded-full opacity-5 bg-white" />
      </motion.div>

      {/* ─── Content ─── */}
      <div className="flex-1 bg-white dark:bg-[#0B1120] rounded-t-3xl overflow-hidden flex flex-col">
        {/* ─── Filter Tabs + Mark All Read ─── */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {FILTER_TABS.map((tab) => (
              <motion.button
                key={tab.key}
                variants={tabVariants}
                animate={activeFilter === tab.key ? 'active' : 'inactive'}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(tab.key)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap"
                style={{
                  background:
                    activeFilter === tab.key
                      ? 'linear-gradient(135deg, #004B63, #00897B)'
                      : darkMode ? 'rgba(0,75,99,0.12)' : 'rgba(0,75,99,0.06)',
                  color: activeFilter === tab.key ? '#fff' : darkMode ? '#A8B8CC' : '#6B7280',
                }}
              >
                {t(tab.labelKey)}
              </motion.button>
            ))}
          </div>

          {/* Mark all as read */}
          {unreadCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg shrink-0"
              style={{
                color: '#00897B',
                background: 'rgba(0,137,123,0.08)',
              }}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('mobile.notifications.markAllRead')}</span>
            </motion.button>
          )}
        </div>

        {/* ─── Notification List ─── */}
        <div className="flex-1 overflow-y-auto px-4 pb-24" style={{ scrollbarWidth: 'thin' }}>
          {loading ? (
            /* ─── Loading State ─── */
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: darkMode ? '#00C4E8' : '#004B63' }} />
              <p className="text-sm mt-3" style={{ color: darkMode ? '#A8B8CC' : '#6B7280' }}>
                {t('common.loading')}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length === 0 ? (
                /* ─── Empty State ─── */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ background: darkMode ? 'rgba(0,75,99,0.10)' : 'rgba(0,75,99,0.06)' }}
                  >
                    <BellOff className="w-9 h-9" style={{ color: darkMode ? '#6B7F96' : '#9CA3AF' }} />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">
                    {t('mobile.notifications.empty')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-[240px]">
                    {t('mobile.notifications.emptyHint')}
                  </p>
                </motion.div>
              ) : (
                /* ─── Notification Cards ─── */
                <div className="space-y-2.5 pt-2">
                  {filteredNotifications.map((notification, index) => {
                    const IconComponent = TYPE_ICON[notification.type] || Info;
                    const colors = TYPE_COLORS[notification.type] || TYPE_COLORS.info;
                    const title = language === 'ar' ? notification.titleAr : notification.titleEn;
                    const message = language === 'ar' ? notification.bodyAr : notification.bodyEn;

                    return (
                      <motion.div
                        key={notification.id}
                        custom={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        onClick={() => { if (!notification.isRead) markAsRead(notification.id); }}
                        whileTap={{ scale: 0.985 }}
                        className="flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer transition-all"
                        style={{
                          background: notification.isRead
                            ? 'transparent'
                            : 'linear-gradient(135deg, rgba(0,75,99,0.04), rgba(0,137,123,0.04))',
                          border: notification.isRead
                            ? `1px solid ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`
                            : '1px solid rgba(0,137,123,0.1)',
                        }}
                      >
                        {/* Icon Badge */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: colors.bg }}
                        >
                          <IconComponent className="w-5 h-5" style={{ color: colors.icon }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`text-sm leading-tight ${
                                notification.isRead
                                  ? 'font-medium text-gray-700 dark:text-gray-300'
                                  : 'font-bold text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {title}
                            </h4>
                            {/* Unread dot */}
                            {!notification.isRead && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                                style={{ background: '#FF6F61' }}
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                            {message}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-[#6B7F96] mt-1.5 font-medium">
                            {formatTimeAgo(notification.createdAt, language, t)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
