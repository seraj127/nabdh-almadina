'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Loader2, CheckCircle2, X, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productImage: string | null;
  onSuccess?: () => void;
}

const ratingLabels: Record<number, { ar: string; en: string; color: string }> = {
  1: { ar: 'سيء', en: 'Terrible', color: 'text-red-500' },
  2: { ar: 'ضعيف', en: 'Poor', color: 'text-orange-500' },
  3: { ar: 'جيد', en: 'Good', color: 'text-amber-500' },
  4: { ar: 'جيد جداً', en: 'Very Good', color: 'text-emerald-500' },
  5: { ar: 'ممتاز', en: 'Excellent', color: 'text-emerald-600' },
};

export function WriteReviewDialog({
  open,
  onOpenChange,
  productId,
  productName,
  productImage,
  onSuccess,
}: WriteReviewDialogProps) {
  const { t, isAr } = useLanguageStore(useShallow((s) => ({ t: s.t, isAr: s.isAr })));
  const { isLoggedIn, currentUser } = useUIStore(useShallow((s) => ({ isLoggedIn: s.isLoggedIn, currentUser: s.currentUser })));

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setRating(0);
        setHoverRating(0);
        setTitle('');
        setComment('');
        setSubmitting(false);
        setSubmitted(false);
        setError(null);
      }, 300);
    }
  }, [open]);

  // Check if user can review (purchased & delivered)
  useEffect(() => {
    if (open && isLoggedIn && currentUser?.id && productId) {
      fetch(`/api/reviews?productId=${productId}&userId=${currentUser.id}`)
        .then((r) => r.json())
        .then((data) => {
          setCanReview(data.canReview ?? false);
          setHasReviewed(data.hasReviewed ?? false);
          if (data.existingReview) {
            setRating(data.existingReview.rating);
            setTitle(data.existingReview.title || '');
            setComment(data.existingReview.comment || '');
          }
        })
        .catch(() => {});
    }
  }, [open, isLoggedIn, currentUser?.id, productId]);

  const displayRating = hoverRating || rating;
  const ratingLabel = ratingLabels[displayRating];

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(isAr ? 'يرجى اختيار التقييم' : 'Please select a rating');
      return;
    }
    if (comment.trim().length < 10) {
      setError(isAr ? 'التقييم يجب أن يكون ١٠ أحرف على الأقل' : 'Review must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || (isAr ? 'حدث خطأ' : 'An error occurred'));
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 2500);
    } catch {
      setError(isAr ? 'تعذر الاتصال بالخادم' : 'Unable to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-12 px-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="size-10 text-emerald-500" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg font-bold"
              >
                {isAr ? 'تم إرسال التقييم بنجاح!' : 'Review Submitted Successfully!'}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground mt-1"
              >
                {isAr ? 'شكراً لمشاركتك رأيك' : 'Thank you for sharing your opinion'}
              </motion.p>
              {canReview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full"
                >
                  <CheckCircle2 className="size-3.5" />
                  {isAr ? 'مشتري موثق ✓ +50 نقطة' : 'Verified Buyer ✓ +50 points'}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
              <DialogHeader className="p-5 pb-0">
                <DialogTitle className="flex items-center gap-3 text-base">
                  {/* Product mini card */}
                  <div className="size-10 rounded-lg bg-muted/50 border border-border/30 overflow-hidden shrink-0">
                    {productImage ? (
                      <img src={productImage} alt={productName} className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-foreground/30">
                        <Star className="size-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{productName}</p>
                    <p className="text-[11px] text-muted-foreground">{isAr ? 'شاركنا رأيك في هذا المنتج' : 'Share your opinion about this product'}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="px-5 pt-4 pb-5 space-y-5">
                {/* Star Rating */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {isAr ? 'التقييم' : 'Rating'}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-0.5 transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              'size-8 transition-colors duration-150',
                              star <= displayRating
                                ? 'fill-[#D4A843] text-[#D4A843]'
                                : 'text-muted-foreground/25 hover:text-[#D4A843]/50'
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    {displayRating > 0 && ratingLabel && (
                      <motion.span
                        key={displayRating}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn('text-sm font-bold', ratingLabel.color)}
                      >
                        {isAr ? ratingLabel.ar : ratingLabel.en}
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isAr ? 'عنوان التقييم' : 'Review Title'}
                      <span className="text-muted-foreground/50 lowercase ms-1">({isAr ? 'اختياري' : 'optional'})</span>
                    </label>
                    <span className="text-[10px] text-muted-foreground/50">{title.length}/60</span>
                  </div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                    placeholder={isAr ? 'لخص تجربتك في جملة' : 'Summarize your experience in a sentence'}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-nabdh-primary/30 focus:border-nabdh-primary/50 transition-all"
                  />
                </div>

                {/* Comment */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isAr ? 'التقييم التفصيلي' : 'Detailed Review'}
                    </label>
                    <span className={cn('text-[10px]', comment.length < 10 ? 'text-red-400' : 'text-muted-foreground/50')}>
                      {comment.length}/500
                    </span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                    placeholder={isAr ? 'ماذا أعجبك؟ ماذا لم يعجبك؟' : "What did you like? What didn't you like?"}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-border/60 bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-nabdh-primary/30 focus:border-nabdh-primary/50 transition-all"
                  />
                  {comment.length > 0 && comment.length < 10 && (
                    <p className="text-[10px] text-red-400">
                      {isAr ? `أدخل ${10 - comment.length} أحرف أخرى على الأقل` : `Enter at least ${10 - comment.length} more characters`}
                    </p>
                  )}
                </div>

                {/* Verified badge notice */}
                {canReview && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      {isAr ? 'شراء مؤكد — سيظهر كـ "مشتري موثق" + 50 نقطة مكافأة' : 'Confirmed purchase — will show as "Verified Buyer" + 50 bonus points'}
                    </span>
                  </div>
                )}

                {/* Who can rate info */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/30 mt-2">
                  <Info size={14} className="text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-muted-foreground">
                    {isAr ? 'التقييم متاح فقط للمشترين الذين تم توصيل طلبهم • تقييم واحد لكل منتج • +50 نقطة ولاء' : 'Rating available only for buyers with delivered orders • One review per product • +50 loyalty points'}
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30">
                    <X className="size-4 text-red-500 shrink-0" />
                    <span className="text-[11px] text-red-600 dark:text-red-400 font-medium">{error}</span>
                  </div>
                )}

                {/* Submit */}
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                    disabled={submitting}
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || rating === 0}
                    className="flex-1 nabdh-gradient text-white hover:opacity-90 gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {isAr ? 'جاري الإرسال...' : 'Submitting...'}
                      </>
                    ) : hasReviewed ? (
                      isAr ? 'تحديث التقييم' : 'Update Review'
                    ) : (
                      isAr ? 'إرسال التقييم' : 'Submit Review'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
