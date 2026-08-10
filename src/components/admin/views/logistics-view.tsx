'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Truck, MapPin, Store, Shield, Package, Star, Clock, ArrowUpDown, AlertTriangle, Plus, Pencil, Trash2, Ship, Globe, Link, Key, DollarSign, Weight, ChevronDown, ChevronUp, ExternalLink, Phone, Mail, Hash, CheckCircle2, XCircle, RefreshCw, Printer } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type VendorsResponse,
  type CarriersResponse,
  type ShipmentsResponse,
  type ShippingCarrier,
  COLORS,
  VENDOR_TYPE_COLORS,
  CARRIER_TYPE_COLORS,
  SHIPMENT_STATUS_COLORS,
  INTEGRATION_TYPE_COLORS,
  LoadingSkeleton,
  ErrorDisplay,
  StatCard,
} from '@/components/admin/shared';
import { PrintDialog } from '@/components/admin/print-dialog';

// ─── Carrier form defaults ──────────────────────────────────────
const defaultCarrierForm = {
  nameAr: '', nameEn: '', code: '', type: 'national',
  phone: '', email: '', website: '', logo: '',
  apiEndpoint: '', apiKey: '', apiSecret: '', webhookUrl: '', trackingUrl: '',
  maxWeight: 30, pricePerKg: 1.5, basePrice: 5,
  codFee: 0, codFixedFee: 0, estimatedDays: 3,
  isIntegrated: false, integrationType: 'manual',
  notes: '',
};

// ─── Logistics View ──────────────────────────────────────────────
export function LogisticsView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();
  const isRTL = language === 'ar';

  // ─── Carrier state ────────────────────────────────────────────
  const [carrierDialog, setCarrierDialog] = useState<{ open: boolean; carrier: ShippingCarrier | null }>({ open: false, carrier: null });
  const [carrierForm, setCarrierForm] = useState(defaultCarrierForm);
  const [isSavingCarrier, setIsSavingCarrier] = useState(false);
  const [deleteCarrierDialog, setDeleteCarrierDialog] = useState<{ open: boolean; carrier: ShippingCarrier | null }>({ open: false, carrier: null });

  // ─── Shipment state ───────────────────────────────────────────
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('all');
  const [expandedShipmentId, setExpandedShipmentId] = useState<string | null>(null);
  const [shipmentStatusDialog, setShipmentStatusDialog] = useState<{ open: boolean; shipment: any | null }>({ open: false, shipment: null });
  const [newShipmentStatus, setNewShipmentStatus] = useState('');
  const [newShipmentLocation, setNewShipmentLocation] = useState('');
  const [printDialog, setPrintDialog] = useState<{ open: boolean; type: 'order' | 'product' | 'batch-orders' | 'batch-products'; data: any; defaultTemplate?: string }>({ open: false, type: 'order', data: null });

  // ─── Queries ──────────────────────────────────────────────────
  const { data: zonesData, isLoading: zonesLoading } = useQuery({
    queryKey: ['delivery-zones'],
    queryFn: () => authFetch('/api/admin/delivery-zones').then((r) => r.json()),
  });

  const { data: vendorsData, isLoading: vendorsLoading } = useQuery<VendorsResponse>({
    queryKey: ['admin-vendors'],
    queryFn: () => authFetch('/api/admin/vendors').then((r) => r.json()),
  });

  const { data: carriersData, isLoading: carriersLoading, error: carriersError } = useQuery<CarriersResponse>({
    queryKey: ['shipping-carriers'],
    queryFn: () => authFetch('/api/admin/shipping/carriers').then((r) => r.json()),
  });

  const { data: shipmentsData, isLoading: shipmentsLoading } = useQuery<ShipmentsResponse>({
    queryKey: ['shipments', shipmentStatusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '20' });
      if (shipmentStatusFilter !== 'all') params.set('status', shipmentStatusFilter);
      return authFetch(`/api/admin/shipping/shipments?${params}`).then((r) => r.json());
    },
  });

  // ─── Shipment Status Update Mutation (must be before early returns) ──
  const shipmentStatusMutation = useMutation({
    mutationFn: async ({ id, status, location }: { id: string; status: string; location: string }) => {
      const res = await authFetch('/api/admin/shipping/shipments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, location }),
      });
      if (!res.ok) throw new Error('Failed to update shipment status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setShipmentStatusDialog({ open: false, shipment: null });
    },
  });

  if (zonesLoading || vendorsLoading || carriersLoading) return <LoadingSkeleton />;
  if (carriersError) return <ErrorDisplay message={String(carriersError)} />;

  const zones: any[] = zonesData?.zones || zonesData?.data || [];
  const vendors = vendorsData?.vendors || [];
  const carriers = carriersData?.carriers || [];
  const shipments = shipmentsData?.shipments || [];
  const summary = carriersData?.summary;

  const totalProducts = vendors.reduce((acc, v) => acc + v._count.products, 0);
  const verifiedVendors = vendors.filter((v) => v.isVerified).length;

  // ─── Carrier CRUD Handlers ────────────────────────────────────
  const openAddCarrier = () => {
    setCarrierForm(defaultCarrierForm);
    setCarrierDialog({ open: true, carrier: null });
  };

  const openEditCarrier = (carrier: ShippingCarrier) => {
    setCarrierForm({
      nameAr: carrier.nameAr || '',
      nameEn: carrier.nameEn || '',
      code: carrier.code || '',
      type: carrier.type || 'national',
      phone: carrier.phone || '',
      email: carrier.email || '',
      website: carrier.website || '',
      logo: carrier.logo || '',
      apiEndpoint: carrier.apiEndpoint || '',
      apiKey: carrier.apiKey || '',
      apiSecret: carrier.apiSecret || '',
      webhookUrl: carrier.webhookUrl || '',
      trackingUrl: carrier.trackingUrl || '',
      maxWeight: Number(carrier.maxWeight) || 30,
      pricePerKg: Number(carrier.pricePerKg) || 1.5,
      basePrice: Number(carrier.basePrice) || 5,
      codFee: Number(carrier.codFee) || 0,
      codFixedFee: Number(carrier.codFixedFee) || 0,
      estimatedDays: carrier.estimatedDays || 3,
      isIntegrated: carrier.isIntegrated ?? false,
      integrationType: carrier.integrationType || 'manual',
      notes: carrier.notes || '',
    });
    setCarrierDialog({ open: true, carrier });
  };

  const saveCarrier = async () => {
    setIsSavingCarrier(true);
    try {
      if (carrierDialog.carrier) {
        const res = await authFetch('/api/admin/shipping/carriers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: carrierDialog.carrier.id, ...carrierForm }),
        });
        if (!res.ok) throw new Error('Failed to update carrier');
      } else {
        const res = await authFetch('/api/admin/shipping/carriers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(carrierForm),
        });
        if (!res.ok) throw new Error('Failed to create carrier');
      }
      queryClient.invalidateQueries({ queryKey: ['shipping-carriers'] });
      setCarrierDialog({ open: false, carrier: null });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCarrier(false);
    }
  };

  const confirmDeleteCarrier = async () => {
    if (!deleteCarrierDialog.carrier) return;
    try {
      const res = await authFetch(`/api/admin/shipping/carriers?id=${deleteCarrierDialog.carrier.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete carrier');
      queryClient.invalidateQueries({ queryKey: ['shipping-carriers'] });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteCarrierDialog({ open: false, carrier: null });
    }
  };

  // ─── Stat cards ──────────────────────────────────────────────
  const statCards = [
    {
      label: t('shipping.totalCarriers'),
      value: String(summary?.totalCarriers ?? carriers.length),
      icon: <Truck className="h-5 w-5" />,
      color: COLORS.active,
    },
    {
      label: t('shipping.activeCarriers'),
      value: String(summary?.activeCarriers ?? carriers.filter(c => c.isActive).length),
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: COLORS.success,
    },
    {
      label: t('shipping.integratedCarriers'),
      value: String(summary?.integratedCarriers ?? carriers.filter(c => c.isIntegrated).length),
      icon: <Globe className="h-5 w-5" />,
      color: COLORS.purple,
    },
    {
      label: t('shipping.totalShipments'),
      value: String(summary?.totalShipments ?? 0),
      icon: <Package className="h-5 w-5" />,
      color: COLORS.orange,
    },
  ];

  // ─── Shipment status tabs ──────────────────────────────────────
  const shipmentStatusTabs = [
    { key: 'all', label: t('admin.all') },
    { key: 'created', label: t('shipment.status.created') },
    { key: 'in_transit', label: t('shipment.status.in_transit') },
    { key: 'out_for_delivery', label: t('shipment.status.out_for_delivery') },
    { key: 'delivered', label: t('shipment.status.delivered') },
    { key: 'failed', label: t('shipment.status.failed') },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} label={card.label} value={card.value} icon={card.icon} color={card.color} />
        ))}
      </div>

      {/* Main Tabs: Carriers / Shipments / Zones / Vendors */}
      <Tabs defaultValue="carriers" dir={isRTL ? 'rtl' : 'ltr'}>
        <TabsList className="bg-[#161B22] border border-[#30363D]">
          <TabsTrigger value="carriers" className="data-[state=active]:bg-[#58A6FF20] data-[state=active]:text-[#58A6FF]">
            <Truck className="h-4 w-4 me-2" />
            {t('shipping.carriers')}
          </TabsTrigger>
          <TabsTrigger value="shipments" className="data-[state=active]:bg-[#58A6FF20] data-[state=active]:text-[#58A6FF]">
            <Ship className="h-4 w-4 me-2" />
            {t('shipment.title')}
          </TabsTrigger>
          <TabsTrigger value="zones" className="data-[state=active]:bg-[#58A6FF20] data-[state=active]:text-[#58A6FF]">
            <MapPin className="h-4 w-4 me-2" />
            {t('admin.deliveryZones')}
          </TabsTrigger>
          <TabsTrigger value="vendors" className="data-[state=active]:bg-[#58A6FF20] data-[state=active]:text-[#58A6FF]">
            <Store className="h-4 w-4 me-2" />
            {t('admin.vendors')}
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ CARRIERS TAB ═══════════ */}
        <TabsContent value="carriers">
          <Card style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
                  <Truck className="h-4 w-4" style={{ color: COLORS.active }} />
                  {t('shipping.carriers')}
                </CardTitle>
                <Button size="sm" onClick={openAddCarrier} className="gap-1.5" style={{ backgroundColor: COLORS.active, color: '#fff', border: 'none' }}>
                  <Plus className="h-3.5 w-3.5" />
                  {t('shipping.addCarrier')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {carriers.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 mx-auto mb-3" style={{ color: COLORS.muted }} />
                  <p className="text-sm" style={{ color: COLORS.muted }}>
                    {t('shipping.noCarriers')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {carriers.map((carrier) => (
                    <div
                      key={carrier.id}
                      className="p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01]"
                      style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-bold" style={{ color: COLORS.text }}>
                            {isRTL ? carrier.nameAr : carrier.nameEn}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${COLORS.muted}20`, color: COLORS.muted }}>
                              {carrier.code}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{
                                backgroundColor: `${CARRIER_TYPE_COLORS[carrier.type] || COLORS.muted}20`,
                                color: CARRIER_TYPE_COLORS[carrier.type] || COLORS.muted,
                              }}
                            >
                              {t(`shipping.${carrier.type}`)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {carrier.isIntegrated && (
                            <Badge className="text-[10px] px-1.5" style={{ backgroundColor: `${COLORS.purple}20`, color: COLORS.purple, border: 'none' }}>
                              API
                            </Badge>
                          )}
                          <Badge
                            className="text-[10px] px-1.5"
                            style={{
                              backgroundColor: carrier.isActive ? `${COLORS.success}20` : `${COLORS.danger}20`,
                              color: carrier.isActive ? COLORS.success : COLORS.danger,
                              border: 'none',
                            }}
                          >
                            {carrier.isActive ? t('admin.active') : t('admin.inactive')}
                          </Badge>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${COLORS.active}08` }}>
                          <div className="text-[10px]" style={{ color: COLORS.muted }}>{t('shipping.basePrice')}</div>
                          <div className="text-xs font-bold" style={{ color: COLORS.active }}>{Number(carrier.basePrice).toFixed(2)} {t('product.currency')}</div>
                        </div>
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${COLORS.success}08` }}>
                          <div className="text-[10px]" style={{ color: COLORS.muted }}>{t('shipping.estimatedDays')}</div>
                          <div className="text-xs font-bold" style={{ color: COLORS.success }}>{carrier.estimatedDays} {t('common.days')}</div>
                        </div>
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${COLORS.purple}08` }}>
                          <div className="text-[10px]" style={{ color: COLORS.muted }}>{t('shipping.pricePerKg')}</div>
                          <div className="text-xs font-bold" style={{ color: COLORS.purple }}>{Number(carrier.pricePerKg).toFixed(2)} {t('product.currency')}</div>
                        </div>
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${COLORS.orange}08` }}>
                          <div className="text-[10px]" style={{ color: COLORS.muted }}>{t('shipping.totalShipments')}</div>
                          <div className="text-xs font-bold" style={{ color: COLORS.orange }}>{carrier.totalShipments}</div>
                        </div>
                      </div>

                      {/* Performance */}
                      {(Number(carrier.successRate) > 0 || Number(carrier.rating) > 0) && (
                        <div className="flex items-center gap-3 mb-3 text-xs">
                          {Number(carrier.successRate) > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" style={{ color: COLORS.success }} />
                              <span style={{ color: COLORS.muted }}>{Number(carrier.successRate).toFixed(0)}%</span>
                            </div>
                          )}
                          {Number(carrier.rating) > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" style={{ color: COLORS.warning }} />
                              <span style={{ color: COLORS.muted }}>{Number(carrier.rating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contact */}
                      <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: COLORS.muted }}>
                        {carrier.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span dir="ltr">{carrier.phone}</span>
                          </div>
                        )}
                        {carrier.website && (
                          <a href={carrier.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: COLORS.active }}>
                            <Globe className="h-3 w-3" />
                            {t('shipping.website')}
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: COLORS.border }}>
                        <button onClick={() => openEditCarrier(carrier)} className="p-1.5 rounded-md transition-colors" style={{ color: COLORS.active }} title={t('common.edit')}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteCarrierDialog({ open: true, carrier })} className="p-1.5 rounded-md transition-colors" style={{ color: COLORS.danger }} title={t('common.delete')}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {carrier.trackingUrl && (
                          <a href={carrier.trackingUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md transition-colors ms-auto" style={{ color: COLORS.purple }} title={t('shipping.trackingUrl')}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ SHIPMENTS TAB ═══════════ */}
        <TabsContent value="shipments">
          <Card style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
                  <Ship className="h-4 w-4" style={{ color: COLORS.purple }} />
                  {t('shipment.title')}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['shipments'] })}
                    className="p-1.5 rounded-md transition-colors"
                    style={{ color: COLORS.muted }}
                    title={t('common.refresh')}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Status filter tabs */}
              <div className="flex gap-2 flex-wrap mb-4">
                {shipmentStatusTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setShipmentStatusFilter(tab.key)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: shipmentStatusFilter === tab.key ? `${COLORS.active}20` : COLORS.bg,
                      color: shipmentStatusFilter === tab.key ? COLORS.active : COLORS.muted,
                      border: `1px solid ${shipmentStatusFilter === tab.key ? `${COLORS.active}40` : COLORS.border}`,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {shipmentsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 rounded animate-pulse" style={{ backgroundColor: COLORS.bg }} />
                  ))}
                </div>
              ) : shipments.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-3" style={{ color: COLORS.muted }} />
                  <p className="text-sm" style={{ color: COLORS.muted }}>
                    {t('shipment.noShipments')}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: COLORS.border }}>
                      <TableHead style={{ color: COLORS.muted, width: 30 }} />
                      <TableHead style={{ color: COLORS.muted }}>{t('admin.orderNumber')}</TableHead>
                      <TableHead style={{ color: COLORS.muted }}>{t('shipping.carriers')}</TableHead>
                      <TableHead style={{ color: COLORS.muted }}>{t('shipment.trackingNumber')}</TableHead>
                      <TableHead style={{ color: COLORS.muted }}>{t('admin.status')}</TableHead>
                      <TableHead style={{ color: COLORS.muted }}>{t('shipment.shippingCost')}</TableHead>
                      <TableHead style={{ color: COLORS.muted }}>{t('admin.date')}</TableHead>
                      <TableHead style={{ color: COLORS.muted }}>{t('admin.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((shipment: any) => (
                      <>
                        <TableRow
                          key={shipment.id}
                          style={{ borderColor: COLORS.border, cursor: 'pointer' }}
                          onClick={() => setExpandedShipmentId(expandedShipmentId === shipment.id ? null : shipment.id)}
                        >
                          <TableCell>
                            {expandedShipmentId === shipment.id ? (
                              <ChevronUp className="h-4 w-4" style={{ color: COLORS.muted }} />
                            ) : (
                              <ChevronDown className="h-4 w-4" style={{ color: COLORS.muted }} />
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm" style={{ color: COLORS.active }}>
                              {shipment.order?.orderNumber || '—'}
                            </span>
                          </TableCell>
                          <TableCell style={{ color: COLORS.text }}>
                            {shipment.carrier ? (isRTL ? shipment.carrier.nameAr : shipment.carrier.nameEn) : '—'}
                          </TableCell>
                          <TableCell style={{ color: COLORS.text }} dir="ltr">
                            {shipment.trackingNumber || '—'}
                          </TableCell>
                          <TableCell>
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${SHIPMENT_STATUS_COLORS[shipment.status] || COLORS.muted}20`,
                                color: SHIPMENT_STATUS_COLORS[shipment.status] || COLORS.muted,
                                border: `1px solid ${SHIPMENT_STATUS_COLORS[shipment.status] || COLORS.muted}30`,
                              }}
                            >
                              {t(`shipment.status.${shipment.status}`) || shipment.status}
                            </span>
                          </TableCell>
                          <TableCell style={{ color: COLORS.text }}>
                            {Number(shipment.shippingCost).toFixed(2)} {t('product.currency')}
                          </TableCell>
                          <TableCell style={{ color: COLORS.muted }}>
                            {new Date(shipment.createdAt).toLocaleDateString(isRTL ? 'ar-LY' : 'en-US')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShipmentStatusDialog({ open: true, shipment });
                                  setNewShipmentStatus('');
                                  setNewShipmentLocation('');
                                }}
                                className="px-2 py-1 rounded-md text-xs font-medium transition-colors"
                                style={{ backgroundColor: `${COLORS.active}20`, color: COLORS.active, border: `1px solid ${COLORS.active}30` }}
                              >
                                {t('shipment.updateStatus')}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Construct order-like data from shipment for shipping label printing
                                  setPrintDialog({ open: true, type: 'order', data: shipment.order, defaultTemplate: 'shipping-label' });
                                }}
                                className="px-2 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1"
                                style={{ backgroundColor: `${COLORS.purple}20`, color: COLORS.purple, border: `1px solid ${COLORS.purple}30` }}
                              >
                                <Printer className="h-3 w-3" />
                                {isRTL ? 'ملصق' : 'Label'}
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded row - Tracking log */}
                        {expandedShipmentId === shipment.id && (
                          <TableRow key={`${shipment.id}-expanded`} style={{ borderColor: COLORS.border }}>
                            <TableCell colSpan={8}>
                              <div className="p-4 rounded-lg mx-2 my-1" style={{ backgroundColor: COLORS.bg }}>
                                <h4 className="text-sm font-medium mb-3" style={{ color: COLORS.text }}>
                                  {t('shipment.log.title')}
                                </h4>
                                {shipment.logs && shipment.logs.length > 0 ? (
                                  <div className="space-y-2">
                                    {shipment.logs.map((log: any) => (
                                      <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg" style={{ backgroundColor: `${COLORS.surface}60` }}>
                                        <div
                                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                          style={{
                                            backgroundColor: `${SHIPMENT_STATUS_COLORS[log.status] || COLORS.muted}20`,
                                            color: SHIPMENT_STATUS_COLORS[log.status] || COLORS.muted,
                                          }}
                                        >
                                          <Package className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium" style={{ color: COLORS.text }}>
                                              {t(`shipment.status.${log.status}`) || log.status}
                                            </span>
                                            {log.location && (
                                              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${COLORS.muted}20`, color: COLORS.muted }}>
                                                {log.location}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11px] mt-0.5" style={{ color: COLORS.muted }}>
                                            {isRTL ? log.descriptionAr : log.descriptionEn}
                                          </p>
                                          <p className="text-[10px] mt-0.5" style={{ color: COLORS.muted }} dir="ltr">
                                            {new Date(log.occurredAt).toLocaleString(isRTL ? 'ar-LY' : 'en-US')}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs" style={{ color: COLORS.muted }}>{t('common.noData')}</p>
                                )}

                                {/* Shipment Details */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t" style={{ borderColor: COLORS.border }}>
                                  <div>
                                    <span className="text-[10px] block" style={{ color: COLORS.muted }}>{t('shipment.weight')}</span>
                                    <span className="text-xs font-medium" style={{ color: COLORS.text }}>{shipment.weight ? `${Number(shipment.weight).toFixed(1)} kg` : '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] block" style={{ color: COLORS.muted }}>{t('shipment.codAmount')}</span>
                                    <span className="text-xs font-medium" style={{ color: COLORS.text }}>{Number(shipment.codAmount).toFixed(2)} {t('product.currency')}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] block" style={{ color: COLORS.muted }}>{t('shipment.waybillNumber')}</span>
                                    <span className="text-xs font-medium" style={{ color: COLORS.text }} dir="ltr">{shipment.waybillNumber || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] block" style={{ color: COLORS.muted }}>{t('shipment.estimatedDelivery')}</span>
                                    <span className="text-xs font-medium" style={{ color: COLORS.text }}>
                                      {shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString(isRTL ? 'ar-LY' : 'en-US') : '—'}
                                    </span>
                                  </div>
                                </div>

                                {/* Carrier tracking link */}
                                {shipment.carrier?.trackingUrl && shipment.trackingNumber && (
                                  <a
                                    href={shipment.carrier.trackingUrl.replace('{trackingNumber}', shipment.trackingNumber)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium"
                                    style={{ backgroundColor: `${COLORS.purple}20`, color: COLORS.purple, border: `1px solid ${COLORS.purple}30` }}
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {t('shipping.trackOnCarrierSite')}
                                  </a>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ ZONES TAB ═══════════ */}
        <TabsContent value="zones">
          <Card style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
                <MapPin className="h-4 w-4" style={{ color: COLORS.active }} />
                {t('admin.deliveryZones')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {zones.length === 0 ? (
                  <p className="text-sm text-center py-8 col-span-full" style={{ color: COLORS.muted }}>{t('common.noData')}</p>
                ) : (
                  zones.map((zone: any) => (
                    <div key={zone.id} className="p-4 rounded-xl border" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border }}>
                      <div className="text-sm font-bold mb-1" style={{ color: COLORS.text }}>
                        {isRTL ? zone.nameAr : zone.nameEn}
                      </div>
                      <div className="text-xs mb-2" style={{ color: COLORS.muted }}>{zone.city}{zone.area ? ` - ${zone.area}` : ''}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: COLORS.active }}>{Number(zone.fee).toFixed(2)} {t('product.currency')}</span>
                        <span style={{ color: COLORS.muted }}>{zone.estimatedDays} {t('common.days')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ VENDORS TAB ═══════════ */}
        <TabsContent value="vendors">
          <Card style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
                <Store className="h-4 w-4" style={{ color: COLORS.purple }} />
                {t('admin.vendors')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.length === 0 ? (
                  <p className="text-sm text-center py-8 col-span-full" style={{ color: COLORS.muted }}>{t('common.noData')}</p>
                ) : (
                  vendors.map((vendor) => (
                    <div key={vendor.id} className="p-4 rounded-xl border" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-bold" style={{ color: COLORS.text }}>{isRTL ? vendor.nameAr : vendor.nameEn}</div>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1" style={{
                            backgroundColor: `${VENDOR_TYPE_COLORS[vendor.type] || COLORS.muted}20`,
                            color: VENDOR_TYPE_COLORS[vendor.type] || COLORS.muted,
                          }}>
                            {vendor.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {vendor.isVerified && <Badge className="text-xs" style={{ backgroundColor: `${COLORS.success}20`, color: COLORS.success, border: 'none' }}>✓ {t('admin.verified')}</Badge>}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: COLORS.muted }}>{t('vendor.commission')}</span>
                          <span style={{ color: COLORS.text }}>{vendor.commission}%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: COLORS.muted }}>{t('vendor.rating')}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" style={{ color: COLORS.warning }} />
                            <span style={{ color: COLORS.warning }}>{vendor.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span style={{ color: COLORS.muted }}>{t('vendor.totalSales')}</span>
                          <span style={{ color: COLORS.text }}>{vendor.totalSales.toFixed(2)} {t('product.currency')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Environmental Adjustments */}
      <Card style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
            <AlertTriangle className="h-4 w-4" style={{ color: COLORS.warning }} />
            {t('admin.environmentalAdj')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: 'sandstorm', label: t('admin.sandstorm'), impact: '+40%', desc: isRTL ? 'زيادة وقت التوصيل المتوقع' : 'Increased ETA', color: COLORS.warning, icon: <AlertTriangle className="h-5 w-5" /> },
              { key: 'heavyRain', label: t('admin.heavyRain'), impact: '+25%', desc: isRTL ? 'تأخير محتمل في التوصيل' : 'Potential delivery delay', color: COLORS.active, icon: <Clock className="h-5 w-5" /> },
              { key: 'highTraffic', label: t('admin.highTraffic'), impact: '+15%', desc: isRTL ? 'أوقات الذروة في المدن الكبرى' : 'Peak hours in major cities', color: COLORS.orange, icon: <ArrowUpDown className="h-5 w-5" /> },
            ].map((adj) => (
              <div key={adj.key} className="p-4 rounded-xl border" style={{ backgroundColor: `${adj.color}08`, borderColor: `${adj.color}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ color: adj.color }}>{adj.icon}</div>
                  <span className="text-sm font-bold" style={{ color: adj.color }}>{adj.label}</span>
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>{adj.impact}</div>
                <div className="text-xs" style={{ color: COLORS.muted }}>
                  {isRTL ? 'تأثير على ETA' : 'ETA Impact'}: {adj.desc}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ CARRIER CREATE/EDIT DIALOG ═══════════ */}
      <Dialog open={carrierDialog.open} onOpenChange={(open) => setCarrierDialog({ open, carrier: open ? carrierDialog.carrier : null })}>
        <DialogContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }} className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: COLORS.text }}>
              {carrierDialog.carrier ? t('shipping.editCarrier') : t('shipping.addCarrier')}
            </DialogTitle>
            <DialogDescription style={{ color: COLORS.muted }}>
              {carrierDialog.carrier
                ? (isRTL ? 'قم بتعديل تفاصيل شركة الشحن' : 'Modify the carrier details')
                : (isRTL ? 'أدخل تفاصيل شركة الشحن الجديدة' : 'Enter the new carrier details')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Basic Info */}
            <div>
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: COLORS.active }}>
                <Truck className="h-3 w-3" />
                {isRTL ? 'معلومات أساسية' : 'Basic Info'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.carrierName')} (AR)*</Label>
                  <Input value={carrierForm.nameAr} onChange={(e) => setCarrierForm({ ...carrierForm, nameAr: e.target.value })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.carrierName')} (EN)*</Label>
                  <Input value={carrierForm.nameEn} onChange={(e) => setCarrierForm({ ...carrierForm, nameEn: e.target.value })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.carrierCode')}*</Label>
                  <Input value={carrierForm.code} onChange={(e) => setCarrierForm({ ...carrierForm, code: e.target.value })} disabled={!!carrierDialog.carrier} placeholder="e.g. libya_post" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.carrierType')}</Label>
                  <Select value={carrierForm.type} onValueChange={(v) => setCarrierForm({ ...carrierForm, type: v })}>
                    <SelectTrigger style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
                      <SelectItem value="local">{t('shipping.local')}</SelectItem>
                      <SelectItem value="national">{t('shipping.national')}</SelectItem>
                      <SelectItem value="international">{t('shipping.international')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{isRTL ? 'الهاتف' : 'Phone'}</Label>
                  <Input value={carrierForm.phone} onChange={(e) => setCarrierForm({ ...carrierForm, phone: e.target.value })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{isRTL ? 'البريد' : 'Email'}</Label>
                  <Input value={carrierForm.email} onChange={(e) => setCarrierForm({ ...carrierForm, email: e.target.value })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: COLORS.success }}>
                <DollarSign className="h-3 w-3" />
                {t('shipping.pricing')}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.basePrice')}</Label>
                  <Input type="number" value={carrierForm.basePrice} onChange={(e) => setCarrierForm({ ...carrierForm, basePrice: Number(e.target.value) })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.pricePerKg')}</Label>
                  <Input type="number" value={carrierForm.pricePerKg} onChange={(e) => setCarrierForm({ ...carrierForm, pricePerKg: Number(e.target.value) })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.maxWeight')}</Label>
                  <Input type="number" value={carrierForm.maxWeight} onChange={(e) => setCarrierForm({ ...carrierForm, maxWeight: Number(e.target.value) })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.estimatedDays')}</Label>
                  <Input type="number" value={carrierForm.estimatedDays} onChange={(e) => setCarrierForm({ ...carrierForm, estimatedDays: Number(e.target.value) })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.codFee')} (%)</Label>
                  <Input type="number" value={carrierForm.codFee} onChange={(e) => setCarrierForm({ ...carrierForm, codFee: Number(e.target.value) })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.codFixedFee')} (LYD)</Label>
                  <Input type="number" value={carrierForm.codFixedFee} onChange={(e) => setCarrierForm({ ...carrierForm, codFixedFee: Number(e.target.value) })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
              </div>
            </div>

            {/* API Integration */}
            <div>
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: COLORS.purple }}>
                <Globe className="h-3 w-3" />
                {t('shipping.apiIntegration')}
              </h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <Switch checked={carrierForm.isIntegrated} onCheckedChange={(checked) => setCarrierForm({ ...carrierForm, isIntegrated: checked })} />
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.isIntegrated')}</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.integrationType')}</Label>
                  <Select value={carrierForm.integrationType} onValueChange={(v) => setCarrierForm({ ...carrierForm, integrationType: v })}>
                    <SelectTrigger style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
                      <SelectItem value="manual">{t('shipping.manual')}</SelectItem>
                      <SelectItem value="api">{t('shipping.api')}</SelectItem>
                      <SelectItem value="webhook">{t('shipping.webhook')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {carrierForm.isIntegrated && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.apiEndpoint')}</Label>
                    <Input value={carrierForm.apiEndpoint} onChange={(e) => setCarrierForm({ ...carrierForm, apiEndpoint: e.target.value })} placeholder="https://api.carrier.com/v1" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.apiKey')}</Label>
                    <Input value={carrierForm.apiKey} onChange={(e) => setCarrierForm({ ...carrierForm, apiKey: e.target.value })} type="password" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.apiSecret')}</Label>
                    <Input value={carrierForm.apiSecret} onChange={(e) => setCarrierForm({ ...carrierForm, apiSecret: e.target.value })} type="password" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.webhookUrl')}</Label>
                    <Input value={carrierForm.webhookUrl} onChange={(e) => setCarrierForm({ ...carrierForm, webhookUrl: e.target.value })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.trackingUrl')}</Label>
                  <Input value={carrierForm.trackingUrl} onChange={(e) => setCarrierForm({ ...carrierForm, trackingUrl: e.target.value })} placeholder="https://carrier.com/track/{trackingNumber}" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                  <span className="text-[10px]" style={{ color: COLORS.muted }}>
                    {isRTL ? 'استخدم {trackingNumber} كمتغير' : 'Use {trackingNumber} as placeholder'}
                  </span>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: COLORS.muted }}>{isRTL ? 'الموقع الإلكتروني' : 'Website'}</Label>
                  <Input value={carrierForm.website} onChange={(e) => setCarrierForm({ ...carrierForm, website: e.target.value })} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs" style={{ color: COLORS.muted }}>{t('shipping.notes')}</Label>
              <Textarea value={carrierForm.notes} onChange={(e) => setCarrierForm({ ...carrierForm, notes: e.target.value })} rows={2} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCarrierDialog({ open: false, carrier: null })} style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: 'transparent' }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={saveCarrier} disabled={isSavingCarrier || !carrierForm.nameAr || !carrierForm.nameEn || !carrierForm.code} style={{ backgroundColor: COLORS.active, color: '#fff', border: 'none' }}>
              {isSavingCarrier ? t('common.loading') : carrierDialog.carrier ? t('common.save') : t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ DELETE CARRIER DIALOG ═══════════ */}
      <AlertDialog open={deleteCarrierDialog.open} onOpenChange={(open) => setDeleteCarrierDialog({ open, carrier: open ? deleteCarrierDialog.carrier : null })}>
        <AlertDialogContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: COLORS.text }}>{isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}</AlertDialogTitle>
            <AlertDialogDescription style={{ color: COLORS.muted }}>
              {isRTL
                ? `هل أنت متأكد من حذف شركة "${deleteCarrierDialog.carrier?.nameAr || ''}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete carrier "${deleteCarrierDialog.carrier?.nameEn || ''}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: 'transparent' }}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCarrier} style={{ backgroundColor: COLORS.danger, color: '#fff', border: 'none' }}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ═══════════ SHIPMENT STATUS UPDATE DIALOG ═══════════ */}
      <Dialog open={shipmentStatusDialog.open} onOpenChange={(open) => setShipmentStatusDialog({ open, shipment: open ? shipmentStatusDialog.shipment : null })}>
        <DialogContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: COLORS.text }}>{t('shipment.updateStatus')}</DialogTitle>
            <DialogDescription style={{ color: COLORS.muted }}>
              {shipmentStatusDialog.shipment && (
                <>{isRTL ? 'تحديث حالة الشحنة للطلب' : 'Update shipment status for order'} {shipmentStatusDialog.shipment.order?.orderNumber}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs" style={{ color: COLORS.muted }}>{isRTL ? 'الحالة الجديدة' : 'New Status'}</Label>
              <Select value={newShipmentStatus} onValueChange={setNewShipmentStatus}>
                <SelectTrigger style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}>
                  <SelectValue placeholder={isRTL ? 'اختر الحالة' : 'Select status'} />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
                  <SelectItem value="picked_up">{t('shipment.status.picked_up')}</SelectItem>
                  <SelectItem value="in_transit">{t('shipment.status.in_transit')}</SelectItem>
                  <SelectItem value="out_for_delivery">{t('shipment.status.out_for_delivery')}</SelectItem>
                  <SelectItem value="delivered">{t('shipment.status.delivered')}</SelectItem>
                  <SelectItem value="failed">{t('shipment.status.failed')}</SelectItem>
                  <SelectItem value="returned">{t('shipment.status.returned')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs" style={{ color: COLORS.muted }}>{isRTL ? 'الموقع' : 'Location'}</Label>
              <Input value={newShipmentLocation} onChange={(e) => setNewShipmentLocation(e.target.value)} placeholder={isRTL ? 'مثال: مستودع طرابلس' : 'e.g. Tripoli Warehouse'} style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShipmentStatusDialog({ open: false, shipment: null })} style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: 'transparent' }}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                if (shipmentStatusDialog.shipment && newShipmentStatus) {
                  shipmentStatusMutation.mutate({
                    id: shipmentStatusDialog.shipment.id,
                    status: newShipmentStatus,
                    location: newShipmentLocation,
                  });
                }
              }}
              disabled={!newShipmentStatus || shipmentStatusMutation.isPending}
              style={{ backgroundColor: COLORS.active, color: '#fff', border: 'none' }}
            >
              {shipmentStatusMutation.isPending ? t('common.loading') : t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <PrintDialog
        open={printDialog.open}
        onOpenChange={(open) => setPrintDialog({ ...printDialog, open })}
        type={printDialog.type}
        data={printDialog.data}
        defaultTemplate={printDialog.defaultTemplate as any}
      />
    </div>
  );
}
