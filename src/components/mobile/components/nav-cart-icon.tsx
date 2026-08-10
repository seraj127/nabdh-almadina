'use client';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { ShoppingCart } from 'lucide-react';

export function NavCartIcon({ active }: { active: boolean }) {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const [badgeAnimating, setBadgeAnimating] = useState(false);
  const prevCountRef = useRef(totalItems);

  useEffect(() => {
    const prevCount = prevCountRef.current;
    prevCountRef.current = totalItems;
    if (totalItems !== prevCount && totalItems > 0) {
      queueMicrotask(() => {
        setBadgeAnimating(true);
        setTimeout(() => setBadgeAnimating(false), 500);
      });
    }
  }, [totalItems]);

  return (
    <div className="relative" aria-hidden="true">
      <ShoppingCart size={22} strokeWidth={active ? 2.5 : 1.8} />
      {totalItems > 0 && (
        <>
          {badgeAnimating && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF6F61]/40 nav-ping" />
          )}
          <span
            className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#FF6F61] to-[#ff4757] text-white text-[9px] font-bold flex items-center justify-center shadow-sm shadow-[#FF6F61]/30 ${badgeAnimating ? 'badge-bounce' : ''}`}
          >
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        </>
      )}
    </div>
  );
}
