'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * Listens for a custom `nabdh:theme-sync` event and applies the theme
 * via next-themes. This bridges server-side theme persistence with
 * next-themes' React-managed state.
 */
export function ThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const handler = (e: Event) => {
      const theme = (e as CustomEvent).detail?.theme;
      if (theme === 'light' || theme === 'dark' || theme === 'system') {
        setTheme(theme);
      }
    };
    window.addEventListener('nabdh:theme-sync', handler);
    return () => window.removeEventListener('nabdh:theme-sync', handler);
  }, [setTheme]);

  return null;
}
