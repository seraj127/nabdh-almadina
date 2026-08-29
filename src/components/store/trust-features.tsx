'use client';

import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, RotateCcw, ArrowLeft, ArrowRight, Star, Users, Package, Clock } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useRef, useEffect, useState } from 'react';

const features = [
  {
    icon: ShieldCheck,
    titleKey: 'feature.quality',
    descKey: 'feature.qualityDesc',
    gradient: 'linear-gradient(135deg, #004B63 0%, #006B8A 100%)',
    accentColor: '#004B63',
    lightBg: 'rgba(0, 75, 99, 0.06)',
    stat: '100%',
    statLabelAr: 'أصلي',
    statLabelEn: 'Authentic',
  },
  {
    icon: Truck,
    titleKey: 'feature.fastDelivery',
    descKey: 'feature.fastDeliveryDesc',
    gradient: 'linear-gradient(135deg, #00897B 0%, #00A896 100%)',
    accentColor: '#00897B',
    lightBg: 'rgba(0, 137, 123, 0.06)',
    stat: '24h',
    statLabelAr: 'توصيل',
    statLabelEn: 'Delivery',
  },
  {
    icon: CreditCard,
    titleKey: 'feature.securePayment',
    descKey: 'feature.securePaymentDesc',
    gradient: 'linear-gradient(135deg, #004B63 0%, #00A8CC 100%)',
    accentColor: '#00A8CC',
    lightBg: 'rgba(0, 168, 204, 0.06)',
    stat: '256',
    statLabelAr: 'بتشفير',
    statLabelEn: 'Encrypted',
  },
  {
    icon: RotateCcw,
    titleKey: 'feature.easyReturns',
    descKey: 'feature.easyReturnsDesc',
    gradient: 'linear-gradient(135deg, #D4A843 0%, #E8C564 100%)',
    accentColor: '#D4A843',
    lightBg: 'rgba(212, 168, 67, 0.06)',
    stat: '14',
    statLabelAr: 'يوم إرجاع',
    statLabelEn: 'Day Returns',
  },
];

const stats = [
  { value: 10000, suffix: '+', labelAr: 'عميل سعيد', labelEn: 'Happy Customers', icon: Users },
  { value: 50000, suffix: '+', labelAr: 'منتج متوفر', labelEn: 'Available Products', icon: Package },
  { value: 99, suffix: '%', labelAr: 'معدل الرضا', labelEn: 'Satisfaction Rate', icon: Star },
  { value: 24, suffix: '/7', labelAr: 'دعم متواصل', labelEn: 'Always Available', icon: Clock },
];

// Animated counter — ease-out cubic for smooth deceleration
function AnimatedCounter({ value, suffix, duration = 2000 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    let rafId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic: fast start, smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * value);
      setCount(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function TrustFeatures() {
  const { t, language } = useLanguageStore();
  const isRTL = language === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="trust" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#004B63]/[0.03] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#00897B]/[0.03] translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4A843]/[0.02]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header — Premium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-14 sm:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 border border-nabdh-primary/15 bg-nabdh-primary/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-nabdh-primary animate-pulse" />
            <span className="text-xs font-semibold text-nabdh-primary">
              {isRTL ? 'مميزاتنا' : 'Our Features'}
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
            <span className="gradient-text">{t('section.whyUs')}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isRTL
              ? 'نؤمن بأن تجربة التسوق يجب أن تكون استثنائية من البداية للنهاية'
              : 'We believe the shopping experience should be exceptional from start to finish'}
          </p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' as const }}
            className="mx-auto mt-6 h-[3px] w-32 rounded-full origin-center"
            style={{ background: 'linear-gradient(90deg, transparent, #004B63, #00897B, #D4A843, transparent)' }}
          />
        </motion.div>

        {/* Feature Cards Grid — Premium */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.titleKey}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3, ease: 'easeOut' as const }}
                className="group relative rounded-2xl p-[1px] cursor-default overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                }}
              >
                {/* Gradient border effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${feature.accentColor}40, transparent, ${feature.accentColor}20)`,
                    padding: '1px',
                  }}
                />

                {/* Card content */}
                <div className="relative bg-background rounded-2xl p-6 h-full">
                  {/* Stat badge — top right */}
                  <div
                    className="absolute top-4 end-4 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                    style={{
                      background: feature.lightBg,
                      color: feature.accentColor,
                    }}
                  >
                    {feature.stat} {isRTL ? feature.statLabelAr : feature.statLabelEn}
                  </div>

                  {/* Icon with gradient background */}
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                    style={{
                      background: feature.gradient,
                      boxShadow: `0 8px 24px ${feature.accentColor}25`,
                    }}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon className="size-7 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {t(feature.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {t(feature.descKey)}
                  </p>

                  {/* Learn more link */}
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold transition-colors opacity-0 group-hover:opacity-100"
                    style={{ color: feature.accentColor }}
                  >
                    <span>{isRTL ? 'اعرف المزيد' : 'Learn more'}</span>
                    <ArrowIcon size={12} />
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 start-0 end-0 h-[3px] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: feature.gradient }}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Bar — Premium */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-30px' }}
          className="mt-14 sm:mt-16"
        >
          <div
            className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #004B63 0%, #006B8A 40%, #00897B 100%)',
            }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4" />
            <div className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full bg-white/[0.03]" />

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    variants={statVariants}
                    className="text-center"
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 flex items-center justify-center mb-3">
                      <Icon className="size-5 text-white/80" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <p className="text-xs sm:text-sm text-white/60 font-medium">
                      {isRTL ? stat.labelAr : stat.labelEn}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
