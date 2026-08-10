'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Award, Shield, Search } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type UsersResponse,
  COLORS,
  TIER_COLORS,
  LoadingSkeleton,
  ErrorDisplay,
  PaginationControls,
} from '@/components/admin/shared';

// ─── Customers View ──────────────────────────────────────────
export function CustomersView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('all');

  const roleTabs = [
    { key: 'all', label: t('admin.all') },
    { key: 'CUSTOMER', label: language === 'ar' ? 'عميل' : 'Customer' },
    { key: 'ADMIN', label: language === 'ar' ? 'مدير' : 'Admin' },
    { key: 'VENDOR', label: language === 'ar' ? 'بائع' : 'Vendor' },
    { key: 'DRIVER', label: language === 'ar' ? 'سائق' : 'Driver' },
  ];

  const { data, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ['admin-users', search, page, roleFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      return authFetch(`/api/admin/users?${params}`).then((r) => r.json());
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={String(error)} />;

  const statCards = [
    {
      label: t('admin.totalCustomers'),
      value: data?.summary?.totalCustomers?.toString() || '0',
      icon: <Users className="h-5 w-5" />,
      color: COLORS.active,
    },
    {
      label: t('admin.newCustomers'),
      value: data?.pagination?.total?.toString() || '0',
      icon: <TrendingUp className="h-5 w-5" />,
      color: COLORS.success,
    },
    {
      label: t('admin.activeCustomers'),
      value: data?.users?.filter((u) => u.isActive).length?.toString() || '0',
      icon: <Award className="h-5 w-5" />,
      color: COLORS.purple,
    },
    {
      label: language === 'ar' ? 'إجمالي المديرين' : 'Total Admins',
      value: data?.summary?.totalAdmins?.toString() || '0',
      icon: <Shield className="h-5 w-5" />,
      color: COLORS.orange,
    },
  ];

  return (
    <div className="space-y-6">
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
              <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>
                {card.value}
              </div>
              <div className="text-sm" style={{ color: COLORS.muted }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Role Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4"
            style={{
              color: COLORS.muted,
              [language === 'ar' ? 'right' : 'left']: '12px',
            }}
          />
          <Input
            placeholder={language === 'ar' ? 'بحث عن عميل...' : 'Search customers...'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={language === 'ar' ? 'pr-10' : 'pl-10'}
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {roleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setRoleFilter(tab.key); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: roleFilter === tab.key ? `${COLORS.active}20` : COLORS.surface,
                color: roleFilter === tab.key ? COLORS.active : COLORS.muted,
                border: `1px solid ${roleFilter === tab.key ? `${COLORS.active}40` : COLORS.border}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="border overflow-hidden" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: COLORS.border }}>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.name')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.phone')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'الدور' : 'Role'}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.tier')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.walletBalance')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.loyaltyPoints')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.orderCount')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.joinDate')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.users?.length === 0 ? (
                <TableRow style={{ borderColor: COLORS.border }}>
                  <TableCell colSpan={8} className="text-center py-8" style={{ color: COLORS.muted }}>
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                data?.users?.map((user) => (
                  <TableRow key={user.id} style={{ borderColor: COLORS.border }}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: `${COLORS.active}20`, color: COLORS.active }}
                        >
                          {(user.name || user.phone).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                            {user.name || '—'}
                          </div>
                          <div className="text-xs" style={{ color: COLORS.muted }}>{user.email || '—'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm" style={{ color: COLORS.text }}>{user.phone}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: `${user.role === 'ADMIN' ? COLORS.danger : user.role === 'VENDOR' ? COLORS.purple : user.role === 'DRIVER' ? COLORS.warning : COLORS.active}20`,
                          color: user.role === 'ADMIN' ? COLORS.danger : user.role === 'VENDOR' ? COLORS.purple : user.role === 'DRIVER' ? COLORS.warning : COLORS.active,
                        }}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                        style={{
                          backgroundColor: `${TIER_COLORS[user.loyaltyTier] || COLORS.muted}20`,
                          color: TIER_COLORS[user.loyaltyTier] || COLORS.muted,
                        }}
                      >
                        {user.loyaltyTier}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: COLORS.text }}>
                      {user.walletBalance.toFixed(2)} {t('product.currency')}
                    </TableCell>
                    <TableCell style={{ color: COLORS.text }}>
                      {user.loyaltyPoints.toLocaleString()}
                    </TableCell>
                    <TableCell style={{ color: COLORS.text }}>
                      {user._count.orders}
                    </TableCell>
                    <TableCell style={{ color: COLORS.muted }}>
                      {new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
