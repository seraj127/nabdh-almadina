'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { useMobileStore } from '../lib/mobile-store';
import { ProductCard } from '../components/product-card';
import type { Product } from '../lib/types';
import {
  Heart, ShoppingCart, Trash2, ArrowRight, ArrowLeft,
  Share2, Check, Package, ArrowUpDown, SlidersHorizontal,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// FAVORITES TAB — PROFESSIONAL ADVANCED
// ═══════════════════════════════════════════════════════════════════════
export function FavoritesTab({ favoriteProducts, toggleFavorite, onSelectProduct }: { favoriteProducts: Product[]; toggleFavorite: (id: string) => void; onSelectProduct: (p: Product) => void }) {
  const { t, language } = useLanguageStore();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const addItem = useCartStore((s) => s.addItem);
  // favoriteProducts is maintained by the store (server-backed with full details),
  // so favorites from the web or from pages beyond the loaded feed still appear.
  const favProducts = favoriteProducts;
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  // ─── Refresh favorite products whenever this tab is opened ─────────
  // The store may not have refreshed yet (e.g. a favorite was added on the web
  // and this tab was opened right after) — refresh to be safe.
  useEffect(() => {
    useMobileStore.getState().refreshFavoriteProducts().catch(() => {});
  }, []);

  // ─── Scroll to top on mount ────────────────────────────────────────
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const scrollContainer = document.querySelector('[data-content-scroll]') as HTMLElement;
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleAddToCart = (p: Product) => {
    addItem({ productId: p.id, nameAr: p.nameAr, nameEn: p.nameEn, price: p.price, image: p.mainImage || p.image || '', stock: p.stock || 99 });
    setAddedIds((prev) => new Set(prev).add(p.id));
    setTimeout(() => { setAddedIds((prev) => { const n = new Set(prev); n.delete(p.id); return n; }); }, 1500);
  };

  const handleRemoveFavorite = (id: string) => {
    toggleFavorite(id);
    setShowRemoveConfirm(null);
  };

  const handleAddAllToCart = () => {
    favProducts.forEach((p) => {
      addItem({ productId: p.id, nameAr: p.nameAr, nameEn: p.nameEn, price: p.price, image: p.mainImage || p.image || '', stock: p.stock || 99 });
    });
  };

  const totalValue = useMemo(() => favProducts.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : parseFloat(String(p.price)) || 0), 0), [favProducts]);

  // Sorted favorites
  const sortedFavorites = useMemo(() => {
    const sorted = [...favProducts];
    switch (sortMode) {
      case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
      case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
      case 'name': sorted.sort((a, b) => (language === 'ar' ? a.nameAr.localeCompare(b.nameAr) : a.nameEn.localeCompare(b.nameEn))); break;
      default: break;
    }
    return sorted;
  }, [favProducts, sortMode, language]);

  return (
    <div className="pb-24" dir={direction}>
      {/* Header with stats */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #E85D50 0%, #FF6F61 50%, #ff8a7a 100%)' }}>
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10 px-5 pt-10 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  const store = useMobileStore.getState();
                  store.setActiveTab('home');
                }}
                className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label={language === 'ar' ? 'رجوع' : 'Go back'}
              >
                {direction === 'rtl' ? <ArrowRight size={18} className="text-white" /> : <ArrowLeft size={18} className="text-white" />}
              </motion.button>
              <div>
                <h1 className="text-white text-lg font-bold">{t('mobile.favorites.title')}</h1>
                <p className="text-white/60 text-xs mt-0.5">{favProducts.length} {language === 'ar' ? 'منتج مفضل' : 'favorite items'}</p>
              </div>
            </div>
            {favProducts.length > 0 && (
              <div className="flex items-center gap-2">
                {/* Sort Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const modes: typeof sortMode[] = ['default', 'price-asc', 'price-desc', 'name'];
                    const currentIdx = modes.indexOf(sortMode);
                    setSortMode(modes[(currentIdx + 1) % modes.length]);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
                >
                  <ArrowUpDown size={14} className="text-white" />
                </motion.button>
                {/* View Mode Toggle */}
                <div className="flex bg-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-[#FF6F61]' : 'text-white/60'}`}
                  >
                    {language === 'ar' ? 'شبكة' : 'Grid'}
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${viewMode === 'list' ? 'bg-white text-[#FF6F61]' : 'text-white/60'}`}
                  >
                    {language === 'ar' ? 'قائمة' : 'List'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Row */}
          {favProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 flex gap-3"
            >
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-white/50 text-[10px] font-medium">{language === 'ar' ? 'إجمالي القيمة' : 'Total Value'}</p>
                <p className="text-white text-sm font-bold mt-0.5">{totalValue.toFixed(2)} {t('product.currency')}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddAllToCart}
                className="flex-1 bg-white rounded-xl p-3 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ShoppingCart size={14} className="text-[#FF6F61]" />
                <span className="text-[#FF6F61] text-[10px] font-bold">{language === 'ar' ? 'أضف الكل للسلة' : 'Add All to Cart'}</span>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {favProducts.length === 0 ? (
        /* Empty State with animated heart */
        <div className="flex flex-col items-center py-20 text-gray-400 dark:text-[#6B7F96] px-8">
          <motion.div
            className="w-28 h-28 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(255,111,97,0.06), rgba(255,111,97,0.03))' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <Heart size={48} className="text-red-200 dark:text-red-900/30" />
          </motion.div>
          <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">{t('mobile.favorites.noFavorites')}</p>
          <p className="text-sm mt-1 text-center text-gray-400 dark:text-[#6B7F96]">{t('mobile.favorites.addFavoritesHint')}</p>
        </div>
      ) : (
        <>
          {/* Sort indicator */}
          {sortMode !== 'default' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4 mt-3 flex items-center gap-2"
            >
              <span className="text-[10px] text-gray-400 font-medium">
                {language === 'ar' ? 'مرتبة حسب:' : 'Sorted by:'}
              </span>
              <span className="text-[10px] text-[#004B63] dark:text-[#00C4E8] font-bold">
                {sortMode === 'price-asc' ? (language === 'ar' ? 'السعر: من الأقل' : 'Price: Low') :
                 sortMode === 'price-desc' ? (language === 'ar' ? 'السعر: من الأعلى' : 'Price: High') :
                 (language === 'ar' ? 'الاسم' : 'Name')}
              </span>
            </motion.div>
          )}
          {viewMode === 'grid' ? (
        /* Grid View */
        <div className="px-4 mt-4 grid grid-cols-2 gap-3">
          {sortedFavorites.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <ProductCard
                product={p}
                isFavorite={true}
                onToggleFavorite={() => setShowRemoveConfirm(p.id)}
                onSelect={() => onSelectProduct(p)}
                onAddToCart={() => handleAddToCart(p)}
              />
              {/* Delete button overlay */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => { e.stopPropagation(); setShowRemoveConfirm(p.id); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-[#151D2E]/90 backdrop-blur-sm flex items-center justify-center shadow-sm z-20 hover:bg-[#FF3B30]/10 transition-colors"
                aria-label={language === 'ar' ? 'حذف من المفضلة' : 'Remove from favorites'}
              >
                <Trash2 size={14} className="text-[#FF3B30]" />
              </motion.button>
              {/* Added to cart badge */}
              {addedIds.has(p.id) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-2 left-2 bg-[#238636] text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10"
                >
                  <Check size={10} /> {language === 'ar' ? 'تمت الإضافة' : 'Added'}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="px-4 mt-4 space-y-3">
          {sortedFavorites.map((p, i) => {
            const img = p.mainImage || p.image || (Array.isArray(p.images) ? p.images[0] : undefined);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: direction === 'rtl' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#151D2E] rounded-xl shadow-sm border border-gray-100/80 dark:border-[#1E2A42] p-3 flex gap-3"
              >
                <div
                  className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-[#1A2540] overflow-hidden flex-shrink-0 cursor-pointer"
                  onClick={() => onSelectProduct(p)}
                >
                  {img ? (
                    <img src={img} alt={language === 'ar' ? p.nameAr : p.nameEn} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {language === 'ar' ? p.nameAr : p.nameEn}
                  </h3>
                  <div className="flex items-baseline gap-0.5 mt-1">
                    <span className="text-[15px] font-extrabold text-[#4ADE80] tracking-tight" style={{ textShadow: '0 0 12px rgba(74,222,128,0.3)' }}>{p.price}</span>
                    <span className="text-[10px] font-bold text-[#4ADE80]/70">{t('product.currency')}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAddToCart(p)}
                      className="flex-1 py-1.5 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1"
                      style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
                    >
                      {addedIds.has(p.id) ? <Check size={12} /> : <ShoppingCart size={12} />}
                      {addedIds.has(p.id) ? (language === 'ar' ? 'تمت' : 'Done') : (language === 'ar' ? 'أضف للسلة' : 'Add to Cart')}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowRemoveConfirm(p.id)}
                      className="w-8 h-8 rounded-lg bg-[#FF3B30]/5 flex items-center justify-center"
                    >
                      <Trash2 size={14} className="text-[#FF3B30]" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* Remove Confirmation Bottom Sheet */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRemoveConfirm(null)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-[#151D2E] rounded-t-3xl shadow-2xl p-5"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
              dir={direction}
            >
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-[#1E2A42]" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FF3B30]/10 flex items-center justify-center">
                  <Heart size={24} className="text-[#FF3B30]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-white">
                    {language === 'ar' ? 'إزالة من المفضلة؟' : 'Remove from Favorites?'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {language === 'ar' ? 'سيتم حذف هذا المنتج من قائمة المفضلة' : 'This product will be removed from your favorites'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowRemoveConfirm(null)}
                  className="flex-1 py-3 rounded-xl text-gray-600 dark:text-gray-300 font-bold text-sm border border-gray-200 dark:border-[#1E2A42]"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRemoveFavorite(showRemoveConfirm)}
                  className="flex-1 py-3 rounded-xl bg-[#FF3B30] text-white font-bold text-sm"
                >
                  {language === 'ar' ? 'إزالة' : 'Remove'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
