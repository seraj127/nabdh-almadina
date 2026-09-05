'use client';

import { patchFetchForNative } from '@/lib/api-bridge';
import { fetchPreferencesFromServer } from '@/lib/profile-sync';
patchFetchForNative();

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useMobileStore, initMobileStore } from './lib/mobile-store';
import { normalizeProduct } from './lib/helpers';
import { LOCAL_PRODUCTS, LOCAL_OFFERS, APP_VERSION } from './lib/constants';
import { BADGE_CONFIG, type ProductBadge } from './lib/design-tokens';
import { OfflineBanner, NetworkStatus } from './components/offline-banner';
import { Nav3DHomeIcon, Nav3DCategoriesIcon, Nav3DCartIcon, Nav3DHeartIcon, Nav3DUserIcon } from './components/nav-3d-icons';
import { HomeScreenSkeleton } from './components/skeleton-loader';
import { MobileChatWidget } from './components/chat-widget';
import { ProductCard } from './components/product-card';
import AdvancedSearch from './components/advanced-search';
import type { Product, Category, MobileUser, Tab, Offer } from './lib/types';
import { ProfileTab } from './screens/profile-tab';
import { CartTab } from './screens/cart-tab';
import { FavoritesTab } from './screens/favorites-screen';
import { HomeTab } from './screens/home-tab';
import { CategoriesTab } from './screens/categories-tab';
import { ProductDetailScreen } from './screens/product-detail-screen';
import { ChatScreen } from './screens/chat-screen';
import { ContactScreen } from './screens/contact-screen';
import { NotificationsScreen } from './screens/notifications-screen';
import { SearchScreen } from './screens/search-screen';
import { DeliveryZonesScreen } from './screens/delivery-zones-screen';
import { TermsScreen } from './screens/terms-screen';
import { ReturnPolicyScreen } from './screens/return-policy-screen';
import { PrivacyPolicyScreen } from './screens/privacy-policy-screen';
import { OrderTrackingScreen } from './screens/order-tracking';
import { WebViewScreen } from './screens/webview-screen';
import { useRealtimeSync } from '@/hooks/use-realtime-sync';
import { toast } from 'sonner';

import {
  Home, Grid3X3, Heart, User, Search, Plus, Minus, Trash2,
  X, Check, ShieldCheck, Package,
  MapPin, ChevronLeft, ChevronRight, RefreshCw, Globe,
  Phone, Lock, Eye, EyeOff, Settings,
  ArrowRight, ArrowLeft, KeyRound, Mail, Zap, Flame, Timer, Loader2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// MAIN MOBILE APP COMPONENT — OPTIMIZED FOR INSTANT SPLASH
// ═══════════════════════════════════════════════════════════════════════
export function MobileApp() {
  const { language } = useLanguageStore();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const screen = useMobileStore((s) => s.screen);
  const darkMode = useMobileStore((s) => s.darkMode);
  const setScreen = useMobileStore((s) => s.setScreen);
  const selectedProduct = useMobileStore((s) => s.selectedProduct);
  const favorites = useMobileStore((s) => s.favorites);
  const toggleFavorite = useMobileStore((s) => s.toggleFavorite);
  const storeInitialized = useRef(false);

  // Initialize store immediately on mount
  useEffect(() => {
    if (!storeInitialized.current) {
      storeInitialized.current = true;
      initMobileStore();
    }
  }, []);

  // Search debounce
  const searchQuery = useMobileStore((s) => s.searchQuery);
  const setSearchQuery = useMobileStore((s) => s.setSearchQuery);
  const fetchProducts = useMobileStore((s) => s.fetchProducts);
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts({ search: searchQuery || undefined, page: 1, append: false }), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchProducts]);

  // Sync darkMode with next-themes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode]);

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-[#0B1120]' : 'bg-gradient-to-br from-[#EDF1F5] to-[#E2E8EF]'}`} dir={direction}>
      <div
        className={`w-full max-w-[430px] h-screen sm:h-[860px] sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] ${darkMode ? 'sm:border-[#1E2A42]' : 'sm:border-gray-700'} sm:overflow-hidden ${darkMode ? 'bg-[#0B1120]' : 'bg-[#F4F7F9]'} relative flex flex-col sm:mt-4 ${darkMode ? 'dark' : ''}`}
        style={{ transform: 'translateZ(0)' }}
      >
        <div className={`hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-2xl z-50 ${darkMode ? 'bg-[#1E2A42]' : 'bg-gray-700'}`} />
        <div className="absolute inset-0 flex flex-col overflow-hidden">
          <div className="hidden sm:block h-7 flex-shrink-0" />

          {/* Offline Banner */}
          <OfflineBanner />

          {/* No initialized gate — splash screen renders INSTANTLY */}
          <div className="flex-1 min-h-0 relative">
            {screen === 'splash' && <SplashScreen />}

            {screen === 'login' && <LoginScreen />}
            {screen === 'register' && <RegisterScreen />}
            {screen === 'forgot-password' && <ForgotPasswordScreen />}
            {screen === 'main' && <MainScreen />}
            {/* Sub-screens accessible via setScreen() */}
            {screen === 'chat' && <ChatScreen />}
            {screen === 'contact' && <ContactScreen />}
            {screen === 'notifications' && <NotificationsScreen />}
            {screen === 'search' && <SearchScreen />}
            {screen === 'delivery-zones' && <DeliveryZonesScreen />}
            {screen === 'terms' && <TermsScreen />}
            {screen === 'return-policy' && <ReturnPolicyScreen />}
            {screen === 'privacy-policy' && <PrivacyPolicyScreen />}
            {screen === 'webview' && <WebViewScreen />}
            {screen === 'order-tracking' && (
              <OrderTrackingScreen
                orderNumber={useMobileStore.getState().trackingOrderNumber || ''}
                onClose={() => useMobileStore.getState().setScreen('main')}
              />
            )}
            {(screen === 'orderDetail' || screen === 'orderTracking') && (
              <OrderTrackingScreen
                orderNumber={useMobileStore.getState().trackingOrderNumber || (useMobileStore.getState().selectedOrder?.orderNumber ?? '')}
                onClose={() => useMobileStore.getState().setScreen('main')}
              />
            )}
            {/* Back button for sub-screens (excluded: those with their own back buttons) */}
            {screen !== 'splash' && screen !== 'login' && screen !== 'register' && screen !== 'forgot-password' && screen !== 'main' && screen !== 'notifications' && screen !== 'order-tracking' && screen !== 'orderDetail' && screen !== 'orderTracking' && screen !== 'webview' && (
              <button
                onClick={() => useMobileStore.getState().setScreen('main')}
                className="absolute top-2 start-2 z-50 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                aria-label="رجوع"
              >
                {direction === 'rtl' ? <ArrowRight size={18} className={darkMode ? 'text-[#A8B8CC]' : 'text-white'} /> : <ArrowLeft size={18} className={darkMode ? 'text-[#A8B8CC]' : 'text-white'} />}
              </button>
            )}
          </div>

          <AnimatePresence>
            {selectedProduct && (
              <ProductDetailScreen />
            )}
          </AnimatePresence>
        </div>

        {/* Portal root for mobile overlays - renders above scroll container */}
        <div id="mobile-overlay-root" className="absolute inset-0 z-[60] pointer-events-none overflow-hidden" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SPLASH SCREEN — CINEMATIC DARK + ORBITING GOLDEN DOT
// ═══════════════════════════════════════════════════════════════════════

function SplashScreen() {
  const { t, language, setLanguage } = useLanguageStore();
  const setScreen = useMobileStore((s) => s.setScreen);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const [loadProgress, setLoadProgress] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [textReveal, setTextReveal] = useState(0); // 0-100% reveal
  const fullText = t('mobile.splash.appName');
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [orbitAngle, setOrbitAngle] = useState(0);

  // Logo circle dimensions
  const logoCircleSize = 120; // px — the prominent circle containing the logo
  const logoCircleHalf = logoCircleSize / 2;

  // Orbit radius — clearly OUTSIDE the circle (circle radius=60, orbit=75)
  const orbitRadius = 75;
  const orbitMinorRatio = 1.0; // circular orbit (not elliptical)

  // Shooting stars — improved with longer trails
  const shootingStars = useMemo(() => [
    { id: 0, startX: 10, startY: 6, angle: 35, delay: 1.5, dur: 2.2 },
    { id: 1, startX: 75, startY: 4, angle: 42, delay: 5, dur: 1.8 },
    { id: 2, startX: 35, startY: 10, angle: 28, delay: 8, dur: 2.8 },
    { id: 3, startX: 55, startY: 3, angle: 38, delay: 11, dur: 2 },
    { id: 4, startX: 20, startY: 14, angle: 32, delay: 14, dur: 2.5 },
  ], []);

  // Background stars — X-pattern movement
  // Stars move along two diagonal lines forming an X shape
  // Using seeded PRNG to avoid hydration mismatch (Math.random() produces different values on server vs client)
  const xStars = useMemo(() => {
    // Simple deterministic seeded PRNG (mulberry32)
    let seed = 42;
    const seededRandom = () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };

    const stars: Array<{
      id: string;
      startX: number; startY: number;
      endX: number; endY: number;
      size: number;
      duration: number;
      delay: number;
      type: 'dot' | 'sparkle' | 'diamond';
      rotation: number;
    }> = [];
    const diagonal1 = Array.from({ length: 8 }).map((_, i) => {
      const t = i / 7;
      return { x: 10 + t * 80, y: 5 + t * 50 }; // top-left to bottom-right
    });
    const diagonal2 = Array.from({ length: 8 }).map((_, i) => {
      const t = i / 7;
      return { x: 90 - t * 80, y: 5 + t * 50 }; // top-right to bottom-left
    });
    [...diagonal1, ...diagonal2].forEach((pos, i) => {
      const isDiag1 = i < 8;
      const idx = i % 8;
      const t = idx / 7;
      const type = i % 3 === 0 ? 'dot' : i % 3 === 1 ? 'sparkle' : 'diamond';
      stars.push({
        id: `xstar-${i}`,
        startX: pos.x - 3,
        startY: pos.y - 3,
        endX: pos.x + 3,
        endY: pos.y + 3,
        size: type === 'dot' ? seededRandom() * 2 + 1 : type === 'sparkle' ? seededRandom() * 10 + 6 : seededRandom() * 6 + 4,
        duration: seededRandom() * 3 + 2,
        delay: seededRandom() * 4 + i * 0.2,
        type,
        rotation: isDiag1 ? 45 : -45,
      });
    });
    // Add moving stars that travel along the X paths
    for (let i = 0; i < 4; i++) {
      const isDiag1 = i < 2;
      stars.push({
        id: `xmove-${i}`,
        startX: isDiag1 ? 5 : 95,
        startY: 3 + i * 12,
        endX: isDiag1 ? 95 : 5,
        endY: 48 + i * 5,
        size: seededRandom() * 3 + 2,
        duration: seededRandom() * 4 + 5,
        delay: i * 2,
        type: 'sparkle',
        rotation: isDiag1 ? 45 : -45,
      });
    }
    return stars;
  }, []);

  // Orbiting golden dot — throttled animation (~30fps to save CPU/battery)
  useEffect(() => {
    let raf: number;
    let lastTime = 0;
    const animate = (timestamp: number) => {
      if (timestamp - lastTime >= 33) { // ~30fps instead of 60fps
        lastTime = timestamp;
        setOrbitAngle((prev) => (prev + 0.6) % 360);
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Loading progress — FAST: ~1.5s total
  useEffect(() => {
    const steps = [20, 45, 65, 80, 92, 100];
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setLoadProgress(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          // If a user is already logged in (persisted session), skip straight to the main screen
          const savedUser = useMobileStore.getState().user;
          if (savedUser && savedUser.id) {
            // Fetch theme AND language from the server together so a returning user
            // gets their preferences restored (language was previously never fetched
            // — users would see Arabic/English from localStorage instead of their
            // server-saved choice on a different device).
            fetchPreferencesFromServer().then((prefs) => {
              if (prefs?.theme === 'dark') { useMobileStore.getState().setDarkMode(true); localStorage.setItem('theme', 'dark'); }
              else if (prefs?.theme === 'light') { useMobileStore.getState().setDarkMode(false); localStorage.setItem('theme', 'light'); }
              if (prefs?.language) {
                useLanguageStore.getState().applyServerLanguage(prefs.language);
              }
              setScreen('main');
            }).catch(() => setScreen('main'));
          } else {
            setShowButtons(true);
          }
        }, 300);
      }
    }, 220);
    return () => clearInterval(interval);
  }, []);

  // Text reveal animation — smooth clip reveal (preserves Arabic letter connections)
  useEffect(() => {
    const timer = setTimeout(() => {
      const steps = 15;
      let step = 0;
      const animate = () => {
        step++;
        setTextReveal(Math.min((step / steps) * 100, 100));
        if (step < steps) {
          typingRef.current = setTimeout(animate, 80);
        }
      };
      animate();
    }, 800);
    return () => { clearTimeout(timer); if (typingRef.current) clearTimeout(typingRef.current); };
  }, [fullText]);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" dir={direction}
      style={{ background: 'linear-gradient(160deg, #060B14 0%, #0A1628 25%, #0D1B2A 50%, #112240 75%, #0A1628 100%)' }}>

      {/* ═══ Background: X-Pattern Stars ═══ */}
      {xStars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{
            left: `${s.startX}%`,
            top: `${s.startY}%`,
            width: s.size,
            height: s.size,
          }}
          animate={s.id.startsWith('xmove') ? {
            left: [`${s.startX}%`, `${s.endX}%`],
            top: [`${s.startY}%`, `${s.endY}%`],
            opacity: [0, 1, 1, 0],
          } : {
            opacity: [0.1, 0.9, 0.1],
            scale: [0.5, 1.3, 0.5],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut' as const,
            delay: s.delay,
            ...(s.id.startsWith('xmove') ? { repeatDelay: 3 } : {}),
          }}
        >
          {s.type === 'dot' && (
            <div
              className="w-full h-full rounded-full"
              style={{
                background: 'rgba(255,255,255,0.8)',
                boxShadow: '0 0 4px 1px rgba(255,111,97,0.3)',
              }}
            />
          )}
          {s.type === 'sparkle' && (
            <div className="w-full h-full flex items-center justify-center" style={{ rotate: `${s.rotation}deg` }}>
              {/* Horizontal ray */}
              <div style={{
                position: 'absolute', width: s.size * 1.5, height: 1.5,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
                borderRadius: 1,
              }} />
              {/* Vertical ray */}
              <div style={{
                position: 'absolute', width: 1.5, height: s.size * 1.5,
                background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.9), transparent)',
                borderRadius: 1,
              }} />
              {/* Center glow */}
              <div style={{
                width: 2, height: 2, borderRadius: '50%',
                background: 'white',
                boxShadow: '0 0 6px 2px rgba(255,111,97,0.4)',
              }} />
            </div>
          )}
          {s.type === 'diamond' && (
            <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
              <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z"
                fill="white" fillOpacity="0.7" />
            </svg>
          )}
        </motion.div>
      ))}

      {/* ═══ X-Shape Guide Lines (subtle) ═══ */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
        <line x1="10%" y1="5%" x2="90%" y2="55%" stroke="white" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="90%" y1="5%" x2="10%" y2="55%" stroke="white" strokeWidth="1" strokeDasharray="4 8" />
      </svg>

      {/* ═══ Shooting Stars ═══ */}
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{ left: `${star.startX}%`, top: `${star.startY}%` }}
          animate={{
            x: [0, 140, 300],
            y: [0, 50 + star.angle, 120 + star.angle],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: star.dur,
            repeat: Infinity,
            repeatDelay: 6,
            ease: 'easeOut' as const,
            delay: star.delay,
          }}
        >
          <div className="relative">
            {/* Head — bright core */}
            <div className="w-1.5 h-1.5 rounded-full bg-white"
              style={{ boxShadow: '0 0 6px 2px rgba(255,255,255,0.9), 0 0 12px 4px rgba(0,168,204,0.4)' }} />
            {/* Trail */}
            <div className="absolute top-1/2 -translate-y-1/2 h-px"
              style={{
                right: '100%', width: 50,
                background: 'linear-gradient(to left, rgba(255,255,255,0.8), rgba(0,168,204,0.3), transparent)',
              }} />
          </div>
        </motion.div>
      ))}

      {/* ═══ Nebula / Ambient Glow ═══ */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320, height: 320,
          left: '50%', top: '33%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0,168,204,0.07) 0%, rgba(0,75,99,0.03) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 180, height: 180,
          left: '15%', top: '50%',
          background: 'radial-gradient(circle, rgba(0,137,123,0.04) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* ═══ Main Content Area ═══ */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">

        {/* ═══ Logo Circle + Orbiting Golden Dot ═══ */}
        <motion.div
          className="relative"
          style={{ width: logoCircleSize, height: logoCircleSize }}
          initial={{ scale: 0.6, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 120, damping: 14, delay: 0.05 }}
        >
          {/* ─── Pulsing outer glow ring (around circle) ─── */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: '50%', top: '50%',
              width: logoCircleSize + 32, height: logoCircleSize + 32,
              marginLeft: -(logoCircleSize + 32) / 2,
              marginTop: -(logoCircleSize + 32) / 2,
              border: '1px solid rgba(0,168,204,0.12)',
              boxShadow: '0 0 25px rgba(0,168,204,0.06), inset 0 0 20px rgba(0,168,204,0.03)',
            }}
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.5, 1, 0.5],
              borderColor: ['rgba(0,168,204,0.12)', 'rgba(0,168,204,0.25)', 'rgba(0,168,204,0.12)'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          />

          {/* ─── Slowly rotating dashed ring ─── */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: '50%', top: '50%',
              width: logoCircleSize + 56, height: logoCircleSize + 56,
              marginLeft: -(logoCircleSize + 56) / 2,
              marginTop: -(logoCircleSize + 56) / 2,
              border: '1px dashed rgba(0,168,204,0.07)',
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' as const }}
          />

          {/* ─── Orbit path — dashed red-orange circle OUTSIDE the circle ─── */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: '50%', top: '50%',
              width: orbitRadius * 2, height: orbitRadius * 2,
              marginLeft: -orbitRadius,
              marginTop: -orbitRadius,
              border: '1.5px dashed rgba(255,111,97,0.15)',
            }}
          />

          {/* ─── Orbiting red-orange ball OUTSIDE the circle ─── */}
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: '50%', top: '50%',
              width: 16, height: 16,
              marginLeft: -8, marginTop: -8,
              transform: `translate(${Math.cos((orbitAngle * Math.PI) / 180) * orbitRadius}px, ${Math.sin((orbitAngle * Math.PI) / 180) * orbitRadius}px)`,
              zIndex: 20,
            }}
          >
            {/* Red-orange ball body */}
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #FF9A8B, #FF6F61, #E85D50)',
                boxShadow: '0 0 10px 2px rgba(255,111,97,0.6), 0 0 25px 5px rgba(255,111,97,0.25), 0 0 50px 10px rgba(255,111,97,0.1)',
              }}
            />
            {/* Ball outer glow / trail */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,111,97,0.25) 0%, transparent 70%)',
                transform: 'scale(3.5)',
                filter: 'blur(5px)',
              }}
            />
          </motion.div>

          {/* ─── Logo fills the circle entirely ─── */}
          <motion.div
            className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center"
            style={{
              border: '2.5px solid rgba(0,168,204,0.35)',
              boxShadow: '0 0 50px rgba(0,168,204,0.15), 0 0 100px rgba(0,168,204,0.06), 0 10px 40px rgba(0,0,0,0.4), inset 0 0 25px rgba(0,168,204,0.08)',
              background: '#FFFFFF',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: 'spring' as const, stiffness: 260, damping: 22 }}
          >
            <img
              src="/logo-circle.png?v=3"
              alt="نبض المدينة"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </motion.div>

          {/* ─── Continuous soft glow behind the circle ─── */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              left: '50%', top: '50%',
              width: logoCircleSize, height: logoCircleSize,
              marginLeft: -logoCircleHalf, marginTop: -logoCircleHalf,
              background: 'radial-gradient(circle, rgba(0,168,204,0.18) 0%, rgba(0,168,204,0.05) 50%, transparent 70%)',
              filter: 'blur(20px)',
            }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          />
        </motion.div>

        {/* ═══ App Name — Smooth Reveal with Gradient ═══ */}
        <motion.div
          className="min-h-[50px] flex items-center justify-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative overflow-hidden" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
            <h1
              className="text-3xl font-bold text-center whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #00A8CC 50%, #00897B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                clipPath: language === 'ar'
                  ? `inset(0 0 0 ${100 - textReveal}%)`
                  : `inset(0 ${100 - textReveal}% 0 0)`,
              }}
            >
              {fullText}
            </h1>
            {/* Blinking cursor */}
            <motion.span
              className="absolute text-[#00A8CC] text-3xl font-light"
              style={{
                [language === 'ar' ? 'left' : 'right']: `${100 - textReveal}%`,
                transform: language === 'ar' ? 'translateX(50%)' : 'translateX(-50%)',
                top: 0,
              }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            >
              |
            </motion.span>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-[#00A8CC]/70 text-center text-sm mt-3 tracking-wider font-medium"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.6 }}
        >
          {t('mobile.splash.appSubtitle')}
        </motion.p>
        <motion.p
          className="text-white/25 text-center text-xs mt-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 0.5 }}
        >
          {t('mobile.splash.tagline')}
        </motion.p>
      </div>

      {/* ═══ Gradient Progress Bar with Shimmer ═══ */}
      <motion.div
        className="px-8 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="w-full h-1.5 rounded-full overflow-hidden relative"
          style={{ background: 'rgba(0,168,204,0.1)' }}>
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${loadProgress}%`,
              background: 'linear-gradient(90deg, #004B63, #00A8CC, #00897B, #D4A843)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
            />
          </motion.div>
        </div>
        <div className="flex justify-between mt-1.5">
          <AnimatePresence>
            {loadProgress < 100 && (
              <motion.p
                className="text-[#00A8CC]/35 text-[10px]"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                {t('mobile.splash.loading')}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.p
            className="text-[#00A8CC]/25 text-[10px] ml-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          >
            {loadProgress}%
          </motion.p>
        </div>
      </motion.div>

      {/* ═══ Version Info ═══ */}
      <motion.div
        className="text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-white/20 text-[10px] tracking-widest">v{APP_VERSION} · {language === 'ar' ? 'ليبيا' : 'Libya'}</p>
      </motion.div>

      {/* ═══ Buttons — Appear After Loading ═══ */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            className="px-8 pb-6 space-y-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
          >
            {/* Start Now button */}
            <motion.button
              onClick={() => {
                setScreen('login');
              }}
              className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #00A8CC, #00897B)', color: '#fff' }}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0,168,204,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Button shimmer */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
              />
              <span className="relative z-10 flex items-center gap-3">
                {t('mobile.splash.startNow')}
                {language === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </span>
            </motion.button>

            {/* Language toggle */}
            <motion.button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="w-full py-3 rounded-2xl text-white/70 font-semibold text-sm border border-white/15 flex items-center justify-center gap-2 backdrop-blur-sm"
              style={{ background: 'rgba(0,168,204,0.08)' }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(0,168,204,0.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Globe size={16} />
              {t('mobile.splash.switchToEnglish')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════════════
function LoginScreen() {
  const { t, language } = useLanguageStore();
  const login = useMobileStore((s) => s.login);
  const loading = useMobileStore((s) => s.loading);
  const setScreen = useMobileStore((s) => s.setScreen);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };
  const shakeVariants = {
    shake: { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || !password) { setError(t('mobile.login.errorFields')); return; }
    const success = await login(phone, password);
    if (success) {
      setLoginSuccess(true);
      try {
        // Fetch BOTH theme and language from the server after login so the
        // app restores the user's saved preferences regardless of the device
        // or browser they last used (fixes the language-drop bug).
        const prefs = await fetchPreferencesFromServer();
        if (prefs?.theme === 'dark') { useMobileStore.getState().setDarkMode(true); localStorage.setItem('theme', 'dark'); }
        else if (prefs?.theme === 'light') { useMobileStore.getState().setDarkMode(false); localStorage.setItem('theme', 'light'); }
        if (prefs?.language) {
          useLanguageStore.getState().applyServerLanguage(prefs.language);
        }
      } catch { /* ignore */ }
    } else {
      setError(t('mobile.login.errorCredentials'));
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F4F7F9] dark:bg-[#0B1120]" dir={direction}>
      {/* ── Gradient Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-12 pb-16 px-6 relative overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}
      >
        {/* Back button with glassmorphism → splash */}
        <motion.button
          onClick={() => setScreen('splash')}
          className={`absolute top-4 ${direction === 'rtl' ? 'right-4' : 'left-4'} w-10 h-10 rounded-xl flex items-center justify-center z-10`}
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)' }}
          whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.9 }}
        >
          {direction === 'rtl' ? <ChevronRight size={20} className="text-white" /> : <ChevronLeft size={20} className="text-white" />}
        </motion.button>

        {/* Floating decorative orbs with radial gradients */}
        <div className="absolute top-2 -right-10 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-4 -left-8 w-28 h-28 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.14) 0%, transparent 70%)' }} />
        <div className="absolute top-1/4 right-14 w-16 h-16 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.1) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 -right-4 w-20 h-20 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,137,123,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-12 right-1/3 w-10 h-10 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />

        {/* Animated geometric shapes (rotating) */}
        <motion.div
          className="absolute -bottom-4 right-6 w-16 h-16 border border-white/10 rounded-lg"
          animate={{ rotate: [45, 135, 45] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <motion.div
          className="absolute top-20 left-12 w-10 h-10 border border-white/8 rounded-md"
          animate={{ rotate: [20, 110, 20] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }}
        />
        <motion.div
          className="absolute top-16 right-20 w-8 h-8 border border-[#00A8CC]/10 rounded-full"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }}
        />

        {/* Floating dots (up/down animation) */}
        <motion.div className="absolute top-16 left-8 w-2 h-2 rounded-full bg-[#00A8CC]/40" animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }} />
        <motion.div className="absolute top-24 right-16 w-1.5 h-1.5 rounded-full bg-white/30" animate={{ y: [0, -6, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }} />
        <motion.div className="absolute bottom-8 left-16 w-2.5 h-2.5 rounded-full bg-[#00A8CC]/25" animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }} />
        <motion.div className="absolute top-1/3 right-6 w-8 h-8 border border-[#00A8CC]/15 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }} />
        <motion.div className="absolute top-8 left-1/3 w-1 h-1 rounded-full bg-white/25" animate={{ y: [0, -12, 0], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.5 }} />

        {/* Logo in circle with glow ring animation */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-[80px] h-[80px] rounded-full overflow-hidden flex items-center justify-center mb-4 relative"
            style={{
              border: '3px solid rgba(0,168,204,0.45)',
              boxShadow: '0 6px 30px rgba(0,168,204,0.35), 0 3px 12px rgba(0,0,0,0.25), 0 0 50px rgba(0,168,204,0.15)',
            }}
          >
            {/* Logo glow ring animation */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: '0 0 25px rgba(0,168,204,0.4), inset 0 0 18px rgba(0,168,204,0.12)' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
            />
            <div className="w-full h-full rounded-full overflow-hidden relative z-10" style={{ background: '#FFFFFF' }}>
              <img src="/logo-circle.png?v=3" alt={language === 'ar' ? 'نبض المدينة' : 'Nabd Al-Madina'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </motion.div>

          {/* Title: مرحباً بعودتك (NO emoji) */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-white"
          >
            {t('mobile.login.welcomeBack')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-sm mt-1"
          >
            {t('mobile.login.signInToContinue')}
          </motion.p>
        </div>

        {/* Wave SVG at bottom of header */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 30" preserveAspectRatio="none" style={{ height: 20 }}>
          <path d="M0,20 C100,0 200,30 300,10 C350,0 380,15 400,10 L400,30 L0,30 Z" fill="rgba(244,247,249,1)" className="dark:fill-[#0B1120]" />
        </svg>
      </motion.div>

      {/* ── Success overlay with animated checkmark ── */}
      <AnimatePresence>
        {loginSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-lg relative"
                style={{ background: 'linear-gradient(135deg, #238636, #2EA043)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
              >
                <Check size={44} className="text-white" />
              </motion.div>
              <p className="text-lg font-bold text-[#238636]">{language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login Successful'}</p>
              <div className="w-16 h-1 rounded-full mt-3" style={{ background: 'linear-gradient(90deg, transparent, #238636, transparent)' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form card with gradient border wrapper + glassmorphism inner ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 -mt-6 mx-4 rounded-3xl relative z-10 overflow-y-auto p-[1.5px]"
        style={{ background: 'linear-gradient(145deg, rgba(0,168,204,0.4), rgba(0,137,123,0.2), rgba(0,75,99,0.3), rgba(0,168,204,0.15))' }}
      >
        <div
          className="bg-gradient-to-br from-white/98 to-white/92 dark:bg-[#151D2E]/98 backdrop-blur-2xl rounded-3xl p-6 h-full"
          style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,75,99,0.06)' }}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Error message with shake animation */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="login-error"
                  variants={shakeVariants}
                  animate="shake"
                  initial={{ opacity: 0, scale: 0.95 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-3.5 text-red-600 dark:text-red-400 text-sm text-center flex items-center justify-center gap-2"
                >
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.4, repeat: 1 }}>
                    <X size={14} className="flex-shrink-0" />
                  </motion.div>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phone input with icon badge, RTL, focus ring + bottom line */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                  <Phone size={12} className="text-white" />
                </div>
                {t('mobile.login.phoneNumber')}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  dir={direction}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); if (error) setError(''); }}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="09XX XXX XXX"
                  className={`w-full py-3 rounded-2xl border-2 border-[#CBD5E1] dark:border-[#1E2A42] dark:bg-[#0B1120]/80 dark:text-gray-100 focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10 outline-none transition-all text-base bg-[#F8FAFC]/80 placeholder:text-gray-400 px-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                  style={{
                    boxShadow: focusedField === 'phone' ? '0 0 0 4px rgba(0,168,204,0.1)' : undefined,
                    textAlign: direction === 'rtl' ? 'right' : 'left',
                  }}
                  autoComplete="tel"
                  inputMode="tel"
                />
                {focusedField === 'phone' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                    style={{ background: 'linear-gradient(90deg, #00A8CC, #00897B)' }}
                  />
                )}
              </div>
            </motion.div>

            {/* Password input with show/hide, icon badge, focus ring + bottom line */}
            <motion.div variants={itemVariants}>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                  <Lock size={12} className="text-white" />
                </div>
                {t('mobile.login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir={direction}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••"
                  className={`w-full py-3 rounded-2xl border-2 border-[#CBD5E1] dark:border-[#1E2A42] dark:bg-[#0B1120]/80 dark:text-gray-100 focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10 outline-none transition-all text-base bg-[#F8FAFC]/80 placeholder:text-gray-400 ${direction === 'rtl' ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12 text-left'}`}
                  style={{
                    boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(0,168,204,0.1)' : undefined,
                    textAlign: direction === 'rtl' ? 'right' : 'left',
                  }}
                  autoComplete="current-password"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </motion.button>
                {focusedField === 'password' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                    style={{ background: 'linear-gradient(90deg, #00A8CC, #00897B)' }}
                  />
                )}
              </div>
            </motion.div>

            {/* Forgot password link → forgot-password screen */}
            <motion.div variants={itemVariants} className="flex justify-end">
              <motion.button
                type="button"
                onClick={() => setScreen('forgot-password')}
                whileHover={{ scale: 1.05, x: direction === 'rtl' ? -3 : 3 }}
                whileTap={{ scale: 0.95 }}
                className="text-sm font-bold text-[#00A8CC] dark:text-[#00A8CC] hover:text-[#004B63] dark:hover:text-[#00897B] transition-colors flex items-center gap-1.5"
              >
                <KeyRound size={14} />
                {t('mobile.login.forgotPassword')}
              </motion.button>
            </motion.div>

            {/* Login button with gradient + shimmer overlay */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 12px 35px rgba(0,75,99,0.35)' }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
              className="w-full py-4 rounded-2xl text-white font-bold text-base relative overflow-hidden transition-all disabled:opacity-50 disabled:whileHover:scale-100 shadow-md"
              style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #00897B 75%, #00A8CC 100%)' }}
            >
              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' as const }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    {t('mobile.login.loggingIn')}
                  </>
                ) : (
                  <>
                    {t('mobile.login.loginButton')}
                    {direction === 'rtl' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Don't have account? → register screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-1 mt-6"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('mobile.login.noAccount')}</span>
            <motion.button
              onClick={() => setScreen('register')}
              className="text-sm font-bold text-[#004B63] dark:text-[#00A8CC]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('mobile.login.createAccount')}
            </motion.button>
          </motion.div>

          {/* Admin Dashboard Quick Access */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-4 border-t border-[#CBD5E1] dark:border-gray-700/50"
          >
            <motion.button
              onClick={() => useUIStore.getState().toggleAdminMode()}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: 'rgba(88, 166, 255, 0.08)',
                border: '1px solid rgba(88, 166, 255, 0.2)',
                color: '#58A6FF',
              }}
              whileHover={{ scale: 1.02, background: 'rgba(88, 166, 255, 0.12)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap size={16} />
              {direction === 'rtl' ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// REGISTER SCREEN
// ═══════════════════════════════════════════════════════════════════════
function RegisterScreen() {
  const { t, language } = useLanguageStore();
  const register = useMobileStore((s) => s.register);
  const loading = useMobileStore((s) => s.loading);
  const setScreen = useMobileStore((s) => s.setScreen);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const passwordsMatch = password && confirmPass && password === confirmPass;
  const passwordsMismatch = confirmPass && password !== confirmPass;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim() || !password.trim()) { setError(t('mobile.register.errorFillFields')); return; }
    if (password !== confirmPass) { setError(t('mobile.register.errorPasswordMismatch')); return; }
    if (!agreeTerms) { setError(t('mobile.register.errorAgreeTerms')); return; }
    const success = await register(name.trim(), phone.trim(), password, email.trim() || undefined);
    if (success) {
      setRegisterSuccess(true);
    } else {
      setError(t('mobile.register.errorRegistration'));
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };
  const shakeVariants = {
    shake: { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.4 } }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F4F7F9] dark:bg-[#0B1120]" dir={direction}>
      {/* ── Gradient Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-12 pb-14 px-6 relative overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}
      >
        {/* Back button — glassmorphism */}
        <motion.button
          onClick={() => setScreen('login')}
          className={`absolute top-4 ${direction === 'rtl' ? 'right-4' : 'left-4'} w-10 h-10 rounded-xl flex items-center justify-center z-10`}
          style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)' }}
          whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }}
          whileTap={{ scale: 0.9 }}
        >
          {direction === 'rtl' ? <ChevronRight size={20} className="text-white" /> : <ChevronLeft size={20} className="text-white" />}
        </motion.button>

        {/* Floating decorative orbs */}
        <div className="absolute top-4 -right-8 w-28 h-28 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-2 -left-6 w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/4 right-12 w-14 h-14 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.1) 0%, transparent 70%)' }} />

        {/* Animated geometric shapes */}
        <motion.div className="absolute -bottom-4 right-6 w-16 h-16 border border-white/10 rounded-lg" style={{ rotate: 45 }} animate={{ rotate: [45, 135, 45] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' as const }} />
        <motion.div className="absolute top-20 left-12 w-10 h-10 border border-white/8 rounded-md" style={{ rotate: 20 }} animate={{ rotate: [20, 110, 20] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }} />

        {/* Floating dots */}
        <motion.div className="absolute top-16 left-8 w-2 h-2 rounded-full bg-[#00A8CC]/40" animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }} />
        <motion.div className="absolute top-24 right-16 w-1.5 h-1.5 rounded-full bg-white/30" animate={{ y: [0, -6, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }} />
        <motion.div className="absolute bottom-8 left-16 w-2.5 h-2.5 rounded-full bg-[#00A8CC]/25" animate={{ y: [0, -10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }} />
        <motion.div className="absolute top-1/3 right-6 w-8 h-8 border border-[#00A8CC]/15 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }} />

        {/* Logo in circle with glow ring */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-[80px] h-[80px] rounded-full overflow-hidden flex items-center justify-center mb-4 relative"
            style={{
              border: '3px solid rgba(0,168,204,0.45)',
              boxShadow: '0 6px 30px rgba(0,168,204,0.35), 0 3px 12px rgba(0,0,0,0.25), 0 0 50px rgba(0,168,204,0.15)',
            }}
          >
            {/* Logo glow ring */}
            <motion.div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 25px rgba(0,168,204,0.4), inset 0 0 18px rgba(0,168,204,0.12)' }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }} />
            <div className="w-full h-full rounded-full overflow-hidden relative z-10" style={{ background: '#FFFFFF' }}>
              <img src="/logo-circle.png?v=3" alt="نبض المدينة" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-white"
          >
            {language === 'ar' ? 'انضم إلينا' : t('mobile.register.createAccount')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-sm mt-1"
          >
            {t('mobile.register.joinUs')}
          </motion.p>
        </div>

        {/* Wave SVG at bottom of header */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 30" preserveAspectRatio="none" style={{ height: 20 }}>
          <path d="M0,20 C100,0 200,30 300,10 C350,0 380,15 400,10 L400,30 L0,30 Z" fill="rgba(244,247,249,1)" className="dark:fill-[#0B1120]" />
        </svg>
      </motion.div>

      {/* ── Success Overlay ── */}
      <AnimatePresence>
        {registerSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-lg relative"
                style={{ background: 'linear-gradient(135deg, #238636, #2EA043)' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }}
              >
                <Check size={44} className="text-white" />
              </motion.div>
              <p className="text-lg font-bold text-[#238636]">{language === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account Created Successfully'}</p>
              <div className="w-16 h-1 rounded-full mt-3" style={{ background: 'linear-gradient(90deg, transparent, #238636, transparent)' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Form Card — gradient border + glassmorphism ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 -mt-6 mx-4 rounded-3xl relative z-10 overflow-y-auto p-[1.5px]"
        style={{ background: 'linear-gradient(145deg, rgba(0,168,204,0.4), rgba(0,137,123,0.2), rgba(0,75,99,0.3), rgba(0,168,204,0.15))' }}
      >
        <div className="bg-gradient-to-br from-white/98 to-white/92 dark:bg-[#151D2E]/98 backdrop-blur-2xl rounded-3xl p-6 h-full" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,75,99,0.06)' }}>
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Error message with shake */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="register-error"
                variants={shakeVariants}
                animate="shake"
                initial={{ opacity: 0, scale: 0.95 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-3.5 text-red-600 dark:text-red-400 text-sm text-center flex items-center justify-center gap-2"
              >
                <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.4, repeat: 1 }}>
                  <X size={14} className="flex-shrink-0" />
                </motion.div>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full Name — User icon badge */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                <User size={12} className="text-white" />
              </div>
              {t('mobile.register.fullName')}
            </label>
            <div className="relative">
              <input
                type="text"
                dir={direction}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder={t('mobile.register.fullName')}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#CBD5E1] dark:border-[#1E2A42] dark:bg-[#0B1120]/80 dark:text-gray-100 focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10 outline-none transition-all text-base bg-[#F8FAFC]/80 placeholder:text-gray-400"
                style={{ boxShadow: focusedField === 'name' ? '0 0 0 4px rgba(0,168,204,0.1)' : undefined }}
              />
              {focusedField === 'name' && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                  style={{ background: 'linear-gradient(90deg, #00A8CC, #00897B)' }}
                />
              )}
            </div>
          </motion.div>

          {/* Phone — Phone icon badge, RTL, 09XX placeholder */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                <Phone size={12} className="text-white" />
              </div>
              {t('mobile.login.phoneNumber')}
            </label>
            <div className="relative">
              <input
                type="tel"
                dir={direction}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="09XX XXX XXX"
                className={`w-full px-4 py-3 rounded-2xl border-2 border-[#CBD5E1] dark:border-[#1E2A42] dark:bg-[#0B1120]/80 dark:text-gray-100 focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10 outline-none transition-all text-base bg-[#F8FAFC]/80 placeholder:text-gray-400 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                style={{ boxShadow: focusedField === 'phone' ? '0 0 0 4px rgba(0,168,204,0.1)' : undefined, textAlign: direction === 'rtl' ? 'right' : 'left' }}
                autoComplete="tel"
                inputMode="tel"
              />
              {focusedField === 'phone' && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                  style={{ background: 'linear-gradient(90deg, #00A8CC, #00897B)' }}
                />
              )}
            </div>
          </motion.div>

          {/* Email — Mail icon badge, optional label */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                <Mail size={12} className="text-white" />
              </div>
              {t('mobile.register.email')}
              <span className="text-xs text-gray-400 font-normal">({t('mobile.register.emailOptional')})</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder={t('mobile.register.email')}
                className="w-full px-4 py-3 rounded-2xl border-2 border-[#CBD5E1] dark:border-[#1E2A42] dark:bg-[#0B1120]/80 dark:text-gray-100 focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10 outline-none transition-all text-base bg-[#F8FAFC]/80 placeholder:text-gray-400 text-left"
                style={{ boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(0,168,204,0.1)' : undefined, textAlign: 'left' }}
                autoComplete="email"
              />
              {focusedField === 'email' && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                  style={{ background: 'linear-gradient(90deg, #00A8CC, #00897B)' }}
                />
              )}
            </div>
          </motion.div>

          {/* Password — Lock icon badge, show/hide toggle */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                <Lock size={12} className="text-white" />
              </div>
              {t('mobile.register.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                dir={direction}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••"
                className={`w-full py-3 rounded-2xl border-2 border-[#CBD5E1] dark:border-[#1E2A42] dark:bg-[#0B1120]/80 dark:text-gray-100 focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10 outline-none transition-all text-base bg-[#F8FAFC]/80 placeholder:text-gray-400 ${direction === 'rtl' ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12 text-left'}`}
                style={{ boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(0,168,204,0.1)' : undefined, textAlign: direction === 'rtl' ? 'right' : 'left' }}
                autoComplete="new-password"
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </motion.button>
              {focusedField === 'password' && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                  style={{ background: 'linear-gradient(90deg, #00A8CC, #00897B)' }}
                />
              )}
            </div>
          </motion.div>

          {/* Confirm Password — Lock icon badge, show/hide, match/mismatch indicator */}
          <motion.div variants={itemVariants}>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                <Lock size={12} className="text-white" />
              </div>
              {t('mobile.register.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                dir={direction}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder={t('mobile.register.confirmPassword')}
                className={`w-full py-3 rounded-2xl border-2 outline-none transition-all text-base bg-[#F8FAFC]/80 dark:bg-[#0B1120]/80 dark:text-gray-100 placeholder:text-gray-400 ${direction === 'rtl' ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12 text-left'} ${
                  passwordsMatch ? 'border-[#238636] focus:ring-4 focus:ring-[#238636]/10' :
                  passwordsMismatch ? 'border-[#FF3B30] focus:ring-4 focus:ring-[#FF3B30]/10' :
                  'border-[#CBD5E1] dark:border-[#1E2A42] focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10'
                }`}
                style={{
                  boxShadow: focusedField === 'confirmPassword'
                    ? (passwordsMatch ? '0 0 0 4px rgba(35,134,54,0.1)' : passwordsMismatch ? '0 0 0 4px rgba(255,59,48,0.1)' : '0 0 0 4px rgba(0,168,204,0.1)')
                    : undefined,
                  textAlign: direction === 'rtl' ? 'right' : 'left'
                }}
                autoComplete="new-password"
              />
              <motion.button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors`}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </motion.button>
              {focusedField === 'confirmPassword' && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                  style={{ background: passwordsMatch ? 'linear-gradient(90deg, #238636, #2EA043)' : passwordsMismatch ? 'linear-gradient(90deg, #FF3B30, #E85D50)' : 'linear-gradient(90deg, #00A8CC, #00897B)' }}
                />
              )}
            </div>
            {/* Match / mismatch indicator */}
            {confirmPass && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 mt-1.5"
              >
                {passwordsMatch ? (
                  <>
                    <Check size={12} className="text-[#238636]" />
                    <span className="text-xs text-[#238636] font-medium">{language === 'ar' ? 'كلمات المرور متطابقة' : 'Passwords match'}</span>
                  </>
                ) : (
                  <>
                    <X size={12} className="text-[#FF3B30]" />
                    <span className="text-xs text-[#FF3B30] font-medium">{language === 'ar' ? 'كلمات المرور غير متطابقة' : "Passwords don't match"}</span>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Terms & Conditions checkbox */}
          <motion.button
            type="button"
            onClick={() => setAgreeTerms(!agreeTerms)}
            variants={itemVariants}
            className="flex items-center gap-3 py-1 w-full text-left"
          >
            <motion.div
              animate={{ scale: agreeTerms ? 1.1 : 1 }}
              transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                agreeTerms
                  ? 'bg-gradient-to-br from-[#004B63] to-[#00897B] border-[#004B63] shadow-sm'
                  : 'border-gray-300 dark:border-[#1E2A42] bg-white dark:bg-[#0B1120]'
              }`}
            >
              {agreeTerms && <Check size={12} className="text-white" strokeWidth={3} />}
            </motion.div>
            <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{t('mobile.register.agreeTerms')}</span>
          </motion.button>

          {/* Create Account button — gradient + shimmer */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: '0 12px 35px rgba(0,75,99,0.35)' }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
            className="w-full py-4 rounded-2xl text-white font-bold text-base relative overflow-hidden transition-all disabled:opacity-50 disabled:whileHover:scale-100 shadow-md"
            style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #00897B 75%, #00A8CC 100%)' }}
          >
            {/* Shimmer overlay */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' as const }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  {t('mobile.register.registering')}
                </>
              ) : (
                <>
                  {t('mobile.register.createButton')}
                  {direction === 'rtl' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </>
              )}
            </span>
          </motion.button>
        </motion.form>

        {/* Or divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 my-5"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-[#30363D] to-transparent" />
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{t('mobile.login.or')}</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-[#30363D] to-transparent" />
        </motion.div>

        {/* Small Google button — py-2.5, text-xs, w-6 h-6 icon badge */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(66,133,244,0.15)' }}
          whileTap={{ scale: 0.97 }}
          type="button"
          className="w-full py-2.5 rounded-xl bg-white dark:bg-[#21262D] border border-gray-100 dark:border-[#1E2A42] text-gray-600 dark:text-gray-300 font-medium text-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
        >
          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm border border-gray-100">
            <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          </div>
          {t('mobile.register.signUpWithGoogle')}
        </motion.button>

        {/* Already have account? Sign in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="flex items-center justify-center gap-1 mt-5"
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('mobile.register.alreadyHaveAccount')}</span>
          <motion.button onClick={() => setScreen('login')} className="text-sm font-bold text-[#004B63] dark:text-[#00A8CC]" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{t('mobile.register.signIn')}</motion.button>
        </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD SCREEN — Helper Components
// ═══════════════════════════════════════════════════════════════════════
function ConfettiParticles() {
  const confettiColors = ['#004B63', '#00A8CC', '#00897B', '#FF6F61', '#238636', '#F59E0B', '#E91E63', '#7C4DFF'];
  const particles = useMemo(() => {
    // Seeded PRNG to avoid hydration mismatch
    let seed = 77;
    const sr = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: (sr() - 0.5) * 360,
      y: -(sr() * 280 + 80),
      rotate: sr() * 720 - 360,
      scale: sr() * 0.6 + 0.4,
      color: confettiColors[i % confettiColors.length],
      shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'triangle',
    }));
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotate, scale: p.scale, opacity: 0 }}
          transition={{ duration: 2, delay: 0.2 + p.id * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`absolute left-1/2 top-1/2 ${p.shape === 'circle' ? 'w-3 h-3 rounded-full' : p.shape === 'square' ? 'w-2.5 h-2.5 rounded-sm' : 'w-0 h-0'}`}
          style={{
            backgroundColor: p.shape !== 'triangle' ? p.color : undefined,
            borderLeft: p.shape === 'triangle' ? '6px solid transparent' : undefined,
            borderRight: p.shape === 'triangle' ? '6px solid transparent' : undefined,
            borderBottom: p.shape === 'triangle' ? `10px solid ${p.color}` : undefined,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedCheckmark() {
  return (
    <div className="relative w-28 h-28">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-[-8px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(35,134,54,0.2) 0%, transparent 70%)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
      {/* Background circle */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#238636]/10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 15 }}
      />
      {/* Circle that draws itself */}
      <motion.svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
        <motion.circle
          cx="50" cy="50" r="42" fill="none" stroke="#238636" strokeWidth="3"
          strokeDasharray="264" strokeDashoffset="264"
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' as const, delay: 0.1 }}
        />
      </motion.svg>
      {/* Check that draws itself */}
      <motion.svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-20">
        <motion.path
          d="M30 52 L44 66 L70 38"
          fill="none" stroke="#238636" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="60" strokeDashoffset="60"
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' as const, delay: 0.7 }}
        />
      </motion.svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD SCREEN
// ═══════════════════════════════════════════════════════════════════════
function ForgotPasswordScreen() {
  const { t, language } = useLanguageStore();
  const setScreen = useMobileStore((s) => s.setScreen);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const [step, setStep] = useState<'phone' | 'verify' | 'reset' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== 'verify' || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          queueMicrotask(() => setCanResend(true));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, countdown > 0]);

  // Auto-focus first OTP input when verify step loads
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => otpInputs.current[0]?.focus(), 300);
    }
  }, [step]);



  const stepIndex = { phone: 0, verify: 1, reset: 2, success: 3 }[step];

  // Step-specific titles and subtitles
  const stepInfo = {
    phone: { title: t('mobile.forgotPassword.title'), subtitle: t('mobile.forgotPassword.subtitle') },
    verify: { title: t('mobile.forgotPassword.enterCode'), subtitle: t('mobile.forgotPassword.codeSent') },
    reset: { title: t('mobile.forgotPassword.resetPassword'), subtitle: t('mobile.forgotPassword.newPassword') },
    success: { title: t('mobile.forgotPassword.success'), subtitle: '' },
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = verificationCode.split('');
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode.join(''));
    setError('');
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || phone.length < 10) {
      setError(t('mobile.forgotPassword.errorPhone'));
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setCountdown(60);
    setCanResend(false);
    setStep('verify');
  };

  const handleResendCode = async () => {
    setCountdown(60);
    setCanResend(false);
    await new Promise((r) => setTimeout(r, 500));
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (verificationCode.length < 6) {
      setError(t('mobile.forgotPassword.errorCode'));
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setStep('reset');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || newPassword.length < 6) {
      setError(t('mobile.forgotPassword.errorPhone'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError(t('mobile.forgotPassword.errorPassword'));
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
  };

  // Shake animation for errors
  const shakeVariants = {
    shake: {
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.5 },
    },
  };

  // Step transition variants
  const stepVariants = {
    enter: (d: string) => ({ x: d === 'rtl' ? -40 : 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: string) => ({ x: d === 'rtl' ? 40 : -40, opacity: 0 }),
  };

  // Gradient header with back button, logo, step title
  const renderHeader = () => (
    <div
      className="pt-12 pb-16 px-6 relative overflow-hidden flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}
    >
      {/* Back button with glassmorphism */}
      <motion.button
        onClick={() => setScreen('login')}
        className={`absolute top-4 ${direction === 'rtl' ? 'right-4' : 'left-4'} w-10 h-10 rounded-xl flex items-center justify-center z-10`}
        style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)' }}
        whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }}
        whileTap={{ scale: 0.9 }}
      >
        {direction === 'rtl' ? <ChevronRight size={20} className="text-white" /> : <ChevronLeft size={20} className="text-white" />}
      </motion.button>

      {/* Decorative orbs */}
      <div className="absolute top-4 -right-8 w-28 h-28 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-2 -left-6 w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.12) 0%, transparent 70%)' }} />

      {/* Rotating geometric shapes */}
      <motion.div className="absolute -bottom-3 left-10 w-12 h-12 border border-white/10 rounded-lg" style={{ rotate: 45 }} animate={{ rotate: [45, 135, 45] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' as const }} />
      <motion.div className="absolute top-20 right-6 w-10 h-10 border border-white/8 rounded-md" style={{ rotate: 25 }} animate={{ rotate: [25, 115, 25] }} transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }} />

      {/* Floating dots */}
      <motion.div className="absolute top-16 left-10 w-2 h-2 rounded-full bg-[#00A8CC]/40" animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }} />
      <motion.div className="absolute top-24 right-12 w-1.5 h-1.5 rounded-full bg-white/30" animate={{ y: [0, -6, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }} />
      <motion.div className="absolute top-16 right-8 w-8 h-8 border border-[#00A8CC]/15 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }} />

      {/* Logo circle with glow */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-[68px] h-[68px] rounded-full overflow-hidden flex items-center justify-center mb-3 relative"
          style={{
            border: '3px solid rgba(0,168,204,0.45)',
            boxShadow: '0 6px 30px rgba(0,168,204,0.35), 0 3px 12px rgba(0,0,0,0.25), 0 0 50px rgba(0,168,204,0.15)',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: '0 0 25px rgba(0,168,204,0.4), inset 0 0 18px rgba(0,168,204,0.12)' }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
          />
          <div className="w-full h-full rounded-full overflow-hidden relative z-10" style={{ background: '#FFFFFF' }}>
            <img src="/logo-circle.png?v=3" alt="Nabd" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </motion.div>
        <motion.h1
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-bold text-white"
        >
          {stepInfo[step].title}
        </motion.h1>
        {stepInfo[step].subtitle && (
          <motion.p
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-xs mt-1 text-center max-w-[260px]"
          >
            {stepInfo[step].subtitle}
          </motion.p>
        )}
      </motion.div>

      {/* Wave SVG at bottom */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 30" preserveAspectRatio="none" style={{ height: 20 }}>
        <path d="M0,20 C100,0 200,30 300,10 C350,0 380,15 400,10 L400,30 L0,30 Z" fill="rgba(244,247,249,1)" className="dark:fill-[#0B1120]" />
      </svg>
    </div>
  );

  // Shared gradient shimmer button
  const renderShimmerButton = (onClick: () => void, disabled: boolean, icon: React.ReactNode, label: string) => (
    <motion.button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, boxShadow: '0 12px 35px rgba(0,75,99,0.35)' }}
      whileTap={{ scale: 0.97 }}
      className="w-full py-4 rounded-2xl text-white font-bold text-base relative overflow-hidden transition-all disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
      style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #00897B 75%, #00A8CC 100%)' }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? <RefreshCw size={16} className="animate-spin" /> : icon}
        {label}
      </span>
    </motion.button>
  );

  // Shared error display
  const renderError = () => error && (
    <motion.div
      variants={shakeVariants}
      animate="shake"
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-3.5 text-red-600 dark:text-red-400 text-sm text-center flex items-center justify-center gap-2"
    >
      <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.4, repeat: 1 }}>
        <X size={14} className="flex-shrink-0" />
      </motion.div>
      {error}
    </motion.div>
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F4F7F9] dark:bg-[#0B1120]" dir={direction}>
      {renderHeader()}

      {/* Form card with gradient border + glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 -mt-6 mx-4 rounded-3xl relative z-10 overflow-y-auto p-[1.5px]"
        style={{ background: 'linear-gradient(145deg, rgba(0,168,204,0.4), rgba(0,137,123,0.2), rgba(0,75,99,0.3), rgba(0,168,204,0.15))' }}
      >
        <div
          className="bg-gradient-to-br from-white/98 to-white/92 dark:bg-[#151D2E]/98 backdrop-blur-2xl rounded-3xl p-6 h-full"
          style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,75,99,0.06)' }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {step === 'success' ? (
              /* ── Step 4: Success ── */
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
                className="flex flex-col items-center py-8 relative"
              >
                <ConfettiParticles />
                <AnimatedCheckmark />
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-6"
                >
                  {t('mobile.forgotPassword.success')}
                </motion.h2>
                <div className="w-16 h-1 rounded-full mt-3 mb-5" style={{ background: 'linear-gradient(90deg, transparent, #238636, transparent)' }} />
                <motion.button
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  onClick={() => setScreen('login')}
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 35px rgba(0,75,99,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl text-white font-bold relative overflow-hidden shadow-md"
                  style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #00897B 75%, #00A8CC 100%)' }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' as const }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <ChevronLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                    {t('mobile.forgotPassword.backToLogin')}
                  </span>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' as const }}
              >
                {/* Animated Step Indicator */}
                <div className="flex items-center justify-center mb-6 px-2">
                  {(['phone', 'verify', 'reset'] as const).map((s, i) => {
                    const sOrder = { phone: 0, verify: 1, reset: 2 }[s];
                    const isCompleted = sOrder < stepIndex;
                    const isCurrent = sOrder === stepIndex;
                    return (
                      <React.Fragment key={s}>
                        {i > 0 && (
                          <div className="flex-1 h-0.5 bg-gray-200 dark:bg-[#30363D] rounded-full relative overflow-hidden mx-1">
                            <motion.div
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{ background: 'linear-gradient(90deg, #004B63, #00897B)' }}
                              initial={{ width: '0%' }}
                              animate={{ width: isCompleted ? '100%' : isCurrent ? '50%' : '0%' }}
                              transition={{ duration: 0.5, ease: 'easeInOut' as const }}
                            />
                          </div>
                        )}
                        <motion.div
                          animate={{ scale: isCurrent ? 1.1 : 1 }}
                          transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative ${
                            isCompleted ? 'text-white' : isCurrent ? 'text-white' : 'text-gray-400 dark:bg-[#21262D] dark:text-[#6B7F96]'
                          }`}
                          style={isCurrent ? { background: 'linear-gradient(135deg, #004B63, #00897B)' } : isCompleted ? { backgroundColor: '#238636' } : { backgroundColor: '#F3F4F6' }}
                        >
                          {isCompleted ? <Check size={16} className="text-white" /> : i + 1}
                          {isCurrent && (
                            <motion.div
                              className="absolute inset-0 rounded-full border-2 border-[#00A8CC]/50"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                            />
                          )}
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* ── Step 1: Phone ── */}
                {step === 'phone' && (
                  <form onSubmit={handleSendCode} className="space-y-5">
                    {renderError()}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                          <Phone size={12} className="text-white" />
                        </div>
                        {t('mobile.forgotPassword.phoneNumber')}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          dir={direction}
                          value={phone}
                          onChange={(e) => { setPhone(e.target.value); setError(''); }}
                          onFocus={() => setFocusedField('fpPhone')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="09XX XXX XXX"
                          className={`w-full px-4 py-3.5 rounded-2xl border-2 border-[#CBD5E1] dark:border-[#1E2A42] dark:bg-[#0B1120]/80 dark:text-gray-100 focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10 outline-none transition-all text-base bg-[#F8FAFC]/80 placeholder:text-gray-400 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
                          style={{
                            boxShadow: focusedField === 'fpPhone' ? '0 0 0 4px rgba(0,168,204,0.1)' : undefined,
                            textAlign: direction === 'rtl' ? 'right' : 'left',
                          }}
                          inputMode="tel"
                        />
                      </div>
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      {renderShimmerButton(() => {}, loading || !phone, <Mail size={16} />, loading ? t('mobile.forgotPassword.sending') : t('mobile.forgotPassword.sendCode'))}
                    </motion.div>
                  </form>
                )}

                {/* ── Step 2: Verify OTP ── */}
                {step === 'verify' && (
                  <form onSubmit={handleVerifyCode} className="space-y-5">
                    {renderError()}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center mb-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('mobile.forgotPassword.codeSent')}</p>
                      <p className="text-sm font-bold text-[#004B63] dark:text-[#00A8CC] mt-1" dir="ltr">{phone}</p>
                    </motion.div>

                    {/* 6 individual OTP digit boxes */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex justify-center gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpInputs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={verificationCode[i] || ''}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-[#CBD5E1] dark:border-[#1E2A42] dark:bg-[#0B1120] dark:text-white focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10 outline-none transition-all"
                          style={{
                            boxShadow: verificationCode[i] ? '0 0 0 2px rgba(0,75,99,0.15)' : undefined,
                            caretColor: '#00A8CC',
                          }}
                        />
                      ))}
                    </motion.div>

                    {/* Countdown Timer / Resend */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center">
                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          className="text-sm font-semibold text-[#004B63] dark:text-[#00A8CC] hover:underline flex items-center justify-center gap-1 mx-auto"
                        >
                          <RefreshCw size={14} />
                          {t('mobile.forgotPassword.resendCode')}
                        </button>
                      ) : (
                        <p className="text-sm text-gray-400">
                          {t('mobile.forgotPassword.resendIn')} <span className="font-bold text-[#004B63] dark:text-[#00A8CC]">{countdown}</span> {t('mobile.forgotPassword.seconds')}
                        </p>
                      )}
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                      {renderShimmerButton(() => {}, loading || verificationCode.length < 6, <ShieldCheck size={16} />, loading ? t('mobile.forgotPassword.verifying') : t('mobile.forgotPassword.verify'))}
                    </motion.div>
                  </form>
                )}

                {/* ── Step 3: Reset Password ── */}
                {step === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {renderError()}

                    {/* New Password */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                          <Lock size={12} className="text-white" />
                        </div>
                        {t('mobile.forgotPassword.newPassword')}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          dir={direction}
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                          onFocus={() => setFocusedField('fpNewPass')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="••••••"
                          className={`w-full py-3.5 rounded-2xl border-2 border-[#CBD5E1] dark:border-[#1E2A42] dark:bg-[#0B1120]/80 dark:text-gray-100 focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10 outline-none text-base bg-[#F8FAFC]/80 ${direction === 'rtl' ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12 text-left'}`}
                          style={{
                            boxShadow: focusedField === 'fpNewPass' ? '0 0 0 4px rgba(0,168,204,0.1)' : undefined,
                            textAlign: direction === 'rtl' ? 'right' : 'left',
                          }}
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200`}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                          <Lock size={12} className="text-white" />
                        </div>
                        {t('mobile.forgotPassword.confirmNewPassword')}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          dir={direction}
                          value={confirmNewPassword}
                          onChange={(e) => { setConfirmNewPassword(e.target.value); setError(''); }}
                          onFocus={() => setFocusedField('fpConfirmPass')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="••••••"
                          className={`w-full py-3.5 rounded-2xl border-2 outline-none text-base bg-[#F8FAFC]/80 dark:bg-[#0B1120]/80 dark:text-gray-100 transition-colors ${direction === 'rtl' ? 'pr-4 pl-12 text-right' : 'pl-4 pr-12 text-left'} ${
                            confirmNewPassword && newPassword !== confirmNewPassword
                              ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-300/10'
                              : confirmNewPassword && newPassword === confirmNewPassword
                                ? 'border-[#238636] focus:border-[#238637] focus:ring-4 focus:ring-[#238636]/10'
                                : 'border-[#CBD5E1] dark:border-[#1E2A42] focus:border-[#00A8CC] focus:ring-4 focus:ring-[#00A8CC]/10'
                          }`}
                          style={{
                            boxShadow: focusedField === 'fpConfirmPass'
                              ? confirmNewPassword && newPassword === confirmNewPassword
                                ? '0 0 0 4px rgba(35,134,54,0.1)'
                                : confirmNewPassword && newPassword !== confirmNewPassword
                                  ? '0 0 0 4px rgba(255,59,48,0.1)'
                                  : '0 0 0 4px rgba(0,168,204,0.1)'
                              : undefined,
                            textAlign: direction === 'rtl' ? 'right' : 'left',
                          }}
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={`absolute ${direction === 'rtl' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200`}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </motion.button>
                      </div>
                      {/* Password match/mismatch indicator */}
                      {confirmNewPassword && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 mt-2">
                          {newPassword === confirmNewPassword ? (
                            <>
                              <Check size={14} className="text-[#238636]" />
                              <span className="text-xs text-[#238636] font-medium">{t('mobile.forgotPassword.passwordMatch')}</span>
                            </>
                          ) : (
                            <>
                              <X size={14} className="text-red-400" />
                              <span className="text-xs text-red-400 font-medium">{t('mobile.forgotPassword.passwordNoMatch')}</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </motion.div>

                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      {renderShimmerButton(() => {}, loading, <KeyRound size={16} />, loading ? t('mobile.forgotPassword.resetting') : t('mobile.forgotPassword.resetPassword'))}
                    </motion.div>
                  </form>
                )}

                {/* Back to Login */}
                <div className="flex justify-center mt-5">
                  <motion.button
                    onClick={() => setScreen('login')}
                    className="text-sm font-bold text-[#004B63] dark:text-[#00A8CC] hover:underline flex items-center gap-1"
                    whileHover={{ scale: 1.05, x: direction === 'rtl' ? 3 : -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {direction === 'rtl' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    {t('mobile.forgotPassword.backToLogin')}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN SCREEN WITH BOTTOM NAV
// ═══════════════════════════════════════════════════════════════════════
function MainScreen() {
  const { t, language } = useLanguageStore();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const activeTab = useMobileStore((s) => s.activeTab);
  const setActiveTab = useMobileStore((s) => s.setActiveTab);
  const navHistory = useMobileStore((s) => s.navHistory);
  const goBack = useMobileStore((s) => s.goBack);
  const products = useMobileStore((s) => s.products);
  const categories = useMobileStore((s) => s.categories);
  const favorites = useMobileStore((s) => s.favorites);
  const favoriteProducts = useMobileStore((s) => s.favoriteProducts);
  const toggleFavorite = useMobileStore((s) => s.toggleFavorite);
  const searchQuery = useMobileStore((s) => s.searchQuery);
  const setSearchQuery = useMobileStore((s) => s.setSearchQuery);
  const setSelectedProduct = useMobileStore((s) => s.setSelectedProduct);
  const user = useMobileStore((s) => s.user);
  const onLogout = useMobileStore((s) => s.logout);
  const setScreen = useMobileStore((s) => s.setScreen);
  const darkMode = useMobileStore((s) => s.darkMode);
  const setDarkMode = useMobileStore((s) => s.setDarkMode);
  const [isLoading, setIsLoading] = useState(true);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top when switching tabs
  useEffect(() => {
    // Use requestAnimationFrame to ensure the new tab content is mounted
    // before scrolling, and use a small delay for the AnimatePresence transition
    const raf = requestAnimationFrame(() => {
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [activeTab]);

  // Real-time sync for mobile customer
  useRealtimeSync({
    userId: user?.id || '',
    role: 'customer',
    onOrderStatusChanged: (data) => {
      // Refresh user profile (wallet/loyalty may change if refund happened)
      useMobileStore.getState().fetchUserProfile();
      // Increment unread notification count
      useMobileStore.getState().setUnreadNotificationCount(
        useMobileStore.getState().unreadNotificationCount + 1
      );
      // Show toast about the status change
      const statusMsg =
        data?.orderNumber
          ? `طلب #${data.orderNumber} - ${data?.status || 'تم التحديث'}`
          : `تم تحديث حالة الطلب`;
      toast(statusMsg, { description: data?.note || undefined });
    },
    onNotification: (data) => {
      // Increment unread notification count
      useMobileStore.getState().setUnreadNotificationCount(
        useMobileStore.getState().unreadNotificationCount + 1
      );
      // Add notification to store
      const newNotif: import('./lib/mobile-store').AppNotification = {
        id: data?.id || `notif-${Date.now()}`,
        title: (data?.titleAr || data?.title || 'إشعار جديد') as string,
        body: (data?.bodyAr || data?.body || '') as string,
        type: (data?.type || 'system') as import('./lib/mobile-store').AppNotification['type'],
        isRead: false,
        date: (data?.date || new Date().toISOString()) as string,
      };
      useMobileStore.setState((state) => ({
        notifications: [newNotif, ...state.notifications],
      }));
      // Show toast with notification title/body
      toast(newNotif.title, { description: newNotif.body });
    },
    onCatalogChanged: () => {
      // Refresh products and categories when catalog changes
      useMobileStore.getState().refreshData();
    },
  });

  useEffect(() => { const tm = setTimeout(() => setIsLoading(false), 600); return () => clearTimeout(tm); }, []);

  const cartItems = useCartStore((s) => s.items);
  const cartItemCount = cartItems.length;
  // Count favorites: when products are loaded, filter by valid product IDs; otherwise use raw count
  const favoritesCount = useMemo(() => {
    if (!favorites || favorites.length === 0) return 0;
    if (!products || products.length === 0) return favorites.length;
    const productIds = new Set(products.map((p: Product) => p.id));
    const validCount = favorites.filter((id: string) => productIds.has(id)).length;
    // Use the higher count to account for products not yet in the store
    return Math.max(validCount, favorites.length);
  }, [favorites, products]);
  const tabs: { id: Tab; label: string; icon: React.ReactNode; activeIcon: React.ReactNode }[] = [
    { id: 'home', label: t('mobile.nav.home'), icon: <Nav3DHomeIcon active={false} darkMode={darkMode} />, activeIcon: <Nav3DHomeIcon active={true} darkMode={darkMode} /> },
    { id: 'categories', label: t('mobile.nav.categories'), icon: <Nav3DCategoriesIcon active={false} darkMode={darkMode} />, activeIcon: <Nav3DCategoriesIcon active={true} darkMode={darkMode} /> },
    { id: 'cart', label: t('mobile.nav.cart'), icon: <Nav3DCartIcon active={false} darkMode={darkMode} itemCount={cartItemCount} />, activeIcon: <Nav3DCartIcon active={true} darkMode={darkMode} itemCount={cartItemCount} /> },
    { id: 'favorites', label: t('mobile.nav.favorites'), icon: <Nav3DHeartIcon active={false} darkMode={darkMode} itemCount={favoritesCount} />, activeIcon: <Nav3DHeartIcon active={true} darkMode={darkMode} itemCount={favoritesCount} /> },
    { id: 'profile', label: t('mobile.nav.profile'), icon: <Nav3DUserIcon active={false} darkMode={darkMode} />, activeIcon: <Nav3DUserIcon active={true} darkMode={darkMode} /> },
  ];
  const activeTabIndex = tabs.findIndex((tb) => tb.id === activeTab);

  const handleTabPress = (tabId: Tab) => {
    if (activeTab === tabId) return;
    // Only clear navigation history if the user manually switches tabs
    // (not from a redirect). If there's history and the user is leaving
    // a redirected-to tab, clear the history since they chose to go elsewhere.
    useMobileStore.getState().clearNavHistory();
    // Also reset category detail when leaving categories tab
    if (activeTab === 'categories' && tabId !== 'categories') {
      useMobileStore.getState().setSelectedCatId(null);
    }
    setActiveTab(tabId);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#F4F7F9] dark:bg-[#0B1120]">
      {/* Dynamic Back Button — shown when navigation history exists */}
      <AnimatePresence>
        {navHistory.length > 0 && (
          <motion.button
            initial={{ opacity: 0, x: direction === 'rtl' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'rtl' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            onClick={goBack}
            className="absolute top-3 start-3 z-40 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #004B63, #00897B)',
              boxShadow: '0 4px 12px rgba(0,75,99,0.4)',
            }}
            aria-label={language === 'ar' ? 'رجوع' : 'Go back'}
          >
            {direction === 'rtl' ? <ArrowRight size={18} className="text-white" /> : <ArrowLeft size={18} className="text-white" />}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Content area with smooth transitions */}
      <div className="flex-1 overflow-y-auto" ref={contentScrollRef} data-content-scroll>
        <AnimatePresence mode="wait">
          {isLoading && activeTab === 'home' ? (
            <HomeScreenSkeleton key="skeleton" />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' as const }}
              style={{ transform: 'none' }}
              className="min-h-full"
            >
              {activeTab === 'home' && <HomeTab products={products} categories={categories} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSelectProduct={setSelectedProduct} favorites={favorites} toggleFavorite={toggleFavorite} />}
              {activeTab === 'categories' && <CategoriesTab categories={categories} products={products} onSelectProduct={setSelectedProduct} />}
              {activeTab === 'cart' && <CartTab />}
              {activeTab === 'favorites' && <FavoritesTab favoriteProducts={favoriteProducts} toggleFavorite={toggleFavorite} onSelectProduct={setSelectedProduct} />}
              {activeTab === 'profile' && <ProfileTab user={user} onLogout={onLogout} onGoToLogin={() => setScreen('login')} darkMode={darkMode} setDarkMode={setDarkMode} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Widget - visible on all tabs */}
      <MobileChatWidget />

      {/* 3D Glassmorphism Bottom Navigation — Professional Light */}
      <nav
        className="relative bottom-nav-glass"
        role="navigation"
        aria-label={t('mobile.nav.mainNav')}
      >
        {/* Active indicator pill - slides between tabs with glow */}
        <motion.div
          className="absolute top-0 h-[3px] rounded-full"
          style={{
            background: 'linear-gradient(90deg, #004B63, #00897B)',
            width: 32,
            boxShadow: '0 0 8px rgba(0,75,99,0.4), 0 0 16px rgba(0,137,123,0.2)',
          }}
          animate={{
            left: `calc(${(activeTabIndex + 0.5) * 20}% - 16px)`,
          }}
          transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }}
        />

        <div className="flex items-center justify-around px-1 pt-2 pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className="relative flex flex-col items-center justify-center gap-0.5 w-[18%] py-2 rounded-2xl transition-colors duration-200"
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                whileTap={{ scale: 0.9 }}
              >
                {/* 3D gradient background on active tab with floating effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: darkMode
                        ? 'linear-gradient(180deg, rgba(88,166,255,0.12) 0%, rgba(88,166,255,0.03) 100%)'
                        : 'linear-gradient(180deg, rgba(0,75,99,0.08) 0%, rgba(0,137,123,0.03) 100%)',
                      boxShadow: darkMode
                        ? 'inset 0 1px 0 rgba(88,166,255,0.1)'
                        : 'inset 0 1px 0 rgba(0,75,99,0.08)',
                    }}
                    layoutId="tabBg"
                    transition={{ type: 'spring' as const, stiffness: 350, damping: 30 }}
                  />
                )}
                <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                  <div>
                    {isActive ? tab.activeIcon : tab.icon}
                  </div>
                  {/* 3D gradient dot underneath active icon with glow */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: 'linear-gradient(135deg, #004B63, #00897B)',
                          boxShadow: '0 0 4px rgba(0,137,123,0.5)',
                        }}
                      />
                    </motion.div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold transition-all duration-200 ${isActive ? 'text-[#004B63] dark:text-[#00C4E8] opacity-100' : 'text-gray-400 dark:text-[#6B7F96] opacity-70'}`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
        {/* Home indicator bar */}
        <div className="flex justify-center pb-1">
          <div className="w-32 h-1 rounded-full bg-gray-900/15 dark:bg-white/15" />
        </div>
      </nav>
    </div>
  );
}

