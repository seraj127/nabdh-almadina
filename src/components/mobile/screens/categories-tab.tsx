'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '../lib/mobile-store';
import { normalizeProduct } from '../lib/helpers';
import { LOCAL_SUBCATEGORIES, LOCAL_PRODUCTS } from '../lib/constants';
import { ProductCard } from '../components/product-card';
import type { Product, Category, Subcategory } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronLeft, ChevronRight, Package, Loader2,
  Layers, RefreshCw, Sparkles, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// CATEGORY GROUPS — Premium visual grouping
// ═══════════════════════════════════════════════════════════════════════
interface CategoryGroup {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  image: string;
  gradient: string;
  shadowColor: string;
  slugs: string[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'kitchen',
    nameAr: 'المطبخ وأدواته',
    nameEn: 'Kitchen & Cookware',
    icon: '🍳',
    image: '/categories/cookware.png',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFB347 100%)',
    shadowColor: 'rgba(255, 107, 53, 0.3)',
    slugs: ['cookware', 'kitchen-tools', 'serving-ware', 'cups-pitchers', 'preparation-tools', 'food-storage'],
  },
  {
    id: 'fashion',
    nameAr: 'الأزياء والأحذية',
    nameEn: 'Fashion & Footwear',
    icon: '👗',
    image: '/categories/fashion-women.png',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #FF5722 50%, #FF9800 100%)',
    shadowColor: 'rgba(233, 30, 99, 0.3)',
    slugs: ['fashion-men', 'fashion-women', 'fashion-kids', 'footwear-men', 'footwear-women', 'footwear-kids'],
  },
  {
    id: 'beauty',
    nameAr: 'الجمال والإكسسوارات',
    nameEn: 'Beauty & Accessories',
    icon: '💎',
    image: '/categories/perfumes-oud.png',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #E040FB 50%, #FF80AB 100%)',
    shadowColor: 'rgba(156, 39, 176, 0.3)',
    slugs: ['perfumes-oud', 'accessories'],
  },
  {
    id: 'home',
    nameAr: 'المنزل والعناية',
    nameEn: 'Home & Care',
    icon: '🏠',
    image: '/categories/home-care.png',
    gradient: 'linear-gradient(135deg, #00897B 0%, #26A69A 50%, #80CBC4 100%)',
    shadowColor: 'rgba(0, 137, 123, 0.3)',
    slugs: ['mother-baby', 'home-care'],
  },
  {
    id: 'tech',
    nameAr: 'التقنية والكهربائيات',
    nameEn: 'Tech & Electrical',
    icon: '⚡',
    image: '/categories/electronics.png',
    gradient: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 50%, #90CAF9 100%)',
    shadowColor: 'rgba(21, 101, 192, 0.3)',
    slugs: ['electrical-appliances', 'electronics'],
  },
  {
    id: 'lifestyle',
    nameAr: 'نمط الحياة',
    nameEn: 'Lifestyle',
    icon: '🌿',
    image: '/categories/ornamental-plants.png',
    gradient: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 50%, #A5D6A7 100%)',
    shadowColor: 'rgba(46, 125, 50, 0.3)',
    slugs: ['children-toys', 'pet-supplies', 'ornamental-plants', 'gifts-antiques', 'wall-art'],
  },
];

// Map each slug to its group for quick lookup
const SLUG_TO_GROUP: Record<string, CategoryGroup> = {};
for (const group of CATEGORY_GROUPS) {
  for (const slug of group.slugs) {
    SLUG_TO_GROUP[slug] = group;
  }
}

// Category image path resolver
function getCategoryImage(slug: string, icon?: string): string {
  return `/categories/${slug}.png`;
}

// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════
function getLocalSubcategories(catSlug: string): Subcategory[] {
  return LOCAL_SUBCATEGORIES.filter((s) => s.parentId === catSlug);
}

function getChildrenSubcategories(cat: Category): Subcategory[] {
  if (!cat.children || cat.children.length === 0) return [];
  return cat.children.map((c) => ({
    id: String(c.id ?? ''),
    nameAr: String(c.nameAr ?? ''),
    nameEn: String(c.nameEn ?? ''),
    slug: String(c.slug ?? ''),
    icon: c.icon ? String(c.icon) : undefined,
    image: c.image ? String(c.image) : undefined,
    productCount: Number(c.productCount ?? 0),
    parentId: String(c.parentId ?? cat.slug),
  }));
}

function getSubcategoriesForCategory(cat: Category): Subcategory[] {
  const fromChildren = getChildrenSubcategories(cat);
  if (fromChildren.length > 0) return fromChildren;
  return getLocalSubcategories(cat.slug);
}

function getGroupForCategory(cat: Category): CategoryGroup | undefined {
  return SLUG_TO_GROUP[cat.slug];
}

function groupCategories(categories: Category[]): { group: CategoryGroup; cats: Category[] }[] {
  const result: { group: CategoryGroup; cats: Category[] }[] = [];
  const usedCatIds = new Set<string>();

  for (const group of CATEGORY_GROUPS) {
    const cats = categories.filter((c) => group.slugs.includes(c.slug));
    if (cats.length > 0) {
      result.push({ group, cats });
      cats.forEach((c) => usedCatIds.add(c.id));
    }
  }

  const ungrouped = categories.filter((c) => !usedCatIds.has(c.id));
  if (ungrouped.length > 0) {
    result.push({
      group: {
        id: 'other',
        nameAr: 'أخرى',
        nameEn: 'Other',
        icon: '📦',
        image: '/categories/accessories.png',
        gradient: 'linear-gradient(135deg, #546E7A 0%, #78909C 50%, #B0BEC5 100%)',
        shadowColor: 'rgba(84, 110, 122, 0.3)',
        slugs: [],
      },
      cats: ungrouped,
    });
  }

  return result;
}

// Get group-specific accent color
function getGroupAccentColor(group: CategoryGroup): string {
  if (group.id === 'kitchen') return '#FF6B35';
  if (group.id === 'fashion') return '#E91E63';
  if (group.id === 'beauty') return '#CE93D8';
  if (group.id === 'home') return '#4DB6AC';
  if (group.id === 'tech') return '#64B5F6';
  if (group.id === 'lifestyle') return '#81C784';
  return '#78909C';
}

// ═══════════════════════════════════════════════════════════════════════
// CATEGORIES TAB — Premium Professional Design with Real Images
// ═══════════════════════════════════════════════════════════════════════
export function CategoriesTab({ categories, products, onSelectProduct }: {
  categories: Category[]; products: Product[]; onSelectProduct: (p: Product) => void;
}) {
  const language = useLanguageStore((s) => s.language);
  const t = useLanguageStore((s) => s.t);
  const isRtl = language === 'ar';
  const direction = isRtl ? 'rtl' : 'ltr';

  const selectedCatId = useMobileStore((s) => s.selectedCatId);
  const setSelectedCatId = useMobileStore((s) => s.setSelectedCatId);
  const fetchCategories = useMobileStore((s) => s.fetchCategories);
  const favorites = useMobileStore((s) => s.favorites);
  const toggleFavorite = useMobileStore((s) => s.toggleFavorite);
  const darkMode = useMobileStore((s) => s.darkMode);

  const [selectedSubSlug, setSelectedSubSlug] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [catProducts, setCatProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [catSort, setCatSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [catFilter, setCatFilter] = useState<'all' | 'in_stock' | 'on_sale'>('all');
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const mountTimeRef = useRef(Date.now());

  const selectedCat = useMemo(
    () => (selectedCatId ? categories.find((c) => c.id === selectedCatId) ?? null : null),
    [selectedCatId, categories]
  );

  // The categories-tab search bar now navigates to the full search screen and
  // performs no local filtering, so we always render the full category list.
  const filteredCategories = categories;

  const groupedCategories = useMemo(
    () => groupCategories(filteredCategories),
    [filteredCategories]
  );

  const totalProducts = useMemo(() => categories.reduce((s, c) => s + (c.productCount || 0), 0), [categories]);
  const totalSubcategories = useMemo(() => {
    let count = 0;
    for (const cat of categories) {
      count += getSubcategoriesForCategory(cat).length;
    }
    return count;
  }, [categories]);

  // Auto-fetch categories if empty on mount
  useEffect(() => {
    if (categories.length === 0 && !fetchAttempted) {
      setFetchAttempted(true);
      fetchCategories().catch(() => { /* silent */ });
    }
  }, [categories.length, fetchAttempted, fetchCategories]);

  // When selectedCat changes, immediately set subcategories
  useEffect(() => {
    if (!selectedCat) {
      setSubcategories([]);
      return;
    }

    const subs = getSubcategoriesForCategory(selectedCat);
    setSubcategories(subs);

    if (getChildrenSubcategories(selectedCat).length === 0) {
      const catSlug = selectedCat.slug;
      let cancelled = false;

      (async () => {
        try {
          const res = await fetch(`/api/categories?slug=${encodeURIComponent(catSlug)}`);
          if (res.ok && !cancelled) {
            const data = await res.json();
            const apiChildren: Subcategory[] = (data.category?.children || []).map((child: Record<string, unknown>) => ({
              id: String(child.id ?? ''),
              nameAr: String(child.nameAr ?? ''),
              nameEn: String(child.nameEn ?? ''),
              slug: String(child.slug ?? ''),
              icon: child.icon ? String(child.icon) : undefined,
              image: child.image ? String(child.image) : undefined,
              productCount: Number(child.productCount ?? 0),
              parentId: String(child.parentId ?? catSlug),
            }));

            if (apiChildren.length > 0 && !cancelled) {
              setSubcategories(apiChildren);
            }
          }
        } catch (e) {
          console.warn('Failed to fetch subcategories from API:', e);
        }
      })();

      return () => { cancelled = true; };
    }
  }, [selectedCat]);

  // Fetch products for selected category/subcategory
  useEffect(() => {
    if (!selectedCat) return;
    let cancelled = false;
    setLoadingProducts(true);

    const url = selectedSubSlug
      ? `/api/products?subcategory=${encodeURIComponent(selectedSubSlug)}&limit=20`
      : `/api/products?category=${encodeURIComponent(selectedCat.slug)}&limit=20`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setCatProducts((d.products || []).map(normalizeProduct));
          setLoadingProducts(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          const catId = selectedCat.id;
          const map = new Map<string, Product>();
          for (const p of [...products, ...LOCAL_PRODUCTS]) map.set(p.id, p);
          setCatProducts([...map.values()].filter((p) => p.categoryId === catId));
          setLoadingProducts(false);
        }
      });
    return () => { cancelled = true; };
  }, [selectedCat, selectedSubSlug, products]);

  const handleSelectCategory = useCallback((catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setSelectedCatId(catId);
      setSelectedSubSlug(null);
      setCatProducts([]);
      const subs = getSubcategoriesForCategory(cat);
      setSubcategories(subs);
    }
  }, [categories, setSelectedCatId]);

  const handleBack = useCallback(() => {
    setSelectedCatId(null);
    setSelectedSubSlug(null);
    setSubcategories([]);
    setCatProducts([]);
  }, [setSelectedCatId]);

  const handleRetry = useCallback(() => {
    setFetchAttempted(false);
    setRetryCount((r) => r + 1);
  }, []);

  const handleImgError = useCallback((slug: string) => {
    setImgErrors((prev) => ({ ...prev, [slug]: true }));
  }, []);

  const timeSinceMount = Date.now() - mountTimeRef.current;
  const showLoading = categories.length === 0 && (timeSinceMount < 5000 || !fetchAttempted);

  // ═══════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════
  if (categories.length === 0 && showLoading) {
    return (
      <div className="pb-20 min-h-screen" dir={direction}>
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #004B63 0%, #00897B 100%)' }}>
          <div className="px-5 pt-12 pb-6">
            <div className="h-6 w-36 rounded-lg bg-white/20 animate-pulse mb-3" />
            <div className="h-4 w-52 rounded-lg bg-white/10 animate-pulse" />
          </div>
        </div>
        <div className="px-4 mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className={`h-5 w-28 rounded ${darkMode ? 'bg-[#21262D]' : 'bg-[#F3F4F6]'} animate-pulse`} />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className={`rounded-2xl ${darkMode ? 'bg-[#161B22]' : 'bg-white'} border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} animate-pulse overflow-hidden`}>
                    <div className={`h-24 ${darkMode ? 'bg-[#21262D]' : 'bg-[#F3F4F6]'}`} />
                    <div className="px-3 pb-3 pt-2 space-y-1.5">
                      <div className={`h-3 w-4/5 mx-auto rounded ${darkMode ? 'bg-[#21262D]' : 'bg-[#F3F4F6]'}`} />
                      <div className={`h-2 w-1/2 mx-auto rounded ${darkMode ? 'bg-[#21262D]' : 'bg-[#F3F4F6]'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // EMPTY STATE
  // ═══════════════════════════════════════════════════════════════════
  if (categories.length === 0) {
    return (
      <div className="pb-20 min-h-screen" dir={direction}>
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #004B63 0%, #00897B 100%)' }}>
          <div className="px-5 pt-12 pb-6">
            <h1 className="text-white text-xl font-bold">{isRtl ? 'الأقسام' : 'Categories'}</h1>
          </div>
        </div>
        <div className="py-24 text-center px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-20 h-20 mx-auto mb-5 rounded-2xl ${darkMode ? 'bg-[#161B22]' : 'bg-white'} border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} flex items-center justify-center`}
          >
            <Package size={32} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          </motion.div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-base font-semibold`}>{isRtl ? 'لا توجد أقسام حالياً' : 'No categories available'}</p>
          <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-2`}>{isRtl ? 'سيتم إضافة أقسام قريباً' : 'Categories will be added soon'}</p>
          <button
            onClick={handleRetry}
            className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #004B63, #00897B)', color: 'white' }}
          >
            <RefreshCw size={15} />
            {isRtl ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // CATEGORY DETAIL VIEW — When a category is selected
  // ═══════════════════════════════════════════════════════════════════
  if (selectedCat) {
    const catName = isRtl ? selectedCat.nameAr : selectedCat.nameEn;
    const catGroup = getGroupForCategory(selectedCat);
    const catImage = getCategoryImage(selectedCat.slug);

    return (
      <div className="pb-20 min-h-screen" dir={direction}>
        {/* Premium Header with Full Image Banner */}
        <div className="relative overflow-hidden">
          {/* Full-width category image */}
          <div className="relative w-full aspect-[16/9]">
            {!imgErrors[selectedCat.slug] ? (
              <Image
                src={catImage}
                alt={catName}
                fill
                className="object-cover"
                sizes="(max-width: 430px) 100vw, 430px"
                style={{ filter: 'brightness(0.5)' }}
                onError={() => handleImgError(selectedCat.slug)}
              />
            ) : (
              <div style={{ background: catGroup?.gradient || 'linear-gradient(135deg, #004B63 0%, #00897B 100%)' }} className="absolute inset-0" />
            )}
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
            {/* Group color tint */}
            <div
              className="absolute inset-0 opacity-40"
              style={{ background: catGroup?.gradient || 'transparent' }}
            />
          </div>

          {/* Decorative circles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -end-16 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -start-12 w-40 h-40 rounded-full bg-white/5" />
          </div>

          {/* Content overlay on image */}
          <div className="absolute inset-0 flex flex-col justify-end px-5 pb-5 pt-12">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleBack}
                whileTap={{ scale: 0.85 }}
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center border border-white/15 flex-shrink-0"
              >
                {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </motion.button>
              <div className="flex-1 min-w-0">
                <h1 className="text-white text-xl font-bold truncate drop-shadow-lg">{catName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {subcategories.length > 0 && (
                    <span className="text-white/80 text-xs font-medium drop-shadow">
                      {subcategories.length} {isRtl ? 'تصنيف فرعي' : 'subcategories'}
                    </span>
                  )}
                  {subcategories.length > 0 && catProducts.length > 0 && (
                    <span className="text-white/40">·</span>
                  )}
                  {catProducts.length > 0 && (
                    <span className="text-white/80 text-xs font-medium drop-shadow">
                      {catProducts.length} {isRtl ? 'منتج' : 'products'}
                    </span>
                  )}
                </div>
              </div>
              {/* Category icon badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/15 backdrop-blur-md border-2 border-white/20 shadow-lg flex-shrink-0 text-2xl"
              >
                {selectedCat.icon || '📦'}
              </motion.div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{ background: catGroup?.gradient || 'linear-gradient(135deg, #004B63, #00897B)' }}
          />
        </div>

        {/* Subcategory Section */}
        {subcategories.length > 0 && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={13} className="text-[#4DB6AC]" />
              <span className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                {isRtl ? 'التصنيفات الفرعية' : 'Subcategories'}
              </span>
              <div className={`flex-1 h-px ${darkMode ? 'bg-[#21262D]' : 'bg-[#F3F4F6]'}`} />
              <span className="text-[11px] text-[#4DB6AC] font-bold bg-[#004B63]/15 px-2 py-0.5 rounded-full">
                {subcategories.length}
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelectedSubSlug(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  selectedSubSlug === null
                    ? 'text-white shadow-lg'
                    : `${darkMode ? 'bg-[#161B22]' : 'bg-white'} border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`
                }`}
                style={selectedSubSlug === null ? { background: catGroup?.gradient || 'linear-gradient(135deg, #004B63, #00897B)' } : {}}
              >
                {isRtl ? 'الكل' : 'All'}
              </motion.button>

              {subcategories.map((s, i) => {
                const subLabel = isRtl ? s.nameAr : s.nameEn;
                const isSelected = selectedSubSlug === s.slug;
                return (
                  <motion.button
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02, duration: 0.15 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedSubSlug(isSelected ? null : s.slug)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isSelected
                        ? 'text-white shadow-lg'
                        : `${darkMode ? 'bg-[#161B22]' : 'bg-white'} border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} ${darkMode ? 'text-gray-300' : 'text-gray-700'} ${darkMode ? 'hover:bg-[#21262D]' : 'hover:bg-[#F3F4F6]'}`
                    }`}
                    style={isSelected ? { background: catGroup?.gradient || 'linear-gradient(135deg, #004B63, #00897B)' } : {}}
                  >
                    {s.icon && <span className="text-sm leading-none">{s.icon}</span>}
                    <span className="whitespace-nowrap">{subLabel}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* Products */}
        <div className="px-4 mt-3">
          {/* Sort + Filter bar */}
          {catProducts.length > 1 && (
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
                {catProducts.filter((p) => {
                  if (catFilter === 'in_stock') return p.inStock !== false;
                  if (catFilter === 'on_sale') return p.comparePrice && p.comparePrice > p.price;
                  return true;
                }).length} {isRtl ? 'منتج' : 'products'}
                {catFilter !== 'all' && (
                  <span className="text-[#4DB6AC] mr-1">• {catFilter === 'in_stock' ? (isRtl ? 'متوفر' : 'In stock') : (isRtl ? 'بعرض' : 'On sale')}</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {/* Filter Button */}
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      catFilter !== 'all'
                        ? 'bg-[#004B63]/20 border border-[#004B63]/40 text-[#4DB6AC]'
                        : `${darkMode ? 'bg-[#161B22]' : 'bg-white'} border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`
                    }`}
                  >
                    <SlidersHorizontal size={12} />
                    {isRtl ? 'تصفية' : 'Filter'}
                  </motion.button>
                  <AnimatePresence>
                    {showFilterMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute end-0 top-full mt-1 ${darkMode ? 'bg-[#161B22]' : 'bg-white'} border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} rounded-xl overflow-hidden z-30 shadow-xl min-w-[140px]`}
                      >
                        {([
                          { key: 'all' as const, label: isRtl ? 'الكل' : 'All', icon: '📋' },
                          { key: 'in_stock' as const, label: isRtl ? 'متوفر فقط' : 'In stock only', icon: '✅' },
                          { key: 'on_sale' as const, label: isRtl ? 'بعرض خاص' : 'On sale', icon: '🏷️' },
                        ]).map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => { setCatFilter(opt.key); setShowFilterMenu(false); }}
                            className={`w-full text-start px-4 py-2.5 text-xs font-medium transition-colors flex items-center gap-2 ${
                              catFilter === opt.key ? 'bg-[#004B63]/20 text-[#4DB6AC]' : `${darkMode ? 'text-gray-300' : 'text-gray-700'} ${darkMode ? 'hover:bg-[#21262D]' : 'hover:bg-[#F3F4F6]'}`
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
                {/* Sort Button */}
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${darkMode ? 'bg-[#161B22]' : 'bg-white'} border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <ArrowUpDown size={12} />
                    {catSort === 'newest' ? (isRtl ? 'الأحدث' : 'Newest') :
                     catSort === 'price_asc' ? (isRtl ? 'الأرخص' : 'Cheapest') :
                     (isRtl ? 'الأغلى' : 'Expensive')}
                  </motion.button>
                  <AnimatePresence>
                    {showSortMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute end-0 top-full mt-1 ${darkMode ? 'bg-[#161B22]' : 'bg-white'} border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} rounded-xl overflow-hidden z-30 shadow-xl min-w-[120px]`}
                      >
                        {([
                          { key: 'newest' as const, label: isRtl ? 'الأحدث' : 'Newest' },
                          { key: 'price_asc' as const, label: isRtl ? 'الأرخص أولاً' : 'Cheapest first' },
                          { key: 'price_desc' as const, label: isRtl ? 'الأغلى أولاً' : 'Expensive first' },
                        ]).map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => { setCatSort(opt.key); setShowSortMenu(false); }}
                            className={`w-full text-start px-4 py-2.5 text-xs font-medium transition-colors ${
                              catSort === opt.key ? 'bg-[#004B63]/20 text-[#4DB6AC]' : `${darkMode ? 'text-gray-300' : 'text-gray-700'} ${darkMode ? 'hover:bg-[#21262D]' : 'hover:bg-[#F3F4F6]'}`
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`h-56 rounded-2xl ${darkMode ? 'bg-[#161B22]' : 'bg-white'} animate-pulse border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'}`} />
              ))}
            </div>
          ) : catProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${darkMode ? 'bg-[#161B22]' : 'bg-white'} border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} flex items-center justify-center`}>
                <Search size={24} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm font-semibold`}>
                {isRtl ? 'لا توجد منتجات في هذا القسم' : 'No products in this category'}
              </p>
              {selectedSubSlug && (
                <button
                  onClick={() => setSelectedSubSlug(null)}
                  className="mt-3 text-[#4DB6AC] text-xs font-semibold"
                >
                  {isRtl ? 'عرض الكل' : 'View all'}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              {[...catProducts]
                .filter((p) => {
                  if (catFilter === 'in_stock') return p.inStock !== false;
                  if (catFilter === 'on_sale') return p.comparePrice && p.comparePrice > p.price;
                  return true;
                })
                .sort((a, b) => {
                if (catSort === 'price_asc') return a.price - b.price;
                if (catSort === 'price_desc') return b.price - a.price;
                return 0; // newest = default order
              }).map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isFavorite={favorites.includes(p.id)}
                  onToggleFavorite={() => toggleFavorite(p.id)}
                  onSelect={() => onSelectProduct(p)}
                  onAddToCart={() => {}}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN CATEGORIES VIEW — Grouped Premium Layout with Real Images
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="pb-20 min-h-screen bg-[#0D1117]" dir={direction}>
      {/* Premium Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #004B63 0%, #00897B 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -end-20 w-60 h-60 rounded-full bg-white/8" />
          <div className="absolute -bottom-16 -start-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute top-12 end-8 w-24 h-24 rounded-full bg-white/5" />
        </div>

        <div className="relative px-5 pt-12 pb-5">
          {/* Top bar */}
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              onClick={() => useMobileStore.getState().setActiveTab('home')}
              whileTap={{ scale: 0.85 }}
              className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm text-white flex items-center justify-center border border-white/10"
              aria-label={isRtl ? 'رجوع' : 'Back'}
            >
              {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </motion.button>
            <div className="flex-1">
              <h1 className="text-white text-xl font-bold">{isRtl ? 'الأقسام' : 'Categories'}</h1>
              <p className="text-white/60 text-xs mt-0.5">{isRtl ? 'تصفح جميع الأقسام والتصنيفات' : 'Browse all sections & categories'}</p>
            </div>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8"
            >
              <Sparkles size={28} className="text-white/40" />
            </motion.div>
          </div>

          {/* Search bar — navigates to the global search screen (consistent with Home) */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => useMobileStore.getState().setScreen('search')}
            className="relative w-full flex items-center gap-2.5 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 transition-colors text-start"
            style={{ paddingInlineStart: '2.5rem', paddingInlineEnd: '0.75rem' }}
          >
            <Search size={16} className={`absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-white/40 pointer-events-none`} />
            <span className="text-sm text-white/40 select-none">
              {isRtl ? 'ابحث عن منتج...' : 'Search products...'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: categories.length, label: isRtl ? 'أقسام' : 'Sections', color: '#4DB6AC' },
            { value: totalProducts, label: isRtl ? 'منتجات' : 'Products', color: '#FF6F61' },
            { value: totalSubcategories, label: isRtl ? 'فرعية' : 'Subs', color: '#FFB347' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`${darkMode ? 'bg-[#161B22]' : 'bg-white'} rounded-xl p-3 border ${darkMode ? 'border-[#30363D]' : 'border-[#E5E7EB]'} text-center`}
            >
              <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'} font-semibold`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Category Groups */}
      <div className="px-4 mt-5 space-y-5">
        {groupedCategories.map(({ group, cats }, groupIdx) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIdx * 0.06, duration: 0.3 }}
          >
            {/* Group Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-9 h-9 rounded-lg overflow-hidden shadow-md flex-shrink-0"
                style={{ boxShadow: `0 4px 12px ${group.shadowColor}` }}
              >
                {!imgErrors[group.id] ? (
                  <Image
                    src={group.image}
                    alt={isRtl ? group.nameAr : group.nameEn}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                    onError={() => handleImgError(group.id)}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-base"
                    style={{ background: group.gradient }}
                  >
                    {group.icon}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-gray-200">
                  {isRtl ? group.nameAr : group.nameEn}
                </h2>
                <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'} font-medium`}>
                  {cats.length} {isRtl ? 'قسم' : 'sections'}
                </p>
              </div>
              <div
                className="w-1 h-6 rounded-full"
                style={{ background: group.gradient }}
              />
            </div>

            {/* Category Cards — Full image cards with overlay text */}
            <div className="grid grid-cols-2 gap-3">
              {cats.map((cat, catIdx) => {
                const name = isRtl ? cat.nameAr : cat.nameEn;
                const subCount = getSubcategoriesForCategory(cat).length;
                const catImg = getCategoryImage(cat.slug);
                const accentColor = getGroupAccentColor(group);

                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className="group relative rounded-2xl overflow-hidden transition-all duration-200 active:scale-[0.97] text-start shadow-lg"
                    style={{ boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)` }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: catIdx * 0.03, duration: 0.2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Full Image — square aspect ratio matches 1024x1024 */}
                    <div className="relative aspect-square w-full">
                      {!imgErrors[cat.slug] ? (
                        <Image
                          src={catImg}
                          alt={name}
                          fill
                          className="object-cover transition-transform duration-500 group-active:scale-105"
                          sizes="(max-width: 430px) 48vw, 200px"
                          onError={() => handleImgError(cat.slug)}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-5xl"
                          style={{ background: group.shadowColor }}
                        >
                          {cat.icon || '📦'}
                        </div>
                      )}

                      {/* Dark gradient overlay — bottom heavy for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

                      {/* Top accent line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[3px]"
                        style={{ background: group.gradient }}
                      />

                      {/* Subcategory count — top start */}
                      {subCount > 0 && (
                        <div
                          className="absolute top-2.5 start-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-md"
                          style={{ background: 'rgba(0,0,0,0.45)', color: accentColor, border: `1px solid ${accentColor}44` }}
                        >
                          {subCount} {isRtl ? 'تصنيف' : 'sub'}
                        </div>
                      )}

                      {/* Product count — top end */}
                      <div
                        className="absolute top-2.5 end-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-md"
                        style={{ background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {cat.productCount} {isRtl ? 'منتج' : 'prod'}
                      </div>

                      {/* Category name + icon — bottom overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg flex-shrink-0">{cat.icon || '📦'}</span>
                          <span className="text-[13px] font-bold text-white leading-tight drop-shadow-lg">
                            {name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search empty state */}
      {/* Previously-gated "no results" state removed — search field now navigates to the real search screen */}

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}

// trigger rebuild after CI keystore fix

// trigger rebuild after gradle password env fix

// trigger after gradlew bash fix
