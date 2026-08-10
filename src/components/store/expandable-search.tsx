'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mic,
  Camera,
  X,
  Loader2,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';

interface SearchResult {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  mainImage: string | null;
  category: {
    nameAr: string;
    nameEn: string;
  };
}

const RECENT_SEARCHES_KEY = 'nabdh-recent-searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    recent.unshift(query);
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT))
    );
  } catch {
    // Silently fail
  }
}

function removeRecentSearch(query: string) {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  } catch {
    // Silently fail
  }
}

export function ExpandableSearch() {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const isAr = language === 'ar';

  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Voice search state
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Image search state
  const [isImageSearching, setIsImageSearching] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isExpanded]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        collapseSearch();
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isExpanded) {
        collapseSearch();
      }
    }

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isExpanded]);

  const collapseSearch = useCallback(() => {
    setIsExpanded(false);
    setQuery('');
    setResults([]);
    setTotalResults(0);
    setIsLoading(false);
    setImagePreview(null);
    setVoiceError(null);
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/products?search=${encodeURIComponent(searchQuery)}&limit=8`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.products || []);
        setTotalResults(data.total || 0);
      } else {
        setResults([]);
        setTotalResults(0);
      }
    } catch {
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setTotalResults(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  // Click a product result → open product detail page
  const handleSelectResult = (product: SearchResult) => {
    addRecentSearch(query);
    collapseSearch();
    useUIStore.getState().openProductDetail(product.id);
  };

  // "See all results" → set search on catalog and scroll to it
  const handleSeeAllResults = () => {
    addRecentSearch(query);
    useUIStore.getState().setCatalogSearch(query);
    collapseSearch();
    // Scroll to products section after a brief delay for navigation
    setTimeout(() => {
      const el = document.querySelector('#products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRecentClick = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleRemoveRecent = (searchQuery: string) => {
    removeRecentSearch(searchQuery);
    setRecentSearches(getRecentSearches());
  };

  const productName = (product: SearchResult) =>
    language === 'ar' ? product.nameAr : product.nameEn;

  // =====================
  // Voice Search
  // =====================
  const startVoiceSearch = async () => {
    setVoiceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            const res = await fetch('/api/search/voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64Audio }),
            });
            const data = await res.json();
            if (data.text) {
              setQuery(data.text);
            } else {
              setVoiceError(t('search.voiceNotRecognized'));
              setTimeout(() => setVoiceError(null), 3000);
            }
          } catch {
            setVoiceError(t('search.voiceError'));
            setTimeout(() => setVoiceError(null), 3000);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch {
      setVoiceError(t('search.micError'));
      setTimeout(() => setVoiceError(null), 3000);
    }
  };

  const stopVoiceSearch = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  // =====================
  // Image Search
  // =====================
  const handleImageSearch = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    setIsImageSearching(true);
    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = (reader.result as string).split(',')[1];
      try {
        const res = await fetch('/api/search/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });
        const data = await res.json();
        if (data.keywords) {
          setQuery(data.keywords);
        } else {
          setVoiceError(t('search.imageNotRecognized'));
          setTimeout(() => setVoiceError(null), 3000);
        }
      } catch {
        setVoiceError(t('search.imageError'));
        setTimeout(() => setVoiceError(null), 3000);
      } finally {
        setIsImageSearching(false);
      }
    };
    reader.readAsDataURL(file);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden file input for image search */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Collapsed: Lens Icon */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="lens-btn"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(true)}
            className="relative flex items-center justify-center size-10 rounded-full text-foreground/70 hover:text-nabdh-primary hover:bg-nabdh-primary/5 transition-all"
            aria-label={t('nav.search')}
          >
            {/* Lens shape */}
            <div className="relative">
              <div className="size-5 rounded-full border-[2.5px] border-current" />
              <div
                className="absolute bottom-0 translate-y-[1px] rotate-45 origin-top-left w-[2.5px] h-[8px] rounded-b-full bg-current"
                style={{
                  left: '100%',
                  marginLeft: '-1px',
                }}
              />
            </div>
          </motion.button>
        ) : (
          /* Expanded: Search Field */
          <motion.div
            key="search-field"
            initial={{ width: 40, opacity: 0.5, scale: 0.9 }}
            animate={{ width: 'min(480px, calc(100vw - 120px))', opacity: 1, scale: 1 }}
            exit={{ width: 40, opacity: 0.5, scale: 0.9 }}
            transition={{
              type: 'spring' as const,
              stiffness: 350,
              damping: 30,
              mass: 0.8,
            }}
            className="flex items-center gap-1.5 bg-background/95 backdrop-blur-xl border border-border/60 rounded-full shadow-lg shadow-nabdh-primary/10 px-3 h-10"
          >
            {/* Search Icon */}
            <Search className="size-4 text-muted-foreground shrink-0" />

            {/* Input */}
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim() && totalResults > 0) {
                  handleSeeAllResults();
                }
              }}
              placeholder={t('search.productPlaceholder')}
              className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/60 min-w-0 h-full"
              dir={isAr ? 'rtl' : 'ltr'}
            />

            {/* Loading */}
            {isLoading && (
              <Loader2 className="size-4 text-muted-foreground shrink-0 animate-spin" />
            )}

            {/* Image preview thumbnail */}
            {imagePreview && (
              <div className="size-6 rounded-full overflow-hidden shrink-0 ring-1 ring-border">
                <img
                  src={imagePreview}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            )}

            {/* Voice search button */}
            <button
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              className={`shrink-0 size-7 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-muted-foreground hover:text-nabdh-accent hover:bg-nabdh-accent/10'
              }`}
              aria-label={
                isListening
                  ? t('search.stopRecording')
                  : t('search.voiceSearch')
              }
            >
              <Mic className="size-3.5" />
            </button>

            {/* Image search button */}
            <button
              onClick={handleImageSearch}
              disabled={isImageSearching}
              className={`shrink-0 size-7 rounded-full flex items-center justify-center transition-all ${
                isImageSearching
                  ? 'bg-nabdh-primary text-white'
                  : 'text-muted-foreground hover:text-nabdh-primary hover:bg-nabdh-primary/10'
              }`}
              aria-label={t('search.imageSearch')}
            >
              {isImageSearching ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Camera className="size-3.5" />
              )}
            </button>

            {/* Close button */}
            <button
              onClick={collapseSearch}
              className="shrink-0 size-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              aria-label={t('common.close')}
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Error Toast */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-12 start-0 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-medium px-3 py-2 rounded-lg shadow-lg border border-red-200 dark:border-red-800 z-50 whitespace-nowrap"
          >
            {voiceError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-12 start-0 bg-nabdh-primary text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 whitespace-nowrap"
          >
            <div className="flex items-center gap-0.5">
              <span className="size-1.5 rounded-full bg-white animate-bounce [animation-delay:0ms]" />
              <span className="size-1.5 rounded-full bg-white animate-bounce [animation-delay:150ms]" />
              <span className="size-1.5 rounded-full bg-white animate-bounce [animation-delay:300ms]" />
            </div>
            {t('search.listening')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isExpanded && (query.trim() || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 start-0 w-[min(480px,calc(100vw-120px))] bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-xl shadow-nabdh-primary/10 z-50 overflow-hidden"
          >
            <ScrollArea className="max-h-80">
              <div className="p-2">
                {/* Active search results */}
                {query.trim() && !isLoading && results.length > 0 && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <Sparkles className="size-3" />
                      {t('search.resultsLabel')}
                    </div>
                    {results.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectResult(product)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-accent/50 transition-colors text-start"
                      >
                        <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {product.mainImage ? (
                            <img
                              src={product.mainImage}
                              alt={productName(product)}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Search className="size-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {productName(product)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {language === 'ar'
                              ? product.category.nameAr
                              : product.category.nameEn}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-nabdh-price shrink-0">
                          {product.price} {t('product.currency')}
                        </span>
                      </button>
                    ))}

                    {/* "See all results" link */}
                    {totalResults > results.length && (
                      <button
                        onClick={handleSeeAllResults}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 mt-1 rounded-xl text-xs font-medium text-nabdh-primary hover:bg-nabdh-primary/5 transition-colors"
                      >
                        <span>
                          {isAr
                            ? `عرض كل النتائج (${totalResults})`
                            : `See all results (${totalResults})`}
                        </span>
                      </button>
                    )}
                  </div>
                )}

                {/* No results */}
                {query.trim() && !isLoading && results.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <Search className="size-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {t('search.noResults')}
                    </p>
                  </motion.div>
                )}

                {/* Recent searches (only when no active query) */}
                {!query.trim() && recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <Clock className="size-3" />
                      {t('search.recent')}
                    </div>
                    <div className="space-y-0.5">
                      {recentSearches.map((search) => (
                        <div
                          key={search}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-accent/50 transition-colors group"
                        >
                          <button
                            onClick={() => handleRecentClick(search)}
                            className="flex-1 text-xs text-start text-foreground/80"
                          >
                            {search}
                          </button>
                          <button
                            onClick={() => handleRemoveRecent(search)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                            aria-label="Remove"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!query.trim() && recentSearches.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <TrendingUp className="size-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {t('search.emptyHint')}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Search mode hints */}
            <div className="border-t border-border/40 px-3 py-2 flex items-center gap-3 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mic className="size-2.5" />
                <span>{t('search.voice')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Camera className="size-2.5" />
                <span>{t('search.image')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Search className="size-2.5" />
                <span>{t('search.text')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
