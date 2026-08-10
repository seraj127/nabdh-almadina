'use client';

import { useState } from 'react';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { useLanguageStore } from '@/stores/language-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Phone, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { COLORS } from '@/components/admin/shared';

export function AdminLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAdminAuthStore();
  const { t, language } = useLanguageStore();
  const isRTL = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(phone, password);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 cc-login-bg"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 0 60px rgba(88, 166, 255, 0.06), 0 25px 50px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Gradient accent */}
        <div
          className="absolute top-0 start-0 end-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, ${COLORS.active}, ${COLORS.purple}, ${COLORS.active})`,
            opacity: 0.6,
          }}
        />
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: COLORS.active,
              boxShadow: '0 0 24px rgba(88, 166, 255, 0.3), 0 0 48px rgba(88, 166, 255, 0.1)',
            }}
          >
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: COLORS.text }}
          >
            {t('nav.admin')}
          </h1>
          <p className="text-sm" style={{ color: COLORS.muted }}>
            {isRTL ? 'سجّل دخولك للوصول إلى لوحة التحكم' : 'Sign in to access the control panel'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg mb-6 text-sm"
            style={{
              backgroundColor: `${COLORS.danger}15`,
              color: COLORS.danger,
              border: `1px solid ${COLORS.danger}30`,
            }}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ms-auto opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label style={{ color: COLORS.text }}>
              {isRTL ? 'رقم الهاتف' : 'Phone Number'}
            </Label>
            <div className="relative">
              <Phone
                className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 ${isRTL ? 'right-3' : 'left-3'}`}
                style={{ color: COLORS.muted }}
              />
              <Input
                type="tel"
                placeholder="0910000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                style={{
                  backgroundColor: COLORS.bg,
                  borderColor: COLORS.border,
                  color: COLORS.text,
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label style={{ color: COLORS.text }}>
              {t('auth.password')}
            </Label>
            <div className="relative">
              <Lock
                className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 ${isRTL ? 'right-3' : 'left-3'}`}
                style={{ color: COLORS.muted }}
              />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                style={{
                  backgroundColor: COLORS.bg,
                  borderColor: COLORS.border,
                  color: COLORS.text,
                }}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !phone || !password}
            className="w-full h-11 font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{
              backgroundColor: COLORS.active,
              opacity: isLoading || !phone || !password ? 0.5 : 1,
              boxShadow: '0 4px 14px rgba(88, 166, 255, 0.25)',
            }}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              t('auth.login')
            )}
          </Button>
        </form>

        {/* Hint — only visible in development */}
        {process.env.NODE_ENV === 'development' && (
        <div
          className="mt-6 p-3 rounded-lg text-xs"
          style={{
            backgroundColor: `${COLORS.active}10`,
            border: `1px solid ${COLORS.active}20`,
            color: COLORS.muted,
          }}
        >
          <p className="font-medium mb-1" style={{ color: COLORS.active }}>
            {isRTL ? '💡 معلومات الدخول الافتراضية:' : '💡 Default credentials:'}
          </p>
          <p>{isRTL ? 'الهاتف: 0910000000' : 'Phone: 0910000000'}</p>
          <p>{isRTL ? 'كلمة المرور: admin123 (أول تسجيل دخول يعيّن كلمة المرور)' : 'Password: admin123 (first login sets the password)'}</p>
        </div>
        )}
      </div>
    </div>
  );
}
