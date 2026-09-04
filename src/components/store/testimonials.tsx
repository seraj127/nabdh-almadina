'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useRef, useState, useEffect, useCallback } from 'react';

const testimonials = [
  { quoteKey: 'testimonials.quote1', nameKey: 'testimonials.name1', roleKey: 'testimonials.role1', rating: 5, accent: '#004B63' },
  { quoteKey: 'testimonials.quote2', nameKey: 'testimonials.name2', roleKey: 'testimonials.role2', rating: 5, accent: '#00897B' },
  { quoteKey: 'testimonials.quote3', nameKey: 'testimonials.name3', roleKey: 'testimonials.role3', rating: 4, accent: '#D4A843' },
  { quoteKey: 'testimonials.quote4', nameKey: 'testimonials.name4', roleKey: 'testimonials.role4', rating: 5, accent: '#00A8CC' },
  { quoteKey: 'testimonials.quote5', nameKey: 'testimonials.name5', roleKey: 'testimonials.role5', rating: 5, accent: '#006B8A' },
  { quoteKey: 'testimonials.quote6', nameKey: 'testimonials.name6', roleKey: 'testimonials.role6', rating: 4, accent: '#00897B' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export function Testimonials() {
  const { t, language } = useLanguageStore();
  const isRTL = language === 'ar';
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate highlighted testimonial
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, []);

  // Average rating
  const avgRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 start-0 w-80 h-80 rounded-full bg-[#004B63]/[0.03] -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 end-0 w-96 h-96 rounded-full bg-[#00897B]/[0.03] translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#D4A843]/[0.02]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header — Premium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12 sm:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 border border-nabdh-gold/20 bg-nabdh-gold/5"
          >
            <MessageCircle className="size-3.5 text-nabdh-gold" />
            <span className="text-xs font-semibold text-nabdh-gold">
              {isRTL ? 'تقييمات حقيقية' : 'Verified Reviews'}
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3">
            <span className="gradient-text">{t('testimonials.title')}</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t('testimonials.subtitle')}
          </p>

          {/* Rating summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-3 mt-5"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-nabdh-gold text-nabdh-gold" />
              ))}
            </div>
            <span className="text-2xl font-extrabold text-foreground">{avgRating}</span>
            <span className="text-sm text-muted-foreground">
              ({testimonials.length} {isRTL ? 'تقييم' : 'reviews'})
            </span>
          </motion.div>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' as const }}
            className="mx-auto mt-6 h-[3px] w-32 rounded-full origin-center"
            style={{ background: 'linear-gradient(90deg, transparent, #D4A843, #00897B, #004B63, transparent)' }}
          />
        </motion.div>

        {/* ─── Featured Testimonial (Large Center) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-12"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0F2235 50%, #142D45 100%)', boxShadow: '0 16px 48px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
            {/* Background accents */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 end-0 w-48 h-48 rounded-full bg-[#D4A843]/[0.06] blur-3xl" />
              <div className="absolute bottom-0 start-0 w-40 h-40 rounded-full bg-[#00897B]/[0.06] blur-3xl" />
            </div>

            <div className="relative z-10 p-8 sm:p-10 lg:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? 40 : -40 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Large quote icon */}
                  <div className="mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A843, #E8C564)', boxShadow: '0 8px 24px rgba(212,168,67,0.3)' }}>
                      <Quote className="size-7 text-white" />
                    </div>
                  </div>

                  {/* Quote text */}
                  <p className="text-lg sm:text-xl lg:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mb-8" style={{ lineHeight: 1.8 }}>
                    &ldquo;{t(testimonials[currentIndex].quoteKey)}&rdquo;
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1.5 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-5 ${i < testimonials[currentIndex].rating ? 'fill-[#D4A843] text-[#D4A843]' : 'text-white/20'}`}
                      />
                    ))}
                  </div>

                  {/* Customer avatar + info */}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="size-16 rounded-full flex items-center justify-center text-white text-xl font-bold ring-4 ring-white/10"
                      style={{ background: `linear-gradient(135deg, ${testimonials[currentIndex].accent}, ${testimonials[currentIndex].accent}CC)`, boxShadow: `0 4px 16px ${testimonials[currentIndex].accent}40` }}
                    >
                      {t(testimonials[currentIndex].nameKey).charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold text-base">{t(testimonials[currentIndex].nameKey)}</p>
                      <p className="text-white/50 text-sm">{t(testimonials[currentIndex].roleKey)}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <div className="absolute top-1/2 -translate-y-1/2 start-3 end-3 flex justify-between pointer-events-none">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrev}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
                  aria-label={isRTL ? 'التالي' : 'Previous'}
                >
                  {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNext}
                  className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all backdrop-blur-sm"
                  aria-label={isRTL ? 'السابق' : 'Next'}
                >
                  {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </motion.button>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pb-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={isRTL ? `عرض الشهادة ${i + 1}` : `Go to testimonial ${i + 1}`}
                  className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    width: i === currentIndex ? '2rem' : '0.6rem',
                    background: i === currentIndex ? 'rgba(212,168,67,0.5)' : 'rgba(255,255,255,0.15)',
                  }}
                >
                  {i === currentIndex && (
                    <motion.div
                      key={`dot-${currentIndex}`}
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #D4A843, #E8C564)' }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── All Testimonials Grid ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.nameKey}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeOut' as const }}
              className="group relative rounded-2xl p-[1px] cursor-default overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
              }}
              onClick={() => setCurrentIndex(index)}
            >
              {/* Hover gradient border */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${testimonial.accent}40, transparent, ${testimonial.accent}20)`,
                }}
              />

              <div className="relative bg-background rounded-2xl p-6 h-full">
                {/* Quote icon + Rating row */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${testimonial.accent}12` }}
                  >
                    <Quote className="size-4" style={{ color: testimonial.accent }} />
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3 ${i < testimonial.rating ? 'fill-[#D4A843] text-[#D4A843]' : 'text-muted-foreground/20'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quote text */}
                <p className="text-sm text-foreground/80 leading-relaxed mb-5 line-clamp-3">
                  &ldquo;{t(testimonial.quoteKey)}&rdquo;
                </p>

                {/* Customer info */}
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-background shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${testimonial.accent}, ${testimonial.accent}BB)`,
                      boxShadow: `0 4px 12px ${testimonial.accent}30`,
                    }}
                  >
                    {t(testimonial.nameKey).charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t(testimonial.nameKey)}</p>
                    <p className="text-xs text-muted-foreground">{t(testimonial.roleKey)}</p>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 start-0 end-0 h-[3px] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, ${testimonial.accent}, ${testimonial.accent}80, transparent)` }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
