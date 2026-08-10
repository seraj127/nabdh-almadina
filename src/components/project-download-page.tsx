'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import {
  Download, FileArchive, Code2, Database, Smartphone, Monitor,
  Server, Shield, CheckCircle2, Copy, Check, ChevronDown, ChevronUp,
  Clock, HardDrive, Cpu, Globe, GitBranch, Package, Layers,
  ArrowDownToLine, ExternalLink, Terminal, Zap
} from 'lucide-react';

type DownloadType = 'full' | 'source';

interface FileInfo {
  fileName: string;
  size: number;
  sizeFormatted: string;
  lastModified: string;
  supportsResume: boolean;
  descAr: string;
  descEn: string;
}

const TYPE_CONFIG: Record<DownloadType, {
  icon: typeof Code2;
  titleAr: string; titleEn: string;
  subtitleAr: string; subtitleEn: string;
  badgeAr: string; badgeEn: string;
  badgeColor: string;
  gradient: string;
  contentsAr: string[]; contentsEn: string[];
  installSteps: { code: string; descAr: string; descEn: string }[];
}> = {
  full: {
    icon: HardDrive,
    titleAr: 'المشروع الكامل',
    titleEn: 'Complete Project',
    subtitleAr: 'الكود المصدري + node_modules + ملفات البناء',
    subtitleEn: 'Source code + node_modules + build files',
    badgeAr: 'كامل',
    badgeEn: 'Full',
    badgeColor: '#F59E0B',
    gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
    contentsAr: [
      'الكود المصدري الكامل (src/)',
      'حزم Node.js الكاملة (node_modules/)',
      'ملفات البناء المحسّنة (.next/)',
      'قاعدة البيانات (prisma/ + db/)',
      'الأصول الثابتة والمنتجات (public/)',
      'الخدمات المصغرة (mini-services/)',
      'سكريبتات الأدوات (scripts/)',
      'ملفات الإعدادات والتكوين',
      'ملف .env.example (بدون بيانات سرية)',
    ],
    contentsEn: [
      'Complete source code (src/)',
      'Full Node.js packages (node_modules/)',
      'Optimized build files (.next/)',
      'Database schema & data (prisma/ + db/)',
      'Static assets & products (public/)',
      'Mini services (mini-services/)',
      'Utility scripts (scripts/)',
      'Configuration files',
      '.env.example (no secrets included)',
    ],
    installSteps: [
      { code: 'tar -xzf nabdh-almadina-full.tar.gz', descAr: 'فك ضغط الملف المحمّل', descEn: 'Extract the downloaded archive' },
      { code: 'cd nabdh-almadina', descAr: 'الدخول لمجلد المشروع', descEn: 'Enter the project directory' },
      { code: 'cp .env.example .env', descAr: 'نسخ ملف البيئة وتعديله', descEn: 'Copy and edit the environment file' },
      { code: 'bun run db:push', descAr: 'تهيئة قاعدة البيانات', descEn: 'Initialize the database' },
      { code: 'bun run dev', descAr: 'تشغيل الخادم المحلي', descEn: 'Start the development server' },
    ],
  },
  source: {
    icon: Code2,
    titleAr: 'الكود المصدري فقط',
    titleEn: 'Source Code Only',
    subtitleAr: 'بدون node_modules — يتطلب bun install',
    subtitleEn: 'Without node_modules — requires bun install',
    badgeAr: 'مصدري',
    badgeEn: 'Source',
    badgeColor: '#00897B',
    gradient: 'linear-gradient(135deg, #004B63, #00897B)',
    contentsAr: [
      'الكود المصدري الكامل (src/)',
      'قاعدة البيانات (prisma/)',
      'الأصول الثابتة (public/)',
      'الخدمات المصغرة (mini-services/)',
      'سكريبتات الأدوات (scripts/)',
      'ملفات الإعدادات والتكوين',
      'ملف .env.example',
    ],
    contentsEn: [
      'Complete source code (src/)',
      'Database schema (prisma/)',
      'Static assets (public/)',
      'Mini services (mini-services/)',
      'Utility scripts (scripts/)',
      'Configuration files',
      '.env.example',
    ],
    installSteps: [
      { code: 'tar -xzf nabdh-almadina-source.tar.gz', descAr: 'فك ضغط الملف المحمّل', descEn: 'Extract the downloaded archive' },
      { code: 'cd nabdh-almadina && bun install', descAr: 'تثبيت الحزم المطلوبة', descEn: 'Install required dependencies' },
      { code: 'cp .env.example .env', descAr: 'نسخ ملف البيئة وتعديله', descEn: 'Copy and edit the environment file' },
      { code: 'bun run db:push', descAr: 'تهيئة قاعدة البيانات', descEn: 'Initialize the database' },
      { code: 'bun run dev', descAr: 'تشغيل الخادم المحلي', descEn: 'Start the development server' },
    ],
  },
};

export function ProjectDownloadPage({ onBack }: { onBack?: () => void }) {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const direction = isAr ? 'rtl' : 'ltr';

  const [selectedType, setSelectedType] = useState<DownloadType>('full');
  const [fileInfos, setFileInfos] = useState<Record<DownloadType, FileInfo | null>>({ full: null, source: null });
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const config = TYPE_CONFIG[selectedType];
  const fileInfo = fileInfos[selectedType];

  // Fetch file info for both types
  useEffect(() => {
    const fetchInfos = async () => {
      const infos: Record<DownloadType, FileInfo | null> = { full: null, source: null };
      for (const type of ['full', 'source'] as DownloadType[]) {
        try {
          const res = await fetch(`/api/download-project?info=true&type=${type}`);
          if (res.ok) {
            infos[type] = await res.json();
          }
        } catch {
          // Fallback
          const cfg = TYPE_CONFIG[type];
          infos[type] = {
            fileName: `nabdh-almadina-${type}.tar.gz`,
            size: type === 'full' ? 650000000 : 25000000,
            sizeFormatted: type === 'full' ? '~620 MB' : '~24 MB',
            lastModified: new Date().toISOString(),
            supportsResume: true,
            descAr: cfg.titleAr,
            descEn: cfg.titleEn,
          };
        }
      }
      setFileInfos(infos);
      setLoadingInfo(false);
    };
    fetchInfos();
  }, []);

  const downloadUrl = `/api/download-project?type=${selectedType}`;



  // Download: use browser's native download manager (fast, memory-efficient, supports resume)
  const handleDownload = useCallback(() => {
    setDownloadComplete(false);

    // Use a hidden anchor to trigger the browser's built-in download
    // This streams directly to disk (no RAM spike), shows progress in browser download bar,
    // and natively supports resume via HTTP Range Requests
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileInfo?.fileName || `nabdh-almadina-${selectedType}.tar.gz`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Show confirmation after a short delay (gives browser time to start the download)
    setTimeout(() => {
      setDownloadComplete(true);
    }, 1500);
  }, [downloadUrl, fileInfo, selectedType]);

  const handleCopyLink = async () => {
    const absoluteUrl = `${window.location.origin}${downloadUrl}`;
    try {
      await navigator.clipboard.writeText(absoluteUrl);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = absoluteUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWgetCopy = async () => {
    const cmd = `wget -c "${window.location.origin}${downloadUrl}"`;
    try {
      await navigator.clipboard.writeText(cmd);
    } catch {
      // silent
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Tech stack items
  const techStack = [
    { icon: Globe, nameAr: 'Next.js 16', nameEn: 'Next.js 16', color: '#00897B' },
    { icon: Code2, nameAr: 'TypeScript 5', nameEn: 'TypeScript 5', color: '#3178C6' },
    { icon: Database, nameAr: 'Prisma + SQLite', nameEn: 'Prisma + SQLite', color: '#2D3748' },
    { icon: Smartphone, nameAr: 'Capacitor', nameEn: 'Capacitor', color: '#119EFF' },
    { icon: Monitor, nameAr: 'shadcn/ui', nameEn: 'shadcn/ui', color: '#A78BFA' },
    { icon: Server, nameAr: 'Zustand v5', nameEn: 'Zustand v5', color: '#F59E0B' },
    { icon: Layers, nameAr: 'Tailwind CSS 4', nameEn: 'Tailwind CSS 4', color: '#06B6D4' },
    { icon: GitBranch, nameAr: 'Framer Motion', nameEn: 'Framer Motion', color: '#FF6F61' },
  ];

  // Project features
  const features = [
    { icon: Monitor, titleAr: 'واجهة المتجر', titleEn: 'Store Interface', descAr: 'متجر إلكتروني كامل بتصميم احترافي', descEn: 'Full e-commerce store with professional design' },
    { icon: Smartphone, titleAr: 'تطبيق الموبايل', titleEn: 'Mobile App', descAr: 'تطبيق أندرويد محاكى داخل المتصفح', descEn: 'Simulated Android app in browser' },
    { icon: Shield, titleAr: 'لوحة التحكم', titleEn: 'Admin Panel', descAr: 'إدارة كاملة للمنتجات والطلبات والشحن', descEn: 'Full management for products, orders & shipping' },
    { icon: Cpu, titleAr: 'ذكاء اصطناعي', titleEn: 'AI Integration', descAr: 'محادثة ذكية وبحث صوتي وتحليل صور', descEn: 'Smart chat, voice search & image analysis' },
  ];

  return (
    <div dir={direction} className="min-h-screen flex flex-col" style={{ background: '#0A1628' }}>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(0,137,123,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0,75,99,0.15) 0%, transparent 50%)',
        }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="max-w-2xl mx-auto w-full px-6 pt-8 pb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-400 hover:text-white transition-all hover:bg-white/10 mb-6"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              <span className="text-sm">{isAr ? 'العودة' : 'Back'}</span>
            </button>
          )}

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="relative mx-auto mb-6" style={{ width: '110px', height: '110px' }}>
              <div
                className="absolute rounded-full animate-spin"
                style={{
                  inset: '-4px',
                  background: 'conic-gradient(from 0deg, #004B63, #00897B, #26A69A, #00897B, #004B63)',
                  boxShadow: '0 12px 40px rgba(0,137,123,0.4)',
                  animationDuration: '8s',
                }}
              />
              <div className="absolute inset-0 rounded-full overflow-hidden" style={{ background: '#FFFFFF' }}>
                <img
                  src="/logo-circle.png?v=2"
                  alt={isAr ? 'شعار نبض المدينة' : 'City Pulse Logo'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">
              {isAr ? 'نبض المدينة' : 'City Pulse'}
            </h1>
            <p className="text-lg text-gray-400 mb-4">
              {isAr ? 'تحميل المشروع الكامل' : 'Download Complete Project'}
            </p>

            {/* Badges */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{
                background: 'rgba(0,137,123,0.15)', color: '#00897B', border: '1px solid rgba(0,137,123,0.3)',
              }}>
                <Zap className="w-3 h-3" />
                {isAr ? 'استئناف مدعوم' : 'Resume OK'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{
                background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)',
              }}>
                <Package className="w-3 h-3" />
                {fileInfo?.sizeFormatted || '...'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{
                background: 'rgba(167,139,250,0.15)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.3)',
              }}>
                <FileArchive className="w-3 h-3" />
                tar.gz
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 pb-8">
          {/* ── Type Selection Cards ── */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {(['full', 'source'] as DownloadType[]).map((type) => {
              const cfg = TYPE_CONFIG[type];
              const info = fileInfos[type];
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setDownloadComplete(false); setDownloadProgress(0); }}
                  className="relative rounded-2xl p-4 border-2 transition-all duration-300 text-right"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(180deg, rgba(0,137,123,0.15) 0%, rgba(0,75,99,0.08) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    borderColor: isSelected ? 'rgba(0,137,123,0.5)' : 'rgba(255,255,255,0.08)',
                    boxShadow: isSelected ? '0 0 24px rgba(0,137,123,0.15)' : 'none',
                  }}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-0.5 rounded-full" style={{
                      background: 'linear-gradient(90deg, transparent, #00897B, transparent)',
                      boxShadow: '0 0 12px rgba(0,137,123,0.5)',
                    }} />
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                      background: isSelected ? 'rgba(0,137,123,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSelected ? 'rgba(0,137,123,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                      <cfg.icon className="w-5 h-5" style={{ color: isSelected ? '#00897B' : '#94A3B8' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm">
                        {isAr ? cfg.titleAr : cfg.titleEn}
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5" style={{
                        background: `${cfg.badgeColor}20`, color: cfg.badgeColor,
                      }}>
                        {isAr ? cfg.badgeAr : cfg.badgeEn}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    {isAr ? cfg.subtitleAr : cfg.subtitleEn}
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <span className="text-gray-400 text-[10px]">
                      {loadingInfo ? '...' : (info?.sizeFormatted || (isAr ? 'غير متوفر' : 'N/A'))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Download Card ── */}
          <div className="rounded-3xl p-6 border border-white/10 mb-6 relative overflow-hidden" style={{
            background: 'linear-gradient(180deg, rgba(0,137,123,0.1) 0%, rgba(0,75,99,0.05) 100%)',
            borderColor: 'rgba(0,137,123,0.25)',
          }}>
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full" style={{
              background: 'linear-gradient(90deg, transparent, #00897B, transparent)',
              boxShadow: '0 0 20px rgba(0,137,123,0.5)',
            }} />

            <div className="flex items-center gap-4 mb-5 mt-1">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(0,137,123,0.3), rgba(0,75,99,0.3))',
                border: '1px solid rgba(0,137,123,0.3)',
              }}>
                <config.icon className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl">
                  {isAr ? config.titleAr : config.titleEn}
                </h3>
                <p className="text-gray-400 text-sm">
                  {isAr ? config.subtitleAr : config.subtitleEn}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: isAr ? 'الإصدار' : 'Version', value: '1.0.0' },
                { label: isAr ? 'الحجم' : 'Size', value: fileInfo?.sizeFormatted || '...' },
                { label: isAr ? 'الصيغة' : 'Format', value: 'tar.gz' },
                { label: isAr ? 'الاستئناف' : 'Resume', value: isAr ? 'نعم' : 'Yes' },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-gray-500 text-[10px] mb-1">{item.label}</div>
                  <div className="text-white font-semibold text-sm">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Download Complete */}
            {downloadComplete && (
              <div className="mb-5 p-4 rounded-xl text-center" style={{
                background: 'rgba(0,137,123,0.1)',
                border: '1px solid rgba(0,137,123,0.3)',
              }}>
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-emerald-400 font-semibold">
                  {isAr ? 'جاري التحميل — تابع التقدم من شريط تحميل المتصفح' : 'Download started — check your browser download bar'}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {isAr ? 'يمكنك إعادة التحميل إذا لزم الأمر' : 'You can download again if needed'}
                </p>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={!fileInfo}
              className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: downloadComplete
                  ? 'linear-gradient(135deg, #059669, #00897B)'
                  : 'linear-gradient(135deg, #004B63, #00897B)',
                boxShadow: '0 8px 32px rgba(0,137,123,0.3)',
              }}
            >
              {downloadComplete ? (
                <>
                  <ArrowDownToLine className="w-5 h-5" />
                  <span>{isAr ? 'تحميل مرة أخرى' : 'Download Again'}</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{isAr ? `تحميل ${config.titleAr}` : `Download ${config.titleEn}`}</span>
                </>
              )}
            </button>

            {/* Links row */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <a
                href={downloadUrl}
                className="text-gray-400 hover:text-white transition-colors no-underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                {isAr ? 'رابط مباشر' : 'Direct link'}
              </a>
              <span className="text-gray-700">|</span>
              <button
                onClick={handleCopyLink}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy link')}
              </button>
              <span className="text-gray-700">|</span>
              <button
                onClick={handleWgetCopy}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <Terminal className="w-3 h-3" />
                wget
              </button>
            </div>
          </div>

          {/* What's included comparison */}
          <div className="rounded-2xl p-5 border border-white/10 mb-6" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-white font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                {isAr ? 'محتويات الحزمة' : 'Package Contents'}
              </span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDetails && (
              <div className="mt-4 space-y-2">
                {(isAr ? config.contentsAr : config.contentsEn).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {features.map((feature) => (
              <div
                key={feature.titleEn}
                className="rounded-2xl p-4 border border-white/5"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <feature.icon className="w-6 h-6 text-emerald-400 mb-3" />
                <h4 className="text-white font-bold text-sm mb-1">
                  {isAr ? feature.titleAr : feature.titleEn}
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {isAr ? feature.descAr : feature.descEn}
                </p>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="rounded-2xl p-5 border border-white/10 mb-6" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          }}>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              {isAr ? 'التقنيات المستخدمة' : 'Tech Stack'}
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {techStack.map((tech) => (
                <div
                  key={tech.nameEn}
                  className="text-center p-3 rounded-xl transition-all hover:scale-105 cursor-default"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <tech.icon className="w-5 h-5 mx-auto mb-2" style={{ color: tech.color }} />
                  <div className="text-gray-300 text-[11px] font-medium">{tech.nameAr}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="rounded-2xl p-5 border border-white/10 mb-6" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          }}>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              {isAr ? 'خطوات التثبيت والتشغيل' : 'Installation & Setup'}
            </h3>
            <div className="space-y-3">
              {config.installSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: 'rgba(0,137,123,0.2)', color: '#00897B' }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm mb-1.5">
                      {isAr ? step.descAr : step.descEn}
                    </p>
                    <code className="block px-3 py-2 rounded-lg text-xs text-emerald-300 font-mono" style={{
                      background: 'rgba(0,75,99,0.3)',
                      border: '1px solid rgba(0,137,123,0.2)',
                    }}>
                      {step.code}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resume support notice */}
          <div className="rounded-xl p-4 border border-dashed border-white/10 mb-6" style={{
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-300 text-sm font-semibold mb-1">
                  {isAr ? 'دعم استئناف التحميل' : 'Resume-Supported Downloads'}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {isAr
                    ? 'روابط التحميل تدعم استئناف التحميل (HTTP Range Requests). يمكنك استخدام مدير التحميل مثل IDM أو أمر wget -c لاستئناف التحميل المقطوع.'
                    : 'Download links support HTTP Range Requests for resume. Use a download manager like IDM or wget -c command to resume interrupted downloads.'}
                </p>
                <code className="inline-block mt-2 px-3 py-1.5 rounded-lg text-xs text-amber-300 font-mono" style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}>
                  wget -c /api/download-project?type={'full'}
                </code>
              </div>
            </div>
          </div>

          {/* Last modified */}
          {fileInfo?.lastModified && (
            <p className="text-gray-600 text-xs text-center mb-4">
              <Clock className="w-3 h-3 inline-block me-1" />
              {isAr ? 'آخر تحديث: ' : 'Last updated: '}
              {new Date(fileInfo.lastModified).toLocaleDateString(isAr ? 'ar-LY' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          )}
        </main>

        {/* Footer */}
        <footer className="py-5 text-center border-t border-white/5">
          <p className="text-gray-600 text-xs">
            {isAr ? 'نبض المدينة © 2026 — جميع الحقوق محفوظة' : 'City Pulse © 2026 — All rights reserved'}
          </p>
        </footer>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + '/s';
}
