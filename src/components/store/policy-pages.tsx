'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Calendar,
  BookOpen,
  Users,
  CreditCard,
  Brain,
  AlertTriangle,
  FileEdit,
  Scale,
  Database,
  Eye,
  Cookie,
  UserCheck,
  Share2,
  Phone,
  PackageCheck,
  Clock,
  XCircle,
  ListChecks,
  Wallet,
  ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ─── Shared Types ───────────────────────────────────────────────

interface PolicySection {
  icon: LucideIcon;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
}

interface PolicyPageProps {
  titleAr: string;
  titleEn: string;
  icon: LucideIcon;
  lastUpdatedAr: string;
  lastUpdatedEn: string;
  introAr: string;
  introEn: string;
  sections: PolicySection[];
  accentColor?: string;
}

// ─── Shared Policy Page Layout ──────────────────────────────────

function PolicyPageLayout({
  titleAr,
  titleEn,
  icon: PageIcon,
  lastUpdatedAr,
  lastUpdatedEn,
  introAr,
  introEn,
  sections,
}: PolicyPageProps) {
  const { language, direction, t } = useLanguageStore(useShallow((s) => ({ language: s.language, direction: s.direction, t: s.t })));
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => useUIStore.getState().clearAuthView()}
            className="mb-6 gap-2 text-muted-foreground hover:text-nabdh-primary hover:bg-nabdh-primary/5 transition-colors"
          >
            <BackArrow className="size-4" />
            {t('common.back')}
          </Button>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="size-14 rounded-2xl nabdh-gradient flex items-center justify-center shadow-lg shadow-nabdh-primary/20">
              <PageIcon className="size-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                {isAr ? titleAr : titleEn}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>{isAr ? lastUpdatedAr : lastUpdatedEn}</span>
              </div>
            </div>
          </div>

          {/* Intro */}
          <div className="bg-nabdh-primary/5 dark:bg-nabdh-primary/10 border border-nabdh-primary/10 rounded-xl p-4 sm:p-5">
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              {isAr ? introAr : introEn}
            </p>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-4">
          {sections.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.06 }}
                className="bg-card border border-border/50 rounded-xl p-5 sm:p-6 hover:border-nabdh-primary/20 hover:shadow-sm hover:shadow-nabdh-primary/5 transition-all duration-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="size-9 rounded-lg bg-nabdh-primary/10 dark:bg-nabdh-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <SectionIcon className="size-4.5 text-nabdh-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground pt-1">
                    {isAr ? section.titleAr : section.titleEn}
                  </h2>
                </div>
                <div className={cn('text-muted-foreground leading-relaxed text-sm sm:text-base', isRTL ? 'pe-12' : 'ps-12')}>
                  {isAr ? section.contentAr : section.contentEn}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 pt-6 border-t border-border/50 text-center"
        >
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} {t('common.allRightsReserved')} — نبض المدينة
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Terms Page ─────────────────────────────────────────────────

const termsSections: PolicySection[] = [
  {
    icon: BookOpen,
    titleAr: 'مقدمة',
    titleEn: 'Introduction',
    contentAr:
      'مرحباً بك في نبض المدينة. باستخدام موقعنا الإلكتروني أو تطبيقنا المحمول، فإنك توافق على الالتزام بهذه الشروط والأحكام. يُرجى قراءتها بعناية قبل إجراء أي عملية شراء. تنطبق هذه الشروط على جميع الزوار والمستخدمين والعملاء للمتجر الإلكتروني.',
    contentEn:
      'Welcome to Nabd Al-Madina. By using our website or mobile application, you agree to comply with these Terms and Conditions. Please read them carefully before making any purchase. These terms apply to all visitors, users, and customers of the online store.',
  },
  {
    icon: Users,
    titleAr: 'التعريفات',
    titleEn: 'Definitions',
    contentAr:
      '«المتجر» أو «نحن» يشير إلى نبض المدينة، المتجر الإلكتروني المسجل في ليبيا. «المستخدم» أو «أنت» يشير إلى أي شخص يتصفح أو يستخدم المتجر. «المنتجات» تشير إلى جميع السلع والخدمات المعروضة للبيع على المنصة. «الطلب» يشير إلى أي عملية شراء يتم إجراؤها عبر المتجر. «الخدمة» تشير إلى جميع الخدمات التي يقدمها المتجر بما في ذلك التوصيل والدعم.',
    contentEn:
      '"The Store" or "We" refers to Nabd Al-Madina, the online store registered in Libya. "The User" or "You" refers to any person browsing or using the store. "Products" refers to all goods and services offered for sale on the platform. "Order" refers to any purchase made through the store. "Service" refers to all services provided by the store including delivery and support.',
  },
  {
    icon: Shield,
    titleAr: 'شروط الاستخدام',
    titleEn: 'Terms of Use',
    contentAr:
      'يجب استخدام المتجر لأغراض مشروعة فقط وبطريقة لا تتعارض مع حقوق الآخرين. يُحظر استخدام المنصة لأي نشاط غير قانوني أو احتيالي. يجب أن تكون جميع المعلومات المقدمة صحيحة ودقيقة. نحتفظ بالحق في رفض الخدمة لأي شخص لا يلتزم بهذه الشروط. يُمنع محاولة الوصول غير المصرح به إلى أنظمة المتجر أو قواعد البيانات.',
    contentEn:
      'The store must be used for legitimate purposes only and in a manner that does not infringe on the rights of others. Using the platform for any illegal or fraudulent activity is prohibited. All information provided must be correct and accurate. We reserve the right to refuse service to anyone who does not comply with these terms. Attempting unauthorized access to the store systems or databases is forbidden.',
  },
  {
    icon: Users,
    titleAr: 'الحسابات والتسجيل',
    titleEn: 'Accounts & Registration',
    contentAr:
      'قد يتطلب بعض خدمات المتجر إنشاء حساب. أنت مسؤول عن الحفاظ على سرية بيانات حسابك وكلمة المرور. يجب عليك إعلامنا فوراً بأي استخدام غير مصرح به لحسابك. يُحظر إنشاء حسابات متعددة لنفس الشخص. يجب أن يكون عمرك 18 عاماً أو أكثر لإنشاء حساب. نحتفظ بالحق في تعليق أو إغلاق أي حساب يخالف هذه الشروط.',
    contentEn:
      'Some store services may require creating an account. You are responsible for keeping your account credentials and password confidential. You must notify us immediately of any unauthorized use of your account. Creating multiple accounts for the same person is prohibited. You must be 18 years or older to create an account. We reserve the right to suspend or close any account that violates these terms.',
  },
  {
    icon: CreditCard,
    titleAr: 'الطلبات والمدفوعات',
    titleEn: 'Orders & Payments',
    contentAr:
      'جميع الأسعار معروضة بالدينار الليبي (د.ل) وتشمل الضريبة حيثما ينطبق. نقبل الدفع عند الاستلام والدفع الإلكتروني عبر بطاقات معاملة. نحتفظ بالحق في تعديل الأسعار في أي وقت مع إشعار مسبق. لا يُعتبر الطلب مؤكداً حتى يتم قبوله من قبلنا وإرسال تأكيد عبر الرسائل النصية أو البريد الإلكتروني. في حالة عدم التمكن من تسليم الطلب، سيتم إعادة المبلغ كاملاً.',
    contentEn:
      'All prices are displayed in Libyan Dinars (LYD) and include tax where applicable. We accept cash on delivery and electronic payment via Moamalat cards. We reserve the right to modify prices at any time with prior notice. An order is not considered confirmed until accepted by us and a confirmation is sent via SMS or email. If delivery cannot be completed, a full refund will be issued.',
  },
  {
    icon: Brain,
    titleAr: 'الملكية الفكرية',
    titleEn: 'Intellectual Property',
    contentAr:
      'جميع المحتويات على المتجر بما في ذلك النصوص والصور والشعارات والتصاميم والعلامات التجارية هي ملكية فكرية لنبض المدينة أو مورديها المرخصين. لا يجوز نسخ أو إعادة إنتاج أو توزيع أي جزء من المحتوى دون إذن كتابي مسبق. العلامة التجارية «نبض المدينة» وشعار المتجر مسجلان ومحميان بموجب قوانين الملكية الفكرية الليبية.',
    contentEn:
      'All content on the store including texts, images, logos, designs, and trademarks is the intellectual property of Nabd Al-Madina or its licensed suppliers. No part of the content may be copied, reproduced, or distributed without prior written permission. The "Nabd Al-Madina" trademark and store logo are registered and protected under Libyan intellectual property laws.',
  },
  {
    icon: AlertTriangle,
    titleAr: 'إخلاء المسؤولية',
    titleEn: 'Disclaimer',
    contentAr:
      'نأسف لأي أخطاء في معلومات المنتجات أو الأسعار وقد نسعى لتصحيحها في أقرب وقت. لا نضمن توفر جميع المنتجات المعروضة في جميع الأوقات. الصور المعروضة هي لأغراض توضيحية وقد تختلف عن المنتج الفعلي. نحن لا نتحمل مسؤولية أي أضرار غير مباشرة ناتجة عن استخدام المتجر. المعلومات الطبية أو الصحية المعروضة على المنتجات ليست بديلاً عن الاستشارة الطبية.',
    contentEn:
      'We apologize for any errors in product information or prices and will endeavor to correct them as soon as possible. We do not guarantee the availability of all displayed products at all times. Images shown are for illustrative purposes and may differ from the actual product. We are not liable for any indirect damages resulting from using the store. Medical or health information displayed on products is not a substitute for medical consultation.',
  },
  {
    icon: FileEdit,
    titleAr: 'التعديلات',
    titleEn: 'Modifications',
    contentAr:
      'نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة مع تحديث تاريخ «آخر تحديث». استمرارك في استخدام المتجر بعد نشر التعديلات يعني موافقتك على الشروط المحدثة. ننصحك بمراجعة هذه الصفحة بشكل دوري للاطلاع على أي تغييرات. في حالة تغييرات جوهرية، سنرسل إشعاراً عبر البريد الإلكتروني أو الرسائل النصية.',
    contentEn:
      'We reserve the right to modify these Terms and Conditions at any time. Any changes will be posted on this page with an updated "Last Updated" date. Your continued use of the store after the modifications are published means you agree to the updated terms. We recommend reviewing this page periodically for any changes. In case of material changes, we will send a notification via email or SMS.',
  },
  {
    icon: Scale,
    titleAr: 'القانون المعمول به',
    titleEn: 'Governing Law',
    contentAr:
      'تخضع هذه الشروط والأحكام وتُفسر وفقاً لقوانين دولة ليبيا. في حالة حدوث أي نزاع، يتم حله وفقاً للقوانين الليبية المعمول بها. المحاكم الليبية هي الجهة المختصة للنظر في أي نزاع ينشأ عن استخدام المتجر. نفضل دائماً حل النزاعات ودياً قبل اللجوء إلى القضاء. يمكنك التواصل معنا عبر صفحة الاتصال أو الاتصال على الرقم 09XX XXX XXX لأي استفسار.',
    contentEn:
      'These Terms and Conditions are governed by and construed in accordance with the laws of Libya. In the event of any dispute, it shall be resolved in accordance with applicable Libyan laws. Libyan courts have jurisdiction over any dispute arising from the use of the store. We always prefer to resolve disputes amicably before resorting to litigation. You can contact us via the Contact page or call 09XX XXX XXX for any inquiries.',
  },
];

export function TermsPage() {
  return (
    <PolicyPageLayout
      titleAr="الشروط والأحكام"
      titleEn="Terms & Conditions"
      icon={Shield}
      lastUpdatedAr="آخر تحديث: 1 مارس 2025"
      lastUpdatedEn="Last updated: March 1, 2025"
      introAr="باستخدام متجر نبض المدينة الإلكتروني، فإنك توافق على الشروط والأحكام التالية. يُرجى قراءتها بعناية قبل استخدام المتجر أو إجراء أي عملية شراء. إذا كنت لا توافق على أي من هذه الشروط، يُرجى عدم استخدام المتجر."
      introEn="By using the Nabd Al-Madina online store, you agree to the following Terms and Conditions. Please read them carefully before using the store or making any purchase. If you do not agree to any of these terms, please do not use the store."
      sections={termsSections}
    />
  );
}

// ─── Privacy Page ───────────────────────────────────────────────

const privacySections: PolicySection[] = [
  {
    icon: Database,
    titleAr: 'جمع البيانات',
    titleEn: 'Data Collection',
    contentAr:
      'نقوم بجمع المعلومات التي تقدمها لنا طوعاً عند التسجيل أو إجراء طلب شراء، مثل: الاسم الكامل، رقم الهاتف، عنوان البريد الإلكتروني (اختياري)، عنوان التوصيل. كما نجمع تلقائياً معلومات عن جهازك ونظام التشغيل وعنوان IP ونوع المتصفح عند تصفح المتجر. لا نجمع أي بيانات حساسة مثل البيانات الصحية أو الدينية أو السياسية.',
    contentEn:
      'We collect information you voluntarily provide when registering or placing an order, such as: full name, phone number, email address (optional), delivery address. We also automatically collect information about your device, operating system, IP address, and browser type when browsing the store. We do not collect any sensitive data such as health, religious, or political data.',
  },
  {
    icon: Eye,
    titleAr: 'استخدام البيانات',
    titleEn: 'Data Usage',
    contentAr:
      'نستخدم بياناتك لمعالجة طلباتك وتوصيل المنتجات، والتواصل معك بخصوص حالة الطلب والتحديثات، وتحسين تجربة التسوق وخدمة العملاء، وإرسال العروض الترويجية بموافقتك، ومنع الاحتيال وحماية أمن المتجر. لن نبيع بياناتك الشخصية لأطراف ثالثة تحت أي ظرف.',
    contentEn:
      'We use your data to process your orders and deliver products, communicate with you regarding order status and updates, improve the shopping experience and customer service, send promotional offers with your consent, and prevent fraud and protect store security. We will never sell your personal data to third parties under any circumstances.',
  },
  {
    icon: Lock,
    titleAr: 'حماية البيانات',
    titleEn: 'Data Protection',
    contentAr:
      'نتخذ إجراءات أمنية مناسبة لحماية بياناتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفشاء. نستخدم تقنيات التشفير SSL/TLS لحماية البيانات أثناء النقل. يتم تخزين البيانات على خوادم آمنة مع صلاحيات وصول محدودة. نراجع إجراءات الأمان بشكل دوري لضمان أعلى مستويات الحماية وفقاً لأفضل الممارسات في مجال أمن المعلومات.',
    contentEn:
      'We take appropriate security measures to protect your personal data from unauthorized access, modification, or disclosure. We use SSL/TLS encryption to protect data in transit. Data is stored on secure servers with limited access permissions. We periodically review security procedures to ensure the highest levels of protection in accordance with information security best practices.',
  },
  {
    icon: Cookie,
    titleAr: 'ملفات تعريف الارتباط',
    titleEn: 'Cookies',
    contentAr:
      'نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة التصفح وتذكر تفضيلاتك اللغوية، والحفاظ على جلسة تسجيل الدخول، وتحليل أنماط استخدام المتجر لتحسين الخدمة، وعرض الإعلانات ذات الصلة. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك. يرجى ملاحظة أن تعطيل بعض ملفات تعريف الارتباط قد يؤثر على وظائف المتجر.',
    contentEn:
      'We use Cookies to improve the browsing experience and remember your language preferences, maintain login sessions, analyze store usage patterns to improve service, and display relevant advertisements. You can control cookie settings through your browser. Please note that disabling certain cookies may affect the store functionality.',
  },
  {
    icon: UserCheck,
    titleAr: 'حقوق المستخدم',
    titleEn: 'User Rights',
    contentAr:
      'لديك الحق في الوصول إلى بياناتك الشخصية المخزنة لدينا، وطلب تصحيح أي بيانات غير دقيقة، وطلب حذف بياناتك الشخصية (مع بعض الاستثناءات القانونية)، والاعتراض على معالجة بياناتك لأغراض تسويقية، وطلب نسخة من بياناتك بتنسيق قابل للقراءة. لممارسة أي من هذه الحقوق، تواصل معنا عبر صفحة الاتصال.',
    contentEn:
      'You have the right to access your personal data stored with us, request correction of any inaccurate data, request deletion of your personal data (with some legal exceptions), object to the processing of your data for marketing purposes, and request a copy of your data in a readable format. To exercise any of these rights, contact us via the Contact page.',
  },
  {
    icon: Share2,
    titleAr: 'مشاركة البيانات',
    titleEn: 'Data Sharing',
    contentAr:
      'قد نشارك بياناتك مع شركاء التوصيل لتنفيذ عمليات الشحن فقط، ومزودي خدمات الدفع الإلكتروني لمعالجة المعاملات المالية، والجهات الحكومية المختصة عند الطلب القانوني. لا نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية دون موافقتك الصريحة. نوقع اتفاقيات سرية مع جميع شركائنا لضمان حماية بياناتك.',
    contentEn:
      'We may share your data with delivery partners for shipping purposes only, electronic payment service providers for processing financial transactions, and relevant government authorities upon legal request. We do not share your data with third parties for marketing purposes without your explicit consent. We sign confidentiality agreements with all our partners to ensure your data protection.',
  },
  {
    icon: Phone,
    titleAr: 'اتصل بنا',
    titleEn: 'Contact Us',
    contentAr:
      'إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية أو كيفية تعاملنا مع بياناتك، يمكنك التواصل معنا عبر: البريد الإلكتروني: privacy@nabdh.ly، الهاتف: 09XX XXX XXX، أو من خلال نموذج الاتصال على الموقع. نسعى للرد على جميع الاستفسارات خلال 48 ساعة عمل.',
    contentEn:
      'If you have any questions or inquiries about the Privacy Policy or how we handle your data, you can contact us via: Email: privacy@nabdh.ly, Phone: 09XX XXX XXX, or through the contact form on the website. We strive to respond to all inquiries within 48 business hours.',
  },
];

export function PrivacyPage() {
  return (
    <PolicyPageLayout
      titleAr="سياسة الخصوصية"
      titleEn="Privacy Policy"
      icon={Lock}
      lastUpdatedAr="آخر تحديث: 1 مارس 2025"
      lastUpdatedEn="Last updated: March 1, 2025"
      introAr="في نبض المدينة، نأخذ خصوصيتك على محمل الجد. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدام متجرنا الإلكتروني. نحن ملتزمون بحماية بياناتك وفقاً لأفضل الممارسات والمعايير الدولية."
      introEn="At Nabd Al-Madina, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when using our online store. We are committed to protecting your data in accordance with best practices and international standards."
      sections={privacySections}
    />
  );
}

// ─── Return Policy Page ─────────────────────────────────────────

const returnSections: PolicySection[] = [
  {
    icon: PackageCheck,
    titleAr: 'شروط الإرجاع',
    titleEn: 'Return Conditions',
    contentAr:
      'يجب أن يكون المنتج في حالته الأصلية وغير مستخدم تماماً. يجب أن يكون المنتج في تغليفه الأصلي مع جميع الملحقات والمرفقات. يجب إرفاق إيصال الشراء أو رقم الطلب الأصلي. يجب أن يكون المنتج خالياً من أي تلف ناتج عن الاستخدام الخاطئ أو الإهمال. المنتجات المخصصة أو المجهزة شخصياً لا يمكن إرجاعها إلا في حالة وجود عيب مصنعي.',
    contentEn:
      'The product must be in its original condition and completely unused. The product must be in its original packaging with all accessories and attachments. The purchase receipt or original order number must be provided. The product must be free from any damage resulting from misuse or negligence. Customized or personalized products cannot be returned unless there is a manufacturing defect.',
  },
  {
    icon: Clock,
    titleAr: 'مدة الإرجاع',
    titleEn: 'Return Period',
    contentAr:
      'يمكنك طلب إرجاع المنتج خلال 14 يوماً من تاريخ استلام الطلب. بعد انقضاء هذه المدة، لا يمكننا قبول طلبات الإرجاع العادية. في حالة وجود عيب مصنعي، يمكن تقديم طلب إرجاع خلال فترة الضمان المحددة للمنتج. يبدأ احتساب المدة من تاريخ استلام المنتج الفعلي وليس تاريخ الشراء. سيتم إرسال تأكيد استلام المنتج عبر رسالة نصية.',
    contentEn:
      'You can request a product return within 14 days from the delivery date. After this period, we cannot accept standard return requests. In case of a manufacturing defect, a return request can be submitted within the product specified warranty period. The period is calculated from the actual product delivery date, not the purchase date. A delivery confirmation will be sent via SMS.',
  },
  {
    icon: XCircle,
    titleAr: 'المنتجات غير القابلة للإرجاع',
    titleEn: 'Non-returnable Items',
    contentAr:
      'المنتجات المستخدمة أو التي تم فتح تغليفها ولا يمكن إعادة بيعها. المنتجات المخصصة أو المحفورة باسم العميل. المنتجات الصحية ومستحضرات التجميل المفتوحة لأسباب صحية. المنتجات الرقمية مثل بطاقات الشحن والاشتراكات. المنتجات المخفضة في عروض التصفية النهائية ما لم يكن هناك عيب مصنعي. المنتجات الغذائية والمشروبات سريعة التلف.',
    contentEn:
      'Used products or products with opened packaging that cannot be resold. Customized or engraved products with the customer name. Health and beauty products that have been opened for health reasons. Digital products such as recharge cards and subscriptions. Clearance sale products unless there is a manufacturing defect. Perishable food and beverage products.',
  },
  {
    icon: ListChecks,
    titleAr: 'عملية الإرجاع',
    titleEn: 'Return Process',
    contentAr:
      '1. تواصل معنا عبر التطبيق أو الهاتف أو البريد الإلكتروني لبدء عملية الإرجاع. 2. قدم رقم الطلب وسبب الإرجاع مع صور للمنتج إن أمكن. 3. سيقوم فريقنا بمراجعة الطلب والرد خلال 24-48 ساعة عمل. 4. في حالة الموافقة، سيتم ترتيب استلام المنتج من عنوانك أو إرشادك لأقرب نقطة استلام. 5. بعد استلام المنتج وفحصه، سيتم إخطارك بحالة الإرجاع.',
    contentEn:
      '1. Contact us via the app, phone, or email to initiate the return process. 2. Provide the order number and reason for return with product photos if possible. 3. Our team will review the request and respond within 24-48 business hours. 4. If approved, product pickup will be arranged from your address or you will be directed to the nearest collection point. 5. After receiving and inspecting the product, you will be notified of the return status.',
  },
  {
    icon: Wallet,
    titleAr: 'الاسترداد',
    titleEn: 'Refund Process',
    contentAr:
      'سيتم استرداد المبلغ خلال 3-5 أيام عمل بعد استلام المنتج المرتجع والتأكد من حالته. طرق الاسترداد: إيداع في محفظتك على المتجر (الأسرع)، تحويل بنكي إلى حسابك، أو استرداد نقدي عند الاستلام للطلبات المدفوعة مسبقاً. في حالة الدفع عند الاستلام، سيتم استرداد المبلغ عبر تحويل بنكي أو إيداع في المحفظة. يتم استرداد رسوم التوصيل فقط في حالة وجود عيب في المنتج.',
    contentEn:
      'The refund will be processed within 3-5 business days after receiving the returned product and confirming its condition. Refund methods: deposit to your store wallet (fastest), bank transfer to your account, or cash refund for prepaid orders. For cash on delivery orders, the refund will be processed via bank transfer or wallet deposit. Delivery fees are refunded only if there is a product defect.',
  },
  {
    icon: ArrowLeftRight,
    titleAr: 'الاستبدال',
    titleEn: 'Exchange',
    contentAr:
      'يمكنك طلب استبدال المنتج بمنتج آخر من نفس القيمة أو أعلى (مع دفع الفرق). يجب أن يستوفي المنتج الجديد نفس شروط الإرجاع. الاستبدال متاح فقط للمنتجات المتوفرة في المخزون. في حالة عدم توفر المنتج المطلوب، يمكن اختيار منتج بديل أو استرداد المبلغ. يتم معالجة طلبات الاستبدال خلال نفس مدة الإرجاع (14 يوماً).',
    contentEn:
      'You can request to exchange the product for another product of the same or higher value (paying the difference). The new product must meet the same return conditions. Exchange is available only for products in stock. If the desired product is unavailable, an alternative product can be chosen or a refund issued. Exchange requests are processed within the same return period (14 days).',
  },
];

export function ReturnPolicyPage() {
  return (
    <PolicyPageLayout
      titleAr="سياسة الإرجاع"
      titleEn="Return Policy"
      icon={RefreshCw}
      lastUpdatedAr="آخر تحديث: 1 مارس 2025"
      lastUpdatedEn="Last updated: March 1, 2025"
      introAr="في نبض المدينة، نسعى لضمان رضاك التام عن كل عملية شراء. توضح سياسة الإرجاع هذه الشروط والإجراءات المتعلقة بإرجاع واستبدال المنتجات المشتراة من منصتنا. نلتزم بتوفير تجربة تسوق سهلة وعادلة لجميع عملائنا في ليبيا."
      introEn="At Nabd Al-Madina, we strive to ensure your complete satisfaction with every purchase. This Return Policy explains the terms and procedures related to returning and exchanging products purchased from our platform. We are committed to providing a fair and easy shopping experience for all our customers in Libya."
      sections={returnSections}
    />
  );
}
