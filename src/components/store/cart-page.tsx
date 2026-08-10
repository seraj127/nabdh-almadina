'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  ArrowLeft,
  ArrowRight,
  Tag,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  HeadphonesIcon,
  Check,
  X,
  Package,
  AlertCircle,
  BadgePercent,
  Clock,
  CircleDollarSign,
  Gift,
  ChevronDown,
  ChevronUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useCartStore, type CartItem } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useLanguageStore } from '@/stores/language-store';
import { useCouponStore, calcCouponDiscount, validateCouponForSubtotal } from '@/stores/coupon-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { getDeliveryPrice, getDeliveryDuration } from '@/components/mobile/lib/libya-delivery-data';

// ─── Animated Number ─────────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const startValueRef = useRef(value);

  useEffect(() => {
    const startVal = startValueRef.current;
    const diff = value - startVal;
    if (Math.abs(diff) < 0.01) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Animation terminal state
      setDisplay(value);
      startValueRef.current = value;
      return;
    }
    const duration = 300;
    startTimeRef.current = performance.now();
    startValueRef.current = startVal;
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + diff * eased;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(value);
        startValueRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <>{display.toFixed(decimals)}</>;
}

// ─── Cart Item Card ──────────────────────────────────────────────────────
function CartItemCard({
  item,
  language,
  direction,
  currency,
  onUpdateQuantity,
  onRemove,
  index,
}: {
  item: CartItem;
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  currency: string;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  index: number;
}) {
  const isRTL = direction === 'rtl';
  const name = language === 'ar' ? item.nameAr : item.nameEn;
  const [isRemoving, setIsRemoving] = useState(false);
  const lineTotal = item.price * item.quantity;
  const isLowStock = item.stock <= 3 && item.stock > 0;
  const isInStock = item.stock > 0;

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(item.productId), 280);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isRemoving ? 0 : 1,
        x: isRemoving ? (isRTL ? -60 : 60) : 0,
        scale: isRemoving ? 0.9 : 1,
        height: isRemoving ? 0 : 'auto',
      }}
      exit={{ opacity: 0, x: isRTL ? -100 : 100, scale: 0.85, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: index * 0.03 }}
      layout
      className="overflow-hidden"
    >
      <div
        className={cn(
          'rounded-2xl overflow-hidden relative group',
          'glass-card hover-glow transition-all duration-300'
        )}
      >
        {/* Accent stripe */}
        <div
          className="absolute top-0 bottom-0 w-1"
          style={{
            background: 'linear-gradient(180deg, #00897B, #004B63)',
            ...(isRTL ? { right: 0 } : { left: 0 }),
          }}
        />

        <div className={cn('p-4 flex gap-4', isRTL ? 'pr-5 pl-4' : 'pl-5 pr-4')}>
          {/* Product Image */}
          <motion.div
            className="w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] rounded-xl overflow-hidden flex-shrink-0 relative"
            style={{ background: 'linear-gradient(135deg, rgba(0,75,99,0.08), rgba(0,168,204,0.08))' }}
            whileTap={{ scale: 0.95 }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={30} className="text-muted-foreground/40" />
              </div>
            )}
            {/* Quantity badge */}
            <div
              className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md px-1"
              style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
            >
              {item.quantity}
            </div>
          </motion.div>

          {/* Product Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Name */}
            <h3 className="text-sm sm:text-base font-bold truncate leading-tight text-foreground">
              {name}
            </h3>

            {/* Unit Price */}
            <span className="text-xs text-muted-foreground mt-1">
              {item.price.toFixed(2)} {currency} {isRTL ? 'للواحد' : 'each'}
            </span>

            {/* Stock Indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              {isInStock ? (
                isLowStock ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                    <AlertCircle size={10} />
                    {isRTL ? `متبقي ${item.stock} فقط!` : `Only ${item.stock} left!`}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                    <Check size={10} />
                    {isRTL ? 'متوفر' : 'In Stock'}
                  </span>
                )
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
                  <X size={10} />
                  {isRTL ? 'غير متوفر' : 'Out of Stock'}
                </span>
              )}
            </div>

            {/* Quantity Controls & Price */}
            <div className="flex items-center justify-between mt-2 gap-2">
              {/* Premium Quantity Stepper */}
              <div
                className="flex items-center rounded-full overflow-hidden"
                style={{
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  disabled={item.quantity <= 1}
                >
                  <Minus size={13} />
                </motion.button>
                <span className="text-sm font-bold min-w-[32px] text-center tabular-nums text-foreground">
                  {item.quantity}
                </span>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
                  disabled={item.quantity >= item.stock}
                >
                  <Plus size={13} />
                </motion.button>
              </div>

              {/* Line Total */}
              <span className="text-base sm:text-lg font-bold tabular-nums text-nabdh-price">
                <AnimatedNumber value={lineTotal} /> {currency}
              </span>
            </div>

            {/* Remove Button */}
            <div className="flex justify-end mt-1">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={handleRemove}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={12} />
                <span>{isRTL ? 'إزالة' : 'Remove'}</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Low Stock Banner */}
        {isLowStock && (
          <div
            className="px-4 py-1.5 text-[10px] font-semibold flex items-center gap-1.5"
            style={{
              background: 'rgba(210, 153, 34, 0.06)',
              color: '#D29922',
              borderTop: '1px solid rgba(210, 153, 34, 0.12)',
            }}
          >
            <AlertCircle size={10} />
            {isRTL ? `اطلب الآن — متبقي ${item.stock} فقط!` : `Order now — only ${item.stock} left!`}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Cart Page ───────────────────────────────────────────────────────────
export function CartPage() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({
    t: s.t, language: s.language, direction: s.direction,
  })));
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';
  const clearAuthView = useUIStore((s) => s.clearAuthView);

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const deliveryArea = useCartStore((s) => s.deliveryArea);
  const setDeliveryFee = useCartStore((s) => s.setDeliveryFee);
  const isLoggedIn = useUIStore((s) => s.isLoggedIn);
  const currentUser = useUIStore((s) => s.currentUser);

  const setAuthView = useUIStore((s) => s.setAuthView);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ─── Fetch user's default address to show delivery info ───
  const [defaultAddress, setDefaultAddress] = useState<{ city: string; area?: string } | null>(null);
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) return;
    fetch(`/api/addresses?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses && data.addresses.length > 0) {
          const defAddr = data.addresses.find((a: { isDefault: boolean }) => a.isDefault) || data.addresses[0];
          setDefaultAddress({ city: defAddr.city, area: defAddr.area });
          // Also update the cart store's delivery area
          const areaName = defAddr.area || defAddr.city;
          const fee = getDeliveryPrice(defAddr.city, defAddr.area || '');
          setDeliveryFee(fee, areaName);
        }
      })
      .catch(() => {});
  }, [isLoggedIn, currentUser?.id, setDeliveryFee]);
  const appliedCoupon = useCouponStore((s) => s.appliedCoupon);
  const applyCoupon = useCouponStore((s) => s.applyCoupon);
  const removeCoupon = useCouponStore((s) => s.removeCoupon);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(appliedCoupon !== null);

  const currency = t('product.currency');

  // Computed values
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  // Delivery fee: show when user has a default address, otherwise not yet determined
  const deliveryFee = useMemo(() => {
    if (defaultAddress) return getDeliveryPrice(defaultAddress.city, defaultAddress.area || '');
    return 0;
  }, [defaultAddress]);
  const deliveryDuration = useMemo(() => {
    if (defaultAddress) return getDeliveryDuration(defaultAddress.city, defaultAddress.area || '');
    return '';
  }, [defaultAddress]);
  // IMPORTANT: coupon discount is dynamically recalculated from current subtotal
  // rather than using the stale value stored at validation time
  const couponDiscount = useMemo(() => calcCouponDiscount(appliedCoupon, subtotal), [appliedCoupon, subtotal]);
  const cartTotal = useMemo(() => Math.max(0, subtotal + deliveryFee - couponDiscount), [subtotal, deliveryFee, couponDiscount]);
  const savingsAmount = useMemo(() => items.reduce((sum, item) => sum + (item.price > 50 ? item.price * 0.1 * item.quantity : 0), 0), [items]);

  // Auto-remove coupon if it becomes invalid (e.g. subtotal dropped below minOrder)
  const couponValidationError = useMemo(() => validateCouponForSubtotal(appliedCoupon, subtotal), [appliedCoupon, subtotal]);
  useEffect(() => {
    if (appliedCoupon && couponValidationError) {
      removeCoupon();
    }
  }, [appliedCoupon, couponValidationError, removeCoupon]);

  // Clear coupon when cart becomes empty
  useEffect(() => {
    if (items.length === 0 && appliedCoupon) {
      removeCoupon();
    }
  }, [items.length, appliedCoupon, removeCoupon]);

  // Coupon handler
  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    if (subtotal <= 0) {
      setCouponError(isAr ? 'أضف منتجات للسلة أولاً' : 'Add items to cart first');
      return;
    }
    setCouponApplying(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), subtotal, userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.valid && data.coupon) {
        applyCoupon({
          code: couponCode.trim().toUpperCase(),
          type: data.coupon.type as 'percentage' | 'fixed',
          value: Number(data.coupon.value),
          minOrder: Number(data.coupon.minOrder) || 0,
          maxDiscount: data.coupon.maxDiscount != null ? Number(data.coupon.maxDiscount) : null,
          discount: Number(data.coupon.discount) || 0,
        });
      } else {
        setCouponError(data.error || (isAr ? 'كود الخصم غير صالح' : 'Invalid coupon code'));
      }
    } catch {
      setCouponError(isAr ? 'فشل الاتصال بالخادم' : 'Connection failed');
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode('');
  };

  const couponLabel = useMemo(() => {
    if (!appliedCoupon) return '';
    if (appliedCoupon.type === 'percentage') return `${appliedCoupon.value}%`;
    return `${appliedCoupon.value} ${currency}`;
  }, [appliedCoupon, currency]);

  // Dynamic coupon display showing the actual computed discount
  const couponDisplayText = useMemo(() => {
    if (!appliedCoupon) return '';
    const discountStr = couponDiscount.toFixed(2);
    if (appliedCoupon.type === 'percentage') {
      return `${discountStr} ${currency} (${appliedCoupon.value}%)`;
    }
    return `${discountStr} ${currency}`;
  }, [appliedCoupon, couponDiscount, currency]);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      // Store where user wants to go after login, then redirect to login
      useUIStore.setState({ pendingAuthView: 'checkout' });
      useUIStore.getState().setAuthView('login');
      return;
    }
    setAuthView('checkout');
  };

  // ═══════════════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════════════════════════════════
  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)]" dir={direction}>
        {/* Header */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-16 -start-16 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -bottom-12 -end-12 w-36 h-36 rounded-full bg-white/5" />
          </div>

          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={clearAuthView}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                {isRTL ? <ArrowRight className="size-5 text-white" /> : <ArrowLeft className="size-5 text-white" />}
              </motion.button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {isAr ? 'سلة التسوق' : 'Shopping Cart'}
                </h1>
                <p className="text-white/50 text-xs sm:text-sm mt-0.5">
                  {isAr ? 'سلة تسوقك فارغة' : 'Your cart is empty'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            {/* Floating cart icon */}
            <motion.div
              className="relative mb-8"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="absolute -inset-8 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.12) 0%, transparent 70%)', filter: 'blur(16px)' }}
              />
              <div
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center relative z-10"
                style={{
                  background: 'rgba(0,168,204,0.06)',
                  border: '1px solid rgba(0,168,204,0.1)',
                }}
              >
                <ShoppingCart size={50} className="text-nabdh-accent/50" />
              </div>
            </motion.div>

            {/* Gradient text */}
            <h2
              className="text-2xl sm:text-3xl font-bold text-center"
              style={{
                background: 'linear-gradient(135deg, #00C4E8, #00897B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isAr ? 'سلة تسوقك فارغة' : 'Your Cart is Empty'}
            </h2>

            <p className="text-sm sm:text-base mt-3 text-muted-foreground max-w-md">
              {isAr ? 'لم تقم بإضافة أي منتجات بعد. اكتشف منتجاتنا المميزة وابدأ التسوق!' : 'You haven\'t added any products yet. Explore our featured products and start shopping!'}
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={clearAuthView}
              className="mt-8 px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg flex items-center gap-2 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
            >
              <ShoppingBag size={18} />
              <span>{isAr ? 'تسوق الآن' : 'Shop Now'}</span>
            </motion.button>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12">
              {[
                { icon: Truck, label: isAr ? 'توصيل سريع' : 'Fast Delivery', color: 'text-nabdh-accent' },
                { icon: ShieldCheck, label: isAr ? 'منتجات أصلية' : 'Authentic Products', color: 'text-emerald-500' },
                { icon: RotateCcw, label: isAr ? 'إرجاع سهل' : 'Easy Returns', color: 'text-amber-500' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                      <Icon className={`size-5 ${item.color}`} />
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground text-center">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN CART VIEW — Professional Full Page
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-[calc(100vh-4rem)]" dir={direction}>
      {/* ─── Gradient Header ─── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -start-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -end-12 w-36 h-36 rounded-full bg-white/5" />
          <div className="absolute top-1/3 end-16 w-20 h-20 rounded-full bg-white/3" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Back Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={clearAuthView}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  {isRTL ? <ArrowRight className="size-5 text-white" /> : <ArrowLeft className="size-5 text-white" />}
                </motion.button>

                {/* Cart Icon with Badge */}
                <div className="relative">
                  <ShoppingCart size={24} className="text-white" />
                  <div
                    className="absolute -top-2 -right-2 min-w-[20px] h-[20px] rounded-full flex items-center justify-center text-white text-[10px] font-bold px-1 shadow-md"
                    style={{ background: '#FF6F61', boxShadow: '0 2px 8px rgba(255,111,97,0.4)' }}
                  >
                    {totalItems}
                  </div>
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {isAr ? 'سلة التسوق' : 'Shopping Cart'}
                  </h1>
                  <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                    {totalItems} {isAr ? 'منتج في السلة' : 'items in cart'}
                  </p>
                </div>
              </div>

              {/* Clear Cart Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowClearConfirm(true)}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={18} className="text-white/70" />
              </motion.button>
            </div>

            {/* Quick Stats Row */}
            <motion.div
              className="mt-4 grid grid-cols-3 gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center">
                <p className="text-white/50 text-[10px] sm:text-xs font-medium">
                  {isAr ? 'المجموع الفرعي' : 'Subtotal'}
                </p>
                <p className="text-white text-sm sm:text-base font-bold mt-0.5">
                  <AnimatedNumber value={subtotal} /> {currency}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center">
                <p className="text-white/50 text-[10px] sm:text-xs font-medium">
                  {isAr ? 'المنتجات' : 'Items'}
                </p>
                <p className="text-white text-sm sm:text-base font-bold mt-0.5">
                  {totalItems}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center">
                <p className="text-white/50 text-[10px] sm:text-xs font-medium">
                  {isAr ? 'التوفير' : 'Savings'}
                </p>
                <p className="text-amber-400 text-sm sm:text-base font-bold mt-0.5">
                  <AnimatedNumber value={savingsAmount} /> {currency}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ─── Left Column: Cart Items ─── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Items Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {isAr ? 'المنتجات' : 'Items'} ({totalItems})
              </h2>
              {items.length > 1 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} />
                  {isAr ? 'إفراغ السلة' : 'Clear All'}
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => (
                  <CartItemCard
                    key={item.productId}
                    item={item}
                    language={language}
                    direction={direction}
                    currency={currency}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Coupon Section */}
            <motion.div
              className="glass-card rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setShowCouponInput(!showCouponInput)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-nabdh-primary/10 flex items-center justify-center">
                    <BadgePercent size={20} className="text-nabdh-primary" />
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-bold text-foreground">
                      {isAr ? 'كود الخصم' : 'Coupon Code'}
                    </p>
                    {appliedCoupon ? (
                      <p className="text-xs text-emerald-500 font-medium">
                        {appliedCoupon.code} — {isAr ? 'خصم' : 'Discount'} {couponDisplayText}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {isAr ? 'هل لديك كود خصم؟' : 'Have a promo code?'}
                      </p>
                    )}
                  </div>
                </div>
                {showCouponInput ? (
                  <ChevronUp size={18} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={18} className="text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {showCouponInput && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <Separator />

                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <div className="flex items-center gap-2">
                            <Tag size={16} className="text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-600">
                              {appliedCoupon.code}
                            </span>
                            <Badge className="bg-emerald-500 text-white text-[10px] border-0">
                              -{couponDiscount.toFixed(2)} {currency}
                            </Badge>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <Input
                              value={couponCode}
                              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                              placeholder={isAr ? 'أدخل كود الخصم' : 'Enter promo code'}
                              className="flex-1"
                              dir="ltr"
                              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            />
                            <Button
                              onClick={handleApplyCoupon}
                              disabled={couponApplying || !couponCode.trim()}
                              className="nabdh-gradient text-white hover:opacity-90 px-6"
                            >
                              {couponApplying ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                  <RotateCcw size={16} />
                                </motion.div>
                              ) : (
                                isAr ? 'تطبيق' : 'Apply'
                              )}
                            </Button>
                          </div>
                          {couponError && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {couponError}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { icon: ShieldCheck, label: isAr ? 'منتجات أصلية' : 'Authentic', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: Truck, label: isAr ? 'توصيل سريع' : 'Fast Delivery', color: 'text-nabdh-accent', bg: 'bg-nabdh-accent/10' },
                { icon: RotateCcw, label: isAr ? 'إرجاع سهل' : 'Easy Returns', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { icon: HeadphonesIcon, label: isAr ? 'دعم 24/7' : '24/7 Support', color: 'text-nabdh-primary', bg: 'bg-nabdh-primary/10' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="glass-card rounded-xl p-3 flex items-center gap-2.5">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', item.bg)}>
                      <Icon size={16} className={item.color} />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground leading-tight">{item.label}</span>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* ─── Right Column: Order Summary ─── */}
          <div className="lg:col-span-1">
            <motion.div
              className="glass-card rounded-2xl p-5 sm:p-6 sticky top-20 space-y-5"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Summary Header */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nabdh-primary/10 flex items-center justify-center">
                  <CircleDollarSign size={20} className="text-nabdh-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {isAr ? 'ملخص الطلب' : 'Order Summary'}
                </h3>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="text-sm font-medium text-foreground">
                    <AnimatedNumber value={subtotal} /> {currency}
                  </span>
                </div>

                {/* Delivery Fee */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Truck size={13} className="text-nabdh-accent" />
                    {isAr ? 'رسوم التوصيل' : 'Delivery Fee'}
                  </span>
                  {defaultAddress ? (
                    <span className="text-sm font-medium text-foreground">
                      <AnimatedNumber value={deliveryFee} /> {currency}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-nabdh-accent">
                      {isAr ? 'اختر مدينتك' : 'Choose your city'}
                    </span>
                  )}
                </div>

                {/* Coupon Discount */}
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Tag size={12} className="text-emerald-500" />
                      {isAr ? 'خصم الكوبون' : 'Coupon Discount'}
                    </span>
                    <span className="text-sm font-medium text-emerald-500">
                      -<AnimatedNumber value={couponDiscount} /> {currency}
                    </span>
                  </div>
                )}

                {/* Savings Indicator */}
                {savingsAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Gift size={12} className="text-amber-500" />
                      {isAr ? 'التوفير' : 'Savings'}
                    </span>
                    <span className="text-sm font-medium text-amber-500">
                      <AnimatedNumber value={savingsAmount} /> {currency}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-foreground">{isAr ? 'الإجمالي' : 'Total'}</span>
                <span className="text-2xl font-bold text-nabdh-price tabular-nums">
                  <AnimatedNumber value={cartTotal} /> {currency}
                </span>
              </div>

              {/* Estimated Delivery — show specific estimate when user has address */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 text-xs text-muted-foreground">
                <Clock size={14} className="text-nabdh-accent shrink-0" />
                {defaultAddress ? (
                  <span>
                    {isAr
                      ? `التوصيل المتوقع: ${deliveryDuration} إلى ${defaultAddress.area || defaultAddress.city}`
                      : `Estimated delivery: ${deliveryDuration} to ${defaultAddress.area || defaultAddress.city}`
                    }
                  </span>
                ) : deliveryArea ? (
                  <span>
                    {isAr ? `التوصيل المتوقع: خلال 1-3 أيام عمل إلى ${deliveryArea}` : `Estimated delivery: within 1-3 business days to ${deliveryArea}`}
                  </span>
                ) : (
                  <span>
                    {isAr ? 'حدد منطقة التوصيل عند الدفع لمعرفة الوقت المتوقع' : 'Select delivery area at checkout to see estimated time'}
                  </span>
                )}
              </div>

              {/* Checkout Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full py-3.5 rounded-xl text-white font-bold text-base shadow-lg relative overflow-hidden flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #004B63, #00897B)',
                  boxShadow: '0 4px 20px rgba(0,75,99,0.3)',
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <CreditCard size={20} className="relative z-10" />
                <span className="relative z-10">
                  {!isLoggedIn
                    ? (isAr ? 'سجل الدخول للمتابعة' : 'Sign in to Checkout')
                    : (isAr ? 'إتمام الشراء' : 'Proceed to Checkout')
                  }
                </span>
              </motion.button>

              {/* Continue Shopping */}
              <button
                onClick={clearAuthView}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-nabdh-primary hover:bg-nabdh-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
              </button>

              {/* Payment Methods */}
              <div className="flex items-center justify-center gap-4 pt-2">
                {[
                  { icon: CreditCard, label: 'Visa' },
                  { icon: Wallet, label: 'Wallet' },
                  { icon: Truck, label: 'COD' },
                ].map((method, i) => {
                  const Icon = method.icon;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 opacity-50">
                      <Icon size={16} className="text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground">{method.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Clear Cart Confirmation ─── */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
            <motion.div
              className="relative glass-card rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <Trash2 size={24} className="text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {isAr ? 'إفراغ السلة؟' : 'Clear Cart?'}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {isAr ? 'سيتم إزالة جميع المنتجات من سلة التسوق.' : 'All items will be removed from your cart.'}
                </p>
                <div className="flex gap-3 w-full mt-5">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      clearCart();
                      setShowClearConfirm(false);
                      handleRemoveCoupon();
                    }}
                  >
                    {isAr ? 'إفراغ' : 'Clear'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
