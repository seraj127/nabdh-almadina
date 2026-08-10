'use client';

import React from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// PROFESSIONAL BACK BUTTON
// RTL-aware, animated, consistent design across all screens
// ═══════════════════════════════════════════════════════════════════════

type BackButtonVariant = 'default' | 'gradient' | 'ghost';

interface BackButtonProps {
  /** Click handler for going back */
  onClick: () => void;
  /** Visual variant:
   *  - 'default': White circle with shadow (for light headers)
   *  - 'gradient': Semi-transparent white on gradient backgrounds
   *  - 'ghost': Transparent background, just icon
   */
  variant?: BackButtonVariant;
  /** Use arrow icon instead of chevron */
  arrow?: boolean;
  /** Custom className override */
  className?: string;
  /** Accessibility label */
  label?: string;
  /** Icon size */
  size?: number;
}

const variantStyles: Record<BackButtonVariant, string> = {
  default:
    'bg-white dark:bg-[#21262D] shadow-md border border-gray-100/80 dark:border-[#30363D] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#30363D]',
  gradient:
    'bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 border border-white/10',
  ghost:
    'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#21262D]',
};

export function BackButton({
  onClick,
  variant = 'default',
  arrow = false,
  className = '',
  label,
  size = 20,
}: BackButtonProps) {
  const { language } = useLanguageStore();
  const isRtl = language === 'ar';

  const BackIcon = isRtl
    ? arrow
      ? ArrowRight
      : ChevronRight
    : arrow
      ? ArrowLeft
      : ChevronLeft;

  return (
    <button
      onClick={onClick}
      className={`
        w-9 h-9 rounded-full flex items-center justify-center
        transition-all duration-200 active:scale-90
        ${variantStyles[variant]}
        ${className}
      `}
      aria-label={label || (isRtl ? 'رجوع' : 'Go back')}
    >
      <BackIcon size={size} strokeWidth={2} />
    </button>
  );
}
