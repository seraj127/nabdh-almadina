import { create } from 'zustand';
import { translations } from '@/lib/i18n/translations';

// Re-export the Language type for backwards compatibility
export type { Language } from '@/lib/i18n/translations';
export type Direction = 'rtl' | 'ltr';

// Timestamp of the last local (user-initiated) language change — used to
// guard against a concurrent profile fetch reverting it before the server echo.
let _lastLocalLanguageChangeAt = 0;



interface LanguageState {
  language: Language;
  direction: Direction;

  // Actions
  setLanguage: (lang: Language) => void;
  applyServerLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  rehydrate: () => void;
}

export const useLanguageStore = create<LanguageState>()((set, get) => ({
      language: 'ar',
      direction: 'rtl',

      setLanguage: (lang: Language) => {
        const direction: Direction = lang === 'ar' ? 'rtl' : 'ltr';

        // Update document attributes for RTL/LTR support
        if (typeof document !== 'undefined') {
          document.documentElement.dir = direction;
          document.documentElement.lang = lang;
        }

        set({ language: lang, direction });
        // Save to localStorage
        try { localStorage.setItem('nabdh-language-storage', JSON.stringify({ language: lang, direction })); } catch { /* ignore */ }
        // Remember when the user changed it locally so a concurrent profile
        // fetch doesn't briefly revert the change before the server echoes it
        _lastLocalLanguageChangeAt = Date.now();

        // Sync language to the server so it follows the user across devices
        import('@/stores/ui-store').then(({ useUIStore }) => {
          const cu = useUIStore.getState().currentUser;
          if (cu?.id && !cu.id.startsWith('local-') && !cu.id.startsWith('offline-')) {
            fetch('/api/auth/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ language: lang }),
            }).catch(() => { /* offline — local only */ });
          }
        }).catch(() => { /* ignore */ });
      },

      // Apply a language received from the server (no echo to the server).
      // Called by profile fetches so a change made on another device is reflected here.
      applyServerLanguage: (lang: Language) => {
        if (lang !== 'ar' && lang !== 'en') return;
        if (get().language === lang) return;
        // Skip if the user changed the language locally just now (echo race)
        if (Date.now() - _lastLocalLanguageChangeAt < 2000) return;
        const direction: Direction = lang === 'ar' ? 'rtl' : 'ltr';
        set({ language: lang, direction });
        try { localStorage.setItem('nabdh-language-storage', JSON.stringify({ language: lang, direction })); } catch { /* ignore */ }
        if (typeof document !== 'undefined') {
          document.documentElement.dir = direction;
          document.documentElement.lang = lang;
        }
      },

      t: (key: string, params?: Record<string, string | number>): string => {
        const { language } = get();
        const entry = translations[key];
        if (!entry) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[i18n] Missing translation key: "${key}"`);
          }
          return key;
        }
        let text = entry[language] || entry['ar'] || key;
        if (params) {
          Object.entries(params).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, String(v));
          });
        }
        return text;
      },

  // Manual rehydration — call once on mount
  rehydrate: () => {
    try {
      const raw = localStorage.getItem('nabdh-language-storage');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.language && saved.direction) {
          set({ language: saved.language, direction: saved.direction });
          if (typeof document !== 'undefined') {
            document.documentElement.dir = saved.direction;
            document.documentElement.lang = saved.language;
          }
        }
      }
    } catch { /* ignore */ }
  },
}));
