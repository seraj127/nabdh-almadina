'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '@/components/mobile/lib/mobile-store';
import { getDeliveryDuration } from '@/components/mobile/lib/libya-delivery-data';
import {
  ArrowRight,
  ArrowLeft,
  Package,
  CheckCircle2,
  ClipboardList,
  Truck,
  Clock,
  MapPin,
  CalendarDays,
  Navigation,
  Loader2,
  AlertCircle,
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  CircleDot,
  Star,
  Gift,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────

interface OrderTrackingScreenProps {
  orderNumber: string;
  onClose: () => void;
}

type OrderStep = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    productId?: string;
    nameAr: string;
    nameEn: string;
    price: number;
    quantity: number;
    total?: number;
    image?: string | null;
    product?: {
      id: string;
      nameAr: string;
      nameEn: string;
      mainImage?: string | null;
    } | null;
  }>;
  statusLog: Array<{
    id: string;
    status: string;
    note?: string;
    createdAt: string;
  }>;
  address?: {
    id?: string;
    label?: string;
    address: string;
    city: string;
    area?: string;
    notes?: string | null;
    // Extended fields from full API response
    userId?: string;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  shipment?: {
    id: string;
    trackingNumber: string | null;
    waybillNumber: string | null;
    status: string;
    weight: number | null;
    shippingCost: number;
    estimatedDelivery: string | null;
    actualDelivery: string | null;
    carrier: {
      nameAr: string;
      nameEn: string;
      code: string;
      trackingUrl: string | null;
    };
    logs?: Array<{
      id: string;
      status: string;
      location: string | null;
      descriptionAr: string | null;
      descriptionEn: string | null;
      occurredAt: string;
    }>;
  } | null;
}

// ─── Brand Tokens ────────────────────────────────────────────────────────

const COLORS = {
  teal: '#00A8CC',
  tealDark: '#00897B',
  primary: '#004B63',
  danger: '#EF4444',
  info: '#3B82F6',
  textPrimary: '#1F2937',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  darkCard: '#151D2E',
  darkBorder: '#1E2A42',
  darkSubtle: '#1A2540',
  darkBg: '#0B1120',
  success: '#238636',
  secondary: '#FF6F61',
  gold: '#D4A843',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
};

const HEADER_GRADIENT = 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)';

// ─── Constants ───────────────────────────────────────────────────────────

const STEP_ORDER: OrderStep[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

// ─── Step Configuration ──────────────────────────────────────────────────

interface StepConfig {
  key: OrderStep;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  {
    key: 'pending',
    titleAr: 'تم الطلب',
    titleEn: 'Order Placed',
    descAr: 'تم استلام طلبك بنجاح',
    descEn: 'Your order has been received',
    icon: Clock,
  },
  {
    key: 'confirmed',
    titleAr: 'تم التأكيد',
    titleEn: 'Confirmed',
    descAr: 'تم تأكيد الطلب ومراجعته',
    descEn: 'Order confirmed and reviewed',
    icon: CheckCircle2,
  },
  {
    key: 'processing',
    titleAr: 'جاري التحضير',
    titleEn: 'Processing',
    descAr: 'يتم تحضير طلبك للتغليف',
    descEn: 'Your order is being prepared',
    icon: ClipboardList,
  },
  {
    key: 'shipped',
    titleAr: 'تم الشحن',
    titleEn: 'Shipped',
    descAr: 'تم شحن طلبك وهو في الطريق',
    descEn: 'Your order is on its way',
    icon: Truck,
  },
  {
    key: 'delivered',
    titleAr: 'تم التسليم',
    titleEn: 'Delivered',
    descAr: 'تم تسليم طلبك بنجاح',
    descEn: 'Your order has been delivered',
    icon: Package,
  },
];

// ─── Animation Variants ──────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 180, damping: 22 },
  },
};

// ─── Helper: Generate Timestamps from statusLog ──────────────────────────

function buildTimestampsFromLog(
  statusLog: Array<{ status: string; createdAt: string }>
): Record<OrderStep, string | null> {
  const timestamps: Record<OrderStep, string | null> = {
    pending: null,
    confirmed: null,
    processing: null,
    shipped: null,
    delivered: null,
  };
  for (const log of statusLog) {
    const step = log.status as OrderStep;
    if (step in timestamps && !timestamps[step]) {
      timestamps[step] = log.createdAt;
    }
  }
  return timestamps;
}

// ─── Helper: Generate Mock Timestamps (fallback) ────────────────────────

function generateMockTimestamps(currentStep: OrderStep): Record<OrderStep, string | null> {
  const now = new Date();
  const timestamps: Record<OrderStep, string | null> = {
    pending: null,
    confirmed: null,
    processing: null,
    shipped: null,
    delivered: null,
  };
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  for (let i = 0; i <= currentIndex; i++) {
    const offset = (currentIndex - i) * 4 * 60 * 60 * 1000;
    const date = new Date(now.getTime() - offset);
    timestamps[STEP_ORDER[i]] = date.toISOString();
  }
  return timestamps;
}

// ─── Sub-components ──────────────────────────────────────────────────────

function SectionCard({
  children,
  darkMode,
  style,
  className = '',
}: {
  children: React.ReactNode;
  darkMode: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: darkMode ? COLORS.darkCard : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${darkMode ? COLORS.darkBorder : COLORS.border}`,
        boxShadow: darkMode
          ? '0 4px 24px rgba(0,0,0,0.3)'
          : '0 4px 24px rgba(0,0,0,0.06)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  darkMode,
  iconBg,
  iconColor,
  valueElement,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  darkMode: boolean;
  iconBg?: string;
  iconColor?: string;
  valueElement?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: iconBg || (darkMode ? `${COLORS.teal}15` : `${COLORS.teal}10`),
          border: `1px solid ${darkMode ? `${COLORS.teal}20` : `${COLORS.teal}18`}`,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs"
          style={{ color: darkMode ? COLORS.textDisabled : COLORS.textSecondary }}
        >
          {label}
        </p>
        {valueElement || (
          <p
            className="text-sm font-semibold mt-0.5"
            style={{ color: darkMode ? '#E6EDF3' : COLORS.textPrimary }}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export function OrderTrackingScreen({ orderNumber, onClose }: OrderTrackingScreenProps) {
  const { t, language } = useLanguageStore();
  const darkMode = useMobileStore((s) => s.darkMode);
  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  // State for fetched order data
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);

  // Review eligibility state
  const [reviewEligibility, setReviewEligibility] = useState<Array<{
    id: string;
    productId: string;
    nameAr: string;
    nameEn: string;
    image?: string | null;
    price: number;
    quantity: number;
    canReview: boolean;
    hasReviewed: boolean;
    existingReview: any | null;
  }>>([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  // Ref for retry count (to avoid infinite retries)
  const retryCountRef = React.useRef(0);

  // Fetch order data from API
  // showRefresh: user tapped refresh button → show spinner on button
  // silent: background poll → no UI loading state change
  const fetchOrder = useCallback(async (showRefresh = false, silent = false) => {
    if (showRefresh) setRefreshing(true);
    else if (!silent) setLoading(true);
    if (!silent) setError(null);
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrderData(data.order as OrderData);
          if (silent) setError(null); // clear any previous error on successful silent fetch
        } else if (!silent) {
          setError(t('tracking.orderNotFound'));
        }
      } else if (!silent) {
        setError(t('tracking.orderNotFound'));
      }
    } catch {
      if (!silent) setError(t('tracking.connectionError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderNumber, t]);

  // Initial fetch on mount
  useEffect(() => {
    fetchOrder();
  }, [orderNumber]);

  // Silent background refresh every 60 seconds (no loading flicker)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrder(false, true);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // Fetch review eligibility when order is delivered
  useEffect(() => {
    if (orderData?.status === 'delivered' && orderData.id !== 'mock') {
      const user = useMobileStore.getState().user;
      if (!user?.id) return;
      setReviewLoading(true);
      fetch(`/api/reviews/eligibility?orderId=${orderData.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.items) setReviewEligibility(data.items);
        })
        .catch(() => {})
        .finally(() => setReviewLoading(false));
    }
  }, [orderData?.status, orderData?.id]);

  // Determine current step from real order status
  const currentStep: OrderStep = useMemo(() => {
    if (!orderData) return 'pending';
    const status = orderData.status as OrderStep;
    if (STEP_ORDER.includes(status)) return status;
    return 'pending';
  }, [orderData]);

  const currentIndex = STEP_ORDER.indexOf(currentStep);

  // Generate timestamps from real statusLog or fallback to mock
  const timestamps = useMemo(() => {
    if (orderData?.statusLog && orderData.statusLog.length > 0) {
      return buildTimestampsFromLog(orderData.statusLog);
    }
    return generateMockTimestamps(currentStep);
  }, [orderData, currentStep]);

  // Estimated delivery date - dynamic based on order data
  const estimatedDelivery = useMemo(() => {
    // If shipment has estimated delivery, use it
    if (orderData?.shipment?.estimatedDelivery) {
      return new Date(orderData.shipment.estimatedDelivery);
    }
    // Otherwise calculate based on order creation date + delivery duration
    const orderDate = orderData?.createdAt ? new Date(orderData.createdAt) : new Date();
    // Get delivery duration from the delivery data based on order address
    let estimatedDays = 2; // default
    if (orderData?.address?.city) {
      try {
        const duration = getDeliveryDuration(orderData.address.city, orderData.address.area || '');
        // Parse duration string to extract days (e.g. 'خلال 24 ساعة' -> 1 day, 'خلال 2-3 أيام' -> 3 days)
        if (duration.includes('24') || duration.includes('ساعة')) {
          estimatedDays = 1;
        } else if (duration.includes('2-3') || duration.includes('يومين')) {
          estimatedDays = 3;
        } else if (duration.includes('3-5') || duration.includes('3')) {
          estimatedDays = 5;
        } else {
          // Extract any number from the string
          const match = duration.match(/(\d+)/);
          if (match) {
            estimatedDays = parseInt(match[1]);
          }
        }
      } catch {
        estimatedDays = 2;
      }
    }
    const result = new Date(orderDate);
    result.setDate(result.getDate() + estimatedDays);
    return result;
  }, [orderData]);

  // Delivery address from real data - dynamic based on order
  const deliveryAddress = useMemo(() => {
    if (orderData?.address) {
      const addr = orderData.address;
      const parts = [addr.area, addr.city, addr.address].filter(Boolean);
      return parts.join('، ');
    }
    // No fallback hardcoded address - return empty to indicate no data
    return '';
  }, [orderData]);

  // Delivery city from order data
  const deliveryCity = useMemo(() => {
    return orderData?.address?.city || '';
  }, [orderData]);

  // Delivery area from order data
  const deliveryArea = useMemo(() => {
    return orderData?.address?.area || '';
  }, [orderData]);

  // Delivery duration from order data
  const deliveryDuration = useMemo(() => {
    if (orderData?.address?.city) {
      try {
        return getDeliveryDuration(orderData.address.city, orderData.address.area || '');
      } catch {
        return isRTL ? 'خلال 2-3 أيام' : 'Within 2-3 days';
      }
    }
    return isRTL ? 'خلال 2-3 أيام' : 'Within 2-3 days';
  }, [orderData, isRTL]);

  // Payment method label from order data
  const paymentMethodLabel = useMemo(() => {
    const method = orderData?.paymentMethod || 'cod';
    if (method === 'cod') return isRTL ? 'الدفع عند الاستلام' : 'Cash on Delivery';
    if (method === 'card') return isRTL ? 'الدفع بالبطاقة' : 'Card Payment';
    if (method === 'bank_transfer') return isRTL ? 'تحويل بنكي' : 'Bank Transfer';
    return method;
  }, [orderData, isRTL]);

  // Get user's device timezone
  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Africa/Tripoli';
    }
  }, []);

  // Format timestamp for display using user's device timezone
  const formatTimestamp = (iso: string | null) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleDateString(isRTL ? 'ar-LY' : 'en-US', {
      timeZone: userTimezone,
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format full date using user's device timezone
  const formatFullDate = (iso: string | null) => {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleDateString(isRTL ? 'ar-LY' : 'en-US', {
      timeZone: userTimezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // Themed colors shortcut
  const tc = useMemo(() => ({
    bg: darkMode ? COLORS.darkBg : '#F4F7F9',
    cardBg: darkMode ? COLORS.darkCard : 'rgba(255,255,255,0.92)',
    border: darkMode ? COLORS.darkBorder : COLORS.border,
    text: darkMode ? '#E6EDF3' : COLORS.textPrimary,
    textSub: darkMode ? COLORS.textDisabled : COLORS.textSecondary,
    textMuted: darkMode ? '#484F58' : COLORS.textDisabled,
    subtleBg: darkMode ? COLORS.darkSubtle : COLORS.surface,
  }), [darkMode]);

  // ─── Loading State ─────────────────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: tc.bg }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        dir={direction}
      >
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: `${COLORS.teal}12` }}
          >
            <Loader2 size={28} className="animate-spin" style={{ color: COLORS.teal }} />
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold" style={{ color: tc.textSub }}>
          {t('tracking.loadingOrder')}
        </p>
      </motion.div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────────
  // Instead of showing a blocking error, retry silently once, then fallback
  // to mock "pending" data so the user always sees the professional tracking UI
  if (error && !orderData) {
    // Retry once after a short delay (order might not be in DB yet)
    if (!retryCountRef.current) {
      retryCountRef.current = 1;
      setTimeout(() => {
        fetchOrder();
      }, 1500);
      return (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: tc.bg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          dir={direction}
        >
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `${COLORS.teal}12` }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: COLORS.teal }} />
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold" style={{ color: tc.textSub }}>
            {isRTL ? 'جاري البحث عن الطلب...' : 'Searching for order...'}
          </p>
        </motion.div>
      );
    }
    // After retry, generate mock pending order data so the UI still renders
    const mockOrderData: OrderData = {
      id: 'mock',
      orderNumber,
      status: 'pending',
      paymentMethod: 'cod',
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      items: [],
      statusLog: [
        { id: '1', status: 'pending', createdAt: new Date().toISOString() },
      ],
      address: null,
      shipment: null,
    };
    setOrderData(mockOrderData);
    setError(null);
    setLoading(false);
  }

  // ─── Status label helper ───────────────────────────────────────────
  const statusLabel = orderData?.status === 'cancelled'
    ? t('order.cancelled')
    : currentIndex >= 4
      ? t('order.delivered')
      : isRTL
        ? { pending: 'معلق', confirmed: 'مؤكد', processing: 'قيد التحضير', shipped: 'تم الشحن' }[currentStep] || t('order.processing')
        : STEPS[currentIndex]?.titleEn || t('order.processing');

  const statusColor = orderData?.status === 'cancelled'
    ? COLORS.danger
    : currentIndex >= 4
      ? COLORS.success
      : COLORS.teal;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col overflow-hidden z-50"
      dir={direction}
      style={{ background: tc.bg }}
      initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? -40 : 40 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 26 }}
    >
      {/* ═══ Gradient Header ═══ */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{ background: HEADER_GRADIENT }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-8 -start-8 w-36 h-36 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />
        <div
          className="absolute top-12 end-6 w-24 h-24 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        />
        <div
          className="absolute bottom-8 start-1/3 w-16 h-16 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
        <motion.div
          className="absolute -top-6 -start-6 w-32 h-32 rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.teal}18 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <motion.div
          className="absolute bottom-4 end-4 w-28 h-28 rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.gold}12 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.2 }}
        />

        {/* Wave SVG */}
        <svg
          className="absolute bottom-0 start-0 w-full"
          viewBox="0 0 430 35"
          preserveAspectRatio="none"
          style={{ height: 24 }}
        >
          <path
            d="M0 20 Q107 2 215 18 Q322 34 430 16 V35 H0 Z"
            fill={tc.bg}
          />
        </svg>

        {/* Header content */}
        <div className="relative z-10 px-4 pt-4 pb-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            {/* Glassmorphism back button */}
            <motion.button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              whileHover={{ scale: 1.08, background: 'rgba(255,255,255,0.25)' }}
              whileTap={{ scale: 0.92 }}
              aria-label={t('common.goBack')}
            >
              <BackArrow size={20} className="text-white" />
            </motion.button>

            {/* Status badge */}
            <motion.div
              className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
              style={{
                background: `${statusColor}20`,
                color: statusColor,
                border: `1px solid ${statusColor}35`,
                backdropFilter: 'blur(8px)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200 }}
            >
              <CircleDot size={10} />
              {statusLabel}
            </motion.div>
          </div>

          {/* Title + subtitle */}
          <motion.h1
            className="text-2xl font-bold text-white mb-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring' as const, stiffness: 200, damping: 20 }}
          >
            {isRTL ? 'تتبع الطلب' : 'Order Tracking'}
          </motion.h1>
          <motion.div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 18 }}
          >
            <Package size={14} className="text-white/70" />
            <span className="text-white/90 text-xs font-semibold tracking-wide" dir="ltr">
              # {orderNumber}
            </span>
          </motion.div>
        </div>
      </div>

      {/* ═══ Scrollable Content ═══ */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 -mt-4 relative z-10 pb-24"
        style={{ scrollBehavior: 'smooth' }}
      >
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ─── Timeline Section ─── */}
          <motion.div variants={cardVariants}>
            <SectionCard darkMode={darkMode}>
              <h2
                className="text-base font-bold mb-5 flex items-center gap-2"
                style={{ color: tc.text }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${COLORS.teal}15` }}
                >
                  <Navigation size={14} style={{ color: COLORS.teal }} />
                </div>
                {t('common.orderStatus')}
              </h2>

              {/* Timeline */}
              <div className="relative">
                {STEPS.map((step, i) => {
                  const isCompleted = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  const isFuture = i > currentIndex;
                  const IconComponent = step.icon;
                  const timestamp = timestamps[step.key];

                  return (
                    <div key={step.key} className="relative">
                      {/* Connecting line */}
                      {i < STEPS.length - 1 && (
                        <div
                          className="absolute start-[19px] top-10 bottom-0 w-[2.5px] rounded-full"
                          style={{
                            background: isFuture
                              ? `${tc.border}`
                              : `linear-gradient(180deg, ${COLORS.teal}, ${COLORS.tealDark})`,
                            opacity: isFuture ? 0.5 : 0.6,
                          }}
                        />
                      )}

                      {/* Step row */}
                      <motion.div
                        className="flex items-start gap-3.5 pb-5 last:pb-0 relative"
                        initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.3 + i * 0.08,
                          type: 'spring' as const,
                          stiffness: 180,
                          damping: 22,
                        }}
                      >
                        {/* Step icon */}
                        <div className="relative flex-shrink-0">
                          <motion.div
                            className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
                            style={{
                              background: isCompleted
                                ? `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`
                                : tc.subtleBg,
                              border: isCompleted
                                ? 'none'
                                : `2px solid ${tc.border}`,
                              boxShadow: isCurrent
                                ? `0 0 0 4px ${COLORS.teal}20, 0 4px 12px ${COLORS.teal}25`
                                : isCompleted
                                  ? `0 2px 8px ${COLORS.teal}18`
                                  : 'none',
                            }}
                            animate={isCurrent ? {
                              boxShadow: [
                                `0 0 0 4px ${COLORS.teal}20, 0 4px 12px ${COLORS.teal}25`,
                                `0 0 0 8px ${COLORS.teal}10, 0 4px 16px ${COLORS.teal}35`,
                                `0 0 0 4px ${COLORS.teal}20, 0 4px 12px ${COLORS.teal}25`,
                              ],
                            } : {}}
                            transition={isCurrent ? {
                              duration: 2.2,
                              repeat: Infinity,
                              ease: 'easeInOut' as const,
                            } : {}}
                          >
                            <IconComponent
                              size={17}
                              style={{ color: isCompleted ? 'white' : tc.textMuted }}
                              strokeWidth={isCurrent ? 2.5 : 2}
                            />
                          </motion.div>

                          {/* Pulse ring on current step */}
                          {isCurrent && (
                            <motion.div
                              className="absolute inset-0 rounded-full"
                              style={{ border: `2px solid ${COLORS.teal}` }}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                            />
                          )}

                          {/* Checkmark on completed (non-current) steps */}
                          {isCompleted && !isCurrent && (
                            <motion.div
                              className="absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{
                                background: COLORS.success,
                                border: `2px solid ${darkMode ? COLORS.darkCard : 'white'}`,
                              }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.4 + i * 0.08, type: 'spring' as const, stiffness: 300, damping: 15 }}
                            >
                              <CheckCircle2 size={7} className="text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>

                        {/* Step text */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3
                              className="text-sm font-bold"
                              style={{
                                color: isCompleted ? (isCurrent ? COLORS.teal : tc.text) : tc.textMuted,
                              }}
                            >
                              {isRTL ? step.titleAr : step.titleEn}
                            </h3>
                            {timestamp && (
                              <span
                                className="text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded-md"
                                style={{
                                  color: tc.textSub,
                                  background: darkMode ? COLORS.darkSubtle : `${COLORS.surface}`,
                                }}
                                dir="ltr"
                              >
                                {formatTimestamp(timestamp)}
                              </span>
                            )}
                          </div>
                          <p
                            className="text-xs mt-0.5"
                            style={{
                              color: isCompleted ? tc.textSub : tc.textMuted,
                            }}
                          >
                            {isRTL ? step.descAr : step.descEn}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>

          {/* ─── Rate Your Purchase (only when delivered) ─── */}
          {(currentStep === 'delivered' || orderData?.status === 'delivered') && orderData?.items && orderData.items.length > 0 && (
            <motion.div variants={cardVariants}>
              <SectionCard darkMode={darkMode} style={{ borderColor: `${COLORS.gold}30` }}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.gold}, #E8C564)`,
                      boxShadow: `0 4px 12px ${COLORS.gold}35`,
                    }}
                  >
                    <Star size={16} className="text-white fill-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold" style={{ color: tc.text }}>
                      {t('review.rateYourPurchase')}
                    </h2>
                    <p className="text-[10px] mt-0.5" style={{ color: tc.textSub }}>
                      {t('review.rateYourPurchaseDesc')}
                    </p>
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1"
                    style={{
                      background: `${COLORS.success}15`,
                      color: COLORS.success,
                      border: `1px solid ${COLORS.success}25`,
                    }}
                  >
                    <CheckCircle2 size={10} />
                    {t('review.afterDelivery')}
                  </div>
                </div>

                {/* Product items with rate buttons */}
                <div className="space-y-2.5">
                  {orderData.items.map((item, i) => {
                    const eligItem = reviewEligibility.find(e => e.productId === (item.productId || item.id));
                    const hasReviewed = eligItem?.hasReviewed ?? false;
                    const existingRating = eligItem?.existingReview?.rating ?? 0;
                    const productName = isRTL ? item.nameAr : item.nameEn;

                    return (
                      <motion.div
                        key={item.id || i}
                        className="flex items-center gap-3 p-2.5 rounded-xl"
                        style={{
                          background: darkMode ? `${COLORS.darkSubtle}` : '#F8F9FA',
                          border: `1px solid ${hasReviewed ? `${COLORS.success}20` : `${COLORS.gold}15`}`,
                        }}
                        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        {/* Product image */}
                        <div
                          className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ background: darkMode ? COLORS.darkBorder : '#E5E7EB' }}
                        >
                          {item.image ? (
                            <img src={item.image} alt={productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} style={{ color: tc.textMuted }} />
                            </div>
                          )}
                        </div>

                        {/* Product info + rating */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: tc.text }}>
                            {productName}
                          </p>
                          {hasReviewed ? (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={11}
                                    className={s <= existingRating ? 'fill-[#D4A843] text-[#D4A843]' : 'text-gray-300'}
                                  />
                                ))}
                              </div>
                              <span className="text-[9px] font-bold" style={{ color: COLORS.success }}>
                                {t('review.alreadyRated')} ✓
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={11} className="text-gray-300" />
                                ))}
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => {
                                  // Navigate to product detail for review
                                  const storeProducts = useMobileStore.getState().products;
                                  const product = storeProducts.find((p: any) => p.id === (item.productId || item.id));
                                  if (product) {
                                    useMobileStore.getState().setSelectedProduct(product);
                                  }
                                }}
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white"
                                style={{
                                  background: `linear-gradient(135deg, ${COLORS.gold}, #E8C564)`,
                                  boxShadow: `0 2px 6px ${COLORS.gold}30`,
                                }}
                              >
                                {t('review.rateNow')}
                              </motion.button>
                            </div>
                          )}
                        </div>

                        {/* Bonus badge */}
                        {!hasReviewed && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md flex-shrink-0" style={{ background: `${COLORS.gold}10` }}>
                            <Gift size={10} style={{ color: COLORS.gold }} />
                            <span className="text-[8px] font-bold" style={{ color: COLORS.gold }}>+50</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Eligibility rules */}
                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${tc.border}` }}>
                  <div className="space-y-1.5">
                    {[
                      { icon: CheckCircle2, text: t('review.eligibilityRule1'), color: COLORS.success },
                      { icon: Star, text: t('review.eligibilityRule3'), color: COLORS.gold },
                      { icon: RefreshCw, text: t('review.eligibilityRule4'), color: COLORS.teal },
                    ].map((rule, i) => {
                      const RuleIcon = rule.icon;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <RuleIcon size={11} style={{ color: rule.color }} />
                          <span className="text-[9px]" style={{ color: tc.textSub }}>{rule.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* ─── Order Summary Card ─── */}
          {orderData && (
            <motion.div variants={cardVariants}>
              <SectionCard darkMode={darkMode}>
                <h2
                  className="text-base font-bold mb-4 flex items-center gap-2"
                  style={{ color: tc.text }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${COLORS.tealDark}15` }}
                  >
                    <Wallet size={14} style={{ color: COLORS.tealDark }} />
                  </div>
                  {t('tracking.orderSummary')}
                </h2>

                {/* Items */}
                {orderData.items && orderData.items.length > 0 && (
                  <div className="space-y-2.5 mb-3">
                    {orderData.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-xl"
                        style={{ background: tc.subtleBg }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ background: darkMode ? COLORS.darkBorder : '#E5E7EB' }}
                        >
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package size={16} style={{ color: tc.textMuted }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-xs font-semibold truncate"
                            style={{ color: tc.text }}
                          >
                            {isRTL ? item.nameAr : item.nameEn}
                          </p>
                          <p className="text-[10px]" style={{ color: tc.textSub }}>
                            {item.quantity} × {item.price.toFixed(2)} {t('product.currency')}
                          </p>
                        </div>
                        <p
                          className="text-xs font-bold flex-shrink-0"
                          style={{ color: '#4ADE80' }}
                        >
                          {(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="border-t pt-3 space-y-2"
                  style={{ borderColor: tc.border }}
                >
                  <div className="flex justify-between text-xs">
                    <span style={{ color: tc.textSub }}>{t('common.subtotal')}</span>
                    <span style={{ color: tc.text }}>{orderData.subtotal.toFixed(2)} {t('product.currency')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: tc.textSub }}>{t('common.delivery')}</span>
                    <span style={{ color: orderData.deliveryFee === 0 ? COLORS.success : tc.text }}>
                      {orderData.deliveryFee === 0 ? t('common.free') : `${orderData.deliveryFee.toFixed(2)} ${t('product.currency')}`}
                    </span>
                  </div>
                  {orderData.discount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: tc.textSub }}>{t('common.discount')}</span>
                      <span style={{ color: COLORS.danger }}>-{orderData.discount.toFixed(2)} {t('product.currency')}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between text-sm font-bold pt-2 border-t"
                    style={{ borderColor: tc.border }}
                  >
                    <span style={{ color: tc.text }}>{t('common.total')}</span>
                    <span style={{ color: '#4ADE80' }}>{orderData.total.toFixed(2)} {t('product.currency')}</span>
                  </div>
                </div>
              </SectionCard>
            </motion.div>
          )}

          {/* ─── Delivery Info Card ─── */}
          <motion.div variants={cardVariants}>
            <SectionCard darkMode={darkMode}>
              <h2
                className="text-base font-bold mb-4 flex items-center gap-2"
                style={{ color: tc.text }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${COLORS.teal}15` }}
                >
                  <Truck size={14} style={{ color: COLORS.teal }} />
                </div>
                {t('tracking.deliveryInfo')}
              </h2>

              {/* Dynamic delivery details based on order data */}
              <div className="space-y-3">
                {/* Order Date */}
                {orderData?.createdAt && (
                  <InfoRow
                    icon={<CalendarDays size={17} style={{ color: COLORS.teal }} />}
                    label={isRTL ? 'تاريخ الطلب' : 'Order Date'}
                    value={formatFullDate(orderData.createdAt)}
                    darkMode={darkMode}
                  />
                )}

                {/* Estimated Delivery Date */}
                <InfoRow
                  icon={<CalendarDays size={17} style={{ color: COLORS.tealDark }} />}
                  label={t('tracking.estimatedDeliveryDate')}
                  value={estimatedDelivery.toLocaleDateString(isRTL ? 'ar-LY' : 'en-US', {
                    timeZone: userTimezone,
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                  darkMode={darkMode}
                  iconBg={darkMode ? `${COLORS.tealDark}15` : `${COLORS.tealDark}10`}
                />

                {/* Delivery Address */}
                {deliveryAddress && (
                  <InfoRow
                    icon={<MapPin size={17} style={{ color: COLORS.danger }} />}
                    label={t('common.deliveryAddress')}
                    value={deliveryAddress}
                    darkMode={darkMode}
                    iconBg={darkMode ? `${COLORS.danger}15` : `${COLORS.danger}10`}
                  />
                )}

                {/* Delivery Duration */}
                <InfoRow
                  icon={<Clock size={17} style={{ color: COLORS.gold }} />}
                  label={isRTL ? 'مدة التوصيل المتوقعة' : 'Estimated Delivery Time'}
                  value={deliveryDuration}
                  darkMode={darkMode}
                  iconBg={darkMode ? `${COLORS.gold}15` : `${COLORS.gold}10`}
                />

                {/* Delivery Fee */}
                <InfoRow
                  icon={<Truck size={17} style={{ color: COLORS.teal }} />}
                  label={isRTL ? 'رسوم التوصيل' : 'Delivery Fee'}
                  value={orderData && orderData.deliveryFee > 0
                    ? `${orderData.deliveryFee.toFixed(2)} ${t('product.currency')}`
                    : t('common.free')}
                  darkMode={darkMode}
                />

                {/* Payment Method */}
                <InfoRow
                  icon={<Wallet size={17} style={{ color: COLORS.primary }} />}
                  label={t('common.paymentMethod')}
                  value={paymentMethodLabel}
                  darkMode={darkMode}
                  iconBg={darkMode ? `${COLORS.primary}15` : `${COLORS.primary}10`}
                />

                {/* Delivery progress bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: tc.textSub }}
                    >
                      {isRTL ? 'تقدم التوصيل' : 'Delivery Progress'}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        color: COLORS.teal,
                        background: `${COLORS.teal}12`,
                      }}
                    >
                      {Math.round(((currentIndex + 1) / STEPS.length) * 100)}%
                    </span>
                  </div>
                  <div
                    className="w-full h-2.5 rounded-full overflow-hidden"
                    style={{ background: darkMode ? COLORS.darkBorder : `${COLORS.border}` }}
                  >
                    <motion.div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.tealDark})`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
                      transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' as const }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {/* ─── Shipment Info Card ─── */}
          {orderData?.shipment && (
            <motion.div variants={cardVariants}>
              <SectionCard darkMode={darkMode}>
                <h2
                  className="text-base font-bold mb-4 flex items-center gap-2"
                  style={{ color: tc.text }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${COLORS.tealDark}15` }}
                  >
                    <Package size={14} style={{ color: COLORS.tealDark }} />
                  </div>
                  {isRTL ? 'معلومات الشحنة' : 'Shipment Info'}
                </h2>

                <div className="space-y-3">
                  {/* Carrier */}
                  <InfoRow
                    icon={<Truck size={17} style={{ color: COLORS.tealDark }} />}
                    label={isRTL ? 'شركة الشحن' : 'Carrier'}
                    value={isRTL ? orderData.shipment.carrier.nameAr : orderData.shipment.carrier.nameEn}
                    darkMode={darkMode}
                    iconBg={darkMode ? `${COLORS.tealDark}15` : `${COLORS.tealDark}10`}
                  />

                  {/* Tracking Number */}
                  {orderData.shipment.trackingNumber && (
                    <InfoRow
                      icon={<Navigation size={17} style={{ color: COLORS.info }} />}
                      label={isRTL ? 'رقم التتبع' : 'Tracking Number'}
                      value={orderData.shipment.trackingNumber}
                      darkMode={darkMode}
                      iconBg={darkMode ? `${COLORS.info}15` : `${COLORS.info}10`}
                      valueElement={
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p
                            className="text-sm font-bold font-mono"
                            style={{ color: COLORS.teal }}
                            dir="ltr"
                          >
                            {orderData.shipment?.trackingNumber}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(orderData.shipment?.trackingNumber || '');
                            }}
                            className="p-1 rounded-md transition-colors"
                            style={{
                              background: `${COLORS.teal}10`,
                              color: COLORS.teal,
                            }}
                            aria-label="Copy tracking number"
                          >
                            <Copy size={12} />
                          </button>
                          {orderData.shipment.carrier.trackingUrl && (
                            <a
                              href={orderData.shipment.carrier.trackingUrl.replace('{trackingNumber}', orderData.shipment.trackingNumber)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1"
                              style={{
                                background: `${COLORS.tealDark}12`,
                                color: COLORS.tealDark,
                                border: `1px solid ${COLORS.tealDark}25`,
                              }}
                            >
                              <ExternalLink size={10} />
                              {isRTL ? 'تتبع' : 'Track'}
                            </a>
                          )}
                        </div>
                      }
                    />
                  )}

                  {/* Shipment Status */}
                  <InfoRow
                    icon={<Package size={17} style={{ color: COLORS.danger }} />}
                    label={isRTL ? 'حالة الشحنة' : 'Shipment Status'}
                    value=""
                    darkMode={darkMode}
                    iconBg={darkMode ? `${COLORS.danger}15` : `${COLORS.danger}10`}
                    valueElement={
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mt-1"
                        style={{
                          background: orderData.shipment.status === 'delivered'
                            ? `${COLORS.success}15`
                            : `${COLORS.teal}12`,
                          color: orderData.shipment.status === 'delivered'
                            ? COLORS.success
                            : COLORS.teal,
                        }}
                      >
                        {isRTL
                          ? { created: 'تم الإنشاء', picked_up: 'تم الاستلام', in_transit: 'في الطريق', out_for_delivery: 'خرج للتوصيل', delivered: 'تم التسليم', failed: 'فشل التوصيل', returned: 'تم الإرجاع' }[orderData.shipment.status] || orderData.shipment.status
                          : orderData.shipment.status.replace(/_/g, ' ')}
                      </span>
                    }
                  />

                  {/* Estimated delivery from shipment */}
                  {orderData.shipment.estimatedDelivery && (
                    <InfoRow
                      icon={<CalendarDays size={17} style={{ color: COLORS.teal }} />}
                      label={t('tracking.estimatedDeliveryDate')}
                      value={new Date(orderData.shipment.actualDelivery || orderData.shipment.estimatedDelivery).toLocaleDateString(
                        isRTL ? 'ar-LY' : 'en-US',
                        { weekday: 'long', month: 'long', day: 'numeric' }
                      )}
                      darkMode={darkMode}
                    />
                  )}

                  {/* Shipment tracking log */}
                  {orderData.shipment?.logs && orderData.shipment.logs.length > 0 && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: tc.border }}>
                      <p
                        className="text-xs font-semibold mb-3"
                        style={{ color: tc.textSub }}
                      >
                        {isRTL ? 'سجل التتبع' : 'Tracking Log'}
                      </p>
                      <div className="space-y-0">
                        {(showAllLogs ? orderData.shipment?.logs : orderData.shipment?.logs?.slice(0, 4))?.map((log, idx) => (
                          <div key={log.id} className="flex gap-3 relative">
                            {/* Mini timeline line */}
                            {idx < (showAllLogs ? (orderData.shipment?.logs?.length ?? 0) - 1 : Math.min(orderData.shipment?.logs?.length ?? 0, 4) - 1) && (
                              <div
                                className="absolute start-[7px] top-4 bottom-0 w-[1.5px]"
                                style={{ background: tc.border }}
                              />
                            )}
                            {/* Dot */}
                            <div
                              className="w-[15px] h-[15px] rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center"
                              style={{
                                background: idx === 0 ? `${COLORS.teal}20` : `${tc.border}`,
                                border: idx === 0 ? `1.5px solid ${COLORS.teal}` : `1.5px solid ${tc.border}`,
                              }}
                            >
                              <div
                                className="w-[5px] h-[5px] rounded-full"
                                style={{ background: idx === 0 ? COLORS.teal : tc.textMuted }}
                              />
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0 pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className="text-[11px] font-medium leading-tight"
                                  style={{ color: idx === 0 ? tc.text : tc.textSub }}
                                >
                                  {isRTL ? log.descriptionAr : log.descriptionEn || log.status.replace(/_/g, ' ')}
                                </p>
                                <span
                                  className="text-[9px] flex-shrink-0 mt-0.5"
                                  style={{ color: tc.textMuted }}
                                  dir="ltr"
                                >
                                  {new Date(log.occurredAt).toLocaleDateString(
                                    isRTL ? 'ar-LY' : 'en-US',
                                    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                  )}
                                </span>
                              </div>
                              {log.location && (
                                <p className="text-[9px] mt-0.5" style={{ color: tc.textMuted }}>
                                  📍 {log.location}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {orderData.shipment.logs.length > 4 && (
                        <motion.button
                          className="w-full mt-1 py-1.5 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1"
                          style={{
                            color: COLORS.teal,
                            background: `${COLORS.teal}08`,
                          }}
                          onClick={() => setShowAllLogs(!showAllLogs)}
                          whileTap={{ scale: 0.97 }}
                        >
                          {showAllLogs
                            ? (isRTL ? 'عرض أقل' : 'Show Less')
                            : (isRTL ? `عرض الكل (${orderData.shipment.logs.length})` : `Show All (${orderData.shipment.logs.length})`)}
                          <ChevronDown
                            size={10}
                            style={{
                              transform: showAllLogs ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.2s',
                            }}
                          />
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>
              </SectionCard>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ═══ Bottom Refresh Button ═══ */}
      <div
        className="absolute bottom-0 inset-x-0 z-20 px-4 pb-4 pt-8 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${tc.bg} 50%, transparent 100%)`,
        }}
      >
        <motion.button
          onClick={() => fetchOrder(true)}
          className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-white pointer-events-auto"
          style={{
            background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`,
            boxShadow: `0 4px 20px ${COLORS.teal}35`,
          }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ boxShadow: `0 6px 28px ${COLORS.teal}45` }}
          disabled={refreshing}
        >
          <AnimatePresence mode="wait">
            {refreshing ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Loader2 size={16} className="animate-spin" />
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <RefreshCw size={16} />
              </motion.div>
            )}
          </AnimatePresence>
          {refreshing
            ? (isRTL ? 'جاري التحديث...' : 'Refreshing...')
            : (isRTL ? 'تحديث حالة الطلب' : 'Refresh Order Status')}
        </motion.button>
      </div>
    </motion.div>
  );
}
