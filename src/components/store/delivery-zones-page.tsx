'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Truck,
  Clock,
  Search,
  ArrowLeft,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  ShieldCheck,
  Zap,
  Globe2,
  Package,
  Info,
  TrendingDown,
  Sparkles,
  LayoutGrid,
  List,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { DELIVERY_REGIONS } from '@/components/mobile/lib/delivery-zones';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────
type ViewMode = 'accordion' | 'cards';

// ─── Region Configuration ───────────────────────────────────────────
const REGION_CONFIG: Record<string, {
  icon: typeof MapPin;
  gradient: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
  description: { ar: string; en: string };
}> = {
  tripoli: {
    icon: MapPin,
    gradient: 'from-teal-500 to-cyan-500',
    color: 'text-teal-600 dark:text-teal-400',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800/40',
    description: { ar: 'العاصمة والمناطق المحيطة — توصيل سريع خلال 24 ساعة', en: 'The capital and surrounding areas — fast delivery within 24 hours' },
  },
  western: {
    icon: Globe2,
    gradient: 'from-amber-500 to-orange-500',
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
    description: { ar: 'المناطق الغربية — توصيل خلال 24 ساعة', en: 'Western areas — delivery within 24 hours' },
  },
  eastern: {
    icon: Truck,
    gradient: 'from-rose-500 to-pink-500',
    color: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-900/20',
    borderColor: 'border-rose-200 dark:border-rose-800/40',
    description: { ar: 'المناطق الشرقية — توصيل من 2 إلى 4 أيام', en: 'Eastern areas — delivery in 2-4 days' },
  },
  mountain: {
    icon: Package,
    gradient: 'from-emerald-500 to-green-500',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
    description: { ar: 'الجبل الغربي والجنوب — توصيل من 1 إلى 5 أيام', en: 'Western Mountain & South — delivery in 1-5 days' },
  },
  central: {
    icon: Zap,
    gradient: 'from-violet-500 to-purple-500',
    color: 'text-violet-600 dark:text-violet-400',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800/40',
    description: { ar: 'المنطقة الوسطى — توصيل من 1 إلى 4 أيام', en: 'Central region — delivery in 1-4 days' },
  },
};

const DEFAULT_REGION_CONFIG = {
  icon: MapPin,
  gradient: 'from-nabdh-primary to-nabdh-accent',
  color: 'text-nabdh-primary',
  bgLight: 'bg-nabdh-primary/5',
  bgDark: 'dark:bg-nabdh-primary/10',
  borderColor: 'border-nabdh-primary/20',
  description: { ar: '', en: '' },
};

// ─── Price Tier Helper ──────────────────────────────────────────────
function getPriceTier(price: number): { label: { ar: string; en: string }; color: string; bg: string } {
  if (price <= 15) return { label: { ar: 'اقتصادي', en: 'Economy' }, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
  if (price <= 30) return { label: { ar: 'قياسي', en: 'Standard' }, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
  return { label: { ar: 'بعيد', en: 'Remote' }, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/30' };
}

function getPriceRange(zones: { price: number }[]): { min: number; max: number } {
  if (zones.length === 0) return { min: 0, max: 0 };
  const prices = zones.map((z) => z.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function getDurationRange(zones: { durationAr: string; durationEn: string }[]): { ar: string; en: string } {
  if (zones.length === 0) return { ar: '—', en: '—' };
  // Find the shortest and longest durations
  const durations = zones.map((z) => z.durationEn);
  const has24h = durations.some((d) => d.includes('24'));
  const hasMultiDay = durations.some((d) => d.includes('days') || d.includes('ايام'));
  if (has24h && !hasMultiDay) return { ar: 'خلال 24 ساعة', en: 'Within 24 hours' };
  if (hasMultiDay && !has24h) {
    const maxDays = durations.reduce((max, d) => {
      const match = d.match(/(\d+)(?:\s*-\s*\d+)?\s*days/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    return { ar: `من 1 إلى ${maxDays} أيام`, en: `1-${maxDays} days` };
  }
  return { ar: 'خلال 24 ساعة - 4 أيام', en: 'Within 24 hours - 4 days' };
}

// ─── Zone Card (for cards view) ─────────────────────────────────────
function ZoneCard({
  zone,
  regionConfig,
  isAr,
  currency,
  index,
}: {
  zone: { id: string; nameAr: string; nameEn: string; price: number; durationAr: string; durationEn: string };
  regionConfig: typeof DEFAULT_REGION_CONFIG;
  isAr: boolean;
  currency: string;
  index: number;
}) {
  const tier = getPriceTier(zone.price);
  const Icon = regionConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.5) }}
      className={cn(
        'rounded-xl p-3.5 border transition-all duration-200 hover:shadow-md',
        'bg-card hover:border-nabdh-primary/30 group'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', regionConfig.bgLight, regionConfig.bgDark)}>
            <Icon className={cn('size-4', regionConfig.color)} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate group-hover:text-nabdh-primary transition-colors">
              {isAr ? zone.nameAr : zone.nameEn}
            </p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={cn('text-[10px] px-1.5 py-0 rounded-full font-medium', tier.bg, tier.color)}>
                {isAr ? tier.label.ar : tier.label.en}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="size-2.5" />
                {isAr ? zone.durationAr : zone.durationEn}
              </span>
            </div>
          </div>
        </div>
        <div className="text-end shrink-0">
          <span className="text-base font-bold text-nabdh-price">{zone.price}</span>
          <span className="text-[10px] text-muted-foreground ms-0.5">{currency}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Region Section ─────────────────────────────────────────────────
function RegionSection({
  region,
  regionIndex,
  isExpanded,
  onToggle,
  viewMode,
  isAr,
  currency,
  searchQuery,
}: {
  region: typeof DELIVERY_REGIONS[0];
  regionIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  viewMode: ViewMode;
  isAr: boolean;
  currency: string;
  searchQuery: string;
}) {
  const config = REGION_CONFIG[region.id] || DEFAULT_REGION_CONFIG;
  const Icon = config.icon;
  const priceRange = getPriceRange(region.zones);
  const durationRange = getDurationRange(region.zones);
  const totalZones = region.zones.length;

  // Highlight matching zones in search
  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const q = searchQuery.trim();
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-nabdh-primary/20 text-foreground rounded px-0.5">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: regionIndex * 0.08 }}
      className={cn(
        'rounded-2xl overflow-hidden border transition-all duration-300',
        isExpanded ? 'shadow-lg border-nabdh-primary/20' : 'border-border/40 hover:border-border hover:shadow-sm',
      )}
    >
      {/* Region Header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-start transition-colors',
          'hover:bg-muted/30',
          isExpanded && 'bg-muted/10'
        )}
      >
        {/* Region Icon */}
        <div className={cn(
          'size-12 sm:size-14 rounded-xl flex items-center justify-center shrink-0',
          'bg-gradient-to-br shadow-md',
          config.gradient
        )}>
          <Icon className="size-6 text-white" />
        </div>

        {/* Region Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg text-foreground">
            {isAr ? region.nameAr : region.nameEn}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {isAr ? config.description.ar : config.description.en}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={cn('text-[10px] gap-1 border-0', config.bgLight, config.bgDark, config.color)}>
              <MapPin className="size-2.5" />
              {totalZones} {isAr ? 'منطقة' : 'zones'}
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <Truck className="size-2.5" />
              {priceRange.min === priceRange.max
                ? `${priceRange.min} ${currency}`
                : `${priceRange.min} - ${priceRange.max} ${currency}`}
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <Clock className="size-2.5" />
              {isAr ? durationRange.ar : durationRange.en}
            </Badge>
          </div>
        </div>

        {/* Expand/Collapse Chevron */}
        <div className={cn(
          'size-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300',
          'bg-muted/50',
          isExpanded && 'rotate-180'
        )}>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>
      </button>

      {/* Zones Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              {/* Divider */}
              <div className="h-px bg-border/40 mb-4" />

              {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {region.zones.map((zone, i) => (
                    <ZoneCard
                      key={zone.id}
                      zone={zone}
                      regionConfig={config}
                      isAr={isAr}
                      currency={currency}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                /* Table/List View */
                <div className="space-y-1.5">
                  {region.zones.map((zone, i) => {
                    const tier = getPriceTier(zone.price);
                    return (
                      <motion.div
                        key={zone.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.015 }}
                        className={cn(
                          'flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg',
                          'bg-muted/20 hover:bg-muted/40 border border-transparent hover:border-border/50',
                          'transition-all duration-200 group'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs text-muted-foreground font-mono w-5 text-center shrink-0">{i + 1}</span>
                          <p className="font-medium text-sm text-foreground truncate group-hover:text-nabdh-primary transition-colors">
                            {searchQuery.trim() ? highlightMatch(isAr ? zone.nameAr : zone.nameEn) : (isAr ? zone.nameAr : zone.nameEn)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn('text-[10px] px-1.5 py-0 rounded-full font-medium hidden sm:inline-block', tier.bg, tier.color)}>
                            {isAr ? tier.label.ar : tier.label.en}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Clock className="size-2.5" />
                            {isAr ? zone.durationAr : zone.durationEn}
                          </span>
                          <div className="w-px h-4 bg-border/40" />
                          <span className="text-sm font-bold text-nabdh-price tabular-nums">{zone.price}</span>
                          <span className="text-[10px] text-muted-foreground">{currency}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Region Summary */}
              <div className="mt-3 pt-3 border-t border-border/20 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {isAr ? `${totalZones} منطقة توصيل` : `${totalZones} delivery zones`}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {isAr ? 'الأسعار شاملة الضريبة' : 'Prices include tax'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN DELIVERY ZONES PAGE
// ═══════════════════════════════════════════════════════════════════════
export function DeliveryZonesPage() {
  const { language, direction, t } = useLanguageStore(useShallow((s) => ({
    language: s.language, direction: s.direction, t: s.t,
  })));
  const clearAuthView = useUIStore((s) => s.clearAuthView);
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';
  const currency = t('product.currency');
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ─── State ────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('accordion');
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [priceFilter, setPriceFilter] = useState<'all' | 'economy' | 'standard' | 'remote'>('all');

  // ─── Computed ─────────────────────────
  const totalZones = useMemo(
    () => DELIVERY_REGIONS.reduce((sum, r) => sum + r.zones.length, 0),
    []
  );

  const filteredRegions = useMemo(() => {
    let regions = DELIVERY_REGIONS;
    const q = searchQuery.trim().toLowerCase();

    // Apply search
    if (q) {
      regions = regions.map((region) => {
        const regionNameMatch =
          region.nameAr.includes(q) || region.nameEn.toLowerCase().includes(q);
        const filteredZones = region.zones.filter((z) =>
          z.nameAr.includes(q) || z.nameEn.toLowerCase().includes(q)
        );
        if (regionNameMatch) return region;
        if (filteredZones.length > 0) return { ...region, zones: filteredZones };
        return null;
      }).filter(Boolean) as typeof DELIVERY_REGIONS;
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      const priceRange = priceFilter === 'economy' ? [0, 15] : priceFilter === 'standard' ? [16, 30] : [31, Infinity];
      regions = regions.map((region) => {
        const filteredZones = region.zones.filter((z) => z.price >= priceRange[0] && z.price <= priceRange[1]);
        if (filteredZones.length === 0) return null;
        return { ...region, zones: filteredZones };
      }).filter(Boolean) as typeof DELIVERY_REGIONS;
    }

    return regions;
  }, [searchQuery, priceFilter]);

  const matchingZonesCount = useMemo(
    () => filteredRegions.reduce((sum, r) => sum + r.zones.length, 0),
    [filteredRegions]
  );

  // ─── Global Stats ─────────────────────
  const globalStats = useMemo(() => {
    const allZones = DELIVERY_REGIONS.flatMap((r) => r.zones);
    const prices = allZones.map((z) => z.price);
    const economyCount = allZones.filter((z) => z.price <= 15).length;
    const standardCount = allZones.filter((z) => z.price > 15 && z.price <= 30).length;
    const remoteCount = allZones.filter((z) => z.price > 30).length;
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      economyCount,
      standardCount,
      remoteCount,
    };
  }, []);

  // ─── Handlers ─────────────────────────
  const toggleRegion = useCallback((id: string) => {
    setExpandedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedRegions(new Set(filteredRegions.map((r) => r.id)));
  }, [filteredRegions]);

  const collapseAll = useCallback(() => {
    setExpandedRegions(new Set());
  }, []);

  // Auto-expand when searching
  const effectiveExpanded = searchQuery.trim()
    ? new Set(filteredRegions.map((r) => r.id))
    : expandedRegions;

  const priceFilterLabels: Record<string, { ar: string; en: string }> = {
    'all': { ar: 'الكل', en: 'All' },
    'economy': { ar: 'اقتصادي (≤15)', en: 'Economy (≤15)' },
    'standard': { ar: 'قياسي (16-30)', en: 'Standard (16-30)' },
    'remote': { ar: 'بعيد (>30)', en: 'Remote (>30)' },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]" dir={direction}>
      {/* ═══ Gradient Header ═══ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)',
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -start-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -end-12 w-36 h-36 rounded-full bg-white/5" />
          <div className="absolute top-1/3 end-16 w-20 h-20 rounded-full bg-nabdh-secondary/10" />
          {/* Decorative map dots */}
          <div className="absolute top-16 start-1/4 w-2 h-2 rounded-full bg-white/10 animate-pulse" />
          <div className="absolute top-24 end-1/3 w-1.5 h-1.5 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-12 start-1/2 w-2.5 h-2.5 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="max-w-7xl mx-auto">
            {/* Top row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={clearAuthView}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={t('common.back')}
                >
                  <BackArrow className="size-5 text-white" />
                </motion.button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <MapPin className="size-6" />
                    {isAr ? 'مناطق التوصيل' : 'Delivery Zones'}
                  </h1>
                  <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                    {totalZones} {isAr ? 'منطقة توصيل في جميع أنحاء ليبيا' : 'delivery zones across Libya'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-white/50 text-[10px] sm:text-xs font-medium">{isAr ? 'المناطق الرئيسية' : 'Regions'}</p>
                <p className="text-white text-sm sm:text-lg font-bold mt-0.5">{DELIVERY_REGIONS.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-white/50 text-[10px] sm:text-xs font-medium">{isAr ? 'مناطق التوصيل' : 'Zones'}</p>
                <p className="text-white text-sm sm:text-lg font-bold mt-0.5">{totalZones}</p>
              </div>
              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/20">
                <p className="text-emerald-300/70 text-[10px] sm:text-xs font-medium">{isAr ? 'أقل رسوم' : 'Lowest Fee'}</p>
                <p className="text-emerald-300 text-sm sm:text-lg font-bold mt-0.5">{globalStats.minPrice} {currency}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-white/50 text-[10px] sm:text-xs font-medium">{isAr ? 'نطاق التوصيل' : 'Delivery Range'}</p>
                <p className="text-white text-sm sm:text-lg font-bold mt-0.5">24h - 5{isAr ? ' أيام' : ' days'}</p>
              </div>
            </motion.div>

            {/* Price Tier Summary */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-3 flex items-center gap-2 flex-wrap"
            >
              {[
                { label: isAr ? `اقتصادي: ${globalStats.economyCount} منطقة` : `Economy: ${globalStats.economyCount} zones`, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                { label: isAr ? `قياسي: ${globalStats.standardCount} مناطق` : `Standard: ${globalStats.standardCount} zones`, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                { label: isAr ? `بعيد: ${globalStats.remoteCount} مناطق` : `Remote: ${globalStats.remoteCount} zones`, color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
              ].map((tier, i) => (
                <span key={i} className={cn('text-[10px] px-2 py-1 rounded-full border font-medium', tier.color)}>
                  {tier.label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ Toolbar ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن منطقة أو مدينة...' : 'Search for an area or city...'}
                className={cn(
                  'w-full h-9 rounded-lg border border-border/60 bg-muted/30 text-sm',
                  'ps-9 pe-3 placeholder:text-muted-foreground/50',
                  'focus:outline-none focus:ring-2 focus:ring-nabdh-primary/30 focus:border-nabdh-primary/50',
                  'transition-all duration-200'
                )}
                dir={direction}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute end-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                >
                  <X className="size-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Price Filter Pills */}
            <div className="hidden sm:flex items-center gap-1">
              {(Object.keys(priceFilterLabels) as Array<keyof typeof priceFilterLabels>).map((key) => (
                <button
                  key={key}
                  onClick={() => setPriceFilter(key)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all border',
                    priceFilter === key
                      ? 'bg-nabdh-primary/10 border-nabdh-primary/30 text-nabdh-primary'
                      : 'bg-muted/30 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {isAr ? priceFilterLabels[key].ar : priceFilterLabels[key].en}
                </button>
              ))}
            </div>

            {/* Mobile Price Filter */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setPriceFilter(priceFilter === 'all' ? 'economy' : priceFilter === 'economy' ? 'standard' : priceFilter === 'standard' ? 'remote' : 'all')}
                className={cn(
                  'flex items-center gap-1 px-2.5 h-9 rounded-lg border text-[10px] font-medium',
                  priceFilter !== 'all'
                    ? 'border-nabdh-primary/30 bg-nabdh-primary/10 text-nabdh-primary'
                    : 'border-border/60 bg-muted/30 text-muted-foreground'
                )}
              >
                <Filter className="size-3" />
                {isAr ? priceFilterLabels[priceFilter].ar : priceFilterLabels[priceFilter].en}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border/60 overflow-hidden">
              <button
                onClick={() => setViewMode('accordion')}
                className={cn(
                  'w-8 h-9 flex items-center justify-center transition-colors',
                  viewMode === 'accordion' ? 'bg-nabdh-primary text-white' : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                )}
                title={isAr ? 'قائمة' : 'List'}
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  'w-8 h-9 flex items-center justify-center transition-colors',
                  viewMode === 'cards' ? 'bg-nabdh-primary text-white' : 'bg-muted/30 text-muted-foreground hover:text-foreground'
                )}
                title={isAr ? 'بطاقات' : 'Cards'}
              >
                <List className="size-3.5" />
              </button>
            </div>

            {/* Expand/Collapse All */}
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[10px] text-muted-foreground hover:text-nabdh-primary"
                onClick={expandAll}
              >
                <ChevronDown className="size-3 me-0.5" />
                {isAr ? 'عرض الكل' : 'Expand'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[10px] text-muted-foreground hover:text-nabdh-primary"
                onClick={collapseAll}
              >
                <ChevronUp className="size-3 me-0.5" />
                {isAr ? 'إغلاق الكل' : 'Collapse'}
              </Button>
            </div>

            {/* Results count */}
            {(searchQuery.trim() || priceFilter !== 'all') && (
              <span className="text-[10px] text-muted-foreground hidden lg:inline">
                {matchingZonesCount} {isAr ? 'منطقة' : 'zones'}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ═══ Content ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* No Results */}
        {filteredRegions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <MapPin className="size-6 text-muted-foreground/50" />
            </div>
            <p className="text-base font-semibold text-foreground/70">
              {isAr ? 'لم يتم العثور على مناطق مطابقة' : 'No matching zones found'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr ? 'جرّب تغيير معايير البحث أو التصفية' : 'Try changing your search or filter criteria'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => { setSearchQuery(''); setPriceFilter('all'); }}
            >
              {isAr ? 'مسح الفلاتر' : 'Clear Filters'}
            </Button>
          </motion.div>
        )}

        {/* Region Sections */}
        <div className="space-y-3 sm:space-y-4">
          {filteredRegions.map((region, regionIndex) => (
            <RegionSection
              key={region.id}
              region={region}
              regionIndex={regionIndex}
              isExpanded={effectiveExpanded.has(region.id)}
              onToggle={() => toggleRegion(region.id)}
              viewMode={viewMode}
              isAr={isAr}
              currency={currency}
              searchQuery={searchQuery}
            />
          ))}
        </div>

        {/* ═══ Delivery Info Section ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          {/* Why Choose Us */}
          <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
            <Sparkles className="size-5 text-nabdh-primary" />
            {isAr ? 'لماذا نبض المدينة؟' : 'Why City Pulse?'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                icon: Zap,
                title: isAr ? 'توصيل سريع' : 'Fast Delivery',
                desc: isAr ? 'توصيل خلال 24 ساعة لمناطق طرابلس والضواحي' : 'Delivery within 24 hours for Tripoli & suburbs',
                gradient: 'from-teal-500 to-cyan-500',
              },
              {
                icon: ShieldCheck,
                title: isAr ? 'ضمان الاستلام' : 'Delivery Guarantee',
                desc: isAr ? 'ضمان استلام طلبك بأمان أو استرداد كامل للمبلغ' : 'Guaranteed safe delivery or full refund',
                gradient: 'from-emerald-500 to-green-500',
              },
              {
                icon: TrendingDown,
                title: isAr ? 'أسعار تنافسية' : 'Competitive Prices',
                desc: isAr ? 'رسوم توصيل تبدأ من 10 د.ل فقط' : 'Delivery fees starting from just 10 LYD',
                gradient: 'from-amber-500 to-orange-500',
              },
              {
                icon: Phone,
                title: isAr ? 'دعم متواصل' : '24/7 Support',
                desc: isAr ? 'فريق دعم متاح على مدار الساعة لمساعدتك' : 'Support team available around the clock',
                gradient: 'from-rose-500 to-pink-500',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="glass-card rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className={cn('size-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', item.gradient)}>
                    <Icon className="size-5 text-white" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══ Price Legend ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 pt-6 border-t border-border/40"
        >
          <h4 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mb-3">
            <Info className="size-3.5" />
            {isAr ? 'دليل الأسعار' : 'Price Guide'}
          </h4>
          <div className="flex flex-wrap gap-3">
            {[
              { tier: getPriceTier(10), range: '10-15', desc: isAr ? 'مناطق العاصمة والقريبة' : 'Capital & nearby areas' },
              { tier: getPriceTier(20), range: '16-30', desc: isAr ? 'المناطق الرئيسية والمدن الكبرى' : 'Major cities & regions' },
              { tier: getPriceTier(40), range: '31-50', desc: isAr ? 'المناطق البعيدة والجنوب' : 'Remote areas & South' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={cn('px-2 py-1 rounded-full font-medium', item.tier.bg, item.tier.color)}>
                  {item.range} {currency}
                </span>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground/60">
            {isAr
              ? '* جميع الأسعار قابلة للتغيير. يتم التحديث يومياً لضمان دقة المعلومات. الطلبات فوق 100 د.ل قد تحصل على توصيل مجاني.'
              : '* All prices are subject to change. Updated daily for accuracy. Orders above 100 LYD may qualify for free delivery.'}
          </p>
        </motion.div>

        {/* ═══ Delivery Coverage Map Placeholder ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-nabdh-primary/5 to-nabdh-accent/5" />
            <div className="relative z-10">
              <div className="size-16 rounded-full bg-nabdh-primary/10 flex items-center justify-center mx-auto mb-4">
                <Globe2 className="size-8 text-nabdh-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {isAr ? 'تغطية شاملة في ليبيا' : 'Comprehensive Coverage Across Libya'}
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                {isAr
                  ? 'نوصل إلى أكثر من 146 منطقة في جميع أنحاء ليبيا، من طرابلس إلى الكفرة، ومن زوارة إلى طبرق'
                  : 'We deliver to over 146 zones across Libya, from Tripoli to Kufra, and from Zuwara to Tobruk'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
                {DELIVERY_REGIONS.map((region) => {
                  const config = REGION_CONFIG[region.id] || DEFAULT_REGION_CONFIG;
                  const Icon = config.icon;
                  return (
                    <div key={region.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className={cn('size-3.5', config.color)} />
                      <span>{isAr ? region.nameAr : region.nameEn}</span>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                        {region.zones.length}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
