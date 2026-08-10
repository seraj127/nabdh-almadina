import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Safe Number Formatting — prevents .toFixed() errors on non-number values
// ============================================================================
export function safeNum(value: unknown): number {
  if (typeof value === 'number') return value;
  const n = parseFloat(String(value));
  return isNaN(n) ? 0 : n;
}

export function fmt(value: unknown, decimals = 2): string {
  return safeNum(value).toFixed(decimals);
}

// ============================================================================
// Product Interface — Single Source of Truth
// ============================================================================
export interface Product {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  sku: string;
  price: number;
  comparePrice: number | null;
  mainImage: string | null;
  images: string;
  stock: number;
  badges: string | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  category: { id: string; nameAr: string; nameEn: string; slug: string };
}

// ============================================================================
// Category Gradients — Single Source of Truth
// ============================================================================
export const categoryGradients: Record<string, string> = {
  cookware: 'from-amber-400 to-orange-500',
  'kitchen-tools': 'from-teal-400 to-cyan-500',
  'serving-ware': 'from-rose-400 to-pink-500',
  'cups-pitchers': 'from-violet-400 to-purple-500',
  'preparation-tools': 'from-emerald-400 to-green-500',
  'food-storage': 'from-sky-400 to-blue-500',
  'fashion-men': 'from-slate-400 to-gray-600',
  'fashion-women': 'from-pink-400 to-rose-500',
  'fashion-kids': 'from-yellow-400 to-amber-500',
  'footwear-men': 'from-stone-400 to-stone-600',
  'footwear-women': 'from-fuchsia-400 to-pink-500',
  'footwear-kids': 'from-lime-400 to-green-500',
  'perfumes-oud': 'from-amber-600 to-yellow-700',
  accessories: 'from-gray-400 to-slate-500',
  'mother-baby': 'from-pink-300 to-rose-400',
  'home-care': 'from-cyan-400 to-teal-500',
  'electrical-appliances': 'from-blue-400 to-indigo-500',
  electronics: 'from-indigo-400 to-violet-500',
  'children-toys': 'from-orange-400 to-red-500',
  'pet-supplies': 'from-lime-400 to-emerald-500',
  'ornamental-plants': 'from-green-400 to-emerald-600',
  'gifts-antiques': 'from-yellow-500 to-amber-600',
  'wall-art': 'from-purple-400 to-indigo-600',
};

export const defaultGradient = 'from-nabdh-primary to-nabdh-accent';

// ============================================================================
// Badge Helpers — Single Source of Truth
// ============================================================================
export function getBadgeStyle(badge: string) {
  switch (badge) {
    case 'new':
      return 'bg-emerald-500/90 text-white border-emerald-400/50';
    case 'sale':
      return 'bg-[#FF6F61]/90 text-white border-[#FF6F61]/50';
    case 'bestseller':
      return 'bg-[#D4A843]/90 text-white border-[#D4A843]/50';
    default:
      return 'bg-primary/90 text-primary-foreground border-primary/50';
  }
}

export function getBadgeLabel(badge: string, t: (key: string) => string) {
  switch (badge) {
    case 'new':
      return t('product.new');
    case 'sale':
      return t('product.sale');
    case 'bestseller':
      return t('product.bestSeller');
    default:
      return badge;
  }
}

// ============================================================================
// Star Rating Renderer — Single Source of Truth
// ============================================================================
export function renderStars(rating: number, size: string = 'size-3.5') {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={cn(
        size,
        i < Math.floor(rating)
          ? 'fill-[#D4A843] text-[#D4A843]'
          : i < rating
            ? 'fill-[#D4A843]/50 text-[#D4A843]'
            : 'text-muted-foreground/30'
      )}
    />
  ));
}

// ============================================================================
// Badge Parser Utility
// ============================================================================
export function parseBadges(badges: string | null): string[] {
  if (!badges) return [];
  try {
    return JSON.parse(badges) as string[];
  } catch {
    return [];
  }
}
