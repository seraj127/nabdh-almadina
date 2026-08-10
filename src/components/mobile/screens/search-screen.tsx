'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { useMobileStore } from '../lib/mobile-store';
import { ProductCard } from '../components/product-card';
import type { Product, Category } from '../lib/types';
import {
  Search, X, ArrowRight, ArrowLeft,
  ChevronDown, Package, Clock, Trash2, Check,
  ArrowUpDown, ToggleLeft, ToggleRight, Mic, Camera, ImagePlus, RefreshCw,
} from 'lucide-react';

// ─── Sort type ────────────────────────────────────────────────────────
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular';

const SORT_KEYS: Record<SortOption, string> = {
  'newest': 'product.sort.newest',
  'price-asc': 'product.sort.priceAsc',
  'price-desc': 'product.sort.priceDesc',
  'popular': 'product.sort.popular',
};

// ─── localStorage helpers for recent searches ─────────────────────────
const RECENT_KEY = 'nabd_recent_searches';
const MAX_RECENT = 5;

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const existing = loadRecentSearches().filter((s) => s !== trimmed);
  const updated = [trimmed, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_KEY);
}

// ═══════════════════════════════════════════════════════════════════════
// SORT BOTTOM SHEET
// ═══════════════════════════════════════════════════════════════════════
function SortSheet({
  open,
  onClose,
  selected,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selected: SortOption;
  onSelect: (s: SortOption) => void;
}) {
  const { t, language } = useLanguageStore();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const options: SortOption[] = ['newest', 'price-asc', 'price-desc', 'popular'];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-[#151D2E] rounded-t-3xl shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
            dir={direction}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-[#1E2A42]" />
            </div>

            <div className="px-5 pb-2">
              <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
                {t('product.sortBy')}
              </h3>
            </div>

            <div className="px-5 pb-8 space-y-1">
              {options.map((opt) => {
                const isSelected = selected === opt;
                return (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      onSelect(opt);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#004B63]/10 dark:bg-[#00C4E8]/10 border border-[#004B63]/20 dark:border-[#00C4E8]/20'
                        : 'hover:bg-gray-50 dark:hover:bg-[#1A2540]'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${
                      isSelected
                        ? 'text-[#004B63] dark:text-[#00C4E8]'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {t(SORT_KEYS[opt])}
                    </span>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check size={18} className="text-[#004B63] dark:text-[#00C4E8]" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SEARCH SCREEN
// ═══════════════════════════════════════════════════════════════════════
export function SearchScreen() {
  const { t, language } = useLanguageStore();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const addItem = useCartStore((s) => s.addItem);

  // Store values
  const products = useMobileStore((s) => s.products);
  const categories = useMobileStore((s) => s.categories);
  const searchQuery = useMobileStore((s) => s.searchQuery);
  const setSearchQuery = useMobileStore((s) => s.setSearchQuery);
  const favorites = useMobileStore((s) => s.favorites);
  const toggleFavorite = useMobileStore((s) => s.toggleFavorite);
  const setSelectedProduct = useMobileStore((s) => s.setSelectedProduct);
  const fetchProducts = useMobileStore((s) => s.fetchProducts);
  const searchHasMore = useMobileStore((s) => s.searchHasMore);

  // Local state
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceApplied, setPriceApplied] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Debounced search (declared first so voice/image can reference it)
  const handleQueryChange = useCallback((value: string) => {
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
      useMobileStore.setState({ searchPage: 1, searchHasMore: true });
      if (value.trim()) {
        setHasSearched(true);
        saveRecentSearch(value);
        setRecentSearches(loadRecentSearches());
        fetchProducts(value);
      }
    }, 400);
  }, [setSearchQuery, fetchProducts]);

  // ─── Voice Search Setup ───
  const initVoiceRef = useRef(false);
  useEffect(() => {
    if (initVoiceRef.current) return;
    initVoiceRef.current = true;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      // Schedule setState outside effect body to avoid cascading render warning
      queueMicrotask(() => setVoiceSupported(true));
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ar' ? 'ar-LY' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setLocalQuery(transcript);
        setSearchQuery(transcript);
        if (transcript.trim()) {
          setHasSearched(true);
          saveRecentSearch(transcript);
          setRecentSearches(loadRecentSearches());
          useMobileStore.setState({ searchPage: 1, searchHasMore: true });
          fetchProducts(transcript);
        }
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [language, setSearchQuery, fetchProducts]);

  const toggleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === 'ar' ? 'ar-LY' : 'en-US';
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, language]);

  // ─── Image Search Handler ───
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageSearching, setImageSearching] = useState(false);

  const handleImageSearch = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageSearching(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const res = await fetch('/api/search/image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.query) {
              setLocalQuery(data.query);
              setSearchQuery(data.query);
              setHasSearched(true);
              saveRecentSearch(data.query);
              setRecentSearches(loadRecentSearches());
              useMobileStore.setState({ searchPage: 1, searchHasMore: true });
              fetchProducts(data.query);
            }
          }
        } catch {
          const fallbackQuery = language === 'ar' ? 'منتج مشابه' : 'similar product';
          setLocalQuery(fallbackQuery);
          handleQueryChange(fallbackQuery);
        }
        setImageSearching(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setImageSearching(false);
    }
  }, [language, handleQueryChange, setSearchQuery, fetchProducts]);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Submit search immediately
  const handleSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchQuery(localQuery);
    if (localQuery.trim()) {
      setHasSearched(true);
      saveRecentSearch(localQuery);
      setRecentSearches(loadRecentSearches());
      // Reset search page when starting a new search
      useMobileStore.setState({ searchPage: 1, searchHasMore: true });
      fetchProducts(localQuery);
    }
  }, [localQuery, setSearchQuery, fetchProducts]);

  // Clear search
  const handleClear = useCallback(() => {
    setLocalQuery('');
    setSearchQuery('');
    setHasSearched(false);
    useMobileStore.setState({ searchPage: 1, searchHasMore: true });
    inputRef.current?.focus();
  }, [setSearchQuery]);

  // Back button
  const handleBack = useCallback(() => {
    useMobileStore.getState().setScreen('main');
    useMobileStore.getState().setActiveTab('home');
  }, []);

  // Apply price range
  const handleApplyPrice = useCallback(() => {
    const min = priceMin ? parseFloat(priceMin) : null;
    const max = priceMax ? parseFloat(priceMax) : null;
    setPriceApplied({ min, max });
  }, [priceMin, priceMax]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedCategory(null);
    setSortOption('newest');
    setInStockOnly(false);
    setPriceMin('');
    setPriceMax('');
    setPriceApplied({ min: null, max: null });
  }, []);

  // Apply recent search
  const handleRecentClick = useCallback((query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
    setHasSearched(true);
    useMobileStore.setState({ searchPage: 1, searchHasMore: true });
    fetchProducts(query);
  }, [setSearchQuery, fetchProducts]);

  // Delete single recent search
  const handleDeleteRecent = useCallback((query: string) => {
    const updated = loadRecentSearches().filter((s) => s !== query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  }, []);

  // Clear all recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  // ─── Filtered & sorted products ───────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // In-stock filter
    if (inStockOnly) {
      result = result.filter((p) => {
        if (p.inStock !== undefined) return p.inStock;
        if (p.stock !== undefined) return p.stock > 0;
        return true;
      });
    }

    // Price range filter
    if (priceApplied.min !== null) {
      result = result.filter((p) => p.price >= (priceApplied.min ?? 0));
    }
    if (priceApplied.max !== null) {
      result = result.filter((p) => p.price <= (priceApplied.max ?? Infinity));
    }

    // Sort
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => (b.reviewCount || 0) * (b.rating || 1) - (a.reviewCount || 0) * (a.rating || 1));
        break;
      case 'newest':
      default:
        // Products are already in default order from API
        break;
    }

    return result;
  }, [products, selectedCategory, inStockOnly, priceApplied, sortOption]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (inStockOnly) count++;
    if (priceApplied.min !== null || priceApplied.max !== null) count++;
    return count;
  }, [selectedCategory, inStockOnly, priceApplied]);

  // Category chips data
  const categoryChips = useMemo(() => {
    const allChip = { id: null, name: t('search.allCategories') };
    const cats = categories.map((c) => ({
      id: c.id,
      name: language === 'ar' ? c.nameAr : c.nameEn,
    }));
    return [allChip, ...cats];
  }, [categories, language, t]);

  return (
    <div
      className="h-full flex flex-col bg-white dark:bg-[#0B1120]"
      dir={direction}
    >
      {/* ─── Header with Search Input ─── */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #003545 0%, #004B63 40%, #006B8A 70%, #00897B 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 px-4 pt-3 pb-5">
          {/* Top bar: Back + Title */}
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleBack}
              className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15"
              aria-label={t('common.back')}
            >
              {direction === 'rtl' ? <ArrowRight size={18} className="text-white" /> : <ArrowLeft size={18} className="text-white" />}
            </motion.button>
            <h1 className="text-white text-base font-bold">{t('search.title')}</h1>
          </div>

          {/* Search Input with Voice & Image */}
          <div className="relative">
            <Search size={18} className={`absolute ${direction === 'rtl' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-400`} />
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder={t('mobile.home.searchPlaceholder')}
              className={`w-full ${direction === 'rtl' ? 'pr-10 pl-20' : 'pl-10 pr-20'} py-3 rounded-xl bg-white dark:bg-[#151D2E] text-sm outline-none shadow-lg placeholder:text-gray-400 border border-gray-100/50 dark:border-[#1E2A42]/50 text-gray-800 dark:text-white`}
              dir={direction}
            />
            {/* Voice & Image Search Icons */}
            <div className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 flex items-center gap-1`}>
              {voiceSupported && (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={toggleVoiceSearch}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#004B63]/5 dark:bg-[#00C4E8]/5'}`}
                  aria-label={language === 'ar' ? 'بحث بالصوت' : 'Voice search'}
                >
                  <Mic size={16} className={isListening ? 'text-white' : 'text-[#004B63] dark:text-[#00C4E8]'} />
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => imageInputRef.current?.click()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${imageSearching ? 'animate-pulse' : ''} bg-[#004B63]/5 dark:bg-[#00C4E8]/5`}
                aria-label={language === 'ar' ? 'بحث بالصورة' : 'Image search'}
              >
                {imageSearching ? <RefreshCw size={16} className="text-[#004B63] dark:text-[#00C4E8] animate-spin" /> : <ImagePlus size={16} className="text-[#004B63] dark:text-[#00C4E8]" />}
              </motion.button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSearch}
                className="hidden"
              />
            </div>
            {/* Clear button (only when no voice/image icons area) */}
            {localQuery && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.85 }}
                onClick={handleClear}
                className={`absolute ${direction === 'rtl' ? 'left-20' : 'right-20'} top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-[#1E2A42] flex items-center justify-center`}
                aria-label="Clear search"
              >
                <X size={13} className="text-gray-500 dark:text-gray-400" />
              </motion.button>
            )}
          </div>
          {/* Voice listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-500 font-semibold">
                  {language === 'ar' ? 'جاري الاستماع... تحدث الآن' : 'Listening... speak now'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="flex-shrink-0 border-b border-gray-100 dark:border-[#1E2A42] bg-white dark:bg-[#0B1120]">
        {/* Category Chips */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categoryChips.map((chip) => {
              const isActive = selectedCategory === chip.id;
              return (
                <motion.button
                  key={chip.id ?? 'all'}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSelectedCategory(chip.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#004B63] dark:bg-[#00C4E8] text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-[#1A2540] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#1E2A42]'
                  }`}
                >
                  {chip.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Action row: Sort + Filters + Stock toggle */}
        <div className="flex items-center gap-2 px-4 pb-3">
          {/* Sort Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSortSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#1A2540] text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            <ArrowUpDown size={13} />
            {t(SORT_KEYS[sortOption])}
            <ChevronDown size={12} />
          </motion.button>

          {/* In-Stock Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inStockOnly
                ? 'bg-[#238636]/10 text-[#238636] dark:bg-[#238636]/20 dark:text-[#3fb950] border border-[#238636]/20'
                : 'bg-gray-100 dark:bg-[#1A2540] text-gray-600 dark:text-gray-400'
            }`}
          >
            {inStockOnly ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
            {t('product.inStock')}
          </motion.button>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FF6F61]/10 text-[#FF6F61] text-xs font-semibold ml-auto"
            >
              <X size={12} />
              {activeFilterCount}
            </motion.button>
          )}
        </div>

        {/* Price Range */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-[#6B7F96] whitespace-nowrap">
                {t('search.minPrice')}
              </span>
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1A2540] border border-gray-200 dark:border-[#1E2A42] text-xs text-gray-800 dark:text-white outline-none focus:border-[#004B63] dark:focus:border-[#00C4E8] transition-colors"
                dir="ltr"
              />
            </div>
            <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-[10px] font-semibold text-gray-400 dark:text-[#6B7F96] whitespace-nowrap">
                {t('search.maxPrice')}
              </span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="9999"
                className="w-full px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-[#1A2540] border border-gray-200 dark:border-[#1E2A42] text-xs text-gray-800 dark:text-white outline-none focus:border-[#004B63] dark:focus:border-[#00C4E8] transition-colors"
                dir="ltr"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleApplyPrice}
              className="px-3 py-1.5 rounded-lg bg-[#004B63] dark:bg-[#00C4E8] text-white text-xs font-bold flex-shrink-0"
            >
              {t('search.apply')}
            </motion.button>
          </div>
          {(priceApplied.min !== null || priceApplied.max !== null) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-1.5 flex items-center gap-1.5"
            >
              <span className="text-[10px] text-[#004B63] dark:text-[#00C4E8] font-medium">
                {t('search.priceLabel')}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                {priceApplied.min !== null ? `${priceApplied.min}` : '0'} — {priceApplied.max !== null ? `${priceApplied.max}` : '∞'} {t('product.currency')}
              </span>
              <button
                onClick={() => {
                  setPriceMin('');
                  setPriceMax('');
                  setPriceApplied({ min: null, max: null });
                }}
                className="text-[10px] text-[#FF6F61] font-medium hover:underline"
              >
                {t('search.removePrice')}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── Results Area ─── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Recent Searches (shown when no query and no search performed) */}
        {!localQuery && !hasSearched && recentSearches.length > 0 && (
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#004B63] dark:text-[#00C4E8]" />
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                  {t('search.recent')}
                </h3>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClearRecent}
                className="flex items-center gap-1 text-xs text-[#FF6F61] font-medium"
              >
                <Trash2 size={12} />
                {t('search.clearAll')}
              </motion.button>
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {recentSearches.map((query, i) => (
                  <motion.div
                    key={query}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#1A2540] rounded-full pl-3 pr-1.5 py-1.5 group"
                  >
                    <button
                      onClick={() => handleRecentClick(query)}
                      className="text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-[#004B63] dark:hover:text-[#00C4E8] transition-colors"
                    >
                      {query}
                    </button>
                    <button
                      onClick={() => handleDeleteRecent(query)}
                      className="w-4 h-4 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-[#1E2A42] transition-all"
                      aria-label={t('common.delete')}
                    >
                      <X size={10} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Results count */}
        {(hasSearched || localQuery) && (
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {filteredProducts.length} {filteredProducts.length === 1 ? t('search.result') : t('search.results')}
            </span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] text-[#004B63] dark:text-[#00C4E8] font-medium">
                {activeFilterCount} {t('search.activeFilters')}
              </span>
            )}
          </div>
        )}

        {/* Product Grid */}
        {(hasSearched || localQuery) && filteredProducts.length > 0 && (
          <div className="px-4 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.3 }}
                >
                  <ProductCard
                    product={product}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={() => toggleFavorite(product.id)}
                    onSelect={() => setSelectedProduct(product)}
                    onAddToCart={() => {
                      addItem({
                        productId: product.id,
                        nameAr: product.nameAr,
                        nameEn: product.nameEn,
                        price: product.price,
                        image: product.mainImage || product.image || '',
                        stock: product.stock || 99,
                      });
                    }}
                  />
                </motion.div>
              ))}
            </div>
            {/* Load More for Search */}
            {searchHasMore ? (
              <div className="flex justify-center mt-4 mb-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (loadingMore) return;
                    setLoadingMore(true);
                    useMobileStore.getState().loadMoreSearch().then(() => setLoadingMore(false));
                  }}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-xl bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#1E2A42] text-sm font-semibold text-[#004B63] dark:text-[#00C4E8] disabled:opacity-50"
                >
                  {loadingMore ? t('common.loading') : t('common.showMore')}
                </motion.button>
              </div>
            ) : filteredProducts.length > 20 ? (
              <p className="text-center text-xs text-gray-400 dark:text-[#6B7F96] py-4">
                {t('mobile.home.allProductsLoaded')}
              </p>
            ) : null}
          </div>
        )}

        {/* Empty state - no results */}
        {(hasSearched || localQuery) && filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6"
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-[#1A2540] flex items-center justify-center mb-4">
              <Package size={36} className="text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('search.noResults')}
            </h3>
            <p className="text-xs text-gray-400 dark:text-[#6B7F96] text-center max-w-[240px]">
              {t('search.noResultsHint')}
            </p>
            {activeFilterCount > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClearFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-[#004B63] dark:bg-[#00C4E8] text-white text-xs font-semibold"
              >
                {t('search.clearFilters')}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Initial state - no search yet, no recent searches */}
        {!localQuery && !hasSearched && recentSearches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 px-6"
          >
            <div className="w-20 h-20 rounded-full bg-[#004B63]/5 dark:bg-[#00C4E8]/5 flex items-center justify-center mb-4">
              <Search size={36} className="text-[#004B63]/30 dark:text-[#00C4E8]/30" />
            </div>
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">
              {t('search.searchProducts')}
            </h3>
            <p className="text-xs text-gray-400 dark:text-[#6B7F96] text-center max-w-[240px]">
              {t('search.searchHint')}
            </p>
          </motion.div>
        )}
      </div>

      {/* Sort Bottom Sheet */}
      <SortSheet
        open={sortSheetOpen}
        onClose={() => setSortSheetOpen(false)}
        selected={sortOption}
        onSelect={setSortOption}
      />
    </div>
  );
}
