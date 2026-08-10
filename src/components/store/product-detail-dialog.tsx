'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingCart, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cart-store';
import { useLanguageStore } from '@/stores/language-store';
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

interface ProductDetailDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailDialogProps) {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const description =
    language === 'ar' ? product.descriptionAr : product.descriptionEn;
  const currency = t('product.currency');
  const categoryName =
    language === 'ar' ? product.category.nameAr : product.category.nameEn;
  const gradient = categoryGradients[product.category.slug] || defaultGradient;
  const inStock = product.stock > 0;

  const parsedBadges = parseBadges(product.badges);

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: product.mainImage || '',
      stock: product.stock,
      quantity,
    });
    setQuantity(1);
    onOpenChange(false);
  };

  const incrementQty = () => {
    if (quantity < product.stock) setQuantity((q) => q + 1);
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const renderStars = (rating: number) => sharedRenderStars(rating, 'size-5');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar p-0">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 relative">
            <div
              className={cn(
                'w-full aspect-square bg-gradient-to-br flex items-center justify-center md:rounded-s-lg',
                gradient
              )}
            >
              <Package className="size-20 text-white/60" />
            </div>

            {/* Badges overlay */}
            {parsedBadges.length > 0 && (
              <div className="absolute top-3 start-3 flex flex-col gap-1.5">
                {parsedBadges.map((badge) => (
                  <Badge
                    key={badge}
                    className={cn(
                      'text-xs px-2 py-1 border backdrop-blur-sm',
                      getBadgeStyle(badge)
                    )}
                  >
                    {getBadgeLabel(badge, t)}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="md:w-1/2 p-6 flex flex-col gap-4">
            <DialogHeader className="p-0 text-start">
              {/* Category Badge */}
              <Badge variant="outline" className="w-fit text-xs">
                {categoryName}
              </Badge>

              <DialogTitle className="text-xl leading-tight mt-1">
                {name}
              </DialogTitle>

              <DialogDescription className="sr-only">
                {name} - {description}
              </DialogDescription>
            </DialogHeader>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(product.rating)}</div>
              <span className="text-sm text-muted-foreground">
                {fmt(product.rating, 1)} ({product.reviewCount} {t('product.reviews')})
              </span>
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                {description}
              </p>
            )}

            <Separator />

            {/* Price Section */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-nabdh-price">
                  {fmt(product.price)} {currency}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-base text-muted-foreground line-through">
                    {fmt(product.comparePrice)} {currency}
                  </span>
                )}
              </div>
              {product.comparePrice && product.comparePrice > product.price && (
                <p className="text-xs text-[#FF6F61] font-medium">
                  {t('offers.discount')}{' '}
                  {Math.round(
                    ((product.comparePrice - product.price) / product.comparePrice) * 100
                  )}
                  %
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-sm font-medium',
                  inStock ? 'text-emerald-600' : 'text-red-500'
                )}
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    inStock ? 'bg-emerald-500' : 'bg-red-500'
                  )}
                />
                {inStock ? t('product.inStock') : t('product.outOfStock')}
              </span>
              {inStock && (
                <span className="text-xs text-muted-foreground">
                  ({product.stock} {language === 'ar' ? 'متاح' : 'available'})
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {inStock && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{t('cart.quantity')}:</span>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none"
                    onClick={decrementQty}
                    disabled={quantity <= 1}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-10 text-center text-sm font-semibold">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none"
                    onClick={incrementQty}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className={cn(
                'w-full nabdh-gradient text-white hover:opacity-90 transition-opacity mt-auto',
                !inStock && 'opacity-50 cursor-not-allowed'
              )}
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <ShoppingCart className="size-5" />
              {inStock ? t('product.addToCart') : t('product.outOfStock')}
            </Button>

            {/* SKU */}
            <p className="text-[10px] text-muted-foreground text-center">
              SKU: {product.sku}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
