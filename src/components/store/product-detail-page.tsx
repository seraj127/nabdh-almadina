'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Minus,
  Plus,
  Package,
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  Star,
  Heart,
  Share2,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Weight,
  Palette,
  Tag,
  Globe2,
  Shield,
  CheckCircle2,
  AlertCircle,
  BadgePercent,
  Layers,
  Box,
  Copy,
  Maximize2,
  Eye,
  Info,
  AlertTriangle,
  Flame,
  Sparkles,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';
import { useLanguageStore } from '@/stores/language-store';
import { useFavoritesStore } from '@/stores/favorites-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { fmt, safeNum } from './lib/shared';
import { ProductReviewsSection } from './product-reviews-section';

// ─── Types ─────────────────────────────────────────────────────────────
interface FullProduct {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  sku: string;
  price: number;
  comparePrice: number | null;
  costPrice: number | null;
  mainImage: string | null;
  images: string[];
  video: string | null;
  stock: number;
  weight: number | null;
  dimensions: { w?: number; h?: number; d?: number } | null;
  attributes: Record<string, string | string[]> | null;
  badges: string[] | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  category: { id: string; nameAr: string; nameEn: string; slug: string };
}

// ─── Attribute Icon Mapping ────────────────────────────────────────────
const ATTR_ICONS: Record<string, typeof Palette> = {
  color: Palette,
  colour: Palette,
  اللون: Palette,
  size: Ruler,
  المقاس: Ruler,
  الحجم: Ruler,
  material: Layers,
  المادة: Layers,
  الخامة: Layers,
  country: Globe2,
  بلد: Globe2,
  المنشأ: Globe2,
  weight: Weight,
  الوزن: Weight,
  brand: Tag,
  الماركة: Tag,
  العلامة: Tag,
  style: Eye,
  النمط: Eye,
  الطراز: Eye,
  season: Sun,
  الموسم: Sun,
  pattern: Layers,
  النقش: Layers,
};

// ─── Zoom Hook ─────────────────────────────────────────────────────────
function useImageZoom(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => setZoomLevel((z) => Math.min(z + 0.5, 4)), []);
  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => {
      const newZ = Math.max(z - 0.5, 1);
      if (newZ === 1) setPanPosition({ x: 0, y: 0 });
      return newZ;
    });
  }, []);
  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoomLevel((z) => {
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newZ = Math.max(1, Math.min(4, z + delta));
      if (newZ === 1) setPanPosition({ x: 0, y: 0 });
      return newZ;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsPanning(true);
    lastPos.current = { x: e.clientX - panPosition.x, y: e.clientY - panPosition.y };
  }, [zoomLevel, panPosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanPosition({
      x: e.clientX - lastPos.current.x,
      y: e.clientY - lastPos.current.y,
    });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  return {
    zoomLevel,
    panPosition,
    isPanning,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}

// ─── Magnifying Glass Component ────────────────────────────────────────
function MagnifierOverlay({ src, containerRef }: { src: string; containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: 800, h: 800 });
  const lensSize = 180;
  const zoomFactor = 2.5;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPos({ x, y });
    setContainerSize({ w: rect.width, h: rect.height });
  }, [containerRef]);

  return (
    <div
      className="absolute inset-0 cursor-crosshair z-20"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onMouseMove={handleMouseMove}
    >
      {show && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-white/40 shadow-2xl overflow-hidden"
          style={{
            width: lensSize,
            height: lensSize,
            left: pos.x - lensSize / 2,
            top: pos.y - lensSize / 2,
            backgroundImage: `url(${src})`,
            backgroundSize: `${containerSize.w * zoomFactor}px ${containerSize.h * zoomFactor}px`,
            backgroundPosition: `${-(pos.x * zoomFactor - lensSize / 2)}px ${-(pos.y * zoomFactor - lensSize / 2)}px`,
            boxShadow: '0 0 40px rgba(0,75,99,0.2), inset 0 0 20px rgba(255,255,255,0.1)',
          }}
        />
      )}
    </div>
  );
}

// ─── Fullscreen Lightbox ───────────────────────────────────────────────
function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const imgRef = useRef<HTMLDivElement>(null);
  const zoom = useImageZoom(imgRef);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <span className="text-white/60 text-sm">{currentIndex + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={zoom.handleZoomIn} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <ZoomIn size={18} />
          </button>
          <button onClick={zoom.handleZoomOut} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <ZoomOut size={18} />
          </button>
          <button onClick={zoom.handleResetZoom} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <Maximize2 size={18} />
          </button>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        ref={imgRef}
        className="relative max-w-[90vw] max-h-[85vh] overflow-hidden select-none"
        onWheel={zoom.handleWheel}
        onMouseDown={zoom.handleMouseDown}
        onMouseMove={zoom.handleMouseMove}
        onMouseUp={zoom.handleMouseUp}
        onMouseLeave={zoom.handleMouseUp}
        style={{ cursor: zoom.zoomLevel > 1 ? (zoom.isPanning ? 'grabbing' : 'grab') : 'default' }}
      >
        <motion.img
          src={images[currentIndex]}
          alt=""
          className="max-w-full max-h-[85vh] object-contain pointer-events-none"
          style={{
            transform: `scale(${zoom.zoomLevel}) translate(${zoom.panPosition.x / zoom.zoomLevel}px, ${zoom.panPosition.y / zoom.zoomLevel}px)`,
            transition: zoom.isPanning ? 'none' : 'transform 0.2s ease-out',
          }}
          drag={false}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        </>
      )}
    </motion.div>
  );
}

// ─── Spec Item Component ───────────────────────────────────────────────
function SpecItem({ icon: Icon, label, value, color = 'text-nabdh-primary' }: {
  icon: typeof Palette;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', `${color}/10`)}>
        <Icon size={16} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
      </div>
    </motion.div>
  );
}

// ─── Dimension Visual ──────────────────────────────────────────────────
function DimensionVisual({ w, h, d, isAr }: { w?: number; h?: number; d?: number; isAr: boolean }) {
  if (!w && !h && !d) return null;
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Box size={16} className="text-nabdh-accent" />
        <span className="text-sm font-bold text-foreground">{isAr ? 'الأبعاد' : 'Dimensions'}</span>
      </div>
      <div className="relative flex items-center justify-center py-4">
        {/* 3D Box visual */}
        <div className="relative">
          <div
            className="border-2 border-nabdh-primary/40 rounded-md bg-nabdh-primary/5 relative"
            style={{ width: 100, height: h ? Math.min(h * 4, 80) : 60 }}
          >
            {/* Width label */}
            {w && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] text-nabdh-primary font-bold">
                <Ruler size={8} /> {w} cm
              </div>
            )}
            {/* Height label */}
            {h && (
              <div className="absolute -start-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-nabdh-accent font-bold" style={{ writingMode: 'vertical-rl' }}>
                <Ruler size={8} /> {h} cm
              </div>
            )}
          </div>
          {/* Depth indicator */}
          {d && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-emerald-500 font-bold">
              {isAr ? 'عمق' : 'D'}: {d} cm
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PRODUCT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════════════
export function ProductDetailPage() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({
    t: s.t, language: s.language, direction: s.direction,
  })));
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';
  const clearAuthView = useUIStore((s) => s.clearAuthView);
  const selectedProductId = useUIStore((s) => s.selectedProductId);
  const addItem = useCartStore((s) => s.addItem);
  const isLoggedIn = useUIStore((s) => s.isLoggedIn);

  const [product, setProduct] = useState<FullProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showLightbox, setShowLightbox] = useState(false);
  const isFavorite = useFavoritesStore(useShallow((s) => s.favoriteIds.includes(selectedProductId || '')));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'protection' | 'shipping' | 'reviews'>('specs');

  const mainImageRef = useRef<HTMLDivElement>(null);
  const currency = t('product.currency');

  // Fetch product data
  useEffect(() => {
    if (!selectedProductId) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError('');
    /* eslint-enable react-hooks/set-state-in-effect */
    fetch(`/api/products/${selectedProductId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        if (data.product) {
          setProduct(data.product);
          setSelectedImageIndex(0);
        } else {
          setError(isAr ? 'المنتج غير موجود' : 'Product not found');
        }
      })
      .catch(() => setError(isAr ? 'فشل تحميل المنتج' : 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [selectedProductId, isAr]);

  // Derived values
  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = [...product.images];
    if (product.mainImage && !imgs.includes(product.mainImage)) {
      imgs.unshift(product.mainImage);
    }
    return imgs.length > 0 ? imgs : [];
  }, [product]);

  const currentImage = allImages[selectedImageIndex] || product?.mainImage || '';
  const name = product ? (isAr ? product.nameAr : product.nameEn) : '';
  const description = product ? (isAr ? product.descriptionAr : product.descriptionEn) : '';
  const categoryName = product ? (isAr ? product.category.nameAr : product.category.nameEn) : '';
  const inStock = product ? product.stock > 0 : false;
  const isLowStock = product ? product.stock > 0 && product.stock <= 5 : false;

  // Get weight from product.weight or attributes
  const productWeight = useMemo(() => {
    if (!product) return null;
    if (product.weight) return product.weight;
    if (product.attributes) {
      const attrs = typeof product.attributes === 'string' ? (() => { try { return JSON.parse(product.attributes); } catch { return null; } })() : product.attributes;
      if (attrs?.weight) return Number(attrs.weight);
    }
    return null;
  }, [product]);

  // Parse dimensions - from dimensions field or attributes
  const dimensions = useMemo(() => {
    if (!product) return null;
    // Try dimensions field first
    if (product.dimensions) {
      const dim = typeof product.dimensions === 'string' ? (() => { try { return JSON.parse(product.dimensions); } catch { return null; } })() : product.dimensions;
      if (dim && (dim.w || dim.h || dim.d)) return dim;
    }
    // Try attributes for width/height/depth
    if (product.attributes) {
      const attrs = typeof product.attributes === 'string' ? (() => { try { return JSON.parse(product.attributes); } catch { return null; } })() : product.attributes;
      if (attrs && (attrs.width || attrs.height || attrs.depth)) {
        return { w: attrs.width, h: attrs.height, d: attrs.depth };
      }
    }
    return null;
  }, [product]);

  // Parse dynamic attributes
  const specEntries = useMemo(() => {
    if (!product?.attributes) return [];
    let attrs: any = product.attributes;
    if (typeof attrs === 'string') {
      try { attrs = JSON.parse(attrs); } catch { return []; }
    }
    // Parse each attribute value for display
    return Object.entries(attrs).map(([key, val]) => {
      let displayValue = '';
      // Handle array of objects (e.g. colors, materials)
      if (Array.isArray(val)) {
        displayValue = val.map((v: any) => {
          if (typeof v === 'object' && v !== null) {
            return isAr ? (v.nameAr || v.ar || v.name || JSON.stringify(v)) : (v.nameEn || v.en || v.name || JSON.stringify(v));
          }
          return String(v);
        }).join('، ');
      }
      // Handle object values (e.g. countryOfOrigin, finish, warranty)
      else if (typeof val === 'object' && val !== null) {
        const objVal = val as Record<string, any>;
        displayValue = isAr ? (objVal.nameAr || objVal.ar || objVal.name || JSON.stringify(objVal)) : (objVal.nameEn || objVal.en || objVal.name || JSON.stringify(objVal));
      }
      else {
        displayValue = String(val);
      }
      return [key, displayValue] as [string, string];
    });
  }, [product, isAr]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product || !inStock) return;
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: product.mainImage || '',
      stock: product.stock,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)]" dir={direction}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square rounded-2xl bg-muted/30" />
            <div className="space-y-4">
              <div className="h-4 bg-muted/30 rounded w-20" />
              <div className="h-8 bg-muted/30 rounded w-3/4" />
              <div className="h-4 bg-muted/30 rounded w-1/3" />
              <div className="h-24 bg-muted/30 rounded" />
              <div className="h-12 bg-muted/30 rounded w-1/2" />
              <div className="h-14 bg-muted/30 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ───
  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4" dir={direction}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Package size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold text-foreground">{error || (isAr ? 'المنتج غير موجود' : 'Product not found')}</h2>
          <button
            onClick={clearAuthView}
            className="mt-6 px-6 py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
          >
            {isAr ? 'العودة للتسوق' : 'Back to Shopping'}
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Main View ───
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-[calc(100vh-4rem)]" dir={direction}>
      {/* ─── Gradient Header ─── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -start-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -end-12 w-36 h-36 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={clearAuthView}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <BackArrow className="size-5 text-white" />
            </motion.button>
            <div className="flex-1 min-w-0">
              <p className="text-white/50 text-xs truncate">{categoryName}</p>
              <h1 className="text-base sm:text-lg font-bold text-white truncate">{name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleCopyLink}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => toggleFavorite(selectedProductId || '')}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                  isFavorite ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                )}
              >
                <Heart size={16} className={isFavorite ? 'fill-red-400' : ''} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* ═══ LEFT: Image Gallery ═══ */}
          <div className="space-y-4">
            {/* Main Image with Zoom */}
            <motion.div
              ref={mainImageRef}
              className="relative aspect-square rounded-2xl overflow-hidden glass-card group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Magnifier */}
                  <MagnifierOverlay src={currentImage} containerRef={mainImageRef} />
                  {/* Zoom hint */}
                  <motion.div
                    className="absolute bottom-3 end-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <ZoomIn size={12} />
                    {isAr ? 'حرّك للتكبير' : 'Hover to zoom'}
                  </motion.div>
                  {/* Fullscreen button */}
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="absolute top-3 end-3 z-30 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Maximize2 size={16} />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/20">
                  <Package size={80} className="text-muted-foreground/20" />
                </div>
              )}

              {/* Badges */}
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-20">
                  {product.badges.map((badge) => (
                    <Badge
                      key={badge}
                      className={cn(
                        'text-xs px-2.5 py-1 border backdrop-blur-sm',
                        badge === 'new' && 'bg-emerald-500/90 text-white border-emerald-400/50',
                        badge === 'sale' && 'bg-[#FF6F61]/90 text-white border-[#FF6F61]/50',
                        badge === 'bestseller' && 'bg-[#D4A843]/90 text-white border-[#D4A843]/50',
                      )}
                    >
                      {badge === 'new' ? (isAr ? 'جديد' : 'New') :
                       badge === 'sale' ? (isAr ? 'تخفيض' : 'Sale') :
                       badge === 'bestseller' ? (isAr ? 'الأكثر مبيعاً' : 'Bestseller') : badge}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedImageIndex(i)}
                    className={cn(
                      'w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200',
                      i === selectedImageIndex
                        ? 'border-nabdh-primary shadow-lg shadow-nabdh-primary/20'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* ═══ RIGHT: Product Info ═══ */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Category + SKU */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs border-nabdh-primary/30 text-nabdh-primary">
                {categoryName}
              </Badge>
              {product.sku && (
                <span className="text-[10px] text-muted-foreground font-mono">SKU: {product.sku}</span>
              )}
            </div>

            {/* Name */}
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{name}</h2>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'size-5',
                      i < Math.floor(product.rating) ? 'fill-[#D4A843] text-[#D4A843]' :
                      i < product.rating ? 'fill-[#D4A843]/50 text-[#D4A843]' : 'text-muted-foreground/20'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">{fmt(product.rating, 1)}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount} {isAr ? 'تقييم' : 'reviews'})</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold text-nabdh-price tabular-nums">
                {fmt(product.price)} {currency}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {fmt(product.comparePrice)} {currency}
                  </span>
                  <Badge className="bg-[#FF6F61]/10 text-[#FF6F61] border-0 text-xs font-bold">
                    <BadgePercent size={12} className="me-1" />
                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <span className={cn(
                  'flex items-center gap-1.5 text-sm font-semibold',
                  isLowStock ? 'text-amber-500' : 'text-emerald-500'
                )}>
                  <span className={cn('size-2.5 rounded-full', isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')} />
                  {isLowStock
                    ? (isAr ? `متبقي ${product.stock} فقط!` : `Only ${product.stock} left!`)
                    : (isAr ? 'متوفر' : 'In Stock')
                  }
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-red-500">
                  <X size={14} />
                  {isAr ? 'غير متوفر' : 'Out of Stock'}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            )}

            <Separator />

            {/* ─── Dynamic Specifications Tabs ─── */}
            <div>
              {/* Tab Buttons */}
              <div className="flex gap-2 mb-4">
                {[
                  { key: 'specs' as const, icon: Layers, ar: 'المواصفات', en: 'Specifications' },
                  { key: 'protection' as const, icon: Shield, ar: 'الحماية', en: 'Protection' },
                  { key: 'shipping' as const, icon: Truck, ar: 'الشحن', en: 'Shipping' },
                  { key: 'reviews' as const, icon: Star, ar: 'التقييمات', en: 'Reviews' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                        activeTab === tab.key
                          ? 'bg-nabdh-primary text-white shadow-lg shadow-nabdh-primary/20'
                          : 'glass-card text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon size={14} />
                      {isAr ? tab.ar : tab.en}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {/* ═══ SPECS TAB ═══ */}
                {activeTab === 'specs' && (
                  <motion.div
                    key="specs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {/* Dynamic Attributes */}
                    {specEntries.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {specEntries.map(([key, val]) => {
                          const displayValue = Array.isArray(val) ? val.join(', ') : String(val);
                          const IconComp = ATTR_ICONS[key] || Info;
                          const label = isAr ? translateAttrKey(key) : key.charAt(0).toUpperCase() + key.slice(1);
                          return (
                            <SpecItem key={key} icon={IconComp} label={label} value={displayValue} />
                          );
                        })}
                      </div>
                    )}

                    {/* Weight */}
                    {productWeight && (
                      <SpecItem icon={Weight} label={isAr ? 'الوزن' : 'Weight'} value={`${productWeight} ${isAr ? 'كجم' : 'kg'}`} color="text-amber-500" />
                    )}

                    {/* Dimensions Visual */}
                    {dimensions && (dimensions.w || dimensions.h || dimensions.d) && (
                      <DimensionVisual w={dimensions.w} h={dimensions.h} d={dimensions.d} isAr={isAr} />
                    )}

                    {/* No specs message */}
                    {specEntries.length === 0 && !productWeight && !dimensions && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Layers size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{isAr ? 'لا توجد مواصفات إضافية' : 'No additional specifications'}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══ PROTECTION TAB ═══ */}
                {activeTab === 'protection' && (
                  <motion.div
                    key="protection"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {[
                      { icon: ShieldCheck, title: isAr ? 'ضمان الجودة' : 'Quality Guarantee', desc: isAr ? 'جميع منتجاتنا أصلية ومضمونة 100%' : 'All our products are 100% original and guaranteed', color: 'text-emerald-500' },
                      { icon: RotateCcw, title: isAr ? 'سياسة الإرجاع' : 'Return Policy', desc: isAr ? 'يمكنك إرجاع المنتج خلال 7 أيام من الاستلام' : 'You can return the product within 7 days of delivery', color: 'text-nabdh-accent' },
                      { icon: Shield, title: isAr ? 'تغليف آمن' : 'Secure Packaging', desc: isAr ? 'تغليف محكم لحماية المنتج أثناء النقل' : 'Secure packaging to protect the product during transit', color: 'text-amber-500' },
                      { icon: CheckCircle2, title: isAr ? 'فحص قبل الشحن' : 'Pre-shipping Inspection', desc: isAr ? 'يتم فحص كل منتج قبل الشحن لضمان الجودة' : 'Every product is inspected before shipping to ensure quality', color: 'text-nabdh-primary' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={i}
                          className="glass-card rounded-xl p-4 flex items-start gap-3"
                          initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', `${item.color.replace('text-', 'bg-')}/10`)}>
                            <Icon size={20} className={item.color} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* ═══ SHIPPING TAB ═══ */}
                {activeTab === 'shipping' && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {[
                      { icon: Truck, title: isAr ? 'توصيل لجميع المناطق' : 'Delivery to all areas', desc: isAr ? 'نوفر التوصيل لجميع مناطق ليبيا' : 'We deliver to all areas in Libya', color: 'text-nabdh-accent' },
                      { icon: Clock, title: isAr ? 'مدة التوصيل' : 'Delivery Time', desc: isAr ? '1-5 أيام عمل حسب المنطقة' : '1-5 business days depending on area', color: 'text-amber-500' },
                      { icon: Globe2, title: isAr ? 'رسوم التوصيل' : 'Delivery Fee', desc: isAr ? 'رسوم التوصيل تعتمد على المنطقة المختارة' : 'Delivery fee depends on the selected zone', color: 'text-nabdh-primary' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={i}
                          className="glass-card rounded-xl p-4 flex items-start gap-3"
                          initial={{ opacity: 0, x: isRTL ? -10 : 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', `${item.color.replace('text-', 'bg-')}/10`)}>
                            <Icon size={20} className={item.color} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}

                {/* ═══ REVIEWS TAB ═══ */}
                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ProductReviewsSection
                      productId={product.id}
                      productName={name}
                      productImage={product.mainImage}
                      rating={safeNum(product.rating)}
                      reviewCount={product.reviewCount}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Separator />

            {/* ─── Quantity + Add to Cart ─── */}
            <div className="space-y-4">
              {/* Quantity Stepper */}
              {inStock && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-foreground">{isAr ? 'الكمية' : 'Quantity'}:</span>
                  <div
                    className="flex items-center rounded-full overflow-hidden"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={14} />
                    </motion.button>
                    <span className="text-base font-bold min-w-[40px] text-center tabular-nums text-foreground">{quantity}</span>
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="w-10 h-10 flex items-center justify-center text-white"
                      style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={14} />
                    </motion.button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isAr ? `${product.stock} متاح` : `${product.stock} available`}
                  </span>
                </div>
              )}

              {/* Add to Cart Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!inStock}
                className={cn(
                  'w-full py-4 rounded-xl text-white font-bold text-base shadow-lg relative overflow-hidden flex items-center justify-center gap-3',
                  !inStock && 'opacity-50 cursor-not-allowed'
                )}
                style={{
                  background: addedToCart
                    ? 'linear-gradient(135deg, #059669, #10B981)'
                    : 'linear-gradient(135deg, #004B63, #00897B)',
                  boxShadow: addedToCart ? '0 4px 20px rgba(5,150,105,0.3)' : '0 4px 20px rgba(0,75,99,0.3)',
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                {addedToCart ? (
                  <>
                    <CheckCircle2 size={20} className="relative z-10" />
                    <span className="relative z-10">{isAr ? 'تمت الإضافة للسلة!' : 'Added to Cart!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} className="relative z-10" />
                    <span className="relative z-10">
                      {!inStock
                        ? (isAr ? 'غير متوفر' : 'Out of Stock')
                        : (isAr ? 'أضف للسلة' : 'Add to Cart')
                      }
                    </span>
                  </>
                )}
              </motion.button>

              {/* Continue Shopping */}
              <button
                onClick={clearAuthView}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-nabdh-primary hover:bg-nabdh-primary/5 transition-colors flex items-center justify-center gap-2"
              >
                {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
              </button>
            </div>

            {/* ─── Quick Trust Badges ─── */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: ShieldCheck, label: isAr ? 'أصلي' : 'Authentic', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { icon: Truck, label: isAr ? 'شحن سريع' : 'Fast Ship', color: 'text-nabdh-accent', bg: 'bg-nabdh-accent/10' },
                { icon: RotateCcw, label: isAr ? 'إرجاع' : 'Returns', color: 'text-amber-500', bg: 'bg-amber-500/10' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', item.bg)}>
                      <Icon size={14} className={item.color} />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Lightbox ─── */}
      <AnimatePresence>
        {showLightbox && allImages.length > 0 && (
          <Lightbox
            images={allImages}
            currentIndex={selectedImageIndex}
            onClose={() => setShowLightbox(false)}
            onPrev={() => setSelectedImageIndex((i) => (i > 0 ? i - 1 : allImages.length - 1))}
            onNext={() => setSelectedImageIndex((i) => (i < allImages.length - 1 ? i + 1 : 0))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Helper: Translate attribute keys to Arabic ───────────────────────
function translateAttrKey(key: string): string {
  const map: Record<string, string> = {
    color: 'اللون',
    colour: 'اللون',
    size: 'المقاس',
    material: 'الخامة',
    country: 'بلد المنشأ',
    origin: 'بلد المنشأ',
    weight: 'الوزن',
    brand: 'الماركة',
    style: 'الطراز',
    season: 'الموسم',
    pattern: 'النقش',
    capacity: 'السعة',
    power: 'القوة',
    voltage: 'الجهد',
    warranty: 'الضمان',
    dimensions: 'الأبعاد',
    gender: 'الجنس',
    age: 'الفئة العمرية',
    fabric: 'القماش',
    fit: 'القصة',
    collar: 'الياقة',
    sleeve: 'الكُم',
    length: 'الطول',
    width: 'العرض',
    height: 'الارتفاع',
    depth: 'العمق',
    diameter: 'القطر',
    volume: 'الحجم',
    type: 'النوع',
    model: 'الموديل',
    collection: 'المجموعة',
    finish: 'التشطيب',
    shape: 'الشكل',
    texture: 'الملمس',
    scent: 'الرائحة',
    flavor: 'النكهة',
    ingredients: 'المكونات',
    skinType: 'نوع البشرة',
  };
  return map[key.toLowerCase()] || key;
}
