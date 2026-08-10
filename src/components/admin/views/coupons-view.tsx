'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Tag, Plus, Pencil, Trash2, Search, Power } from 'lucide-react';
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
  type CouponsResponse,
  COLORS,
  PaginationControls,
} from '@/components/admin/shared';

// ─── Coupons View ────────────────────────────────────────────
export function CouponsView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponsResponse['coupons'][0] | null>(null);
  const [deleteCouponId, setDeleteCouponId] = useState<string | null>(null);

  const statusTabs = [
    { key: 'all', label: t('admin.all') },
    { key: 'active', label: t('admin.active') },
    { key: 'inactive', label: t('admin.inactive') },
    { key: 'expired', label: t('admin.expired') },
  ];

  const { data, isLoading } = useQuery<CouponsResponse & { summary: { totalCoupons: number; activeCoupons: number; totalUsageCount: number } }>({
    queryKey: ['admin-coupons', search, statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: statusFilter,
      });
      if (search) params.set('search', search);
      return authFetch(`/api/admin/coupons?${params}`).then((r) => r.json());
    },
  });

  // Create/Update coupon mutation
  const couponMutation = useMutation({
    mutationFn: async (couponData: Record<string, unknown>) => {
      const isEdit = !!couponData.id;
      const res = await authFetch('/api/admin/coupons', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save coupon');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowCouponDialog(false);
      setEditingCoupon(null);
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await authFetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle coupon');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  // Delete coupon mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch('/api/admin/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete coupon');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setDeleteCouponId(null);
    },
  });

  const openEditDialog = useCallback((coupon: CouponsResponse['coupons'][0]) => {
    setEditingCoupon(coupon);
    setShowCouponDialog(true);
  }, []);

  const openAddDialog = useCallback(() => {
    setEditingCoupon(null);
    setShowCouponDialog(true);
  }, []);

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const summary = data?.summary || { totalCoupons: 0, activeCoupons: 0, totalUsageCount: 0 };

  const statCards = [
    {
      label: t('admin.totalCoupons'),
      value: summary.totalCoupons.toString(),
      icon: <Tag className="h-5 w-5" />,
      color: COLORS.active,
    },
    {
      label: t('admin.activeCoupons'),
      value: summary.activeCoupons.toString(),
      icon: <Power className="h-5 w-5" />,
      color: COLORS.success,
    },
    {
      label: t('admin.totalUsage'),
      value: summary.totalUsageCount.toString(),
      icon: <Tag className="h-5 w-5" />,
      color: COLORS.purple,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group relative rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] cc-stat-card"
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
              <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>{card.value}</div>
              <div className="text-sm" style={{ color: COLORS.muted }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter + Add */}
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
            placeholder={t('admin.searchCouponsPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={language === 'ar' ? 'pr-10' : 'pl-10'}
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: statusFilter === tab.key ? `${COLORS.active}20` : COLORS.surface,
                color: statusFilter === tab.key ? COLORS.active : COLORS.muted,
                border: `1px solid ${statusFilter === tab.key ? `${COLORS.active}40` : COLORS.border}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button
          onClick={openAddDialog}
          className="shrink-0"
          style={{ backgroundColor: COLORS.active, color: '#fff' }}
        >
          <Plus className="h-4 w-4 me-2" />
          {t('admin.addCoupon')}
        </Button>
      </div>

      {/* Coupons Table */}
      <Card className="border overflow-hidden" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded animate-pulse" style={{ backgroundColor: COLORS.bg }} />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: COLORS.border }}>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.couponCode')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.couponType')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.couponValue')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.minOrder')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.couponUsage')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.expiryDate')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.status')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.coupons?.length === 0 ? (
                  <TableRow style={{ borderColor: COLORS.border }}>
                    <TableCell colSpan={8} className="text-center py-8" style={{ color: COLORS.muted }}>
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.coupons?.map((coupon) => {
                    const expired = isExpired(coupon.expiresAt);
                    return (
                      <TableRow key={coupon.id} style={{ borderColor: COLORS.border }}>
                        <TableCell>
                          <span className="font-mono text-sm font-bold" style={{ color: COLORS.active }}>
                            {coupon.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="text-xs"
                            style={{
                              backgroundColor: coupon.type === 'percentage' ? `${COLORS.purple}20` : `${COLORS.success}20`,
                              color: coupon.type === 'percentage' ? COLORS.purple : COLORS.success,
                              border: 'none',
                            }}
                          >
                            {coupon.type === 'percentage'
                              ? t('admin.percentage')
                              : t('admin.fixed')}
                          </Badge>
                        </TableCell>
                        <TableCell style={{ color: COLORS.text }}>
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value.toFixed(2)} ${t('product.currency')}`}
                        </TableCell>
                        <TableCell style={{ color: COLORS.text }}>
                          {coupon.minOrder > 0 ? `${coupon.minOrder.toFixed(2)}` : '—'}
                        </TableCell>
                        <TableCell style={{ color: COLORS.text }}>
                          {coupon.usageCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm" style={{ color: expired ? COLORS.danger : COLORS.muted }}>
                            {new Date(coupon.expiresAt).toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={coupon.isActive && !expired}
                              disabled={expired}
                              onCheckedChange={() => toggleMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                              className="shrink-0"
                            />
                            <span className="text-xs" style={{ color: expired ? COLORS.danger : coupon.isActive ? COLORS.success : COLORS.muted }}>
                              {expired ? t('admin.expired') : coupon.isActive ? t('admin.active') : t('admin.inactive')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" style={{ color: COLORS.active }} className="h-8" onClick={() => openEditDialog(coupon)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" style={{ color: COLORS.danger }} className="h-8" onClick={() => setDeleteCouponId(coupon.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && (
        <PaginationControls
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          hasPrev={data.pagination.hasPrev}
          hasNext={data.pagination.hasNext}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      )}

      {/* Coupon Form Dialog */}
      <CouponFormDialog
        open={showCouponDialog}
        onClose={() => { setShowCouponDialog(false); setEditingCoupon(null); }}
        coupon={editingCoupon}
        onSubmit={(d) => couponMutation.mutate(d)}
        isPending={couponMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCouponId} onOpenChange={() => setDeleteCouponId(null)}>
        <AlertDialogContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: COLORS.text }}>
              {t('admin.deleteCoupon')}
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: COLORS.muted }}>
              {t('admin.deleteCouponConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: COLORS.bg }}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCouponId && deleteMutation.mutate(deleteCouponId)}
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

// ─── Coupon Form Dialog ────────────────────────────────────
function CouponFormDialog({
  open,
  onClose,
  coupon,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  coupon: CouponsResponse['coupons'][0] | null;
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}) {
  const { t, language } = useLanguageStore();
  const isEdit = !!coupon;

  const getInitialForm = () => {
    if (coupon) {
      return {
        code: coupon.code,
        type: coupon.type,
        value: String(coupon.value),
        minOrder: String(coupon.minOrder),
        maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
        usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
        perUserLimit: String(coupon.perUserLimit),
        descriptionAr: coupon.descriptionAr || '',
        descriptionEn: coupon.descriptionEn || '',
        startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : '',
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '',
        isActive: coupon.isActive,
      };
    }
    return {
      code: '', type: 'percentage', value: '', minOrder: '0', maxDiscount: '',
      usageLimit: '', perUserLimit: '1', descriptionAr: '', descriptionEn: '',
      startsAt: '', expiresAt: '', isActive: true,
    };
  };

  const [form, setForm] = useState(getInitialForm);

  const [prevCoupon, setPrevCoupon] = useState(coupon);
  if (prevCoupon !== coupon) {
    setPrevCoupon(coupon);
    setForm(getInitialForm());
  }

  const handleSubmit = () => {
    const data: Record<string, unknown> = { ...form };
    if (isEdit && coupon) data.id = coupon.id;
    onSubmit(data);
  };

  const inputStyle = { backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text };
  const labelStyle = { color: COLORS.muted };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: COLORS.text }}>
            {isEdit ? t('admin.editCoupon') : t('admin.addCoupon')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {`${t('admin.couponCode')} *`}
            </label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} style={inputStyle} placeholder="SAVE20" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {`${t('admin.couponType')} *`}
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full h-9 rounded-md border px-3 text-sm"
              style={inputStyle}
            >
              <option value="percentage">{t('admin.percentage')}</option>
              <option value="fixed">{t('admin.fixed')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {`${t('admin.couponValue')} *`}
            </label>
            <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} style={inputStyle} placeholder={form.type === 'percentage' ? '20' : '10.00'} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('admin.minOrder')}
            </label>
            <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} style={inputStyle} placeholder="0" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('admin.maxDiscount')}
            </label>
            <Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} style={inputStyle} placeholder="50.00" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('admin.usageLimit')}
            </label>
            <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} style={inputStyle} placeholder={t('admin.unlimited')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('admin.perUserLimit')}
            </label>
            <Input type="number" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} style={inputStyle} placeholder="1" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {`${t('admin.startDate')} *`}
            </label>
            <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} style={inputStyle} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {`${t('admin.expiryDate')} *`}
            </label>
            <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} style={inputStyle} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('admin.descriptionAr')}
            </label>
            <Input value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} style={inputStyle} placeholder={t('admin.couponDescriptionPlaceholder')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {t('admin.descriptionEn')}
            </label>
            <Input value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} style={inputStyle} placeholder="Coupon description" />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2 pt-2">
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            <span className="text-sm" style={{ color: COLORS.text }}>{t('admin.active')}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: COLORS.bg }}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !form.code || !form.value || !form.startsAt || !form.expiresAt}
            style={{ backgroundColor: COLORS.active, color: '#fff' }}
          >
            {isPending ? t('common.loading') : isEdit ? t('common.save') : t('common.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
