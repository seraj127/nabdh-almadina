'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cart-store';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useMobileStore } from '@/components/mobile/lib/mobile-store';
import { getDeliveryPrice, getDeliveryDuration } from '../lib/libya-delivery-data';
import { CheckoutFlow } from './checkout-flow';
import { OrderTrackingScreen } from './order-tracking';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  X,
  Check,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Package,
  Lock,
  User,
  Zap,
  Gift,
  Loader2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// BRAND COLORS
// ═══════════════════════════════════════════════════════════════════════
const COLORS = {
  primary: '#004B63',
  primaryLight: '#006B8A',
  accent: '#00A8CC',
  secondary: '#FF6F61',
  teal: '#00897B',
  gold: '#D4A843',
  dark: '#0D1117',
  success: '#238636',
  warning: '#D29922',
  error: '#FF3B30',
  surface: '#F8F9FA',
  border: '#E5E5E5',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textDisabled: '#999999',
} as const;

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 22 },
  },
};

const cartItemVariants = {
  initial: { opacity: 1, scale: 1, x: 0 },
  exit: (dir: number) => ({
    opacity: 0,
    scale: 0.85,
    x: dir * 120,
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  }),
};

const shimmerVariants = {
  animate: {
    x: ['-100%', '200%'],
  },
  transition: {
    duration: 2.2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

// ═══════════════════════════════════════════════════════════════════════
// TRUST BADGES DATA
// ═══════════════════════════════════════════════════════════════════════
const TRUST_BADGES = [
  {
    icon: Lock,
    labelAr: 'دفع آمن',
    labelEn: 'Secure Payment',
    color: COLORS.teal,
  },
  {
    icon: Truck,
    labelAr: 'توصيل سريع',
    labelEn: 'Fast Delivery',
    color: COLORS.accent,
  },
  {
    icon: RotateCcw,
    labelAr: 'إرجاع سهل',
    labelEn: 'Easy Returns',
    color: COLORS.gold,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// GLASS CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════
function GlassCard({
  children,
  className = '',
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  const darkMode = useMobileStore((s) => s.darkMode);
  return (
    <div
      className={`${noPadding ? '' : 'p-4'} rounded-2xl ${className}`}
      style={{
        background: darkMode ? 'rgba(17, 24, 39, 0.85)' : 'rgba(255, 255, 255, 0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.12)' : COLORS.border}`,
        boxShadow: darkMode ? '0 2px 16px rgba(0, 0, 0, 0.4)' : '0 2px 16px rgba(0, 75, 99, 0.06)',
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN CART TAB COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function CartTab() {
  const { t, language } = useLanguageStore();
  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';
  const darkMode = useMobileStore((s) => s.darkMode);

  // Resolve theme-aware colors
  const textPrimary = darkMode ? '#F3F4F6' : COLORS.textPrimary;
  const textSecondary = darkMode ? '#9CA3AF' : COLORS.textSecondary;
  const surface = darkMode ? '#151D2E' : COLORS.surface;
  const borderColor = darkMode ? 'rgba(255,255,255,0.12)' : COLORS.border;

  // ─── Store Hooks ────────────────────────────────────────────────────
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const fetchFromServer = useCartStore((s) => s.fetchFromServer);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDeliveryFee = useCartStore((s) => s.getDeliveryFee);
  const getTotal = useCartStore((s) => s.getTotal);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const isLoggedIn = useUIStore((s) => s.isLoggedIn);
  const currentUser = useUIStore((s) => s.currentUser);

  // ─── Fetch user's default address for delivery info ────────────────
  const [defaultAddress, setDefaultAddress] = useState<{ city: string; area?: string } | null>(null);
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    fetch(`/api/addresses?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses && data.addresses.length > 0) {
          const defAddr = data.addresses.find((a: { isDefault: boolean }) => a.isDefault) || data.addresses[0];
          setDefaultAddress({ city: defAddr.city, area: defAddr.area });
        }
      })
      .catch(() => {});
  }, [isLoggedIn, currentUser?.id]);

  // ─── Pull the cart from the server when the tab opens / login changes ──
  // Keeps the mobile cart in sync with items added on the web store.
  useEffect(() => {
    if (currentUser?.id && !currentUser.id.startsWith('local-')) {
      fetchFromServer().catch(() => {});
    }
  }, [currentUser?.id, fetchFromServer]);

  // ─── Local State ────────────────────────────────────────────────────
  const [showCheckoutFlow, setShowCheckoutFlow] = useState(false);
  const [trackingOrderNum, setTrackingOrderNum] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [savedForLater, setSavedForLater] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponPercentage, setCouponPercentage] = useState(0);
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // ─── Computed Values ────────────────────────────────────────────────
  const subtotal = getSubtotal();
  const deliveryFee = defaultAddress ? getDeliveryPrice(defaultAddress.city, defaultAddress.area || '') : getDeliveryFee();
  const deliveryDuration = defaultAddress ? getDeliveryDuration(defaultAddress.city, defaultAddress.area || '') : '';
  const totalItems = getTotalItems();
  const discountAmount = couponDiscount;
  const totalAmount = subtotal + deliveryFee - discountAmount;

  // ─── Helper: Translate with fallback ────────────────────────────────
  const tx = useCallback(
    (key: string, fallbackAr: string, fallbackEn?: string) => {
      const val = t(key);
      if (val === key) return isRTL ? fallbackAr : (fallbackEn || fallbackAr);
      return val;
    },
    [t, isRTL]
  );

  // ─── Handle Remove Item ─────────────────────────────────────────────
  const handleRemove = useCallback(
    (id: string) => {
      setRemovingId(id);
      setTimeout(() => {
        removeItem(id);
        setRemovingId(null);
      }, 280);
    },
    [removeItem]
  );

  // ─── Handle Save for Later ──────────────────────────────────────────
  const toggleSaveForLater = useCallback((id: string) => {
    setSavedForLater((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  // ─── Handle Checkout ────────────────────────────────────────────────
  const handleCheckout = useCallback(() => {
    if (!isLoggedIn || !currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    setShowCheckoutFlow(true);
  }, [isLoggedIn, currentUser]);

  // ─── Apply Coupon ───────────────────────────────────────────────────
  const handleApplyCoupon = useCallback(async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError(isRTL ? 'يرجى إدخال كود الخصم' : 'Please enter a coupon code');
      setCouponSuccess('');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal, userId: currentUser?.id }),
      });

      const data = await res.json();
      if (res.ok && data.valid && data.coupon) {
        const discount = Number(data.coupon.discount) || 0;
        const isPercent = data.coupon.type === 'percentage';
        const couponVal = Number(data.coupon.value) || 0;
        setCouponDiscount(discount);
        setCouponType(isPercent ? 'percentage' : 'fixed');
        setCouponValue(couponVal);
        setCouponPercentage(isPercent ? couponVal : 0);
        setCouponApplied(true);
        setCouponSuccess(
          isRTL
            ? `تم تطبيق الخصم ${isPercent ? `${couponVal}%` : `${discount} د.ل`}`
            : `Discount applied: ${isPercent ? `${couponVal}%` : `${discount} LYD`}`
        );
      } else {
        setCouponError(data.error || (isRTL ? 'كود الخصم غير صالح' : 'Invalid coupon code'));
      }
    } catch {
      setCouponError(isRTL ? 'كود الخصم غير صالح' : 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, subtotal, isRTL, currentUser]);

  // ─── Remove Coupon ──────────────────────────────────────────────────
  const handleRemoveCoupon = useCallback(() => {
    setCouponCode('');
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponPercentage(0);
    setCouponType('percentage');
    setCouponValue(0);
    setCouponError('');
    setCouponSuccess('');
  }, []);

  // ─── Clear Success/Error after delay ────────────────────────────────
  useEffect(() => {
    if (couponSuccess) {
      const timer = setTimeout(() => setCouponSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [couponSuccess]);

  // ═══════════════════════════════════════════════════════════════════
  // CHECKOUT FLOW OVERLAY
  // ═══════════════════════════════════════════════════════════════════
  if (showCheckoutFlow) {
    return (
      <CheckoutFlow
        onClose={() => setShowCheckoutFlow(false)}
        onTrackOrder={(orderNumber) => {
          setShowCheckoutFlow(false);
          setTrackingOrderNum(orderNumber);
        }}
        initialCoupon={
          couponApplied
            ? {
                code: couponCode.trim().toUpperCase(),
                type: couponType,
                value: couponValue,
                discount: couponDiscount,
              }
            : null
        }
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ORDER TRACKING OVERLAY
  // ═══════════════════════════════════════════════════════════════════
  if (trackingOrderNum) {
    return (
      <OrderTrackingScreen
        orderNumber={trackingOrderNum}
        onClose={() => setTrackingOrderNum(null)}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // EMPTY CART STATE
  // ═══════════════════════════════════════════════════════════════════
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col" dir={direction}>
        {/* Gradient Header */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.teal} 100%)`,
          }}
        >
          {/* Decorative circles */}
          <motion.div
            className="absolute -top-10 -start-10 w-40 h-40 rounded-full"
            style={{
              background: `radial-gradient(circle, ${COLORS.accent}15 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-2 end-2 w-28 h-28 rounded-full"
            style={{
              background: `radial-gradient(circle, ${COLORS.gold}12 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Wave SVG */}
          <svg
            className="absolute bottom-0 start-0 w-full"
            viewBox="0 0 430 30"
            preserveAspectRatio="none"
            style={{ height: 18 }}
          >
            <path
              d="M0 15 Q107 0 215 15 Q322 30 430 15 V30 H0 Z"
              fill="#FFFFFF"
            />
          </svg>

          {/* Header content */}
          <div className="relative z-10 px-5 pt-10 pb-8">
            <h1 className="text-white text-xl font-bold">
              {tx('mobile.cart.title', 'سلة التسوق', 'Shopping Cart')}
            </h1>
            <p className="text-white/50 text-xs mt-1">
              {isRTL ? '0 منتجات' : '0 items'}
            </p>
          </div>
        </div>

        {/* Empty state content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-8">
          {/* Floating animated cart icon */}
          <motion.div
            className="relative mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${COLORS.accent}12 0%, transparent 70%)`,
                transform: 'scale(1.5)',
              }}
              animate={{ scale: [1.4, 1.7, 1.4], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="w-32 h-32 rounded-full flex items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${COLORS.accent}08, ${COLORS.teal}08)`,
                border: `2px solid ${COLORS.accent}15`,
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ShoppingCart size={52} style={{ color: COLORS.accent }} strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          <motion.h2
            className="text-xl font-bold mb-2"
            style={{ color: textPrimary }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isRTL ? 'سلة التسوق فارغة' : 'Your cart is empty'}
          </motion.h2>

          <motion.p
            className="text-sm text-center mb-6"
            style={{ color: textSecondary }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {tx('mobile.cart.emptyMessage', 'لم تضف أي منتجات بعد', "You haven't added any products yet")}
          </motion.p>

          <motion.button
            className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.teal})`,
              boxShadow: `0 4px 16px ${COLORS.accent}30`,
            }}
            whileHover={{ scale: 1.03, boxShadow: `0 6px 24px ${COLORS.accent}40` }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => useMobileStore.getState().setActiveTab('home')}
          >
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
              }}
              animate={shimmerVariants.animate}
              transition={shimmerVariants.transition}
            />
            <span className="relative z-10 flex items-center gap-2">
              {isRTL ? 'تسوق الآن' : 'Shop Now'}
              {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </span>
          </motion.button>

          {/* Trust Badges in empty state */}
          <motion.div
            className="flex items-center gap-6 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {TRUST_BADGES.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${badge.color}10`,
                      border: `1px solid ${badge.color}20`,
                    }}
                  >
                    <Icon size={18} style={{ color: badge.color }} />
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: textSecondary }}>
                    {isRTL ? badge.labelAr : badge.labelEn}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // CART WITH ITEMS
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="h-full flex flex-col" dir={direction}>
      {/* ═══ GRADIENT HEADER WITH WAVE ═══ */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 45%, ${COLORS.teal} 100%)`,
        }}
      >
        {/* Decorative circles */}
        <motion.div
          className="absolute -top-8 -start-8 w-36 h-36 rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.accent}18 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 end-0 w-28 h-28 rounded-full"
          style={{
            background: `radial-gradient(circle, ${COLORS.gold}12 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        {/* Wave SVG */}
        <svg
          className="absolute bottom-0 start-0 w-full"
          viewBox="0 0 430 30"
          preserveAspectRatio="none"
          style={{ height: 18 }}
        >
          <path
            d="M0 15 Q107 0 215 15 Q322 30 430 15 V30 H0 Z"
            fill="#FFFFFF"
          />
        </svg>

        {/* Header content */}
        <div className="relative z-10 px-5 pt-10 pb-8 flex items-center justify-between">
          <div>
            <motion.h1
              className="text-white text-xl font-bold"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              {tx('mobile.cart.title', 'سلة التسوق', 'Shopping Cart')}
            </motion.h1>
            <motion.div
              className="flex items-center gap-2 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <span className="text-white/50 text-xs">
                {totalItems} {tx('mobile.cart.itemCount', 'منتج', 'items')}
              </span>
              {/* Item count badge */}
              <motion.div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.secondary}, #E85D50)`,
                }}
                key={totalItems}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {totalItems}
              </motion.div>
            </motion.div>
          </div>

          {/* Clear cart button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowClearConfirm(true)}
            className="text-white/50 hover:text-white text-xs flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors"
            style={{ background: 'rgba(255,255,255,0.10)' }}
          >
            <Trash2 size={14} />
            {tx('mobile.cart.clear', 'تفريغ', 'Clear')}
          </motion.button>
        </div>
      </div>

      {/* ═══ CLEAR CART CONFIRMATION ═══ */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            className="mx-4 -mt-1 mb-2 rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: `${COLORS.error}08`,
              border: `1px solid ${COLORS.error}20`,
            }}
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} style={{ color: COLORS.error }} />
              <p className="text-sm font-medium flex-1" style={{ color: COLORS.error }}>
                {isRTL ? 'هل تريد تفريغ السلة؟' : 'Clear all items from cart?'}
              </p>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    clearCart();
                    handleRemoveCoupon();
                    setShowClearConfirm(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: COLORS.error }}
                >
                  {isRTL ? 'نعم' : 'Yes'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: `${borderColor}`, color: textSecondary }}
                >
                  {isRTL ? 'لا' : 'No'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ LOGIN PROMPT ═══ */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            className="mx-4 mt-2 mb-2 rounded-2xl p-3.5 flex items-center gap-3"
            style={{
              background: `${COLORS.warning}08`,
              border: `1px solid ${COLORS.warning}20`,
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <User size={20} style={{ color: COLORS.warning }} className="flex-shrink-0" />
            <p className="text-xs font-semibold flex-1" style={{ color: COLORS.warning }}>
              {tx('mobile.profile.signInToEnjoy', 'سجّل دخولك للاستمتاع بجميع المزايا', 'Sign in to enjoy all features')}
            </p>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="flex-shrink-0"
              style={{ color: `${COLORS.warning}80` }}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        <motion.div
          className="space-y-3 px-4 pt-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ═══ DELIVERY NOTE ═══ */}
          <motion.div variants={itemVariants}>
            <div
              className="rounded-2xl p-3.5 flex items-center gap-3"
              style={{
                background: `${COLORS.teal}06`,
                border: `1px solid ${COLORS.teal}15`,
              }}
            >
              <Truck size={18} style={{ color: COLORS.teal }} />
              <span className="text-xs font-semibold" style={{ color: COLORS.teal }}>
                {isRTL ? '🚚 رسوم التوصيل حسب المنطقة المختارة' : '🚚 Delivery fee based on selected area'}
              </span>
            </div>
          </motion.div>

          {/* ═══ CART ITEMS ═══ */}
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const isSaved = savedForLater.includes(item.productId);
              const isRemoving = removingId === item.productId;
              const isLowStock = item.stock <= 5 && item.stock > 0;
              const exitDir = isRTL ? -1 : 1;

              return (
                <motion.div
                  key={item.productId}
                  layout
                  variants={cartItemVariants}
                  initial="initial"
                  exit="exit"
                  custom={exitDir}
                  className="rounded-2xl relative overflow-hidden"
                  style={{
                    background: isRemoving
                      ? `${COLORS.error}08`
                      : 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${isRemoving ? `${COLORS.error}30` : borderColor}`,
                    boxShadow: isRemoving
                      ? `0 2px 12px ${COLORS.error}10`
                      : '0 2px 12px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="p-3 flex gap-3">
                    {/* Product Image - 80x80px */}
                    <div
                      className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative"
                      style={{
                        background: surface,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={isRTL ? item.nameAr : item.nameEn}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={28} style={{ color: COLORS.textDisabled }} />
                        </div>
                      )}
                      {/* Low stock badge on image */}
                      {isLowStock && (
                        <motion.div
                          className="absolute top-1 start-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold text-white"
                          style={{ background: COLORS.warning }}
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {isRTL ? 'محدود' : 'Low'}
                        </motion.div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Name row */}
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="text-sm font-bold truncate"
                            style={{ color: textPrimary }}
                          >
                            {isRTL ? item.nameAr : item.nameEn}
                          </h3>
                          {/* Delete button */}
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => handleRemove(item.productId)}
                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{
                              color: isRemoving ? COLORS.error : COLORS.textDisabled,
                              background: isRemoving ? `${COLORS.error}10` : 'transparent',
                            }}
                            whileHover={{ background: `${COLORS.error}10`, color: COLORS.error }}
                          >
                            <Trash2 size={15} />
                          </motion.button>
                        </div>

                        {/* Price */}
                        <p
                          className="text-sm font-bold mt-0.5"
                          style={{ color: COLORS.primary }}
                        >
                          {(item.price * item.quantity).toFixed(2)}{' '}
                          {tx('product.currency', 'د.ل', 'LYD')}
                        </p>

                        {/* Low stock warning */}
                        {isLowStock && (
                          <motion.div
                            className="flex items-center gap-1 mt-1"
                            initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <AlertTriangle size={10} style={{ color: COLORS.warning }} />
                            <span className="text-[10px] font-medium" style={{ color: COLORS.warning }}>
                              {isRTL
                                ? `متبقي ${item.stock} فقط!`
                                : `Only ${item.stock} left!`}
                            </span>
                          </motion.div>
                        )}
                      </div>

                      {/* Bottom row: quantity + save for later */}
                      <div className="flex items-center justify-between mt-1.5">
                        {/* Animated Quantity Controls */}
                        <div
                          className="flex items-center gap-1 rounded-xl overflow-hidden"
                          style={{
                            background: surface,
                            border: `1px solid ${borderColor}`,
                          }}
                        >
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center transition-colors"
                            style={{ color: textSecondary }}
                            whileHover={{ background: `${COLORS.primary}10` }}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </motion.button>

                          <motion.span
                            className="text-sm font-bold w-8 text-center"
                            style={{ color: COLORS.primary }}
                            key={item.quantity}
                            initial={{ scale: 1.3, color: COLORS.accent }}
                            animate={{ scale: 1, color: COLORS.primary }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.quantity}
                          </motion.span>

                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-white"
                            style={{
                              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                            }}
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus size={14} />
                          </motion.button>
                        </div>

                        {/* Save for Later */}
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleSaveForLater(item.productId)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors"
                          style={{
                            color: isSaved ? COLORS.accent : COLORS.textDisabled,
                            background: isSaved ? `${COLORS.accent}10` : 'transparent',
                          }}
                          whileHover={{
                            background: isSaved ? `${COLORS.accent}15` : `${surface}`,
                          }}
                        >
                          {isSaved ? (
                            <BookmarkCheck size={14} />
                          ) : (
                            <Bookmark size={14} />
                          )}
                          <span className="text-[10px] font-medium">
                            {isSaved
                              ? isRTL
                                ? 'محفوظ'
                                : 'Saved'
                              : isRTL
                                ? 'حفظ'
                                : 'Save'}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* ═══ EXPECTED DELIVERY ═══ */}
          <motion.div variants={itemVariants}>
            <div
              className="rounded-2xl p-3.5 flex items-center gap-3"
              style={{
                background: `${COLORS.accent}06`,
                border: `1px solid ${COLORS.accent}15`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${COLORS.accent}10`,
                  border: `1px solid ${COLORS.accent}20`,
                }}
              >
                <Clock size={18} style={{ color: COLORS.accent }} />
              </div>
              <div className="flex-1">
                <p className="text-xs" style={{ color: textSecondary }}>
                  {isRTL ? 'التوصيل المتوقع' : 'Estimated Delivery'}
                </p>
                <p className="text-sm font-bold" style={{ color: textPrimary }}>
                  {defaultAddress
                    ? deliveryDuration
                    : `2-3 ${isRTL ? 'أيام' : 'days'}`
                  }
                </p>
                {defaultAddress && (
                  <p className="text-[10px] mt-0.5" style={{ color: COLORS.textDisabled }}>
                    {isRTL ? 'إلى' : 'To'} {defaultAddress.area || defaultAddress.city}
                  </p>
                )}
              </div>
              <Zap size={16} style={{ color: COLORS.accent }} />
            </div>
          </motion.div>

          {/* ═══ COUPON / DISCOUNT SECTION ═══ */}
          <motion.div variants={itemVariants}>
            <GlassCard>
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${COLORS.secondary}10`,
                    border: `1px solid ${COLORS.secondary}20`,
                  }}
                >
                  <Tag size={16} style={{ color: COLORS.secondary }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: COLORS.primary }}>
                  {tx('coupon.title', 'كوبون الخصم', 'Discount Coupon')}
                </h3>
              </div>

              {!couponApplied ? (
                <div className="space-y-2.5">
                  {/* Input + Apply button */}
                  <div className="flex gap-2">
                    <div
                      className="flex-1 rounded-xl overflow-hidden flex items-center"
                      style={{
                        border: `1.5px solid ${couponError ? COLORS.error : borderColor}`,
                        background: surface,
                      }}
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                        style={{ color: COLORS.textDisabled }}
                      >
                        <Tag size={14} />
                      </div>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                          setCouponSuccess('');
                        }}
                        placeholder={tx('coupon.placeholder', 'أدخل كود الخصم', 'Enter coupon code')}
                        className="flex-1 h-10 text-sm font-medium outline-none bg-transparent placeholder:text-gray-400"
                        style={{
                          textAlign: isRTL ? 'right' : 'left',
                          color: textPrimary,
                        }}
                        dir="ltr"
                        maxLength={20}
                      />
                    </div>
                    <motion.button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-5 h-10 rounded-xl text-white text-sm font-bold relative overflow-hidden flex items-center justify-center gap-2 flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS.secondary}, #E85D50)`,
                        opacity: couponLoading || !couponCode.trim() ? 0.6 : 1,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {couponLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 size={16} />
                        </motion.div>
                      ) : (
                        <>
                          <Check size={14} />
                          {tx('coupon.apply', 'تطبيق', 'Apply')}
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {couponError && (
                      <motion.div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: `${COLORS.error}08`,
                          border: `1px solid ${COLORS.error}20`,
                        }}
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                      >
                        <X size={12} style={{ color: COLORS.error }} />
                        <span className="text-xs font-medium" style={{ color: COLORS.error }}>
                          {couponError}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success message */}
                  <AnimatePresence>
                    {couponSuccess && (
                      <motion.div
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{
                          background: `${COLORS.success}08`,
                          border: `1px solid ${COLORS.success}20`,
                        }}
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                      >
                        <Check size={12} style={{ color: COLORS.success }} />
                        <span className="text-xs font-medium" style={{ color: COLORS.success }}>
                          {couponSuccess}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Available coupons hint */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <Gift size={12} style={{ color: COLORS.textDisabled }} />
                    <span className="text-[10px]" style={{ color: COLORS.textDisabled }}>
                      {isRTL ? 'جرّب: WELCOME10 أو NABD20' : 'Try: WELCOME10 or NABD20'}
                    </span>
                  </div>
                </div>
              ) : (
                /* Applied coupon display */
                <motion.div
                  className="rounded-xl p-3 flex items-center gap-3"
                  style={{
                    background: `${COLORS.success}06`,
                    border: `1px solid ${COLORS.success}20`,
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${COLORS.success}12`,
                      border: `1px solid ${COLORS.success}25`,
                    }}
                  >
                    <Tag size={16} style={{ color: COLORS.success }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: textPrimary }}>
                        {couponCode}
                      </span>
                      {couponPercentage > 0 && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            color: COLORS.success,
                            background: `${COLORS.success}12`,
                          }}
                        >
                          -{couponPercentage}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.success }}>
                      {isRTL
                        ? `خصم ${discountAmount.toFixed(2)} د.ل`
                        : `Saving ${discountAmount.toFixed(2)} LYD`}
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={handleRemoveCoupon}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      color: COLORS.error,
                      background: `${COLORS.error}10`,
                    }}
                  >
                    <X size={14} />
                  </motion.button>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>

          {/* ═══ PRICE SUMMARY ═══ */}
          <motion.div variants={itemVariants}>
            <GlassCard>
              <h3 className="text-sm font-bold mb-3" style={{ color: COLORS.primary }}>
                {tx('checkout.orderSummary', 'ملخص الطلب', 'Order Summary')}
              </h3>

              {/* Subtotal */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm" style={{ color: textSecondary }}>
                  {tx('mobile.cart.subtotal', 'المجموع الفرعي', 'Subtotal')}
                </span>
                <span className="text-sm font-semibold" style={{ color: textPrimary }}>
                  {subtotal.toFixed(2)} {tx('product.currency', 'د.ل', 'LYD')}
                </span>
              </div>

              {/* Delivery Fee */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm" style={{ color: textSecondary }}>
                  {tx('mobile.cart.delivery', 'التوصيل', 'Delivery')}
                </span>
                {deliveryFee === 0 ? (
                  <span
                    className="text-sm font-bold px-2.5 py-0.5 rounded-lg"
                    style={{
                      color: COLORS.success,
                      background: `${COLORS.success}10`,
                    }}
                  >
                    {tx('mobile.cart.free', 'مجاني', 'Free')}
                  </span>
                ) : (
                  <span className="text-sm font-semibold" style={{ color: textPrimary }}>
                    {deliveryFee.toFixed(2)} {tx('product.currency', 'د.ل', 'LYD')}
                  </span>
                )}
              </div>

              {/* Discount */}
              {couponApplied && discountAmount > 0 && (
                <motion.div
                  className="flex items-center justify-between mb-2.5"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <span className="text-sm flex items-center gap-1.5" style={{ color: COLORS.success }}>
                    <Sparkles size={12} />
                    {tx('coupon.discount', 'الخصم', 'Discount')}
                    {couponPercentage > 0 && (
                      <span className="text-xs font-bold">({couponPercentage}%)</span>
                    )}
                  </span>
                  <span className="text-sm font-bold" style={{ color: COLORS.success }}>
                    -{discountAmount.toFixed(2)} {tx('product.currency', 'د.ل', 'LYD')}
                  </span>
                </motion.div>
              )}

              {/* Gradient Divider */}
              <div
                className="h-px my-3"
                style={{
                  background: `linear-gradient(90deg, transparent, ${COLORS.primary}20, ${COLORS.teal}20, transparent)`,
                }}
              />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-base font-bold" style={{ color: textPrimary }}>
                  {tx('mobile.cart.total', 'الإجمالي', 'Total')}
                </span>
                <motion.span
                  className="text-lg font-bold"
                  style={{ color: COLORS.primary }}
                  key={totalAmount.toFixed(2)}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  {Math.max(totalAmount, 0).toFixed(2)} {tx('product.currency', 'د.ل', 'LYD')}
                </motion.span>
              </div>
            </GlassCard>
          </motion.div>

          {/* ═══ TRUST BADGES ═══ */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-around py-3 rounded-2xl"
            style={{
              background: surface,
              border: `1px solid ${borderColor}`,
            }}
          >
            {TRUST_BADGES.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${badge.color}10`,
                      border: `1px solid ${badge.color}18`,
                    }}
                  >
                    <Icon size={16} style={{ color: badge.color }} />
                  </div>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: textSecondary }}
                  >
                    {isRTL ? badge.labelAr : badge.labelEn}
                  </span>
                </div>
              );
            })}
          </motion.div>

          {/* Extra bottom padding for fixed checkout button */}
          <div className="h-4" />
        </motion.div>
      </div>

      {/* ═══ FIXED CHECKOUT BUTTON ═══ */}
      <div
        className="flex-shrink-0 px-4 pt-2 pb-20"
        style={{
          background: 'linear-gradient(to top, white 80%, transparent)',
        }}
      >
        {/* Login warning */}
        {!isLoggedIn && (
          <motion.div
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl"
            style={{
              background: `${COLORS.warning}08`,
              border: `1px solid ${COLORS.warning}15`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Lock size={12} style={{ color: COLORS.warning }} />
            <span className="text-[10px] font-medium" style={{ color: COLORS.warning }}>
              {isRTL
                ? 'سجّل دخولك لإتمام الشراء'
                : 'Sign in to checkout'}
            </span>
          </motion.div>
        )}

        <motion.button
          onClick={handleCheckout}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.teal})`,
            boxShadow: `0 4px 20px ${COLORS.accent}30`,
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: `0 6px 28px ${COLORS.accent}40`,
          }}
          whileTap={{ scale: 0.97 }}
        >
          {/* Shimmer animation */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }}
            animate={shimmerVariants.animate}
            transition={shimmerVariants.transition}
          />

          <span className="relative z-10 flex items-center gap-3">
            <ShoppingCart size={18} />
            {tx('mobile.cart.checkout', 'إتمام الشراء', 'Checkout')}
            <span
              className="px-3 py-1 rounded-xl text-sm font-bold"
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              {Math.max(totalAmount, 0).toFixed(2)} {tx('product.currency', 'د.ل', 'LYD')}
            </span>
          </span>
        </motion.button>
      </div>
    </div>
  );
}
