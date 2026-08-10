'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Search,
  Power,
  ChevronUp,
  ChevronDown,
  Eye,
  Package,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useShallow } from 'zustand/react/shallow';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  COLORS,
  StatCard,
} from '@/components/admin/shared';

// ─── Types ────────────────────────────────────────────────────
interface SubcategoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  sortOrder: number;
  phase: string;
  attributes: string | null;
  isActive: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  productCount: number;
  childrenCount: number;
  parent?: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
    icon: string | null;
  } | null;
}

interface ParentCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  productCount: number;
  childrenCount: number;
}

interface CategoriesResponse {
  categories: SubcategoryItem[];
}

// ─── Subcategories View ───────────────────────────────────────
export function SubcategoriesView() {
  const { t, language } = useLanguageStore(
    useShallow((s) => ({ t: s.t, language: s.language }))
  );
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();
  const isRTL = language === 'ar';

  const [search, setSearch] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>('all');
  const [showSubcatDialog, setShowSubcatDialog] = useState(false);
  const [editingSubcat, setEditingSubcat] = useState<SubcategoryItem | null>(null);
  const [deleteSubcat, setDeleteSubcat] = useState<SubcategoryItem | null>(null);
  const [reassignTo, setReassignTo] = useState<string>('');
  const [viewSubcat, setViewSubcat] = useState<SubcategoryItem | null>(null);

  // Fetch parent categories (only root-level)
  const { data: parentsData } = useQuery<CategoriesResponse>({
    queryKey: ['admin-parent-categories'],
    queryFn: () =>
      authFetch('/api/admin/categories?parentsOnly=true&all=true')
        .then((r) => r.json()),
  });

  const parentCategories: ParentCategory[] = useMemo(
    () => (parentsData?.categories || []) as unknown as ParentCategory[],
    [parentsData]
  );

  // Fetch subcategories (categories with parentId)
  const { data: subcatsData, isLoading } = useQuery<CategoriesResponse>({
    queryKey: ['admin-subcategories', selectedParentId],
    queryFn: () => {
      const params = new URLSearchParams({ all: 'true' });
      if (selectedParentId && selectedParentId !== 'all') {
        params.set('parentId', selectedParentId);
      } else {
        // Get all categories and filter for subcategories client-side
        // We use tree mode to get all with parent info
        params.set('all', 'true');
      }
      return authFetch(`/api/admin/categories?${params}`).then((r) => r.json());
    },
  });

  const allSubcategories = useMemo(() => {
    const cats = subcatsData?.categories || [];
    // Filter to only subcategories (those with parentId)
    const subcats = cats.filter((c) => c.parentId !== null);
    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      return subcats.filter(
        (c) =>
          c.nameAr.toLowerCase().includes(q) ||
          c.nameEn.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
    }
    return subcats;
  }, [subcatsData, search]);

  // Group subcategories by parent
  const groupedSubcategories = useMemo(() => {
    if (selectedParentId !== 'all') {
      // Already filtered by API
      return null; // flat list
    }
    const groups: Record<string, { parent: ParentCategory; items: SubcategoryItem[] }> = {};
    for (const sub of allSubcategories) {
      const pid = sub.parentId || 'unknown';
      if (!groups[pid]) {
        const parentInfo = sub.parent
          ? {
              id: sub.parent.id,
              nameAr: sub.parent.nameAr,
              nameEn: sub.parent.nameEn,
              slug: sub.parent.slug,
              icon: sub.parent.icon,
              productCount: 0,
              childrenCount: 0,
            }
          : {
              id: 'unknown',
              nameAr: 'غير مصنف',
              nameEn: 'Uncategorized',
              slug: 'uncategorized',
              icon: null,
              productCount: 0,
              childrenCount: 0,
            };
        groups[pid] = { parent: parentInfo, items: [] };
      }
      groups[pid].items.push(sub);
    }
    return groups;
  }, [allSubcategories, selectedParentId]);

  // Stats
  const totalSubcategories = allSubcategories.length;
  const activeSubcategories = allSubcategories.filter((c) => c.isActive).length;
  const totalProductsInSubcats = allSubcategories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  // Create/Update mutation
  const subcatMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const isEdit = !!data.id;
      const res = await authFetch('/api/admin/categories', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save subcategory');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-parent-categories'] });
      setShowSubcatDialog(false);
      setEditingSubcat(null);
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await authFetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle subcategory');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subcategories'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ id, reassignToId }: { id: string; reassignToId?: string }) => {
      const params = new URLSearchParams({ id });
      if (reassignToId) params.set('reassignTo', reassignToId);
      const res = await authFetch(`/api/admin/categories?${params}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete subcategory');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-parent-categories'] });
      setDeleteSubcat(null);
      setReassignTo('');
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      // Find current item and its neighbor
      const subcats = selectedParentId === 'all'
        ? allSubcategories
        : allSubcategories;
      const currentIdx = subcats.findIndex((c) => c.id === id);
      if (currentIdx === -1) return;

      const swapIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
      if (swapIdx < 0 || swapIdx >= subcats.length) return;

      const current = subcats[currentIdx];
      const neighbor = subcats[swapIdx];

      // Swap sortOrder values
      await authFetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: current.id, sortOrder: neighbor.sortOrder }),
      });
      await authFetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: neighbor.id, sortOrder: current.sortOrder }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subcategories'] });
    },
  });

  const openEditDialog = useCallback((subcat: SubcategoryItem) => {
    setEditingSubcat(subcat);
    setShowSubcatDialog(true);
  }, []);

  const openAddDialog = useCallback(() => {
    setEditingSubcat(null);
    setShowSubcatDialog(true);
  }, []);

  const statCards = [
    {
      label: isRTL ? 'التصنيفات الفرعية' : 'Subcategories',
      value: totalSubcategories.toString(),
      icon: <FolderTree className="h-5 w-5" />,
      color: COLORS.active,
    },
    {
      label: isRTL ? 'نشطة' : 'Active',
      value: activeSubcategories.toString(),
      icon: <Power className="h-5 w-5" />,
      color: COLORS.success,
    },
    {
      label: isRTL ? 'إجمالي المنتجات' : 'Total Products',
      value: totalProductsInSubcats.toString(),
      icon: <Package className="h-5 w-5" />,
      color: COLORS.purple,
    },
  ];

  const renderSubcategoryTable = (items: SubcategoryItem[], showParent = false) => (
    <Table>
      <TableHeader>
        <TableRow style={{ borderColor: COLORS.border }}>
          <TableHead className="w-10" style={{ color: COLORS.muted }}>#</TableHead>
          {showParent && (
            <TableHead style={{ color: COLORS.muted }}>
              {isRTL ? 'القسم الرئيسي' : 'Parent'}
            </TableHead>
          )}
          <TableHead style={{ color: COLORS.muted }}>{isRTL ? 'الاسم' : 'Name'}</TableHead>
          <TableHead style={{ color: COLORS.muted }}>Slug</TableHead>
          <TableHead className="w-20 text-center" style={{ color: COLORS.muted }}>
            {isRTL ? 'منتجات' : 'Products'}
          </TableHead>
          <TableHead className="w-24" style={{ color: COLORS.muted }}>
            {isRTL ? 'الحالة' : 'Status'}
          </TableHead>
          <TableHead className="w-24" style={{ color: COLORS.muted }}>
            {isRTL ? 'ترتيب' : 'Order'}
          </TableHead>
          <TableHead className="w-28" style={{ color: COLORS.muted }}>
            {isRTL ? 'إجراءات' : 'Actions'}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow style={{ borderColor: COLORS.border }}>
            <TableCell colSpan={showParent ? 8 : 7} className="text-center py-8" style={{ color: COLORS.muted }}>
              {t('common.noData')}
            </TableCell>
          </TableRow>
        ) : (
          items.map((sub, idx) => (
            <TableRow key={sub.id} style={{ borderColor: COLORS.border }}>
              <TableCell>
                <span className="text-sm" style={{ color: COLORS.muted }}>
                  {sub.icon || (idx + 1)}
                </span>
              </TableCell>
              {showParent && (
                <TableCell>
                  <span className="text-xs" style={{ color: COLORS.muted }}>
                    {sub.parent
                      ? isRTL ? sub.parent.nameAr : sub.parent.nameEn
                      : '—'}
                  </span>
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-2">
                  {sub.icon && <span className="text-base">{sub.icon}</span>}
                  <div>
                    <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                      {isRTL ? sub.nameAr : sub.nameEn}
                    </div>
                    <div className="text-xs" style={{ color: COLORS.muted }}>
                      {isRTL ? sub.nameEn : sub.nameAr}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs" style={{ color: COLORS.active }}>
                  {sub.slug}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  className="text-xs"
                  style={{
                    backgroundColor: sub.productCount > 0 ? `${COLORS.success}20` : `${COLORS.muted}20`,
                    color: sub.productCount > 0 ? COLORS.success : COLORS.muted,
                    border: 'none',
                  }}
                >
                  {sub.productCount}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={sub.isActive}
                    onCheckedChange={() =>
                      toggleMutation.mutate({ id: sub.id, isActive: !sub.isActive })
                    }
                    className="shrink-0"
                  />
                  <span
                    className="text-xs"
                    style={{
                      color: sub.isActive ? COLORS.success : COLORS.muted,
                    }}
                  >
                    {sub.isActive
                      ? t('admin.active')
                      : t('admin.inactive')}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    style={{ color: COLORS.muted }}
                    disabled={idx === 0}
                    onClick={() => reorderMutation.mutate({ id: sub.id, direction: 'up' })}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    style={{ color: COLORS.muted }}
                    disabled={idx === items.length - 1}
                    onClick={() => reorderMutation.mutate({ id: sub.id, direction: 'down' })}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: COLORS.active }}
                    className="h-8"
                    onClick={() => openEditDialog(sub)}
                    title={t('common.edit')}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: COLORS.purple }}
                    className="h-8"
                    onClick={() => setViewSubcat(sub)}
                    title={isRTL ? 'عرض' : 'View'}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: COLORS.danger }}
                    className="h-8"
                    onClick={() => setDeleteSubcat(sub)}
                    title={t('common.delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <StatCard
            key={i}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Header with filter & add */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4"
            style={{
              color: COLORS.muted,
              [isRTL ? 'right' : 'left']: '12px',
            }}
          />
          <Input
            placeholder={isRTL ? 'بحث عن تصنيف فرعي...' : 'Search subcategories...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={isRTL ? 'pr-10' : 'pl-10'}
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
              color: COLORS.text,
            }}
          />
        </div>

        {/* Parent filter */}
        <div className="w-full sm:w-64">
          <Select
            value={selectedParentId}
            onValueChange={setSelectedParentId}
          >
            <SelectTrigger
              style={{
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border,
                color: COLORS.text,
              }}
            >
              <SelectValue placeholder={isRTL ? 'اختر القسم الرئيسي' : 'Select parent category'} />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: COLORS.surface,
                borderColor: COLORS.border,
              }}
            >
              <SelectItem value="all" style={{ color: COLORS.text }}>
                {isRTL ? 'جميع الأقسام' : 'All Categories'}
              </SelectItem>
              {parentCategories.map((parent) => (
                <SelectItem key={parent.id} value={parent.id} style={{ color: COLORS.text }}>
                  {parent.icon && <span className="me-1">{parent.icon}</span>}
                  {isRTL ? parent.nameAr : parent.nameEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add button */}
        <Button
          onClick={openAddDialog}
          className="shrink-0"
          style={{ backgroundColor: COLORS.active, color: '#fff' }}
        >
          <Plus className="h-4 w-4 me-2" />
          {isRTL ? 'إضافة تصنيف فرعي' : 'Add Subcategory'}
        </Button>
      </div>

      {/* Content: grouped or flat */}
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
      ) : selectedParentId !== 'all' ? (
        /* Flat list filtered by parent */
        <Card
          className="border overflow-hidden"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <CardContent className="p-0">
            {renderSubcategoryTable(allSubcategories, false)}
          </CardContent>
        </Card>
      ) : (
        /* Grouped by parent */
        <div className="space-y-4">
          {groupedSubcategories &&
            Object.entries(groupedSubcategories).map(([parentId, group]) => (
              <Card
                key={parentId}
                className="border overflow-hidden"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
              >
                {/* Parent header */}
                <div
                  className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ borderColor: COLORS.border }}
                >
                  <div className="flex items-center gap-2">
                    {group.parent.icon && (
                      <span className="text-lg">{group.parent.icon}</span>
                    )}
                    <span className="font-bold text-sm" style={{ color: COLORS.text }}>
                      {isRTL ? group.parent.nameAr : group.parent.nameEn}
                    </span>
                    <Badge
                      className="text-xs"
                      style={{
                        backgroundColor: `${COLORS.active}20`,
                        color: COLORS.active,
                        border: 'none',
                      }}
                    >
                      {group.items.length}{' '}
                      {isRTL ? 'تصنيف فرعي' : 'subcategories'}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    style={{ color: COLORS.active }}
                    onClick={() => setSelectedParentId(parentId)}
                  >
                    {isRTL ? 'تصفية' : 'Filter'}
                  </Button>
                </div>
                <CardContent className="p-0">
                  {renderSubcategoryTable(group.items, false)}
                </CardContent>
              </Card>
            ))}
          {(!groupedSubcategories || Object.keys(groupedSubcategories).length === 0) && (
            <Card
              className="border"
              style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
            >
              <CardContent className="py-12 text-center">
                <FolderTree className="h-12 w-12 mx-auto mb-3" style={{ color: COLORS.muted }} />
                <p style={{ color: COLORS.muted }}>
                  {isRTL ? 'لا توجد تصنيفات فرعية' : 'No subcategories found'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Subcategory Form Dialog */}
      <SubcategoryFormDialog
        open={showSubcatDialog}
        onClose={() => {
          setShowSubcatDialog(false);
          setEditingSubcat(null);
        }}
        subcat={editingSubcat}
        parentCategories={parentCategories}
        preselectedParentId={selectedParentId !== 'all' ? selectedParentId : undefined}
        onSubmit={(d) => subcatMutation.mutate(d)}
        isPending={subcatMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteSubcat}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteSubcat(null);
            setReassignTo('');
          }
        }}
      >
        <AlertDialogContent
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: COLORS.text }}>
              {isRTL ? 'حذف التصنيف الفرعي' : 'Delete Subcategory'}
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: COLORS.muted }}>
              {deleteSubcat
                ? isRTL
                  ? `هل أنت متأكد من حذف "${deleteSubcat.nameAr}"؟`
                  : `Are you sure you want to delete "${deleteSubcat.nameEn}"?`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {deleteSubcat && deleteSubcat.productCount > 0 && (
            <div className="py-2">
              <p className="text-sm mb-2" style={{ color: COLORS.warning }}>
                {isRTL
                  ? `هذا التصنيف يحتوي على ${deleteSubcat.productCount} منتج. اختر تصنيفاً لنقل المنتجات إليه أو سيتم تعطيله بدلاً من الحذف.`
                  : `This category has ${deleteSubcat.productCount} products. Choose a category to reassign them to, or it will be deactivated instead of deleted.`}
              </p>
              <Select value={reassignTo} onValueChange={setReassignTo}>
                <SelectTrigger
                  style={{
                    backgroundColor: COLORS.bg,
                    borderColor: COLORS.border,
                    color: COLORS.text,
                  }}
                >
                  <SelectValue
                    placeholder={
                      isRTL
                        ? 'اختر تصنيف لنقل المنتجات'
                        : 'Select category to reassign products'
                    }
                  />
                </SelectTrigger>
                <SelectContent
                  style={{
                    backgroundColor: COLORS.surface,
                    borderColor: COLORS.border,
                  }}
                >
                  {parentCategories
                    .filter((p) => p.id !== deleteSubcat?.id)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id} style={{ color: COLORS.text }}>
                        {p.icon && <span className="me-1">{p.icon}</span>}
                        {isRTL ? p.nameAr : p.nameEn}
                      </SelectItem>
                    ))}
                  {allSubcategories
                    .filter((s) => s.id !== deleteSubcat?.id && s.isActive)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id} style={{ color: COLORS.text }}>
                        {s.icon && <span className="me-1">{s.icon}</span>}
                        {isRTL ? s.nameAr : s.nameEn}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                deleteSubcat &&
                deleteMutation.mutate({
                  id: deleteSubcat.id,
                  reassignToId: reassignTo || undefined,
                })
              }
              style={{ backgroundColor: COLORS.danger, color: '#fff' }}
            >
              {reassignTo
                ? isRTL
                  ? 'حذف ونقل المنتجات'
                  : 'Delete & Reassign'
                : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog
        open={!!viewSubcat}
        onOpenChange={(open) => {
          if (!open) setViewSubcat(null);
        }}
      >
        <DialogContent
          className="max-w-lg"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: COLORS.text }}>
              {isRTL ? 'تفاصيل التصنيف الفرعي' : 'Subcategory Details'}
            </DialogTitle>
          </DialogHeader>
          {viewSubcat && (
            <div className="space-y-3 py-4">
              {viewSubcat.icon && (
                <div className="text-4xl text-center mb-2">{viewSubcat.icon}</div>
              )}
              <DetailRow
                label={isRTL ? 'الاسم بالعربية' : 'Arabic Name'}
                value={viewSubcat.nameAr}
                isRTL={isRTL}
              />
              <DetailRow
                label={isRTL ? 'الاسم بالإنجليزية' : 'English Name'}
                value={viewSubcat.nameEn}
                isRTL={isRTL}
              />
              <DetailRow label="Slug" value={viewSubcat.slug} isRTL={isRTL} />
              <DetailRow
                label={isRTL ? 'الوصف' : 'Description'}
                value={viewSubcat.description || '—'}
                isRTL={isRTL}
              />
              <DetailRow
                label={isRTL ? 'القسم الرئيسي' : 'Parent Category'}
                value={
                  viewSubcat.parent
                    ? isRTL
                      ? viewSubcat.parent.nameAr
                      : viewSubcat.parent.nameEn
                    : '—'
                }
                isRTL={isRTL}
              />
              <DetailRow
                label={isRTL ? 'عدد المنتجات' : 'Product Count'}
                value={String(viewSubcat.productCount)}
                isRTL={isRTL}
              />
              <DetailRow
                label={isRTL ? 'ترتيب الفرز' : 'Sort Order'}
                value={String(viewSubcat.sortOrder)}
                isRTL={isRTL}
              />
              <DetailRow
                label={isRTL ? 'الحالة' : 'Status'}
                value={viewSubcat.isActive ? t('admin.active') : t('admin.inactive')}
                isRTL={isRTL}
              />
              <DetailRow
                label={isRTL ? 'المرحلة' : 'Phase'}
                value={viewSubcat.phase}
                isRTL={isRTL}
              />
              {viewSubcat.image && (
                <DetailRow
                  label={isRTL ? 'الصورة' : 'Image'}
                  value={viewSubcat.image}
                  isRTL={isRTL}
                />
              )}
              <DetailRow
                label={isRTL ? 'تاريخ الإنشاء' : 'Created At'}
                value={new Date(viewSubcat.createdAt).toLocaleDateString(
                  isRTL ? 'ar-LY' : 'en-US'
                )}
                isRTL={isRTL}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Detail Row Helper ────────────────────────────────────────
function DetailRow({
  label,
  value,
  isRTL,
}: {
  label: string;
  value: string;
  isRTL: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between py-2 border-b"
      style={{ borderColor: COLORS.border }}
    >
      <span className="text-sm font-medium" style={{ color: COLORS.muted }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: COLORS.text }}>
        {value}
      </span>
    </div>
  );
}

// ─── Subcategory Form Dialog ─────────────────────────────────
function SubcategoryFormDialog({
  open,
  onClose,
  subcat,
  parentCategories,
  preselectedParentId,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  subcat: SubcategoryItem | null;
  parentCategories: ParentCategory[];
  preselectedParentId?: string;
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}) {
  const { t, language } = useLanguageStore(
    useShallow((s) => ({ t: s.t, language: s.language }))
  );
  const isRTL = language === 'ar';

  const getInitialForm = () => {
    if (subcat) {
      return {
        parentId: subcat.parentId || '',
        nameAr: subcat.nameAr,
        nameEn: subcat.nameEn,
        slug: subcat.slug,
        description: subcat.description || '',
        icon: subcat.icon || '',
        image: subcat.image || '',
        sortOrder: String(subcat.sortOrder),
        phase: subcat.phase,
        isActive: subcat.isActive,
      };
    }
    return {
      parentId: preselectedParentId || '',
      nameAr: '',
      nameEn: '',
      slug: '',
      description: '',
      icon: '',
      image: '',
      sortOrder: '0',
      phase: 'ACTIVE_MVP',
      isActive: true,
    };
  };

  const [form, setForm] = useState(getInitialForm);

  const [prevSubcat, setPrevSubcat] = useState(subcat);
  if (prevSubcat !== subcat) {
    setPrevSubcat(subcat);
    setForm(getInitialForm());
  }

  // Auto-generate slug from English name
  const handleNameEnChange = (value: string) => {
    setForm((prev) => {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 60);
      return { ...prev, nameEn: value, slug: prev.slug === autoSlug(prev.nameEn) ? slug : prev.slug };
    });
  };

  const autoSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60);

  const handleSubmit = () => {
    const data: Record<string, unknown> = {
      ...form,
      sortOrder: parseInt(form.sortOrder) || 0,
    };
    if (subcat) data.id = subcat.id;
    if (!form.parentId) {
      // Don't submit without parentId
      return;
    }
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
            {subcat
              ? isRTL
                ? 'تعديل التصنيف الفرعي'
                : 'Edit Subcategory'
              : isRTL
              ? 'إضافة تصنيف فرعي'
              : 'Add Subcategory'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {/* Parent Category - required */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {isRTL ? 'القسم الرئيسي *' : 'Parent Category *'}
            </label>
            <Select
              value={form.parentId}
              onValueChange={(v) => setForm({ ...form, parentId: v })}
            >
              <SelectTrigger style={inputStyle}>
                <SelectValue
                  placeholder={
                    isRTL ? 'اختر القسم الرئيسي' : 'Select parent category'
                  }
                />
              </SelectTrigger>
              <SelectContent
                style={{
                  backgroundColor: COLORS.surface,
                  borderColor: COLORS.border,
                }}
              >
                {parentCategories.map((parent) => (
                  <SelectItem
                    key={parent.id}
                    value={parent.id}
                    style={{ color: COLORS.text }}
                  >
                    {parent.icon && <span className="me-1">{parent.icon}</span>}
                    {isRTL ? parent.nameAr : parent.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Arabic Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {isRTL ? 'الاسم بالعربية *' : 'Arabic Name *'}
            </label>
            <Input
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              style={inputStyle}
              placeholder={isRTL ? 'مثال: ألعاب ذكاء' : 'e.g., Educational Toys'}
              dir="rtl"
            />
          </div>

          {/* English Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {isRTL ? 'الاسم بالإنجليزية *' : 'English Name *'}
            </label>
            <Input
              value={form.nameEn}
              onChange={(e) => handleNameEnChange(e.target.value)}
              style={inputStyle}
              placeholder="e.g., Educational Toys"
              dir="ltr"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              Slug *
            </label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              style={inputStyle}
              placeholder="educational-toys"
              dir="ltr"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {isRTL ? 'أيقونة (إيموجي)' : 'Icon (Emoji)'}
            </label>
            <Input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              style={inputStyle}
              placeholder="🧩"
            />
          </div>

          {/* Description */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {isRTL ? 'الوصف' : 'Description'}
            </label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={inputStyle}
              placeholder={
                isRTL ? 'وصف مختصر للتصنيف' : 'Brief category description'
              }
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {isRTL ? 'رابط الصورة' : 'Image URL'}
            </label>
            <Input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              style={inputStyle}
              placeholder="https://..."
              dir="ltr"
            />
          </div>

          {/* Sort Order */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {isRTL ? 'ترتيب الفرز' : 'Sort Order'}
            </label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              style={inputStyle}
              placeholder="0"
            />
          </div>

          {/* Phase */}
          <div className="space-y-2">
            <label className="text-sm font-medium" style={labelStyle}>
              {isRTL ? 'المرحلة' : 'Phase'}
            </label>
            <select
              value={form.phase}
              onChange={(e) => setForm({ ...form, phase: e.target.value })}
              className="w-full h-9 rounded-md border px-3 text-sm"
              style={inputStyle}
            >
              <option value="ACTIVE_MVP">ACTIVE_MVP</option>
              <option value="PHASE_2">PHASE_2</option>
              <option value="PHASE_3">PHASE_3</option>
              <option value="PHASE_4">PHASE_4</option>
            </select>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
            <span className="text-sm" style={{ color: COLORS.text }}>
              {form.isActive ? t('admin.active') : t('admin.inactive')}
            </span>
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
            disabled={
              isPending ||
              !form.nameAr ||
              !form.nameEn ||
              !form.slug ||
              !form.parentId
            }
            style={{ backgroundColor: COLORS.active, color: '#fff' }}
          >
            {isPending
              ? t('common.loading')
              : subcat
              ? t('common.save')
              : t('common.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
