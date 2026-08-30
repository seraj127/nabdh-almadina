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
      title={isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile'}
      subtitle={isRTL ? 'تحديث بياناتك الشخصية' : 'Update your personal info'}
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
              {isRTL ? 'اضغط لتغيير الصورة' : 'Tap to change photo'}
            </p>
          </div>
        </Card>

        {/* Editable Fields */}
        <Card darkMode={darkMode}>
          <div className="p-4 space-y-4">
            <InputField
              label={isRTL ? 'الاسم بالعربية' : 'Arabic Name'}
              value={nameAr}
              onChange={setNameAr}
              placeholder={isRTL ? 'أدخل اسمك بالعربية' : 'Enter your Arabic name'}
              darkMode={darkMode}
              isRTL={isRTL}
              dir="rtl"
              icon={<User size={14} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
            />
            <InputField
              label={isRTL ? 'الاسم بالإنجليزية' : 'English Name'}
              value={nameEn}
              onChange={setNameEn}
              placeholder={isRTL ? 'أدخل اسمك بالإنجليزية' : 'Enter your English name'}
              darkMode={darkMode}
              isRTL={isRTL}
              dir="ltr"
            />
            <InputField
              label={isRTL ? 'البريد الإلكتروني' : 'Email'}
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
              label={isRTL ? 'رقم الهاتف' : 'Phone Number'}
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
          {isRTL ? 'حفظ التعديلات' : 'Save Changes'}
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
                {isRTL ? 'تم حفظ التعديلات بنجاح' : 'Changes saved successfully'}
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
    if (passwordStrength <= 1) return isRTL ? 'ضعيفة' : 'Weak';
    if (passwordStrength <= 2) return isRTL ? 'متوسطة' : 'Medium';
    return isRTL ? 'قوية' : 'Strong';
  }, [passwordStrength, isRTL]);

  const strengthColor = useMemo(() => {
    if (passwordStrength <= 1) return COLORS.danger;
    if (passwordStrength <= 2) return COLORS.warning;
    return COLORS.success;
  }, [passwordStrength]);

  const requirements = [
    { met: newPassword.length >= 8, label: isRTL ? '8 أحرف على الأقل' : 'At least 8 characters' },
    { met: /[A-Z]/.test(newPassword), label: isRTL ? 'حرف كبير' : 'Uppercase letter' },
    { met: /[0-9]/.test(newPassword), label: isRTL ? 'رقم' : 'Number' },
    { met: /[^A-Za-z0-9]/.test(newPassword), label: isRTL ? 'رمز خاص' : 'Special character' },
  ];

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ type: 'error', message: isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill all fields' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: 'error', message: isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match' });
      return;
    }
    if (passwordStrength < 2) {
      setToast({ type: 'error', message: isRTL ? 'كلمة المرور ضعيفة جداً' : 'Password is too weak' });
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
        setToast({ type: 'success', message: isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setToast({ type: 'error', message: isRTL ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect' });
      }
    } catch {
      setToast({ type: 'error', message: isRTL ? 'حدث خطأ، يرجى المحاولة لاحقاً' : 'An error occurred, please try again' });
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
      subtitle={isRTL ? 'تحديث كلمة المرور الخاصة بك' : 'Update your password'}
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
              label={isRTL ? 'كلمة المرور الحالية' : 'Current Password'}
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              placeholder={isRTL ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
              darkMode={darkMode}
            />
            <PasswordInputField
              label={isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
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
              label={isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder={isRTL ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
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
              {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
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
      titleAr: 'الدفع عند الاستلام',
      titleEn: 'Cash on Delivery',
      subtitleAr: 'ادفع نقداً عند استلام طلبك',
      subtitleEn: 'Pay cash when you receive your order',
      icon: Package,
      gradient: 'linear-gradient(135deg, rgba(0,168,204,0.12), rgba(0,137,123,0.12))',
      iconColor: COLORS.teal,
      available: true,
    },
    {
      id: 'card',
      titleAr: 'الدفع بالبطاقة',
      titleEn: 'Card Payment',
      subtitleAr: 'فيزا أو ماستركارد',
      subtitleEn: 'Visa or Mastercard',
      icon: CreditCard,
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))',
      iconColor: COLORS.purple,
      available: false,
    },
    {
      id: 'wallet',
      titleAr: 'المحفظة الإلكترونية',
      titleEn: 'E-Wallet',
      subtitleAr: 'ادفع من رصيد محفظتك',
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
      title={isRTL ? 'طريقة الدفع' : 'Payment Method'}
      subtitle={isRTL ? 'اختر طريقة الدفع المفضلة' : 'Choose your preferred payment method'}
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
                          {isRTL ? 'قريباً' : 'Soon'}
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
            {isRTL ? 'طرق الدفع الإضافية ستتوفر قريباً' : 'Additional payment methods coming soon'}
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
    { id: 'performance', labelAr: 'أداء', labelEn: 'Performance', icon: Zap, color: COLORS.warning },
    { id: 'ui', labelAr: 'واجهة مستخدم', labelEn: 'UI Issue', icon: Eye, color: COLORS.purple },
    { id: 'account', labelAr: 'حساب', labelEn: 'Account', icon: User, color: COLORS.teal },
    { id: 'orders', labelAr: 'طلبات', labelEn: 'Orders', icon: Package, color: COLORS.info },
    { id: 'other', labelAr: 'أخرى', labelEn: 'Other', icon: HelpCircle, color: '#6B7280' },
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
      <OverlayWrapper onClose={onClose} title={isRTL ? 'الإبلاغ عن مشكلة' : 'Report a Bug'} direction={direction} isRTL={isRTL} darkMode={darkMode}>
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
            {isRTL ? 'شكراً لك!' : 'Thank you!'}
          </h3>
          <p className="text-sm text-center max-w-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
            {isRTL ? 'تم إرسال بلاغك بنجاح. سنعمل على حل المشكلة في أقرب وقت.' : 'Your report has been sent successfully. We will work on fixing the issue as soon as possible.'}
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-6 px-8 py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: GRADIENT_BUTTON }}
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </motion.button>
        </motion.div>
      </OverlayWrapper>
    );
  }

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'الإبلاغ عن مشكلة' : 'Report a Bug'}
      subtitle={isRTL ? 'ساعدنا في تحسين التطبيق' : 'Help us improve the app'}
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
              {isRTL ? 'نوع المشكلة' : 'Bug Category'}
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
                {isRTL ? 'وصف المشكلة' : 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isRTL ? 'اكتب وصفاً تفصيلياً للمشكلة...' : 'Write a detailed description of the issue...'}
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
              label={isRTL ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}
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
              {isRTL ? 'إرسال البلاغ' : 'Submit Report'}
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
      <OverlayWrapper onClose={onClose} title={isRTL ? 'تقييم التطبيق' : 'Rate the App'} direction={direction} isRTL={isRTL} darkMode={darkMode}>
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
            {isRTL ? 'شكراً لتقييمك!' : 'Thank you for your rating!'}
          </h3>
          <p className="text-sm text-center max-w-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
            {isRTL ? 'رأيك يهمنا ويساعدنا في تحسين التطبيق باستمرار.' : 'Your feedback matters and helps us improve the app continuously.'}
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-6 px-8 py-3 rounded-2xl text-white font-bold text-sm"
            style={{ background: GRADIENT_BUTTON }}
          >
            {isRTL ? 'إغلاق' : 'Close'}
          </motion.button>
        </motion.div>
      </OverlayWrapper>
    );
  }

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'تقييم التطبيق' : 'Rate the App'}
      subtitle={isRTL ? 'شاركنا رأيك' : 'Share your feedback'}
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
              {isRTL ? 'كم تقييمك للتطبيق؟' : 'How would you rate our app?'}
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
                {rating === 1 && (isRTL ? 'سيء' : 'Poor')}
                {rating === 2 && (isRTL ? 'مقبول' : 'Fair')}
                {rating === 3 && (isRTL ? 'جيد' : 'Good')}
                {rating === 4 && (isRTL ? 'جيد جداً' : 'Very Good')}
                {rating === 5 && (isRTL ? 'ممتاز!' : 'Excellent!')}
              </motion.p>
            )}
          </div>
        </Card>

        {/* Comment */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'تعليقك (اختياري)' : 'Your comment (optional)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isRTL ? 'اكتب تعليقك هنا...' : 'Write your comment here...'}
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
              {isRTL ? 'إرسال التقييم' : 'Submit Rating'}
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
      labelAr: 'واتساب',
      labelEn: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      bg: 'rgba(37,211,102,0.1)',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(isRTL ? 'جرب تطبيق نبض المدينة!' : 'Try Nabd Al-Madina app!')} ${shareLink}`, '_blank'),
    },
    {
      id: 'telegram',
      labelAr: 'تيليجرام',
      labelEn: 'Telegram',
      icon: Send,
      color: '#0088CC',
      bg: 'rgba(0,136,204,0.1)',
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(isRTL ? 'جرب تطبيق نبض المدينة!' : 'Try Nabd Al-Madina app!')}`, '_blank'),
    },
    {
      id: 'twitter',
      labelAr: 'تويتر',
      labelEn: 'Twitter',
      icon: Globe,
      color: '#1DA1F2',
      bg: 'rgba(29,161,242,0.1)',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(isRTL ? 'جرب تطبيق نبض المدينة!' : 'Try Nabd Al-Madina app!')}&url=${encodeURIComponent(shareLink)}`, '_blank'),
    },
    {
      id: 'copy',
      labelAr: copied ? 'تم النسخ!' : 'نسخ الرابط',
      labelEn: copied ? 'Copied!' : 'Copy Link',
      icon: Copy,
      color: copied ? COLORS.success : COLORS.teal,
      bg: copied ? 'rgba(35,134,54,0.1)' : 'rgba(0,168,204,0.1)',
      action: handleCopy,
    },
    {
      id: 'more',
      labelAr: 'المزيد',
      labelEn: 'More',
      icon: ExternalLink,
      color: '#6B7280',
      bg: darkMode ? COLORS.darkSubtle : '#F3F4F6',
      action: () => {
        try {
          navigator.share({
            title: isRTL ? 'نبض المدينة' : 'Nabd Al-Madina',
            text: isRTL ? 'جرب تطبيق نبض المدينة!' : 'Try Nabd Al-Madina app!',
            url: shareLink,
          });
        } catch { /* ignore */ }
      },
    },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'مشاركة التطبيق' : 'Share the App'}
      subtitle={isRTL ? 'ادع أصدقاءك للتسوق' : 'Invite friends to shop'}
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
              {isRTL ? 'نبض المدينة' : 'Nabd Al-Madina'}
            </h3>
            <p className="text-xs text-center mt-1.5 max-w-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
              {isRTL ? 'أفضل تجربة تسوق إلكترونية في ليبيا - جودة وأمان في كل طلب' : 'Best e-commerce experience in Libya - Quality and security in every order'}
            </p>
          </div>
        </Card>

        {/* Share Link */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <label className="text-[10px] font-bold uppercase tracking-widest mb-1.5 block" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'رابط الإحالة' : 'Referral Link'}
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
              {isRTL ? 'مشاركة عبر' : 'Share via'}
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
    { valueAr: '+1000', valueEn: '+1000', labelAr: 'منتج', labelEn: 'Products', icon: Package, color: COLORS.teal },
    { valueAr: '+50', valueEn: '+50', labelAr: 'متجر', labelEn: 'Stores', icon: MapPin, color: COLORS.purple },
    { valueAr: '+5000', valueEn: '+5000', labelAr: 'مستخدم', labelEn: 'Users', icon: User, color: COLORS.success },
  ];

  const socialLinks = [
    { nameAr: 'فيسبوك', nameEn: 'Facebook', color: '#1877F2', bg: 'rgba(24,119,242,0.1)', href: 'https://facebook.com/nabdalmadina', iconPath: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
    { nameAr: 'انستغرام', nameEn: 'Instagram', color: '#E4405F', bg: 'rgba(228,64,95,0.1)', href: 'https://instagram.com/nabdalmadina', iconPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    { nameAr: 'واتساب', nameEn: 'WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.1)', href: 'https://wa.me/218911234567', iconPath: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z' },
    { nameAr: 'يوتيوب', nameEn: 'YouTube', color: '#FF0000', bg: 'rgba(255,0,0,0.1)', href: 'https://youtube.com/@nabdalmadina', iconPath: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.4 19.6C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z' },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'عن نبض المدينة' : 'About Nabd Al-Madina'}
      subtitle={isRTL ? 'معلومات التطبيق' : 'App information'}
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
              {isRTL ? 'نبض المدينة' : 'Nabd Al-Madina'}
            </h2>
            <span className="text-xs mt-1.5 px-3 py-1 rounded-lg font-bold" style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6', color: darkMode ? '#6B7280' : '#9CA3AF' }}>v{APP_VERSION}</span>
            <p className="text-sm text-center mt-3 leading-relaxed max-w-xs" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>
              {isRTL
                ? 'نبض المدينة هو متجرك الإلكتروني الأول في ليبيا. نوفر لك تجربة تسوق فريدة مع تشكيلة واسعة من المنتجات المميزة وتوصيل سريع وآمن لجميع المناطق.'
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
              {isRTL ? 'تابعنا' : 'Follow Us'}
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
                {isRTL ? 'تطوير Bits للبرمجيات' : 'Bits Software Development'}
              </h4>
              <p className="text-[10px] mt-0.5" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                {isRTL ? 'تصميم وتطوير البرمجيات والتطبيقات' : 'Software & App Design & Development'}
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
            {isRTL ? 'صُنع بـ â‌¤ï¸ڈ في ليبيا' : 'Made with â‌¤ï¸ڈ in Libya'}
          </p>
          <p className="text-[9px] mt-1" style={{ color: darkMode ? '#374151' : '#D1D5DB' }}>
            آ© 2024 {isRTL ? 'نبض المدينة' : 'Nabd Al-Madina'}. {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
          </p>
          <p className="text-[9px] mt-0.5" style={{ color: darkMode ? '#374151' : '#D1D5DB' }}>
            {isRTL ? 'تطوير: Bits للبرمجيات' : 'Developed by: Bits Software'}
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
    { name: 'React', license: 'MIT', version: '18.x', description: isRTL ? 'مكتبة واجهة المستخدم' : 'UI component library' },
    { name: 'Next.js', license: 'MIT', version: '16.x', description: isRTL ? 'إطار عمل الويب' : 'Web framework' },
    { name: 'TypeScript', license: 'Apache-2.0', version: '5.x', description: isRTL ? 'لغة برمجة مكتوبة' : 'Typed programming language' },
    { name: 'Tailwind CSS', license: 'MIT', version: '4.x', description: isRTL ? 'إطار عمل CSS' : 'CSS framework' },
    { name: 'Framer Motion', license: 'MIT', version: '11.x', description: isRTL ? 'مكتبة الحركات والانتقالات' : 'Animation library' },
    { name: 'Zustand', license: 'MIT', version: '4.x', description: isRTL ? 'مكتبة إدارة الحالة' : 'State management' },
    { name: 'Lucide React', license: 'ISC', version: '0.x', description: isRTL ? 'مكتبة الأيقونات' : 'Icon library' },
    { name: 'Prisma', license: 'Apache-2.0', version: '5.x', description: isRTL ? 'أداة قاعدة البيانات ORM' : 'Database ORM' },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'تراخيص المصادر المفتوحة' : 'Open Source Licenses'}
      subtitle={isRTL ? 'المكتبات المستخدمة في التطبيق' : 'Libraries used in the app'}
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
                          {isRTL ? 'الوصف:' : 'Description:'} {lib.description}
                        </p>
                        <p>
                          {isRTL
                            ? `هذه المكتبة مرخصة تحت رخصة ${lib.license}. يرجى الاطلاع على الرخصة الأصلية للتفاصيل الكاملة.`
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
      titleAr: 'جمع البيانات',
      titleEn: 'Data Collection',
      contentAr: 'نجمع بيانات أساسية لتحسين تجربتك مع التطبيق، بما في ذلك: الاسم، رقم الهاتف، البريد الإلكتروني، عناوين التوصيل، وسجل الطلبات. لا نجمع أي بيانات حساسة بدون موافقتك الصريحة.',
      contentEn: 'We collect basic data to improve your experience with the app, including: name, phone number, email, delivery addresses, and order history. We do not collect any sensitive data without your explicit consent.',
    },
    {
      titleAr: 'استخدام البيانات',
      titleEn: 'Data Usage',
      contentAr: 'نستخدم بياناتك لمعالجة الطلبات، تحسين خدماتنا، التواصل معك بخصوص طلباتك، وإرسال عروض مخصصة. لن نبيع بياناتك الشخصية لأي طرف ثالث تحت أي ظرف.',
      contentEn: 'We use your data to process orders, improve our services, communicate with you about your orders, and send personalized offers. We will never sell your personal data to any third party under any circumstances.',
    },
    {
      titleAr: 'حماية البيانات',
      titleEn: 'Data Protection',
      contentAr: 'نتخذ إجراءات أمنية متقدمة لحماية بياناتك، بما في ذلك التشفير، جدران الحماية، والمراقبة المستمرة. نلتزم بأعلى معايير الأمان لحماية معلوماتك الشخصية والمالية.',
      contentEn: 'We take advanced security measures to protect your data, including encryption, firewalls, and continuous monitoring. We adhere to the highest security standards to protect your personal and financial information.',
    },
    {
      titleAr: 'ملفات تعريف الارتباط',
      titleEn: 'Cookies',
      contentAr: 'نستخدم ملفات تعريف الارتباط (الكوكيز) لتحسين أداء التطبيق وتخصيص تجربتك. يمكنك التحكم في إعدادات الكوكيز من متصفحك. بعض الكوكيز ضرورية لعمل التطبيق بشكل صحيح.',
      contentEn: 'We use cookies to improve app performance and personalize your experience. You can control cookie settings from your browser. Some cookies are essential for the app to function properly.',
    },
    {
      titleAr: 'حقوق المستخدم',
      titleEn: 'User Rights',
      contentAr: 'لديك الحق في الوصول إلى بياناتك، طلب تعديلها أو حذفها، والاعتراض على معالجتها. يمكنك أيضاً سحب موافقتك في أي وقت. لتطبيق أي من هذه الحقوق، يرجى التواصل معنا.',
      contentEn: 'You have the right to access your data, request modification or deletion, and object to its processing. You can also withdraw your consent at any time. To exercise any of these rights, please contact us.',
    },
    {
      titleAr: 'الاتصال بنا',
      titleEn: 'Contact Us',
      contentAr: 'إذا كان لديك أي أسئلة حول سياسة الخصوصية أو كيفية تعاملنا مع بياناتك، يمكنك التواصل معنا عبر: البريد الإلكتروني: support@nabd.ly أو الهاتف: +218 91 000 0000',
      contentEn: 'If you have any questions about our privacy policy or how we handle your data, you can contact us via: Email: support@nabd.ly or Phone: +218 91 000 0000',
    },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
      subtitle={isRTL ? 'كيف نحمي بياناتك' : 'How we protect your data'}
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
            {isRTL ? 'آخر تحديث: يناير 2024' : 'Last updated: January 2024'}
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
      titleAr: 'القبول',
      titleEn: 'Acceptance',
      contentAr: 'باستخدام تطبيق نبض المدينة، فإنك توافق على هذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام التطبيق. استمرارك في استخدام التطبيق يعني قبولك لأي تعديلات على هذه الشروط.',
      contentEn: 'By using the Nabd Al-Madina app, you agree to these terms and conditions. If you do not agree with any part of these terms, please do not use the app. Your continued use of the app means you accept any changes to these terms.',
    },
    {
      titleAr: 'الاستخدام المسموح',
      titleEn: 'Permitted Use',
      contentAr: 'يُسمح لك باستخدام التطبيق لأغراض التسوق الشرعية فقط. يُحظر استخدام التطبيق لأي أغراض غير قانونية أو احتيالية أو ضارة. يجب عليك الالتزام بجميع القوانين واللوائح المعمول بها عند استخدام التطبيق.',
      contentEn: 'You are allowed to use the app for legitimate shopping purposes only. It is prohibited to use the app for any illegal, fraudulent, or harmful purposes. You must comply with all applicable laws and regulations when using the app.',
    },
    {
      titleAr: 'الحسابات',
      titleEn: 'Accounts',
      contentAr: 'أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور الخاصة بك. يجب عليك إبلاغنا فوراً عن أي استخدام غير مصرح لحسابك. لسنا مسؤولين عن أي خسائر ناتجة عن إساءة استخدام حسابك.',
      contentEn: 'You are responsible for maintaining the confidentiality of your account information and password. You must notify us immediately of any unauthorized use of your account. We are not responsible for any losses resulting from misuse of your account.',
    },
    {
      titleAr: 'الملكية الفكرية',
      titleEn: 'Intellectual Property',
      contentAr: 'جميع المحتوى في التطبيق، بما في ذلك النصوص والصور والشعارات والتصميم، هو ملك لنبض المدينة أو مرخص له. لا يجوز لك نسخ أو تعديل أو توزيع أي محتوى من التطبيق بدون إذن كتابي مسبق.',
      contentEn: 'All content in the app, including text, images, logos, and design, is owned by or licensed to Nabd Al-Madina. You may not copy, modify, or distribute any content from the app without prior written permission.',
    },
    {
      titleAr: 'إخلاء المسؤولية',
      titleEn: 'Disclaimer',
      contentAr: 'نبذل قصارى جهدنا لضمان دقة المعلومات في التطبيق، لكننا لا نضمن دقة أو اكتمال أو موثوقية أي محتوى. نحن لا نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام التطبيق.',
      contentEn: 'We make our best effort to ensure the accuracy of information in the app, but we do not guarantee the accuracy, completeness, or reliability of any content. We are not liable for any direct or indirect damages resulting from the use of the app.',
    },
    {
      titleAr: 'التعديلات',
      titleEn: 'Modifications',
      contentAr: 'نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إخطارك بأي تغييرات جوهرية. استمرارك في استخدام التطبيق بعد التعديلات يعني قبولك للشروط المعدلة.',
      contentEn: 'We reserve the right to modify these terms and conditions at any time. You will be notified of any material changes. Your continued use of the app after modifications means you accept the revised terms.',
    },
  ];

  return (
    <OverlayWrapper
      onClose={onClose}
      title={isRTL ? 'الشروط والأحكام' : 'Terms of Service'}
      subtitle={isRTL ? 'شروط استخدام التطبيق' : 'App usage terms'}
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
            {isRTL ? 'آخر تحديث: يناير 2024' : 'Last updated: January 2024'}
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
      qAr: 'كيفية الطلب؟',
      qEn: 'How to place an order?',
      aAr: 'لتقديم طلب، تصفح المنتجات وأضف ما تريد إلى سلة التسوق. ثم انتقل إلى السلة وراجع طلبك واضغط على "إتمام الشراء". أدخل عنوان التوصيل واختر طريقة الدفع ثم أكد الطلب. سنتواصل معك لتأكيد الطلب.',
      aEn: 'To place an order, browse products and add what you want to the shopping cart. Then go to the cart, review your order, and tap "Checkout". Enter the delivery address, choose a payment method, and confirm the order. We will contact you to confirm the order.',
    },
    {
      qAr: 'كيفية التتبع؟',
      qEn: 'How to track my order?',
      aAr: 'يمكنك تتبع طلبك من قسم "طلباتي" في حسابك. ستجد هناك حالة الطلب الحالية وتفاصيل التتبع. كما ستصلك إشعارات عبر التطبيق والرسائل النصية عند تحديث حالة طلبك.',
      aEn: 'You can track your order from the "My Orders" section in your account. You will find the current order status and tracking details there. You will also receive notifications via the app and SMS when your order status is updated.',
    },
    {
      qAr: 'سياسة الاسترجاع؟',
      qEn: 'What is the return policy?',
      aAr: 'يمكنك إرجاع المنتجات خلال 7 أيام من الاستلام إذا كانت في حالتها الأصلية ولم يتم استخدامها. المنتجات المخصصة والغذائية غير قابلة للإرجاع. تواصل معنا عبر الدعم الفني لبدء عملية الإرجاع.',
      aEn: 'You can return products within 7 days of delivery if they are in their original condition and have not been used. Customized and food products are non-returnable. Contact us via support to start the return process.',
    },
    {
      qAr: 'طرق الدفع؟',
      qEn: 'What payment methods are available?',
      aAr: 'حالياً نوفر الدفع عند الاستلام كطريقة دفع أساسية. نعمل على إضافة طرق دفع إلكترونية مثل البطاقات البنكية والمحفظة الإلكترونية قريباً. تابع التحديثات!',
      aEn: 'Currently, we offer Cash on Delivery as the primary payment method. We are working on adding electronic payment methods like bank cards and e-wallets soon. Stay tuned for updates!',
    },
    {
      qAr: 'التوصيل؟',
      qEn: 'How does delivery work?',
      aAr: 'نوفر التوصيل لجميع مناطق ليبيا. مدة التوصيل تتراوح بين 1-5 أيام عمل حسب المنطقة. رسوم التوصيل تعتمد على المنطقة المختارة. يمكنك اختيار عنوان التوصيل عند إتمام الشراء.',
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
      title={isRTL ? 'مركز المساعدة' : 'Help Center'}
      subtitle={isRTL ? 'أسئلة شائعة ومساعدة' : 'FAQs & support'}
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
              placeholder={isRTL ? 'ابحث في الأسئلة الشائعة...' : 'Search FAQs...'}
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
              {isRTL ? 'لا توجد نتائج' : 'No results found'}
            </p>
          </motion.div>
        )}

        {/* Still need help? */}
        <Card darkMode={darkMode}>
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: darkMode ? '#4B5563' : '#9CA3AF' }}>
              {isRTL ? 'لا تزال بحاجة لمساعدة؟' : 'Still need help?'}
            </p>
            <div className="flex items-center gap-2">
              <a href="tel:+218910000000" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(0,168,204,0.08)', color: COLORS.teal }}>
                <Phone size={14} /> {isRTL ? 'اتصل' : 'Call'}
              </a>
              <a href="https://wa.me/218910000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(34,197,94,0.08)', color: '#16A34A' }}>
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a href="mailto:support@nabd.ly" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: 'rgba(59,130,246,0.08)', color: COLORS.info }}>
                <Mail size={14} /> {isRTL ? 'بريد' : 'Email'}
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
      titleAr: 'هاتف',
      titleEn: 'Phone',
      value: '+218 91 000 0000',
      href: 'tel:+218910000000',
    },
    {
      icon: MessageCircle,
      gradient: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(22,163,74,0.12))',
      iconColor: '#16A34A',
      titleAr: 'واتساب',
      titleEn: 'WhatsApp',
      value: '+218 91 000 0000',
      href: 'https://wa.me/218910000000',
    },
    {
      icon: Mail,
      gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(37,99,235,0.12))',
      iconColor: COLORS.info,
      titleAr: 'بريد إلكتروني',
      titleEn: 'Email',
      value: 'support@nabd.ly',
      href: 'mailto:support@nabd.ly',
    },
    {
      icon: Globe,
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.12))',
      iconColor: COLORS.purple,
      titleAr: 'موقع إلكتروني',
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
      title={isRTL ? 'تواصل معنا' : 'Contact Us'}
      subtitle={isRTL ? 'نحن هنا لمساعدتك' : 'We are here to help'}
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
                {isRTL ? 'أرسل لنا رسالة' : 'Send us a message'}
              </p>
              <InputField
                label={isRTL ? 'الاسم' : 'Name'}
                value={name}
                onChange={setName}
                placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                darkMode={darkMode}
                isRTL={isRTL}
                icon={<User size={14} style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }} />}
              />
              <InputField
                label={isRTL ? 'البريد الإلكتروني' : 'Email'}
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
                  {isRTL ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
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
                    {isRTL ? 'إرسال الرسالة' : 'Send Message'}
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
                {isRTL ? 'تم إرسال رسالتك!' : 'Message sent!'}
              </h3>
              <p className="text-xs text-center max-w-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF' }}>
                {isRTL ? 'سنتواصل معك في أقرب وقت ممكن. شكراً لتواصلك معنا!' : 'We will get back to you as soon as possible. Thank you for reaching out!'}
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }}
                className="mt-4 px-6 py-2 rounded-xl text-xs font-bold"
                style={{ background: darkMode ? COLORS.darkSubtle : '#F3F4F6', color: darkMode ? '#9CA3AF' : '#6B7280' }}
              >
                {isRTL ? 'إرسال رسالة أخرى' : 'Send another message'}
              </motion.button>
            </motion.div>
          </Card>
        )}
      </motion.div>
    </OverlayWrapper>
  );
}

