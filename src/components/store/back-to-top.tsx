'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { cn } from '@/lib/utils';

/**
 * BackToTop — Premium floating button with:
 * - Circular SVG progress ring showing scroll progress
 * - Tooltip with translation support
 * - Theme-aware glass morphism design
 * - Smooth spring animations (show/hide)
 * - Reduced motion support
 * - Accessible keyboard interaction
 * - Smart auto-hide behavior
 */

// SVG circle constants for progress ring
const RING_SIZE = 48;      // button size
const RING_RADIUS = 20;    // radius of the progress circle
const RING_STROKE = 2.5;   // stroke width
const RING_CENTER = RING_SIZE / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Visibility threshold — show after scrolling this many pixels
const SCROLL_THRESHOLD = 400;

export function BackToTop() {
  const { t, direction } = useLanguageStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

    setIsVisible(scrollY > SCROLL_THRESHOLD);
    setScrollProgress(progress);
  }, []);

  useEffect(() => {
    // Initial check — use requestAnimationFrame to avoid synchronous setState in effect
    requestAnimationFrame(() => {
      handleScroll();
    });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SVG stroke-dashoffset: full circumference = 0%, 0 = 100%
  const strokeDashoffset = RING_CIRCUMFERENCE - (scrollProgress * RING_CIRCUMFERENCE);

  // Tooltip position: start-ward of button (left in LTR, right in RTL)
  const isRTL = direction === 'rtl';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-40 bottom-24 end-6"
          initial={{ opacity: 0, scale: 0.4, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.4, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 8 : -8, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: isRTL ? 8 : -8, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 whitespace-nowrap',
                  'px-3 py-1.5 rounded-lg text-xs font-medium',
                  'bg-popover text-popover-foreground shadow-lg border',
                  isRTL ? 'right-full me-3' : 'left-full ms-3'
                )}
              >
                {t('floating.backToTop')}
                {/* Tooltip arrow */}
                <div
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-popover border',
                    isRTL
                      ? '-right-1 border-l-0 border-t-0'
                      : '-left-1 border-r-0 border-b-0'
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.button
            onClick={scrollToTop}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              'relative size-12 rounded-full flex items-center justify-center',
              'shadow-lg transition-shadow duration-300',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nabdh-primary focus-visible:ring-offset-2',
              'glass-card-fab',
              isPressed && 'shadow-md'
            )}
            aria-label={t('floating.backToTop')}
            title={t('floating.backToTop')}
          >
            {/* SVG Progress Ring */}
            <svg
              className="absolute inset-0 -rotate-90"
              width={RING_SIZE}
              height={RING_SIZE}
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            >
              {/* Background track */}
              <circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={RING_STROKE}
                className="text-foreground/10"
              />
              {/* Progress arc */}
              <circle
                cx={RING_CENTER}
                cy={RING_CENTER}
                r={RING_RADIUS}
                fill="none"
                stroke="url(#backToTopGradient)"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-150 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="backToTopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#004B63" />
                  <stop offset="100%" stopColor="#00A8CC" />
                </linearGradient>
              </defs>
            </svg>

            {/* Icon */}
            <ArrowUp
              className="size-5 relative z-10 transition-transform duration-200"
              style={{
                color: 'var(--color-nabdh-primary)',
                transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
              }}
            />

            {/* Scroll percentage label — only on hover */}
            <AnimatePresence>
              {isHovered && scrollProgress > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute -bottom-5 text-[9px] font-bold tabular-nums"
                  style={{ color: 'var(--color-nabdh-primary)' }}
                >
                  {Math.round(scrollProgress * 100)}%
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
