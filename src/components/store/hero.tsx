'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/stores/language-store';
import { useTheme } from 'next-themes';

const trustBadges = [
  { icon: ShieldCheck, key: 'feature.quality' },
  { icon: Truck, key: 'feature.fastDelivery' },
  { icon: CreditCard, key: 'feature.securePayment' },
  { icon: Headphones, key: 'feature.support' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

const floatVariants = {
  animate: (i: number) => ({
    y: [0, -12, 0],
    transition: {
      duration: 3 + i * 0.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  }),
};

// Particle dots for background decoration
const particles = [
  { x: '10%', y: '15%', size: 4, delay: 0 },
  { x: '25%', y: '70%', size: 3, delay: 1.5 },
  { x: '80%', y: '20%', size: 5, delay: 0.8 },
  { x: '70%', y: '80%', size: 3, delay: 2.2 },
  { x: '50%', y: '10%', size: 4, delay: 1.2 },
  { x: '15%', y: '50%', size: 3, delay: 3 },
  { x: '85%', y: '55%', size: 4, delay: 0.5 },
  { x: '40%', y: '85%', size: 3, delay: 2.8 },
  { x: '60%', y: '40%', size: 5, delay: 1.8 },
  { x: '30%', y: '30%', size: 3, delay: 2 },
  { x: '90%', y: '35%', size: 4, delay: 0.3 },
  { x: '5%', y: '85%', size: 3, delay: 3.5 },
];

export function Hero() {
  const t = useLanguageStore((s) => s.t);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <section
      id="home"
      className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background — Theme-Aware Gradient */}
      {isDark ? (
        <>
          {/* Dark mode: Deep ocean navy gradient */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #060A14 0%, #0A1225 25%, #0D1830 50%, #0A1628 75%, #060A14 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(0, 201, 232, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(0, 168, 204, 0.06) 0%, transparent 50%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(6,10,20,0.5) 0%, transparent 20%, transparent 80%, rgba(6,10,20,0.5) 100%)' }} />
        </>
      ) : (
        <>
          {/* Light mode: Vibrant brand gradient */}
          <div className="absolute inset-0 nabdh-gradient" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,47,63,0.88) 0%, rgba(0,75,99,0.78) 30%, rgba(0,107,138,0.72) 60%, rgba(0,137,123,0.82) 85%, rgba(0,168,204,0.88) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,47,63,0.45) 0%, transparent 25%, transparent 75%, rgba(0,75,99,0.45) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,168,204,0.1) 0%, transparent 70%)' }} />
        </>
      )}
      {/* Top gradient fade */}
      <div className="absolute inset-x-0 top-0 h-24" style={{ background: 'linear-gradient(180deg, rgba(0,47,63,0.6) 0%, transparent 100%)' }} />
      {/* Cinematic letterbox bars */}
      <div className="absolute inset-x-0 top-0 h-[4%] bg-black/30" />
      <div className="absolute inset-x-0 bottom-0 h-[4%] bg-black/30" />

      {/* Decorative floating shapes — Theme-Aware */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.div
          className={`absolute -top-20 -start-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full ${isDark ? 'bg-white/[0.03]' : 'bg-white/5'}`}
          custom={0}
          variants={floatVariants}
          animate="animate"
        />
        <motion.div
          className={`absolute -bottom-16 -end-16 w-56 h-56 sm:w-80 sm:h-80 rounded-full ${isDark ? 'bg-white/[0.02]' : 'bg-white/5'}`}
          custom={1}
          variants={floatVariants}
          animate="animate"
        />
        <motion.div
          className={`absolute top-1/3 start-10 w-32 h-32 sm:w-44 sm:h-44 rounded-full ${isDark ? 'bg-white/[0.02]' : 'bg-white/[0.04]'}`}
          custom={2}
          variants={floatVariants}
          animate="animate"
        />
        <motion.div
          className={`absolute top-1/4 end-20 w-20 h-20 sm:w-28 sm:h-28 rounded-full ${isDark ? 'bg-[#00C9E8]/5' : 'bg-nabdh-accent/10'}`}
          custom={3}
          variants={floatVariants}
          animate="animate"
        />
        <motion.div
          className={`absolute bottom-1/3 end-1/4 w-16 h-16 rounded-full ${isDark ? 'bg-[#FF8A82]/5' : 'bg-nabdh-secondary/10'}`}
          custom={4}
          variants={floatVariants}
          animate="animate"
        />
      </div>

      {/* Particle dot decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full particle-dot bg-white/20"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden="true">
          <line x1="10%" y1="15%" x2="25%" y2="70%" stroke="white" strokeWidth="1" />
          <line x1="80%" y1="20%" x2="70%" y2="80%" stroke="white" strokeWidth="1" />
          <line x1="50%" y1="10%" x2="60%" y2="40%" stroke="white" strokeWidth="1" />
          <line x1="15%" y1="50%" x2="30%" y2="30%" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-28"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Heading with animated gradient */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight drop-shadow-lg"
        >
          <span className="gradient-text-animated">
            {t('hero.title')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className={`text-lg sm:text-xl md:text-2xl font-medium mb-3 sm:mb-4 drop-shadow-md animate-slide-in ${isDark ? 'text-[#B8D4E8]' : 'text-white/90'}`}
          style={{ animationDelay: '0.3s' }}
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 drop-shadow-sm animate-slide-in ${isDark ? 'text-[#8FA3B8]' : 'text-white/70'}`}
          style={{ animationDelay: '0.5s' }}
        >
          {t('hero.description')}
        </motion.p>

        {/* CTA Buttons — Theme-Aware */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 animate-slide-in"
          style={{ animationDelay: '0.7s' }}
        >
          <Button
            size="lg"
            className={`w-full sm:w-auto font-bold text-base sm:text-lg px-8 py-6 rounded-xl shadow-lg shadow-black/10 pulse-glow ${
              isDark 
                ? 'bg-[#00C9E8] text-[#0A0F1C] hover:bg-[#00B5D4]' 
                : 'bg-white text-nabdh-primary hover:bg-white/90'
            }`}
            onClick={() => {
              const el = document.querySelector('#products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('hero.cta')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className={`w-full sm:w-auto border-2 font-bold text-base sm:text-lg px-8 py-6 rounded-xl bg-transparent backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-white/5 ${
              isDark
                ? 'border-[#00C9E8]/40 text-[#00C9E8] hover:bg-[#00C9E8]/10 hover:text-[#00C9E8] hover:border-[#00C9E8]/60'
                : 'border-white/50 text-white hover:bg-white/10 hover:text-white hover:border-white/70'
            }`}
            onClick={() => {
              const el = document.querySelector('#offers');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('hero.ctaSecondary')}
          </Button>
        </motion.div>

        {/* Trust Badges Row — Theme-Aware */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8"
        >
          {trustBadges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.key}
                className={`flex items-center gap-2 transition-all duration-300 backdrop-blur-sm hover:scale-105 animate-slide-in ${
                  isDark ? 'text-[#8FA3B8] hover:text-[#00C9E8]' : 'text-white/80 hover:text-white'
                }`}
                style={{ animationDelay: `${0.9 + i * 0.1}s` }}
              >
                <Icon className="size-5 shrink-0" />
                <span className="text-sm sm:text-base font-medium">
                  {t(badge.key)}
                </span>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Bottom wave/gradient fade — Theme-Aware */}
      <div
        className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}
