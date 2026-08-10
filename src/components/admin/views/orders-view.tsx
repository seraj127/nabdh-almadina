'use client';

import { useState, Fragment } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { ShoppingCart, ChevronDown, ChevronUp, AlertTriangle, Shield, Package, Search, Truck, ExternalLink, Printer } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  type AdminOrdersResponse,
  type CarriersResponse,
  COLORS,
  STATUS_COLORS,
  SHIPMENT_STATUS_COLORS,
  StatusBadge,
} from '@/components/admin/shared';
import { PrintDialog } from '@/components/admin/print-dialog';

// ─── Orders View ─────────────────────────────────────────────
export function OrdersView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();
  const isRTL = language === 'ar';
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Ship order dialog state
  const [shipDialog, setShipDialog] = useState<{ open: boolean; order: any | null }>({ open: false, order: null });
  const [printDialog, setPrintDialog] = useState<{ open: boolean; type: 'order' | 'product' | 'batch-orders' | 'batch-products'; data: any }>({ open: false, type: 'order', data: null });
  const [selectedCarrierId, setSelectedCarrierId] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [waybillNumber, setWaybillNumber] = useState('');
  const [shipmentWeight, setShipmentWeight] = useState('');

  const statusTabs = [
    { key: 'all', label: t('admin.all') },
    { key: 'pending', label: t('order.pending') },
    { key: 'confirmed', label: t('admin.confirmed') },
    { key: 'processing', label: t('admin.processing') },
    { key: 'shipped', label: t('admin.shipped') },
    { key: 'delivered', label: t('admin.delivered') },
    { key: 'cancelled', label: t('order.cancelled') },
  ];

  const { data, isLoading } = useQuery<AdminOrdersResponse>({
    queryKey: ['admin-orders', statusFilter, search, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      return authFetch(`/api/admin/orders?${params}`).then((r) => r.json());
    },
  });

  // Fetch carriers for ship dialog
  const { data: carriersData } = useQuery<CarriersResponse>({
    queryKey: ['shipping-carriers'],
    queryFn: () => authFetch('/api/admin/shipping/carriers').then((r) => r.json()),
    enabled: shipDialog.open,
  });

  const activeCarriers = (carriersData?.carriers || []).filter((c) => c.isActive);

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await authFetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  // Create shipment mutation
  const createShipmentMutation = useMutation({
    mutationFn: async (data: { orderId: string; carrierId: string; trackingNumber?: string; waybillNumber?: string; weight?: number }) => {
      const res = await authFetch('/api/admin/shipping/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create shipment');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setShipDialog({ open: false, order: null });
      setSelectedCarrierId('');
      setTrackingNumber('');
      setWaybillNumber('');
      setShipmentWeight('');
    },
  });

  // Open ship dialog
  const openShipDialog = (order: any) => {
    setShipDialog({ open: true, order });
    setSelectedCarrierId('');
    setTrackingNumber('');
    setWaybillNumber('');
    setShipmentWeight('');
  };

  // Status transition map
  const statusTransitions: Record<string, { next: string; labelAr: string; labelEn: string; color: string; isShip?: boolean }[]> = {
    pending: [{ next: 'confirmed', labelAr: 'تأكيد', labelEn: 'Confirm', color: COLORS.active }],
    confirmed: [{ next: 'processing', labelAr: 'معالجة', labelEn: 'Process', color: COLORS.purple }],
    processing: [{ next: 'shipped', labelAr: 'شحن', labelEn: 'Ship', color: '#A855F7', isShip: true }],
    shipped: [{ next: 'delivered', labelAr: 'توصيل', labelEn: 'Deliver', color: COLORS.success }],
  };

  return (
    <div className="space-y-4">
      {/* Search + Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4"
            style={{
              color: COLORS.muted,
              [language === 'ar' ? 'right' : 'left']: '12px',
            }}
          />
          <Input
            placeholder={t('admin.searchOrders')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={language === 'ar' ? 'pr-10' : 'pl-10'}
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
              color: COLORS.text,
            }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor:
                  statusFilter === tab.key ? `${COLORS.active}20` : COLORS.surface,
                color: statusFilter === tab.key ? COLORS.active : COLORS.muted,
                border: `1px solid ${
                  statusFilter === tab.key ? `${COLORS.active}40` : COLORS.border
                }`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <Card
        className="border overflow-hidden"
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
        }}
      >
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded animate-pulse"
                  style={{ backgroundColor: COLORS.bg }}
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: COLORS.border }}>
                  <TableHead style={{ color: COLORS.muted, width: 30 }} />
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.orderNumber')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.customer')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.amount')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.paymentMethod')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.status')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.orders.map((order: any) => (
                  <Fragment key={order.id}>
                    <TableRow
                      style={{ borderColor: COLORS.border, cursor: 'pointer' }}
                      onClick={() =>
                        setExpandedOrderId(
                          expandedOrderId === order.id ? null : order.id
                        )
                      }
                    >
                      <TableCell>
                        {expandedOrderId === order.id ? (
                          <ChevronUp className="h-4 w-4" style={{ color: COLORS.muted }} />
                        ) : (
                          <ChevronDown className="h-4 w-4" style={{ color: COLORS.muted }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm" style={{ color: COLORS.active }}>
                            {order.orderNumber}
                          </span>
                          {/* Show shipment badge */}
                          {order.shipment && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: `${SHIPMENT_STATUS_COLORS[order.shipment.status] || COLORS.purple}20`,
                                color: SHIPMENT_STATUS_COLORS[order.shipment.status] || COLORS.purple,
                                border: `1px solid ${SHIPMENT_STATUS_COLORS[order.shipment.status] || COLORS.purple}30`,
                              }}
                              title={order.shipment.trackingNumber ? `${t('shipment.trackingLabel')}: ${order.shipment.trackingNumber}` : ''}
                            >
                              <Truck className="h-2.5 w-2.5 inline me-0.5" />
                              {t(`shipment.status.${order.shipment.status}`)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell style={{ color: COLORS.text }}>
                        {order.user.name || order.user.phone}
                      </TableCell>
                      <TableCell style={{ color: COLORS.text }}>
                        {Number(order.total).toFixed(2)} {t('product.currency')}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm" style={{ color: COLORS.muted }}>
                          {order.paymentMethod === 'cod'
                            ? t('checkout.cod')
                            : t('checkout.card')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={order.status} />
                          {order.fraudScore >= 50 && (
                            <div
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{
                                backgroundColor: `${COLORS.danger}20`,
                                color: COLORS.danger,
                              }}
                              title={`${t('admin.fraudAlert')}: ${order.fraudScore}`}
                            >
                              <AlertTriangle className="h-2.5 w-2.5" />
                              {order.fraudScore}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell style={{ color: COLORS.muted }}>
                        {new Date(order.createdAt).toLocaleDateString(
                          isRTL ? 'ar-LY' : 'en-US'
                        )}
                      </TableCell>
                    </TableRow>
                    {/* Expanded Row */}
                    {expandedOrderId === order.id && (
                      <TableRow style={{ borderColor: COLORS.border }}>
                        <TableCell colSpan={7}>
                          <div
                            className="p-4 rounded-lg mx-2 my-1"
                            style={{ backgroundColor: COLORS.bg }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                                {t('order.details')}
                              </div>
                              {(order.fraudScore >= 30 || order.fraudFlagged) && (
                                <div
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                                  style={{
                                    backgroundColor: `${order.fraudScore >= 50 ? COLORS.danger : COLORS.warning}20`,
                                    color: order.fraudScore >= 50 ? COLORS.danger : COLORS.warning,
                                    border: `1px solid ${order.fraudScore >= 50 ? COLORS.danger : COLORS.warning}40`,
                                  }}
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  {t('admin.fraudAlert')} ({order.fraudScore})
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              {order.items.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-2 rounded"
                                  style={{ backgroundColor: `${COLORS.surface}60` }}
                                >
                                  <div
                                    className="w-8 h-8 rounded flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: COLORS.surface }}
                                  >
                                    {item.image ? (
                                      <img src={item.image} alt="" className="w-full h-full object-cover rounded" />
                                    ) : (
                                      <Package className="h-3 w-3" style={{ color: COLORS.muted }} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm truncate" style={{ color: COLORS.text }}>
                                      {isRTL ? item.nameAr : item.nameEn}
                                    </div>
                                    <div className="text-xs" style={{ color: COLORS.muted }}>
                                      {item.quantity} × {Number(item.price).toFixed(2)} {t('product.currency')}
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                                    {Number(item.total).toFixed(2)} {t('product.currency')}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Shipment Info (if exists) */}
                            {order.shipment && (
                              <div
                                className="mt-3 p-3 rounded-lg"
                                style={{
                                  backgroundColor: `${COLORS.purple}08`,
                                  border: `1px solid ${COLORS.purple}20`,
                                }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Truck className="h-4 w-4" style={{ color: COLORS.purple }} />
                                  <span className="text-xs font-medium" style={{ color: COLORS.purple }}>
                                    {t('shipment.info')}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                  <div>
                                    <span className="block text-[10px]" style={{ color: COLORS.muted }}>{t('shipment.carrierLabel')}</span>
                                    <span style={{ color: COLORS.text }}>
                                      {order.shipment.carrier ? (isRTL ? order.shipment.carrier.nameAr : order.shipment.carrier.nameEn) : '—'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px]" style={{ color: COLORS.muted }}>{t('shipment.trackingNumber')}</span>
                                    <span style={{ color: COLORS.active }} dir="ltr">{order.shipment.trackingNumber || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px]" style={{ color: COLORS.muted }}>{t('shipment.statusLabel')}</span>
                                    <span
                                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                                      style={{
                                        backgroundColor: `${SHIPMENT_STATUS_COLORS[order.shipment.status] || COLORS.muted}20`,
                                        color: SHIPMENT_STATUS_COLORS[order.shipment.status] || COLORS.muted,
                                      }}
                                    >
                                      {t(`shipment.status.${order.shipment.status}`)}
                                    </span>
                                  </div>
                                  <div>
                                    {order.shipment.carrier?.trackingUrl && order.shipment.trackingNumber && (
                                      <a
                                        href={order.shipment.carrier.trackingUrl.replace('{trackingNumber}', order.shipment.trackingNumber)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium"
                                        style={{ backgroundColor: `${COLORS.purple}20`, color: COLORS.purple }}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink className="h-2.5 w-2.5" />
                                        {t('shipping.trackOnCarrierSite')}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Fraud Score Indicator (detailed) */}
                            {order.fraudScore > 0 && (
                              <div
                                className="mt-3 p-3 rounded-lg"
                                style={{
                                  backgroundColor: `${order.fraudScore >= 50 ? COLORS.danger : order.fraudScore >= 30 ? COLORS.warning : COLORS.muted}10`,
                                  border: `1px solid ${order.fraudScore >= 50 ? COLORS.danger : order.fraudScore >= 30 ? COLORS.warning : COLORS.muted}30`,
                                }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <Shield className="h-4 w-4" style={{ color: order.fraudScore >= 50 ? COLORS.danger : order.fraudScore >= 30 ? COLORS.warning : COLORS.muted }} />
                                  <span className="text-xs font-medium" style={{ color: order.fraudScore >= 50 ? COLORS.danger : order.fraudScore >= 30 ? COLORS.warning : COLORS.muted }}>
                                    {t('admin.fraudScore')}: {order.fraudScore}/100
                                  </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.border }}>
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.min(order.fraudScore, 100)}%`,
                                      backgroundColor: order.fraudScore >= 50 ? COLORS.danger : order.fraudScore >= 30 ? COLORS.warning : COLORS.success,
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Status Action Buttons */}
                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <div className="mt-3 flex items-center gap-2 flex-wrap">
                                <span className="text-xs ms-2" style={{ color: COLORS.muted }}>
                                  {t('admin.updateStatusLabel')}:
                                </span>
                                {statusTransitions[order.status]?.map((transition) => (
                                  <button
                                    key={transition.next}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (transition.isShip && !order.shipment) {
                                        // Open ship dialog instead of directly changing status
                                        openShipDialog(order);
                                      } else {
                                        statusMutation.mutate({ orderId: order.id, status: transition.next });
                                      }
                                    }}
                                    disabled={statusMutation.isPending}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                                    style={{
                                      backgroundColor: `${transition.color}20`,
                                      color: transition.color,
                                      border: `1px solid ${transition.color}40`,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${transition.color}30`)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${transition.color}20`)}
                                  >
                                    {isRTL ? transition.labelAr : transition.labelEn}
                                    {transition.isShip && !order.shipment && <Truck className="h-3 w-3 inline ms-1" />}
                                  </button>
                                ))}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    statusMutation.mutate({ orderId: order.id, status: 'cancelled' });
                                  }}
                                  disabled={statusMutation.isPending}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-50"
                                  style={{
                                    backgroundColor: `${COLORS.danger}20`,
                                    color: COLORS.danger,
                                    border: `1px solid ${COLORS.danger}40`,
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${COLORS.danger}30`)}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${COLORS.danger}20`)}
                                >
                                  {t('common.cancel')}
                                </button>
                              </div>
                            )}

                            {/* Print Actions */}
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                              <span className="text-xs ms-2" style={{ color: COLORS.muted }}>
                                {t('print.title')}:
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrintDialog({ open: true, type: 'order', data: order });
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
                                style={{
                                  backgroundColor: `${COLORS.purple}20`,
                                  color: COLORS.purple,
                                  border: `1px solid ${COLORS.purple}40`,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${COLORS.purple}30`)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${COLORS.purple}20`)}
                              >
                                <Printer className="h-3 w-3" />
                                {isRTL ? 'طباعة' : 'Print'}
                              </button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: COLORS.muted }}>
            {t('admin.page')} {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                borderColor: COLORS.border,
                color: COLORS.text,
                backgroundColor: COLORS.surface,
              }}
            >
              {t('admin.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.hasNext}
              onClick={() => setPage((p) => p + 1)}
              style={{
                borderColor: COLORS.border,
                color: COLORS.text,
                backgroundColor: COLORS.surface,
              }}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}

      {/* ═══════════ PRINT DIALOG ═══════════ */}
      <PrintDialog
        open={printDialog.open}
        onOpenChange={(open) => setPrintDialog({ ...printDialog, open })}
        type={printDialog.type}
        data={printDialog.data}
      />

      {/* ═══════════ SHIP ORDER DIALOG ═══════════ */}
      <Dialog open={shipDialog.open} onOpenChange={(open) => setShipDialog({ open, order: open ? shipDialog.order : null })}>
        <DialogContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: COLORS.text }} className="flex items-center gap-2">
              <Truck className="h-5 w-5" style={{ color: '#A855F7' }} />
              {t('shipping.shipOrder')}
            </DialogTitle>
            <DialogDescription style={{ color: COLORS.muted }}>
              {shipDialog.order && (
                <>{t('admin.orderNumberLabel')} {shipDialog.order.orderNumber} — {t('shipping.selectCarrierPrompt')}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Carrier selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium" style={{ color: COLORS.active }}>
                {t('shipment.selectCarrier')} *
              </Label>
              <Select value={selectedCarrierId} onValueChange={setSelectedCarrierId}>
                <SelectTrigger style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}>
                  <SelectValue placeholder={t('shipping.selectCarrierPlaceholder')} />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
                  {activeCarriers.length === 0 ? (
                    <div className="p-3 text-center text-xs" style={{ color: COLORS.muted }}>
                      {t('shipping.noActiveCarriers')}
                    </div>
                  ) : (
                    activeCarriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        <div className="flex items-center gap-2">
                          <Truck className="h-3 w-3" />
                          <span>{isRTL ? carrier.nameAr : carrier.nameEn}</span>
                          <span className="text-[10px]" style={{ color: COLORS.muted }}>
                            ({Number(carrier.basePrice).toFixed(0)} {t('product.currency')} — {carrier.estimatedDays} {t('common.days')})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Tracking Number */}
            <div className="space-y-1">
              <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.enterTracking')}</Label>
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. LY-123456789"
                dir="ltr"
                style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>

            {/* Waybill Number */}
            <div className="space-y-1">
              <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.enterWaybill')}</Label>
              <Input
                value={waybillNumber}
                onChange={(e) => setWaybillNumber(e.target.value)}
                placeholder="e.g. WB-2024-001"
                dir="ltr"
                style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>

            {/* Weight */}
            <div className="space-y-1">
              <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.enterWeight')}</Label>
              <Input
                type="number"
                value={shipmentWeight}
                onChange={(e) => setShipmentWeight(e.target.value)}
                placeholder="e.g. 2.5"
                dir="ltr"
                style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>

            {/* Carrier pricing note */}
            {selectedCarrierId && (
              <div className="p-2 rounded-lg text-xs" style={{ backgroundColor: `${COLORS.active}08`, border: `1px solid ${COLORS.active}20` }}>
                <p style={{ color: COLORS.muted }}>{t('shipping.carrierPricingNote')}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShipDialog({ open: false, order: null })}
              style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: 'transparent' }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                if (shipDialog.order && selectedCarrierId) {
                  createShipmentMutation.mutate({
                    orderId: shipDialog.order.id,
                    carrierId: selectedCarrierId,
                    trackingNumber: trackingNumber || undefined,
                    waybillNumber: waybillNumber || undefined,
                    weight: shipmentWeight ? Number(shipmentWeight) : undefined,
                  });
                }
              }}
              disabled={!selectedCarrierId || createShipmentMutation.isPending}
              style={{ backgroundColor: '#A855F7', color: '#fff', border: 'none' }}
            >
              {createShipmentMutation.isPending ? (
                <>
                  <span className="animate-spin me-1">⟳</span>
                  {t('shipping.creatingShipment')}
                </>
              ) : (
                <>
                  <Truck className="h-3.5 w-3.5 me-1" />
                  {t('shipping.createShipment')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
