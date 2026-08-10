'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '../lib/mobile-store';
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  MapPin,
  Globe,
  ExternalLink,
  Check,
} from 'lucide-react';

// ─── FAQ Data ──────────────────────────────────────────────────────
const faqItems = [
  { qKey: 'mobile.contact.faq1Q', aKey: 'mobile.contact.faq1A' },
  { qKey: 'mobile.contact.faq2Q', aKey: 'mobile.contact.faq2A' },
  { qKey: 'mobile.contact.faq3Q', aKey: 'mobile.contact.faq3A' },
  { qKey: 'mobile.contact.faq4Q', aKey: 'mobile.contact.faq4A' },
  { qKey: 'mobile.contact.faq5Q', aKey: 'mobile.contact.faq5A' },
] as const;

// ─── Animation Variants ────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const },
  }),
};

const faqContentVariants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: 0.25, ease: 'easeInOut' as const } },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

// ═══════════════════════════════════════════════════════════════════════
// CONTACT SCREEN
// ═══════════════════════════════════════════════════════════════════════
export function ContactScreen() {
  const { language, t } = useLanguageStore();
  const setScreen = useMobileStore((s) => s.setScreen);
  const openWebview = useMobileStore((s) => s.openWebview);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  // FAQ expanded state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleBack = () => {
    useMobileStore.getState().setScreen('main');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError(t('mobile.contact.fillFields'));
      return;
    }
    setFormError('');
    setSending(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div
      dir={direction}
      className="flex flex-col h-full min-h-0 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #003545 0%, #004B63 50%, #00897B 100%)',
      }}
    >
      {/* ─── Gradient Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 pt-12 pb-6"
      >
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="absolute top-12 z-10 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            [isRtl ? 'right' : 'left']: 16,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {isRtl ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* Title */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <MessageCircle className="w-7 h-7 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-white"
          >
            {t('mobile.contact.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/70 mt-1"
          >
            {t('mobile.contact.subtitle')}
          </motion.p>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-4 right-8 w-20 h-20 rounded-full opacity-10 bg-white" />
        <div className="absolute top-16 left-4 w-12 h-12 rounded-full opacity-5 bg-white" />
      </motion.div>

      {/* ─── Content ─── */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#0B1120] rounded-t-3xl overflow-hidden">
        <div className="p-4 pb-8 flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {/* ─── Contact Methods ─── */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Phone */}
            <motion.a
              href="tel:+218911234567"
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0,75,99,0.06), rgba(0,137,123,0.06))',
                border: '1px solid rgba(0,75,99,0.08)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
              >
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                {t('mobile.contact.phone')}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400" dir="ltr">
                091 1234567
              </span>
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              href="https://wa.me/218911234567"
              target="_blank"
              rel="noopener noreferrer"
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(37,211,102,0.06), rgba(37,211,102,0.1))',
                border: '1px solid rgba(37,211,102,0.12)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                {t('mobile.contact.whatsapp')}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400" dir="ltr">
                091 1234567
              </span>
            </motion.a>

            {/* Email */}
            <motion.a
              href="mailto:support@nabdlibya.com"
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(255,111,97,0.06), rgba(255,111,97,0.1))',
                border: '1px solid rgba(255,111,97,0.12)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #FF6F61, #CC5045)' }}
              >
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                {t('mobile.contact.email')}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400" dir="ltr">
                support@nabdlibya.com
              </span>
            </motion.a>

            {/* Location */}
            <motion.div
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0,168,204,0.06), rgba(0,168,204,0.1))',
                border: '1px solid rgba(0,168,204,0.12)',
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00A8CC, #00897B)' }}
              >
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                {t('mobile.contact.location')}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {language === 'ar' ? 'طرابلس، ليبيا' : 'Tripoli, Libya'}
              </span>
            </motion.div>
          </div>

          {/* ─── Social Media ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-[#00897B]" />
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {t('mobile.contact.socialMedia')}
              </span>
            </div>
            <div className="flex gap-3">
              {/* Facebook */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => openWebview('https://facebook.com/nabdalmadina', 'Facebook')}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #1877F2, #0D5BBF)',
                }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </motion.button>
              {/* Instagram */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => openWebview('https://instagram.com/nabdalmadina', 'Instagram')}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #E4405F, #833AB4)',
                }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </motion.button>
              {/* Twitter / X */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => openWebview('https://twitter.com/nabdalmadina', 'X (Twitter)')}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #14171A, #333)',
                }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.button>
              {/* YouTube */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => openWebview('https://youtube.com/@nabdalmadina', 'YouTube')}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FF0000, #CC0000)',
                }}
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </motion.button>
            </div>
          </motion.div>

          {/* ─── Business Hours ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-5 rounded-2xl p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(0,75,99,0.04), rgba(0,137,123,0.04))',
              border: '1px solid rgba(0,75,99,0.08)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
              >
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {t('mobile.contact.businessHours')}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('mobile.contact.satThu')}
                </span>
                <span
                  className="text-sm font-semibold px-3 py-1 rounded-lg"
                  style={{
                    background: 'rgba(35,134,54,0.1)',
                    color: '#238636',
                  }}
                  dir="ltr"
                >
                  {t('mobile.contact.time9to9')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('mobile.contact.friday')}
                </span>
                <span
                  className="text-sm font-semibold px-3 py-1 rounded-lg"
                  style={{
                    background: 'rgba(210,153,34,0.1)',
                    color: '#D29922',
                  }}
                  dir="ltr"
                >
                  {t('mobile.contact.time2to9')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ─── Contact Form ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
              >
                <Send className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {t('mobile.contact.formTitle')}
              </span>
            </div>

            {sent ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(35,134,54,0.06), rgba(35,134,54,0.1))',
                  border: '1px solid rgba(35,134,54,0.15)',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 12 }}
                  className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #238636, #2EA043)' }}
                >
                  <Check className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">
                  {t('mobile.contact.sent')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('mobile.contact.sentDesc')}
                </p>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSent(false)}
                  className="mt-4 text-sm font-semibold px-4 py-2 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #004B63, #00897B)',
                    color: '#fff',
                  }}
                >
                  {language === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}
                </motion.button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    {t('mobile.contact.name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFormError(''); }}
                    placeholder={t('mobile.contact.namePlaceholder')}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#00897B]/30 bg-gray-50 dark:bg-[#151D2E] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[#1E2A42] focus:border-[#00897B]"
                    dir={direction}
                  />
                </div>

                {/* Email field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    {t('mobile.contact.emailLabel')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                    placeholder={t('mobile.contact.emailPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#00897B]/30 bg-gray-50 dark:bg-[#151D2E] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[#1E2A42] focus:border-[#00897B]"
                    dir="ltr"
                  />
                </div>

                {/* Message field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    {t('mobile.contact.message')}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); setFormError(''); }}
                    placeholder={t('mobile.contact.messagePlaceholder')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#00897B]/30 bg-gray-50 dark:bg-[#151D2E] text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-[#1E2A42] focus:border-[#00897B] resize-none"
                    dir={direction}
                  />
                </div>

                {/* Error */}
                <AnimatePresence>
                  {formError && (
                    <motion.p
                      initial={{ opacity: 0, x: [0, -6, 6, -6, 6, 0] }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-[#FF3B30] font-medium"
                    >
                      {formError}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={sending}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    background: sending
                      ? 'linear-gradient(135deg, #666, #888)'
                      : 'linear-gradient(135deg, #004B63, #00897B)',
                  }}
                >
                  {sending ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' as const }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      {t('mobile.contact.sending')}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('mobile.contact.send')}
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* ─── FAQ Section ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {t('mobile.contact.faq')}
              </span>
            </div>

            <div className="space-y-2">
              {faqItems.map((item, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <motion.div
                    key={index}
                    custom={index + 5}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-2xl overflow-hidden transition-all"
                    style={{
                      background: isExpanded
                        ? 'linear-gradient(135deg, rgba(0,75,99,0.06), rgba(0,137,123,0.06))'
                        : 'linear-gradient(135deg, rgba(0,75,99,0.02), rgba(0,137,123,0.02))',
                      border: isExpanded
                        ? '1px solid rgba(0,137,123,0.15)'
                        : '1px solid rgba(0,75,99,0.06)',
                    }}
                  >
                    {/* Question */}
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-right"
                    >
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex-1">
                        {t(item.qKey)}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="shrink-0 mx-2"
                      >
                        <ChevronDown className="w-4 h-4 text-[#00897B]" />
                      </motion.div>
                    </button>

                    {/* Answer */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key={`faq-answer-${index}`}
                          variants={faqContentVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4">
                            <div className="h-px mb-3" style={{ background: 'rgba(0,75,99,0.08)' }} />
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                              {t(item.aKey)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Bottom spacer */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
