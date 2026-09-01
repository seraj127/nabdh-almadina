'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Users, Activity, Clock, Shield } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type AuditLogResponse,
  COLORS,
  PaginationControls,
} from '@/components/admin/shared';

// ─── Audit Log View ──────────────────────────────────────────
export function AuditLogView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('');
  const [dateRange, setDateRange] = useState('7d');
  const [page, setPage] = useState(1);

  const dateRangeOptions = [
    { key: '24h', label: language === 'ar' ? 'آخر 24 ساعة' : 'Last 24h' },
    { key: '7d', label: language === 'ar' ? 'آخر 7 أيام' : 'Last 7d' },
    { key: '30d', label: language === 'ar' ? 'آخر 30 يوم' : 'Last 30d' },
    { key: 'all', label: t('admin.all') },
  ];

  const entityOptions = [
    { key: 'all', label: t('admin.all') },
    { key: 'Order', label: language === 'ar' ? 'طلب' : 'Order' },
    { key: 'Product', label: language === 'ar' ? 'منتج' : 'Product' },
    { key: 'Coupon', label: language === 'ar' ? 'كوبون' : 'Coupon' },
    { key: 'Review', label: language === 'ar' ? 'تقييم' : 'Review' },
    { key: 'FeatureFlag', label: language === 'ar' ? 'ميزة' : 'Feature Flag' },
    { key: 'User', label: language === 'ar' ? 'مستخدم' : 'User' },
  ];

  const getDateParams = () => {
    if (dateRange === 'all') return {};
    const now = new Date();
    let startDate: Date;
    switch (dateRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    return { startDate: startDate.toISOString() };
  };

  const { data, isLoading } = useQuery<AuditLogResponse>({
    queryKey: ['admin-audit-log', entityFilter, actionFilter, dateRange, page],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (entityFilter !== 'all') params.set('entity', entityFilter);
      if (actionFilter) params.set('action', actionFilter);
      const dateParams = getDateParams();
      if (dateParams.startDate) params.set('startDate', dateParams.startDate);
      return authFetch(`/api/admin/audit-log?${params}`).then((r) => r.json());
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  // Compute stats from data
  const logs = data?.logs || [];
  const uniqueUsers = new Set(logs.filter((l) => l.user?.id).map((l) => l.user!.id)).size;
  const actionCounts: Record<string, number> = {};
  logs.forEach((l) => {
    actionCounts[l.action] = (actionCounts[l.action] || 0) + 1;
  });
  const topAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];

  const statCards = [
    {
      label: language === 'ar' ? 'سجلات اليوم' : 'Logs Today',
      value: (logs?.length ?? 0).toString(),
      icon: <FileText className="h-5 w-5" />,
      color: COLORS.active,
    },
    {
      label: language === 'ar' ? 'مستخدمون فريدون' : 'Unique Users',
      value: (uniqueUsers ?? 0).toString(),
      icon: <Users className="h-5 w-5" />,
      color: COLORS.purple,
    },
    {
      label: language === 'ar' ? 'أكثر إجراء' : 'Top Action',
      value: topAction ? topAction[0].replace(/_/g, ' ') : '—',
      icon: <Activity className="h-5 w-5" />,
      color: COLORS.success,
    },
  ];

  const getActionColor = (action: string) => {
    if (action.startsWith('CREATE')) return COLORS.success;
    if (action.startsWith('UPDATE')) return COLORS.active;
    if (action.startsWith('DELETE')) return COLORS.danger;
    if (action.startsWith('ENABLE')) return COLORS.success;
    if (action.startsWith('DISABLE')) return COLORS.warning;
    return COLORS.muted;
  };

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="text-2xl font-bold mb-1 truncate" style={{ color: COLORS.text }}>{card.value}</div>
              <div className="text-sm" style={{ color: COLORS.muted }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Entity Filter */}
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border px-3 text-sm"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
        >
          {entityOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Action Filter */}
        <input
          type="text"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          placeholder={language === 'ar' ? 'تصفية بالإجراء...' : 'Filter by action...'}
          className="h-9 rounded-lg border px-3 text-sm max-w-xs"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
        />

        {/* Date Range */}
        <div className="flex gap-2 flex-wrap">
          {dateRangeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setDateRange(opt.key); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: dateRange === opt.key ? `${COLORS.active}20` : COLORS.surface,
                color: dateRange === opt.key ? COLORS.active : COLORS.muted,
                border: `1px solid ${dateRange === opt.key ? `${COLORS.active}40` : COLORS.border}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Auto-refresh indicator */}
        <div className="flex items-center gap-2 ms-auto">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: COLORS.success }} />
          <span className="text-xs" style={{ color: COLORS.muted }}>
            {language === 'ar' ? 'تحديث تلقائي كل 30 ثانية' : 'Auto-refresh 30s'}
          </span>
        </div>
      </div>

      {/* Logs Table */}
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
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'الوقت' : 'Timestamp'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'المستخدم' : 'User'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'الإجراء' : 'Action'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'الكيان' : 'Entity'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'معرف الكيان' : 'Entity ID'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'التفاصيل' : 'Details'}</TableHead>
                  <TableHead style={{ color: COLORS.muted }}>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow style={{ borderColor: COLORS.border }}>
                    <TableCell colSpan={7} className="text-center py-8" style={{ color: COLORS.muted }}>
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const actionColor = getActionColor(log.action);
                    return (
                      <TableRow key={log.id} style={{ borderColor: COLORS.border }}>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" style={{ color: COLORS.muted }} />
                            <span className="text-xs font-mono" style={{ color: COLORS.muted }}>
                              {new Date(log.createdAt).toLocaleString(language === 'ar' ? 'ar-LY' : 'en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {log.user && (
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                style={{ backgroundColor: `${COLORS.active}20`, color: COLORS.active }}
                              >
                                {(log.user.name || log.user.phone).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm" style={{ color: COLORS.text }}>
                              {log.user?.name || log.user?.phone || '—'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{ backgroundColor: `${actionColor}20`, color: actionColor }}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium" style={{ color: COLORS.text }}>
                            {log.entity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs" style={{ color: COLORS.muted }}>
                            {log.entityId ? log.entityId.slice(0, 8) + '...' : '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs truncate max-w-[200px]" style={{ color: COLORS.muted }}>
                            {log.details || '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs" style={{ color: COLORS.muted }}>
                            {log.ip || '—'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
