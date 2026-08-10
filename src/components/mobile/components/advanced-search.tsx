'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, RotateCcw, ChevronDown, Star, Package, Heart, Plus } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '../lib/mobile-store';
import { useCartStore } from '@/stores/cart-store';
import type { Product, Category } from '../lib/types';

// ─── Price Preset ────────────────────────────────────────────────
interface PricePreset {
  key: string;
  min: number;
  max: number;
  labelAr: string;
  labelEn: string;
}

const PRICE_PRESETS: PricePreset[] = [
  { key: 'under50', min: 0, max: 50, labelAr: 'أقل من 50', labelEn: 'Under 50' },
  { key: '50-200', min: 50, max: 200, labelAr: '50-200', labelEn: '50-200' },
  { key: '200-500', min: 200, max: 500, labelAr: '200-500', labelEn: '200-500' },
  { key: 'over500', min: 500, max: Infinity, labelAr: 'أكثر من 500', labelEn: 'Over 500' },
];

// ─── Sort Option ─────────────────────────────────────────────────
type SortOption = 'newest' | 'priceLow' | 'priceHigh' | 'topRated' | 'bestSelling';

// ─── Props ───────────────────────────────────────────────────────
interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  onSelectProduct: (product: Product) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

// ─── Component ───────────────────────────────────────────────────
export default function AdvancedSearch({
  isOpen,
  onClose,
  products,
  categories,
  onSelectProduct,
  favorites,
  toggleFavorite,
}: AdvancedSearchProps) {
  const { t, language } = useLanguageStore();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const darkMode = useMobileStore((s) => s.darkMode);
  const addItem = useCartStore((s) => s.addItem);

  // ─── State ────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPricePreset, setSelectedPricePreset] = useState<string | null>(null);
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ─── Computed: min/max price from preset or custom ────────────
  const priceMin = useMemo(() => {
    if (selectedPricePreset) {
      const preset = PRICE_PRESETS.find((p) => p.key === selectedPricePreset);
      return preset?.min ?? 0;
    }
    return customMinPrice ? Number(customMinPrice) : 0;
  }, [selectedPricePreset, customMinPrice]);

  const priceMax = useMemo(() => {
    if (selectedPricePreset) {
      const preset = PRICE_PRESETS.find((p) => p.key === selectedPricePreset);
      return preset?.max ?? Infinity;
    }
    return customMaxPrice ? Number(customMaxPrice) : Infinity;
  }, [selectedPricePreset, customMaxPrice]);

  // ─── Filtered & sorted products ──────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Text search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.nameAr.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          (p.descriptionAr && p.descriptionAr.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Price range filter
    result = result.filter((p) => p.price >= priceMin && p.price <= priceMax);

    // Sort
    switch (sortOption) {
      case 'newest':
        // default order (products as-is from API, newest first)
        break;
      case 'priceLow':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'topRated':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'bestSelling':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
    }

    return result;
  }, [products, query, selectedCategory, priceMin, priceMax, sortOption]);

  // ─── Active filters (for tags) ───────────────────────────────
  const activeFilters = useMemo(() => {
    const filters: { key: string; label: string; onRemove: () => void }[] = [];

    if (selectedCategory) {
      const cat = categories.find((c) => c.id === selectedCategory);
      if (cat) {
        filters.push({
          key: 'category',
          label: language === 'ar' ? cat.nameAr : cat.nameEn,
          onRemove: () => setSelectedCategory(null),
        });
      }
    }

    if (selectedPricePreset) {
      const preset = PRICE_PRESETS.find((p) => p.key === selectedPricePreset);
      if (preset) {
        filters.push({
          key: 'pricePreset',
          label: language === 'ar' ? preset.labelAr : preset.labelEn,
          onRemove: () => setSelectedPricePreset(null),
        });
      }
    } else if (customMinPrice || customMaxPrice) {
      const label =
        customMinPrice && customMaxPrice
          ? `${customMinPrice} - ${customMaxPrice}`
          : customMinPrice
            ? `${language === 'ar' ? 'من' : 'From'} ${customMinPrice}`
            : `${language === 'ar' ? 'حتى' : 'Up to'} ${customMaxPrice}`;
      filters.push({
        key: 'customPrice',
        label,
        onRemove: () => {
          setCustomMinPrice('');
          setCustomMaxPrice('');
        },
      });
    }

    if (sortOption !== 'newest') {
      filters.push({
        key: 'sort',
        label: t(`mobile.search.${sortOption}`),
        onRemove: () => setSortOption('newest'),
      });
    }

    return filters;
  }, [selectedCategory, selectedPricePreset, customMinPrice, customMaxPrice, sortOption, categories, language, t]);

  // ─── Reset all filters ───────────────────────────────────────
  const resetFilters = useCallback(() => {
    setQuery('');
    setSelectedCategory(null);
    setSelectedPricePreset(null);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setSortOption('newest');
    inputRef.current?.focus();
  }, []);

  // ─── Add to cart handler ─────────────────────────────────────
  const handleAddToCart = useCallback((product: Product) => {
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: product.mainImage || product.image || '',
      stock: product.stock || 99,
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 1200);
  }, [addItem]);

  // ─── Close handler ───────────────────────────────────────────
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ─── Sort options config ─────────────────────────────────────
  const sortOptions: { value: SortOption; labelKey: string }[] = [
    { value: 'newest', labelKey: 'mobile.search.newest' },
    { value: 'priceLow', labelKey: 'mobile.search.priceLow' },
    { value: 'priceHigh', labelKey: 'mobile.search.priceHigh' },
    { value: 'topRated', labelKey: 'mobile.search.topRated' },
    { value: 'bestSelling', labelKey: 'mobile.search.bestSelling' },
  ];

  const resultsText = t('mobile.search.results').replace('{count}', String(filteredProducts.length));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-[100] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Main Panel */}
          <motion.div
            className="relative z-10 flex flex-col h-full"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring' as const, damping: 28, stiffness: 300 }}
            dir={direction}
          >
            {/* ── Header with gradient ── */}
            <div
              className="relative overflow-hidden shrink-0"
              style={{ background: 'linear-gradient(135deg, #003545 0%, #004B63 40%, #006B8A 70%, #00897B 100%)' }}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />

              <div className="relative z-10 px-4 pt-10 pb-4">
                {/* Top bar: close + title */}
                <div className="flex items-center justify-between mb-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15"
                    aria-label={t('common.close')}
                  >
                    <X size={18} className="text-white" />
                  </motion.button>
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    <Search size={16} />
                    {t('search.title')}
                  </h2>
                  <div className="w-9" /> {/* Spacer for centering */}
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search
                    size={18}
                    className={`absolute ${direction === 'rtl' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`}
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('mobile.home.searchPlaceholder')}
                    className={`w-full ${direction === 'rtl' ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-3 rounded-xl bg-white dark:bg-[#151D2E] text-sm outline-none shadow-lg placeholder:text-gray-400 border border-gray-100/50 dark:border-[#1E2A42]/50`}
                    dir={direction}
                  />
                  {query && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => {
                        setQuery('');
                        inputRef.current?.focus();
                      }}
                      className={`absolute ${direction === 'rtl' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-[#1E2A42] flex items-center justify-center`}
                    >
                      <X size={12} className="text-gray-500 dark:text-gray-400" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Filters Section (scrollable) ── */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0B1120]">
              {/* Category Filter */}
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <SlidersHorizontal size={12} />
                  {t('mobile.search.filter')} - {t('mobile.home.categories')}
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {/* All Categories chip */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(null)}
                    className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
                      selectedCategory === null
                        ? 'bg-[#004B63] text-white border-[#004B63] dark:bg-[#00897B] dark:border-[#00897B]'
                        : 'bg-white dark:bg-[#151D2E] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1E2A42]'
                    }`}
                  >
                    {t('mobile.search.allCategories')}
                  </motion.button>
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'bg-[#004B63] text-white border-[#004B63] dark:bg-[#00897B] dark:border-[#00897B]'
                          : 'bg-white dark:bg-[#151D2E] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1E2A42]'
                      }`}
                    >
                      {cat.icon && <span className="text-sm">{cat.icon}</span>}
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="mx-4 h-px bg-gray-100 dark:bg-[#1A2540]" />

              {/* Price Range */}
              <div className="px-4 py-3">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                  {t('mobile.search.priceRange')} ({t('product.currency')})
                </h3>
                {/* Preset buttons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRICE_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.key}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedPricePreset(selectedPricePreset === preset.key ? null : preset.key);
                        setCustomMinPrice('');
                        setCustomMaxPrice('');
                      }}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        selectedPricePreset === preset.key
                          ? 'bg-[#004B63] text-white border-[#004B63] dark:bg-[#00897B] dark:border-[#00897B]'
                          : 'bg-white dark:bg-[#151D2E] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#1E2A42]'
                      }`}
                    >
                      {language === 'ar' ? preset.labelAr : preset.labelEn}
                    </motion.button>
                  ))}
                </div>
                {/* Custom min/max inputs */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customMinPrice}
                    onChange={(e) => {
                      setCustomMinPrice(e.target.value);
                      setSelectedPricePreset(null);
                    }}
                    placeholder={language === 'ar' ? 'الحد الأدنى' : 'Min'}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#151D2E] text-xs outline-none border border-gray-200 dark:border-[#1E2A42] text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
                    dir="ltr"
                  />
                  <span className="text-gray-400 text-xs">—</span>
                  <input
                    type="number"
                    value={customMaxPrice}
                    onChange={(e) => {
                      setCustomMaxPrice(e.target.value);
                      setSelectedPricePreset(null);
                    }}
                    placeholder={language === 'ar' ? 'الحد الأقصى' : 'Max'}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#151D2E] text-xs outline-none border border-gray-200 dark:border-[#1E2A42] text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="mx-4 h-px bg-gray-100 dark:bg-[#1A2540]" />

              {/* Sort Options */}
              <div className="px-4 py-3">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ChevronDown size={12} />
                  {t('mobile.search.sortBy')}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {sortOptions.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSortOption(opt.value)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                      style={{
                        background:
                          sortOption === opt.value
                            ? 'linear-gradient(135deg, rgba(0,75,99,0.08) 0%, rgba(0,137,123,0.08) 100%)'
                            : 'transparent',
                      }}
                    >
                      {/* Radio indicator */}
                      <div className="relative w-5 h-5 shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border-2 transition-colors ${
                            sortOption === opt.value
                              ? 'border-[#004B63] dark:border-[#00897B]'
                              : 'border-gray-300 dark:border-[#1E2A42]'
                          }`}
                        />
                        {sortOption === opt.value && (
                          <motion.div
                            layoutId="sortIndicator"
                            className="absolute inset-1 rounded-full bg-[#004B63] dark:bg-[#00897B]"
                            transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
                          />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          sortOption === opt.value
                            ? 'text-[#004B63] dark:text-[#00C4E8]'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {t(opt.labelKey)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Active Filter Tags */}
              {activeFilters.length > 0 && (
                <>
                  <div className="mx-4 h-px bg-gray-100 dark:bg-[#1A2540]" />
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {language === 'ar' ? 'الفلاتر النشطة' : 'Active Filters'}
                      </h3>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-xs font-semibold text-[#FF6F61] dark:text-[#FF6F61]"
                      >
                        <RotateCcw size={10} />
                        {t('mobile.search.resetFilters')}
                      </motion.button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeFilters.map((filter) => (
                        <motion.div
                          key={filter.key}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#004B63]/10 dark:bg-[#00897B]/10 border border-[#004B63]/20 dark:border-[#00897B]/20"
                        >
                          <span className="text-[10px] font-medium text-[#004B63] dark:text-[#00C4E8]">
                            {filter.label}
                          </span>
                          <button
                            onClick={filter.onRemove}
                            className="w-3.5 h-3.5 rounded-full bg-[#004B63]/20 dark:bg-[#00897B]/20 flex items-center justify-center"
                          >
                            <X size={8} className="text-[#004B63] dark:text-[#00C4E8]" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Divider before results */}
              <div className="mx-4 h-px bg-gray-100 dark:bg-[#1A2540]" />

              {/* Results count */}
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{resultsText}</span>
                {activeFilters.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={resetFilters}
                    className="text-[10px] font-semibold text-[#FF6F61] flex items-center gap-0.5"
                  >
                    <RotateCcw size={9} />
                    {t('mobile.search.resetFilters')}
                  </motion.button>
                )}
              </div>

              {/* ── Results Grid ── */}
              <div className="px-4 pb-6">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-gray-400">
                    <Package size={48} className="mb-3 opacity-40" />
                    <p className="text-sm font-medium">{t('mobile.search.noResults')}</p>
                    <p className="text-xs mt-1 text-gray-300 dark:text-gray-500">
                      {language === 'ar' ? 'حاول تغيير معايير البحث' : 'Try changing your search criteria'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map((product, i) => {
                      const img = product.mainImage || product.image || (Array.isArray(product.images) ? product.images[0] : undefined);
                      const isFav = favorites.includes(product.id);
                      const isAdded = addedToCart === product.id;
                      const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
                          className="bg-white dark:bg-[#151D2E] rounded-xl shadow-sm border border-gray-100/80 dark:border-[#1E2A42] overflow-hidden cursor-pointer group"
                          onClick={() => onSelectProduct(product)}
                        >
                          {/* Image */}
                          <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A2540] dark:to-[#151D2E] overflow-hidden relative">
                            {img ? (
                              <img
                                src={img}
                                alt={language === 'ar' ? product.nameAr : product.nameEn}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                            )}
                            {/* Favorite button */}
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(product.id);
                              }}
                              className={`absolute top-1.5 ${direction === 'rtl' ? 'left-1.5' : 'right-1.5'} w-7 h-7 rounded-full bg-white/80 dark:bg-[#151D2E]/80 backdrop-blur-sm flex items-center justify-center shadow-sm`}
                            >
                              <Heart
                                size={14}
                                className={isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                              />
                              {/* Note: Heart is imported at top, but we need to import it. Let me use a workaround */}
                            </motion.button>
                            {/* Discount badge */}
                            {discount >= 15 && (
                              <div className="absolute bottom-1.5 left-1.5 bg-[#FF6F61] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                -{discount}%
                              </div>
                            )}
                            {/* Rating */}
                            {product.rating && product.rating >= 4 && (
                              <div className="absolute bottom-1.5 right-1.5 bg-white/90 dark:bg-[#151D2E]/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
                                <Star size={9} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-[9px] font-bold">{product.rating}</span>
                              </div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="p-2.5">
                            <h3 className="text-[11px] font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight min-h-[2em]">
                              {language === 'ar' ? product.nameAr : product.nameEn}
                            </h3>
                            <div className="flex items-baseline gap-0.5 mt-1.5">
                              <span className="text-[13px] font-extrabold text-[#4ADE80] tracking-tight" style={{ textShadow: '0 0 10px rgba(74,222,128,0.2)' }}>
                                {product.price}
                              </span>
                              <span className="text-[9px] font-bold text-[#4ADE80]/65">
                                {t('product.currency')}
                              </span>
                              {product.comparePrice && product.comparePrice > product.price && (
                                <span className="text-[10px] text-gray-400 line-through">
                                  {product.comparePrice}
                                </span>
                              )}
                            </div>
                            {/* Add to cart button */}
                            <motion.button
                              whileTap={{ scale: 0.93 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              className={`w-full mt-2 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
                                isAdded
                                  ? 'bg-[#238636] text-white'
                                  : 'bg-[#004B63]/10 dark:bg-[#00897B]/10 text-[#004B63] dark:text-[#00C4E8]'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <span>✓</span>
                                  {t('mobile.product.added')}
                                </>
                              ) : (
                                <>
                                  <Plus size={10} />
                                  {t('mobile.product.addToCart')}
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
