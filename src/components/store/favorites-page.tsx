'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Trash2,
  Package,
  Check,
  Grid3X3,
  List,
  SlidersHorizontal,
  Search,
  X,
  Share2,
  ArrowUpDown,
  ChevronDown,
  Sparkles,
  TrendingDown,
  AlertCircle,
  Eye,
  CheckCircle2,
  SortAsc,
  SortDesc,
  Tag,
  Star,
  LayoutGrid,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { useFavoritesStore } from '@/stores/favorites-store';
import { useCartStore } from '@/stores/cart-store';
import { cn } from '@/lib/utils';
import {
  Product,
  categoryGradients,
  defaultGradient,
  getBadgeStyle,
  getBadgeLabel,
  renderStars,
  parseBadges,
  fmt,
  safeNum,
} from './lib/shared';

// ─── Types ─────────────────────────────────────────────────────────
type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating';
type FilterOption = 'all' | 'in-stock' | 'out-of-stock' | 'on-sale';

interface SelectionState {
  selected: Set<string>;
  mode: boolean;
}

// ─── Sort Labels ───────────────────────────────────────────────────
const sortLabels: Record<SortOption, { ar: string; en: string }> = {
  'newest': { ar: 'أضيف مؤخراً', en: 'Recently Added' },
  'oldest': { ar: 'الأقدم', en: 'Oldest First' },
  'price-asc': { ar: 'السعر: الأقل أولاً', en: 'Price: Low to High' },
  'price-desc': { ar: 'السعر: الأعلى أولاً', en: 'Price: High to Low' },
  'name-asc': { ar: 'الاسم: أ-ي', en: 'Name: A-Z' },
  'name-desc': { ar: 'الاسم: ي-أ', en: 'Name: Z-A' },
  'rating': { ar: 'الأعلى تقييماً', en: 'Highest Rated' },
};

const filterLabels: Record<FilterOption, { ar: string; en: string }> = {
  'all': { ar: 'الكل', en: 'All' },
  'in-stock': { ar: 'متوفر', en: 'In Stock' },
  'out-of-stock': { ar: 'غير متوفر', en: 'Out of Stock' },
  'on-sale': { ar: 'بالتخفيض', en: 'On Sale' },
};

// ─── Grid Product Card ─────────────────────────────────────────────
function GridProductCard({
  product,
  onRemove,
  onSelect,
  index,
  isSelected,
  onToggleSelect,
  selectionMode,
}: {
  product: Product;
  onRemove: (id: string) => void;
  onSelect: (product: Product) => void;
  index: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  selectionMode: boolean;
}) {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [imgError, setImgError] = useState(false);

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const currency = t('product.currency');
  const gradient = categoryGradients[product.category.slug] || defaultGradient;
  const parsedBadges = parseBadges(product.badges);
  const inStock = product.stock > 0;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const savingsPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
      image: product.mainImage || '',
      stock: product.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRemoving(true);
    setTimeout(() => onRemove(product.id), 300);
  };

  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelect(product.id);
    } else {
      onSelect(product);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: removing ? 0 : 1, y: 0, scale: removing ? 0.85 : 1 }}
      exit={{ opacity: 0, scale: 0.85, y: -10 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'glass-card-enhanced rounded-2xl overflow-hidden cursor-pointer group hover-glow relative transition-all duration-300',
        isSelected && 'ring-2 ring-nabdh-primary ring-offset-2 ring-offset-background',
        removing && 'pointer-events-none',
      )}
      onClick={handleCardClick}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 start-2 z-30"
        >
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(product.id); }}
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
              isSelected
                ? 'bg-nabdh-primary border-nabdh-primary text-white'
                : 'bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 backdrop-blur-sm'
            )}
          >
            {isSelected && <Check className="size-3.5" />}
          </button>
        </motion.div>
      )}

      {/* Remove Button */}
      {!selectionMode && (
        <button
          onClick={handleRemove}
          className={cn(
            'absolute top-2 z-20 w-8 h-8 rounded-full',
            'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
            'flex items-center justify-center shadow-sm',
            'hover:bg-red-50 dark:hover:bg-red-900/30',
            'transition-all duration-200',
            'opacity-0 group-hover:opacity-100',
            language === 'ar' ? 'left-2' : 'right-2'
          )}
          aria-label={t('favorites.remove')}
        >
          <Trash2 className="size-3.5 text-red-500" />
        </button>
      )}

      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden">
        {product.mainImage && !imgError ? (
          <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center relative', gradient)}>
            <img
              src={product.mainImage}
              alt={name}
              className="w-full h-full object-cover img-zoom"
              onError={() => setImgError(true)}
              loading="lazy"
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none" />
          </div>
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', gradient)}>
            <Package className="size-12 text-white/40" />
          </div>
        )}

        {/* Badges */}
        {parsedBadges.length > 0 && (
          <div className="absolute top-2 start-2 flex flex-col gap-1">
            {parsedBadges.map((badge) => (
              <Badge
                key={badge}
                className={cn('text-[10px] px-1.5 py-0 border backdrop-blur-sm animate-badge-pulse', getBadgeStyle(badge))}
              >
                {getBadgeLabel(badge, t)}
              </Badge>
            ))}
          </div>
        )}

        {/* Savings Badge */}
        {hasDiscount && savingsPercent > 0 && (
          <div className="absolute top-2 end-2">
            <Badge className="bg-[#FF6F61]/90 text-white border-0 text-[10px] font-bold px-1.5">
              <TrendingDown className="size-3 me-0.5" />
              -{savingsPercent}%
            </Badge>
          </div>
        )}

        {/* Stock Indicator */}
        <div className="absolute bottom-2 start-2">
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm border transition-all duration-300',
              inStock
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
            )}
          >
            {inStock ? t('product.inStock') : t('product.outOfStock')}
          </span>
        </div>

        {/* Quick View overlay on hover */}
        {!selectionMode && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.05 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Button
                size="sm"
                className="bg-white/90 text-nabdh-primary hover:bg-white shadow-lg backdrop-blur-sm pointer-events-auto"
                onClick={(e) => { e.stopPropagation(); onSelect(product); }}
              >
                <Eye className="size-4 me-1" />
                {language === 'ar' ? 'معاينة' : 'View'}
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        {/* Category Tag */}
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
          {language === 'ar' ? product.category.nameAr : product.category.nameEn}
        </p>

        {/* Product Name */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-nabdh-primary transition-colors duration-300">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex">{renderStars(product.rating, 'size-3')}</div>
          <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-bold text-base text-nabdh-price">
            {fmt(product.price)} {currency}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {fmt(product.comparePrice)} {currency}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.div
              key="added"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white pointer-events-auto" disabled>
                <Check className="size-4" />
                {t('common.success')}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto"
            >
              <Button
                size="sm"
                className={cn(
                  'w-full nabdh-gradient text-white hover:opacity-90 transition-all cart-ripple',
                  !inStock && 'opacity-50 cursor-not-allowed'
                )}
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart className="size-4" />
                {inStock ? t('product.addToCart') : t('product.outOfStock')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── List Product Card ─────────────────────────────────────────────
function ListProductCard({
  product,
  onRemove,
  onSelect,
  index,
  isSelected,
  onToggleSelect,
  selectionMode,
}: {
  product: Product;
  onRemove: (id: string) => void;
  onSelect: (product: Product) => void;
  index: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  selectionMode: boolean;
}) {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const addItem = useCartStore((s) => s.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [imgError, setImgError] = useState(false);

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const currency = t('product.currency');
  const inStock = product.stock > 0;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const savingsPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;
  const gradient = categoryGradients[product.category.slug] || defaultGradient;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
      image: product.mainImage || '',
      stock: product.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRemoving(true);
    setTimeout(() => onRemove(product.id), 300);
  };

  const handleCardClick = () => {
    if (selectionMode) {
      onToggleSelect(product.id);
    } else {
      onSelect(product);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: removing ? 0 : 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={cn(
        'glass-card-enhanced rounded-xl overflow-hidden cursor-pointer group hover-glow relative transition-all duration-300',
        isSelected && 'ring-2 ring-nabdh-primary ring-offset-1 ring-offset-background',
        removing && 'pointer-events-none',
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Selection Checkbox */}
        {selectionMode && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(product.id); }}
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
              isSelected
                ? 'bg-nabdh-primary border-nabdh-primary text-white'
                : 'bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600'
            )}
          >
            {isSelected && <Check className="size-3.5" />}
          </button>
        )}

        {/* Product Image */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0">
          {product.mainImage && !imgError ? (
            <img
              src={product.mainImage}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', gradient)}>
              <Package className="size-6 text-white/40" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {language === 'ar' ? product.category.nameAr : product.category.nameEn}
          </p>
          <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-nabdh-primary transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="flex">{renderStars(product.rating, 'size-2.5')}</div>
              <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
            </div>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0 rounded-full border',
                inStock
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
              )}
            >
              {inStock ? t('product.inStock') : t('product.outOfStock')}
            </span>
            {hasDiscount && savingsPercent > 0 && (
              <span className="text-[10px] px-1.5 py-0 rounded-full bg-[#FF6F61]/10 text-[#FF6F61] border border-[#FF6F61]/20 font-bold">
                -{savingsPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Price + Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="text-end">
            <p className="font-bold text-base text-nabdh-price">
              {fmt(product.price)} {currency}
            </p>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">
                {fmt(product.comparePrice)} {currency}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {!selectionMode && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                  onClick={handleRemove}
                >
                  <Trash2 className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-nabdh-primary"
                  onClick={(e) => { e.stopPropagation(); onSelect(product); }}
                >
                  <Eye className="size-4" />
                </Button>
              </>
            )}
            <AnimatePresence mode="wait">
              {justAdded ? (
                <motion.div key="added" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white h-8" disabled>
                    <Check className="size-4" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="add" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    className={cn(
                      'h-8 nabdh-gradient text-white hover:opacity-90',
                      !inStock && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={handleAddToCart}
                    disabled={!inStock}
                  >
                    <ShoppingCart className="size-3.5 me-1" />
                    {language === 'ar' ? 'أضف' : 'Add'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton Cards ────────────────────────────────────────────────
function GridSkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border/40 animate-pulse">
      <div className="aspect-square bg-muted/40" />
      <div className="p-3 space-y-3">
        <div className="h-2 w-16 bg-muted/40 rounded" />
        <div className="h-4 w-3/4 bg-muted/40 rounded" />
        <div className="h-3 w-20 bg-muted/40 rounded" />
        <div className="h-5 w-24 bg-muted/40 rounded" />
        <div className="h-9 w-full bg-muted/40 rounded-lg" />
      </div>
    </div>
  );
}

function ListSkeletonCard() {
  return (
    <div className="rounded-xl bg-card border border-border/40 animate-pulse p-3">
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg bg-muted/40 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2 w-16 bg-muted/40 rounded" />
          <div className="h-4 w-2/3 bg-muted/40 rounded" />
          <div className="h-3 w-20 bg-muted/40 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-16 bg-muted/40 rounded" />
          <div className="h-8 w-16 bg-muted/40 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Favorites Page ────────────────────────────────────────────────
export function FavoritesPage() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({
    t: s.t, language: s.language, direction: s.direction,
  })));
  const clearAuthView = useUIStore((s) => s.clearAuthView);
  const openProductDetail = useUIStore((s) => s.openProductDetail);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites);
  const addItem = useCartStore((s) => s.addItem);
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';

  // ─── State ────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // UI controls
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Selection mode
  const [selection, setSelection] = useState<SelectionState>({ selected: new Set(), mode: false });

  // ─── Data loader ──────────────────────
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/favorites?includeProducts=true');
      if (res.ok) {
        const data = await res.json();
        if (data.favorites && Array.isArray(data.favorites)) {
          const seen = new Set<string>();
          const favProducts: Product[] = [];
          for (const f of data.favorites) {
            if (!f.product || f.product.isActive === false) continue;
            const pid = f.product.id as string;
            if (seen.has(pid)) continue;
            seen.add(pid);
            favProducts.push({
              id: pid,
              categoryId: f.product.categoryId || '',
              nameAr: f.product.nameAr || '',
              nameEn: f.product.nameEn || '',
              descriptionAr: f.product.descriptionAr || null,
              descriptionEn: null,
              sku: '',
              price: typeof f.product.price === 'number' ? f.product.price : parseFloat(String(f.product.price)) || 0,
              comparePrice: f.product.comparePrice || null,
              mainImage: f.product.mainImage || f.product.image || null,
              images: f.product.images || '',
              stock: f.product.stock || 0,
              badges: null,
              rating: f.product.rating || 0,
              reviewCount: f.product.reviewCount || 0,
              isFeatured: false,
              isActive: f.product.isActive !== false,
              category: f.product.category || { id: '', nameAr: '', nameEn: '', slug: '' },
            });
          }
          setProducts(favProducts);
          // Sync ALL server ids (not just the displayed ones) so inactive or
          // missing products never get wiped from the server by the page visit.
          const allServerIds = Array.from(new Set(
            (data.favorites as Array<{ productId: string }>).map((f) => f.productId)
          ));
          useFavoritesStore.getState().syncIds(allServerIds);
        }
      } else {
        await loadLocalFavoriteProducts();
      }
    } catch {
      await loadLocalFavoriteProducts();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLocalFavoriteProducts = useCallback(async () => {
    const ids = useFavoritesStore.getState().favoriteIds;
    if (ids.length === 0) { setProducts([]); return; }
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        const allProducts: Product[] = data.products || data || [];
        const seen = new Set<string>();
        const favProducts = allProducts.filter((p: Product) => {
          if (seen.has(p.id) || !ids.includes(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        setProducts(favProducts);
      }
    } catch {
      setProducts([]);
    }
  }, []);

  useEffect(() => { loadFavorites(); }, [loadFavorites]);

  // Refresh when the user returns to this tab/window (favorites may have been
  // added/removed in another tab, from the mobile view, or on another device).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onVisible = () => {
      if (!document.hidden) loadFavorites();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadFavorites]);

  // ─── Computed: filtered & sorted products ────
  const processedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply filter
    if (filterOption === 'in-stock') {
      filtered = filtered.filter((p) => p.stock > 0);
    } else if (filterOption === 'out-of-stock') {
      filtered = filtered.filter((p) => p.stock <= 0);
    } else if (filterOption === 'on-sale') {
      filtered = filtered.filter((p) => p.comparePrice && p.comparePrice > p.price);
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        p.nameAr.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.category.nameAr.toLowerCase().includes(q) ||
        p.category.nameEn.toLowerCase().includes(q)
      );
    }

    // Apply sort
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => safeNum(a.price) - safeNum(b.price));
        break;
      case 'price-desc':
        filtered.sort((a, b) => safeNum(b.price) - safeNum(a.price));
        break;
      case 'name-asc':
        filtered.sort((a, b) => (isAr ? a.nameAr : a.nameEn).localeCompare(isAr ? b.nameAr : b.nameEn));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (isAr ? b.nameAr : b.nameEn).localeCompare(isAr ? a.nameAr : a.nameEn));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'oldest':
        // Keep original order (server order)
        break;
      case 'newest':
      default:
        filtered.reverse();
        break;
    }

    return filtered;
  }, [products, filterOption, sortOption, searchQuery, isAr]);

  // ─── Stats ────────────────────────────
  const stats = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + safeNum(p.price), 0);
    const totalCompareValue = products.reduce((sum, p) => sum + (p.comparePrice && p.comparePrice > p.price ? safeNum(p.comparePrice) : safeNum(p.price)), 0);
    const totalSavings = totalCompareValue - totalValue;
    const inStockCount = products.filter((p) => p.stock > 0).length;
    const outOfStockCount = products.length - inStockCount;
    const onSaleCount = products.filter((p) => p.comparePrice && p.comparePrice > p.price).length;
    const avgRating = products.length > 0 ? products.reduce((sum, p) => sum + p.rating, 0) / products.length : 0;

    return { totalValue, totalSavings, inStockCount, outOfStockCount, onSaleCount, avgRating };
  }, [products]);

  // ─── Handlers ─────────────────────────
  const handleRemove = (id: string) => {
    toggleFavorite(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelection((prev) => {
      const next = new Set(prev.selected);
      next.delete(id);
      return { ...prev, selected: next };
    });
  };

  const handleClearAll = () => {
    clearFavorites();
    setProducts([]);
    setShowClearConfirm(false);
    setSelection({ selected: new Set(), mode: false });
  };

  const handleSelectProduct = (product: Product) => {
    openProductDetail(product.id);
  };

  const handleAddAllToCart = () => {
    products.forEach((p) => {
      if (p.stock > 0) {
        addItem({
          productId: p.id,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price)) || 0,
          image: p.mainImage || '',
          stock: p.stock,
        });
      }
    });
  };

  const handleAddSelectedToCart = () => {
    products.forEach((p) => {
      if (selection.selected.has(p.id) && p.stock > 0) {
        addItem({
          productId: p.id,
          nameAr: p.nameAr,
          nameEn: p.nameEn,
          price: typeof p.price === 'number' ? p.price : parseFloat(String(p.price)) || 0,
          image: p.mainImage || '',
          stock: p.stock,
        });
      }
    });
    setSelection({ selected: new Set(), mode: false });
  };

  const handleRemoveSelected = () => {
    selection.selected.forEach((id) => {
      toggleFavorite(id);
    });
    setProducts((prev) => prev.filter((p) => !selection.selected.has(p.id)));
    setSelection({ selected: new Set(), mode: false });
  };

  const toggleSelect = (id: string) => {
    setSelection((prev) => {
      const next = new Set(prev.selected);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { ...prev, selected: next };
    });
  };

  const toggleSelectAll = () => {
    if (selection.selected.size === processedProducts.length) {
      setSelection((prev) => ({ ...prev, selected: new Set() }));
    } else {
      setSelection((prev) => ({ ...prev, selected: new Set(processedProducts.map((p) => p.id)) }));
    }
  };

  const handleShare = async () => {
    const shareText = isAr
      ? `مفضلتي من نبض المدينة - ${products.length} منتج`
      : `My favorites from City Pulse - ${products.length} products`;
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  // ─── Close menus on outside click ─────
  useEffect(() => {
    const handleClick = () => {
      setShowSortMenu(false);
      setShowFilterMenu(false);
    };
    if (showSortMenu || showFilterMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showSortMenu, showFilterMenu]);

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-[calc(100vh-4rem)]" dir={direction}>
      {/* ═══ Gradient Header ═══ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)',
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -start-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -end-12 w-36 h-36 rounded-full bg-white/5" />
          <div className="absolute top-1/3 end-16 w-20 h-20 rounded-full bg-nabdh-secondary/10" />
          <div className="absolute bottom-4 start-1/4 w-12 h-12 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="max-w-7xl mx-auto">
            {/* Top row: Back + Title + Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={clearAuthView}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={t('common.back')}
                >
                  <BackArrow className="size-5 text-white" />
                </motion.button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Heart className="size-6 text-nabdh-secondary" />
                    {t('favorites.title')}
                  </h1>
                  <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                    {products.length}{' '}
                    {isAr
                      ? (products.length === 1 ? 'منتج مفضل' : products.length <= 10 ? 'منتجات مفضلة' : 'منتجاً مفضلاً')
                      : (products.length === 1 ? 'favorite item' : 'favorite items')}
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                {products.length > 0 && (
                  <>
                    {/* Share Button */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleShare}
                      className="hidden sm:flex w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center hover:bg-white/20 transition-colors"
                      title={isAr ? 'مشاركة' : 'Share'}
                    >
                      <Share2 className="size-4 text-white/80" />
                    </motion.button>

                    {/* Selection Mode Toggle */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelection((prev) => ({ selected: new Set(), mode: !prev.mode }))}
                      className={cn(
                        'hidden sm:flex w-10 h-10 rounded-full items-center justify-center transition-colors',
                        selection.mode
                          ? 'bg-nabdh-primary text-white'
                          : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20'
                      )}
                      title={isAr ? 'تحديد' : 'Select'}
                    >
                      <CheckCircle2 className="size-4" />
                    </motion.button>

                    {/* Clear All */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowClearConfirm(true)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-colors text-xs font-medium"
                    >
                      <Trash2 className="size-3.5" />
                      {isAr ? 'حذف الكل' : 'Clear All'}
                    </motion.button>
                  </>
                )}
              </div>
            </div>

            {/* ═══ Stats Row ═══ */}
            {products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
              >
                {/* Total Value */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <p className="text-white/50 text-[10px] sm:text-xs font-medium">{isAr ? 'إجمالي القيمة' : 'Total Value'}</p>
                  <p className="text-white text-sm sm:text-lg font-bold mt-0.5">{fmt(stats.totalValue)} {t('product.currency')}</p>
                </div>

                {/* Total Savings */}
                {stats.totalSavings > 0 && (
                  <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/20">
                    <p className="text-emerald-300/70 text-[10px] sm:text-xs font-medium flex items-center gap-1">
                      <TrendingDown className="size-3" />
                      {isAr ? 'التوفير' : 'Savings'}
                    </p>
                    <p className="text-emerald-300 text-sm sm:text-lg font-bold mt-0.5">{fmt(stats.totalSavings)} {t('product.currency')}</p>
                  </div>
                )}

                {/* In Stock */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <p className="text-white/50 text-[10px] sm:text-xs font-medium">{isAr ? 'متوفر' : 'Available'}</p>
                  <p className="text-white text-sm sm:text-lg font-bold mt-0.5">
                    {stats.inStockCount}
                    <span className="text-white/40 text-xs font-normal ms-1">/ {products.length}</span>
                  </p>
                </div>

                {/* Add All to Cart */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddAllToCart}
                  disabled={stats.inStockCount === 0}
                  className={cn(
                    'bg-white rounded-xl p-3',
                    'flex items-center justify-center gap-2',
                    'shadow-sm hover:shadow-md transition-shadow',
                    stats.inStockCount === 0 && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <ShoppingCart className="size-5 text-nabdh-primary" />
                  <span className="text-nabdh-price text-xs sm:text-sm font-bold">
                    {isAr ? 'أضف الكل للسلة' : 'Add All to Cart'}
                  </span>
                </motion.button>
              </motion.div>
            )}

            {/* Mobile Clear All */}
            {products.length > 0 && (
              <div className="sm:hidden mt-2 flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelection((prev) => ({ selected: new Set(), mode: !prev.mode }))}
                  className={cn(
                    'flex-1 rounded-xl p-2.5 flex items-center justify-center gap-2 border transition-colors',
                    selection.mode
                      ? 'bg-nabdh-primary/20 border-nabdh-primary/30 text-white'
                      : 'bg-white/10 border-white/10 text-white/70'
                  )}
                >
                  <CheckCircle2 className="size-4" />
                  <span className="text-xs font-medium">{selection.mode ? (isAr ? 'إنهاء التحديد' : 'Done') : (isAr ? 'تحديد' : 'Select')}</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowClearConfirm(true)}
                  className="flex-1 bg-red-500/20 rounded-xl p-2.5 flex items-center justify-center gap-2 border border-red-500/30"
                >
                  <Trash2 className="size-4 text-red-400" />
                  <span className="text-red-300 text-xs font-bold">{isAr ? 'حذف الكل' : 'Clear All'}</span>
                </motion.button>
              </div>
            )}

            {/* ═══ Clear All Confirmation ═══ */}
            <AnimatePresence>
              {showClearConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="flex-1 text-center sm:text-start">
                    <p className="text-white font-medium text-sm">
                      {isAr ? 'هل تريد حذف جميع المفضلات؟' : 'Remove all favorites?'}
                    </p>
                    <p className="text-white/50 text-xs mt-0.5">
                      {isAr ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => setShowClearConfirm(false)}>
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleClearAll}>
                      <Trash2 className="size-3.5" />
                      {isAr ? 'حذف الكل' : 'Clear All'}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══ Toolbar ═══ */}
      {products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'ابحث في المفضلة...' : 'Search favorites...'}
                  className={cn(
                    'w-full h-9 rounded-lg border border-border/60 bg-muted/30 text-sm',
                    'ps-9 pe-3 placeholder:text-muted-foreground/50',
                    'focus:outline-none focus:ring-2 focus:ring-nabdh-primary/30 focus:border-nabdh-primary/50',
                    'transition-all duration-200'
                  )}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute end-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                  >
                    <X className="size-3 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-medium transition-all',
                    filterOption !== 'all'
                      ? 'border-nabdh-primary/40 bg-nabdh-primary/10 text-nabdh-primary'
                      : 'border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  <SlidersHorizontal className="size-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'تصفية' : 'Filter'}</span>
                  {filterOption !== 'all' && (
                    <Badge className="size-4 p-0 text-[8px] bg-nabdh-primary text-white flex items-center justify-center rounded-full">
                      1
                    </Badge>
                  )}
                  <ChevronDown className="size-3" />
                </button>
                <AnimatePresence>
                  {showFilterMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-1 start-0 min-w-[160px] bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {(Object.keys(filterLabels) as FilterOption[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => { setFilterOption(key); setShowFilterMenu(false); }}
                          className={cn(
                            'w-full px-3 py-2.5 text-start text-xs font-medium transition-colors flex items-center gap-2',
                            filterOption === key
                              ? 'bg-nabdh-primary/10 text-nabdh-primary'
                              : 'text-foreground hover:bg-muted/50'
                          )}
                        >
                          {filterOption === key && <Check className="size-3" />}
                          {isAr ? filterLabels[key].ar : filterLabels[key].en}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-medium transition-all',
                    'border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border'
                  )}
                >
                  <ArrowUpDown className="size-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'ترتيب' : 'Sort'}</span>
                  <ChevronDown className="size-3" />
                </button>
                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-1 end-0 min-w-[180px] bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      {(Object.keys(sortLabels) as SortOption[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => { setSortOption(key); setShowSortMenu(false); }}
                          className={cn(
                            'w-full px-3 py-2.5 text-start text-xs font-medium transition-colors flex items-center gap-2',
                            sortOption === key
                              ? 'bg-nabdh-primary/10 text-nabdh-primary'
                              : 'text-foreground hover:bg-muted/50'
                          )}
                        >
                          {sortOption === key && <Check className="size-3" />}
                          {isAr ? sortLabels[key].ar : sortLabels[key].en}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center rounded-lg border border-border/60 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center transition-colors',
                    viewMode === 'grid' ? 'bg-nabdh-primary text-white' : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                  )}
                  title={isAr ? 'شبكة' : 'Grid'}
                >
                  <Grid3X3 className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'w-9 h-9 flex items-center justify-center transition-colors',
                    viewMode === 'list' ? 'bg-nabdh-primary text-white' : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                  )}
                  title={isAr ? 'قائمة' : 'List'}
                >
                  <List className="size-4" />
                </button>
              </div>

              {/* Results count */}
              <span className="text-[10px] text-muted-foreground hidden lg:inline">
                {processedProducts.length} {isAr ? (processedProducts.length === 1 ? 'نتيجة' : 'نتائج') : (processedProducts.length === 1 ? 'result' : 'results')}
              </span>
            </div>

            {/* ═══ Selection Mode Bar ═══ */}
            <AnimatePresence>
              {selection.mode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={toggleSelectAll}
                        className="text-xs font-medium text-nabdh-primary hover:underline flex items-center gap-1"
                      >
                        {selection.selected.size === processedProducts.length ? (
                          <>
                            <X className="size-3" />
                            {isAr ? 'إلغاء تحديد الكل' : 'Deselect All'}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3" />
                            {isAr ? 'تحديد الكل' : 'Select All'}
                          </>
                        )}
                      </button>
                      {selection.selected.size > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {selection.selected.size} {isAr ? 'محدد' : 'selected'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 text-xs"
                        onClick={handleRemoveSelected}
                        disabled={selection.selected.size === 0}
                      >
                        <Trash2 className="size-3.5 me-1" />
                        {isAr ? 'حذف المحدد' : 'Remove Selected'}
                      </Button>
                      <Button
                        size="sm"
                        className="nabdh-gradient text-white h-8 text-xs"
                        onClick={handleAddSelectedToCart}
                        disabled={selection.selected.size === 0}
                      >
                        <ShoppingCart className="size-3.5 me-1" />
                        {isAr ? 'أضف المحدد للسلة' : 'Add Selected'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ═══ Content Area ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Loading State */}
        {loading && (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'
              : 'flex flex-col gap-3'
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              viewMode === 'grid' ? <GridSkeletonCard key={i} /> : <ListSkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <AlertCircle className="size-8 text-red-400" />
            </div>
            <p className="text-lg font-semibold text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={loadFavorites}>
              {t('common.retry')}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 sm:py-24 text-center px-4"
          >
            <motion.div
              className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center mb-8"
              style={{
                background: 'linear-gradient(135deg, rgba(0,75,99,0.08), rgba(0,169,204,0.08))',
              }}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart className="size-14 sm:size-18 text-nabdh-primary/20" />
              {/* Decorative dots */}
              <div className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-nabdh-secondary/20 animate-pulse" />
              <div className="absolute -bottom-2 -start-2 w-3 h-3 rounded-full bg-nabdh-accent/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-bold text-foreground/80">
              {t('favorites.noFavorites')}
            </h2>
            <p className="text-sm sm:text-base mt-2 text-muted-foreground max-w-sm">
              {t('favorites.addFavoritesHint')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              <Button
                className="nabdh-gradient text-white hover:opacity-90 shadow-lg shadow-nabdh-primary/20"
                onClick={clearAuthView}
              >
                <Sparkles className="size-4 me-2" />
                {isAr ? 'استكشف المنتجات' : 'Explore Products'}
              </Button>
            </div>

            {/* Feature hints */}
            <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 max-w-md">
              {[
                { icon: Heart, ar: 'احفظ منتجاتك', en: 'Save Products', color: 'text-rose-500' },
                { icon: ShoppingCart, ar: 'أضف للسلة بسرعة', en: 'Quick Add to Cart', color: 'text-nabdh-accent' },
                { icon: Eye, ar: 'تتبع التخفيضات', en: 'Track Price Drops', color: 'text-amber-500' },
              ].map((hint, i) => {
                const Icon = hint.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <div className={cn('w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center', hint.color)}>
                      <Icon className="size-5" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                      {isAr ? hint.ar : hint.en}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* No Results (after filter/search) */}
        {!loading && !error && products.length > 0 && processedProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-12 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <Search className="size-6 text-muted-foreground/50" />
            </div>
            <p className="text-base font-semibold text-foreground/70">
              {isAr ? 'لا توجد نتائج' : 'No results found'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr ? 'جرّب تغيير معايير البحث أو التصفية' : 'Try changing your search or filter criteria'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => { setSearchQuery(''); setFilterOption('all'); }}
            >
              {isAr ? 'مسح الفلاتر' : 'Clear Filters'}
            </Button>
          </motion.div>
        )}

        {/* ═══ Products Display ═══ */}
        {!loading && !error && processedProducts.length > 0 && (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <AnimatePresence mode="popLayout">
                  {processedProducts.map((product, i) => (
                    <GridProductCard
                      key={product.id}
                      product={product}
                      onRemove={handleRemove}
                      onSelect={handleSelectProduct}
                      index={i}
                      isSelected={selection.selected.has(product.id)}
                      onToggleSelect={toggleSelect}
                      selectionMode={selection.mode}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {processedProducts.map((product, i) => (
                    <ListProductCard
                      key={product.id}
                      product={product}
                      onRemove={handleRemove}
                      onSelect={handleSelectProduct}
                      index={i}
                      isSelected={selection.selected.has(product.id)}
                      onToggleSelect={toggleSelect}
                      selectionMode={selection.mode}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Category Group Summary */}
            {products.length > 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-6 border-t border-border/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                    <LayoutGrid className="size-4" />
                    {isAr ? 'توزيع حسب التصنيف' : 'Category Breakdown'}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const categoryMap = new Map<string, { name: string; count: number; slug: string }>();
                    products.forEach((p) => {
                      const existing = categoryMap.get(p.category.id);
                      if (existing) {
                        existing.count++;
                      } else {
                        categoryMap.set(p.category.id, {
                          name: isAr ? p.category.nameAr : p.category.nameEn,
                          count: 1,
                          slug: p.category.slug,
                        });
                      }
                    });
                    return Array.from(categoryMap.entries())
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([id, cat]) => (
                        <button
                          key={id}
                          onClick={() => {
                            const query = isAr
                              ? products.find((p) => p.category.id === id)?.category.nameAr || ''
                              : products.find((p) => p.category.id === id)?.category.nameEn || '';
                            setSearchQuery(query);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors text-xs font-medium"
                        >
                          <div className={cn('size-2 rounded-full', (categoryGradients[cat.slug] || defaultGradient).split(' ')[0].replace('from-', 'bg-'))} />
                          <span>{cat.name}</span>
                          <Badge className="size-5 p-0 text-[9px] bg-nabdh-primary/10 text-nabdh-primary flex items-center justify-center rounded-full">
                            {cat.count}
                          </Badge>
                        </button>
                      ));
                  })()}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
