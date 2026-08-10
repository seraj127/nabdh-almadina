'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface LoginForm {
  phone: string;
  password: string;
}

interface FormErrors {
  phone?: string;
  password?: string;
  general?: string;
}

export function AuthLoginPage() {
  const { language, direction, t } = useLanguageStore(useShallow((s) => ({ language: s.language, direction: s.direction, t: s.t })));
  const { login, setAuthView } = useUIStore(useShallow((s) => ({ login: s.login, setAuthView: s.setAuthView })));
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';

  const [form, setForm] = useState<LoginForm>({ phone: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStep, setForgotStep] = useState<'phone' | 'otp' | 'reset' | 'done'>('phone');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [demoCode, setDemoCode] = useState('');

  // Restore remembered phone number
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nabdh-remembered-phone');
      if (saved) {
        setForm(f => ({ ...f, phone: saved }));
        setRememberMe(true);
      }
    } catch {}
  }, []);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.phone.trim()) {
      newErrors.phone = t('validation.required');
    }
    if (!form.password) {
      newErrors.password = t('validation.required');
    } else if (form.password.length < 4) {
      newErrors.password = t('validation.passwordTooShort');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Save phone number if rememberMe is checked
    if (rememberMe) {
      try { localStorage.setItem('nabdh-remembered-phone', form.phone.trim()); } catch {}
    } else {
      try { localStorage.removeItem('nabdh-remembered-phone'); } catch {}
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone.trim(), password: form.password, platform: 'web' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || t('error.loginFailed') });
        setIsSubmitting(false);
        return;
      }

      const isReturning = data.isReturningUser || false;
      login({
        id: data.user.id,
        name: data.user.name || '',
        phone: data.user.phone,
        email: data.user.email || undefined,
        avatar: data.user.avatar || undefined,
        role: data.user.role || 'customer',
      }, isReturning);
    } catch {
      setErrors({ general: t('error.serverConnection') });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  // Forgot password handlers
  const handleSendOtp = async () => {
    setForgotError('');
    if (!forgotPhone.trim()) {
      setForgotError(isAr ? 'أدخل رقم الهاتف' : 'Enter your phone number');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone: forgotPhone.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotStep('otp');
        if (data.demoCode) setDemoCode(data.demoCode);
      } else {
        setForgotError(data.error || (isAr ? 'فشل إرسال الكود' : 'Failed to send code'));
      }
    } catch {
      setForgotError(isAr ? 'فشل الاتصال بالخادم' : 'Connection failed');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setForgotError('');
    if (!forgotOtp.trim()) {
      setForgotError(isAr ? 'أدخل كود التحقق' : 'Enter verification code');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone: forgotPhone.trim(), code: forgotOtp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotStep('reset');
      } else {
        setForgotError(data.error || (isAr ? 'كود التحقق غير صحيح' : 'Invalid verification code'));
      }
    } catch {
      setForgotError(isAr ? 'فشل الاتصال بالخادم' : 'Connection failed');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotError('');
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          phone: forgotPhone.trim(),
          code: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotStep('done');
      } else {
        setForgotError(data.error || (isAr ? 'فشل إعادة تعيين كلمة المرور' : 'Failed to reset password'));
      }
    } catch {
      setForgotError(isAr ? 'فشل الاتصال بالخادم' : 'Connection failed');
    } finally {
      setForgotLoading(false);
    }
  };

  const features = [
    {
      icon: ShieldCheck,
      title: t('auth.featureShopSafely'),
      desc: t('auth.featureShopSafelyDesc'),
    },
    {
      icon: Truck,
      title: t('auth.featureTrackOrders'),
      desc: t('auth.featureTrackOrdersDesc'),
    },
    {
      icon: Headphones,
      title: t('auth.featureSupport'),
      desc: t('auth.featureSupportDesc'),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-12 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-nabdh-primary/10 border border-nabdh-primary/10">
          {/* Login Form - First in DOM = Right side in RTL */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card p-6 sm:p-8 xl:p-10"
          >
            {/* Logo & Branding */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring' as const, stiffness: 200, damping: 15, delay: 0.2 }}
                className="relative"
              >
                <div className="size-20 rounded-full overflow-hidden ring-4 ring-nabdh-primary/15 shadow-xl shadow-nabdh-primary/20 bg-white p-1.5">
                  <img
                    src="/logo-transparent.png"
                    alt="نبض المدينة"
                    className="size-full object-contain"
                  />
                </div>
                <div className="absolute -bottom-1 -end-1 size-6 rounded-full bg-nabdh-accent flex items-center justify-center ring-2 ring-white">
                  <ShieldCheck className="size-3 text-white" />
                </div>
              </motion.div>
              <h2 className="gradient-text text-2xl font-bold mt-3">نبض المدينة</h2>
              <p className="text-muted-foreground/60 text-[11px] mt-0.5 tracking-wider">NABDH AL-MADINA</p>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                {showForgotPassword
                  ? (isAr ? 'استعادة كلمة المرور' : 'Reset Password')
                  : t('auth.signIn')
                }
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                {showForgotPassword
                  ? (isAr ? 'أدخل رقم هاتفك لإعادة تعيين كلمة المرور' : 'Enter your phone to reset your password')
                  : t('auth.enterCredentials')
                }
              </p>
            </div>

            {/* ─── Forgot Password Flow ─── */}
            {showForgotPassword ? (
              <div className="space-y-4">
                {forgotStep === 'done' ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
                    <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="size-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {isAr ? 'تم تغيير كلمة المرور بنجاح!' : 'Password Changed Successfully!'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isAr ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة' : 'You can now sign in with your new password'}
                    </p>
                    <Button
                      onClick={() => { setShowForgotPassword(false); setForgotStep('phone'); }}
                      className="w-full nabdh-gradient text-white h-11"
                    >
                      {isAr ? 'تسجيل الدخول' : 'Sign In'}
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    {/* Step: Phone */}
                    {forgotStep === 'phone' && (
                      <div className="space-y-4">
                        <div className="size-14 rounded-full bg-nabdh-primary/10 flex items-center justify-center mx-auto">
                          <KeyRound className="size-6 text-nabdh-primary" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{isAr ? 'رقم الهاتف' : 'Phone Number'}</Label>
                          <div className="relative">
                            <Phone className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              value={forgotPhone}
                              onChange={(e) => { setForgotPhone(e.target.value); setForgotError(''); }}
                              placeholder="09XX XXX XXX"
                              dir="ltr"
                              className="ps-9 h-11"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step: OTP */}
                    {forgotStep === 'otp' && (
                      <div className="space-y-4">
                        <div className="size-14 rounded-full bg-nabdh-primary/10 flex items-center justify-center mx-auto">
                          <ShieldCheck className="size-6 text-nabdh-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground text-center">
                          {isAr ? `أدخل كود التحقق المرسل إلى ${forgotPhone}` : `Enter the verification code sent to ${forgotPhone}`}
                        </p>
                        {demoCode && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                            <p className="text-xs text-amber-600 font-medium">
                              {isAr ? `كود التجربة: ${demoCode}` : `Demo code: ${demoCode}`}
                            </p>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{isAr ? 'كود التحقق' : 'Verification Code'}</Label>
                          <Input
                            value={forgotOtp}
                            onChange={(e) => { setForgotOtp(e.target.value); setForgotError(''); }}
                            placeholder="000000"
                            dir="ltr"
                            className="h-11 text-center text-lg tracking-[0.3em] font-bold"
                            maxLength={6}
                          />
                        </div>
                      </div>
                    )}

                    {/* Step: Reset Password */}
                    {forgotStep === 'reset' && (
                      <div className="space-y-4">
                        <div className="size-14 rounded-full bg-nabdh-primary/10 flex items-center justify-center mx-auto">
                          <Lock className="size-6 text-nabdh-primary" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                          <div className="relative">
                            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={forgotNewPassword}
                              onChange={(e) => { setForgotNewPassword(e.target.value); setForgotError(''); }}
                              placeholder={isAr ? '6 أحرف على الأقل' : 'At least 6 characters'}
                              dir="ltr"
                              className="ps-9 h-11"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">{isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                          <div className="relative">
                            <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={forgotConfirmPassword}
                              onChange={(e) => { setForgotConfirmPassword(e.target.value); setForgotError(''); }}
                              placeholder={isAr ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                              dir="ltr"
                              className="ps-9 h-11"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {forgotError && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                        {forgotError}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => {
                        if (forgotStep === 'phone') handleSendOtp();
                        else if (forgotStep === 'otp') handleVerifyOtp();
                        else if (forgotStep === 'reset') handleResetPassword();
                      }}
                      disabled={forgotLoading}
                      className="w-full nabdh-gradient text-white h-11 text-base font-semibold rounded-lg shadow-lg shadow-nabdh-primary/20"
                    >
                      {forgotLoading ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : forgotStep === 'phone' ? (
                        isAr ? 'إرسال كود التحقق' : 'Send Verification Code'
                      ) : forgotStep === 'otp' ? (
                        isAr ? 'تحقق من الكود' : 'Verify Code'
                      ) : (
                        isAr ? 'تغيير كلمة المرور' : 'Reset Password'
                      )}
                    </Button>

                    {/* Back to login */}
                    <button
                      onClick={() => { setShowForgotPassword(false); setForgotError(''); setForgotStep('phone'); }}
                      className="w-full text-sm text-muted-foreground hover:text-nabdh-primary transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                      {isAr ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                    </button>
                  </>
                )}
              </div>
            ) : (
            <><form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="login-phone" className="text-sm font-medium">
                  {t('auth.phone')}
                </Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    placeholder="09XX XXX XXX"
                    dir="ltr"
                    className={cn('ps-9 h-11', errors.phone && 'border-destructive')}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-sm font-medium">
                    {t('auth.password')}
                  </Label>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(true); setForgotPhone(form.phone); setForgotError(''); setForgotStep('phone'); setForgotOtp(''); setForgotNewPassword(''); setForgotConfirmPassword(''); setDemoCode(''); }}
                    className="text-xs text-nabdh-primary hover:underline font-medium"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    placeholder={t('auth.enterPassword')}
                    dir="ltr"
                    className={cn('ps-9 pe-9 h-11', errors.password && 'border-destructive')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="border-nabdh-primary/30 data-[state=checked]:bg-nabdh-primary data-[state=checked]:border-nabdh-primary"
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  {t('auth.rememberMe')}
                </Label>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                  {errors.general}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full nabdh-gradient text-white h-11 text-base font-semibold rounded-lg shadow-lg shadow-nabdh-primary/20 hover:shadow-nabdh-primary/30 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    {t('auth.signingIn')}
                  </>
                ) : (
                  <>
                    {t('auth.signIn')}
                    {isRTL ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                  </>
                )}
              </Button>

            {/* Divider */}
            <div className="relative my-5">
              <Separator />
              <span className="absolute top-1/2 -translate-y-1/2 start-1/2 -translate-x-1/2 bg-card px-3 text-xs text-muted-foreground">
                {t('auth.orContinueWith')}
              </span>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {/* Google Login - Coming Soon */}
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  disabled
                  className="h-11 text-sm font-medium border-border/40 bg-muted/30 text-muted-foreground gap-2 cursor-not-allowed opacity-70 w-full"
                >
                  <svg className="size-5 opacity-50" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </Button>
                <Badge
                  className="absolute -top-2.5 -end-2 bg-amber-500/90 dark:bg-amber-500/80 text-white border-0 text-[10px] px-1.5 py-0 leading-4 font-semibold shadow-sm"
                >
                  {t('checkout.comingSoon')}
                </Badge>
              </div>

              {/* Demo Login */}
              <Button
                type="button"
                variant="outline"
                className="h-11 text-sm font-medium border-nabdh-primary/20 hover:bg-nabdh-primary/5 hover:border-nabdh-primary/40 transition-all gap-2"
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const response = await fetch('/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phone: '+218911234567', password: '123456', platform: 'web' }),
                    });
                    const data = await response.json();
                    if (response.ok && data.user) {
                      login({
                        id: data.user.id,
                        name: data.user.name || '',
                        phone: data.user.phone,
                        email: data.user.email || undefined,
                        avatar: data.user.avatar || undefined,
                        role: data.user.role || 'customer',
                      }, data.isReturningUser || false);
                    } else {
                      setErrors({ general: data.error || t('error.demoLoginFailed') });
                    }
                  } catch {
                    setErrors({ general: t('error.serverConnection') });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <User className="size-4 text-nabdh-primary" />
                {t('auth.demo')}
              </Button>
            </div>

            {/* Switch to Register */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {t('auth.noAccount')}{' '}
              <button
                onClick={() => setAuthView('register')}
                className="text-nabdh-primary font-semibold hover:underline"
              >
                {t('auth.createAccount')}
              </button>
            </p>
            </form>
            </>
            )}
          </motion.div>

          {/* Branding Panel - Second in DOM = Left side in RTL */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col justify-between relative overflow-hidden nabdh-gradient p-8 xl:p-10"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -top-20 -start-20 w-72 h-72 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 -end-16 w-56 h-56 rounded-full bg-white/5" />
              <div className="absolute top-1/3 end-10 w-32 h-32 rounded-full bg-nabdh-accent/20" />
              <div className="absolute bottom-1/4 start-1/4 w-20 h-20 rounded-full bg-nabdh-secondary/15" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-14 rounded-full overflow-hidden ring-2 ring-white/25 bg-white/10 p-1">
                  <img
                    src="/logo-transparent.png"
                    alt="نبض المدينة"
                    className="size-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">نبض المدينة</h2>
                  <p className="text-white/60 text-xs">Nabd Al-Madina</p>
                </div>
              </div>
              <p className="text-white/80 text-lg leading-relaxed max-w-sm">
                {t('auth.welcomeBackDesc')}
              </p>
            </div>

            <div className="relative z-10 space-y-5 mt-8">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                    className="flex items-start gap-3"
                  >
                    <div className="size-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="size-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                      <p className="text-white/60 text-xs mt-0.5">{feature.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/15">
              <p className="text-white/40 text-xs">
                © {new Date().getFullYear()} {t('common.allRightsReserved')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
