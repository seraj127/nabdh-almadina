'use client';

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import dynamic from 'next/dynamic';

import { Header } from '@/components/store/header';
import { Hero } from '@/components/store/hero';
import { ProductCatalog } from '@/components/store/product-catalog';
import { TrustFeatures } from '@/components/store/trust-features';
import { Testimonials } from '@/components/store/testimonials';
import { Footer } from '@/components/store/footer';
import { BackToTop } from '@/components/store/back-to-top';
import { ContactSection } from '@/components/store/contact-section';

// ─── Loading Skeleton for dynamically loaded pages ────
function PageLoadingSkeleton() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 rounded-full border-3 border-nabdh-primary/30 border-t-nabdh-primary animate-spin" />
        <p className="text-sm text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
}

// ─── Lazy load auth & other pages ────
const AuthLoginPage = dynamic(() => import('@/components/store/auth-login-page').then(m => ({ default: m.AuthLoginPage })), { ssr: false, loading: PageLoadingSkeleton });
const AuthRegisterPage = dynamic(() => import('@/components/store/auth-register-page').then(m => ({ default: m.AuthRegisterPage })), { ssr: false, loading: PageLoadingSkeleton });
const FavoritesPage = dynamic(() => import('@/components/store/favorites-page').then(m => ({ default: m.FavoritesPage })), { ssr: false, loading: PageLoadingSkeleton });
const UserProfilePage = dynamic(() => import('@/components/store/user-profile-page').then(m => ({ default: m.UserProfilePage })), { ssr: false, loading: PageLoadingSkeleton });
const DeliveryZonesPage = dynamic(() => import('@/components/store/delivery-zones-page').then(m => ({ default: m.DeliveryZonesPage })), { ssr: false, loading: PageLoadingSkeleton });
const CartPage = dynamic(() => import('@/components/store/cart-page').then(m => ({ default: m.CartPage })), { ssr: false, loading: PageLoadingSkeleton });
const CheckoutPage = dynamic(() => import('@/components/store/checkout-page').then(m => ({ default: m.CheckoutPage })), { ssr: false, loading: PageLoadingSkeleton });
const ProductDetailPage = dynamic(() => import('@/components/store/product-detail-page').then(m => ({ default: m.ProductDetailPage })), { ssr: false, loading: PageLoadingSkeleton });
const TermsPage = dynamic(() => import('@/components/store/policy-pages').then(m => ({ default: m.TermsPage })), { ssr: false, loading: PageLoadingSkeleton });
const PrivacyPage = dynamic(() => import('@/components/store/policy-pages').then(m => ({ default: m.PrivacyPage })), { ssr: false, loading: PageLoadingSkeleton });
const ReturnPolicyPage = dynamic(() => import('@/components/store/policy-pages').then(m => ({ default: m.ReturnPolicyPage })), { ssr: false, loading: PageLoadingSkeleton });
const OrderTrackingPage = dynamic(() => import('@/components/store/order-tracking-page').then(m => ({ default: m.OrderTrackingPage })), { ssr: false, loading: PageLoadingSkeleton });
const PointsRewardsPage = dynamic(() => import('@/components/store/points-rewards-page').then(m => ({ default: m.PointsRewardsPage })), { ssr: false, loading: PageLoadingSkeleton });
const SettingsPage = dynamic(() => import('@/components/store/settings-page').then(m => ({ default: m.SettingsPage })), { ssr: false, loading: PageLoadingSkeleton });
const ContactPage = dynamic(() => import('@/components/store/contact-page').then(m => ({ default: m.ContactPage })), { ssr: false, loading: PageLoadingSkeleton });
const SitemapPage = dynamic(() => import('@/components/store/sitemap-page').then(m => ({ default: m.SitemapPage })), { ssr: false, loading: PageLoadingSkeleton });
const DownloadsPage = dynamic(() => import('@/components/store/downloads-page').then(m => ({ default: m.DownloadsPage })), { ssr: false, loading: PageLoadingSkeleton });
const CategoryPage = dynamic(() => import('@/components/store/category-page').then(m => ({ default: m.CategoryPage })), { ssr: false, loading: PageLoadingSkeleton });

// ─── Lazy load overlay/dialog components (ONLY when needed) ────
// These are heavy (Radix Dialog/Sheet + framer-motion + many icons).
// They are conditionally rendered — only mounted after the user first opens them.
// This saves ~150-250KB from the initial JS bundle and eliminates unnecessary
// Portal creation, hook subscriptions, and store listeners on first paint.
const ChatWidget = dynamic(() => import('@/components/store/chat-widget').then(m => ({ default: m.ChatWidget })), { ssr: false });
const OrderTrackingDialog = dynamic(() => import('@/components/store/order-tracking-dialog').then(m => ({ default: m.OrderTrackingDialog })), { ssr: false });

// ─── Lazy load below-fold sections ────
// These sections are below the viewport on initial load and don't need to block the first paint.
const OffersSection = dynamic(() => import('@/components/store/offers-section').then(m => ({ default: m.OffersSection })), { ssr: false });
const FeaturedSection = dynamic(() => import('@/components/store/featured-section').then(m => ({ default: m.FeaturedSection })), { ssr: false });

export default function StoreView() {
  const direction = useLanguageStore((s) => s.direction);
  const { authView, isLoggedIn, isOrderTrackingOpen, selectedCategorySlug } = useUIStore(useShallow((s) => ({
    authView: s.authView,
    isLoggedIn: s.isLoggedIn,
    isOrderTrackingOpen: s.isOrderTrackingOpen,
    selectedCategorySlug: s.selectedCategorySlug,
  })));

  // ─── "Mount once" pattern for heavy overlay components ────
  // Only mount these after the user first opens them.
  // Once mounted, they stay mounted to preserve state and avoid re-mounting.
  const [chatWidgetMounted, setChatWidgetMounted] = useState(false);
  const [orderTrackingMounted, setOrderTrackingMounted] = useState(false);

  // Mount ChatWidget after a short delay (it has a floating button the user might click)
  useEffect(() => {
    const timer = setTimeout(() => setChatWidgetMounted(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Mount OrderTrackingDialog only when first opened
  useEffect(() => {
    if (isOrderTrackingOpen && !orderTrackingMounted) {
      setOrderTrackingMounted(true);
    }
  }, [isOrderTrackingOpen, orderTrackingMounted]);

  // Scroll to top when navigating to a different view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [authView]);

  // ─── Preload frequently-used pages after initial render (deferred) ────
  // Preload cart/checkout/favorites after 2s — early enough for quick navigation,
  // late enough to not compete with the critical rendering path.
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      import('@/components/store/cart-page');
      import('@/components/store/checkout-page');
      import('@/components/store/favorites-page');
    }, 2000);
    return () => clearTimeout(preloadTimer);
  }, []);

  // Protected views that require authentication — use useEffect to avoid setState during render
  useEffect(() => {
    const protectedViews = ['profile', 'checkout', 'points-rewards', 'settings'];
    if (protectedViews.includes(authView) && !isLoggedIn) {
      useUIStore.getState().setAuthView('login');
    }
  }, [authView, isLoggedIn]);

  // If on a protected view but not logged in, don't render the protected content
  const protectedViews = ['profile', 'checkout', 'points-rewards', 'settings'];
  if (protectedViews.includes(authView) && !isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" dir={direction}>
      <Header />
      <main id="main-content" className="flex-1 pt-16">
        {authView === 'login' ? (
          <AuthLoginPage />
        ) : authView === 'register' ? (
          <AuthRegisterPage />
        ) : authView === 'favorites' ? (
          <FavoritesPage />
        ) : authView === 'cart' ? (
          <CartPage />
        ) : authView === 'checkout' ? (
          <CheckoutPage />
        ) : authView === 'terms' ? (
          <TermsPage />
        ) : authView === 'privacy' ? (
          <PrivacyPage />
        ) : authView === 'returns' ? (
          <ReturnPolicyPage />
        ) : authView === 'profile' ? (
          <UserProfilePage />
        ) : authView === 'delivery-zones' ? (
          <DeliveryZonesPage />
        ) : authView === 'order-tracking' ? (
          <OrderTrackingPage />
        ) : authView === 'points-rewards' ? (
          <PointsRewardsPage />
        ) : authView === 'settings' ? (
          <SettingsPage />
        ) : authView === 'product-detail' ? (
          <ProductDetailPage />
        ) : authView === 'contact' ? (
          <ContactPage />
        ) : authView === 'sitemap' ? (
          <SitemapPage />
        ) : authView === 'downloads' ? (
          <DownloadsPage />
        ) : authView === 'category-page' ? (
          <CategoryPage key={selectedCategorySlug || 'category'} />
        ) : (
          <>
            <Hero />
            <section id="products" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
              <ProductCatalog />
            </section>
            <FeaturedSection />
            <TrustFeatures />
            <OffersSection />
            <Testimonials />
            <ContactSection />
          </>
        )}
      </main>
      <Footer />
      {/* Conditionally rendered overlays — only mount after first use */}
      {chatWidgetMounted && <ChatWidget />}
      {orderTrackingMounted && <OrderTrackingDialog />}
      <BackToTop />
    </div>
  );
}
