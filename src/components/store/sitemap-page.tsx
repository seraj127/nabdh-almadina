'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  Package,
  Sparkles,
  Phone,
  User,
  Heart,
  ShoppingCart,
  CreditCard,
  MapPin,
  Star,
  Settings,
  FileText,
  Shield,
  RotateCcw,
  Headphones,
  MessageCircle,
  Search,
  TreePine,
  ChevronLeft,
  ExternalLink,
  LayoutGrid,
  Clock,
  Hash,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';

// ─── Sitemap Section Type ─────────────────────────────────────────
interface SitemapLink {
  labelKey: string;
  labelAr?: string;
  labelEn?: string;
  icon: React.ElementType;
  view?: string;
  href?: string;
  descriptionKey?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  badge?: string;
  badgeKey?: string;
  color: string;
}

interface SitemapSection {
  titleKey: string;
  icon: React.ElementType;
  color: string;
  links: SitemapLink[];
}

// ─── Sitemap Data ─────────────────────────────────────────────────
const sitemapData: SitemapSection[] = [
  {
    titleKey: 'sitemap.mainPages',
    icon: Home,
    color: 'from-nabdh-primary to-teal-600',
    links: [
      { labelKey: 'nav.home', icon: Home, view: 'none', descriptionAr: 'الصفحة الرئيسية للمتجر', descriptionEn: 'Store homepage', color: 'text-nabdh-primary' },
      { labelKey: 'nav.products', icon: Package, view: 'none', descriptionAr: 'تصفح جميع المنتجات', descriptionEn: 'Browse all products', color: 'text-nabdh-primary' },
      { labelKey: 'nav.offers', icon: Sparkles, view: 'none', descriptionAr: 'العروض والتخفيضات', descriptionEn: 'Deals and discounts', color: 'text-amber-500' },
      { labelKey: 'nav.contact', icon: Phone, view: 'contact', descriptionAr: 'تواصل معنا', descriptionEn: 'Get in touch', color: 'text-emerald-500' },
    ],
  },
  {
    titleKey: 'sitemap.shopping',
    icon: ShoppingCart,
    color: 'from-emerald-500 to-green-600',
    links: [
      { labelKey: 'nav.cart', icon: ShoppingCart, view: 'cart', descriptionAr: 'سلة التسوق الخاصة بك', descriptionEn: 'Your shopping cart', color: 'text-emerald-500' },
      { labelKey: 'checkout.title', icon: CreditCard, view: 'checkout', descriptionAr: 'إتمام عملية الشراء', descriptionEn: 'Complete your purchase', color: 'text-emerald-500' },
      { labelKey: 'favorites.title', icon: Heart, view: 'favorites', descriptionAr: 'المنتجات المفضلة لديك', descriptionEn: 'Your favorite products', color: 'text-pink-500' },
      { labelKey: 'delivery.zoneInfo', icon: MapPin, view: 'delivery-zones', descriptionAr: 'مناطق ورسوم التوصيل', descriptionEn: 'Delivery areas and fees', color: 'text-blue-500' },
    ],
  },
  {
    titleKey: 'sitemap.account',
    icon: User,
    color: 'from-purple-500 to-violet-600',
    links: [
      { labelKey: 'auth.login', icon: User, view: 'login', descriptionAr: 'تسجيل الدخول لحسابك', descriptionEn: 'Sign in to your account', color: 'text-purple-500' },
      { labelKey: 'auth.register', icon: User, view: 'register', descriptionAr: 'إنشاء حساب جديد', descriptionEn: 'Create a new account', color: 'text-purple-500' },
      { labelKey: 'nav.profile', icon: Settings, view: 'profile', descriptionAr: 'الملف الشخصي والإعدادات', descriptionEn: 'Profile and settings', badgeKey: 'auth.login', color: 'text-purple-500' },
      { labelKey: 'order.myOrders', icon: Clock, view: 'order-tracking', descriptionAr: 'تتبع وإدارة طلباتك', descriptionEn: 'Track and manage orders', color: 'text-orange-500' },
      { labelKey: 'sitemap.quickActions', icon: Star, view: 'points-rewards', descriptionAr: 'نقاط الولاء والمكافآت', descriptionEn: 'Loyalty points and rewards', color: 'text-amber-500' },
    ],
  },
  {
    titleKey: 'sitemap.policies',
    icon: Shield,
    color: 'from-sky-500 to-cyan-600',
    links: [
      { labelKey: 'footer.terms', icon: FileText, view: 'terms', descriptionAr: 'شروط وأحكام الاستخدام', descriptionEn: 'Terms and conditions of use', color: 'text-sky-500' },
      { labelKey: 'footer.privacyPolicy', icon: Shield, view: 'privacy', descriptionAr: 'سياسة حماية الخصوصية', descriptionEn: 'Privacy protection policy', color: 'text-sky-500' },
      { labelKey: 'footer.returnPolicy', icon: RotateCcw, view: 'returns', descriptionAr: 'سياسة الإرجاع والاستبدال', descriptionEn: 'Return and exchange policy', color: 'text-sky-500' },
    ],
  },
  {
    titleKey: 'sitemap.support',
    icon: Headphones,
    color: 'from-rose-500 to-pink-600',
    links: [
      { labelKey: 'contact.pageTitle', icon: Phone, view: 'contact', descriptionAr: 'تواصل مع فريق الدعم', descriptionEn: 'Contact support team', color: 'text-rose-500' },
      { labelKey: 'chat.title', icon: MessageCircle, descriptionAr: 'المساعد الذكي للدعم', descriptionEn: 'Smart support assistant', color: 'text-rose-500' },
      { labelKey: 'contact.faqTitle', icon: Headphones, view: 'contact', descriptionAr: 'أسئلة شائعة وإجابات', descriptionEn: 'Common questions & answers', color: 'text-rose-500' },
      { labelKey: 'sitemap.title', icon: TreePine, view: 'sitemap', descriptionAr: 'خريطة الموقع الشاملة', descriptionEn: 'Complete site map', color: 'text-rose-500' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN SITEMAP PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function SitemapPage() {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const navigateTo = useUIStore((s) => s.navigateTo);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [searchQuery, setSearchQuery] = useState('');

  // ─── Filter sitemap based on search ────────────────
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return sitemapData;
    const q = searchQuery.toLowerCase();
    return sitemapData
      .map((section) => ({
        ...section,
        links: section.links.filter((link) => {
          const label = t(link.labelKey).toLowerCase();
          const desc = link.descriptionAr && link.descriptionEn
            ? (isAr ? link.descriptionAr : link.descriptionEn).toLowerCase()
            : '';
          return label.includes(q) || desc.includes(q);
        }),
      }))
      .filter((section) => section.links.length > 0);
  }, [searchQuery, t, isAr]);

  // ─── Total counts ──────────────────────────────────
  const totalLinks = sitemapData.reduce((acc, s) => acc + s.links.length, 0);
  const totalSections = sitemapData.length;
  const filteredLinks = filteredData.reduce((acc, s) => acc + s.links.length, 0);

  // ─── Navigation handler ────────────────────────────
  const handleNavigate = (link: SitemapLink) => {
    if (link.view) {
      navigateTo(link.view as any);
    }
  };

  // ─── Animation variants ────────────────────────────
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true } as const,
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-12">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -start-20 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -end-16 w-44 h-44 rounded-full bg-white/5" />
          <div className="absolute top-1/3 end-10 w-20 h-20 rounded-full bg-white/5" />
          {/* Tree-like pattern for sitemap */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              linear-gradient(var(--color-nabdh-primary, #004B63) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-nabdh-primary, #004B63) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }} />
          {/* Floating nodes */}
          <div className="absolute top-8 start-1/4 w-3 h-3 rounded-full bg-white/10 animate-pulse" />
          <div className="absolute top-16 end-1/3 w-2 h-2 rounded-full bg-white/15 animate-pulse" style={{ animationDelay: '0.7s' }} />
          <div className="absolute bottom-8 start-1/2 w-2.5 h-2.5 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '1.4s' }} />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-7xl mx-auto">
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0, x: isAr ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateTo('none')}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors mb-6"
              aria-label={t('common.back')}
            >
              <BackArrow className="size-5 text-white" />
            </motion.button>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="size-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <TreePine className="size-6 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                  {t('sitemap.title')}
                </h1>
              </div>
              <p className="text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed">
                {t('sitemap.subtitle')}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center gap-4 mt-6"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Hash className="size-4 text-white/70" />
                <span className="text-sm text-white/90 font-medium">
                  {totalLinks} {t('sitemap.totalPages')}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <LayoutGrid className="size-4 text-white/70" />
                <span className="text-sm text-white/90 font-medium">
                  {totalSections} {t('sitemap.totalSections')}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SEARCH BAR
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="rounded-2xl border border-border/50 shadow-lg max-w-xl mx-auto">
            <CardContent className="p-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('sitemap.searchPlaceholder')}
                  className="h-11 ps-10 rounded-xl border-0 bg-muted/30 focus-visible:bg-muted/50 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="text-xs">×</span>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SITEMAP SECTIONS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <AnimatePresence mode="wait">
          {filteredData.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Search className="size-7 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">
                {t('sitemap.noResults')}
              </p>
              <p className="text-sm text-muted-foreground">
                {isAr ? 'جرب كلمات بحث مختلفة' : 'Try different search terms'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {filteredData.map((section, sectionIndex) => {
                const SectionIcon = section.icon;
                return (
                  <motion.div
                    key={section.titleKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: sectionIndex * 0.08 }}
                  >
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        'size-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md',
                        section.color
                      )}>
                        <SectionIcon className="size-5 text-white" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">
                        {t(section.titleKey)}
                      </h2>
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {section.links.length}
                      </Badge>
                    </div>

                    {/* Section Links Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {section.links.map((link, linkIndex) => {
                        const LinkIcon = link.icon;
                        const desc = link.descriptionAr && link.descriptionEn
                          ? (isAr ? link.descriptionAr : link.descriptionEn)
                          : '';
                        const isClickable = !!link.view;

                        return (
                          <motion.button
                            key={link.labelKey}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: linkIndex * 0.04 }}
                            whileHover={isClickable ? { scale: 1.02, y: -2 } : {}}
                            whileTap={isClickable ? { scale: 0.98 } : {}}
                            onClick={() => isClickable && handleNavigate(link)}
                            disabled={!isClickable}
                            className={cn(
                              'rounded-xl border border-border/50 bg-card p-4 text-start transition-all duration-200 group',
                              isClickable
                                ? 'hover:border-nabdh-primary/20 hover:shadow-md cursor-pointer'
                                : 'opacity-70 cursor-default'
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                'size-9 rounded-lg flex items-center justify-center shrink-0',
                                'bg-muted/50 group-hover:bg-nabdh-primary/10 transition-colors'
                              )}>
                                <LinkIcon className={cn('size-4', link.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-foreground group-hover:text-nabdh-primary transition-colors truncate">
                                    {t(link.labelKey)}
                                  </span>
                                  {isClickable && (
                                    <ChevronLeft className={cn(
                                      'size-3 text-muted-foreground group-hover:text-nabdh-primary transition-all shrink-0',
                                      isAr ? '' : 'rotate-180'
                                    )} />
                                  )}
                                </div>
                                {desc && (
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                    {desc}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Section separator (except last) */}
                    {sectionIndex < filteredData.length - 1 && (
                      <Separator className="mt-8" />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          VISUAL SITE TREE
          ═══════════════════════════════════════════════════════════════ */}
      {!searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <motion.div {...fadeUp}>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                {isAr ? 'الهيكل البصري للموقع' : 'Visual Site Structure'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                {isAr ? 'نظرة شاملة على هيكل وترتيب صفحات الموقع' : 'A comprehensive overview of the site structure and page hierarchy'}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                {/* Root node */}
                <div className="flex items-center justify-center mb-8">
                  <div className="nabdh-gradient text-white px-6 py-3 rounded-xl font-bold text-base shadow-lg shadow-nabdh-primary/20 flex items-center gap-2">
                    <Home className="size-5" />
                    {t('hero.title')}
                  </div>
                </div>

                {/* Connection lines */}
                <div className="flex justify-center mb-4">
                  <div className="w-px h-8 bg-nabdh-primary/20" />
                </div>

                {/* Branch nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {sitemapData.map((section, i) => {
                    const SectionIcon = section.icon;
                    return (
                      <motion.div
                        key={section.titleKey}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.08 }}
                        className="flex flex-col items-center"
                      >
                        <button
                          onClick={() => {
                            const firstLink = section.links.find(l => l.view);
                            if (firstLink) handleNavigate(firstLink);
                          }}
                          className="group w-full"
                        >
                          <div className={cn(
                            'flex flex-col items-center p-3 sm:p-4 rounded-xl border border-border/50',
                            'bg-card hover:border-nabdh-primary/20 hover:shadow-md transition-all'
                          )}>
                            <div className={cn(
                              'size-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2 shadow-md',
                              'group-hover:scale-110 transition-transform',
                              section.color
                            )}>
                              <SectionIcon className="size-5 text-white" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-nabdh-primary transition-colors text-center">
                              {t(section.titleKey)}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              {section.links.length} {isAr ? 'صفحات' : 'pages'}
                            </span>
                          </div>
                        </button>

                        {/* Sub-connection dots */}
                        <div className="flex justify-center mt-2">
                          <div className="flex gap-1">
                            {section.links.slice(0, 4).map((_, j) => (
                              <div key={j} className="size-1 rounded-full bg-nabdh-primary/20" />
                            ))}
                            {section.links.length > 4 && (
                              <div className="size-1 rounded-full bg-nabdh-primary/10" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          QUICK ACCESS FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      {!searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <motion.div {...fadeUp}>
            <Card className="rounded-2xl border border-border/50 shadow-sm">
              <CardContent className="p-6 sm:p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  {isAr ? 'لم تجد ما تبحث عنه؟' : "Can't find what you're looking for?"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => navigateTo('contact')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full nabdh-gradient text-white text-sm font-medium shadow-md shadow-nabdh-primary/20 hover:shadow-nabdh-primary/30 transition-all hover:scale-105"
                  >
                    <Phone className="size-4" />
                    {t('nav.contact')}
                  </button>
                  <button
                    onClick={() => useUIStore.getState().toggleChat()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-foreground text-sm font-medium hover:border-nabdh-primary/30 hover:shadow-sm transition-all hover:scale-105"
                  >
                    <MessageCircle className="size-4" />
                    {t('chat.title')}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>
      )}
    </div>
  );
}
