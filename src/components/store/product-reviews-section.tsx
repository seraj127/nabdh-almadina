'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  CheckCircle,
  ChevronDown,
  Loader2,
  MessageSquare,
  PenLine,
  ThumbsUp,
  Info,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { renderStars, fmt } from './lib/shared';
import { WriteReviewDialog } from './write-review-dialog';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string | null;
  isVerified: boolean;
  createdAt: string;
  userName: string;
  userAvatar: string | null;
}

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  productImage: string | null;
  rating: number;
  reviewCount: number;
}

function timeAgo(dateStr: string, isAr: boolean): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (minutes < 1) return isAr ? 'الآن' : 'just now';
  if (minutes < 60) return isAr ? `منذ ${minutes} دقيقة` : `${minutes}m ago`;
  if (hours < 24) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
  if (days < 7) return isAr ? `منذ ${days} يوم` : `${days}d ago`;
  if (weeks < 5) return isAr ? `منذ ${weeks} أسبوع` : `${weeks}w ago`;
  if (months < 12) return isAr ? `منذ ${months} شهر` : `${months}mo ago`;
  return isAr ? `منذ سنة` : '1y+ ago';
}

export function ProductReviewsSection({
  productId,
  productName,
  productImage,
  rating,
  reviewCount,
}: ProductReviewsSectionProps) {
  const { isAr } = useLanguageStore(useShallow((s) => ({ isAr: s.isAr })));
  const { isLoggedIn } = useUIStore(useShallow((s) => ({ isLoggedIn: s.isLoggedIn })));

  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [showEligibilityInfo, setShowEligibilityInfo] = useState(false);

  const fetchReviews = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        productId,
        page: String(p),
        limit: '5',
        sort: s,
      });
      const res = await fetch(`/api/reviews?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(p === 1 ? data.reviews : (prev: Review[]) => [...prev, ...data.reviews]);
        setTotal(data.total);
        if (data.distribution) setDistribution(data.distribution);
        if (data.canReview !== undefined) setCanReview(data.canReview);
        if (data.hasReviewed !== undefined) setHasReviewed(data.hasReviewed);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [productId]);

  // Initial load — use a ref to track if we need to fetch
  const sortRef = useCallback((s: string) => {
    setSort(s);
    setPage(1);
    // Start the fetch in a microtask to avoid the effect issue
    fetchReviews(1, s);
  }, [fetchReviews]);

  // Load on mount
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          productId,
          page: '1',
          limit: '5',
          sort,
        });
        const res = await fetch(`/api/reviews?${params}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews);
          setTotal(data.total);
          if (data.distribution) setDistribution(data.distribution);
          if (data.canReview !== undefined) setCanReview(data.canReview);
          if (data.hasReviewed !== undefined) setHasReviewed(data.hasReviewed);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
    return () => controller.abort();
  }, [productId]);

  const handleSortChange = (newSort: string) => {
    sortRef(newSort);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage, sort);
  };

  const onReviewSuccess = () => {
    fetchReviews(1, sort);
  };

  const maxDist = Math.max(1, ...Object.values(distribution));
  const totalPages = Math.ceil(total / 5);

  return (
    <>
      <div className="space-y-6">
        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="size-5 text-nabdh-primary" />
            {isAr ? 'تقييمات العملاء' : 'Customer Reviews'}
          </h3>
          {isLoggedIn && (
            <Button
              onClick={() => setReviewDialogOpen(true)}
              size="sm"
              className="nabdh-gradient text-white gap-1.5 text-xs hover:opacity-90"
            >
              <PenLine className="size-3.5" />
              {hasReviewed
                ? (isAr ? 'تعديل التقييم' : 'Edit Review')
                : (isAr ? 'اكتب تقييماً' : 'Write a Review')}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          {/* ─── Rating Summary ─── */}
          <div className="glass-card rounded-2xl p-5 space-y-5 h-fit">
            {/* Big rating */}
            <div className="text-center space-y-2">
              <div className="text-5xl font-bold text-foreground">{fmt(rating, 1)}</div>
              <div className="flex items-center justify-center gap-0.5">
                {renderStars(rating, 'size-5')}
              </div>
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? `${reviewCount} تقييم`
                  : `${reviewCount} review${reviewCount !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Distribution bars */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star] || 0;
                const pct = maxDist > 0 ? (count / maxDist) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground w-3 text-center">{star}</span>
                    <Star className="size-3 fill-[#D4A843] text-[#D4A843] shrink-0" />
                    <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: (5 - star) * 0.08 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-6 text-end tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Write review prompt (mobile) */}
            {isLoggedIn && (
              <Button
                onClick={() => setReviewDialogOpen(true)}
                className="w-full nabdh-gradient text-white gap-1.5 hover:opacity-90 md:hidden"
              >
                <PenLine className="size-4" />
                {hasReviewed
                  ? (isAr ? 'تعديل التقييم' : 'Edit Review')
                  : (isAr ? 'اكتب تقييماً' : 'Write a Review')}
              </Button>
            )}

            {/* Login prompt for guests */}
            {!isLoggedIn && (
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  {isAr ? 'سجّل دخولك لكتابة تقييم' : 'Sign in to write a review'}
                </p>
                <Button
                  onClick={() => useUIStore.getState().setAuthView('login')}
                  variant="outline"
                  size="sm"
                  className="text-nabdh-primary border-nabdh-primary/30"
                >
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </Button>
              </div>
            )}
          </div>

          {/* ─── Reviews List ─── */}
          <div className="space-y-4">
            {/* Sort */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {isAr ? `${total} تقييم` : `${total} reviews`}
              </span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none text-xs bg-muted/50 border border-border/50 rounded-lg px-3 py-1.5 pe-7 focus:outline-none focus:ring-1 focus:ring-nabdh-primary/30 cursor-pointer"
                >
                  <option value="newest">{isAr ? 'الأحدث' : 'Newest'}</option>
                  <option value="highest">{isAr ? 'الأعلى تقييماً' : 'Highest Rated'}</option>
                  <option value="lowest">{isAr ? 'الأدنى تقييماً' : 'Lowest Rated'}</option>
                </select>
                <ChevronDown className="size-3 absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Review Cards */}
            {reviews.length === 0 && !loading ? (
              <div className="glass-card rounded-2xl p-8 text-center space-y-3">
                <div className="size-14 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                  <Star className="size-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isAr ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {isAr ? 'كن أول من يقيّم هذا المنتج!' : 'Be the first to review this product!'}
                </p>
                {isLoggedIn && (
                  <Button
                    onClick={() => setReviewDialogOpen(true)}
                    size="sm"
                    className="nabdh-gradient text-white mt-2 gap-1.5 hover:opacity-90"
                  >
                    <PenLine className="size-3.5" />
                    {isAr ? 'اكتب تقييماً' : 'Write a Review'}
                  </Button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card rounded-xl p-4 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="size-9 rounded-full overflow-hidden shrink-0 bg-muted/50">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="size-full object-cover" />
                        ) : (
                          <div className="size-full nabdh-gradient flex items-center justify-center text-white text-xs font-bold">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">{review.userName}</span>
                          {review.isVerified && (
                            <Badge className="text-[9px] px-1.5 py-0 border-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 gap-0.5">
                              <CheckCircle className="size-2.5" />
                              {isAr ? 'مشتري موثق' : 'Verified'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'size-3',
                                  i < review.rating
                                    ? 'fill-[#D4A843] text-[#D4A843]'
                                    : 'text-muted-foreground/25'
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {timeAgo(review.createdAt, isAr)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Title & Comment */}
                    {review.title && (
                      <p className="text-sm font-bold">{review.title}</p>
                    )}
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    )}

                    {/* Review Images */}
                    {review.images && (() => {
                      try {
                        const imgs = JSON.parse(review.images) as string[];
                        if (imgs.length > 0) {
                          return (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {imgs.map((img, i) => (
                                <div key={i} className="size-16 rounded-lg overflow-hidden shrink-0 border border-border/30">
                                  <img src={img} alt="" className="size-full object-cover" />
                                </div>
                              ))}
                            </div>
                          );
                        }
                      } catch { /* ignore */ }
                      return null;
                    })()}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Load More */}
            {page < totalPages && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={loading}
                  className="gap-1.5 text-xs"
                >
                  {loading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ThumbsUp className="size-3.5" />
                  )}
                  {isAr ? 'عرض المزيد' : 'Load More'}
                </Button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && reviews.length === 0 && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card rounded-xl p-4 space-y-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-muted/50" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-24 bg-muted/50 rounded" />
                        <div className="h-2 w-16 bg-muted/50 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-full bg-muted/50 rounded" />
                    <div className="h-3 w-3/4 bg-muted/50 rounded" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Who Can Rate & When ─── */}
      <div className="glass-card rounded-2xl p-5 mt-4">
        <button
          onClick={() => setShowEligibilityInfo(!showEligibilityInfo)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-950/30">
              <Info size={16} className="text-amber-600" />
            </div>
            <span className="text-sm font-bold">{isAr ? 'من يقيم ومتى يقيم؟' : 'Who Can Rate & When?'}</span>
          </div>
          <ChevronDown className={cn(
            'size-4 text-muted-foreground transition-transform',
            showEligibilityInfo && 'rotate-180'
          )} />
        </button>
        <AnimatePresence>
          {showEligibilityInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2.5">
                {[
                  { icon: ShieldCheck, text: isAr ? 'فقط المشترين الذين تم توصيل طلبهم يمكنهم التقييم' : 'Only buyers with delivered orders can rate', color: 'text-emerald-500' },
                  { icon: Star, text: isAr ? 'تقييم واحد لكل منتج لكل مستخدم' : 'One review per product per user', color: 'text-[#D4A843]' },
                  { icon: Award, text: isAr ? 'التقييم الموثق يحصل على +50 نقطة ولاء' : 'Verified review earns +50 loyalty points', color: 'text-[#D4A843]' },
                  { icon: PenLine, text: isAr ? 'يمكنك تعديل تقييمك في أي وقت' : 'You can edit your review anytime', color: 'text-nabdh-primary' },
                ].map((rule, i) => {
                  const RuleIcon = rule.icon;
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted/50 shrink-0">
                        <RuleIcon size={12} className={rule.color} />
                      </div>
                      <span className="text-xs text-muted-foreground">{rule.text}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Write Review Dialog */}
      <WriteReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        productId={productId}
        productName={productName}
        productImage={productImage}
        onSuccess={onReviewSuccess}
      />
    </>
  );
}
