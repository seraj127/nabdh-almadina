'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Package,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  PackageOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { ProductCard } from './product-card';
import { type Product, categoryGradients, defaultGradient } from './lib/shared';

// ─── Types ────
interface Subcategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  productCount: number;
}

interface CategoryData {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  productCount: number;
  children: Subcategory[];
}

// ─── Animation Variants ────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ─── Subcategory Pill ────
function SubcategoryPill({
  sub,
  isSelected,
  onClick,
  language,
}: {
  sub: Subcategory;
  isSelected: boolean;
  onClick: () => void;
  language: 'ar' | 'en';
}) {
  const name = language === 'ar' ? sub.nameAr : sub.nameEn;

  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 min-w-0',
        isSelected
          ? 'nabdh-gradient text-white shadow-lg shadow-nabdh-primary/25'
          : 'glass-card hover:bg-white/80 text-foreground border border-white/30'
      )}
    >
      <span className="text-lg shrink-0">{sub.icon || '🏷️'}</span>
      <span className="truncate">{name}</span>
      {sub.productCount > 0 && (
        <span
          className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full shrink-0',
            isSelected
              ? 'bg-white/20 text-white'
              : 'bg-nabdh-primary/10 text-nabdh-primary'
          )}
        >
          {sub.productCount}
        </span>
      )}
    </motion.button>
  );
}

// ─── Product Skeleton ────
function ProductSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
}

// ─── Main Component ────
export function CategoryPage() {
  const { t, language, direction } = useLanguageStore(
    useShallow((s) => ({ t: s.t, language: s.language, direction: s.direction }))
  );
  const { selectedCategorySlug, clearAuthView, clearCategoryPage } = useUIStore(
    useShallow((s) => ({
      selectedCategorySlug: s.selectedCategorySlug,
      clearAuthView: s.clearAuthView,
      clearCategoryPage: s.clearCategoryPage,
    }))
  );

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const isRTL = direction === 'rtl';

  // ─── Fetch category data ────
  const {
    data: categoryData,
    isLoading: categoryLoading,
    isError: categoryError,
  } = useQuery({
    queryKey: ['category', selectedCategorySlug],
    queryFn: async () => {
      if (!selectedCategorySlug) return null;
      const res = await fetch(`/api/categories?slug=${selectedCategorySlug}&includeChildren=true`);
      if (!res.ok) throw new Error('Failed to fetch category');
      const data = await res.json();
      return data.category as CategoryData;
    },
    enabled: !!selectedCategorySlug,
  });

  // ─── Fetch products ────
  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch,
  } = useQuery({
    queryKey: ['category-products', selectedCategorySlug, selectedSubcategory, sort, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort,
        offset: ((page - 1) * 20).toString(),
        limit: '20',
      });
      if (selectedSubcategory) {
        params.set('subcategory', selectedSubcategory);
      } else if (selectedCategorySlug) {
        params.set('category', selectedCategorySlug);
      }
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json() as Promise<{ products: Product[]; total: number }>;
    },
    enabled: !!selectedCategorySlug,
  });

  const category = categoryData;
  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;
  const subcategories = category?.children || [];

  const handleSubcategoryClick = useCallback((slug: string) => {
    if (selectedSubcategory === slug) {
      setSelectedSubcategory(null);
    } else {
      setSelectedSubcategory(slug);
    }
    setPage(1);
  }, [selectedSubcategory]);

  const handleShowAll = useCallback(() => {
    setSelectedSubcategory(null);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSort(value);
    setPage(1);
  }, []);

  const handleBack = useCallback(() => {
    clearCategoryPage();
    clearAuthView();
  }, [clearCategoryPage, clearAuthView]);

  const categoryName = category
    ? language === 'ar'
      ? category.nameAr
      : category.nameEn
    : '';

  const categoryDescription = category
    ? language === 'ar'
      ? category.descriptionAr
      : category.descriptionEn
    : '';

  const gradient = selectedCategorySlug
    ? categoryGradients[selectedCategorySlug] || defaultGradient
    : defaultGradient;

  // ─── Render ────
  if (!selectedCategorySlug) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4" dir={direction}>
        <PackageOpen className="size-16 text-muted-foreground/40" />
        <p className="text-muted-foreground">{t('common.noData')}</p>
        <Button variant="outline" onClick={handleBack}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir={direction}>
      {/* ─── Breadcrumb ──── */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 hover:text-nabdh-primary transition-colors"
            >
              <Home className="size-3.5" />
              <span>{t('nav.home')}</span>
            </button>
            <span className="text-muted-foreground/50">
              {isRTL ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </span>
            <span className="text-foreground font-medium truncate">{categoryName}</span>
          </nav>
        </div>
      </div>

      {/* ─── Hero Banner ──── */}
      <div
        className={cn(
          'relative overflow-hidden bg-gradient-to-br',
          gradient
        )}
      >
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -end-1/4 size-[500px] rounded-full bg-white/5" />
          <div className="absolute -bottom-1/4 -start-1/4 size-[400px] rounded-full bg-white/5" />
          <div className="absolute top-1/2 start-1/3 size-32 rounded-full bg-white/5" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-start gap-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full"
            >
              {isRTL ? <ArrowRight className="size-5" /> : <ArrowLeft className="size-5" />}
            </Button>
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {category?.icon && (
                    <span className="text-3xl sm:text-4xl">{category.icon}</span>
                  )}
                  <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-sm">
                    {categoryLoading ? (
                      <Skeleton className="h-10 w-48 bg-white/20" />
                    ) : (
                      categoryName
                    )}
                  </h1>
                </div>
                {categoryDescription && (
                  <p className="text-white/80 text-sm sm:text-base max-w-xl mb-4">
                    {categoryDescription}
                  </p>
                )}
                {!categoryLoading && (
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Package className="size-4" />
                      {totalProducts} {language === 'ar' ? 'منتج' : 'products'}
                    </span>
                    {subcategories.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <LayoutGrid className="size-4" />
                        {subcategories.length} {language === 'ar' ? 'تصنيفات فرعية' : 'subcategories'}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Subcategories Section ──── */}
      {subcategories.length > 0 && (
        <div className="bg-white/30 dark:bg-gray-900/30 border-b border-border/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold gradient-text">
                {language === 'ar' ? 'التصنيفات الفرعية' : 'Subcategories'}
              </h2>
              {selectedSubcategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShowAll}
                  className="text-nabdh-primary hover:text-nabdh-primary/80 text-xs"
                >
                  {language === 'ar' ? 'عرض الكل' : 'Show All'}
                </Button>
              )}
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-3"
            >
              {/* "All" pill */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShowAll}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-300',
                  !selectedSubcategory
                    ? 'nabdh-gradient text-white shadow-lg shadow-nabdh-primary/25'
                    : 'glass-card hover:bg-white/80 text-foreground border border-white/30'
                )}
              >
                <LayoutGrid className="size-4" />
                <span>{language === 'ar' ? 'الكل' : 'All'}</span>
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    !selectedSubcategory
                      ? 'bg-white/20 text-white'
                      : 'bg-nabdh-primary/10 text-nabdh-primary'
                  )}
                >
                  {category?.productCount || 0}
                </span>
              </motion.button>

              {/* Subcategory pills */}
              {subcategories.map((sub) => (
                <SubcategoryPill
                  key={sub.id}
                  sub={sub}
                  isSelected={selectedSubcategory === sub.slug}
                  onClick={() => handleSubcategoryClick(sub.slug)}
                  language={language}
                />
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* ─── Toolbar ──── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold gradient-text">
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </h2>
            <Badge variant="secondary" className="text-xs bg-nabdh-primary/10 text-nabdh-primary border-0">
              {totalProducts}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="size-4 text-muted-foreground hidden sm:block" />
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-9 appearance-none rounded-md border border-input bg-transparent px-3 py-2 pe-8 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 cursor-pointer"
              >
                <option value="newest">{t('product.sort.newest')}</option>
                <option value="price_asc">{t('product.sort.priceAsc')}</option>
                <option value="price_desc">{t('product.sort.priceDesc')}</option>
                <option value="popular">{t('product.sort.popular')}</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center border border-input rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-nabdh-primary/10 text-nabdh-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-nabdh-primary/10 text-nabdh-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Product Content ──── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Loading State */}
        {(productsLoading || categoryLoading) && (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'flex flex-col gap-4'
            )}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!productsLoading && !categoryLoading && productsError && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <PackageOpen className="size-16 text-muted-foreground/40" />
            <p className="text-muted-foreground">{t('common.error')}</p>
            <Button variant="outline" onClick={() => refetch()}>
              {t('common.retry')}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!productsLoading && !categoryLoading && !productsError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <PackageOpen className="size-16 text-muted-foreground/40" />
            <p className="text-lg text-muted-foreground">{t('common.noData')}</p>
            {selectedSubcategory && (
              <Button variant="outline" size="sm" onClick={handleShowAll}>
                {language === 'ar' ? 'عرض جميع المنتجات' : 'View all products'}
              </Button>
            )}
          </div>
        )}

        {/* Product Grid/List */}
        {!productsLoading && !categoryLoading && !productsError && products.length > 0 && (
          <motion.div
            layout
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'flex flex-col gap-4'
            )}
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
        {totalProducts > page * 20 && (
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
        {totalProducts > 20 && (
          <div className="flex justify-center mt-4">
            <p className="text-sm text-muted-foreground">
              {page} / {Math.ceil(totalProducts / 20)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
