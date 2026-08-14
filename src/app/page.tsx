'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, Component, ReactNode } from 'react';
import { useUIStore, registerCartStore, registerFavoritesStore, registerCouponStore, setupAuthWatchdog } from '@/stores/ui-store';
import { useCartStore, setupCartSyncListeners } from '@/stores/cart-store';
import { useFavoritesStore, setupFavoritesSyncListeners } from '@/stores/favorites-store';
import { useCouponStore } from '@/stores/coupon-store';
import { useLanguageStore } from '@/stores/language-store';
import dynamic from 'next/dynamic';

// ─── Register sibling stores with ui-store (avoids circular imports) ────
registerCartStore(useCartStore);
registerFavoritesStore(useFavoritesStore);
registerCouponStore(useCouponStore);

// ─── Store View — DIRECT import for instant page load ────
// Previously used dynamic() with ssr: false which caused a 30-60 second
// loading skeleton delay. Since all browser APIs are properly guarded
// (useEffect, event handlers), direct import is safe and loads instantly.
import StoreView from '@/components/store/store-view';

// ─── Mobile app — lazy loaded (not needed for web store, saves bundle size) ──
const MobileApp = dynamic(() => import('@/components/mobile/mobile-app').then(m => ({ default: m.MobileApp })), { ssr: false });

// ─── APK Download page — lazy loaded ──
const ApkDownloadPage = dynamic(() => import('@/components/apk-download-page').then(m => ({ default: m.ApkDownloadPage })), { ssr: false });
const ProjectDownloadPage = dynamic(() => import('@/components/project-download-page').then(m => ({ default: m.ProjectDownloadPage })), { ssr: false });
const SupabaseSetupPage = dynamic(() => import('@/components/supabase-setup-page').then(m => ({ default: m.SupabaseSetupPage })), { ssr: false });

// ─── Admin — lazy loaded (rarely used, very heavy) ──
const CommandCenter = dynamic(() => import('@/components/admin/command-center').then(mod => ({ default: mod.CommandCenter })), {
  ssr: false,
});

type AppView = 'store' | 'mobile' | 'admin' | 'download' | 'project-download' | 'supabase';

// ─── Error Boundary to catch and display client-side errors ────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#f87171', fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: '#1e1e2e', minHeight: '100vh', direction: 'rtl' }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>⚠️ خطأ في التطبيق</h2>
          <p style={{ color: '#fbbf24', marginBottom: 8 }}>{this.state.error.message}</p>
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', color: '#94a3b8' }}>تفاصيل الخطأ</summary>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{this.state.error.stack}</p>
          </details>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: '8px 16px', background: '#004B63', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const isAdminMode = useUIStore((s) => s.isAdminMode);
  const language = useLanguageStore((s) => s.language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  // Detect native app inside component (not module-level) to avoid hydration mismatch
  const [isNativeApp] = useState(() =>
    typeof window !== 'undefined' &&
    (window as unknown as Record<string, unknown>).Capacitor !== undefined
  );

  const [appView, setAppView] = useState<AppView>('store');
  const [previousView, setPreviousView] = useState<AppView>('mobile');

  // ── Rehydrate stores once on mount — use requestAnimationFrame for fastest possible load
  // without blocking the initial React render cycle.
  useEffect(() => {
    // Cart, favorites, and language rehydrate synchronously from localStorage (instant)
    useCartStore.getState().rehydrate();
    useFavoritesStore.getState().rehydrate();
    useLanguageStore.getState().rehydrate();
    // Cross-tab + window-focus cart sync (pull from server when returning to the window)
    setupCartSyncListeners();
    // Cross-tab + window-focus favorites sync
    setupFavoritesSyncListeners();
    // Session watchdog: auto-logout if the session was revoked on another device
    setupAuthWatchdog();
    // UI store rehydrate triggers async API calls (auth profile) — defer slightly
    requestAnimationFrame(() => {
      useUIStore.getState().rehydrate();
    });
  }, []);

  // Check URL hash for initial view & listen for hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#mobile') setAppView('mobile');
      else if (hash === '#admin') setAppView('admin');
      else if (hash === '#download') setAppView('download');
      else if (hash === '#source') setAppView('project-download');
      else if (hash === '#supabase') setAppView('supabase');
      else if (isNativeApp) setAppView('mobile');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isNativeApp]);

  // Sync admin mode — adjust state during render when isAdminMode changes
  const [prevIsAdminMode, setPrevIsAdminMode] = useState(isAdminMode);
  if (isAdminMode !== prevIsAdminMode) {
    setPrevIsAdminMode(isAdminMode);
    if (isAdminMode && appView !== 'admin') {
      setPreviousView(appView);
      setAppView('admin');
    }
    if (!isAdminMode && appView === 'admin') {
      setAppView(previousView === 'admin' ? 'mobile' : previousView);
    }
  }

  // APK Download page view
  if (appView === 'download') {
    return <ApkDownloadPage onBack={() => { window.location.hash = ''; setAppView('mobile'); }} />;
  }

  // Project source code download page
  if (appView === 'project-download') {
    return <ProjectDownloadPage onBack={() => { window.location.hash = ''; setAppView('store'); }} />;
  }

  // Mobile app view
  if (appView === 'mobile') {
    return (
      <div dir={direction} style={{ background: '#0B1120', minHeight: '100vh' }}>
        <MobileApp />
      </div>
    );
  }

  // Admin dashboard view — lazy loaded
  if (appView === 'admin') {
    if (isNativeApp) {
      return (
        <div dir={direction} className="min-h-screen flex items-center justify-center p-8" style={{ background: '#0D1117' }}>
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#004B63' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {language === 'ar'
                ? 'لوحة التحكم تتطلب اتصال بخادم خارجي. يرجى الوصول إليها من متصفح الويب على جهاز الكمبيوتر.'
                : 'The admin dashboard requires a server connection. Please access it from a web browser on your computer.'}
            </p>
            <button
              onClick={() => setAppView('mobile')}
              className="px-6 py-3 rounded-xl text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
            >
              {language === 'ar' ? 'العودة للتطبيق' : 'Back to App'}
            </button>
          </div>
        </div>
      );
    }
    return <CommandCenter />;
  }

  // Supabase setup page
  if (appView === 'supabase') {
    return <SupabaseSetupPage />;
  }

  // Store view — DIRECT import, renders instantly!
  return <StoreView />;
}

export default function Home() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
