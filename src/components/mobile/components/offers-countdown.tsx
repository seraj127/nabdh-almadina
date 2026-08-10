'use client';

import React, { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { Flame, Clock, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../lib/types';

// ═══════════════════════════════════════════════════════════════════════
// TIME BLOCK (declared outside render to avoid state reset)
// ═══════════════════════════════════════════════════════════════════════
function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 min-w-[36px]">
        <span className="text-white font-bold text-sm tabular-nums" dir="ltr">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-white/60 text-[8px] mt-0.5 font-medium">{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ═══════════════════════════════════════════════════════════════════════
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const { t } = useLanguageStore();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1.5">
      <TimeBlock value={timeLeft.hours} label={t('mobile.offers.hours')} />
      <span className="text-white/50 font-bold text-xs mt-[-10px]">:</span>
      <TimeBlock value={timeLeft.minutes} label={t('mobile.offers.minutes')} />
      <span className="text-white/50 font-bold text-xs mt-[-10px]">:</span>
      <TimeBlock value={timeLeft.seconds} label={t('mobile.offers.seconds')} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// OFFER PRODUCT CARD (compact horizontal scroll)
// ═══════════════════════════════════════════════════════════════════════
function OfferProductCard({ product, onSelect, onAddToCart }: {
  product: Product; onSelect: (p: Product) => void; onAddToCart: () => void;
}) {
  const { t, language } = useLanguageStore();
  const [added, setAdded] = useState(false);
  const img = product.mainImage || product.image || (Array.isArray(product.images) ? product.images[0] : undefined);
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const name = language === 'ar' ? product.nameAr : product.nameEn;

  const handleAdd = () => {
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="min-w-[160px] max-w-[160px] bg-white dark:bg-[#161B22] rounded-2xl shadow-sm border border-gray-100/80 dark:border-[#30363D] overflow-hidden group">
      <div className="relative h-28 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#21262D] dark:to-[#161B22] overflow-hidden">
        {img ? (
          <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onClick={() => onSelect(product)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl cursor-pointer" onClick={() => onSelect(product)}>📦</div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-[#FF6F61] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-md animate-badge-pulse">
            -{discount}%
          </div>
        )}
        {product.rating && (
          <div className="absolute bottom-1.5 right-1.5 bg-white/90 dark:bg-[#161B22]/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
            <span className="text-[9px] font-bold text-yellow-500">★</span>
            <span className="text-[9px] font-bold">{product.rating}</span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-[11px] font-semibold text-gray-800 dark:text-gray-100 line-clamp-1 cursor-pointer" onClick={() => onSelect(product)}>{name}</h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-xs font-bold text-[#004B63]">{product.price} {t('product.currency')}</span>
          {product.comparePrice && <span className="text-[9px] text-gray-400 line-through">{product.comparePrice}</span>}
        </div>
        <button
          onClick={handleAdd}
          className={`w-full mt-2 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 ${
            added ? 'bg-[#238636]/10 text-[#238636]' : 'bg-gradient-to-l from-[#004B63] to-[#00897B] text-white'
          }`}
        >
          {added ? '✓' : '+'} {added ? t('mobile.product.added') : t('product.addToCart')}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MOBILE OFFERS SECTION
// ═══════════════════════════════════════════════════════════════════════
export function MobileOffersSection({ products, onSelectProduct }: {
  products: Product[]; onSelectProduct: (p: Product) => void;
}) {
  const { t } = useLanguageStore();
  const addItem = useCartStore((s) => s.addItem);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Filter products with comparePrice (on sale)
  const offerProducts = products.filter((p) => p.comparePrice && p.comparePrice > p.price);

  // Countdown target: end of today + 1 day (simulated deadline)
  const targetDate = new Date();
  targetDate.setHours(23, 59, 59, 999);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -170 : 170, behavior: 'smooth' });
    }
  };

  if (offerProducts.length === 0) return null;

  return (
    <div className="mt-5">
      {/* Section Header */}
      <div className="bg-gradient-to-l from-[#FF6F61] to-[#ff8a7a] mx-4 rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-6 translate-x-6" />
        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 translate-y-4 -translate-x-4" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Flame size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-sm">{t('mobile.offers.title')}</h2>
                <p className="text-white/70 text-[10px]">{offerProducts.length} {t('mobile.offers.products')}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-white/60" />
              <CountdownTimer targetDate={targetDate} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tag size={12} className="text-white/60" />
            <span className="text-white/80 text-[10px] font-medium">{t('mobile.offers.upTo')}</span>
            <span className="text-white font-bold text-xs">
              {Math.max(...offerProducts.map((p) => p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0))}%
            </span>
            <span className="text-white/80 text-[10px] font-medium">{t('mobile.offers.discount')}</span>
          </div>
        </div>
      </div>

      {/* Horizontal scrollable offer products */}
      <div className="relative mt-3">
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
          {offerProducts.map((product) => (
            <OfferProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
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
          ))}
        </div>

        {/* Scroll arrows */}
        {offerProducts.length > 2 && (
          <>
            <button onClick={() => scroll('left')} className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#161B22] shadow-md flex items-center justify-center z-10 border border-gray-100/80 dark:border-[#30363D]">
              <ChevronLeft size={14} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button onClick={() => scroll('right')} className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#161B22] shadow-md flex items-center justify-center z-10 border border-gray-100/80 dark:border-[#30363D]">
              <ChevronRight size={14} className="text-gray-600 dark:text-gray-400" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
