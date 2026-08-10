'use client';

import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLanguageStore } from '@/stores/language-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type StatsData,
  COLORS,
  PIE_COLORS,
  CustomTooltipStyle,
  LoadingSkeleton,
} from '@/components/admin/shared';

// ─── Analytics View ──────────────────────────────────────────
export function AnalyticsView() {
  const { t, language } = useLanguageStore();
  const { data, isLoading } = useQuery<StatsData>({
    queryKey: ['stats'],
    queryFn: () => fetch('/api/stats').then((r) => r.json()),
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!data) return null;

  // Safely ensure numeric fields are actual numbers (defensive against string values from API)
  const safeData = {
    ...data,
    totalRevenue: Number(data.totalRevenue),
    revenueByDay: (data.revenueByDay ?? []).map((d) => ({ ...d, revenue: Number(d.revenue) })),
    topSellingProducts: (data.topSellingProducts ?? []).map((p) => ({
      ...p,
      price: Number(p.price),
      totalQuantity: Number(p.totalQuantity),
      totalRevenue: Number(p.totalRevenue),
    })),
    categoryBreakdown: (data.categoryBreakdown ?? []).map((c) => ({
      ...c,
      productCount: Number(c.productCount),
      revenue: Number(c.revenue),
    })),
  };

  const pieData = Object.entries(safeData.ordersByStatus ?? {}).map(([status, value]) => ({
    name: t(`order.${status}`) || status,
    value,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Over Time */}
        <Card
          className="border"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <CardHeader>
            <CardTitle className="text-base" style={{ color: COLORS.text }}>
              {t('admin.revenueOverTime')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={safeData.revenueByDay}>
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
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.active}
                    strokeWidth={2}
                    dot={{ fill: COLORS.active, r: 4 }}
                    activeDot={{ r: 6, fill: COLORS.active }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Status Pie */}
        <Card
          className="border"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <CardHeader>
            <CardTitle className="text-base" style={{ color: COLORS.text }}>
              {t('admin.ordersByStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CustomTooltipStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-xs" style={{ color: COLORS.muted }}>
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card
        className="border"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <CardHeader>
          <CardTitle className="text-base" style={{ color: COLORS.text }}>
            {t('admin.topSelling')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safeData.topSellingProducts.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center gap-4 p-3 rounded-lg"
                style={{ backgroundColor: COLORS.bg }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                  style={{
                    backgroundColor: `${COLORS.active}20`,
                    color: COLORS.active,
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: COLORS.text }}>
                    {language === 'ar' ? product.nameAr : product.nameEn}
                  </div>
                  <div className="text-xs" style={{ color: COLORS.muted }}>
                    {product.totalQuantity} {t('admin.units')} • {Number(product.totalRevenue).toFixed(2)} {t('product.currency')}
                  </div>
                </div>
                <div
                  className="w-24 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: COLORS.border }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: COLORS.active,
                      width: `${Math.min(
                        100,
                        (product.totalQuantity /
                          Math.max(...safeData.topSellingProducts.map((p) => p.totalQuantity), 1)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          className="border"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <CardHeader>
            <CardTitle className="text-base" style={{ color: COLORS.text }}>
              {language === 'ar' ? 'الإيرادات حسب التصنيف' : 'Revenue by Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {safeData.categoryBreakdown && safeData.categoryBreakdown.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={safeData.categoryBreakdown.map((cat) => ({
                      name: language === 'ar' ? cat.nameAr : cat.nameEn,
                      revenue: Number(cat.revenue),
                      fill: PIE_COLORS[safeData.categoryBreakdown.indexOf(cat) % PIE_COLORS.length],
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis
                      type="number"
                      stroke={COLORS.muted}
                      tick={{ fill: COLORS.muted, fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke={COLORS.muted}
                      tick={{ fill: COLORS.muted, fontSize: 11 }}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={CustomTooltipStyle}
                      formatter={(value: number) => [`${Number(value).toFixed(2)} ${t('product.currency')}`, language === 'ar' ? 'الإيرادات' : 'Revenue']}
                    />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                      {safeData.categoryBreakdown.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-center py-8" style={{ color: COLORS.muted }}>
                {t('common.noData')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
        >
          <CardHeader>
            <CardTitle className="text-base" style={{ color: COLORS.text }}>
              {language === 'ar' ? 'تفاصيل التصنيفات' : 'Category Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {safeData.categoryBreakdown && safeData.categoryBreakdown.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar">
                {safeData.categoryBreakdown.map((cat, index) => {
                  const maxRevenue = Math.max(...safeData.categoryBreakdown.map((c) => Number(c.revenue)), 1);
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: COLORS.bg }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                        style={{
                          backgroundColor: `${PIE_COLORS[index % PIE_COLORS.length]}20`,
                          color: PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      >
                        {cat.productCount}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: COLORS.text }}>
                          {language === 'ar' ? cat.nameAr : cat.nameEn}
                        </div>
                        <div className="text-xs" style={{ color: COLORS.muted }}>
                          {Number(cat.revenue).toFixed(2)} {t('product.currency')}
                        </div>
                      </div>
                      <div
                        className="w-20 h-2 rounded-full overflow-hidden shrink-0"
                        style={{ backgroundColor: COLORS.border }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                            width: `${Math.min(100, (cat.revenue / maxRevenue) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-center py-8" style={{ color: COLORS.muted }}>
                {t('common.noData')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
