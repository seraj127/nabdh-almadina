'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Palette,
  Shield,
  Bell,
  MapPin,
  Info,
  LogOut,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Globe,
  Check,
  Loader2,
  AlertCircle,
  Plus,
  Home,
  Building2,
  MapPinned,
  ChevronLeft,
  Eye,
  EyeOff,
  Camera,
  X,
  ShieldCheck,
  FileText,
  Lock,
  Smartphone,
  Sparkles,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { compressImageToBase64 } from '@/lib/image-compress';

// ─── Types ─────────────────────────────────────────────────────────
type SectionId = 'profile' | 'appearance' | 'security' | 'notifications' | 'addresses' | 'about';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  role: string;
  loyaltyTier: string;
  createdAt: string;
}

interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  area: string;
  notes: string;
  isDefault: boolean;
}

// ─── Section Config ─────────────────────────────────────────────────
const sections: {
  id: SectionId;
  icon: typeof User;
  color: string;
  bg: string;
}[] = [
  { id: 'profile', icon: User, color: 'text-nabdh-primary', bg: 'bg-nabdh-primary/10' },
  { id: 'appearance', icon: Palette, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'security', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'notifications', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { id: 'addresses', icon: MapPin, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  { id: 'about', icon: Info, color: 'text-rose-500', bg: 'bg-rose-500/10' },
];

// ─── Address Form Dialog ────────────────────────────────────────────
function AddressFormDialog({
  isOpen,
  onClose,
  onSave,
  editingAddress,
  isAr,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { label: string; address: string; city: string; area: string; notes: string; isDefault: boolean }) => void;
  editingAddress: Address | null;
  isAr: boolean;
  t: (key: string) => string;
}) {
  // Use initial values derived from props (no useEffect needed)
  const initialLabel = editingAddress?.label || 'home';
  const initialAddress = editingAddress?.address || '';
  const initialCity = editingAddress?.city || '';
  const initialArea = editingAddress?.area || '';
  const initialNotes = editingAddress?.notes || '';
  const initialDefault = editingAddress?.isDefault || false;

  const [label, setLabel] = useState(initialLabel);
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState(initialCity);
  const [area, setArea] = useState(initialArea);
  const [notes, setNotes] = useState(initialNotes);
  const [isDefault, setIsDefault] = useState(initialDefault);

  if (!isOpen) return null;

  const labelOptions = [
    { value: 'home', icon: Home, label: t('settings.addressHome') },
    { value: 'work', icon: Building2, label: t('settings.addressWork') },
    { value: 'other', icon: MapPinned, label: t('settings.addressOther') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border/50 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #004B63 0%, #006B8A 50%, #00897B 100%)' }}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="size-5" />
            {editingAddress ? t('settings.editAddress') : t('settings.addAddress')}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
            <X className="size-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Label Selection */}
          <div>
            <label className="text-sm font-medium">{t('settings.addressLabel')}</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {labelOptions.map((opt) => {
                const OptIcon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setLabel(opt.value)}
                    className={cn(
                      'p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1',
                      label === opt.value
                        ? 'border-nabdh-primary bg-nabdh-primary/5'
                        : 'border-border hover:border-nabdh-primary/30'
                    )}
                  >
                    <OptIcon className={cn('size-5', label === opt.value ? 'text-nabdh-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-xs font-medium', label === opt.value ? 'text-nabdh-primary' : 'text-muted-foreground')}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address Fields */}
          <div>
            <label className="text-sm font-medium">{t('settings.addressStreet')}</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isAr ? 'شارع، منطقة، رقم المنزل' : 'Street, area, house number'}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t('settings.addressCity')}</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={isAr ? 'طرابلس' : 'Tripoli'}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t('settings.addressArea')}</label>
              <Input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={isAr ? 'المنطقة' : 'Area'}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t('settings.addressNotes')}</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? 'ملاحظات إضافية' : 'Additional notes'}
              className="mt-1.5"
            />
          </div>

          {/* Default Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-amber-500" />
              <span className="text-sm font-medium">{t('settings.addressDefault')}</span>
            </div>
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          </div>

          {/* Save */}
          <Button
            onClick={() => onSave({ label, address, city, area, notes, isDefault })}
            disabled={!address.trim() || !city.trim()}
            className="w-full nabdh-gradient text-white hover:opacity-90 h-11 font-bold rounded-xl"
          >
            <Check className="size-4 me-2" />
            {t('settings.save')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Star icon for default address indicator
function Star(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

// ─── Settings Page ──────────────────────────────────────────────────
export function SettingsPage() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({
    t: s.t, language: s.language, direction: s.direction,
  })));
  const { setLanguage } = useLanguageStore();
  const { theme, setTheme } = useTheme();
  const clearAuthView = useUIStore((s) => s.clearAuthView);
  const navigateTo = useUIStore((s) => s.navigateTo);
  const logout = useUIStore((s) => s.logout);
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;

  // ─── State ────────────────────────────
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Notifications (client-side)
  const [notifOrders, setNotifOrders] = useState(true);
  const [notifOffers, setNotifOffers] = useState(true);
  const [notifPoints, setNotifPoints] = useState(true);
  const [notifNews, setNotifNews] = useState(false);

  // Addresses
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // ─── Load data ────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/profile');
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setUser({
          id: u.id,
          name: u.name || '',
          phone: u.phone || '',
          email: u.email || '',
          avatar: u.avatar || '',
          role: u.role || 'customer',
          loyaltyTier: u.loyaltyTier || 'bronze',
          createdAt: u.createdAt || new Date().toISOString(),
        });
        setName(u.name || '');
        setEmail(u.email || '');
      }
    } catch { /* ignore */ }
  }, []);

  const loadAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch { /* ignore */ }
  }, []);

  // Load notification preferences from localStorage
  const loadNotifPrefs = useCallback(() => {
    try {
      const raw = localStorage.getItem('nabdh-notif-prefs');
      if (raw) {
        const prefs = JSON.parse(raw);
        if (prefs.orders !== undefined) setNotifOrders(prefs.orders);
        if (prefs.offers !== undefined) setNotifOffers(prefs.offers);
        if (prefs.points !== undefined) setNotifPoints(prefs.points);
        if (prefs.news !== undefined) setNotifNews(prefs.news);
      }
    } catch { /* ignore */ }
  }, []);

  // Save notification preferences to localStorage
  const saveNotifPrefs = useCallback((prefs: Record<string, boolean>) => {
    try {
      localStorage.setItem('nabdh-notif-prefs', JSON.stringify(prefs));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadAddresses()]);
      loadNotifPrefs();
      setLoading(false);
    };
    init();
  }, [loadProfile, loadAddresses, loadNotifPrefs]);

  // ─── Handlers ─────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || undefined, email: email.trim() || null }),
      });
      if (res.ok) {
        setProfileSaved(true);
        loadProfile();
        // Sync name/email changes to global UI store so header reflects the change immediately
        const update: Record<string, string | undefined> = {};
        if (name.trim()) update.name = name.trim();
        if (email.trim()) update.email = email.trim();
        if (Object.keys(update).length > 0) useUIStore.getState().updateCurrentUser(update);
        setTimeout(() => setProfileSaved(false), 2000);
        showToast(t('settings.saved'));
      }
    } catch { /* ignore */ }
    setSavingProfile(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToBase64(file);
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: dataUrl }),
      });
      loadProfile();
      // Sync avatar to global UI store so header reflects the change immediately
      useUIStore.getState().updateCurrentUser({ avatar: dataUrl });
      showToast(t('settings.saved'));
    } catch { /* ignore */ }
  };

  const handleRemoveAvatar = async () => {
    try {
      await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: '' }),
      });
      loadProfile();
      // Sync avatar removal to global UI store so header reflects the change immediately
      useUIStore.getState().updateCurrentUser({ avatar: undefined });
      showToast(t('settings.saved'));
    } catch { /* ignore */ }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError(t('settings.passwordMin'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('settings.passwordMismatch'));
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast(t('settings.passwordChanged'));
      } else {
        setPasswordError(data.error === 'Current password is incorrect'
          ? t('settings.passwordWrong')
          : (isAr ? 'حدث خطأ' : 'An error occurred'));
      }
    } catch {
      setPasswordError(isAr ? 'فشل الاتصال' : 'Connection failed');
    }
    setChangingPassword(false);
  };

  const handleNotifToggle = (key: string, value: boolean) => {
    const prefs = { orders: notifOrders, offers: notifOffers, points: notifPoints, news: notifNews, [key]: value };
    saveNotifPrefs(prefs);
    switch (key) {
      case 'orders': setNotifOrders(value); break;
      case 'offers': setNotifOffers(value); break;
      case 'points': setNotifPoints(value); break;
      case 'news': setNotifNews(value); break;
    }
  };

  const handleSaveAddress = async (data: { label: string; address: string; city: string; area: string; notes: string; isDefault: boolean }) => {
    setSavingAddress(true);
    try {
      if (editingAddress) {
        const res = await fetch('/api/addresses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAddress.id, ...data }),
        });
        if (res.ok) showToast(t('settings.saved'));
      } else {
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) showToast(t('settings.saved'));
      }
      loadAddresses();
    } catch { /* ignore */ }
    setShowAddressForm(false);
    setEditingAddress(null);
    setSavingAddress(false);
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        showToast(t('settings.saved'));
      }
    } catch { /* ignore */ }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      await fetch('/api/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: addr.id, isDefault: true }),
      });
      loadAddresses();
    } catch { /* ignore */ }
  };

  // ─── Loading ──────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center" dir={direction}>
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-3 border-nabdh-primary/30 border-t-nabdh-primary animate-spin" />
          <p className="text-sm text-muted-foreground">{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(isAr ? 'ar-LY' : 'en-US', { year: 'numeric', month: 'long' })
    : '';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20" dir={direction}>
      {/* ═══ Gradient Header ═══ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -start-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -end-12 w-36 h-36 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={clearAuthView}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <BackArrow className="size-5 text-white" />
              </motion.button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Shield className="size-6 text-nabdh-secondary" />
                  {t('settings.title')}
                </h1>
                <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                  {t('settings.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ─══ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* ─── Sidebar Navigation (desktop) ─── */}
          <div className="hidden md:block w-56 shrink-0">
            <div className="sticky top-24 space-y-1">
              {sections.map((sec) => {
                const SecIcon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <motion.button
                    key={sec.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-nabdh-primary/10 text-nabdh-primary border border-nabdh-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', isActive ? sec.bg : 'bg-muted/50')}>
                      <SecIcon className={cn('size-4', isActive ? sec.color : 'text-muted-foreground')} />
                    </div>
                    {t(`settings.${sec.id}`)}
                  </motion.button>
                );
              })}

              {/* Logout Button */}
              <div className="pt-4 mt-4 border-t border-border/50">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <LogOut className="size-4" />
                  </div>
                  {t('settings.logout')}
                </motion.button>
              </div>
            </div>
          </div>

          {/* ─── Mobile Section Tabs ─── */}
          <div className="md:hidden w-full">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-4 border-b border-border/50">
              {sections.map((sec) => {
                const SecIcon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <motion.button
                    key={sec.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveSection(sec.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border',
                      isActive
                        ? 'bg-nabdh-primary text-white border-nabdh-primary shadow-sm'
                        : 'text-muted-foreground border-transparent hover:bg-muted/50'
                    )}
                  >
                    <SecIcon className="size-3.5" />
                    {t(`settings.${sec.id}`)}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ─── Content Area ─── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* ═══ Profile Section ═══ */}
              {activeSection === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Avatar */}
                  <div className="glass-card-enhanced rounded-2xl p-5 border border-border/50">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{t('settings.avatar')}</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border/50 bg-gradient-to-br from-nabdh-primary/20 to-nabdh-accent/20 flex items-center justify-center">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="size-8 text-nabdh-primary/50" />
                          )}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center"
                        >
                          <Camera className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base">{user?.name || (isAr ? 'بدون اسم' : 'No name')}</p>
                        <p className="text-sm text-muted-foreground">{user?.phone}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-8 text-xs"
                          >
                            <Camera className="size-3 me-1" />
                            {t('settings.avatarChange')}
                          </Button>
                          {user?.avatar && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleRemoveAvatar}
                              className="h-8 text-xs text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="size-3 me-1" />
                              {t('settings.avatarRemove')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="glass-card-enhanced rounded-2xl p-5 border border-border/50">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                      {t('settings.profile')}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">{t('settings.name')}</label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('settings.namePlaceholder')}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t('settings.phone')}</label>
                        <Input
                          value={user?.phone || ''}
                          disabled
                          className="mt-1.5 bg-muted/50"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {isAr ? 'لا يمكن تغيير رقم الهاتف' : 'Phone number cannot be changed'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t('settings.email')}</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('settings.emailPlaceholder')}
                          className="mt-1.5"
                        />
                      </div>

                      {/* Account Info */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                        <div className="bg-muted/30 rounded-xl p-3">
                          <p className="text-[10px] text-muted-foreground">{t('settings.memberSince')}</p>
                          <p className="text-sm font-bold mt-0.5">{memberSince}</p>
                        </div>
                        <div className="bg-muted/30 rounded-xl p-3">
                          <p className="text-[10px] text-muted-foreground">{t('settings.role')}</p>
                          <p className="text-sm font-bold mt-0.5 capitalize">{user?.role === 'customer' ? (isAr ? 'عميل' : 'Customer') : user?.role}</p>
                        </div>
                      </div>

                      <Button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="w-full nabdh-gradient text-white hover:opacity-90 h-11 font-bold rounded-xl"
                      >
                        {savingProfile ? (
                          <Loader2 className="size-4 animate-spin me-2" />
                        ) : profileSaved ? (
                          <Check className="size-4 me-2" />
                        ) : null}
                        {profileSaved ? t('settings.saved') : t('settings.save')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ Appearance Section ═══ */}
              {activeSection === 'appearance' && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Theme */}
                  <div className="glass-card-enhanced rounded-2xl p-5 border border-border/50">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{t('settings.theme')}</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', icon: Sun, label: t('settings.themeLight'), color: 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30' },
                        { value: 'dark', icon: Moon, label: t('settings.themeDark'), color: 'from-gray-700 to-gray-900' },
                        { value: 'system', icon: Monitor, label: t('settings.themeSystem'), color: 'from-gray-200 to-gray-700 dark:from-gray-600 dark:to-gray-900' },
                      ].map((opt) => {
                        const OptIcon = opt.icon;
                        const isActive = theme === opt.value;
                        return (
                          <motion.button
                            key={opt.value}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTheme(opt.value)}
                            className={cn(
                              'relative rounded-xl p-4 border-2 transition-all flex flex-col items-center gap-2',
                              isActive
                                ? 'border-nabdh-primary bg-nabdh-primary/5 shadow-md'
                                : 'border-border hover:border-nabdh-primary/30'
                            )}
                          >
                            <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center', opt.color)}>
                              <OptIcon className={cn('size-6', opt.value === 'dark' ? 'text-white' : 'text-foreground')} />
                            </div>
                            <span className={cn('text-xs font-bold', isActive ? 'text-nabdh-primary' : 'text-muted-foreground')}>
                              {opt.label}
                            </span>
                            {isActive && (
                              <motion.div
                                layoutId="theme-check"
                                className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-nabdh-primary flex items-center justify-center"
                              >
                                <Check className="size-3 text-white" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="glass-card-enhanced rounded-2xl p-5 border border-border/50">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{t('settings.language')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'ar' as const, label: t('settings.languageAr'), sublabel: 'العربية', flag: '🇱🇾' },
                        { value: 'en' as const, label: t('settings.languageEn'), sublabel: 'English', flag: '🌐' },
                      ].map((opt) => {
                        const isActive = language === opt.value;
                        return (
                          <motion.button
                            key={opt.value}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setLanguage(opt.value)}
                            className={cn(
                              'relative rounded-xl p-4 border-2 transition-all flex items-center gap-3',
                              isActive
                                ? 'border-nabdh-primary bg-nabdh-primary/5 shadow-md'
                                : 'border-border hover:border-nabdh-primary/30'
                            )}
                          >
                            <span className="text-2xl">{opt.flag}</span>
                            <div className="text-start">
                              <p className={cn('text-sm font-bold', isActive ? 'text-nabdh-primary' : 'text-foreground')}>
                                {opt.sublabel}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{opt.label}</p>
                            </div>
                            {isActive && (
                              <motion.div
                                layoutId="lang-check"
                                className="absolute top-2 end-2 w-5 h-5 rounded-full bg-nabdh-primary flex items-center justify-center"
                              >
                                <Check className="size-3 text-white" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ Security Section ═══ */}
              {activeSection === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Change Password */}
                  <div className="glass-card-enhanced rounded-2xl p-5 border border-border/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Lock className="size-5 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">{t('settings.changePassword')}</h3>
                        <p className="text-xs text-muted-foreground">
                          {t('settings.passwordMin')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Current Password */}
                      <div>
                        <label className="text-sm font-medium">{t('settings.currentPassword')}</label>
                        <div className="mt-1.5 relative">
                          <Input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(null); }}
                            placeholder="••••••"
                            className="pe-10"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
                          >
                            {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="text-sm font-medium">{t('settings.newPassword')}</label>
                        <div className="mt-1.5 relative">
                          <Input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                            placeholder="••••••"
                            className="pe-10"
                            dir="ltr"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
                          >
                            {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </div>
                        {newPassword && newPassword.length < 6 && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {t('settings.passwordMin')}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="text-sm font-medium">{t('settings.confirmPassword')}</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); }}
                          placeholder="••••••"
                          dir="ltr"
                          className="mt-1.5"
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            {t('settings.passwordMismatch')}
                          </p>
                        )}
                      </div>

                      {/* Error */}
                      {passwordError && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 text-sm">
                          <AlertCircle className="size-4 shrink-0" />
                          {passwordError}
                        </motion.div>
                      )}

                      {/* Success */}
                      {passwordSuccess && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-500 text-sm">
                          <Check className="size-4 shrink-0" />
                          {t('settings.passwordChanged')}
                        </motion.div>
                      )}

                      <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className="w-full nabdh-gradient text-white hover:opacity-90 h-11 font-bold rounded-xl"
                      >
                        {changingPassword ? (
                          <Loader2 className="size-4 animate-spin me-2" />
                        ) : (
                          <ShieldCheck className="size-4 me-2" />
                        )}
                        {t('settings.changePassword')}
                      </Button>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="glass-card-enhanced rounded-2xl p-5 border border-border/50">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      {isAr ? 'معلومات الحساب' : 'Account Info'}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Smartphone className="size-4" />
                          {t('settings.phone')}
                        </span>
                        <span className="text-sm font-medium">{user?.phone}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-border/30">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Shield className="size-4" />
                          {isAr ? 'مزود الدخول' : 'Login Provider'}
                        </span>
                        <Badge variant="outline" className="text-xs">Local</Badge>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Sparkles className="size-4" />
                          {isAr ? 'المستوى' : 'Tier'}
                        </span>
                        <Badge className="bg-nabdh-primary/10 text-nabdh-primary border-nabdh-primary/20 text-xs">
                          {t(`rewards.tier.${user?.loyaltyTier || 'bronze'}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="glass-card-enhanced rounded-2xl p-5 border border-red-500/20">
                    <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3">
                      {isAr ? 'منطقة الخطر' : 'Danger Zone'}
                    </h3>
                    {!showDeleteConfirm ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{t('settings.deleteAccount')}</p>
                          <p className="text-xs text-muted-foreground">{t('settings.deleteAccountDesc')}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                        >
                          <Trash2 className="size-4 me-1" />
                          {t('settings.deleteAccount')}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-500">
                          <AlertCircle className="size-5 shrink-0" />
                          <p className="text-sm font-medium">{t('settings.deleteAccountConfirm')}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{t('settings.deleteAccountWarning')}</p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => { logout(); setShowDeleteConfirm(false); }}
                            className="flex-1"
                          >
                            <Trash2 className="size-4 me-1" />
                            {t('settings.deleteAccount')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ═══ Notifications Section ═══ */}
              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {[
                    { key: 'orders', icon: Heart, state: notifOrders, label: t('settings.notificationOrders'), desc: t('settings.notificationOrdersDesc'), color: 'text-emerald-500' },
                    { key: 'offers', icon: Sparkles, state: notifOffers, label: t('settings.notificationOffers'), desc: t('settings.notificationOffersDesc'), color: 'text-amber-500' },
                    { key: 'points', icon: Shield, state: notifPoints, label: t('settings.notificationPoints'), desc: t('settings.notificationPointsDesc'), color: 'text-purple-500' },
                    { key: 'news', icon: Info, state: notifNews, label: t('settings.notificationNews'), desc: t('settings.notificationNewsDesc'), color: 'text-sky-500' },
                  ].map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card-enhanced rounded-xl p-4 border border-border/40 flex items-center gap-3"
                      >
                        <div className={cn('w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0', item.color)}>
                          <ItemIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={item.state}
                          onCheckedChange={(v) => handleNotifToggle(item.key, v)}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* ═══ Addresses Section ═══ */}
              {activeSection === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {/* Add Address Button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}
                    className="w-full rounded-xl p-4 border-2 border-dashed border-nabdh-primary/30 hover:border-nabdh-primary/50 bg-nabdh-primary/5 transition-all flex items-center justify-center gap-2 text-nabdh-primary"
                  >
                    <Plus className="size-5" />
                    <span className="font-bold text-sm">{t('settings.addAddress')}</span>
                  </motion.button>

                  {/* Addresses List */}
                  {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                        <MapPin className="size-8 text-muted-foreground/40" />
                      </div>
                      <p className="font-semibold text-foreground">{t('settings.noAddresses')}</p>
                      <p className="text-sm text-muted-foreground mt-1">{t('settings.noAddressesDesc')}</p>
                    </div>
                  ) : (
                    addresses.map((addr, i) => {
                      const labelConfig: Record<string, { icon: typeof Home; ar: string; en: string }> = {
                        home: { icon: Home, ar: 'المنزل', en: 'Home' },
                        work: { icon: Building2, ar: 'العمل', en: 'Work' },
                        other: { icon: MapPinned, ar: 'أخرى', en: 'Other' },
                      };
                      const cfg = labelConfig[addr.label] || labelConfig.other;
                      const LabelIcon = cfg.icon;
                      return (
                        <motion.div
                          key={addr.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={cn(
                            'glass-card-enhanced rounded-xl p-4 border transition-all',
                            addr.isDefault ? 'border-nabdh-primary/30 bg-nabdh-primary/5' : 'border-border/40'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                              addr.isDefault ? 'bg-nabdh-primary/10' : 'bg-muted/50'
                            )}>
                              <LabelIcon className={cn('size-5', addr.isDefault ? 'text-nabdh-primary' : 'text-muted-foreground')} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold">
                                  {isAr ? cfg.ar : cfg.en}
                                </p>
                                {addr.isDefault && (
                                  <Badge className="bg-nabdh-primary/10 text-nabdh-primary border-nabdh-primary/20 text-[9px] px-1.5">
                                    {t('settings.addressDefault')}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5 truncate">{addr.address}</p>
                              <p className="text-xs text-muted-foreground">
                                {addr.city}{addr.area ? `, ${addr.area}` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!addr.isDefault && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSetDefault(addr)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-nabdh-primary"
                                  title={t('settings.addressDefault')}
                                >
                                  <Star className="size-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-nabdh-primary"
                              >
                                <FileText className="size-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              )}

              {/* ═══ About Section ═══ */}
              {activeSection === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {/* App Info */}
                  <div className="glass-card-enhanced rounded-2xl p-5 border border-border/50 text-center">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #004B63 0%, #006B8A 50%, #00897B 100%)' }}
                    >
                      <Shield className="size-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">{isAr ? 'نبض المدينة' : 'City Pulse'}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t('settings.version')} 1.0.0</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('settings.madeInLibya')}</p>
                  </div>

                  {/* Legal Links */}
                  {[
                    { key: 'terms', view: 'terms' as const, icon: FileText, color: 'text-nabdh-primary', bg: 'bg-nabdh-primary/10' },
                    { key: 'privacy', view: 'privacy' as const, icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { key: 'returns', view: 'returns' as const, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                  ].map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                      <motion.button
                        key={item.key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigateTo(item.view)}
                        className="w-full glass-card-enhanced rounded-xl p-4 border border-border/40 flex items-center gap-3 hover:border-border/80 transition-all group"
                      >
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.bg)}>
                          <ItemIcon className={cn('size-5', item.color)} />
                        </div>
                        <span className="text-sm font-medium flex-1 text-start">{t(`settings.${item.key}`)}</span>
                        <ForwardArrow className="size-4 text-muted-foreground group-hover:text-nabdh-primary transition-colors" />
                      </motion.button>
                    );
                  })}

                  {/* Logout (mobile) */}
                  <div className="md:hidden pt-3">
                    <Button
                      onClick={() => logout()}
                      variant="outline"
                      className="w-full h-11 text-red-500 border-red-500/30 hover:bg-red-500/10 rounded-xl"
                    >
                      <LogOut className="size-4 me-2" />
                      {t('settings.logout')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ═══ Address Form Dialog ═══ */}
      <AnimatePresence>
        {showAddressForm && (
          <AddressFormDialog
            key={editingAddress?.id || 'new'}
            isOpen={showAddressForm}
            onClose={() => { setShowAddressForm(false); setEditingAddress(null); }}
            onSave={handleSaveAddress}
            editingAddress={editingAddress}
            isAr={isAr}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* ═══ Toast ═══ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-xl border bg-emerald-500 text-white border-emerald-400 flex items-center gap-2"
          >
            <Check className="size-4" />
            <span className="text-sm font-medium">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
