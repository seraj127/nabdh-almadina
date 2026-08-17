'use client';
import React, { useState, useEffect } from 'react';
import { APP_VERSION } from '../lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Globe, ShieldCheck, Lock, FileText, ChevronLeft, HelpCircle, Info, Phone, Mail, ArrowLeft, ArrowRight, Edit3, Check, MessageCircle, MapPin, Clock, RotateCcw, Moon, Sun, Bell, User, Sparkles } from 'lucide-react';
import { useMobileStore } from '../lib/mobile-store';
import type { MobileUser } from '../lib/types';

// â”€â”€â”€ Brand Design Tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COLORS = {
  teal: '#00A8CC',
  tealDark: '#00897B',
  primary: '#004B63',
  danger: '#EF4444',
  info: '#3B82F6',
  textPrimary: '#1F2937',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  darkCard: '#151D2E',
  darkBorder: '#1E2A42',
  darkSubtle: '#1A2540',
};

// â”€â”€â”€ Stagger animation variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
};

// â”€â”€â”€ Shared overlay wrapper â”€â”€â”€
function OverlayWrapper({ onClose, title, direction, isRTL, darkMode, children, subtitle }: {
  onClose: () => void;
  title: string;
  direction: string;
  isRTL: boolean;
  darkMode: boolean;
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="h-full overflow-y-auto pb-24" dir={direction} style={{ background: darkMode ? '#0B1120' : '#F4F7F9' }}>
      {/* Gradient Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)' }}>
        {/* Decorative elements */}
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
            <div>
              <h2 className="text-white text-lg font-bold">{title}</h2>
              {subtitle && <p className="text-white/60 text-xs mt-0.5">{subtitle}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        {children}
      </div>
    </div>
  );
}

// â”€â”€â”€ Settings Overlay â”€â”€â”€
export function SettingsOverlay({ onClose, user, darkMode, handleDarkMode, language, setLanguage, direction, isRTL, t, onNameUpdate }: {
  onClose: () => void;
  user: MobileUser | null;
  darkMode: boolean;
  handleDarkMode: (v: boolean) => void;
  language: string;
  setLanguage: (v: string) => void;
  direction: string;
  isRTL: boolean;
  t: (key: string) => string;
  onNameUpdate?: (nameAr: string, nameEn: string) => void;
}) {
  const [editingField, setEditingField] = useState<'nameAr' | 'nameEn' | null>(null);
  const [saved, setSaved] = useState(false);

  // User photo from localStorage (also check store avatar synced from server)
  const [userPhoto, setUserPhoto] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('mobile_user_photo');
        if (local) return local;
        const storeAvatar = useMobileStore.getState().avatar;
        if (storeAvatar) return storeAvatar;
        const userAvatar = useMobileStore.getState().user?.avatar;
        if (userAvatar) return userAvatar;
      }
    } catch { /* ignore */ }
    return null;
  });

  // Initialize names from localStorage or user data
  const getInitialNames = () => {
    try {
      const stored = localStorage.getItem('mobile_user_names');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          nameAr: parsed.nameAr || user?.name || '',
          nameEn: parsed.nameEn || user?.name || '',
        };
      }
    } catch { /* ignore */ }
    return { nameAr: user?.name || '', nameEn: user?.name || '' };
  };

  const [nameAr, setNameAr] = useState(getInitialNames().nameAr);
  const [nameEn, setNameEn] = useState(getInitialNames().nameEn);

  const saveNames = () => {
    try {
      localStorage.setItem('mobile_user_names', JSON.stringify({ nameAr, nameEn }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onNameUpdate) onNameUpdate(nameAr, nameEn);
    } catch { /* ignore */ }
  };

  const displayName = isRTL ? (nameAr || user?.name || '') : (nameEn || user?.name || '');

  return (
    <OverlayWrapper
      onClose={onClose}
      title={t('mobile.profile.settings')}
      subtitle={isRTL ? 'ط¥ط¯ط§ط±ط© ط­ط³ط§ط¨ظƒ ظˆطھظپط¶ظٹظ„ط§طھظƒ' : 'Manage your account & preferences'}
      direction={direction}
      isRTL={isRTL}
      darkMode={darkMode}
    >
      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Info Card */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl overflow-hidden"
          style={{
            background: darkMode ? COLORS.darkCard : '#fff',
            border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Profile header gradient bar */}
          <div className="relative h-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-4 w-16 h-16 rounded-full bg-white/[0.06]" />
          </div>

          {/* Profile content */}
          <div className="px-4 pb-4 -mt-8 relative z-10">
            <div className="flex items-end gap-3 mb-4">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute -inset-1.5 rounded-2xl" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.2) 0%, transparent 70%)', filter: 'blur(4px)' }} />
                {userPhoto ? (
                  <motion.img
                    src={userPhoto}
                    alt={displayName || 'User'}
                    className="w-16 h-16 rounded-2xl object-cover relative z-10"
                    style={{
                      border: `3px solid ${darkMode ? COLORS.darkCard : '#fff'}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                  />
                ) : (
                  <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl relative z-10"
                    style={{
                      background: 'linear-gradient(135deg, #006B8A, #00897B)',
                      border: `3px solid ${darkMode ? COLORS.darkCard : '#fff'}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                  >
                    {displayName?.charAt(0) || 'U'}
                  </motion.div>
                )}
                <motion.div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center z-20"
                  style={{ background: 'linear-gradient(135deg, #004B63, #00897B)', border: `2.5px solid ${darkMode ? COLORS.darkCard : '#fff'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.3 }}
                >
                  <Check size={10} className="text-white" />
                </motion.div>
              </div>
              <div className="pb-1 flex-1 min-w-0">
                <p className="font-bold text-base truncate" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>{displayName || (isRTL ? 'ظ…ط³طھط®ط¯ظ…' : 'User')}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Phone size={10} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />
                  <p className="text-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} dir="ltr">{user?.phone?.replace(/^\+218/, '0') || (isRTL ? 'ط؛ظٹط± ظ…ط­ط¯ط¯' : 'Not set')}</p>
                </div>
              </div>
            </div>

            {/* Editable Name Fields */}
            <div className="space-y-3">
              {/* Arabic Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
                  {t('mobile.profile.arabicName')}
                </label>
                {editingField === 'nameAr' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      dir="rtl"
                      className="flex-1 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={{
                        background: darkMode ? COLORS.darkSubtle : '#F4F7F9',
                        border: `2px solid ${COLORS.tealDark}`,
                        color: darkMode ? '#F3F4F6' : COLORS.textPrimary,
                      }}
                      autoFocus
                      placeholder={t('mobile.profile.enterArabicName')}
                    />
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => { setEditingField(null); saveNames(); }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
                    >
                      <Check size={16} className="text-white" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: darkMode ? COLORS.darkSubtle : '#F4F7F9',
                      border: `1px solid ${darkMode ? 'transparent' : 'rgba(0,0,0,0.04)'}`,
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditingField('nameAr')}
                    onHoverStart={(e) => {
                      if (e?.target && 'style' in (e.target as HTMLElement)) {
                        (e.target as HTMLElement).style.borderColor = `${COLORS.tealDark}40`;
                      }
                    }}
                    onHoverEnd={(e) => {
                      if (e?.target && 'style' in (e.target as HTMLElement)) {
                        (e.target as HTMLElement).style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <span className="flex-1 text-sm" dir="rtl" style={{ color: nameAr ? (darkMode ? '#E5E7EB' : COLORS.textPrimary) : (darkMode ? '#4B5563' : '#9CA3AF') }}>
                      {nameAr || t('mobile.profile.enterArabicName')}
                    </span>
                    <Edit3 size={14} style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }} />
                  </motion.div>
                )}
              </div>

              {/* English Name */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
                  {t('mobile.profile.englishName')}
                </label>
                {editingField === 'nameEn' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      dir="ltr"
                      className="flex-1 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={{
                        background: darkMode ? COLORS.darkSubtle : '#F4F7F9',
                        border: `2px solid ${COLORS.tealDark}`,
                        color: darkMode ? '#F3F4F6' : COLORS.textPrimary,
                      }}
                      autoFocus
                      placeholder={t('mobile.profile.enterEnglishName')}
                    />
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => { setEditingField(null); saveNames(); }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
                    >
                      <Check size={16} className="text-white" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: darkMode ? COLORS.darkSubtle : '#F4F7F9',
                      border: `1px solid ${darkMode ? 'transparent' : 'rgba(0,0,0,0.04)'}`,
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditingField('nameEn')}
                    onHoverStart={(e) => {
                      if (e?.target && 'style' in (e.target as HTMLElement)) {
                        (e.target as HTMLElement).style.borderColor = `${COLORS.tealDark}40`;
                      }
                    }}
                    onHoverEnd={(e) => {
                      if (e?.target && 'style' in (e.target as HTMLElement)) {
                        (e.target as HTMLElement).style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <span className="flex-1 text-sm" dir="ltr" style={{ color: nameEn ? (darkMode ? '#E5E7EB' : COLORS.textPrimary) : (darkMode ? '#4B5563' : '#9CA3AF') }}>
                      {nameEn || t('mobile.profile.enterEnglishName')}
                    </span>
                    <Edit3 size={14} style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }} />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Saved indicator */}
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(0,137,123,0.08)', border: '1px solid rgba(0,137,123,0.12)' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
                  >
                    <Check size={12} style={{ color: COLORS.tealDark }} />
                  </motion.div>
                  <span className="text-xs font-semibold" style={{ color: COLORS.tealDark }}>
                    {t('mobile.profile.savedSuccessfully')}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Section: Quick Settings */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 px-1 mb-2">
            <Sparkles size={12} style={{ color: COLORS.teal }} />
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ط³ط±ظٹط¹ط©' : 'Quick Settings'}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="rounded-2xl overflow-hidden"
          style={{
            background: darkMode ? COLORS.darkCard : '#fff',
            border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Language */}
          <motion.button
            whileTap={{ scale: 0.995 }}
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="w-full flex items-center gap-3 p-4"
            style={{ borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.04)'}` }}
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(245,158,11,0.12))' }}>
              <Globe size={20} className="text-amber-500" />
            </div>
            <div className="flex-1 text-start">
              <span className="block text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                {t('mobile.language')}
              </span>
              <span className="block text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                {language === 'ar' ? (isRTL ? 'ط§ظ„ط¹ط±ط¨ظٹط© - ط§ظ„ظ„ط؛ط© ط§ظ„ط­ط§ظ„ظٹط©' : 'Arabic - Current') : (isRTL ? 'ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط© - ط§ظ„ط­ط§ظ„ظٹط©' : 'English - Current')}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg" style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6', color: darkMode ? '#9CA3AF' : '#6B7280' }}>
              {language === 'ar' ? 'ط§ظ„ط¹ط±ط¨ظٹط©' : 'English'}
            </span>
            <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
          </motion.button>

          {/* Dark Mode â€” Always On */}
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.04)'}` }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,168,204,0.12)' }}>
              <Moon size={20} style={{ color: COLORS.teal }} />
            </div>
            <div className="flex-1 text-start">
              <span className="block text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                {t('mobile.profile.darkMode')}
              </span>
              <span className="block text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                {isRTL ? 'ظ…ظپط¹ظ‘ظ„ ط¯ط§ط¦ظ…ط§ظ‹' : 'Always on'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#00C4E8]/70 bg-[#00C4E8]/10 px-2.5 py-1 rounded-full">
              {isRTL ? 'ط¯ط§ط¦ظ…' : 'ON'}
            </span>
          </div>

          {/* Notifications */}
          <motion.button whileTap={{ scale: 0.995 }} className="w-full flex items-center gap-3 p-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))' }}>
              <Bell size={20} className="text-red-500" />
            </div>
            <div className="flex-1 text-start">
              <span className="block text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                {t('mobile.profile.notificationSettings')}
              </span>
              <span className="block text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                {isRTL ? 'ط¥ط¯ط§ط±ط© ط§ظ„طھظ†ط¨ظٹظ‡ط§طھ ظˆط§ظ„ط¥ط´ط¹ط§ط±ط§طھ' : 'Manage alerts & notifications'}
              </span>
            </div>
            <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
          </motion.button>
        </motion.div>

        {/* Tip card */}
        <motion.div
          variants={staggerItem}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
          style={{
            background: darkMode ? 'rgba(0,168,204,0.05)' : 'rgba(0,168,204,0.04)',
            border: `1px solid ${darkMode ? 'rgba(0,168,204,0.08)' : 'rgba(0,168,204,0.06)'}`,
          }}
        >
          <Info size={14} style={{ color: COLORS.teal }} />
          <p className="text-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
            {isRTL ? 'ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ظ…ط­ظپظˆط¸ط© طھظ„ظ‚ط§ط¦ظٹط§ظ‹ ط¹ظ„ظ‰ ط¬ظ‡ط§ط²ظƒ' : 'Settings are automatically saved to your device'}
          </p>
        </motion.div>
      </motion.div>
    </OverlayWrapper>
  );
}

// â”€â”€â”€ Privacy & Security Overlay â”€â”€â”€
export function PrivacyOverlay({ onClose, language, direction, isRTL, t, darkMode }: {
  onClose: () => void; language: string; direction: string; isRTL: boolean; t: (key: string) => string; darkMode: boolean;
}) {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const items = [
    {
      icon: Lock, gradient: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))', iconColor: COLORS.teal,
      titleKey: 'mobile.profile.changePassword',
      descKey: 'mobile.profile.changePasswordDesc',
      contentKey: 'mobile.profile.changePasswordContent',
    },
    {
      icon: ShieldCheck, gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))', iconColor: '#8B5CF6',
      titleKey: 'mobile.profile.twoFactorAuth',
      descKey: 'mobile.profile.twoFactorAuthDesc',
      contentKey: 'mobile.profile.twoFactorAuthContent',
    },
    {
      icon: FileText, gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.12))', iconColor: '#3B82F6',
      titleKey: 'mobile.profile.privacyPolicyTitle',
      descKey: 'mobile.profile.privacyPolicyDesc',
      contentKey: 'mobile.profile.privacyPolicyContent',
    },
    {
      icon: FileText, gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.12))', iconColor: '#F59E0B',
      titleKey: 'mobile.profile.termsOfService',
      descKey: 'mobile.profile.termsOfServiceDesc',
      contentKey: 'mobile.profile.termsOfServiceContent',
    },
    {
      icon: RotateCcw, gradient: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))', iconColor: '#EF4444',
      titleKey: 'mobile.profile.returnPolicy',
      descKey: 'mobile.profile.returnPolicyDesc',
      contentKey: 'mobile.profile.returnPolicyContent',
    },
  ];

  return (
    <OverlayWrapper onClose={onClose} title={t('mobile.profile.privacySecurity')} subtitle={isRTL ? 'ط­ظ…ط§ظٹط© ط®طµظˆطµظٹطھظƒ ظˆط£ظ…ط§ظ†ظƒ' : 'Protect your privacy & security'} direction={direction} isRTL={isRTL} darkMode={darkMode}>
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{
          background: darkMode ? COLORS.darkCard : '#fff',
          border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
          boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
        }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          const isExpanded = expandedItem === i;
          return (
            <motion.div key={i} variants={staggerItem} style={{ borderBottom: i < items.length - 1 ? `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.04)'}` : 'none' }}>
              <motion.button
                whileTap={{ scale: 0.995 }}
                onClick={() => setExpandedItem(isExpanded ? null : i)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: item.gradient }}>
                  <Icon size={20} style={{ color: item.iconColor }} />
                </div>
                <div className="flex-1 text-start">
                  <p className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>{t(item.titleKey)}</p>
                  <p className="text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>{t(item.descKey)}</p>
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' as const }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 ps-16">
                      <div className="p-3 rounded-xl text-xs leading-relaxed" style={{ background: darkMode ? COLORS.darkSubtle : '#F4F7F9', color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                        {t(item.contentKey)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </OverlayWrapper>
  );
}

// â”€â”€â”€ Help Center Overlay â”€â”€â”€
export function HelpOverlay({ onClose, language, direction, isRTL, t, darkMode }: {
  onClose: () => void; language: string; direction: string; isRTL: boolean; t: (key: string) => string; darkMode: boolean;
}) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    { qKey: 'mobile.profile.faq1Q', aKey: 'mobile.profile.faq1A' },
    { qKey: 'mobile.profile.faq2Q', aKey: 'mobile.profile.faq2A' },
    { qKey: 'mobile.profile.faq3Q', aKey: 'mobile.profile.faq3A' },
    { qKey: 'mobile.profile.faq4Q', aKey: 'mobile.profile.faq4A' },
    { qKey: 'mobile.profile.faq5Q', aKey: 'mobile.profile.faq5A' },
    { qKey: 'mobile.profile.faq6Q', aKey: 'mobile.profile.faq6A' },
  ];

  return (
    <OverlayWrapper onClose={onClose} title={t('mobile.profile.helpCenter')} subtitle={isRTL ? 'ط£ط³ط¦ظ„ط© ط´ط§ط¦ط¹ط© ظˆظ…ط³ط§ط¹ط¯ط©' : 'FAQs & support'} direction={direction} isRTL={isRTL} darkMode={darkMode}>
      <motion.div
        className="space-y-2.5 mt-2"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {faqs.map((faq, i) => {
          const isExpanded = expandedFaq === i;
          return (
            <motion.div
              key={i}
              variants={staggerItem}
              className="rounded-2xl overflow-hidden"
              style={{
                background: darkMode ? COLORS.darkCard : '#fff',
                border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
                boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <motion.button
                whileTap={{ scale: 0.995 }}
                onClick={() => setExpandedFaq(isExpanded ? null : i)}
                className="w-full p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))' }}>
                    <HelpCircle size={16} className="text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-start" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>{t(faq.qKey)}</p>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 mt-1">
                    <ChevronLeft size={14} className={isRTL ? '' : 'rotate-180'} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
                  </motion.div>
                </div>
              </motion.button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' as const }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 ps-16">
                      <p className="text-xs leading-relaxed" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>{t(faq.aKey)}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Contact Support */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl p-4"
          style={{
            background: darkMode ? COLORS.darkCard : '#fff',
            border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
            {t('mobile.profile.stillNeedHelp')}
          </p>
          <div className="flex items-center gap-2">
            <a href="tel:+218911234567" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(0,168,204,0.08)', color: COLORS.teal }}>
              <Phone size={14} /> {t('mobile.profile.callLabel')}
            </a>
            <a href="mailto:support@nabdalmadina.ly" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(59,130,246,0.08)', color: COLORS.info }}>
              <Mail size={14} /> {t('common.email')}
            </a>
            <a href="https://wa.me/218911234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.08)', color: '#16A34A' }}>
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        </motion.div>
      </motion.div>
    </OverlayWrapper>
  );
}

// â”€â”€â”€ About App Overlay â”€â”€â”€
export function AboutOverlay({ onClose, language, direction, isRTL, t, darkMode }: {
  onClose: () => void; language: string; direction: string; isRTL: boolean; t: (key: string) => string; darkMode: boolean;
}) {
  const openWebview = useMobileStore((s) => s.openWebview);
  return (
    <OverlayWrapper onClose={onClose} title={t('mobile.profile.aboutApp')} subtitle={isRTL ? 'ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„طھط·ط¨ظٹظ‚' : 'App information'} direction={direction} isRTL={isRTL} darkMode={darkMode}>
      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Logo Card */}
        <motion.div variants={staggerItem} className="flex flex-col items-center py-6">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.15) 0%, transparent 70%)', filter: 'blur(10px)' }} />
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center relative z-10" style={{ background: '#FFFFFF', boxShadow: '0 8px 32px rgba(0,75,99,0.3)' }}>
              <img src="/logo-circle.png?v=3" alt={t('mobile.profile.appName')} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          </div>
          <h2 className="text-xl font-bold mt-4" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>{t('mobile.profile.appName')}</h2>
           <p className="text-xs mt-1 px-3 py-1 rounded-lg" style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6', color: darkMode ? '#6B7280' : '#9CA3AF' }}>v{APP_VERSION}</p>
          <p className="text-sm text-center mt-3 leading-relaxed max-w-xs" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
            {t('mobile.profile.aboutDescFull')}
          </p>
        </motion.div>

        {/* Developer Info */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl p-4"
          style={{
            background: darkMode ? COLORS.darkCard : '#fff',
            border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}>
              <span className="text-white text-lg font-black">B</span>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>{t('mobile.profile.poweredBy')}</p>
              <p className="text-xs font-bold" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Bits {t('mobile.profile.software')}</p>
            </div>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl p-4"
          style={{
            background: darkMode ? COLORS.darkCard : '#fff',
            border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>{t('footer.followUs')}</p>
          <div className="flex items-center justify-around">
            <button type="button" onClick={() => openWebview('https://facebook.com/nabdalmadina', 'Facebook')} className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(24,119,242,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" fill="#1877F2"/></svg>
            </button>
            <button type="button" onClick={() => openWebview('https://instagram.com/nabdalmadina', 'Instagram')} className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(228,64,95,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#E4405F" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="#E4405F" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="#E4405F"/></svg>
            </button>
            <a href="https://wa.me/218911234567" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(37,211,102,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            </a>
            <button type="button" onClick={() => openWebview('https://youtube.com/@nabdalmadina', 'YouTube')} className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,0,0,0.1)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z" fill="#FF0000"/><path d="M9.75 15.02l5.75-3.02-5.75-3.02v6.04z" fill="white"/></svg>
            </button>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.p variants={staggerItem} className="text-center text-[10px] mt-2" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
          آ© 2024 {t('mobile.profile.appName')}. {t('mobile.profile.allRightsReserved')}.
        </motion.p>
      </motion.div>
    </OverlayWrapper>
  );
}

// â”€â”€â”€ Contact Us Overlay â”€â”€â”€
export function ContactUsOverlay({ onClose, language, direction, isRTL, t, darkMode }: {
  onClose: () => void; language: string; direction: string; isRTL: boolean; t: (key: string) => string; darkMode: boolean;
}) {
  const openWebview = useMobileStore((s) => s.openWebview);
  const contactMethods = [
    {
      icon: Phone,
      gradient: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))',
      iconColor: COLORS.teal,
      titleKey: 'mobile.profile.callUs',
      descAr: '0911234567',
      descEn: '0911234567',
      action: 'tel:+218911234567',
    },
    {
      icon: MessageCircle,
      gradient: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.12))',
      iconColor: '#16A34A',
      titleKey: 'mobile.profile.whatsappTitle',
      descKey: 'mobile.profile.whatsappDesc',
      action: 'https://wa.me/218911234567',
    },
    {
      icon: Mail,
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.12))',
      iconColor: COLORS.info,
      titleKey: 'mobile.profile.emailTitle',
      descAr: 'support@nabdalmadina.ly',
      descEn: 'support@nabdalmadina.ly',
      action: 'mailto:support@nabdalmadina.ly',
    },
  ];

  const socialLinks = [
    {
      nameKey: 'mobile.profile.socialFacebook',
      bg: 'rgba(24,119,242,0.1)',
      url: 'https://facebook.com/nabdalmadina',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" fill="#1877F2"/></svg>,
    },
    {
      nameKey: 'mobile.profile.socialInstagram',
      bg: 'rgba(228,64,95,0.1)',
      url: 'https://instagram.com/nabdalmadina',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#E4405F" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="#E4405F" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="#E4405F"/></svg>,
    },
    {
      nameKey: 'mobile.profile.socialWhatsapp',
      bg: 'rgba(37,211,102,0.1)',
      url: 'https://wa.me/218911234567',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>,
    },
    {
      nameKey: 'mobile.profile.socialYoutube',
      bg: 'rgba(255,0,0,0.1)',
      url: 'https://youtube.com/@nabdalmadina',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z" fill="#FF0000"/><path d="M9.75 15.02l5.75-3.02-5.75-3.02v6.04z" fill="white"/></svg>,
    },
    {
      nameKey: 'mobile.profile.socialX',
      bg: 'rgba(107,114,128,0.1)',
      url: 'https://twitter.com/nabdalmadina',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#1DA1F2"/></svg>,
    },
  ];

  return (
    <OverlayWrapper onClose={onClose} title={t('nav.contact')} subtitle={isRTL ? 'ظ†ط³ط¹ط¯ ط¨طھظˆط§طµظ„ظƒ ظ…ط¹ظ†ط§' : 'We\'d love to hear from you'} direction={direction} isRTL={isRTL} darkMode={darkMode}>
      <motion.div
        className="space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Card */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(150deg, #003545, #004B63 40%, #006B8A 70%, #00897B)' }}
        >
          <div className="absolute -top-6 -end-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute bottom-2 start-2 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10">
            <h3 className="text-white text-lg font-bold mb-1">{t('mobile.profile.appName')}</h3>
            <p className="text-white/60 text-xs leading-relaxed">{t('mobile.profile.contactUsDesc')}</p>
          </div>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl overflow-hidden"
          style={{
            background: darkMode ? COLORS.darkCard : '#fff',
            border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {contactMethods.map((method, i) => {
            const Icon = method.icon;
            return (
              <a
                key={i}
                href={method.action}
                target={method.action.startsWith('http') ? '_blank' : undefined}
                rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-3 p-4 transition-colors"
                style={{ borderBottom: i < contactMethods.length - 1 ? `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.04)'}` : 'none' }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: method.gradient }}>
                  <Icon size={22} style={{ color: method.iconColor }} />
                </div>
                <div className="flex-1 text-start">
                  <p className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>{t(method.titleKey)}</p>
                  <p className="text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} dir={method.titleKey === 'mobile.profile.emailTitle' ? 'ltr' : undefined}>
                    {method.descKey ? t(method.descKey) : (isRTL ? method.descAr : method.descEn)}
                  </p>
                </div>
                <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
              </a>
            );
          })}
        </motion.div>

        {/* Working Hours & Address */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl overflow-hidden"
          style={{
            background: darkMode ? COLORS.darkCard : '#fff',
            border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.04)'}` }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.12))' }}>
              <Clock size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>{t('mobile.profile.workingHours')}</p>
              <p className="text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>{t('mobile.profile.workingHoursTime')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))' }}>
              <MapPin size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>{t('mobile.profile.physicalAddress')}</p>
              <p className="text-xs mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>{t('mobile.profile.physicalAddressValue')}</p>
            </div>
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          variants={staggerItem}
          className="rounded-2xl p-4"
          style={{
            background: darkMode ? COLORS.darkCard : '#fff',
            border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
            boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
            {t('mobile.profile.followUsOn')}
          </p>
          <div className="grid grid-cols-5 gap-3">
            {socialLinks.map((social, i) => {
              const isWhatsApp = social.url.includes('wa.me');
              return isWhatsApp ? (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: social.bg }}>
                    {social.icon}
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                    {t(social.nameKey)}
                  </span>
                </a>
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => openWebview(social.url, t(social.nameKey))}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: social.bg }}>
                    {social.icon}
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                    {t(social.nameKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Live Chat */}
        <motion.button
          variants={staggerItem}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onClose();
            setTimeout(() => window.dispatchEvent(new CustomEvent('openSupportChat')), 300);
          }}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #004B63, #00897B)', boxShadow: '0 4px 16px rgba(0,75,99,0.3)' }}
        >
          <MessageCircle size={18} />
          {t('mobile.profile.liveChat')}
        </motion.button>
      </motion.div>
    </OverlayWrapper>
  );
}

