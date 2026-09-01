'use client';

import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Award } from 'lucide-react';
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
  type LoyaltyResponse,
  COLORS,
  CustomTooltipStyle,
  TIER_COLORS,
  TRANSACTION_TYPE_LABELS,
  LOYALTY_TYPE_LABELS,
  LoadingSkeleton,
  ErrorDisplay,
} from '@/components/admin/shared';

// ─── Wallet & Loyalty View ───────────────────────────────────
export function WalletLoyaltyView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();

  const { data, isLoading, error } = useQuery<LoyaltyResponse>({
    queryKey: ['admin-loyalty'],
    queryFn: () => authFetch('/api/admin/loyalty').then((r) => r.json()),
    refetchInterval: 30000,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={String(error)} />;
  if (!data) return null;

  const totalMembers = data.loyalty.tierDistribution.reduce((acc, td) => acc + td.count, 0);

  const statCards = [
    {
      label: language === 'ar' ? 'إجمالي رصيد المحافظ' : 'Total Wallet Balance',
      value: `${data.wallet.totalBalance.toFixed(2)} ${t('product.currency')}`,
      icon: <Wallet className="h-5 w-5" />,
      color: COLORS.success,
    },
    {
      label: language === 'ar' ? 'نقاط مكتسبة' : 'Points Issued',
      value: data.loyalty.totalPointsIssued.toLocaleString(),
      icon: <TrendingUp className="h-5 w-5" />,
      color: COLORS.active,
    },
    {
      label: language === 'ar' ? 'نقاط مستبدلة' : 'Points Redeemed',
      value: data.loyalty.totalPointsRedeemed.toLocaleString(),
      icon: <TrendingDown className="h-5 w-5" />,
      color: COLORS.warning,
    },
    {
      label: language === 'ar' ? 'أعضاء نشطون' : 'Active Members',
      value: totalMembers?.toString() || '0',
      icon: <Award className="h-5 w-5" />,
      color: COLORS.purple,
    },
  ];

  const tierPieData = data.loyalty.tierDistribution.map((td) => ({
    name: td.tier.charAt(0).toUpperCase() + td.tier.slice(1),
    value: td.count,
    fill: TIER_COLORS[td.tier] || COLORS.muted,
  }));

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
              <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>{card.value}</div>
              <div className="text-sm" style={{ color: COLORS.muted }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tier Distribution Pie Chart */}
        <Card className="border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: COLORS.text }}>
              {t('admin.tierDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tierPieData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tierPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {tierPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CustomTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {tierPieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                      <span className="text-xs" style={{ color: COLORS.muted }}>
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-center py-8" style={{ color: COLORS.muted }}>{t('common.noData')}</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Wallet Transactions */}
        <Card className="border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: COLORS.text }}>
              {t('admin.recentTransactions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {data.wallet.recentTransactions.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: COLORS.muted }}>{t('common.noData')}</p>
              ) : (
                data.wallet.recentTransactions.map((tx) => {
                  const typeInfo = TRANSACTION_TYPE_LABELS[tx.type] || { ar: tx.type, en: tx.type, color: COLORS.muted };
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: COLORS.bg }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}
                      >
                        {tx.type === 'deposit' || tx.type === 'cashback' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: COLORS.text }}>
                          {language === 'ar' ? typeInfo.ar : typeInfo.en}
                        </div>
                        <div className="text-xs truncate" style={{ color: COLORS.muted }}>
                          {tx.description || '—'}
                        </div>
                      </div>
                      <div className="text-sm font-bold shrink-0" style={{ color: typeInfo.color }}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.currency || t('product.currency')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Loyalty Members */}
      <Card className="border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
            <Award className="h-4 w-4" style={{ color: COLORS.warning }} />
            {t('admin.topMembers')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: COLORS.border }}>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.name')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.phone')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.tier')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.loyaltyPoints')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.walletBalance')}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{t('admin.orderCount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topMembers.length === 0 ? (
                <TableRow style={{ borderColor: COLORS.border }}>
                  <TableCell colSpan={6} className="text-center py-8" style={{ color: COLORS.muted }}>
                    {t('common.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                data.topMembers.map((member) => (
                  <TableRow key={member.id} style={{ borderColor: COLORS.border }}>
                    <TableCell style={{ color: COLORS.text }}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: `${TIER_COLORS[member.loyaltyTier] || COLORS.muted}20`, color: TIER_COLORS[member.loyaltyTier] || COLORS.muted }}
                        >
                          {(member.name || member.phone).charAt(0).toUpperCase()}
                        </div>
                        {member.name || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm" style={{ color: COLORS.text }}>{member.phone}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                        style={{
                          backgroundColor: `${TIER_COLORS[member.loyaltyTier] || COLORS.muted}20`,
                          color: TIER_COLORS[member.loyaltyTier] || COLORS.muted,
                        }}
                      >
                        {member.loyaltyTier}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: COLORS.warning }}>
                      {member.loyaltyPoints.toLocaleString()}
                    </TableCell>
                    <TableCell style={{ color: COLORS.text }}>
                      {member.walletBalance.toFixed(2)} {t('product.currency')}
                    </TableCell>
                    <TableCell style={{ color: COLORS.text }}>{member._count.orders}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Loyalty Breakdown */}
        <Card className="border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: COLORS.text }}>
              {language === 'ar' ? 'تفصيل الولاء' : 'Loyalty Breakdown'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.loyalty.breakdown.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: COLORS.muted }}>{t('common.noData')}</p>
              ) : (
                data.loyalty.breakdown.map((item) => {
                  const typeInfo = LOYALTY_TYPE_LABELS[item.type] || { ar: item.type, en: item.type, color: COLORS.muted };
                  return (
                    <div
                      key={item.type}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: COLORS.bg }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}
                        >
                          <Award className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                            {language === 'ar' ? typeInfo.ar : typeInfo.en}
                          </div>
                          <div className="text-xs" style={{ color: COLORS.muted }}>
                            {item.count} {language === 'ar' ? 'معاملة' : 'transactions'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold" style={{ color: typeInfo.color }}>
                        {item.points.toLocaleString()} {language === 'ar' ? 'نقطة' : 'pts'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Breakdown */}
        <Card className="border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: COLORS.text }}>
              {language === 'ar' ? 'تفصيل المحفظة' : 'Wallet Breakdown'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.wallet.breakdown.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: COLORS.muted }}>{t('common.noData')}</p>
              ) : (
                data.wallet.breakdown.map((item) => {
                  const typeInfo = TRANSACTION_TYPE_LABELS[item.type] || { ar: item.type, en: item.type, color: COLORS.muted };
                  return (
                    <div
                      key={item.type}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{ backgroundColor: COLORS.bg }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}
                        >
                          <Wallet className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                            {language === 'ar' ? typeInfo.ar : typeInfo.en}
                          </div>
                          <div className="text-xs" style={{ color: COLORS.muted }}>
                            {item.count} {language === 'ar' ? 'معاملة' : 'transactions'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold" style={{ color: typeInfo.color }}>
                        {item.amount.toFixed(2)} {t('product.currency')}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
