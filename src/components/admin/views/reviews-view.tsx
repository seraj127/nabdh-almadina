'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Star, Shield, Eye, EyeOff, MessageSquare, TrendingUp } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type ReviewsResponse,
  COLORS,
  PaginationControls,
} from '@/components/admin/shared';

// ─── Reviews View ────────────────────────────────────────────
export function ReviewsView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const ratingTabs = [
    { key: 'all', label: t('admin.all') },
    { key: '5', label: '⭐⭐⭐⭐⭐' },
    { key: '4', label: '⭐⭐⭐⭐' },
    { key: '3', label: '⭐⭐⭐' },
    { key: '2', label: '⭐⭐' },
    { key: '1', label: '⭐' },
  ];

  const statusTabs = [
    { key: 'all', label: t('admin.all') },
    { key: 'active', label: t('admin.active') },
    { key: 'inactive', label: t('admin.inactive') },
  ];

  const { data, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ['admin-reviews', ratingFilter, statusFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (ratingFilter !== 'all') params.set('rating', ratingFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      return authFetch(`/api/admin/reviews?${params}`).then((r) => r.json());
    },
  });

  // Update review mutation (verify/hide)
  const reviewMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; isVerified?: boolean; isActive?: boolean }) => {
      const res = await authFetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updateData }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update review');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  const summary = data?.summary || { totalReviews: 0, averageRating: 0, pendingReviews: 0, verifiedReviews: 0 };

  const statCards = [
    {
      label: language === 'ar' ? 'إجمالي التقييمات' : 'Total Reviews',
      value: summary.totalReviews.toString(),
      icon: <MessageSquare className="h-5 w-5" />,
      color: COLORS.active,
    },
    {
      label: t('admin.averageRating'),
      value: summary.averageRating.toFixed(1),
      icon: <Star className="h-5 w-5" />,
      color: COLORS.warning,
    },
    {
      label: language === 'ar' ? 'تقييمات موثقة' : 'Verified Reviews',
      value: summary.verifiedReviews.toString(),
      icon: <Shield className="h-5 w-5" />,
      color: COLORS.success,
    },
    {
      label: language === 'ar' ? 'تقييمات معلقة' : 'Pending Reviews',
      value: summary.pendingReviews.toString(),
      icon: <TrendingUp className="h-5 w-5" />,
      color: COLORS.purple,
    },
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < rating ? 'fill-current' : ''}`}
            style={{ color: i < rating ? COLORS.warning : COLORS.border }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group relative rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] cc-stat-card"
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
          >
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: `0 0 20px ${card.color}20, 0 0 40px ${card.color}10` }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}20`, color: card.color }}
                >
                  {card.icon}
                </div>
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>{card.value}</div>
              <div className="text-sm" style={{ color: COLORS.muted }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {ratingTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setRatingFilter(tab.key); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: ratingFilter === tab.key ? `${COLORS.warning}20` : COLORS.surface,
                color: ratingFilter === tab.key ? COLORS.warning : COLORS.muted,
                border: `1px solid ${ratingFilter === tab.key ? `${COLORS.warning}40` : COLORS.border}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: statusFilter === tab.key ? `${COLORS.active}20` : COLORS.surface,
                color: statusFilter === tab.key ? COLORS.active : COLORS.muted,
                border: `1px solid ${statusFilter === tab.key ? `${COLORS.active}40` : COLORS.border}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <Card className="border overflow-hidden" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded animate-pulse" style={{ backgroundColor: COLORS.bg }} />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: COLORS.border }}>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'المنتج' : 'Product'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'المستخدم' : 'User'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'التقييم' : 'Rating'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'التعليق' : 'Comment'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.reviews?.length === 0 ? (
                  <TableRow style={{ borderColor: COLORS.border }}>
                    <TableCell colSpan={7} className="text-center py-8" style={{ color: COLORS.muted }}>
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.reviews?.map((review) => (
                    <TableRow key={review.id} style={{ borderColor: COLORS.border }}>
                      <TableCell>
                        <div className="text-sm font-medium truncate max-w-[150px]" style={{ color: COLORS.text }}>
                          {language === 'ar' ? review.product.nameAr : review.product.nameEn}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm" style={{ color: COLORS.text }}>
                          {review.user?.name || review.user?.phone || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-xs font-bold" style={{ color: COLORS.warning }}>{review.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm truncate max-w-[200px]" style={{ color: COLORS.muted }}>
                          {review.comment || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {review.isVerified && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: `${COLORS.success}20`, color: COLORS.success }}
                            >
                              ✓ {language === 'ar' ? 'موثق' : 'Verified'}
                            </span>
                          )}
                          {!review.isActive && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: `${COLORS.muted}20`, color: COLORS.muted }}
                            >
                              {language === 'ar' ? 'مخفي' : 'Hidden'}
                            </span>
                          )}
                          {review.isActive && !review.isVerified && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: `${COLORS.warning}20`, color: COLORS.warning }}
                            >
                              {language === 'ar' ? 'معلق' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell style={{ color: COLORS.muted }}>
                        {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {!review.isVerified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              style={{ color: COLORS.success }}
                              className="h-8"
                              onClick={() => reviewMutation.mutate({ id: review.id, isVerified: true })}
                              title={language === 'ar' ? 'توثيق' : 'Verify'}
                            >
                              <Shield className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {review.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              style={{ color: COLORS.warning }}
                              className="h-8"
                              onClick={() => reviewMutation.mutate({ id: review.id, isActive: false })}
                              title={language === 'ar' ? 'إخفاء' : 'Hide'}
                            >
                              <EyeOff className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              style={{ color: COLORS.active }}
                              className="h-8"
                              onClick={() => reviewMutation.mutate({ id: review.id, isActive: true })}
                              title={language === 'ar' ? 'إظهار' : 'Show'}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && (
        <PaginationControls
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          hasPrev={data.pagination.hasPrev}
          hasNext={data.pagination.hasNext}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </div>
  );
}
