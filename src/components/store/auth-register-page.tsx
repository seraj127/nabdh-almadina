'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  RotateCcw,
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

interface RegisterForm {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

export function AuthRegisterPage() {
  const { language, direction } = useLanguageStore(useShallow((s) => ({ language: s.language, direction: s.direction })));
  const { login, setAuthView } = useUIStore(useShallow((s) => ({ login: s.login, setAuthView: s.setAuthView })));
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';

  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = isAr ? 'مطلوب' : 'Required';
    } else if (form.fullName.trim().length < 3) {
      newErrors.fullName = isAr ? 'الاسم قصير جداً' : 'Name too short';
    }

    if (!form.phone.trim()) {
      newErrors.phone = isAr ? 'مطلوب' : 'Required';
    } else if (!/^[\d\s+()-]{8,15}$/.test(form.phone.trim())) {
      newErrors.phone = isAr ? 'رقم الهاتف غير صحيح' : 'Invalid phone number';
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = isAr ? 'البريد الإلكتروني غير صحيح' : 'Invalid email';
    }

    if (!form.password) {
      newErrors.password = isAr ? 'مطلوب' : 'Required';
    } else if (form.password.length < 6) {
      newErrors.password = isAr ? 'يجب أن تكون 6 أحرف على الأقل' : 'Must be at least 6 characters';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.terms = isAr ? 'يجب الموافقة على الشروط والأحكام' : 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || (isAr ? 'فشل إنشاء الحساب' : 'Registration failed') });
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);

      // Auto-login after short delay — must call /api/auth/login to create server session
      setTimeout(async () => {
        try {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: form.phone.trim(), password: form.password, platform: 'web' }),
          });
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.user) {
            login({
              id: loginData.user.id,
              name: loginData.user.name || form.fullName.trim(),
              phone: loginData.user.phone || form.phone.trim(),
              email: loginData.user.email || form.email.trim() || undefined,
              avatar: loginData.user.avatar || undefined,
              role: loginData.user.role || 'customer',
            }, loginData.isReturningUser || false);
          } else {
            // Fallback: redirect to login page so user can sign in manually
            setAuthView('login');
          }
        } catch {
          // Fallback: redirect to login page so user can sign in manually
          setAuthView('login');
        }
      }, 2000);
    } catch {
      setErrors({ general: isAr ? 'خطأ في الاتصال بالخادم' : 'Server connection error' });
      setIsSubmitting(false);
      return;
    }
  };

  const benefits = [
    {
      icon: ShieldCheck,
      title: isAr ? 'حساب آمن' : 'Secure Account',
      desc: isAr ? 'حماية كاملة لبياناتك الشخصية' : 'Full protection for your personal data',
    },
    {
      icon: CreditCard,
      title: isAr ? 'عروض حصرية' : 'Exclusive Offers',
      desc: isAr ? 'خصومات وعروض متاحة فقط للأعضاء' : 'Discounts available only for members',
    },
    {
      icon: RotateCcw,
      title: isAr ? 'إرجاع سهل' : 'Easy Returns',
      desc: isAr ? 'سياسة إرجاع مرنة وسهلة للأعضاء' : 'Flexible and easy return policy for members',
    },
  ];

  const passwordStrength = () => {
    if (!form.password) return 0;
    let score = 0;
    if (form.password.length >= 6) score++;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    return Math.min(score, 4);
  };

  const strengthLevel = passwordStrength();
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const strengthLabels = isAr
    ? ['ضعيفة', 'متوسطة', 'جيدة', 'قوية']
    : ['Weak', 'Fair', 'Good', 'Strong'];

  // Success View
  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="size-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="size-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {isAr ? 'تم إنشاء الحساب بنجاح!' : 'Account Created Successfully!'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isAr
              ? 'مرحباً بك في نبض المدينة، يتم تسجيل دخولك الآن...'
              : 'Welcome to Nabd Al-Madina, signing you in now...'}
          </p>
          <Loader2 className="size-8 animate-spin text-nabdh-primary mx-auto" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-12 px-4">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-nabdh-primary/10 border border-nabdh-primary/10">
          {/* Left Side - Registration Form */}
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
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text flex items-center gap-2">
                <UserPlus className="size-7" />
                {isAr ? 'إنشاء حساب جديد' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                {isAr
                  ? 'أنشئ حسابك للتمتع بتجربة تسوق مميزة'
                  : 'Create your account for a premium shopping experience'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-sm font-medium">
                  {isAr ? 'الاسم الكامل' : 'Full Name'} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    value={form.fullName}
                    onChange={(e) => {
                      setForm({ ...form, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                    }}
                    placeholder={isAr ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    className={cn('ps-9 h-11', errors.fullName && 'border-destructive')}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-phone" className="text-sm font-medium">
                  {isAr ? 'رقم الهاتف' : 'Phone Number'} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-phone"
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

              {/* Email (Optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-sm font-medium">
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                  <span className="text-muted-foreground text-xs ms-1">
                    ({isAr ? 'اختياري' : 'optional'})
                  </span>
                </Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    placeholder="example@email.com"
                    dir="ltr"
                    className={cn('ps-9 h-11', errors.email && 'border-destructive')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-sm font-medium">
                  {isAr ? 'كلمة المرور' : 'Password'} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    placeholder={isAr ? '6 أحرف على الأقل' : 'At least 6 characters'}
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
                {/* Password Strength Bar */}
                {form.password && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1.5 flex-1 rounded-full transition-all duration-300',
                            i < strengthLevel ? strengthColors[strengthLevel - 1] : 'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                    {strengthLevel > 0 && (
                      <p className={cn(
                        'text-[11px] font-medium',
                        strengthLevel <= 1 && 'text-red-500',
                        strengthLevel === 2 && 'text-orange-500',
                        strengthLevel === 3 && 'text-yellow-600',
                        strengthLevel >= 4 && 'text-emerald-500',
                      )}>
                        {strengthLabels[strengthLevel - 1]}
                      </p>
                    )}
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm-password" className="text-sm font-medium">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm({ ...form, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    placeholder={isAr ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                    dir="ltr"
                    className={cn('ps-9 pe-9 h-11', errors.confirmPassword && 'border-destructive')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-1">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => {
                      setAgreeTerms(checked === true);
                      if (errors.terms) setErrors({ ...errors, terms: undefined });
                    }}
                    className="border-nabdh-primary/30 data-[state=checked]:bg-nabdh-primary data-[state=checked]:border-nabdh-primary mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                    {isAr
                      ? 'أوافق على شروط الاستخدام وسياسة الخصوصية'
                      : 'I agree to the Terms of Use and Privacy Policy'}
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-xs text-destructive">{errors.terms}</p>
                )}
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
                    {isAr ? 'جارٍ إنشاء الحساب...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    <UserPlus className="size-5" />
                    {isAr ? 'إنشاء حساب' : 'Create Account'}
                    {isRTL ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <Separator />
              <span className="absolute top-1/2 -translate-y-1/2 start-1/2 -translate-x-1/2 bg-card px-3 text-xs text-muted-foreground">
                {isAr ? 'أو سجّل عبر' : 'Or sign up with'}
              </span>
            </div>

            {/* Social Register Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-sm font-medium border-border/60 hover:bg-muted/50 hover:border-border transition-all gap-2"
              onClick={() => {
                setErrors({ terms: isAr ? 'التسجيل بحساب Google غير متاح حالياً' : 'Google sign-up is not available yet' });
              }}
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isAr ? 'التسجيل بحساب Google' : 'Sign up with Google'}
            </Button>

            {/* Switch to Login */}
            <p className="text-center text-sm text-muted-foreground mt-5">
              {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <button
                onClick={() => setAuthView('login')}
                className="text-nabdh-primary font-semibold hover:underline"
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            </p>
          </motion.div>

          {/* Right Side - Branding Panel */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col justify-between relative overflow-hidden nabdh-gradient p-8 xl:p-10"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -top-20 -end-20 w-72 h-72 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 -start-16 w-56 h-56 rounded-full bg-white/5" />
              <div className="absolute top-1/3 start-10 w-32 h-32 rounded-full bg-nabdh-accent/20" />
              <div className="absolute bottom-1/4 end-1/4 w-20 h-20 rounded-full bg-nabdh-secondary/15" />
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
              <h3 className="text-white text-xl font-bold mb-2">
                {isAr ? 'انضم إلينا اليوم!' : 'Join Us Today!'}
              </h3>
              <p className="text-white/80 leading-relaxed max-w-sm">
                {isAr
                  ? 'أنشئ حسابك المجاني واستمتع بمزايا حصرية وتجربة تسوق فريدة مع نبض المدينة.'
                  : 'Create your free account and enjoy exclusive benefits and a unique shopping experience with Nabd Al-Madina.'}
              </p>
            </div>

            <div className="relative z-10 space-y-5 mt-8">
              {benefits.map((benefit, i) => {
                const Icon = benefit.icon;
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
                      <h4 className="text-white font-semibold text-sm">{benefit.title}</h4>
                      <p className="text-white/60 text-xs mt-0.5">{benefit.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="relative z-10 mt-8 pt-6 border-t border-white/15">
              <div className="flex items-center gap-3">
                <div className="flex -space-s-2 space-s-reverse">
                  {['م', 'ع', 'خ'].map((letter, i) => (
                    <div
                      key={i}
                      className="size-8 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">
                    {isAr ? '+2,500 عميل' : '+2,500 Customers'}
                  </p>
                  <p className="text-white/50 text-xs">
                    {isAr ? 'يثقون بنا يومياً' : 'Trust us daily'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
