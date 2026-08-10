'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, startTransition } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useCartStore } from '@/stores/cart-store';
import { useMobileStore } from '../lib/mobile-store';
import { BADGE_CONFIG, type ProductBadge } from '../lib/design-tokens';
import { parseAttributes } from '../lib/helpers';

import type { Product, ProductAttributes } from '../lib/types';

import {
  ChevronRight, ChevronLeft, Heart, Share2, Star, Plus, Minus,
  ShoppingCart, ShieldCheck, Truck, RotateCcw, Lock, Package,
  Clock, Zap, Sparkles, Tag, Check, ChevronDown, ChevronUp,
  MessageCircle, Eye, Send, ThumbsUp, X, Maximize2, ZoomIn, ZoomOut,
  Info, Ruler, Weight, Box, CheckCheck,
  // Category-specific icons
  Palette, Cpu, Wifi, Battery, Monitor, Bluetooth, Plug,
  Shirt, Footprints, Droplets, Baby, PawPrint, Flower2, Frame,
  CookingPot, UtensilsCrossed, CupSoda, ChefHat, Refrigerator,
  Globe, Wrench, Shield, Gauge, Layers, Move, Scan,
  Play, Volume2, Expand,
  Gift, PenLine,
} from 'lucide-react';



// ═══════════════════════════════════════════════════════════════════════
// CATEGORY CONFIG — Dynamic specs & icons per category
// ═══════════════════════════════════════════════════════════════════════
interface CategorySpecConfig {
  icon: React.ElementType;
  gradient: string;
  specGroups: Array<{
    key: keyof ProductAttributes;
    labelAr: string;
    labelEn: string;
    icon: React.ElementType;
    type: 'text' | 'list' | 'colors' | 'sizes' | 'connectivity';
  }>;
}

const CATEGORY_CONFIG: Record<string, CategorySpecConfig> = {
  'cookware': {
    icon: CookingPot,
    gradient: 'from-orange-500 to-amber-600',
    specGroups: [
      { key: 'capacity', labelAr: 'السعة', labelEn: 'Capacity', icon: Gauge, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
      { key: 'protection', labelAr: 'الحماية', labelEn: 'Protection', icon: Shield, type: 'text' },
      { key: 'warranty', labelAr: 'الضمان', labelEn: 'Warranty', icon: ShieldCheck, type: 'text' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
    ],
  },
  'kitchen-tools': {
    icon: UtensilsCrossed,
    gradient: 'from-yellow-500 to-orange-500',
    specGroups: [
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
      { key: 'warranty', labelAr: 'الضمان', labelEn: 'Warranty', icon: ShieldCheck, type: 'text' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
    ],
  },
  'serving-ware': {
    icon: CupSoda,
    gradient: 'from-emerald-500 to-teal-600',
    specGroups: [
      { key: 'capacity', labelAr: 'السعة', labelEn: 'Capacity', icon: Gauge, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
    ],
  },
  'cups-pitchers': {
    icon: CupSoda,
    gradient: 'from-cyan-500 to-blue-500',
    specGroups: [
      { key: 'capacity', labelAr: 'السعة', labelEn: 'Capacity', icon: Gauge, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
    ],
  },
  'preparation-tools': {
    icon: ChefHat,
    gradient: 'from-red-500 to-rose-600',
    specGroups: [
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
    ],
  },
  'food-storage': {
    icon: Refrigerator,
    gradient: 'from-sky-500 to-indigo-500',
    specGroups: [
      { key: 'capacity', labelAr: 'السعة', labelEn: 'Capacity', icon: Gauge, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'protection', labelAr: 'الحماية', labelEn: 'Protection', icon: Shield, type: 'text' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
    ],
  },
  'fashion-men': {
    icon: Shirt,
    gradient: 'from-slate-600 to-gray-700',
    specGroups: [
      { key: 'sizes', labelAr: 'المقاسات', labelEn: 'Sizes', icon: Ruler, type: 'sizes' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
      { key: 'fabric', labelAr: 'القماش', labelEn: 'Fabric', icon: Layers, type: 'text' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
    ],
  },
  'fashion-women': {
    icon: Shirt,
    gradient: 'from-pink-500 to-rose-500',
    specGroups: [
      { key: 'sizes', labelAr: 'المقاسات', labelEn: 'Sizes', icon: Ruler, type: 'sizes' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
      { key: 'fabric', labelAr: 'القماش', labelEn: 'Fabric', icon: Layers, type: 'text' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
    ],
  },
  'fashion-kids': {
    icon: Baby,
    gradient: 'from-purple-400 to-pink-400',
    specGroups: [
      { key: 'sizes', labelAr: 'المقاسات', labelEn: 'Sizes', icon: Ruler, type: 'sizes' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
      { key: 'fabric', labelAr: 'القماش', labelEn: 'Fabric', icon: Layers, type: 'text' },
      { key: 'ageGroup', labelAr: 'الفئة العمرية', labelEn: 'Age Group', icon: Baby, type: 'text' },
    ],
  },
  'footwear-men': {
    icon: Footprints,
    gradient: 'from-amber-700 to-yellow-800',
    specGroups: [
      { key: 'sizes', labelAr: 'المقاسات', labelEn: 'Sizes', icon: Ruler, type: 'sizes' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
      { key: 'sole', labelAr: 'النعل', labelEn: 'Sole', icon: Footprints, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
    ],
  },
  'footwear-women': {
    icon: Footprints,
    gradient: 'from-rose-400 to-pink-500',
    specGroups: [
      { key: 'sizes', labelAr: 'المقاسات', labelEn: 'Sizes', icon: Ruler, type: 'sizes' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
      { key: 'sole', labelAr: 'النعل', labelEn: 'Sole', icon: Footprints, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
    ],
  },
  'footwear-kids': {
    icon: Footprints,
    gradient: 'from-teal-400 to-emerald-500',
    specGroups: [
      { key: 'sizes', labelAr: 'المقاسات', labelEn: 'Sizes', icon: Ruler, type: 'sizes' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
      { key: 'sole', labelAr: 'النعل', labelEn: 'Sole', icon: Footprints, type: 'text' },
      { key: 'ageGroup', labelAr: 'الفئة العمرية', labelEn: 'Age Group', icon: Baby, type: 'text' },
    ],
  },
  'perfumes-oud': {
    icon: Droplets,
    gradient: 'from-amber-600 to-yellow-700',
    specGroups: [
      { key: 'fragrance', labelAr: 'العطر', labelEn: 'Fragrance', icon: Droplets, type: 'text' },
      { key: 'capacity', labelAr: 'السعة', labelEn: 'Capacity', icon: Gauge, type: 'text' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
    ],
  },
  'accessories': {
    icon: Palette,
    gradient: 'from-violet-500 to-purple-600',
    specGroups: [
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
      { key: 'warranty', labelAr: 'الضمان', labelEn: 'Warranty', icon: ShieldCheck, type: 'text' },
    ],
  },
  'mother-baby': {
    icon: Baby,
    gradient: 'from-pink-300 to-rose-400',
    specGroups: [
      { key: 'ageGroup', labelAr: 'الفئة العمرية', labelEn: 'Age Group', icon: Baby, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
      { key: 'protection', labelAr: 'الحماية', labelEn: 'Safety', icon: Shield, type: 'text' },
    ],
  },
  'home-care': {
    icon: Wrench,
    gradient: 'from-teal-500 to-cyan-600',
    specGroups: [
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
    ],
  },
  'electrical-appliances': {
    icon: Plug,
    gradient: 'from-yellow-500 to-orange-500',
    specGroups: [
      { key: 'power', labelAr: 'القوة', labelEn: 'Power', icon: Zap, type: 'text' },
      { key: 'capacity', labelAr: 'السعة', labelEn: 'Capacity', icon: Gauge, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'warranty', labelAr: 'الضمان', labelEn: 'Warranty', icon: ShieldCheck, type: 'text' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
    ],
  },
  'electronics': {
    icon: Cpu,
    gradient: 'from-blue-600 to-indigo-700',
    specGroups: [
      { key: 'screenSize', labelAr: 'حجم الشاشة', labelEn: 'Screen Size', icon: Monitor, type: 'text' },
      { key: 'connectivity', labelAr: 'الاتصال', labelEn: 'Connectivity', icon: Wifi, type: 'connectivity' },
      { key: 'power', labelAr: 'القوة', labelEn: 'Power', icon: Battery, type: 'text' },
      { key: 'capacity', labelAr: 'السعة', labelEn: 'Storage', icon: Box, type: 'text' },
      { key: 'warranty', labelAr: 'الضمان', labelEn: 'Warranty', icon: ShieldCheck, type: 'text' },
      { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
    ],
  },
  'ornamental-plants': {
    icon: Flower2,
    gradient: 'from-green-500 to-emerald-600',
    specGroups: [
      { key: 'plantType', labelAr: 'نوع النبات', labelEn: 'Plant Type', icon: Flower2, type: 'text' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
    ],
  },
  'pet-supplies': {
    icon: PawPrint,
    gradient: 'from-orange-400 to-amber-500',
    specGroups: [
      { key: 'petType', labelAr: 'نوع الحيوان', labelEn: 'Pet Type', icon: PawPrint, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
    ],
  },
  'children-toys': {
    icon: Baby,
    gradient: 'from-purple-400 to-indigo-500',
    specGroups: [
      { key: 'ageGroup', labelAr: 'الفئة العمرية', labelEn: 'Age Group', icon: Baby, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
      { key: 'protection', labelAr: 'الحماية', labelEn: 'Safety', icon: Shield, type: 'text' },
    ],
  },
  'gifts-antiques': {
    icon: Frame,
    gradient: 'from-amber-500 to-yellow-600',
    specGroups: [
      { key: 'finish', labelAr: 'التشطيب', labelEn: 'Finish', icon: Sparkles, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
    ],
  },
  'wall-art': {
    icon: Frame,
    gradient: 'from-slate-500 to-zinc-600',
    specGroups: [
      { key: 'finish', labelAr: 'التشطيب', labelEn: 'Finish', icon: Sparkles, type: 'text' },
      { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
      { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
    ],
  },
};

// Default fallback config
const DEFAULT_CONFIG: CategorySpecConfig = {
  icon: Package,
  gradient: 'from-gray-500 to-gray-600',
  specGroups: [
    { key: 'materials', labelAr: 'المواد', labelEn: 'Materials', icon: Layers, type: 'list' },
    { key: 'countryOfOrigin', labelAr: 'بلد المنشأ', labelEn: 'Country of Origin', icon: Globe, type: 'text' },
    { key: 'warranty', labelAr: 'الضمان', labelEn: 'Warranty', icon: ShieldCheck, type: 'text' },
    { key: 'colors', labelAr: 'الألوان', labelEn: 'Colors', icon: Palette, type: 'colors' },
  ],
};

// ═══════════════════════════════════════════════════════════════════════
// CONNECTIVITY ICON MAP
// ═══════════════════════════════════════════════════════════════════════
const CONNECTIVITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi, bluetooth: Bluetooth, usb: Plug, nfc: Cpu, '5g': Signal,
  '4g': Signal, lte: Signal, ethernet: Plug, hdmi: Monitor, 'usb-c': Plug,
};
function Signal(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return <Wifi {...props} />;
}

// ═══════════════════════════════════════════════════════════════════════
// PRODUCT DETAIL SCREEN — Dynamic Professional Edition
// ═══════════════════════════════════════════════════════════════════════
export function ProductDetailScreen() {
  const { t, language } = useLanguageStore();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRtl = language === 'ar';

  const product = useMobileStore((s) => s.selectedProduct);
  const favorites = useMobileStore((s) => s.favorites);
  const toggleFavorite = useMobileStore((s) => s.toggleFavorite);
  const pushNavHistory = useMobileStore((s) => s.pushNavHistory);
  const setStoreActiveTab = useMobileStore((s) => s.setActiveTab);
  const setSelectedProduct = useMobileStore((s) => s.setSelectedProduct);
  const allProducts = useMobileStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const darkMode = useMobileStore((s) => s.darkMode);

  // ─── State ────────────────────────────────────────────────────
  const [currentImg, setCurrentImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [hoverStar, setHoverStar] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const headerOpacity = useTransform(scrollY, [0, 200], [0, 1]);

  const touchStartX = useRef(0);

  // ─── Professional Zoom State ──────────────────────────────────
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomX, setZoomX] = useState(0);
  const [zoomY, setZoomY] = useState(0);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const lastTapRef = useRef(0);
  const pinchStartDist = useRef(0);
  const pinchStartScale = useRef(1);
  const panStartRef = useRef({ x: 0, y: 0, zoomXStart: 0, zoomYStart: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const isPinching = useRef(false);

  const MAGNIFIER_SIZE = 160;
  const MAGNIFIER_ZOOM = 2.5;
  const MAX_ZOOM = 5;
  const MIN_ZOOM = 1;
  const ZOOM_STEP = 0.5;

  const resetZoom = useCallback(() => {
    setZoomScale(1); setZoomX(0); setZoomY(0); setShowMagnifier(false); setIsZooming(false);
  }, []);

  // Scroll to top on mount — ensures the page starts from the top
  // even if the component is reused with the same product
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomScale(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
    setIsZooming(true);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale(prev => {
      const next = Math.max(MIN_ZOOM, prev - ZOOM_STEP);
      if (next <= MIN_ZOOM) { setZoomX(0); setZoomY(0); setIsZooming(false); }
      return next;
    });
  }, []);

  // ─── Track container dimensions for magnifier ────────────────
  useEffect(() => {
    const el = imageContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerSize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    ro.observe(el);
    setContainerSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // ─── Fetch reviews from API + check review eligibility ──────────
  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    setReviewsLoading(true);
    (async () => {
      try {
        const user = useMobileStore.getState().user;
        const userIdParam = user?.id ? `&userId=${user.id}` : '';
        const res = await fetch(`/api/reviews?productId=${product.id}&limit=10${userIdParam}`);
        const data = await res.json();
        if (!cancelled) {
          setReviews(data.reviews || []);
          if (user?.id) {
            setCanReview(data.canReview || false);
            setHasReviewed(data.hasReviewed || false);
            setExistingReview(data.existingReview || null);
            // Pre-fill if existing review
            if (data.existingReview) {
              setNewReviewRating(data.existingReview.rating || 0);
              setNewReviewTitle(data.existingReview.title || '');
              setNewReviewComment(data.existingReview.comment || '');
            }
          }
        }
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [product?.id]);

  // ─── Reset on product change ──────────────────────────────────
  useEffect(() => {
    startTransition(() => {
      setCurrentImg(0); setQuantity(1); setAdded(false); setDescExpanded(false);
      setActiveTab('description'); setIsFullscreen(false); setImageLoaded({});
      setSelectedSize(null); setSelectedColor(null); setShowVideo(false);
      resetZoom();
    });
    // Delay scroll to top slightly so the slide-up animation has started
    // and the scrollRef container is ready
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }, 50);
    return () => clearTimeout(timer);
  }, [product?.id, resetZoom]);

  // ─── Derived data ─────────────────────────────────────────────
  const images = useMemo(() => {
    if (!product) return [];
    const parsed = product.images
      ? Array.isArray(product.images) ? product.images
        : typeof product.images === 'string'
          ? (() => { try { const p = JSON.parse(product.images); return Array.isArray(p) ? p : [product.images]; } catch { return [product.images]; } })()
          : []
      : [];
    return parsed.length > 0 ? parsed : product.mainImage || product.image ? [product.mainImage || product.image || ''] : [];
  }, [product]);

  const attrs = useMemo(() => {
    if (!product) return undefined;
    return product.attributes ?? parseAttributes((product as any).attributes);
  }, [product]);

  const categorySlug = product?.category?.slug || '';
  const categoryConfig = CATEGORY_CONFIG[categorySlug] || DEFAULT_CONFIG;

  // ─── Dynamic Specifications ───────────────────────────────────
  const specifications = useMemo(() => {
    if (!product) return [];
    const specs: Array<{ key: string; value: string; icon: React.ElementType; type: string }> = [];

    // Basic specs
    if (product.category) {
      specs.push({ key: t('product.categoryLabel'), value: language === 'ar' ? product.category.nameAr : product.category.nameEn, icon: categoryConfig.icon, type: 'text' });
    }
    if (product.sku) specs.push({ key: 'SKU', value: product.sku, icon: Tag, type: 'text' });
    if (product.weight) specs.push({ key: t('product.weight'), value: `${product.weight} ${language === 'ar' ? 'كجم' : 'kg'}`, icon: Weight, type: 'text' });

    // Dimensions from attributes
    if (attrs?.width && attrs?.height && attrs?.depth) {
      specs.push({ key: t('product.dimensions'), value: `${attrs.width}×${attrs.height}×${attrs.depth} ${language === 'ar' ? 'سم' : 'cm'}`, icon: Ruler, type: 'text' });
    } else if (product.dimensions) {
      specs.push({ key: t('product.dimensions'), value: product.dimensions, icon: Ruler, type: 'text' });
    }

    // Category-specific attributes
    for (const group of categoryConfig.specGroups) {
      const val = attrs?.[group.key];
      if (!val) continue;
      if (group.type === 'text') {
        const textVal = typeof val === 'object' ? (language === 'ar' ? (val as any).ar : (val as any).en) : String(val);
        if (textVal) specs.push({ key: group.labelAr, value: textVal, icon: group.icon, type: 'text' });
      } else if (group.type === 'list' && Array.isArray(val)) {
        const listStr = val.map((v: any) => language === 'ar' ? v.ar : v.en).join(', ');
        if (listStr) specs.push({ key: group.labelAr, value: listStr, icon: group.icon, type: 'text' });
      } else if (group.type === 'sizes' && Array.isArray(val)) {
        specs.push({ key: group.labelAr, value: val.join(', '), icon: group.icon, type: 'sizes' });
      } else if (group.type === 'colors' && Array.isArray(val)) {
        specs.push({ key: group.labelAr, value: val.map((c: any) => language === 'ar' ? c.nameAr : c.nameEn).join(', '), icon: group.icon, type: 'colors' });
      } else if (group.type === 'connectivity' && Array.isArray(val)) {
        specs.push({ key: group.labelAr, value: val.join(', '), icon: group.icon, type: 'connectivity' });
      }
    }

    // Stock
    const stockLevel = product.stock ?? 99;
    const isOutOfStock = stockLevel === 0 || product.inStock === false;
    specs.push({ key: t('product.inStockLabel'), value: isOutOfStock ? t('product.outOfStock') : `${stockLevel} ${language === 'ar' ? 'قطعة' : 'pcs'}`, icon: Package, type: 'text' });

    // Discount
    const disc = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
    if (disc > 0) specs.push({ key: t('common.discount'), value: `${disc}%`, icon: Tag, type: 'text' });

    return specs;
  }, [product, language, t, attrs, categoryConfig]);

  // ─── Touch handlers ───────────────────────────────────────────
  const getTouchDistance = useCallback((t1: React.Touch, t2: React.Touch) =>
    Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2), []);

  const handleMagnifierMove = useCallback((clientX: number, clientY: number) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    setMagnifierPos({ x: clientX - rect.left, y: clientY - rect.top });
  }, []);

  const handleImageMouseEnter = useCallback(() => { if (zoomScale <= 1) setShowMagnifier(true); }, [zoomScale]);
  const handleImageMouseLeave = useCallback(() => { setShowMagnifier(false); }, []);
  const handleImageMouseMove = useCallback((e: React.MouseEvent) => { handleMagnifierMove(e.clientX, e.clientY); }, [handleMagnifierMove]);

  const handleGalleryTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinching.current = true;
      pinchStartDist.current = getTouchDistance(e.touches[0], e.touches[1]);
      pinchStartScale.current = zoomScale;
      return;
    }
    if (e.touches.length === 1) {
      const now = Date.now();
      const timeDiff = now - lastTapRef.current;
      lastTapRef.current = now;
      if (timeDiff < 300) {
        if (zoomScale > 1) { resetZoom(); } else { setZoomScale(2.5); setIsZooming(true); }
        return;
      }
      touchStartX.current = e.touches[0].clientX;
      if (zoomScale > 1) {
        panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, zoomXStart: zoomX, zoomYStart: zoomY };
      } else {
        handleMagnifierMove(e.touches[0].clientX, e.touches[0].clientY);
        setShowMagnifier(true);
      }
    }
  }, [zoomScale, zoomX, zoomY, getTouchDistance, resetZoom, handleMagnifierMove]);

  const handleGalleryTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching.current) {
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, pinchStartScale.current * (dist / pinchStartDist.current)));
      setZoomScale(newScale); setIsZooming(newScale > 1);
      if (newScale <= 1) { setZoomX(0); setZoomY(0); }
      return;
    }
    if (e.touches.length === 1) {
      if (zoomScale > 1) {
        const dx = e.touches[0].clientX - panStartRef.current.x;
        const dy = e.touches[0].clientY - panStartRef.current.y;
        setZoomX(panStartRef.current.zoomXStart + dx * 0.8);
        setZoomY(panStartRef.current.zoomYStart + dy * 0.8);
        setShowMagnifier(false);
      } else {
        handleMagnifierMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }
  }, [zoomScale, getTouchDistance, handleMagnifierMove]);

  const handleGalleryTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) isPinching.current = false;
    if (e.touches.length === 0) {
      setShowMagnifier(false);
      if (zoomScale <= 1 && !isZooming) {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) {
          if (diff > 0) setCurrentImg(p => Math.max(0, p - 1));
          else setCurrentImg(p => Math.min(images.length - 1, p + 1));
        }
      }
    }
  }, [zoomScale, isZooming, images.length]);

  // ─── Action handlers ──────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addItem({ productId: product.id, nameAr: product.nameAr, nameEn: product.nameEn, price: product.price, image: product.mainImage || product.image || '', stock: product.stock || 99, quantity });
    setAdded(true);
    setTimeout(() => {
      // Push navigation history before redirecting so user can go back
      useMobileStore.getState().pushNavHistory();
      useMobileStore.getState().setActiveTab('cart');
      useMobileStore.getState().setSelectedProduct(null);
    }, 400);
  }, [product, quantity, addItem]);

  const handleClose = useCallback(() => { useMobileStore.getState().setSelectedProduct(null); }, []);

  const handleShare = useCallback(async () => {
    if (!product) return;
    const name = language === 'ar' ? product.nameAr : product.nameEn;
    try {
      if (navigator.share) { await navigator.share({ title: name, text: `${name} - ${product.price} ${t('product.currency')}`, url: window.location.href }); }
      else { await navigator.clipboard.writeText(window.location.href); setShowShareToast(true); setTimeout(() => setShowShareToast(false), 2500); }
    } catch { try { await navigator.clipboard.writeText(window.location.href); setShowShareToast(true); setTimeout(() => setShowShareToast(false), 2500); } catch {} }
  }, [product, language, t]);

  const handleSubmitReview = useCallback(async () => {
    if (newReviewRating === 0 || !newReviewComment.trim() || submittingReview) return;
    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          productId: product?.id,
          rating: newReviewRating,
          title: newReviewTitle || null,
          comment: newReviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSuccess(true);
        setTimeout(() => {
          setShowWriteReview(false);
          setReviewSuccess(false);
          // Refresh reviews
          setReviewsLoading(true);
          fetch(`/api/reviews?productId=${product?.id}&limit=10`)
            .then(r => r.json())
            .then(d => setReviews(d.reviews || []))
            .catch(() => {})
            .finally(() => setReviewsLoading(false));
        }, 1500);
      } else {
        alert(data.error || data.errorEn || (language === 'ar' ? 'فشل إرسال التقييم' : 'Failed to submit review'));
      }
    } catch {
      alert(language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error');
    } finally {
      setSubmittingReview(false);
    }
  }, [newReviewRating, newReviewTitle, newReviewComment, submittingReview, product?.id, language]);

  const getTimeAgo = useCallback((dateStr: string): string => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days < 1) return t('common.today');
    if (days < 7) return language === 'ar' ? `منذ ${days} أيام` : `${days}d ago`;
    if (days < 30) return language === 'ar' ? `منذ ${Math.floor(days / 7)} أسبوع` : `${Math.floor(days / 7)}w ago`;
    return language === 'ar' ? `منذ ${Math.floor(days / 30)} شهر` : `${Math.floor(days / 30)}mo ago`;
  }, [language, t]);

  // ─── Early return ─────────────────────────────────────────────
  if (!product) return null;

  // ─── Simple derived ───────────────────────────────────────────
  const isFavorite = favorites.includes(product.id);
  const name = language === 'ar' ? product.nameAr : product.nameEn;
  const description = language === 'ar' ? product.descriptionAr : (product as any).descriptionEn || product.descriptionAr;
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const savings = product.comparePrice ? product.comparePrice - product.price : 0;
  const stockLevel = product.stock ?? 99;
  const isLowStock = stockLevel > 0 && stockLevel <= 5;
  const isOutOfStock = stockLevel === 0 || product.inStock === false;
  const relatedProducts = allProducts.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 8);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : product.rating || 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length, percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0 }));
  const CatIcon = categoryConfig.icon;

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ═══ Fullscreen Image Modal with Zoom ═══ */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button onClick={() => { setIsFullscreen(false); resetZoom(); }} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <X size={22} className="text-white" />
            </button>
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleZoomIn} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"><ZoomIn size={20} className="text-white" /></motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleZoomOut} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center"><ZoomOut size={20} className="text-white" /></motion.button>
              {zoomScale > 1 && <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }} onClick={resetZoom} className="w-10 h-10 rounded-full bg-[#FF6F61] flex items-center justify-center"><X size={20} className="text-white" /></motion.button>}
            </div>
            {zoomScale > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm">
                <span className="text-white text-xs font-bold">{Math.round(zoomScale * 100)}%</span>
              </div>
            )}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10" dir="ltr">
              {images.map((_, i) => (<button key={i} onClick={() => { setCurrentImg(i); resetZoom(); }} className={`h-2 rounded-full transition-all ${i === currentImg ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={currentImg} className="w-full h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {images[currentImg] ? (
                  <motion.img src={images[currentImg]} alt={name} className="w-full h-full object-contain"
                    style={{ transform: `scale(${zoomScale}) translate(${zoomX / zoomScale}px, ${zoomY / zoomScale}px)`, transformOrigin: 'center center', cursor: zoomScale > 1 ? 'grab' : 'zoom-in' }}
                    animate={{ scale: zoomScale, x: zoomX, y: zoomY }} transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }} draggable={false}
                  />
                ) : (<div className="w-full h-full flex items-center justify-center"><Package size={100} className="text-gray-600" /></div>)}
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 z-[5]" onTouchStart={handleGalleryTouchStart} onTouchMove={handleGalleryTouchMove} onTouchEnd={handleGalleryTouchEnd} style={{ touchAction: isZooming ? 'none' : 'pan-y' }} />
            <button onClick={() => { setCurrentImg(p => Math.max(0, p - 1)); resetZoom(); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 flex items-center justify-center z-10" style={{ opacity: currentImg > 0 ? 1 : 0.3 }}><ChevronLeft size={24} className="text-white" /></button>
            <button onClick={() => { setCurrentImg(p => Math.min(images.length - 1, p + 1)); resetZoom(); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 flex items-center justify-center z-10" style={{ opacity: currentImg < images.length - 1 ? 1 : 0.3 }}><ChevronRight size={24} className="text-white" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Share Toast ═══ */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div className="fixed top-16 left-1/2 -translate-x-1/2 z-[90] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
            style={{ background: darkMode ? '#151D2E' : '#fff', border: '1px solid ' + (darkMode ? '#1E2A42' : '#E5E5E5') }}
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          >
            <CheckCheck size={18} className="text-[#238636]" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Write Review Modal ═══ */}
      <AnimatePresence>
        {showWriteReview && (
          <motion.div className="absolute inset-0 z-[80] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowWriteReview(false)} />
            <motion.div className="relative w-full bg-white dark:bg-[#151D2E] rounded-t-3xl p-5 pb-8 max-h-[85%] overflow-y-auto" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }} dir={direction}>
              <div className="w-10 h-1 bg-gray-300 dark:bg-[#1E2A42] rounded-full mx-auto mb-5" />

              {reviewSuccess ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                    <Check size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{language === 'ar' ? 'تم إرسال تقييمك بنجاح!' : 'Review submitted successfully!'}</h3>
                  <p className="text-sm text-gray-500">{language === 'ar' ? 'شكراً لمساعدتنا - حصلت على 50 نقطة ولاء' : 'Thanks for your help — you earned 50 loyalty points'}</p>
                </motion.div>
              ) : !canReview ? (
                <div className="flex flex-col items-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#004B63]/10 flex items-center justify-center mb-4">
                    <ShieldCheck size={32} className="text-[#004B63]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{language === 'ar' ? 'يتطلب شراء مؤكد' : 'Purchase Required'}</h3>
                  <p className="text-sm text-gray-500 text-center leading-relaxed">{language === 'ar' ? 'يمكن فقط للمشترين الذين تم توصيل طلبهم تقييم هذا المنتج' : 'Only buyers with a delivered order can review this product'}</p>
                  {/* Eligibility rules */}
                  <div className="mt-4 space-y-2 w-full max-w-xs">
                    {[
                      { icon: ShieldCheck, text: language === 'ar' ? 'فقط المشترين الذين تم توصيل طلبهم يمكنهم التقييم' : 'Only buyers with delivered orders can rate', color: '#238636' },
                      { icon: Star, text: language === 'ar' ? 'تقييم واحد لكل منتج لكل مستخدم' : 'One review per product per user', color: '#D4A843' },
                      { icon: Gift, text: language === 'ar' ? 'التقييم الموثق يحصل على +50 نقطة ولاء' : 'Verified review earns +50 loyalty points', color: '#D4A843' },
                      { icon: PenLine, text: language === 'ar' ? 'يمكنك تعديل تقييمك في أي وقت' : 'You can edit your review anytime', color: '#004B63' },
                    ].map((rule, i) => {
                      const RuleIcon = rule.icon;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${rule.color}15` }}>
                            <RuleIcon size={11} style={{ color: rule.color }} />
                          </div>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 text-start">{rule.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setShowWriteReview(false)} className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                    {language === 'ar' ? 'حسناً' : 'OK'}
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {hasReviewed ? (language === 'ar' ? 'تعديل تقييمك' : 'Edit Your Review') : (language === 'ar' ? 'أضف تقييمك' : 'Write Your Review')}
                  </h3>
                  {/* Verified buyer badge */}
                  <div className="flex items-center gap-1.5 mb-4">
                    <Check size={12} className="text-emerald-500" />
                    <span className="text-[11px] font-semibold text-emerald-600">{language === 'ar' ? 'مشتري مؤكد — تقييم موثق' : 'Verified Buyer — Confirmed purchase'}</span>
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center gap-2 mb-4" dir="ltr">
                    {[1, 2, 3, 4, 5].map(star => (
                      <motion.button key={star} whileTap={{ scale: 0.85 }} onClick={() => setNewReviewRating(star)} onMouseEnter={() => setHoverStar(star)} onMouseLeave={() => setHoverStar(0)} className="p-1">
                        <Star size={32} className={`transition-all ${(hoverStar || newReviewRating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                      </motion.button>
                    ))}
                    {newReviewRating > 0 && <span className="text-sm font-bold text-gray-600 dark:text-gray-400 ms-2">{['', language === 'ar' ? 'سيء' : 'Poor', language === 'ar' ? 'مقبول' : 'Fair', language === 'ar' ? 'جيد' : 'Good', language === 'ar' ? 'جيد جداً' : 'Very Good', language === 'ar' ? 'ممتاز' : 'Excellent'][newReviewRating]}</span>}
                  </div>

                  {/* Title field */}
                  <input
                    value={newReviewTitle}
                    onChange={(e) => setNewReviewTitle(e.target.value.slice(0, 60))}
                    placeholder={language === 'ar' ? 'عنوان التقييم (اختياري)' : 'Review title (optional)'}
                    className="w-full rounded-xl border-2 border-gray-200 dark:border-[#1E2A42] bg-gray-50 dark:bg-[#0B1120] p-3 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-[#00A8CC] transition-colors mb-3"
                    dir={direction}
                    maxLength={60}
                  />

                  {/* Comment field */}
                  <textarea
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder={language === 'ar' ? 'شاركنا رأيك في المنتج... (10 أحرف على الأقل)' : 'Share your opinion... (minimum 10 characters)'}
                    className="w-full h-28 rounded-xl border-2 border-gray-200 dark:border-[#1E2A42] bg-gray-50 dark:bg-[#0B1120] p-4 text-sm text-gray-800 dark:text-gray-200 resize-none outline-none focus:border-[#00A8CC] transition-colors"
                    dir={direction}
                  />
                  <div className="flex justify-between mt-1 mb-3">
                    <span className="text-[10px] text-gray-400">{newReviewComment.length < 10 ? `${10 - newReviewComment.length} ${language === 'ar' ? 'أحرف متبقية' : 'chars remaining'}` : '✓'}</span>
                    <span className="text-[10px] text-gray-400">{newReviewComment.length}/500</span>
                  </div>

                  {/* Submit button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmitReview}
                    disabled={newReviewRating === 0 || newReviewComment.trim().length < 10 || submittingReview}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
                  >
                    {submittingReview ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        {hasReviewed ? (language === 'ar' ? 'تحديث التقييم' : 'Update Review') : (language === 'ar' ? 'إرسال التقييم' : 'Submit Review')}
                      </>
                    )}
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          MAIN PRODUCT DETAIL SCREEN
      ══════════════════════════════════════════════════════════════ */}
      <motion.div className="absolute inset-0 z-40 bg-white dark:bg-[#0B1120] flex flex-col" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }} dir={direction}>

        {/* ─── Fixed Top Bar ─── */}
        <motion.div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-10 pb-3"
          style={{ background: headerOpacity.get() > 0.5 ? (darkMode ? 'rgba(13,17,23,0.95)' : 'rgba(255,255,255,0.95)') : 'transparent', backdropFilter: headerOpacity.get() > 0.5 ? 'blur(12px)' : 'none' }}
        >
          <motion.button whileTap={{ scale: 0.85 }} onClick={handleClose} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: darkMode ? 'rgba(22,27,34,0.85)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
            {isRtl ? <ChevronRight size={22} className="text-gray-700 dark:text-gray-200" /> : <ChevronLeft size={22} className="text-gray-700 dark:text-gray-200" />}
          </motion.button>
          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.85 }} onClick={handleShare} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: darkMode ? 'rgba(22,27,34,0.85)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
              <Share2 size={18} className="text-gray-700 dark:text-gray-200" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => {
              const wasFavorite = favorites.includes(product.id);
              toggleFavorite(product.id);
              if (!wasFavorite) {
                // Navigate to favorites tab after adding
                setSelectedProduct(null);
                pushNavHistory();
                setStoreActiveTab('favorites');
              }
            }} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: darkMode ? 'rgba(22,27,34,0.85)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
              <motion.div animate={{ scale: isFavorite ? [1, 1.3, 1] : 1 }} transition={{ duration: 0.3 }}>
                <Heart size={18} className={`transition-all ${isFavorite ? 'fill-[#FF6F61] text-[#FF6F61]' : 'text-gray-600 dark:text-gray-300'}`} />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>

        {/* ─── Scrollable Content ─── */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef} data-product-detail-scroll>

          {/* ═══ Image Gallery with Professional Zoom ═══ */}
          <div ref={imageContainerRef} className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A2540] dark:to-[#151D2E]"
            style={{ height: zoomScale > 1 ? '100vh' : 340, touchAction: isZooming ? 'none' : 'pan-y' }}
            onTouchStart={handleGalleryTouchStart} onTouchMove={handleGalleryTouchMove} onTouchEnd={handleGalleryTouchEnd}
            onMouseEnter={handleImageMouseEnter} onMouseLeave={handleImageMouseLeave} onMouseMove={handleImageMouseMove}
          >
            <AnimatePresence mode="wait">
              <motion.div key={currentImg} className="w-full h-full overflow-hidden relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {images[currentImg] ? (
                  <>
                    {!imageLoaded[currentImg] && <div className="absolute inset-0 bg-gray-200 dark:bg-[#1A2540] animate-pulse" />}
                    <motion.img src={images[currentImg]} alt={name}
                      className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoaded[currentImg] ? 'opacity-100' : 'opacity-0'}`}
                      style={{ transform: `scale(${zoomScale}) translate(${zoomX / zoomScale}px, ${zoomY / zoomScale}px)`, transformOrigin: 'center center', cursor: zoomScale > 1 ? 'grab' : 'zoom-in' }}
                      animate={{ scale: zoomScale, x: zoomX, y: zoomY }} transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                      loading="lazy" onLoad={() => setImageLoaded(prev => ({ ...prev, [currentImg]: true }))} draggable={false}
                    />
                  </>
                ) : (<div className="w-full h-full flex items-center justify-center"><Package size={72} className="text-gray-300 dark:text-gray-600" /></div>)}
              </motion.div>
            </AnimatePresence>

            {/* Magnifier Lens */}
            {showMagnifier && images[currentImg] && zoomScale <= 1 && (
              <div className="absolute pointer-events-none z-20 rounded-full border-4 border-white shadow-2xl overflow-hidden"
                style={{ width: MAGNIFIER_SIZE, height: MAGNIFIER_SIZE, left: magnifierPos.x - MAGNIFIER_SIZE / 2, top: magnifierPos.y - MAGNIFIER_SIZE / 2, boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)' }}
              >
                <div style={{ width: MAGNIFIER_SIZE * MAGNIFIER_ZOOM, height: MAGNIFIER_SIZE * MAGNIFIER_ZOOM, backgroundImage: `url(${images[currentImg]})`, backgroundSize: `${containerSize.width * MAGNIFIER_ZOOM || 600}px ${containerSize.height * MAGNIFIER_ZOOM || 600}px`, backgroundPosition: `-${magnifierPos.x * MAGNIFIER_ZOOM - MAGNIFIER_SIZE / 2}px -${magnifierPos.y * MAGNIFIER_ZOOM - MAGNIFIER_SIZE / 2}px`, backgroundRepeat: 'no-repeat' }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4 h-0.5 bg-white/60 rounded-full absolute" />
                  <div className="h-4 w-0.5 bg-white/60 rounded-full absolute" />
                </div>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsFullscreen(true)} className="w-9 h-9 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center"><Maximize2 size={16} className="text-white" /></motion.button>
              {zoomScale > 1 && (
                <>
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }} onClick={handleZoomOut} className="w-9 h-9 rounded-lg bg-black/40 backdrop-blur-sm flex items-center justify-center"><ZoomOut size={16} className="text-white" /></motion.button>
                  <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }} onClick={resetZoom} className="w-9 h-9 rounded-lg bg-[#FF6F61] backdrop-blur-sm flex items-center justify-center"><X size={16} className="text-white" /></motion.button>
                </>
              )}
            </div>

            {/* Zoom Slider */}
            <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1.5" style={{ direction: 'ltr' }}>
              <ZoomOut size={12} className="text-white/70" />
              <input type="range" min={100} max={500} step={50} value={zoomScale * 100} onChange={(e) => { const v = Number(e.target.value) / 100; setZoomScale(v); setIsZooming(v > 1); if (v <= 1) { setZoomX(0); setZoomY(0); } }}
                className="w-16 h-1 appearance-none bg-white/30 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <ZoomIn size={12} className="text-white/70" />
              <span className="text-white text-[9px] font-bold min-w-[28px] text-center">{Math.round(zoomScale * 100)}%</span>
            </div>

            {zoomScale > 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                <span className="text-white text-xs font-bold">{Math.round(zoomScale * 100)}%</span>
              </motion.div>
            )}

            {zoomScale <= 1 && !isZooming && (
              <div className="absolute top-14 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/30 backdrop-blur-sm">
                <ZoomIn size={12} className="text-white/80" />
                <span className="text-white/80 text-[10px] font-medium">{language === 'ar' ? 'اضغط مرتين للتكبير' : 'Double-tap to zoom'}</span>
              </div>
            )}

            {discount > 0 && zoomScale <= 1 && (
              <motion.div initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} className="absolute top-14 right-3 z-10">
                <div className="px-3 py-1.5 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #FF6F61, #ff4757)' }}>
                  <span className="text-white text-sm font-bold">-{discount}%</span>
                </div>
              </motion.div>
            )}

            {images.length > 1 && zoomScale <= 1 && (
              <div className="absolute top-14 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
                <span className="text-white text-xs font-semibold">{currentImg + 1}/{images.length}</span>
              </div>
            )}

            {images.length > 1 && zoomScale <= 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10 z-10">
                <div className="h-full bg-white/80 transition-all duration-300" style={{ width: `${((currentImg + 1) / images.length) * 100}%` }} />
              </div>
            )}

            {images.length > 1 && images.length <= 7 && zoomScale <= 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10" dir="ltr">
                {images.map((_, i) => (<button key={i} onClick={() => { setCurrentImg(i); resetZoom(); }} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImg ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/50'}`} />))}
              </div>
            )}

            {images.length > 1 && zoomScale <= 1 && (
              <>
                {currentImg > 0 && <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentImg(p => p - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-[#1A2540]/80 backdrop-blur-sm flex items-center justify-center shadow z-10"><ChevronLeft size={18} /></motion.button>}
                {currentImg < images.length - 1 && <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentImg(p => p + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-[#1A2540]/80 backdrop-blur-sm flex items-center justify-center shadow z-10"><ChevronRight size={18} /></motion.button>}
              </>
            )}

            {/* Video play button */}
            {product.video && zoomScale <= 1 && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowVideo(true)} className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Play size={18} className="text-white ml-0.5" />
              </motion.button>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && zoomScale <= 1 && (
            <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-hide" dir="ltr">
              {images.map((img, i) => (
                <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => setCurrentImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === currentImg ? 'border-[#004B63] dark:border-[#00C4E8] shadow-md' : 'border-transparent opacity-50'}`}
                >
                  {img ? <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-gray-100 dark:bg-[#1A2540]" />}
                </motion.button>
              ))}
            </div>
          )}

          {/* ═══ Product Info Section ═══ */}
          <motion.div className="px-4 mt-4" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}>
            {/* Category tag with dynamic icon */}
            {product.category && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full mb-2" style={{ color: darkMode ? '#00C4E8' : '#004B63', backgroundColor: darkMode ? 'rgba(88,166,255,0.1)' : 'rgba(0,75,99,0.08)' }}>
                <CatIcon size={12} />
                {language === 'ar' ? product.category.nameAr : product.category.nameEn}
              </span>
            )}

            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{name}</h1>

            {/* Rating row */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <div className="flex" dir="ltr">
                  {[1, 2, 3, 4, 5].map(star => (<Star key={star} size={14} className={star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />))}
                </div>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({reviews.length || product.reviewCount || 0})</span>
              </div>
              <button onClick={() => { setActiveTab('reviews'); scrollRef.current?.querySelector('#reviews-section')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-xs text-[#00A8CC] dark:text-[#00C4E8] font-semibold flex items-center gap-1">
                <MessageCircle size={12} />{language === 'ar' ? 'أضف تقييم' : 'Write Review'}
              </button>
            </div>

            {/* Price section */}
            <div className="mt-3 flex items-end gap-3 flex-wrap">
              <span className="text-[22px] font-extrabold text-[#4ADE80] tracking-tight" style={{ textShadow: '0 0 16px rgba(74,222,128,0.3)' }}>{product.price}</span>
              <span className="text-xs font-bold text-[#4ADE80]/70">{t('product.currency')}</span>
              {product.comparePrice && (
                <>
                  <span className="text-base text-gray-400 line-through">{product.comparePrice}</span>
                  {savings > 0 && <span className="text-xs font-bold text-[#238636] px-2 py-0.5 rounded-lg bg-[#238636]/10">{t('mobile.productDetail.saveAmount')} {savings} {t('product.currency')}</span>}
                </>
              )}
            </div>

            {/* Stock status */}
            <div className="mt-3">
              {isOutOfStock ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF3B30] px-2.5 py-1 rounded-full bg-[#FF3B30]/10"><Package size={12} />{t('mobile.productDetail.outOfStock')}</span>
                : isLowStock ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D29922] px-2.5 py-1 rounded-full bg-[#D29922]/10"><Clock size={12} />{t('mobile.productDetail.onlyLeft')} {stockLevel}!</span>
                : <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#238636] px-2.5 py-1 rounded-full bg-[#238636]/10"><Check size={12} />{t('mobile.productDetail.inStock')}</span>
              }
            </div>
            {product.sku && <p className="text-[10px] text-gray-400 mt-1.5" dir="ltr">SKU: {product.sku}</p>}
          </motion.div>

          {/* ═══ DYNAMIC: Color Selector ═══ */}
          {attrs?.colors && attrs.colors.length > 0 && (
            <motion.div className="px-4 mt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-gray-50 dark:bg-[#151D2E] rounded-2xl p-4 border border-gray-100 dark:border-[#1E2A42]">
                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Palette size={14} className="text-[#004B63] dark:text-[#00C4E8]" />
                  {language === 'ar' ? 'اختر اللون' : 'Select Color'}
                  {selectedColor && <span className="text-[10px] font-normal text-gray-400">({language === 'ar' ? attrs.colors.find(c => c.hex === selectedColor)?.nameAr : attrs.colors.find(c => c.hex === selectedColor)?.nameEn})</span>}
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {attrs.colors.map((color, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={() => setSelectedColor(color.hex)}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.hex ? 'border-[#004B63] dark:border-[#00C4E8] scale-110' : 'border-gray-200 dark:border-[#1E2A42]'}`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor === color.hex && <Check size={14} className="absolute inset-0 m-auto text-white drop-shadow-md" />}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ DYNAMIC: Size Selector ═══ */}
          {attrs?.sizes && attrs.sizes.length > 0 && (
            <motion.div className="px-4 mt-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="bg-gray-50 dark:bg-[#151D2E] rounded-2xl p-4 border border-gray-100 dark:border-[#1E2A42]">
                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Ruler size={14} className="text-[#004B63] dark:text-[#00C4E8]" />
                  {language === 'ar' ? 'اختر المقاس' : 'Select Size'}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {attrs.sizes.map((size, i) => (
                    <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedSize === size ? 'bg-[#004B63] dark:bg-[#00C4E8] text-white shadow-md' : 'bg-white dark:bg-[#1A2540] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1E2A42]'}`}
                    >{size}</motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ DYNAMIC: Connectivity (Electronics) ═══ */}
          {attrs?.connectivity && attrs.connectivity.length > 0 && (
            <motion.div className="px-4 mt-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="bg-gray-50 dark:bg-[#151D2E] rounded-2xl p-4 border border-gray-100 dark:border-[#1E2A42]">
                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Wifi size={14} className="text-[#004B63] dark:text-[#00C4E8]" />
                  {language === 'ar' ? 'طرق الاتصال' : 'Connectivity'}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {attrs.connectivity.map((conn, i) => {
                    const ConnIcon = CONNECTIVITY_ICONS[conn.toLowerCase()] || Wifi;
                    return (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#1A2540] border border-gray-200 dark:border-[#1E2A42]">
                        <ConnIcon size={14} className="text-[#004B63] dark:text-[#00C4E8]" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{conn}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ Product Badges ═══ */}
          {product.badges && product.badges.length > 0 && (
            <motion.div className="px-4 mt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="flex gap-2 flex-wrap">
                {product.badges.map(badge => {
                  const badgeKey = badge as ProductBadge;
                  const config = BADGE_CONFIG[badgeKey];
                  if (!config) return null;
                  return (
                    <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: config.bg, border: `1px solid ${config.color}22` }}>
                      {badgeKey === 'sale' && <Tag size={12} style={{ color: config.color }} />}
                      {badgeKey === 'best_seller' && <Sparkles size={12} style={{ color: config.color }} />}
                      {badgeKey === 'new_arrival' && <Zap size={12} style={{ color: config.color }} />}
                      {badgeKey === 'limited_stock' && <Clock size={12} style={{ color: config.color }} />}
                      <span className="text-[11px] font-bold" style={{ color: config.color }}>{language === 'ar' ? config.labelAr : config.labelEn}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ═══ Tab Navigation ═══ */}
          <motion.div className="px-4 mt-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex bg-gray-100 dark:bg-[#151D2E] rounded-xl p-1">
              {[
                { key: 'description' as const, label: t('product.description'), icon: Info },
                { key: 'specs' as const, label: t('product.specifications'), icon: Ruler },
                { key: 'reviews' as const, label: `${t('product.reviews')} (${reviews.length})`, icon: Star },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${activeTab === tab.key ? 'bg-white dark:bg-[#1A2540] text-[#004B63] dark:text-[#00C4E8] shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  <tab.icon size={13} />{tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ═══ Tab Content ═══ */}
          <div className="px-4 mt-4" id={activeTab === 'reviews' ? 'reviews-section' : undefined}>
            <AnimatePresence mode="wait">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <motion.div key="description" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  {description ? (
                    <>
                      <div className={`relative ${!descExpanded ? 'max-h-24 overflow-hidden' : ''}`}>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{description}</p>
                        {!descExpanded && description.length > 120 && <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-[#0B1120] to-transparent" />}
                      </div>
                      {description.length > 120 && (
                        <button onClick={() => setDescExpanded(!descExpanded)} className="flex items-center gap-1 text-xs text-[#00A8CC] dark:text-[#00C4E8] font-semibold mt-1">
                          {descExpanded ? t('mobile.productDetail.showLess') : t('mobile.productDetail.readMore')}
                          {descExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </>
                  ) : (<p className="text-sm text-gray-400 italic">{language === 'ar' ? 'لا يوجد وصف متاح' : 'No description available'}</p>)}
                </motion.div>
              )}

              {/* ═══ ADVANCED Specifications Tab ═══ */}
              {activeTab === 'specs' && (
                <motion.div key="specs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  {specifications.length > 0 ? (
                    <div className="space-y-2">
                      {specifications.map((spec, i) => {
                        const SpecIcon = spec.icon;
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: isRtl ? 10 : -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-3 bg-gray-50 dark:bg-[#151D2E] rounded-xl p-3 border border-gray-100 dark:border-[#1E2A42]"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#004B63]/10 dark:bg-[#00C4E8]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <SpecIcon size={14} className="text-[#004B63] dark:text-[#00C4E8]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{spec.key}</p>
                              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 break-words">{spec.value}</p>
                              {/* Color swatches inline */}
                              {spec.type === 'colors' && attrs?.colors && (
                                <div className="flex gap-2 mt-1.5">
                                  {attrs.colors.map((c, ci) => (
                                    <div key={ci} className="w-5 h-5 rounded-full border border-gray-200 dark:border-[#1E2A42]" style={{ backgroundColor: c.hex }} title={language === 'ar' ? c.nameAr : c.nameEn} />
                                  ))}
                                </div>
                              )}
                              {/* Connectivity icons inline */}
                              {spec.type === 'connectivity' && attrs?.connectivity && (
                                <div className="flex gap-1.5 mt-1.5">
                                  {attrs.connectivity.map((conn, ci) => {
                                    const CIcon = CONNECTIVITY_ICONS[conn.toLowerCase()] || Wifi;
                                    return <CIcon key={ci} size={12} className="text-[#004B63] dark:text-[#00C4E8]" />;
                                  })}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Dimensions visual card */}
                      {(attrs?.width || attrs?.height || attrs?.depth) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: specifications.length * 0.03 }}
                          className="bg-gradient-to-br from-[#004B63]/5 to-[#00897B]/5 dark:from-[#00C4E8]/5 dark:to-teal-500/5 rounded-2xl p-4 border border-[#004B63]/10 dark:border-[#00C4E8]/10"
                        >
                          <h4 className="text-xs font-bold text-[#004B63] dark:text-[#00C4E8] mb-3 flex items-center gap-2">
                            <Box size={14} />{language === 'ar' ? 'الأبعاد والوزن' : 'Dimensions & Weight'}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {attrs.width && <div className="text-center p-2 bg-white/60 dark:bg-[#1A2540]/60 rounded-lg"><p className="text-[9px] text-gray-400">{language === 'ar' ? 'العرض' : 'Width'}</p><p className="text-sm font-bold text-gray-800 dark:text-gray-200">{attrs.width} <span className="text-[10px] text-gray-400">{language === 'ar' ? 'سم' : 'cm'}</span></p></div>}
                            {attrs.height && <div className="text-center p-2 bg-white/60 dark:bg-[#1A2540]/60 rounded-lg"><p className="text-[9px] text-gray-400">{language === 'ar' ? 'الارتفاع' : 'Height'}</p><p className="text-sm font-bold text-gray-800 dark:text-gray-200">{attrs.height} <span className="text-[10px] text-gray-400">{language === 'ar' ? 'سم' : 'cm'}</span></p></div>}
                            {attrs.depth && <div className="text-center p-2 bg-white/60 dark:bg-[#1A2540]/60 rounded-lg"><p className="text-[9px] text-gray-400">{language === 'ar' ? 'العمق' : 'Depth'}</p><p className="text-sm font-bold text-gray-800 dark:text-gray-200">{attrs.depth} <span className="text-[10px] text-gray-400">{language === 'ar' ? 'سم' : 'cm'}</span></p></div>}
                            {attrs.weight && <div className="text-center p-2 bg-white/60 dark:bg-[#1A2540]/60 rounded-lg"><p className="text-[9px] text-gray-400">{language === 'ar' ? 'الوزن' : 'Weight'}</p><p className="text-sm font-bold text-gray-800 dark:text-gray-200">{attrs.weight} <span className="text-[10px] text-gray-400">{language === 'ar' ? 'كجم' : 'kg'}</span></p></div>}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-8 text-gray-400">
                      <Ruler size={36} className="mb-2 opacity-40" />
                      <p className="text-sm">{language === 'ar' ? 'لا توجد مواصفات متاحة' : 'No specifications available'}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                  {reviewsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-8 h-8 border-2 border-[#004B63] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-400 mt-3">{language === 'ar' ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#151D2E] flex items-center justify-center mb-3">
                        <MessageCircle size={28} className="text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{language === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
                      <p className="text-xs text-gray-400 mt-1">{language === 'ar' ? 'كن أول من يقيّم هذا المنتج' : 'Be the first to review this product'}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-50 dark:bg-[#151D2E] rounded-2xl p-4 border border-gray-100 dark:border-[#1E2A42] mb-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-[#004B63] dark:text-[#00C4E8]">{avgRating.toFixed(1)}</div>
                            <div className="flex gap-0.5 mt-1" dir="ltr">{[1, 2, 3, 4, 5].map(s => (<Star key={s} size={12} className={s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />))}</div>
                            <div className="text-[10px] text-gray-400 mt-1">{reviews.length} {language === 'ar' ? 'تقييم' : 'reviews'}</div>
                          </div>
                          <div className="flex-1 space-y-1">
                            {ratingDistribution.map(({ star, count, percentage }) => (
                              <div key={star} className="flex items-center gap-2" dir="ltr">
                                <span className="text-[10px] text-gray-400 w-3">{star}</span><Star size={10} className="text-gray-400" />
                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-[#1E2A42] rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${percentage}%` }} /></div>
                                <span className="text-[10px] text-gray-400 w-5 text-end">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowWriteReview(true)}
                        className="w-full py-3 rounded-xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2 mb-4 transition-colors"
                        style={{
                          borderColor: canReview ? 'rgba(0,75,99,0.3)' : 'rgba(156,163,175,0.3)',
                          color: canReview ? '#004B63' : '#9ca3af',
                        }}
                      >
                        {canReview ? (
                          <>
                            <Plus size={16} />
                            {hasReviewed ? (language === 'ar' ? 'تعديل تقييمك' : 'Edit Your Review') : (language === 'ar' ? 'أضف تقييمك' : 'Write Your Review')}
                            <Check size={12} className="text-emerald-500" />
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={16} />
                            {language === 'ar' ? 'تقييم المنتج (يتطلب شراء مؤكد)' : 'Review product (purchase required)'}
                          </>
                        )}
                      </motion.button>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {reviews.map((review: any, index: number) => (
                          <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-[#151D2E] rounded-xl p-4 border border-gray-100 dark:border-[#1E2A42]"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#004B63] to-[#00897B] flex items-center justify-center text-white text-xs font-bold">{(review.userName || '?').charAt(0)}</div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{review.userName || (language === 'ar' ? 'مستخدم' : 'User')}</span>
                                    {(review.verified || review.isVerified) && <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#238636] bg-[#238636]/10 px-1.5 py-0.5 rounded-full"><Check size={8} />{language === 'ar' ? 'موثق' : 'Verified'}</span>}
                                  </div>
                                  <div className="flex items-center gap-1" dir="ltr">{[1, 2, 3, 4, 5].map(s => (<Star key={s} size={10} className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />))}</div>
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400">{getTimeAgo(review.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                            {review.helpful != null && (
                              <div className="flex items-center gap-3 mt-2">
                                <button className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#004B63] dark:hover:text-[#00C4E8] transition-colors"><ThumbsUp size={11} />{review.helpful}</button>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ Delivery Info Card ═══ */}
          <motion.div className="px-4 mt-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="bg-gray-50 dark:bg-[#151D2E] rounded-2xl p-4 border border-gray-100 dark:border-[#1E2A42]">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2"><Truck size={16} className="text-[#004B63] dark:text-[#00C4E8]" />{t('mobile.productDetail.deliveryInfo')}</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#238636]/10 flex items-center justify-center flex-shrink-0"><Truck size={14} className="text-[#238636]" /></div>
                  <div><p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('delivery.fee')}: {t('mobile.cart.freeDeliveryNote')}</p><p className="text-[10px] text-gray-400">{t('mobile.cart.freeDeliveryNote')}</p></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#004B63]/10 flex items-center justify-center flex-shrink-0"><Clock size={14} className="text-[#004B63] dark:text-[#00C4E8]" /></div>
                  <div><p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('delivery.estimated')}: 2-5 {t('delivery.estimatedDays')}</p><p className="text-[10px] text-gray-400">{language === 'ar' ? 'لجميع مناطق ليبيا' : 'Across all Libya'}</p></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center flex-shrink-0"><Lock size={14} className="text-[#D4A843]" /></div>
                  <div><p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{t('checkout.cod')}</p><p className="text-[10px] text-gray-400">{language === 'ar' ? 'ادفع عند الاستلام' : 'Pay when you receive'}</p></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══ Trust Features ═══ */}
          <motion.div className="px-4 mt-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: <ShieldCheck size={18} className="text-[#004B63] dark:text-[#00C4E8]" />, label: t('mobile.productDetail.originalProduct'), bg: 'bg-[#004B63]/10 dark:bg-[#004B63]/20' },
                { icon: <Truck size={18} className="text-[#00897B]" />, label: t('mobile.productDetail.fastDelivery'), bg: 'bg-[#00897B]/10' },
                { icon: <RotateCcw size={18} className="text-[#D4A843]" />, label: t('mobile.productDetail.easyReturn'), bg: 'bg-[#D4A843]/10' },
                { icon: <Lock size={18} className="text-[#238636]" />, label: t('checkout.cod'), bg: 'bg-[#238636]/10' },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5 p-2">
                  <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center`}>{feature.icon}</div>
                  <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-400 leading-tight">{feature.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ═══ Related Products ═══ */}
          {relatedProducts.length > 0 && (
            <motion.div className="mt-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5"><Sparkles size={14} className="text-[#FF6F61]" />{t('product.related')}</h3>
                <span className="text-xs text-[#00897B] font-semibold">{language === 'ar' ? 'عرض الكل' : 'See All'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 px-4 pb-2">
                {relatedProducts.map((p, idx) => {
                  const pName = language === 'ar' ? p.nameAr : p.nameEn;
                  const pImg = p.mainImage || p.image || (Array.isArray(p.images) ? p.images[0] : typeof p.images === 'string' ? p.images.replace(/[\[\]"]/g, '').split(',')[0] : undefined);
                  const pDiscount = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
                  const pIsFav = favorites.includes(p.id);
                  return (
                    <motion.div key={p.id} className="bg-white dark:bg-[#151D2E] rounded-2xl shadow-sm border border-gray-100/80 dark:border-[#1E2A42] overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
                      onClick={() => useMobileStore.getState().setSelectedProduct(p)} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * idx, duration: 0.3 }}
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#1A2540] dark:to-[#151D2E] overflow-hidden">
                        {pImg ? <img src={pImg} alt={pName} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-gray-300 dark:text-gray-600" /></div>}
                        <button onClick={(e) => { e.stopPropagation(); const wasFav = favorites.includes(p.id); toggleFavorite(p.id); if (!wasFav) { setSelectedProduct(null); pushNavHistory(); setStoreActiveTab('favorites'); } }} className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white/90 dark:bg-[#151D2E]/90 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                          <Heart size={13} className={`transition-all ${pIsFav ? 'fill-[#FF6F61] text-[#FF6F61]' : 'text-gray-400'}`} />
                        </button>
                        {pDiscount > 0 && <span className="absolute top-2 right-2 bg-gradient-to-l from-[#FF6F61] to-[#ff4757] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">-{pDiscount}%</span>}
                        {p.rating && p.rating >= 4 && (
                          <div className="absolute bottom-1.5 left-1.5 bg-white/90 dark:bg-[#151D2E]/90 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-0.5">
                            <Star size={9} className="fill-yellow-400 text-yellow-400" /><span className="text-[8px] font-bold text-gray-700 dark:text-gray-300">{p.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-[11px] font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-relaxed min-h-[2.2em]">{pName}</h4>
                        <div className="flex items-baseline gap-0.5 mt-1">
                          <span className="text-[13px] font-extrabold text-[#4ADE80] tracking-tight" style={{ textShadow: '0 0 10px rgba(74,222,128,0.2)' }}>{p.price}</span>
                          <span className="text-[9px] font-bold text-[#4ADE80]/65">{t('product.currency')}</span>
                          {p.comparePrice && <span className="text-[9px] text-[#6B7F96] line-through ml-1">{p.comparePrice}</span>}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); addItem({ productId: p.id, nameAr: p.nameAr, nameEn: p.nameEn, price: p.price, image: p.mainImage || p.image || '', stock: p.stock || 99 }); setTimeout(() => { useMobileStore.getState().pushNavHistory(); useMobileStore.getState().setActiveTab('cart'); useMobileStore.getState().setSelectedProduct(null); }, 300); }}
                          className="w-full mt-1.5 py-1.5 rounded-lg text-[10px] font-bold bg-gradient-to-l from-[#004B63] to-[#006B8A] text-white flex items-center justify-center gap-1 active:scale-95 transition-transform"
                        ><Plus size={11} />{t('product.addToCart')}</button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="h-32" />
        </div>

        {/* ═══ Sticky Bottom Bar ═══ */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-gray-100 dark:border-[#1E2A42] bg-white dark:bg-[#0B1120]" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
          {cartCount > 0 && (
            <div className="flex items-center justify-between px-4 pt-2">
              <span className="text-[10px] text-gray-400">{cartCount} {t('mobile.productDetail.itemsInCart')}</span>
              <ShoppingCart size={14} className="text-[#004B63] dark:text-[#00C4E8]" />
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1A2540] rounded-xl p-1">
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-lg bg-white dark:bg-[#1E2A42] flex items-center justify-center shadow-sm"><Minus size={14} /></motion.button>
              <span className="text-base font-bold w-8 text-center">{quantity}</span>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #004B63, #006B8A)' }}><Plus size={14} /></motion.button>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart} disabled={isOutOfStock}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: isOutOfStock ? '#999' : 'linear-gradient(135deg, #004B63, #00897B)', color: '#fff' }}
            >
              {added ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2"><Check size={18} />{language === 'ar' ? 'تمت الإضافة!' : 'Added!'}</motion.span>
              ) : isOutOfStock ? (
                <span className="flex items-center gap-2"><Package size={18} />{language === 'ar' ? 'غير متوفر' : 'Out of Stock'}</span>
              ) : (
                <span className="flex items-center gap-2"><ShoppingCart size={18} />{t('product.addToCart')} • {product.price * quantity} {t('product.currency')}</span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
