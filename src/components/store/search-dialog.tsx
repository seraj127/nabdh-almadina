'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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

export function SearchDialog() {
  const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
  const { isSearchOpen, closeSearch } = useUIStore(useShallow((s) => ({ isSearchOpen: s.isSearchOpen, closeSearch: s.closeSearch })));
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on open
  useEffect(() => {
    if (isSearchOpen) {
      setRecentSearches(getRecentSearches());
      // Focus input after dialog opens
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setIsLoading(false);
    }
  }, [isSearchOpen]);

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
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
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounce input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
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

  const handleSelectResult = (product: SearchResult) => {
    addRecentSearch(query);
    closeSearch();
    // Could navigate to product detail in a full app
    const el = document.querySelector('#products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <Dialog open={isSearchOpen} onOpenChange={(open) => !open && closeSearch()}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{t('search.title')}</DialogTitle>
          <DialogDescription>{t('search.placeholder')}</DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="border-0 shadow-none focus-visible:ring-0 h-10 text-base px-0"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 size-8"
              onClick={() => setQuery('')}
            >
              <X className="size-4" />
            </Button>
          )}
          {isLoading && (
            <Loader2 className="size-5 text-muted-foreground shrink-0 animate-spin" />
          )}
        </div>

        {/* Results / Recent Searches */}
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {/* Active search results */}
            {query.trim() && !isLoading && results.length > 0 && (
              <div className="space-y-1">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectResult(product)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors text-start"
                  >
                    {/* Thumbnail */}
                    <div className="size-12 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      {product.mainImage ? (
                        <img
                          src={product.mainImage}
                          alt={productName(product)}
                          className="size-full object-cover"
                        />
                      ) : (
                        <Search className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {productName(product)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'ar'
                          ? product.category.nameAr
                          : product.category.nameEn}
                      </p>
                    </div>
                    {/* Price */}
                    <span className="text-sm font-semibold text-nabdh-price shrink-0">
                      {product.price} {t('product.currency')}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {query.trim() && !isLoading && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <Search className="size-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t('search.noResults')}
                </p>
              </motion.div>
            )}

            {/* Recent searches (only when no active query) */}
            {!query.trim() && recentSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Clock className="size-3.5" />
                  {t('search.recent')}
                </div>
                <div className="space-y-0.5">
                  {recentSearches.map((search) => (
                    <div
                      key={search}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <button
                        onClick={() => handleRecentClick(search)}
                        className="flex-1 text-sm text-start text-foreground/80"
                      >
                        {search}
                      </button>
                      <button
                        onClick={() => handleRemoveRecent(search)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                        aria-label="Remove"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state with no recent searches */}
            {!query.trim() && recentSearches.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <TrendingUp className="size-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {t('search.placeholder')}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
