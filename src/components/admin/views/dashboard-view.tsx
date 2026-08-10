'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
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
  type StatsData,
  type AdminOrdersResponse,
  COLORS,
  STATUS_COLORS,
  CustomTooltipStyle,
  StatusBadge,
  LoadingSkeleton,
  ErrorDisplay,
} from '@/components/admin/shared';

// ─── Dashboard View ──────────────────────────────────────────
export function DashboardView() {
  const { t, language } = useLanguageStore();
  const { data, isLoading, error } = useQuery<StatsData>({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then((r) => r.json()),
    refetchInterval: 30000,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={String(error)} />;
  if (!data) return null;

  // Safely ensure numeric fields are actual numbers
  const safeTotalRevenue = Number(data.totalRevenue);
  const safeRevenueByDay = (data.revenueByDay ?? []).map((d) => ({ ...d, revenue: Number(d.revenue) }));

  // Compute revenue trend from revenueByDay data
  const revenueTrend = (() => {
    const days = safeRevenueByDay;
    if (days.length < 6) return null; // need at least 6 days
    const last3 = days.slice(-3);
    const prev3 = days.slice(-6, -3);
    const lastAvg = last3.reduce((s, d) => s + d.revenue, 0) / 3;
    const prevAvg = prev3.reduce((s, d) => s + d.revenue, 0) / 3;
    if (prevAvg === 0) return null;
    const pct = ((lastAvg - prevAvg) / prevAvg) * 100;
    return { value: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, up: pct >= 0 };
  })();

  const statCards = [
    {
      label: t('admin.totalRevenue'),
      value: `${safeTotalRevenue.toFixed(2)} ${t('product.currency')}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: COLORS.success,
      trend: revenueTrend ? revenueTrend.value : undefined,
      trendUp: revenueTrend ? revenueTrend.up : undefined,
    },
    {
      label: t('admin.totalOrders'),
      value: data.totalOrders.toString(),
      icon: <ShoppingCart className="h-5 w-5" />,
      color: COLORS.active,
      trend: undefined,
      trendUp: undefined,
    },
    {
      label: t('admin.totalProducts'),
      value: data.totalProducts.toString(),
      icon: <Package className="h-5 w-5" />,
      color: COLORS.purple,
      trend: undefined,
      trendUp: undefined,
    },
    {
      label: t('admin.totalCustomers'),
      value: data.totalUsers.toString(),
      icon: <Users className="h-5 w-5" />,
      color: COLORS.orange,
      trend: undefined,
      trendUp: undefined,
    },
  ];

  const statusEntries = Object.entries(data.ordersByStatus ?? {});
  const barData = statusEntries.map(([status, count]) => ({
    status: t(`order.${status}`) || status,
    count,
    fill: STATUS_COLORS[status] || COLORS.muted,
  }));

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group relative rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] cc-stat-card"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            }}
          >
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                boxShadow: `0 0 20px ${card.color}20, 0 0 40px ${card.color}10`,
              }}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}20`, color: card.color }}
                >
                  {card.icon}
                </div>
                {card.trend !== undefined && card.trendUp !== undefined && (
                  <div
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: card.trendUp ? COLORS.success : COLORS.danger }}
                  >
                    {card.trendUp ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {card.trend}
                  </div>
                )}
              </div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: COLORS.text }}
              >
                {card.value}
              </div>
              <div
                className="text-sm"
                style={{ color: COLORS.muted }}
              >
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <Card
          className="border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <CardHeader>
            <CardTitle
              className="text-base"
              style={{ color: COLORS.text }}
            >
              {t('admin.revenueChart')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={safeRevenueByDay}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis
                    dataKey="date"
                    stroke={COLORS.muted}
                    tick={{ fill: COLORS.muted, fontSize: 11 }}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis
                    stroke={COLORS.muted}
                    tick={{ fill: COLORS.muted, fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={CustomTooltipStyle}
                    formatter={(value: number) => [`${value} ${t('product.currency')}`, t('admin.totalRevenue')]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card
          className="border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <CardHeader>
            <CardTitle
              className="text-base"
              style={{ color: COLORS.text }}
            >
              {t('admin.ordersByStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis
                    type="number"
                    stroke={COLORS.muted}
                    tick={{ fill: COLORS.muted, fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    stroke={COLORS.muted}
                    tick={{ fill: COLORS.muted, fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <Card
          className="lg:col-span-2 border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <CardHeader>
            <CardTitle
              className="text-base"
              style={{ color: COLORS.text }}
            >
              {t('admin.recentOrders')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable />
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card
          className="border"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <CardHeader>
            <CardTitle
              className="text-base flex items-center gap-2"
              style={{ color: COLORS.warning }}
            >
              <AlertTriangle className="h-4 w-4" />
              {t('admin.lowStockAlerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {data.lowStockProducts.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: COLORS.muted }}>
                  {t('common.noData')}
                </p>
              ) : (
                data.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2 rounded-lg"
                    style={{ backgroundColor: `${COLORS.bg}80` }}
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor:
                          product.stock <= 3
                            ? `${COLORS.danger}20`
                            : `${COLORS.warning}20`,
                        color:
                          product.stock <= 3 ? COLORS.danger : COLORS.warning,
                      }}
                    >
                      {product.stock}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: COLORS.text }}
                      >
                        {language === 'ar' ? product.nameAr : product.nameEn}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: COLORS.muted }}
                      >
                        {product.sku}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Recent Orders Table (used in Dashboard) ─────────────────
export function RecentOrdersTable() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const { data, isLoading } = useQuery<AdminOrdersResponse>({
    queryKey: ['admin-orders', 1],
    queryFn: () =>
      authFetch('/api/admin/orders?limit=5').then((r) => r.json()),
  });

  if (isLoading)
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded animate-pulse"
            style={{ backgroundColor: COLORS.bg }}
          />
        ))}
      </div>
    );

  if (!data?.orders?.length)
    return (
      <p className="text-sm text-center py-4" style={{ color: COLORS.muted }}>
        {t('common.noData')}
      </p>
    );

  return (
    <Table>
      <TableHeader>
        <TableRow style={{ borderColor: COLORS.border }}>
          <TableHead style={{ color: COLORS.muted }}>{t('admin.orderNumber')}</TableHead>
          <TableHead style={{ color: COLORS.muted }}>{t('admin.customer')}</TableHead>
          <TableHead style={{ color: COLORS.muted }}>{t('admin.amount')}</TableHead>
          <TableHead style={{ color: COLORS.muted }}>{t('admin.status')}</TableHead>
          <TableHead style={{ color: COLORS.muted }}>{t('admin.date')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.orders.slice(0, 5).map((order) => (
          <TableRow key={order.id} style={{ borderColor: COLORS.border }}>
            <TableCell>
              <span className="font-mono text-sm" style={{ color: COLORS.active }}>
                {order.orderNumber}
              </span>
            </TableCell>
            <TableCell style={{ color: COLORS.text }}>
              {order.user.name || order.user.phone}
            </TableCell>
            <TableCell style={{ color: COLORS.text }}>
              {order.total.toFixed(2)} {t('product.currency')}
            </TableCell>
            <TableCell>
              <StatusBadge status={order.status} />
            </TableCell>
            <TableCell style={{ color: COLORS.muted }}>
              {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
