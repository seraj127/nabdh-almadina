'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '../lib/mobile-store';
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  PackageCheck,
  RefreshCw,
  ArrowLeftRight,
  Phone,
  AlertTriangle,
} from 'lucide-react';

// ─── Section Config (icons + translation keys) ────────────────────────
const sections = [
  {
    id: 'intro',
    titleKey: 'mobile.returnPolicy.introTitle',
    contentKey: 'mobile.returnPolicy.introContent',
    icon: BookOpen,
  },
  {
    id: 'return-conditions',
    titleKey: 'mobile.returnPolicy.conditionsTitle',
    contentKey: 'mobile.returnPolicy.conditionsContent',
    icon: CheckCircle,
  },
  {
    id: 'allowed-duration',
    titleKey: 'mobile.returnPolicy.durationTitle',
    contentKey: 'mobile.returnPolicy.durationContent',
    icon: Clock,
  },
  {
    id: 'non-returnable',
    titleKey: 'mobile.returnPolicy.nonReturnableTitle',
    contentKey: 'mobile.returnPolicy.nonReturnableContent',
    icon: XCircle,
  },
  {
    id: 'product-condition',
    titleKey: 'mobile.returnPolicy.productConditionTitle',
    contentKey: 'mobile.returnPolicy.productConditionContent',
    icon: PackageCheck,
  },
  {
    id: 'return-process',
    titleKey: 'mobile.returnPolicy.returnProcessTitle',
    contentKey: 'mobile.returnPolicy.returnProcessContent',
    icon: RefreshCw,
  },
  {
    id: 'refund',
    titleKey: 'mobile.returnPolicy.refundProcessTitle',
    contentKey: 'mobile.returnPolicy.refundProcessContent',
    icon: RotateCcw,
  },
  {
    id: 'exchange',
    titleKey: 'mobile.returnPolicy.exchangeTitle',
    contentKey: 'mobile.returnPolicy.exchangeContent',
    icon: ArrowLeftRight,
  },
  {
    id: 'contact',
    titleKey: 'mobile.returnPolicy.contactTitle',
    contentKey: 'mobile.returnPolicy.contactContent',
    icon: Phone,
  },
];

// ─── Animation Variants ──────────────────────────────────────────────
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

// ═══════════════════════════════════════════════════════════════════════
// RETURN POLICY SCREEN
// ═══════════════════════════════════════════════════════════════════════
export function ReturnPolicyScreen() {
  const { t } = useLanguageStore();
  const { setScreen, setActiveTab } = useMobileStore();
  const direction = useLanguageStore((s) => s.language) === 'ar' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  const handleBack = () => {
    setScreen('main');
    setActiveTab('profile');
  };

  return (
    <div
      dir={direction}
      className="flex flex-col h-full min-h-0 overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #003545 0%, #004B63 40%, #00897B 100%)',
      }}
    >
      {/* ─── Gradient Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 pt-4 pb-6"
      >
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="absolute top-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
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
            <RotateCcw className="w-7 h-7 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-white"
          >
            {t('mobile.returnPolicy.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/70 mt-1"
          >
            {t('mobile.returnPolicy.lastUpdated')}
          </motion.p>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-4 right-8 w-20 h-20 rounded-full opacity-10 bg-white" />
        <div className="absolute top-16 left-4 w-12 h-12 rounded-full opacity-5 bg-white" />
      </motion.div>

      {/* ─── Content ─── */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#0B1120] rounded-t-3xl overflow-hidden">
        <div className="p-4 pb-8 flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {/* Highlight card - 14 days */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-4 mb-4"
            style={{
              background: 'linear-gradient(135deg, #FF6F61, #E85D50)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">
                  {t('mobile.returnPolicy.daysReturn')}
                </p>
                <p className="text-white/80 text-xs mt-0.5">
                  {t('mobile.returnPolicy.fromDeliveryDate')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Warning card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,75,99,0.08), rgba(0,137,123,0.08))',
            }}
          >
            <AlertTriangle className="w-4 h-4 text-[#FF6F61] shrink-0" />
            <p className="text-xs text-[#004B63] dark:text-[#00897B]">
              {t('mobile.returnPolicy.warningNote')}
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-3">
            {sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <motion.div
                  key={section.id}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl p-4 transition-all"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(0,75,99,0.04), rgba(0,137,123,0.04))',
                    border: '1px solid rgba(0,75,99,0.08)',
                  }}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, #004B63, #00897B)',
                      }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">
                      {index + 1}. {t(section.titleKey)}
                    </h3>
                  </div>

                  {/* Section content */}
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 pr-1">
                    {t(section.contentKey)}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-4 border-t border-gray-200 dark:border-[#1E2A42]"
          >
            <p className="text-xs text-center text-gray-400 dark:text-[#6B7F96]">
              {t('mobile.returnPolicy.footerNote')}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
