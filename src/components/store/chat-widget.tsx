'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Minimize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/ui-store';
import { useLanguageStore } from '@/stores/language-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';

/**
 * ChatWidget — Premium AI assistant floating button + chat panel:
 * 
 * FLOATING BUTTON:
 * - Animated gradient border glow
 * - Unread message badge with bounce animation
 * - Typing indicator dots when bot is responding
 * - Tooltip with translation support
 * - Professional entrance animation with stagger
 * - Smart pulse: faster pulse when idle, none when chat is open
 * - Minimize capability (collapse to mini-bar)
 * 
 * CHAT PANEL:
 * - Glass morphism header with brand gradient
 * - Typing indicator with animated dots
 * - Quick reply chips with smart auto-hide
 * - Auto-focus and auto-scroll
 * - Keyboard support (Enter to send)
 * - Conversation history context (last 10 messages)
 * - Theme-aware styling
 * - Responsive positioning (RTL/LTR)
 * - Clear conversation button
 */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatWidget() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language, direction: s.direction })));
  const isChatOpen = useUIStore((s) => s.isChatOpen);
  const toggleChat = useUIStore((s) => s.toggleChat);
  const closeChat = useUIStore((s) => s.closeChat);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  const isRTL = direction === 'rtl';

  // Quick reply suggestions — fully translated
  const quickReplies = [
    t('chat.qrProducts'),
    t('chat.qrDelivery'),
    t('chat.qrPayment'),
    t('chat.qrTrackOrder'),
  ];

  // Add welcome message on first open
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: t('chat.welcome'),
          timestamp: new Date(),
        },
      ]);
    }
  }, [isChatOpen, messages.length, t]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isChatOpen, isMinimized]);

  // Track unread bot messages when chat is closed
  useEffect(() => {
    if (!isChatOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.id !== 'welcome') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isChatOpen]);

  // Build conversation history for context (exclude welcome message)
  const getConversationHistory = useCallback(() => {
    return messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));
  }, [messages]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const trimmed = (messageText || inputValue).trim();
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
    setRetryMessage(null);

    try {
      // Include conversation history for context-aware AI responses
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language,
          history: history.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || t('chat.errorRetry'),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t('chat.errorRetry'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setRetryMessage(trimmed); // Store for retry
    } finally {
      setIsThinking(false);
    }
  }, [inputValue, isThinking, language, t, messages]);

  const handleRetry = useCallback(() => {
    if (retryMessage) {
      // Remove the error message
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('error-')));
      // Resend the failed message
      sendMessage(retryMessage);
    }
  }, [retryMessage, sendMessage]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setRetryMessage(null);
    // Re-add welcome message
    setTimeout(() => {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: t('chat.welcome'),
          timestamp: new Date(),
        },
      ]);
    }, 100);
  }, [t]);

  const handleQuickReply = (text: string) => {
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleToggleChat = () => {
    if (isChatOpen && !isMinimized) {
      // Currently open and full → minimize
      setIsMinimized(true);
    } else if (isChatOpen && isMinimized) {
      // Currently minimized → expand
      setIsMinimized(false);
    } else {
      // Currently closed → open
      toggleChat();
    }
  };

  const handleCloseChat = () => {
    closeChat();
    setIsMinimized(false);
  };

  // Position classes
  const fabPosition = 'fixed bottom-6 z-50';
  const fabSide = isRTL ? 'left-6' : 'right-6';
  const panelSide = isRTL ? 'left-6' : 'right-6';

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          FLOATING CHAT BUTTON (FAB)
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        className={cn(fabPosition, fabSide)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 20 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && !isChatOpen && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 8 : -8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: isRTL ? 8 : -8, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 whitespace-nowrap',
                'px-3 py-1.5 rounded-lg text-xs font-medium',
                'bg-popover text-popover-foreground shadow-lg border',
                isRTL ? 'right-full me-3' : 'left-full ms-3'
              )}
            >
              {t('floating.chatHelp')}
              <div
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-popover border',
                  isRTL
                    ? '-right-1 border-l-0 border-t-0'
                    : '-left-1 border-r-0 border-b-0'
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Outer glow ring — visible when idle (not open) */}
        {!isChatOpen && (
          <div className="absolute inset-0 -m-1.5 rounded-full chat-fab-glow" />
        )}

        {/* Pulse ring — only when closed and no unread */}
        {!isChatOpen && unreadCount === 0 && (
          <span className="absolute inset-0 rounded-full animate-pulse-ring nabdh-gradient opacity-30" />
        )}

        {/* Main FAB */}
        <motion.button
          onClick={handleToggleChat}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={cn(
            'relative size-14 rounded-full shadow-xl flex items-center justify-center',
            'transition-colors duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nabdh-primary focus-visible:ring-offset-2',
            isChatOpen
              ? 'bg-muted text-muted-foreground hover:bg-muted/80'
              : 'nabdh-gradient text-white hover:shadow-2xl'
          )}
          aria-label={isChatOpen ? t('floating.chatClose') : t('floating.chatOpen')}
          title={isChatOpen ? t('floating.chatClose') : t('floating.chatOpen')}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isChatOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {isMinimized ? <MessageCircle className="size-6" /> : <Minimize2 className="size-5" />}
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageCircle className="size-6" />

                {/* Typing indicator dots — show when bot is thinking and chat is closed */}
                {isThinking && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="size-1 rounded-full bg-white"
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unread badge */}
          {unreadCount > 0 && !isChatOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -end-1 min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center shadow-sm"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </motion.button>

        {/* Subtle "AI" badge at bottom */}
        {!isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5"
          >
            <Sparkles className="size-2.5 text-nabdh-primary/60" />
            <span className="text-[8px] font-semibold tracking-wider text-nabdh-primary/50 uppercase">
              AI
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          CHAT PANEL
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isChatOpen && !isMinimized && (
          <motion.div
            ref={chatPanelRef}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={cn(
              'fixed z-50 w-[360px] max-w-[calc(100vw-3rem)]',
              'bottom-[3.75rem]',
              panelSide
            )}
          >
            <div className="chat-panel-container rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              {/* ── Header ── */}
              <div className="nabdh-gradient p-4 flex items-center justify-between relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-6 -start-6 size-16 rounded-full bg-white/5" />
                <div className="absolute -bottom-4 -end-4 size-12 rounded-full bg-white/5" />

                <div className="flex items-center gap-3 relative z-10">
                  <div className="size-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                    <Bot className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      {t('chat.title')}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                      <p className="text-white/70 text-[11px]">
                        {t('chat.onlineNow')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 relative z-10">
                  {/* Clear chat */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={handleClearChat}
                    title={t('chat.clearChat')}
                  >
                    <RotateCcw className="size-3.5" />
                  </Button>
                  {/* Minimize */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={() => setIsMinimized(true)}
                    title={t('floating.chatMinimize')}
                  >
                    <Minimize2 className="size-3.5" />
                  </Button>
                  {/* Close */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-white/70 hover:text-white hover:bg-white/10"
                    onClick={handleCloseChat}
                    title={t('floating.chatClose')}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* ── Messages Area ── */}
              <div className="h-80 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-background/80">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={cn(
                      'flex gap-2.5',
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        'size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        msg.role === 'user'
                          ? 'nabdh-gradient text-white shadow-sm shadow-nabdh-primary/20'
                          : 'bg-card text-nabdh-primary shadow-sm border'
                      )}
                    >
                      {msg.role === 'user' ? (
                        <User className="size-3.5" />
                      ) : (
                        <Bot className="size-3.5" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={cn(
                        'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                        msg.role === 'user'
                          ? 'nabdh-gradient text-white rounded-ee-sm shadow-sm shadow-nabdh-primary/15'
                          : msg.id.startsWith('error-')
                            ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-es-sm shadow-sm'
                            : 'bg-card text-card-foreground border rounded-es-sm shadow-sm'
                      )}
                    >
                      {msg.content}
                      {/* Retry button for error messages */}
                      {msg.id.startsWith('error-') && retryMessage && (
                        <button
                          onClick={handleRetry}
                          className="mt-2 text-xs font-medium underline underline-offset-2 hover:no-underline"
                        >
                          {t('chat.retry')}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Thinking indicator */}
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2.5"
                  >
                    <div className="size-7 rounded-full bg-card text-nabdh-primary flex items-center justify-center shrink-0 border shadow-sm">
                      <Bot className="size-3.5" />
                    </div>
                    <div className="bg-card border rounded-2xl rounded-es-sm px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="size-1.5 rounded-full bg-nabdh-primary/50"
                            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: 'easeInOut',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Quick Reply Suggestions ── */}
              <AnimatePresence>
                {messages.length <= 2 && !isThinking && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-2 bg-background/60 border-t border-border/30"
                  >
                    <p className="text-[10px] text-muted-foreground mb-2 font-semibold uppercase tracking-wider mt-2">
                      {t('chat.quickQuestions')}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickReplies.map((reply, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => handleQuickReply(reply)}
                          className={cn(
                            'text-[11px] px-3 py-1.5 rounded-full',
                            'border border-border/50 bg-card/50 text-foreground/70',
                            'hover:border-nabdh-primary/30 hover:text-nabdh-primary hover:bg-nabdh-primary/5',
                            'hover:shadow-sm transition-all duration-200'
                          )}
                        >
                          {reply}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Input Area ── */}
              <div className="p-3 border-t bg-card/50">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('chat.placeholder')}
                    className="flex-1 h-10 text-sm rounded-full px-4 bg-background border-border/50"
                    disabled={isThinking}
                  />
                  <Button
                    size="icon"
                    className={cn(
                      'size-10 rounded-full shrink-0 transition-all duration-200',
                      inputValue.trim() && !isThinking
                        ? 'nabdh-gradient text-white hover:shadow-lg hover:shadow-nabdh-primary/25'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                    onClick={() => sendMessage()}
                    disabled={!inputValue.trim() || isThinking}
                  >
                    <Send className={cn('size-4', isRTL && 'rotate-180')} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
