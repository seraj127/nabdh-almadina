'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  CreditCard,
  Truck,
  ClipboardList,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Tag,
  X,
  MapPin,
  Building2,
  Wallet,
  Upload,
  Shield,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCartStore } from '@/stores/cart-store';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';

type PaymentMethodType = 'cod' | 'card' | 'bank_transfer' | 'wallet';

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShippingForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
}

interface DeliveryZone {
  id: string;
  nameAr: string;
  nameEn: string;
  city: string;
  fee: number;
  estimatedDays: number;
}

interface AppliedCoupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  /** Computed discount at time of validation — use calcCouponDiscount() for display */
  discount: number;
}

interface CardForm {
  number: string;
  expiry: string;
  cvv: string;
  holderName: string;
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language, direction: s.direction })));
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const openOrderTracking = useUIStore((s) => s.openOrderTracking);
  const { isLoggedIn, currentUser } = useUIStore(useShallow((s) => ({ isLoggedIn: s.isLoggedIn, currentUser: s.currentUser })));

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Scroll dialog to top when step changes or order is confirmed
  useEffect(() => {
    const dialogContent = document.querySelector('[role="dialog"] .custom-scrollbar') as HTMLElement | null;
    if (dialogContent) {
      dialogContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, orderSuccess]);

  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Delivery zones
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Card payment form
  const [cardForm, setCardForm] = useState<CardForm>({
    number: '',
    expiry: '',
    cvv: '',
    holderName: '',
  });

  // Bank transfer
  const [bankReference, setBankReference] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  // Wallet
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = selectedZone ? selectedZone.fee : 10;
  // IMPORTANT: coupon discount is dynamically recalculated from current subtotal
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || subtotal <= 0) return 0;
    if (appliedCoupon.minOrder > 0 && subtotal < appliedCoupon.minOrder) return 0;
    let d = 0;
    if (appliedCoupon.type === 'percentage') {
      d = (subtotal * appliedCoupon.value) / 100;
      if (appliedCoupon.maxDiscount !== null && appliedCoupon.maxDiscount > 0) d = Math.min(d, appliedCoupon.maxDiscount);
    } else {
      d = Math.min(appliedCoupon.value, subtotal);
    }
    return Math.max(0, Math.round(d * 100) / 100);
  }, [appliedCoupon, subtotal]);
  const total = Math.max(0, subtotal + deliveryFee - couponDiscount);
  const currency = t('product.currency');
  const hasSufficientBalance = walletBalance >= total;

  // Auto-remove coupon if it becomes invalid (e.g. subtotal dropped below minOrder)
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrder > 0 && subtotal < appliedCoupon.minOrder) {
      setAppliedCoupon(null);
      setCouponError('');
    }
  }, [appliedCoupon, subtotal]);

  // Clear coupon when cart becomes empty
  useEffect(() => {
    if (items.length === 0 && appliedCoupon) {
      setAppliedCoupon(null);
      setCouponError('');
    }
  }, [items.length, appliedCoupon]);

  // Fetch delivery zones
  useEffect(() => {
    if (open) {
      fetch('/api/delivery-zones')
        .then((res) => res.json())
        .then((data) => {
          if (data.zones) {
            setDeliveryZones(data.zones);
          }
        })
        .catch(() => {
          // Silently fail, fallback to default delivery
        });
    }
  }, [open]);

  // Fetch wallet balance when wallet payment is selected
  useEffect(() => {
    if (paymentMethod === 'wallet' && isLoggedIn && currentUser) {
      setIsLoadingWallet(true);
      fetch(`/api/wallet?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.balance !== undefined) {
            setWalletBalance(Number(data.balance));
          }
        })
        .catch(() => {
          setWalletBalance(0);
        })
        .finally(() => setIsLoadingWallet(false));
    }
  }, [paymentMethod, isLoggedIn, currentUser]);

  const getItemName = (item: (typeof items)[0]) =>
    language === 'ar' ? item.nameAr : item.nameEn;

  const getZoneName = (zone: DeliveryZone) =>
    language === 'ar' ? zone.nameAr : zone.nameEn;

  const validateShipping = (): boolean => {
    const newErrors: FormErrors = {};
    if (!shipping.fullName.trim()) newErrors.fullName = t('validation.required');
    if (!shipping.phone.trim()) newErrors.phone = t('validation.required');
    if (!shipping.address.trim()) newErrors.address = t('validation.required');
    if (!shipping.city.trim()) newErrors.city = t('validation.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateShipping()) return;
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal,
          userId: currentUser?.id,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedCoupon({
          id: data.coupon.id,
          code: data.coupon.code,
          type: data.coupon.type,
          value: Number(data.coupon.value),
          minOrder: Number(data.coupon.minOrder) || 0,
          maxDiscount: data.coupon.maxDiscount != null ? Number(data.coupon.maxDiscount) : null,
          discount: Number(data.coupon.discount) || 0,
        });
        setCouponCode('');
      } else {
        const errorKey = data.error;
        if (errorKey === 'expired') {
          setCouponError(t('coupon.expired'));
        } else if (errorKey === 'limit_reached') {
          setCouponError(t('coupon.limitReached'));
        } else if (errorKey === 'min_order') {
          setCouponError(`${t('coupon.minOrder')}: ${data.minOrder} ${currency}`);
        } else {
          setCouponError(t('coupon.invalid'));
        }
      }
    } catch {
      setCouponError(t('coupon.invalid'));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCitySelect = (zoneId: string) => {
    const zone = deliveryZones.find((z) => z.id === zoneId);
    if (zone) {
      setSelectedZone(zone);
      setShipping({ ...shipping, city: zone.city });
      setErrors({ ...errors, city: undefined });
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  // Format expiry MM/YY
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      const userId = isLoggedIn && currentUser ? currentUser.id : 'guest-checkout';

      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      // Step 1: Create the order first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          items: orderItems,
          paymentMethod,
          fullName: shipping.fullName,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          notes: shipping.notes || undefined,
          couponCode: appliedCoupon?.code || undefined,
          deliveryFee,
          // Note: discount is NOT sent — server recalculates from couponCode
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.order?.id;
      const orderNum = orderData.order?.orderNumber || 'NBD-CONFIRMED';

      // Step 2: Handle payment based on method
      if (paymentMethod === 'card') {
        // Initiate card payment
        const paymentResponse = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            userId,
            amount: total,
            method: 'card',
            cardDetails: {
              number: cardForm.number.replace(/\s/g, ''),
              expiry: cardForm.expiry,
              cvv: cardForm.cvv,
              holderName: cardForm.holderName,
            },
          }),
        });

        const paymentResult = await paymentResponse.json();

        if (paymentResult.status === 'failed') {
          throw new Error(paymentResult.message || 'Card payment failed');
        }

        // In development, payment is simulated as completed
        if (paymentResult.requiresRedirect && paymentResult.paymentUrl) {
          // In production, redirect to 3D Secure
          // window.location.href = paymentResult.paymentUrl;
        }

        setOrderNumber(orderNum);
        setSuccessMessage(t('payment.orderPlacedCard'));
        setOrderSuccess(true);
        clearCart();
      } else if (paymentMethod === 'bank_transfer') {
        // Upload receipt if provided
        let receiptUrl: string | null = null;
        if (receiptFile) {
          setIsUploadingReceipt(true);
          try {
            const formData = new FormData();
            formData.append('file', receiptFile);
            formData.append('userId', userId);
            const uploadResponse = await fetch('/api/payment/upload-receipt', {
              method: 'POST',
              body: formData,
            });
            const uploadData = await uploadResponse.json();
            if (uploadData.url) {
              receiptUrl = uploadData.url;
            }
          } catch {
            // Continue even if upload fails
          }
          setIsUploadingReceipt(false);
        }

        // Initiate bank transfer payment
        await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            userId,
            amount: total,
            method: 'bank_transfer',
            bankReference: bankReference || undefined,
            receiptFile: receiptUrl || undefined,
          }),
        });

        setOrderNumber(orderNum);
        setSuccessMessage(t('payment.orderPlacedBank'));
        setOrderSuccess(true);
        clearCart();
      } else if (paymentMethod === 'wallet') {
        // Initiate wallet payment
        const paymentResponse = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            userId,
            amount: total,
            method: 'wallet',
          }),
        });

        const paymentResult = await paymentResponse.json();

        if (paymentResult.status === 'failed') {
          throw new Error(paymentResult.message || 'Wallet payment failed - insufficient balance');
        }

        setOrderNumber(orderNum);
        setSuccessMessage(t('payment.orderPlacedWallet'));
        setOrderSuccess(true);
        clearCart();
      } else {
        // COD
        setOrderNumber(orderNum);
        setSuccessMessage(t('checkout.orderPlacedMessage'));
        setOrderSuccess(true);
        clearCart();
      }
    } catch (error) {
      // Order error handled via UI state
      setOrderError(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.');
      setOrderSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setOrderSuccess(false);
      setOrderError('');
      setSuccessMessage('');
      setShipping({ fullName: '', phone: '', address: '', city: '', notes: '' });
      setErrors({});
      setPaymentMethod('cod');
      setSelectedZone(null);
      setAppliedCoupon(null);
      setCouponCode('');
      setCouponError('');
      setCardForm({ number: '', expiry: '', cvv: '', holderName: '' });
      setBankReference('');
      setReceiptFile(null);
      setReceiptPreview(null);
      setWalletBalance(0);
    }, 300);
  };

  const handleTrackOrder = () => {
    handleClose();
    setTimeout(() => {
      openOrderTracking();
    }, 400);
  };

  const stepIcons = [
    <Truck key="1" className="size-4" />,
    <CreditCard key="2" className="size-4" />,
    <ClipboardList key="3" className="size-4" />,
  ];

  const stepLabels = [
    t('checkout.shippingInfo'),
    t('checkout.paymentMethod'),
    t('checkout.orderSummary'),
  ];

  const getPaymentMethodLabel = (method: PaymentMethodType) => {
    switch (method) {
      case 'cod': return t('payment.cod');
      case 'card': return t('payment.card');
      case 'bank_transfer': return t('payment.bankTransfer');
      case 'wallet': return t('payment.wallet');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">
            {t('checkout.title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('checkout.title')}
          </DialogDescription>
        </DialogHeader>

        {/* Success State */}
        {orderSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 gap-4 text-center"
          >
            <div className="size-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold">{t('checkout.orderPlaced')}</h3>
            <p className="text-muted-foreground">
              {successMessage || t('checkout.orderPlacedMessage')}
            </p>
            <div className="glass-card rounded-lg p-4 mt-2">
              <p className="text-sm text-muted-foreground">{t('order.number')}</p>
              <p className="text-lg font-bold text-nabdh-primary">{orderNumber}</p>
            </div>
            <div className="flex flex-col gap-2 w-full mt-2">
              <Button
                variant="outline"
                onClick={handleTrackOrder}
                className="w-full border-nabdh-primary text-nabdh-primary hover:bg-nabdh-primary/5"
              >
                {t('order.trackTitle')}
              </Button>
              <Button onClick={handleClose} className="nabdh-gradient text-white">
                {t('common.close')}
              </Button>
            </div>
          </motion.div>
        ) : orderError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 gap-4 text-center"
          >
            <div className="size-20 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="size-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-700">فشل إنشاء الطلب</h3>
            <p className="text-muted-foreground">{orderError}</p>
            <Button onClick={() => setOrderError('')} className="nabdh-gradient text-white mt-2">
              إعادة المحاولة
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'size-8 rounded-full flex items-center justify-center transition-all text-xs font-bold',
                      step > i + 1
                        ? 'bg-emerald-500 text-white'
                        : step === i + 1
                          ? 'nabdh-gradient text-white'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {step > i + 1 ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      stepIcons[i]
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium hidden sm:inline',
                      step === i + 1 ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                  {i < 2 && (
                    <div
                      className={cn(
                        'w-8 h-0.5',
                        step > i + 1 ? 'bg-emerald-500' : 'bg-muted'
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Shipping Info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: direction === 'rtl' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction === 'rtl' ? 20 : -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('checkout.fullName')} *</Label>
                    <Input
                      id="fullName"
                      value={shipping.fullName}
                      onChange={(e) =>
                        setShipping({ ...shipping, fullName: e.target.value })
                      }
                      placeholder={t('checkout.fullNamePlaceholder')}
                      className={cn(errors.fullName && 'border-destructive')}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('checkout.phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) =>
                        setShipping({ ...shipping, phone: e.target.value })
                      }
                      placeholder="09XX XXX XXX"
                      dir="ltr"
                      className={cn(errors.phone && 'border-destructive')}
                    />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t('checkout.address')} *</Label>
                    <Input
                      id="address"
                      value={shipping.address}
                      onChange={(e) =>
                        setShipping({ ...shipping, address: e.target.value })
                      }
                      placeholder={t('checkout.addressPlaceholder')}
                      className={cn(errors.address && 'border-destructive')}
                    />
                    {errors.address && (
                      <p className="text-xs text-destructive">{errors.address}</p>
                    )}
                  </div>

                  {/* City Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('delivery.selectCity')} *</Label>
                    {deliveryZones.length > 0 ? (
                      <div className="space-y-2">
                        <Select
                          value={selectedZone?.id || ''}
                          onValueChange={handleCitySelect}
                        >
                          <SelectTrigger
                            className={cn(
                              'w-full',
                              errors.city && 'border-destructive'
                            )}
                          >
                            <MapPin className="size-4 text-muted-foreground me-2" />
                            <SelectValue
                              placeholder={t('checkout.selectDeliveryCity')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {deliveryZones.map((zone) => (
                              <SelectItem key={zone.id} value={zone.id}>
                                <span className="flex items-center gap-2">
                                  {getZoneName(zone)}
                                  <span className="text-xs text-muted-foreground">
                                    ({zone.estimatedDays} {t('delivery.estimatedDays')})
                                  </span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Delivery info for selected zone */}
                        {selectedZone && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-nabdh-surface/50 rounded-md p-2">
                            <span>
                              {t('delivery.fee')}: {selectedZone.fee === 0 || subtotal >= 100 ? t('cart.deliveryFree') : `${selectedZone.fee} ${currency}`}
                            </span>
                            <span>•</span>
                            <span>
                              {selectedZone.estimatedDays} {t('delivery.estimatedDays')}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        id="city"
                        value={shipping.city}
                        onChange={(e) =>
                          setShipping({ ...shipping, city: e.target.value })
                        }
                        placeholder={t('checkout.cityPlaceholder')}
                        className={cn(errors.city && 'border-destructive')}
                      />
                    )}
                    {errors.city && (
                      <p className="text-xs text-destructive">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('checkout.notes')}</Label>
                    <Textarea
                      id="notes"
                      value={shipping.notes}
                      onChange={(e) =>
                        setShipping({ ...shipping, notes: e.target.value })
                      }
                      placeholder={t('checkout.notesPlaceholder')}
                      rows={2}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: direction === 'rtl' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction === 'rtl' ? 20 : -20 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('checkout.paymentMethod')}
                  </p>

                  {/* COD Option */}
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={cn(
                      'w-full glass-card rounded-lg p-4 flex items-center gap-4 transition-all text-start',
                      paymentMethod === 'cod' && 'ring-2 ring-nabdh-primary bg-nabdh-primary/5'
                    )}
                  >
                    <div
                      className={cn(
                        'size-12 rounded-full flex items-center justify-center',
                        paymentMethod === 'cod'
                          ? 'nabdh-gradient text-white'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Truck className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{t('payment.cod')}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('payment.codDesc')}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'size-5 rounded-full border-2 flex items-center justify-center',
                        paymentMethod === 'cod'
                          ? 'border-nabdh-primary'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {paymentMethod === 'cod' && (
                        <div className="size-2.5 rounded-full nabdh-gradient" />
                      )}
                    </div>
                  </button>

                  {/* Card Payment - Coming Soon */}
                  <div
                    className={cn(
                      'w-full glass-card rounded-lg p-4 flex items-center gap-4 transition-all text-start opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div
                      className="size-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground"
                    >
                      <CreditCard className="size-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{t('checkout.payByCard')}</p>
                        <Badge className="bg-amber-500/10 text-amber-600 border-0 text-[10px]">{t('checkout.comingSoon')}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Option - Only for logged in users */}
                  {isLoggedIn && (
                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={cn(
                        'w-full glass-card rounded-lg p-4 flex items-center gap-4 transition-all text-start',
                        paymentMethod === 'wallet' && 'ring-2 ring-nabdh-primary bg-nabdh-primary/5'
                      )}
                    >
                      <div
                        className={cn(
                          'size-12 rounded-full flex items-center justify-center',
                          paymentMethod === 'wallet'
                            ? 'nabdh-gradient text-white'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Wallet className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{t('payment.wallet')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('payment.walletDesc')}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'size-5 rounded-full border-2 flex items-center justify-center',
                          paymentMethod === 'wallet'
                            ? 'border-nabdh-primary'
                            : 'border-muted-foreground/30'
                        )}
                      >
                        {paymentMethod === 'wallet' && (
                          <div className="size-2.5 rounded-full nabdh-gradient" />
                        )}
                      </div>
                    </button>
                  )}

                  {/* Card Payment Form */}
                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 mt-3 p-4 rounded-lg border border-nabdh-primary/20 bg-nabdh-primary/5"
                    >
                      <p className="text-sm font-semibold mb-2">{t('payment.enterCardDetails')}</p>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">{t('payment.cardNumber')}</Label>
                        <Input
                          id="cardNumber"
                          value={cardForm.number}
                          onChange={(e) =>
                            setCardForm({
                              ...cardForm,
                              number: formatCardNumber(e.target.value),
                            })
                          }
                          placeholder={t('payment.cardNumberPlaceholder')}
                          dir="ltr"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">{t('payment.expiry')}</Label>
                          <Input
                            id="expiry"
                            value={cardForm.expiry}
                            onChange={(e) =>
                              setCardForm({
                                ...cardForm,
                                expiry: formatExpiry(e.target.value),
                              })
                            }
                            placeholder={t('payment.expiryPlaceholder')}
                            dir="ltr"
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">{t('payment.cvv')}</Label>
                          <Input
                            id="cvv"
                            type="password"
                            value={cardForm.cvv}
                            onChange={(e) =>
                              setCardForm({
                                ...cardForm,
                                cvv: e.target.value.replace(/\D/g, '').substring(0, 4),
                              })
                            }
                            placeholder={t('payment.cvvPlaceholder')}
                            dir="ltr"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="holderName">{t('payment.cardHolder')}</Label>
                        <Input
                          id="holderName"
                          value={cardForm.holderName}
                          onChange={(e) =>
                            setCardForm({ ...cardForm, holderName: e.target.value })
                          }
                          placeholder={t('payment.cardHolderPlaceholder')}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Shield className="size-3.5 text-emerald-500" />
                        <span>{t('payment.secureNote')}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Bank Transfer Details */}
                  {paymentMethod === 'bank_transfer' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 mt-3 p-4 rounded-lg border border-nabdh-primary/20 bg-nabdh-primary/5"
                    >
                      <p className="text-sm font-semibold mb-2">{t('payment.bankDetails')}</p>
                      <div className="bg-white dark:bg-gray-900 rounded-md p-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('payment.bankName')}:</span>
                          <span className="font-medium">{language === 'ar' ? 'مصرف الجمهورية' : 'Republic Bank'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('payment.accountName')}:</span>
                          <span className="font-medium text-xs">{language === 'ar' ? 'نبض المدينة للتجارة الإلكترونية' : 'Nabd Al-Madina E-Commerce'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('payment.accountNumber')}:</span>
                          <span className="font-medium font-mono" dir="ltr">0123456789</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('payment.iban')}:</span>
                          <span className="font-medium font-mono text-xs" dir="ltr">LY83 0123 0000 0000 0123 4567 89</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('payment.branch')}:</span>
                          <span className="font-medium">{language === 'ar' ? 'فرع طرابلس المركزي' : 'Tripoli Central Branch'}</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="bankRef">{t('payment.referenceNumber')}</Label>
                        <Input
                          id="bankRef"
                          value={bankReference}
                          onChange={(e) => setBankReference(e.target.value)}
                          placeholder={t('payment.bankRefPlaceholder')}
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('payment.uploadReceipt')}</Label>
                        <input
                          ref={receiptInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleReceiptUpload}
                        />
                        {receiptPreview ? (
                          <div className="relative rounded-md overflow-hidden border">
                            <img
                              src={receiptPreview}
                              alt="Receipt"
                              className="w-full max-h-32 object-contain bg-white"
                            />
                            <button
                              onClick={() => {
                                setReceiptFile(null);
                                setReceiptPreview(null);
                              }}
                              className="absolute top-1 end-1 size-6 rounded-full bg-destructive text-white flex items-center justify-center"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => receiptInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-muted-foreground/30 rounded-md p-4 flex flex-col items-center gap-2 text-muted-foreground hover:border-nabdh-primary hover:text-nabdh-primary transition-colors"
                          >
                            <Upload className="size-6" />
                            <span className="text-xs">
                              {language === 'ar'
                                ? 'اضغط لرفع صورة الإيصال'
                                : 'Click to upload receipt image'}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="size-3.5" />
                        <span>
                          {language === 'ar'
                            ? 'سيتم مراجعة التحويل خلال 24 ساعة عمل'
                            : 'Transfer will be verified within 24 business hours'}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Wallet Payment Details */}
                  {paymentMethod === 'wallet' && isLoggedIn && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 mt-3 p-4 rounded-lg border border-nabdh-primary/20 bg-nabdh-primary/5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{t('payment.walletBalance')}</span>
                        {isLoadingWallet ? (
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        ) : (
                          <span className={cn(
                            'text-lg font-bold',
                            hasSufficientBalance ? 'text-emerald-600' : 'text-destructive'
                          )}>
                            {walletBalance.toFixed(2)} {currency}
                          </span>
                        )}
                      </div>

                      {!hasSufficientBalance && !isLoadingWallet && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                          <AlertCircle className="size-4 shrink-0" />
                          <div>
                            <p className="font-medium">{t('payment.insufficientBalance')}</p>
                            <p className="text-xs mt-0.5">
                              {language === 'ar'
                                ? `تحتاج ${(total - walletBalance).toFixed(2)} د.ل إضافية`
                                : `You need ${(total - walletBalance).toFixed(2)} LYD more`}
                            </p>
                          </div>
                        </div>
                      )}

                      {hasSufficientBalance && !isLoadingWallet && (
                        <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-sm">
                          <CheckCircle2 className="size-4 shrink-0" />
                          <span>
                            {language === 'ar'
                              ? 'الرصيد كافٍ لإتمام الدفع'
                              : 'Balance is sufficient for this payment'}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Order Summary */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: direction === 'rtl' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction === 'rtl' ? 20 : -20 }}
                  className="space-y-4"
                >
                  {/* Shipping Info Summary */}
                  <div className="glass-card rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">
                        {t('checkout.shippingInfo')}
                      </h4>
                      <button
                        onClick={() => setStep(1)}
                        className="text-xs text-nabdh-accent hover:underline"
                      >
                        {t('common.edit')}
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{shipping.fullName}</p>
                      <p dir="ltr" className="text-start">{shipping.phone}</p>
                      <p>{shipping.address}, {shipping.city}</p>
                      {shipping.notes && <p className="italic">{shipping.notes}</p>}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="glass-card rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">
                        {t('checkout.paymentMethod')}
                      </h4>
                      <button
                        onClick={() => setStep(2)}
                        className="text-xs text-nabdh-accent hover:underline"
                      >
                        {t('common.edit')}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getPaymentMethodLabel(paymentMethod)}
                    </p>
                    {paymentMethod === 'wallet' && !hasSufficientBalance && (
                      <p className="text-xs text-destructive">{t('payment.insufficientBalance')}</p>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="glass-card rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-sm">{t('checkout.orderSummary')}</h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="flex-1 line-clamp-1">
                            {getItemName(item)} x{item.quantity}
                          </span>
                          <span className="font-medium ms-2">
                            {(item.price * item.quantity).toFixed(2)} {currency}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Coupon Section */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Tag className="size-4 text-nabdh-secondary" />
                        {t('coupon.title')}
                      </div>

                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md p-2.5">
                          <div className="flex items-center gap-2">
                            <Tag className="size-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                              {appliedCoupon.code}
                            </span>
                            <Badge variant="outline" className="text-[10px] border-emerald-400 text-emerald-600">
                              {appliedCoupon.type === 'percentage'
                                ? `-${couponDiscount.toFixed(2)} ${currency} (${appliedCoupon.value}%)`
                                : `-${couponDiscount.toFixed(2)} ${currency}`}
                            </Badge>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value);
                              setCouponError('');
                            }}
                            placeholder={t('coupon.placeholder')}
                            className="flex-1 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            className="border-nabdh-primary text-nabdh-primary hover:bg-nabdh-primary/5"
                          >
                            {isApplyingCoupon ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              t('coupon.apply')
                            )}
                          </Button>
                        </div>
                      )}

                      {couponError && (
                        <p className="text-xs text-destructive">{couponError}</p>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                        <span>{subtotal.toFixed(2)} {currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('cart.delivery')}</span>
                        <span
                          className={cn(
                            deliveryFee === 0 && 'text-emerald-600'
                          )}
                        >
                          {deliveryFee === 0
                            ? t('cart.deliveryFree')
                            : `${deliveryFee.toFixed(2)} ${currency}`}
                        </span>
                      </div>
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>{t('coupon.discount')}</span>
                          <span>-{couponDiscount.toFixed(2)} {currency}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between font-bold">
                      <span>{t('cart.total')}</span>
                      <span className="text-nabdh-price text-lg">
                        {total.toFixed(2)} {currency}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 gap-3">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack}>
                  {direction === 'rtl' ? (
                    <ArrowRight className="size-4" />
                  ) : (
                    <ArrowLeft className="size-4" />
                  )}
                  {t('common.back')}
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button onClick={handleNext} className="nabdh-gradient text-white">
                  {t('common.next')}
                  {direction === 'rtl' ? (
                    <ArrowLeft className="size-4" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || (paymentMethod === 'wallet' && !hasSufficientBalance)}
                  className="nabdh-gradient text-white min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {paymentMethod === 'card'
                        ? t('payment.processing')
                        : t('common.loading')}
                    </>
                  ) : (
                    t('checkout.placeOrder')
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
