'use client';

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Settings, Zap, Power, Shield, AlertTriangle } from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  type FeatureFlagsResponse,
  COLORS,
  LoadingSkeleton,
} from '@/components/admin/shared';

// ─── Settings View ───────────────────────────────────────────
export function SettingsView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();
  const [localMode, setLocalMode] = useState<'normal' | 'high_load' | 'maintenance' | null>(null);

  const { data, isLoading } = useQuery<FeatureFlagsResponse>({
    queryKey: ['feature-flags'],
    queryFn: () => authFetch('/api/admin/feature-flags').then((r) => r.json()),
  });

  // Derive system mode from feature flags, fall back to local override or default
  const systemMode = useMemo<'normal' | 'high_load' | 'maintenance'>(() => {
    if (localMode) return localMode;
    if (data?.flags) {
      const modeFlag = data.flags.find((f) => f.key === 'SYSTEM_MODE');
      if (modeFlag?.description) {
        try {
          const parsed = JSON.parse(modeFlag.description);
          if (parsed.mode && ['normal', 'high_load', 'maintenance'].includes(parsed.mode)) {
            return parsed.mode as 'normal' | 'high_load' | 'maintenance';
          }
        } catch {
          if (['normal', 'high_load', 'maintenance'].includes(modeFlag.description)) {
            return modeFlag.description as 'normal' | 'high_load' | 'maintenance';
          }
        }
      }
    }
    return 'normal';
  }, [data?.flags, localMode]);

  const toggleFlag = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      const res = await authFetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error('Failed to toggle flag');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

  // Persist system mode via feature flags
  const systemModeMutation = useMutation({
    mutationFn: async (mode: 'normal' | 'high_load' | 'maintenance') => {
      // Upsert: first try to update, if flag doesn't exist the API will fail
      // We use the description field to store the mode value
      const res = await authFetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'SYSTEM_MODE', value: true, description: mode }),
      });
      if (!res.ok) throw new Error('Failed to persist system mode');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
    },
  });

  const handleModeChange = (mode: 'normal' | 'high_load' | 'maintenance') => {
    setLocalMode(mode);
    systemModeMutation.mutate(mode);
  };

  // ─── Kill switch definitions ──────────────────────────────────
  const killSwitchDefs = [
    { key: 'KILL_DISABLE_CHECKOUT', labelKey: 'admin.killDisableCheckout' },
    { key: 'KILL_DISABLE_PAYMENTS', labelKey: 'admin.killDisablePayments' },
    { key: 'KILL_DISABLE_DELIVERY', labelKey: 'admin.killDisableDelivery' },
    { key: 'KILL_DISABLE_REGISTRATION', labelKey: 'admin.killDisableRegistration' },
    { key: 'KILL_READONLY_MODE', labelKey: 'admin.killReadonlyMode' },
  ];

  const killSwitchFlags = data?.flags
    ? killSwitchDefs
        .map((def) => {
          const flag = data.flags.find((f) => f.key === def.key);
          return flag ? { ...flag, labelKey: def.labelKey } : null;
        })
        .filter(Boolean) as (typeof killSwitchDefs[number] & { id: string; value: boolean; description: string | null; updatedAt: string })[]
    : [];

  const anyKillSwitchActive = killSwitchFlags.some((f) => f.value);

  // ─── Feature flags by category ────────────────────────────────
  const categoryMap: Record<string, { key: string; labelKey: string; pattern: RegExp }> = {
    payment: { key: 'payment', labelKey: 'admin.paymentFlags', pattern: /^(ENABLE_MOAMALAT|ENABLE_COD)/ },
    catalog: { key: 'catalog', labelKey: 'admin.catalogFlags', pattern: /^(ENABLE_FASHION|ENABLE_PRODUCT_BADGES|ENABLE_SIZE_GUIDES|ENABLE_ELASTICSEARCH)/ },
    notifications: { key: 'notifications', labelKey: 'admin.notificationFlags', pattern: /^ENABLE_WHATSAPP/ },
    system: { key: 'system', labelKey: 'admin.systemFlags', pattern: /^(ENABLE_MULTI_VENDOR|ENABLE_KILL_SWITCHES|ENABLE_SYSTEM_MODES|ENABLE_A_B_TESTING)/ },
    security: { key: 'security', labelKey: 'admin.securityFlags', pattern: /^(ENABLE_ADVANCED_FRAUD|ENABLE_REVIEWS|ENABLE_COUPONS)/ },
  };

  const featureFlagItems = data?.flags
    ? data.flags.filter((f) => !f.key.startsWith('KILL_') && f.key !== 'SYSTEM_MODE')
    : [];

  const groupedFlags = Object.entries(categoryMap).map(([catKey, cat]) => ({
    ...cat,
    flags: featureFlagItems.filter((f) => cat.pattern.test(f.key)),
  }));

  // Catch any uncategorized flags
  const categorizedKeys = new Set(
    groupedFlags.flatMap((g) => g.flags.map((f) => f.key))
  );
  const uncategorized = featureFlagItems.filter((f) => !categorizedKeys.has(f.key));
  if (uncategorized.length > 0) {
    groupedFlags.push({
      key: 'other',
      labelKey: 'admin.systemFlags',
      pattern: /.*/,
      flags: uncategorized,
    });
  }

  // ─── System mode definitions ──────────────────────────────────
  const systemModes = [
    {
      key: 'normal' as const,
      label: t('admin.modeNormal'),
      color: COLORS.success,
      descKey: 'admin.modeNormalDesc',
    },
    {
      key: 'high_load' as const,
      label: t('admin.modeHighLoad'),
      color: COLORS.warning,
      descKey: 'admin.modeHighLoadDesc',
    },
    {
      key: 'maintenance' as const,
      label: t('admin.modeMaintenance'),
      color: COLORS.danger,
      descKey: 'admin.modeMaintenanceDesc',
    },
  ];

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ─── System Mode Section ──────────────────────────────── */}
      <Card
        className="border"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
            <Zap className="h-4 w-4" style={{ color: COLORS.warning }} />
            {t('admin.systemModes')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {systemModes.map((mode) => {
              const isActive = systemMode === mode.key;
              return (
                <button
                  key={mode.key}
                  onClick={() => handleModeChange(mode.key)}
                  className="relative p-4 rounded-xl text-start transition-all duration-200 group"
                  style={{
                    backgroundColor: isActive ? `${mode.color}15` : COLORS.bg,
                    color: isActive ? mode.color : COLORS.muted,
                    border: `1px solid ${isActive ? `${mode.color}40` : COLORS.border}`,
                    boxShadow: isActive ? `0 0 20px ${mode.color}20, 0 0 40px ${mode.color}08` : 'none',
                  }}
                >
                  {/* Indicator dot */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: isActive ? mode.color : COLORS.border,
                        boxShadow: isActive ? `0 0 8px ${mode.color}60` : 'none',
                      }}
                    />
                    <span className="text-sm font-bold">{mode.label}</span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: isActive ? `${mode.color}CC` : COLORS.muted }}
                  >
                    {t(mode.descKey)}
                  </p>
                </button>
              );
            })}
          </div>
          {systemModeMutation.isPending && (
            <div className="mt-3 text-xs" style={{ color: COLORS.warning }}>
              {language === 'ar' ? 'جاري حفظ وضع النظام...' : 'Saving system mode...'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Kill Switches Section ────────────────────────────── */}
      <Card
        className="border"
        style={{
          backgroundColor: COLORS.surface,
          borderColor: anyKillSwitchActive ? `${COLORS.danger}50` : COLORS.border,
          boxShadow: anyKillSwitchActive ? `0 0 24px ${COLORS.danger}15` : 'none',
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-base flex items-center gap-2"
              style={{ color: COLORS.danger }}
            >
              <Power className="h-4 w-4" />
              {t('admin.killSwitches')}
            </CardTitle>
            {anyKillSwitchActive && (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold animate-pulse"
                style={{
                  backgroundColor: `${COLORS.danger}20`,
                  color: COLORS.danger,
                  border: `1px solid ${COLORS.danger}40`,
                }}
              >
                <AlertTriangle className="h-3 w-3" />
                {t('admin.killSwitchWarning')}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {killSwitchFlags.map((flag) => (
              <div
                key={flag.id}
                className="flex items-center justify-between p-3 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: flag.value ? `${COLORS.danger}10` : COLORS.bg,
                  border: `1px solid ${flag.value ? `${COLORS.danger}30` : 'transparent'}`,
                  boxShadow: flag.value ? `0 0 12px ${COLORS.danger}15` : 'none',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium"
                    style={{ color: flag.value ? COLORS.danger : COLORS.text }}
                  >
                    {t(flag.labelKey)}
                  </div>
                  {flag.description && (
                    <div className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                      {flag.description}
                    </div>
                  )}
                  {flag.value && (
                    <div
                      className="text-xs mt-1 font-medium"
                      style={{ color: COLORS.danger }}
                    >
                      ⚠️ {language === 'ar' ? 'مفعّل - النظام متوقف' : 'Active - System halted'}
                    </div>
                  )}
                </div>
                <Switch
                  checked={flag.value}
                  onCheckedChange={() =>
                    toggleFlag.mutate({ key: flag.key, value: !flag.value })
                  }
                  className="data-[state=checked]:bg-red-600 shrink-0 ms-3"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Feature Flags Management (by category) ───────────── */}
      <Card
        className="border"
        style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}
      >
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
            <Shield className="h-4 w-4" style={{ color: COLORS.active }} />
            {t('admin.featureFlags')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupedFlags.map((group) => (
            <div key={group.key}>
              {/* Category Header */}
              <div
                className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color: COLORS.muted }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: COLORS.active }}
                />
                {t(group.labelKey)}
              </div>
              {/* Flags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.flags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      backgroundColor: COLORS.bg,
                      border: `1px solid ${flag.value ? `${COLORS.success}20` : 'transparent'}`,
                    }}
                  >
                    <div className="flex-1 min-w-0 me-3">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: COLORS.text }}
                        title={flag.key.replace(/_/g, ' ')}
                      >
                        {flag.key.replace(/^ENABLE_/, '').replace(/_/g, ' ')}
                      </div>
                      {flag.description && (
                        <div
                          className="text-xs mt-0.5 truncate"
                          style={{ color: COLORS.muted }}
                          title={flag.description}
                        >
                          {flag.description}
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={flag.value}
                      onCheckedChange={() =>
                        toggleFlag.mutate({ key: flag.key, value: !flag.value })
                      }
                      className="shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
