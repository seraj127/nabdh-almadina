import { create } from 'zustand';

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  /** Minimum order value required to apply this coupon */
  minOrder: number;
  /** Maximum discount cap (only for percentage type) */
  maxDiscount: number | null;
  /** Computed discount at time of validation — DO NOT use as source of truth for display.
   *  Use `calcCouponDiscount()` instead for dynamic recalculation. */
  discount: number;
}

interface CouponState {
  appliedCoupon: AppliedCoupon | null;

  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
}

export const useCouponStore = create<CouponState>()((set) => ({
  appliedCoupon: null,

  applyCoupon: (coupon: AppliedCoupon) => {
    set({ appliedCoupon: coupon });
    // Persist to localStorage for page transitions
    try {
      localStorage.setItem('nabdh-coupon', JSON.stringify(coupon));
    } catch { /* ignore */ }
  },

  removeCoupon: () => {
    set({ appliedCoupon: null });
    try {
      localStorage.removeItem('nabdh-coupon');
    } catch { /* ignore */ }
  },
}));

/**
 * Dynamically calculate coupon discount based on current subtotal.
 * This is the SOURCE OF TRUTH for discount display — always recalculate
 * from the coupon type/value and the current cart subtotal, rather than
 * using the stale `discount` stored at validation time.
 */
export function calcCouponDiscount(coupon: AppliedCoupon | null, subtotal: number): number {
  if (!coupon || subtotal <= 0) return 0;

  // Check minimum order requirement
  if (coupon.minOrder > 0 && subtotal < coupon.minOrder) return 0;

  let discount = 0;

  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    // Cap by maxDiscount if set
    if (coupon.maxDiscount !== null && coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else if (coupon.type === 'fixed') {
    // Fixed discount — cannot exceed subtotal
    discount = Math.min(coupon.value, subtotal);
  }

  // Round to 2 decimal places and ensure non-negative
  discount = Math.round(discount * 100) / 100;
  return Math.max(0, discount);
}

/**
 * Check whether an applied coupon is still valid for the given subtotal.
 * Returns an error message key (Arabic) if invalid, or null if valid.
 */
export function validateCouponForSubtotal(coupon: AppliedCoupon | null, subtotal: number): string | null {
  if (!coupon) return null;
  if (coupon.minOrder > 0 && subtotal < coupon.minOrder) {
    return `الحد الأدنى للطلب ${coupon.minOrder} د.ل`;
  }
  return null;
}

// Rehydrate coupon from localStorage on module load (for page refreshes)
try {
  const saved = localStorage.getItem('nabdh-coupon');
  if (saved) {
    const coupon = JSON.parse(saved) as AppliedCoupon;
    // Only rehydrate if coupon data is valid
    if (coupon && coupon.code && typeof coupon.value === 'number') {
      useCouponStore.setState({ appliedCoupon: coupon });
    }
  }
} catch { /* ignore */ }
