'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileStore } from '../lib/mobile-store';
import type { Address } from '../lib/types';
import {
  MapPin, Plus, Pencil, Trash2, Star, ChevronLeft, ChevronRight,
  Check, X, Home, Building, ChevronDown, Navigation, Info,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// BRAND COLORS
// ═══════════════════════════════════════════════════════════════════════
const COLORS = {
  teal: '#00A8CC',
  tealDark: '#00897B',
  primary: '#004B63',
  primaryDark: '#003545',
  primaryLight: '#006B8A',
  danger: '#EF4444',
  info: '#3B82F6',
  gold: '#D4A843',
  success: '#238636',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  border: '#E5E7EB',
  surface: '#F3F4F6',
  darkCard: '#151D2E',
  darkBorder: '#1E2A42',
  darkSubtle: '#1A2540',
  darkBg: '#0B1120',
};

// ═══════════════════════════════════════════════════════════════════════
// LIBYAN CITIES
// ═══════════════════════════════════════════════════════════════════════
const LIBYAN_CITIES = [
  { ar: 'طرابلس', en: 'Tripoli' },
  { ar: 'بنغازي', en: 'Benghazi' },
  { ar: 'مصراتة', en: 'Misrata' },
  { ar: 'البيضاء', en: 'Bayda' },
  { ar: 'سبها', en: 'Sabha' },
  { ar: 'زليتن', en: 'Zliten' },
  { ar: 'الخمس', en: 'Khoms' },
  { ar: 'طبرق', en: 'Tobruk' },
  { ar: 'درنة', en: 'Derna' },
  { ar: 'سرت', en: 'Sirte' },
  { ar: 'غريان', en: 'Gharyan' },
  { ar: 'الزاوية', en: 'Zawiya' },
];

// ═══════════════════════════════════════════════════════════════════════
// LABEL OPTIONS
// ═══════════════════════════════════════════════════════════════════════
const LABEL_OPTIONS = [
  { key: 'home', ar: 'المنزل', en: 'Home', icon: Home, color: COLORS.teal },
  { key: 'work', ar: 'العمل', en: 'Work', icon: Building, color: COLORS.tealDark },
  { key: 'other', ar: 'أخرى', en: 'Other', icon: MapPin, color: COLORS.gold },
];

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, type: 'spring' as const, stiffness: 220, damping: 22 },
  }),
};

const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContent = {
  hidden: { opacity: 0, scale: 0.92, y: 40 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.92, y: 40, transition: { duration: 0.15 } },
};

// ═══════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════
interface AddressManagementProps {
  onClose: () => void;
  darkMode: boolean;
  direction: 'rtl' | 'ltr';
  isRTL: boolean;
  t: (key: string) => string;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function AddressManagement({ onClose, darkMode, direction, isRTL, t }: AddressManagementProps) {
  // Use the mobile store for addresses (synced with DB)
  const addresses = useMobileStore((s) => s.addresses);
  const storeAddAddress = useMobileStore((s) => s.addAddress);
  const storeUpdateAddress = useMobileStore((s) => s.updateAddress);
  const storeDeleteAddress = useMobileStore((s) => s.deleteAddress);
  const storeSetDefaultAddress = useMobileStore((s) => s.setDefaultAddress);

  // ─── State ──────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [formLabel, setFormLabel] = useState('home');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ─── Scroll to top when form closes ──────────────────────────────────
  const prevShowFormRef = useRef(false);
  useEffect(() => {
    // When form transitions from open to closed, scroll to top
    if (prevShowFormRef.current && !showForm) {
      // Use multiple approaches to ensure scroll works
      setTimeout(() => {
        // 1. Try the ref container
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
        // 2. Try by ID
        const scrollById = document.getElementById('address-list-scroll');
        if (scrollById) {
          scrollById.scrollTop = 0;
        }
        // 3. Try finding all scrollable containers in the overlay
        const overlay = document.getElementById('address-overlay-scroll');
        if (overlay) {
          overlay.scrollTop = 0;
          overlay.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-auto"]').forEach((el) => {
            (el as HTMLElement).scrollTop = 0;
          });
        }
        // 4. Try scrolling all scrollable ancestors of the ref element
        if (scrollContainerRef.current) {
          let parent = scrollContainerRef.current.parentElement;
          while (parent) {
            if (parent.scrollHeight > parent.clientHeight) {
              parent.scrollTop = 0;
            }
            parent = parent.parentElement;
          }
        }
      }, 350); // Wait for form exit animation to complete
    }
    prevShowFormRef.current = showForm;
  }, [showForm]);

  // ─── Reset form ─────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormLabel('home');
    setFormAddress('');
    setFormCity('');
    setFormArea('');
    setFormNotes('');
    setFormIsDefault(false);
    setFormErrors({});
    setEditingId(null);
  }, []);

  // ─── Open add form ──────────────────────────────────────────────────
  const openAddForm = useCallback(() => {
    resetForm();
    setShowForm(true);
  }, [resetForm]);

  // ─── Open edit form ─────────────────────────────────────────────────
  const openEditForm = useCallback((addr: Address) => {
    setEditingId(addr.id);
    setFormLabel(addr.label);
    setFormAddress(addr.address);
    setFormCity(addr.city);
    setFormArea(addr.area || '');
    setFormNotes(addr.notes || '');
    setFormIsDefault(addr.isDefault);
    setFormErrors({});
    setShowForm(true);
  }, []);

  // ─── Validate form ──────────────────────────────────────────────────
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!formAddress.trim()) {
      errors.address = t('address.addressRequired');
    }
    if (!formCity) {
      errors.city = t('address.cityRequired');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formAddress, formCity, t]);

  // ─── Save address ───────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    if (editingId) {
      await storeUpdateAddress(editingId, {
        label: formLabel,
        address: formAddress.trim(),
        city: formCity,
        area: formArea.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isDefault: formIsDefault,
      });
    } else {
      await storeAddAddress({
        label: formLabel,
        address: formAddress.trim(),
        city: formCity,
        area: formArea.trim() || undefined,
        notes: formNotes.trim() || undefined,
        isDefault: formIsDefault || addresses.length === 0,
      });
    }

    setShowForm(false);
    resetForm();

    // Scroll to top after saving — use aggressive approach
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Scroll the ref container
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
        // Also try by ID
        const scrollById = document.getElementById('address-list-scroll');
        if (scrollById) {
          scrollById.scrollTop = 0;
        }
        // Also try all scrollable containers in the overlay
        const overlay = document.getElementById('address-overlay-scroll');
        if (overlay) {
          overlay.scrollTop = 0;
          overlay.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-auto"]').forEach((el) => {
            (el as HTMLElement).scrollTop = 0;
          });
        }
        // Scroll all ancestors
        if (scrollContainerRef.current) {
          let parent = scrollContainerRef.current.parentElement;
          while (parent) {
            if (parent.scrollHeight > parent.clientHeight) {
              parent.scrollTop = 0;
            }
            parent = parent.parentElement;
          }
        }
      }, 400);
    });
  }, [editingId, formLabel, formAddress, formCity, formArea, formNotes, formIsDefault, addresses, storeAddAddress, storeUpdateAddress, resetForm, validateForm]);

  // ─── Set default address ────────────────────────────────────────────
  const setDefault = useCallback(async (id: string) => {
    await storeSetDefaultAddress(id);
  }, [storeSetDefaultAddress]);

  // ─── Delete address ─────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    await storeDeleteAddress(id);
    setDeleteConfirmId(null);
  }, [storeDeleteAddress]);

  // ─── Get label info ─────────────────────────────────────────────────
  const getLabelInfo = (key: string) => LABEL_OPTIONS.find((l) => l.key === key) || LABEL_OPTIONS[2];

  // ─── Back arrow component ───────────────────────────────────────────
  const BackArrow = isRTL ? ChevronRight : ChevronLeft;

  // ─── Accent bar color based on label ────────────────────────────────
  const getAccentColor = (label: string) => {
    switch (label) {
      case 'home': return COLORS.teal;
      case 'work': return COLORS.tealDark;
      default: return COLORS.gold;
    }
  };

  // ─── Themed helpers ─────────────────────────────────────────────────
  const bgColor = darkMode ? COLORS.darkBg : COLORS.surface;
  const cardBg = darkMode ? COLORS.darkCard : '#FFFFFF';
  const cardBorder = darkMode ? COLORS.darkBorder : COLORS.border;
  const textMain = darkMode ? '#F3F4F6' : COLORS.textPrimary;
  const textSub = darkMode ? '#9CA3AF' : COLORS.textSecondary;

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════
  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      dir={direction}
      style={{ background: bgColor }}
      initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? -40 : 40 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 26 }}
    >
      {/* ═══════════════════════════════════════════════════════════════
          GRADIENT HEADER
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 35%, ${COLORS.primaryLight} 65%, ${COLORS.tealDark} 100%)`,
        }}
      >
        {/* Decorative circles */}
        <motion.div
          className="absolute -top-10 -start-10 w-40 h-40 rounded-full"
          style={{ background: `radial-gradient(circle, ${COLORS.teal}18 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <motion.div
          className="absolute bottom-4 end-0 w-32 h-32 rounded-full"
          style={{ background: `radial-gradient(circle, ${COLORS.gold}12 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const, delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 start-1/3 w-24 h-24 rounded-full"
          style={{ background: `radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }}
        />

        {/* Wave SVG separator */}
        <svg className="absolute bottom-0 start-0 w-full" viewBox="0 0 430 35" preserveAspectRatio="none" style={{ height: 24 }}>
          <path d="M0 20 Q72 5 143 20 Q215 35 287 20 Q358 5 430 20 V35 H0 Z" fill={bgColor} />
        </svg>

        {/* Header content */}
        <div className="relative z-10 px-4 pt-4 pb-10">
          <div className="flex items-center justify-between mb-4">
            {/* Back button with glassmorphism */}
            <motion.button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              whileHover={{ scale: 1.08, background: 'rgba(255,255,255,0.25)' }}
              whileTap={{ scale: 0.92 }}
              aria-label={t('common.goBack')}
            >
              <BackArrow size={20} className="text-white" />
            </motion.button>

            {/* Address count badge */}
            {addresses.length > 0 && (
              <motion.div
                className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MapPin size={12} className="text-white/70" />
                <span className="text-white/90 text-xs font-semibold">{addresses.length}</span>
              </motion.div>
            )}
          </div>

          <motion.h1
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring' as const, stiffness: 200, damping: 20 }}
          >
            {isRTL ? 'عناويني' : 'My Addresses'}
          </motion.h1>
          <motion.p
            className="text-white/50 text-sm mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isRTL ? 'إدارة عناوين التوصيل' : 'Manage your delivery addresses'}
          </motion.p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SCROLLABLE CONTENT
          ═══════════════════════════════════════════════════════════════ */}
      <div id="address-list-scroll" ref={scrollContainerRef} className="address-scroll-container flex-1 min-h-0 overflow-y-auto px-4 -mt-2 pb-6" style={{ scrollBehavior: 'smooth' }}>
        <AnimatePresence mode="wait">
          {addresses.length === 0 && !showForm ? (
            /* ═══════════════════════════════════════════════════════════
                EMPTY STATE
                ═══════════════════════════════════════════════════════════ */
            <motion.div
              key="empty"
              className="flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring' as const, stiffness: 200, damping: 22 }}
            >
              <motion.div
                className="relative mb-6"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const }}
              >
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.teal}10, ${COLORS.tealDark}10)`,
                    border: `2px dashed ${COLORS.teal}30`,
                  }}
                >
                  <MapPin size={36} style={{ color: COLORS.teal }} />
                </div>
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${COLORS.teal}20` }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' as const }}
                />
              </motion.div>
              <h3 className="text-lg font-bold mb-2" style={{ color: textMain }}>
                {t('address.noAddresses')}
              </h3>
              <p className="text-sm text-center max-w-xs mb-8" style={{ color: textSub }}>
                {t('address.addFirstAddress')}
              </p>

              {/* Prominent gradient add button */}
              <motion.button
                onClick={openAddForm}
                className="px-8 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center gap-2 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`,
                  boxShadow: `0 4px 20px ${COLORS.teal}30`,
                }}
                whileHover={{ scale: 1.03, boxShadow: `0 6px 28px ${COLORS.teal}40` }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                <Plus size={18} className="relative z-10" />
                <span className="relative z-10">{t('address.addNewAddress')}</span>
              </motion.button>

              {/* Bottom tip card */}
              <motion.div
                className="mt-8 w-full max-w-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div
                  className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
                  style={{
                    background: darkMode ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
                    border: `1px solid ${darkMode ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.08)'}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, rgba(59,130,246,0.12), rgba(0,168,204,0.12))` }}
                  >
                    <Info size={14} style={{ color: COLORS.info }} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: textSub }}>
                    {isRTL
                      ? 'أضف عنوانك الأول لتسهيل عملية التوصيل عند الطلب'
                      : 'Add your first address to make checkout faster and easier'}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* ═══════════════════════════════════════════════════════════
                ADDRESS LIST
                ═══════════════════════════════════════════════════════════ */
            <motion.div
              key="list"
              className="space-y-3 pt-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {addresses.map((addr, index) => {
                const labelInfo = getLabelInfo(addr.label);
                const LabelIcon = labelInfo.icon;
                const accentColor = getAccentColor(addr.label);

                return (
                  <motion.div
                    key={addr.id}
                    custom={index}
                    variants={cardVariants}
                    layout
                    className="rounded-2xl relative overflow-hidden"
                    style={{
                      background: cardBg,
                      border: `1px solid ${addr.isDefault ? `${accentColor}30` : cardBorder}`,
                      boxShadow: addr.isDefault
                        ? `0 4px 20px ${accentColor}10`
                        : darkMode
                          ? '0 2px 8px rgba(0,0,0,0.2)'
                          : '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    {/* Colored accent bar on the right side (end) */}
                    <div
                      className="absolute top-0 end-0 w-1.5 h-full rounded-e-2xl"
                      style={{
                        background: `linear-gradient(180deg, ${accentColor}, ${accentColor}60)`,
                      }}
                    />

                    {/* Default badge */}
                    {addr.isDefault && (
                      <motion.div
                        className="absolute top-3 end-4 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white flex items-center gap-1"
                        style={{ background: `linear-gradient(135deg, ${accentColor}, ${COLORS.tealDark})` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring' as const, stiffness: 300, damping: 18 }}
                      >
                        <Star size={8} fill="white" />
                        {t('address.default')}
                      </motion.div>
                    )}

                    <div className="p-4 pe-6">
                      <div className="flex items-start gap-3">
                        {/* Gradient icon background */}
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, rgba(${labelInfo.key === 'home' ? '0,168,204' : labelInfo.key === 'work' ? '0,137,123' : '212,168,67'},0.12), rgba(${labelInfo.key === 'home' ? '0,137,123' : labelInfo.key === 'work' ? '0,75,99' : '212,168,67'},0.12))`,
                          }}
                        >
                          <LabelIcon size={22} style={{ color: labelInfo.color }} />
                        </div>

                        {/* Address details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold tracking-wide" style={{ color: labelInfo.color }}>
                              {t(addr.label === 'home' ? 'mobile.address.home' : addr.label === 'work' ? 'mobile.address.work' : 'mobile.address.other')}
                            </span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed" style={{ color: textMain }}>
                            {addr.address}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {addr.area && (
                              <span
                                className="text-[10px] px-2.5 py-1 rounded-lg font-semibold"
                                style={{
                                  background: darkMode ? 'rgba(0,75,99,0.15)' : `${COLORS.primary}08`,
                                  color: darkMode ? COLORS.teal : COLORS.primary,
                                }}
                              >
                                {addr.area}
                              </span>
                            )}
                            <span
                              className="text-[10px] px-2.5 py-1 rounded-lg font-semibold"
                              style={{
                                background: darkMode ? 'rgba(0,137,123,0.12)' : `${COLORS.tealDark}08`,
                                color: darkMode ? COLORS.tealDark : COLORS.tealDark,
                              }}
                            >
                              {addr.city}
                            </span>
                          </div>
                          {addr.notes && (
                            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: COLORS.textDisabled }}>
                              {addr.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions row */}
                      <div
                        className="flex items-center justify-between mt-3 pt-3"
                        style={{ borderTop: `1px solid ${darkMode ? COLORS.darkBorder + '60' : COLORS.border + '60'}` }}
                      >
                        {/* Set default toggle */}
                        <motion.button
                          onClick={() => !addr.isDefault && setDefault(addr.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold"
                          style={{ color: addr.isDefault ? COLORS.gold : textSub }}
                          whileTap={{ scale: 0.95 }}
                          disabled={addr.isDefault}
                        >
                          <motion.div
                            animate={addr.isDefault ? { scale: [1, 1.3, 1], rotate: [0, 15, 0] } : {}}
                            transition={{ duration: 0.4 }}
                          >
                            <Star size={14} fill={addr.isDefault ? COLORS.gold : 'none'} />
                          </motion.div>
                          <span>
                            {addr.isDefault
                              ? t('address.default')
                              : t('address.setAsDefault')
                            }
                          </span>
                        </motion.button>

                        <div className="flex items-center gap-2">
                          {/* Edit button */}
                          <motion.button
                            onClick={() => openEditForm(addr)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                              background: darkMode ? 'rgba(0,75,99,0.15)' : `${COLORS.primary}08`,
                            }}
                            whileHover={{ background: darkMode ? 'rgba(0,75,99,0.25)' : `${COLORS.primary}15` }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={t('address.editAddress')}
                          >
                            <Pencil size={14} style={{ color: darkMode ? COLORS.teal : COLORS.primary }} />
                          </motion.button>

                          {/* Delete button */}
                          <motion.button
                            onClick={() => setDeleteConfirmId(addr.id)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{
                              background: darkMode ? 'rgba(239,68,68,0.10)' : `${COLORS.danger}08`,
                            }}
                            whileHover={{ background: darkMode ? 'rgba(239,68,68,0.20)' : `${COLORS.danger}15` }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={t('common.delete')}
                          >
                            <Trash2 size={14} style={{ color: COLORS.danger }} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* ═══════════════════════════════════════════════════════════
                  ADD NEW ADDRESS - PROMINENT GRADIENT BUTTON
                  ═══════════════════════════════════════════════════════════ */}
              <motion.button
                onClick={openAddForm}
                className="w-full rounded-2xl py-4 flex items-center justify-center gap-2.5 text-sm font-bold text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`,
                  boxShadow: `0 4px 20px ${COLORS.teal}25`,
                  border: 'none',
                }}
                custom={addresses.length}
                variants={cardVariants}
                whileHover={{ scale: 1.01, boxShadow: `0 6px 28px ${COLORS.teal}35` }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                <Plus size={18} className="relative z-10" />
                <span className="relative z-10">{t('address.addNewAddress')}</span>
              </motion.button>

              {/* ═══════════════════════════════════════════════════════════
                  BOTTOM TIP CARD
                  ═══════════════════════════════════════════════════════════ */}
              <motion.div
                custom={addresses.length + 1}
                variants={cardVariants}
              >
                <div
                  className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
                  style={{
                    background: darkMode ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.04)',
                    border: `1px solid ${darkMode ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.08)'}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, rgba(59,130,246,0.12), rgba(0,168,204,0.12))` }}
                  >
                    <Info size={14} style={{ color: COLORS.info }} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: textSub }}>
                    {isRTL
                      ? 'يمكنك تعيين عنوان واحد كافتراضي ليُستخدم تلقائياً عند الطلب'
                      : 'You can set one address as default to be used automatically at checkout'}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
              }}
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              dir={direction}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, rgba(239,68,68,0.12), rgba(220,38,38,0.12))` }}
                >
                  <Trash2 size={22} style={{ color: COLORS.danger }} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ color: textMain }}>
                    {t('address.deleteAddress')}
                  </h3>
                  <p className="text-xs" style={{ color: textSub }}>
                    {t('address.deleteCannotUndo')}
                  </p>
                </div>
              </div>
              <p className="text-sm mb-5" style={{ color: textSub }}>
                {t('address.deleteConfirm')}
              </p>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold"
                  style={{
                    background: darkMode ? COLORS.darkSubtle : COLORS.surface,
                    color: textSub,
                    border: `1px solid ${cardBorder}`,
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${COLORS.danger}, #DC2626)` }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t('common.delete')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          ADD / EDIT FORM MODAL
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col"
            style={{ background: bgColor }}
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
            dir={direction}
          >
            {/* Form Header with gradient */}
            <div
              className="relative overflow-hidden flex items-center justify-between px-4 pt-4 pb-4"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primary}, ${COLORS.tealDark})`,
              }}
            >
              {/* Decorative circle */}
              <div
                className="absolute -top-6 -end-6 w-24 h-24 rounded-full"
                style={{ background: `radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)` }}
              />

              <div className="flex items-center gap-3 relative z-10">
                <motion.button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={18} className="text-white" />
                </motion.button>
                <h2 className="text-white font-bold text-lg">
                  {editingId
                    ? t('address.editAddress')
                    : t('address.addNewAddress')
                  }
                </h2>
              </div>
            </div>

            {/* Form content */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
              {/* Label selector */}
              <div>
                <label className="block text-sm font-bold mb-2.5" style={{ color: darkMode ? COLORS.teal : COLORS.primary }}>
                  {t('address.addressLabel')}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {LABEL_OPTIONS.map((opt) => {
                    const OptIcon = opt.icon;
                    const isSelected = formLabel === opt.key;
                    return (
                      <motion.button
                        key={opt.key}
                        onClick={() => setFormLabel(opt.key)}
                        className="rounded-2xl py-3 flex flex-col items-center gap-1.5 text-xs font-semibold"
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, rgba(${opt.key === 'home' ? '0,168,204' : opt.key === 'work' ? '0,137,123' : '212,168,67'},0.12), rgba(${opt.key === 'home' ? '0,137,123' : opt.key === 'work' ? '0,75,99' : '212,168,67'},0.12))`
                            : darkMode ? COLORS.darkSubtle : COLORS.surface,
                          border: `2px solid ${isSelected ? opt.color : cardBorder}`,
                          color: isSelected ? opt.color : COLORS.textDisabled,
                          boxShadow: isSelected ? `0 2px 12px ${opt.color}15` : 'none',
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <OptIcon size={20} style={{ color: isSelected ? opt.color : COLORS.textDisabled }} />
                        <span>{t(opt.key === 'home' ? 'mobile.address.home' : opt.key === 'work' ? 'mobile.address.work' : 'mobile.address.other')}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Address textarea */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? COLORS.teal : COLORS.primary }}>
                  {t('address.addressField')}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <textarea
                  value={formAddress}
                  onChange={(e) => { setFormAddress(e.target.value); if (formErrors.address) setFormErrors((p) => ({ ...p, address: '' })); }}
                  placeholder={t('address.addressPlaceholder')}
                  rows={3}
                  className="w-full py-3 px-4 rounded-2xl text-sm resize-none outline-none placeholder:text-gray-400"
                  style={{
                    background: darkMode ? COLORS.darkSubtle : 'rgba(255,255,255,0.8)',
                    border: `2px solid ${formErrors.address ? COLORS.danger : cardBorder}`,
                    color: textMain,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                />
                {formErrors.address && (
                  <motion.p className="text-xs mt-1 font-medium" style={{ color: COLORS.danger }} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    {formErrors.address}
                  </motion.p>
                )}
              </div>

              {/* City dropdown */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? COLORS.teal : COLORS.primary }}>
                  {t('common.city')}
                  <span className="text-red-500 ms-1">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formCity}
                    onChange={(e) => { setFormCity(e.target.value); if (formErrors.city) setFormErrors((p) => ({ ...p, city: '' })); }}
                    className="w-full py-3.5 px-4 rounded-2xl text-sm outline-none appearance-none"
                    style={{
                      background: darkMode ? COLORS.darkSubtle : 'rgba(255,255,255,0.8)',
                      border: `2px solid ${formErrors.city ? COLORS.danger : cardBorder}`,
                      color: textMain,
                      textAlign: isRTL ? 'right' : 'left',
                    }}
                    dir={direction}
                  >
                    <option value="">{t('address.selectCity')}</option>
                    {LIBYAN_CITIES.map((city) => (
                      <option key={city.en} value={isRTL ? city.ar : city.en}>
                        {isRTL ? city.ar : city.en}
                      </option>
                    ))}
                  </select>
                  <div className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ [isRTL ? 'left' : 'right']: 12, color: darkMode ? COLORS.teal : COLORS.primary }}>
                    <ChevronDown size={16} />
                  </div>
                </div>
                {formErrors.city && (
                  <motion.p className="text-xs mt-1 font-medium" style={{ color: COLORS.danger }} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    {formErrors.city}
                  </motion.p>
                )}
              </div>

              {/* Area input */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? COLORS.teal : COLORS.primary }}>
                  {t('common.area')}
                </label>
                <input
                  type="text"
                  value={formArea}
                  onChange={(e) => setFormArea(e.target.value)}
                  placeholder={t('address.areaPlaceholder')}
                  className="w-full py-3 px-4 rounded-2xl text-sm outline-none placeholder:text-gray-400"
                  style={{
                    background: darkMode ? COLORS.darkSubtle : 'rgba(255,255,255,0.8)',
                    border: `2px solid ${cardBorder}`,
                    color: textMain,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                  dir={direction}
                />
              </div>

              {/* Notes input */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: darkMode ? COLORS.teal : COLORS.primary }}>
                  {t('common.notes')}
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={t('address.notesPlaceholder')}
                  className="w-full py-3 px-4 rounded-2xl text-sm outline-none placeholder:text-gray-400"
                  style={{
                    background: darkMode ? COLORS.darkSubtle : 'rgba(255,255,255,0.8)',
                    border: `2px solid ${cardBorder}`,
                    color: textMain,
                    textAlign: isRTL ? 'right' : 'left',
                  }}
                  dir={direction}
                />
              </div>

              {/* Set as default checkbox */}
              <motion.button
                onClick={() => setFormIsDefault(!formIsDefault)}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl"
                style={{
                  background: formIsDefault
                    ? `linear-gradient(135deg, rgba(212,168,67,0.08), rgba(212,168,67,0.04))`
                    : darkMode ? COLORS.darkSubtle : COLORS.surface,
                  border: `1.5px solid ${formIsDefault ? `${COLORS.gold}30` : cardBorder}`,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: formIsDefault ? `linear-gradient(135deg, ${COLORS.gold}, #E8B84A)` : 'transparent',
                    border: formIsDefault ? 'none' : `2px solid ${cardBorder}`,
                  }}
                  animate={{ scale: formIsDefault ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {formIsDefault && <Check size={12} className="text-white" strokeWidth={3} />}
                </motion.div>
                <span className="text-sm font-medium" style={{ color: formIsDefault ? COLORS.gold : textSub }}>
                  {t('address.setAsDefault')}
                </span>
                <Star size={14} style={{ color: COLORS.gold, marginLeft: 'auto', marginRight: isRTL ? 0 : 'auto' }} fill={formIsDefault ? COLORS.gold : 'none'} />
              </motion.button>
            </div>

            {/* Save button */}
            <div className="px-4 pb-4 pt-2">
              <motion.button
                onClick={handleSave}
                className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`,
                  boxShadow: `0 4px 20px ${COLORS.teal}30`,
                }}
                whileHover={{ scale: 1.02, boxShadow: `0 6px 28px ${COLORS.teal}40` }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }}
                />
                <Navigation size={18} className="relative z-10" />
                <span className="relative z-10">
                  {editingId
                    ? t('address.saveChanges')
                    : t('address.saveAddress')
                  }
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
