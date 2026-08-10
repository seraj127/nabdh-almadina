'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/stores/language-store';

export function ApkDownloadPage({ onBack }: { onBack: () => void }) {
  const { language } = useLanguageStore();
  const isAr = language === 'ar';
  const direction = isAr ? 'rtl' : 'ltr';
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const apkUrl = '/nabd-al-madina.apk';
  const apkFileName = 'nabd-al-madina.apk';
  const apkSize = '24 MB';

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = apkFileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      setDownloading(false);
    }, 3000);
  };

  const handleCopyLink = async () => {
    const absoluteUrl = `${window.location.origin}${apkUrl}`;
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

  return (
    <div dir={direction} className="min-h-screen flex flex-col" style={{ background: '#0A1628' }}>
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0,137,123,0.4) 0%, transparent 60%)',
        }} />
        <div className="relative max-w-lg mx-auto px-6 pt-10 pb-6 text-center">
          {/* Back button */}
          <button
            onClick={onBack}
            className="absolute top-4 start-4 flex items-center gap-2 px-4 py-2 rounded-xl text-gray-400 hover:text-white transition-all hover:bg-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span className="text-sm">{isAr ? 'رجوع' : 'Back'}</span>
          </button>

          {/* App Icon - Circular Frame */}
          <div className="relative mx-auto mb-6" style={{ width: '130px', height: '130px' }}>
            {/* Gradient ring border */}
            <div
              className="absolute rounded-full"
              style={{
                inset: '-5px',
                background: 'conic-gradient(from 0deg, #004B63, #00897B, #26A69A, #00897B, #004B63)',
                boxShadow: '0 12px 40px rgba(0,137,123,0.4), 0 0 60px rgba(0,137,123,0.12)',
              }}
            />
            {/* Circle with logo clipped inside */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ background: '#FFFFFF' }}
            >
              <img
                src="/logo-circle.png?v=2"
                alt={isAr ? 'شعار نبض المدينة' : 'City Pulse Logo'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">
            {isAr ? 'نبض المدينة' : 'City Pulse'}
          </h1>
          <p className="text-base text-gray-400 mb-2">
            {isAr ? 'تطبيق الموبايل للأندرويد' : 'Android Mobile App'}
          </p>

          {/* Badges */}
          <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{
              background: 'rgba(0,137,123,0.15)',
              color: '#00897B',
              border: '1px solid rgba(0,137,123,0.3)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              {isAr ? 'استئناف مدعوم' : 'Resume OK'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{
              background: 'rgba(124,58,237,0.15)',
              color: '#A78BFA',
              border: '1px solid rgba(124,58,237,0.3)',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 11.48l1.44-2.5c.12-.21.05-.47-.16-.59s-.47-.05-.59.16l-1.46 2.53c-1.1-.46-2.34-.71-3.63-.71s-2.53.25-3.63.71L8.11 8.55c-.21-.12-.47-.05-.59.16s-.05.47.16.59l1.44 2.5C6.6 13.17 4.8 15.63 4.5 18.5h15c-.3-2.87-2.1-5.33-4.6-6.52zM10 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
              </svg>
              Android
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{
              background: 'rgba(255,111,97,0.15)',
              color: '#FF6F61',
              border: '1px solid rgba(255,111,97,0.3)',
            }}>
              {apkSize}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-6">
        {/* Download Card */}
        <div className="rounded-2xl p-6 border border-white/10 mb-6" style={{
          background: 'linear-gradient(180deg, rgba(0,137,123,0.08) 0%, rgba(0,75,99,0.05) 100%)',
          borderColor: 'rgba(0,137,123,0.2)',
        }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{
              background: 'rgba(0,137,123,0.2)',
            }}>
              📱
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">
                {isAr ? 'تطبيق أندرويد' : 'Android App'}
              </h3>
              <p className="text-gray-400 text-sm">
                {isAr ? 'ملف APK جاهز للتثبيت المباشر' : 'Ready-to-install APK file'}
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-gray-500 text-[10px] mb-1">{isAr ? 'الإصدار' : 'Version'}</div>
              <div className="text-white font-semibold text-sm">1.0.0</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-gray-500 text-[10px] mb-1">{isAr ? 'الحجم' : 'Size'}</div>
              <div className="text-white font-semibold text-sm">{apkSize}</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-gray-500 text-[10px] mb-1">{isAr ? 'الصيغة' : 'Format'}</div>
              <div className="text-white font-semibold text-sm">APK</div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-60 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #004B63, #00897B)',
              boxShadow: '0 8px 32px rgba(0,137,123,0.3)',
            }}
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>{isAr ? 'جارٍ بدء التحميل...' : 'Starting download...'}</span>
              </>
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>{isAr ? 'تحميل التطبيق' : 'Download App'}</span>
              </>
            )}
          </button>

          {/* Direct link */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <a
              href={apkUrl}
              download={apkFileName}
              className="text-gray-400 hover:text-white text-xs transition-colors no-underline"
            >
              {isAr ? 'رابط مباشر' : 'Direct link'}
            </a>
            <span className="text-gray-600">•</span>
            <button
              onClick={handleCopyLink}
              className="text-gray-400 hover:text-white text-xs transition-colors"
            >
              {copied ? (
                <span style={{ color: '#00897B' }}>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
              ) : (
                isAr ? 'نسخ الرابط' : 'Copy link'
              )}
            </button>
          </div>
        </div>

        {/* Install Instructions */}
        <div className="rounded-2xl p-5 border border-white/10" style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        }}>
          <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <span className="text-lg">📲</span>
            {isAr ? 'خطوات التثبيت' : 'Installation Steps'}
          </h3>
          <div className="space-y-3">
            {[
              {
                num: 1,
                text: isAr
                  ? 'حمّل ملف APK على هاتفك الأندرويد'
                  : 'Download the APK file to your Android phone',
              },
              {
                num: 2,
                text: isAr
                  ? 'افتح الإعدادات ← الأمان ← فعّل "التركيب من مصادر غير معروفة"'
                  : 'Go to Settings → Security → Enable "Install from Unknown Sources"',
              },
              {
                num: 3,
                text: isAr
                  ? 'افتح ملف APK واتبع خطوات التثبيت'
                  : 'Open the APK file and follow installation steps',
              },
              {
                num: 4,
                text: isAr
                  ? 'استمتع باستخدام تطبيق نبض المدينة! 🎉'
                  : 'Enjoy using City Pulse app! 🎉',
              },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-3">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'rgba(0,137,123,0.2)', color: '#00897B' }}
                >
                  {step.num}
                </span>
                <p className="text-gray-400 text-sm leading-relaxed pt-0.5">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Resume instruction */}
        <div className="mt-4 rounded-xl p-4 border border-dashed border-white/10" style={{
          background: 'rgba(255,255,255,0.02)',
        }}>
          <p className="text-gray-500 text-xs text-center">
            {isAr
              ? '💡 الروابط تدعم استئناف التحميل — استخدم مدير التحميل مثل IDM أو wget -c'
              : '💡 Links support resume — use a download manager like IDM or wget -c'}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-5 text-center border-t border-white/5">
        <p className="text-gray-600 text-xs">
          {isAr ? 'نبض المدينة © 2026' : 'City Pulse © 2026'}
        </p>
      </footer>
    </div>
  );
}
