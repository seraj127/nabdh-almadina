'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { useMobileStore } from '../lib/mobile-store';
import { LOCAL_OFFERS } from '../lib/constants';
import { NetworkStatus } from '../components/offline-banner';
import { ProductCard } from '../components/product-card';
import type { Product, Category, Offer } from '../lib/types';
import {
  Search, Star, Sparkles, Package, RefreshCw,
  ArrowRight, ArrowLeft, Timer, Zap, Flame, Bell,
  Shield, Truck, Headphones, Quote, Mic, Camera,
  ChevronLeft, ChevronRight, SlidersHorizontal,
  Users, Clock,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// TYPEWRITER - Isolated component to prevent parent re-renders
// ═══════════════════════════════════════════════════════════════════════
const TypewriterText = memo(function TypewriterText({ language }: { language: string }) {
  const phrases = language === 'ar'
    ? ['ابحث عن هاتف...', 'ابحث عن لابتوب...', 'ابحث عن سماعات...', 'ابحث عن ساعة...', 'ابحث عن عطر...']
    : ['Search for phones...', 'Search for laptops...', 'Search for headphones...', 'Search for watches...', 'Search for perfume...'];

  const [text, setText] = useState('');
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const elapsed = timestamp - lastUpdateRef.current;
      const delay = deletingRef.current ? 50 : 100;

      if (elapsed >= delay) {
        lastUpdateRef.current = timestamp;
        const phrase = phrases[indexRef.current];

        if (!deletingRef.current) {
          charRef.current++;
          setText(phrase.slice(0, charRef.current));
          if (charRef.current >= phrase.length) {
            // Pause then start deleting
            setTimeout(() => { deletingRef.current = true; }, 1500);
          }
        } else {
          charRef.current--;
          setText(phrase.slice(0, charRef.current));
          if (charRef.current <= 0) {
            deletingRef.current = false;
            indexRef.current = (indexRef.current + 1) % phrases.length;
          }
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phrases]);

  return (
    <span className="text-sm text-gray-400 truncate text-start flex-1">
      {text}
      <span className="animate-pulse text-[#004B63] dark:text-[#00C4E8]">|</span>
    </span>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// OFFERS COUNTDOWN UNIT - Memoized to prevent cascade re-renders
// ═══════════════════════════════════════════════════════════════════════
const CountdownUnit = memo(function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-11 h-11 rounded-xl bg-white/[0.08] flex items-center justify-center border border-white/10 backdrop-blur-sm">
        <span className="text-white text-sm font-bold font-mono tabular-nums">{String(value).padStart(2, '0')}</span>
      </div>
      <span className="text-white/30 text-[7px] mt-0.5 font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// OFFERS SECTION — Premium Advanced with Swipe & Animated Transitions
// ═══════════════════════════════════════════════════════════════════════
export function OffersSection({ offers, onSelectProduct }: { offers: Offer[]; onSelectProduct: (p: Product) => void }) {
  const { t, language } = useLanguageStore();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';
  const [activeSlide, setActiveSlide] = useState(0);
  const [countdown, setCountdown] = useState(() => {
    const offer = offers[0];
    if (!offer) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalMs: 0, startMs: 0 };
    const diff = new Date(offer.endsAt).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalMs: 0, startMs: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false,
      totalMs: diff,
      startMs: diff,
    };
  });

  // Swipe state
  const [swipeX, setSwipeX] = useState(0);
  const touchStartXRef = useRef(0);

  // Countdown timer using setInterval
  useEffect(() => {
    const offer = offers[activeSlide];
    if (!offer) return;
    const endTime = new Date(offer.endsAt).getTime();
    const initialDiff = endTime - Date.now();

    const updateCountdown = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalMs: 0, startMs: 0 });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
        totalMs: diff,
        startMs: initialDiff > 0 ? initialDiff : 1,
      });
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [offers, activeSlide]);

  // Swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartXRef.current;
    setSwipeX(dx * 0.3); // resistance factor
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(swipeX) > 40) {
      if (swipeX > 0) {
        // swipe right → previous (in RTL, this means next)
        setActiveSlide((prev) => isRTL ? (prev + 1) % offers.length : (prev - 1 + offers.length) % offers.length);
      } else {
        setActiveSlide((prev) => isRTL ? (prev - 1 + offers.length) % offers.length : (prev + 1) % offers.length);
      }
    }
    setSwipeX(0);
  }, [swipeX, offers.length, isRTL]);

  if (offers.length === 0) return null;

  const offer = offers[activeSlide];
  const saved = offer.originalPrice - offer.offerPrice;
  const progressPercent = countdown.startMs > 0 ? Math.max(0, Math.min(100, (countdown.totalMs / countdown.startMs) * 100)) : 0;

  return (
    <div className="px-4 mt-5" dir={direction}>
      {/* Section Header — Premium */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF6F61 0%, #ff4757 100%)', boxShadow: '0 4px 14px rgba(255,111,97,0.35)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame size={15} className="text-white" />
          </motion.div>
          <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('mobile.home.offers.title')}</h2>
            <p className="text-[9px] text-gray-400 font-medium">{offers.length} {language === 'ar' ? 'عروض نشطة' : 'active deals'}</p>
          </div>
        </div>
        <button className="text-[10px] font-bold text-[#004B63] dark:text-[#00C4E8] px-3 py-1.5 rounded-lg bg-[#004B63]/8 dark:bg-[#00C4E8]/8 border border-[#004B63]/15 dark:border-[#00C4E8]/15 hover:bg-[#004B63]/15 dark:hover:bg-[#00C4E8]/15 transition-colors">
          {t('mobile.home.offers.viewAllOffers')}
        </button>
      </div>

      {/* Offer Card — Premium Swipeable */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          initial={{ opacity: 0, x: isRTL ? -60 : 60, scale: 0.96 }}
          animate={{ opacity: 1, x: swipeX, scale: 1 }}
          exit={{ opacity: 0, x: isRTL ? 60 : -60, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative overflow-hidden rounded-2xl shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #0A1628 0%, #0F2235 30%, #142D45 60%, #0D2B3E 100%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Animated background accents */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 end-0 w-40 h-40 rounded-full bg-[#FF6F61]/8 blur-2xl" />
            <div className="absolute bottom-0 start-0 w-32 h-32 rounded-full bg-[#00897B]/8 blur-2xl" />
            <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-[#D4A843]/4 blur-3xl" />
            {/* Diagonal shimmer line */}
            <div className="absolute -top-1/2 -start-1/2 w-[200%] h-[200%] rotate-45 translate-x-1/4 translate-y-1/4" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 55%, transparent 60%)' }} />
          </div>

          <div className="relative z-10 p-4">
            {/* Top row: Discount badge + Limited tag + Slide counter */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Discount badge with pulse glow */}
                <motion.div
                  className="relative"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="absolute inset-0 rounded-full blur-md" style={{ background: 'rgba(255,107,97,0.4)' }} />
                  <span className="relative text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #FF6F61 0%, #ff4757 100%)' }}>
                    {offer.discount}% {t('mobile.home.offers.off')}
                  </span>
                </motion.div>
                {offer.limited && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-[#D29922]/20 text-[#D29922] border border-[#D29922]/20">
                    <Zap size={10} /> {t('mobile.home.offers.limited')}
                  </span>
                )}
              </div>
              {/* Slide counter */}
              {offers.length > 1 && (
                <span className="text-white/30 text-[10px] font-mono font-bold">
                  {String(activeSlide + 1).padStart(2, '0')}/{String(offers.length).padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Title & Description */}
            <h3 className="text-white font-bold text-[15px] mb-1 leading-tight">{language === 'ar' ? offer.titleAr : offer.titleEn}</h3>
            <p className="text-white/50 text-[11px] mb-3 leading-relaxed line-clamp-2">{language === 'ar' ? offer.descriptionAr : offer.descriptionEn}</p>

            {/* Price + Savings row */}
            <div className="flex items-end gap-3 mb-3">
              <span className="text-white text-2xl font-extrabold tracking-tight">{offer.offerPrice} <span className="text-sm font-bold text-white/60">{t('product.currency')}</span></span>
              <span className="text-white/30 text-sm line-through mb-0.5">{offer.originalPrice}</span>
              {saved > 0 && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md mb-0.5"
                  style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }}
                >
                  {language === 'ar' ? 'وفّر' : 'Save'} {saved} {t('product.currency')}
                </motion.span>
              )}
            </div>

            {/* Countdown — Compact Premium */}
            {!countdown.expired ? (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Timer size={11} className="text-white/40" />
                    <span className="text-white/40 text-[10px] font-semibold">{t('mobile.home.offers.endsIn')}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 mb-2">
                  {countdown.days > 0 && (
                    <CountdownUnit value={countdown.days} label={t('mobile.home.offers.days')} />
                  )}
                  <CountdownUnit value={countdown.hours} label={t('mobile.home.offers.hours')} />
                  <CountdownUnit value={countdown.minutes} label={t('mobile.home.offers.minutes')} />
                  <CountdownUnit value={countdown.seconds} label={t('mobile.home.offers.seconds')} />
                </div>
                {/* Time progress bar */}
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #FF6F61, #ff4757)' }}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-3 bg-white/5 rounded-lg px-3 py-2 text-center border border-white/5">
                <span className="text-white/30 text-xs font-semibold">{t('mobile.home.offers.expired')}</span>
              </div>
            )}

            {/* Action Button — Premium */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => {
                if (offer.productId) {
                  const storeProducts = useMobileStore.getState().products;
                  const product = storeProducts.find((p) => p.id === offer.productId);
                  if (product) onSelectProduct(product);
                }
              }}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FF6F61 0%, #ff4757 100%)',
                boxShadow: '0 4px 16px rgba(255,71,87,0.35), 0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <span className="relative z-10 text-white flex items-center gap-2">
                {t('mobile.home.offers.shopNow')}
                {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </span>
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full animate-[shimmerSweep_3s_infinite]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
            </motion.button>
          </div>

          {/* Premium Slide Indicators with progress */}
          {offers.length > 1 && (
            <div className="flex gap-1.5 px-4 pb-3 pt-1">
              {offers.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className="flex-1 h-1 rounded-full overflow-hidden transition-all duration-300"
                  style={{ background: i === activeSlide ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)' }}
                >
                  {i === activeSlide && (
                    <motion.div
                      key={`progress-${activeSlide}`}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #FF6F61, #ff4757)' }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 6, ease: 'linear' }}
                      onAnimationComplete={() => setActiveSlide((prev) => (prev + 1) % offers.length)}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MOBILE FEATURED TESTIMONIAL - Auto-rotating dark card
// ═══════════════════════════════════════════════════════════════════════
const MOBILE_TESTIMONIALS = [
  { quoteKey: 'testimonials.quote1', nameKey: 'testimonials.name1', roleKey: 'testimonials.role1', rating: 5, accent: '#004B63' },
  { quoteKey: 'testimonials.quote2', nameKey: 'testimonials.name2', roleKey: 'testimonials.role2', rating: 5, accent: '#00897B' },
  { quoteKey: 'testimonials.quote3', nameKey: 'testimonials.name3', roleKey: 'testimonials.role3', rating: 4, accent: '#D4A843' },
  { quoteKey: 'testimonials.quote4', nameKey: 'testimonials.name4', roleKey: 'testimonials.role4', rating: 5, accent: '#00A8CC' },
  { quoteKey: 'testimonials.quote5', nameKey: 'testimonials.name5', roleKey: 'testimonials.role5', rating: 5, accent: '#006B8A' },
  { quoteKey: 'testimonials.quote6', nameKey: 'testimonials.name6', roleKey: 'testimonials.role6', rating: 4, accent: '#00897B' },
];

function MobileFeaturedTestimonial() {
  const { t, language } = useLanguageStore();
  const isRTL = language === 'ar';
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % MOBILE_TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = MOBILE_TESTIMONIALS[activeIdx];

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
      style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0F2235 50%, #142D45 100%)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 end-0 w-28 h-28 rounded-full bg-[#D4A843]/[0.06] blur-2xl" />
        <div className="absolute bottom-0 start-0 w-20 h-20 rounded-full bg-[#00897B]/[0.06] blur-2xl" />
      </div>

      <div className="relative z-10 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 30 : -30 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Quote icon */}
            <div className="mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #D4A843, #E8C564)', boxShadow: '0 4px 12px rgba(212,168,67,0.3)' }}
              >
                <Quote size={14} className="text-white" />
              </div>
            </div>

            {/* Quote text */}
            <p className="text-white/85 text-[13px] font-medium leading-relaxed mb-4" style={{ lineHeight: 1.8 }}>
              &ldquo;{t(current.quoteKey)}&rdquo;
            </p>

            {/* Stars */}
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < current.rating ? 'fill-[#D4A843] text-[#D4A843]' : 'text-white/20'} />
              ))}
            </div>

            {/* Customer info */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/10"
                style={{
                  background: `linear-gradient(135deg, ${current.accent}, ${current.accent}BB)`,
                  boxShadow: `0 3px 10px ${current.accent}40`,
                }}
              >
                {t(current.nameKey).charAt(0)}
              </div>
              <div>
                <p className="text-white text-xs font-bold">{t(current.nameKey)}</p>
                <p className="text-white/40 text-[10px]">{t(current.roleKey)}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 px-4 pb-3 pt-1">
        {MOBILE_TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
            style={{
              width: i === activeIdx ? '1.5rem' : '0.4rem',
              background: i === activeIdx ? 'rgba(212,168,67,0.4)' : 'rgba(255,255,255,0.12)',
            }}
          >
            {i === activeIdx && (
              <motion.div
                key={`tdot-${activeIdx}`}
                className="absolute inset-0 rounded-full"
                style={{ background: 'linear-gradient(90deg, #D4A843, #E8C564)' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
                onAnimationComplete={() => setActiveIdx((prev) => (prev + 1) % MOBILE_TESTIMONIALS.length)}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// BEST SELLER CARD - Memoized
// ═══════════════════════════════════════════════════════════════════════
const BestSellerCard = memo(function BestSellerCard({
  product, language, currency, onSelect,
}: {
  product: Product; language: string; currency: string; onSelect: () => void;
}) {
  const img = product.mainImage || product.image || (Array.isArray(product.images) ? product.images[0] : undefined);
  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const darkMode = useMobileStore((s) => s.darkMode);

  return (
    <motion.div
      onClick={onSelect}
      className="min-w-[140px] rounded-xl overflow-hidden cursor-pointer group"
      whileTap={{ scale: 0.97 }}
      style={{
        background: darkMode
          ? 'linear-gradient(145deg, #1A2540 0%, #151D2E 100%)'
          : 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFB 100%)',
        boxShadow: darkMode
          ? '0 2px 8px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,75,99,0.06), 0 1px 2px rgba(0,0,0,0.03)',
        border: 'none',
      }}
    >
      <div className="h-28 overflow-hidden relative" style={{
        background: darkMode
          ? 'linear-gradient(135deg, #1E2A42 0%, #151D2E 100%)'
          : 'linear-gradient(135deg, #F0F4F8 0%, #E8EDF2 100%)',
      }}>
        {img ? (
          <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
        )}
        {product.rating && (
          <div className="absolute bottom-1.5 left-1.5 rounded-md px-1.5 py-0.5 flex items-center gap-0.5" style={{
            background: darkMode ? 'rgba(21,29,46,0.95)' : 'rgba(255,255,255,0.95)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span className={`text-[9px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{product.rating}</span>
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className={`text-[11px] font-semibold line-clamp-1 ${darkMode ? 'text-gray-100' : 'text-[#0F172A]'}`}>{name}</h3>
        <div className="flex items-center gap-1 mt-1">
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="text-[13px] font-extrabold tracking-tight text-[#4ADE80]" style={{ textShadow: '0 0 10px rgba(74,222,128,0.25)' }}>{product.price}</span>
            <span className="text-[9px] font-bold text-[#4ADE80]/65">{currency}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER - Counts up from 0 with ease-out curve
// ═══════════════════════════════════════════════════════════════════════
function MobileAnimatedCounter({ value, suffix, duration = 2000 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic: fast start, smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * value);
      setCount(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="text-base font-extrabold text-white">
      {value >= 1000 ? count.toLocaleString() : count}{suffix}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HOME TAB - Performance Optimized
// ═══════════════════════════════════════════════════════════════════════
export function HomeTab({ products, categories, searchQuery, setSearchQuery, onSelectProduct, favorites, toggleFavorite }: {
  products: Product[]; categories: Category[]; searchQuery: string; setSearchQuery: (q: string) => void; onSelectProduct: (p: Product) => void; favorites: string[]; toggleFavorite: (id: string) => void;
}) {
  const { t, language } = useLanguageStore();
  const addItem = useCartStore((s) => s.addItem);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';
  const user = useMobileStore((s) => s.user);
  const storeAvatar = useMobileStore((s) => s.avatar);
  const hasMore = useMobileStore((s) => s.hasMore);
  const pushNavHistory = useMobileStore((s) => s.pushNavHistory);
  const setActiveTab = useMobileStore((s) => s.setActiveTab);
  const setSelectedCatId = useMobileStore((s) => s.setSelectedCatId);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Resolve display avatar: storeAvatar (synced from all photo uploads) > user.avatar (API)
  const displayAvatar = storeAvatar || user?.avatar || null;

  // Scroll container ref for pull-to-refresh
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef(0);
  const isPullingRef = useRef(false);

  // ─── Best Sellers Auto-Scroll Animation ───
  const bestSellerScrollerRef = useRef<HTMLDivElement>(null);
  const bestSellerAnimRef = useRef<number>(0);
  const bestSellerPosRef = useRef(0);
  const bestSellerSpeedRef = useRef(0.4); // pixels per frame (~24px/s at 60fps)
  const bestSellerPausedRef = useRef(false);
  const bestSellerDraggingRef = useRef(false);

  // ─── Category Scroll Refs (manual scroll, no auto-scroll) ───
  const catScrollerRef = useRef<HTMLDivElement>(null);
  const catDraggingRef = useRef(false);
  const catDragStartXRef = useRef(0);
  const catDragStartPosRef = useRef(0);
  const catPosRef = useRef(0);
  const catRtlRef = useRef(isRTL);
  const bestSellerDragStartXRef = useRef(0);
  const bestSellerDragStartPosRef = useRef(0);
  const bestSellerLastTimeRef = useRef(0);
  const bestSellerRtlRef = useRef(isRTL);
  const bestSellerAnimateRef = useRef<(timestamp: number) => void>(() => {});

  // ─── Voice Search on Home Screen ───
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ar' ? 'ar-LY' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        if (transcript.trim()) {
          setSearchQuery(transcript);
          useMobileStore.getState().setScreen('search');
        }
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [language, setSearchQuery]);

  const handleVoiceSearchHome = useCallback(() => {
    if (!recognitionRef.current) {
      useMobileStore.getState().setScreen('search');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language === 'ar' ? 'ar-LY' : 'en-US';
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, language]);

  // ─── Image Search on Home Screen ───
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageSearching, setImageSearching] = useState(false);

  const handleImageSearchHome = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
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
              setSearchQuery(data.query);
              useMobileStore.getState().setScreen('search');
            }
          }
        } catch {
          const fallbackQuery = language === 'ar' ? 'منتج مشابه' : 'similar product';
          setSearchQuery(fallbackQuery);
          useMobileStore.getState().setScreen('search');
        }
        setImageSearching(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setImageSearching(false);
    }
    e.target.value = '';
  }, [language, setSearchQuery]);

  // ─── Pull-to-Refresh (only at top of scroll, not interfering with scroll) ───
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = scrollContainerRef.current?.scrollTop ?? 0;
    // Only start pull-to-refresh if we're at the very top
    if (scrollTop <= 0) {
      touchStartRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    } else {
      isPullingRef.current = false;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPullingRef.current) return;
    const diff = e.touches[0].clientY - touchStartRef.current;
    if (diff < 10) {
      isPullingRef.current = false;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isPullingRef.current) return;
    setRefreshing(true);
    useMobileStore.getState().refreshData().then(() => {
      setRefreshing(false);
    });
    isPullingRef.current = false;
  }, []);

  // ─── Memoized best sellers ───
  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.reviewCount || 0) * (b.rating || 1) - (a.reviewCount || 0) * (a.rating || 1))
      .slice(0, 10);
  }, [products]);

  // ─── Sync RTL ref ───
  useEffect(() => {
    bestSellerRtlRef.current = isRTL;
  }, [isRTL]);

  // ─── Best Sellers Animation Loop ───
  useEffect(() => {
    bestSellerAnimateRef.current = (timestamp: number) => {
      if (!bestSellerLastTimeRef.current) bestSellerLastTimeRef.current = timestamp;
      const delta = Math.min(timestamp - bestSellerLastTimeRef.current, 32); // cap delta to avoid jumps
      bestSellerLastTimeRef.current = timestamp;

      if (!bestSellerPausedRef.current && !bestSellerDraggingRef.current) {
        const el = bestSellerScrollerRef.current;
        if (el) {
          const setWidth = el.scrollWidth / 3; // 3 copies rendered
          const rtl = bestSellerRtlRef.current;

          if (rtl) {
            bestSellerPosRef.current += bestSellerSpeedRef.current * (delta / 16.67);
            if (bestSellerPosRef.current >= setWidth) {
              bestSellerPosRef.current -= setWidth;
            }
          } else {
            bestSellerPosRef.current -= bestSellerSpeedRef.current * (delta / 16.67);
            if (Math.abs(bestSellerPosRef.current) >= setWidth) {
              bestSellerPosRef.current += setWidth;
            }
          }

          el.style.transform = `translate3d(${bestSellerPosRef.current}px, 0, 0)`;
        }
      }

      bestSellerAnimRef.current = requestAnimationFrame(bestSellerAnimateRef.current);
    };
  }, []);

  // Start/stop animation based on bestSellers availability
  useEffect(() => {
    if (bestSellers.length === 0) return;

    // Start from middle set for seamless looping
    const initPosition = () => {
      const el = bestSellerScrollerRef.current;
      if (el) {
        const setWidth = el.scrollWidth / 3;
        const rtl = bestSellerRtlRef.current;
        bestSellerPosRef.current = rtl ? setWidth : -setWidth;
        el.style.transform = `translate3d(${bestSellerPosRef.current}px, 0, 0)`;
      }
    };

    // Small delay to ensure DOM is laid out
    requestAnimationFrame(() => {
      initPosition();
      bestSellerLastTimeRef.current = 0;
      bestSellerAnimRef.current = requestAnimationFrame(bestSellerAnimateRef.current);
    });

    return () => {
      if (bestSellerAnimRef.current) {
        cancelAnimationFrame(bestSellerAnimRef.current);
      }
    };
  }, [bestSellers.length]);

  // Best Sellers touch interaction handlers
  const handleBestSellerTouchStart = useCallback((e: React.TouchEvent) => {
    bestSellerPausedRef.current = true;
    bestSellerDraggingRef.current = true;
    bestSellerDragStartXRef.current = e.touches[0].clientX;
    bestSellerDragStartPosRef.current = bestSellerPosRef.current;
  }, []);

  const handleBestSellerTouchMove = useCallback((e: React.TouchEvent) => {
    if (!bestSellerDraggingRef.current) return;
    const dx = e.touches[0].clientX - bestSellerDragStartXRef.current;
    bestSellerPosRef.current = bestSellerDragStartPosRef.current + dx;
    const el = bestSellerScrollerRef.current;
    if (el) {
      el.style.transform = `translate3d(${bestSellerPosRef.current}px, 0, 0)`;
    }
  }, []);

  const handleBestSellerTouchEnd = useCallback(() => {
    bestSellerDraggingRef.current = false;
    // Resume after a short delay for smoother experience
    setTimeout(() => {
      bestSellerPausedRef.current = false;
    }, 800);
  }, []);

  // ─── Category Manual Scroll ───
  // Sync RTL ref
  useEffect(() => {
    catRtlRef.current = isRTL;
  }, [isRTL]);

  // Initialize category position
  useEffect(() => {
    if (categories.length === 0) return;
    const el = catScrollerRef.current;
    if (el) {
      catPosRef.current = 0;
      el.style.transform = `translate3d(0px, 0, 0)`;
    }
  }, [categories.length]);

  // Category scroll by arrow — with boundary clamping
  const handleCatScroll = useCallback((direction: 'left' | 'right') => {
    const el = catScrollerRef.current;
    if (!el) return;
    const scrollAmount = 200; // px
    const rtl = catRtlRef.current;
    const delta = direction === 'right' ? (rtl ? scrollAmount : -scrollAmount) : (rtl ? -scrollAmount : scrollAmount);
    const newPos = catPosRef.current + delta;
    // Clamp: don't scroll past content bounds
    const parentWidth = el.parentElement?.clientWidth ?? 0;
    const contentWidth = el.scrollWidth;
    const maxScroll = 0;
    const minScroll = -(contentWidth - parentWidth);
    catPosRef.current = Math.max(minScroll, Math.min(maxScroll, newPos));
    el.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    el.style.transform = `translate3d(${catPosRef.current}px, 0, 0)`;
    // Remove transition after animation
    setTimeout(() => {
      el.style.transition = '';
    }, 400);
  }, []);

  // Category touch/drag handlers — with boundary clamping
  const handleCatTouchStart = useCallback((e: React.TouchEvent) => {
    catDraggingRef.current = true;
    catDragStartXRef.current = e.touches[0].clientX;
    catDragStartPosRef.current = catPosRef.current;
    const el = catScrollerRef.current;
    if (el) el.style.transition = '';
  }, []);

  const handleCatTouchMove = useCallback((e: React.TouchEvent) => {
    if (!catDraggingRef.current) return;
    const dx = e.touches[0].clientX - catDragStartXRef.current;
    const newPos = catDragStartPosRef.current + dx;
    const el = catScrollerRef.current;
    if (el) {
      // Clamp position within bounds
      const parentWidth = el.parentElement?.clientWidth ?? 0;
      const contentWidth = el.scrollWidth;
      const maxScroll = 0;
      const minScroll = -(contentWidth - parentWidth);
      catPosRef.current = Math.max(minScroll, Math.min(maxScroll, newPos));
      el.style.transform = `translate3d(${catPosRef.current}px, 0, 0)`;
    }
  }, []);

  const handleCatTouchEnd = useCallback(() => {
    catDraggingRef.current = false;
    // Snap to nearest boundary if out of bounds
    const el = catScrollerRef.current;
    if (el) {
      const parentWidth = el.parentElement?.clientWidth ?? 0;
      const contentWidth = el.scrollWidth;
      const maxScroll = 0;
      const minScroll = -(contentWidth - parentWidth);
      if (catPosRef.current > maxScroll || catPosRef.current < minScroll) {
        catPosRef.current = Math.max(minScroll, Math.min(maxScroll, catPosRef.current));
        el.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        el.style.transform = `translate3d(${catPosRef.current}px, 0, 0)`;
        setTimeout(() => { el.style.transition = ''; }, 300);
      }
    }
  }, []);

  // Pause best-seller auto-scroll animations when app is backgrounded
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        bestSellerPausedRef.current = true;
      } else {
        bestSellerPausedRef.current = false;
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const greeting = user ? (user.name === 'مدير النظام' ? (language === 'ar' ? 'مدير النظام' : 'System Admin') : user.name) : (language === 'ar' ? 'ضيف' : 'Guest');
  const currency = t('product.currency');

  return (
    <div
      className="pb-24"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ contain: 'layout style' }}
    >
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {refreshing && (
          <motion.div
            className="flex items-center justify-center py-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 40, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}>
              <RefreshCw size={20} className="text-[#004B63] dark:text-[#00C4E8]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient Header with Greeting + Search — Professional Advanced */}
      <div className="relative overflow-hidden premium-header-gradient" style={{ contain: 'content' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        {/* Animated ambient glow spots */}
        <div className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full bg-[#00A8CC]/10 blur-xl" />
        <div className="absolute bottom-1/3 right-1/3 w-16 h-16 rounded-full bg-[#00897B]/10 blur-lg" />

        <div className="relative z-10 px-5 pt-10 pb-6">
          {/* Top bar: Logo + Actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shadow-lg ring-2 ring-white/20" style={{ background: displayAvatar ? 'transparent' : 'linear-gradient(135deg, #006B8A, #00897B)' }}>
                {displayAvatar ? (
                  <img src={displayAvatar} alt={greeting} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-base font-bold">{greeting.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="text-white/50 text-[10px] font-medium">{language === 'ar' ? 'مرحباً' : 'Hello'}</p>
                <h1 className="text-white text-base font-bold">{greeting}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NetworkStatus />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => useMobileStore.getState().setScreen('notifications')}
                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 relative"
                style={{ backdropFilter: 'blur(8px)' }}
                aria-label={language === 'ar' ? 'الإشعارات' : 'Notifications'}
              >
                <Bell size={16} className="text-white" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6F61] ring-2 ring-[#004B63]/50" />
              </motion.button>
            </div>
          </div>

          {/* Search Bar — Premium Glass Design */}
          <div className="w-full flex items-center gap-2 py-3 px-4 rounded-xl premium-search">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => useMobileStore.getState().setScreen('search')}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <TypewriterText language={language} />
            </motion.button>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleVoiceSearchHome}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-[#004B63]/5 dark:bg-[#00C4E8]/5'}`}
                aria-label={language === 'ar' ? 'بحث بالصوت' : 'Voice search'}
              >
                <Mic size={16} className={isListening ? 'text-white' : 'text-[#004B63] dark:text-[#00C4E8]'} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => imageInputRef.current?.click()}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${imageSearching ? 'animate-pulse' : ''} bg-[#004B63]/5 dark:bg-[#00C4E8]/5`}
                aria-label={language === 'ar' ? 'بحث بالصورة' : 'Image search'}
              >
                {imageSearching ? <RefreshCw size={16} className="text-[#004B63] dark:text-[#00C4E8] animate-spin" /> : <Camera size={16} className="text-[#004B63] dark:text-[#00C4E8]" />}
              </motion.button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSearchHome}
                className="hidden"
              />
            </div>
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

      {/* Categories - Controlled Scroll with Side Arrows + Filter */}
      {categories.length > 0 && (
        <div className="mt-5" style={{ contain: 'content' }}>
          {/* Section Header — Professional */}
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 section-accent-line">{t('mobile.home.categories')}</h2>
            {/* Filter Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab('categories')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#004B63]/8 dark:bg-[#00C4E8]/8 border border-[#004B63]/15 dark:border-[#00C4E8]/15 transition-colors hover:bg-[#004B63]/15 dark:hover:bg-[#00C4E8]/15"
            >
              <SlidersHorizontal size={13} className="text-[#004B63] dark:text-[#00C4E8]" />
              <span className="text-[10px] font-semibold text-[#004B63] dark:text-[#00C4E8]">{language === 'ar' ? 'تصفية' : 'Filter'}</span>
            </motion.button>
          </div>

          {/* Scrollable Category Carousel with Side Arrows */}
          <div className="relative flex items-center">
            {/* Left Arrow — overlaid on left side */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleCatScroll('left')}
              className="absolute left-0 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-[#1E2A42]/90 shadow-md border border-gray-200/60 dark:border-gray-700/40 backdrop-blur-sm"
              style={{ transform: 'translateX(-2px)' }}
              aria-label={language === 'ar' ? 'تمرير لليمين' : 'Scroll right'}
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
            </motion.button>

            {/* Category Items Track */}
            <div className="overflow-hidden flex-1 mx-5" dir={direction}>
              <div
                className="flex gap-3 py-1 px-2"
                ref={catScrollerRef}
                style={{ willChange: 'transform', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                onTouchStart={handleCatTouchStart}
                onTouchMove={handleCatTouchMove}
                onTouchEnd={handleCatTouchEnd}
              >
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex flex-col items-center min-w-[68px] group cursor-pointer"
                    onClick={() => {
                      setSelectedCatId(cat.id);
                      setActiveTab('categories');
                    }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl premium-icon-container transition-all group-hover:shadow-md group-hover:scale-105" >
                      {cat.icon || '📦'}
                    </div>
                    <span className="text-[10px] text-[#3B4F63] dark:text-[#6B7F96] mt-1.5 text-center font-medium max-w-[60px] line-clamp-1">{language === 'ar' ? cat.nameAr : cat.nameEn}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow — overlaid on right side */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleCatScroll('right')}
              className="absolute right-0 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-[#1E2A42]/90 shadow-md border border-gray-200/60 dark:border-gray-700/40 backdrop-blur-sm"
              style={{ transform: 'translateX(2px)' }}
              aria-label={language === 'ar' ? 'تمرير لليسار' : 'Scroll left'}
            >
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Promo Banner — Premium Advanced */}
      <div className="mx-4 mt-5 rounded-2xl p-4 flex items-center gap-3 shadow-md relative overflow-hidden micro-shimmer" style={{ background: 'linear-gradient(135deg, #FF6F61 0%, #ff8a7a 50%, #FFB09C 100%)', boxShadow: '0 4px 16px rgba(255,111,97,0.25), 0 2px 4px rgba(0,0,0,0.04)', contain: 'content' }}>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
        <div className="flex-1 relative z-10">
          <h3 className="text-white font-bold text-sm">{t('mobile.home.todayOffers')}</h3>
          <p className="text-white/80 text-xs mt-0.5">{t('mobile.home.offersDesc')}</p>
        </div>
        <div className="bg-white/25 rounded-xl px-3 py-1.5 relative z-10 backdrop-blur-sm">
          <span className="text-white text-xs font-bold">{t('mobile.home.shop')}</span>
        </div>
      </div>

      {/* Offers Section with Countdown */}
      <OffersSection offers={LOCAL_OFFERS} onSelectProduct={onSelectProduct} />

      {/* Best Sellers - Smooth Auto-Scroll Carousel */}
      {products.length > 0 && (
        <div className="mt-5" style={{ contain: 'content' }}>
          {/* Section Header — Professional */}
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 section-accent-line">
              {t('mobile.home.bestSellers')}
            </h2>
            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {language === 'ar' ? 'تمرير تلقائي' : 'Auto-scroll'}
            </span>
          </div>

          {/* Infinite Auto-Scroll Carousel */}
          <div className="overflow-hidden" dir={direction}>
            {/* Scrolling track */}
            <div
              className="flex gap-3 py-1 px-4"
              ref={bestSellerScrollerRef}
              style={{ willChange: 'transform', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              onTouchStart={handleBestSellerTouchStart}
              onTouchMove={handleBestSellerTouchMove}
              onTouchEnd={handleBestSellerTouchEnd}
            >
              {/* Render 3 copies for seamless infinite loop */}
              {[0, 1, 2].map((setIndex) =>
                bestSellers.map((product) => (
                  <BestSellerCard
                    key={`${product.id}-${setIndex}`}
                    product={product}
                    language={language}
                    currency={currency}
                    onSelect={() => onSelectProduct(product)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Trust Features — Premium Advanced */}
      <div className="px-4 mt-6" style={{ contain: 'content' }}>
        {/* Header with badge */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#004B63] dark:bg-[#00C4E8] animate-pulse" />
              <span className="text-[9px] font-bold text-[#004B63] dark:text-[#00C4E8] uppercase tracking-wider">{language === 'ar' ? 'مميزاتنا' : 'Our Features'}</span>
            </div>
            <h2 className="text-base font-extrabold text-gray-800 dark:text-gray-100">{language === 'ar' ? 'لماذا نبض المدينة؟' : 'Why City Pulse?'}</h2>
          </div>
        </div>

        {/* Feature Cards — 2×2 Premium Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: <Shield size={18} className="text-white" />,
              title: t('feature.quality'),
              desc: t('feature.qualityDesc'),
              gradient: 'linear-gradient(135deg, #004B63 0%, #006B8A 100%)',
              accentColor: '#004B63',
              stat: '100%',
              statLabel: language === 'ar' ? 'أصلي' : 'Authentic',
            },
            {
              icon: <Truck size={18} className="text-white" />,
              title: t('feature.fastDelivery'),
              desc: t('feature.fastDeliveryDesc'),
              gradient: 'linear-gradient(135deg, #00897B 0%, #00A896 100%)',
              accentColor: '#00897B',
              stat: '24h',
              statLabel: language === 'ar' ? 'توصيل' : 'Delivery',
            },
            {
              icon: <Headphones size={18} className="text-white" />,
              title: t('feature.support'),
              desc: t('feature.supportDesc'),
              gradient: 'linear-gradient(135deg, #004B63 0%, #00A8CC 100%)',
              accentColor: '#00A8CC',
              stat: '24/7',
              statLabel: language === 'ar' ? 'متاح' : 'Available',
            },
            {
              icon: <RefreshCw size={18} className="text-white" />,
              title: t('feature.easyReturns'),
              desc: t('feature.easyReturnsDesc'),
              gradient: 'linear-gradient(135deg, #D4A843 0%, #E8C564 100%)',
              accentColor: '#D4A843',
              stat: '14',
              statLabel: language === 'ar' ? 'يوم إرجاع' : 'Day Returns',
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileTap={{ scale: 0.97 }}
              className="relative rounded-2xl p-3.5 overflow-hidden cursor-default group"
              style={{
                background: 'var(--background, #FFFFFF)',
                boxShadow: `0 2px 12px ${f.accentColor}10, 0 1px 3px rgba(0,0,0,0.04)`,
                border: `1px solid ${f.accentColor}15`,
              }}
            >
              {/* Hover gradient overlay */}
              <div
                className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${f.accentColor}08, transparent)` }}
              />

              {/* Stat badge — top right */}
              <div
                className="absolute top-2 end-2 px-1.5 py-0.5 rounded-md text-[8px] font-bold"
                style={{ background: `${f.accentColor}12`, color: f.accentColor }}
              >
                {f.stat} {f.statLabel}
              </div>

              {/* Icon with gradient background */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 shadow-md relative z-10"
                style={{ background: f.gradient, boxShadow: `0 4px 14px ${f.accentColor}30` }}
              >
                {f.icon}
              </div>

              {/* Title */}
              <h4 className="text-xs font-bold text-[#0F172A] dark:text-gray-100 relative z-10">{f.title}</h4>

              {/* Description */}
              <p className="text-[10px] text-[#3B4F63] dark:text-[#6B7F96] mt-0.5 leading-relaxed line-clamp-2 relative z-10">{f.desc}</p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 start-0 end-0 h-[2.5px] opacity-60"
                style={{ background: f.gradient }}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats Bar — Mini */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #004B63 0%, #006B8A 40%, #00897B 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 grid grid-cols-4 gap-2">
            {[
              { value: 10000, suffix: '+', label: language === 'ar' ? 'عميل' : 'Clients', icon: Users },
              { value: 50000, suffix: '+', label: language === 'ar' ? 'منتج' : 'Products', icon: Package },
              { value: 99, suffix: '%', label: language === 'ar' ? 'رضا' : 'Satisfaction', icon: Star },
              { value: 24, suffix: '/7', label: language === 'ar' ? 'دعم' : 'Support', icon: Clock },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="text-center">
                  <div className="w-7 h-7 mx-auto rounded-lg bg-white/10 flex items-center justify-center mb-1.5">
                    <Icon size={13} className="text-white/70" />
                  </div>
                  <MobileAnimatedCounter value={s.value} suffix={s.suffix} />
                  <p className="text-[9px] text-white/50 font-medium mt-0.5">{s.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Testimonials — Premium Advanced */}
      <div className="px-4 mt-6" style={{ contain: 'content' }}>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A843, #E8C564)', boxShadow: '0 3px 10px rgba(212,168,67,0.3)' }}>
              <Quote size={12} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">{t('testimonials.title')}</h2>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={8} className="fill-[#D4A843] text-[#D4A843]" />
                ))}
                <span className="text-[8px] text-gray-400 font-medium ms-1">4.8</span>
              </div>
            </div>
          </div>
          <span className="text-[9px] font-bold text-[#D4A843] px-2 py-1 rounded-md bg-[#D4A843]/10 border border-[#D4A843]/15">
            {language === 'ar' ? 'تقييمات حقيقية' : 'Verified'}
          </span>
        </div>

        {/* Featured Testimonial Card — Dark Premium */}
        <MobileFeaturedTestimonial />

        {/* All Testimonials — Horizontal Scroll */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 mt-3 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch', willChange: 'scroll-position' }}>
          {[
            { name: t('testimonials.name1'), role: t('testimonials.role1'), quote: t('testimonials.quote1'), rating: 5, accent: '#004B63' },
            { name: t('testimonials.name2'), role: t('testimonials.role2'), quote: t('testimonials.quote2'), rating: 5, accent: '#00897B' },
            { name: t('testimonials.name3'), role: t('testimonials.role3'), quote: t('testimonials.quote3'), rating: 4, accent: '#D4A843' },
            { name: t('testimonials.name4'), role: t('testimonials.role4'), quote: t('testimonials.quote4'), rating: 5, accent: '#00A8CC' },
            { name: t('testimonials.name5'), role: t('testimonials.role5'), quote: t('testimonials.quote5'), rating: 5, accent: '#006B8A' },
            { name: t('testimonials.name6'), role: t('testimonials.role6'), quote: t('testimonials.quote6'), rating: 4, accent: '#00897B' },
          ].map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="min-w-[220px] max-w-[220px] rounded-xl p-3.5 relative overflow-hidden group"
              style={{
                background: 'var(--background, #FFFFFF)',
                boxShadow: `0 2px 10px ${test.accent}08, 0 1px 3px rgba(0,0,0,0.04)`,
                border: `1px solid ${test.accent}12`,
              }}
            >
              {/* Accent top border */}
              <div className="absolute top-0 start-0 end-0 h-[2.5px]" style={{ background: `linear-gradient(90deg, ${test.accent}, ${test.accent}60, transparent)` }} />

              {/* Quote icon + Stars */}
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${test.accent}12` }}>
                  <Quote size={10} style={{ color: test.accent }} />
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={7} className={s <= test.rating ? 'fill-[#D4A843] text-[#D4A843]' : 'text-gray-200 dark:text-gray-700'} />
                  ))}
                </div>
              </div>

              {/* Quote text */}
              <p className="text-[10px] text-[#3B4F63] dark:text-[#8B9FB5] leading-relaxed mb-2.5 line-clamp-3">&ldquo;{test.quote}&rdquo;</p>

              {/* Customer info */}
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${test.accent}, ${test.accent}BB)`, boxShadow: `0 2px 8px ${test.accent}30` }}
                >
                  {test.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[#0F172A] dark:text-gray-100 truncate">{test.name}</p>
                  <p className="text-[8px] text-gray-400 truncate">{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 mt-5" style={{ contain: 'content' }}>
        <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">{t('mobile.home.products')}</h2>
        {products.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-400">
            <Package size={40} className="mb-2" />
            <p className="text-sm">{t('mobile.home.noProducts')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3" style={{ willChange: 'auto' }}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={() => {
                    const wasFavorite = favorites.includes(product.id);
                    toggleFavorite(product.id);
                    if (!wasFavorite) {
                      // Navigate to favorites tab after adding
                      pushNavHistory();
                      setActiveTab('favorites');
                    }
                  }}
                  onSelect={() => onSelectProduct(product)}
                  onAddToCart={() => { addItem({ productId: product.id, nameAr: product.nameAr, nameEn: product.nameEn, price: product.price, image: product.mainImage || product.image || '', stock: product.stock || 99 }); }}
                />
              ))}
            </div>
            {/* Load More / All Loaded */}
            {hasMore ? (
              <div className="flex justify-center mt-4 mb-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (loadingMore) return;
                    setLoadingMore(true);
                    useMobileStore.getState().loadMore().then(() => setLoadingMore(false));
                  }}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-xl bg-white dark:bg-[#151D2E] border border-gray-200 dark:border-[#1E2A42] text-sm font-semibold text-[#004B63] dark:text-[#00C4E8] disabled:opacity-50"
                >
                  {loadingMore ? t('common.loading') : t('common.showMore')}
                </motion.button>
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400 dark:text-[#6B7F96] py-4">
                {t('mobile.home.allProductsLoaded')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
