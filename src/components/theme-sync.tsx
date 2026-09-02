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

  // On mount, pull the persisted theme from the server so the website matches
  // whatever theme the user last chose on mobile (or on the site while logged in).
  useEffect(() => {
    let cancelled = false;
    const apply = (t: string | null) => {
      if (!cancelled && (t === 'dark' || t === 'light')) setTheme(t);
    };
    import('@/lib/theme-sync').then(({ fetchThemeFromServer }) => {
      fetchThemeFromServer().then((serverTheme) => apply(serverTheme)).catch(() => {});
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [setTheme]);

  return null;
}
