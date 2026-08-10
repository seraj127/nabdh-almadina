'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle({ size = 'default' }: { size?: 'default' | 'small' }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for hydration detection
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className={`rounded-full bg-muted/60 animate-pulse ${size === 'small' ? 'size-8' : 'size-9'}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const handleToggle = () => {
    setIsAnimating(true);
    // Cycle: light → dark → system → light
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
    setTimeout(() => setIsAnimating(false), 500);
  };

  const iconSize = size === 'small' ? 14 : 16;

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleToggle}
      className={`
        relative inline-flex items-center justify-center rounded-full
        transition-all duration-300
        ${size === 'small' ? 'size-8' : 'size-9'}
        ${isDark
          ? 'bg-nabdh-primary/15 hover:bg-nabdh-primary/25 text-nabdh-accent'
          : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500'
        }
      `}
      title={
        theme === 'light' ? (isDark ? 'System (Dark)' : 'Light Mode — Click for Dark')
        : theme === 'dark' ? 'Dark Mode — Click for System'
        : 'System Theme — Click for Light'
      }
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Moon size={iconSize} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Sun size={iconSize} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* System indicator dot */}
      {theme === 'system' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-nabdh-accent ring-2 ring-background"
        >
          <Monitor size={6} className="text-white absolute inset-0 m-auto" />
        </motion.div>
      )}

      {/* Pulse ring on toggle */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-current"
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      )}
    </motion.button>
  );
}
