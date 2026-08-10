'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';

// ─── Types ───
interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

// ─── Bot Reply Logic ───
function getBotReply(message: string, language: 'ar' | 'en'): string {
  const lower = message.trim().toLowerCase();

  if (language === 'ar') {
    if (lower.includes('مرحب') || lower.includes('هلا') || lower.includes('سلام')) {
      return 'مرحباً بك! كيف يمكنني مساعدتك؟';
    }
    if (lower.includes('مساعدة') || lower.includes('ساعد') || lower.includes('محتاج')) {
      return 'بالطبع! أنا هنا لمساعدتك. ما هو استفسارك؟';
    }
    if (lower.includes('منتج') || lower.includes('استفسار') || lower.includes('بحث')) {
      return 'يمكنك البحث عن المنتج في شريط البحث أو تصفح التصنيفات. هل تريد مساعدة في منتج معين؟';
    }
    if (lower.includes('طلب') || lower.includes('مشكلة') || lower.includes('تتبع') || lower.includes('تأخير')) {
      return 'نعتذر عن أي إزعاج. يرجى تزويدي برقم الطلب وسنتابع معك فوراً.';
    }
    return 'شكراً لتواصلك! سيقوم فريقنا بالرد عليك في أقرب وقت.';
  }

  // English replies
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return 'Hello! How can I help you?';
  }
  if (lower.includes('help') || lower.includes('need') || lower.includes('support')) {
    return 'Of course! I\'m here to help. What is your question?';
  }
  if (lower.includes('product') || lower.includes('search') || lower.includes('inquiry')) {
    return 'You can search for products using the search bar or browse categories. Do you need help with a specific product?';
  }
  if (lower.includes('order') || lower.includes('problem') || lower.includes('track') || lower.includes('delay')) {
    return 'We apologize for any inconvenience. Please provide your order number and we will follow up immediately.';
  }
  return 'Thank you for contacting us! Our team will get back to you as soon as possible.';
}

// ─── Quick Reply Suggestions ───
const QUICK_REPLIES_AR = ['مرحباً', 'أحتاج مساعدة', 'أريد الاستفسار عن منتج', 'مشكلة في الطلب'];
const QUICK_REPLIES_EN = ['Hello', 'I need help', 'Product inquiry', 'Order issue'];

// ─── Component ───
export function MobileChatWidget() {
  const { t, language, direction } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hasUnread] = useState(() => true); // Show red dot initially
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Portal root for overlay (renders at phone frame level)
  const [overlayRoot] = useState<HTMLElement | null>(() =>
    typeof document !== 'undefined'
      ? document.getElementById('mobile-overlay-root')
      : null
  );

  const isRtl = direction === 'rtl';
  const quickReplies = language === 'ar' ? QUICK_REPLIES_AR : QUICK_REPLIES_EN;

  // Toggle handler: adds welcome message on first open + clears unread
  const handleToggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setMessages((msgs) => {
          if (msgs.length === 0) {
            return [
              {
                id: 'welcome',
                role: 'bot' as const,
                content: language === 'ar'
                  ? 'مرحباً بك في نبض المدينة! كيف يمكنني مساعدتك؟'
                  : 'Welcome to Nabd Al-Madina! How can I help you?',
                timestamp: new Date(),
              },
            ];
          }
          return msgs;
        });
      }
      return next;
    });
  }, [language]);

  // Scroll chat messages to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Scroll chat panel to top when opened
  useEffect(() => {
    if (isOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const reply = getBotReply(trimmed, language);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsThinking(false);
    }, 800 + Math.random() * 700);
  }, [isThinking, language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // ─── Chat Panel Overlay (portal) ─────────────────────────────────
  const chatOverlay = isOpen && overlayRoot && createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex flex-col pointer-events-auto"
        style={{ zIndex: 62, background: '#FFFFFF' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        dir={direction}
      >
        {/* ── Header ── */}
        <div
          className="px-4 pt-10 pb-3 flex items-center justify-between flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #004B63 0%, #006B8A 50%, #00897B 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">
                {t('mobile.chat.title')}
              </h3>
              <p className="text-white/70 text-[10px]">
                {language === 'ar' ? 'متصل الآن' : 'Online now'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleChat}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ── Messages Area ── */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'text-white'
                    : 'bg-white shadow-sm'
                }`}
                style={
                  msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #004B63, #00897B)' }
                    : { color: '#004B63' }
                }
              >
                {msg.role === 'user' ? (
                  <User className="w-3.5 h-3.5" />
                ) : (
                  <Bot className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white rounded-ee-sm'
                    : 'bg-gray-100 text-gray-800 rounded-es-sm'
                }`}
                style={
                  msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #00897B, #00A8CC)' }
                    : undefined
                }
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-white dark:bg-[#151D2E] shadow-sm flex items-center justify-center shrink-0 text-[#004B63] dark:text-[#00C4E8]">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-es-sm px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00897B] dark:text-[#00A8CC]" />
                  <span className="text-xs text-gray-400">
                    {language === 'ar' ? 'يكتب...' : 'Typing...'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick Replies ── */}
        {messages.length <= 2 && !isThinking && (
          <div className="px-4 pb-2 flex-shrink-0">
            <p className="text-[10px] text-gray-400 mb-1.5 font-medium">
              {t('mobile.chat.quickReplies')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickReplies.map((reply, i) => (
                <motion.button
                  key={i}
                  onClick={() => sendMessage(reply)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#00897B] hover:text-[#00897B] transition-all duration-200 text-gray-500 bg-gray-50 hover:bg-[#00897B]/5"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {reply}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input Area ── */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('mobile.chat.placeholder')}
              className="flex-1 h-10 text-sm rounded-full px-4 bg-gray-50 border border-gray-200 focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B]/30 outline-none transition-all"
              disabled={isThinking}
              dir={direction}
            />
            <motion.button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isThinking}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              aria-label={t('mobile.chat.send')}
            >
              <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    overlayRoot
  );

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <motion.div
        className={`absolute z-50 ${isRtl ? 'bottom-20 right-4' : 'bottom-20 left-4'}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring' as const, stiffness: 200, damping: 15 }}
      >
        <motion.button
          onClick={handleToggleChat}
          className="relative w-11 h-11 rounded-full shadow-lg flex items-center justify-center"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, #FF6F61, #ff8a7a)'
              : 'linear-gradient(135deg, #004B63, #00897B)',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          aria-label={isOpen ? t('common.close') : t('mobile.chat.title')}
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <Headphones className="w-5 h-5 text-white" />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'linear-gradient(135deg, #004B63, #00897B)' }} />
            </>
          )}

          {/* Unread indicator (red dot) */}
          {hasUnread && !isOpen && (
            <motion.span
              className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-white"
              style={{ background: '#FF3B30' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 15 }}
            >
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: '#FF3B30' }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.span>
          )}
        </motion.button>
      </motion.div>

      {/* Chat Panel Overlay (rendered via portal) */}
      {chatOverlay}
    </>
  );
}
