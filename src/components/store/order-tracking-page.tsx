'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Search, Package, Truck, CheckCircle2,
  Clock, ShieldCheck, XCircle, AlertCircle, Loader2, ClipboardList,
  ShoppingBag, MapPin, CreditCard, Copy, Check, ExternalLink,
  ChevronDown, PackageSearch, Navigation, CalendarDays, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { fmt } from '@/components/store/lib/shared';

/* ─── Types ──────────────────────────────────────────────────── */
interface OrderItem {
  id: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  price: number;
  quantity: number;
  total: number;
  image: string | null;
}

interface StatusLog {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
}

interface Carrier {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  trackingUrl: string | null;
}

interface ShipmentLog {
  id: string;
  status: string;
  location: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  occurredAt: string;
}

interface Shipment {
  id: string;
  trackingNumber: string | null;
  waybillNumber: string | null;
  status: string;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  carrier: Carrier;
  logs: ShipmentLog[];
}

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  area: string | null;
  notes: string | null;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  deliveredAt: string | null;
  items: OrderItem[];
  statusLog: StatusLog[];
  shipment?: Shipment | null;
  address?: Address | null;
}

/* ─── Status Configuration ───────────────────────────────────── */
const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

type StatusConfig = { label: string; color: string; bg: string; icon: typeof Package };

function getStatusConfig(status: string, t: (k: string) => string): StatusConfig {
  const map: Record<string, StatusConfig> = {
    pending: { label: t('order.pending'), color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: Clock },
    confirmed: { label: t('order.confirmed'), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: ShieldCheck },
    processing: { label: t('order.processing'), color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: ClipboardList },
    shipped: { label: t('order.shipped'), color: 'text-nabdh-primary', bg: 'bg-nabdh-primary/10', icon: Truck },
    delivered: { label: t('order.delivered'), color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: CheckCircle2 },
    cancelled: { label: t('order.cancelled'), color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', icon: XCircle },
    refunded: { label: t('order.refunded'), color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', icon: AlertCircle },
  };
  return map[status] || map.pending;
}

function getStepIndex(status: string): number {
  if (status === 'cancelled' || status === 'refunded') return -1;
  return statusSteps.indexOf(status);
}

/* ─── Helpers ────────────────────────────────────────────────── */
function formatDate(dateStr: string, isAr: boolean) {
  return new Date(dateStr).toLocaleDateString(isAr ? 'ar-LY' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatDateTime(dateStr: string, isAr: boolean) {
  return new Date(dateStr).toLocaleDateString(isAr ? 'ar-LY' : 'en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getPaymentMethodLabel(method: string, t: (k: string) => string) {
  switch (method) {
    case 'cod': return t('order.cod');
    case 'card': return t('order.card');
    case 'bank_transfer': return t('order.bankTransfer');
    default: return method;
  }
}

function getPaymentStatusLabel(status: string, t: (k: string) => string) {
  switch (status) {
    case 'paid': return t('order.paid');
    case 'failed': return t('order.failedPayment');
    default: return t('order.pendingPayment');
  }
}

/* ─── Animation Variants ─────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

/* ─── Sub-Components ─────────────────────────────────────────── */

// Status Progress Bar (mini version for order cards)
function MiniStatusProgress({ status, t }: { status: string; t: (k: string) => string }) {
  const currentIndex = getStepIndex(status);
  const isCancelled = status === 'cancelled' || status === 'refunded';
  const progressPercent = isCancelled ? 0 : Math.max(0, ((currentIndex) / (statusSteps.length - 1)) * 100);

  return (
    <div className="w-full">
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full',
            isCancelled ? 'bg-red-400' : 'nabdh-gradient'
          )}
        />
      </div>
      <div className="flex justify-between mt-1">
        {statusSteps.map((step, i) => {
          const StepIcon = getStatusConfig(step, t).icon;
          const isCompleted = !isCancelled && i <= currentIndex;
          const isCurrent = !isCancelled && i === currentIndex;
          return (
            <div key={step} className="flex flex-col items-center" style={{ width: '20%' }}>
              <StepIcon className={cn(
                'size-2.5',
                isCompleted ? (isCurrent ? 'text-nabdh-primary' : 'text-emerald-500') : 'text-muted-foreground/30'
              )} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Full Status Timeline (for order detail view)
function StatusTimeline({ order, t, language }: { order: TrackedOrder; t: (k: string) => string; language: string }) {
  const isAr = language === 'ar';
  const currentIndex = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  // Find the date for each status step from statusLog
  const statusLogMap = new Map<string, string>();
  if (order.statusLog) {
    order.statusLog.forEach((log) => {
      if (!statusLogMap.has(log.status)) {
        statusLogMap.set(log.status, log.createdAt);
      }
    });
  }

  if (isCancelled) {
    const cancelledConfig = getStatusConfig(order.status, t);
    const CancelledIcon = cancelledConfig.icon;
    const cancelledDate = statusLogMap.get(order.status);
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col items-center py-4">
          <div className="size-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-3">
            <CancelledIcon className="size-8 text-red-500" />
          </div>
          <p className="font-bold text-red-500 text-lg">{cancelledConfig.label}</p>
          {cancelledDate && (
            <p className="text-sm text-muted-foreground mt-1">{formatDateTime(cancelledDate, isAr)}</p>
          )}
          {order.status === 'cancelled' && order.statusLog?.find(l => l.status === 'cancelled')?.note && (
            <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
              {order.statusLog.find(l => l.status === 'cancelled')!.note}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="relative">
        {statusSteps.map((step, i) => {
          const config = getStatusConfig(step, t);
          const StepIcon = config.icon;
          const isCompleted = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const stepDate = statusLogMap.get(step);

          return (
            <div key={step} className="flex items-start gap-3 mb-0">
              {/* Line + Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  className={cn(
                    'size-9 rounded-full flex items-center justify-center shrink-0 transition-all',
                    isCompleted
                      ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/20'
                      : 'bg-muted/60 text-muted-foreground',
                    isCurrent && 'ring-2 ring-nabdh-primary/30 ring-offset-2 ring-offset-background'
                  )}
                >
                  <StepIcon className="size-4" />
                </motion.div>
                {i < statusSteps.length - 1 && (
                  <div className="relative w-0.5 h-10 my-1">
                    <div className="absolute inset-0 bg-muted/50 rounded-full" />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: i < currentIndex ? '100%' : '0%' }}
                      transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                      className="absolute bottom-0 inset-x-0 nabdh-gradient rounded-full"
                    />
                  </div>
                )}
              </div>
              {/* Label + Date */}
              <div className={cn('pt-1.5 pb-6', i === statusSteps.length - 1 && 'pb-0')}>
                <p className={cn(
                  'text-sm font-medium',
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {config.label}
                </p>
                {stepDate && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDateTime(stepDate, isAr)}
                  </p>
                )}
                {isCurrent && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1 mt-1"
                  >
                    <div className="size-1.5 rounded-full bg-nabdh-primary" />
                    <span className="text-[10px] text-nabdh-primary font-medium">
                      {isAr ? 'الحالة الحالية' : 'Current'}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Order Card
function OrderCard({ order, t, language, direction, onViewDetails }: {
  order: TrackedOrder; t: (k: string) => string; language: string; direction: string;
  onViewDetails: (order: TrackedOrder) => void;
}) {
  const isAr = language === 'ar';
  const statusConfig = getStatusConfig(order.status, t);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      variants={itemVariants}
      layout
      className="glass-card rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-nabdh-primary/5 transition-all"
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('size-11 rounded-xl flex items-center justify-center shrink-0', statusConfig.bg)}>
            <StatusIcon className={cn('size-5', statusConfig.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-nabdh-primary">#{order.orderNumber}</span>
              <Badge className={cn('text-[10px] px-1.5 py-0 border-0 font-medium', statusConfig.bg, statusConfig.color)}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(order.createdAt, isAr)} · {order.items.length} {t('order.itemCount')}
            </p>
          </div>
          <div className="text-end shrink-0">
            <p className="font-bold text-sm">{fmt(order.total)} {isAr ? 'د.ل' : 'LYD'}</p>
            <p className="text-[10px] text-muted-foreground">
              {getPaymentMethodLabel(order.paymentMethod, t)}
            </p>
          </div>
        </div>

        {/* Mini Progress */}
        <MiniStatusProgress status={order.status} t={t} />

        {/* View Details Button */}
        <Button
          onClick={() => onViewDetails(order)}
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-nabdh-primary hover:bg-nabdh-primary/5 hover:text-nabdh-primary gap-1.5"
        >
          {t('order.viewDetails')}
          {direction === 'rtl' ? <ArrowLeft className="size-3.5" /> : <ArrowRight className="size-3.5" />}
        </Button>
      </div>
    </motion.div>
  );
}

// Copy Button for tracking number
function CopyButton({ text, t }: { text: string; t: (k: string) => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-nabdh-primary hover:bg-nabdh-primary/5 transition-colors"
      aria-label="Copy"
    >
      {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
    </button>
  );
}

// Order Detail View
function OrderDetailView({ order, t, language, direction, onBack, onOrderCancelled }: {
  order: TrackedOrder; t: (k: string) => string; language: string; direction: string;
  onBack: () => void;
  onOrderCancelled: (updatedOrder: TrackedOrder) => void;
}) {
  const isAr = language === 'ar';
  const isRTL = direction === 'rtl';
  const statusConfig = getStatusConfig(order.status, t);
  const StatusIcon = statusConfig.icon;
  const currency = isAr ? 'د.ل' : 'LYD';
  const canCancel = order.status === 'pending' || order.status === 'confirmed';
  const [cancelling, setCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!window.confirm(t('order.cancelConfirm'))) return;
    setCancelling(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const updatedOrder: TrackedOrder = {
          ...order,
          status: 'cancelled',
          statusLog: [
            {
              id: `cancel-${Date.now()}`,
              status: 'cancelled',
              note: isAr ? 'تم إلغاء الطلب بواسطة العميل' : 'Order cancelled by customer',
              createdAt: new Date().toISOString(),
            },
            ...(order.statusLog || []),
          ],
        };
        onOrderCancelled(updatedOrder);
      } else {
        alert(data.error || t('order.cancelError'));
      }
    } catch {
      alert(t('order.cancelError'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-5"
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-nabdh-primary transition-colors"
      >
        {isRTL ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
        {t('order.backToOrders')}
      </button>

      {/* Order Header Card */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className={cn('size-14 rounded-xl flex items-center justify-center shrink-0', statusConfig.bg)}>
            <StatusIcon className={cn('size-7', statusConfig.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">#{order.orderNumber}</h2>
              <Badge className={cn('text-xs px-2 py-0.5 border-0 font-semibold', statusConfig.bg, statusConfig.color)}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {formatDate(order.createdAt, isAr)} · {order.items.length} {t('order.itemCount')}
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <StatusTimeline order={order} t={t} language={language} />

      {/* Shipping Info */}
      {order.shipment && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="size-4 text-nabdh-primary" />
            <h3 className="font-semibold text-sm">{t('order.shippingInfo')}</h3>
          </div>

          <div className="space-y-3">
            {/* Carrier */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{t('order.shippingCompany')}</span>
              <span className="text-sm font-medium">
                {isAr ? order.shipment.carrier.nameAr : order.shipment.carrier.nameEn}
              </span>
            </div>

            {/* Tracking Number */}
            {order.shipment.trackingNumber && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('order.trackingNumber')}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium font-mono">{order.shipment.trackingNumber}</span>
                  <CopyButton text={order.shipment.trackingNumber} t={t} />
                  {order.shipment.carrier.trackingUrl && (
                    <a
                      href={`${order.shipment.carrier.trackingUrl}${order.shipment.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-nabdh-primary hover:bg-nabdh-primary/5 transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Estimated Delivery */}
            {order.shipment.estimatedDelivery && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t('order.estimatedDelivery')}</span>
                <span className="text-sm font-medium flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-nabdh-primary" />
                  {formatDate(order.shipment.estimatedDelivery, isAr)}
                </span>
              </div>
            )}

            {/* Shipment Logs */}
            {order.shipment.logs && order.shipment.logs.length > 0 && (
              <>
                <Separator className="my-2" />
                <div className="space-y-2.5 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-nabdh-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {order.shipment.logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2.5">
                      <div className="size-2 rounded-full bg-nabdh-primary mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">
                          {isAr ? log.descriptionAr : log.descriptionEn}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {log.location && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="size-2.5" /> {log.location}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {formatDateTime(log.occurredAt, isAr)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="size-4 text-nabdh-primary" />
          <h3 className="font-semibold text-sm">{t('order.items')}</h3>
        </div>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={isAr ? item.nameAr : item.nameEn} className="size-full object-cover" />
                ) : (
                  <ShoppingBag className="size-5 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{isAr ? item.nameAr : item.nameEn}</p>
                <p className="text-xs text-muted-foreground">{item.quantity} x {fmt(item.price)} {currency}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold">{fmt(item.total)} {currency}</span>
                {/* Rate this product — only for delivered orders */}
                {order.status === 'delivered' && (
                  <button
                    onClick={() => useUIStore.getState().openProductDetail(item.productId)}
                    className="size-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors group"
                    title={isAr ? 'قيّم هذا المنتج' : 'Rate this product'}
                  >
                    <Star className="size-3.5 text-amber-500 group-hover:fill-amber-500 transition-all" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="size-4 text-nabdh-primary" />
          <h3 className="font-semibold text-sm">{t('order.orderSummary')}</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('order.subtotal')}</span>
            <span>{fmt(order.subtotal)} {currency}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('order.deliveryFee')}</span>
            <span>
              {order.deliveryFee === 0
                ? t('order.freeDelivery')
                : `${fmt(order.deliveryFee)} ${currency}`}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>{t('order.discount')}</span>
              <span>-{fmt(order.discount)} {currency}</span>
            </div>
          )}
          <Separator className="my-1" />
          <div className="flex justify-between text-base font-bold">
            <span>{t('order.totalAmount')}</span>
            <span className="gradient-text">{fmt(order.total)} {currency}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      {order.address && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="size-4 text-nabdh-primary" />
            <h3 className="font-semibold text-sm">{t('order.deliveryAddress')}</h3>
          </div>
          <div className="text-sm">
            <p className="font-medium">{order.address.address}</p>
            <p className="text-muted-foreground mt-0.5">
              {order.address.city}{order.address.area ? ` - ${order.address.area}` : ''}
            </p>
            {order.address.notes && (
              <p className="text-xs text-muted-foreground mt-1 italic">{order.address.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Payment Info */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="size-4 text-nabdh-primary" />
          <h3 className="font-semibold text-sm">{t('order.paymentMethod')}</h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{getPaymentMethodLabel(order.paymentMethod, t)}</span>
          <Badge className={cn(
            'text-[10px] px-2 py-0.5 border-0 font-medium',
            order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
              : order.paymentStatus === 'failed' ? 'bg-red-50 text-red-500 dark:bg-red-950/30'
              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
          )}>
            {getPaymentStatusLabel(order.paymentStatus, t)}
          </Badge>
        </div>
      </div>

      {/* Cancel Order Button */}
      {canCancel && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-destructive">{t('order.cancelOrder')}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t('order.cannotCancel')}</p>
            </div>
            <Button
              onClick={handleCancelOrder}
              disabled={cancelling}
              variant="destructive"
              className="gap-2 shrink-0"
            >
              {cancelling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
              {t('order.cancelOrder')}
            </Button>
          </div>
        </div>
      )}

      {/* Status Log */}
      {order.statusLog && order.statusLog.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-3">{t('order.statusHistory')}</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-nabdh-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            {order.statusLog.map((log) => {
              const logConfig = getStatusConfig(log.status, t);
              const LogIcon = logConfig.icon;
              return (
                <div key={log.id} className="flex items-center gap-3">
                  <div className={cn('size-7 rounded-lg flex items-center justify-center shrink-0', logConfig.bg)}>
                    <LogIcon className={cn('size-3.5', logConfig.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{logConfig.label}</span>
                      {log.note && (
                        <span className="text-[10px] text-muted-foreground">({log.note})</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{formatDateTime(log.createdAt, isAr)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Loading Skeleton ───────────────────────────────────────── */
function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="size-11 rounded-xl bg-muted/50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted/50 rounded w-1/3" />
              <div className="h-3 bg-muted/30 rounded w-1/2" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/50 rounded w-16" />
              <div className="h-3 bg-muted/30 rounded w-12" />
            </div>
          </div>
          <div className="h-1.5 bg-muted/30 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────── */
function EmptyState({ t, hasFilter }: { t: (k: string) => string; hasFilter: boolean }) {
  return (
    <motion.div variants={itemVariants} className="glass-card rounded-2xl p-10 text-center">
      <div className="size-16 rounded-full bg-nabdh-primary/5 flex items-center justify-center mx-auto mb-4">
        <PackageSearch className="size-8 text-nabdh-primary/40" />
      </div>
      <h3 className="font-semibold text-lg mb-1">
        {hasFilter ? t('order.noOrdersFilter') : t('order.noOrders')}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {hasFilter ? t('order.noOrdersFilter') : t('order.noOrdersDesc')}
      </p>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export function OrderTrackingPage() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({
    t: s.t, language: s.language, direction: s.direction,
  })));
  const { isLoggedIn, currentUser } = useUIStore(useShallow((s) => ({
    isLoggedIn: s.isLoggedIn, currentUser: s.currentUser,
  })));
  const navigateTo = useUIStore((s) => s.navigateTo);
  const clearAuthView = useUIStore((s) => s.clearAuthView);

  const isAr = language === 'ar';
  const isRTL = direction === 'rtl';
  const currency = isAr ? 'د.ل' : 'LYD';

  // State
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Quick track
  const [quickTrackInput, setQuickTrackInput] = useState('');
  const [quickTrackLoading, setQuickTrackLoading] = useState(false);
  const [quickTrackResult, setQuickTrackResult] = useState<TrackedOrder | null>(null);
  const [quickTrackError, setQuickTrackError] = useState('');

  // Fetch user orders
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) {
      setOrders([]);
      return;
    }
    setLoading(true);
    fetch(`/api/orders?userId=${currentUser.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.orders) {
          setOrders(data.orders);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, currentUser?.id]);

  // Quick track by order number
  const handleQuickTrack = useCallback(async () => {
    if (!quickTrackInput.trim()) return;
    setQuickTrackLoading(true);
    setQuickTrackError('');
    setQuickTrackResult(null);

    try {
      const response = await fetch(`/api/orders?orderNumber=${encodeURIComponent(quickTrackInput.trim())}`);
      const data = await response.json();

      if (!response.ok || !data.order) {
        setQuickTrackError(t('order.notFound'));
        return;
      }

      setQuickTrackResult(data.order);
      setSelectedOrder(data.order);
    } catch {
      setQuickTrackError(t('order.notFound'));
    } finally {
      setQuickTrackLoading(false);
    }
  }, [quickTrackInput, t]);

  // Filter orders
  const filteredOrders = statusFilter === 'all'
    ? orders
    : statusFilter === 'active'
      ? orders.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status))
      : statusFilter === 'completed'
        ? orders.filter((o) => o.status === 'delivered')
        : orders.filter((o) => ['cancelled', 'refunded'].includes(o.status));

  const handleViewDetails = (order: TrackedOrder) => {
    // If the order doesn't have full details (from list view), fetch the full order
    if (!order.shipment && !order.address) {
      fetch(`/api/orders?orderNumber=${encodeURIComponent(order.orderNumber)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.order) {
            setSelectedOrder(data.order);
          } else {
            setSelectedOrder(order);
          }
        })
        .catch(() => setSelectedOrder(order));
    } else {
      setSelectedOrder(order);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
    setQuickTrackResult(null);
    setQuickTrackInput('');
    setQuickTrackError('');
  };

  const handleOrderCancelled = (updatedOrder: TrackedOrder) => {
    setSelectedOrder(updatedOrder);
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // Status filter pills
  const filterPills = [
    { key: 'all' as const, label: t('order.all') },
    { key: 'active' as const, label: t('order.active') },
    { key: 'completed' as const, label: t('order.completed') },
    { key: 'cancelled' as const, label: t('order.cancelledTab') },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]" dir={direction}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => {
              if (selectedOrder) {
                handleBackToOrders();
              } else {
                clearAuthView();
              }
            }}
            className="size-10 rounded-xl glass-card flex items-center justify-center text-muted-foreground hover:text-nabdh-primary hover:bg-nabdh-primary/5 transition-all shrink-0"
          >
            <BackArrow className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">{t('order.trackTitle')}</h1>
            {isLoggedIn && orders.length > 0 && !selectedOrder && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr ? `${orders.length} طلب` : `${orders.length} orders`}
              </p>
            )}
          </div>
        </motion.div>

        {/* Quick Track Input */}
        {!selectedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 sm:p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <PackageSearch className="size-4 text-nabdh-primary" />
              <h3 className="font-semibold text-sm">{t('order.quickTrack')}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{t('order.quickTrackDesc')}</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={quickTrackInput}
                  onChange={(e) => setQuickTrackInput(e.target.value)}
                  placeholder={t('order.searchByNumber')}
                  className="ps-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickTrack()}
                />
              </div>
              <Button
                onClick={handleQuickTrack}
                disabled={quickTrackLoading || !quickTrackInput.trim()}
                className="nabdh-gradient text-white shrink-0"
              >
                {quickTrackLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  t('order.trackButton')
                )}
              </Button>
            </div>
            {quickTrackError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-destructive mt-2"
              >
                {quickTrackError}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {selectedOrder ? (
            <OrderDetailView
              key={selectedOrder.id}
              order={selectedOrder}
              t={t}
              language={language}
              direction={direction}
              onBack={handleBackToOrders}
              onOrderCancelled={handleOrderCancelled}
            />
          ) : (
            <motion.div
              key="orders-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLoggedIn ? (
                <>
                  {/* Filter Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
                    {filterPills.map((pill) => (
                      <button
                        key={pill.key}
                        onClick={() => setStatusFilter(pill.key)}
                        className={cn(
                          'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                          statusFilter === pill.key
                            ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/20'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {pill.label}
                        {pill.key !== 'all' && (
                          <span className={cn(
                            'ms-1.5 text-[10px]',
                            statusFilter === pill.key ? 'text-white/70' : 'text-muted-foreground/50'
                          )}>
                            {pill.key === 'active'
                              ? orders.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status)).length
                              : pill.key === 'completed'
                                ? orders.filter((o) => o.status === 'delivered').length
                                : orders.filter((o) => ['cancelled', 'refunded'].includes(o.status)).length
                            }
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Orders List */}
                  {loading ? (
                    <OrdersLoadingSkeleton />
                  ) : filteredOrders.length === 0 ? (
                    <EmptyState t={t} hasFilter={statusFilter !== 'all'} />
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3"
                    >
                      {filteredOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          t={t}
                          language={language}
                          direction={direction}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </motion.div>
                  )}
                </>
              ) : (
                /* Not logged in - show message */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-8 text-center"
                >
                  <div className="size-20 rounded-full bg-nabdh-primary/5 flex items-center justify-center mx-auto mb-4">
                    <PackageSearch className="size-10 text-nabdh-primary/40" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{t('order.quickTrack')}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{t('order.enterOrderNumber')}</p>
                  <div className="flex gap-2 max-w-sm mx-auto">
                    <div className="flex-1 relative">
                      <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        value={quickTrackInput}
                        onChange={(e) => setQuickTrackInput(e.target.value)}
                        placeholder={t('order.searchByNumber')}
                        className="ps-9"
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickTrack()}
                      />
                    </div>
                    <Button
                      onClick={handleQuickTrack}
                      disabled={quickTrackLoading || !quickTrackInput.trim()}
                      className="nabdh-gradient text-white shrink-0"
                    >
                      {quickTrackLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        t('order.trackButton')
                      )}
                    </Button>
                  </div>
                  {quickTrackError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-destructive mt-3"
                    >
                      {quickTrackError}
                    </motion.p>
                  )}
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={() => navigateTo('login')}
                      className="gap-2"
                    >
                      {isAr ? 'تسجيل الدخول لمشاهدة طلباتك' : 'Sign in to view your orders'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Track Another Order button at bottom when viewing details */}
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <Button
              variant="outline"
              onClick={handleBackToOrders}
              className="gap-2 text-nabdh-primary border-nabdh-primary/20 hover:bg-nabdh-primary/5"
            >
              <PackageSearch className="size-4" />
              {t('order.trackAnotherOrder')}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
