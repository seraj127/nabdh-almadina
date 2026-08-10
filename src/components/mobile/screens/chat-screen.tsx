'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/stores/language-store';
import { useMobileStore } from '@/components/mobile/lib/mobile-store';
import {
  ArrowRight,
  ArrowLeft,
  Send,
  Bot,
  MessageCircle,
  Phone,
  Package,
  CreditCard,
  RotateCcw,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// BRAND COLORS
// ═══════════════════════════════════════════════════════════════════════
const COLORS = {
  primary: '#004B63',
  primaryLight: '#006B8A',
  accent: '#00A8CC',
  secondary: '#FF6F61',
  teal: '#00897B',
  dark: '#0B1120',
  success: '#238636',
} as const;

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════
// QUICK ACTION CHIPS CONFIG
// ═══════════════════════════════════════════════════════════════════════
const QUICK_ACTIONS = [
  { key: 'mobile.chat.trackOrder', icon: Package, color: COLORS.accent },
  { key: 'mobile.chat.paymentMethods', icon: CreditCard, color: COLORS.teal },
  { key: 'mobile.chat.returnPolicy', icon: RotateCcw, color: COLORS.secondary },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════
const messageVariants = {
  initial: (isUser: boolean) => ({
    opacity: 0,
    x: isUser ? 30 : -30,
    y: 10,
    scale: 0.95,
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

const chipVariants = {
  initial: { opacity: 0, y: 12, scale: 0.9 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 200, damping: 18 },
  }),
};

// ═══════════════════════════════════════════════════════════════════════
// TYPING INDICATOR COMPONENT
// ═══════════════════════════════════════════════════════════════════════
function TypingIndicator({ isRTL }: { isRTL: boolean }) {
  return (
    <motion.div
      className={`flex items-end gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Bot avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.teal})` }}
      >
        <Bot size={16} className="text-white" />
      </div>

      {/* Typing bubble */}
      <div
        className="rounded-2xl px-4 py-3"
        style={{
          background: `linear-gradient(135deg, ${COLORS.accent}15, ${COLORS.teal}10)`,
          border: `1px solid ${COLORS.accent}20`,
          maxWidth: '80%',
        }}
      >
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS.accent }}
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut' as const,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN CHAT SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function ChatScreen() {
  const { t, language } = useLanguageStore();
  const setScreen = useMobileStore((s) => s.setScreen);
  const darkMode = useMobileStore((s) => s.darkMode);
  const isRTL = language === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Welcome message on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
      const welcomeMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        text: t('mobile.chat.welcome'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Send message to API
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text.trim() }),
        });

        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          text: data.reply || t('common.error'),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          text: isRTL
            ? 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
            : 'Sorry, a connection error occurred. Please try again.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading, t, isRTL]
  );

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(inputText);
    },
    [inputText, sendMessage]
  );

  // Handle quick action chip click
  const handleQuickAction = useCallback(
    (key: string) => {
      const text = t(key);
      sendMessage(text);
    },
    [t, sendMessage]
  );

  // Format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(isRTL ? 'ar-LY' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Back button icon
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="absolute inset-0 flex flex-col bg-white dark:bg-[#0B1120]" dir={direction}>
      {/* ═══ HEADER ═══ */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, #003545 0%, ${COLORS.primary} 40%, ${COLORS.primaryLight} 70%, ${COLORS.teal} 100%)`,
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 180,
            height: 180,
            top: -60,
            right: -40,
            background: 'radial-gradient(circle, rgba(0,168,204,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 120,
            height: 120,
            bottom: -40,
            left: -20,
            background: 'radial-gradient(circle, rgba(0,137,123,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Top bar with back + contact buttons */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2">
          {/* Back button */}
          <motion.button
            onClick={() => useMobileStore.getState().setScreen('main')}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.95 }}
            aria-label={t('common.back')}
          >
            <BackIcon size={20} className="text-white" />
          </motion.button>

          {/* Contact buttons */}
          <div className="flex items-center gap-2">
            <motion.a
              href="https://wa.me/218911234567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl flex items-center justify-center gap-1.5"
              style={{
                background: 'rgba(37,211,102,0.2)',
                border: '1px solid rgba(37,211,102,0.35)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={t('mobile.chat.whatsapp')}
            >
              <MessageCircle size={18} className="text-green-400" />
            </motion.a>

            <motion.a
              href="tel:+218911234567"
              className="w-10 h-10 rounded-xl flex items-center justify-center gap-1.5"
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={t('mobile.chat.callUs')}
            >
              <Phone size={18} className="text-white" />
            </motion.a>
          </div>
        </div>

        {/* Title section */}
        <div className="relative z-10 px-5 pb-5 pt-1">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: `0 4px 16px rgba(0,0,0,0.15)`,
              }}
            >
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">
                {t('mobile.chat.title')}
              </h1>
              <p className="text-white/60 text-xs mt-0.5">{t('mobile.chat.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Wave SVG */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full"
          viewBox="0 0 400 30"
          preserveAspectRatio="none"
          style={{ height: 16 }}
        >
          <path
            d="M0 30 Q100 0 200 15 Q300 30 400 10 L400 30 Z"
            fill={darkMode ? '#0B1120' : 'white'}
          />
        </svg>
      </div>

      {/* ═══ MESSAGES AREA ═══ */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 bg-white dark:bg-[#0B1120]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${COLORS.accent}30 transparent`,
        }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              custom={msg.isUser}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`flex items-end gap-2 ${
                msg.isUser
                  ? isRTL
                    ? 'flex-row-reverse'
                    : 'flex-row-reverse'
                  : isRTL
                    ? 'flex-row-reverse'
                    : 'flex-row'
              }`}
            >
              {/* Avatar */}
              {!msg.isUser && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.teal})` }}
                >
                  <Bot size={14} className="text-white" />
                </div>
              )}

              {/* Message bubble */}
              <div
                className="rounded-2xl px-4 py-2.5 max-w-[80%]"
                style={{
                  background: msg.isUser
                    ? `linear-gradient(135deg, ${COLORS.secondary}, #E85D50)`
                    : `linear-gradient(135deg, ${COLORS.accent}12, ${COLORS.teal}08)`,
                  border: msg.isUser
                    ? 'none'
                    : `1px solid ${COLORS.accent}18`,
                  boxShadow: msg.isUser
                    ? `0 2px 10px ${COLORS.secondary}25`
                    : `0 1px 6px rgba(0,0,0,0.04)`,
                }}
              >
                <p
                  className={`text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.isUser ? 'text-white' : 'text-gray-800 dark:text-gray-100'
                  }`}
                  style={{
                  textAlign: isRTL ? 'right' : 'left',
                  }}
                >
                  {msg.text}
                </p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.isUser ? 'text-white/50' : 'text-gray-400 dark:text-[#6B7F96]'
                  }`}
                  style={{ textAlign: isRTL ? 'right' : 'left' }}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>

              {/* User avatar */}
              {msg.isUser && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.secondary}, #E85D50)`,
                  }}
                >
                  <span className="text-white text-xs font-bold">U</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && <TypingIndicator isRTL={isRTL} />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* ═══ QUICK ACTION CHIPS ═══ */}
      <AnimatePresence>
        {showWelcome && messages.length <= 2 && !isLoading && (
          <motion.div
            className="px-4 pb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {QUICK_ACTIONS.map((action, i) => {
                const ActionIcon = action.icon;
                return (
                  <motion.button
                    key={action.key}
                    custom={i}
                    variants={chipVariants}
                    initial="initial"
                    animate="animate"
                    onClick={() => handleQuickAction(action.key)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap flex-shrink-0"
                    style={{
                      background: `${action.color}10`,
                      border: `1px solid ${action.color}25`,
                      color: action.color,
                    }}
                    whileHover={{ scale: 1.03, background: `${action.color}18` }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <ActionIcon size={14} />
                    <span className="text-xs font-semibold">{t(action.key)}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ INPUT BAR ═══ */}
      <div
        className="flex-shrink-0 px-4 pb-4 pt-2"
        style={{
          borderTop: `1px solid ${darkMode ? '#1E2A42' : COLORS.accent + '10'}`,
          background: darkMode ? 'rgba(11,17,32,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div
            className="flex-1 relative rounded-2xl overflow-hidden"
            style={{
              border: `2px solid ${inputText ? COLORS.accent : darkMode ? '#1E2A42' : '#E5E5E5'}`,
              transition: 'border-color 0.2s',
              boxShadow: inputText ? `0 0 0 3px ${COLORS.accent}12` : 'none',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('mobile.chat.placeholder')}
              className="w-full py-3 px-4 text-sm bg-white/60 dark:bg-[#151D2E]/60 text-gray-800 dark:text-gray-100 outline-none placeholder:text-gray-400"
              style={{
                textAlign: isRTL ? 'right' : 'left',
              }}
              dir={direction}
              disabled={isLoading}
              maxLength={500}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                inputText.trim() && !isLoading
                  ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.teal})`
                  : darkMode ? '#1E2A42' : '#E5E5E8',
              boxShadow:
                inputText.trim() && !isLoading
                  ? `0 4px 12px ${COLORS.accent}30`
                  : 'none',
            }}
            whileHover={
              inputText.trim() && !isLoading
                ? { scale: 1.05, boxShadow: `0 6px 16px ${COLORS.accent}40` }
                : {}
            }
            whileTap={inputText.trim() && !isLoading ? { scale: 0.95 } : {}}
            aria-label={t('chat.send')}
          >
            {isLoading ? (
              <motion.div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' as const }}
              />
            ) : (
              <Send
                size={18}
                className={inputText.trim() ? 'text-white' : 'text-gray-400 dark:text-[#6B7F96]'}
                style={{
                  transform: isRTL ? 'scaleX(-1)' : 'none',
                }}
              />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
