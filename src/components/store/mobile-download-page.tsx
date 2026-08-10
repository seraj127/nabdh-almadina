'use client';

import { useState } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { X, Download, Smartphone, Code, Terminal, ChevronDown, ChevronUp, HardDrive, Cpu, CheckCircle, AlertTriangle, Copy, Check, Eye } from 'lucide-react';

interface MobileDownloadPageProps {
  isOpen: boolean;
  onClose: () => void;
}

function CodeBlock({ code, id, copiedCmd, onCopy }: { code: string; id: string; copiedCmd: string | null; onCopy: (text: string, id: string) => void }) {
  return (
    <div className="relative group bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm overflow-x-auto" dir="ltr">
      <button
        onClick={() => onCopy(code, id)}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
      >
        {copiedCmd === id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
      </button>
      <pre className="whitespace-pre-wrap break-all">{code}</pre>
    </div>
  );
}

export function MobileDownloadPage({ isOpen, onClose }: MobileDownloadPageProps) {
  const t = useLanguageStore((s) => s.t);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const steps = [
    {
      num: 1,
      icon: <Download className="w-5 h-5" />,
      title: t('mobileDownload.step1Title'),
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {t('mobileDownload.step1Desc')}
          </p>
          {/* APK Download - Most prominent */}
          <a
            href="/nabd-al-madina.apk"
            download="nabd-al-madina.apk"
            className="block p-5 rounded-2xl border-2 border-[#F04E3E]/40 dark:border-[#F04E3E]/40 bg-gradient-to-l from-[#004B63]/5 to-[#F04E3E]/5 dark:from-[#004B63]/10 dark:to-[#F04E3E]/10 hover:border-[#F04E3E] hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#004B63] to-[#F04E3E] text-white flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                  {t('mobileDownload.apkReadyToInstall')}
                </h4>
                <span className="text-xs text-[#F04E3E] font-bold">~26 MB</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('mobileDownload.apkDesc')}
            </p>
            <div className="mt-3 flex items-center gap-2 text-[#F04E3E] font-bold text-sm group-hover:gap-3 transition-all">
              <Download className="w-5 h-5" />
              {t('mobileDownload.downloadAPK')}
            </div>
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lite Version */}
            <a
              href="/nabd-al-madina-mobile-lite.tar.gz"
              download="nabd-al-madina-mobile-lite.tar.gz"
              className="block p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-400 hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {t('mobileDownload.sourceCodeLite')}
                  </h4>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">~1 MB</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs group-hover:gap-2.5 transition-all">
                <Download className="w-3.5 h-3.5" />
                {t('mobileDownload.download')}
              </div>
            </a>

            {/* Full Version */}
            <a
              href="/nabd-al-madina-mobile.tar.gz"
              download="nabd-al-madina-mobile.tar.gz"
              className="block p-4 rounded-2xl border border-[#004B63]/20 dark:border-[#00A8CC]/20 bg-[#004B63]/5 dark:bg-[#00A8CC]/5 hover:border-[#004B63] dark:hover:border-[#00A8CC] hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#004B63] text-white flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {t('mobileDownload.sourceCodeFull')}
                  </h4>
                  <span className="text-xs text-[#004B63] dark:text-[#00A8CC] font-semibold">~56 MB</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[#004B63] dark:text-[#00A8CC] font-semibold text-xs group-hover:gap-2.5 transition-all">
                <Download className="w-3.5 h-3.5" />
                {t('mobileDownload.download')}
              </div>
            </a>
          </div>

          {/* Download tip */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              {t('mobileDownload.downloadTip')}
            </p>
          </div>
        </div>
      ),
    },
    {
      num: 2,
      icon: <Code className="w-5 h-5" />,
      title: t('mobileDownload.step2Title'),
      content: (
        <div className="space-y-3">
          <p className="text-gray-600 dark:text-gray-300">
            {t('mobileDownload.step2Desc')}
          </p>
          <CodeBlock code={`tar -xzf nabd-al-madina-mobile-lite.tar.gz\ncd mobile-app\nbun install`} id="install" copiedCmd={copiedCmd} onCopy={copyToClipboard} />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('mobileDownload.fullVersionNote')}
          </p>
        </div>
      ),
    },
    {
      num: 3,
      icon: <Terminal className="w-5 h-5" />,
      title: t('mobileDownload.step3Title'),
      content: (
        <div className="space-y-4">
          {/* EAS Build */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-3">
              <span className="text-lg">☁️</span>
              {t('mobileDownload.methodACloudBuild')}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
              {t('mobileDownload.methodADesc')}
            </p>
            <CodeBlock code={`npm install -g eas-cli\neas login\neas build -p android --profile preview`} id="eas" copiedCmd={copiedCmd} onCopy={copyToClipboard} />
          </div>

          {/* Local Build */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
              <span className="text-lg">💻</span>
              {t('mobileDownload.methodBLocalBuild')}
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
              {t('mobileDownload.methodBDesc')}
            </p>
            <CodeBlock code={`npx expo prebuild\ncd android\n./gradlew assembleDebug\n\n# APK موجود في:\n# android/app/build/outputs/apk/debug/app-debug.apk`} id="local" copiedCmd={copiedCmd} onCopy={copyToClipboard} />
          </div>

          {/* Expo Go */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3">
              <span className="text-lg">📱</span>
              {t('mobileDownload.methodCExpoGo')}
            </h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-3">
              {t('mobileDownload.methodCDesc')}
            </p>
            <CodeBlock code={`npx expo start\n# امسح QR Code بتطبيق Expo Go`} id="expogo" copiedCmd={copiedCmd} onCopy={copyToClipboard} />
          </div>
        </div>
      ),
    },
  ];

  const requirements = [
    { icon: <Cpu className="w-4 h-4" />, label: t('mobileDownload.req8GBRAM'), required: true },
    { icon: <HardDrive className="w-4 h-4" />, label: t('mobileDownload.req5GBSpace'), required: true },
    { icon: <Code className="w-4 h-4" />, label: 'Node.js 18+', required: true },
    { icon: <Smartphone className="w-4 h-4" />, label: 'Android SDK', required: false },
  ];

  const coupons = [
    { code: 'WELCOME10', desc: t('mobileDownload.coupon10off') },
    { code: 'SAVE20', desc: t('mobileDownload.coupon20off') },
    { code: 'FREE15', desc: t('mobileDownload.coupon15LYDoff') },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen flex items-start justify-center p-4 pt-8 pb-8">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-l from-[#004B63] via-[#00A8CC] to-[#004B63] p-6 sm:p-8">
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="text-center pt-2">
              <div className="text-4xl mb-3">🏪</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {t('mobileDownload.appName')}
              </h1>
              <p className="text-white/80 text-sm sm:text-base">
                {t('mobileDownload.mobileAppDownload')}
              </p>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Live Preview Button */}
          <div className="px-6 sm:px-8 pt-6">
            <a
              href="/mobile/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-gradient-to-l from-[#004B63] via-[#00A8CC] to-[#004B63] text-white font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all group"
            >
              <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {t('mobileDownload.previewInBrowser')}
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Live</span>
            </a>
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('mobileDownload.previewDesc')}
            </p>
          </div>

          {/* Requirements */}
          <div className="px-6 sm:px-8 pt-6">
            <div className="flex flex-wrap gap-3">
              {requirements.map((req, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${req.required ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {req.icon}
                  {req.label}
                  {req.required && <AlertTriangle className="w-3 h-3" />}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="px-6 sm:px-8 py-6 space-y-3">
            {steps.map((step) => (
              <div key={step.num} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedStep(expandedStep === step.num ? null : step.num)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#004B63] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {step.num}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {step.icon}
                    <span className="font-bold text-gray-900 dark:text-white truncate">{step.title}</span>
                  </div>
                  {expandedStep === step.num ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                  )}
                </button>
                {expandedStep === step.num && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                    {step.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="px-6 sm:px-8 pb-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              ✨ {t('mobileDownload.appFeatures')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { emoji: '🏪', text: t('mobileDownload.appName') },
                { emoji: '🌍', text: t('mobileDownload.featureArEn') },
                { emoji: '🛒', text: t('mobileDownload.featureCart') },
                { emoji: '📱', text: t('mobileDownload.featureProDesign') },
                { emoji: '🔐', text: t('mobileDownload.featureAuth') },
                { emoji: '❤️', text: t('mobileDownload.featureFavorites') },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="text-lg">{f.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Codes */}
          <div className="px-6 sm:px-8 pb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              🏷️ {t('mobileDownload.demoCouponCodes')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {coupons.map((c, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(c.code, `coupon-${i}`)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <code className="text-sm font-bold text-amber-700 dark:text-amber-300">{c.code}</code>
                  <span className="text-xs text-amber-600 dark:text-amber-400">- {c.desc}</span>
                  {copiedCmd === `coupon-${i}` ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-6 sm:px-8 pb-6">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {t('mobileDownload.localBuildNote')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
