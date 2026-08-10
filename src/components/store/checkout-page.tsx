'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Circle,
  Plus,
  Home,
  Building2,
  Package,
  Banknote,
  Receipt,
  ShieldCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  Loader2,
  Phone,
  User,
  StickyNote,
  Wallet,
  Check,
  AlertCircle,
  PartyPopper,
  ShoppingBag,
  RotateCcw,
  Pencil,
  Trash2,
  Copy,
  CheckCheck,
  Tag,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCartStore, type CartItem } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useLanguageStore } from '@/stores/language-store';
import { useCouponStore, calcCouponDiscount, validateCouponForSubtotal } from '@/stores/coupon-store';
import { useShallow } from 'zustand/react/shallow';
import { DELIVERY_REGIONS, type DeliveryZone, type DeliveryRegion, findDeliveryZone, getDeliveryDurationForArea } from '@/components/mobile/lib/delivery-zones';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────
type CheckoutStep = 'address' | 'payment' | 'review';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  area: string;
  notes: string;
  isDefault: boolean;
  zoneId?: string;
}

// ─── Step Config ───────────────────────────────────────────────────────
const STEPS: { key: CheckoutStep; iconAr: string; iconEn: string }[] = [
  { key: 'address', iconAr: 'العنوان والشحن', iconEn: 'Address & Shipping' },
  { key: 'payment', iconAr: 'الدفع', iconEn: 'Payment' },
  { key: 'review', iconAr: 'المراجعة', iconEn: 'Review' },
];

// ─── Animated Number ───────────────────────────────────────────────────
function AnimNum({ value }: { value: number }) {
  return <>{value.toFixed(2)}</>;
}

// ─── Helper: find zone + region for a saved address ───
function findZoneAndRegion(addr: SavedAddress): { zone: DeliveryZone; region: DeliveryRegion } | null {
  // First try matching by zoneId if available
  if (addr.zoneId) {
    for (const region of DELIVERY_REGIONS) {
      const zone = region.zones.find((z) => z.id === addr.zoneId);
      if (zone) return { zone, region };
    }
  }
  // Fallback: try matching by area or city name
  const searchTerms = [addr.area, addr.city].filter(Boolean);
  for (const term of searchTerms) {
    const zone = findDeliveryZone(term);
    if (zone) {
      for (const region of DELIVERY_REGIONS) {
        if (region.zones.some((z) => z.id === zone.id)) {
          return { zone, region };
        }
      }
    }
  }
  return null;
}

// ─── Main Checkout Page ────────────────────────────────────────────────
export function CheckoutPage() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({
    t: s.t, language: s.language, direction: s.direction,
  })));
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';
  const clearAuthView = useUIStore((s) => s.clearAuthView);
  const setAuthView = useUIStore((s) => s.setAuthView);
  const setProfileScrollTo = useUIStore((s) => s.setProfileScrollTo);
  const currentUser = useUIStore((s) => s.currentUser);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const currency = t('product.currency');

  // Step management
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Address state
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '',
    address: '',
    city: '',
    area: '',
    notes: '',
    zoneId: '',
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);

  // Edit address state
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState({
    label: '',
    address: '',
    city: '',
    area: '',
    notes: '',
    zoneId: '',
  });
  const [editAddressSaving, setEditAddressSaving] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  // Shipping/Zone state (merged into address step)
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<DeliveryRegion | null>(null);
  const [zoneSearch, setZoneSearch] = useState('');
  const [expandedRegion, setExpandedRegion] = useState<string>('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

  // Order state
  const [orderNotes, setOrderNotes] = useState('');
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderError, setOrderError] = useState('');

  // Coupon state from shared store (carried from cart)
  const appliedCoupon = useCouponStore((s) => s.appliedCoupon);
  const applyCouponAction = useCouponStore((s) => s.applyCoupon);
  const removeCouponAction = useCouponStore((s) => s.removeCoupon);
  const couponCode = appliedCoupon?.code ?? '';
  // IMPORTANT: coupon discount is dynamically recalculated from current subtotal
  // rather than using the stale value stored at validation time
  // Local state for coupon input on checkout page
  const [checkoutCouponInput, setCheckoutCouponInput] = useState('');
  const [checkoutCouponError, setCheckoutCouponError] = useState('');
  const [checkoutCouponApplying, setCheckoutCouponApplying] = useState(false);
  const [showCheckoutCoupon, setShowCheckoutCoupon] = useState(false);

  // Computed
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const deliveryFee = useMemo(() => {
    return selectedZone?.price ?? 0;
  }, [selectedZone]);
  const couponDiscount = useMemo(() => calcCouponDiscount(appliedCoupon, subtotal), [appliedCoupon, subtotal]);
  const cartTotal = useMemo(() => Math.max(0, subtotal + deliveryFee - couponDiscount), [subtotal, deliveryFee, couponDiscount]);

  // Auto-remove coupon if it becomes invalid (e.g. subtotal dropped below minOrder)
  const couponValidationError = useMemo(() => validateCouponForSubtotal(appliedCoupon, subtotal), [appliedCoupon, subtotal]);
  useEffect(() => {
    if (appliedCoupon && couponValidationError) {
      removeCouponAction();
    }
  }, [appliedCoupon, couponValidationError, removeCouponAction]);

  // Clear coupon when cart becomes empty
  useEffect(() => {
    if (items.length === 0 && appliedCoupon) {
      removeCouponAction();
    }
  }, [items.length, appliedCoupon, removeCouponAction]);

  // Coupon apply handler (on checkout page)
  const handleCheckoutCoupon = async () => {
    setCheckoutCouponError('');
    if (!checkoutCouponInput.trim()) return;
    if (subtotal <= 0) {
      setCheckoutCouponError(isAr ? 'أضف منتجات للسلة أولاً' : 'Add items to cart first');
      return;
    }
    setCheckoutCouponApplying(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: checkoutCouponInput.trim().toUpperCase(), subtotal, userId: currentUser?.id }),
      });
      const data = await res.json();
      if (data.valid && data.coupon) {
        applyCouponAction({
          code: checkoutCouponInput.trim().toUpperCase(),
          type: data.coupon.type as 'percentage' | 'fixed',
          value: Number(data.coupon.value),
          minOrder: Number(data.coupon.minOrder) || 0,
          maxDiscount: data.coupon.maxDiscount != null ? Number(data.coupon.maxDiscount) : null,
          discount: Number(data.coupon.discount) || 0,
        });
        setCheckoutCouponInput('');
        setShowCheckoutCoupon(false);
      } else {
        setCheckoutCouponError(data.error || (isAr ? 'كود الخصم غير صالح' : 'Invalid coupon code'));
      }
    } catch {
      setCheckoutCouponError(isAr ? 'فشل الاتصال بالخادم' : 'Connection failed');
    } finally {
      setCheckoutCouponApplying(false);
    }
  };

  const selectedAddress = useMemo(() => addresses.find((a) => a.id === selectedAddressId), [addresses, selectedAddressId]);

  // Auto-detect zone for selected address
  const addressZoneInfo = useMemo(() => {
    if (!selectedAddress) return null;
    return findZoneAndRegion(selectedAddress);
  }, [selectedAddress]);

  // Scroll to top when step changes or order is confirmed
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, orderSuccess]);

  // Re-validate coupon on checkout mount (coupon may have expired since it was applied)
  useEffect(() => {
    if (!appliedCoupon || subtotal <= 0) return;
    const validate = async () => {
      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedCoupon.code, subtotal, userId: currentUser?.id }),
        });
        const data = await res.json();
        if (!data.valid) {
          // Coupon is no longer valid — remove it
          removeCouponAction();
        }
      } catch {
        // Network error — keep coupon, server will re-validate on order placement
      }
    };
    validate();
  }, []); // Only on mount

  // Can proceed checks
  const canProceedAddress = selectedAddressId !== '' && selectedZone !== null;
  const canProceedPayment = paymentMethod !== '';
  const canPlaceOrder = canProceedAddress && canProceedPayment;

  // When a saved address is selected, auto-detect and set the zone
  useEffect(() => {
    if (selectedAddress && addressZoneInfo) {
      setSelectedZone(addressZoneInfo.zone);
      setSelectedRegion(addressZoneInfo.region);
    }
  }, [selectedAddress, addressZoneInfo]);

  // ─── Fetch addresses ───
  useEffect(() => {
    if (!currentUser?.id) return;
    setAddressLoading(true);
    fetch(`/api/addresses?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses) {
          setAddresses(data.addresses);
          const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (data.addresses.length > 0) setSelectedAddressId(data.addresses[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setAddressLoading(false));
  }, [currentUser?.id]);

  // ─── Save new address ───
  const handleSaveAddress = async () => {
    if (!newAddress.label || !newAddress.address || !newAddress.zoneId) return;
    if (!currentUser?.id) return;
    setAddressSaving(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          label: newAddress.label,
          address: newAddress.address,
          city: newAddress.city,
          area: newAddress.area,
          notes: newAddress.notes,
          zoneId: newAddress.zoneId,
          isDefault: addresses.length === 0,
        }),
      });
      const data = await res.json();
      if (data.address) {
        setAddresses((prev) => [...prev, data.address]);
        setSelectedAddressId(data.address.id);
        setNewAddress({ label: '', address: '', city: '', area: '', notes: '', zoneId: '' });
        setShowNewAddress(false);
      }
    } catch {
      // silent
    } finally {
      setAddressSaving(false);
    }
  };

  // ─── Handle zone selection (in new address form) ───
  const handleZoneSelectInForm = (zone: DeliveryZone, region: DeliveryRegion) => {
    setSelectedZone(zone);
    setSelectedRegion(region);
    setNewAddress((p) => ({
      ...p,
      zoneId: zone.id,
      city: isAr ? region.nameAr : region.nameEn,
      area: isAr ? zone.nameAr : zone.nameEn,
    }));
  };

  // ─── Handle zone selection (in edit address form) ───
  const handleZoneSelectInEdit = (zone: DeliveryZone, region: DeliveryRegion) => {
    setSelectedZone(zone);
    setSelectedRegion(region);
    setEditAddress((p) => ({
      ...p,
      zoneId: zone.id,
      city: isAr ? region.nameAr : region.nameEn,
      area: isAr ? zone.nameAr : zone.nameEn,
    }));
  };

  // ─── Start editing an address ───
  const startEditAddress = (addr: SavedAddress) => {
    const addrZone = findZoneAndRegion(addr);
    setEditingAddressId(addr.id);
    setEditAddress({
      label: addr.label,
      address: addr.address,
      city: addr.city,
      area: addr.area,
      notes: addr.notes,
      zoneId: addrZone?.zone.id || '',
    });
    if (addrZone) {
      setSelectedZone(addrZone.zone);
      setSelectedRegion(addrZone.region);
    }
  };

  // ─── Cancel editing ───
  const cancelEditAddress = () => {
    setEditingAddressId(null);
    setEditAddress({ label: '', address: '', city: '', area: '', notes: '', zoneId: '' });
  };

  // ─── Save edited address ───
  const handleUpdateAddress = async () => {
    if (!editingAddressId || !editAddress.label || !editAddress.address) return;
    setEditAddressSaving(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAddressId,
          label: editAddress.label,
          address: editAddress.address,
          city: editAddress.city,
          area: editAddress.area,
          notes: editAddress.notes,
        }),
      });
      const data = await res.json();
      if (data.address) {
        setAddresses((prev) => prev.map((a) => a.id === editingAddressId ? { ...a, ...data.address } : a));
        setEditingAddressId(null);
        setEditAddress({ label: '', address: '', city: '', area: '', notes: '', zoneId: '' });
      }
    } catch {
      // silent
    } finally {
      setEditAddressSaving(false);
    }
  };

  // ─── Delete an address ───
  const handleDeleteAddress = async (addrId: string) => {
    setDeletingAddressId(addrId);
    try {
      const res = await fetch(`/api/addresses?id=${addrId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== addrId));
        if (selectedAddressId === addrId) {
          setSelectedAddressId('');
          setSelectedZone(null);
          setSelectedRegion(null);
        }
      }
    } catch {
      // silent
    } finally {
      setDeletingAddressId(null);
    }
  };

  // ─── Filter zones by search ───
  const filteredRegions = useMemo(() => {
    if (!zoneSearch.trim()) return DELIVERY_REGIONS;
    const q = zoneSearch.trim().toLowerCase();
    return DELIVERY_REGIONS.map((region) => {
      const regionNameMatch = region.nameAr.includes(q) || region.nameEn.toLowerCase().includes(q);
      const filteredZones = region.zones.filter(
        (z) => z.nameAr.includes(q) || z.nameEn.toLowerCase().includes(q)
      );
      if (regionNameMatch) return region;
      if (filteredZones.length > 0) return { ...region, zones: filteredZones };
      return null;
    }).filter(Boolean) as DeliveryRegion[];
  }, [zoneSearch]);

  // ─── Place Order ───
  const handlePlaceOrder = async () => {
    if (!currentUser?.id || !canPlaceOrder) return;
    setOrderPlacing(true);
    setOrderError('');
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      const addr = selectedAddress;
      const body: Record<string, unknown> = {
        userId: currentUser.id,
        items: orderItems,
        paymentMethod,
        notes: orderNotes,
        deliveryFee,
        // Note: discount is NOT sent from client — server recalculates from couponCode
        address: addr ? {
          fullName: currentUser.name,
          phone: currentUser.phone,
          city: addr.city,
          area: addr.area,
          streetAddress: addr.address,
          notes: addr.notes,
          zoneId: selectedZone?.id,
          deliveryZoneName: selectedZone ? (isAr ? selectedZone.nameAr : selectedZone.nameEn) : undefined,
        } : undefined,
      };
      if (couponCode) body.couponCode = couponCode;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrderNumber(data.order.orderNumber);
        setOrderSuccess(true);
        clearCart();
        removeCouponAction();
      } else {
        setOrderError(data.error || (isAr ? 'فشل إنشاء الطلب' : 'Failed to create order'));
      }
    } catch {
      setOrderError(isAr ? 'فشل الاتصال بالخادم' : 'Connection failed');
    } finally {
      setOrderPlacing(false);
    }
  };

  // ─── Step navigation ───
  const goToStep = (step: CheckoutStep) => setCurrentStep(step);
  const goNext = () => {
    const idx = stepIndex;
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].key);
  };
  const goBack = () => {
    const idx = stepIndex;
    if (idx > 0) setCurrentStep(STEPS[idx - 1].key);
    else setAuthView('cart');
  };

  // ─── Copy state ───
  const [copied, setCopied] = useState(false);

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = orderNumber;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // ORDER SUCCESS SCREEN
  // ═══════════════════════════════════════════════════════════════════════
  if (orderSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 overflow-hidden" dir={direction}>
        {/* ─── Fireworks Effect ─── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {/* Burst explosions — multiple fireworks going off at different positions */}
          {[
            { x: '15%', y: '20%', color: '#00A8CC', delay: 0 },
            { x: '75%', y: '15%', color: '#FBBF24', delay: 0.4 },
            { x: '50%', y: '10%', color: '#F472B6', delay: 0.8 },
            { x: '25%', y: '30%', color: '#4ADE80', delay: 1.3 },
            { x: '85%', y: '25%', color: '#00897B', delay: 1.7 },
            { x: '40%', y: '18%', color: '#00C4E8', delay: 2.2 },
            { x: '65%', y: '22%', color: '#FBBF24', delay: 2.8 },
            { x: '20%', y: '12%', color: '#F472B6', delay: 3.3 },
          ].map((fw, fi) => (
            <div key={`fw-${fi}`} className="absolute" style={{ left: fw.x, top: fw.y }}>
              {/* Rocket trail — rises up then explodes */}
              <motion.div
                className="absolute"
                initial={{ y: 120, opacity: 1 }}
                animate={{ y: 0, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.6, delay: fw.delay, ease: 'easeOut' }}
              >
                <div className="w-1 h-3 rounded-full" style={{ background: fw.color, boxShadow: `0 0 6px ${fw.color}` }} />
              </motion.div>
              {/* Burst particles — explode outward in a circle */}
              {[...Array(14)].map((_, pi) => {
                const angle = (pi / 14) * Math.PI * 2;
                const distance = 40 + Math.random() * 50;
                return (
                  <motion.div
                    key={pi}
                    className="absolute rounded-full"
                    style={{
                      width: 3 + Math.random() * 4,
                      height: 3 + Math.random() * 4,
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
              {[...Array(8)].map((_, pi) => {
                const angle = (pi / 8) * Math.PI * 2 + Math.PI / 8;
                const distance = 18 + Math.random() * 22;
                const secColor = ['#ffffff', '#FDE68A', '#A7F3D0'][pi % 3];
                return (
                  <motion.div
                    key={`s-${pi}`}
                    className="absolute rounded-full"
                    style={{
                      width: 2 + Math.random() * 2,
                      height: 2 + Math.random() * 2,
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
                  width: 20,
                  height: 20,
                  background: `radial-gradient(circle, ${fw.color}80 0%, transparent 70%)`,
                  left: -10,
                  top: -10,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 3, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.5, delay: fw.delay + 0.5, ease: 'easeOut' }}
              />
            </div>
          ))}

          {/* Falling sparkles — gentle drifting after bursts */}
          {[...Array(18)].map((_, i) => {
            const startX = 5 + Math.random() * 90;
            const driftX = (Math.random() - 0.5) * 60;
            const colors = ['#00A8CC', '#00897B', '#4ADE80', '#FBBF24', '#F472B6', '#ffffff'];
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute"
                style={{ left: `${startX}%`, top: 0 }}
                initial={{ y: -10, x: 0, opacity: 0, scale: 0 }}
                animate={{
                  y: ['0%', `${60 + Math.random() * 40}%`],
                  x: [0, driftX],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0.3],
                  rotate: [0, Math.random() * 360],
                }}
                transition={{
                  duration: 2.5 + Math.random() * 2,
                  delay: 0.8 + i * 0.2 + Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: 2 + Math.random() * 4,
                    height: 2 + Math.random() * 4,
                    background: color,
                    boxShadow: `0 0 4px ${color}`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          className="max-w-md w-full text-center relative z-10"
        >
          {/* ─── Success Icon with ring pulse ─── */}
          <motion.div
            className="relative mx-auto mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          >
            {/* Pulsing rings */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: '2px solid rgba(0,168,204,0.3)' }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{ border: '1.5px solid rgba(0,137,123,0.2)' }}
              animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            {/* Glow */}
            <div
              className="absolute -inset-10 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.2) 0%, rgba(0,137,123,0.1) 40%, transparent 70%)', filter: 'blur(15px)' }}
            />
            {/* Main circle */}
            <motion.div
              className="relative w-28 h-28 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'linear-gradient(135deg, #004B63, #006B8A, #00897B)' }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              {/* Checkmark animation */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.4 }}
              >
                <CheckCircle2 size={52} className="text-white" strokeWidth={1.5} />
              </motion.div>
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.15) 10%, transparent 20%)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </motion.div>

          {/* ─── Success Message ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #00C4E8, #00897B)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isAr ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
            </h2>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-relaxed">
              {isAr ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً' : 'Thank you! Your order has been received and will be processed soon'}
            </p>
          </motion.div>

          {/* ─── Order Number Card with Copy ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 18 }}
            className="mt-6"
          >
            <div className="glass-card rounded-2xl p-5 inline-block min-w-[260px] relative overflow-hidden">
              {/* Decorative gradient line at top */}
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{ background: 'linear-gradient(90deg, #004B63, #00897B, #00A8CC, #00897B, #004B63)' }}
              />
              <p className="text-xs text-muted-foreground mb-1">{isAr ? 'رقم الطلب' : 'Order Number'}</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-xl font-bold text-foreground tracking-wider" dir="ltr">{orderNumber}</p>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleCopyOrderNumber}
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0',
                    copied
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-nabdh-primary/10 text-nabdh-primary hover:bg-nabdh-primary/20'
                  )}
                  title={copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ رقم الطلب' : 'Copy order number')}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        <CheckCheck size={16} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0, rotate: 90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -90 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        <Copy size={16} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
              {/* Copied feedback text */}
              <AnimatePresence>
                {copied && (
                  <motion.p
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    className="text-[10px] text-emerald-500 font-medium mt-1"
                  >
                    {isAr ? '✓ تم نسخ رقم الطلب' : '✓ Order number copied'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ─── Success Steps ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 glass-card rounded-2xl p-4"
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle2, label: isAr ? 'تم الاستلام' : 'Received', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: Package, label: isAr ? 'قيد التحضير' : 'Preparing', color: 'text-nabdh-accent', bg: 'bg-nabdh-accent/10' },
                { icon: Truck, label: isAr ? 'في الطريق' : 'On the way', color: 'text-nabdh-primary', bg: 'bg-nabdh-primary/10' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.15 }}
                  className="text-center"
                >
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-1.5', step.bg)}>
                    <step.icon size={18} className={step.color} />
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground">{step.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─── Actions ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 space-y-3"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => clearAuthView()}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #004B63, #00897B)', boxShadow: '0 4px 20px rgba(0,75,99,0.3)' }}
            >
              <ShoppingBag size={18} />
              <span>{isAr ? 'متابعة التسوق' : 'Continue Shopping'}</span>
            </motion.button>
            <button
              onClick={() => { setOrderSuccess(false); setProfileScrollTo('orders'); setAuthView('profile'); }}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-nabdh-primary hover:bg-nabdh-primary/5 transition-colors flex items-center justify-center gap-2"
            >
              <Package size={16} />
              <span>{isAr ? 'عرض طلباتي' : 'View My Orders'}</span>
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EMPTY CART REDIRECT
  // ═══════════════════════════════════════════════════════════════════════
  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4" dir={direction}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Package size={60} className="mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold text-foreground">{isAr ? 'السلة فارغة' : 'Cart is Empty'}</h2>
          <p className="text-sm text-muted-foreground mt-2">{isAr ? 'أضف منتجات للسلة أولاً' : 'Add items to your cart first'}</p>
          <button
            onClick={() => setAuthView('cart')}
            className="mt-6 px-6 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
          >
            {isAr ? 'العودة للسلة' : 'Back to Cart'}
          </button>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN CHECKOUT VIEW
  // ═══════════════════════════════════════════════════════════════════════
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

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
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="max-w-5xl mx-auto">
            {/* Top Bar */}
            <div className="flex items-center gap-3 mb-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goBack}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <BackArrow className="size-4 text-white" />
              </motion.button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  {isAr ? 'إتمام الشراء' : 'Checkout'}
                </h1>
                <p className="text-white/50 text-xs">{totalItems} {isAr ? 'منتج' : 'items'} — {subtotal.toFixed(2)} {currency}</p>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-1 sm:gap-2">
              {STEPS.map((step, i) => {
                const isActive = i === stepIndex;
                const isDone = i < stepIndex;
                const StepIcon = i === 0 ? MapPin : i === 1 ? CreditCard : CheckCircle2;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <button
                      onClick={() => isDone && goToStep(step.key)}
                      className={cn(
                        'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all w-full',
                        isActive
                          ? 'bg-white/15 backdrop-blur-sm border border-white/20'
                          : isDone
                            ? 'bg-white/5 hover:bg-white/10 cursor-pointer'
                            : 'opacity-40'
                      )}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          isActive
                            ? 'bg-white text-nabdh-primary'
                            : isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white/20 text-white/70'
                        )}
                      >
                        {isDone ? <Check size={12} /> : i + 1}
                      </div>
                      <span className={cn(
                        'text-xs sm:text-sm font-medium hidden sm:block',
                        isActive ? 'text-white' : 'text-white/60'
                      )}>
                        {isAr ? step.iconAr : step.iconEn}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={cn('w-4 sm:w-6 h-0.5 mx-0.5 shrink-0', i < stepIndex ? 'bg-emerald-500' : 'bg-white/20')} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ─── Left: Step Content ─── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* ═══════ STEP 1: ADDRESS & SHIPPING (merged) ═══════ */}
              {currentStep === 'address' && (
                <motion.div key="address" initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? 20 : -20 }} transition={{ duration: 0.25 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-nabdh-primary/10 flex items-center justify-center">
                      <MapPin size={20} className="text-nabdh-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{isAr ? 'العنوان والشحن' : 'Address & Shipping'}</h2>
                      <p className="text-xs text-muted-foreground">{isAr ? 'اختر عنوان التوصيل ومنطقة الشحن' : 'Select delivery address and shipping zone'}</p>
                    </div>
                  </div>

                  {/* Saved Addresses */}
                  {addressLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="size-6 animate-spin text-nabdh-primary" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => {
                        const addrZoneInfo = findZoneAndRegion(addr);
                        const isAddressSelected = selectedAddressId === addr.id;
                        const zoneMatched = isAddressSelected && selectedZone && addrZoneInfo && addrZoneInfo.zone.id === selectedZone.id;
                        const isEditing = editingAddressId === addr.id;
                        const isDeleting = deletingAddressId === addr.id;

                        // ─── Edit mode for this address ───
                        if (isEditing) {
                          return (
                            <motion.div
                              key={`edit-${addr.id}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="glass-card rounded-2xl p-5 space-y-4 overflow-hidden ring-2 ring-nabdh-primary/40"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-foreground flex items-center gap-2">
                                  <Pencil size={16} className="text-nabdh-primary" />
                                  {isAr ? 'تعديل العنوان' : 'Edit Address'}
                                </h3>
                                <button onClick={cancelEditAddress} className="text-muted-foreground hover:text-foreground transition-colors">
                                  <X size={18} />
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'تسمية العنوان' : 'Address Label'} *</Label>
                                  <div className="relative">
                                    <Home size={14} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                                    <Input
                                      value={editAddress.label}
                                      onChange={(e) => setEditAddress((p) => ({ ...p, label: e.target.value }))}
                                      placeholder={isAr ? 'مثال: المنزل' : 'e.g. Home'}
                                      className={cn('h-10', isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3')}
                                      dir={direction}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'المدينة' : 'City'}</Label>
                                  <div className="relative">
                                    <MapPin size={14} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                                    <Input
                                      value={editAddress.city}
                                      onChange={(e) => setEditAddress((p) => ({ ...p, city: e.target.value }))}
                                      placeholder={isAr ? 'تعبئة تلقائية' : 'Auto-filled'}
                                      className={cn('h-10 bg-muted/30', isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3')}
                                      dir={direction}
                                      readOnly
                                    />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'العنوان التفصيلي' : 'Street Address'} *</Label>
                                <Input
                                  value={editAddress.address}
                                  onChange={(e) => setEditAddress((p) => ({ ...p, address: e.target.value }))}
                                  placeholder={isAr ? 'مثال: شارع النصر، بجوار المستشفى' : 'e.g. Al-Nasr St, near the hospital'}
                                  dir={direction}
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'المنطقة' : 'Area'}</Label>
                                  <Input
                                    value={editAddress.area}
                                    onChange={(e) => setEditAddress((p) => ({ ...p, area: e.target.value }))}
                                    placeholder={isAr ? 'تعبئة تلقائية' : 'Auto-filled'}
                                    className="h-10 bg-muted/30"
                                    dir={direction}
                                    readOnly
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'ملاحظات' : 'Notes'}</Label>
                                  <Input
                                    value={editAddress.notes}
                                    onChange={(e) => setEditAddress((p) => ({ ...p, notes: e.target.value }))}
                                    placeholder={isAr ? 'ملاحظات إضافية' : 'Additional notes'}
                                    dir={direction}
                                  />
                                </div>
                              </div>

                              {/* ─── Delivery Zone Selector (in edit form) ─── */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Truck size={16} className="text-nabdh-primary" />
                                  <Label className="text-sm font-bold text-foreground">{isAr ? 'منطقة التوصيل' : 'Delivery Zone'} *</Label>
                                </div>
                                <div className="relative">
                                  <Search size={16} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                                  <Input
                                    value={zoneSearch}
                                    onChange={(e) => setZoneSearch(e.target.value)}
                                    placeholder={isAr ? 'ابحث عن منطقتك...' : 'Search for your area...'}
                                    className={cn('h-10 rounded-xl', isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3')}
                                    dir={direction}
                                  />
                                  {zoneSearch && (
                                    <button onClick={() => setZoneSearch('')} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'left-3' : 'right-3')}>
                                      <X size={14} />
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-2 max-h-[35vh] overflow-y-auto">
                                  {filteredRegions.map((region) => {
                                    const isExpanded = expandedRegion === region.id || zoneSearch.trim().length > 0;
                                    const regionEmoji = region.id === 'tripoli' ? '🏙️' : region.id === 'western' ? '🌅' : region.id === 'eastern' ? '🏜️' : region.id === 'mountain' ? '⛰️' : '🏗️';
                                    return (
                                      <div key={region.id} className="rounded-xl overflow-hidden border border-muted/30">
                                        <button
                                          onClick={() => setExpandedRegion(isExpanded && !zoneSearch.trim() ? '' : region.id)}
                                          className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <span className="text-lg">{regionEmoji}</span>
                                            <div className="text-start">
                                              <p className="font-bold text-xs text-foreground">{isAr ? region.nameAr : region.nameEn}</p>
                                              <p className="text-[10px] text-muted-foreground">{region.zones.length} {isAr ? 'منطقة' : 'zones'}</p>
                                            </div>
                                          </div>
                                          {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                                        </button>
                                        <AnimatePresence>
                                          {isExpanded && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="px-2 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                {region.zones.map((zone) => {
                                                  const isSelected = editAddress.zoneId === zone.id;
                                                  return (
                                                    <button
                                                      key={zone.id}
                                                      onClick={() => handleZoneSelectInEdit(zone, region)}
                                                      className={cn(
                                                        'text-start p-2.5 rounded-lg transition-all duration-200 border',
                                                        isSelected
                                                          ? 'bg-nabdh-primary/10 border-nabdh-primary/40 shadow-sm'
                                                          : 'bg-muted/20 border-transparent hover:bg-muted/30 hover:border-nabdh-primary/20'
                                                      )}
                                                    >
                                                      <div className="flex items-center justify-between gap-1.5">
                                                        <p className="text-xs font-medium text-foreground truncate">{isAr ? zone.nameAr : zone.nameEn}</p>
                                                        {isSelected && <Check size={12} className="text-nabdh-primary shrink-0" />}
                                                      </div>
                                                      <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-nabdh-price">{zone.price} {isAr ? 'د.ل' : 'LYD'}</span>
                                                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                                          <Clock size={8} />
                                                          {isAr ? zone.durationAr : zone.durationEn}
                                                        </span>
                                                      </div>
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Selected zone info */}
                                {editAddress.zoneId && selectedZone && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl glass-card flex items-center gap-3"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-nabdh-primary/10 flex items-center justify-center shrink-0">
                                      <Truck size={14} className="text-nabdh-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs font-bold text-foreground">{isAr ? selectedZone.nameAr : selectedZone.nameEn}</p>
                                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                        <span>{selectedZone.price} {isAr ? 'د.ل' : 'LYD'}</span>
                                        <span className="flex items-center gap-0.5"><Clock size={8} />{isAr ? selectedZone.durationAr : selectedZone.durationEn}</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>

                              {/* Save / Cancel */}
                              <div className="flex gap-3">
                                <Button variant="outline" onClick={cancelEditAddress} className="flex-1">{isAr ? 'إلغاء' : 'Cancel'}</Button>
                                <Button
                                  onClick={handleUpdateAddress}
                                  disabled={!editAddress.label || !editAddress.address || editAddressSaving}
                                  className="flex-1 nabdh-gradient text-white hover:opacity-90"
                                >
                                  {editAddressSaving ? <Loader2 className="size-4 animate-spin" /> : (isAr ? 'حفظ التعديلات' : 'Save Changes')}
                                </Button>
                              </div>
                            </motion.div>
                          );
                        }

                        // ─── Normal address card ───
                        return (
                          <motion.div
                            key={addr.id}
                            className={cn(
                              'w-full text-start glass-card rounded-2xl p-4 transition-all duration-200',
                              isAddressSelected
                                ? 'ring-2 ring-nabdh-primary shadow-lg shadow-nabdh-primary/10'
                                : 'hover:border-nabdh-primary/30'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              {/* Radio button - click selects address */}
                              <button
                                onClick={() => {
                                  setSelectedAddressId(addr.id);
                                  if (addrZoneInfo) {
                                    setSelectedZone(addrZoneInfo.zone);
                                    setSelectedRegion(addrZoneInfo.region);
                                  }
                                }}
                                className={cn(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                                  isAddressSelected ? 'border-nabdh-primary bg-nabdh-primary' : 'border-muted-foreground/30'
                                )}
                              >
                                {isAddressSelected && <Check size={12} className="text-white" />}
                              </button>

                              {/* Address content - click also selects */}
                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => {
                                  setSelectedAddressId(addr.id);
                                  if (addrZoneInfo) {
                                    setSelectedZone(addrZoneInfo.zone);
                                    setSelectedRegion(addrZoneInfo.region);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-foreground">{addr.label}</span>
                                  {addr.isDefault && (
                                    <Badge className="bg-nabdh-primary/10 text-nabdh-primary text-[9px] border-0">{isAr ? 'افتراضي' : 'Default'}</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{addr.address}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <MapPin size={10} />
                                  <span>{addr.city}{addr.area ? ` — ${addr.area}` : ''}</span>
                                </div>
                                {/* Delivery info inline */}
                                {isAddressSelected && addrZoneInfo && zoneMatched && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 flex items-center gap-2 text-xs"
                                  >
                                    <span className="text-emerald-600">✅</span>
                                    <span className="text-emerald-600 font-medium">
                                      {isAr
                                        ? `توصيل إلى ${addrZoneInfo.zone.nameAr} — ${addrZoneInfo.zone.price} د.ل — ${addrZoneInfo.zone.durationAr}`
                                        : `Delivery to ${addrZoneInfo.zone.nameEn} — ${addrZoneInfo.zone.price} LYD — ${addrZoneInfo.zone.durationEn}`
                                      }
                                    </span>
                                  </motion.div>
                                )}
                                {isAddressSelected && !addrZoneInfo && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 flex items-center gap-2 text-xs"
                                  >
                                    <span className="text-amber-500">⚠️</span>
                                    <span className="text-amber-600 font-medium">
                                      {isAr ? 'حدد منطقة التوصيل أدناه' : 'Select delivery zone below'}
                                    </span>
                                  </motion.div>
                                )}
                              </div>

                              {/* Right side: icon + action buttons */}
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                {/* Address type icon */}
                                {addr.label.includes('منزل') || addr.label.toLowerCase().includes('home') ? (
                                  <Home size={16} className="text-muted-foreground" />
                                ) : (
                                  <Building2 size={16} className="text-muted-foreground" />
                                )}
                                {/* Edit / Delete buttons */}
                                <div className="flex items-center gap-0.5 mt-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); startEditAddress(addr); }}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-nabdh-primary hover:bg-nabdh-primary/10 transition-all"
                                    title={isAr ? 'تعديل' : 'Edit'}
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                                    disabled={isDeleting}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                    title={isAr ? 'حذف' : 'Delete'}
                                  >
                                    {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Mini zone picker — shown when address is selected but zone not auto-detected */}
                      {selectedAddressId && !findZoneAndRegion(addresses.find((a) => a.id === selectedAddressId)!) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="glass-card rounded-2xl p-4 space-y-3 overflow-hidden"
                        >
                          <div className="flex items-center gap-2">
                            <Truck size={16} className="text-nabdh-primary" />
                            <h4 className="text-sm font-bold text-foreground">{isAr ? 'منطقة التوصيل' : 'Delivery Zone'}</h4>
                            <span className="text-[10px] text-amber-500 font-medium">({isAr ? 'مطلوب' : 'Required'})</span>
                          </div>
                          {/* Zone Search */}
                          <div className="relative">
                            <Search size={16} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                            <Input
                              value={zoneSearch}
                              onChange={(e) => setZoneSearch(e.target.value)}
                              placeholder={isAr ? 'ابحث عن منطقتك...' : 'Search for your area...'}
                              className={cn('h-10 rounded-xl', isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3')}
                              dir={direction}
                            />
                            {zoneSearch && (
                              <button onClick={() => setZoneSearch('')} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'left-3' : 'right-3')}>
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          {/* Regions & Zones */}
                          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                            {filteredRegions.map((region) => {
                              const isExpanded = expandedRegion === region.id || zoneSearch.trim().length > 0;
                              const regionEmoji = region.id === 'tripoli' ? '🏙️' : region.id === 'western' ? '🌅' : region.id === 'eastern' ? '🏜️' : region.id === 'mountain' ? '⛰️' : '🏗️';
                              return (
                                <div key={region.id} className="rounded-xl overflow-hidden border border-muted/30">
                                  <button
                                    onClick={() => setExpandedRegion(isExpanded && !zoneSearch.trim() ? '' : region.id)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-lg">{regionEmoji}</span>
                                      <div className="text-start">
                                        <p className="font-bold text-xs text-foreground">{isAr ? region.nameAr : region.nameEn}</p>
                                        <p className="text-[10px] text-muted-foreground">{region.zones.length} {isAr ? 'منطقة' : 'zones'}</p>
                                      </div>
                                    </div>
                                    {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                                  </button>
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="px-2 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                          {region.zones.map((zone) => {
                                            const isSelected = selectedZone?.id === zone.id;
                                            return (
                                              <button
                                                key={zone.id}
                                                onClick={() => { setSelectedZone(zone); setSelectedRegion(region); }}
                                                className={cn(
                                                  'text-start p-2.5 rounded-lg transition-all duration-200 border',
                                                  isSelected
                                                    ? 'bg-nabdh-primary/10 border-nabdh-primary/40 shadow-sm'
                                                    : 'bg-muted/20 border-transparent hover:bg-muted/30 hover:border-nabdh-primary/20'
                                                )}
                                              >
                                                <div className="flex items-center justify-between gap-1.5">
                                                  <p className="text-xs font-medium text-foreground truncate">{isAr ? zone.nameAr : zone.nameEn}</p>
                                                  {isSelected && <Check size={12} className="text-nabdh-primary shrink-0" />}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <span className="text-[10px] font-bold text-nabdh-price">{zone.price} {isAr ? 'د.ل' : 'LYD'}</span>
                                                  <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                                    <Clock size={8} />
                                                    {isAr ? zone.durationAr : zone.durationEn}
                                                  </span>
                                                </div>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                      {/* Add New Address Button */}
                      {!showNewAddress && (
                        <button
                          onClick={() => setShowNewAddress(true)}
                          className="w-full glass-card rounded-2xl p-4 border-dashed border-2 border-nabdh-primary/20 hover:border-nabdh-primary/40 transition-colors flex items-center justify-center gap-2 text-nabdh-primary"
                        >
                          <Plus size={18} />
                          <span className="text-sm font-bold">{isAr ? 'إضافة عنوان جديد' : 'Add New Address'}</span>
                        </button>
                      )}

                      {/* New Address Form */}
                      <AnimatePresence>
                        {showNewAddress && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass-card rounded-2xl p-5 space-y-4 overflow-hidden"
                          >
                            <h3 className="font-bold text-foreground">{isAr ? 'عنوان جديد' : 'New Address'}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'تسمية العنوان' : 'Address Label'} *</Label>
                                <div className="relative">
                                  <Home size={14} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                                  <Input
                                    value={newAddress.label}
                                    onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value }))}
                                    placeholder={isAr ? 'مثال: المنزل' : 'e.g. Home'}
                                    className={cn('h-10', isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3')}
                                    dir={direction}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'المدينة' : 'City'}</Label>
                                <div className="relative">
                                  <MapPin size={14} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                                  <Input
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                                    placeholder={isAr ? 'تعبئة تلقائية' : 'Auto-filled'}
                                    className={cn('h-10 bg-muted/30', isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3')}
                                    dir={direction}
                                    readOnly
                                  />
                                </div>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'العنوان التفصيلي' : 'Street Address'} *</Label>
                              <Input
                                value={newAddress.address}
                                onChange={(e) => setNewAddress((p) => ({ ...p, address: e.target.value }))}
                                placeholder={isAr ? 'مثال: شارع النصر، بجوار المستشفى' : 'e.g. Al-Nasr St, near the hospital'}
                                dir={direction}
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'المنطقة' : 'Area'}</Label>
                                <div className="relative">
                                  <Input
                                    value={newAddress.area}
                                    onChange={(e) => setNewAddress((p) => ({ ...p, area: e.target.value }))}
                                    placeholder={isAr ? 'تعبئة تلقائية' : 'Auto-filled'}
                                    className="h-10 bg-muted/30"
                                    dir={direction}
                                    readOnly
                                  />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground mb-1.5 block">{isAr ? 'ملاحظات' : 'Notes'}</Label>
                                <Input
                                  value={newAddress.notes}
                                  onChange={(e) => setNewAddress((p) => ({ ...p, notes: e.target.value }))}
                                  placeholder={isAr ? 'ملاحظات إضافية' : 'Additional notes'}
                                  dir={direction}
                                />
                              </div>
                            </div>

                            {/* ─── Delivery Zone Selector (embedded in form) ─── */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Truck size={16} className="text-nabdh-primary" />
                                <Label className="text-sm font-bold text-foreground">{isAr ? 'منطقة التوصيل' : 'Delivery Zone'} *</Label>
                              </div>

                              {/* Zone Search */}
                              <div className="relative">
                                <Search size={16} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                                <Input
                                  value={zoneSearch}
                                  onChange={(e) => setZoneSearch(e.target.value)}
                                  placeholder={isAr ? 'ابحث عن منطقتك...' : 'Search for your area...'}
                                  className={cn('h-11 rounded-xl', isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3')}
                                  dir={direction}
                                />
                                {zoneSearch && (
                                  <button onClick={() => setZoneSearch('')} className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', isRTL ? 'left-3' : 'right-3')}>
                                    <X size={14} />
                                  </button>
                                )}
                              </div>

                              {/* Regions & Zones */}
                              <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                                {filteredRegions.map((region) => {
                                  const isExpanded = expandedRegion === region.id || zoneSearch.trim().length > 0;
                                  const regionEmoji = region.id === 'tripoli' ? '🏙️' : region.id === 'western' ? '🌅' : region.id === 'eastern' ? '🏜️' : region.id === 'mountain' ? '⛰️' : '🏗️';

                                  return (
                                    <div key={region.id} className="glass-card rounded-2xl overflow-hidden">
                                      <button
                                        onClick={() => setExpandedRegion(isExpanded && !zoneSearch.trim() ? '' : region.id)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="text-xl">{regionEmoji}</span>
                                          <div className="text-start">
                                            <p className="font-bold text-sm text-foreground">{isAr ? region.nameAr : region.nameEn}</p>
                                            <p className="text-[11px] text-muted-foreground">{region.zones.length} {isAr ? 'منطقة' : 'zones'}</p>
                                          </div>
                                        </div>
                                        {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                                      </button>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="px-3 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              {region.zones.map((zone) => {
                                                const isSelected = newAddress.zoneId === zone.id;
                                                return (
                                                  <button
                                                    key={zone.id}
                                                    onClick={() => handleZoneSelectInForm(zone, region)}
                                                    className={cn(
                                                      'text-start p-3 rounded-xl transition-all duration-200 border',
                                                      isSelected
                                                        ? 'bg-nabdh-primary/10 border-nabdh-primary/40 shadow-sm'
                                                        : 'bg-muted/20 border-transparent hover:bg-muted/30 hover:border-nabdh-primary/20'
                                                    )}
                                                  >
                                                    <div className="flex items-center justify-between gap-2">
                                                      <p className="text-sm font-medium text-foreground truncate">{isAr ? zone.nameAr : zone.nameEn}</p>
                                                      {isSelected && <Check size={14} className="text-nabdh-primary shrink-0" />}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                      <span className="text-xs font-bold text-nabdh-price">{zone.price} {isAr ? 'د.ل' : 'LYD'}</span>
                                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock size={9} />
                                                        {isAr ? zone.durationAr : zone.durationEn}
                                                      </span>
                                                    </div>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Selected zone info */}
                              {newAddress.zoneId && selectedZone && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-4 rounded-2xl glass-card flex items-center gap-3"
                                >
                                  <div className="w-10 h-10 rounded-full bg-nabdh-primary/10 flex items-center justify-center shrink-0">
                                    <Truck size={18} className="text-nabdh-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-foreground">{isAr ? selectedZone.nameAr : selectedZone.nameEn}</p>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                      <span>{selectedZone.price} {isAr ? 'د.ل' : 'LYD'}</span>
                                      <span className="flex items-center gap-1"><Clock size={10} />{isAr ? selectedZone.durationAr : selectedZone.durationEn}</span>
                                    </div>
                                  </div>
                                  <span className="text-lg font-bold text-nabdh-price">{selectedZone.price} {isAr ? 'د.ل' : 'LYD'}</span>
                                </motion.div>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <Button variant="outline" onClick={() => { setShowNewAddress(false); setNewAddress({ label: '', address: '', city: '', area: '', notes: '', zoneId: '' }); setSelectedZone(null); setSelectedRegion(null); }} className="flex-1">{isAr ? 'إلغاء' : 'Cancel'}</Button>
                              <Button
                                onClick={handleSaveAddress}
                                disabled={!newAddress.label || !newAddress.address || !newAddress.zoneId || addressSaving}
                                className="flex-1 nabdh-gradient text-white hover:opacity-90"
                              >
                                {addressSaving ? <Loader2 className="size-4 animate-spin" /> : (isAr ? 'حفظ العنوان' : 'Save Address')}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══════ STEP 2: PAYMENT ═══════ */}
              {currentStep === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? 20 : -20 }} transition={{ duration: 0.25 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-nabdh-primary/10 flex items-center justify-center">
                      <CreditCard size={20} className="text-nabdh-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{isAr ? 'طريقة الدفع' : 'Payment Method'}</h2>
                      <p className="text-xs text-muted-foreground">{isAr ? 'اختر كيف تود الدفع' : 'Choose how you want to pay'}</p>
                    </div>
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cod' | 'card')} className="space-y-3">
                    {/* Cash on Delivery */}
                    <motion.label
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        'flex items-center gap-4 glass-card rounded-2xl p-5 cursor-pointer transition-all',
                        paymentMethod === 'cod' ? 'ring-2 ring-nabdh-primary shadow-lg shadow-nabdh-primary/10' : 'hover:border-nabdh-primary/30'
                      )}
                    >
                      <RadioGroupItem value="cod" id="cod" className="data-[state=checked]:border-nabdh-primary data-[state=checked]:text-nabdh-primary" />
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Banknote size={24} className="text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{isAr ? 'ادفع عند استلام طلبك' : 'Pay when you receive your order'}</p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">{isAr ? 'متاح' : 'Available'}</Badge>
                    </motion.label>

                    {/* Card Payment - Coming Soon */}
                    <div
                      className={cn(
                        'flex items-center gap-4 glass-card rounded-2xl p-5 transition-all opacity-50 cursor-not-allowed'
                      )}
                    >
                      <RadioGroupItem value="card" id="card" disabled className="data-[state=checked]:border-nabdh-primary data-[state=checked]:text-nabdh-primary opacity-50" />
                      <div className="w-12 h-12 rounded-xl bg-nabdh-accent/10 flex items-center justify-center shrink-0">
                        <CreditCard size={24} className="text-nabdh-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{isAr ? 'الدفع بالبطاقة المصرفية' : 'Card Payment'}</p>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-600 border-0 text-[10px]">{isAr ? 'قريباً' : 'Coming Soon'}</Badge>
                    </div>
                  </RadioGroup>

                  {/* Order Notes */}
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                      <StickyNote size={14} className="text-muted-foreground" />
                      {isAr ? 'ملاحظات الطلب (اختياري)' : 'Order Notes (Optional)'}
                    </Label>
                    <Textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder={isAr ? 'أضف أي ملاحظات خاصة بطلبك...' : 'Add any special notes for your order...'}
                      className="min-h-[100px] resize-none"
                      dir={direction}
                    />
                  </div>
                </motion.div>
              )}

              {/* ═══════ STEP 3: REVIEW ═══════ */}
              {currentStep === 'review' && (
                <motion.div key="review" initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isRTL ? 20 : -20 }} transition={{ duration: 0.25 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-nabdh-primary/10 flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-nabdh-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{isAr ? 'مراجعة الطلب' : 'Order Review'}</h2>
                      <p className="text-xs text-muted-foreground">{isAr ? 'تأكد من تفاصيل طلبك قبل التأكيد' : 'Confirm your order details before placing'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Address & Shipping Summary */}
                    <div className="glass-card rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><MapPin size={14} className="text-nabdh-primary" />{isAr ? 'العنوان والشحن' : 'Address & Shipping'}</h3>
                        <button onClick={() => goToStep('address')} className="text-[11px] text-nabdh-primary font-medium">{isAr ? 'تعديل' : 'Edit'}</button>
                      </div>
                      {selectedAddress && (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">{selectedAddress.label}</p>
                          <p>{selectedAddress.address}</p>
                          <p>{selectedAddress.city}{selectedAddress.area ? ` — ${selectedAddress.area}` : ''}</p>
                        </div>
                      )}
                      {selectedZone && (
                        <div className="mt-2 pt-2 border-t border-muted/30">
                          <div className="flex items-center justify-between text-sm">
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                              <Truck size={12} className="text-nabdh-primary" />
                              {isAr ? selectedZone.nameAr : selectedZone.nameEn}
                            </p>
                            <p className="font-medium text-foreground">{selectedZone.price} {currency}</p>
                          </div>
                          <p className="text-xs mt-1 flex items-center gap-1 text-muted-foreground">
                            <Clock size={10} />
                            {isAr ? selectedZone.durationAr : selectedZone.durationEn}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Payment Summary */}
                    <div className="glass-card rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><CreditCard size={14} className="text-nabdh-primary" />{isAr ? 'الدفع' : 'Payment'}</h3>
                        <button onClick={() => goToStep('payment')} className="text-[11px] text-nabdh-primary font-medium">{isAr ? 'تعديل' : 'Edit'}</button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethod === 'cod'
                          ? (isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery')
                          : (isAr ? 'الدفع بالبطاقة المصرفية' : 'Card Payment')
                        }
                      </p>
                    </div>

                    {/* Items Summary */}
                    <div className="glass-card rounded-2xl p-4">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                        <Package size={14} className="text-nabdh-primary" />
                        {isAr ? 'المنتجات' : 'Items'} ({totalItems})
                      </h3>
                      <div className="space-y-2.5 max-h-48 overflow-y-auto">
                        {items.map((item) => {
                          const name = isAr ? item.nameAr : item.nameEn;
                          return (
                            <div key={item.productId} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted/30">
                                {item.image ? (
                                  <img src={item.image} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-muted-foreground/30" /></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{name}</p>
                                <p className="text-[11px] text-muted-foreground">{item.quantity} × {item.price.toFixed(2)} {currency}</p>
                              </div>
                              <span className="text-sm font-bold text-nabdh-price">{(item.price * item.quantity).toFixed(2)} {currency}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Coupon Section on Checkout */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setShowCheckoutCoupon(!showCheckoutCoupon)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-nabdh-primary/10 flex items-center justify-center">
                            <BadgePercent size={16} className="text-nabdh-primary" />
                          </div>
                          <div className="text-start">
                            <p className="text-sm font-bold text-foreground">
                              {isAr ? 'كود الخصم' : 'Coupon Code'}
                            </p>
                            {appliedCoupon ? (
                              <p className="text-xs text-emerald-500 font-medium">
                                {appliedCoupon.code} — {isAr ? 'خصم' : 'Discount'} {couponDiscount.toFixed(2)} {currency} {appliedCoupon.type === 'percentage' ? `(${appliedCoupon.value}%)` : ''}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {isAr ? 'هل لديك كود خصم؟' : 'Have a promo code?'}
                              </p>
                            )}
                          </div>
                        </div>
                        {appliedCoupon ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeCouponAction(); }}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        ) : (
                          showCheckoutCoupon ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />
                        )}
                      </button>
                      <AnimatePresence>
                        {showCheckoutCoupon && !appliedCoupon && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 space-y-2.5">
                              <Separator />
                              <div className="flex gap-2">
                                <Input
                                  value={checkoutCouponInput}
                                  onChange={(e) => { setCheckoutCouponInput(e.target.value.toUpperCase()); setCheckoutCouponError(''); }}
                                  placeholder={isAr ? 'أدخل كود الخصم' : 'Enter promo code'}
                                  className="flex-1"
                                  dir="ltr"
                                  onKeyDown={(e) => e.key === 'Enter' && handleCheckoutCoupon()}
                                />
                                <Button
                                  onClick={handleCheckoutCoupon}
                                  disabled={checkoutCouponApplying || !checkoutCouponInput.trim()}
                                  className="nabdh-gradient text-white hover:opacity-90 px-4"
                                >
                                  {checkoutCouponApplying ? (
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                      <RotateCcw size={14} />
                                    </motion.div>
                                  ) : (
                                    isAr ? 'تطبيق' : 'Apply'
                                  )}
                                </Button>
                              </div>
                              {checkoutCouponError && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle size={12} />
                                  {checkoutCouponError}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Error */}
                    {orderError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-sm text-red-500"
                      >
                        <AlertCircle size={16} />
                        {orderError}
                      </motion.div>
                    )}

                    {/* Trust */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: ShieldCheck, label: isAr ? 'دفع آمن' : 'Secure Payment', color: 'text-emerald-500' },
                        { icon: Truck, label: isAr ? 'توصيل مضمون' : 'Guaranteed Delivery', color: 'text-nabdh-accent' },
                        { icon: RotateCcw, label: isAr ? 'إرجاع سهل' : 'Easy Returns', color: 'text-amber-500' },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div key={i} className="glass-card rounded-xl p-2.5 flex flex-col items-center gap-1.5 text-center">
                            <Icon size={16} className={item.color} />
                            <span className="text-[9px] font-medium text-muted-foreground leading-tight">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Navigation Buttons ─── */}
            <div className="flex gap-3 mt-6">
              {currentStep !== 'address' && (
                <Button
                  variant="outline"
                  onClick={goBack}
                  className="flex-1 gap-2"
                >
                  <BackArrow size={14} />
                  {isAr ? 'السابق' : 'Back'}
                </Button>
              )}
              {currentStep !== 'review' ? (
                <Button
                  onClick={goNext}
                  disabled={
                    (currentStep === 'address' && !canProceedAddress) ||
                    (currentStep === 'payment' && !canProceedPayment)
                  }
                  className="flex-1 nabdh-gradient text-white hover:opacity-90 gap-2"
                >
                  {isAr ? 'التالي' : 'Next'}
                  {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder || orderPlacing}
                  className="flex-1 nabdh-gradient text-white hover:opacity-90 gap-2 py-3.5 text-base font-bold relative overflow-hidden"
                  style={{ boxShadow: '0 4px 20px rgba(0,75,99,0.3)' }}
                >
                  {orderPlacing ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      <span>{isAr ? 'جاري إنشاء الطلب...' : 'Placing Order...'}</span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <CheckCircle2 size={20} className="relative z-10" />
                      <span className="relative z-10">{isAr ? 'تأكيد الطلب' : 'Place Order'}</span>
                      <span className="relative z-10">({cartTotal.toFixed(2)} {currency})</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* ─── Right: Order Summary ─── */}
          <div className="lg:col-span-1">
            <motion.div
              className="glass-card rounded-2xl p-5 sticky top-20 space-y-4"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-nabdh-primary/10 flex items-center justify-center">
                  <Receipt size={18} className="text-nabdh-primary" />
                </div>
                <h3 className="font-bold text-foreground">{isAr ? 'ملخص الطلب' : 'Order Summary'}</h3>
              </div>

              {/* ─── Delivery Address Preview (dynamic) ─── */}
              <AnimatePresence mode="wait">
                {selectedAddress && selectedZone ? (
                  <motion.div
                    key="address-selected"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-nabdh-primary/5 border border-nabdh-primary/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-nabdh-primary/10 flex items-center justify-center shrink-0">
                          {selectedAddress.label.includes('منزل') || selectedAddress.label.toLowerCase().includes('home') ? (
                            <Home size={11} className="text-nabdh-primary" />
                          ) : (
                            <Building2 size={11} className="text-nabdh-primary" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-foreground">{selectedAddress.label}</span>
                        {selectedAddress.isDefault && (
                          <Badge className="bg-nabdh-primary/10 text-nabdh-primary text-[8px] border-0 px-1 py-0">{isAr ? 'افتراضي' : 'Default'}</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed pe-7">{selectedAddress.address}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <MapPin size={9} className="shrink-0" />
                        <span>{selectedAddress.city}{selectedAddress.area ? ` — ${selectedAddress.area}` : ''}</span>
                      </div>
                      {/* Delivery zone & fee inline */}
                      <div className="flex items-center gap-2 pt-1 border-t border-nabdh-primary/10">
                        <Truck size={10} className="text-emerald-600 shrink-0" />
                        <span className="text-[10px] text-emerald-600 font-medium">
                          {isAr
                            ? `${selectedZone.nameAr} — ${selectedZone.price} د.ل — ${selectedZone.durationAr}`
                            : `${selectedZone.nameEn} — ${selectedZone.price} LYD — ${selectedZone.durationEn}`
                          }
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : selectedAddress && !selectedZone ? (
                  <motion.div
                    key="address-no-zone"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                          {selectedAddress.label.includes('منزل') || selectedAddress.label.toLowerCase().includes('home') ? (
                            <Home size={11} className="text-amber-600" />
                          ) : (
                            <Building2 size={11} className="text-amber-600" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-foreground">{selectedAddress.label}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed pe-7">{selectedAddress.address}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <MapPin size={9} className="shrink-0" />
                        <span>{selectedAddress.city}{selectedAddress.area ? ` — ${selectedAddress.area}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-amber-500/10">
                        <AlertCircle size={10} className="text-amber-500 shrink-0" />
                        <span className="text-[10px] text-amber-600 font-medium">{isAr ? 'حدد منطقة التوصيل' : 'Select delivery zone'}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-address"
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-muted-foreground/50" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{isAr ? 'لم يتم تحديد عنوان' : 'No address selected'}</p>
                        <p className="text-[10px] text-muted-foreground/60">{isAr ? 'اختر عنوان التوصيل لمعرفة التفاصيل' : 'Select a delivery address to see details'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Separator />

              {/* Items Mini */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map((item) => {
                  const name = isAr ? item.nameAr : item.nameEn;
                  return (
                    <div key={item.productId} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-muted/30">
                        {item.image ? <img src={item.image} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={12} className="text-muted-foreground/30" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{name}</p>
                        <p className="text-[10px] text-muted-foreground">×{item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-foreground">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span className="font-medium text-foreground"><AnimNum value={subtotal} /> {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Truck size={12} className="text-nabdh-accent" />
                    {isAr ? 'التوصيل' : 'Delivery'}
                  </span>
                  <span className={cn(
                    'font-medium',
                    selectedZone ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {selectedZone
                      ? `${selectedZone.price.toFixed(2)} ${currency}`
                      : (isAr ? 'اختر مدينتك' : 'Choose your city')
                    }
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Tag size={12} className="text-emerald-500" />
                      {isAr ? 'خصم الكوبون' : 'Coupon'}{appliedCoupon ? ` (${appliedCoupon.code})` : ''}
                    </span>
                    <span className="font-medium text-emerald-500">-{couponDiscount.toFixed(2)} {currency}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-end">
                <span className="font-bold text-foreground">{isAr ? 'الإجمالي' : 'Total'}</span>
                <div className="text-end">
                  <motion.span
                    key={cartTotal}
                    initial={{ scale: 1.1, color: '#4ADE80' }}
                    animate={{ scale: 1, color: '#4ADE80' }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-bold text-nabdh-price tabular-nums inline-block"
                  >
                    <AnimNum value={selectedZone ? cartTotal : subtotal} />
                  </motion.span>
                  <span className="text-xs text-muted-foreground ms-1">{currency}</span>
                </div>
              </div>

              {/* Delivery Time Estimate — dynamic based on selection */}
              <AnimatePresence mode="wait">
                {selectedZone ? (
                  <motion.div
                    key="zone-selected"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs"
                  >
                    <Clock size={12} className="text-emerald-600 shrink-0" />
                    <span className="text-emerald-600 font-medium">{isAr ? `التوصيل: ${selectedZone.durationAr}` : `Delivery: ${selectedZone.durationEn}`}</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-zone"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-600"
                  >
                    <MapPin size={12} className="shrink-0" />
                    <span>{isAr ? 'حدد عنوان التوصيل ومنطقة الشحن' : 'Select delivery address and zone'}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment Method Indicator */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 text-xs text-muted-foreground">
                {paymentMethod === 'cod' ? (
                  <>
                    <Banknote size={12} className="text-emerald-500 shrink-0" />
                    <span>{isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={12} className="text-nabdh-accent shrink-0" />
                    <span>{isAr ? 'الدفع بالبطاقة المصرفية' : 'Card Payment'}</span>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
