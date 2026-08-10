'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Flame,
  ShoppingCart,
  Package,
  Check,
  Star,
  ArrowLeft,
  ArrowRight,
  Zap,
  Eye,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/stores/cart-store';
import { useLanguageStore } from '@/stores/language-store';
import { useFavoritesStore } from '@/stores/favorites-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import {
  Product as SharedProduct,
  categoryGradients,
  defaultGradient,
  renderStars as sharedRenderStars,
  parseBadges,
  fmt,
} from './lib/shared';

// Re-use shared Product type
type Product = SharedProduct;

// ─── API Response Interface ───
interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Countdown Timer Hook ───
function getEndOfDayCountdown() {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diff = endOfDay.getTime() - now.getTime();

  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(getEndOfDayCountdown);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getEndOfDayCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

// ─── Animated Digit Component ───
function CountdownDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div className="bg-nabdh-primary/90 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3 min-w-[48px] sm:min-w-[60px] border border-nabdh-accent/30 shadow-lg shadow-nabdh-primary/20">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="block text-xl sm:text-2xl font-bold text-white text-center tabular-nums"
            >
              {String(value).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
        </div>
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-lg bg-nabdh-accent/10 blur-sm -z-10" />
      </div>
      <span className="text-[10px] sm:text-xs text-nabdh-primary/70 font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ─── Deal Card Component ───
function DealCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const addItem = useCartStore((s) => s.addItem);
  const isFav = useFavoritesStore(useShallow((s) => s.favoriteIds.includes(product.id)));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const [justAdded, setJustAdded] = useState(false);

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const currency = t('product.currency');
  const gradient = categoryGradients[product.category.slug] || defaultGradient;

  // Calculate discount percentage
  const discountPercent =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const inStock = product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: product.mainImage || '',
      stock: product.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const renderStars = (rating: number) => sharedRenderStars(rating, 'size-3');

  // Deal card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: 'easeOut' as const }}
      className="glass-card-enhanced rounded-xl overflow-hidden group hover-glow"
    >
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden">
        {product.mainImage ? (
          <div
            className={cn(
              'w-full h-full bg-gradient-to-br flex items-center justify-center relative',
              gradient
            )}
          >
            <img
              src={product.mainImage}
              alt={name}
              className="w-full h-full object-cover img-zoom"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const sibling = target.nextElementSibling as HTMLElement;
                if (sibling) sibling.style.display = 'flex';
              }}
            />
            <div className="absolute inset-0 items-center justify-center hidden">
              <span className="text-4xl font-bold text-white/80 select-none">
                {name.charAt(0)}
              </span>
            </div>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none" />
          </div>
        ) : (
          <div
            className={cn(
              'w-full h-full bg-gradient-to-br flex items-center justify-center',
              gradient
            )}
          >
            <Package className="size-12 text-white/40" />
          </div>
        )}

        {/* Discount Badge — Pulsing */}
        {discountPercent > 0 && (
          <div className="absolute top-2 start-2 z-10">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Badge className="bg-nabdh-secondary/95 text-white border-nabdh-secondary/50 text-xs px-2.5 py-1 font-bold shadow-lg shadow-nabdh-secondary/30">
                <Zap className="size-3 me-0.5" />
                {discountPercent}%
              </Badge>
            </motion.div>
          </div>
        )}

        {/* Stock indicator */}
        <div className="absolute bottom-2 start-2">
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm border font-medium',
              inStock
                ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
                : 'bg-red-500/20 text-red-700 border-red-500/30'
            )}
          >
            {inStock ? t('product.inStock') : t('product.outOfStock')}
          </span>
        </div>

        {/* Quick Actions overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none">
          <div className="bg-gradient-to-t from-black/50 to-transparent p-3 pt-8 flex items-center justify-center gap-2">
            {/* Preview Button */}
            <Button
              size="sm"
              className="flex-1 bg-white/90 text-nabdh-primary hover:bg-white hover:scale-105 transition-all pointer-events-auto shadow-md backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Eye className="size-4 me-1" />
              {t('offers.preview')}
            </Button>
            {/* Favorites Button */}
            <Button
              size="sm"
              className={cn(
                'pointer-events-auto shadow-md backdrop-blur-sm px-3 transition-all hover:scale-105',
                isFav
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white/90 text-rose-500 hover:bg-white hover:text-rose-600'
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
            >
              <Heart className={cn('size-4', isFav && 'fill-current')} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-2">
        {/* Category */}
        <p className="text-[10px] text-nabdh-accent font-semibold uppercase tracking-wider">
          {language === 'ar' ? product.category.nameAr : product.category.nameEn}
        </p>

        {/* Name */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-nabdh-primary transition-colors duration-300">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex">{renderStars(product.rating)}</div>
          <span className="text-[10px] text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Pricing with Savings */}
        <div className="space-y-1">
          {product.comparePrice && product.comparePrice > product.price && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground line-through">
                {fmt(product.comparePrice)} {currency}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                {language === 'ar' ? 'وفّر' : 'Save'} {fmt(product.comparePrice - product.price)}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base text-nabdh-price">
              {fmt(product.price)}
            </span>
            <span className="text-xs text-nabdh-price/70 font-medium">
              {currency}
            </span>
          </div>
        </div>

        {/* Add to Cart */}
        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.div
              key="added"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="sm"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                disabled
              >
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

// ─── Skeleton Loader ───
function DealCardSkeleton() {
  return (
    <div className="glass-card-enhanced rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted/50" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-2 bg-muted/50 rounded w-16" />
        <div className="h-4 bg-muted/50 rounded w-3/4" />
        <div className="h-3 bg-muted/50 rounded w-1/2" />
        <div className="h-5 bg-muted/50 rounded w-1/3" />
        <div className="h-8 bg-muted/50 rounded w-full" />
      </div>
    </div>
  );
}

// ─── Main OffersSection Component ───
export function OffersSection() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language, direction: s.direction })));
  const { hours, minutes, seconds } = useCountdown();

  // Fetch sale products
  const { data, isLoading, isError, refetch } = useQuery<ProductsResponse>({
    queryKey: ['offers-products'],
    queryFn: async () => {
      const res = await fetch('/api/products?sort=newest&limit=8');
      if (!res.ok) throw new Error('Failed to fetch products');
      const json: ProductsResponse = await res.json();
      // Filter products that have a sale (comparePrice > price)
      return {
        ...json,
        products: json.products.filter(
          (p) => p.comparePrice && p.comparePrice > p.price
        ),
      };
    },
    staleTime: 60 * 1000,
  });

  const saleProducts = data?.products ?? [];

  // Translation helpers for countdown labels
  const hoursLabel = t('offers.hour');
  const minutesLabel = t('offers.minute');
  const secondsLabel = t('offers.second');

  // All sale products displayed uniformly
  const displayProducts = saleProducts;

  return (
    <section
      id="offers"
      className="relative overflow-hidden"
      dir={direction}
      aria-labelledby="offers-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 start-0 w-72 h-72 rounded-full bg-nabdh-secondary/5 blur-3xl" />
        <div className="absolute bottom-0 end-0 w-96 h-96 rounded-full bg-nabdh-accent/5 blur-3xl" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-nabdh-gold/3 blur-3xl" />
        {/* Subtle diagonal line pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* ─── Section Header — Premium ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          {/* Badge — Pulsing Flame */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-nabdh-secondary/10 text-nabdh-secondary border border-nabdh-secondary/20 rounded-full px-4 py-1.5 mb-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flame className="size-4" />
            </motion.div>
            <span className="text-xs sm:text-sm font-bold">
              {t('offers.limitedTime')}
            </span>
          </motion.div>

          {/* Title */}
          <h2
            id="offers-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold gradient-text mb-3"
          >
            {t('offers.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-4">
            {t('offers.missDeals')}
          </p>

          {/* Animated decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' as const }}
            className="mx-auto h-[3px] w-32 rounded-full origin-center"
            style={{ background: 'linear-gradient(90deg, transparent, #FF6F61, #ff4757, #FF6F61, transparent)' }}
          />
        </motion.div>

        {/* ─── Countdown Timer — Premium with Progress ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col items-center gap-3 mb-10 sm:mb-14"
        >
          <div className="flex items-center gap-2 text-nabdh-primary/80">
            <Clock className="size-4" />
            <span className="text-sm font-semibold">
              {t('offers.endsIn')}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <CountdownDigit value={hours} label={hoursLabel} />
            <span className="text-2xl sm:text-3xl font-bold text-nabdh-primary/60 mt-[-20px]">:</span>
            <CountdownDigit value={minutes} label={minutesLabel} />
            <span className="text-2xl sm:text-3xl font-bold text-nabdh-primary/60 mt-[-20px]">:</span>
            <CountdownDigit value={seconds} label={secondsLabel} />
          </div>

          {/* Time Progress Bar */}
          <div className="w-full max-w-xs h-1.5 rounded-full bg-nabdh-primary/10 overflow-hidden mt-2">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #004B63, #FF6F61)' }}
              initial={{ width: '100%' }}
              animate={{ width: `${((hours * 3600 + minutes * 60 + seconds) / (24 * 3600)) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </motion.div>

        {/* ─── Content ─── */}
        {isError ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-muted-foreground mb-4">
                {t('common.error')}
              </p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="nabdh-gradient text-white border-none hover:opacity-90"
              >
                {t('common.retry')}
              </Button>
            </div>
          </motion.div>
        ) : saleProducts.length === 0 && !isLoading ? (
          /* ─── Empty State ─── */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="glass-card rounded-2xl p-8 sm:p-12 max-w-lg mx-auto">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-nabdh-primary mb-2">
                {t('offers.upcoming')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === 'ar'
                  ? 'اشترك في نشرتنا البريدية لتكون أول من يعرف عن عروضنا'
                  : 'Subscribe to our newsletter to be the first to know about our offers'}
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ─── Products Grid ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {isLoading ? (
                <>
                  <DealCardSkeleton />
                  <DealCardSkeleton />
                  <DealCardSkeleton />
                  <DealCardSkeleton />
                  <DealCardSkeleton />
                  <DealCardSkeleton />
                  <DealCardSkeleton />
                  <DealCardSkeleton />
                </>
              ) : (
                <>
                  {displayProducts.map((product, idx) => (
                    <DealCard
                      key={product.id}
                      product={product}
                      index={idx}
                    />
                  ))}
                </>
              )}
            </div>

            {/* ─── View All Button ─── */}
            {!isLoading && saleProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex justify-center mt-8 sm:mt-12"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2 border-nabdh-primary/30 text-nabdh-primary hover:bg-nabdh-primary hover:text-white hover:border-nabdh-primary font-bold px-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-nabdh-primary/20"
                  onClick={() => {
                    const el = document.querySelector('#products');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t('offers.viewAllOffers')}
                  {direction === 'rtl' ? (
                    <ArrowLeft className="size-4 ms-2 group-hover:-translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="size-4 ms-2 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
