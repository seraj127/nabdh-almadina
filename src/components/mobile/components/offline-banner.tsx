'use client';
import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const { t } = useLanguageStore();
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  });
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-[100] px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-500 ${
        isOnline
          ? 'bg-[#238636] text-white'
          : 'bg-[#D29922] text-white'
      }`}
      role="alert"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi size={16} />
          <span>{t('mobile.network.backOnline') || 'تم استعادة الاتصال'}</span>
        </>
      ) : (
        <>
          <WifiOff size={16} />
          <span>{t('mobile.network.offline') || 'أنت تتصفح دون اتصال - سيتم المزامنة لاحقاً'}</span>
        </>
      )}
    </div>
  );
}

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#D29922]/10 text-[#D29922]" role="status" aria-label="Offline mode">
      <WifiOff size={10} />
      <span className="text-[9px] font-bold">OFFLINE</span>
    </div>
  );
}
