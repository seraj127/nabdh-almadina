'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  ArrowUpRight,
  Headphones,
  Zap,
  ChevronLeft,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════
// HOMEPAGE CONTACT SECTION — Compact CTA Teaser
// This is a lightweight teaser on the homepage that directs users
// to the full professional Contact Us page (contact-page.tsx).
// ═══════════════════════════════════════════════════════════════════════
export function ContactSection() {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const navigateTo = useUIStore((s) => s.navigateTo);
  const isAr = language === 'ar';

  return (
    <section id="contact" className="py-16 sm:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">
            {t('contact.teaserTitle')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('contact.teaserSubtitle')}
          </p>
        </motion.div>

        {/* Main CTA Card — full-width, striking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden nabdh-gradient p-6 sm:p-10 shadow-2xl shadow-nabdh-primary/20"
        >
          {/* Decorative circles */}
          <div className="absolute -top-12 -start-12 size-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -end-8 size-32 rounded-full bg-white/5" />
          <div className="absolute top-1/4 end-16 size-20 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
            {/* Left: Text + CTA */}
            <div className="flex-1 text-center lg:text-start">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {t('contact.pageTitle')}
              </h3>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                {t('contact.pageSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigateTo('contact')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-nabdh-primary font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                >
                  <ArrowUpRight className="size-4" />
                  {isAr ? 'صفحة تواصل معنا' : 'Contact Us Page'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => window.open('https://wa.me/218912345678')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white font-medium text-sm border border-white/20 hover:bg-white/20 transition-all"
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </motion.button>
              </div>
            </div>

            {/* Right: Quick Info Cards */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[280px]">
              {/* Phone */}
              <a
                href="tel:+218912345678"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all group"
              >
                <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Phone className="size-4 text-emerald-300" />
                </div>
                <span className="text-[10px] text-white/50 font-medium">{t('contact.callUs')}</span>
                <span className="text-xs text-white font-semibold" dir="ltr">091 234 5678</span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/218912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all group"
              >
                <div className="size-10 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="size-4 text-green-300" />
                </div>
                <span className="text-[10px] text-white/50 font-medium">{t('contact.whatsappTitle')}</span>
                <span className="text-xs text-white font-semibold">{t('contact.chatAvailable')}</span>
              </a>

              {/* Email */}
              <a
                href="mailto:info@nabdh.ly"
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all group"
              >
                <div className="size-10 rounded-xl bg-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="size-4 text-sky-300" />
                </div>
                <span className="text-[10px] text-white/50 font-medium">{t('contact.emailTitle')}</span>
                <span className="text-xs text-white font-semibold" dir="ltr">info@nabdh.ly</span>
              </a>

              {/* Working Hours */}
              <button
                onClick={() => navigateTo('contact')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all group"
              >
                <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="size-4 text-amber-300" />
                </div>
                <span className="text-[10px] text-white/50 font-medium">{t('contact.hoursTitle')}</span>
                <span className="text-xs text-white font-semibold" dir="ltr">9AM - 10PM</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Response Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 flex items-center justify-center gap-2 text-muted-foreground"
        >
          <Zap className="size-4 text-amber-500" />
          <span className="text-xs font-medium">
            {isAr
              ? 'نرد على جميع الرسائل خلال 24 ساعة'
              : 'We respond to all messages within 24 hours'}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
