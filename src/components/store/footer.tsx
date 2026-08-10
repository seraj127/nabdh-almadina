'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  ShieldCheck,
  Lock,
  Eye,
  Send,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Headphones,
  Map,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';

// ─── Footer Links (no duplicates) ────────────────────────────────────
// Quick Links: Main navigation — includes "Contact Us" here as the primary link
const quickLinks = [
  { key: 'nav.home', href: '#home' },
  { key: 'nav.products', href: '#products' },
  { key: 'nav.offers', href: '#offers' },
  { key: 'nav.contact', href: '#contact', navigate: 'contact' as const },
  { key: 'sitemap.title', href: '#sitemap', navigate: 'sitemap' as const },
];

// Customer Service: Support/policy links — NO duplicate "Contact Us" here
const customerServiceLinks = [
  { key: 'footer.helpCenter', href: '#faq', navigate: 'contact' as const },
  { key: 'footer.shippingPolicy', href: '#shipping', navigate: 'delivery-zones' as const },
  { key: 'footer.returnPolicy', href: '#returns', navigate: 'returns' as const },
  { key: 'footer.privacyPolicy', href: '#privacy', navigate: 'privacy' as const },
  { key: 'footer.termsConditions', href: '#terms', navigate: 'terms' as const },
];

// ─── Social Media — Fully activated with real links & hover effects ───
const socialIcons = [
  {
    icon: Facebook,
    href: 'https://facebook.com/nabdh.ly',
    label: 'Facebook',
    color: 'hover:bg-[#1877F2]',
    hoverIcon: 'group-hover:text-[#1877F2]',
  },
  {
    icon: Instagram,
    href: 'https://instagram.com/nabdh.ly',
    label: 'Instagram',
    color: 'hover:bg-[#E4405F]',
    hoverIcon: 'group-hover:text-[#E4405F]',
  },
  {
    icon: Twitter,
    href: 'https://twitter.com/nabdh_ly',
    label: 'X (Twitter)',
    color: 'hover:bg-[#1DA1F2]',
    hoverIcon: 'group-hover:text-[#1DA1F2]',
  },
  {
    icon: Youtube,
    href: 'https://youtube.com/@nabdh.ly',
    label: 'YouTube',
    color: 'hover:bg-[#FF0000]',
    hoverIcon: 'group-hover:text-[#FF0000]',
  },
];

const securityBadges = [
  { icon: ShieldCheck, key: 'feature.quality' },
  { icon: Lock, key: 'feature.securePayment' },
  { icon: Eye, key: 'footer.privacyPolicy' },
];

const contactInfo = [
  { icon: MapPin, textKey: 'contact.locationValue' },
  { icon: Phone, text: '0926999231', href: 'tel:+218926999231' },
  { icon: Mail, text: 'info@nabdh.ly', href: 'mailto:info@nabdh.ly' },
  { icon: MessageCircle, text: 'WhatsApp', href: 'https://wa.me/218926999231' },
];

type SubscribeStatus = 'idle' | 'loading' | 'success' | 'already_subscribed' | 'error';

export function Footer() {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const navigateTo = useUIStore((s) => s.navigateTo);
  const isAr = language === 'ar';
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<SubscribeStatus>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribeStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setSubscribeStatus('success');
        setEmail('');
      } else if (data.error === 'already_subscribed') {
        setSubscribeStatus('already_subscribed');
      } else {
        setSubscribeStatus('error');
      }
    } catch {
      setSubscribeStatus('error');
    }

    setTimeout(() => setSubscribeStatus('idle'), 4000);
  };

  const handleLinkClick = (href: string, navigate?: string) => {
    if (navigate) {
      navigateTo(navigate as any);
      return;
    }
    const currentView = useUIStore.getState().authView;
    if (currentView !== 'none') {
      navigateTo('none' as any);
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="glass-footer text-white mt-auto gradient-border-top relative overflow-hidden">
      {/* Logo Full-Size Watermark Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
        <img
          src="/logo.png"
          alt=""
          className="w-full h-full object-cover"
          style={{ opacity: 0.1, mixBlendMode: 'screen', filter: 'invert(1) contrast(1.1) brightness(1.1)' }}
          loading="lazy"
        />
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Logo + Description + Contact + Social */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 shrink-0 aspect-square rounded-full ring-2 ring-white/20 overflow-hidden">
                <img
                  src="/logo.png"
                  alt={t('hero.title')}
                  className="h-full w-full object-cover scale-[1.65] translate-y-[5px]"
                />
              </div>
              <h3 className="text-2xl font-bold gradient-text-animated inline-block">
                {t('hero.title')}
              </h3>
            </div>
            <p className="text-white/70 dark:text-white/60 text-sm leading-relaxed mb-5">
              {t('footer.description')}
            </p>
            {/* Contact Info - clickable */}
            <div className="space-y-2.5 mb-6">
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                const displayText = info.textKey ? t(info.textKey) : info.text;
                const isClickable = !!info.href;
                return (
                  <a
                    key={i}
                    href={info.href || '#'}
                    target={info.href?.startsWith('http') ? '_blank' : undefined}
                    rel={info.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    onClick={isClickable ? undefined : (e) => e.preventDefault()}
                    className="flex items-center gap-2.5 text-white/60 dark:text-white/50 hover:text-white/90 dark:hover:text-white/80 transition-colors group"
                  >
                    <Icon className="size-3.5 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-xs" dir={info.icon === Phone || info.icon === Mail || info.icon === MessageCircle ? 'ltr' : 'rtl'}>
                      {displayText}
                    </span>
                  </a>
                );
              })}
            </div>
            {/* Social Media Icons — Column 1 */}
            <div>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2.5">
                {t('footer.followUs')}
              </p>
              <div className="flex items-center gap-2">
                {socialIcons.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`group flex items-center justify-center size-9 rounded-full bg-white/10 dark:bg-white/5 text-white/70 dark:text-white/60 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-white/10 hover:text-white ${social.color}`}
                    >
                      <Icon className="size-4 transition-colors duration-300" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-nabdh-secondary dark:bg-[#FF8A82] rounded-full" />
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(link.href, (link as any).navigate);
                    }}
                    className="text-sm text-white/60 dark:text-white/50 hover:text-white hover:ps-2 transition-all duration-300 flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Service (NO duplicate contact link) */}
          <div>
            <h4 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-nabdh-accent dark:bg-[#00C9E8] rounded-full" />
              {t('footer.customerService')}
            </h4>
            <ul className="space-y-3">
              {customerServiceLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleLinkClick(link.href, link.navigate);
                    }}
                    className="text-sm text-white/60 dark:text-white/50 hover:text-white hover:ps-2 transition-all duration-300 flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
            {/* Quick chat button */}
            <button
              onClick={() => useUIStore.getState().toggleChat()}
              className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/5 text-white/70 text-xs font-medium hover:bg-white/20 hover:text-white transition-all"
            >
              <Headphones className="size-3" />
              {isAr ? 'محادثة مباشرة' : 'Live Chat'}
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-nabdh-gold dark:bg-[#E8C35A] rounded-full" />
              {t('footer.newsletter')}
            </h4>
            <p className="text-sm text-white/60 dark:text-white/50 mb-4 leading-relaxed">
              {t('footer.description')}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletterPlaceholder')}
                  className="bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 text-white placeholder:text-white/40 focus-visible:border-nabdh-accent/50 dark:focus-visible:border-[#00C9E8]/50 focus-visible:ring-nabdh-accent/20 dark:focus-visible:ring-[#00C9E8]/20 h-10 text-sm backdrop-blur-sm"
                  required
                  dir="ltr"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={subscribeStatus === 'loading'}
                  className="shrink-0 bg-nabdh-accent dark:bg-[#00C9E8] hover:bg-nabdh-accent/90 dark:hover:bg-[#00B5D4] text-white dark:text-[#0A0F1C] size-10 transition-all hover:scale-105 hover:shadow-lg hover:shadow-nabdh-accent/20 dark:hover:shadow-[#00C9E8]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {subscribeStatus === 'loading' ? (
                    <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </form>
            {subscribeStatus !== 'idle' && subscribeStatus !== 'loading' && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs mt-2 font-medium ${
                  subscribeStatus === 'success'
                    ? 'text-emerald-400'
                    : subscribeStatus === 'already_subscribed'
                      ? 'text-amber-400'
                      : 'text-red-400'
                }`}
              >
                {subscribeStatus === 'success' && `${t('newsletter.subscribed')} ✓`}
                {subscribeStatus === 'already_subscribed' && `${t('newsletter.alreadySubscribed')}`}
                {subscribeStatus === 'error' && `${t('newsletter.subscribeError')}`}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BOTTOM BAR: Social Media (prominent) + Security + Copyright
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 border-t border-white/10 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* Social icons row — prominent & activated */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-5">
            {socialIcons.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={`bottom-${social.label}`}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 border border-white/5 text-white/50 text-xs font-medium transition-all duration-300 hover:scale-105 hover:text-white hover:shadow-lg hover:border-white/20 ${social.color}`}
                >
                  <Icon className="size-3.5 sm:size-4 transition-colors duration-300" />
                  <span className="hidden sm:inline">{social.label}</span>
                </a>
              );
            })}
          </div>

          {/* Trust badges row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
            {securityBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.key}
                  className="flex items-center gap-2 text-white/50 dark:text-white/40 hover:text-white/80 dark:hover:text-white/70 transition-colors duration-300"
                >
                  <Icon className="size-4" />
                  <span className="text-xs font-medium">{t(badge.key)}</span>
                </div>
              );
            })}
          </div>

          <Separator className="bg-white/10 dark:bg-white/5 mb-4" />

          {/* Copyright */}
          <p className="text-center text-xs text-white/40 dark:text-white/30">
            © {new Date().getFullYear()} {t('hero.title')}. {t('footer.copyright')}
          </p>

          {/* Bits Development Credit — Neon Glow */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="text-xs font-bold tracking-wide neon-text-glow">
              تطوير Bits للبرمجيات
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
