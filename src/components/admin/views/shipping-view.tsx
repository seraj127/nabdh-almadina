'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  Ship,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Search,
  Globe,
  Phone,
  Hash,
  FileText,
  ExternalLink,
  Banknote,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
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
  COLORS,
  LoadingSkeleton,
  ErrorDisplay,
} from '@/components/admin/shared';

// ─── Types ────────────────────────────────────────────────────
interface ShippingCompany {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  apiEndpoint: string | null;
  apiKey: string | null;
  apiSecret: string | null;
  trackingUrl: string | null;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  baseFee: number;
  weightLimit: number | null;
  codSupported: boolean;
  codFee: number;
  coverageType: string;
  totalDeliveries: number;
  successRate: number;
  avgDeliveryDays: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    coverageZones: number;
    orders: number;
  };
}

interface CoverageZone {
  id: string;
  companyId: string;
  regionId: string | null;
  regionNameAr: string | null;
  cityName: string;
  areaName: string | null;
  fee: number;
  estimatedDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Region Options ───────────────────────────────────────────
const REGION_OPTIONS = [
  { id: 'central', nameAr: 'الوسطى', nameEn: 'Central' },
  { id: 'western', nameAr: 'الغربية', nameEn: 'Western' },
  { id: 'eastern', nameAr: 'الشرقية', nameEn: 'Eastern' },
  { id: 'mountain-south', nameAr: 'الجبل الغربي / الجنوبية', nameEn: 'Mountain South' },
];

// ─── Shipping View ────────────────────────────────────────────
export function ShippingView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ShippingCompany | null>(null);
  const [deleteCompanyId, setDeleteCompanyId] = useState<string | null>(null);
  const [showZoneDialog, setShowZoneDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<CoverageZone | null>(null);
  const [deleteZoneInfo, setDeleteZoneInfo] = useState<{ companyId: string; zoneId: string } | null>(null);

  // ─── Fetch companies ────────────────────────────────────────
  const { data: companiesData, isLoading, error } = useQuery({
    queryKey: ['shipping-companies'],
    queryFn: () => authFetch('/api/shipping-companies').then((r) => r.json()),
  });

  // ─── Fetch zones for expanded company ───────────────────────
  const { data: zonesData, isLoading: zonesLoading } = useQuery({
    queryKey: ['shipping-zones', expandedCompanyId],
    queryFn: () => authFetch(`/api/shipping-companies/${expandedCompanyId}/zones`).then((r) => r.json()),
    enabled: !!expandedCompanyId,
  });

  const companies: ShippingCompany[] = companiesData?.companies || [];
  const zones: CoverageZone[] = zonesData?.zones || [];

  // ─── Filter by search ───────────────────────────────────────
  const filtered = companies.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.nameAr.includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q)
    );
  });

  // ─── Stats ──────────────────────────────────────────────────
  const activeCount = companies.filter((c) => c.isActive).length;
  const totalZones = companies.reduce((acc, c) => acc + c._count.coverageZones, 0);
  const avgDays =
    companies.length > 0
      ? (companies.reduce((acc, c) => acc + (c.avgDeliveryDays || 0), 0) / companies.length).toFixed(1)
      : '0';
  const codCount = companies.filter((c) => c.codSupported).length;

  const statCards = [
    {
      label: t('admin.activeShippingCompanies'),
      value: activeCount?.toString() || '0',
      icon: <Ship className="h-5 w-5" />,
      color: COLORS.active,
    },
    {
      label: t('admin.totalCoverageZones'),
      value: totalZones?.toString() || '0',
      icon: <MapPin className="h-5 w-5" />,
      color: COLORS.success,
    },
    {
      label: t('admin.avgDeliveryDays'),
      value: avgDays,
      icon: <Clock className="h-5 w-5" />,
      color: COLORS.warning,
    },
    {
      label: t('shipping.codSupport'),
      value: codCount?.toString() || '0',
      icon: <Banknote className="h-5 w-5" />,
      color: COLORS.purple,
    },
  ];

  // ─── Company mutations ──────────────────────────────────────
  const companyMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const isEdit = !!data.id;
      const url = isEdit ? `/api/shipping-companies/${data.id}` : '/api/shipping-companies';
      const res = await authFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save company');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-companies'] });
      setShowCompanyDialog(false);
      setEditingCompany(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await authFetch(`/api/shipping-companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-companies'] });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch(`/api/shipping-companies/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete company');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-companies'] });
      setDeleteCompanyId(null);
      if (expandedCompanyId === deleteCompanyId) setExpandedCompanyId(null);
    },
  });

  // ─── Zone mutations ─────────────────────────────────────────
  const zoneMutation = useMutation({
    mutationFn: async (data: Record<string, unknown> & { companyId: string }) => {
      const { companyId, ...body } = data;
      const isEdit = !!body.id;
      const url = isEdit
        ? `/api/shipping-companies/${companyId}/zones/${body.id}`
        : `/api/shipping-companies/${companyId}/zones`;
      const res = await authFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save zone');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones', expandedCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['shipping-companies'] });
      setShowZoneDialog(false);
      setEditingZone(null);
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async ({ companyId, zoneId }: { companyId: string; zoneId: string }) => {
      const res = await authFetch(`/api/shipping-companies/${companyId}/zones/${zoneId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete zone');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-zones', expandedCompanyId] });
      queryClient.invalidateQueries({ queryKey: ['shipping-companies'] });
      setDeleteZoneInfo(null);
    },
  });

  // ─── Handlers ───────────────────────────────────────────────
  const openEditCompanyDialog = useCallback((company: ShippingCompany) => {
    setEditingCompany(company);
    setShowCompanyDialog(true);
  }, []);

  const openAddCompanyDialog = useCallback(() => {
    setEditingCompany(null);
    setShowCompanyDialog(true);
  }, []);

  const openAddZoneDialog = useCallback(() => {
    setEditingZone(null);
    setShowZoneDialog(true);
  }, []);

  const openEditZoneDialog = useCallback((zone: CoverageZone) => {
    setEditingZone(zone);
    setShowZoneDialog(true);
  }, []);

  const toggleExpand = useCallback(
    (id: string) => {
      setExpandedCompanyId((prev) => (prev === id ? null : id));
    },
    []
  );

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={String(error)} />;

  return (
    <div className="space-y-6">
      {/* ─── Stats Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group relative rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          >
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: `0 0 20px ${card.color}20, 0 0 40px ${card.color}10` }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}20`, color: card.color }}
                >
                  {card.icon}
                </div>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>
                {card.value}
              </div>
              <div className="text-sm" style={{ color: COLORS.muted }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search + Add ─────────────────────────────────────── */}
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
            placeholder={t('admin.searchShippingCompanies')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={language === 'ar' ? 'pr-10' : 'pl-10'}
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
          />
        </div>
        <Button
          onClick={openAddCompanyDialog}
          className="shrink-0"
          style={{ backgroundColor: COLORS.active, color: '#fff' }}
        >
          <Plus className="h-4 w-4 me-2" />
          {t('admin.addShippingCompany')}
        </Button>
      </div>

      {/* ─── Companies List ───────────────────────────────────── */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl border"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            }}
          >
            <Ship className="h-8 w-8" style={{ color: COLORS.muted }} />
            <p className="text-sm" style={{ color: COLORS.muted }}>
              {search
                ? t('common.noResults')
                : t('admin.noShippingCompanies')}
            </p>
          </div>
        ) : (
          filtered.map((company) => {
            const isExpanded = expandedCompanyId === company.id;
            return (
              <Card
                key={company.id}
                className="border overflow-hidden transition-all duration-300"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
              >
                <CardContent className="p-0">
                  {/* Company Header */}
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Logo + Name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                          style={{
                            backgroundColor: company.isActive
                              ? `${COLORS.active}20`
                              : `${COLORS.muted}20`,
                          }}
                        >
                          {company.logo || '🚚'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm" style={{ color: COLORS.text }}>
                              {language === 'ar' ? company.nameAr : company.nameEn}
                            </span>
                            <span className="text-xs" style={{ color: COLORS.muted }}>
                              ({company.slug})
                            </span>
                            {company.isDefault && (
                              <Badge
                                className="text-[10px] px-1.5 py-0"
                                style={{
                                  backgroundColor: `${COLORS.warning}20`,
                                  color: COLORS.warning,
                                  border: 'none',
                                }}
                              >
                                {t('common.default')}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                            {language === 'en' ? company.nameAr : company.nameEn}
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Coverage Type */}
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor:
                              company.coverageType === 'all'
                                ? `${COLORS.success}20`
                                : `${COLORS.orange}20`,
                            color:
                              company.coverageType === 'all'
                                ? COLORS.success
                                : COLORS.orange,
                            border: 'none',
                          }}
                        >
                          {company.coverageType === 'all'
                            ? t('shipping.allCoverage')
                            : t('shipping.regional')}
                        </Badge>

                        {/* COD */}
                        {company.codSupported && (
                          <Badge
                            className="text-xs"
                            style={{
                              backgroundColor: `${COLORS.purple}20`,
                              color: COLORS.purple,
                              border: 'none',
                            }}
                          >
                            {t('shipping.codBadge')}
                          </Badge>
                        )}

                        {/* Zones Count */}
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: `${COLORS.active}20`,
                            color: COLORS.active,
                            border: 'none',
                          }}
                        >
                          <MapPin className="h-3 w-3 me-1 inline" />
                          {company._count.coverageZones} {t('shipping.zones')}
                        </Badge>
                      </div>

                      {/* Fee Info */}
                      <div className="flex items-center gap-4 text-xs shrink-0">
                        <div className="flex flex-col items-center">
                          <span style={{ color: COLORS.muted }}>
                            {t('shipping.fee')}
                          </span>
                          <span className="font-bold" style={{ color: COLORS.text }}>
                            {Number(company.baseFee).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span style={{ color: COLORS.muted }}>
                            {t('shipping.days')}
                          </span>
                          <span className="font-bold" style={{ color: COLORS.text }}>
                            {company.avgDeliveryDays}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle Active */}
                        <button
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: company.id,
                              isActive: !company.isActive,
                            })
                          }
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: company.isActive ? COLORS.success : COLORS.muted }}
                          title={
                            company.isActive
                              ? t('admin.deactivate')
                              : t('admin.activate')
                          }
                        >
                          {company.isActive ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>

                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: COLORS.active }}
                          className="h-8"
                          onClick={() => openEditCompanyDialog(company)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: COLORS.danger }}
                          className="h-8"
                          onClick={() => setDeleteCompanyId(company.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>

                        {/* Expand */}
                        <button
                          onClick={() => toggleExpand(company.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{
                            color: isExpanded ? COLORS.active : COLORS.muted,
                            backgroundColor: isExpanded ? `${COLORS.active}15` : 'transparent',
                          }}
                          title={t('admin.viewZones')}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ─── Expanded: Zones Table ───────────────────── */}
                  {isExpanded && (
                    <div
                      className="border-t"
                      style={{ borderColor: COLORS.border, backgroundColor: COLORS.bg }}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4
                            className="text-sm font-bold flex items-center gap-2"
                            style={{ color: COLORS.text }}
                          >
                            <MapPin className="h-4 w-4" style={{ color: COLORS.active }} />
                            {t('admin.coverageZones')}
                          </h4>
                          <Button
                            size="sm"
                            onClick={openAddZoneDialog}
                            style={{ backgroundColor: COLORS.active, color: '#fff' }}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 me-1" />
                            {t('admin.addZone')}
                          </Button>
                        </div>

                        {zonesLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-10 rounded animate-pulse"
                                style={{ backgroundColor: COLORS.surface }}
                              />
                            ))}
                          </div>
                        ) : zones.length === 0 ? (
                          <p className="text-center py-6 text-sm" style={{ color: COLORS.muted }}>
                            {t('admin.noCoverageZonesForCompany')}
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow style={{ borderColor: COLORS.border }}>
                                  <TableHead style={{ color: COLORS.muted }}>
                                    {t('shipping.region')}
                                  </TableHead>
                                  <TableHead style={{ color: COLORS.muted }}>
                                    {t('shipping.city')}
                                  </TableHead>
                                  <TableHead style={{ color: COLORS.muted }}>
                                    {t('shipping.area')}
                                  </TableHead>
                                  <TableHead style={{ color: COLORS.muted }}>
                                    {t('shipping.fee')}
                                  </TableHead>
                                  <TableHead style={{ color: COLORS.muted }}>
                                    {t('shipping.estDays')}
                                  </TableHead>
                                  <TableHead style={{ color: COLORS.muted }}>
                                    {t('admin.actions')}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {zones.map((zone) => (
                                  <TableRow key={zone.id} style={{ borderColor: COLORS.border }}>
                                    <TableCell style={{ color: COLORS.text }}>
                                      {zone.regionNameAr || zone.regionId || '—'}
                                    </TableCell>
                                    <TableCell style={{ color: COLORS.text }}>
                                      {zone.cityName}
                                    </TableCell>
                                    <TableCell style={{ color: COLORS.muted }}>
                                      {zone.areaName || '—'}
                                    </TableCell>
                                    <TableCell style={{ color: COLORS.text }}>
                                      {Number(zone.fee).toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <Clock
                                          className="h-3 w-3"
                                          style={{ color: COLORS.muted }}
                                        />
                                        <span style={{ color: COLORS.text }}>
                                          {zone.estimatedDays}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          style={{ color: COLORS.active }}
                                          className="h-7"
                                          onClick={() => openEditZoneDialog(zone)}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          style={{ color: COLORS.danger }}
                                          className="h-7"
                                          onClick={() =>
                                            setDeleteZoneInfo({
                                              companyId: company.id,
                                              zoneId: zone.id,
                                            })
                                          }
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ─── Company Form Dialog ──────────────────────────────── */}
      <CompanyFormDialog
        open={showCompanyDialog}
        onClose={() => {
          setShowCompanyDialog(false);
          setEditingCompany(null);
        }}
        company={editingCompany}
        onSubmit={(d) => companyMutation.mutate(d)}
        isPending={companyMutation.isPending}
      />

      {/* ─── Zone Form Dialog ─────────────────────────────────── */}
      <ZoneFormDialog
        open={showZoneDialog}
        onClose={() => {
          setShowZoneDialog(false);
          setEditingZone(null);
        }}
        zone={editingZone}
        companyId={expandedCompanyId || ''}
        onSubmit={(d) => zoneMutation.mutate(d)}
        isPending={zoneMutation.isPending}
      />

      {/* ─── Delete Company Confirmation ──────────────────────── */}
      <AlertDialog open={!!deleteCompanyId} onOpenChange={() => setDeleteCompanyId(null)}>
        <AlertDialogContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: COLORS.text }}>
              {t('admin.deleteShippingCompany')}
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: COLORS.muted }}>
              {t('admin.confirmDeleteCarrier')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                borderColor: COLORS.border,
                color: COLORS.text,
                backgroundColor: COLORS.bg,
              }}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCompanyId && deleteCompanyMutation.mutate(deleteCompanyId)}
              style={{ backgroundColor: COLORS.danger, color: '#fff' }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Delete Zone Confirmation ─────────────────────────── */}
      <AlertDialog open={!!deleteZoneInfo} onOpenChange={() => setDeleteZoneInfo(null)}>
        <AlertDialogContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: COLORS.text }}>
              {t('admin.deleteCoverageZone')}
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: COLORS.muted }}>
              {t('admin.confirmDeleteZone')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                borderColor: COLORS.border,
                color: COLORS.text,
                backgroundColor: COLORS.bg,
              }}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteZoneInfo &&
                deleteZoneMutation.mutate(deleteZoneInfo)
              }
              style={{ backgroundColor: COLORS.danger, color: '#fff' }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Company Form Dialog ──────────────────────────────────────
function CompanyFormDialog({
  open,
  onClose,
  company,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  company: ShippingCompany | null;
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}) {
  const { t, language } = useLanguageStore();
  const isEdit = !!company;

  const getInitialForm = () => {
    if (company) {
      return {
        nameAr: company.nameAr,
        nameEn: company.nameEn,
        slug: company.slug,
        logo: company.logo || '',
        phone: company.phone || '',
        descriptionAr: company.descriptionAr || '',
        coverageType: company.coverageType,
        baseFee: String(company.baseFee),
        codSupported: company.codSupported,
        codFee: String(company.codFee),
        trackingUrl: company.trackingUrl || '',
        avgDeliveryDays: String(company.avgDeliveryDays),
        isDefault: company.isDefault,
        isActive: company.isActive,
        sortOrder: String(company.sortOrder),
      };
    }
    return {
      nameAr: '',
      nameEn: '',
      slug: '',
      logo: '🚚',
      phone: '',
      descriptionAr: '',
      coverageType: 'all',
      baseFee: '0',
      codSupported: true,
      codFee: '0',
      trackingUrl: '',
      avgDeliveryDays: '3',
      isDefault: false,
      isActive: true,
      sortOrder: '0',
    };
  };

  const [form, setForm] = useState(getInitialForm);

  const [prevCompany, setPrevCompany] = useState(company);
  if (prevCompany !== company) {
    setPrevCompany(company);
    setForm(getInitialForm());
  }

  const handleSubmit = () => {
    const data: Record<string, unknown> = {
      ...form,
      baseFee: parseFloat(form.baseFee) || 0,
      codFee: parseFloat(form.codFee) || 0,
      avgDeliveryDays: parseInt(form.avgDeliveryDays) || 3,
      sortOrder: parseInt(form.sortOrder) || 0,
    };
    if (isEdit && company) data.id = company.id;
    onSubmit(data);
  };

  const inputStyle = {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    color: COLORS.text,
  };
  const labelStyle = { color: COLORS.muted };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: COLORS.text }}>
            {isEdit
              ? t('admin.editShippingCompany')
              : t('admin.addShippingCompany')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {/* nameAr */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5" style={labelStyle}>
              <Globe className="h-3.5 w-3.5" />
              {t('shipping.nameAr')}
            </label>
            <Input
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              style={inputStyle}
              placeholder="شركة الشحن السريع"
            />
          </div>

          {/* nameEn */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5" style={labelStyle}>
              <Globe className="h-3.5 w-3.5" />
              {t('shipping.nameEn')}
            </label>
            <Input
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              style={inputStyle}
              placeholder="Express Shipping Co."
            />
          </div>

          {/* slug */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5" style={labelStyle}>
              <Hash className="h-3.5 w-3.5" />
              {t('shipping.slug')}
            </label>
            <Input
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
              }
              style={inputStyle}
              placeholder="express-shipping"
            />
          </div>

          {/* logo */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('shipping.logoEmoji')}
            </label>
            <Input
              value={form.logo}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              style={inputStyle}
              placeholder="🚚"
              className="text-center text-2xl"
              maxLength={4}
            />
          </div>

          {/* phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5" style={labelStyle}>
              <Phone className="h-3.5 w-3.5" />
              {t('shipping.phone')}
            </label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
              placeholder="091 2345678"
            />
          </div>

          {/* coverageType */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('shipping.coverageType')}
            </label>
            <select
              value={form.coverageType}
              onChange={(e) => setForm({ ...form, coverageType: e.target.value })}
              className="w-full h-9 rounded-md border px-3 text-sm"
              style={inputStyle}
            >
              <option value="all">
                {t('shipping.allCoverageNationwide')}
              </option>
              <option value="regional">
                {t('shipping.regionalCoverage')}
              </option>
            </select>
          </div>

          {/* baseFee */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5" style={labelStyle}>
              <DollarSign className="h-3.5 w-3.5" />
              {t('shipping.baseFee')}
            </label>
            <Input
              type="number"
              value={form.baseFee}
              onChange={(e) => setForm({ ...form, baseFee: e.target.value })}
              style={inputStyle}
              placeholder="0"
            />
          </div>

          {/* codSupported */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('shipping.codFee')}
            </label>
            <Input
              type="number"
              value={form.codFee}
              onChange={(e) => setForm({ ...form, codFee: e.target.value })}
              style={inputStyle}
              placeholder="0"
              disabled={!form.codSupported}
            />
          </div>

          {/* avgDeliveryDays */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5" style={labelStyle}>
              <Clock className="h-3.5 w-3.5" />
              {t('shipping.avgDeliveryDays')}
            </label>
            <Input
              type="number"
              value={form.avgDeliveryDays}
              onChange={(e) => setForm({ ...form, avgDeliveryDays: e.target.value })}
              style={inputStyle}
              placeholder="3"
            />
          </div>

          {/* trackingUrl */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium flex items-center gap-1.5" style={labelStyle}>
              <ExternalLink className="h-3.5 w-3.5" />
              {t('shipping.trackingUrl')}
            </label>
            <Input
              value={form.trackingUrl}
              onChange={(e) => setForm({ ...form, trackingUrl: e.target.value })}
              style={inputStyle}
              placeholder="https://track.example.com/{trackingNumber}"
              dir="ltr"
            />
          </div>

          {/* descriptionAr */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium flex items-center gap-1.5" style={labelStyle}>
              <FileText className="h-3.5 w-3.5" />
              {t('shipping.descriptionAr')}
            </label>
            <Input
              value={form.descriptionAr}
              onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
              style={inputStyle}
              placeholder={t('shipping.companyDescArPlaceholder')}
            />
          </div>

          {/* sortOrder */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('shipping.sortOrder')}
            </label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              style={inputStyle}
              placeholder="0"
            />
          </div>

          {/* Switches */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={form.codSupported}
                onCheckedChange={(v) => setForm({ ...form, codSupported: v })}
              />
              <span className="text-sm" style={{ color: COLORS.text }}>
                {t('shipping.codSupported')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isDefault}
                onCheckedChange={(v) => setForm({ ...form, isDefault: v })}
              />
              <span className="text-sm" style={{ color: COLORS.text }}>
                {t('shipping.defaultCompany')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <span className="text-sm" style={{ color: COLORS.text }}>
                {t('admin.active')}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            style={{
              borderColor: COLORS.border,
              color: COLORS.text,
              backgroundColor: COLORS.bg,
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !form.nameAr || !form.nameEn || !form.slug}
            style={{ backgroundColor: COLORS.active, color: '#fff' }}
          >
            {isPending
              ? t('common.loading')
              : isEdit
                ? t('common.save')
                : t('common.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Zone Form Dialog ─────────────────────────────────────────
function ZoneFormDialog({
  open,
  onClose,
  zone,
  companyId,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  zone: CoverageZone | null;
  companyId: string;
  onSubmit: (data: Record<string, unknown> & { companyId: string }) => void;
  isPending: boolean;
}) {
  const { t, language } = useLanguageStore();
  const isEdit = !!zone;

  const getInitialForm = () => {
    if (zone) {
      return {
        regionId: zone.regionId || '',
        cityName: zone.cityName,
        areaName: zone.areaName || '',
        fee: String(zone.fee),
        estimatedDays: String(zone.estimatedDays),
      };
    }
    return {
      regionId: 'central',
      cityName: '',
      areaName: '',
      fee: '0',
      estimatedDays: '3',
    };
  };

  const [form, setForm] = useState(getInitialForm);

  const [prevZone, setPrevZone] = useState(zone);
  if (prevZone !== zone) {
    setPrevZone(zone);
    setForm(getInitialForm());
  }

  const handleSubmit = () => {
    const data: Record<string, unknown> & { companyId: string } = {
      companyId,
      regionId: form.regionId || null,
      regionNameAr:
        REGION_OPTIONS.find((r) => r.id === form.regionId)?.nameAr || null,
      cityName: form.cityName,
      areaName: form.areaName || null,
      fee: parseFloat(form.fee) || 0,
      estimatedDays: parseInt(form.estimatedDays) || 3,
    };
    if (isEdit && zone) data.id = zone.id;
    onSubmit(data);
  };

  const inputStyle = {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.border,
    color: COLORS.text,
  };
  const labelStyle = { color: COLORS.muted };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: COLORS.text }}>
            {isEdit
              ? t('admin.editCoverageZone')
              : t('admin.addCoverageZone')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {/* regionId */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('shipping.region')}
            </label>
            <select
              value={form.regionId}
              onChange={(e) => setForm({ ...form, regionId: e.target.value })}
              className="w-full h-9 rounded-md border px-3 text-sm"
              style={inputStyle}
            >
              {REGION_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {language === 'ar' ? r.nameAr : r.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* cityName */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('shipping.cityRequired')}
            </label>
            <Input
              value={form.cityName}
              onChange={(e) => setForm({ ...form, cityName: e.target.value })}
              style={inputStyle}
              placeholder={t('shipping.tripoliPlaceholder')}
            />
          </div>

          {/* areaName */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('shipping.areaOptional')}
            </label>
            <Input
              value={form.areaName}
              onChange={(e) => setForm({ ...form, areaName: e.target.value })}
              style={inputStyle}
              placeholder={t('shipping.touristAreaPlaceholder')}
            />
          </div>

          {/* fee */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('shipping.fee')}
            </label>
            <Input
              type="number"
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: e.target.value })}
              style={inputStyle}
              placeholder="0"
            />
          </div>

          {/* estimatedDays */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('shipping.estimatedDays')}
            </label>
            <Input
              type="number"
              value={form.estimatedDays}
              onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
              style={inputStyle}
              placeholder="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            style={{
              borderColor: COLORS.border,
              color: COLORS.text,
              backgroundColor: COLORS.bg,
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !form.cityName}
            style={{ backgroundColor: COLORS.active, color: '#fff' }}
          >
            {isPending
              ? t('common.loading')
              : isEdit
                ? t('common.save')
                : t('common.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ShippingView;
