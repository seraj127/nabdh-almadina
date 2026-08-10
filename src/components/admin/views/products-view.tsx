'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Package, Search, Plus, Pencil, Trash2, ImagePlus, Video, X, Star, Upload, Film, Link, Printer } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  type ProductsResponse,
  COLORS,
  StatusBadge,
} from '@/components/admin/shared';
import { PrintDialog } from '@/components/admin/print-dialog';

// ─── Products View ───────────────────────────────────────────
export function ProductsView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductsResponse['products'][0] | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [printDialog, setPrintDialog] = useState<{ open: boolean; type: 'order' | 'product' | 'batch-orders' | 'batch-products'; data: any }>({ open: false, type: 'product', data: null });

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['products', search, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        isActive: 'all',
      });
      if (search) params.set('search', search);
      return fetch(`/api/products?${params}`).then((r) => r.json());
    },
  });

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery<{
    categories: { id: string; nameAr: string; nameEn: string; slug: string }[];
  }>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (productData: Record<string, unknown>) => {
      const isEdit = !!productData.id;
      const res = await authFetch('/api/admin/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save product');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowProductDialog(false);
      setEditingProduct(null);
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete product');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteProductId(null);
    },
  });

  const openEditDialog = useCallback((product: ProductsResponse['products'][0]) => {
    setEditingProduct(product);
    setShowProductDialog(true);
  }, []);

  const openAddDialog = useCallback(() => {
    setEditingProduct(null);
    setShowProductDialog(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Bar + Add Button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4"
            style={{
              color: COLORS.muted,
              [language === 'ar' ? 'right' : 'left']: '12px',
            }}
          />
          <Input
            placeholder={t('admin.searchProducts')}
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
        <Button
          onClick={openAddDialog}
          className="shrink-0"
          style={{
            backgroundColor: COLORS.active,
            color: '#fff',
          }}
        >
          <Plus className="h-4 w-4 me-2" />
          {t('admin.addProduct')}
        </Button>
        <Button
          onClick={() => {
            if (data?.products && data.products.length > 0) {
              setPrintDialog({ open: true, type: 'batch-products', data: data.products });
            }
          }}
          className="shrink-0"
          style={{
            backgroundColor: `${COLORS.purple}20`,
            color: COLORS.purple,
            border: `1px solid ${COLORS.purple}40`,
          }}
          disabled={!data?.products || data.products.length === 0}
        >
          <Printer className="h-4 w-4 me-2" />
          {t('print.batchPrint')}
        </Button>
      </div>

      {/* Products Table */}
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
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.image')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.name')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.sku')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('product.price')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.stock')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.status')}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.products.map((product) => (
                  <TableRow key={product.id} style={{ borderColor: COLORS.border }}>
                    <TableCell>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: COLORS.bg }}
                      >
                        {product.mainImage ? (
                          <img
                            src={product.mainImage}
                            alt={language === 'ar' ? product.nameAr : product.nameEn}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4" style={{ color: COLORS.muted }} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm" style={{ color: COLORS.text }}>
                        {language === 'ar' ? product.nameAr : product.nameEn}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: COLORS.muted }}>
                          {language === 'ar' ? product.category?.nameAr : product.category?.nameEn}
                        </span>
                        {product.video && (
                          <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: COLORS.purple }}>
                            <Film className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs" style={{ color: COLORS.muted }}>
                        {product.sku}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: COLORS.text }}>
                      {product.price.toFixed(2)} {t('product.currency')}
                    </TableCell>
                    <TableCell>
                      <span
                        className="font-medium text-sm"
                        style={{
                          color:
                            product.stock <= 3
                              ? COLORS.danger
                              : product.stock < 10
                              ? COLORS.warning
                              : COLORS.success,
                        }}
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: product.isActive
                            ? `${COLORS.success}20`
                            : `${COLORS.muted}20`,
                          color: product.isActive ? COLORS.success : COLORS.muted,
                          border: 'none',
                        }}
                      >
                        {product.isActive ? t('admin.active') : t('admin.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: COLORS.purple }}
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrintDialog({ open: true, type: 'product', data: product });
                          }}
                          title={language === 'ar' ? 'طباعة' : 'Print'}
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: COLORS.active }}
                          className="h-8"
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: COLORS.danger }}
                          className="h-8"
                          onClick={() => setDeleteProductId(product.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
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

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={showProductDialog}
        onClose={() => { setShowProductDialog(false); setEditingProduct(null); }}
        product={editingProduct}
        categories={categoriesData?.categories || []}
        onSubmit={(d) => productMutation.mutate(d)}
        isPending={productMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: COLORS.text }}>{t('admin.deleteProduct')}</AlertDialogTitle>
            <AlertDialogDescription style={{ color: COLORS.muted }}>
              {t('admin.deleteProductConfirmFull')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: COLORS.bg }}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && deleteMutation.mutate(deleteProductId)}
              style={{ backgroundColor: COLORS.danger, color: '#fff' }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Print Dialog */}
      <PrintDialog
        open={printDialog.open}
        onOpenChange={(open) => setPrintDialog({ ...printDialog, open })}
        type={printDialog.type}
        data={printDialog.data}
      />
    </div>
  );
}

// ─── Product Form Dialog (Enhanced with Image Upload & Video) ───────────
export function ProductFormDialog({
  open,
  onClose,
  product,
  categories,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductsResponse['products'][0] | null;
  categories: { id: string; nameAr: string; nameEn: string; slug: string }[];
  onSubmit: (data: Record<string, unknown>) => void;
  isPending: boolean;
}) {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const isEdit = !!product;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Parse existing images from product
  const parseImages = (imgData: string | null | undefined): string[] => {
    if (!imgData) return [];
    try {
      const parsed = JSON.parse(imgData);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return imgData ? [imgData] : [];
    }
  };

  const getInitialForm = () => {
    if (product) {
      const existingImages = parseImages(product.images);
      return {
        nameAr: product.nameAr || '',
        nameEn: product.nameEn || '',
        descriptionAr: product.descriptionAr || '',
        descriptionEn: product.descriptionEn || '',
        categoryId: product.category?.slug || '',
        sku: product.sku || '',
        price: String(product.price || ''),
        comparePrice: String(product.comparePrice || ''),
        costPrice: '',
        stock: String(product.stock || ''),
        weight: '',
        isActive: product.isActive,
        isFeatured: product.isFeatured || false,
        badges: [] as string[],
        // Image & Video fields
        images: existingImages,
        mainImage: product.mainImage || (existingImages.length > 0 ? existingImages[0] : ''),
        video: product.video || '',
      };
    }
    return {
      nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
      categoryId: '', sku: '', price: '', comparePrice: '', costPrice: '',
      stock: '', weight: '', isActive: true, isFeatured: false,
      badges: [] as string[],
      images: [] as string[],
      mainImage: '',
      video: '',
    };
  };

  const [form, setForm] = useState(getInitialForm);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'details'>('basic');

  // Track product changes to reset form
  const [prevProduct, setPrevProduct] = useState(product);
  if (prevProduct !== product) {
    setPrevProduct(product);
    setForm(getInitialForm());
  }

  // Handle image file selection
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = form.images.length;
    const newFiles = Array.from(files).slice(0, 8 - currentCount); // Max 8 images total

    if (newFiles.length === 0) {
      setUploadError(t('admin.maxImagesError'));
      return;
    }

    setUploadingImages(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      newFiles.forEach((file) => formData.append('files', file));
      formData.append('type', 'image');

      const res = await authFetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const newUrls: string[] = data.files.map((f: { url: string }) => f.url);
      const updatedImages = [...form.images, ...newUrls];
      const newMainImage = form.mainImage || (updatedImages.length > 0 ? updatedImages[0] : '');

      setForm({
        ...form,
        images: updatedImages,
        mainImage: newMainImage,
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('admin.uploadError'));
    } finally {
      setUploadingImages(false);
      // Reset input
      if (e.target) e.target.value = '';
    }
  };

  // Handle video file upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('type', 'video');

      const res = await authFetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setForm({
        ...form,
        video: data.files[0].url,
      });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('admin.uploadError'));
    } finally {
      setUploadingVideo(false);
      if (e.target) e.target.value = '';
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newMain = form.mainImage === form.images[index]
      ? (newImages.length > 0 ? newImages[0] : '')
      : form.mainImage;
    setForm({ ...form, images: newImages, mainImage: newMain });
  };

  // Set main image
  const setMainImage = (url: string) => {
    setForm({ ...form, mainImage: url });
  };

  // Get YouTube embed URL
  const getYoutubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return null;
  };

  const isVideoUrl = (url: string): boolean => {
    return url.match(/\.(mp4|webm|mov|avi)($|\?)/i) !== null || getYoutubeEmbedUrl(url) !== null;
  };

  const handleSubmit = () => {
    const data: Record<string, unknown> = {
      ...form,
      images: JSON.stringify(form.images),
    };
    if (isEdit && product) data.id = product.id;
    // Find category ID from slug
    const cat = categories.find((c) => c.slug === form.categoryId || c.id === form.categoryId);
    if (cat) data.categoryId = cat.id;
    onSubmit(data);
  };

  const inputStyle = { backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text };
  const labelStyle = { color: COLORS.muted };

  const badgeOptions = [
    { key: 'new', labelAr: 'جديد', labelEn: 'New' },
    { key: 'sale', labelAr: 'تخفيض', labelEn: 'Sale' },
    { key: 'bestseller', labelAr: 'الأكثر مبيعاً', labelEn: 'Bestseller' },
  ];

  const tabs = [
    { key: 'basic' as const, label: t('admin.tabBasic') },
    { key: 'media' as const, label: t('admin.tabMedia') },
    { key: 'details' as const, label: t('admin.tabDetails') },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: COLORS.text }}>
            {isEdit ? t('admin.editProduct') : t('admin.addProduct')}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b pb-2" style={{ borderColor: COLORS.border }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.key ? `${COLORS.active}20` : 'transparent',
                color: activeTab === tab.key ? COLORS.active : COLORS.muted,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
          {/* ─── Basic Info Tab ─── */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.nameArLabel')}
                </label>
                <Input
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  style={inputStyle}
                  placeholder="اسم المنتج بالعربية"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.nameEnLabel')}
                </label>
                <Input
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                  style={inputStyle}
                  placeholder="Product name in English"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.descriptionAr')}
                </label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  style={inputStyle}
                  placeholder={t('admin.descriptionArPlaceholder')}
                  rows={3}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.descriptionEn')}
                </label>
                <Textarea
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  style={inputStyle}
                  placeholder="Product description in English"
                  rows={3}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.categoryLabel')}
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full h-9 rounded-md border px-3 text-sm"
                  style={inputStyle}
                >
                  <option value="">{t('admin.selectCategoryPlaceholder')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={labelStyle}>SKU *</label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  style={inputStyle}
                  placeholder="KW-XXX"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.priceLabel')}
                </label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.comparePrice')}
                </label>
                <Input
                  type="number"
                  value={form.comparePrice}
                  onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.stockLabel')}
                </label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  style={inputStyle}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center gap-4 sm:col-span-2 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                  />
                  <span className="text-sm" style={{ color: COLORS.text }}>{t('admin.active')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isFeatured}
                    onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
                  />
                  <span className="text-sm" style={{ color: COLORS.text }}>{t('admin.isFeatured')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── Media Tab (Images & Video) ─── */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Images Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" style={{ color: COLORS.active }} />
                    <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
                      {t('admin.productImages')}
                    </h3>
                    {form.images.length > 0 && (
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: `${COLORS.active}20`,
                          color: COLORS.active,
                          border: 'none',
                        }}
                      >
                        {form.images.length}/8
                      </Badge>
                    )}
                  </div>
                  {form.images.length < 8 && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImages}
                      style={{ backgroundColor: `${COLORS.active}20`, color: COLORS.active }}
                    >
                      {uploadingImages ? (
                        <>{t('admin.uploading')}</>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5 me-1.5" />
                          {t('admin.addImages')}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* Drop Zone / Placeholder */}
                {form.images.length === 0 ? (
                  <div
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-opacity-60"
                    style={{ borderColor: COLORS.border, backgroundColor: `${COLORS.bg}50` }}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImagePlus className="h-10 w-10 mx-auto mb-3" style={{ color: COLORS.muted }} />
                    <p className="text-sm font-medium" style={{ color: COLORS.text }}>
                      {t('admin.dropImages')}
                    </p>
                    <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                      {t('admin.maxImagesNote')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {form.images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group rounded-xl overflow-hidden border aspect-square"
                        style={{
                          borderColor: form.mainImage === imgUrl ? COLORS.active : COLORS.border,
                          borderWidth: form.mainImage === imgUrl ? '2px' : '1px',
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`${language === 'ar' ? 'صورة' : 'Image'} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Main image badge */}
                        {form.mainImage === imgUrl && (
                          <div
                            className="absolute top-1.5 start-1.5 px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1"
                            style={{ backgroundColor: COLORS.active, color: '#fff' }}
                          >
                            <Star className="h-3 w-3" />
                            {t('admin.mainImage')}
                          </div>
                        )}
                        {/* Actions overlay */}
                        <div
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                        >
                          {form.mainImage !== imgUrl && (
                            <button
                              type="button"
                              onClick={() => setMainImage(imgUrl)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ backgroundColor: `${COLORS.active}30`, color: COLORS.active }}
                              title={t('admin.setAsMain')}
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ backgroundColor: `${COLORS.danger}30`, color: COLORS.danger }}
                            title={t('admin.removeImage')}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add more images placeholder */}
                    {form.images.length < 8 && (
                      <div
                        className="border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors aspect-square hover:border-opacity-60"
                        style={{ borderColor: COLORS.border }}
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <Plus className="h-6 w-6 mx-auto" style={{ color: COLORS.muted }} />
                          <span className="text-xs mt-1 block" style={{ color: COLORS.muted }}>
                            {t('common.add')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Video Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" style={{ color: COLORS.purple }} />
                  <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
                    {t('admin.productVideo')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Video URL Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium flex items-center gap-1.5" style={labelStyle}>
                      <Link className="h-3.5 w-3.5" />
                      {t('admin.videoUrl')}
                    </label>
                    <Input
                      value={form.video && !form.video.startsWith('/uploads/') ? form.video : ''}
                      onChange={(e) => setForm({ ...form, video: e.target.value })}
                      style={inputStyle}
                      placeholder={t('admin.videoUrlPlaceholder')}
                    />
                    <p className="text-xs" style={{ color: COLORS.muted }}>
                      {t('admin.videoSupportNote')}
                    </p>
                  </div>

                  {/* Upload Video */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium flex items-center gap-1.5" style={labelStyle}>
                      <Upload className="h-3.5 w-3.5" />
                      {t('admin.uploadVideo')}
                    </label>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-9"
                      disabled={uploadingVideo}
                      onClick={() => videoInputRef.current?.click()}
                      style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: COLORS.bg }}
                    >
                      {uploadingVideo ? (
                        t('admin.uploading')
                      ) : (
                        <>
                          <Film className="h-3.5 w-3.5 me-1.5" />
                          {t('admin.chooseVideoFile')}
                        </>
                      )}
                    </Button>
                    <p className="text-xs" style={{ color: COLORS.muted }}>
                      {t('admin.maxVideoNote')}
                    </p>
                  </div>
                </div>

                {/* Video Preview */}
                {form.video && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium" style={{ color: COLORS.muted }}>
                        {t('admin.videoPreview')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, video: '' })}
                        className="text-xs flex items-center gap-1"
                        style={{ color: COLORS.danger }}
                      >
                        <X className="h-3 w-3" />
                        {t('common.remove')}
                      </button>
                    </div>
                    <div
                      className="rounded-xl overflow-hidden border"
                      style={{ borderColor: COLORS.border, backgroundColor: COLORS.bg }}
                    >
                      {getYoutubeEmbedUrl(form.video) ? (
                        <iframe
                          src={getYoutubeEmbedUrl(form.video)!}
                          className="w-full aspect-video"
                          allowFullScreen
                          title="Video preview"
                        />
                      ) : form.video.match(/\.(mp4|webm|mov)($|\?)/i) ? (
                        <video
                          src={form.video}
                          className="w-full aspect-video object-cover"
                          controls
                          muted
                        />
                      ) : (
                        <div className="w-full aspect-video flex items-center justify-center">
                          <div className="text-center">
                            <Film className="h-8 w-8 mx-auto mb-2" style={{ color: COLORS.muted }} />
                            <p className="text-xs" style={{ color: COLORS.muted }}>
                              {t('admin.videoPreviewNotSupported')}
                            </p>
                            <a
                              href={form.video}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs mt-1 inline-block"
                              style={{ color: COLORS.active }}
                            >
                              {t('common.openLink')}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Error */}
              {uploadError && (
                <div
                  className="p-3 rounded-lg text-sm flex items-center gap-2"
                  style={{ backgroundColor: `${COLORS.danger}15`, color: COLORS.danger }}
                >
                  <X className="h-4 w-4 shrink-0" />
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {/* ─── Details Tab ─── */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.costPrice')}
                </label>
                <Input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={labelStyle}>
                  {t('admin.weightKgLabel')}
                </label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  style={inputStyle}
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={labelStyle}>{t('admin.badges')}</label>
                <div className="flex gap-2 flex-wrap">
                  {badgeOptions.map((badge) => (
                    <button
                      key={badge.key}
                      type="button"
                      onClick={() => {
                        setForm({
                          ...form,
                          badges: form.badges.includes(badge.key)
                            ? form.badges.filter((b) => b !== badge.key)
                            : [...form.badges, badge.key],
                        });
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor: form.badges.includes(badge.key) ? `${COLORS.active}20` : COLORS.bg,
                        color: form.badges.includes(badge.key) ? COLORS.active : COLORS.muted,
                        border: `1px solid ${form.badges.includes(badge.key) ? `${COLORS.active}40` : COLORS.border}`,
                      }}
                    >
                      {language === 'ar' ? badge.labelAr : badge.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-3" style={{ borderColor: COLORS.border }}>
          <Button
            variant="outline"
            onClick={onClose}
            style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: COLORS.bg }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !form.nameAr || !form.nameEn || !form.sku || !form.price || !form.stock}
            style={{ backgroundColor: COLORS.active, color: '#fff' }}
          >
            {isPending ? t('common.loading') : isEdit ? t('common.save') : t('common.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
