'use client';

import React, { useState, useRef } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import type { Product } from './lib/types';

import {
  Star, Plus, Minus, Heart, Check, ShieldCheck, Truck,
  ChevronLeft, ChevronRight, ShoppingCart,
} from 'lucide-react';
import { BackButton } from './components/back-button';

// ═══════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL OVERLAY
// ═══════════════════════════════════════════════════════════════════════
export function ProductDetailOverlay({ product, isFavorite, onToggleFavorite, onClose }: { product: Product; isFavorite: boolean; onToggleFavorite: () => void; onClose: () => void }) {
  const { t, language } = useLanguageStore();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const isRtl = language === 'ar';

  const images = React.useMemo(() => {
    const parsed = product.images ? (Array.isArray(product.images) ? product.images : typeof product.images === 'string' ? (() => { try { const p = JSON.parse(product.images); return Array.isArray(p) ? p : [product.images as string]; } catch { return [product.images as string]; } })() : []) : [];
    return parsed.length > 0 ? parsed : product.mainImage || product.image ? [product.mainImage || product.image || ''] : [];
  }, [product]);

  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const name = language === 'ar' ? product.nameAr : product.nameEn;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem({ productId: product.id, nameAr: product.nameAr, nameEn: product.nameEn, price: product.price, image: product.mainImage || product.image || '', stock: product.stock || 99 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) { if (diff > 0) setCurrentImg((p) => Math.max(0, p - 1)); else setCurrentImg((p) => Math.min(images.length - 1, p + 1)); }
  };

  return (
    <div className="absolute inset-0 z-40 bg-white dark:bg-[#0D1117] flex flex-col animate-slide-in">
      <div className="flex items-center justify-between px-4 pt-10 pb-3">
        <BackButton onClick={onClose} variant="default" label={t('common.back')} />
        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">{t('mobile.productDetail.title')}</h2>
        <button onClick={onToggleFavorite} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#21262D] flex items-center justify-center"><Heart size={18} className={isFavorite ? 'fill-[#FF6F61] text-[#FF6F61]' : 'text-gray-400'} /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Image Gallery */}
        <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#21262D] dark:to-[#161B22]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {images[currentImg] ? <img src={images[currentImg]} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
          {images.length > 1 && (
            <>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">{images.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImg ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />)}</div>
              {currentImg > 0 && <button onClick={() => setCurrentImg((p) => p - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"><ChevronLeft size={16} /></button>}
              {currentImg < images.length - 1 && <button onClick={() => setCurrentImg((p) => p + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"><ChevronRight size={16} /></button>}
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 mt-3">{images.map((img, i) => <div key={i} onClick={() => setCurrentImg(i)} className={`w-14 h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${i === currentImg ? 'border-[#004B63]' : 'border-transparent opacity-60'}`}>{img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100" />}</div>)}</div>
        )}

        <div className="px-4 mt-4">
          {product.category && <span className="text-xs text-[#00897B] font-semibold">{language === 'ar' ? product.category.nameAr : product.category.nameEn}</span>}
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1">{name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-2xl font-bold text-[#004B63]">{product.price} {t('product.currency')}</span>
            {product.comparePrice && <><span className="text-sm text-gray-400 line-through">{product.comparePrice}</span><span className="text-xs font-bold text-[#FF6F61] bg-[#FF6F61]/10 px-2 py-0.5 rounded-md">-{discount}%</span></>}
          </div>
          {product.rating && <div className="flex items-center gap-1 mt-2"><Star size={14} className="fill-yellow-400 text-yellow-400" /><span className="text-sm font-semibold">{product.rating}</span><span className="text-xs text-gray-400">({product.reviewCount})</span></div>}

          {/* Feature Badges */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {product.inStock !== false && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#238636]/10"><ShieldCheck size={12} className="text-[#238636]" /><span className="text-[10px] font-bold text-[#238636]">{t('product.inStock')}</span></div>}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#004B63]/10"><Truck size={12} className="text-[#004B63]" /><span className="text-[10px] font-bold text-[#004B63]">{t('delivery.fast')}</span></div>
          </div>

          {product.descriptionAr && <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">{product.descriptionAr}</p>}

          {/* Quantity */}
          <div className="flex items-center gap-3 mt-6">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('cart.quantity')}:</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#21262D] flex items-center justify-center"><Minus size={14} /></button>
              <span className="text-base font-bold w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="w-8 h-8 rounded-lg bg-[#004B63] text-white flex items-center justify-center"><Plus size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-[#30363D] bg-white dark:bg-[#0D1117]">
        <button onClick={handleAddToCart} className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${added ? 'bg-[#238636] text-white' : 'bg-gradient-to-l from-[#004B63] to-[#00897B] text-white hover:opacity-90 shadow-md'}`}>
          {added ? <><Check size={18} /> {t('mobile.product.added')}</> : <><ShoppingCart size={18} /> {t('product.addToCart')} • {(product.price * quantity).toFixed(2)} {t('product.currency')}</>}
        </button>
      </div>
    </div>
  );
}
