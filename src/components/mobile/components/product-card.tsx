'use client';
import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { Heart, Plus, Check, Star, Zap, Award, AlertTriangle, Store } from 'lucide-react';
import { BADGE_CONFIG, type ProductBadge } from '../lib/design-tokens';
import type { Product } from '../lib/types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
  onAddToCart: () => void;
  showBadges?: boolean;
  compact?: boolean;
}

function getBadges(product: Product): ProductBadge[] {
  const badges: ProductBadge[] = [];
  if (product.comparePrice && product.comparePrice > product.price) {
    const discount = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
    if (discount >= 15) badges.push('sale');
  }
  if ((product.reviewCount || 0) >= 20 && (product.rating || 0) >= 4.3) badges.push('best_seller');
  if (product.stock !== undefined && product.stock > 0 && product.stock <= 5) badges.push('limited_stock');
  return badges.slice(0, 2);
}

const BADGE_ICONS: Record<ProductBadge, React.ReactNode> = {
  new_arrival: <Star size={9} />,
  best_seller: <Award size={9} />,
  sale: <Zap size={9} />,
  limited_stock: <AlertTriangle size={9} />,
  official_store: <Store size={9} />,
};

export const ProductCard = React.memo(function ProductCard({
  product, isFavorite, onToggleFavorite, onSelect, onAddToCart, showBadges = true, compact = false,
}: ProductCardProps) {
  const { t, language } = useLanguageStore();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const productImage = useMemo(() => {
    return product.mainImage || product.image || (Array.isArray(product.images) ? product.images[0] : typeof product.images === 'string' ? product.images.replace(/[\[\]"]/g, '').split(',')[0] : undefined);
  }, [product.mainImage, product.image, product.images]);

  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const badges = showBadges ? getBadges(product) : [];
  const name = language === 'ar' ? product.nameAr : product.nameEn;

  return (
    <div
      onClick={onSelect}
      className="premium-card rounded-2xl overflow-hidden cursor-pointer group"
      role="article"
      aria-label={name}
    >
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-gray-50 to-[#EDF1F5] dark:from-[#1A2540] dark:to-[#151D2E] overflow-hidden">
        {productImage && !imgError ? (
          <img
            src={productImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-40">📦</div>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/5 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/95 dark:bg-[#151D2E]/95 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all hover:scale-110 active:scale-95"
          aria-label={isFavorite ? t('mobile.favorites.remove') : t('mobile.favorites.addFavoritesHint')}
        >
          <Heart size={15} className={`transition-all ${isFavorite ? 'fill-[#FF6F61] text-[#FF6F61] scale-110' : 'text-gray-400'}`} />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-gradient-to-l from-[#FF6F61] to-[#ff4757] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm shadow-[#FF6F61]/30">
            -{discount}%
          </span>
        )}

        {/* Product Badges Row */}
        {badges.length > 0 && (
          <div className="absolute bottom-1.5 right-1.5 flex gap-1">
            {badges.map((badge) => {
              const config = BADGE_CONFIG[badge];
              return (
                <span
                  key={badge}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold backdrop-blur-sm"
                  style={{ color: config.color, backgroundColor: config.bg }}
                >
                  {BADGE_ICONS[badge]}
                  {language === 'ar' ? config.labelAr : config.labelEn}
                </span>
              );
            })}
          </div>
        )}

        {/* Rating */}
        {product.rating && product.rating >= 4 && (
          <div className="absolute bottom-1.5 left-1.5 bg-white/95 dark:bg-[#151D2E]/95 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-0.5 shadow-sm">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[9px] font-bold text-[#0F172A] dark:text-[#A8B8CC]">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-xs font-semibold text-[#0F172A] dark:text-gray-100 line-clamp-2 leading-relaxed min-h-[2.5em]">{name}</h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-base font-extrabold text-[#4ADE80] tracking-tight" style={{ textShadow: '0 0 12px rgba(74,222,128,0.3)' }}>{product.price}</span>
          <span className="text-[10px] font-bold text-[#4ADE80]/70">{t('product.currency')}</span>
          {product.comparePrice && (
            <span className="text-[10px] text-[#6B7F96] line-through ml-0.5">{product.comparePrice}</span>
          )}
        </div>
        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full mt-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 ${
            added
              ? 'bg-[#238636]/10 text-[#238636] dark:bg-[#238636]/20 dark:text-[#3fb950]'
              : 'bg-gradient-to-l from-[#004B63] to-[#006B8A] text-white hover:shadow-md'
          }`}
          aria-label={added ? t('mobile.product.added') : t('mobile.product.addToCart')}
        >
          {added ? <><Check size={12} /> {t('mobile.product.added')}</> : <><Plus size={12} /> {t('mobile.product.addToCart')}</>}
        </button>
      </div>
    </div>
  );
});
