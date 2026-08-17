'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { APP_VERSION } from '../lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '../lib/mobile-store';
import type { MobileUser } from '../lib/types';
import {
  ArrowRight, ArrowLeft, ChevronDown, Eye, EyeOff, Check, X,
  Camera, User, Lock, CreditCard, Bug, Star, Share2, Info,
  FileText, Shield, HelpCircle, Phone, Mail, Globe, MessageCircle,
  Copy, ExternalLink, Sparkles, Heart, Zap, ChevronLeft, Send,
  CheckCircle2, AlertCircle, Package, MapPin, Clock
} from 'lucide-react';

// â”€â”€â”€ Brand Design Tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const COLORS = {
  teal: '#00A8CC',
  primary: '#004B63',
  primaryLight: '#006B8A',
  tealDark: '#00897B',
  danger: '#EF4444',
  success: '#238636',
  gold: '#D4A843',
  purple: '#8B5CF6',
  info: '#3B82F6',
  warning: '#D29922',
  textPrimary: '#1F2937',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  darkCard: '#151D2E',
  darkBorder: '#1E2A42',
  darkSubtle: '#1A2540',
};

const GRADIENT_HEADER = 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)';
const GRADIENT_BUTTON = 'linear-gradient(135deg, #004B63, #00897B)';

// â”€â”€â”€ Stagger animation variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      <div className="relative overflow-hidden" style={{ background: GRADIENT_HEADER }}>
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

// â”€â”€â”€ Card component â”€â”€â”€
function Card({ children, darkMode, className = '' }: { children: React.ReactNode; darkMode: boolean; className?: string }) {
  return (
    <motion.div
      variants={staggerItem}
      className={`rounded-2xl overflow-hidden ${className}`}
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

// â”€â”€â”€ Input field component â”€â”€â”€
function InputField({ label, value, onChange, placeholder, type = 'text', darkMode, isRTL, dir, readonly, icon }: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  darkMode: boolean;
  isRTL: boolean;
  dir?: string;
  readonly?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute top-1/2 -translate-y-1/2 start-3.5 z-10">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={readonly}
          dir={dir}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none transition-colors ${icon ? 'ps-10' : ''}`}
          style={{
            background: readonly
              ? (darkMode ? `${COLORS.darkSubtle}` : '#F0F0F0')
              : (darkMode ? COLORS.darkSubtle : '#F4F7F9'),
            border: readonly
              ? `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`
              : `1px solid ${darkMode ? 'transparent' : 'rgba(0,0,0,0.04)'}`,
            color: readonly
              ? (darkMode ? '#6B7280' : '#9CA3AF')
              : (darkMode ? '#F3F4F6' : COLORS.textPrimary),
          }}
        />
      </div>
    </div>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 1. EDIT PROFILE OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function EditProfileOverlay({ onClose, user, darkMode, isRTL, direction, onSave }: {
  onClose: () => void;
  user: MobileUser | null;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
  onSave?: () => void;
}) {
  const { t } = useLanguageStore();
  const { updateUser } = useMobileStore();

  const [userPhoto, setUserPhoto] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') return localStorage.getItem('mobile_user_photo');
    } catch { /* ignore */ }
    return null;
  });

  const getInitialNames = () => {
    try {
      const stored = localStorage.getItem('mobile_user_names');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { nameAr: parsed.nameAr || user?.name || '', nameEn: parsed.nameEn || user?.name || '' };
      }
    } catch { /* ignore */ }
    return { nameAr: user?.name || '', nameEn: user?.name || '' };
  };

  const [nameAr, setNameAr] = useState(getInitialNames().nameAr);
  const [nameEn, setNameEn] = useState(getInitialNames().nameEn);
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const displayName = isRTL ? (nameAr || user?.name || '') : (nameEn || user?.name || '');

  const handleSave = () => {
    try {
      localStorage.setItem('mobile_user_names', JSON.stringify({ nameAr, nameEn }));
      if (user) {
        updateUser({ name: isRTL ? nameAr : nameEn, email: email || undefined });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSave) onSave();
    } catch { /* ignore */ }
  };

  const handlePhotoChange = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string;
          localStorage.setItem('mobile_user_photo', dataUrl);
          setUserPhoto(dataUrl);
          // Sync to store so Home tab and other screens update
          useMobileStore.getState().setAvatar(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'طھط¹ط¯ظٹظ„ ط§ظ„ظ…ظ„ظپ ط§ظ„ط´ط®طµظٹ' : 'Edit Profile'}
      subtitle={isRTL ? 'طھط­ط¯ظٹط« ط¨ظٹط§ظ†ط§طھظƒ ط§ظ„ط´ط®طµظٹط©' : 'Update your personal info'}
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
        {/* Profile Photo Section */}
        <Card darkMode={darkMode}>
          <div className="p-6 flex flex-col items-center">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.15) 0%, transparent 70%)', filter: 'blur(6px)' }} />
              {userPhoto ? (
                <motion.img
                  src={userPhoto}
                  alt={displayName || 'User'}
                  className="w-24 h-24 rounded-2xl object-cover relative z-10"
                  style={{
                    border: `3px solid ${darkMode ? COLORS.darkBorder : '#E5E7EB'}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                />
              ) : (
                <motion.div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl relative z-10"
                  style={{
                    background: GRADIENT_BUTTON,
                    border: `3px solid ${darkMode ? COLORS.darkBorder : '#E5E7EB'}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  {displayName?.charAt(0) || 'U'}
                </motion.div>
              )}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handlePhotoChange}
                className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center z-20"
                style={{ background: GRADIENT_BUTTON, border: `3px solid ${darkMode ? COLORS.darkCard : '#fff'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
              >
                <Camera size={14} className="text-white" />
              </motion.button>
            </div>
            <p className="text-xs mt-3 font-medium" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
              {isRTL ? 'ط§ط¶ط؛ط· ظ„طھط؛ظٹظٹط± ط§ظ„طµظˆط±ط©' : 'Tap to change photo'}
            </p>
          </div>
        </Card>

        {/* Editable Fields */}
        <Card darkMode={darkMode}>
          <div className="p-4 space-y-4">
            <InputField
              label={isRTL ? 'ط§ظ„ط§ط³ظ… ط¨ط§ظ„ط¹ط±ط¨ظٹط©' : 'Arabic Name'}
              value={nameAr}
              onChange={setNameAr}
              placeholder={isRTL ? 'ط£ط¯ط®ظ„ ط§ط³ظ…ظƒ ط¨ط§ظ„ط¹ط±ط¨ظٹط©' : 'Enter your Arabic name'}
              darkMode={darkMode}
              isRTL={isRTL}
              dir="rtl"
              icon={<User size={14} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
            />
            <InputField
              label={isRTL ? 'ط§ظ„ط§ط³ظ… ط¨ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©' : 'English Name'}
              value={nameEn}
              onChange={setNameEn}
              placeholder={isRTL ? 'ط£ط¯ط®ظ„ ط§ط³ظ…ظƒ ط¨ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©' : 'Enter your English name'}
              darkMode={darkMode}
              isRTL={isRTL}
              dir="ltr"
            />
            <InputField
              label={isRTL ? 'ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ' : 'Email'}
              value={email}
              onChange={setEmail}
              placeholder="email@example.com"
              type="email"
              darkMode={darkMode}
              isRTL={isRTL}
              dir="ltr"
              icon={<Mail size={14} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
            />
            <InputField
              label={isRTL ? 'ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ' : 'Phone Number'}
              value={user?.phone || ''}
              placeholder=""
              darkMode={darkMode}
              isRTL={isRTL}
              dir="ltr"
              readonly
              icon={<Phone size={14} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
            />
          </div>
        </Card>

        {/* Save Button */}
        <motion.button
          variants={staggerItem}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: GRADIENT_BUTTON, boxShadow: '0 4px 16px rgba(0,75,99,0.3)' }}
        >
          <Check size={16} />
          {isRTL ? 'ط­ظپط¸ ط§ظ„طھط¹ط¯ظٹظ„ط§طھ' : 'Save Changes'}
        </motion.button>

        {/* Saved indicator */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl"
              style={{ background: 'rgba(0,137,123,0.08)', border: '1px solid rgba(0,137,123,0.12)' }}
            >
              <CheckCircle2 size={14} style={{ color: COLORS.tealDark }} />
              <span className="text-xs font-semibold" style={{ color: COLORS.tealDark }}>
                {isRTL ? 'طھظ… ط­ظپط¸ ط§ظ„طھط¹ط¯ظٹظ„ط§طھ ط¨ظ†ط¬ط§ط­' : 'Changes saved successfully'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </OverlayWrapper>
  );
}

// â”€â”€â”€ Password Input component (module-level to avoid recreation) â”€â”€â”€
function PasswordInputField({ label, value, onChange, show, onToggle, placeholder, darkMode }: {
  label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder: string; darkMode: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir="ltr"
          className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none pe-10"
          style={{
            background: darkMode ? COLORS.darkSubtle : '#F4F7F9',
            border: `1px solid ${darkMode ? 'transparent' : 'rgba(0,0,0,0.04)'}`,
            color: darkMode ? '#F3F4F6' : COLORS.textPrimary,
          }}
        />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onToggle}
          className="absolute top-1/2 -translate-y-1/2 end-3"
        >
          {show ? <EyeOff size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} /> : <Eye size={16} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
        </motion.button>
      </div>
    </div>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 2. CHANGE PASSWORD OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function ChangePasswordOverlay({ onClose, user, darkMode, isRTL, direction } : {
  onClose: () => void;
  user: MobileUser | null;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password strength
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  }, [newPassword]);

  const strengthLabel = useMemo(() => {
    if (passwordStrength <= 1) return isRTL ? 'ط¶ط¹ظٹظپط©' : 'Weak';
    if (passwordStrength <= 2) return isRTL ? 'ظ…طھظˆط³ط·ط©' : 'Medium';
    return isRTL ? 'ظ‚ظˆظٹط©' : 'Strong';
  }, [passwordStrength, isRTL]);

  const strengthColor = useMemo(() => {
    if (passwordStrength <= 1) return COLORS.danger;
    if (passwordStrength <= 2) return COLORS.warning;
    return COLORS.success;
  }, [passwordStrength]);

  const requirements = [
    { met: newPassword.length >= 8, label: isRTL ? '8 ط£ط­ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„' : 'At least 8 characters' },
    { met: /[A-Z]/.test(newPassword), label: isRTL ? 'ط­ط±ظپ ظƒط¨ظٹط±' : 'Uppercase letter' },
    { met: /[0-9]/.test(newPassword), label: isRTL ? 'ط±ظ‚ظ…' : 'Number' },
    { met: /[^A-Za-z0-9]/.test(newPassword), label: isRTL ? 'ط±ظ…ط² ط®ط§طµ' : 'Special character' },
  ];

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ type: 'error', message: isRTL ? 'ظٹط±ط¬ظ‰ ظ…ظ„ط، ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ„' : 'Please fill all fields' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', message: isRTL ? 'ظƒظ„ظ…طھط§ ط§ظ„ظ…ط±ظˆط± ط؛ظٹط± ظ…طھط·ط§ط¨ظ‚طھظٹظ†' : 'Passwords do not match' });
      return;
    }
    if (passwordStrength < 2) {
      setToast({ type: 'error', message: isRTL ? 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط¶ط¹ظٹظپط© ط¬ط¯ط§ظ‹' : 'Password is too weak' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      });
      if (res.ok) {
        setToast({ type: 'success', message: isRTL ? 'طھظ… طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط¨ظ†ط¬ط§ط­' : 'Password changed successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setToast({ type: 'error', message: isRTL ? 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط­ط§ظ„ظٹط© ط؛ظٹط± طµط­ظٹط­ط©' : 'Current password is incorrect' });
      }
    } catch {
      setToast({ type: 'error', message: isRTL ? 'ط­ط¯ط« ط®ط·ط£طŒ ظٹط±ط¬ظ‰ ط§ظ„ظ…ط­ط§ظˆظ„ط© ظ„ط§ط­ظ‚ط§ظ‹' : 'An error occurred, please try again' });
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±' : 'Change Password'}
      subtitle={isRTL ? 'طھط­ط¯ظٹط« ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط®ط§طµط© ط¨ظƒ' : 'Update your password'}
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
        {/* Password Fields */}
        <Card darkMode={darkMode}>
          <div className="p-4 space-y-4">
            <PasswordInputField
              label={isRTL ? 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط­ط§ظ„ظٹط©' : 'Current Password'}
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              placeholder={isRTL ? 'ط£ط¯ط®ظ„ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط­ط§ظ„ظٹط©' : 'Enter current password'}
              darkMode={darkMode}
            />
            <PasswordInputField
              label={isRTL ? 'ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط¬ط¯ظٹط¯ط©' : 'New Password'}
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder={isRTL ? 'ط£ط¯ط®ظ„ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط¬ط¯ظٹط¯ط©' : 'Enter new password'}
              darkMode={darkMode}
            />

            {/* Password Strength */}
            {newPassword && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: darkMode ? COLORS.darkBorder : '#E5E7EB' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: strengthColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength / 4) * 100}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' as const }}
                    />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>

                {/* Requirements Checklist */}
                <div className="space-y-1.5">
                  {requirements.map((req, i) => (
                    <motion.div key={i} className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{
                        background: req.met ? `${COLORS.success}20` : (darkMode ? COLORS.darkSubtle : '#F3F4F6'),
                      }}>
                        {req.met ? <Check size={10} style={{ color: COLORS.success }} /> : <X size={8} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />}
                      </div>
                      <span className="text-[11px]" style={{ color: req.met ? COLORS.success : (darkMode ? '#6B7280' : '#9CA3AF') }}>{req.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            <PasswordInputField
              label={isRTL ? 'طھط£ظƒظٹط¯ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±' : 'Confirm Password'}
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder={isRTL ? 'ط£ط¹ط¯ ط¥ط¯ط®ط§ظ„ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط¬ط¯ظٹط¯ط©' : 'Re-enter new password'}
              darkMode={darkMode}
            />
          </div>
        </Card>

        {/* Save Button */}
        <motion.button
          variants={staggerItem}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: GRADIENT_BUTTON, boxShadow: '0 4px 16px rgba(0,75,99,0.3)' }}
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <Lock size={16} />
              {isRTL ? 'طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±' : 'Change Password'}
            </>
          )}
        </motion.button>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{
                background: toast.type === 'success' ? 'rgba(0,137,123,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${toast.type === 'success' ? 'rgba(0,137,123,0.12)' : 'rgba(239,68,68,0.12)'}`,
              }}
            >
              {toast.type === 'success' ? <CheckCircle2 size={14} style={{ color: COLORS.success }} /> : <AlertCircle size={14} style={{ color: COLORS.danger }} />}
              <span className="text-xs font-semibold" style={{ color: toast.type === 'success' ? COLORS.success : COLORS.danger }}>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 3. PAYMENT METHOD OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function PaymentMethodOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const [selected, setSelected] = useState('cod');

  const methods = [
    {
      id: 'cod',
      titleAr: 'ط§ظ„ط¯ظپط¹ ط¹ظ†ط¯ ط§ظ„ط§ط³طھظ„ط§ظ…',
      titleEn: 'Cash on Delivery',
      subtitleAr: 'ط§ط¯ظپط¹ ظ†ظ‚ط¯ط§ظ‹ ط¹ظ†ط¯ ط§ط³طھظ„ط§ظ… ط·ظ„ط¨ظƒ',
      subtitleEn: 'Pay cash when you receive your order',
      icon: Package,
      gradient: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))',
      iconColor: COLORS.teal,
      available: true,
    },
    {
      id: 'card',
      titleAr: 'ط§ظ„ط¯ظپط¹ ط¨ط§ظ„ط¨ط·ط§ظ‚ط©',
      titleEn: 'Card Payment',
      subtitleAr: 'ظپظٹط²ط§ ط£ظˆ ظ…ط§ط³طھط±ظƒط§ط±ط¯',
      subtitleEn: 'Visa or Mastercard',
      icon: CreditCard,
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))',
      iconColor: COLORS.purple,
      available: false,
    },
    {
      id: 'wallet',
      titleAr: 'ط§ظ„ظ…ط­ظپط¸ط© ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط©',
      titleEn: 'E-Wallet',
      subtitleAr: 'ط§ط¯ظپط¹ ظ…ظ† ط±طµظٹط¯ ظ…ط­ظپط¸طھظƒ',
      subtitleEn: 'Pay from your wallet balance',
      icon: Zap,
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.12))',
      iconColor: '#F59E0B',
      available: false,
    },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'ط·ط±ظٹظ‚ط© ط§ظ„ط¯ظپط¹' : 'Payment Method'}
      subtitle={isRTL ? 'ط§ط®طھط± ط·ط±ظٹظ‚ط© ط§ظ„ط¯ظپط¹ ط§ظ„ظ…ظپط¶ظ„ط©' : 'Choose your preferred payment method'}
      direction={direction}
      isRTL={isRTL}
      darkMode={darkMode}
    >
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selected === method.id;
          return (
            <Card key={method.id} darkMode={darkMode}>
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => method.available && setSelected(method.id)}
                className="w-full p-4 text-start"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: method.gradient }}
                  >
                    <Icon size={22} style={{ color: method.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                        {isRTL ? method.titleAr : method.titleEn}
                      </p>
                      {!method.available && (
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-md"
                          style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
                        >
                          {isRTL ? 'ظ‚ط±ظٹط¨ط§ظ‹' : 'Soon'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                      {isRTL ? method.subtitleAr : method.subtitleEn}
                    </p>
                  </div>
                  {method.available && (
                    <motion.div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isSelected ? GRADIENT_BUTTON : 'transparent',
                        border: isSelected ? 'none' : `2px solid ${darkMode ? COLORS.darkBorder : '#D1D5DB'}`,
                      }}
                      animate={{ scale: isSelected ? 1.1 : 1 }}
                      transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </motion.div>
                  )}
                </div>
              </motion.button>
            </Card>
          );
        })}

        {/* Info card */}
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
            {isRTL ? 'ط·ط±ظ‚ ط§ظ„ط¯ظپط¹ ط§ظ„ط¥ط¶ط§ظپظٹط© ط³طھطھظˆظپط± ظ‚ط±ظٹط¨ط§ظ‹' : 'Additional payment methods coming soon'}
          </p>
        </motion.div>
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 4. REPORT BUG OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function ReportBugOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'performance', labelAr: 'ط£ط¯ط§ط،', labelEn: 'Performance', icon: Zap, color: COLORS.warning },
    { id: 'ui', labelAr: 'ظˆط§ط¬ظ‡ط© ظ…ط³طھط®ط¯ظ…', labelEn: 'UI Issue', icon: Eye, color: COLORS.purple },
    { id: 'account', labelAr: 'ط­ط³ط§ط¨', labelEn: 'Account', icon: User, color: COLORS.teal },
    { id: 'orders', labelAr: 'ط·ظ„ط¨ط§طھ', labelEn: 'Orders', icon: Package, color: COLORS.info },
    { id: 'other', labelAr: 'ط£ط®ط±ظ‰', labelEn: 'Other', icon: HelpCircle, color: '#6B7280' },
  ];

  const handleSubmit = async () => {
    if (!category || !description) return;
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <OverlayWrapper onClose={onClose} title={isRTL ? 'ط§ظ„ط¥ط¨ظ„ط§ط؛ ط¹ظ† ظ…ط´ظƒظ„ط©' : 'Report a Bug'} direction={direction} isRTL={isRTL} darkMode={darkMode}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 15, delay: 0.2 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ background: `${COLORS.success}15` }}
          >
            <CheckCircle2 size={40} style={{ color: COLORS.success }} />
          </motion.div>
          <h3 className="text-lg font-bold mb-2" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
            {isRTL ? 'ط´ظƒط±ط§ظ‹ ظ„ظƒ!' : 'Thank you!'}
          </h3>
          <p className="text-sm text-center max-w-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
            {isRTL ? 'طھظ… ط¥ط±ط³ط§ظ„ ط¨ظ„ط§ط؛ظƒ ط¨ظ†ط¬ط§ط­. ط³ظ†ط¹ظ…ظ„ ط¹ظ„ظ‰ ط­ظ„ ط§ظ„ظ…ط´ظƒظ„ط© ظپظٹ ط£ظ‚ط±ط¨ ظˆظ‚طھ.' : 'Your report has been sent successfully. We will work on fixing the issue as soon as possible.'}
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-6 px-8 py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: GRADIENT_BUTTON }}
          >
            {isRTL ? 'ط¥ط؛ظ„ط§ظ‚' : 'Close'}
          </motion.button>
        </motion.div>
      </OverlayWrapper>
    );
  }

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'ط§ظ„ط¥ط¨ظ„ط§ط؛ ط¹ظ† ظ…ط´ظƒظ„ط©' : 'Report a Bug'}
      subtitle={isRTL ? 'ط³ط§ط¹ط¯ظ†ط§ ظپظٹ طھط­ط³ظٹظ† ط§ظ„طھط·ط¨ظٹظ‚' : 'Help us improve the app'}
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
        {/* Bug Category */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'ظ†ظˆط¹ ط§ظ„ظ…ط´ظƒظ„ط©' : 'Bug Category'}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.id;
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategory(cat.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: isActive ? `${cat.color}15` : (darkMode ? COLORS.darkSubtle : '#F3F4F6'),
                      border: `1px solid ${isActive ? `${cat.color}30` : 'transparent'}`,
                      color: isActive ? cat.color : (darkMode ? '#6B7280' : '#9CA3AF'),
                    }}
                  >
                    <Icon size={12} />
                    {isRTL ? cat.labelAr : cat.labelEn}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card darkMode={darkMode}>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
                {isRTL ? 'ظˆطµظپ ط§ظ„ظ…ط´ظƒظ„ط©' : 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isRTL ? 'ط§ظƒطھط¨ ظˆطµظپط§ظ‹ طھظپطµظٹظ„ظٹط§ظ‹ ظ„ظ„ظ…ط´ظƒظ„ط©...' : 'Write a detailed description of the issue...'}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                style={{
                  background: darkMode ? COLORS.darkSubtle : '#F4F7F9',
                  border: `1px solid ${darkMode ? 'transparent' : 'rgba(0,0,0,0.04)'}`,
                  color: darkMode ? '#F3F4F6' : COLORS.textPrimary,
                }}
              />
            </div>

            <InputField
              label={isRTL ? 'ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ (ط§ط®طھظٹط§ط±ظٹ)' : 'Email (optional)'}
              value={email}
              onChange={setEmail}
              placeholder="email@example.com"
              type="email"
              darkMode={darkMode}
              isRTL={isRTL}
              dir="ltr"
              icon={<Mail size={14} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
            />
          </div>
        </Card>

        {/* Submit Button */}
        <motion.button
          variants={staggerItem}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!category || !description || loading}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: GRADIENT_BUTTON, boxShadow: '0 4px 16px rgba(0,75,99,0.3)' }}
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <Bug size={16} />
              {isRTL ? 'ط¥ط±ط³ط§ظ„ ط§ظ„ط¨ظ„ط§ط؛' : 'Submit Report'}
            </>
          )}
        </motion.button>
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 5. RATE APP OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function RateAppOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <OverlayWrapper onClose={onClose} title={isRTL ? 'طھظ‚ظٹظٹظ… ط§ظ„طھط·ط¨ظٹظ‚' : 'Rate the App'} direction={direction} isRTL={isRTL} darkMode={darkMode}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 15, delay: 0.2 }}
            className="mb-4"
          >
            <Star size={56} fill={COLORS.gold} style={{ color: COLORS.gold }} />
          </motion.div>
          <h3 className="text-lg font-bold mb-2" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
            {isRTL ? 'ط´ظƒط±ط§ظ‹ ظ„طھظ‚ظٹظٹظ…ظƒ!' : 'Thank you for your rating!'}
          </h3>
          <p className="text-sm text-center max-w-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
            {isRTL ? 'ط±ط£ظٹظƒ ظٹظ‡ظ…ظ†ط§ ظˆظٹط³ط§ط¹ط¯ظ†ط§ ظپظٹ طھط­ط³ظٹظ† ط§ظ„طھط·ط¨ظٹظ‚ ط¨ط§ط³طھظ…ط±ط§ط±.' : 'Your feedback matters and helps us improve the app continuously.'}
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-6 px-8 py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: GRADIENT_BUTTON }}
          >
            {isRTL ? 'ط¥ط؛ظ„ط§ظ‚' : 'Close'}
          </motion.button>
        </motion.div>
      </OverlayWrapper>
    );
  }

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'طھظ‚ظٹظٹظ… ط§ظ„طھط·ط¨ظٹظ‚' : 'Rate the App'}
      subtitle={isRTL ? 'ط´ط§ط±ظƒظ†ط§ ط±ط£ظٹظƒ' : 'Share your feedback'}
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
        {/* Stars Section */}
        <Card darkMode={darkMode}>
          <div className="p-6 flex flex-col items-center">
            <p className="text-sm font-bold mb-4" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
              {isRTL ? 'ظƒظ… طھظ‚ظٹظٹظ…ظƒ ظ„ظ„طھط·ط¨ظٹظ‚طں' : 'How would you rate our app?'}
            </p>
            <div className="flex items-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.2 }}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <motion.div
                    animate={{
                      scale: (hoveredStar >= star || rating >= star) ? 1.15 : 1,
                      rotate: (hoveredStar >= star) ? [0, -10, 10, 0] : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Star
                      size={40}
                      fill={(hoveredStar >= star || rating >= star) ? COLORS.gold : 'transparent'}
                      style={{
                        color: (hoveredStar >= star || rating >= star) ? COLORS.gold : (darkMode ? COLORS.darkBorder : '#D1D5DB'),
                        filter: (hoveredStar >= star || rating >= star) ? 'drop-shadow(0 2px 8px rgba(212,168,67,0.3))' : 'none',
                      }}
                    />
                  </motion.div>
                </motion.button>
              ))}
            </div>
            {rating > 0 && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-medium"
                style={{ color: COLORS.gold }}
              >
                {rating === 1 && (isRTL ? 'ط³ظٹط،' : 'Poor')}
                {rating === 2 && (isRTL ? 'ظ…ظ‚ط¨ظˆظ„' : 'Fair')}
                {rating === 3 && (isRTL ? 'ط¬ظٹط¯' : 'Good')}
                {rating === 4 && (isRTL ? 'ط¬ظٹط¯ ط¬ط¯ط§ظ‹' : 'Very Good')}
                {rating === 5 && (isRTL ? 'ظ…ظ…طھط§ط²!' : 'Excellent!')}
              </motion.p>
            )}
          </div>
        </Card>

        {/* Comment */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'طھط¹ظ„ظٹظ‚ظƒ (ط§ط®طھظٹط§ط±ظٹ)' : 'Your comment (optional)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isRTL ? 'ط§ظƒطھط¨ طھط¹ظ„ظٹظ‚ظƒ ظ‡ظ†ط§...' : 'Write your comment here...'}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
              style={{
                background: darkMode ? COLORS.darkSubtle : '#F4F7F9',
                border: `1px solid ${darkMode ? 'transparent' : 'rgba(0,0,0,0.04)'}`,
                color: darkMode ? '#F3F4F6' : COLORS.textPrimary,
              }}
            />
          </div>
        </Card>

        {/* Submit Button */}
        <motion.button
          variants={staggerItem}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: GRADIENT_BUTTON, boxShadow: '0 4px 16px rgba(0,75,99,0.3)' }}
        >
          {loading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <Star size={16} />
              {isRTL ? 'ط¥ط±ط³ط§ظ„ ط§ظ„طھظ‚ظٹظٹظ…' : 'Submit Rating'}
            </>
          )}
        </motion.button>
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 6. SHARE APP OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function ShareAppOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const { user } = useMobileStore();
  const [copied, setCopied] = useState(false);

  const shareLink = `https://nabd.ly/ref/${user?.id || 'guest'}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const shareOptions = [
    {
      id: 'whatsapp',
      labelAr: 'ظˆط§طھط³ط§ط¨',
      labelEn: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      bg: 'rgba(37,211,102,0.1)',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(isRTL ? 'ط¬ط±ط¨ طھط·ط¨ظٹظ‚ ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©!' : 'Try Nabd Al-Madina app!')} ${shareLink}`, '_blank'),
    },
    {
      id: 'telegram',
      labelAr: 'طھظٹظ„ظٹط¬ط±ط§ظ…',
      labelEn: 'Telegram',
      icon: Send,
      color: '#0088CC',
      bg: 'rgba(0,136,204,0.1)',
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(isRTL ? 'ط¬ط±ط¨ طھط·ط¨ظٹظ‚ ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©!' : 'Try Nabd Al-Madina app!')}`, '_blank'),
    },
    {
      id: 'twitter',
      labelAr: 'طھظˆظٹطھط±',
      labelEn: 'Twitter',
      icon: Globe,
      color: '#1DA1F2',
      bg: 'rgba(29,161,242,0.1)',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(isRTL ? 'ط¬ط±ط¨ طھط·ط¨ظٹظ‚ ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©!' : 'Try Nabd Al-Madina app!')}&url=${encodeURIComponent(shareLink)}`, '_blank'),
    },
    {
      id: 'copy',
      labelAr: copied ? 'طھظ… ط§ظ„ظ†ط³ط®!' : 'ظ†ط³ط® ط§ظ„ط±ط§ط¨ط·',
      labelEn: copied ? 'Copied!' : 'Copy Link',
      icon: Copy,
      color: copied ? COLORS.success : COLORS.teal,
      bg: copied ? 'rgba(35,134,54,0.1)' : 'rgba(0,168,204,0.1)',
      action: handleCopy,
    },
    {
      id: 'more',
      labelAr: 'ط§ظ„ظ…ط²ظٹط¯',
      labelEn: 'More',
      icon: ExternalLink,
      color: '#6B7280',
      bg: darkMode ? COLORS.darkSubtle : '#F3F4F6',
      action: () => {
        try {
          navigator.share({
            title: isRTL ? 'ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©' : 'Nabd Al-Madina',
            text: isRTL ? 'ط¬ط±ط¨ طھط·ط¨ظٹظ‚ ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©!' : 'Try Nabd Al-Madina app!',
            url: shareLink,
          });
        } catch { /* ignore */ }
      },
    },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'ظ…ط´ط§ط±ظƒط© ط§ظ„طھط·ط¨ظٹظ‚' : 'Share the App'}
      subtitle={isRTL ? 'ط§ط¯ط¹ ط£طµط¯ظ‚ط§ط،ظƒ ظ„ظ„طھط³ظˆظ‚' : 'Invite friends to shop'}
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
        {/* App Icon & Description */}
        <Card darkMode={darkMode}>
          <div className="p-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: GRADIENT_BUTTON, boxShadow: '0 4px 16px rgba(0,75,99,0.3)' }}>
              <span className="text-white text-2xl font-black">N</span>
            </div>
            <h3 className="text-base font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
              {isRTL ? 'ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©' : 'Nabd Al-Madina'}
            </h3>
            <p className="text-xs text-center mt-1.5 max-w-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
              {isRTL ? 'ط£ظپط¶ظ„ طھط¬ط±ط¨ط© طھط³ظˆظ‚ ط¥ظ„ظƒطھط±ظˆظ†ظٹط© ظپظٹ ظ„ظٹط¨ظٹط§ - ط¬ظˆط¯ط© ظˆط£ظ…ط§ظ† ظپظٹ ظƒظ„ ط·ظ„ط¨' : 'Best e-commerce experience in Libya - Quality and security in every order'}
            </p>
          </div>
        </Card>

        {/* Share Link */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'ط±ط§ط¨ط· ط§ظ„ط¥ط­ط§ظ„ط©' : 'Referral Link'}
            </label>
            <div className="flex items-center gap-2">
              <div
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs truncate"
                dir="ltr"
                style={{
                  background: darkMode ? COLORS.darkSubtle : '#F4F7F9',
                  border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.04)'}`,
                  color: darkMode ? '#9CA3AF' : '#6B7280',
                }}
              >
                {shareLink}
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleCopy}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: copied ? `${COLORS.success}15` : `${COLORS.teal}15`,
                  border: `1px solid ${copied ? `${COLORS.success}30` : `${COLORS.teal}30`}`,
                }}
              >
                {copied ? <Check size={16} style={{ color: COLORS.success }} /> : <Copy size={16} style={{ color: COLORS.teal }} />}
              </motion.button>
            </div>
          </div>
        </Card>

        {/* Share Options */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'ظ…ط´ط§ط±ظƒط© ط¹ط¨ط±' : 'Share via'}
            </label>
            <div className="grid grid-cols-5 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={option.action}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: option.bg }}
                    >
                      <Icon size={20} style={{ color: option.color }} />
                    </div>
                    <span className="text-[9px] font-medium truncate w-full text-center" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                      {isRTL ? option.labelAr : option.labelEn}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Card>
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 7. ABOUT APP OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function AboutAppOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const openWebview = useMobileStore((s) => s.openWebview);
  const stats = [
    { valueAr: '+1000', valueEn: '+1000', labelAr: 'ظ…ظ†طھط¬', labelEn: 'Products', icon: Package, color: COLORS.teal },
    { valueAr: '+50', valueEn: '+50', labelAr: 'ظ…طھط¬ط±', labelEn: 'Stores', icon: MapPin, color: COLORS.purple },
    { valueAr: '+5000', valueEn: '+5000', labelAr: 'ظ…ط³طھط®ط¯ظ…', labelEn: 'Users', icon: User, color: COLORS.success },
  ];

  const socialLinks = [
    { nameAr: 'ظپظٹط³ط¨ظˆظƒ', nameEn: 'Facebook', color: '#1877F2', bg: 'rgba(24,119,242,0.1)', href: 'https://facebook.com/nabdalmadina', iconPath: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { nameAr: 'ط§ظ†ط³طھط؛ط±ط§ظ…', nameEn: 'Instagram', color: '#E4405F', bg: 'rgba(228,64,95,0.1)', href: 'https://instagram.com/nabdalmadina', iconPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    { nameAr: 'ظˆط§طھط³ط§ط¨', nameEn: 'WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.1)', href: 'https://wa.me/218911234567', iconPath: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z' },
    { nameAr: 'ظٹظˆطھظٹظˆط¨', nameEn: 'YouTube', color: '#FF0000', bg: 'rgba(255,0,0,0.1)', href: 'https://youtube.com/@nabdalmadina', iconPath: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z' },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'ط¹ظ† ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©' : 'About Nabd Al-Madina'}
      subtitle={isRTL ? 'ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„طھط·ط¨ظٹظ‚' : 'App information'}
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
        {/* Logo Card */}
        <Card darkMode={darkMode}>
          <div className="p-6 flex flex-col items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,168,204,0.15) 0%, transparent 70%)', filter: 'blur(8px)' }} />
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10" style={{ background: GRADIENT_BUTTON, boxShadow: '0 8px 32px rgba(0,75,99,0.3)' }}>
                <span className="text-white text-3xl font-black">N</span>
              </div>
            </div>
            <h2 className="text-xl font-bold mt-4" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
              {isRTL ? 'ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©' : 'Nabd Al-Madina'}
            </h2>
            <span className="text-xs mt-1.5 px-3 py-1 rounded-lg font-bold" style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6', color: darkMode ? '#6B7280' : '#9CA3AF' }}>v{APP_VERSION}</span>
            <p className="text-sm text-center mt-3 leading-relaxed max-w-xs" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
              {isRTL
                ? 'ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط© ظ‡ظˆ ظ…طھط¬ط±ظƒ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ ط§ظ„ط£ظˆظ„ ظپظٹ ظ„ظٹط¨ظٹط§. ظ†ظˆظپط± ظ„ظƒ طھط¬ط±ط¨ط© طھط³ظˆظ‚ ظپط±ظٹط¯ط© ظ…ط¹ طھط´ظƒظٹظ„ط© ظˆط§ط³ط¹ط© ظ…ظ† ط§ظ„ظ…ظ†طھط¬ط§طھ ط§ظ„ظ…ظ…ظٹط²ط© ظˆطھظˆطµظٹظ„ ط³ط±ظٹط¹ ظˆط¢ظ…ظ† ظ„ط¬ظ…ظٹط¹ ط§ظ„ظ…ظ†ط§ط·ظ‚.'
                : 'Nabd Al-Madina is your first online store in Libya. We provide a unique shopping experience with a wide range of premium products and fast, secure delivery to all areas.'}
            </p>
          </div>
        </Card>

        {/* Stats */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center p-3 rounded-xl"
                    style={{ background: darkMode ? COLORS.darkSubtle : '#F4F7F9' }}
                  >
                    <Icon size={18} style={{ color: stat.color }} />
                    <p className="text-base font-bold mt-1.5" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                      {isRTL ? stat.valueAr : stat.valueEn}
                    </p>
                    <p className="text-[10px]" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                      {isRTL ? stat.labelAr : stat.labelEn}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-3 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'طھط§ط¨ط¹ظ†ط§' : 'Follow Us'}
            </label>
            <div className="flex items-center justify-around">
              {socialLinks.map((social, i) => {
                const isWhatsApp = social.href.includes('wa.me');
                const title = isRTL ? social.nameAr : social.nameEn;
                return isWhatsApp ? (
                  <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform hover:scale-110" style={{ background: social.bg }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={social.color}><path d={social.iconPath} /></svg>
                  </a>
                ) : (
                  <button key={i} type="button" onClick={() => openWebview(social.href, title)} className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform hover:scale-110" style={{ background: social.bg }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={social.color}><path d={social.iconPath} /></svg>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Developer Card */}
        <Card darkMode={darkMode}>
          <div className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)', boxShadow: '0 4px 16px rgba(0,75,99,0.3)' }}>
              <span className="text-white text-lg font-black">B</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                {isRTL ? 'طھط·ظˆظٹط± Bits ظ„ظ„ط¨ط±ظ…ط¬ظٹط§طھ' : 'Bits Software Development'}
              </h4>
              <p className="text-[10px] mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                {isRTL ? 'طھطµظ…ظٹظ… ظˆطھط·ظˆظٹط± ط§ظ„ط¨ط±ظ…ط¬ظٹط§طھ ظˆط§ظ„طھط·ط¨ظٹظ‚ط§طھ' : 'Software & App Design & Development'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <a href="https://wa.me/218911234567" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,211,102,0.1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
              </a>
              <a href="mailto:info@bits-dev.com" className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,75,99,0.08)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={darkMode ? '#00C4E8' : '#004B63'}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
              </a>
            </div>
          </div>
        </Card>

        {/* Made in Libya */}
        <motion.div variants={staggerItem} className="flex flex-col items-center py-3">
          <p className="text-[10px] font-bold" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
            {isRTL ? 'طµظڈظ†ط¹ ط¨ظ€ â‌¤ï¸ڈ ظپظٹ ظ„ظٹط¨ظٹط§' : 'Made with â‌¤ï¸ڈ in Libya'}
          </p>
          <p className="text-[9px] mt-1" style={{ color: darkMode ? '#374151' : '#D1D5DB' }}>
            آ© 2024 {isRTL ? 'ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©' : 'Nabd Al-Madina'}. {isRTL ? 'ط¬ظ…ظٹط¹ ط§ظ„ط­ظ‚ظˆظ‚ ظ…ط­ظپظˆط¸ط©' : 'All rights reserved'}.
          </p>
          <p className="text-[9px] mt-0.5" style={{ color: darkMode ? '#374151' : '#D1D5DB' }}>
            {isRTL ? 'طھط·ظˆظٹط±: Bits ظ„ظ„ط¨ط±ظ…ط¬ظٹط§طھ' : 'Developed by: Bits Software'}
          </p>
        </motion.div>
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 8. LICENSES OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function LicensesOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const [expandedLib, setExpandedLib] = useState<number | null>(null);

  const libraries = [
    { name: 'React', license: 'MIT', version: '18.x', description: isRTL ? 'ظ…ظƒطھط¨ط© ظˆط§ط¬ظ‡ط© ط§ظ„ظ…ط³طھط®ط¯ظ…' : 'UI component library' },
    { name: 'Next.js', license: 'MIT', version: '16.x', description: isRTL ? 'ط¥ط·ط§ط± ط¹ظ…ظ„ ط§ظ„ظˆظٹط¨' : 'Web framework' },
    { name: 'TypeScript', license: 'Apache-2.0', version: '5.x', description: isRTL ? 'ظ„ط؛ط© ط¨ط±ظ…ط¬ط© ظ…ظƒطھظˆط¨ط©' : 'Typed programming language' },
    { name: 'Tailwind CSS', license: 'MIT', version: '4.x', description: isRTL ? 'ط¥ط·ط§ط± ط¹ظ…ظ„ CSS' : 'CSS framework' },
    { name: 'Framer Motion', license: 'MIT', version: '11.x', description: isRTL ? 'ظ…ظƒطھط¨ط© ط§ظ„ط­ط±ظƒط§طھ ظˆط§ظ„ط§ظ†طھظ‚ط§ظ„ط§طھ' : 'Animation library' },
    { name: 'Zustand', license: 'MIT', version: '4.x', description: isRTL ? 'ظ…ظƒطھط¨ط© ط¥ط¯ط§ط±ط© ط§ظ„ط­ط§ظ„ط©' : 'State management' },
    { name: 'Lucide React', license: 'ISC', version: '0.x', description: isRTL ? 'ظ…ظƒطھط¨ط© ط§ظ„ط£ظٹظ‚ظˆظ†ط§طھ' : 'Icon library' },
    { name: 'Prisma', license: 'Apache-2.0', version: '5.x', description: isRTL ? 'ط£ط¯ط§ط© ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ ORM' : 'Database ORM' },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'طھط±ط§ط®ظٹطµ ط§ظ„ظ…طµط§ط¯ط± ط§ظ„ظ…ظپطھظˆط­ط©' : 'Open Source Licenses'}
      subtitle={isRTL ? 'ط§ظ„ظ…ظƒطھط¨ط§طھ ط§ظ„ظ…ط³طھط®ط¯ظ…ط© ظپظٹ ط§ظ„طھط·ط¨ظٹظ‚' : 'Libraries used in the app'}
      direction={direction}
      isRTL={isRTL}
      darkMode={darkMode}
    >
      <motion.div
        className="space-y-2.5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {libraries.map((lib, i) => {
          const isExpanded = expandedLib === i;
          return (
            <Card key={lib.name} darkMode={darkMode}>
              <motion.button
                whileTap={{ scale: 0.995 }}
                onClick={() => setExpandedLib(isExpanded ? null : i)}
                className="w-full p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))' }}>
                    <FileText size={16} style={{ color: COLORS.teal }} />
                  </div>
                  <div className="flex-1 min-w-0 text-start">
                    <p className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>{lib.name}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                      v{lib.version} آ· {lib.license}
                    </p>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                    <ChevronDown size={16} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
                  </motion.div>
                </div>
              </motion.button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 ps-17">
                      <div className="p-3 rounded-xl text-xs leading-relaxed" style={{ background: darkMode ? COLORS.darkSubtle : '#F4F7F9', color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                        <p className="font-semibold mb-1" style={{ color: darkMode ? '#D1D5DB' : '#4B5563' }}>
                          {isRTL ? 'ط§ظ„ظˆطµظپ:' : 'Description:'} {lib.description}
                        </p>
                        <p>
                          {isRTL
                            ? `ظ‡ط°ظ‡ ط§ظ„ظ…ظƒطھط¨ط© ظ…ط±ط®طµط© طھط­طھ ط±ط®طµط© ${lib.license}. ظٹط±ط¬ظ‰ ط§ظ„ط§ط·ظ„ط§ط¹ ط¹ظ„ظ‰ ط§ظ„ط±ط®طµط© ط§ظ„ط£طµظ„ظٹط© ظ„ظ„طھظپط§طµظٹظ„ ط§ظ„ظƒط§ظ…ظ„ط©.`
                            : `This library is licensed under the ${lib.license} license. Please see the original license for full details.`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 9. PRIVACY POLICY OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function PrivacyPolicyOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const sections = [
    {
      titleAr: 'ط¬ظ…ط¹ ط§ظ„ط¨ظٹط§ظ†ط§طھ',
      titleEn: 'Data Collection',
      contentAr: 'ظ†ط¬ظ…ط¹ ط¨ظٹط§ظ†ط§طھ ط£ط³ط§ط³ظٹط© ظ„طھط­ط³ظٹظ† طھط¬ط±ط¨طھظƒ ظ…ط¹ ط§ظ„طھط·ط¨ظٹظ‚طŒ ط¨ظ…ط§ ظپظٹ ط°ظ„ظƒ: ط§ظ„ط§ط³ظ…طŒ ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپطŒ ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹطŒ ط¹ظ†ط§ظˆظٹظ† ط§ظ„طھظˆطµظٹظ„طŒ ظˆط³ط¬ظ„ ط§ظ„ط·ظ„ط¨ط§طھ. ظ„ط§ ظ†ط¬ظ…ط¹ ط£ظٹ ط¨ظٹط§ظ†ط§طھ ط­ط³ط§ط³ط© ط¨ط¯ظˆظ† ظ…ظˆط§ظپظ‚طھظƒ ط§ظ„طµط±ظٹط­ط©.',
      contentEn: 'We collect basic data to improve your experience with the app, including: name, phone number, email, delivery addresses, and order history. We do not collect any sensitive data without your explicit consent.',
    },
    {
      titleAr: 'ط§ط³طھط®ط¯ط§ظ… ط§ظ„ط¨ظٹط§ظ†ط§طھ',
      titleEn: 'Data Usage',
      contentAr: 'ظ†ط³طھط®ط¯ظ… ط¨ظٹط§ظ†ط§طھظƒ ظ„ظ…ط¹ط§ظ„ط¬ط© ط§ظ„ط·ظ„ط¨ط§طھطŒ طھط­ط³ظٹظ† ط®ط¯ظ…ط§طھظ†ط§طŒ ط§ظ„طھظˆط§طµظ„ ظ…ط¹ظƒ ط¨ط®طµظˆطµ ط·ظ„ط¨ط§طھظƒطŒ ظˆط¥ط±ط³ط§ظ„ ط¹ط±ظˆط¶ ظ…ط®طµطµط©. ظ„ظ† ظ†ط¨ظٹط¹ ط¨ظٹط§ظ†ط§طھظƒ ط§ظ„ط´ط®طµظٹط© ظ„ط£ظٹ ط·ط±ظپ ط«ط§ظ„ط« طھط­طھ ط£ظٹ ط¸ط±ظپ.',
      contentEn: 'We use your data to process orders, improve our services, communicate with you about your orders, and send personalized offers. We will never sell your personal data to any third party under any circumstances.',
    },
    {
      titleAr: 'ط­ظ…ط§ظٹط© ط§ظ„ط¨ظٹط§ظ†ط§طھ',
      titleEn: 'Data Protection',
      contentAr: 'ظ†طھط®ط° ط¥ط¬ط±ط§ط،ط§طھ ط£ظ…ظ†ظٹط© ظ…طھظ‚ط¯ظ…ط© ظ„ط­ظ…ط§ظٹط© ط¨ظٹط§ظ†ط§طھظƒطŒ ط¨ظ…ط§ ظپظٹ ط°ظ„ظƒ ط§ظ„طھط´ظپظٹط±طŒ ط¬ط¯ط±ط§ظ† ط§ظ„ط­ظ…ط§ظٹط©طŒ ظˆط§ظ„ظ…ط±ط§ظ‚ط¨ط© ط§ظ„ظ…ط³طھظ…ط±ط©. ظ†ظ„طھط²ظ… ط¨ط£ط¹ظ„ظ‰ ظ…ط¹ط§ظٹظٹط± ط§ظ„ط£ظ…ط§ظ† ظ„ط­ظ…ط§ظٹط© ظ…ط¹ظ„ظˆظ…ط§طھظƒ ط§ظ„ط´ط®طµظٹط© ظˆط§ظ„ظ…ط§ظ„ظٹط©.',
      contentEn: 'We take advanced security measures to protect your data, including encryption, firewalls, and continuous monitoring. We adhere to the highest security standards to protect your personal and financial information.',
    },
    {
      titleAr: 'ظ…ظ„ظپط§طھ طھط¹ط±ظٹظپ ط§ظ„ط§ط±طھط¨ط§ط·',
      titleEn: 'Cookies',
      contentAr: 'ظ†ط³طھط®ط¯ظ… ظ…ظ„ظپط§طھ طھط¹ط±ظٹظپ ط§ظ„ط§ط±طھط¨ط§ط· (ط§ظ„ظƒظˆظƒظٹط²) ظ„طھط­ط³ظٹظ† ط£ط¯ط§ط، ط§ظ„طھط·ط¨ظٹظ‚ ظˆطھط®طµظٹطµ طھط¬ط±ط¨طھظƒ. ظٹظ…ظƒظ†ظƒ ط§ظ„طھط­ظƒظ… ظپظٹ ط¥ط¹ط¯ط§ط¯ط§طھ ط§ظ„ظƒظˆظƒظٹط² ظ…ظ† ظ…طھطµظپط­ظƒ. ط¨ط¹ط¶ ط§ظ„ظƒظˆظƒظٹط² ط¶ط±ظˆط±ظٹط© ظ„ط¹ظ…ظ„ ط§ظ„طھط·ط¨ظٹظ‚ ط¨ط´ظƒظ„ طµط­ظٹط­.',
      contentEn: 'We use cookies to improve app performance and personalize your experience. You can control cookie settings from your browser. Some cookies are essential for the app to function properly.',
    },
    {
      titleAr: 'ط­ظ‚ظˆظ‚ ط§ظ„ظ…ط³طھط®ط¯ظ…',
      titleEn: 'User Rights',
      contentAr: 'ظ„ط¯ظٹظƒ ط§ظ„ط­ظ‚ ظپظٹ ط§ظ„ظˆطµظˆظ„ ط¥ظ„ظ‰ ط¨ظٹط§ظ†ط§طھظƒطŒ ط·ظ„ط¨ طھط¹ط¯ظٹظ„ظ‡ط§ ط£ظˆ ط­ط°ظپظ‡ط§طŒ ظˆط§ظ„ط§ط¹طھط±ط§ط¶ ط¹ظ„ظ‰ ظ…ط¹ط§ظ„ط¬طھظ‡ط§. ظٹظ…ظƒظ†ظƒ ط£ظٹط¶ط§ظ‹ ط³ط­ط¨ ظ…ظˆط§ظپظ‚طھظƒ ظپظٹ ط£ظٹ ظˆظ‚طھ. ظ„طھط·ط¨ظٹظ‚ ط£ظٹ ظ…ظ† ظ‡ط°ظ‡ ط§ظ„ط­ظ‚ظˆظ‚طŒ ظٹط±ط¬ظ‰ ط§ظ„طھظˆط§طµظ„ ظ…ط¹ظ†ط§.',
      contentEn: 'You have the right to access your data, request modification or deletion, and object to its processing. You can also withdraw your consent at any time. To exercise any of these rights, please contact us.',
    },
    {
      titleAr: 'ط§ظ„ط§طھطµط§ظ„ ط¨ظ†ط§',
      titleEn: 'Contact Us',
      contentAr: 'ط¥ط°ط§ ظƒط§ظ† ظ„ط¯ظٹظƒ ط£ظٹ ط£ط³ط¦ظ„ط© ط­ظˆظ„ ط³ظٹط§ط³ط© ط§ظ„ط®طµظˆطµظٹط© ط£ظˆ ظƒظٹظپظٹط© طھط¹ط§ظ…ظ„ظ†ط§ ظ…ط¹ ط¨ظٹط§ظ†ط§طھظƒطŒ ظٹظ…ظƒظ†ظƒ ط§ظ„طھظˆط§طµظ„ ظ…ط¹ظ†ط§ ط¹ط¨ط±: ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ: support@nabd.ly ط£ظˆ ط§ظ„ظ‡ط§طھظپ: +218 91 000 0000',
      contentEn: 'If you have any questions about our privacy policy or how we handle your data, you can contact us via: Email: support@nabd.ly or Phone: +218 91 000 0000',
    },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'ط³ظٹط§ط³ط© ط§ظ„ط®طµظˆطµظٹط©' : 'Privacy Policy'}
      subtitle={isRTL ? 'ظƒظٹظپ ظ†ط­ظ…ظٹ ط¨ظٹط§ظ†ط§طھظƒ' : 'How we protect your data'}
      direction={direction}
      isRTL={isRTL}
      darkMode={darkMode}
    >
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Last updated */}
        <motion.div variants={staggerItem} className="flex items-center gap-2 px-1 mb-1">
          <Clock size={12} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />
          <span className="text-[10px]" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
            {isRTL ? 'ط¢ط®ط± طھط­ط¯ظٹط«: ظٹظ†ط§ظٹط± 2024' : 'Last updated: January 2024'}
          </span>
        </motion.div>

        {sections.map((section, i) => (
          <Card key={i} darkMode={darkMode}>
            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))' }}>
                  <Shield size={14} style={{ color: COLORS.teal }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  {isRTL ? section.titleAr : section.titleEn}
                </h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                {isRTL ? section.contentAr : section.contentEn}
              </p>
            </div>
          </Card>
        ))}
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 10. TERMS OF SERVICE OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function TermsOfServiceOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const sections = [
    {
      titleAr: 'ط§ظ„ظ‚ط¨ظˆظ„',
      titleEn: 'Acceptance',
      contentAr: 'ط¨ط§ط³طھط®ط¯ط§ظ… طھط·ط¨ظٹظ‚ ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط©طŒ ظپط¥ظ†ظƒ طھظˆط§ظپظ‚ ط¹ظ„ظ‰ ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط· ظˆط§ظ„ط£ط­ظƒط§ظ…. ط¥ط°ط§ ظƒظ†طھ ظ„ط§ طھظˆط§ظپظ‚ ط¹ظ„ظ‰ ط£ظٹ ط¬ط²ط، ظ…ظ† ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط·طŒ ظٹط±ط¬ظ‰ ط¹ط¯ظ… ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھط·ط¨ظٹظ‚. ط§ط³طھظ…ط±ط§ط±ظƒ ظپظٹ ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھط·ط¨ظٹظ‚ ظٹط¹ظ†ظٹ ظ‚ط¨ظˆظ„ظƒ ظ„ط£ظٹ طھط¹ط¯ظٹظ„ط§طھ ط¹ظ„ظ‰ ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط·.',
      contentEn: 'By using the Nabd Al-Madina app, you agree to these terms and conditions. If you do not agree with any part of these terms, please do not use the app. Your continued use of the app means you accept any changes to these terms.',
    },
    {
      titleAr: 'ط§ظ„ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظ…ط³ظ…ظˆط­',
      titleEn: 'Permitted Use',
      contentAr: 'ظٹظڈط³ظ…ط­ ظ„ظƒ ط¨ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھط·ط¨ظٹظ‚ ظ„ط£ط؛ط±ط§ط¶ ط§ظ„طھط³ظˆظ‚ ط§ظ„ط´ط±ط¹ظٹط© ظپظ‚ط·. ظٹظڈط­ط¸ط± ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھط·ط¨ظٹظ‚ ظ„ط£ظٹ ط£ط؛ط±ط§ط¶ ط؛ظٹط± ظ‚ط§ظ†ظˆظ†ظٹط© ط£ظˆ ط§ط­طھظٹط§ظ„ظٹط© ط£ظˆ ط¶ط§ط±ط©. ظٹط¬ط¨ ط¹ظ„ظٹظƒ ط§ظ„ط§ظ„طھط²ط§ظ… ط¨ط¬ظ…ظٹط¹ ط§ظ„ظ‚ظˆط§ظ†ظٹظ† ظˆط§ظ„ظ„ظˆط§ط¦ط­ ط§ظ„ظ…ط¹ظ…ظˆظ„ ط¨ظ‡ط§ ط¹ظ†ط¯ ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھط·ط¨ظٹظ‚.',
      contentEn: 'You are allowed to use the app for legitimate shopping purposes only. It is prohibited to use the app for any illegal, fraudulent, or harmful purposes. You must comply with all applicable laws and regulations when using the app.',
    },
    {
      titleAr: 'ط§ظ„ط­ط³ط§ط¨ط§طھ',
      titleEn: 'Accounts',
      contentAr: 'ط£ظ†طھ ظ…ط³ط¤ظˆظ„ ط¹ظ† ط§ظ„ط­ظپط§ط¸ ط¹ظ„ظ‰ ط³ط±ظٹط© ظ…ط¹ظ„ظˆظ…ط§طھ ط­ط³ط§ط¨ظƒ ظˆظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط®ط§طµط© ط¨ظƒ. ظٹط¬ط¨ ط¹ظ„ظٹظƒ ط¥ط¨ظ„ط§ط؛ظ†ط§ ظپظˆط±ط§ظ‹ ط¹ظ† ط£ظٹ ط§ط³طھط®ط¯ط§ظ… ط؛ظٹط± ظ…طµط±ط­ ظ„ط­ط³ط§ط¨ظƒ. ظ„ط³ظ†ط§ ظ…ط³ط¤ظˆظ„ظٹظ† ط¹ظ† ط£ظٹ ط®ط³ط§ط¦ط± ظ†ط§طھط¬ط© ط¹ظ† ط¥ط³ط§ط،ط© ط§ط³طھط®ط¯ط§ظ… ط­ط³ط§ط¨ظƒ.',
      contentEn: 'You are responsible for maintaining the confidentiality of your account information and password. You must notify us immediately of any unauthorized use of your account. We are not responsible for any losses resulting from misuse of your account.',
    },
    {
      titleAr: 'ط§ظ„ظ…ظ„ظƒظٹط© ط§ظ„ظپظƒط±ظٹط©',
      titleEn: 'Intellectual Property',
      contentAr: 'ط¬ظ…ظٹط¹ ط§ظ„ظ…ط­طھظˆظ‰ ظپظٹ ط§ظ„طھط·ط¨ظٹظ‚طŒ ط¨ظ…ط§ ظپظٹ ط°ظ„ظƒ ط§ظ„ظ†طµظˆطµ ظˆط§ظ„طµظˆط± ظˆط§ظ„ط´ط¹ط§ط±ط§طھ ظˆط§ظ„طھطµظ…ظٹظ…طŒ ظ‡ظˆ ظ…ظ„ظƒ ظ„ظ†ط¨ط¶ ط§ظ„ظ…ط¯ظٹظ†ط© ط£ظˆ ظ…ط±ط®طµ ظ„ظ‡. ظ„ط§ ظٹط¬ظˆط² ظ„ظƒ ظ†ط³ط® ط£ظˆ طھط¹ط¯ظٹظ„ ط£ظˆ طھظˆط²ظٹط¹ ط£ظٹ ظ…ط­طھظˆظ‰ ظ…ظ† ط§ظ„طھط·ط¨ظٹظ‚ ط¨ط¯ظˆظ† ط¥ط°ظ† ظƒطھط§ط¨ظٹ ظ…ط³ط¨ظ‚.',
      contentEn: 'All content in the app, including text, images, logos, and design, is owned by or licensed to Nabd Al-Madina. You may not copy, modify, or distribute any content from the app without prior written permission.',
    },
    {
      titleAr: 'ط¥ط®ظ„ط§ط، ط§ظ„ظ…ط³ط¤ظˆظ„ظٹط©',
      titleEn: 'Disclaimer',
      contentAr: 'ظ†ط¨ط°ظ„ ظ‚طµط§ط±ظ‰ ط¬ظ‡ط¯ظ†ط§ ظ„ط¶ظ…ط§ظ† ط¯ظ‚ط© ط§ظ„ظ…ط¹ظ„ظˆظ…ط§طھ ظپظٹ ط§ظ„طھط·ط¨ظٹظ‚طŒ ظ„ظƒظ†ظ†ط§ ظ„ط§ ظ†ط¶ظ…ظ† ط¯ظ‚ط© ط£ظˆ ط§ظƒطھظ…ط§ظ„ ط£ظˆ ظ…ظˆط«ظˆظ‚ظٹط© ط£ظٹ ظ…ط­طھظˆظ‰. ظ†ط­ظ† ظ„ط§ ظ†ظƒظˆظ† ظ…ط³ط¤ظˆظ„ظٹظ† ط¹ظ† ط£ظٹ ط£ط¶ط±ط§ط± ظ…ط¨ط§ط´ط±ط© ط£ظˆ ط؛ظٹط± ظ…ط¨ط§ط´ط±ط© ظ†ط§طھط¬ط© ط¹ظ† ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھط·ط¨ظٹظ‚.',
      contentEn: 'We make our best effort to ensure the accuracy of information in the app, but we do not guarantee the accuracy, completeness, or reliability of any content. We are not liable for any direct or indirect damages resulting from the use of the app.',
    },
    {
      titleAr: 'ط§ظ„طھط¹ط¯ظٹظ„ط§طھ',
      titleEn: 'Modifications',
      contentAr: 'ظ†ط­طھظپط¸ ط¨ط§ظ„ط­ظ‚ ظپظٹ طھط¹ط¯ظٹظ„ ظ‡ط°ظ‡ ط§ظ„ط´ط±ظˆط· ظˆط§ظ„ط£ط­ظƒط§ظ… ظپظٹ ط£ظٹ ظˆظ‚طھ. ط³ظٹطھظ… ط¥ط®ط·ط§ط±ظƒ ط¨ط£ظٹ طھط؛ظٹظٹط±ط§طھ ط¬ظˆظ‡ط±ظٹط©. ط§ط³طھظ…ط±ط§ط±ظƒ ظپظٹ ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھط·ط¨ظٹظ‚ ط¨ط¹ط¯ ط§ظ„طھط¹ط¯ظٹظ„ط§طھ ظٹط¹ظ†ظٹ ظ‚ط¨ظˆظ„ظƒ ظ„ظ„ط´ط±ظˆط· ط§ظ„ظ…ط¹ط¯ظ„ط©.',
      contentEn: 'We reserve the right to modify these terms and conditions at any time. You will be notified of any material changes. Your continued use of the app after modifications means you accept the revised terms.',
    },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'ط§ظ„ط´ط±ظˆط· ظˆط§ظ„ط£ط­ظƒط§ظ…' : 'Terms of Service'}
      subtitle={isRTL ? 'ط´ط±ظˆط· ط§ط³طھط®ط¯ط§ظ… ط§ظ„طھط·ط¨ظٹظ‚' : 'App usage terms'}
      direction={direction}
      isRTL={isRTL}
      darkMode={darkMode}
    >
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Last updated */}
        <motion.div variants={staggerItem} className="flex items-center gap-2 px-1 mb-1">
          <Clock size={12} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />
          <span className="text-[10px]" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
            {isRTL ? 'ط¢ط®ط± طھط­ط¯ظٹط«: ظٹظ†ط§ظٹط± 2024' : 'Last updated: January 2024'}
          </span>
        </motion.div>

        {sections.map((section, i) => (
          <Card key={i} darkMode={darkMode}>
            <div className="p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  background: i % 2 === 0
                    ? 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))'
                    : 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))'
                }}>
                  <FileText size={14} style={{ color: i % 2 === 0 ? COLORS.teal : COLORS.purple }} />
                </div>
                <h3 className="text-sm font-bold" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                  {isRTL ? section.titleAr : section.titleEn}
                </h3>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                {isRTL ? section.contentAr : section.contentEn}
              </p>
            </div>
          </Card>
        ))}
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 11. HELP CENTER OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function HelpCenterOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      qAr: 'ظƒظٹظپظٹط© ط§ظ„ط·ظ„ط¨طں',
      qEn: 'How to place an order?',
      aAr: 'ظ„طھظ‚ط¯ظٹظ… ط·ظ„ط¨طŒ طھطµظپط­ ط§ظ„ظ…ظ†طھط¬ط§طھ ظˆط£ط¶ظپ ظ…ط§ طھط±ظٹط¯ ط¥ظ„ظ‰ ط³ظ„ط© ط§ظ„طھط³ظˆظ‚. ط«ظ… ط§ظ†طھظ‚ظ„ ط¥ظ„ظ‰ ط§ظ„ط³ظ„ط© ظˆط±ط§ط¬ط¹ ط·ظ„ط¨ظƒ ظˆط§ط¶ط؛ط· ط¹ظ„ظ‰ "ط¥طھظ…ط§ظ… ط§ظ„ط´ط±ط§ط،". ط£ط¯ط®ظ„ ط¹ظ†ظˆط§ظ† ط§ظ„طھظˆطµظٹظ„ ظˆط§ط®طھط± ط·ط±ظٹظ‚ط© ط§ظ„ط¯ظپط¹ ط«ظ… ط£ظƒط¯ ط§ظ„ط·ظ„ط¨. ط³ظ†طھظˆط§طµظ„ ظ…ط¹ظƒ ظ„طھط£ظƒظٹط¯ ط§ظ„ط·ظ„ط¨.',
      aEn: 'To place an order, browse products and add what you want to the shopping cart. Then go to the cart, review your order, and tap "Checkout". Enter the delivery address, choose a payment method, and confirm the order. We will contact you to confirm the order.',
    },
    {
      qAr: 'ظƒظٹظپظٹط© ط§ظ„طھطھط¨ط¹طں',
      qEn: 'How to track my order?',
      aAr: 'ظٹظ…ظƒظ†ظƒ طھطھط¨ط¹ ط·ظ„ط¨ظƒ ظ…ظ† ظ‚ط³ظ… "ط·ظ„ط¨ط§طھظٹ" ظپظٹ ط­ط³ط§ط¨ظƒ. ط³طھط¬ط¯ ظ‡ظ†ط§ظƒ ط­ط§ظ„ط© ط§ظ„ط·ظ„ط¨ ط§ظ„ط­ط§ظ„ظٹط© ظˆطھظپط§طµظٹظ„ ط§ظ„طھطھط¨ط¹. ظƒظ…ط§ ط³طھطµظ„ظƒ ط¥ط´ط¹ط§ط±ط§طھ ط¹ط¨ط± ط§ظ„طھط·ط¨ظٹظ‚ ظˆط§ظ„ط±ط³ط§ط¦ظ„ ط§ظ„ظ†طµظٹط© ط¹ظ†ط¯ طھط­ط¯ظٹط« ط­ط§ظ„ط© ط·ظ„ط¨ظƒ.',
      aEn: 'You can track your order from the "My Orders" section in your account. You will find the current order status and tracking details there. You will also receive notifications via the app and SMS when your order status is updated.',
    },
    {
      qAr: 'ط³ظٹط§ط³ط© ط§ظ„ط§ط³طھط±ط¬ط§ط¹طں',
      qEn: 'What is the return policy?',
      aAr: 'ظٹظ…ظƒظ†ظƒ ط¥ط±ط¬ط§ط¹ ط§ظ„ظ…ظ†طھط¬ط§طھ ط®ظ„ط§ظ„ 7 ط£ظٹط§ظ… ظ…ظ† ط§ظ„ط§ط³طھظ„ط§ظ… ط¥ط°ط§ ظƒط§ظ†طھ ظپظٹ ط­ط§ظ„طھظ‡ط§ ط§ظ„ط£طµظ„ظٹط© ظˆظ„ظ… ظٹطھظ… ط§ط³طھط®ط¯ط§ظ…ظ‡ط§. ط§ظ„ظ…ظ†طھط¬ط§طھ ط§ظ„ظ…ط®طµطµط© ظˆط§ظ„ط؛ط°ط§ط¦ظٹط© ط؛ظٹط± ظ‚ط§ط¨ظ„ط© ظ„ظ„ط¥ط±ط¬ط§ط¹. طھظˆط§طµظ„ ظ…ط¹ظ†ط§ ط¹ط¨ط± ط§ظ„ط¯ط¹ظ… ط§ظ„ظپظ†ظٹ ظ„ط¨ط¯ط، ط¹ظ…ظ„ظٹط© ط§ظ„ط¥ط±ط¬ط§ط¹.',
      aEn: 'You can return products within 7 days of delivery if they are in their original condition and have not been used. Customized and food products are non-returnable. Contact us via support to start the return process.',
    },
    {
      qAr: 'ط·ط±ظ‚ ط§ظ„ط¯ظپط¹طں',
      qEn: 'What payment methods are available?',
      aAr: 'ط­ط§ظ„ظٹط§ظ‹ ظ†ظˆظپط± ط§ظ„ط¯ظپط¹ ط¹ظ†ط¯ ط§ظ„ط§ط³طھظ„ط§ظ… ظƒط·ط±ظٹظ‚ط© ط¯ظپط¹ ط£ط³ط§ط³ظٹط©. ظ†ط¹ظ…ظ„ ط¹ظ„ظ‰ ط¥ط¶ط§ظپط© ط·ط±ظ‚ ط¯ظپط¹ ط¥ظ„ظƒطھط±ظˆظ†ظٹط© ظ…ط«ظ„ ط§ظ„ط¨ط·ط§ظ‚ط§طھ ط§ظ„ط¨ظ†ظƒظٹط© ظˆط§ظ„ظ…ط­ظپط¸ط© ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط© ظ‚ط±ظٹط¨ط§ظ‹. طھط§ط¨ط¹ ط§ظ„طھط­ط¯ظٹط«ط§طھ!',
      aEn: 'Currently, we offer Cash on Delivery as the primary payment method. We are working on adding electronic payment methods like bank cards and e-wallets soon. Stay tuned for updates!',
    },
    {
      qAr: 'ط§ظ„طھظˆطµظٹظ„طں',
      qEn: 'How does delivery work?',
      aAr: 'ظ†ظˆظپط± ط§ظ„طھظˆطµظٹظ„ ظ„ط¬ظ…ظٹط¹ ظ…ظ†ط§ط·ظ‚ ظ„ظٹط¨ظٹط§. ظ…ط¯ط© ط§ظ„طھظˆطµظٹظ„ طھطھط±ط§ظˆط­ ط¨ظٹظ† 1-5 ط£ظٹط§ظ… ط¹ظ…ظ„ ط­ط³ط¨ ط§ظ„ظ…ظ†ط·ظ‚ط©. ط±ط³ظˆظ… ط§ظ„طھظˆطµظٹظ„ طھط¹طھظ…ط¯ ط¹ظ„ظ‰ ط§ظ„ظ…ظ†ط·ظ‚ط© ط§ظ„ظ…ط®طھط§ط±ط©. ظٹظ…ظƒظ†ظƒ ط§ط®طھظٹط§ط± ط¹ظ†ظˆط§ظ† ط§ظ„طھظˆطµظٹظ„ ط¹ظ†ط¯ ط¥طھظ…ط§ظ… ط§ظ„ط´ط±ط§ط،.',
      aEn: 'We provide delivery to all areas in Libya. Delivery time ranges from 1-5 business days depending on the area. Delivery fee depends on the selected zone. You can choose the delivery address at checkout.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return faq.qAr.includes(q) || faq.qEn.toLowerCase().includes(q) || faq.aAr.includes(q) || faq.aEn.toLowerCase().includes(q);
  });

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'ظ…ط±ظƒط² ط§ظ„ظ…ط³ط§ط¹ط¯ط©' : 'Help Center'}
      subtitle={isRTL ? 'ط£ط³ط¦ظ„ط© ط´ط§ط¦ط¹ط© ظˆظ…ط³ط§ط¹ط¯ط©' : 'FAQs & support'}
      direction={direction}
      isRTL={isRTL}
      darkMode={darkMode}
    >
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Search Bar */}
        <motion.div variants={staggerItem}>
          <div className="relative">
            <Globe size={16} className="absolute top-1/2 -translate-y-1/2 start-3.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'ط§ط¨ط­ط« ظپظٹ ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط´ط§ط¦ط¹ط©...' : 'Search FAQs...'}
              className="w-full ps-10 pe-3.5 py-3 rounded-2xl text-sm focus:outline-none"
              style={{
                background: darkMode ? COLORS.darkCard : '#fff',
                border: `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.06)'}`,
                color: darkMode ? '#F3F4F6' : COLORS.textPrimary,
                boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            />
          </div>
        </motion.div>

        {/* FAQ Items */}
        {filteredFaqs.map((faq, i) => {
          const isExpanded = expandedFaq === i;
          return (
            <Card key={i} darkMode={darkMode}>
              <motion.button
                whileTap={{ scale: 0.995 }}
                onClick={() => setExpandedFaq(isExpanded ? null : i)}
                className="w-full p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.12))' }}>
                    <HelpCircle size={16} style={{ color: COLORS.info }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-start" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                      {isRTL ? faq.qAr : faq.qEn}
                    </p>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 mt-1">
                    <ChevronDown size={16} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
                  </motion.div>
                </div>
              </motion.button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' as const }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 ps-16">
                      <p className="text-xs leading-relaxed" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                        {isRTL ? faq.aAr : faq.aEn}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}

        {filteredFaqs.length === 0 && (
          <motion.div variants={staggerItem} className="flex flex-col items-center py-8">
            <HelpCircle size={40} style={{ color: darkMode ? COLORS.darkBorder : '#D1D5DB' }} />
            <p className="text-sm mt-2" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
              {isRTL ? 'ظ„ط§ طھظˆط¬ط¯ ظ†طھط§ط¦ط¬' : 'No results found'}
            </p>
          </motion.div>
        )}

        {/* Still need help? */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'ظ„ط§ طھط²ط§ظ„ ط¨ط­ط§ط¬ط© ظ„ظ…ط³ط§ط¹ط¯ط©طں' : 'Still need help?'}
            </p>
            <div className="flex items-center gap-2">
              <a href="tel:+218910000000" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(0,168,204,0.08)', color: COLORS.teal }}>
                <Phone size={14} /> {isRTL ? 'ط§طھطµظ„' : 'Call'}
              </a>
              <a href="https://wa.me/218910000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.08)', color: '#16A34A' }}>
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a href="mailto:support@nabd.ly" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(59,130,246,0.08)', color: COLORS.info }}>
                <Mail size={14} /> {isRTL ? 'ط¨ط±ظٹط¯' : 'Email'}
              </a>
            </div>
          </div>
        </Card>
      </motion.div>
    </OverlayWrapper>
  );
}

// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
// 12. CONTACT US OVERLAY
// â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
export function ContactUsOverlay({ onClose, darkMode, isRTL, direction }: {
  onClose: () => void;
  darkMode: boolean;
  isRTL: boolean;
  direction: string;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const contactMethods = [
    {
      icon: Phone,
      gradient: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))',
      iconColor: COLORS.teal,
      titleAr: 'ظ‡ط§طھظپ',
      titleEn: 'Phone',
      value: '+218 91 000 0000',
      href: 'tel:+218910000000',
    },
    {
      icon: MessageCircle,
      gradient: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.12))',
      iconColor: '#16A34A',
      titleAr: 'ظˆط§طھط³ط§ط¨',
      titleEn: 'WhatsApp',
      value: '+218 91 000 0000',
      href: 'https://wa.me/218910000000',
    },
    {
      icon: Mail,
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.12))',
      iconColor: COLORS.info,
      titleAr: 'ط¨ط±ظٹط¯ ط¥ظ„ظƒطھط±ظˆظ†ظٹ',
      titleEn: 'Email',
      value: 'support@nabd.ly',
      href: 'mailto:support@nabd.ly',
    },
    {
      icon: Globe,
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))',
      iconColor: COLORS.purple,
      titleAr: 'ظ…ظˆظ‚ط¹ ط¥ظ„ظƒطھط±ظˆظ†ظٹ',
      titleEn: 'Website',
      value: 'www.nabd.ly',
      href: 'https://nabd.ly',
    },
  ];

  const handleSend = async () => {
    if (!name || !email || !message) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'طھظˆط§طµظ„ ظ…ط¹ظ†ط§' : 'Contact Us'}
      subtitle={isRTL ? 'ظ†ط­ظ† ظ‡ظ†ط§ ظ„ظ…ط³ط§ط¹ط¯طھظƒ' : 'We are here to help'}
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
        {/* Contact Methods */}
        <Card darkMode={darkMode}>
          <div className="divide-y" style={{ borderColor: darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.04)' }}>
            {contactMethods.map((method, i) => {
              const Icon = method.icon;
              return (
                <a
                  key={i}
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 p-4 transition-colors"
                  style={{ borderBottom: i < contactMethods.length - 1 ? `1px solid ${darkMode ? COLORS.darkBorder : 'rgba(0,0,0,0.04)'}` : 'none' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: method.gradient }}>
                    <Icon size={18} style={{ color: method.iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
                      {isRTL ? method.titleAr : method.titleEn}
                    </p>
                    <p className="text-sm font-medium truncate" dir="ltr" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                      {method.value}
                    </p>
                  </div>
                  <ChevronLeft size={16} className={isRTL ? '' : 'rotate-180'} style={{ color: darkMode ? '#4B5563' : '#D1D5DB' }} />
                </a>
              );
            })}
          </div>
        </Card>

        {/* Contact Form */}
        {!sent ? (
          <Card darkMode={darkMode}>
            <div className="p-4 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
                {isRTL ? 'ط£ط±ط³ظ„ ظ„ظ†ط§ ط±ط³ط§ظ„ط©' : 'Send us a message'}
              </p>
              <InputField
                label={isRTL ? 'ط§ظ„ط§ط³ظ…' : 'Name'}
                value={name}
                onChange={setName}
                placeholder={isRTL ? 'ط£ط¯ط®ظ„ ط§ط³ظ…ظƒ' : 'Enter your name'}
                darkMode={darkMode}
                isRTL={isRTL}
                icon={<User size={14} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
              />
              <InputField
                label={isRTL ? 'ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ' : 'Email'}
                value={email}
                onChange={setEmail}
                placeholder="email@example.com"
                type="email"
                darkMode={darkMode}
                isRTL={isRTL}
                dir="ltr"
                icon={<Mail size={14} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
              />
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
                  {isRTL ? 'ط§ظ„ط±ط³ط§ظ„ط©' : 'Message'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isRTL ? 'ط§ظƒطھط¨ ط±ط³ط§ظ„طھظƒ ظ‡ظ†ط§...' : 'Write your message here...'}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                  style={{
                    background: darkMode ? COLORS.darkSubtle : '#F4F7F9',
                    border: `1px solid ${darkMode ? 'transparent' : 'rgba(0,0,0,0.04)'}`,
                    color: darkMode ? '#F3F4F6' : COLORS.textPrimary,
                  }}
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSend}
                disabled={!name || !email || !message || loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: GRADIENT_BUTTON, boxShadow: '0 4px 16px rgba(0,75,99,0.3)' }}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <Send size={16} />
                    {isRTL ? 'ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©' : 'Send Message'}
                  </>
                )}
              </motion.button>
            </div>
          </Card>
        ) : (
          <Card darkMode={darkMode}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' as const, stiffness: 400, damping: 15 }}
                className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                style={{ background: `${COLORS.success}15` }}
              >
                <CheckCircle2 size={32} style={{ color: COLORS.success }} />
              </motion.div>
              <h3 className="text-base font-bold mb-1.5" style={{ color: darkMode ? '#F3F4F6' : COLORS.textPrimary }}>
                {isRTL ? 'طھظ… ط¥ط±ط³ط§ظ„ ط±ط³ط§ظ„طھظƒ!' : 'Message sent!'}
              </h3>
              <p className="text-xs text-center max-w-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                {isRTL ? 'ط³ظ†طھظˆط§طµظ„ ظ…ط¹ظƒ ظپظٹ ط£ظ‚ط±ط¨ ظˆظ‚طھ ظ…ظ…ظƒظ†. ط´ظƒط±ط§ظ‹ ظ„طھظˆط§طµظ„ظƒ ظ…ط¹ظ†ط§!' : 'We will get back to you as soon as possible. Thank you for reaching out!'}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }}
                className="mt-4 px-6 py-2 rounded-xl text-xs font-bold"
                style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6', color: darkMode ? '#9CA3AF' : '#6B7280' }}
              >
                {isRTL ? 'ط¥ط±ط³ط§ظ„ ط±ط³ط§ظ„ط© ط£ط®ط±ظ‰' : 'Send another message'}
              </motion.button>
            </motion.div>
          </Card>
        )}
      </motion.div>
    </OverlayWrapper>
  );
}

