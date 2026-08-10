'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '../lib/mobile-store';
import {
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Globe,
  AlertTriangle,
  ExternalLink,
  Smartphone,
} from 'lucide-react';

// ─── Social media brand info ────────────────────────────────────────
const BRAND_INFO: Record<string, {
  primary: string;
  gradient: string;
  nameAr: string;
  nameEn: string;
  embedUrl?: (url: string) => string; // Convert to embeddable URL if possible
  blocksIframe: boolean; // Known to block iframe embedding
}> = {
  'facebook.com': {
    primary: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2, #0D5BBF)',
    nameAr: 'فيسبوك',
    nameEn: 'Facebook',
    blocksIframe: true,
  },
  'instagram.com': {
    primary: '#E4405F',
    gradient: 'linear-gradient(135deg, #E4405F, #833AB4)',
    nameAr: 'انستغرام',
    nameEn: 'Instagram',
    blocksIframe: true,
  },
  'twitter.com': {
    primary: '#14171A',
    gradient: 'linear-gradient(135deg, #14171A, #333)',
    nameAr: 'إكس',
    nameEn: 'X (Twitter)',
    blocksIframe: true,
  },
  'x.com': {
    primary: '#14171A',
    gradient: 'linear-gradient(135deg, #14171A, #333)',
    nameAr: 'إكس',
    nameEn: 'X (Twitter)',
    blocksIframe: true,
  },
  'youtube.com': {
    primary: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000, #CC0000)',
    nameAr: 'يوتيوب',
    nameEn: 'YouTube',
    embedUrl: (url: string) => {
      // Convert youtube.com/@channel or youtube.com/watch to embed URL
      try {
        const u = new URL(url);
        // Handle /@channel URLs - can't embed channel pages directly
        if (u.pathname.startsWith('/@') || u.pathname.startsWith('/c/')) {
          return url; // Can't embed channel pages
        }
        // Handle /watch?v= URLs
        const videoId = u.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        }
        // Handle /embed/ URLs (already embed format)
        if (u.pathname.startsWith('/embed/')) {
          return url;
        }
      } catch {}
      return url;
    },
    blocksIframe: false, // YouTube allows embedding
  },
  'wa.me': {
    primary: '#25D366',
    gradient: 'linear-gradient(135deg, #25D366, #128C7E)',
    nameAr: 'واتساب',
    nameEn: 'WhatsApp',
    blocksIframe: true,
  },
  'whatsapp.com': {
    primary: '#25D366',
    gradient: 'linear-gradient(135deg, #25D366, #128C7E)',
    nameAr: 'واتساب',
    nameEn: 'WhatsApp',
    blocksIframe: true,
  },
  't.me': {
    primary: '#0088CC',
    gradient: 'linear-gradient(135deg, #0088CC, #006BB3)',
    nameAr: 'تلغرام',
    nameEn: 'Telegram',
    blocksIframe: true,
  },
  'tiktok.com': {
    primary: '#000000',
    gradient: 'linear-gradient(135deg, #25F4EE, #FE2C55)',
    nameAr: 'تيك توك',
    nameEn: 'TikTok',
    blocksIframe: true,
  },
};

function getBrandInfo(url: string) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    for (const [domain, info] of Object.entries(BRAND_INFO)) {
      if (hostname.includes(domain)) return info;
    }
  } catch {}
  return {
    primary: '#004B63',
    gradient: 'linear-gradient(135deg, #004B63, #00897B)',
    nameAr: 'متصفح',
    nameEn: 'Browser',
    blocksIframe: false,
  };
}

function getDomainName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname.charAt(0).toUpperCase() + hostname.slice(1);
  } catch {
    return url;
  }
}

// ─── Social Media Branded Page (shown when iframe is blocked) ────────
function SocialMediaBrandedPage({
  url,
  brandInfo,
  language,
  darkMode,
}: {
  url: string;
  brandInfo: ReturnType<typeof getBrandInfo>;
  language: string;
  darkMode: boolean;
}) {
  const isAr = language === 'ar';
  const name = isAr ? brandInfo.nameAr : brandInfo.nameEn;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6" style={{ background: darkMode ? '#0B1120' : '#F8F9FA' }}>
      {/* Brand icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 relative"
        style={{
          background: brandInfo.gradient,
          boxShadow: `0 8px 32px ${brandInfo.primary}40`,
        }}
      >
        <Globe className="w-9 h-9 text-white" />
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ border: `2px solid ${brandInfo.primary}30` }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Name */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-bold mb-2"
        style={{ color: darkMode ? '#F3F4F6' : '#1F2937' }}
      >
        {name}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm text-center mb-2 leading-relaxed"
        style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}
      >
        {isAr
          ? `زيارة صفحة ${name} الرسمية لنبض المدينة`
          : `Visit Nabd Al-Madina's official ${name} page`}
      </motion.p>

      {/* URL */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs font-mono mb-6 px-3 py-1.5 rounded-lg truncate max-w-[280px]"
        style={{
          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          color: darkMode ? '#6B7280' : '#9CA3AF',
        }}
        dir="ltr"
      >
        {url}
      </motion.p>

      {/* Open button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
        className="px-8 py-3.5 rounded-2xl text-sm font-bold text-white flex items-center gap-2.5 mb-3"
        style={{
          background: brandInfo.gradient,
          boxShadow: `0 4px 20px ${brandInfo.primary}40`,
        }}
      >
        <ExternalLink className="w-4.5 h-4.5" />
        {isAr ? 'فتح في المتصفح' : 'Open in Browser'}
      </motion.button>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[11px] flex items-center gap-1.5"
        style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}
      >
        <Smartphone className="w-3 h-3" />
        {isAr
          ? 'سيتم فتح الصفحة في متصفح الجهاز'
          : 'Page will open in your device browser'}
      </motion.p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// WEBVIEW SCREEN — In-App Browser inside the phone frame
// ═══════════════════════════════════════════════════════════════════════
export function WebViewScreen() {
  const { language, t } = useLanguageStore();
  const webviewUrl = useMobileStore((s) => s.webviewUrl);
  const webviewTitle = useMobileStore((s) => s.webviewTitle);
  const closeWebview = useMobileStore((s) => s.closeWebview);
  const darkMode = useMobileStore((s) => s.darkMode);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(webviewUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [urlHistory, setUrlHistory] = useState<string[]>(webviewUrl ? [webviewUrl] : []);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const brandInfo = getBrandInfo(webviewUrl || '');
  const displayTitle = webviewTitle || (language === 'ar' ? brandInfo.nameAr : brandInfo.nameEn) || getDomainName(webviewUrl || '');

  // Determine if this site is known to block iframes
  const siteBlocksIframe = brandInfo.blocksIframe;

  // Get the effective URL (convert YouTube watch URLs to embed URLs)
  const effectiveUrl = React.useMemo(() => {
    if (!webviewUrl) return '';
    if (brandInfo.embedUrl) {
      return brandInfo.embedUrl(webviewUrl);
    }
    return webviewUrl;
  }, [webviewUrl, brandInfo]);

  // Navigate to URL
  const navigateTo = useCallback((url: string) => {
    setLoading(true);
    setError(false);
    setCurrentUrl(url);
    setUrlHistory((prev) => [...prev.slice(0, historyIndex + 1), url]);
    setHistoryIndex((prev) => prev + 1);
    setCanGoBack(true);
    setCanGoForward(false);
  }, [historyIndex]);

  // Go back in history
  const goBackHistory = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(urlHistory[newIndex]);
      setLoading(true);
      setError(false);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
    } else {
      closeWebview();
    }
  }, [historyIndex, urlHistory, closeWebview]);

  // Go forward in history
  const goForwardHistory = useCallback(() => {
    if (historyIndex < urlHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(urlHistory[newIndex]);
      setLoading(true);
      setError(false);
      setCanGoBack(true);
      setCanGoForward(newIndex < urlHistory.length - 1);
    }
  }, [historyIndex, urlHistory]);

  // Refresh page
  const refresh = useCallback(() => {
    setLoading(true);
    setError(false);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl || '';
    }
  }, [currentUrl]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  // Loading timeout - if iframe doesn't load in 8 seconds, assume blocked
  useEffect(() => {
    if (!siteBlocksIframe && loading) {
      const timer = setTimeout(() => {
        // If still loading after 8s, don't auto-error, just let user decide
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [loading, siteBlocksIframe]);

  if (!webviewUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 flex flex-col z-50"
      dir="ltr"
      style={{ background: darkMode ? '#0B1120' : '#FFFFFF' }}
    >
      {/* ─── Browser Header Bar ─── */}
      <div
        className="flex-shrink-0 flex flex-col"
        style={{ background: brandInfo.gradient }}
      >
        {/* Top row: Close + Title + Refresh */}
        <div className="flex items-center gap-2 px-3 pt-11 pb-2">
          {/* Close button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={closeWebview}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <X className="w-4 h-4 text-white" />
          </motion.button>

          {/* Title + domain */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
              <h2 className="text-white font-bold text-sm truncate">
                {displayTitle}
              </h2>
            </div>
            <p className="text-white/50 text-[10px] truncate mt-0.5" dir="ltr">
              {webviewUrl}
            </p>
          </div>

          {/* Refresh button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={refresh}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        {/* URL Bar */}
        <div className="px-3 pb-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            {/* Back arrow */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={goBackHistory}
              disabled={!canGoBack}
              className="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <ChevronLeft className="w-3.5 h-3.5 text-white" />
            </motion.button>

            {/* Forward arrow */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={goForwardHistory}
              disabled={!canGoForward}
              className="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </motion.button>

            {/* URL display */}
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs truncate font-mono" dir="ltr">
                {currentUrl}
              </p>
            </div>

            {/* Open external button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => window.open(webviewUrl, '_blank', 'noopener,noreferrer')}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              title={language === 'ar' ? 'فتح في المتصفح' : 'Open in browser'}
            >
              <ExternalLink className="w-3 h-3 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Loading bar */}
        <AnimatePresence>
          {loading && !siteBlocksIframe && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-0.5 relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <motion.div
                className="h-full"
                style={{ background: 'rgba(255,255,255,0.8)' }}
                initial={{ width: '0%' }}
                animate={{ width: '70%' }}
                transition={{ duration: 2, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Content Area ─── */}
      <div className="flex-1 relative min-h-0">
        {siteBlocksIframe ? (
          // Show branded social media page directly (no iframe attempt)
          <SocialMediaBrandedPage
            url={webviewUrl}
            brandInfo={brandInfo}
            language={language}
            darkMode={darkMode}
          />
        ) : error ? (
          // Error state for sites that were attempted in iframe
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6" style={{ background: darkMode ? '#0B1120' : '#F8F9FA' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(255,59,48,0.1)' }}
            >
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </motion.div>
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">
              {language === 'ar' ? 'لا يمكن تحميل الصفحة' : 'Cannot Load Page'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
              {language === 'ar'
                ? 'هذا الموقع لا يسمح بعرضه داخل إطار آخر'
                : 'This website does not allow embedding in frames'}
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={refresh}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white mb-3 flex items-center gap-2"
              style={{ background: brandInfo.gradient }}
            >
              <RefreshCw className="w-4 h-4" />
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => window.open(webviewUrl, '_blank', 'noopener,noreferrer')}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border"
              style={{
                borderColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                color: darkMode ? '#A8B8CC' : '#555',
              }}
            >
              {language === 'ar' ? 'فتح في المتصفح' : 'Open in Browser'}
            </motion.button>
          </div>
        ) : (
          <>
            {/* Loading overlay */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-10"
                  style={{ background: darkMode ? '#0B1120' : '#F8F9FA' }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 border-3 border-t-transparent rounded-full mb-4"
                    style={{ borderColor: `${brandInfo.primary}33`, borderTopColor: brandInfo.primary }}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono truncate max-w-[250px]" dir="ltr">
                    {effectiveUrl}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* iframe */}
            <iframe
              ref={iframeRef}
              src={effectiveUrl || ''}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              className="w-full h-full border-0"
              style={{ background: '#fff' }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
              title={displayTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </>
        )}
      </div>

      {/* ─── Bottom Safe Area Bar ─── */}
      <div
        className="flex-shrink-0 h-1"
        style={{ background: brandInfo.gradient }}
      />
    </motion.div>
  );
}
