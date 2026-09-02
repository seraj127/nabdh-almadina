'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { APK_DOWNLOAD_URL } from '@/lib/api-bridge';
import {
  Globe,
  ShoppingCart,
  Menu,
  Shield,
  PackageSearch,
  X,
  User,
  LogOut,
  UserCircle,
  UserPlus,
  ChevronDown,
  Home,
  Package,
  Flame,
  PhoneCall,
  Sparkles,
  Heart,
  Headphones,
  MapPin,
  Settings,
  CreditCard,
  Gift,
  Star,
  ChevronLeft,
  Bell,
  Download,
  Sun,
  Moon,
  Monitor,
  AlertCircle,
  TreePine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useLanguageStore } from '@/stores/language-store';
import { useShallow } from 'zustand/react/shallow';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useFavoritesStore } from '@/stores/favorites-store';
import { ExpandableSearch } from '@/components/store/expandable-search';
import { ThemeToggle } from '@/components/store/theme-toggle';
import { NotificationBell } from '@/components/store/notification-bell';
import { useTheme } from 'next-themes';
import { syncThemeToServer } from '@/lib/theme-sync';

const navLinks = [
  { key: 'nav.home', href: '#home', icon: Home, color: 'text-nabdh-primary' },
  { key: 'nav.products', href: '#products', icon: Package, color: 'text-emerald-600' },
  { key: 'nav.offers', href: '#offers', icon: Flame, color: 'text-nabdh-secondary' },
  { key: 'nav.contact', href: '#contact', icon: PhoneCall, color: 'text-nabdh-accent', navigateTo: 'contact' as const },
];

const quickLinks = [
  { key: 'nav.featured', href: '#featured', icon: Sparkles, color: 'text-amber-500' },
  { key: 'nav.favorites', href: '#favorites', icon: Heart, color: 'text-pink-500' },
  { key: 'nav.support', href: '#support', icon: Headphones, color: 'text-blue-500' },
];

export function Header() {
  const { t, language, setLanguage, direction } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language, setLanguage: s.setLanguage, direction: s.direction })));
  const cartItems = useCartStore(useShallow((s) => s.items));
  const { toggleAdminMode, isAdminMode, isLoggedIn, currentUser, login, logout, authView } = useUIStore(useShallow((s) => ({ toggleAdminMode: s.toggleAdminMode, isAdminMode: s.isAdminMode, isLoggedIn: s.isLoggedIn, currentUser: s.currentUser, login: s.login, logout: s.logout, authView: s.authView })));
  const isAdminUser = currentUser?.role?.toLowerCase() === 'admin';
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileLogoutConfirm, setMobileLogoutConfirm] = useState(false);

  const cartCount = cartItems.length;
  const favCount = useFavoritesStore(useShallow((s) => s.favoriteIds.length));

  // Fetch real order count for logged-in users (deferred to not block initial paint)
  // Uses lightweight countOnly endpoint instead of fetching all orders
  useEffect(() => {
    if (!isLoggedIn || !currentUser?.id) {
      setOrderCount(0);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/orders?userId=${currentUser.id}&countOnly=true`)
        .then(r => r.json())
        .then(data => setOrderCount(data.count || 0))
        .catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, currentUser?.id]);
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset logout confirm when dropdowns close
  useEffect(() => {
    if (!isUserMenuOpen) setShowLogoutConfirm(false);
  }, [isUserMenuOpen]);
  useEffect(() => {
    if (!isMobileMenuOpen) setMobileLogoutConfirm(false);
  }, [isMobileMenuOpen]);

  const handleNavClick = (href: string, navigateToView?: string) => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (navigateToView) {
      useUIStore.getState().navigateTo(navigateToView as any);
      return;
    }
    if (authView !== 'none') {
      useUIStore.getState().clearAuthView();
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const openLoginPage = () => {
    setIsUserMenuOpen(false);
    useUIStore.getState().setAuthView('login');
  };

  const openRegisterPage = () => {
    setIsUserMenuOpen(false);
    useUIStore.getState().setAuthView('register');
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`fixed top-0 start-0 end-0 z-50 transition-[background,box-shadow,border-color,backdrop-filter] duration-500 ${
          authView !== 'none'
            ? 'glass shadow-lg shadow-nabdh-primary/5'
            : isScrolled
              ? 'glass shadow-lg shadow-nabdh-primary/5'
              : 'bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <motion.a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#home');
              }}
              className="flex items-center gap-2 shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full ring-2 ring-nabdh-primary/20 overflow-hidden">
                <img
                  src="/logo.png"
                  alt={t('hero.title')}
                  className="h-full w-full object-cover scale-[1.65] translate-y-[5px]"
                />
              </div>
              <span className="gradient-text text-xl sm:text-2xl font-bold tracking-tight">
                {t('hero.title')}
              </span>
            </motion.a>

            {/* Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1.5">
              {/* Expandable Search */}
              <ExpandableSearch />

              {/* Theme Toggle — direct access on header bar */}
              <ThemeToggle />

              {/* Unified Menu Button — combines user account + site navigation */}
              <DropdownMenu dir={direction} open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                <DropdownMenuTrigger
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-1.5 ${
                    isLoggedIn
                      ? 'bg-nabdh-primary/10 text-nabdh-primary hover:bg-nabdh-primary/20 px-2 sm:px-3 h-9'
                      : 'h-10 w-10 text-foreground/70 hover:text-nabdh-primary hover:bg-accent'
                  }`}
                >
                  {isLoggedIn && currentUser ? (
                    <>
                      <div className="size-7 rounded-full overflow-hidden shrink-0">
                        {currentUser.avatar ? (
                          <img src={currentUser.avatar} alt={currentUser.name} className="size-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.style.display='none'; const p = el.parentElement; if(p){ p.classList.add('nabdh-gradient','flex','items-center','justify-center'); const s = document.createElement('span'); s.className='text-white text-xs font-bold'; s.textContent=currentUser.name.charAt(0); p.appendChild(s); }}} />
                        ) : (
                          <div className="size-full nabdh-gradient flex items-center justify-center text-white text-xs font-bold">
                            {currentUser.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className={`hidden sm:inline text-sm font-semibold max-w-[80px] truncate transition-colors ${isScrolled ? 'text-foreground' : authView !== 'none' ? 'text-foreground' : 'text-white'}`}>
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <ChevronDown className="size-3.5 opacity-60" />
                    </>
                  ) : (
                    <User className="size-5" />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isRTL ? 'start' : 'end'}
                  className="w-72 p-0 max-h-[80vh] overflow-y-auto rounded-2xl border-border/50 shadow-xl shadow-nabdh-primary/10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-nabdh-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-nabdh-primary/40"
                >
                  {isLoggedIn && currentUser ? (
                    <>
                      {/* User Profile Card */}
                      <div className="relative px-4 pt-4 pb-3 nabdh-gradient">
                        <div className="absolute top-0 start-0 size-20 bg-white/5 rounded-full -translate-x-6 -translate-y-6" />
                        <div className="absolute bottom-0 end-0 size-16 bg-white/5 rounded-full translate-x-4 translate-y-4" />
                        <div className="relative flex items-center gap-3">
                          <div className="size-12 rounded-full overflow-hidden ring-2 ring-white/30 shrink-0">
                            {currentUser.avatar ? (
                              <img src={currentUser.avatar} alt={currentUser.name} className="size-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.style.display='none'; const p = el.parentElement; if(p){ p.classList.add('bg-white/10'); const fallbackImg = document.createElement('img'); fallbackImg.src='/logo.png'; fallbackImg.alt='Logo'; fallbackImg.className='size-full object-cover scale-[1.65] translate-y-[5px]'; p.appendChild(fallbackImg); }}} />
                            ) : (
                              <img
                                src="/logo.png"
                                alt={t('hero.title')}
                                className="size-full object-cover scale-[1.65] translate-y-[5px]"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-white truncate">{currentUser.name}</p>
                            <p className="text-[11px] text-white/70 truncate mt-0.5">{currentUser.phone}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="size-3 text-amber-300 fill-amber-300" />
                              <span className="text-[10px] text-white/80 font-medium">
                                {t('user.goldMember')}
                              </span>
                            </div>
                          </div>
                          <ChevronLeft className={`size-4 text-white/50 ${isRTL ? '' : 'rotate-180'}`} />
                        </div>
                      </div>

                      {/* Quick Stats — shown only for non-admin (store users) */}
                      {!isAdminUser && (
                        <div className="grid grid-cols-3 gap-px bg-border/30 mx-3 mt-3 rounded-xl overflow-hidden">
                          <div className="bg-background flex flex-col items-center py-2.5 px-1">
                            <span className="text-base font-bold text-nabdh-primary">{cartCount}</span>
                            <span className="text-[9px] text-muted-foreground mt-0.5">{t('user.inCart')}</span>
                          </div>
                          <div className="bg-background flex flex-col items-center py-2.5 px-1">
                            <span className="text-base font-bold text-nabdh-accent">{orderCount}</span>
                            <span className="text-[9px] text-muted-foreground mt-0.5">{t('user.orders')}</span>
                          </div>
                          <div className="bg-background flex flex-col items-center py-2.5 px-1">
                            <span className="text-base font-bold text-pink-500">{favCount}</span>
                            <span className="text-[9px] text-muted-foreground mt-0.5">{t('user.favorites')}</span>
                          </div>
                        </div>
                      )}

                      {/* Admin Panel Section — shown only for admin role */}
                      {isAdminUser && (
                        <>
                          <div className="px-3 mt-3">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
                              {isAr ? 'لوحة التحكم' : 'Admin Panel'}
                            </p>
                          </div>
                          <div className="px-2 py-1 space-y-0.5">
                            <DropdownMenuItem
                              className="cursor-pointer gap-3 px-3 py-2 rounded-xl"
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                if (!isAdminMode) toggleAdminMode();
                              }}
                            >
                              <div className="size-7 rounded-lg bg-cc-active/10 flex items-center justify-center">
                                <Shield className="size-3.5 text-cc-active" />
                              </div>
                              <span className="text-sm font-medium">
                                {isAr ? 'لوحة التحكم' : 'Control Panel'}
                              </span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="cursor-pointer gap-3 px-3 py-2 rounded-xl"
                              onClick={() => {
                                setIsUserMenuOpen(false);
                                if (!isAdminMode) toggleAdminMode();
                              }}
                            >
                              <div className="size-7 rounded-lg bg-cc-warning/10 flex items-center justify-center">
                                <Settings className="size-3.5 text-cc-warning" />
                              </div>
                              <span className="text-sm font-medium">
                                {isAr ? 'إعدادات النظام' : 'System Settings'}
                              </span>
                            </DropdownMenuItem>
                          </div>
                          <div className="mx-3 h-px bg-border/50" />
                        </>
                      )}

                      {/* Site Navigation Section — shown only for non-admin (store users) */}
                      {!isAdminUser && (
                        <>
                          <div className="px-3 mt-3">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
                              {t('nav.mainNavigation')}
                            </p>
                          </div>
                          <div className="px-2 py-1 space-y-0.5">
                            {navLinks.map((link) => {
                              const Icon = link.icon;
                              return (
                                <DropdownMenuItem
                                  key={link.key}
                                  className="cursor-pointer gap-3 px-3 py-2 rounded-xl"
                                  onClick={() => handleNavClick(link.href, (link as any).navigateTo)}
                                >
                                  <div className={`size-7 rounded-lg bg-muted/50 flex items-center justify-center ${link.color}`}>
                                    <Icon className="size-3.5" />
                                  </div>
                                  <span className="text-sm font-medium">{t(link.key)}</span>
                                </DropdownMenuItem>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {/* Account Items — shown only for non-admin (store users) */}
                      {!isAdminUser && (
                        <>
                          <div className="mx-3 h-px bg-border/50" />
                          <div className="px-3 pt-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
                              {isAr ? 'حسابي' : 'My Account'}
                            </p>
                          </div>
                          <div className="px-2 py-1 space-y-0.5">
                            <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2 rounded-xl" onClick={() => { setIsUserMenuOpen(false); useUIStore.getState().navigateTo('profile'); }}>
                              <div className="size-7 rounded-lg bg-nabdh-primary/10 flex items-center justify-center">
                                <UserCircle className="size-3.5 text-nabdh-primary" />
                              </div>
                              <span className="text-sm font-medium">{t('user.profile')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2 rounded-xl" onClick={() => { setIsUserMenuOpen(false); useUIStore.getState().navigateTo('cart'); }}>
                              <div className="size-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <ShoppingCart className="size-3.5 text-emerald-600" />
                              </div>
                              <span className="text-sm font-medium">{t('nav.shoppingCart')}</span>
                              {cartCount > 0 && (
                                <Badge className="ms-auto bg-nabdh-secondary text-white text-[10px] px-1.5 py-0 border-0 rounded-full">
                                  {cartCount}
                                </Badge>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2 rounded-xl" onClick={() => { setIsUserMenuOpen(false); useUIStore.getState().navigateTo('order-tracking'); }}>
                              <div className="size-7 rounded-lg bg-nabdh-accent/10 flex items-center justify-center">
                                <PackageSearch className="size-3.5 text-nabdh-accent" />
                              </div>
                              <span className="text-sm font-medium">{t('nav.trackOrder')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2 rounded-xl" onClick={() => { setIsUserMenuOpen(false); useUIStore.getState().navigateTo('favorites'); }}>
                              <div className="size-7 rounded-lg bg-pink-500/10 flex items-center justify-center relative">
                                <Heart className="size-3.5 text-pink-500" />
                                {favCount > 0 && (
                                  <span className="absolute -top-1 -end-1 min-w-3.5 h-3.5 flex items-center justify-center bg-pink-500 text-white text-[8px] font-bold rounded-full leading-none px-0.5">
                                    {favCount}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-medium">{t('nav.wishlist')}</span>
                              {favCount > 0 && (
                                <Badge className="ms-auto bg-pink-500/10 text-pink-500 text-[10px] px-1.5 py-0 border-0 rounded-full hover:bg-pink-500/20">
                                  {favCount}
                                </Badge>
                              )}
                            </DropdownMenuItem>
                          </div>
                        </>
                      )}

                      {/* Secondary Items — shown only for non-admin (store users) */}
                      {!isAdminUser && (
                        <>
                          <div className="mx-3 h-px bg-border/50" />
                          <div className="px-2 py-1 space-y-0.5">
                            <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2 rounded-xl" onClick={() => { setIsUserMenuOpen(false); useUIStore.getState().navigateTo('delivery-zones'); }}>
                              <div className="size-7 rounded-lg bg-muted/60 flex items-center justify-center">
                                <MapPin className="size-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm">{isAr ? 'مناطق التوصيل' : 'Delivery Zones'}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2 rounded-xl" onClick={() => { setIsUserMenuOpen(false); useUIStore.getState().navigateTo('points-rewards'); }}>
                              <div className="size-7 rounded-lg bg-muted/60 flex items-center justify-center">
                                <Gift className="size-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm">{t('nav.pointsRewards')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2 rounded-xl" onClick={() => { setIsUserMenuOpen(false); useUIStore.getState().navigateTo('settings'); }}>
                              <div className="size-7 rounded-lg bg-muted/60 flex items-center justify-center">
                                <Settings className="size-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm">{t('nav.settings')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2 rounded-xl" onClick={() => { setIsUserMenuOpen(false); useUIStore.getState().navigateTo('contact'); }}>
                              <div className="size-7 rounded-lg bg-muted/60 flex items-center justify-center">
                                <PhoneCall className="size-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm">{t('nav.contact')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="cursor-pointer gap-3 px-3 py-2 rounded-xl" onClick={() => { setIsUserMenuOpen(false); useUIStore.getState().navigateTo('sitemap'); }}>
                              <div className="size-7 rounded-lg bg-muted/60 flex items-center justify-center">
                                <TreePine className="size-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm">{t('sitemap.title')}</span>
                            </DropdownMenuItem>
                          </div>
                        </>
                      )}

                      <div className="mx-3 h-px bg-border/50" />

                      {/* Utilities: Language + Theme */}
                      <div className="px-3 py-2 space-y-3">
                        {/* Language Switcher */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-0.5">
                            {isAr ? 'اللغة' : 'Language'}
                          </p>
                          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
                            <button
                              onClick={() => { if (language !== 'ar') toggleLanguage(); }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                language === 'ar'
                                  ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/25 scale-[1.02]'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                              }`}
                            >
                              <span className="text-xs">🇱🇾</span>
                              <span>العربية</span>
                            </button>
                            <button
                              onClick={() => { if (language !== 'en') toggleLanguage(); }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                language === 'en'
                                  ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/25 scale-[1.02]'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                              }`}
                            >
                              <Globe className="size-3.5" />
                              <span>English</span>
                            </button>
                          </div>
                        </div>

                        {/* Theme Selector — 3-way with mini previews */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-0.5">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {isAr ? 'المظهر' : 'Appearance'}
                            </p>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full transition-colors duration-300 ${
                              theme === 'dark'
                                ? 'bg-indigo-500/15 text-indigo-400'
                                : theme === 'system'
                                  ? 'bg-nabdh-primary/15 text-nabdh-primary'
                                  : 'bg-amber-500/15 text-amber-600'
                            }`}>
                              {theme === 'dark' ? (isAr ? 'داكن' : 'Dark') : theme === 'system' ? (isAr ? 'تلقائي' : 'Auto') : (isAr ? 'فاتح' : 'Light')}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {/* Light */}
                            <button
                              onClick={() => { setTheme('light'); syncThemeToServer('light'); }}
                              className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-300 ${
                                theme === 'light'
                                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-sm'
                                  : 'border-transparent bg-muted/40 hover:bg-muted/60'
                              }`}
                            >
                              <div className={`w-full h-8 rounded-lg overflow-hidden transition-all duration-300 ${
                                theme === 'light' ? 'ring-1 ring-amber-300' : ''
                              }`} style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)' }}>
                                <div className="flex items-end gap-[2px] p-1 h-full">
                                  <div className="w-1.5 h-2 bg-amber-700/40 rounded-[1px]" />
                                  <div className="flex-1 h-3 bg-amber-700/30 rounded-[1px]" />
                                  <div className="w-1 h-1.5 bg-amber-700/20 rounded-[1px]" />
                                </div>
                              </div>
                              <Sun className={`size-3.5 transition-all duration-300 ${
                                theme === 'light' ? 'text-amber-500 scale-110' : 'text-muted-foreground group-hover:text-amber-400'
                              }`} />
                              <span className={`text-[10px] font-semibold transition-colors ${
                                theme === 'light' ? 'text-amber-700' : 'text-muted-foreground'
                              }`}>{isAr ? 'فاتح' : 'Light'}</span>
                              {theme === 'light' && (
                                <div className="absolute top-1 end-1 size-2 rounded-full bg-amber-400" />
                              )}
                            </button>
                            {/* System */}
                            <button
                              onClick={() => { setTheme('system'); syncThemeToServer('system'); }}
                              className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-300 ${
                                theme === 'system'
                                  ? 'border-nabdh-primary bg-nabdh-primary/5 shadow-sm'
                                  : 'border-transparent bg-muted/40 hover:bg-muted/60'
                              }`}
                            >
                              <div className={`w-full h-8 rounded-lg overflow-hidden transition-all duration-300 ${
                                theme === 'system' ? 'ring-1 ring-nabdh-primary/40' : ''
                              }`} style={{ background: 'linear-gradient(135deg, #F3F4F6 50%, #1F2937 50%)' }}>
                                <div className="flex items-end gap-[2px] p-1 h-full">
                                  <div className="w-1.5 h-2 bg-gray-500/40 rounded-[1px]" />
                                  <div className="flex-1 h-3 bg-gray-500/30 rounded-[1px]" />
                                </div>
                              </div>
                              <Monitor className={`size-3.5 transition-all duration-300 ${
                                theme === 'system' ? 'text-nabdh-primary scale-110' : 'text-muted-foreground group-hover:text-nabdh-primary'
                              }`} />
                              <span className={`text-[10px] font-semibold transition-colors ${
                                theme === 'system' ? 'text-nabdh-primary' : 'text-muted-foreground'
                              }`}>{isAr ? 'تلقائي' : 'Auto'}</span>
                              {theme === 'system' && (
                                <div className="absolute top-1 end-1 size-2 rounded-full bg-nabdh-primary" />
                              )}
                            </button>
                            {/* Dark */}
                            <button
                              onClick={() => { setTheme('dark'); syncThemeToServer('dark'); }}
                              className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-300 ${
                                theme === 'dark'
                                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 shadow-sm'
                                  : 'border-transparent bg-muted/40 hover:bg-muted/60'
                              }`}
                            >
                              <div className={`w-full h-8 rounded-lg overflow-hidden transition-all duration-300 ${
                                theme === 'dark' ? 'ring-1 ring-indigo-400/50' : ''
                              }`} style={{ background: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 50%, #0F172A 100%)' }}>
                                <div className="flex items-center justify-center h-full">
                                  <div className="size-2 rounded-full bg-indigo-300/60" />
                                </div>
                              </div>
                              <Moon className={`size-3.5 transition-all duration-300 ${
                                theme === 'dark' ? 'text-indigo-400 scale-110' : 'text-muted-foreground group-hover:text-indigo-400'
                              }`} />
                              <span className={`text-[10px] font-semibold transition-colors ${
                                theme === 'dark' ? 'text-indigo-400' : 'text-muted-foreground'
                              }`}>{isAr ? 'داكن' : 'Dark'}</span>
                              {theme === 'dark' && (
                                <div className="absolute top-1 end-1 size-2 rounded-full bg-indigo-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mx-3 h-px bg-border/50" />

                      {/* Logout Section */}
                      <div className="px-3 py-2">
                        {/* Logout Button — expandable confirmation */}
                        {!showLogoutConfirm ? (
                          <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 group"
                          >
                            <div className="size-7 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                              <LogOut className="size-3.5 text-red-500" />
                            </div>
                            <span className="text-sm font-medium">{t('auth.signOut')}</span>
                            <ChevronDown className="size-3 ms-auto opacity-40 group-hover:opacity-70 transition-opacity" />
                          </button>
                        ) : (
                          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 overflow-hidden">
                            {/* Confirm Header */}
                            <div className="px-3 pt-2.5 pb-2 flex items-center gap-2.5">
                              <div className="size-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                                <AlertCircle className="size-4 text-red-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-red-600 dark:text-red-400">{isAr ? 'تأكيد تسجيل الخروج' : 'Confirm Sign Out'}</p>
                                <p className="text-[10px] text-red-500/70 dark:text-red-400/60 mt-0.5 truncate">
                                  {isAr ? `سيتم تسجيل خروج ${currentUser.name.split(' ')[0]}` : `${currentUser.name.split(' ')[0]} will be signed out`}
                                </p>
                              </div>
                            </div>
                            {/* Confirm Actions */}
                            <div className="flex gap-1.5 px-2.5 pb-2.5">
                              <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-background text-foreground/70 hover:text-foreground border border-border/60 hover:border-border transition-all"
                              >
                                {isAr ? 'إلغاء' : 'Cancel'}
                              </button>
                              <button
                                onClick={() => {
                                  setIsUserMenuOpen(false);
                                  setShowLogoutConfirm(false);
                                  logout();
                                }}
                                className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-red-500 hover:bg-red-600 text-white transition-all flex items-center justify-center gap-1"
                              >
                                <LogOut className="size-3" />
                                {isAr ? 'خروج' : 'Sign Out'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Guest Welcome Card */}
                      <div className="relative px-4 pt-5 pb-4 bg-gradient-to-b from-nabdh-primary/5 to-transparent">
                        <div className="flex flex-col items-center text-center">
                          <div className="size-14 rounded-full overflow-hidden ring-2 ring-nabdh-primary/15 shadow-lg shadow-nabdh-primary/10 mb-2.5">
                            <img
                              src="/logo.png"
                              alt={t('hero.title')}
                              className="size-full object-cover scale-[1.65] translate-y-[5px]"
                            />
                          </div>
                          <p className="font-bold text-base">
                            {t('auth.welcome')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[200px]">
                            {t('auth.welcomeDesc')}
                          </p>
                        </div>
                      </div>

                      {/* Auth Buttons */}
                      <div className="px-3 pt-1 pb-2 space-y-2">
                        <button
                          onClick={openLoginPage}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl nabdh-gradient text-white font-medium text-sm hover:opacity-90 transition-opacity"
                        >
                          <User className="size-4" />
                          {t('auth.signIn')}
                        </button>
                        <button
                          onClick={openRegisterPage}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-nabdh-primary/20 text-nabdh-primary font-medium text-sm hover:bg-nabdh-primary/5 transition-colors"
                        >
                          <UserPlus className="size-4" />
                          {t('auth.createAccount')}
                        </button>
                      </div>

                      <div className="mx-3 h-px bg-border/50" />

                      {/* Site Navigation for Guests */}
                      <div className="px-3 pt-2">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">
                          {t('nav.mainNavigation')}
                        </p>
                      </div>
                      <div className="px-2 py-1 space-y-0.5">
                        {navLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <DropdownMenuItem
                              key={link.key}
                              className="cursor-pointer gap-3 px-3 py-2 rounded-xl"
                              onClick={() => handleNavClick(link.href, (link as any).navigateTo)}
                            >
                              <div className={`size-7 rounded-lg bg-muted/50 flex items-center justify-center ${link.color}`}>
                                <Icon className="size-3.5" />
                              </div>
                              <span className="text-sm font-medium">{t(link.key)}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>

                      <div className="mx-3 h-px bg-border/50" />

                      {/* Quick Links for Guests */}
                      <div className="px-2 py-1 space-y-0.5">
                        {quickLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <DropdownMenuItem
                              key={link.key}
                              className="cursor-pointer gap-3 px-3 py-2 rounded-xl"
                              onClick={() => handleNavClick(link.href, (link as any).navigateTo)}
                            >
                              <div className={`size-7 rounded-lg bg-muted/50 flex items-center justify-center ${link.color}`}>
                                <Icon className="size-3.5" />
                              </div>
                              <span className="text-sm font-medium">{t(link.key)}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>

                      <div className="mx-3 h-px bg-border/50" />

                      {/* Utilities: Language + Theme */}
                      <div className="px-3 py-2 space-y-3">
                        {/* Language Switcher */}
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-0.5">
                            {isAr ? 'اللغة' : 'Language'}
                          </p>
                          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
                            <button
                              onClick={() => { if (language !== 'ar') toggleLanguage(); }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                language === 'ar'
                                  ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/25 scale-[1.02]'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                              }`}
                            >
                              <span className="text-xs">🇱🇾</span>
                              <span>العربية</span>
                            </button>
                            <button
                              onClick={() => { if (language !== 'en') toggleLanguage(); }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                                language === 'en'
                                  ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/25 scale-[1.02]'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                              }`}
                            >
                              <Globe className="size-3.5" />
                              <span>English</span>
                            </button>
                          </div>
                        </div>

                        {/* Theme Selector — 3-way with mini previews */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between px-0.5">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {isAr ? 'المظهر' : 'Appearance'}
                            </p>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full transition-colors duration-300 ${
                              theme === 'dark'
                                ? 'bg-indigo-500/15 text-indigo-400'
                                : theme === 'system'
                                  ? 'bg-nabdh-primary/15 text-nabdh-primary'
                                  : 'bg-amber-500/15 text-amber-600'
                            }`}>
                              {theme === 'dark' ? (isAr ? 'داكن' : 'Dark') : theme === 'system' ? (isAr ? 'تلقائي' : 'Auto') : (isAr ? 'فاتح' : 'Light')}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {/* Light */}
                            <button
                              onClick={() => { setTheme('light'); syncThemeToServer('light'); }}
                              className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-300 ${
                                theme === 'light'
                                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-sm'
                                  : 'border-transparent bg-muted/40 hover:bg-muted/60'
                              }`}
                            >
                              <div className={`w-full h-8 rounded-lg overflow-hidden transition-all duration-300 ${
                                theme === 'light' ? 'ring-1 ring-amber-300' : ''
                              }`} style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)' }}>
                                <div className="flex items-end gap-[2px] p-1 h-full">
                                  <div className="w-1.5 h-2 bg-amber-700/40 rounded-[1px]" />
                                  <div className="flex-1 h-3 bg-amber-700/30 rounded-[1px]" />
                                  <div className="w-1 h-1.5 bg-amber-700/20 rounded-[1px]" />
                                </div>
                              </div>
                              <Sun className={`size-3.5 transition-all duration-300 ${
                                theme === 'light' ? 'text-amber-500 scale-110' : 'text-muted-foreground group-hover:text-amber-400'
                              }`} />
                              <span className={`text-[10px] font-semibold transition-colors ${
                                theme === 'light' ? 'text-amber-700' : 'text-muted-foreground'
                              }`}>{isAr ? 'فاتح' : 'Light'}</span>
                              {theme === 'light' && (
                                <div className="absolute top-1 end-1 size-2 rounded-full bg-amber-400" />
                              )}
                            </button>
                            {/* System */}
                            <button
                              onClick={() => { setTheme('system'); syncThemeToServer('system'); }}
                              className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-300 ${
                                theme === 'system'
                                  ? 'border-nabdh-primary bg-nabdh-primary/5 shadow-sm'
                                  : 'border-transparent bg-muted/40 hover:bg-muted/60'
                              }`}
                            >
                              <div className={`w-full h-8 rounded-lg overflow-hidden transition-all duration-300 ${
                                theme === 'system' ? 'ring-1 ring-nabdh-primary/40' : ''
                              }`} style={{ background: 'linear-gradient(135deg, #F3F4F6 50%, #1F2937 50%)' }}>
                                <div className="flex items-end gap-[2px] p-1 h-full">
                                  <div className="w-1.5 h-2 bg-gray-500/40 rounded-[1px]" />
                                  <div className="flex-1 h-3 bg-gray-500/30 rounded-[1px]" />
                                </div>
                              </div>
                              <Monitor className={`size-3.5 transition-all duration-300 ${
                                theme === 'system' ? 'text-nabdh-primary scale-110' : 'text-muted-foreground group-hover:text-nabdh-primary'
                              }`} />
                              <span className={`text-[10px] font-semibold transition-colors ${
                                theme === 'system' ? 'text-nabdh-primary' : 'text-muted-foreground'
                              }`}>{isAr ? 'تلقائي' : 'Auto'}</span>
                              {theme === 'system' && (
                                <div className="absolute top-1 end-1 size-2 rounded-full bg-nabdh-primary" />
                              )}
                            </button>
                            {/* Dark */}
                            <button
                              onClick={() => { setTheme('dark'); syncThemeToServer('dark'); }}
                              className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-300 ${
                                theme === 'dark'
                                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 shadow-sm'
                                  : 'border-transparent bg-muted/40 hover:bg-muted/60'
                              }`}
                            >
                              <div className={`w-full h-8 rounded-lg overflow-hidden transition-all duration-300 ${
                                theme === 'dark' ? 'ring-1 ring-indigo-400/50' : ''
                              }`} style={{ background: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 50%, #0F172A 100%)' }}>
                                <div className="flex items-center justify-center h-full">
                                  <div className="size-2 rounded-full bg-indigo-300/60" />
                                </div>
                              </div>
                              <Moon className={`size-3.5 transition-all duration-300 ${
                                theme === 'dark' ? 'text-indigo-400 scale-110' : 'text-muted-foreground group-hover:text-indigo-400'
                              }`} />
                              <span className={`text-[10px] font-semibold transition-colors ${
                                theme === 'dark' ? 'text-indigo-400' : 'text-muted-foreground'
                              }`}>{isAr ? 'داكن' : 'Dark'}</span>
                              {theme === 'dark' && (
                                <div className="absolute top-1 end-1 size-2 rounded-full bg-indigo-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mx-3 h-px bg-border/50" />

                      {/* Benefits */}
                      <div className="px-3 py-2.5 space-y-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                          {t('auth.accountBenefits')}
                        </p>
                        {[
                          { icon: ShoppingCart, text: t('benefit.smartCart'), color: 'text-emerald-600' },
                          { icon: PackageSearch, text: t('benefit.trackOrders'), color: 'text-nabdh-accent' },
                          { icon: Gift, text: t('benefit.rewards'), color: 'text-pink-500' },
                          { icon: Heart, text: t('benefit.favorites'), color: 'text-red-400' },
                        ].map((item, i) => {
                          const Icon = item.icon;
                          return (
                            <div key={i} className="flex items-center gap-2.5 px-2 py-1.5">
                              <div className="size-6 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                                <Icon className={`size-3 ${item.color}`} />
                              </div>
                              <span className="text-xs text-muted-foreground">{item.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notification Bell - Only visible for store users (not admin) */}
              {isLoggedIn && currentUser && !isAdminUser && (
                <NotificationBell isAr={isAr} isRTL={isRTL} userId={currentUser.id} />
              )}

              {/* Cart — onMouseEnter preloads the cart page chunk for instant navigation */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => useUIStore.getState().navigateTo('cart')}
                onMouseEnter={() => { import('@/components/store/cart-page'); }}
                aria-label={t('nav.cart')}
                className="relative text-foreground/70 hover:text-nabdh-primary"
              >
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <Badge
                    className="absolute -top-1 -end-1 size-5 p-0 flex items-center justify-center bg-nabdh-secondary text-white text-[10px] font-bold border-0"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>

              {/* Favorites Heart with count badge */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => useUIStore.getState().navigateTo('favorites')}
                aria-label={t('nav.wishlist')}
                className="relative text-foreground/70 hover:text-pink-500"
              >
                <Heart className="size-5" />
                {favCount > 0 && (
                  <Badge
                    className="absolute -top-1 -end-1 min-w-5 h-5 p-0 flex items-center justify-center bg-pink-500 text-white text-[10px] font-bold border-0"
                  >
                    {favCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
                className="md:hidden text-foreground/70 hover:text-nabdh-primary"
              >
                <Menu className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Sheet Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent
          side={isRTL ? 'right' : 'left'}
          className="w-[300px] sm:w-[340px]"
        >
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 start-0">
              <div className="h-9 w-9 rounded-full ring-2 ring-nabdh-primary/20 overflow-hidden">
                <img
                  src="/logo.png"
                  alt={t('hero.title')}
                  className="h-full w-full object-cover scale-[1.65] translate-y-[5px]"
                />
              </div>
              <span className="gradient-text text-xl font-bold">{t('hero.title')}</span>
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 mt-4 space-y-1">
            {/* Main Navigation Section */}
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              {t('nav.mainNavigation')}
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.key}
                  onClick={() => handleNavClick(link.href, (link as any).navigateTo)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className={`size-9 rounded-lg bg-muted/60 flex items-center justify-center ${link.color}`}>
                    <Icon className="size-4.5" />
                  </div>
                  {t(link.key)}
                </button>
              );
            })}

            {/* Quick Links Section */}
            <div className="my-3 h-px bg-border" />
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              {t('nav.quickLinks')}
            </p>
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.key}
                  onClick={() => handleNavClick(link.href, (link as any).navigateTo)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className={`size-9 rounded-lg bg-muted/60 flex items-center justify-center ${link.color}`}>
                    <Icon className="size-4.5" />
                  </div>
                  {t(link.key)}
                </button>
              );
            })}

            {/* Contact & Sitemap */}
            <button
              onClick={() => { setIsMobileMenuOpen(false); useUIStore.getState().navigateTo('contact'); }}
              className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
            >
              <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center text-nabdh-accent">
                <PhoneCall className="size-4.5" />
              </div>
              {t('nav.contact')}
            </button>

            <button
              onClick={() => { setIsMobileMenuOpen(false); useUIStore.getState().navigateTo('sitemap'); }}
              className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
            >
              <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center text-nabdh-accent">
                <TreePine className="size-4.5" />
              </div>
              {t('sitemap.title')}
            </button>

            <div className="my-3 h-px bg-border" />

            {/* Download App Section */}
            <a
              href={APK_DOWNLOAD_URL}
              download="nabd-al-madina.apk"
              className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-white hover:text-white bg-nabdh-primary hover:bg-nabdh-primary/90 rounded-xl transition-all"
            >
              <div className="size-9 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <Download className="size-4.5" />
              </div>
              {t('nav.downloadApp')}
            </a>

            <div className="my-3 h-px bg-border" />

            {/* Utilities: Language + Theme */}
            <div className="space-y-3">
              {/* Language Switcher */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  {isAr ? 'اللغة' : 'Language'}
                </p>
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
                  <button
                    onClick={() => { if (language !== 'ar') toggleLanguage(); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      language === 'ar'
                        ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                    }`}
                  >
                    <span className="text-xs">🇱🇾</span>
                    <span>العربية</span>
                  </button>
                  <button
                    onClick={() => { if (language !== 'en') toggleLanguage(); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      language === 'en'
                        ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/25'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                    }`}
                  >
                    <Globe className="size-4" />
                    <span>English</span>
                  </button>
                </div>
              </div>

              {/* Theme Selector — 3-way with mini previews */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {isAr ? 'المظهر' : 'Appearance'}
                  </p>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : theme === 'system'
                        ? 'bg-nabdh-primary/15 text-nabdh-primary'
                        : 'bg-amber-500/15 text-amber-600'
                  }`}>
                    {theme === 'dark' ? (isAr ? 'داكن' : 'Dark') : theme === 'system' ? (isAr ? 'تلقائي' : 'Auto') : (isAr ? 'فاتح' : 'Light')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {/* Light */}
                  <button
                    onClick={() => { setTheme('light'); syncThemeToServer('light'); }}
                    className={`group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-300 ${
                      theme === 'light'
                        ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-sm'
                        : 'border-transparent bg-muted/40 hover:bg-muted/60'
                    }`}
                  >
                    <div className={`w-full h-10 rounded-lg overflow-hidden transition-all duration-300 ${
                      theme === 'light' ? 'ring-1 ring-amber-300' : ''
                    }`} style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)' }}>
                      <div className="flex items-end gap-[2px] p-1.5 h-full">
                        <div className="w-2 h-3 bg-amber-700/40 rounded-sm" />
                        <div className="flex-1 h-4 bg-amber-700/30 rounded-sm" />
                        <div className="w-1.5 h-2 bg-amber-700/20 rounded-sm" />
                      </div>
                    </div>
                    <Sun className={`size-4 transition-all duration-300 ${
                      theme === 'light' ? 'text-amber-500 scale-110' : 'text-muted-foreground group-hover:text-amber-400'
                    }`} />
                    <span className={`text-[11px] font-semibold transition-colors ${
                      theme === 'light' ? 'text-amber-700' : 'text-muted-foreground'
                    }`}>{isAr ? 'فاتح' : 'Light'}</span>
                    {theme === 'light' && (
                      <div className="absolute top-1.5 end-1.5 size-2.5 rounded-full bg-amber-400" />
                    )}
                  </button>
                  {/* System */}
                  <button
                    onClick={() => { setTheme('system'); syncThemeToServer('system'); }}
                    className={`group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-300 ${
                      theme === 'system'
                        ? 'border-nabdh-primary bg-nabdh-primary/5 shadow-sm'
                        : 'border-transparent bg-muted/40 hover:bg-muted/60'
                    }`}
                  >
                    <div className={`w-full h-10 rounded-lg overflow-hidden transition-all duration-300 ${
                      theme === 'system' ? 'ring-1 ring-nabdh-primary/40' : ''
                    }`} style={{ background: 'linear-gradient(135deg, #F3F4F6 50%, #1F2937 50%)' }}>
                      <div className="flex items-end gap-[2px] p-1.5 h-full">
                        <div className="w-2 h-3 bg-gray-500/40 rounded-sm" />
                        <div className="flex-1 h-4 bg-gray-500/30 rounded-sm" />
                      </div>
                    </div>
                    <Monitor className={`size-4 transition-all duration-300 ${
                      theme === 'system' ? 'text-nabdh-primary scale-110' : 'text-muted-foreground group-hover:text-nabdh-primary'
                    }`} />
                    <span className={`text-[11px] font-semibold transition-colors ${
                      theme === 'system' ? 'text-nabdh-primary' : 'text-muted-foreground'
                    }`}>{isAr ? 'تلقائي' : 'Auto'}</span>
                    {theme === 'system' && (
                      <div className="absolute top-1.5 end-1.5 size-2.5 rounded-full bg-nabdh-primary" />
                    )}
                  </button>
                  {/* Dark */}
                  <button
                    onClick={() => { setTheme('dark'); syncThemeToServer('dark'); }}
                    className={`group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 shadow-sm'
                        : 'border-transparent bg-muted/40 hover:bg-muted/60'
                    }`}
                  >
                    <div className={`w-full h-10 rounded-lg overflow-hidden transition-all duration-300 ${
                      theme === 'dark' ? 'ring-1 ring-indigo-400/50' : ''
                    }`} style={{ background: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 50%, #0F172A 100%)' }}>
                      <div className="flex items-center justify-center h-full">
                        <div className="size-2.5 rounded-full bg-indigo-300/60" />
                      </div>
                    </div>
                    <Moon className={`size-4 transition-all duration-300 ${
                      theme === 'dark' ? 'text-indigo-400 scale-110' : 'text-muted-foreground group-hover:text-indigo-400'
                    }`} />
                    <span className={`text-[11px] font-semibold transition-colors ${
                      theme === 'dark' ? 'text-indigo-400' : 'text-muted-foreground'
                    }`}>{isAr ? 'داكن' : 'Dark'}</span>
                    {theme === 'dark' && (
                      <div className="absolute top-1.5 end-1.5 size-2.5 rounded-full bg-indigo-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="my-3 h-px bg-border" />

            {/* User Account Section */}
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              {t('nav.account')}
            </p>
            {isLoggedIn && currentUser ? (
              <>
                {/* User info card */}
                <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-nabdh-primary/5 border border-nabdh-primary/10">
                  <div className="size-10 rounded-full overflow-hidden shrink-0">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="size-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.style.display='none'; const p = el.parentElement; if(p){ p.classList.add('nabdh-gradient','flex','items-center','justify-center'); const s = document.createElement('span'); s.className='text-white font-bold text-lg'; s.textContent=currentUser.name.charAt(0); p.appendChild(s); }}} />
                    ) : (
                      <div className="size-full nabdh-gradient flex items-center justify-center text-white font-bold text-lg">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.phone}</p>
                  </div>
                </div>

                {/* Cart */}
                <button
                  onClick={() => {
                    useUIStore.getState().navigateTo('cart');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center text-nabdh-primary">
                    <ShoppingCart className="size-4.5" />
                  </div>
                  {t('nav.shoppingCart')}
                  {cartCount > 0 && (
                    <Badge className="ms-auto bg-nabdh-secondary text-white text-[10px] px-1.5 py-0 border-0">
                      {cartCount}
                    </Badge>
                  )}
                </button>

                {/* Order Tracking */}
                <button
                  onClick={() => {
                    useUIStore.getState().navigateTo('order-tracking');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center text-nabdh-accent">
                    <PackageSearch className="size-4.5" />
                  </div>
                  {t('nav.trackOrder')}
                </button>

                {/* Profile */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); useUIStore.getState().navigateTo('profile'); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center text-emerald-600">
                    <UserCircle className="size-4.5" />
                  </div>
                  {t('user.profile')}
                </button>

                {/* Favorites */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); useUIStore.getState().navigateTo('favorites'); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center text-pink-500 relative">
                    <Heart className="size-4.5" />
                    {favCount > 0 && (
                      <span className="absolute -top-1 -end-1 min-w-4 h-4 flex items-center justify-center bg-pink-500 text-white text-[8px] font-bold rounded-full leading-none px-0.5">
                        {favCount}
                      </span>
                    )}
                  </div>
                  {t('nav.wishlist')}
                  {favCount > 0 && (
                    <Badge className="ms-auto bg-pink-500/10 text-pink-500 text-[10px] px-1.5 py-0 border-0 rounded-full">
                      {favCount}
                    </Badge>
                  )}
                </button>

                {/* Delivery Zones */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); useUIStore.getState().navigateTo('delivery-zones'); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center text-nabdh-accent">
                    <MapPin className="size-4.5" />
                  </div>
                  {isAr ? 'مناطق التوصيل' : 'Delivery Zones'}
                </button>

                {/* Contact Us */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); useUIStore.getState().navigateTo('contact'); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center text-nabdh-accent">
                    <PhoneCall className="size-4.5" />
                  </div>
                  {t('nav.contact')}
                </button>

                {/* Sitemap */}
                <button
                  onClick={() => { setIsMobileMenuOpen(false); useUIStore.getState().navigateTo('sitemap'); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-foreground/80 hover:text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className="size-9 rounded-lg bg-muted/60 flex items-center justify-center text-nabdh-accent">
                    <TreePine className="size-4.5" />
                  </div>
                  {t('sitemap.title')}
                </button>

                <div className="my-3 h-px bg-border" />

                {/* Logout Section */}
                {!mobileLogoutConfirm ? (
                  <button
                    onClick={() => setMobileLogoutConfirm(true)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all group"
                  >
                    <div className="size-9 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <LogOut className="size-4.5" />
                    </div>
                    {t('auth.signOut')}
                    <ChevronDown className="size-3.5 ms-auto opacity-40 group-hover:opacity-70 transition-opacity" />
                  </button>
                ) : (
                  <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 overflow-hidden">
                    <div className="px-3 pt-3 pb-2 flex items-center gap-2.5">
                      <div className="size-9 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                        <AlertCircle className="size-4.5 text-red-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">{isAr ? 'تأكيد تسجيل الخروج' : 'Confirm Sign Out'}</p>
                        <p className="text-[11px] text-red-500/70 dark:text-red-400/60 mt-0.5 truncate">
                          {currentUser ? (isAr ? `سيتم تسجيل خروج ${currentUser.name.split(' ')[0]}` : `${currentUser.name.split(' ')[0]} will be signed out`) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 px-3 pb-3">
                      <button
                        onClick={() => setMobileLogoutConfirm(false)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold bg-background text-foreground/70 hover:text-foreground border border-border/60 hover:border-border transition-all"
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                          setMobileLogoutConfirm(false);
                        }}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <LogOut className="size-3.5" />
                        {isAr ? 'خروج' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={() => {
                    openLoginPage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-nabdh-primary hover:bg-nabdh-primary/5 rounded-xl transition-all"
                >
                  <div className="size-9 rounded-lg bg-nabdh-primary/10 flex items-center justify-center text-nabdh-primary">
                    <User className="size-4.5" />
                  </div>
                  {t('auth.signIn')}
                </button>

                {/* Register Button */}
                <button
                  onClick={() => {
                    openRegisterPage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-base font-medium text-nabdh-accent hover:bg-nabdh-accent/5 rounded-xl transition-all"
                >
                  <div className="size-9 rounded-lg bg-nabdh-accent/10 flex items-center justify-center text-nabdh-accent">
                    <UserPlus className="size-4.5" />
                  </div>
                  {t('auth.createAccount')}
                </button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
