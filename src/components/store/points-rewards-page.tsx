'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  Star,
  TrendingUp,
  Wallet,
  Clock,
  ShoppingBag,
  MessageSquare,
  UserPlus,
  LogIn,
  Cake,
  Sparkles,
  Plus,
  Minus,
  Check,
  X,
  Crown,
  Shield,
  Medal,
  Award,
  Loader2,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { fmt } from './lib/shared';

// ─── Types ─────────────────────────────────────────────────────────
type TabId = 'overview' | 'points-history' | 'wallet' | 'how-to-earn';

interface LoyaltyTransaction {
  id: string;
  type: string;
  points: number;
  orderId?: string;
  description?: string;
  createdAt: string;
}

interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  reference?: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface LoyaltyData {
  points: number;
  tier: string;
  tierProgress: number;
  pointsToNext: number;
  nextTier: string | null;
  transactions: LoyaltyTransaction[];
  totalCount: number;
  stats: {
    totalEarned: number;
    totalRedeemed: number;
    thisMonth: number;
    walletBalance: number;
  };
}

interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

type PointsFilter = 'all' | 'earn' | 'redeem' | 'bonus' | 'expire';
type WalletFilter = 'all' | 'deposit' | 'withdrawal' | 'refund' | 'cashback';

// ─── Tier Config ────────────────────────────────────────────────────
const tierConfig: Record<string, {
  icon: typeof Crown;
  color: string;
  bgGradient: string;
  borderColor: string;
  min: number;
  max: number;
  multiplier: string;
}> = {
  bronze: {
    icon: Shield,
    color: 'text-amber-700 dark:text-amber-500',
    bgGradient: 'from-amber-600 to-amber-800',
    borderColor: 'border-amber-500/30',
    min: 0,
    max: 500,
    multiplier: '1x',
  },
  silver: {
    icon: Medal,
    color: 'text-gray-400 dark:text-gray-300',
    bgGradient: 'from-gray-400 to-gray-600',
    borderColor: 'border-gray-400/30',
    min: 500,
    max: 2000,
    multiplier: '1.5x',
  },
  gold: {
    icon: Crown,
    color: 'text-yellow-500 dark:text-yellow-400',
    bgGradient: 'from-yellow-500 to-amber-600',
    borderColor: 'border-yellow-500/30',
    min: 2000,
    max: 5000,
    multiplier: '2x',
  },
  platinum: {
    icon: Award,
    color: 'text-cyan-400 dark:text-cyan-300',
    bgGradient: 'from-cyan-500 to-teal-600',
    borderColor: 'border-cyan-500/30',
    min: 5000,
    max: Infinity,
    multiplier: '3x',
  },
};

// ─── Tab Definition ─────────────────────────────────────────────────
const tabs: { id: TabId; icon: typeof Gift; arLabel: string; enLabel: string }[] = [
  { id: 'overview', icon: Sparkles, arLabel: 'نظرة عامة', enLabel: 'Overview' },
  { id: 'points-history', icon: Clock, arLabel: 'سجل النقاط', enLabel: 'Points History' },
  { id: 'wallet', icon: Wallet, arLabel: 'المحفظة', enLabel: 'Wallet' },
  { id: 'how-to-earn', icon: TrendingUp, arLabel: 'كيف تكتسب', enLabel: 'How to Earn' },
];

// ─── Helpers ────────────────────────────────────────────────────────
function formatDate(dateStr: string, isAr: boolean) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return isAr ? 'الآن' : 'Just now';
  if (diffMins < 60) return isAr ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
  if (diffHours < 24) return isAr ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
  if (diffDays < 7) return isAr ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;

  return d.toLocaleDateString(isAr ? 'ar-LY' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getPointsTypeIcon(type: string) {
  switch (type) {
    case 'earn': return TrendingUp;
    case 'redeem': return Minus;
    case 'expire': return Clock;
    case 'bonus': return Gift;
    default: return Sparkles;
  }
}

function getPointsTypeColor(type: string) {
  switch (type) {
    case 'earn': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'redeem': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'expire': return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'bonus': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    default: return 'text-muted-foreground bg-muted border-border';
  }
}

function getWalletTypeIcon(type: string) {
  switch (type) {
    case 'deposit': return Plus;
    case 'withdrawal': return Minus;
    case 'refund': return ArrowUpDown;
    case 'cashback': return Gift;
    case 'adjustment': return Sparkles;
    default: return Wallet;
  }
}

function getWalletTypeColor(type: string) {
  switch (type) {
    case 'deposit': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'withdrawal': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'refund': return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
    case 'cashback': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    default: return 'text-muted-foreground bg-muted border-border';
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'pending': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'failed': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

// ─── Top Up Dialog ──────────────────────────────────────────────────
function TopUpDialog({
  isOpen,
  onClose,
  onSuccess,
  isAr,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (isPending: boolean) => void;
  isAr: boolean;
  t: (key: string) => string;
}) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAmounts = [25, 50, 100, 200, 500, 1000];
  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async () => {
    if (numAmount < 10 || numAmount > 5000) return;
    setLoading(true);
    setError(null);
    try {
      const userId = useUIStore.getState().currentUser?.id;
      if (!userId) return;
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount: numAmount, paymentMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? 'حدث خطأ' : 'An error occurred'));
        return;
      }
      const isPending = method === 'bank_transfer';
      onSuccess(isPending);
      setAmount('');
      setMethod('cash');
    } catch {
      setError(isAr ? 'فشل الاتصال' : 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #004B63 0%, #006B8A 50%, #00897B 100%)' }}>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="size-5" />
            {t('rewards.topUpTitle')}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="size-4 text-white" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-foreground">{t('rewards.topUpAmount')}</label>
            <div className="mt-1.5 relative">
              <input
                type="number"
                min={10}
                max={5000}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-nabdh-primary/50 focus:border-nabdh-primary transition-all"
                dir="ltr"
              />
              <span className="absolute top-1/2 -translate-y-1/2 end-4 text-muted-foreground font-bold">
                {t('rewards.lyd')}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">{t('rewards.topUpMin')}</span>
              <span className="text-[10px] text-muted-foreground">{t('rewards.topUpMax')}</span>
            </div>
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">{t('rewards.quickAmounts')}</label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((qa) => (
                <motion.button
                  key={qa}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAmount(String(qa))}
                  className={cn(
                    'py-2 rounded-lg text-sm font-bold border transition-all',
                    numAmount === qa
                      ? 'bg-nabdh-primary text-white border-nabdh-primary'
                      : 'bg-muted/50 text-foreground border-border hover:border-nabdh-primary/50'
                  )}
                >
                  {qa} {t('rewards.lyd')}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-sm font-medium text-foreground">{t('rewards.topUpMethod')}</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMethod('cash')}
                className={cn(
                  'p-3 rounded-xl border-2 transition-all flex items-center gap-2',
                  method === 'cash'
                    ? 'border-nabdh-primary bg-nabdh-primary/5'
                    : 'border-border hover:border-nabdh-primary/30'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  method === 'cash' ? 'border-nabdh-primary' : 'border-muted-foreground/30'
                )}>
                  {method === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-nabdh-primary" />}
                </div>
                <span className="text-sm font-medium">{t('rewards.topUpCash')}</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMethod('bank_transfer')}
                className={cn(
                  'p-3 rounded-xl border-2 transition-all flex items-center gap-2',
                  method === 'bank_transfer'
                    ? 'border-nabdh-primary bg-nabdh-primary/5'
                    : 'border-border hover:border-nabdh-primary/30'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  method === 'bank_transfer' ? 'border-nabdh-primary' : 'border-muted-foreground/30'
                )}>
                  {method === 'bank_transfer' && <div className="w-2.5 h-2.5 rounded-full bg-nabdh-primary" />}
                </div>
                <span className="text-sm font-medium">{t('rewards.topUpBank')}</span>
              </motion.button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={loading || numAmount < 10 || numAmount > 5000}
            className="w-full nabdh-gradient text-white hover:opacity-90 h-12 text-base font-bold rounded-xl"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Check className="size-5 me-2" />
                {t('rewards.topUpConfirm')}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Points & Rewards Page ──────────────────────────────────────────
export function PointsRewardsPage() {
  const { t, language, direction } = useLanguageStore(useShallow((s) => ({
    t: s.t, language: s.language, direction: s.direction,
  })));
  const clearAuthView = useUIStore((s) => s.clearAuthView);
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // ─── State ────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsFilter, setPointsFilter] = useState<PointsFilter>('all');
  const [walletFilter, setWalletFilter] = useState<WalletFilter>('all');
  const [showTopUp, setShowTopUp] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // ─── Data loaders ─────────────────────
  const loadLoyalty = useCallback(async () => {
    try {
      const res = await fetch('/api/loyalty');
      if (res.ok) {
        const data = await res.json();
        setLoyaltyData(data);
      } else {
        setError(isAr ? 'فشل تحميل البيانات' : 'Failed to load data');
      }
    } catch {
      setError(isAr ? 'فشل الاتصال' : 'Connection failed');
    }
  }, [isAr]);

  const loadWallet = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setWalletData({
          balance: Number(data.balance) || 0,
          transactions: (data.transactions || []).map((tx: any) => ({
            ...tx,
            amount: Number(tx.amount) || 0,
          })),
        });
      }
    } catch { /* wallet is supplementary */ }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadLoyalty(), loadWallet()]);
      setLoading(false);
    };
    init();
  }, [loadLoyalty, loadWallet]);

  // ─── Refresh after top-up ─────────────
  const handleTopUpSuccess = useCallback((isPending: boolean) => {
    setShowTopUp(false);
    setToast({
      message: isPending ? t('rewards.topUpPending') : t('rewards.topUpSuccess'),
      type: isPending ? 'info' : 'success',
    });
    setTimeout(() => setToast(null), 3000);
    loadWallet();
    loadLoyalty();
  }, [t, loadWallet, loadLoyalty]);

  // ─── Computed ─────────────────────────
  const tier = loyaltyData?.tier || 'bronze';
  const tierInfo = tierConfig[tier] || tierConfig.bronze;
  const TierIcon = tierInfo.icon;

  const filteredPointsTransactions = useMemo(() => {
    if (!loyaltyData) return [];
    if (!loyaltyData.transactions) return [];
    if (pointsFilter === 'all') return loyaltyData.transactions;
    return loyaltyData.transactions.filter((tx) => tx.type === pointsFilter);
  }, [loyaltyData, pointsFilter]);

  const filteredWalletTransactions = useMemo(() => {
    if (!walletData) return [];
    if (!walletData.transactions) return [];
    if (walletFilter === 'all') return walletData.transactions;
    return walletData.transactions.filter((tx) => tx.type === walletFilter);
  }, [walletData, walletFilter]);

  const redeemValue = useMemo(() => {
    const pts = loyaltyData?.points || 0;
    return Math.floor(pts / 100);
  }, [loyaltyData?.points]);

  // ─── Loading state ────────────────────
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

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center" dir={direction}>
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="size-12 text-red-400" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => { setError(null); setLoading(true); loadLoyalty(); loadWallet(); }}>
            {isAr ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/20" dir={direction}>
      {/* ═══ Gradient Header ═══ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #002F3F 0%, #004B63 25%, #006B8A 55%, #00897B 85%, #00A8CC 100%)',
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-16 -start-16 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-12 -end-12 w-36 h-36 rounded-full bg-white/5" />
          <div className="absolute top-1/4 end-20 w-24 h-24 rounded-full bg-yellow-400/5" />
          <div className="absolute bottom-8 start-1/3 w-16 h-16 rounded-full bg-white/5" />
          {/* Floating stars decoration */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-6 end-12 text-yellow-400/20"
          >
            <Star className="size-8 fill-current" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-12 start-8 text-yellow-400/15"
          >
            <Star className="size-6 fill-current" />
          </motion.div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="max-w-7xl mx-auto">
            {/* Top row: Back + Title */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={clearAuthView}
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={t('common.back')}
                >
                  <BackArrow className="size-5 text-white" />
                </motion.button>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Gift className="size-6 text-nabdh-secondary" />
                    {t('rewards.title')}
                  </h1>
                  <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                    {t('rewards.subtitle')}
                  </p>
                </div>
              </div>
            </div>

            {/* ═══ Points & Wallet Stats Row ═══ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
            >
              {/* Current Points */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-white/50 text-[10px] sm:text-xs font-medium flex items-center gap-1">
                  <Star className="size-3" />
                  {t('rewards.currentPoints')}
                </p>
                <p className="text-white text-xl sm:text-2xl font-bold mt-0.5">{loyaltyData?.points || 0}</p>
              </div>

              {/* Wallet Balance */}
              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-3 border border-emerald-500/20">
                <p className="text-emerald-300/70 text-[10px] sm:text-xs font-medium flex items-center gap-1">
                  <Wallet className="size-3" />
                  {t('rewards.walletBalance')}
                </p>
                <p className="text-emerald-300 text-xl sm:text-2xl font-bold mt-0.5">{fmt(walletData?.balance || 0)} {t('rewards.lyd')}</p>
              </div>

              {/* Total Earned */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <p className="text-white/50 text-[10px] sm:text-xs font-medium flex items-center gap-1">
                  <TrendingUp className="size-3" />
                  {t('rewards.totalEarned')}
                </p>
                <p className="text-white text-xl sm:text-2xl font-bold mt-0.5">{loyaltyData?.stats?.totalEarned || 0}</p>
              </div>

              {/* This Month */}
              <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-3 border border-purple-500/20">
                <p className="text-purple-300/70 text-[10px] sm:text-xs font-medium flex items-center gap-1">
                  <Sparkles className="size-3" />
                  {t('rewards.thisMonth')}
                </p>
                <p className="text-purple-300 text-xl sm:text-2xl font-bold mt-0.5">+{loyaltyData?.stats?.thisMonth || 0}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ═══ Tabs Navigation ═══ */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all',
                    isActive
                      ? 'bg-nabdh-primary text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <TabIcon className="size-4" />
                  {isAr ? tab.arLabel : tab.enLabel}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Tab Content ═══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* ─── Overview Tab ─── */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Tier Progress Card */}
              <div className="glass-card-enhanced rounded-2xl p-5 sm:p-6 border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <TierIcon className={cn('size-5', tierInfo.color)} />
                    {t('rewards.tierProgress')}
                  </h3>
                  <Badge className={cn('text-xs px-2.5 py-1 border', tierInfo.color, 'bg-transparent', tierInfo.borderColor)}>
                    {t(`rewards.tier.${tier}`)} • {tierInfo.multiplier}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{loyaltyData?.points || 0} {t('rewards.points')}</span>
                    <span>
                      {loyaltyData?.nextTier
                        ? `${loyaltyData.pointsToNext} ${t('rewards.pointsToNext')}`
                        : t('rewards.tier.max')
                      }
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${loyaltyData?.tierProgress || 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      className={cn('h-full rounded-full bg-gradient-to-r', tierInfo.bgGradient)}
                    />
                  </div>
                </div>

                {/* Tier Ladder */}
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {Object.entries(tierConfig).map(([key, cfg]) => {
                    const CfgIcon = cfg.icon;
                    const isCurrent = key === tier;
                    const isPast = tierConfig[tier].min >= cfg.min && key !== tier;
                    const isNext = loyaltyData?.nextTier === key;
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * Object.keys(tierConfig).indexOf(key) }}
                        className={cn(
                          'relative rounded-xl p-3 text-center border-2 transition-all',
                          isCurrent
                            ? `${cfg.borderColor} bg-gradient-to-br ${cfg.bgGradient} text-white shadow-lg`
                            : isPast
                              ? `${cfg.borderColor} bg-muted/30`
                              : 'border-border/30 bg-muted/10 opacity-50',
                          isNext && 'ring-2 ring-nabdh-primary/30 ring-offset-2 ring-offset-background'
                        )}
                      >
                        <CfgIcon className={cn('size-6 mx-auto', isCurrent ? 'text-white' : cfg.color)} />
                        <p className={cn('text-[10px] sm:text-xs font-bold mt-1', isCurrent ? 'text-white' : '')}>
                          {t(`rewards.tier.${key}`)}
                        </p>
                        <p className={cn('text-[9px] sm:text-[10px]', isCurrent ? 'text-white/70' : 'text-muted-foreground')}>
                          {cfg.max === Infinity ? `${cfg.min}+` : `${cfg.min}-${cfg.max}`}
                        </p>
                        {isCurrent && (
                          <motion.div
                            layoutId="tier-indicator"
                            className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                          >
                            <Check className="size-3 text-nabdh-primary" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Tier Benefits */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(tierConfig).map(([key, cfg]) => {
                    const isCurrentOrAbove = tierConfig[tier].min >= cfg.min;
                    return (
                      <div
                        key={key}
                        className={cn(
                          'rounded-lg p-2.5 border text-xs',
                          isCurrentOrAbove ? 'border-border/50 bg-muted/30' : 'border-border/20 bg-muted/10 opacity-50'
                        )}
                      >
                        <span className={cn('font-bold', cfg.color)}>
                          {t(`rewards.tier.${key}`)}:
                        </span>{' '}
                        <span className="text-muted-foreground">{t(`rewards.${key}Benefits`)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Redeem Info Card */}
              <div className="glass-card-enhanced rounded-2xl p-5 sm:p-6 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nabdh-primary to-nabdh-accent flex items-center justify-center">
                    <Gift className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{t('rewards.redeemPoints')}</h3>
                    <p className="text-xs text-muted-foreground">{t('rewards.redeemDesc')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4 border border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('rewards.availableToRedeem')}</p>
                    <p className="text-2xl font-bold text-nabdh-price">{redeemValue} {t('rewards.lyd')}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-xs text-muted-foreground">{loyaltyData?.points || 0}</p>
                    <p className="text-sm font-medium text-foreground">{t('rewards.points')}</p>
                  </div>
                </div>
              </div>

              {/* Wallet Quick Card */}
              <div className="glass-card-enhanced rounded-2xl p-5 sm:p-6 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Wallet className="size-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('rewards.walletBalance')}</p>
                      <p className="text-2xl font-bold text-foreground">{fmt(walletData?.balance || 0)} {t('rewards.lyd')}</p>
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTopUp(true)}
                    className="nabdh-gradient text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-md hover:opacity-90 transition-opacity"
                  >
                    <Plus className="size-4" />
                    {t('rewards.topUp')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── Points History Tab ─── */}
          {activeTab === 'points-history' && (
            <motion.div
              key="points-history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Filter chips */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {(['all', 'earn', 'redeem', 'bonus', 'expire'] as PointsFilter[]).map((f) => {
                  const key = f === 'all' ? 'rewards.filterAll' : `rewards.filter${f.charAt(0).toUpperCase() + f.slice(1)}`;
                  return (
                    <motion.button
                      key={f}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPointsFilter(f)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
                        pointsFilter === f
                          ? 'bg-nabdh-primary text-white border-nabdh-primary shadow-sm'
                          : 'bg-muted/50 text-muted-foreground border-border hover:border-nabdh-primary/30'
                      )}
                    >
                      {t(key)}
                    </motion.button>
                  );
                })}
              </div>

              {/* Transactions List */}
              {filteredPointsTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Clock className="size-10 text-muted-foreground/40" />
                  </div>
                  <p className="font-semibold text-foreground">{t('rewards.noTransactions')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('rewards.noTransactionsDesc')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPointsTransactions.map((tx, i) => {
                    const TxIcon = getPointsTypeIcon(tx.type);
                    const txColor = getPointsTypeColor(tx.type);
                    const isPositive = tx.type === 'earn' || tx.type === 'bonus';
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        className="glass-card-enhanced rounded-xl p-3 sm:p-4 border border-border/40 hover:border-border/80 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', txColor)}>
                            <TxIcon className="size-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {tx.description || t(`rewards.type.${tx.type}`)}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(tx.createdAt, isAr)}
                            </p>
                          </div>
                          <div className="text-end shrink-0">
                            <p className={cn(
                              'text-base font-bold',
                              isPositive ? 'text-emerald-500' : 'text-red-500'
                            )}>
                              {isPositive ? '+' : '-'}{Math.abs(tx.points)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{t('rewards.points')}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Wallet Tab ─── */}
          {activeTab === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Wallet Balance Card */}
              <div className="glass-card-enhanced rounded-2xl p-5 sm:p-6 border border-border/50"
                style={{ background: 'linear-gradient(135deg, rgba(0,75,99,0.05) 0%, rgba(0,137,123,0.08) 100%)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wallet className="size-3.5" />
                      {t('rewards.walletBalance')}
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-foreground mt-1">
                      {fmt(walletData?.balance || 0)} <span className="text-lg text-muted-foreground">{t('rewards.lyd')}</span>
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTopUp(true)}
                    className="nabdh-gradient text-white px-5 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
                  >
                    <Plus className="size-5" />
                    {t('rewards.topUp')}
                  </motion.button>
                </div>

                {/* Quick stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-background/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground">{t('rewards.totalEarned')}</p>
                    <p className="text-sm font-bold text-foreground">{loyaltyData?.stats?.totalEarned || 0}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground">{t('rewards.totalRedeemed')}</p>
                    <p className="text-sm font-bold text-foreground">{loyaltyData?.stats?.totalRedeemed || 0}</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground">{t('rewards.redeemPoints')}</p>
                    <p className="text-sm font-bold text-nabdh-price">{redeemValue} {t('rewards.lyd')}</p>
                  </div>
                </div>
              </div>

              {/* Wallet Filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {(['all', 'deposit', 'withdrawal', 'refund', 'cashback'] as WalletFilter[]).map((f) => {
                  const key = f === 'all' ? 'rewards.filterAll' : `rewards.filter${f.charAt(0).toUpperCase() + f.slice(1)}`;
                  return (
                    <motion.button
                      key={f}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setWalletFilter(f)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
                        walletFilter === f
                          ? 'bg-nabdh-primary text-white border-nabdh-primary shadow-sm'
                          : 'bg-muted/50 text-muted-foreground border-border hover:border-nabdh-primary/30'
                      )}
                    >
                      {t(key)}
                    </motion.button>
                  );
                })}
              </div>

              {/* Wallet Transactions */}
              {filteredWalletTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Wallet className="size-10 text-muted-foreground/40" />
                  </div>
                  <p className="font-semibold text-foreground">{t('rewards.noWalletTransactions')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('rewards.noWalletTransactionsDesc')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredWalletTransactions.map((tx, i) => {
                    const TxIcon = getWalletTypeIcon(tx.type);
                    const txColor = getWalletTypeColor(tx.type);
                    const isPositive = ['deposit', 'refund', 'cashback'].includes(tx.type);
                    const statusStyle = getStatusStyle(tx.status);
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        className="glass-card-enhanced rounded-xl p-3 sm:p-4 border border-border/40 hover:border-border/80 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('w-10 h-10 rounded-xl border flex items-center justify-center shrink-0', txColor)}>
                            <TxIcon className="size-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {tx.description || t(`rewards.wallet${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}`)}
                              </p>
                              {tx.status !== 'completed' && (
                                <Badge className={cn('text-[9px] px-1.5 py-0 border', statusStyle)}>
                                  {t(`rewards.status.${tx.status}`)}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(tx.createdAt, isAr)}
                            </p>
                          </div>
                          <div className="text-end shrink-0">
                            <p className={cn(
                              'text-base font-bold',
                              isPositive ? 'text-emerald-500' : 'text-red-500'
                            )}>
                              {isPositive ? '+' : '-'}{fmt(Math.abs(tx.amount))}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{tx.currency}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── How to Earn Tab ─── */}
          {activeTab === 'how-to-earn' && (
            <motion.div
              key="how-to-earn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {[
                { icon: ShoppingBag, titleKey: 'rewards.earn.purchase', descKey: 'rewards.earn.purchaseDesc', points: '1/LYD', color: 'from-nabdh-primary to-nabdh-accent', bg: 'bg-nabdh-primary/10 border-nabdh-primary/20' },
                { icon: MessageSquare, titleKey: 'rewards.earn.review', descKey: 'rewards.earn.reviewDesc', points: '+50', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-500/10 border-purple-500/20' },
                { icon: UserPlus, titleKey: 'rewards.earn.referral', descKey: 'rewards.earn.referralDesc', points: '+200', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { icon: LogIn, titleKey: 'rewards.earn.dailyLogin', descKey: 'rewards.earn.dailyLoginDesc', points: '+5', color: 'from-sky-500 to-cyan-600', bg: 'bg-sky-500/10 border-sky-500/20' },
                { icon: Cake, titleKey: 'rewards.earn.birthday', descKey: 'rewards.earn.birthdayDesc', points: '+100', color: 'from-pink-500 to-rose-600', bg: 'bg-pink-500/10 border-pink-500/20' },
                { icon: ShoppingBag, titleKey: 'rewards.earn.firstOrder', descKey: 'rewards.earn.firstOrderDesc', points: '+150', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-500/10 border-amber-500/20' },
              ].map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="glass-card-enhanced rounded-2xl p-4 sm:p-5 border border-border/40 hover:border-border/80 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn('w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center shrink-0', item.bg)}>
                        <ItemIcon className={cn('size-6 sm:size-7 bg-gradient-to-br bg-clip-text', `text-[var(--icon-color)]`)} style={{ '--icon-color': 'currentColor' } as React.CSSProperties} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base group-hover:text-nabdh-primary transition-colors">
                          {t(item.titleKey)}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          {t(item.descKey)}
                        </p>
                      </div>
                      <Badge className={cn('text-sm px-3 py-1 border-0 font-bold bg-gradient-to-r text-white', item.color)}>
                        {item.points}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}

              {/* How to Redeem Section */}
              <div className="glass-card-enhanced rounded-2xl p-5 sm:p-6 border border-nabdh-primary/20 bg-gradient-to-br from-nabdh-primary/5 to-nabdh-accent/5 mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nabdh-primary to-nabdh-accent flex items-center justify-center">
                    <Gift className="size-5 text-white" />
                  </div>
                  <h3 className="font-bold text-base">{t('rewards.redeemPoints')}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('rewards.redeemDesc')}
                </p>
                <div className="mt-3 flex items-center gap-3 bg-background/50 rounded-xl p-3">
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-nabdh-primary">{loyaltyData?.points || 0}</p>
                    <p className="text-[10px] text-muted-foreground">{t('rewards.points')}</p>
                  </div>
                  <div className="text-muted-foreground">=</div>
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-nabdh-price">{redeemValue}</p>
                    <p className="text-[10px] text-muted-foreground">{t('rewards.lyd')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Top Up Dialog ═══ */}
      <AnimatePresence>
        {showTopUp && (
          <TopUpDialog
            isOpen={showTopUp}
            onClose={() => setShowTopUp(false)}
            onSuccess={handleTopUpSuccess}
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
            className={cn(
              'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
              'px-5 py-3 rounded-xl shadow-xl border flex items-center gap-2',
              toast.type === 'success'
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-amber-500 text-white border-amber-400'
            )}
          >
            {toast.type === 'success' ? <Check className="size-4" /> : <Clock className="size-4" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
