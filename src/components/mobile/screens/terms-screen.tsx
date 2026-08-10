'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '../lib/mobile-store';
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  BookOpen,
  Users,
  UserCheck,
  Tag,
  ShoppingCart,
  Truck,
  RotateCcw,
  Shield,
  Scale,
  Edit3,
  Gavel,
} from 'lucide-react';

// ─── Section Data ────────────────────────────────────────────────────
const sections = [
  {
    id: 'intro',
    titleAr: 'مقدمة',
    titleEn: 'Introduction',
    icon: BookOpen,
    contentAr:
      'مرحباً بكم في تطبيق نبض المدينة. تحكم هذه الشروط والأحكام استخدامك لتطبيق وموقع نبض المدينة الإلكتروني. باستخدامك للتطبيق، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام التطبيق.',
    contentEn:
      'Welcome to the Nabd Al-Madina app. These Terms and Conditions govern your use of the Nabd Al-Madina mobile application and website. By using the app, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use the app.',
  },
  {
    id: 'definitions',
    titleAr: 'التعريف',
    titleEn: 'Definitions',
    icon: FileText,
    contentAr:
      '"المنصة" تعني تطبيق وموقع نبض المدينة الإلكتروني. "البائع" يعني أي تاجر أو مورد يعرض منتجاته على المنصة. "المستخدم" أو "العميل" يعني أي شخص يستخدم المنصة. "المنتجات" تعني السلع والخدمات المعروضة للبيع على المنصة. "الطلب" يعني طلب شراء منتجات من خلال المنصة.',
    contentEn:
      '"Platform" means the Nabd Al-Madina app and website. "Seller" means any merchant or supplier offering products on the Platform. "User" or "Customer" means any person using the Platform. "Products" means goods and services offered for sale on the Platform. "Order" means a purchase request for products through the Platform.',
  },
  {
    id: 'terms-of-use',
    titleAr: 'شروط الاستخدام',
    titleEn: 'Terms of Use',
    icon: BookOpen,
    contentAr:
      'يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام المنصة. يُحظر استخدام المنصة لأي غرض غير قانوني أو غير مصرح به. يجب عليك تقديم معلومات صحيحة ودقيقة عند التسجيل. أنت مسؤول عن الحفاظ على سرية حسابك وكلمة المرور الخاصة بك. نبض المدينة غير مسؤول عن أي أضرار ناتجة عن استخدام غير مصرح لحسابك.',
    contentEn:
      'You must be 18 years or older to use the Platform. It is prohibited to use the Platform for any illegal or unauthorized purpose. You must provide true and accurate information when registering. You are responsible for maintaining the confidentiality of your account and password. Nabd Al-Madina is not responsible for any damages resulting from unauthorized use of your account.',
  },
  {
    id: 'accounts',
    titleAr: 'الحسابات والتسجيل',
    titleEn: 'Accounts & Registration',
    icon: UserCheck,
    contentAr:
      'للتسوق على المنصة، يجب عليك إنشاء حساب باستخدام رقم هاتف ليبي صالح. أنت مسؤول عن تحديث معلومات حسابك والحفاظ على دقتها. يحق لنبض المدينة تعليق أو إلغاء أي حساب يخالف هذه الشروط. لا يجوز لك استخدام حساب شخص آخر دون إذن منه.',
    contentEn:
      'To shop on the Platform, you must create an account using a valid Libyan phone number. You are responsible for keeping your account information up to date and accurate. Nabd Al-Madina reserves the right to suspend or cancel any account that violates these terms. You may not use another person\'s account without their permission.',
  },
  {
    id: 'products-pricing',
    titleAr: 'المنتجات والأسعار',
    titleEn: 'Products & Pricing',
    icon: Tag,
    contentAr:
      'نبذل قصارى جهدنا لعرض الأسعار والمعلومات الدقيقة للمنتجات. قد تحدث أخطاء في الأسعار أو الوصف، وفي هذه الحالة نحتفظ بالحق في إلغاء الطلب وإخطارك بذلك. جميع الأسعار معروضة بالدينار الليبي. قد تتغير الأسعار دون إشعار مسبق. الصور المعروضة للمنتجات هي لأغراض توضيحية وقد تختلف قليلاً عن المنتج الفعلي.',
    contentEn:
      'We make our best effort to display accurate prices and product information. Errors in pricing or description may occur, and in such cases, we reserve the right to cancel the order and notify you. All prices are displayed in Libyan Dinars (LYD). Prices may change without prior notice. Product images are for illustrative purposes and may differ slightly from the actual product.',
  },
  {
    id: 'orders-payment',
    titleAr: 'الطلبات والدفع',
    titleEn: 'Orders & Payment',
    icon: ShoppingCart,
    contentAr:
      'عند تقديم طلب، فإنك تؤكد رغبتك في شراء المنتجات المحددة. الدفع متاح عبر طرق الدفع المعتمدة على المنصة بما في ذلك الدفع عند الاستلام. يتم تأكيد الطلب بعد التواصل معك من قبل فريق خدمة العملاء. نبض المدينة تحتفظ بالحق في رفض أي طلب لأسباب مشروعة.',
    contentEn:
      'When placing an order, you confirm your intention to purchase the selected products. Payment is available through approved methods on the Platform including Cash on Delivery. The order is confirmed after contact by our customer service team. Nabd Al-Madina reserves the right to refuse any order for legitimate reasons.',
  },
  {
    id: 'delivery-shipping',
    titleAr: 'التوصيل والشحن',
    titleEn: 'Delivery & Shipping',
    icon: Truck,
    contentAr:
      'نوفر خدمة التوصيل لمعظم مناطق ليبيا. تختلف رسوم التوصيل ومدة التسليم حسب المنطقة الجغرافية. المدة المتوقعة للتوصيل هي من 1 إلى 5 أيام عمل حسب المنطقة. نبض المدينة غير مسؤولة عن التأخير الناتج عن ظروف خارجة عن إرادتنا مثل الظروف الجوية أو الأحداث الأمنية.',
    contentEn:
      'We provide delivery service to most areas in Libya. Delivery fees and timeframes vary by geographic area. Expected delivery time is 1 to 5 business days depending on the area. Nabd Al-Madina is not responsible for delays caused by circumstances beyond our control such as weather conditions or security events.',
  },
  {
    id: 'return-policy-ref',
    titleAr: 'سياسة الاسترجاع',
    titleEn: 'Return Policy',
    icon: RotateCcw,
    contentAr:
      'يرجى الرجوع إلى سياسة الاسترجاع الخاصة بنا للحصول على تفاصيل كاملة حول شروط وإجراءات الاسترجاع والاستبدال. تُطبق شروط الاسترجاع على جميع المنتجات المشتراة من المنصة وفقاً لسياسة الاسترجاع المعمول بها.',
    contentEn:
      'Please refer to our Return Policy for complete details on return and exchange terms and procedures. Return conditions apply to all products purchased from the Platform in accordance with the applicable Return Policy.',
  },
  {
    id: 'privacy',
    titleAr: 'الخصوصية وحماية البيانات',
    titleEn: 'Privacy & Data Protection',
    icon: Shield,
    contentAr:
      'نلتزم بحماية خصوصيتك وبياناتك الشخصية. يرجى الرجوع إلى سياسة الخصوصية الخاصة بنا لفهم كيفية جمع واستخدام وحماية معلوماتك الشخصية. باستخدامك للمنصة، فإنك توافق على جمع ومعالجة بياناتك الشخصية وفقاً لسياسة الخصوصية.',
    contentEn:
      'We are committed to protecting your privacy and personal data. Please refer to our Privacy Policy to understand how we collect, use, and protect your personal information. By using the Platform, you agree to the collection and processing of your personal data in accordance with the Privacy Policy.',
  },
  {
    id: 'liability',
    titleAr: 'المسؤولية',
    titleEn: 'Liability',
    icon: Scale,
    contentAr:
      'نبض المدينة تعمل كوسيط بين البائعين والمشترين. لا نضمن جودة أو سلامة المنتجات المباعة من قبل البائعين، رغم أننا نتخذ إجراءات للتأكد من التزام البائعين بمعايير الجودة. مسؤوليتنا المالية تجاهك محودة بما دفعته للمنصة ولا تشمل الأضرار غير المباشرة أو التبعية.',
    contentEn:
      'Nabd Al-Madina acts as an intermediary between sellers and buyers. We do not guarantee the quality or safety of products sold by sellers, although we take measures to ensure sellers comply with quality standards. Our financial liability to you is limited to what you paid to the Platform and does not include indirect or consequential damages.',
  },
  {
    id: 'modifications',
    titleAr: 'التعديلات',
    titleEn: 'Modifications',
    icon: Edit3,
    contentAr:
      'يحق لنبض المدينة تعديل هذه الشروط والأحكام في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر التطبيق أو البريد الإلكتروني. استمرارك في استخدام المنصة بعد نشر التعديلات يعني موافقتك على الشروط المعدلة.',
    contentEn:
      'Nabd Al-Madina reserves the right to modify these Terms and Conditions at any time. You will be notified of any material changes via the app or email. Your continued use of the Platform after the modifications are published means you agree to the amended terms.',
  },
  {
    id: 'governing-law',
    titleAr: 'القانون المعمول به',
    titleEn: 'Governing Law',
    icon: Gavel,
    contentAr:
      'تخضع هذه الشروط والأحكام وتُفسر وفقاً لقوانين دولة ليبيا. في حال نشوء أي نزاع، يتم حله وفقاً للقانون الليبي ويخضع للاختصاص القضائي للمحاكم الليبية المختصة.',
    contentEn:
      'These Terms and Conditions are governed by and construed in accordance with the laws of Libya. In the event of any dispute, it shall be resolved in accordance with Libyan law and subject to the jurisdiction of the competent Libyan courts.',
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
// TERMS & CONDITIONS SCREEN
// ═══════════════════════════════════════════════════════════════════════
export function TermsScreen() {
  const { language, t } = useLanguageStore();
  const { setScreen, setActiveTab } = useMobileStore();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
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
            <FileText className="w-7 h-7 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-white"
          >
            {t('mobile.terms.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-white/70 mt-1"
          >
            {language === 'ar'
              ? 'آخر تحديث: مارس 2025'
              : 'Last updated: March 2025'}
          </motion.p>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-4 right-8 w-20 h-20 rounded-full opacity-10 bg-white" />
        <div className="absolute top-16 left-4 w-12 h-12 rounded-full opacity-5 bg-white" />
      </motion.div>

      {/* ─── Content ─── */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#0B1120] rounded-t-3xl overflow-hidden">
        <div className="p-4 pb-8 flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {/* Intro card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,75,99,0.08), rgba(0,137,123,0.08))',
            }}
          >
            <Shield className="w-4 h-4 text-[#00897B] shrink-0" />
            <p className="text-xs text-[#004B63] dark:text-[#00897B]">
              {language === 'ar'
                ? 'يرجى قراءة هذه الشروط بعناية قبل استخدام التطبيق'
                : 'Please read these terms carefully before using the app'}
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-3">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const title = language === 'ar' ? section.titleAr : section.titleEn;
              const content = language === 'ar' ? section.contentAr : section.contentEn;

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
                      {index + 1}. {title}
                    </h3>
                  </div>

                  {/* Section content */}
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 pr-1">
                    {content}
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
              {language === 'ar'
                ? 'لأي استفسارات حول الشروط والأحكام، تواصل معنا عبر التطبيق'
                : 'For any questions about the Terms & Conditions, contact us through the app'}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
