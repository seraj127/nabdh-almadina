'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MessageCircle,
  Mail,
  Headphones,
  Clock,
  MapPin,
  Zap,
  Send,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Navigation,
  ExternalLink,
  Maximize2,
  Crosshair,
  Building2,
  Compass,
  Route,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';

// ─── Contact Methods Config ──────────────────────────────────────────
const contactMethods = [
  {
    icon: Phone,
    titleKey: 'contact.phoneTitle',
    descKey: 'contact.phoneDesc',
    action: () => window.open('tel:+218912345678'),
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    iconColor: 'text-white',
    borderColor: 'hover:border-emerald-500/30',
  },
  {
    icon: MessageCircle,
    titleKey: 'contact.whatsappTitle',
    descKey: 'contact.whatsappDesc',
    action: () => window.open('https://wa.me/218912345678'),
    iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
    iconColor: 'text-white',
    borderColor: 'hover:border-green-500/30',
  },
  {
    icon: Mail,
    titleKey: 'contact.emailTitle',
    descKey: 'contact.emailDesc',
    action: () => window.open('mailto:info@nabdh.ly'),
    iconBg: 'bg-gradient-to-br from-nabdh-accent to-nabdh-primary',
    iconColor: 'text-white',
    borderColor: 'hover:border-nabdh-accent/30',
  },
  {
    icon: Headphones,
    titleKey: 'contact.chatTitle',
    descKey: 'contact.chatDesc',
    action: () => useUIStore.getState().toggleChat(),
    iconBg: 'bg-gradient-to-br from-nabdh-primary to-teal-600',
    iconColor: 'text-white',
    borderColor: 'hover:border-nabdh-primary/30',
  },
] as const;

// ─── Inquiry Categories ──────────────────────────────────────────────
const inquiryCategories = [
  'contact.categoryGeneral',
  'contact.categoryOrder',
  'contact.categoryComplaint',
  'contact.categorySuggestion',
  'contact.categoryTechnical',
  'contact.categoryReturn',
] as const;

// ─── FAQ Data (keys reference translations) ──────────────────────────
const faqKeys = [1, 2, 3, 4, 5, 6] as const;

// ─── Social Links ────────────────────────────────────────────────────
const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/nabdh.ly', label: 'Facebook', gradient: 'from-blue-600 to-blue-700' },
  { icon: Instagram, href: 'https://instagram.com/nabdh.ly', label: 'Instagram', gradient: 'from-pink-500 to-purple-600' },
  { icon: Twitter, href: 'https://twitter.com/nabdh_ly', label: 'Twitter', gradient: 'from-sky-500 to-sky-600' },
  { icon: Youtube, href: 'https://youtube.com/@nabdh.ly', label: 'YouTube', gradient: 'from-red-500 to-red-600' },
] as const;

// ─── Working Hours Checker (Libya timezone EET UTC+2) ───────────────
function isCurrentlyOpen(): boolean {
  const now = new Date();
  const libyaOffset = 2 * 60;
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const libyaTime = new Date(utcMs + libyaOffset * 60000);
  const day = libyaTime.getDay();
  const hour = libyaTime.getHours();
  if (day === 5) return hour >= 14 && hour < 22;
  if ((day >= 0 && day <= 4) || day === 6) return hour >= 9 && hour < 22;
  return false;
}

// ═══════════════════════════════════════════════════════════════════════
// INTERACTIVE MAP COMPONENT (CSS/SVG - works everywhere)
// ═══════════════════════════════════════════════════════════════════════
function InteractiveMap({ isAr }: { isAr: boolean }) {
  const [tilesLoaded, setTilesLoaded] = useState<Record<string, boolean>>({});
  const [showFallback, setShowFallback] = useState(false);

  // OSM tile calculation for Tripoli at zoom 14
  // lat=32.8872, lon=13.1913 → x=8794, y=6610
  const zoom = 14;
  const cx = 8794;
  const cy = 6610;

  // 3x2 tile grid centered on Tripoli
  const tiles = [
    { x: cx - 1, y: cy - 1 }, { x: cx, y: cy - 1 }, { x: cx + 1, y: cy - 1 },
    { x: cx - 1, y: cy },     { x: cx, y: cy },      { x: cx + 1, y: cy },
  ];

  const allTilesLoaded = tiles.every((t) => tilesLoaded[`${t.x}-${t.y}`]);
  const someTilesLoaded = Object.keys(tilesLoaded).length > 0;

  // If after 5 seconds no tiles loaded, show fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(tilesLoaded).length === 0) {
        setShowFallback(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted/30">
      {/* OSM Tiles Grid */}
      {!showFallback && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2">
          {tiles.map((tile) => (
            <div key={`${tile.x}-${tile.y}`} className="relative overflow-hidden">
              <img
                src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
                crossOrigin="anonymous"
                onLoad={() => setTilesLoaded((prev) => ({ ...prev, [`${tile.x}-${tile.y}`]: true }))}
                onError={() => setShowFallback(true)}
                style={{ minHeight: 128 }}
              />
            </div>
          ))}
          {/* Loading overlay */}
          {!allTilesLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-2">
                <div className="size-8 rounded-full border-2 border-nabdh-primary/30 border-t-nabdh-primary animate-spin" />
                <span className="text-xs text-muted-foreground">{isAr ? 'جاري تحميل الخريطة...' : 'Loading map...'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSS/SVG Fallback Map */}
      {(showFallback || (!someTilesLoaded && false)) && (
        <div className="absolute inset-0 bg-gradient-to-br from-nabdh-primary/5 via-muted/20 to-nabdh-accent/5">
          {/* Grid pattern (streets) */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Major roads */}
            <line x1="0" y1="35%" x2="100%" y2="35%" stroke="var(--color-nabdh-primary)" strokeWidth="3" opacity="0.08" />
            <line x1="0" y1="65%" x2="100%" y2="65%" stroke="var(--color-nabdh-primary)" strokeWidth="2" opacity="0.06" />
            <line x1="40%" y1="0" x2="40%" y2="100%" stroke="var(--color-nabdh-primary)" strokeWidth="3" opacity="0.08" />
            <line x1="70%" y1="0" x2="70%" y2="100%" stroke="var(--color-nabdh-primary)" strokeWidth="2" opacity="0.06" />
            {/* Minor roads */}
            <line x1="0" y1="20%" x2="100%" y2="20%" stroke="var(--color-nabdh-primary)" strokeWidth="1" opacity="0.04" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--color-nabdh-primary)" strokeWidth="1.5" opacity="0.05" />
            <line x1="0" y1="80%" x2="100%" y2="80%" stroke="var(--color-nabdh-primary)" strokeWidth="1" opacity="0.04" />
            <line x1="20%" y1="0" x2="20%" y2="100%" stroke="var(--color-nabdh-primary)" strokeWidth="1" opacity="0.04" />
            <line x1="55%" y1="0" x2="55%" y2="100%" stroke="var(--color-nabdh-primary)" strokeWidth="1.5" opacity="0.05" />
            <line x1="85%" y1="0" x2="85%" y2="100%" stroke="var(--color-nabdh-primary)" strokeWidth="1" opacity="0.04" />
            {/* Diagonal road */}
            <line x1="10%" y1="10%" x2="60%" y2="90%" stroke="var(--color-nabdh-primary)" strokeWidth="1.5" opacity="0.05" />
            {/* Building blocks */}
            <rect x="25%" y="22%" width="12%" height="10%" rx="2" fill="var(--color-nabdh-primary)" opacity="0.03" />
            <rect x="45%" y="38%" width="8%" height="8%" rx="2" fill="var(--color-nabdh-primary)" opacity="0.03" />
            <rect x="60%" y="55%" width="14%" height="8%" rx="2" fill="var(--color-nabdh-primary)" opacity="0.03" />
            <rect x="15%" y="52%" width="10%" height="12%" rx="2" fill="var(--color-nabdh-primary)" opacity="0.03" />
            <rect x="72%" y="25%" width="10%" height="6%" rx="2" fill="var(--color-nabdh-primary)" opacity="0.03" />
            {/* Coast line */}
            <path d="M 0,70% Q 15%,65% 30%,72% Q 50%,80% 70%,68% Q 85%,62% 100%,66%" fill="none" stroke="var(--color-nabdh-accent)" strokeWidth="2" opacity="0.08" />
            {/* Sea area */}
            <path d="M 0,70% Q 15%,65% 30%,72% Q 50%,80% 70%,68% Q 85%,62% 100%,66% L 100%,100% L 0,100% Z" fill="var(--color-nabdh-accent)" opacity="0.03" />
          </svg>
        </div>
      )}

      {/* Marker pin - always visible */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          {/* Pulse ring */}
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-8 rounded-full bg-nabdh-primary/20"
            animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Pin */}
          <div className="relative flex flex-col items-center">
            <div className="nabdh-gradient size-10 rounded-full flex items-center justify-center shadow-xl shadow-nabdh-primary/30 border-2 border-white">
              <Building2 className="size-5 text-white" />
            </div>
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-nabdh-primary" />
          </div>
        </motion.div>
      </div>

      {/* Map controls overlay */}
      <div className="absolute top-3 end-3 z-30 flex flex-col gap-2">
        <a
          href="https://www.openstreetmap.org/?mlat=32.8872&mlon=13.1913#map=15/32.8872/13.1913"
          target="_blank"
          rel="noopener noreferrer"
          className="size-9 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-md hover:bg-card hover:border-nabdh-primary/30 transition-all"
          title={isAr ? 'خريطة أكبر' : 'Larger map'}
        >
          <Maximize2 className="size-4 text-foreground" />
        </a>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=32.8872,13.1913"
          target="_blank"
          rel="noopener noreferrer"
          className="size-9 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-md hover:bg-card hover:border-nabdh-primary/30 transition-all"
          title={isAr ? 'الاتجاهات' : 'Directions'}
        >
          <Navigation className="size-4 text-foreground" />
        </a>
      </div>

      {/* Compass */}
      <div className="absolute top-3 start-3 z-30">
        <div className="size-9 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-md">
          <Compass className="size-4 text-nabdh-primary" />
        </div>
      </div>

      {/* Location label at bottom */}
      <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-card via-card/80 to-transparent pt-8 pb-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg nabdh-gradient flex items-center justify-center shrink-0">
              <MapPin className="size-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {isAr ? 'نبض المدينة - طرابلس' : 'City Pulse - Tripoli'}
              </p>
              <p className="text-[10px] text-muted-foreground" dir="ltr">32.8872°N, 13.1913°E</p>
            </div>
          </div>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=32.8872,13.1913"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full nabdh-gradient text-white text-[10px] font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <Route className="size-3" />
            {isAr ? 'اتجاهات' : 'Go'}
          </a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN CONTACT PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function ContactPage() {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const navigateTo = useUIStore((s) => s.navigateTo);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  // ─── Form State ──────────────────────────
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'contact.categoryGeneral',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(isCurrentlyOpen());

  // Update open status every minute
  useEffect(() => {
    const interval = setInterval(() => setIsOpen(isCurrentlyOpen()), 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Form Handlers ───────────────────────
  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;
    setSending(true);
    setSendError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          category: formData.category,
          subject: formData.subject,
          message: formData.message,
        }),
      });
      if (res.ok) {
        setSent(true);
        setFormData({ name: '', phone: '', email: '', category: 'contact.categoryGeneral', subject: '', message: '' });
        setTimeout(() => setSent(false), 5000);
      } else {
        setSendError(t('contact.sentError'));
      }
    } catch {
      setSendError(t('contact.connectError'));
    } finally {
      setSending(false);
    }
  };

  const toggleFaq = useCallback((index: number) => {
    setExpandedFaq((prev) => (prev === index ? null : index));
  }, []);

  // ─── Animations ──────────────────────────
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true } as const,
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-12">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)',
        }}
      >
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-20 -start-20 w-56 h-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -end-16 w-44 h-44 rounded-full bg-white/5" />
          <div className="absolute top-1/4 end-20 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute top-12 start-1/3 w-2 h-2 rounded-full bg-white/15 animate-pulse" />
          <div className="absolute top-20 end-1/4 w-1.5 h-1.5 rounded-full bg-white/15 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 start-1/2 w-2 h-2 rounded-full bg-white/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />
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

            {/* Title & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                {t('contact.pageTitle')}
              </h1>
              <p className="text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed">
                {t('contact.pageSubtitle')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 2: CONTACT METHODS GRID
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {contactMethods.map((method, i) => {
            const Icon = method.icon;
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.08 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={method.action}
                className={cn(
                  'rounded-2xl border border-border/50 bg-card p-5 text-start transition-all duration-300',
                  'hover:shadow-lg group',
                  method.borderColor
                )}
              >
                <div className={cn('size-12 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform', method.iconBg)}>
                  <Icon className={cn('size-5', method.iconColor)} />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1">
                  {t(method.titleKey)}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {t(method.descKey)}
                </p>
              </motion.button>
            );
          })}
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 3: INTERACTIVE MAP (Full Width - Prominent!)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
        <motion.div {...fadeUp}>
          <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-nabdh-primary to-nabdh-accent flex items-center justify-center shadow-md">
                    <MapPin className="size-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {isAr ? 'موقعنا على الخريطة' : 'Our Location on the Map'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isAr ? 'طرابلس، ليبيا 🇱🇾' : 'Tripoli, Libya 🇱🇾'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.a
                    href="https://www.openstreetmap.org/?mlat=32.8872&mlon=13.1913#map=15/32.8872/13.1913"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium hover:border-nabdh-primary/30 transition-colors"
                  >
                    <Maximize2 className="size-3" />
                    {isAr ? 'خريطة أكبر' : 'Larger Map'}
                  </motion.a>
                  <motion.a
                    href="https://www.google.com/maps/dir/?api=1&destination=32.8872,13.1913"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full nabdh-gradient text-white text-xs font-semibold shadow-md shadow-nabdh-primary/20 hover:shadow-nabdh-primary/30 transition-all"
                  >
                    <Navigation className="size-3" />
                    {isAr ? 'الحصول على اتجاهات' : 'Get Directions'}
                  </motion.a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* The Interactive Map */}
              <div className="relative w-full h-64 sm:h-80 lg:h-96">
                <InteractiveMap isAr={isAr} />
              </div>

              {/* Location info bar */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-nabdh-primary/5 to-nabdh-accent/5 border-t border-border/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-nabdh-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="size-5 text-nabdh-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {t('contact.locationValue')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {t('contact.mapDesc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.openstreetmap.org/?mlat=32.8872&mlon=13.1913#map=16/32.8872/13.1913"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-foreground hover:border-nabdh-primary/30 transition-colors"
                    >
                      <ExternalLink className="size-3" />
                      {isAr ? 'خريطة أكبر' : 'Larger Map'}
                    </a>
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=32.8872,13.1913"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg nabdh-gradient text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      <Navigation className="size-3" />
                      {isAr ? 'الاتجاهات' : 'Directions'}
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 4: FORM + INFO GRID
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* ─── Left Column: Contact Form ─── */}
          <motion.div {...fadeUp}>
            <Card className="rounded-2xl border border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <h2 className="text-xl font-bold gradient-text">
                  {t('contact.formCardTitle')}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('contact.formCardDesc')}
                </p>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Inquiry Type */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      {t('contact.categoryLabel')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {inquiryCategories.map((catKey) => (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => updateField('category', catKey)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                            formData.category === catKey
                              ? 'bg-nabdh-primary text-white border-nabdh-primary shadow-sm'
                              : 'bg-muted/50 text-muted-foreground border-border/50 hover:border-nabdh-primary/30 hover:text-nabdh-primary'
                          )}
                        >
                          {t(catKey)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder={t('contact.namePlaceholder')}
                        className="h-11"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="tel"
                        placeholder={t('contact.phonePlaceholder')}
                        dir="ltr"
                        className="h-11 text-start"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <Input
                    type="text"
                    inputMode="email"
                    placeholder={t('contact.emailPlaceholder')}
                    dir="ltr"
                    className="h-11 text-start"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />

                  {/* Subject */}
                  <Input
                    placeholder={t('contact.subjectPlaceholder')}
                    className="h-11"
                    value={formData.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                  />

                  {/* Message */}
                  <Textarea
                    placeholder={t('contact.messagePlaceholder')}
                    rows={5}
                    className="resize-none"
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    required
                  />

                  {/* Submit */}
                  <AnimatePresence mode="wait">
                    {sent ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center gap-2 font-medium text-sm"
                      >
                        <CheckCircle2 className="size-5" />
                        {t('contact.sentSuccess')}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="submit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Button
                          type="submit"
                          disabled={sending}
                          className="w-full nabdh-gradient text-white h-11 rounded-xl font-semibold shadow-lg shadow-nabdh-primary/20 hover:shadow-nabdh-primary/30 transition-all disabled:opacity-60"
                        >
                          {sending ? (
                            <Loader2 className="size-4 animate-spin me-2" />
                          ) : (
                            <Send className="size-4 me-2" />
                          )}
                          {sending ? t('contact.sending') : t('contact.send')}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {sendError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-red-500 text-center"
                    >
                      {sendError}
                    </motion.p>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* ─── Right Column: Working Hours + Response Time ─── */}
          <div className="space-y-4 sm:space-y-6">
            {/* Working Hours Card */}
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="rounded-2xl border border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-lg bg-gradient-to-br from-nabdh-primary to-teal-600 flex items-center justify-center">
                        <Clock className="size-4 text-white" />
                      </div>
                      <h3 className="font-bold text-sm text-foreground">
                        {t('contact.hoursTitle')}
                      </h3>
                    </div>
                    <Badge
                      className={cn(
                        'text-[10px] gap-1 border-0 font-medium',
                        isOpen
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-red-500/10 text-red-500'
                      )}
                    >
                      <span className={cn(
                        'size-1.5 rounded-full',
                        isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                      )} />
                      {isOpen
                        ? (isAr ? 'مفتوح الآن' : 'Open Now')
                        : (isAr ? 'مغلق' : 'Closed')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground font-medium">
                      {t('contact.hoursWeekday')}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono" dir="ltr">
                      {t('contact.hoursWeekdayTime')}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground font-medium">
                      {t('contact.hoursFriday')}
                    </span>
                    <span className="text-sm text-muted-foreground font-mono" dir="ltr">
                      {t('contact.hoursFridayTime')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Response Time Card */}
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="rounded-2xl border border-border/50 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
                      <Zap className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        {t('contact.responseTime')}
                      </h3>
                      <p className="text-lg font-bold gradient-text mt-0.5">
                        {t('contact.responseTimeValue')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {t('contact.responseTimeDesc')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Location Card */}
            <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card className="rounded-2xl border border-border/50 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-nabdh-primary to-nabdh-accent flex items-center justify-center shrink-0 shadow-md">
                      <Crosshair className="size-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-foreground mb-1">
                        {isAr ? 'العنوان بالتفصيل' : 'Detailed Address'}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('contact.locationValue')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {t('contact.mapDesc')}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <a
                          href="https://www.google.com/maps/dir/?api=1&destination=32.8872,13.1913"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full nabdh-gradient text-white text-[11px] font-semibold shadow-sm hover:shadow-md transition-all"
                        >
                          <Navigation className="size-3" />
                          {isAr ? 'اتجاهات' : 'Directions'}
                        </a>
                        <a
                          href="https://www.openstreetmap.org/?mlat=32.8872&mlon=13.1913#map=16/32.8872/13.1913"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-nabdh-primary/10 text-nabdh-primary text-[11px] font-medium hover:bg-nabdh-primary/20 transition-colors"
                        >
                          <ExternalLink className="size-3" />
                          {isAr ? 'خريطة' : 'Map'}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 5: FAQ ACCORDION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <motion.div {...fadeUp}>
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
              {t('contact.faqTitle')}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {t('contact.faqSubtitle')}
            </p>
          </div>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-2">
          {faqKeys.map((num, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="rounded-xl border border-border/50 bg-card overflow-hidden transition-colors hover:border-nabdh-primary/15"
            >
              <button
                onClick={() => toggleFaq(num)}
                className="w-full flex items-center justify-between gap-3 p-4 text-start hover:bg-muted/30 transition-colors"
                aria-expanded={expandedFaq === num}
              >
                <span className="font-semibold text-sm text-nabdh-primary">
                  {t(`contact.faq${num}Q`)}
                </span>
                <motion.div
                  animate={{ rotate: expandedFaq === num ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="shrink-0"
                >
                  <ChevronDown className="size-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {expandedFaq === num && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <Separator className="mb-3" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(`contact.faq${num}A`)}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 6: SOCIAL MEDIA
          ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <motion.div {...fadeUp}>
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardContent className="p-6 sm:p-8 text-center">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-2">
                {t('contact.socialTitle')}
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {t('contact.socialDesc')}
              </p>
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                {socialLinks.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      whileHover={{ scale: 1.15, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'size-12 sm:size-14 rounded-full bg-gradient-to-br flex items-center justify-center shadow-md',
                        'transition-shadow hover:shadow-lg',
                        social.gradient
                      )}
                    >
                      <Icon className="size-5 sm:size-6 text-white" />
                    </motion.a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
