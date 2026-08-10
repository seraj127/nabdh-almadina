import React from 'react';

export const COLORS = {
  bg: '#0D1117',
  surface: '#161B22',
  border: '#30363D',
  active: '#58A6FF',
  success: '#238636',
  warning: '#D29922',
  danger: '#FF3B30',
  purple: '#8B5CF6',
  orange: '#F97316',
  text: '#E6EDF3',
  muted: '#8B949E',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.warning,
  confirmed: COLORS.active,
  processing: COLORS.purple,
  shipped: '#A855F7',
  delivered: COLORS.success,
  cancelled: COLORS.danger,
};

export const PIE_COLORS = [
  COLORS.warning,
  COLORS.active,
  COLORS.purple,
  '#A855F7',
  COLORS.success,
  COLORS.danger,
];

export const CustomTooltipStyle: React.CSSProperties = {
  backgroundColor: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '8px',
  color: COLORS.text,
  padding: '8px 12px',
  fontSize: '12px',
};

export const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

export const VENDOR_TYPE_COLORS: Record<string, string> = {
  RETAILER: COLORS.active,
  BRAND_OFFICIAL: COLORS.success,
  LOCAL_ARTISAN: COLORS.warning,
  SERVICE_PROVIDER: COLORS.purple,
};

export const CARRIER_TYPE_COLORS: Record<string, string> = {
  local: COLORS.success,
  national: COLORS.active,
  international: COLORS.purple,
};

export const SHIPMENT_STATUS_COLORS: Record<string, string> = {
  created: COLORS.warning,
  picked_up: COLORS.active,
  in_transit: COLORS.purple,
  out_for_delivery: '#A855F7',
  delivered: COLORS.success,
  failed: COLORS.danger,
  returned: COLORS.orange,
};

export const INTEGRATION_TYPE_COLORS: Record<string, string> = {
  manual: COLORS.muted,
  api: COLORS.active,
  webhook: COLORS.purple,
};

export const TRANSACTION_TYPE_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  deposit: { ar: 'إيداع', en: 'Deposit', color: COLORS.success },
  withdrawal: { ar: 'سحب', en: 'Withdrawal', color: COLORS.danger },
  refund: { ar: 'استرداد', en: 'Refund', color: COLORS.active },
  cashback: { ar: 'استرداد نقدي', en: 'Cashback', color: COLORS.purple },
  adjustment: { ar: 'تعديل', en: 'Adjustment', color: COLORS.warning },
};

export const LOYALTY_TYPE_LABELS: Record<string, { ar: string; en: string; color: string }> = {
  earn: { ar: 'كسب', en: 'Earn', color: COLORS.success },
  redeem: { ar: 'استبدال', en: 'Redeem', color: COLORS.danger },
  expire: { ar: 'انتهاء', en: 'Expire', color: COLORS.warning },
  bonus: { ar: 'مكافأة', en: 'Bonus', color: COLORS.purple },
};
