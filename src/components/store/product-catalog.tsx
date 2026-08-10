'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, PackageOpen, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { ProductCard } from './product-card';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { type Product } from './lib/shared';

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  productCount: number;
}

/* ─── Infinite Marquee Component ─── */
function InfiniteMarquee({
  items,
  selectedCategory,
  onCategoryChange,
  language,
}: {
  items: { id: string; nameAr: string; nameEn: string; slug: string; icon: string | null; productCount?: number }[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
  language: 'ar' | 'en';
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const isRTL = language === 'ar';

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const scrollAmount = 220;
    const delta = direction === 'right' ? (isRTL ? scrollAmount : -scrollAmount) : (isRTL ? -scrollAmount : scrollAmount);
    const newPos = posRef.current + delta;
    // Clamp: don't scroll past content bounds
    const parentWidth = el.parentElement?.clientWidth ?? 0;
    const contentWidth = el.scrollWidth;
    const maxScroll = 0;
    const minScroll = -(contentWidth - parentWidth);
    posRef.current = Math.max(minScroll, Math.min(maxScroll, newPos));
    el.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    el.style.transform = `translateX(${posRef.current}px)`;
    setTimeout(() => { el.style.transition = ''; }, 400);
  }, [isRTL]);

  const renderButton = (cat: typeof items[0], key: string) => (
    <button
      key={key}
      onClick={() => onCategoryChange(cat.slug)}
      className={cn(
        'marquee-btn px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 shrink-0',
        selectedCategory === cat.slug
          ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/20'
          : 'glass-card hover:bg-white/90 text-foreground'
      )}
      dir="rtl"
    >
      <span className="marquee-btn-icon">{cat.icon || '🛍️'}</span>
      {language === 'ar' ? cat.nameAr : cat.nameEn}
      {cat.productCount !== undefined && (
        <span className="text-xs opacity-70">({cat.productCount})</span>
      )}
    </button>
  );

  return (
    <div className="mb-8 marquee-container rounded-2xl py-3">
      {/* Left Arrow — overlaid on left side */}
      <button
        onClick={() => handleScroll('left')}
        className="absolute start-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-white/10 shadow-md border border-gray-200/60 dark:border-gray-700/40 hover:bg-white dark:hover:bg-white/20 transition-all active:scale-90"
        aria-label={isRTL ? 'تمرير لليمين' : 'Scroll right'}
      >
        <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
      </button>

      {/* Right Arrow — overlaid on right side */}
      <button
        onClick={() => handleScroll('right')}
        className="absolute end-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-white/10 shadow-md border border-gray-200/60 dark:border-gray-700/40 hover:bg-white dark:hover:bg-white/20 transition-all active:scale-90"
        aria-label={isRTL ? 'تمرير لليسار' : 'Scroll left'}
      >
        <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
      </button>

      {/* Fade masks */}
      <div className="marquee-fade-start" />
      <div className="marquee-fade-end" />

      {/* Scrollable track */}
      <div className="marquee-viewport" dir="ltr">
        <div ref={scrollerRef} className="marquee-scroller">
          <div className="marquee-set">
            {items.map((cat) => renderButton(cat, `s1-${cat.id}`))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCatalog() {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const catalogSearchQuery = useUIStore(useShallow((s) => s.catalogSearchQuery));
  const clearCatalogSearch = useUIStore(useShallow((s) => s.clearCatalogSearch));
  const setCatalogSearchTotal = useUIStore(useShallow((s) => s.setCatalogSearchTotal));
  const openCategoryPage = useUIStore(useShallow((s) => s.openCategoryPage));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json() as Promise<{ categories: Category[] }>;
    },
  });

  // Fetch products (with optional search filter)
  const { data: productsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', selectedCategory, sort, page, catalogSearchQuery, stockFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort,
        offset: ((page - 1) * 12).toString(),
        limit: '12',
      });
      if (catalogSearchQuery) {
        params.set('search', catalogSearchQuery);
      }
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (stockFilter === 'in_stock') {
        params.set('inStock', 'true');
      }
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const categories = categoriesData?.categories || [];
  const products = productsData?.products || [];
  const total = productsData?.total || 0;

  // Update catalog search total in the UI store for feedback
  useEffect(() => {
    if (catalogSearchQuery && total > 0) {
      setCatalogSearchTotal(total);
    }
  }, [catalogSearchQuery, total, setCatalogSearchTotal]);

  const handleCategoryChange = useCallback((slug: string) => {
    // Navigate to the dedicated category page
    if (catalogSearchQuery) clearCatalogSearch();
    openCategoryPage(slug);
  }, [catalogSearchQuery, clearCatalogSearch, openCategoryPage]);

  const handleSortChange = useCallback((value: string) => {
    setSort(value);
    setPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    clearCatalogSearch();
    setPage(1);
  }, [clearCatalogSearch]);

  const sectionTitle = catalogSearchQuery
    ? (language === 'ar' ? `نتائج البحث عن "${catalogSearchQuery}"` : `Search results for "${catalogSearchQuery}"`)
    : selectedCategory === 'all'
      ? t('catalog.ourProducts')
      : categories.find((c) => c.slug === selectedCategory)
        ? language === 'ar'
          ? categories.find((c) => c.slug === selectedCategory)!.nameAr
          : categories.find((c) => c.slug === selectedCategory)!.nameEn
        : t('product.all');

  const categoryItems = categories;

  return (
    <section className="w-full">
      {/* Active Search Banner */}
      <AnimatePresence>
        {catalogSearchQuery && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-nabdh-primary/5 border border-nabdh-primary/10">
              <Search className="size-4 text-nabdh-primary shrink-0" />
              <span className="text-sm font-medium text-foreground flex-1 min-w-0">
                {language === 'ar'
                  ? `نتائج البحث عن "${catalogSearchQuery}"`
                  : `Search results for "${catalogSearchQuery}"`}
              </span>
              <Badge variant="secondary" className="shrink-0 text-xs bg-nabdh-primary/10 text-nabdh-primary border-0">
                {total} {language === 'ar' ? 'منتج' : 'products'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="shrink-0 size-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text">{sectionTitle}</h2>
          {!catalogSearchQuery && total > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {total} {t('product.all')}
            </p>
          )}
        </div>

        {/* Sort Dropdown + Filter Button */}
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <div className="relative">
            <Button
              variant={stockFilter !== 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`gap-1.5 ${stockFilter !== 'all' ? 'bg-nabdh-primary text-white' : ''}`}
            >
              <SlidersHorizontal className="size-4" />
              {language === 'ar' ? 'تصفية' : 'Filter'}
            </Button>
            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute end-0 top-full mt-2 bg-background border border-border rounded-xl overflow-hidden z-30 shadow-xl min-w-[150px]"
                >
                  {([
                    { key: 'all' as const, label: language === 'ar' ? 'الكل' : 'All', icon: '📋' },
                    { key: 'in_stock' as const, label: language === 'ar' ? 'متوفر فقط' : 'In stock only', icon: '✅' },
                  ]).map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setStockFilter(opt.key); setShowFilterMenu(false); setPage(1); }}
                      className={`w-full text-start px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
                        stockFilter === opt.key ? 'bg-nabdh-primary/10 text-nabdh-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-[160px] h-9 appearance-none rounded-md border border-input bg-transparent px-3 py-2 pr-8 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 cursor-pointer"
            >
              <option value="newest">{t('product.sort.newest')}</option>
              <option value="price_asc">{t('product.sort.priceAsc')}</option>
              <option value="price_desc">{t('product.sort.priceDesc')}</option>
              <option value="rating">{t('product.sort.popular')}</option>
            </select>
            <ChevronDown className="size-4 opacity-50 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Filter - Infinite Marquee */}
      <InfiniteMarquee
        items={categoryItems}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        language={language}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <PackageOpen className="size-16 text-muted-foreground/40" />
          <p className="text-muted-foreground">{t('common.error')}</p>
          <Button variant="outline" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <PackageOpen className="size-16 text-muted-foreground/40" />
          <p className="text-lg text-muted-foreground">{t('common.noData')}</p>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && !isError && products.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Load More / Pagination */}
      {total > page * 12 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setPage((p) => p + 1)}
            className="glass-card border-0"
          >
            {t('common.showMore')}
          </Button>
        </div>
      )}

      {/* Page indicator */}
      {total > 12 && (
        <div className="flex justify-center mt-4">
          <p className="text-sm text-muted-foreground">
            {page} / {Math.ceil(total / 12)}
          </p>
        </div>
      )}

    </section>
  );
}
