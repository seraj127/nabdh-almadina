'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '../lib/mobile-store';
import {
  Globe, Moon, Sun, Bell, ShieldCheck, HelpCircle,
  MessageCircle, Star, ChevronLeft, ChevronRight,
  LogOut, User, Heart, Package, Info, Lock,
  Eye, Trash2, Download, Upload, Vibrate, Zap,
  Volume2, VolumeX, MapPin, CreditCard, Clock,
  Smartphone, Palette, Type, RotateCcw, Share2,
  FileText, ArrowRight, ArrowLeft, Check, X,
  Database, HardDrive, Wifi, WifiOff, ChevronDown,
  Sparkles, Settings, Shield, Crown, Phone, AlertTriangle
} from 'lucide-react';
import type { MobileUser } from '../lib/types';
import {
  EditProfileOverlay, ChangePasswordOverlay, PaymentMethodOverlay,
  ReportBugOverlay, RateAppOverlay, ShareAppOverlay,
  AboutAppOverlay, LicensesOverlay, PrivacyPolicyOverlay,
  TermsOfServiceOverlay, HelpCenterOverlay, ContactUsOverlay
} from './settings-overlays';

// ─── Brand Design Tokens ────────────────────────────────────────────────
const COLORS = {
  teal: '#00A8CC',
  tealDark: '#00897B',
  primary: '#004B63',
  primaryLight: '#006B8A',
  danger: '#EF4444',
  info: '#3B82F6',
  warning: '#D29922',
  success: '#238636',
  purple: '#8B5CF6',
  gold: '#D4A843',
  textPrimary: '#1F2937',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  darkCard: '#151D2E',
  darkBorder: '#1E2A42',
  darkSubtle: '#1A2540',
};

// ─── Stagger animation variants ─────────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

const sectionTitle = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

// ─── Animated Toggle Switch ──────────────────────────────────────────
function AnimatedToggle({ value, onToggle, isRTL, activeColor }: {
  value: boolean;
  onToggle: () => void;
  isRTL: boolean;
  activeColor?: string;
}) {
  return (
    <motion.button
      onClick={onToggle}
      className="relative w-[50px] h-[28px] rounded-full flex items-center px-0.5 transition-colors duration-300"
      style={{ background: value ? (activeColor || 'linear-gradient(135deg, #004B63, #00897B)') : (COLORS.darkBorder + '60') }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.div
        className="w-[24px] h-[24px] rounded-full bg-white flex items-center justify-center"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
        animate={{ x: value ? (isRTL ? -22 : 22) : 0 }}
        transition={{ type: 'spring' as const, stiffness: 500, damping: 30 }}
      >
        {value ? (
          <Check size={12} style={{ color: COLORS.primary }} />
        ) : (
          <X size={10} style={{ color: '#9CA3AF' }} />
        )}
      </motion.div>
    </motion.button>
  );
}

// ─── Setting Item Component ──────────────────────────────────────────
function SettingItem({ icon, iconBg, iconColor, title, subtitle, isRTL, darkMode, onClick, toggle, toggleValue, onToggle, value, badge, chevron = true, danger }: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  isRTL: boolean;
  darkMode: boolean;
  onClick?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: () => void;
  value?: string;
  badge?: string;
  chevron?: boolean;
  danger?: boolean;
}) {
  const content = (
    <div className="flex items-center gap-3 w-full">
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-bold truncate"
          style={{ color: danger ? COLORS.danger : (darkMode ? '#F3F4F6' : COLORS.textPrimary) }}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-[11px] mt-0.5 truncate" style={{ color: darkMode ? '#A8B8CC' : '#9CA3AF' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side */}
      {toggle !== undefined && onToggle ? (
        <AnimatedToggle value={toggleValue ?? false} onToggle={onToggle} isRTL={isRTL} />
      ) : (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {badge && (
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-lg"
              style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6', color: darkMode ? '#9CA3AF' : '#6B7280' }}
            >
              {badge}
            </span>
          )}
          {value && (
            <span className="text-[11px] font-medium" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
              {value}
            </span>
          )}
          {chevron && (
            <ChevronLeft
              size={16}
              className={isRTL ? '' : 'rotate-180'}
              style={{ color: darkMode ? '#4B5E74' : '#D1D5DB' }}
            />
          )}
        </div>
      )}
    </div>
  );

  if (toggle !== undefined) {
    return <div className="p-3.5">{content}</div>;
  }

  return (
    <motion.button
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="w-full p-3.5 text-start"
    >
      {content}
    </motion.button>
  );
}

// ─── Section Header ──────────────────────────────────────────────────
function SectionHeader({ icon, title, isRTL, darkMode }: {
  icon: React.ReactNode;
  title: string;
  isRTL: boolean;
  darkMode: boolean;
}) {
  return (
    <motion.div
      variants={sectionTitle}
      className="flex items-center gap-2 px-1 mb-2 mt-1"
    >
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: darkMode ? '#6B7F96' : '#9CA3AF' }}>
        {title}
      </p>
    </motion.div>
  );
}

// ─── Settings Card Wrapper ───────────────────────────────────────────
function SettingsCard({ children, darkMode }: {
  children: React.ReactNode;
  darkMode: boolean;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="rounded-2xl overflow-hidden"
      style={{
        background: darkMode ? COLORS.darkCard : '#fff',
        border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
        boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────
function Divider({ darkMode }: { darkMode: boolean }) {
  return (
    <div style={{ borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.04)'}` }} />
  );
}

// ─── Sub-Screen Type ──────────────────────────────────────────────────
type SubScreen = 'edit-profile' | 'change-password' | 'payment-method' | 'privacy-policy' | 'terms' | 'help-center' | 'contact-us' | 'report-bug' | 'rate-app' | 'share-app' | 'about' | 'licenses' | null;

// ═══════════════════════════════════════════════════════════════════════
// MAIN SETTINGS SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function AdvancedSettingsScreen({ onClose, user, darkMode, handleDarkMode, onLogout, onGoToFavorites, onGoToOrders, onGoToAddresses }: {
  onClose: () => void;
  user: MobileUser | null;
  darkMode: boolean;
  handleDarkMode: (v: boolean) => void;
  onLogout?: () => void;
  onGoToFavorites?: () => void;
  onGoToOrders?: () => void;
  onGoToAddresses?: () => void;
}) {
  const { t, language, setLanguage } = useLanguageStore();
  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  // Sub-screen state
  const [subScreen, setSubScreen] = useState<SubScreen>(null);

  // Clear data modal state
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [clearDataSuccess, setClearDataSuccess] = useState(false);

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showStorageInfo, setShowStorageInfo] = useState(false);

  // Storage calculation
  const [storageUsed, setStorageUsed] = useState('0 KB');

  useEffect(() => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          total += (localStorage.getItem(key) || '').length * 2; // UTF-16
        }
      }
      /* eslint-disable react-hooks/set-state-in-effect */
      if (total < 1024) setStorageUsed(`${total} B`);
      else if (total < 1024 * 1024) setStorageUsed(`${(total / 1024).toFixed(1)} KB`);
      else setStorageUsed(`${(total / (1024 * 1024)).toFixed(2)} MB`);
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch { /* ignore */ }
  }, []);

  // Display name from localStorage
  const displayName = useMemo(() => {
    try {
      const stored = localStorage.getItem('mobile_user_names');
      if (stored) {
        const parsed = JSON.parse(stored);
        const name = isRTL ? (parsed.nameAr || user?.name || '') : (parsed.nameEn || user?.name || '');
        if (name) return name;
      }
    } catch { /* ignore */ }
    return user?.name || '';
  }, [user, isRTL]);

  // User photo from localStorage
  const [userPhoto, setUserPhoto] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('mobile_user_photo');
      }
    } catch { /* ignore */ }
    return null;
  });

  // Listen for storage changes to sync photo
  useEffect(() => {
    const handleStorage = () => {
      try {
        const photo = localStorage.getItem('mobile_user_photo');
        setUserPhoto(photo);
      } catch { /* ignore */ }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const fontSizeLabels = {
    small: isRTL ? 'صغير' : 'Small',
    medium: isRTL ? 'متوسط' : 'Medium',
    large: isRTL ? 'كبير' : 'Large',
  };

  // Clear all data handler
  const handleClearAllData = () => {
    try {
      localStorage.clear();
      setClearDataSuccess(true);
      setTimeout(() => {
        setShowClearDataModal(false);
        setClearDataSuccess(false);
        onLogout?.();
      }, 1500);
    } catch { /* ignore */ }
  };

  // Sub-screen overlay props
  const overlayProps = {
    onClose: () => setSubScreen(null),
    darkMode,
    isRTL,
    direction,
    user,
  };

  return (
    <div className="h-full overflow-y-auto pb-24" dir={direction} style={{ background: darkMode ? '#0B1120' : '#F4F7F9' }}>
      {/* ═══ Gradient Header ═══ */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/[0.03] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.1) 0%, transparent 70%)' }} />

        {/* Wave separator */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 430 35" preserveAspectRatio="none" style={{ height: 22 }}>
          <path d="M0 18 Q108 2 215 18 Q322 34 430 18 V35 H0 Z" fill={darkMode ? '#0B1120' : '#F4F7F9'} />
        </svg>

        {/* Back button & Title */}
        <div className="relative z-10 px-4 pt-4 pb-8">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/15"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              {isRTL ? <ArrowRight size={20} className="text-white" /> : <ArrowLeft size={20} className="text-white" />}
            </motion.button>
            <div className="flex-1">
              <h2 className="text-white text-lg font-bold">{t('mobile.profile.settings')}</h2>
              <p className="text-white/60 text-xs mt-0.5">{isRTL ? 'إدارة حسابك وتخصيص التطبيق' : 'Manage your account & customize the app'}</p>
            </div>
            {/* Decorative gear icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' as const }}
              className="w-10 h-10 flex items-center justify-center"
            >
              <Settings size={22} className="text-white/20" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ Content ═══ */}
      <div className="px-4 -mt-4 relative z-10">
        <motion.div
          className="space-y-5"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* ─── Profile Card ─── */}
          <SettingsCard darkMode={darkMode}>
            <div className="p-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                  {userPhoto ? (
                    <motion.img
                      src={userPhoto}
                      alt={displayName || 'User'}
                      className="w-16 h-16 rounded-2xl object-cover"
                      style={{
                        border: `3px solid ${darkMode ? COLORS.darkBorder : '#E5E7EB'}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                    />
                  ) : (
                    <motion.div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
                      style={{
                        background: 'linear-gradient(135deg, #006B8A, #00897B)',
                        border: `3px solid ${darkMode ? COLORS.darkBorder : '#E5E7EB'}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                    >
                      {displayName?.charAt(0) || 'U'}
                    </motion.div>
                  )}
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: COLORS.success, border: `2px solid ${darkMode ? COLORS.darkCard : '#fff'}` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.3 }}
                  >
                    <Check size={9} className="text-white" />
                  </motion.div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] truncate" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                    {displayName || (isRTL ? 'مستخدم' : 'User')}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone size={10} style={{ color: darkMode ? '#A8B8CC' : '#9CA3AF' }} />
                    <p className="text-[11px]" style={{ color: darkMode ? '#A8B8CC' : '#9CA3AF' }} dir="ltr">
                      {user?.phone?.replace(/^\+218/, '0') || (isRTL ? 'غير محدد' : 'Not set')}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSubScreen('edit-profile')}
                  className="px-3.5 py-2 rounded-xl text-[11px] font-bold flex-shrink-0"
                  style={{ background: 'rgba(0,168,204,0.1)', color: COLORS.teal, border: '1px solid rgba(0,168,204,0.15)' }}
                >
                  {isRTL ? 'تعديل' : 'Edit'}
                </motion.button>
              </div>
            </div>
          </SettingsCard>

          {/* ─── Quick Settings ─── */}
          <SectionHeader
            icon={<Sparkles size={11} style={{ color: COLORS.teal }} />}
            title={isRTL ? 'الإعدادات السريعة' : 'Quick Settings'}
            isRTL={isRTL}
            darkMode={darkMode}
          />
          <SettingsCard darkMode={darkMode}>
            {/* Language */}
            <SettingItem
              icon={<Globe size={18} />}
              iconBg="linear-gradient(135deg, rgba(234,179,8,0.12), rgba(245,158,11,0.12))"
              iconColor="#F59E0B"
              title={t('mobile.language') || (isRTL ? 'اللغة' : 'Language')}
              subtitle={isRTL ? 'العربية - اللغة الحالية' : 'English - Current'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              value={language === 'ar' ? 'العربية' : 'English'}
            />
            <Divider darkMode={darkMode} />
            {/* Dark Mode — Always On */}
            <SettingItem
              icon={<Moon size={18} />}
              iconBg="linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))"
              iconColor={COLORS.teal}
              title={isRTL ? 'الوضع الداكن' : 'Dark Mode'}
              subtitle={isRTL ? 'مفعّل دائماً' : 'Always on'}
              isRTL={isRTL}
              darkMode={darkMode}
              toggle
              toggleValue={true}
              onToggle={() => {}}
            />
            <Divider darkMode={darkMode} />
            {/* Notifications */}
            <SettingItem
              icon={<Bell size={18} />}
              iconBg="linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))"
              iconColor="#EF4444"
              title={isRTL ? 'الإشعارات' : 'Notifications'}
              subtitle={isRTL ? 'إدارة التنبيهات والإشعارات' : 'Manage alerts & notifications'}
              isRTL={isRTL}
              darkMode={darkMode}
              toggle
              toggleValue={notificationsEnabled}
              onToggle={() => setNotificationsEnabled(!notificationsEnabled)}
            />
          </SettingsCard>

          {/* ─── Account ─── */}
          <SectionHeader
            icon={<User size={11} style={{ color: COLORS.purple }} />}
            title={isRTL ? 'الحساب' : 'Account'}
            isRTL={isRTL}
            darkMode={darkMode}
          />
          <SettingsCard darkMode={darkMode}>
            <SettingItem
              icon={<User size={18} />}
              iconBg="linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))"
              iconColor="#8B5CF6"
              title={isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile'}
              subtitle={isRTL ? 'الاسم، الصورة، البيانات الشخصية' : 'Name, photo, personal info'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('edit-profile')}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<Lock size={18} />}
              iconBg="linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))"
              iconColor={COLORS.teal}
              title={isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
              subtitle={isRTL ? 'تحديث كلمة المرور الخاصة بك' : 'Update your password'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('change-password')}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<ShieldCheck size={18} />}
              iconBg="linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.12))"
              iconColor="#16A34A"
              title={isRTL ? 'المصادقة الثنائية' : 'Two-Factor Auth'}
              subtitle={isRTL ? 'حماية إضافية لحسابك' : 'Extra protection for your account'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => {}}
              badge={isRTL ? 'قريباً' : 'Soon'}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<MapPin size={18} />}
              iconBg="linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))"
              iconColor="#EF4444"
              title={isRTL ? 'العناوين المحفوظة' : 'Saved Addresses'}
              subtitle={isRTL ? 'إدارة عناوين التوصيل' : 'Manage delivery addresses'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => onGoToAddresses?.() || setSubScreen(null)}
            />
          </SettingsCard>

          {/* ─── Shopping ─── */}
          <SectionHeader
            icon={<Package size={11} style={{ color: COLORS.success }} />}
            title={isRTL ? 'التسوق' : 'Shopping'}
            isRTL={isRTL}
            darkMode={darkMode}
          />
          <SettingsCard darkMode={darkMode}>
            <SettingItem
              icon={<CreditCard size={18} />}
              iconBg="linear-gradient(135deg, rgba(0,75,99,0.12), rgba(0,137,123,0.12))"
              iconColor={COLORS.primary}
              title={isRTL ? 'طريقة الدفع الافتراضية' : 'Default Payment'}
              subtitle={isRTL ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('payment-method')}
              value={isRTL ? 'عند الاستلام' : 'COD'}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<Heart size={18} />}
              iconBg="linear-gradient(135deg, rgba(255,111,97,0.12), rgba(232,93,80,0.12))"
              iconColor="#FF6F61"
              title={isRTL ? 'المفضلة' : 'Favorites'}
              subtitle={isRTL ? 'المنتجات المفضلة لديك' : 'Your favorite products'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => onGoToFavorites?.()}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<Package size={18} />}
              iconBg="linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.12))"
              iconColor="#16A34A"
              title={isRTL ? 'طلباتي' : 'My Orders'}
              subtitle={isRTL ? 'متابعة وإدارة الطلبات' : 'Track & manage orders'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => onGoToOrders?.()}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<Clock size={18} />}
              iconBg="linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.12))"
              iconColor="#F59E0B"
              title={isRTL ? 'تحديثات الطلبات' : 'Order Updates'}
              subtitle={isRTL ? 'إشعارات حالة الطلب' : 'Order status notifications'}
              isRTL={isRTL}
              darkMode={darkMode}
              toggle
              toggleValue={orderUpdates}
              onToggle={() => setOrderUpdates(!orderUpdates)}
            />
          </SettingsCard>

          {/* ─── Appearance ─── */}
          <SectionHeader
            icon={<Palette size={11} style={{ color: '#F59E0B' }} />}
            title={isRTL ? 'المظهر' : 'Appearance'}
            isRTL={isRTL}
            darkMode={darkMode}
          />
          <SettingsCard darkMode={darkMode}>
            {/* Font Size */}
            <div>
              <motion.button
                whileTap={{ scale: 0.995 }}
                onClick={() => setShowFontSizePicker(!showFontSizePicker)}
                className="w-full p-3.5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))' }}
                  >
                    <Type size={18} className="text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                      {isRTL ? 'حجم الخط' : 'Font Size'}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: darkMode ? '#A8B8CC' : '#9CA3AF' }}>
                      {fontSizeLabels[fontSize]}
                    </p>
                  </div>
                  <motion.div animate={{ rotate: showFontSizePicker ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} style={{ color: darkMode ? '#6B7F96' : '#D1D5DB' }} />
                  </motion.div>
                </div>
              </motion.button>

              {/* Font Size Picker */}
              <AnimatePresence>
                {showFontSizePicker && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 ps-16">
                      <div className="flex gap-2">
                        {(['small', 'medium', 'large'] as const).map((size) => (
                          <motion.button
                            key={size}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { setFontSize(size); setShowFontSizePicker(false); }}
                            className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all"
                            style={{
                              background: fontSize === size
                                ? 'linear-gradient(135deg, #004B63, #00897B)'
                                : (darkMode ? COLORS.darkSubtle : '#F3F4F6'),
                              color: fontSize === size ? '#fff' : (darkMode ? '#9CA3AF' : '#6B7280'),
                              boxShadow: fontSize === size ? '0 2px 8px rgba(0,75,99,0.3)' : 'none',
                            }}
                          >
                            {fontSizeLabels[size]}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Divider darkMode={darkMode} />
            {/* Compact Mode */}
            <SettingItem
              icon={<Smartphone size={18} />}
              iconBg="linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.12))"
              iconColor="#3B82F6"
              title={isRTL ? 'الوضع المضغوط' : 'Compact Mode'}
              subtitle={isRTL ? 'عرض المزيد من المحتوى في الشاشة' : 'Show more content on screen'}
              isRTL={isRTL}
              darkMode={darkMode}
              toggle
              toggleValue={compactMode}
              onToggle={() => setCompactMode(!compactMode)}
            />
            <Divider darkMode={darkMode} />
            {/* Reduce Animations */}
            <SettingItem
              icon={<RotateCcw size={18} />}
              iconBg="linear-gradient(135deg, rgba(107,114,128,0.12), rgba(75,85,99,0.12))"
              iconColor="#6B7280"
              title={isRTL ? 'تقليل الحركات' : 'Reduce Animations'}
              subtitle={isRTL ? 'للأشخاص الذين يفضلون واجهة أكثر ثباتاً' : 'For those who prefer a calmer interface'}
              isRTL={isRTL}
              darkMode={darkMode}
              toggle
              toggleValue={reduceAnimations}
              onToggle={() => setReduceAnimations(!reduceAnimations)}
            />
          </SettingsCard>

          {/* ─── Notification Preferences ─── */}
          <SectionHeader
            icon={<Bell size={11} style={{ color: COLORS.danger }} />}
            title={isRTL ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
            isRTL={isRTL}
            darkMode={darkMode}
          />
          <SettingsCard darkMode={darkMode}>
            <SettingItem
              icon={<Bell size={18} />}
              iconBg="linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))"
              iconColor="#EF4444"
              title={isRTL ? 'العروض والتخفيضات' : 'Promotions & Deals'}
              subtitle={isRTL ? 'إشعارات العروض الجديدة' : 'New deals notifications'}
              isRTL={isRTL}
              darkMode={darkMode}
              toggle
              toggleValue={promoNotifications}
              onToggle={() => setPromoNotifications(!promoNotifications)}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              iconBg={soundEnabled ? 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))' : 'linear-gradient(135deg, rgba(107,114,128,0.12), rgba(75,85,99,0.12))'}
              iconColor={soundEnabled ? COLORS.teal : '#6B7280'}
              title={isRTL ? 'الأصوات' : 'Sounds'}
              subtitle={isRTL ? 'تشغيل صوت الإشعارات' : 'Play notification sounds'}
              isRTL={isRTL}
              darkMode={darkMode}
              toggle
              toggleValue={soundEnabled}
              onToggle={() => setSoundEnabled(!soundEnabled)}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<Vibrate size={18} />}
              iconBg="linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))"
              iconColor="#8B5CF6"
              title={isRTL ? 'الاهتزاز' : 'Vibration'}
              subtitle={isRTL ? 'اهتزاز الجهاز عند الإشعارات' : 'Vibrate on notifications'}
              isRTL={isRTL}
              darkMode={darkMode}
              toggle
              toggleValue={vibrationEnabled}
              onToggle={() => setVibrationEnabled(!vibrationEnabled)}
            />
          </SettingsCard>

          {/* ─── Privacy & Security ─── */}
          <SectionHeader
            icon={<Shield size={11} style={{ color: COLORS.success }} />}
            title={isRTL ? 'الخصوصية والأمان' : 'Privacy & Security'}
            isRTL={isRTL}
            darkMode={darkMode}
          />
          <SettingsCard darkMode={darkMode}>
            <SettingItem
              icon={<Eye size={18} />}
              iconBg="linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))"
              iconColor={COLORS.teal}
              title={isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
              subtitle={isRTL ? 'كيف نحمي بياناتك' : 'How we protect your data'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('privacy-policy')}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<FileText size={18} />}
              iconBg="linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.12))"
              iconColor="#F59E0B"
              title={isRTL ? 'الشروط والأحكام' : 'Terms of Service'}
              subtitle={isRTL ? 'شروط استخدام التطبيق' : 'App usage terms'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('terms')}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<Database size={18} />}
              iconBg="linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.12))"
              iconColor="#3B82F6"
              title={isRTL ? 'إدارة البيانات' : 'Data Management'}
              subtitle={isRTL ? 'تخزين وحذف بياناتك' : 'Store & delete your data'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setShowStorageInfo(!showStorageInfo)}
            />
          </SettingsCard>

          {/* ─── Storage Info Card (expandable) ─── */}
          <AnimatePresence>
            {showStorageInfo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <SettingsCard darkMode={darkMode}>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))' }}>
                        <HardDrive size={16} style={{ color: COLORS.teal }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                          {isRTL ? 'التخزين المستخدم' : 'Storage Used'}
                        </p>
                        <p className="text-[11px]" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>{storageUsed}</p>
                      </div>
                    </div>

                    {/* Storage bar */}
                    <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: darkMode ? COLORS.darkSubtle : '#E5E7EB' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #004B63, #00897B)' }}
                        initial={{ width: 0 }}
                        animate={{ width: '35%' }}
                        transition={{ duration: 1, ease: 'easeOut' as const }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5"
                        style={{ background: 'rgba(0,168,204,0.08)', color: COLORS.teal }}
                        onClick={() => {
                          try {
                            // Clear cache but keep auth data
                            const authKeys = ['mobile_auth', 'mobile_user', 'mobile_user_names', 'mobile_user_photo'];
                            const preserved: Record<string, string | null> = {};
                            authKeys.forEach(k => { preserved[k] = localStorage.getItem(k); });
                            localStorage.clear();
                            Object.entries(preserved).forEach(([k, v]) => { if (v) localStorage.setItem(k, v); });
                            setShowStorageInfo(false);
                          } catch { /* ignore */ }
                        }}
                      >
                        <Trash2 size={12} />
                        {isRTL ? 'مسح الكاش' : 'Clear Cache'}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5"
                        style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6', color: darkMode ? '#9CA3AF' : '#6B7280' }}
                      >
                        <Download size={12} />
                        {isRTL ? 'تصدير البيانات' : 'Export Data'}
                      </motion.button>
                    </div>
                  </div>
                </SettingsCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Support ─── */}
          <SectionHeader
            icon={<HelpCircle size={11} style={{ color: COLORS.info }} />}
            title={isRTL ? 'الدعم والمساعدة' : 'Support & Help'}
            isRTL={isRTL}
            darkMode={darkMode}
          />
          <SettingsCard darkMode={darkMode}>
            <SettingItem
              icon={<HelpCircle size={18} />}
              iconBg="linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.12))"
              iconColor="#3B82F6"
              title={isRTL ? 'مركز المساعدة' : 'Help Center'}
              subtitle={isRTL ? 'الأسئلة الشائعة والدليل' : 'FAQs & guides'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('help-center')}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<MessageCircle size={18} />}
              iconBg="linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.12))"
              iconColor="#16A34A"
              title={isRTL ? 'تواصل معنا' : 'Contact Us'}
              subtitle={isRTL ? 'هاتف، واتساب، بريد إلكتروني' : 'Phone, WhatsApp, email'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('contact-us')}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<Zap size={18} />}
              iconBg="linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.12))"
              iconColor="#F59E0B"
              title={isRTL ? 'الإبلاغ عن مشكلة' : 'Report a Bug'}
              subtitle={isRTL ? 'ساعدنا في تحسين التطبيق' : 'Help us improve the app'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('report-bug')}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<Star size={18} />}
              iconBg="linear-gradient(135deg, rgba(212,168,67,0.12), rgba(180,130,50,0.12))"
              iconColor={COLORS.gold}
              title={isRTL ? 'تقييم التطبيق' : 'Rate the App'}
              subtitle={isRTL ? 'شاركنا رأيك' : 'Share your feedback'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('rate-app')}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<Share2 size={18} />}
              iconBg="linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))"
              iconColor={COLORS.teal}
              title={isRTL ? 'مشاركة التطبيق' : 'Share the App'}
              subtitle={isRTL ? 'ادع أصدقاءك للتسوق' : 'Invite friends to shop'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('share-app')}
            />
          </SettingsCard>

          {/* ─── About ─── */}
          <SectionHeader
            icon={<Info size={11} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
            title={isRTL ? 'حول التطبيق' : 'About'}
            isRTL={isRTL}
            darkMode={darkMode}
          />
          <SettingsCard darkMode={darkMode}>
            <SettingItem
              icon={<Info size={18} />}
              iconBg="linear-gradient(135deg, rgba(107,114,128,0.12), rgba(75,85,99,0.12))"
              iconColor="#6B7280"
              title={isRTL ? 'عن نبض المدينة' : 'About Nabd Al-Madina'}
              subtitle="v1.0.0"
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('about')}
            />
            <Divider darkMode={darkMode} />
            <SettingItem
              icon={<FileText size={18} />}
              iconBg="linear-gradient(135deg, rgba(0,75,99,0.12), rgba(0,137,123,0.12))"
              iconColor={COLORS.primary}
              title={isRTL ? 'تراخيص المصادر المفتوحة' : 'Open Source Licenses'}
              subtitle={isRTL ? 'المكتبات المستخدمة' : 'Libraries used'}
              isRTL={isRTL}
              darkMode={darkMode}
              onClick={() => setSubScreen('licenses')}
            />
          </SettingsCard>

          {/* ─── Danger Zone ─── */}
          {user && (
            <>
              <SectionHeader
                icon={<Trash2 size={11} style={{ color: COLORS.danger }} />}
                title={isRTL ? 'المنطقة الخطرة' : 'Danger Zone'}
                isRTL={isRTL}
                darkMode={darkMode}
              />
              <SettingsCard darkMode={darkMode}>
                <SettingItem
                  icon={<Trash2 size={18} />}
                  iconBg="linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))"
                  iconColor="#EF4444"
                  title={isRTL ? 'مسح جميع البيانات' : 'Clear All Data'}
                  subtitle={isRTL ? 'حذف جميع الإعدادات والبيانات المحلية' : 'Delete all settings & local data'}
                  isRTL={isRTL}
                  darkMode={darkMode}
                  onClick={() => setShowClearDataModal(true)}
                  danger
                />
                <Divider darkMode={darkMode} />
                <SettingItem
                  icon={<LogOut size={18} />}
                  iconBg="linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))"
                  iconColor="#EF4444"
                  title={t('mobile.profile.signOut') || (isRTL ? 'تسجيل الخروج' : 'Sign Out')}
                  subtitle={isRTL ? 'تسجيل الخروج من حسابك' : 'Sign out of your account'}
                  isRTL={isRTL}
                  darkMode={darkMode}
                  onClick={onLogout || (() => {})}
                  danger
                />
              </SettingsCard>
            </>
          )}

          {/* ─── App Version Footer ─── */}
          <motion.div variants={staggerItem} className="text-center pt-2 pb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
                <span className="text-white text-sm font-black">N</span>
              </div>
            </div>
            <p className="text-[11px] font-semibold" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {t('hero.title')} v1.0.0
            </p>
            <p className="text-[10px] mt-1" style={{ color: darkMode ? '#374151' : '#B0B8C4' }}>
              🇱🇾 {isRTL ? 'صُنع بحب في ليبيا' : 'Made with love in Libya'}
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: darkMode ? '#374151' : '#C5CBD3' }}>
              © 2024 {t('hero.title')}. {isRTL ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'}.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ═══ Clear All Data Modal ═══ */}
      <AnimatePresence>
        {showClearDataModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 80, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{
                background: darkMode ? COLORS.darkCard : '#fff',
                border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
                boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              }}
            >
              {/* Danger gradient top */}
              <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #EF4444, #DC2626)' }} />

              <div className="p-6">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))' }}>
                  <AlertTriangle size={28} style={{ color: COLORS.danger }} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-center mb-2" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  {isRTL ? 'مسح جميع البيانات' : 'Clear All Data'}
                </h3>

                {/* Description */}
                <p className="text-xs text-center leading-relaxed mb-6" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                  {isRTL
                    ? 'سيتم حذف جميع الإعدادات والبيانات المحلية نهائياً. هذا الإجراء لا يمكن التراجع عنه.'
                    : 'All settings and local data will be permanently deleted. This action cannot be undone.'}
                </p>

                {/* Success feedback */}
                <AnimatePresence>
                  {clearDataSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center justify-center gap-1.5 mb-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: COLORS.success }}
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                      <span className="text-xs font-semibold" style={{ color: COLORS.success }}>
                        {isRTL ? 'تم مسح البيانات بنجاح' : 'Data cleared successfully'}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowClearDataModal(false); setClearDataSuccess(false); }}
                    disabled={clearDataSuccess}
                    className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-50"
                    style={{
                      background: darkMode ? COLORS.darkSubtle : '#F3F4F6',
                      color: darkMode ? '#9CA3AF' : '#6B7280',
                    }}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearAllData}
                    disabled={clearDataSuccess}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                    style={{
                      background: clearDataSuccess ? COLORS.success : 'linear-gradient(135deg, #EF4444, #DC2626)',
                      boxShadow: clearDataSuccess ? 'none' : '0 4px 16px rgba(239,68,68,0.3)',
                    }}
                  >
                    {clearDataSuccess
                      ? (isRTL ? 'تم' : 'Done')
                      : (isRTL ? 'مسح البيانات' : 'Clear Data')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Sub-Screen Overlays ═══ */}
      <AnimatePresence mode="wait">
        {subScreen && (
          <motion.div
            key={subScreen}
            className="fixed inset-0 pointer-events-auto overflow-y-auto"
            style={{ zIndex: 70 }}
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? -30 : 30 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
          >
            {subScreen === 'edit-profile' && <EditProfileOverlay {...overlayProps} />}
            {subScreen === 'change-password' && <ChangePasswordOverlay {...overlayProps} />}
            {subScreen === 'payment-method' && <PaymentMethodOverlay {...overlayProps} />}
            {subScreen === 'privacy-policy' && <PrivacyPolicyOverlay {...overlayProps} />}
            {subScreen === 'terms' && <TermsOfServiceOverlay {...overlayProps} />}
            {subScreen === 'help-center' && <HelpCenterOverlay {...overlayProps} />}
            {subScreen === 'contact-us' && <ContactUsOverlay {...overlayProps} />}
            {subScreen === 'report-bug' && <ReportBugOverlay {...overlayProps} />}
            {subScreen === 'rate-app' && <RateAppOverlay {...overlayProps} />}
            {subScreen === 'share-app' && <ShareAppOverlay {...overlayProps} />}
            {subScreen === 'about' && <AboutAppOverlay {...overlayProps} />}
            {subScreen === 'licenses' && <LicensesOverlay {...overlayProps} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
