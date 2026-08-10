'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Check, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart-store';
import { useFavoritesStore } from '@/stores/favorites-store';
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
  renderStars,
  parseBadges,
  fmt,
} from './lib/shared';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFav = useFavoritesStore((s) => s.favoriteIds.includes(product.id));
  const openProductDetail = useUIStore((s) => s.openProductDetail);
  const [justAdded, setJustAdded] = useState(false);

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const currency = t('product.currency');
  const gradient = categoryGradients[product.category.slug] || defaultGradient;

  const parsedBadges = parseBadges(product.badges);

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
    // Animated feedback
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' as const }}
      className="glass-card-enhanced rounded-xl overflow-hidden cursor-pointer group hover-glow"
      onClick={() => openProductDetail(product.id)}
    >
      {/* Image / Placeholder Area */}
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
            <div
              className="absolute inset-0 items-center justify-center hidden"
            >
              <span className="text-4xl font-bold text-white/80 select-none">
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
            <Package className="size-12 text-white/40" />
          </div>
        )}

        {/* Badge Overlay with animation */}
        {parsedBadges.length > 0 && (
          <div className="absolute top-2 start-2 flex flex-col gap-1">
            {parsedBadges.map((badge) => (
              <Badge
                key={badge}
                className={cn('text-[10px] px-1.5 py-0 border backdrop-blur-sm animate-badge-pulse', getBadgeStyle(badge))}
              >
                {getBadgeLabel(badge, t)}
              </Badge>
            ))}
          </div>
        )}

        {/* Stock Indicator — Theme-Aware */}
        <div className="absolute bottom-2 start-2">
          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm border transition-all duration-300',
              inStock
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30'
            )}
          >
            {inStock ? t('product.inStock') : t('product.outOfStock')}
          </span>
        </div>

        {/* Quick Actions overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none">
          <div className="bg-gradient-to-t from-black/50 to-transparent p-3 pt-8 flex items-center justify-center gap-2">
            {/* Preview Button */}
            <Button
              size="sm"
              className="flex-1 bg-white/90 text-nabdh-primary hover:bg-white hover:scale-105 transition-all pointer-events-auto shadow-md backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                openProductDetail(product.id);
              }}
            >
              <Eye className="size-4 me-1" />
              {language === 'ar' ? 'معاينة' : 'Preview'}
            </Button>
            {/* Favorites Button */}
            <Button
              size="sm"
              className={cn(
                "bg-white/90 hover:bg-white hover:scale-105 transition-all pointer-events-auto shadow-md backdrop-blur-sm px-3",
                isFav ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
            >
              <Heart className={cn("size-4", isFav && "fill-current")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Category Tag */}
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          {language === 'ar' ? product.category.nameAr : product.category.nameEn}
        </p>

        {/* Product Name */}
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

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-base text-nabdh-price">
            {fmt(product.price)} {currency}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {fmt(product.comparePrice)} {currency}
            </span>
          )}
        </div>

        {/* Add to Cart Button with animated feedback */}
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
