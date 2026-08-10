'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
  Sparkles,
  Pause,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/stores/cart-store';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import {
  Product,
  categoryGradients,
  defaultGradient,
  getBadgeStyle,
  getBadgeLabel,
  renderStars as sharedRenderStars,
  parseBadges,
  fmt,
} from './lib/shared';

// ─── Framer Motion Variants ───
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: 'easeOut' as const,
    },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

// ─── Star Rating Renderer ───
function renderStars(rating: number) {
  return sharedRenderStars(rating, 'size-4');
}

// ─── Loading Skeleton ───
function FeaturedSkeleton() {
  return (
    <div className="flex gap-5 overflow-hidden px-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]"
        >
          <Card className="glass-card-enhanced overflow-hidden border-0">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="size-4 rounded-full" />
                ))}
              </div>
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

// ─── Product Card for Carousel ───
function CarouselProductCard({
  product,
  language,
  t,
  addItem,
  addedProductId,
  setAddedProductId,
}: {
  product: Product;
  language: string;
  t: (key: string) => string;
  addItem: ReturnType<typeof useCartStore.getState>['addItem'];
  addedProductId: string | null;
  setAddedProductId: (id: string | null) => void;
}) {
  const openProductDetail = useUIStore((s) => s.openProductDetail);
  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const categoryName =
    language === 'ar' ? product.category.nameAr : product.category.nameEn;
  const gradient =
    categoryGradients[product.category.slug] || defaultGradient;
  const inStock = product.stock > 0;
  const isJustAdded = addedProductId === product.id;
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;
  const currency = t('product.currency');

  const parsedBadges: string[] = product.badges
    ? (() => {
        try {
          return JSON.parse(product.badges) as string[];
        } catch {
          return [];
        }
      })()
    : [];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: product.mainImage || '',
      stock: product.stock,
    });
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1200);
  };

  return (
    <div className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px]">
      <Card className="glass-card-enhanced overflow-hidden border-0 h-full group hover-glow cursor-pointer" onClick={() => openProductDetail(product.id)}>
        {/* ─── Image Area ─── */}
        <div className="relative aspect-[4/3] overflow-hidden">
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
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const sibling = target.nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 items-center justify-center hidden">
                <span className="text-5xl font-bold text-white/80 select-none">
                  {name.charAt(0)}
                </span>
              </div>
              {/* Shimmer overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none" />
            </div>
          ) : (
            <div
              className={cn(
                'w-full h-full bg-gradient-to-br flex items-center justify-center',
                gradient
              )}
            >
              <Package className="size-16 text-white/30" />
            </div>
          )}

          {/* ─── Gradient overlay at bottom of image ─── */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* ─── Badges ─── */}
          {parsedBadges.length > 0 && (
            <div className="absolute top-3 start-3 flex flex-col gap-1.5">
              {parsedBadges.map((badge) => (
                <Badge
                  key={badge}
                  className={cn(
                    'text-[11px] px-2.5 py-0.5 border backdrop-blur-sm animate-badge-pulse font-medium',
                    getBadgeStyle(badge)
                  )}
                >
                  {getBadgeLabel(badge, t)}
                </Badge>
              ))}
            </div>
          )}

          {/* ─── Discount Badge ─── */}
          {hasDiscount && discountPercent > 0 && (
            <div className="absolute top-3 end-3">
              <Badge className="bg-[#FF6F61] text-white border-0 text-xs font-bold px-2 py-0.5 shadow-lg shadow-[#FF6F61]/30">
                -{discountPercent}%
              </Badge>
            </div>
          )}

          {/* ─── Stock Indicator ─── */}
          <div className="absolute bottom-3 start-3">
            <span
              className={cn(
                'text-[11px] px-2.5 py-1 rounded-full backdrop-blur-sm border transition-all duration-300 font-medium',
                inStock
                  ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-700 border-red-500/30'
              )}
            >
              {inStock ? t('product.inStock') : t('product.outOfStock')}
            </span>
          </div>
        </div>

        {/* ─── Card Content ─── */}
        <CardContent className="p-4 sm:p-5 space-y-3">
          {/* Category */}
          <p className="text-[11px] text-nabdh-accent font-semibold uppercase tracking-wider">
            {categoryName}
          </p>

          {/* Product Name */}
          <h3 className="font-bold text-base sm:text-lg leading-snug line-clamp-2 min-h-[2.8rem] group-hover:text-nabdh-primary transition-colors duration-300">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-xs text-muted-foreground font-medium">
              {fmt(product.rating, 1)} ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl text-nabdh-price">
              {fmt(product.price)} {currency}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {fmt(product.comparePrice)} {currency}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <AnimatePresence mode="wait">
            {isJustAdded ? (
              <motion.div
                key="added"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="lg"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all h-11 rounded-xl font-semibold"
                  disabled
                >
                  <Check className="size-5 me-2" />
                  {t('product.added')}
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
                  size="lg"
                  className={cn(
                    'w-full nabdh-gradient text-white hover:opacity-90 transition-all cart-ripple h-11 rounded-xl font-semibold shadow-md shadow-nabdh-primary/20',
                    !inStock &&
                      'opacity-50 cursor-not-allowed shadow-none'
                  )}
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  <ShoppingCart className="size-5 me-2" />
                  {inStock ? t('product.addToCart') : t('product.outOfStock')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Component ───
export function FeaturedSection() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language, direction: s.direction })));
  const addItem = useCartStore((s) => s.addItem);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const isRTL = direction === 'rtl';

  // Refs for smooth scroll animation
  const scrollerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const positionRef = useRef(0);
  const speedRef = useRef(0.5); // pixels per frame (~30px/s at 60fps)
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const lastTimeRef = useRef(0);

  // ─── Fetch Products ───
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-products', 'rating', 10],
    queryFn: async () => {
      const res = await fetch('/api/products?sort=rating&limit=10');
      if (!res.ok) throw new Error('Failed to fetch products');
      const json = await res.json();
      return json.products as Product[];
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const products = data || [];

  // ─── RTL direction stored in ref for animation loop ───
  const isRTLRef = useRef(isRTL);
  useEffect(() => {
    isRTLRef.current = isRTL;
  }, [isRTL]);

  // ─── Animation function stored in ref ───
  const animateRef = useRef<(timestamp: number) => void>(() => {});

  useEffect(() => {
    animateRef.current = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Skip if paused or dragging
      if (!isPausedRef.current && !isDraggingRef.current) {
        const el = scrollerRef.current;
        if (el) {
          // Calculate the width of one set of products
          const setWidth = el.scrollWidth / 3; // We render 3 copies
          const rtl = isRTLRef.current;

          // Move position
          // For RTL: we scroll in positive direction (right)
          // For LTR: we scroll in negative direction (left)
          if (rtl) {
            positionRef.current += speedRef.current * (delta / 16.67); // Normalize to ~60fps
            // Reset when we've scrolled past one set
            if (positionRef.current >= setWidth) {
              positionRef.current -= setWidth;
            }
          } else {
            positionRef.current -= speedRef.current * (delta / 16.67);
            if (Math.abs(positionRef.current) >= setWidth) {
              positionRef.current += setWidth;
            }
          }

          el.style.transform = `translateX(${positionRef.current}px)`;
        }
      }

      animationRef.current = requestAnimationFrame(animateRef.current);
    };
  });

  // ─── Start Animation ───
  useEffect(() => {
    if (isLoading || products.length === 0) return;

    // Reset position
    positionRef.current = 0;
    lastTimeRef.current = 0;

    animationRef.current = requestAnimationFrame(animateRef.current);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoading, products.length]);

  // ─── Pause on hover ───
  const handleMouseEnter = () => {
    isPausedRef.current = true;
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    isPausedRef.current = false;
    isDraggingRef.current = false;
    setIsPaused(false);
  };

  // ─── Drag / Touch to scroll ───
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = positionRef.current;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    positionRef.current = dragStartPosRef.current + dx;

    const el = scrollerRef.current;
    if (el) {
      el.style.transform = `translateX(${positionRef.current}px)`;
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // ─── Manual scroll with arrows ───
  const scrollByCards = (cardCount: number) => {
    const cardWidth = 340; // Approx card width + gap
    const targetShift = cardWidth * cardCount;

    // Animate smoothly using CSS transition
    const el = scrollerRef.current;
    if (!el) return;

    // Temporarily pause RAF and use CSS transition
    isPausedRef.current = true;

    if (isRTL) {
      positionRef.current -= targetShift;
    } else {
      positionRef.current += targetShift;
    }

    el.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)';
    el.style.transform = `translateX(${positionRef.current}px)`;

    // Remove transition after animation completes, resume RAF
    setTimeout(() => {
      if (el) {
        el.style.transition = '';
      }
      // Normalize position
      const setWidth = el ? el.scrollWidth / 3 : 0;
      if (isRTL) {
        while (positionRef.current < 0) positionRef.current += setWidth;
        while (positionRef.current >= setWidth) positionRef.current -= setWidth;
      } else {
        while (positionRef.current > 0) positionRef.current -= setWidth;
        while (Math.abs(positionRef.current) >= setWidth) positionRef.current += setWidth;
      }
      isPausedRef.current = false;
    }, 650);
  };

  // ─── Play/Pause Toggle ───
  const togglePause = () => {
    isPausedRef.current = !isPausedRef.current;
    setIsPaused((prev) => !prev);
  };

  return (
    <motion.section
      className="relative py-12 sm:py-16 md:py-20 overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
    >
      {/* ─── Background Decoration ─── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 start-0 w-72 h-72 rounded-full bg-nabdh-primary/[0.03] blur-3xl" />
        <div className="absolute bottom-0 end-0 w-96 h-96 rounded-full bg-nabdh-accent/[0.04] blur-3xl" />
        <div className="absolute top-1/2 start-1/3 w-64 h-64 rounded-full bg-nabdh-secondary/[0.02] blur-3xl" />
      </div>

      {/* ─── Section Header ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10">
        <motion.div
          variants={headingVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-animated leading-tight">
                {t('section.bestSellers')}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {language === 'ar'
                  ? 'أعلى المنتجات تقييماً من اختيار عملائنا'
                  : 'Top rated products chosen by our customers'}
              </p>
            </div>
          </div>

          {/* ─── Controls ─── */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Play/Pause */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 border-nabdh-primary/20 hover:bg-nabdh-primary/10 hover:border-nabdh-primary/40 transition-all"
                onClick={togglePause}
                aria-label={isPaused ? 'Play' : 'Pause'}
              >
                {isPaused ? (
                  <Play className="size-4 text-nabdh-primary" />
                ) : (
                  <Pause className="size-4 text-nabdh-primary" />
                )}
              </Button>
            </motion.div>

            {/* Navigation Arrows */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 border-nabdh-primary/20 hover:bg-nabdh-primary/10 hover:border-nabdh-primary/40 transition-all"
                onClick={() => scrollByCards(-1)}
                aria-label={isRTL ? 'Next' : 'Previous'}
              >
                <ChevronLeft className="size-5 text-nabdh-primary" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 border-nabdh-primary/20 hover:bg-nabdh-primary/10 hover:border-nabdh-primary/40 transition-all"
                onClick={() => scrollByCards(1)}
                aria-label={isRTL ? 'Previous' : 'Next'}
              >
                <ChevronRight className="size-5 text-nabdh-primary" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* ─── Decorative Divider ─── */}
        <motion.div
          className="mt-4 h-[2px] rounded-full"
          style={{
            background:
              'linear-gradient(90deg, #004B63, #00A8CC, #D4A843, #FF6F61, transparent)',
          }}
          initial={{ scaleX: 0, originX: isRTL ? 'right' : 'left' }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' as const, delay: 0.3 }}
        />
      </div>

      {/* ─── Infinite Scroll Carousel ─── */}
      <div className="relative z-10">

        {isLoading ? (
          <FeaturedSkeleton />
        ) : isError ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Package className="size-12 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground">{t('common.error')}</p>
              <Button
                variant="outline"
                size="sm"
                className="border-nabdh-primary/30 text-nabdh-primary hover:bg-nabdh-primary/10"
              >
                {t('common.retry')}
              </Button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-3">
              <Package className="size-12 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground">{t('common.noData')}</p>
            </div>
          </div>
        ) : (
          <div
            className="featured-carousel-viewport"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div
              ref={scrollerRef}
              className="featured-carousel-scroller"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{ cursor: 'grab' }}
            >
              {/* Render products 3 times for seamless infinite loop */}
              {[0, 1, 2].map((setIndex) =>
                products.map((product) => (
                  <CarouselProductCard
                    key={`${product.id}-${setIndex}`}
                    product={product}
                    language={language}
                    t={t}
                    addItem={addItem}
                    addedProductId={addedProductId}
                    setAddedProductId={setAddedProductId}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── Mobile Controls ─── */}
        <div className="flex sm:hidden items-center justify-center gap-3 mt-4 px-4">
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-nabdh-primary/20 hover:bg-nabdh-primary/10 transition-all"
              onClick={() => scrollByCards(-1)}
              aria-label={isRTL ? 'Next' : 'Previous'}
            >
              <ChevronLeft className="size-5 text-nabdh-primary" />
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-nabdh-primary/20 hover:bg-nabdh-primary/10 transition-all"
              onClick={togglePause}
              aria-label={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? (
                <Play className="size-4 text-nabdh-primary" />
              ) : (
                <Pause className="size-4 text-nabdh-primary" />
              )}
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-nabdh-primary/20 hover:bg-nabdh-primary/10 transition-all"
              onClick={() => scrollByCards(1)}
              aria-label={isRTL ? 'Previous' : 'Next'}
            >
              <ChevronRight className="size-5 text-nabdh-primary" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
