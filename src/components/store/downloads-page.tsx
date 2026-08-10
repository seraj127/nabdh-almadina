'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileArchive, FileCode, HardDrive, ArrowDownToLine, CheckCircle2, Clock, AlertCircle, Package } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';

interface FileInfo {
  type: string;
  fileName: string;
  size: number;
  sizeFormatted: string;
  mime: string;
  lastModified: string;
  supportsResume: boolean;
}

/**
 * DownloadsPage — Professional project download center
 * - Full archive (with node_modules, .git, .next)
 * - Source archive (code only)
 * - Resume-supported downloads via browser native download
 * - Copy link for download managers (IDM / wget)
 * - RTL/LTR support
 */
export function DownloadsPage() {
  const { t, direction } = useLanguageStore(useShallow((s) => ({ t: s.t, direction: s.direction })));
  const isRTL = direction === 'rtl';

  const [filesInfo, setFilesInfo] = useState<Record<string, FileInfo>>({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadStarted, setDownloadStarted] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Fetch file info on mount
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const [fullRes, sourceRes] = await Promise.all([
          fetch('/api/download-project?type=full&info'),
          fetch('/api/download-project?type=source&info'),
        ]);
        const full = fullRes.ok ? await fullRes.json() : null;
        const source = sourceRes.ok ? await sourceRes.json() : null;
        const info: Record<string, FileInfo> = {};
        if (full) info.full = full;
        if (source) info.source = source;
        setFilesInfo(info);
      } catch {
        // Fallback info
        setFilesInfo({
          full: {
            type: 'full',
            fileName: 'city-pulse-full.tar.gz',
            size: 840966388,
            sizeFormatted: '802 MB',
            mime: 'application/gzip',
            lastModified: new Date().toISOString(),
            supportsResume: true,
          },
          source: {
            type: 'source',
            fileName: 'city-pulse-source.tar.gz',
            size: 193623972,
            sizeFormatted: '185 MB',
            mime: 'application/gzip',
            lastModified: new Date().toISOString(),
            supportsResume: true,
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleDownload = (type: string) => {
    const fileInfo = filesInfo[type];
    if (!fileInfo) return;

    setDownloading(type);

    try {
      // Use browser's native download mechanism — streams directly to disk
      // without loading the entire file into memory.
      // The API sets Content-Disposition: attachment so the browser downloads
      // the file rather than navigating to it.
      const downloadUrl = `/api/download-project?type=${type}`;

      // Method 1: Hidden anchor with download attribute
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.setAttribute('download', fileInfo.fileName);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Clean up after a short delay
      setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
      }, 200);

      // Show "download started" state
      setDownloadStarted(type);
      setTimeout(() => {
        setDownloadStarted(null);
        setDownloading(null);
      }, 6000);
    } catch {
      // Final fallback: direct navigation
      window.location.href = `/api/download-project?type=${type}`;
      setDownloadStarted(type);
      setTimeout(() => {
        setDownloadStarted(null);
        setDownloading(null);
      }, 6000);
    }
  };

  const handleCopyLink = (type: string) => {
    const url = `${window.location.origin}/api/download-project?type=${type}`;
    navigator.clipboard.writeText(url).catch(() => {
      // Fallback for iframe environments
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const packages = [
    {
      type: 'full',
      icon: Package,
      iconBg: 'bg-nabdh-primary/10',
      borderColor: 'border-nabdh-primary/20',
      hoverBorder: 'hover:border-nabdh-primary/40',
      features: [
        { icon: HardDrive, text: isRTL ? 'node_modules — جميع الحزم' : 'node_modules — All packages' },
        { icon: FileCode, text: isRTL ? '.git — تاريخ المشروع الكامل' : '.git — Full project history' },
        { icon: FileArchive, text: isRTL ? '.next — البناء المترجم' : '.next — Compiled build' },
        { icon: FileCode, text: isRTL ? 'الكود المصدري الكامل' : 'Full source code' },
        { icon: FileArchive, text: isRTL ? 'قاعدة البيانات + الـ Seed' : 'Database + Seed data' },
        { icon: FileArchive, text: isRTL ? 'ملفات Docker و PM2' : 'Docker & PM2 configs' },
      ],
      tag: isRTL ? 'كامل' : 'Full',
      tagColor: 'bg-nabdh-primary text-white',
    },
    {
      type: 'source',
      icon: FileCode,
      iconBg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      hoverBorder: 'hover:border-emerald-500/40',
      features: [
        { icon: FileCode, text: isRTL ? 'الكود المصدري فقط' : 'Source code only' },
        { icon: FileArchive, text: isRTL ? 'قاعدة البيانات + الـ Seed' : 'Database + Seed data' },
        { icon: FileArchive, text: isRTL ? 'ملفات Docker و PM2' : 'Docker & PM2 configs' },
        { icon: FileArchive, text: isRTL ? 'ملفات الإعداد (.env.example)' : 'Setup files (.env.example)' },
        { icon: Clock, text: isRTL ? 'يحتاج: bun install' : 'Requires: bun install' },
        { icon: Clock, text: isRTL ? 'يحتاج: bun run db:push' : 'Requires: bun run db:push' },
      ],
      tag: isRTL ? 'مصدري' : 'Source',
      tagColor: 'bg-emerald-500 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-nabdh-primary/10 text-nabdh-primary text-sm font-medium mb-4">
            <Download className="size-4" />
            {isRTL ? 'مركز التحميل' : 'Download Center'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {isRTL ? 'تحميل مشروع نبض المدينة' : 'Download City Pulse Project'}
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            {isRTL
              ? 'قم بتحميل المشروع الكامل مع جميع الملفات أو الكود المصدري فقط. جميع التحميلات تدعم الاستئناف.'
              : 'Download the full project with all files or source code only. All downloads support resume.'}
          </p>
        </motion.div>

        {/* ── Download Cards ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {packages.map((pkg, index) => {
            const info = filesInfo[pkg.type];
            const isDownloading = downloading === pkg.type;
            const hasStarted = downloadStarted === pkg.type;
            const isCopied = copiedType === pkg.type;
            const Icon = pkg.icon;

            return (
              <motion.div
                key={pkg.type}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className={cn(
                  'relative rounded-2xl border-2 bg-card p-6 transition-all duration-300',
                  pkg.borderColor,
                  pkg.hoverBorder,
                  'hover:shadow-xl hover:shadow-nabdh-primary/5',
                  pkg.type === 'full' && 'ring-1 ring-nabdh-primary/10',
                  hasStarted && 'ring-2 ring-green-500/30'
                )}
              >
                {/* Tag */}
                <div className={cn(
                  'absolute -top-3 start-6 px-3 py-1 rounded-full text-xs font-bold',
                  pkg.tagColor
                )}>
                  {pkg.tag}
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-5 mt-2">
                  <div className={cn('size-14 rounded-2xl flex items-center justify-center shrink-0', pkg.iconBg)}>
                    <Icon className={cn(
                      'size-7',
                      pkg.type === 'full' ? 'text-nabdh-primary' : 'text-emerald-500'
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {pkg.type === 'full'
                        ? (isRTL ? 'المشروع الكامل' : 'Full Project')
                        : (isRTL ? 'الكود المصدري' : 'Source Code')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {info ? info.fileName : '...'}
                    </p>
                  </div>
                </div>

                {/* Size & Info */}
                {loading ? (
                  <div className="h-16 bg-muted/30 rounded-xl animate-pulse mb-5" />
                ) : info ? (
                  <div className="flex items-center gap-4 mb-5 p-3 rounded-xl bg-muted/30">
                    <div className="text-center flex-1">
                      <p className="text-2xl font-bold text-foreground">{info.sizeFormatted}</p>
                      <p className="text-[11px] text-muted-foreground">{isRTL ? 'الحجم' : 'Size'}</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center flex-1">
                      <p className="text-sm font-semibold text-green-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        {isRTL ? 'استئناف' : 'Resume'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{isRTL ? 'يدعم الاستئناف' : 'Resume supported'}</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center flex-1">
                      <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-1">
                        <FileArchive className="size-3.5" />
                        .tar.gz
                      </p>
                      <p className="text-[11px] text-muted-foreground">{isRTL ? 'الصيغة' : 'Format'}</p>
                    </div>
                  </div>
                ) : null}

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {pkg.features.map((feat, i) => {
                    const FeatIcon = feat.icon;
                    return (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <FeatIcon className="size-3.5 shrink-0 text-foreground/40" />
                        <span>{feat.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Download Button — uses native browser download */}
                <button
                  onClick={() => handleDownload(pkg.type)}
                  disabled={isDownloading && !hasStarted}
                  className={cn(
                    'w-full h-12 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2',
                    hasStarted
                      ? 'bg-green-500/15 text-green-600 border border-green-500/30'
                      : isDownloading
                        ? 'bg-nabdh-primary/15 text-nabdh-primary cursor-wait'
                        : pkg.type === 'full'
                          ? 'nabdh-gradient text-white hover:shadow-lg hover:shadow-nabdh-primary/25'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25'
                  )}
                >
                  {hasStarted ? (
                    <>
                      <CheckCircle2 className="size-5" />
                      <span>
                        {isRTL ? 'بدأ التحميل ✓ تحقق من شريط التحميل' : 'Download started ✓ check your browser downloads'}
                      </span>
                    </>
                  ) : isDownloading ? (
                    <>
                      <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      <span>
                        {isRTL ? 'جاري بدء التحميل...' : 'Starting download...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="size-4" />
                      <span>
                        {isRTL ? 'تحميل الآن' : 'Download Now'}
                      </span>
                    </>
                  )}
                </button>

                {/* Copy resume link for download managers */}
                <button
                  onClick={() => handleCopyLink(pkg.type)}
                  className={cn(
                    'w-full mt-2 py-2.5 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2',
                    isCopied
                      ? 'text-green-600 bg-green-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>{isRTL ? 'تم نسخ الرابط!' : 'Link copied!'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                      </svg>
                      <span>{isRTL ? 'نسخ رابط الاستئناف (لـ IDM / wget)' : 'Copy resume link (for IDM / wget)'}</span>
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* ── Resume Download Instructions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border bg-card p-6 mb-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="size-5 text-nabdh-primary" />
            {isRTL ? 'طريقة الاستئناف والتحميل' : 'How to Download & Resume'}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="size-7 rounded-full nabdh-gradient text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <p className="text-sm font-medium text-foreground">{isRTL ? 'اضغط "تحميل الآن"' : 'Click "Download Now"'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL ? 'سيبدأ المتصفح بتحميل الملف تلقائياً — تحقق من شريط التحميل أسفل المتصفح' : 'Your browser will start downloading automatically — check the downloads bar at the bottom'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="size-7 rounded-full nabdh-gradient text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <p className="text-sm font-medium text-foreground">{isRTL ? 'للتحميل بسرعة أكبر — استخدم IDM أو wget' : 'For faster downloads — use IDM or wget'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL ? 'انسخ الرابط بالضغط على "نسخ رابط الاستئناف" والصقه في برنامج التحميل' : 'Copy the link by clicking "Copy resume link" and paste it in your download manager'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="size-7 rounded-full nabdh-gradient text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <p className="text-sm font-medium text-foreground">{isRTL ? 'أوامر Terminal للاستئناف' : 'Terminal commands for resuming'}</p>
                <div className="mt-2 bg-muted/50 rounded-lg p-3 font-mono text-xs space-y-1.5" dir="ltr">
                  <div className="text-muted-foreground"># {isRTL ? 'استئناف التحميل المقطوع' : 'Resume interrupted download'}</div>
                  <div className="text-foreground">wget -c https://your-domain.com/api/download-project?type=full</div>
                  <div className="text-muted-foreground mt-2"># {isRTL ? 'أو باستخدام curl' : 'Or with curl'}</div>
                  <div className="text-foreground">curl -C - -O https://your-domain.com/api/download-project?type=full</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Quick Setup Instructions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border bg-card p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="size-5 text-nabdh-primary" />
            {isRTL ? 'خطوات التشغيل بعد التحميل' : 'Setup Steps After Download'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="size-7 rounded-full nabdh-gradient text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{isRTL ? 'فك الضغط' : 'Extract'}</p>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">tar -xzf city-pulse-full.tar.gz</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="size-7 rounded-full nabdh-gradient text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{isRTL ? 'إعداد البيئة' : 'Setup Environment'}</p>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">cp .env.example .env</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="size-7 rounded-full nabdh-gradient text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{isRTL ? 'تثبيت الحزم (للمصدري فقط)' : 'Install Packages (Source only)'}</p>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">bun install</code>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="size-7 rounded-full nabdh-gradient text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{isRTL ? 'إعداد قاعدة البيانات' : 'Setup Database'}</p>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">bun run db:push && db:seed</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="size-7 rounded-full nabdh-gradient text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">5</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{isRTL ? 'تشغيل المشروع' : 'Start Project'}</p>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">bun run dev</code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="size-7 rounded-full nabdh-gradient text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">6</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{isRTL ? 'أو باستخدام Docker' : 'Or with Docker'}</p>
                  <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded mt-1 inline-block">./deploy.sh docker</code>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
