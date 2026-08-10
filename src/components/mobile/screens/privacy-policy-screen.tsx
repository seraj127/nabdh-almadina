'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Eye,
  Lock,
  Database,
  UserCheck,
  Bell,
  Share2,
  Globe,
  Server,
  Trash2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  FileText,
  Fingerprint,
  ShieldAlert,
  CalendarDays,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { useMobileStore } from '../lib/mobile-store';

// ─── Brand Colors ──────────────────────────────────────────────────────

const BRAND = {
  primary: '#004B63',
  primaryLight: '#006B8A',
  accent: '#00A8CC',
  secondary: '#FF6F61',
  teal: '#00897B',
  gold: '#D4A843',
  success: '#238636',
  warning: '#D29922',
  error: '#FF3B30',
  surface: '#F8F9FA',
  border: '#E5E5E5',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textDisabled: '#999999',
};

// ─── Animation Variants ────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 220, damping: 22 },
  },
} as const;

const cardStyle = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${BRAND.border}`,
  boxShadow: '0 2px 16px rgba(0,0,0,0.05), 0 8px 32px rgba(0,75,99,0.04)',
};

// ─── Section Data ──────────────────────────────────────────────────────

interface PrivacySection {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: React.ElementType;
  color: string;
  contentAr: string[];
  contentEn: string[];
}

const SECTIONS: PrivacySection[] = [
  {
    id: 'collection',
    titleAr: 'البيانات التي نجمعها',
    titleEn: 'Data We Collect',
    icon: Database,
    color: BRAND.accent,
    contentAr: [
      'البيانات الشخصية: الاسم الكامل، رقم الهاتف، البريد الإلكتروني (اختياري)، عنوان التوصيل.',
      'بيانات الطلبات: سجل المشتريات، المفضلة، المنتجات التي تم تصفحها.',
      'بيانات الجهاز: نوع الجهاز، نظام التشغيل، معرف الجهاز الفريد لأغراض الأمان.',
      'بيانات الموقع: نستخدم موقعك لتقديم خدمات توصيل مخصصة وتحديد مناطق التوصيل المتاحة.',
    ],
    contentEn: [
      'Personal Data: Full name, phone number, email (optional), delivery address.',
      'Order Data: Purchase history, favorites, browsed products.',
      'Device Data: Device type, operating system, unique device identifier for security purposes.',
      'Location Data: We use your location to provide personalized delivery services and determine available delivery zones.',
    ],
  },
  {
    id: 'usage',
    titleAr: 'كيف نستخدم بياناتك',
    titleEn: 'How We Use Your Data',
    icon: Eye,
    color: BRAND.teal,
    contentAr: [
      'معالجة طلباتك وتوصيلها إلى العنوان المحدد.',
      'التواصل معك بخصوص حالة الطلب والتحديثات المهمة.',
      'تحسين تجربة المستخدم وتخصيص المحتوى والعروض.',
      'منع الاحتيال وحماية أمن حسابك وبياناتك المالية.',
      'الامتثال للمتطلبات القانونية والتنظيمية في ليبيا.',
    ],
    contentEn: [
      'Processing your orders and delivering them to the specified address.',
      'Communicating with you about order status and important updates.',
      'Improving user experience and personalizing content and offers.',
      'Preventing fraud and protecting the security of your account and financial data.',
      'Complying with legal and regulatory requirements in Libya.',
    ],
  },
  {
    id: 'protection',
    titleAr: 'حماية بياناتك',
    titleEn: 'Data Protection',
    icon: Lock,
    color: BRAND.primaryLight,
    contentAr: [
      'نستخدم تشفير SSL/TLS لحماية جميع البيانات أثناء النقل.',
      'يتم تخزين كلمات المرور بشكل مشفر باستخدام خوارزميات تجزئة آمنة.',
      'نطبق ضوابط وصول صارمة لضمان وصول الموظفين المصرح لهم فقط إلى بياناتك.',
      'نجري عمليات تدقيق أمني دورية لضمان سلامة أنظمتنا.',
    ],
    contentEn: [
      'We use SSL/TLS encryption to protect all data in transit.',
      'Passwords are stored encrypted using secure hashing algorithms.',
      'We apply strict access controls to ensure only authorized personnel can access your data.',
      'We conduct periodic security audits to ensure the integrity of our systems.',
    ],
  },
  {
    id: 'sharing',
    titleAr: 'مشاركة البيانات',
    titleEn: 'Data Sharing',
    icon: Share2,
    color: BRAND.secondary,
    contentAr: [
      'لا نبيع بياناتك الشخصية لأي طرف ثالث.',
      'نشارك بياناتك مع شركاء التوصيل فقط لتنفيذ طلباتك.',
      'قد نشارك بيانات مجهولة الهوية لأغراض إحصائية وتحليلية.',
      'في حالة الاندماج أو الاستحواذ، سيتم إخطارك قبل نقل بياناتك.',
    ],
    contentEn: [
      'We do not sell your personal data to any third party.',
      'We share your data with delivery partners only to fulfill your orders.',
      'We may share anonymized data for statistical and analytical purposes.',
      'In case of merger or acquisition, you will be notified before your data is transferred.',
    ],
  },
  {
    id: 'cookies',
    titleAr: 'ملفات تعريف الارتباط',
    titleEn: 'Cookies & Tracking',
    icon: Fingerprint,
    color: BRAND.gold,
    contentAr: [
      'نستخدم ملفات تعريف الارتباط الأساسية لضمان عمل التطبيق بشكل صحيح.',
      'ملفات تعريف الارتباط التحليلية تساعدنا في فهم كيفية استخدام التطبيق.',
      'يمكنك تعطيل ملفات تعريف الارتباط غير الأساسية من إعدادات جهازك.',
      'لا نستخدم ملفات تعريف ارتباط لتتبعك عبر مواقع أخرى.',
    ],
    contentEn: [
      'We use essential cookies to ensure the app functions properly.',
      'Analytical cookies help us understand how the app is being used.',
      'You can disable non-essential cookies from your device settings.',
      'We do not use cookies to track you across other websites.',
    ],
  },
  {
    id: 'rights',
    titleAr: 'حقوقك',
    titleEn: 'Your Rights',
    icon: UserCheck,
    color: BRAND.success,
    contentAr: [
      'حق الوصول: يمكنك طلب نسخة من بياناتك الشخصية المخزنة لدينا.',
      'حق التصحيح: يمكنك تحديث أو تصحيح بياناتك في أي وقت.',
      'حق الحذف: يمكنك طلب حذف بياناتك الشخصية بالكامل.',
      'حق الاعتراض: يمكنك الاعتراض على معالجة بياناتك لأغراض تسويقية.',
      'حق النقل: يمكنك طلب نقل بياناتك بصيغة قابلة للقراءة.',
    ],
    contentEn: [
      'Right of Access: You can request a copy of your personal data stored with us.',
      'Right to Rectification: You can update or correct your data at any time.',
      'Right to Erasure: You can request complete deletion of your personal data.',
      'Right to Object: You can object to the processing of your data for marketing purposes.',
      'Right to Portability: You can request your data in a readable format.',
    ],
  },
  {
    id: 'retention',
    titleAr: 'الاحتفاظ بالبيانات',
    titleEn: 'Data Retention',
    icon: Server,
    color: BRAND.warning,
    contentAr: [
      'نحتفظ ببياناتك الشخصية طوال فترة نشاط حسابك.',
      'في حالة إغلاق الحساب، نحتفظ ببعض البيانات لمدة تصل إلى سنة لأغراض قانونية.',
      'يتم حذف البيانات المالية بعد 5 سنوات وفقاً للمتطلبات المحاسبية.',
      'يمكنك طلب حذف فوري لبياناتك مع مراعاة الالتزامات القانونية.',
    ],
    contentEn: [
      'We retain your personal data for as long as your account is active.',
      'If you close your account, we retain some data for up to one year for legal purposes.',
      'Financial data is deleted after 5 years in accordance with accounting requirements.',
      'You can request immediate deletion of your data, subject to legal obligations.',
    ],
  },
  {
    id: 'children',
    titleAr: 'خصوصية الأطفال',
    titleEn: 'Children\'s Privacy',
    icon: ShieldAlert,
    color: BRAND.error,
    contentAr: [
      'التطبيق مخصص للأشخاص الذين تزيد أعمارهم عن 18 عاماً.',
      'لا نجمع عمداً بيانات شخصية من القصر.',
      'إذا اكتشفنا أننا جمعنا بيانات من قاصر، سنقوم بحذفها فوراً.',
    ],
    contentEn: [
      'The app is intended for individuals aged 18 and above.',
      'We do not knowingly collect personal data from minors.',
      'If we discover we have collected data from a minor, we will delete it immediately.',
    ],
  },
  {
    id: 'deletion',
    titleAr: 'حذف البيانات',
    titleEn: 'Data Deletion',
    icon: Trash2,
    color: BRAND.primary,
    contentAr: [
      'يمكنك حذف حسابك وبياناتك من خلال التواصل مع خدمة العملاء.',
      'سيتم حذف بياناتك الشخصية خلال 30 يوماً من تقديم الطلب.',
      'ستبقى بعض البيانات المجولة الضرورية للامتثال القانوني.',
      'بعد الحذف، لن تتمكن من استعادة حسابك أو سجل طلباتك.',
    ],
    contentEn: [
      'You can delete your account and data by contacting customer service.',
      'Your personal data will be deleted within 30 days of the request.',
      'Some anonymized data necessary for legal compliance will remain.',
      'After deletion, you will not be able to recover your account or order history.',
    ],
  },
];

// ─── Expandable Section Component ──────────────────────────────────────

function ExpandableSection({ section, isRTL, defaultOpen = false }: { section: PrivacySection; isRTL: boolean; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const Icon = section.icon;
  const content = isRTL ? section.contentAr : section.contentEn;
  const title = isRTL ? section.titleAr : section.titleEn;

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={cardStyle}
      variants={itemVariants}
    >
      <motion.button
        className="w-full p-4 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${section.color}12` }}
          >
            <Icon size={18} style={{ color: section.color }} />
          </div>
          <div className="text-start">
            <h3 className="text-sm font-bold" style={{ color: BRAND.textPrimary }}>
              {title}
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: BRAND.textSecondary }}>
              {content.length} {isRTL ? 'بنود' : 'clauses'}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          {isRTL ? <ChevronUp size={18} style={{ color: BRAND.textDisabled }} /> : <ChevronDown size={18} style={{ color: BRAND.textDisabled }} />}
        </motion.div>
      </motion.button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' as const }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 space-y-3">
          {content.map((paragraph, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="mt-1.5 flex-shrink-0">
                <CircleDot size={6} style={{ color: section.color }} />
              </div>
              <p className="text-[13px] leading-relaxed flex-1" style={{ color: BRAND.textSecondary }}>
                {paragraph}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export function PrivacyPolicyScreen() {
  const { t, language } = useLanguageStore();
  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const setScreen = useMobileStore((s) => s.setScreen);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col overflow-hidden"
      dir={direction}
      style={{ background: BRAND.surface }}
      initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRTL ? -40 : 40 }}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 26 }}
    >
      {/* ═══ Hero Header ═══ */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #003545 0%, ${BRAND.teal} 50%, ${BRAND.primaryLight} 100%)`,
        }}
      >
        {/* Decorative orbs */}
        <motion.div
          className="absolute -top-12 -start-12 w-48 h-48 rounded-full"
          style={{ background: `radial-gradient(circle, ${BRAND.accent}18 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
        />
        <motion.div
          className="absolute -bottom-8 -end-8 w-36 h-36 rounded-full"
          style={{ background: `radial-gradient(circle, ${BRAND.success}12 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.5, 0.25] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const, delay: 1.5 }}
        />

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="privacy-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#privacy-grid)" />
          </svg>
        </div>

        {/* Wave SVG */}
        <svg className="absolute bottom-0 start-0 w-full" viewBox="0 0 430 24" preserveAspectRatio="none" style={{ height: 18 }}>
          <path d="M0 12 Q107 0 215 12 Q322 24 430 12 V24 H0 Z" fill={BRAND.surface} />
        </svg>

        {/* Header content */}
        <div className="relative z-10 px-4 pt-3 pb-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-4">
            <motion.button
              onClick={() => setScreen('main')}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              aria-label={isRTL ? 'رجوع' : 'Back'}
            >
              <BackArrow size={20} className="text-white" />
            </motion.button>

            {/* Badge */}
            <motion.div
              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5"
              style={{
                background: `${BRAND.teal}20`,
                color: '#4DB6AC',
                border: `1px solid ${BRAND.teal}30`,
                backdropFilter: 'blur(8px)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ShieldCheck size={12} />
              {isRTL ? 'محمي' : 'Protected'}
            </motion.div>
          </div>

          {/* Title */}
          <motion.div className="flex items-center gap-3 mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <KeyRound size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </h1>
              <p className="text-white/60 text-[11px] mt-0.5">
                {isRTL ? 'آخر تحديث: مارس 2025' : 'Last updated: March 2025'}
              </p>
            </div>
          </motion.div>

          {/* Quick summary */}
          <motion.p
            className="text-white/70 text-[12px] leading-relaxed mt-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isRTL
              ? 'نحن نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها.'
              : 'We take your privacy seriously. This policy explains how your data is collected, used, and protected.'}
          </motion.p>
        </div>
      </div>

      {/* ═══ Scrollable Content ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 -mt-1 pb-6" style={{ scrollBehavior: 'smooth' }}>
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Privacy Shield Card */}
          <motion.div
            className="rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, ${BRAND.teal}08, ${BRAND.success}06)`,
              border: `1px solid ${BRAND.teal}12`,
            }}
            variants={itemVariants}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${BRAND.success}12` }}
              >
                <ShieldCheck size={18} style={{ color: BRAND.success }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: BRAND.primary }}>
                  {isRTL ? 'التزامنا بالخصوصية' : 'Our Privacy Commitment'}
                </h3>
                <p className="text-[12px] leading-relaxed mt-1" style={{ color: BRAND.textSecondary }}>
                  {isRTL
                    ? 'نعمل بحسن نية لحماية بياناتك الشخصية وفقًا لأفضل الممارسات والمعايير الدولية.'
                    : 'We act in good faith to protect your personal data in accordance with best practices and international standards.'}
                </p>
              </div>
            </div>

            {/* Privacy indicators */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { icon: Lock, label: isRTL ? 'تشفير' : 'Encrypted', color: BRAND.accent },
                { icon: ShieldCheck, label: isRTL ? 'محمي' : 'Protected', color: BRAND.success },
                { icon: Globe, label: isRTL ? 'متوافق' : 'Compliant', color: BRAND.teal },
              ].map((item, i) => (
                <div key={i} className="text-center p-2 rounded-xl flex flex-col items-center" style={{ background: `${item.color}08` }}>
                  <item.icon size={14} style={{ color: item.color }} className="mb-1" />
                  <p className="text-[9px] font-bold" style={{ color: item.color }}>{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Expandable Sections */}
          {SECTIONS.map((section, i) => (
            <ExpandableSection
              key={section.id}
              section={section}
              isRTL={isRTL}
              defaultOpen={i === 0}
            />
          ))}

          {/* Contact Card */}
          <motion.div
            className="rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary}10, ${BRAND.accent}08)`,
              border: `1px solid ${BRAND.primary}20`,
            }}
            variants={itemVariants}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${BRAND.primary}15` }}
              >
                <Bell size={18} style={{ color: BRAND.primary }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: BRAND.primary }}>
                  {isRTL ? 'طلب بياناتك' : 'Request Your Data'}
                </h3>
                <p className="text-[11px]" style={{ color: BRAND.textSecondary }}>
                  {isRTL ? 'يمكنك طلب نسخة من بياناتك أو حذفها' : 'You can request a copy or deletion of your data'}
                </p>
              </div>
            </div>
            <motion.button
              className="w-full py-3 rounded-xl text-white text-sm font-bold"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})` }}
              whileTap={{ scale: 0.97 }}
            >
              {isRTL ? 'تواصل مع حماية البيانات' : 'Contact Data Protection'}
            </motion.button>
          </motion.div>

          {/* Bottom spacing */}
          <div className="h-4" />
        </motion.div>
      </div>
    </motion.div>
  );
}
