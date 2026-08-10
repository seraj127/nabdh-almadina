'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package, AlertTriangle, XCircle, ArrowUpDown, Plus,
  Search, TrendingUp, TrendingDown, RefreshCw, Loader2,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  COLORS,
  LoadingSkeleton,
  ErrorDisplay,
  PaginationControls,
} from '@/components/admin/shared';

// ─── Types ────────────────────────────────────────────────────
interface MovementRow {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reference: string | null;
  note: string | null;
  createdAt: string;
  product: {
    id: string;
    nameAr: string;
    nameEn: string;
    sku: string;
    stock: number;
    price: number;
    mainImage: string | null;
  };
}

interface InventoryResponse {
  movements: MovementRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    movementsToday: number;
    totalStockValue: number;
  };
}

interface ProductsListResponse {
  products: {
    id: string;
    nameAr: string;
    nameEn: string;
    sku: string;
    stock: number;
    price: number;
  }[];
}

// ─── Movement type config ─────────────────────────────────────
const MOVEMENT_TYPE_CONFIG: Record<string, { labelKey: string; color: string; icon: React.ReactNode }> = {
  in: { labelKey: 'admin.movementTypeIn', color: COLORS.success, icon: <TrendingUp className="h-3.5 w-3.5" /> },
  out: { labelKey: 'admin.movementTypeOut', color: COLORS.danger, icon: <TrendingDown className="h-3.5 w-3.5" /> },
  reservation: { labelKey: 'admin.reservation', color: COLORS.warning, icon: <Package className="h-3.5 w-3.5" /> },
  release: { labelKey: 'admin.movementTypeRelease', color: COLORS.active, icon: <RefreshCw className="h-3.5 w-3.5" /> },
  adjustment: { labelKey: 'admin.adjustment', color: COLORS.purple, icon: <ArrowUpDown className="h-3.5 w-3.5" /> },
  return: { labelKey: 'admin.return', color: COLORS.orange, icon: <RefreshCw className="h-3.5 w-3.5" /> },
};

// ─── Create form ──────────────────────────────────────────────
interface CreateForm {
  productId: string;
  type: string;
  quantity: string;
  reference: string;
  note: string;
}

const EMPTY_FORM: CreateForm = {
  productId: '',
  type: 'in',
  quantity: '',
  reference: '',
  note: '',
};

// ─── Inventory View ───────────────────────────────────────────
export function InventoryView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_FORM);
  const [productSearch, setProductSearch] = useState('');

  // ─── Data fetching ──────────────────────────────────────────
  const { data, isLoading, error } = useQuery<InventoryResponse>({
    queryKey: ['admin-inventory', search, typeFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '15' });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      return authFetch(`/api/admin/inventory?${params}`).then((r) => r.json());
    },
  });

  // Products list for the create dialog
  const { data: productsData } = useQuery<ProductsListResponse>({
    queryKey: ['admin-products-quick', productSearch],
    queryFn: () => {
      const params = new URLSearchParams({ page: '1', limit: '20' });
      if (productSearch) params.set('search', productSearch);
      return authFetch(`/api/admin/products?${params}`).then((r) => r.json());
    },
    enabled: showCreateDialog,
  });

  // ─── Create mutation ────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (form: CreateForm) => {
      const res = await authFetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: form.productId,
          type: form.type,
          quantity: parseInt(form.quantity),
          reference: form.reference || null,
          note: form.note || null,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      setShowCreateDialog(false);
      setCreateForm(EMPTY_FORM);
      setProductSearch('');
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={String(error)} />;

  const summary = data?.summary ?? { totalProducts: 0, lowStockCount: 0, outOfStockCount: 0, movementsToday: 0, totalStockValue: 0 };

  const statCards = [
    { label: t('admin.totalProducts'), value: summary.totalProducts.toString(), icon: <Package className="h-5 w-5" />, color: COLORS.active },
    { label: t('admin.lowStock'), value: summary.lowStockCount.toString(), icon: <AlertTriangle className="h-5 w-5" />, color: COLORS.warning },
    { label: t('admin.outOfStock'), value: summary.outOfStockCount.toString(), icon: <XCircle className="h-5 w-5" />, color: COLORS.danger },
    { label: t('admin.stockValue'), value: `${summary.totalStockValue.toFixed(0)} ${t('product.currency')}`, icon: <TrendingUp className="h-5 w-5" />, color: COLORS.success },
  ];

  const typeFilterOptions = [
    { key: '', label: t('admin.all') },
    ...Object.entries(MOVEMENT_TYPE_CONFIG).map(([key, val]) => ({
      key,
      label: t(val.labelKey),
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
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
              <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>{card.value}</div>
              <div className="text-sm" style={{ color: COLORS.muted }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter + Create */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: COLORS.muted, [language === 'ar' ? 'right' : 'left']: '12px' }}
          />
          <Input
            placeholder={t('admin.searchInventory')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={language === 'ar' ? 'pr-10' : 'pl-10'}
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {typeFilterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setTypeFilter(opt.key); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: typeFilter === opt.key ? `${COLORS.active}20` : COLORS.surface,
                color: typeFilter === opt.key ? COLORS.active : COLORS.muted,
                border: `1px solid ${typeFilter === opt.key ? `${COLORS.active}40` : COLORS.border}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          onClick={() => { setCreateForm(EMPTY_FORM); setProductSearch(''); setShowCreateDialog(true); }}
          className="gap-1.5 shrink-0"
          style={{ backgroundColor: COLORS.active, color: '#fff' }}
        >
          <Plus className="h-4 w-4" />
          {t('admin.stockMovement')}
        </Button>
      </div>

      {/* Movements List */}
      <Card className="border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
              <Package className="h-4 w-4" style={{ color: COLORS.active }} />
              {t('admin.inventoryMovements')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="text-xs" style={{ backgroundColor: `${COLORS.active}20`, color: COLORS.active, border: 'none' }}>
                {data?.pagination?.total ?? 0} {t('admin.movement')}
              </Badge>
              {summary.movementsToday > 0 && (
                <Badge className="text-xs" style={{ backgroundColor: `${COLORS.success}20`, color: COLORS.success, border: 'none' }}>
                  +{summary.movementsToday} {t('admin.today')}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(data?.movements ?? []).length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-3" style={{ color: COLORS.muted }} />
              <p className="text-sm" style={{ color: COLORS.muted }}>
                {t('admin.noInventoryMovements')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${COLORS.border} transparent` }}>
              {(data?.movements ?? []).map((mov) => {
                const typeConf = MOVEMENT_TYPE_CONFIG[mov.type] || MOVEMENT_TYPE_CONFIG.adjustment;
                return (
                  <div
                    key={mov.id}
                    className="flex items-center gap-3 p-4 rounded-xl border transition-all duration-200"
                    style={{ backgroundColor: `${typeConf.color}05`, borderColor: `${typeConf.color}25` }}
                  >
                    {/* Type icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${typeConf.color}15`, color: typeConf.color }}
                    >
                      {typeConf.icon}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium truncate" style={{ color: COLORS.text }}>
                          {language === 'ar' ? mov.product.nameAr : mov.product.nameEn}
                        </span>
                        <Badge
                          className="text-[10px] shrink-0"
                          style={{ backgroundColor: `${typeConf.color}20`, color: typeConf.color, border: 'none' }}
                        >
                          {t(typeConf.labelKey)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: COLORS.muted }}>
                        <span className="font-mono">{mov.product.sku}</span>
                        <span>{mov.quantity} {t('admin.units')}</span>
                        {mov.reference && <span>#{mov.reference}</span>}
                        {mov.note && <span className="truncate">— {mov.note}</span>}
                      </div>
                    </div>

                    {/* Stock info */}
                    <div className="text-end shrink-0">
                      <div className="text-sm font-bold" style={{ color: COLORS.text }}>
                        {mov.product.stock} {t('admin.inStock')}
                      </div>
                      <div className="text-xs" style={{ color: COLORS.muted }}>
                        {mov.product.price.toFixed(2)} {t('product.currency')}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-xs shrink-0" style={{ color: COLORS.muted }}>
                      {new Date(mov.createdAt).toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
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

      {/* ═══════════════════════════════════════════════════════════
          CREATE INVENTORY MOVEMENT DIALOG
          ═══════════════════════════════════════════════════════════ */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) setShowCreateDialog(false); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: COLORS.text }}>
              <Package className="h-5 w-5" style={{ color: COLORS.active }} />
              {t('admin.newStockMovement')}
            </DialogTitle>
            <DialogDescription style={{ color: COLORS.muted }}>
              {t('admin.enterStockMovementDetails')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Search */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>
                {t('admin.product')} <span style={{ color: COLORS.danger }}>*</span>
              </Label>
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={t('admin.searchProduct')}
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
              />
              <Select value={createForm.productId} onValueChange={(v) => setCreateForm((f) => ({ ...f, productId: v }))}>
                <SelectTrigger className="w-full" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}>
                  <SelectValue placeholder={t('admin.selectProduct')} />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
                  {(productsData?.products ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id} style={{ color: COLORS.text }}>
                      {language === 'ar' ? p.nameAr : p.nameEn} ({p.sku}) — {t('admin.stock')}: {p.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Movement Type */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>{t('admin.movementType')}</Label>
              <Select value={createForm.type} onValueChange={(v) => setCreateForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="w-full" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
                  {Object.entries(MOVEMENT_TYPE_CONFIG).map(([key, val]) => (
                    <SelectItem key={key} value={key} style={{ color: COLORS.text }}>
                      {t(val.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>
                {t('admin.quantity')} <span style={{ color: COLORS.danger }}>*</span>
              </Label>
              <Input
                type="number"
                min="1"
                value={createForm.quantity}
                onChange={(e) => setCreateForm((f) => ({ ...f, quantity: e.target.value }))}
                placeholder="0"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
                dir="ltr"
              />
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>{t('admin.reference')}</Label>
              <Input
                value={createForm.reference}
                onChange={(e) => setCreateForm((f) => ({ ...f, reference: e.target.value }))}
                placeholder={t('admin.referencePlaceholder')}
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
                dir="ltr"
              />
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>{t('admin.note')}</Label>
              <Textarea
                value={createForm.note}
                onChange={(e) => setCreateForm((f) => ({ ...f, note: e.target.value }))}
                placeholder={t('admin.additionalNotesPlaceholder')}
                rows={2}
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>
          </div>

          {createMutation.error && (
            <div className="text-xs p-2.5 rounded-lg" style={{ backgroundColor: `${COLORS.danger}15`, color: COLORS.danger, border: `1px solid ${COLORS.danger}30` }}>
              {createMutation.error.message}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={createMutation.isPending}
              style={{ borderColor: COLORS.border, color: COLORS.muted }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => createMutation.mutate(createForm)}
              disabled={createMutation.isPending || !createForm.productId || !createForm.quantity}
              className="transition-all duration-300"
              style={{ backgroundColor: createMutation.isPending ? COLORS.muted : COLORS.active, color: '#fff' }}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />}
              {createMutation.isPending ? t('admin.processingAction') : t('admin.recordMovement')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
