'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useMobileStore } from '@/components/mobile/lib/mobile-store';
import {
  MapPin, CreditCard, Banknote, Check, ChevronDown, ChevronLeft, ChevronRight,
  Truck, Package, Tag, ShieldCheck, X, RefreshCw, ShoppingCart, Phone,
  ArrowLeft, ArrowRight, Clock, Search, Copy, CheckCheck,
} from 'lucide-react';
import { LIBYA_DELIVERY_DATA, getDeliveryPrice, getDeliveryDuration, getAreasForRegion } from '../lib/libya-delivery-data';
import type { Address } from '../lib/types';

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
  dark: '#0B1120',
  success: '#238636',
  warning: '#D29922',
  error: '#FF3B30',
} as const;

const INPUT_TEXT_COLOR = '#0B1120';

// Forces Android WebView to re-raster an input's text layer. Known WebView
// compositing bug: typed text stays invisible until the field is manually
// selected (the raster is stale). Bouncing a fresh GPU layer + re-affirming
// the text color on every keystroke fixes the stale raster.
function forceInputRepaint(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) {
  if (!input || typeof window === 'undefined') return;
  input.style.setProperty('-webkit-text-fill-color', INPUT_TEXT_COLOR);
  input.style.transform = 'translateZ(0)';
  requestAnimationFrame(() => {
    if (input) {
      input.style.removeProperty('-webkit-text-fill-color');
      input.style.removeProperty('transform');
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════
interface DeliveryAddress {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  streetAddress: string;
  notes: string;
}

type PaymentMethod = 'cod' | 'card' | 'bank';

interface InitialCouponData {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  discount: number;
}

interface CheckoutFlowProps {
  onClose: () => void;
  onTrackOrder?: (orderNumber: string) => void;
  initialCoupon?: InitialCouponData | null;
}

type CheckoutStep = 0 | 1 | 2 | 3;

// LIBYAN CITIES are now imported from libya-delivery-data.ts

// ═══════════════════════════════════════════════════════════════════════
// STEP CONFIG
// ═══════════════════════════════════════════════════════════════════════
const STEPS = [
  { key: 'address', icon: MapPin, labelKey: 'common.deliveryAddress' },
  { key: 'payment', icon: CreditCard, labelKey: 'common.paymentMethod' },
  { key: 'summary', icon: Package, labelKey: 'checkout.orderSummary' },
  { key: 'confirmation', icon: Check, labelKey: 'checkout.confirmation' },
];

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 280 : -280,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -280 : 280,
    opacity: 0,
  }),
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
};

// ═══════════════════════════════════════════════════════════════════════
// SHIMMER BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════
function ShimmerButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}) {
  const baseGradient =
    variant === 'primary'
      ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.teal})`
      : variant === 'secondary'
        ? `linear-gradient(135deg, ${COLORS.secondary}, #E85D50)`
        : 'transparent';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 overflow-hidden ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{
        background: variant === 'outline' ? 'transparent' : baseGradient,
        color: variant === 'outline' ? COLORS.primary : '#fff',
        border: variant === 'outline' ? `2px solid ${COLORS.primary}20` : 'none',
      }}
      whileHover={!disabled ? { scale: 1.02, boxShadow: `0 8px 24px ${COLORS.accent}30` } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
    >
      {/* Shimmer overlay */}
      {!disabled && variant !== 'outline' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }}
        />
      )}
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </motion.button>
  );
}

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
  return (
    <div
      className={`${noPadding ? '' : 'p-5'} rounded-2xl ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 4px 24px rgba(0, 75, 99, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// INPUT FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════
function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  dir,
  icon,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  dir?: 'rtl' | 'ltr';
  icon?: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div className="mb-4" variants={staggerItem}>
      <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.primary }}>
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-300"
        style={{
          border: `2px solid ${error ? COLORS.error : focused ? COLORS.accent : '#E5E5E5'}`,
          boxShadow: focused ? `0 0 0 3px ${COLORS.accent}18` : 'none',
        }}
      >
        {icon && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center"
            style={{ [dir === 'rtl' ? 'right' : 'left']: 4, color: focused ? COLORS.accent : '#999' }}
          >
            {icon}
          </div>
        )}
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            forceInputRepaint(inputRef.current);
          }}
          onInput={() => forceInputRepaint(inputRef.current)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          dir={dir}
          className="w-full py-3.5 px-4 bg-white/60 text-sm outline-none placeholder:text-gray-400"
          style={{
            paddingLeft: icon && dir !== 'rtl' ? 44 : 16,
            paddingRight: icon && dir === 'rtl' ? 44 : 16,
            textAlign: dir === 'rtl' ? 'right' : 'left',
            color: INPUT_TEXT_COLOR,
            WebkitTextFillColor: INPUT_TEXT_COLOR,
            caretColor: COLORS.primary,
            userSelect: 'text',
            WebkitUserSelect: 'text',
          }}
        />
      </div>
      {error && (
        <motion.p
          className="text-xs mt-1.5 font-medium"
          style={{ color: COLORS.error }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ANIMATED SUCCESS CHECKMARK
// ═══════════════════════════════════════════════════════════════════════
function AnimatedCheckmark({ size = 80 }: { size?: number }) {
  const circleVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: 'easeInOut' as const },
    },
  };
  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' as const, delay: 0.5 },
    },
  };

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
    >
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: size + 32,
          height: size + 32,
          background: `linear-gradient(135deg, ${COLORS.success}18, ${COLORS.teal}18)`,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
      >
        <svg width={size} height={size} viewBox="0 0 80 80">
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={COLORS.success}
            strokeWidth="3.5"
            variants={circleVariants}
            initial="hidden"
            animate="visible"
          />
          <motion.path
            d="M24 42 L34 52 L56 30"
            fill="none"
            stroke={COLORS.success}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={checkVariants}
            initial="hidden"
            animate="visible"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CONFETTI PARTICLES
// ═══════════════════════════════════════════════════════════════════════
function ConfettiParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        color: [COLORS.accent, COLORS.secondary, COLORS.teal, COLORS.gold, COLORS.primary][i % 5],
        x: Math.random() * 300 - 150,
        y: -(Math.random() * 200 + 100),
        rotation: Math.random() * 720 - 360,
        scale: Math.random() * 0.6 + 0.4,
        delay: Math.random() * 0.5,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: 8,
            height: 8,
            borderRadius: p.id % 3 === 0 ? '50%' : '2px',
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: [1, 1, 0],
            scale: p.scale,
            rotate: p.rotation,
          }}
          transition={{
            duration: 1.5,
            delay: p.delay,
            ease: 'easeOut' as const,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FIREWORKS EFFECT
// ═══════════════════════════════════════════════════════════════════════
function FireworksEffect() {
  const fireworks = [
    { x: '18%', y: '22%', color: '#00A8CC', delay: 0 },
    { x: '82%', y: '16%', color: '#FBBF24', delay: 0.4 },
    { x: '50%', y: '10%', color: '#F472B6', delay: 0.8 },
    { x: '30%', y: '38%', color: '#4ADE80', delay: 1.3 },
    { x: '70%', y: '42%', color: '#00897B', delay: 1.7 },
    { x: '12%', y: '55%', color: '#00C4E8', delay: 2.2 },
    { x: '88%', y: '55%', color: '#FBBF24', delay: 2.8 },
    { x: '50%', y: '70%', color: '#F472B6', delay: 3.3 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {fireworks.map((fw, fi) => (
        <div key={`fw-${fi}`} className="absolute" style={{ left: fw.x, top: fw.y }}>
          {/* Rocket trail — rises up then explodes */}
          <motion.div
            className="absolute"
            initial={{ y: 90, opacity: 1 }}
            animate={{ y: 0, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.5, delay: fw.delay, ease: 'easeOut' }}
          >
            <div className="w-1 h-3 rounded-full" style={{ background: fw.color, boxShadow: `0 0 6px ${fw.color}` }} />
          </motion.div>
          {/* Burst particles — explode outward in a circle */}
          {Array.from({ length: 14 }, (_, pi) => {
            const angle = (pi / 14) * Math.PI * 2;
            const distance = 32 + Math.random() * 42;
            const size = 2 + Math.random() * 4;
            return (
              <motion.div
                key={pi}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  background: fw.color,
                  boxShadow: `0 0 8px ${fw.color}, 0 0 3px ${fw.color}`,
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8 + Math.random() * 0.4,
                  delay: fw.delay + 0.5,
                  ease: 'easeOut',
                }}
              />
            );
          })}
          {/* Secondary smaller burst — inner ring */}
          {Array.from({ length: 8 }, (_, pi) => {
            const angle = (pi / 8) * Math.PI * 2 + Math.PI / 8;
            const distance = 14 + Math.random() * 20;
            const secColor = ['#ffffff', '#FDE68A', '#A7F3D0'][pi % 3];
            const size = 1.5 + Math.random() * 2;
            return (
              <motion.div
                key={`s-${pi}`}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  background: secColor,
                  boxShadow: `0 0 6px ${secColor}`,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  scale: [0, 1, 0],
                  opacity: [0, 0.9, 0],
                }}
                transition={{
                  duration: 0.6 + Math.random() * 0.3,
                  delay: fw.delay + 0.55,
                  ease: 'easeOut',
                }}
              />
            );
          })}
          {/* Central flash glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 16,
              height: 16,
              background: `radial-gradient(circle, ${fw.color}80 0%, transparent 70%)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2.5, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, delay: fw.delay + 0.4, ease: 'easeOut' }}
          />
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN CHECKOUT FLOW COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function CheckoutFlow({ onClose, onTrackOrder, initialCoupon }: CheckoutFlowProps) {
  const { t, language } = useLanguageStore();
  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  // Stores
  const cartItems = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const { currentUser } = useUIStore();
  const user = useMobileStore((s) => s.user);

  // Step state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(0);
  const [stepDirection, setStepDirection] = useState(1);

  // Address state
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: user?.name || currentUser?.name || '',
    phone: (user?.phone || currentUser?.phone || '').replace(/^\+218/, '0'),
    city: 'طرابلس',
    area: '',
    streetAddress: '',
    notes: '',
  });

  // Delivery region & area search state
  const [selectedRegionId, setSelectedRegionId] = useState<string>('tripoli');
  const [areaSearchQuery, setAreaSearchQuery] = useState<string>('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');

  // Coupon state - initialize from initialCoupon if provided
  const [couponCode, setCouponCode] = useState(initialCoupon?.code || '');
  const [appliedCouponCode, setAppliedCouponCode] = useState(initialCoupon?.code || '');
  const [couponApplied, setCouponApplied] = useState(!!initialCoupon);
  const [couponDiscount, setCouponDiscount] = useState(initialCoupon?.discount || 0);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Order state
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Saved totals for confirmation step (captured before clearCart)
  const [savedSubtotal, setSavedSubtotal] = useState(0);
  const [savedDeliveryFee, setSavedDeliveryFee] = useState(0);
  const [savedDiscount, setSavedDiscount] = useState(0);
  const [savedTotal, setSavedTotal] = useState(0);

  // Validation errors
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof DeliveryAddress, string>>>({});

  // Saved account addresses — used to prefill the address step
  const mobileAddresses = useMobileStore((s) => s.addresses);
  const addAddress = useMobileStore((s) => s.addAddress);
  const fetchAddresses = useMobileStore((s) => s.fetchAddresses);

  // Prefill the address step from the user's saved (default) address
  useEffect(() => {
    let cancelled = false;
    const applySaved = (list: Address[]) => {
      if (cancelled || !list || list.length === 0) return;
      const saved = list.find((a) => a.isDefault) || list[0];
      if (!saved) return;
      setAddress((prev) => {
        const next = { ...prev };
        if (saved.city && !next.city) next.city = saved.city;
        if (saved.area && !next.area) next.area = saved.area;
        if (saved.address && !next.streetAddress) next.streetAddress = saved.address;
        if (saved.notes && !next.notes) next.notes = saved.notes;
        return next;
      });
      if (saved.city) {
        const region = LIBYA_DELIVERY_DATA.find(
          (r) => r.nameAr === saved.city || r.nameEn === saved.city
        );
        if (region) setSelectedRegionId(region.id);
      }
    };
    const loggedIn = !!(user && !user.id.startsWith('local-'));
    if (mobileAddresses.length > 0) {
      applySaved(mobileAddresses);
    } else if (loggedIn) {
      fetchAddresses().then(() => {
        applySaved(useMobileStore.getState().addresses);
      }).catch(() => {});
    }
    return () => { cancelled = true; };
  }, []);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);

  // Computed: available areas based on selected region
  const availableAreas = useMemo(() => {
    return getAreasForRegion(selectedRegionId);
  }, [selectedRegionId]);

  // Filtered areas based on search
  const filteredAreas = useMemo(() => {
    if (!areaSearchQuery.trim()) return availableAreas;
    const q = areaSearchQuery.trim();
    return availableAreas.filter((a) => a.name.includes(q));
  }, [availableAreas, areaSearchQuery]);

  // Computed: current delivery info based on selected city & area
  const currentDeliveryInfo = useMemo(() => {
    if (address.area) {
      const price = getDeliveryPrice(address.city, address.area);
      const duration = getDeliveryDuration(address.city, address.area);
      return { price, duration };
    }
    if (address.city) {
      const price = getDeliveryPrice(address.city, '');
      const duration = getDeliveryDuration(address.city, '');
      return { price, duration };
    }
    return { price: 10, duration: 'خلال 24 ساعة' };
  }, [address.city, address.area]);

  // Computed values
  const subtotal = getSubtotal();
  const deliveryFee = useMemo(() => {
    return currentDeliveryInfo.price;
  }, [currentDeliveryInfo.price]);
  const discountAmount = couponDiscount;
  const totalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

  // Use saved totals on confirmation step, live totals otherwise
  const displaySubtotal = currentStep === 3 ? savedSubtotal : subtotal;
  const displayDeliveryFee = currentStep === 3 ? savedDeliveryFee : deliveryFee;
  const displayDiscount = currentStep === 3 ? savedDiscount : discountAmount;
  const displayTotal = currentStep === 3 ? savedTotal : totalAmount;

  const isAddressValid = useMemo(() => {
    return !!(address.fullName && address.phone && address.city && address.area && address.streetAddress);
  }, [address]);

  // Validate address
  const validateAddress = useCallback((): boolean => {
    const errors: Partial<Record<keyof DeliveryAddress, string>> = {};
    if (!address.fullName.trim()) {
      errors.fullName = t('common.nameRequired');
    }
    if (!address.phone.trim()) {
      errors.phone = t('common.phoneRequired');
    } else if (!/^0[0-9]{9}$/.test(address.phone.replace(/\s/g, ''))) {
      errors.phone = t('common.invalidPhone');
    }
    if (!address.city) {
      errors.city = t('common.cityRequired');
    }
    if (!address.area.trim()) {
      errors.area = t('common.areaRequired');
    }
    if (!address.streetAddress.trim()) {
      errors.streetAddress = t('common.addressRequired');
    }
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  }, [address, t]);

  // Navigate steps
  const goToStep = useCallback(
    (step: CheckoutStep) => {
      setStepDirection(step > currentStep ? 1 : -1);
      setCurrentStep(step);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentStep]
  );

  const handleNext = useCallback(() => {
    if (currentStep === 0) {
      if (!validateAddress()) return;
      // Save the address to the account as they leave the address step
      if (user && !user.id.startsWith('local-') && address.streetAddress.trim()) {
        const savedList = useMobileStore.getState().addresses;
        const alreadySaved = savedList.some(
          (a) => a.city === address.city && a.area === address.area && a.address === address.streetAddress.trim()
        );
        if (!alreadySaved) {
          addAddress({
            label: 'منزل',
            address: address.streetAddress.trim(),
            city: address.city,
            area: address.area,
            notes: address.notes,
            isDefault: true,
          }).catch(() => {});
        }
      }
    }
    if (currentStep < 3) {
      goToStep((currentStep + 1) as CheckoutStep);
    }
  }, [currentStep, goToStep, validateAddress, user, address, addAddress]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      goToStep((currentStep - 1) as CheckoutStep);
    }
  }, [currentStep, goToStep]);

  // Apply coupon
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError(t('checkout.enterCouponCode'));
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), subtotal, userId: user?.id || currentUser?.id }),
      });
      const data = await res.json();
      if (data.valid && data.coupon) {
        setCouponDiscount(Number(data.coupon.discount) || 0);
        setAppliedCouponCode(couponCode.trim().toUpperCase());
        setCouponApplied(true);
      } else {
        setCouponError(data.error || t('checkout.invalidCoupon'));
      }
    } catch {
      setCouponError(t('common.somethingWrong'));
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, t, subtotal, user, currentUser]);

  // Remove coupon
  const handleRemoveCoupon = useCallback(() => {
    setCouponCode('');
    setAppliedCouponCode('');
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponError('');
  }, []);

  // Place order
  const handlePlaceOrder = useCallback(async () => {
    if (isPlacing) return;
    setIsPlacing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || currentUser?.id || 'guest',
          items: cartItems.map((item) => ({
            productId: item.productId,
            name: isRTL ? item.nameAr : item.nameEn,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod,
          address: {
            fullName: address.fullName,
            phone: address.phone,
            city: address.city,
            area: address.area,
            streetAddress: address.streetAddress,
            notes: address.notes,
          },
          couponCode: couponApplied ? appliedCouponCode : undefined,
          discount: discountAmount,
          deliveryFee,
        }),
      });

      const data = await res.json();
      // Save totals BEFORE clearing cart
      setSavedSubtotal(subtotal);
      setSavedDeliveryFee(deliveryFee);
      setSavedDiscount(discountAmount);
      setSavedTotal(totalAmount);
      if (res.ok && data.order) {
        setOrderNumber(data.order.orderNumber || data.order.id);
        // Save this shipping address to the account so it's prefilled next time
        if (user && !user.id.startsWith('local-') && address.streetAddress.trim()) {
          const alreadySaved = mobileAddresses.some(
            (a) =>
              a.city === address.city &&
              a.area === address.area &&
              a.address === address.streetAddress.trim()
          );
          if (!alreadySaved) {
            addAddress({
              label: 'منزل',
              address: address.streetAddress.trim(),
              city: address.city,
              area: address.area,
              notes: address.notes,
              isDefault: true,
            }).then(() => {
              useMobileStore.getState().fetchAddresses().catch(() => {});
            }).catch(() => {});
          }
        }
        clearCart();
        goToStep(3);
      } else {
        // Fallback: generate a local order number
        const fallbackNumber = `NM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setOrderNumber(fallbackNumber);
        clearCart();
        goToStep(3);
      }
    } catch {
      // Save totals BEFORE clearing cart
      setSavedSubtotal(subtotal);
      setSavedDeliveryFee(deliveryFee);
      setSavedDiscount(discountAmount);
      setSavedTotal(totalAmount);
      // Offline fallback
      const fallbackNumber = `NM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setOrderNumber(fallbackNumber);
      clearCart();
      goToStep(3);
    } finally {
      setIsPlacing(false);
    }
  }, [isPlacing, user, currentUser, cartItems, paymentMethod, address, couponApplied, appliedCouponCode, discountAmount, deliveryFee, isRTL, clearCart, goToStep, mobileAddresses, addAddress]);

  // Scroll to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // ═══════════════════════════════════════════════════════════════════════
  // STEP INDICATOR
  // ═══════════════════════════════════════════════════════════════════════
  const StepIndicator = () => (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div
          className="absolute top-5 h-0.5 rounded-full"
          style={{
            background: '#E5E5E5',
            [isRTL ? 'right' : 'left']: '20px',
            [isRTL ? 'left' : 'right']: '20px',
            width: 'calc(100% - 40px)',
          }}
        />
        {/* Progress line active */}
        <motion.div
          className="absolute top-5 h-0.5 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.teal})`,
            [isRTL ? 'right' : 'left']: '20px',
          }}
          animate={{
            width: `${(currentStep / 3) * (100 - 40 / 3)}%`,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' as const }}
        />

        {STEPS.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          return (
            <motion.div
              key={step.key}
              className="relative z-10 flex flex-col items-center"
              animate={{ scale: isActive ? 1.1 : 1 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                style={{
                  background: isCompleted
                    ? `linear-gradient(135deg, ${COLORS.success}, ${COLORS.teal})`
                    : isActive
                      ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.teal})`
                      : '#F8F9FA',
                  borderColor: isCompleted
                    ? COLORS.success
                    : isActive
                      ? COLORS.accent
                      : '#E5E5E5',
                  boxShadow: isActive ? `0 4px 12px ${COLORS.accent}40` : 'none',
                }}
              >
                {isCompleted ? (
                  <Check size={18} className="text-white" strokeWidth={2.5} />
                ) : (
                  <StepIcon
                    size={18}
                    style={{ color: isActive ? '#fff' : '#999' }}
                  />
                )}
              </div>
              <span
                className="text-[10px] mt-1.5 font-semibold whitespace-nowrap"
                style={{ color: isActive ? COLORS.primary : '#999' }}
              >
                {t(step.labelKey)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 1: DELIVERY ADDRESS
  // ═══════════════════════════════════════════════════════════════════════
  const AddressStep = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      <GlassCard>
        <motion.div variants={staggerItem} className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${COLORS.accent}18, ${COLORS.teal}18)` }}
          >
            <MapPin size={20} style={{ color: COLORS.accent }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: COLORS.primary }}>
              {t('checkout.shippingInfo')}
            </h3>
            <p className="text-xs text-gray-400">
              {t('mobile.checkout.enterDeliveryAddress')}
            </p>
          </div>
        </motion.div>

        <FormInput
          label={t('checkout.fullName')}
          value={address.fullName}
          onChange={(v) => {
            setAddress((p) => ({ ...p, fullName: v }));
            if (addressErrors.fullName) setAddressErrors((p) => ({ ...p, fullName: undefined }));
          }}
          placeholder={t('checkout.enterFullName')}
          dir="rtl"
          icon={<Package size={16} />}
          required
          error={addressErrors.fullName}
        />

        <FormInput
          label={t('checkout.phone')}
          value={address.phone}
          onChange={(v) => {
            setAddress((p) => ({ ...p, phone: v }));
            if (addressErrors.phone) setAddressErrors((p) => ({ ...p, phone: undefined }));
          }}
          placeholder="09XX XXX XXX"
          type="tel"
          dir="rtl"
          icon={<Phone size={14} style={{ color: COLORS.primary }} />}
          required
          error={addressErrors.phone}
        />

        {/* City / Region Select */}
        <motion.div className="mb-4" variants={staggerItem}>
          <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.primary }}>
            {t('common.city')}
            <span className="text-red-500 mr-1">*</span>
          </label>
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              border: `2px solid ${addressErrors.city ? COLORS.error : address.city ? COLORS.accent : '#E5E5E5'}`,
            }}
          >
            <select
              value={selectedRegionId}
              onChange={(e) => {
                const newRegionId = e.target.value;
                setSelectedRegionId(newRegionId);
                const region = LIBYA_DELIVERY_DATA.find((r) => r.id === newRegionId);
                const newCity = region ? region.nameAr : '';
                setAddress((p) => ({ ...p, city: newCity, area: '' }));
                setAreaSearchQuery('');
                if (addressErrors.city) setAddressErrors((p) => ({ ...p, city: undefined }));
                forceInputRepaint(e.target);
              }}
              className="w-full py-3.5 px-4 bg-white/60 text-sm outline-none appearance-none"
              style={{
                textAlign: isRTL ? 'right' : 'left',
                color: INPUT_TEXT_COLOR,
                WebkitTextFillColor: INPUT_TEXT_COLOR,
                caretColor: COLORS.primary,
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}
              dir={direction}
            >
              {LIBYA_DELIVERY_DATA.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.icon} {isRTL ? region.nameAr : region.nameEn}
                </option>
              ))}
            </select>
            <div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ [isRTL ? 'left' : 'right']: 12, color: COLORS.primary }}
            >
              <ChevronDown size={16} />
            </div>
          </div>
          {addressErrors.city && (
            <motion.p
              className="text-xs mt-1.5 font-medium"
              style={{ color: COLORS.error }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {addressErrors.city}
            </motion.p>
          )}
        </motion.div>

        {/* Area / Neighborhood Select with Search */}
        <motion.div className="mb-4" variants={staggerItem}>
          <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.primary }}>
            {selectedRegionId === 'tripoli' ? (isRTL ? 'الحي' : 'Neighborhood') : (isRTL ? 'المدينة' : 'City')}
            <span className="text-red-500 mr-1">*</span>
          </label>
          {/* Area search input */}
          <div
            className="relative rounded-t-xl overflow-hidden"
            style={{
              border: `2px solid ${addressErrors.area ? COLORS.error : address.area ? COLORS.accent : '#E5E5E5'}`,
              borderBottom: 'none',
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ [isRTL ? 'right' : 'left']: 12, color: '#999' }}
            >
              <Search size={14} />
            </div>
            <input
              type="text"
              value={areaSearchQuery}
              onChange={(e) => {
                setAreaSearchQuery(e.target.value);
                forceInputRepaint(e.target);
              }}
              onInput={(e) => forceInputRepaint(e.currentTarget)}
              placeholder={selectedRegionId === 'tripoli' ? 'ابحث عن الحي...' : 'ابحث عن المدينة...'}
              className="w-full py-2.5 px-4 bg-white/60 text-xs outline-none"
              style={{
                textAlign: isRTL ? 'right' : 'left',
                [isRTL ? 'paddingRight' : 'paddingLeft']: 36,
                color: INPUT_TEXT_COLOR,
                WebkitTextFillColor: INPUT_TEXT_COLOR,
                caretColor: COLORS.primary,
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}
              dir={direction}
            />
          </div>
          {/* Area select dropdown */}
          <div
            className="relative rounded-b-xl overflow-hidden"
            style={{
              border: `2px solid ${addressErrors.area ? COLORS.error : address.area ? COLORS.accent : '#E5E5E5'}`,
            }}
          >
            <select
              value={address.area}
              onChange={(e) => {
                const selectedArea = e.target.value;
                setAddress((p) => ({ ...p, area: selectedArea }));
                setAreaSearchQuery('');
                if (addressErrors.area) setAddressErrors((p) => ({ ...p, area: undefined }));
                forceInputRepaint(e.target);
              }}
              className="w-full py-3.5 px-4 bg-white/60 text-sm outline-none appearance-none"
              style={{
                textAlign: isRTL ? 'right' : 'left',
                color: INPUT_TEXT_COLOR,
                WebkitTextFillColor: INPUT_TEXT_COLOR,
                caretColor: COLORS.primary,
                userSelect: 'text',
                WebkitUserSelect: 'text',
              }}
              dir={direction}
            >
              <option value="">{selectedRegionId === 'tripoli' ? 'اختر الحي' : 'اختر المدينة'}</option>
              {filteredAreas.map((area) => (
                <option key={area.name} value={area.name}>
                  {area.name} — {area.price} د.ل
                </option>
              ))}
            </select>
            <div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ [isRTL ? 'left' : 'right']: 12, color: COLORS.primary }}
            >
              <ChevronDown size={16} />
            </div>
          </div>
          {/* Show delivery info for selected area */}
          {address.area && (
            <motion.div
              className="flex items-center gap-2 mt-2 px-2"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Truck size={12} style={{ color: COLORS.teal }} />
              <span className="text-[10px] font-semibold" style={{ color: COLORS.teal }}>
                {currentDeliveryInfo.duration} • {currentDeliveryInfo.price} د.ل
              </span>
            </motion.div>
          )}
          {addressErrors.area && (
            <motion.p
              className="text-xs mt-1.5 font-medium"
              style={{ color: COLORS.error }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {addressErrors.area}
            </motion.p>
          )}
        </motion.div>

        <FormInput
          label={t('common.address')}
          value={address.streetAddress}
          onChange={(v) => {
            setAddress((p) => ({ ...p, streetAddress: v }));
            if (addressErrors.streetAddress) setAddressErrors((p) => ({ ...p, streetAddress: undefined }));
          }}
          placeholder={t('mobile.checkout.addressPlaceholder')}
          dir="rtl"
          required
          error={addressErrors.streetAddress}
        />

        <FormInput
          label={t('common.notes')}
          value={address.notes}
          onChange={(v) => setAddress((p) => ({ ...p, notes: v }))}
          placeholder={t('mobile.checkout.notesPlaceholder')}
          dir="rtl"
        />
      </GlassCard>

      {/* Delivery info hint */}
      <GlassCard>
        <motion.div variants={staggerItem} className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${COLORS.teal}15` }}
          >
            <Truck size={18} style={{ color: COLORS.teal }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold" style={{ color: COLORS.primary }}>
              {t('mobile.checkout.deliveryInfo')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {address.area
                ? `${t('mobile.checkout.deliveryFeeTo')} ${address.area}: ${deliveryFee} ${t('product.currency')}`
                : address.city
                  ? `${t('mobile.checkout.deliveryFeeTo')} ${address.city}: ${deliveryFee} ${t('product.currency')}`
                  : t('mobile.checkout.selectAreaFirst')}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Clock size={12} style={{ color: COLORS.teal }} />
              <span className="text-[10px] font-semibold" style={{ color: COLORS.teal }}>
                {address.area ? currentDeliveryInfo.duration : (address.city ? currentDeliveryInfo.duration : t('mobile.checkout.estimatedDelivery'))}
              </span>
            </div>
          </div>
        </motion.div>
      </GlassCard>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 2: PAYMENT METHOD
  // ═══════════════════════════════════════════════════════════════════════
  const PaymentStep = () => {
    const paymentOptions: {
      key: PaymentMethod;
      icon: typeof Banknote;
      labelKey: string;
      descKey: string;
      recommended?: boolean;
      disabled?: boolean;
      color: string;
    }[] = [
      {
        key: 'cod',
        icon: Banknote,
        labelKey: 'checkout.cod',
        descKey: 'mobile.checkout.codDesc',
        recommended: true,
        color: COLORS.teal,
      },
      {
        key: 'card',
        icon: CreditCard,
        labelKey: 'checkout.payByCard',
        descKey: 'mobile.checkout.cardDesc',
        disabled: true,
        color: COLORS.accent,
      },
    ];

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        <GlassCard>
          <motion.div variants={staggerItem} className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${COLORS.accent}18, ${COLORS.primary}18)` }}
            >
              <CreditCard size={20} style={{ color: COLORS.accent }} />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: COLORS.primary }}>
                {t('common.paymentMethod')}
              </h3>
              <p className="text-xs text-gray-400">
                {t('mobile.checkout.choosePayment')}
              </p>
            </div>
          </motion.div>

          <div className="space-y-3">
            {paymentOptions.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = paymentMethod === option.key;
              return (
                <motion.button
                  key={option.key}
                  variants={staggerItem}
                  onClick={() => !option.disabled && setPaymentMethod(option.key)}
                  disabled={option.disabled}
                  className={`w-full text-start rounded-2xl p-4 relative overflow-hidden transition-all duration-300 ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${option.color}10, ${option.color}05)`
                      : 'rgba(248, 249, 250, 0.8)',
                    border: `2px solid ${isSelected ? option.color : '#E5E5E5'}`,
                    boxShadow: isSelected ? `0 4px 16px ${option.color}18` : 'none',
                  }}
                  whileHover={!option.disabled ? { scale: 1.01 } : {}}
                  whileTap={!option.disabled ? { scale: 0.98 } : {}}
                >
                  {/* Selected check indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute top-3 rounded-full w-6 h-6 flex items-center justify-center"
                      style={{
                        [isRTL ? 'left' : 'right']: 12,
                        background: `linear-gradient(135deg, ${option.color}, ${COLORS.teal})`,
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 15 }}
                    >
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${option.color}12`,
                        border: `1px solid ${option.color}25`,
                      }}
                    >
                      <OptionIcon size={22} style={{ color: option.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: COLORS.dark }}>
                          {t(option.labelKey)}
                        </span>
                        {option.recommended && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{
                              background: `${COLORS.teal}15`,
                              color: COLORS.teal,
                            }}
                          >
                            {t('checkout.recommended')}
                          </span>
                        )}
                        {option.disabled && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{
                              background: `${COLORS.gold}15`,
                              color: COLORS.gold,
                            }}
                          >
                            {t('checkout.comingSoon')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </GlassCard>

        {/* Security badge */}
        <GlassCard>
          <motion.div variants={staggerItem} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${COLORS.success}15` }}
            >
              <ShieldCheck size={18} style={{ color: COLORS.success }} />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: COLORS.primary }}>
                {t('mobile.checkout.securePayment')}
              </p>
              <p className="text-[10px] text-gray-400">
                {t('mobile.checkout.securePaymentDesc')}
              </p>
            </div>
          </motion.div>
        </GlassCard>
      </motion.div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 3: ORDER SUMMARY
  // ═══════════════════════════════════════════════════════════════════════
  const SummaryStep = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      {/* Cart items */}
      <GlassCard noPadding>
        <motion.div variants={staggerItem} className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${COLORS.accent}18, ${COLORS.teal}18)` }}
            >
              <ShoppingCart size={20} style={{ color: COLORS.accent }} />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: COLORS.primary }}>
                {t('checkout.orderSummary')}
              </h3>
              <p className="text-xs text-gray-400">
                {cartItems.length} {t('common.items')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Items list */}
        <div className="max-h-52 overflow-y-auto px-5" style={{ scrollbarWidth: 'thin' }}>
          {cartItems.map((item) => (
            <motion.div
              key={item.productId}
              variants={staggerItem}
              className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-b-0"
            >
              <div
                className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={isRTL ? item.nameAr : item.nameEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent && !parent.querySelector('.img-fallback')) {
                        const span = document.createElement('span');
                        span.className = 'img-fallback text-lg';
                        span.textContent = '\uD83D\uDCE6';
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span className="text-lg">\uD83D\uDCE6</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: COLORS.dark }}>
                  {isRTL ? item.nameAr : item.nameEn}
                </p>
                <p className="text-xs text-gray-400">
                  {item.quantity} × {item.price.toFixed(2)} {t('product.currency')}
                </p>
              </div>
              <p className="text-sm font-bold flex-shrink-0" style={{ color: '#4ADE80' }}>
                {(item.price * item.quantity).toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="px-5 pt-4 pb-5 space-y-3">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('common.subtotal')}</span>
            <span className="font-semibold" style={{ color: COLORS.dark }}>
              {subtotal.toFixed(2)} {t('product.currency')}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t('common.delivery')}</span>
            <span className="font-semibold" style={{ color: deliveryFee === 0 ? COLORS.success : COLORS.dark }}>
              {deliveryFee === 0
                ? t('common.free')
                : `${deliveryFee.toFixed(2)} ${t('product.currency')}`}
            </span>
          </div>

          {couponApplied && discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('common.discount')}</span>
              <span className="font-semibold" style={{ color: COLORS.success }}>
                -{discountAmount.toFixed(2)} {t('product.currency')}
              </span>
            </div>
          )}

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="flex justify-between">
            <span className="font-bold text-base" style={{ color: COLORS.primary }}>
              {t('common.total')}
            </span>
            <span
              className="font-bold text-lg"
              style={{ color: COLORS.secondary }}
            >
              {Math.max(0, totalAmount).toFixed(2)} {t('product.currency')}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Delivery & Payment summary */}
      <GlassCard>
        <motion.div variants={staggerItem} className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin size={16} style={{ color: COLORS.accent }} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400">{t('checkout.deliveringTo')}</p>
              <p className="text-xs font-semibold truncate" style={{ color: COLORS.dark }}>
                {address.area}, {address.city}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {paymentMethod === 'cod' ? <Banknote size={16} style={{ color: COLORS.teal }} /> : <CreditCard size={16} style={{ color: COLORS.accent }} />}
            <div>
              <p className="text-[10px] text-gray-400">{t('common.paymentMethod')}</p>
              <p className="text-xs font-semibold" style={{ color: COLORS.dark }}>
                {paymentMethod === 'cod'
                  ? t('checkout.cod')
                  : paymentMethod === 'card'
                    ? t('payment.card')
                    : t('checkout.bankTransfer')}
              </p>
            </div>
          </div>
        </motion.div>
      </GlassCard>

      {/* Place order button */}
      <ShimmerButton
        onClick={handlePlaceOrder}
        disabled={isPlacing || cartItems.length === 0}
      >
        {isPlacing ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            {t('checkout.placingOrder')}
          </>
        ) : (
          <>
            <Check size={18} />
            {t('checkout.placeOrder')}
          </>
        )}
      </ShimmerButton>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 4: CONFIRMATION
  // ═══════════════════════════════════════════════════════════════════════
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopy = useCallback(async (text: string, type: 'order' | 'tracking') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'order') {
        setCopiedOrder(true);
        setTimeout(() => setCopiedOrder(false), 2000);
      } else {
        setCopiedTracking(true);
        setTimeout(() => setCopiedTracking(false), 2000);
      }
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (type === 'order') {
        setCopiedOrder(true);
        setTimeout(() => setCopiedOrder(false), 2000);
      } else {
        setCopiedTracking(true);
        setTimeout(() => setCopiedTracking(false), 2000);
      }
    }
  }, []);

  const ConfirmationStep = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      <GlassCard>
        <motion.div
          variants={staggerItem}
          className="flex flex-col items-center py-6 relative"
        >
          <MotionConfig reducedMotion="never">
            <ConfettiParticles />
            <FireworksEffect />
          </MotionConfig>
          <AnimatedCheckmark size={72} />

          <motion.h2
            className="text-xl font-bold mt-5 text-center"
            style={{ color: COLORS.primary }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {t('checkout.orderPlaced')}
          </motion.h2>

          <motion.p
            className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 max-w-[260px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {t('checkout.orderPlacedMessage')}
          </motion.p>
        </motion.div>
      </GlassCard>

      {/* Order number card with copy */}
      <GlassCard>
        <motion.div variants={staggerItem} className="text-center">
          <p className="text-xs text-gray-400 mb-2">
            {t('order.number')}
          </p>
          <div className="flex items-center justify-center gap-2">
            <motion.p
              className="text-2xl font-bold tracking-wider"
              style={{ color: COLORS.accent }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring' as const, stiffness: 200, damping: 15 }}
              dir="ltr"
            >
              {orderNumber}
            </motion.p>
            <motion.button
              onClick={() => handleCopy(orderNumber, 'order')}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: copiedOrder ? `${COLORS.success}15` : `${COLORS.accent}10`,
                border: `1px solid ${copiedOrder ? COLORS.success : COLORS.accent}25`,
              }}
              whileTap={{ scale: 0.85 }}
              animate={copiedOrder ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {copiedOrder ? (
                <CheckCheck size={16} style={{ color: COLORS.success }} />
              ) : (
                <Copy size={16} style={{ color: COLORS.accent }} />
              )}
            </motion.button>
          </div>
          {copiedOrder && (
            <motion.p
              className="text-[10px] font-semibold mt-1.5"
              style={{ color: COLORS.success }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {t('mobile.checkout.copiedToClipboard')}
            </motion.p>
          )}
        </motion.div>
      </GlassCard>

      {/* Tracking number card with copy */}
      <GlassCard>
        <motion.div variants={staggerItem} className="text-center">
          <p className="text-xs text-gray-400 mb-2">
            {t('mobile.checkout.trackingCode')}
          </p>
          <div className="flex items-center justify-center gap-2">
            <motion.p
              className="text-lg font-bold tracking-wider font-mono"
              style={{ color: COLORS.teal }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.4, type: 'spring' as const, stiffness: 200, damping: 15 }}
              dir="ltr"
            >
              {orderNumber}
            </motion.p>
            <motion.button
              onClick={() => handleCopy(orderNumber, 'tracking')}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: copiedTracking ? `${COLORS.success}15` : `${COLORS.teal}10`,
                border: `1px solid ${copiedTracking ? COLORS.success : COLORS.teal}25`,
              }}
              whileTap={{ scale: 0.85 }}
              animate={copiedTracking ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {copiedTracking ? (
                <CheckCheck size={16} style={{ color: COLORS.success }} />
              ) : (
                <Copy size={16} style={{ color: COLORS.teal }} />
              )}
            </motion.button>
          </div>
          {copiedTracking && (
            <motion.p
              className="text-[10px] font-semibold mt-1.5"
              style={{ color: COLORS.success }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {t('mobile.checkout.copiedToClipboard')}
            </motion.p>
          )}
        </motion.div>
      </GlassCard>

      {/* Order details */}
      <GlassCard>
        <motion.div variants={staggerItem} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={14} style={{ color: COLORS.teal }} />
              <span className="text-xs text-gray-500">
                {t('checkout.deliveringTo')}
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: COLORS.dark }}>
              {address.city} - {address.area}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote size={14} style={{ color: COLORS.teal }} />
              <span className="text-xs text-gray-500">
                {t('common.paymentMethod')}
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: COLORS.dark }}>
              {paymentMethod === 'cod'
                ? t('checkout.cod')
                : t('payment.card')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: COLORS.teal }} />
              <span className="text-xs text-gray-500">
                {t('mobile.checkout.estDelivery')}
              </span>
            </div>
            <span className="text-xs font-semibold" style={{ color: COLORS.dark }}>
              {currentDeliveryInfo.duration}
            </span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold" style={{ color: COLORS.primary }}>
              {t('checkout.totalPaid')}
            </span>
            <span className="text-lg font-bold" style={{ color: COLORS.secondary }}>
              {Math.max(0, displayTotal).toFixed(2)} {t('product.currency')}
            </span>
          </div>
        </motion.div>
      </GlassCard>

      {/* Action buttons */}
      <motion.div variants={staggerItem} className="space-y-3">
        <ShimmerButton onClick={onClose}>
          <ShoppingCart size={18} />
          {t('common.continueShopping')}
        </ShimmerButton>

        <ShimmerButton
          variant="outline"
          onClick={() => onTrackOrder ? onTrackOrder(orderNumber) : onClose()}
        >
          {t('mobile.checkout.trackOrder')}
        </ShimmerButton>
      </motion.div>
    </motion.div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER STEP CONTENT
  // ═══════════════════════════════════════════════════════════════════════
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return AddressStep();
      case 1:
        return PaymentStep();
      case 2:
        return SummaryStep();
      case 3:
        return ConfirmationStep();
      default:
        return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <MotionConfig reducedMotion="always">
      <motion.div
        className="absolute inset-0 z-50 flex flex-col"
        style={{ background: '#F4F6F9' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        dir={direction}
      >
      {/* ─── Header ─── */}
      <div
        className="relative flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight}, ${COLORS.teal})`,
        }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,168,204,0.2) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,137,123,0.2) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        <div className="relative z-10 px-4 py-4 flex items-center gap-3">
          <motion.button
            onClick={currentStep === 3 ? onClose : currentStep > 0 ? handleBack : onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            {isRTL ? (
              currentStep === 0 || currentStep === 3 ? <ArrowRight size={20} className="text-white" /> : <ArrowRight size={20} className="text-white" />
            ) : (
              currentStep === 0 || currentStep === 3 ? <ArrowLeft size={20} className="text-white" /> : <ArrowLeft size={20} className="text-white" />
            )}
          </motion.button>

          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">
              {t('checkout.title')}
            </h2>
            <p className="text-white/60 text-xs">
              {`${t('checkout.stepOf')} ${currentStep + 1} ${t('checkout.stepOfTotal')} 4`}
            </p>
          </div>

          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={20} className="text-white" />
          </motion.button>
        </div>
      </div>

      {/* ─── Step Indicator ─── */}
      {currentStep < 3 && StepIndicator()}

      {/* ─── Step Content ─── */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="p-5">
          <AnimatePresence mode="wait" custom={stepDirection}>
            <motion.div
              key={currentStep}
              custom={stepDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring' as const, stiffness: 260, damping: 28 },
                opacity: { duration: 0.3 },
              }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Bottom Navigation ─── */}
      {currentStep < 3 && (
        <div
          className="flex-shrink-0 px-5 py-4 border-t border-gray-100"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex gap-3">
            {/* Back button */}
            {currentStep > 0 && (
              <motion.button
                onClick={handleBack}
                className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  color: COLORS.primary,
                  background: `${COLORS.primary}08`,
                  border: `1px solid ${COLORS.primary}15`,
                }}
                whileTap={{ scale: 0.97 }}
              >
                {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                {t('common.back')}
              </motion.button>
            )}

            {/* Next / Continue button */}
            {currentStep < 2 && (
              <ShimmerButton
                onClick={handleNext}
                disabled={currentStep === 0 && !isAddressValid}
                className="flex-1"
              >
                {t('common.next')}
                {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </ShimmerButton>
            )}

            {/* Review order button (step 2 -> step 3) */}
            {currentStep === 2 && (
              <ShimmerButton
                onClick={handlePlaceOrder}
                disabled={isPlacing || cartItems.length === 0}
                className="flex-1"
              >
                {isPlacing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    {t('checkout.placingOrder')}
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {t('checkout.placeOrder')}
                  </>
                )}
              </ShimmerButton>
            )}
          </div>

          {/* Delivery zone info */}
          {currentStep === 0 && address.area && (
            <div className="mt-3 flex items-center gap-2">
              <Truck size={14} style={{ color: COLORS.teal }} />
              <span className="text-[11px] font-semibold" style={{ color: COLORS.teal }}>
                {t('mobile.checkout.deliveryFeeTo')} {address.area}: {deliveryFee === 0 ? t('common.free') : `${deliveryFee} ${t('product.currency')}`} • {currentDeliveryInfo.duration}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Confirmation step bottom */}
      {currentStep === 3 && <div className="flex-shrink-0 h-4" />}
      </motion.div>
    </MotionConfig>
  );
}
