'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ClipboardList,
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
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

interface TrackedOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
  statusLog: StatusLog[];
}

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="size-4" />,
  confirmed: <CheckCircle2 className="size-4" />,
  processing: <ClipboardList className="size-4" />,
  shipped: <Truck className="size-4" />,
  delivered: <CheckCircle2 className="size-4" />,
  cancelled: <XCircle className="size-4" />,
};

export function OrderTrackingDialog() {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const isOrderTrackingOpen = useUIStore((s) => s.isOrderTrackingOpen);
  const closeOrderTracking = useUIStore((s) => s.closeOrderTracking);

  const [orderNumber, setOrderNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleTrack = async () => {
    if (!orderNumber.trim()) return;

    setIsSearching(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(
        `/api/orders?orderNumber=${encodeURIComponent(orderNumber.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(t('order.notFound'));
        return;
      }

      if (data.order) {
        setOrder(data.order);
      } else {
        setError(t('order.notFound'));
      }
    } catch {
      setError(t('order.notFound'));
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    closeOrderTracking();
    setTimeout(() => {
      setOrderNumber('');
      setOrder(null);
      setError('');
    }, 300);
  };

  const getStatusLabel = (status: string) => {
    const key = `order.${status}`;
    const label = t(key);
    return label === key ? status : label;
  };

  const getStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.indexOf(status);
  };

  const getItemName = (item: OrderItem) =>
    language === 'ar' ? item.nameAr : item.nameEn;

  const currency = t('product.currency');

  const canCancel = order?.status === 'pending' || order?.status === 'confirmed';

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm(t('order.cancelConfirm'))) return;
    setCancelling(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrder({
          ...order,
          status: 'cancelled',
          statusLog: [
            {
              id: `cancel-${Date.now()}`,
              status: 'cancelled',
              note: language === 'ar' ? 'تم إلغاء الطلب بواسطة العميل' : 'Order cancelled by customer',
              createdAt: new Date().toISOString(),
            },
            ...(order.statusLog || []),
          ],
        });
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
    <Dialog open={isOrderTrackingOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">
            {t('order.trackTitle')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('order.trackTitle')}
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder={t('order.trackPlaceholder')}
              className="ps-9"
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
          </div>
          <Button
            onClick={handleTrack}
            disabled={isSearching || !orderNumber.trim()}
            className="nabdh-gradient text-white"
          >
            {isSearching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t('order.trackButton')
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-destructive py-4"
          >
            {error}
          </motion.div>
        )}

        {/* Order Details */}
        <AnimatePresence mode="wait">
          {order && (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Order Header */}
              <div className="glass-card rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="size-5 text-nabdh-primary" />
                    <span className="font-bold text-nabdh-primary">
                      {order.orderNumber}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      order.status === 'delivered' && 'border-emerald-500 text-emerald-600',
                      order.status === 'cancelled' && 'border-destructive text-destructive',
                      order.status === 'shipped' && 'border-blue-500 text-blue-600',
                      order.status === 'pending' && 'border-yellow-500 text-yellow-600'
                    )}
                  >
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('order.date')}: {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US')}
                </p>
              </div>

              {/* Status Timeline */}
              {order.status !== 'cancelled' ? (
                <div className="glass-card rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-4">
                    {t('order.statusHistory')}
                  </h4>
                  <div className="relative">
                    {statusSteps.map((step, i) => {
                      const currentIndex = getStepIndex(order.status);
                      const isCompleted = i <= currentIndex;
                      const isCurrent = i === currentIndex;

                      return (
                        <div key={step} className="flex items-start gap-3 mb-4 last:mb-0">
                          {/* Step indicator */}
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                'size-8 rounded-full flex items-center justify-center transition-all',
                                isCompleted
                                  ? 'nabdh-gradient text-white'
                                  : 'bg-muted text-muted-foreground',
                                isCurrent && 'ring-2 ring-nabdh-primary/30 ring-offset-2'
                              )}
                            >
                              {statusIcons[step]}
                            </div>
                            {i < statusSteps.length - 1 && (
                              <div
                                className={cn(
                                  'w-0.5 h-8 mt-1',
                                  i < currentIndex ? 'bg-nabdh-primary' : 'bg-muted'
                                )}
                              />
                            )}
                          </div>
                          {/* Step label */}
                          <div className="pt-1">
                            <p
                              className={cn(
                                'text-sm font-medium',
                                isCompleted ? 'text-foreground' : 'text-muted-foreground'
                              )}
                            >
                              {getStatusLabel(step)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-lg p-4 text-center">
                  <XCircle className="size-10 text-destructive mx-auto mb-2" />
                  <p className="font-semibold text-destructive">
                    {getStatusLabel('cancelled')}
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div className="glass-card rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3">
                  {t('order.items')}
                </h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex-1 line-clamp-1">
                        {getItemName(item)} ×{item.quantity}
                      </span>
                      <span className="font-medium ms-2">
                        {item.total.toFixed(2)} {currency}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-3" />

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span>{order.subtotal.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.delivery')}</span>
                    <span>
                      {order.deliveryFee === 0
                        ? t('cart.deliveryFree')
                        : `${order.deliveryFee.toFixed(2)} ${currency}`}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>{t('coupon.discount')}</span>
                      <span>-{order.discount.toFixed(2)} {currency}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1">
                    <span>{t('cart.total')}</span>
                    <span className="text-nabdh-price">
                      {order.total.toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cancel Order Button */}
              {canCancel && (
                <div className="glass-card rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-destructive">{t('order.cancelOrder')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t('order.cannotCancel')}</p>
                    </div>
                    <Button
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                      variant="destructive"
                      size="sm"
                      className="gap-1.5 shrink-0"
                    >
                      {cancelling ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      {t('order.cancelOrder')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Status Log */}
              {order.statusLog && order.statusLog.length > 0 && (
                <div className="glass-card rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3">
                    {t('order.statusHistory')}
                  </h4>
                  <div className="space-y-2">
                    {order.statusLog.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-nabdh-primary" />
                          <span>{getStatusLabel(log.status)}</span>
                          {log.note && (
                            <span className="text-muted-foreground">({log.note})</span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString(
                            language === 'ar' ? 'ar-LY' : 'en-US',
                            { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
