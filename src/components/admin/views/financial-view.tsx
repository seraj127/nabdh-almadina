'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
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
import { COLORS, LoadingSkeleton, ErrorDisplay } from '@/components/admin/shared';

// ─── Financial View ─────────────────────────────────────────
export function FinancialView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const { data, isLoading, error } = useQuery({
    queryKey: ['financial'],
    queryFn: () => authFetch('/api/admin/financial').then((r) => r.json()),
    refetchInterval: 30000,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={String(error)} />;
  if (!data) return null;

  const accountTypeLabels: Record<string, { ar: string; en: string; color: string }> = {
    asset: { ar: 'أصول', en: 'Assets', color: COLORS.active },
    liability: { ar: 'التزامات', en: 'Liabilities', color: COLORS.warning },
    equity: { ar: 'حقوق الملكية', en: 'Equity', color: COLORS.purple },
    revenue: { ar: 'إيرادات', en: 'Revenue', color: COLORS.success },
    expense: { ar: 'مصروفات', en: 'Expenses', color: COLORS.danger },
  };

  const statCards = [
    {
      label: t('admin.totalRevenue'),
      value: `${data.totalRevenue.toFixed(2)} ${t('product.currency')}`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: COLORS.success,
    },
    {
      label: t('admin.totalExpenses'),
      value: `${data.totalExpenses.toFixed(2)} ${t('product.currency')}`,
      icon: <TrendingDown className="h-5 w-5" />,
      color: COLORS.danger,
    },
    {
      label: t('admin.netIncome'),
      value: `${data.netIncome.toFixed(2)} ${t('product.currency')}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: data.netIncome >= 0 ? COLORS.success : COLORS.danger,
    },
    {
      label: t('admin.ledgerAccounts'),
      value: data.accounts?.length?.toString() || '0',
      icon: <BarChart3 className="h-5 w-5" />,
      color: COLORS.active,
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

      {/* Chart of Accounts */}
      <Card className="border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: COLORS.text }}>
            {t('admin.ledgerAccounts')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow style={{ borderColor: COLORS.border }}>
                <TableHead style={{ color: COLORS.muted }}>Code</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                <TableHead style={{ color: COLORS.muted }}>{language === 'ar' ? 'الرصيد' : 'Balance'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.accounts?.map((account: { id: string; code: string; nameAr: string; nameEn: string; type: string; balance: number }) => {
                const typeInfo = accountTypeLabels[account.type] || { ar: account.type, en: account.type, color: COLORS.muted };
                return (
                  <TableRow key={account.id} style={{ borderColor: COLORS.border }}>
                    <TableCell>
                      <span className="font-mono text-sm" style={{ color: COLORS.active }}>{account.code}</span>
                    </TableCell>
                    <TableCell style={{ color: COLORS.text }}>
                      {language === 'ar' ? account.nameAr : account.nameEn}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${typeInfo.color}20`, color: typeInfo.color }}>
                        {language === 'ar' ? typeInfo.ar : typeInfo.en}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: COLORS.text }}>
                      {account.balance.toFixed(2)} {t('product.currency')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Journal Entries */}
      <Card className="border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <CardHeader>
          <CardTitle className="text-base" style={{ color: COLORS.text }}>
            {t('admin.journalEntries')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data.recentEntries || data.recentEntries.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: COLORS.muted }}>
              {t('common.noData')}
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentEntries.map((entry: { id: string; entryNumber: string; descriptionAr: string; descriptionEn: string; reference: string | null; entryDate: string; lines: { id: string; accountCode: string; accountNameAr: string; accountNameEn: string; debit: number; credit: number }[] }) => (
                <div key={entry.id} className="rounded-lg p-4" style={{ backgroundColor: `${COLORS.bg}80` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm" style={{ color: COLORS.active }}>{entry.entryNumber}</span>
                      <span className="text-sm" style={{ color: COLORS.text }}>
                        {language === 'ar' ? entry.descriptionAr : entry.descriptionEn}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: COLORS.muted }}>
                      {new Date(entry.entryDate).toLocaleDateString(language === 'ar' ? 'ar-LY' : 'en-US')}
                    </span>
                  </div>
                  {entry.reference && (
                    <p className="text-xs mb-2" style={{ color: COLORS.muted }}>
                      Ref: {entry.reference}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {entry.lines?.map((line) => (
                      <div key={line.id} className="flex items-center justify-between text-xs rounded p-1.5" style={{ backgroundColor: COLORS.surface }}>
                        <span style={{ color: COLORS.text }}>
                          {line.accountCode} - {language === 'ar' ? line.accountNameAr : line.accountNameEn}
                        </span>
                        <span style={{ color: line.debit > 0 ? COLORS.success : COLORS.danger }}>
                          {line.debit > 0 ? `Dr ${line.debit}` : `Cr ${line.credit}`} {t('product.currency')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
