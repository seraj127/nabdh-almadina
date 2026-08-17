'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { APP_VERSION } from '../lib/constants';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useMobileStore } from '../lib/mobile-store';
import { OrderTrackingScreen } from './order-tracking';
import {
  Package, Heart, Globe, Headphones, ShieldCheck, MapPin,
  Settings, ChevronLeft, ChevronRight, Truck, Tag,
  Wallet, Award, Gift, RefreshCw, Info,
  Clock, Camera, LogOut, X, Check, Share2, Copy, Star, ShoppingBag,
  FileText, Phone, Sparkles, Image as ImageIcon, Upload, Trash2, Download, ArrowRight, ArrowLeft
} from 'lucide-react';
import { PrivacyOverlay, HelpOverlay, AboutOverlay, ContactUsOverlay } from './profile-overlays';
import { AdvancedSettingsScreen } from './settings-screen';
import { AddressManagement } from './address-management';
import type { MobileUser } from '../lib/types';
import { compressImageToBase64 } from '@/lib/image-compress';

// â”€â”€â”€ Brand Design Tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COLORS = {
  primary: '#004B63',
  primaryDark: '#003545',
  primaryLight: '#006B8A',
  accent: '#00A8CC',
  teal: '#00897B',
  secondary: '#FF6F61',
  gold: '#D4A843',
  success: '#238636',
  warning: '#D29922',
  danger: '#FF3B30',
  info: '#00C4E8',
  purple: '#8B5CF6',
  surface: '#F8F9FA',
  border: '#E5E5E5',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textDisabled: '#999999',
  darkBg: '#0B1120',
  darkCard: '#151D2E',
  darkBorder: '#1E2A42',
  darkSubtle: '#1A2540',
};



// â”€â”€â”€ Order Status Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending:   { bg: 'bg-[#D29922]/10', text: 'text-[#D29922]', dot: '#D29922' },
  confirmed: { bg: 'bg-[#00C4E8]/10', text: 'text-[#00C4E8]', dot: '#00C4E8' },
  processing:{ bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]', dot: '#8B5CF6' },
  shipped:   { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]', dot: '#F97316' },
  delivered: { bg: 'bg-[#238636]/10', text: 'text-[#238636]', dot: '#238636' },
  cancelled: { bg: 'bg-[#FF3B30]/10', text: 'text-[#FF3B30]', dot: '#FF3B30' },
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

// â”€â”€â”€ Animation Variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const itemFadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, type: 'spring' as const, stiffness: 200, damping: 22 },
  }),
};

const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContent = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.85, y: 20, transition: { duration: 0.15 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
};

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// PROFILE TAB COMPONENT
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function ProfileTab({ user, onLogout, onGoToLogin, darkMode, setDarkMode }: {
  user: MobileUser | null;
  onLogout: () => void;
  onGoToLogin: () => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}) {
  const { t, language, setLanguage } = useLanguageStore();
  const isRtl = language === 'ar';
  const direction = isRtl ? 'rtl' : 'ltr';
  const cartItems = useCartStore((s) => s.items);
  // Total cart item count (sum of quantities) â€” matches bottom nav badge
  const cartTotalItems = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);
  const favorites = useMobileStore((s) => s.favorites);
  const products = useMobileStore((s) => s.products) || [];
  const validFavoritesCount = useMemo(() => {
    if (!products || products.length === 0) return favorites.length;
    const productIds = new Set(products.map((p: { id: string }) => p.id));
    return favorites.filter((id: string) => productIds.has(id)).length;
  }, [favorites, products]);
  const setDarkModeStore = useMobileStore((s) => s.setDarkMode);
  const loyaltyPoints = useMobileStore((s) => s.loyaltyPoints);
  const loyaltyTier = useMobileStore((s) => s.loyaltyTier);
  const walletBalance = useMobileStore((s) => s.walletBalance);

  // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [orders, setOrders] = useState<Array<{
    id: string; orderNumber: string; status: string; total: number; createdAt: string;
    subtotal?: number; deliveryFee?: number; discount?: number;
    items?: Array<{ nameAr: string; nameEn: string; quantity: number; price: number; image?: string | null; productId?: string; id?: string }>;
    statusLog?: Array<{ status: string; note?: string; createdAt: string }>;
    address?: { label?: string; address?: string; city?: string; area?: string } | null;
  }>>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showOrdersExpand, setShowOrdersExpand] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [orderReviewEligibility, setOrderReviewEligibility] = useState<Array<{
    productId: string;
    hasReviewed: boolean;
    existingReview: any | null;
  }>>([]);

  // â”€â”€â”€ Fetch review eligibility when order is selected â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (selectedOrder && selectedOrder.status === 'delivered' && user?.id && selectedOrder.id) {
      fetch(`/api/reviews/eligibility?orderId=${selectedOrder.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.items) setOrderReviewEligibility(data.items);
        })
        .catch(() => {});
    } else {
      queueMicrotask(() => setOrderReviewEligibility([]));
    }
  }, [selectedOrder, user?.id]);

  // â”€â”€â”€ Scroll to top on mount â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const scrollContainer = document.querySelector('[data-content-scroll]') as HTMLElement;
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Portal root for overlays (renders at phone frame level, outside scroll container)
  const [overlayRoot] = useState<HTMLElement | null>(() =>
    typeof document !== 'undefined' ? document.getElementById('mobile-overlay-root') : null
  );

  // Load saved photo â€” check localStorage first, then store (which may have server-synced avatar)
  const [userPhoto, setUserPhoto] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mobile_user_photo');
        if (local) return local;
        // Fallback to store avatar (synced from server)
        const storeAvatar = useMobileStore.getState().avatar;
        if (storeAvatar) {
          localStorage.setItem('mobile_user_photo', storeAvatar);
          return storeAvatar;
        }
        // Also check user.avatar from store
        const userAvatar = useMobileStore.getState().user?.avatar;
        if (userAvatar) {
          localStorage.setItem('mobile_user_photo', userAvatar);
          return userAvatar;
        }
      }
    } catch { /* ignore */ }
    return null;
  });

  // â”€â”€â”€ Fetch Orders on mount (for stats sync) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (user) {
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch(`/api/orders?userId=${user.id}`);
          const data = await res.json();
          if (!cancelled) setOrders(data.orders || []);
        } catch {
          if (!cancelled) setOrders([]);
        }
      })();
      // Refresh profile data (wallet/loyalty may have changed from admin)
      if (!user.id.startsWith('local-')) {
        useMobileStore.getState().fetchUserProfile();
      }
      return () => { cancelled = true; };
    }
  }, [user]);

  // â”€â”€â”€ Refetch Orders when overlay opens (ensure fresh data) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (showOrders && user) {
      let cancelled = false;
      (async () => {
        try {
          const res = await fetch(`/api/orders?userId=${user.id}`);
          const data = await res.json();
          if (!cancelled) setOrders(data.orders || []);
        } catch {
          if (!cancelled) setOrders([]);
        }
      })();
      return () => { cancelled = true; };
    }
  }, [showOrders, user]);

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDarkModeToggle = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    setDarkModeStore(newVal);
  };

  const handleCopyReferral = () => {
    const link = `https://nabd.ly/ref/${user?.id || 'demo'}`;
    navigator.clipboard?.writeText(link).then(() => {
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    }).catch(() => {
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    });
  };

  const handlePhotoSelect = async (file: File) => {
    setPhotoUploading(true);
    try {
      // Compress image before saving
      const base64 = await compressImageToBase64(file);
      setUserPhoto(base64);
      try { localStorage.setItem('mobile_user_photo', base64); } catch { /* ignore */ }
      // Sync to store so Home tab and other screens update
      useMobileStore.getState().setAvatar(base64);
      // Sync to server so avatar persists across devices
      try {
        const currentUser = useMobileStore.getState().user;
        if (currentUser && !currentUser.id.startsWith('local-')) {
          await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: base64 }),
          });
        }
      } catch { /* ignore server sync failure */ }
      setPhotoUploading(false);
      setShowPhotoSheet(false);
    } catch {
      setPhotoUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUserPhoto(null);
    try { localStorage.removeItem('mobile_user_photo'); } catch { /* ignore */ }
    // Sync removal to store so Home tab and other screens update
    useMobileStore.getState().setAvatar(null);
    // Sync removal to server so avatar is removed across devices
    try {
      const currentUser = useMobileStore.getState().user;
      if (currentUser && !currentUser.id.startsWith('local-')) {
        await fetch('/api/auth/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: '' }),
        });
      }
    } catch { /* ignore server sync failure */ }
    setShowPhotoSheet(false);
  };

  const handleNameUpdate = (nameAr: string, nameEn: string) => {
    // Names are saved inside SettingsOverlay via localStorage
  };

  const statusLabels: Record<string, string> = {
    pending: t('order.pending'),
    confirmed: t('order.confirmed'),
    processing: t('order.processing'),
    shipped: t('order.shipped'),
    delivered: t('order.delivered'),
    cancelled: t('order.cancelled'),
  };

  // â”€â”€â”€ Scroll main content to top when overlays open â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const scrollMainToTop = useCallback(() => {
    // Find the main scroll container (flex-1 overflow-y-auto inside MainScreen)
    const overlayRootEl = document.getElementById('mobile-overlay-root');
    if (!overlayRootEl) return;
    const phoneFrame = overlayRootEl.parentElement;
    if (!phoneFrame) return;
    // Find the scroll container - it's the div with overflow-y-auto
    const scrollContainer = phoneFrame.querySelector('[class*="overflow-y-auto"]');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, []);

  // Scroll to top when any overlay opens
  useEffect(() => {
    if (showPhotoSheet || showSettings || showOrders || showLogoutModal || selectedOrder || trackingOrder || showPrivacy || showHelp || showAbout || showContact) {
      scrollMainToTop();
    }
  }, [showPhotoSheet, showSettings, showOrders, showLogoutModal, selectedOrder, trackingOrder, showPrivacy, showHelp, showAbout, showContact, scrollMainToTop]);

  // â”€â”€â”€ Privacy Overlay (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const privacyOverlay = showPrivacy && overlayRoot && createPortal(
    <div className="fixed inset-0 pointer-events-auto overflow-y-auto" style={{ zIndex: 60 }}>
      <PrivacyOverlay onClose={() => setShowPrivacy(false)} language={language} direction={direction} isRTL={isRtl} t={t} darkMode={darkMode} />
    </div>,
    overlayRoot
  );

  // â”€â”€â”€ Help Overlay (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const helpOverlay = showHelp && overlayRoot && createPortal(
    <div className="fixed inset-0 pointer-events-auto overflow-y-auto" style={{ zIndex: 60 }}>
      <HelpOverlay onClose={() => setShowHelp(false)} language={language} direction={direction} isRTL={isRtl} t={t} darkMode={darkMode} />
    </div>,
    overlayRoot
  );

  // â”€â”€â”€ About Overlay (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const aboutOverlay = showAbout && overlayRoot && createPortal(
    <div className="fixed inset-0 pointer-events-auto overflow-y-auto" style={{ zIndex: 60 }}>
      <AboutOverlay onClose={() => setShowAbout(false)} language={language} direction={direction} isRTL={isRtl} t={t} darkMode={darkMode} />
    </div>,
    overlayRoot
  );

  // â”€â”€â”€ Contact Us Overlay (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const contactOverlay = showContact && overlayRoot && createPortal(
    <div className="fixed inset-0 pointer-events-auto overflow-y-auto" style={{ zIndex: 60 }}>
      <ContactUsOverlay onClose={() => setShowContact(false)} language={language} direction={direction} isRTL={isRtl} t={t} darkMode={darkMode} />
    </div>,
    overlayRoot
  );

  // â”€â”€â”€ Settings Overlay (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const settingsOverlay = showSettings && overlayRoot && createPortal(
    <div className="fixed inset-0 pointer-events-auto overflow-y-auto" style={{ zIndex: 60 }}>
      <AdvancedSettingsScreen
        onClose={() => setShowSettings(false)}
        user={user}
        darkMode={darkMode}
        handleDarkMode={(v: boolean) => { setDarkMode(v); setDarkModeStore(v); }}
        onLogout={() => { setShowSettings(false); setShowLogoutModal(true); }}
        onGoToFavorites={() => { setShowSettings(false); useMobileStore.getState().setActiveTab('favorites'); }}
        onGoToOrders={() => { setShowSettings(false); useMobileStore.getState().setScreen('order-tracking'); }}
        onGoToAddresses={() => { setShowSettings(false); }}
      />
    </div>,
    overlayRoot
  );

  // â”€â”€â”€ Order Tracking Overlay (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const trackingOverlay = trackingOrder && overlayRoot && createPortal(
    <div className="fixed inset-0 pointer-events-auto" style={{ zIndex: 60 }}>
      <OrderTrackingScreen orderNumber={trackingOrder} onClose={() => setTrackingOrder(null)} />
    </div>,
    overlayRoot
  );

  // â”€â”€â”€ Order Detail Full-Screen Overlay (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const orderDetailOverlay = selectedOrder && overlayRoot && createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex flex-col pointer-events-auto"
        style={{ zIndex: 61 }}
        variants={modalOverlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        dir={direction}
      >
        {/* Gradient Header */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}>
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/[0.03] translate-y-1/3 -translate-x-1/4" />
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 430 35" preserveAspectRatio="none" style={{ height: 22 }}>
            <path d="M0 18 Q108 2 215 18 Q322 34 430 18 V35 H0 Z" fill={darkMode ? '#0B1120' : '#F4F7F9'} />
          </svg>
          <div className="relative z-10 px-4 pt-4 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/15"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                {isRtl ? <ArrowRight size={20} className="text-white" /> : <ArrowLeft size={20} className="text-white" />}
              </motion.button>
              <div className="flex-1">
                <h2 className="text-white text-lg font-bold">{t('mobile.profile.orderDetails')}</h2>
                <p className="text-white/60 text-xs mt-0.5" dir="ltr">#{selectedOrder.orderNumber?.slice(-8) || selectedOrder.id?.slice(-8)}</p>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${statusColors[selectedOrder.status]?.bg || 'bg-gray-100'} ${statusColors[selectedOrder.status]?.text || 'text-gray-600'}`}>
                {statusLabels[selectedOrder.status] || selectedOrder.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-6" style={{ background: darkMode ? '#0B1120' : '#F4F7F9' }}>
          <motion.div
            className="px-4 -mt-4 relative z-10 space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Status Timeline */}
            {selectedOrder.statusLog && selectedOrder.statusLog.length > 0 && (
              <motion.div
                variants={staggerItem}
                className="rounded-2xl p-4"
                style={{
                  background: darkMode ? COLORS.darkCard : '#fff',
                  border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
                  boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))' }}>
                    <Clock size={14} style={{ color: COLORS.teal }} />
                  </div>
                  {t('mobile.profile.statusTimeline')}
                </h3>
                <div className="space-y-0">
                  {selectedOrder.statusLog.map((log, i) => {
                    const isLast = i === (selectedOrder.statusLog?.length || 0) - 1;
                    const isCancelled = log.status === 'cancelled';
                    const dotColor = isCancelled ? COLORS.danger : (statusColors[log.status]?.dot || COLORS.teal);
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-1" style={{ background: dotColor, ['--tw-ring-color' as string]: `${dotColor}30`, ringOffsetColor: darkMode ? COLORS.darkCard : '#fff' } as React.CSSProperties} />
                          {!isLast && <div className="w-0.5 h-6" style={{ background: darkMode ? COLORS.darkBorder : '#E5E7EB' }} />}
                        </div>
                        <div className={isLast ? '' : 'pb-3'}>
                          <p className="text-xs font-bold" style={{ color: darkMode ? '#D1D5DB' : '#374151' }}>
                            {statusLabels[log.status] || log.status}
                          </p>
                          {log.note && <p className="text-[10px] mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>{log.note}</p>}
                          <p className="text-[10px] mt-0.5" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
                            {new Date(log.createdAt).toLocaleDateString(isRtl ? 'ar-LY' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Order Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <motion.div
                variants={staggerItem}
                className="rounded-2xl p-4"
                style={{
                  background: darkMode ? COLORS.darkCard : '#fff',
                  border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
                  boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.12))' }}>
                    <FileText size={14} style={{ color: COLORS.info }} />
                  </div>
                  {t('mobile.profile.orderItems')}
                </h3>
                <div className="space-y-2.5">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center p-2 rounded-xl" style={{ background: darkMode ? COLORS.darkSubtle : '#F4F7F9' }}>
                      {item.image ? (
                        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0" style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6' }}>
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,168,204,0.1), rgba(0,137,123,0.1))' }}>
                          <Package size={16} style={{ color: COLORS.teal }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: darkMode ? '#D1D5DB' : '#374151' }}>
                          {isRtl ? item.nameAr : item.nameEn}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                          {item.quantity} أ— {item.price.toFixed(2)} {t('product.currency')}
                        </p>
                      </div>
                      <p className="text-xs font-bold flex-shrink-0" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                        {(item.price * item.quantity).toFixed(2)}
                      </p>
                      {/* Rate button for delivered orders */}
                      {selectedOrder.status === 'delivered' && (
                        (() => {
                          const eligItem = orderReviewEligibility.find((e: any) => e.productId === (item.productId || item.id));
                          const hasReviewed = eligItem?.hasReviewed ?? false;
                          const existingRating = eligItem?.existingReview?.rating ?? 0;
                          if (hasReviewed) {
                            return (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} size={9} className={s <= existingRating ? 'fill-[#D4A843] text-[#D4A843]' : 'text-gray-300'} />
                                ))}
                                <span className="text-[8px] font-bold ms-1" style={{ color: COLORS.success }}>âœ“</span>
                              </div>
                            );
                          }
                          return (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const storeProducts = useMobileStore.getState().products;
                                const product = storeProducts.find((p: any) => p.id === (item.productId || item.id));
                                if (product) {
                                  setSelectedOrder(null);
                                  useMobileStore.getState().setSelectedProduct(product);
                                }
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold text-white flex-shrink-0"
                              style={{
                                background: 'linear-gradient(135deg, #D4A843, #E8C564)',
                                boxShadow: '0 2px 6px rgba(212,168,67,0.3)',
                              }}
                            >
                              <Star size={9} className="fill-white" />
                              {isRtl ? 'ظ‚ظٹظ‘ظ…' : 'Rate'}
                            </motion.button>
                          );
                        })()
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Order Summary */}
            <motion.div
              variants={staggerItem}
              className="rounded-2xl p-4"
              style={{
                background: darkMode ? COLORS.darkCard : '#fff',
                border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
                boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))' }}>
                  <Wallet size={14} style={{ color: COLORS.teal }} />
                </div>
                {isRtl ? 'ظ…ظ„ط®طµ ط§ظ„ط·ظ„ط¨' : 'Order Summary'}
              </h3>
              <div className="space-y-2">
                {selectedOrder.subtotal != null && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>{t('mobile.profile.subtotal')}</span>
                    <span className="font-medium" style={{ color: darkMode ? '#D1D5DB' : '#374151' }}>
                      {selectedOrder.subtotal.toFixed(2)} {t('product.currency')}
                    </span>
                  </div>
                )}
                {selectedOrder.deliveryFee != null && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>{t('mobile.profile.deliveryFee')}</span>
                    <span className="font-medium" style={{ color: darkMode ? '#D1D5DB' : '#374151' }}>
                      {selectedOrder.deliveryFee.toFixed(2)} {t('product.currency')}
                    </span>
                  </div>
                )}
                {selectedOrder.discount != null && selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>{t('mobile.profile.discount')}</span>
                    <span style={{ color: '#16A34A' }} className="font-medium">
                      -{selectedOrder.discount.toFixed(2)} {t('product.currency')}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between" style={{ borderColor: darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)' }}>
                  <span className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                    {t('mobile.profile.total')}
                  </span>
                  <span className="text-sm font-bold" style={{ color: '#4ADE80' }}>
                    {selectedOrder.total.toFixed(2)} {t('product.currency')}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Shipping Address */}
            {selectedOrder.address && (
              <motion.div
                variants={staggerItem}
                className="rounded-2xl p-4"
                style={{
                  background: darkMode ? COLORS.darkCard : '#fff',
                  border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
                  boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))' }}>
                    <MapPin size={14} className="text-red-500" />
                  </div>
                  {t('mobile.profile.shippingAddress')}
                </h3>
                <p className="text-xs leading-relaxed mt-1 px-3 py-2 rounded-xl" style={{ color: darkMode ? '#9CA3AF' : '#6B7280', background: darkMode ? COLORS.darkSubtle : '#F4F7F9' }}>
                  {selectedOrder.address.label && <span className="font-bold">{selectedOrder.address.label}: </span>}
                  {selectedOrder.address.address}{selectedOrder.address.area ? `, ${selectedOrder.address.area}` : ''}{selectedOrder.address.city ? `, ${selectedOrder.address.city}` : ''}
                </p>
              </motion.div>
            )}

            {/* Rate Your Purchase Banner for delivered orders */}
            {selectedOrder.status === 'delivered' && selectedOrder.items && selectedOrder.items.length > 0 && (
              <motion.div
                variants={staggerItem}
                className="rounded-2xl p-4 relative overflow-hidden"
                style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, #1A2540 0%, #1E2A42 100%)'
                    : 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  border: `1px solid ${darkMode ? '#D4A84330' : '#D4A84325'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #D4A843, #E8C564)',
                      boxShadow: '0 4px 12px rgba(212,168,67,0.35)',
                    }}
                  >
                    <Star size={18} className="text-white fill-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : '#92400E' }}>
                      {isRtl ? 'ظ‚ظٹظ‘ظ… ظ…ط´طھط±ظٹط§طھظƒ' : 'Rate Your Purchase'}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: darkMode ? '#9CA3AF' : '#A16207' }}>
                      {isRtl ? 'ط´ط§ط±ظƒظ†ط§ ط±ط£ظٹظƒ ظˆط§ط­طµظ„ ط¹ظ„ظ‰ 50 ظ†ظ‚ط·ط© ظˆظ„ط§ط،' : 'Share your opinion and earn 50 loyalty points'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md flex-shrink-0" style={{ background: darkMode ? '#D4A84315' : '#D4A84310' }}>
                    <Gift size={12} style={{ color: '#D4A843' }} />
                    <span className="text-[9px] font-bold" style={{ color: '#D4A843' }}>+50</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Track Order Button */}
            <motion.button
              variants={staggerItem}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTrackingOrder(selectedOrder.orderNumber)}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #004B63, #00897B)', boxShadow: '0 4px 16px rgba(0,75,99,0.3)' }}
            >
              <Truck size={18} />
              {isRtl ? 'طھطھط¨ط¹ ط§ظ„ط·ظ„ط¨' : 'Track Order'}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    overlayRoot
  );

  // â”€â”€â”€ Orders Full-Screen Overlay (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ordersOverlay = showOrders && overlayRoot && createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex flex-col pointer-events-auto"
        style={{ zIndex: 61 }}
        variants={modalOverlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        dir={direction}
      >
        {/* Gradient Header */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}>
          <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/[0.03] translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.1) 0%, transparent 70%)' }} />
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 430 35" preserveAspectRatio="none" style={{ height: 22 }}>
            <path d="M0 18 Q108 2 215 18 Q322 34 430 18 V35 H0 Z" fill={darkMode ? '#0B1120' : '#F4F7F9'} />
          </svg>
          <div className="relative z-10 px-4 pt-4 pb-8 flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setShowOrders(false)}
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/15"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {isRtl ? <ArrowRight size={20} className="text-white" /> : <ArrowLeft size={20} className="text-white" />}
            </motion.button>
            <div>
              <h2 className="text-white text-lg font-bold">{t('mobile.profile.myOrders')}</h2>
              <p className="text-white/60 text-xs mt-0.5">{isRtl ? `${orders.length} ط·ظ„ط¨` : `${orders.length} orders`}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-6" style={{ background: darkMode ? '#0B1120' : '#F4F7F9' }}>
          <div className="px-4 -mt-4 relative z-10">
            {orders.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center py-16"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.12) 0%, transparent 70%)', filter: 'blur(10px)' }} />
                  <div className="w-20 h-20 rounded-full flex items-center justify-center relative z-10" style={{ background: darkMode ? 'rgba(0,168,204,0.08)' : 'rgba(0,168,204,0.06)' }}>
                    <Package size={36} style={{ color: COLORS.teal }} />
                  </div>
                </div>
                <p className="text-sm font-semibold mt-4" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>{t('mobile.profile.noOrders')}</p>
                <p className="text-xs mt-1" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>{isRtl ? 'ط³طھط¸ظ‡ط± ط·ظ„ط¨ط§طھظƒ ظ‡ظ†ط§ ط¨ط¹ط¯ ط§ظ„ط´ط±ط§ط،' : 'Your orders will appear here after purchase'}</p>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-2.5"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {orders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    variants={staggerItem}
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-2xl cursor-pointer relative overflow-hidden"
                    style={{
                      background: darkMode ? COLORS.darkCard : '#fff',
                      border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
                      boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Status color accent bar */}
                    <div className="absolute top-0 right-0 w-1.5 h-full" style={{ background: statusColors[order.status]?.dot || COLORS.teal }} />
                    <div className="p-4 pr-6">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,168,204,0.1), rgba(0,137,123,0.1))' }}>
                            <Package size={16} style={{ color: COLORS.teal }} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold" style={{ color: darkMode ? COLORS.teal : COLORS.primary }} dir="ltr">
                              #{order.orderNumber?.slice(-8) || order.id?.slice(-8)}
                            </span>
                            <span className="block text-[10px] mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} dir="ltr">
                              {new Date(order.createdAt).toLocaleDateString(isRtl ? 'ar-LY' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${statusColors[order.status]?.bg || 'bg-gray-100'} ${statusColors[order.status]?.text || 'text-gray-600'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                            {order.total.toFixed(2)} {t('product.currency')}
                          </span>
                          {order.items && order.items.length > 0 && (
                            <span className="text-[10px] ms-2" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                              {order.items.length} {isRtl ? 'ظ…ظ†طھط¬' : 'items'}
                            </span>
                          )}
                        </div>
                        <ChevronLeft size={16} className={isRtl ? '' : 'rotate-180'} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    overlayRoot
  );

  // â”€â”€â”€ Logout Confirmation Modal (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const logoutModal = showLogoutModal && overlayRoot && createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center px-6 pointer-events-auto"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', zIndex: 62 }}
        variants={modalOverlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={() => setShowLogoutModal(false)}
        dir={direction}
      >
        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm rounded-2xl p-6 relative"
          style={{
            background: darkMode ? COLORS.darkCard : '#fff',
            border: `1px solid ${darkMode ? COLORS.darkBorder : COLORS.border}`,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          }}
        >
          {/* Close button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowLogoutModal(false)}
            className="absolute top-3 end-3 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6' }}
            aria-label={isRtl ? 'ط¥ط؛ظ„ط§ظ‚' : 'Close'}
          >
            <X size={16} style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }} />
          </motion.button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `${COLORS.danger}10` }}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring' as const, stiffness: 350, damping: 20 }}
            >
              <LogOut size={28} style={{ color: COLORS.danger }} />
            </motion.div>
          </div>

          {/* Title */}
          <h3 className="text-center text-lg font-bold mb-2" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
            {isRtl ? 'طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬' : 'Sign Out'}
          </h3>
          <p className="text-center text-sm mb-6" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
            {isRtl ? 'ظ‡ظ„ ط£ظ†طھ ظ…طھط£ظƒط¯ ظ…ظ† ط±ط؛ط¨طھظƒ ظپظٹ طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬طں' : 'Are you sure you want to sign out?'}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-3 rounded-xl text-sm font-bold"
              style={{
                background: darkMode ? COLORS.darkSubtle : COLORS.surface,
                color: darkMode ? '#E5E7EB' : COLORS.textPrimary,
                border: `1px solid ${darkMode ? COLORS.darkBorder : COLORS.border}`,
              }}
            >
              {isRtl ? 'ط¥ظ„ط؛ط§ط،' : 'Cancel'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setShowLogoutModal(false); onLogout(); }}
              className="flex-1 py-3 rounded-xl text-white text-sm font-bold"
              style={{ background: `linear-gradient(135deg, ${COLORS.danger}, #E85D50)` }}
            >
              {isRtl ? 'طھط£ظƒظٹط¯' : 'Confirm'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    overlayRoot
  );

  // â”€â”€â”€ Photo Action Sheet (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const photoSheetPortal = showPhotoSheet && overlayRoot && createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex flex-col pointer-events-auto"
        style={{ zIndex: 62 }}
        variants={modalOverlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        dir={direction}
      >
        {/* Gradient Header */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.1) 0%, transparent 70%)' }} />

          {/* Back button & Title */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 relative z-10">
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowPhotoSheet(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <ArrowRight size={18} className="text-white" />
            </motion.button>
            <h3 className="text-base font-bold text-white">
              {t('mobile.profile.changePhoto')}
            </h3>
            <div className="w-9" />
          </div>

          {/* Avatar Preview Area */}
          <div className="flex flex-col items-center pb-8 pt-2 relative z-10">
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute -inset-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.25) 0%, transparent 70%)', filter: 'blur(8px)' }} />
              {/* Animated rotating ring */}
              <motion.div
                className="absolute -inset-2 rounded-full"
                style={{ border: '1.5px dashed rgba(0,168,204,0.35)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }}
              />
              {/* Static outer ring */}
              <div className="absolute -inset-1 rounded-full" style={{ border: '2px solid rgba(0,168,204,0.3)', boxShadow: '0 0 20px rgba(0,168,204,0.15), inset 0 0 15px rgba(0,168,204,0.08)' }} />
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 20, delay: 0.1 }}
              >
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={user?.name || 'User'}
                    className="w-28 h-28 rounded-full object-cover relative z-10"
                    style={{ border: '3px solid rgba(0,168,204,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                  />
                ) : (
                  <div
                    className="w-28 h-28 rounded-full flex items-center justify-center text-white text-3xl font-bold relative z-10"
                    style={{ background: 'linear-gradient(135deg, #006B8A, #00897B)', border: '3px solid rgba(0,168,204,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                  >
                    {user?.name === 'ظ…ط¯ظٹط± ط§ظ„ظ†ط¸ط§ظ…' ? t('admin.systemAdmin').charAt(0) : user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </motion.div>
              {/* Camera badge */}
              <motion.div
                className="absolute -bottom-1 -right-1 z-20 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #004B63, #00897B)', border: '2.5px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.3 }}
              >
                <Camera size={14} className="text-white" />
              </motion.div>
            </div>
            {/* User name under avatar */}
            <motion.p
              className="text-white/80 text-sm font-medium mt-4"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {user?.name || (isRtl ? 'ظ…ط³طھط®ط¯ظ…' : 'User')}
            </motion.p>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col" style={{ background: darkMode ? '#0B1120' : '#F4F7F9' }}>
          {/* Section title */}
          <motion.div
            className="px-5 pt-5 pb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
              {isRtl ? 'ط®ظٹط§ط±ط§طھ ط§ظ„طµظˆط±ط©' : 'Photo Options'}
            </p>
          </motion.div>

          {/* Options cards */}
          <div className="px-4 space-y-2.5 flex-1">
            {/* Choose from gallery */}
            <motion.label
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer group relative overflow-hidden"
              style={{
                background: darkMode ? 'rgba(0,168,204,0.06)' : '#fff',
                border: `1px solid ${darkMode ? 'rgba(0,168,204,0.12)' : 'rgba(0,168,204,0.08)'}`,
                boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: 'spring' as const, stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))' }}>
                <ImageIcon size={22} style={{ color: COLORS.teal }} />
              </div>
              <div className="flex-1 text-start">
                <span className="block text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  {t('mobile.profile.chooseFromGallery')}
                </span>
                <span className="block text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                  {isRtl ? 'ط§ط®طھط± طµظˆط±ط© ظ…ظ† ظ…ط¹ط±ط¶ ط§ظ„طµظˆط±' : 'Pick from your photo library'}
                </span>
              </div>
              <ChevronLeft size={18} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoSelect(file);
                }}
              />
            </motion.label>

            {/* Take photo */}
            <motion.label
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer group relative overflow-hidden"
              style={{
                background: darkMode ? 'rgba(59,130,246,0.06)' : '#fff',
                border: `1px solid ${darkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)'}`,
                boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring' as const, stiffness: 300, damping: 25 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.12))' }}>
                <Camera size={22} style={{ color: COLORS.info }} />
              </div>
              <div className="flex-1 text-start">
                <span className="block text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  {t('mobile.profile.takePhoto')}
                </span>
                <span className="block text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                  {isRtl ? 'ط§ظ„طھظ‚ط· طµظˆط±ط© ط¬ط¯ظٹط¯ط© ط¨ط§ظ„ظƒط§ظ…ظٹط±ط§' : 'Capture a new photo with camera'}
                </span>
              </div>
              <ChevronLeft size={18} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoSelect(file);
                }}
              />
            </motion.label>

            {/* Remove photo */}
            {userPhoto && (
              <motion.button
                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl group relative overflow-hidden"
                style={{
                  background: darkMode ? 'rgba(239,68,68,0.06)' : '#fff',
                  border: `1px solid ${darkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'}`,
                  boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, type: 'spring' as const, stiffness: 300, damping: 25 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRemovePhoto}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))' }}>
                  <Trash2 size={22} style={{ color: COLORS.danger }} />
                </div>
                <div className="flex-1 text-start">
                  <span className="block text-sm font-bold" style={{ color: COLORS.danger }}>
                    {t('mobile.profile.removePhoto')}
                  </span>
                  <span className="block text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                    {isRtl ? 'ط¥ط²ط§ظ„ط© ط§ظ„طµظˆط±ط© ط§ظ„ط´ط®طµظٹط© ط§ظ„ط­ط§ظ„ظٹط©' : 'Remove your current profile photo'}
                  </span>
                </div>
                <ChevronLeft size={18} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
              </motion.button>
            )}
          </div>

          {/* Bottom tip */}
          <motion.div
            className="px-5 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: darkMode ? 'rgba(0,168,204,0.05)' : 'rgba(0,168,204,0.04)', border: `1px solid ${darkMode ? 'rgba(0,168,204,0.08)' : 'rgba(0,168,204,0.06)'}` }}>
              <Info size={14} style={{ color: COLORS.teal }} />
              <p className="text-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                {isRtl ? 'ط§ظ„طµظˆط±ط© ط§ظ„ظ…ط«ط§ظ„ظٹط©: ظ…ط±ط¨ط¹ط© 512أ—512 ط¨ظƒط³ظ„' : 'Best results: Square image, 512أ—512 px'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Uploading overlay */}
        <AnimatePresence>
          {photoUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-auto"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 63 }}
            >
              <motion.div
                className="flex flex-col items-center gap-4 p-8 rounded-3xl"
                style={{ background: darkMode ? 'rgba(13,17,23,0.9)' : 'rgba(255,255,255,0.95)', border: `1px solid ${darkMode ? 'rgba(0,168,204,0.15)' : 'rgba(0,168,204,0.1)'}`, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 350, damping: 25 }}
              >
                <div className="relative">
                  <div className="w-12 h-12 border-[3px] rounded-full animate-spin" style={{ borderColor: `${COLORS.teal}25`, borderTopColor: COLORS.teal }} />
                  <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: COLORS.teal }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  {t('mobile.profile.uploadingPhoto')}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>,
    overlayRoot
  );

  // â”€â”€â”€ Address Management Overlay (portal) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addressesOverlay = showAddresses && overlayRoot && createPortal(
    <div id="address-overlay-scroll" className="fixed inset-0 pointer-events-auto overflow-y-auto" style={{ zIndex: 60 }}>
      <AddressManagement
        onClose={() => setShowAddresses(false)}
        darkMode={darkMode}
        direction={direction}
        isRTL={isRtl}
        t={t}
      />
    </div>,
    overlayRoot
  );

  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
  // MAIN PROFILE VIEW
  // â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
  return (
    <>
    <div className="pb-4" dir={direction}>
      {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
          1. ENHANCED PROFILE HEADER
          â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #003545 0%, #004B63 35%, #006B8A 65%, #00897B 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 px-5 pt-10 pb-8">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Avatar with camera overlay */}
              <div className="relative">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={user.name || 'User'}
                    className="w-16 h-16 rounded-full object-cover ring-3 ring-white/20"
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ring-3 ring-white/20"
                    style={{ background: 'linear-gradient(135deg, #006B8A, #00897B)' }}
                  >
                    {user.name === 'ظ…ط¯ظٹط± ط§ظ„ظ†ط¸ط§ظ…' ? t('admin.systemAdmin').charAt(0) : user.name.charAt(0)}
                  </div>
                )}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowPhotoSheet(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
                  style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
                  aria-label={t('mobile.profile.changePhoto')}
                >
                  <Camera size={12} className="text-white" />
                </motion.button>
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-white text-lg font-bold truncate">{user.name === 'ظ…ط¯ظٹط± ط§ظ„ظ†ط¸ط§ظ…' ? t('admin.systemAdmin') : user.name}</h2>
                <p className="text-white/60 text-xs mt-0.5 truncate" dir="ltr">{user.phone.replace(/^\+218/, '0')}</p>
                {user.email && <p className="text-white/50 text-[10px] truncate">{user.email}</p>}
                {/* Loyalty badge - Real data from DB */}
                <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.25)' }}>
                  <Star size={10} style={{ color: COLORS.gold }} fill={COLORS.gold} />
                  <span className="text-[10px] font-semibold" style={{ color: COLORS.gold }}>
                    {loyaltyPoints} {isRtl ? 'ظ†ظ‚ط·ط©' : 'pts'}
                  </span>
                </div>
              </div>

              {/* Settings button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
                aria-label={t('mobile.profile.settings')}
              >
                <Settings size={16} className="text-white/70" />
              </motion.button>
            </div>
          ) : (
            /* Not logged in */
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center ring-3 ring-white/20"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <Heart size={28} className="text-white/40" />
              </div>
              <div className="flex-1">
                <h2 className="text-white text-lg font-bold">{t('mobile.profile.welcome')}</h2>
                <p className="text-white/60 text-xs mt-0.5">{t('mobile.profile.signInToEnjoy')}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onGoToLogin}
                className="px-4 py-2 rounded-xl text-white text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                {t('mobile.profile.signIn')}
              </motion.button>
            </div>
          )}

        </div>
      </div>

      {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
          2. COMPACT QUICK STATS (3 pills overlapping header)
          â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
      {user && (
        <div className="px-4 -mt-3 relative z-20">
          <div
            className="flex items-center justify-between rounded-2xl px-2 py-2"
            style={{
              background: darkMode
                ? 'rgba(22,27,34,0.85)'
                : 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(16px)',
              border: `1px solid ${darkMode ? 'rgba(48,54,61,0.6)' : 'rgba(0,75,99,0.08)'}`,
              boxShadow: darkMode
                ? '0 4px 16px rgba(0,0,0,0.3)'
                : '0 4px 16px rgba(0,75,99,0.08)',
            }}
          >
            {/* Orders */}
            <motion.button
              custom={0} variants={itemFadeIn} initial="hidden" animate="visible"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowOrders(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors flex-1 justify-center"
              style={{
                background: darkMode ? `${COLORS.info}12` : `${COLORS.info}08`,
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${COLORS.info}18` }}
              >
                <Package size={13} style={{ color: COLORS.info }} />
              </div>
              <div className="text-start min-w-0">
                <p className="text-sm font-bold leading-tight" style={{ color: darkMode ? COLORS.info : COLORS.primary }}>
                  {orders.length || 0}
                </p>
                <p className="text-[9px] leading-tight" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                  {isRtl ? 'ط§ظ„ط·ظ„ط¨ط§طھ' : 'Orders'}
                </p>
              </div>
            </motion.button>

            {/* Divider */}
            <div className="w-px h-8 mx-1 shrink-0" style={{ background: darkMode ? COLORS.darkBorder : '#E5E7EB' }} />

            {/* Favorites */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={() => useMobileStore.getState().setActiveTab('favorites')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-1 justify-center cursor-pointer"
              style={{
                background: darkMode ? `${COLORS.secondary}12` : `${COLORS.secondary}08`,
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${COLORS.secondary}18` }}
              >
                <Heart size={13} style={{ color: COLORS.secondary }} />
              </div>
              <div className="text-start min-w-0">
                <p className="text-sm font-bold leading-tight" style={{ color: COLORS.secondary }}>
                  {validFavoritesCount}
                </p>
                <p className="text-[9px] leading-tight" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                  {isRtl ? 'ط§ظ„ظ…ظپط¶ظ„ط©' : 'Favorites'}
                </p>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="w-px h-8 mx-1 shrink-0" style={{ background: darkMode ? COLORS.darkBorder : '#E5E7EB' }} />

            {/* Cart */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => useMobileStore.getState().setActiveTab('cart')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-1 justify-center cursor-pointer"
              style={{
                background: darkMode ? `${COLORS.teal}12` : `${COLORS.teal}08`,
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${COLORS.teal}18` }}
              >
                <ShoppingBag size={13} style={{ color: COLORS.teal }} />
              </div>
              <div className="text-start min-w-0">
                <p className="text-sm font-bold leading-tight" style={{ color: COLORS.teal }}>
                  {cartTotalItems}
                </p>
                <p className="text-[9px] leading-tight" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                  {isRtl ? 'ط§ظ„ط³ظ„ط©' : 'Cart'}
                </p>
              </div>
            </motion.button>
          </div>
        </div>
      )}

      <div className="px-4 mt-4 space-y-4">
        {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
            3. WALLET & POINTS SECTION
            â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring' as const, stiffness: 200, damping: 22 }}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #004B63, #006B8A, #00897B)' }}
          >
            {/* Decorative circle */}
            <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="absolute -bottom-4 -start-4 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-white/70" />
                  <span className="text-white/70 text-xs font-semibold">{isRtl ? 'ظ…ط­ظپط¸طھظٹ' : 'My Wallet'}</span>
                </div>
                <span className="text-white text-2xl font-bold">{walletBalance.toFixed(2)} <span className="text-xs font-normal text-white/50">{t('product.currency')}</span></span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Loyalty Points */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Award size={14} style={{ color: COLORS.gold }} />
                    <span className="text-white/70 text-[10px]">{isRtl ? 'ظ†ظ‚ط§ط· ط§ظ„ظˆظ„ط§ط،' : 'Loyalty Points'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-lg font-bold">{loyaltyPoints}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(212,168,67,0.2)', color: COLORS.gold }}>
                      {loyaltyTier === 'gold' ? (isRtl ? 'ط°ظ‡ط¨ظٹ' : 'Gold') : loyaltyTier === 'silver' ? (isRtl ? 'ظپط¶ظٹ' : 'Silver') : (isRtl ? 'ط¨ط±ظˆظ†ط²ظٹ' : 'Bronze')}
                    </span>
                  </div>
                </div>

                {/* Rewards */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Gift size={14} className="text-white/70" />
                    <span className="text-white/70 text-[10px]">{isRtl ? 'ط§ظ„ظ…ظƒط§ظپط¢طھ' : 'Rewards'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-lg font-bold">3</span>
                    <span className="text-white/50 text-[10px]">{isRtl ? 'ظ…طھط§ط­ط©' : 'available'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
            4. QUICK ACTIONS (4 round buttons)
            â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring' as const, stiffness: 200, damping: 22 }}
            className="grid grid-cols-4 gap-3"
          >
            {[
              { icon: <RefreshCw size={20} />, label: isRtl ? 'ط¥ط¹ط§ط¯ط© ط·ظ„ط¨' : 'Reorder', color: COLORS.info, bgColor: darkMode ? `${COLORS.info}15` : `${COLORS.info}10`, action: () => setShowOrders(true) },
              { icon: <Truck size={20} />, label: isRtl ? 'طھطھط¨ط¹ ط§ظ„ط·ظ„ط¨' : 'Track', color: COLORS.teal, bgColor: darkMode ? `${COLORS.teal}15` : `${COLORS.teal}10`, action: () => setShowOrders(true) },
              { icon: <Tag size={20} />, label: isRtl ? 'ظƒظˆط¨ظˆظ†ط§طھ' : 'Coupons', color: COLORS.secondary, bgColor: darkMode ? `${COLORS.secondary}15` : `${COLORS.secondary}10`, action: () => {} },
              { icon: <Headphones size={20} />, label: isRtl ? 'ط§ظ„ط¯ط¹ظ…' : 'Support', color: COLORS.purple, bgColor: darkMode ? `${COLORS.purple}15` : `${COLORS.purple}10`, action: () => {} },
            ].map((item, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={item.action}
                className="flex flex-col items-center gap-1.5 py-3"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: item.bgColor, border: `1px solid ${item.color}20` }}
                >
                  <span style={{ color: item.color }}>{item.icon}</span>
                </div>
                <span className="text-[10px] font-medium" style={{ color: darkMode ? '#D1D5DB' : COLORS.textSecondary }}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
            5. GROUPED MENU LISTS (3 sections)
            â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
        {user && (
          <div className="space-y-3">
            {/* â”€â”€â”€ My Account â”€â”€â”€ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200, damping: 22 }}
              className="rounded-2xl border overflow-hidden"
              style={{
                background: darkMode ? COLORS.darkCard : '#fff',
                borderColor: darkMode ? COLORS.darkBorder : COLORS.border,
              }}
            >
              <div className="px-4 py-2.5" style={{ background: darkMode ? `${COLORS.primary}15` : `${COLORS.primary}08`, borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : COLORS.border}` }}>
                <h3 className="text-xs font-bold" style={{ color: darkMode ? COLORS.info : COLORS.primary }}>
                  {isRtl ? 'ط­ط³ط§ط¨ظٹ' : 'My Account'}
                </h3>
              </div>
              {[
                { icon: <Package size={18} />, label: isRtl ? 'ط·ظ„ط¨ط§طھظٹ' : 'My Orders', color: COLORS.info, bgColor: `${COLORS.info}10`, action: () => setShowOrders(true), badge: orders.length > 0 ? String(orders.length) : undefined },
                { icon: <MapPin size={18} />, label: isRtl ? 'ط¹ظ†ط§ظˆظٹظ†ظٹ' : 'My Addresses', color: COLORS.secondary, bgColor: `${COLORS.secondary}10`, action: () => setShowAddresses(true) },
                { icon: <Heart size={18} />, label: isRtl ? 'ط§ظ„ظ…ظپط¶ظ„ط©' : 'Favorites', color: COLORS.secondary, bgColor: `${COLORS.secondary}10`, action: () => useMobileStore.getState().setActiveTab('favorites'), badge: validFavoritesCount > 0 ? String(validFavoritesCount) : undefined },
                { icon: <ShoppingBag size={18} />, label: isRtl ? 'ط§ظ„ط³ظ„ط©' : 'Cart', color: COLORS.teal, bgColor: `${COLORS.teal}10`, action: () => useMobileStore.getState().setActiveTab('cart'), badge: cartTotalItems > 0 ? String(cartTotalItems) : undefined },
              ].map((item, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
                  style={{ borderBottom: i < 3 ? `1px solid ${darkMode ? COLORS.darkBorder : '#F3F4F6'}` : 'none' }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ background: item.bgColor, color: item.color }}>
                    {item.icon}
                  </div>
                  <span className="flex-1 text-start text-sm font-medium" style={{ color: darkMode ? '#E5E7EB' : COLORS.textPrimary }}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${item.color}15`, color: item.color }}>
                      {item.badge}
                    </span>
                  )}
                  {isRtl ? <ChevronLeft size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} /> : <ChevronRight size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
                </motion.button>
              ))}
            </motion.div>

            {/* â”€â”€â”€ Settings â”€â”€â”€ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: 'spring' as const, stiffness: 200, damping: 22 }}
              className="rounded-2xl border overflow-hidden"
              style={{
                background: darkMode ? COLORS.darkCard : '#fff',
                borderColor: darkMode ? COLORS.darkBorder : COLORS.border,
              }}
            >
              <div className="px-4 py-2.5" style={{ background: darkMode ? `${COLORS.primary}15` : `${COLORS.primary}08`, borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : COLORS.border}` }}>
                <h3 className="text-xs font-bold" style={{ color: darkMode ? COLORS.info : COLORS.primary }}>
                  {isRtl ? 'ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ' : 'Settings'}
                </h3>
              </div>

              {/* Language */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="w-full flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : '#F3F4F6'}` }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.warning}10`, color: COLORS.warning }}>
                  <Globe size={18} />
                </div>
                <span className="flex-1 text-start text-sm font-medium" style={{ color: darkMode ? '#E5E7EB' : COLORS.textPrimary }}>
                  {t('mobile.language')}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: darkMode ? `${COLORS.warning}15` : `${COLORS.warning}10`, color: COLORS.warning }}>
                  {language === 'ar' ? 'ط§ظ„ط¹ط±ط¨ظٹط©' : 'English'}
                </span>
              </motion.button>

              {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
                  8. DARK MODE TOGGLE
                  â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : '#F3F4F6'}` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.purple}10`, color: COLORS.purple }}>
                  <Sparkles size={18} />
                </div>
                <span className="flex-1 text-start text-sm font-medium" style={{ color: darkMode ? '#E5E7EB' : COLORS.textPrimary }}>
                  {t('mobile.profile.darkMode')}
                </span>
                <button
                  onClick={handleDarkModeToggle}
                  className="relative w-12 h-7 rounded-full transition-colors duration-300"
                  style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, #004B63, #00897B)'
                      : darkMode ? '#374151' : '#D1D5DB',
                  }}
                  aria-label={t('mobile.profile.darkMode')}
                  role="switch"
                  aria-checked={darkMode}
                >
                  <motion.div
                    className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                    animate={{
                      left: darkMode ? 'auto' : '2px',
                      right: darkMode ? '2px' : 'auto',
                    }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Privacy */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPrivacy(true)}
                className="w-full flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : '#F3F4F6'}` }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.teal}10`, color: COLORS.teal }}>
                  <ShieldCheck size={18} />
                </div>
                <span className="flex-1 text-start text-sm font-medium" style={{ color: darkMode ? '#E5E7EB' : COLORS.textPrimary }}>
                  {isRtl ? 'ط§ظ„ط®طµظˆطµظٹط©' : 'Privacy'}
                </span>
                {isRtl ? <ChevronLeft size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} /> : <ChevronRight size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
              </motion.button>

              {/* Admin Dashboard Access */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => useUIStore.getState().toggleAdminMode()}
                className="w-full flex items-center gap-3 px-4 py-3"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.info}15`, color: COLORS.info }}>
                  <Sparkles size={18} />
                </div>
                <span className="flex-1 text-start text-sm font-medium" style={{ color: darkMode ? '#E5E7EB' : COLORS.textPrimary }}>
                  {isRtl ? 'ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…' : 'Admin Dashboard'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: `${COLORS.info}15`, color: COLORS.info }}>
                  {isRtl ? 'ظ…ط¯ظٹط±' : 'Admin'}
                </span>
              </motion.button>
            </motion.div>

            {/* â”€â”€â”€ Support â”€â”€â”€ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring' as const, stiffness: 200, damping: 22 }}
              className="rounded-2xl border overflow-hidden"
              style={{
                background: darkMode ? COLORS.darkCard : '#fff',
                borderColor: darkMode ? COLORS.darkBorder : COLORS.border,
              }}
            >
              <div className="px-4 py-2.5" style={{ background: darkMode ? `${COLORS.primary}15` : `${COLORS.primary}08`, borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : COLORS.border}` }}>
                <h3 className="text-xs font-bold" style={{ color: darkMode ? COLORS.info : COLORS.primary }}>
                  {isRtl ? 'ط§ظ„ط¯ط¹ظ…' : 'Support'}
                </h3>
              </div>
              {[
                { icon: <Headphones size={18} />, label: isRtl ? 'ظ…ط±ظƒط² ط§ظ„ظ…ط³ط§ط¹ط¯ط©' : 'Help Center', color: COLORS.info, bgColor: `${COLORS.info}10`, action: () => setShowHelp(true) },
                { icon: <Info size={18} />, label: isRtl ? 'ط­ظˆظ„ ط§ظ„طھط·ط¨ظٹظ‚' : 'About', color: COLORS.teal, bgColor: `${COLORS.teal}10`, action: () => setShowAbout(true) },
                { icon: <Share2 size={18} />, label: isRtl ? 'ظ…ط´ط§ط±ظƒط© ط§ظ„طھط·ط¨ظٹظ‚' : 'Share App', color: COLORS.purple, bgColor: `${COLORS.purple}10` },
                { icon: <Download size={18} />, label: isRtl ? 'طھط­ظ…ظٹظ„ ط§ظ„طھط·ط¨ظٹظ‚ APK' : 'Download App APK', color: COLORS.success, bgColor: `${COLORS.success}10`, action: () => { window.location.hash = 'download'; } },
                { icon: <Phone size={18} />, label: isRtl ? 'طھظˆط§طµظ„ ظ…ط¹ظ†ط§' : 'Contact Us', color: COLORS.secondary, bgColor: `${COLORS.secondary}10`, action: () => setShowContact(true) },
              ].map((item, i) => {
                const totalCount = 5;
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < totalCount - 1 ? `1px solid ${darkMode ? COLORS.darkBorder : '#F3F4F6'}` : 'none' }}
                    onClick={'action' in item && item.action ? item.action : undefined}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.bgColor, color: item.color }}>
                      {item.icon}
                    </div>
                    <span className="flex-1 text-start text-sm font-medium" style={{ color: darkMode ? '#E5E7EB' : COLORS.textPrimary }}>
                      {item.label}
                    </span>
                    {isRtl ? <ChevronLeft size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} /> : <ChevronRight size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
            6. EXPANDABLE ORDERS SECTION
            â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring' as const, stiffness: 200, damping: 22 }}
            className="rounded-2xl border overflow-hidden"
            style={{
              background: darkMode ? COLORS.darkCard : '#fff',
              borderColor: darkMode ? COLORS.darkBorder : COLORS.border,
            }}
          >
            <motion.button
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowOrdersExpand(!showOrdersExpand)}
              className="w-full flex items-center justify-between px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.info}10`, color: COLORS.info }}>
                  <Package size={18} />
                </div>
                <span className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  {isRtl ? 'ط¢ط®ط± ط§ظ„ط·ظ„ط¨ط§طھ' : 'Recent Orders'}
                </span>
              </div>
              <motion.div animate={{ rotate: showOrdersExpand ? (isRtl ? 90 : -90) : 0 }} transition={{ duration: 0.2 }}>
                {isRtl ? <ChevronLeft size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} /> : <ChevronRight size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {showOrdersExpand && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' as const }}
                  className="overflow-hidden"
                >
                  {orders.length === 0 ? (
                    <div className="px-4 pb-4 text-center">
                      <p className="text-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                        {t('mobile.profile.noOrders')}
                      </p>
                    </div>
                  ) : (
                    <div className="px-4 pb-3 space-y-2">
                      {orders.slice(0, 5).map((order, i) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer active:scale-[0.98] transition-transform"
                          style={{ background: darkMode ? COLORS.darkSubtle : COLORS.surface }}
                        >
                          {/* Status dot */}
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColors[order.status]?.dot || '#9CA3AF' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold truncate" style={{ color: darkMode ? COLORS.info : COLORS.primary }} dir="ltr">
                                {order.orderNumber}
                              </span>
                              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status]?.bg || 'bg-gray-100'} ${statusColors[order.status]?.text || 'text-gray-600'}`}>
                                {statusLabels[order.status] || order.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-bold" style={{ color: darkMode ? '#E5E7EB' : COLORS.textPrimary }}>
                                {order.total.toFixed(2)} {t('product.currency')}
                              </span>
                              <span className="text-[9px]" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} dir="ltr">
                                {new Date(order.createdAt).toLocaleDateString(isRtl ? 'ar-LY' : 'en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          {/* Track button */}
                          {(order.status === 'shipped' || order.status === 'processing') && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => { e.stopPropagation(); setTrackingOrder(order.orderNumber); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${COLORS.teal}15`, border: `1px solid ${COLORS.teal}25` }}
                            >
                              <Truck size={12} style={{ color: COLORS.teal }} />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                      {orders.length > 5 && (
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setShowOrders(true)}
                          className="w-full py-2 text-center text-xs font-semibold rounded-xl"
                          style={{ color: darkMode ? COLORS.info : COLORS.primary, background: darkMode ? `${COLORS.primary}10` : `${COLORS.primary}08` }}
                        >
                          {isRtl ? `ط¹ط±ط¶ ط§ظ„ظƒظ„ (${orders.length})` : `View All (${orders.length})`}
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
            9. INVITE FRIENDS CARD
            â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: 'spring' as const, stiffness: 200, damping: 22 }}
            className="relative rounded-2xl p-[2px] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FF6F61, #D4A843, #00897B, #00C4E8, #8B5CF6, #FF6F61)',
            }}
          >
            <div
              className="rounded-2xl p-4"
              style={{ background: darkMode ? COLORS.darkCard : '#fff' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FF6F61, #D4A843)' }}
                >
                  <Gift size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                    {isRtl ? 'ط§ط¯ط¹ظڈ ط£طµط¯ظ‚ط§ط،ظƒ' : 'Invite Friends'}
                  </h3>
                  <p className="text-xs" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                    {isRtl ? 'ظˆط§ط­طµظ„ ط¹ظ„ظ‰ 50 ظ†ظ‚ط·ط©' : 'Get 50 points'}
                  </p>
                </div>
              </div>
              <p className="text-xs mb-3 leading-relaxed" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                {isRtl
                  ? 'ط§ط¯ط¹ظڈ ط£طµط¯ظ‚ط§ط،ظƒ ظˆط§ط­طµظ„ ط¹ظ„ظ‰ 50 ظ†ظ‚ط·ط© ظ„ظƒظ„ طµط¯ظٹظ‚ ظٹط³ط¬ظ„ ظ…ظ† ط®ظ„ط§ظ„ ط±ط§ط¨ط·ظƒ'
                  : 'Invite your friends and get 50 points for each friend who signs up through your link'}
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyReferral}
                className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                style={{
                  background: copiedReferral
                    ? `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.success})`
                    : 'linear-gradient(135deg, #004B63, #00897B)',
                  color: '#fff',
                }}
              >
                <AnimatePresence mode="wait">
                  {copiedReferral ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={16} />
                      {isRtl ? 'طھظ… ط§ظ„ظ†ط³ط®!' : 'Copied!'}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2"
                    >
                      <Copy size={16} />
                      {isRtl ? 'ظ†ط³ط® ط±ط§ط¨ط· ط§ظ„ط¥ط­ط§ظ„ط©' : 'Copy Referral Link'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
            10. LOGOUT BUTTON
            â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */}
        {user && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring' as const, stiffness: 200, damping: 22 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
            style={{
              background: darkMode ? `${COLORS.danger}10` : `${COLORS.danger}08`,
              color: COLORS.danger,
              border: `1px solid ${darkMode ? `${COLORS.danger}20` : `${COLORS.danger}15`}`,
            }}
          >
            <LogOut size={16} />
            {t('mobile.profile.signOut')}
          </motion.button>
        )}

        {/* Not logged in - Login prompt */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {/* Dark mode toggle for non-logged users */}
            <div
              className="rounded-2xl border p-4 flex items-center justify-between"
              style={{
                background: darkMode ? COLORS.darkCard : '#fff',
                borderColor: darkMode ? COLORS.darkBorder : COLORS.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.purple}10`, color: COLORS.purple }}>
                  <Sparkles size={18} />
                </div>
                <span className="text-sm font-medium" style={{ color: darkMode ? '#E5E7EB' : COLORS.textPrimary }}>
                  {t('mobile.profile.darkMode')}
                </span>
              </div>
              <button
                onClick={handleDarkModeToggle}
                className="relative w-12 h-7 rounded-full transition-colors duration-300"
                style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, #004B63, #00897B)'
                    : '#D1D5DB',
                }}
                role="switch"
                aria-checked={darkMode}
                aria-label={t('mobile.profile.darkMode')}
              >
                <motion.div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                  animate={{
                    left: darkMode ? 'auto' : '2px',
                    right: darkMode ? '2px' : 'auto',
                  }}
                  transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Language toggle */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="w-full rounded-2xl border p-4 flex items-center gap-3"
              style={{
                background: darkMode ? COLORS.darkCard : '#fff',
                borderColor: darkMode ? COLORS.darkBorder : COLORS.border,
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${COLORS.warning}10`, color: COLORS.warning }}>
                <Globe size={18} />
              </div>
              <span className="flex-1 text-start text-sm font-medium" style={{ color: darkMode ? '#E5E7EB' : COLORS.textPrimary }}>
                {t('mobile.language')}
              </span>
              <span className="text-xs font-semibold" style={{ color: COLORS.warning }}>
                {language === 'ar' ? 'ط§ظ„ط¹ط±ط¨ظٹط©' : 'English'}
              </span>
            </motion.button>

            {/* Login CTA */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onGoToLogin}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.teal})` }}
            >
              <Sparkles size={16} />
              {t('mobile.profile.signIn')}
            </motion.button>
          </motion.div>
        )}

        {/* App version */}
        <div className="text-center mt-4 mb-2">
          <p className="text-[10px]" style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }}>
            {isRtl ? 'ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©' : 'Nabd Al-Madina'} v{APP_VERSION}
          </p>
        </div>
        </div>
      </div>

      {settingsOverlay}
      {privacyOverlay}
      {helpOverlay}
      {aboutOverlay}
      {contactOverlay}
      {trackingOverlay}
      {orderDetailOverlay}
      {ordersOverlay}
      {logoutModal}
      {photoSheetPortal}
      {addressesOverlay}
    </>
  );
}

