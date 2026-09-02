'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Mail, Wallet, Package, ArrowLeft, ArrowRight,
  LogOut, Store, ChevronDown, Clock, ShieldCheck, Truck,
  CheckCircle2, XCircle, AlertCircle, Loader2, Gift, Crown,
  ShoppingBag, MapPin, Star, Settings, Bell, CreditCard,
  Edit3, Camera, Trash2, Plus, Home, Building2, CircleDot,
  TrendingUp, Award, ArrowUpRight, ArrowDownRight, X, Save,
  Eye, EyeOff, Globe, Moon, Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useLanguageStore } from '@/stores/language-store';
import { useUIStore } from '@/stores/ui-store';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { syncThemeToServer } from '@/lib/theme-sync';

/* ─── Types ──────────────────────────────────────────────────── */
interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  area: string | null;
  notes: string | null;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  price: number;
  quantity: number;
  total: number;
  image: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  deliveredAt: string | null;
  items: OrderItem[];
}

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  avatar: string | null;
  role: string;
  loyaltyTier: string;
  loyaltyPoints: number;
  walletBalance: number;
  language: string;
  createdAt: string;
  addresses: Address[];
  orders: Order[];
}

interface WalletTx {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  createdAt: string;
}

interface LoyaltyTx {
  id: string;
  type: string;
  points: number;
  description: string | null;
  createdAt: string;
}

interface LoyaltyData {
  points: number;
  tier: string;
  tierProgress: number;
  pointsToNext: number;
  nextTier: string | null;
  transactions: LoyaltyTx[];
}

/* ─── Tab Types ──────────────────────────────────────────────── */
type ProfileTab = 'overview' | 'orders' | 'addresses' | 'wallet' | 'loyalty' | 'settings';

/* ─── Helpers ────────────────────────────────────────────────── */
function formatDate(dateStr: string, isAr: boolean) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(isAr ? 'ar-LY' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatCurrency(amount: number, isAr: boolean) {
  return `${amount.toFixed(2)} ${isAr ? 'د.ل' : 'LYD'}`;
}

function getStatusConfig(status: string, isAr: boolean) {
  const map: Record<string, { label: string; color: string; bg: string; icon: typeof Package }> = {
    pending: { label: isAr ? 'معلق' : 'Pending', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', icon: Clock },
    confirmed: { label: isAr ? 'مؤكد' : 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', icon: ShieldCheck },
    processing: { label: isAr ? 'قيد المعالجة' : 'Processing', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', icon: Package },
    shipped: { label: isAr ? 'تم الشحن' : 'Shipped', color: 'text-nabdh-primary', bg: 'bg-nabdh-primary/10', icon: Truck },
    delivered: { label: isAr ? 'تم التوصيل' : 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', icon: CheckCircle2 },
    cancelled: { label: isAr ? 'ملغي' : 'Cancelled', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', icon: XCircle },
    refunded: { label: isAr ? 'مسترد' : 'Refunded', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', icon: AlertCircle },
  };
  return map[status] || map.pending;
}

function getLoyaltyTierConfig(tier: string, isAr: boolean) {
  const map: Record<string, { label: string; color: string; bg: string; gradient: string; nextPts: number }> = {
    bronze: { label: isAr ? 'برونزي' : 'Bronze', color: 'text-amber-700', bg: 'bg-amber-100 dark:bg-amber-900/30', gradient: 'from-amber-600 to-amber-800', nextPts: 500 },
    silver: { label: isAr ? 'فضي' : 'Silver', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800/30', gradient: 'from-slate-400 to-slate-600', nextPts: 2000 },
    gold: { label: isAr ? 'ذهبي' : 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', gradient: 'from-yellow-500 to-amber-600', nextPts: 5000 },
    platinum: { label: isAr ? 'بلاتيني' : 'Platinum', color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30', gradient: 'from-cyan-500 to-teal-600', nextPts: 0 },
  };
  return map[tier] || map.bronze;
}

function getWalletTxConfig(type: string, isAr: boolean) {
  const map: Record<string, { label: string; color: string; icon: typeof ArrowUpRight }> = {
    deposit: { label: isAr ? 'إيداع' : 'Deposit', color: 'text-emerald-600', icon: ArrowDownRight },
    withdrawal: { label: isAr ? 'سحب' : 'Withdrawal', color: 'text-red-500', icon: ArrowUpRight },
    refund: { label: isAr ? 'استرداد' : 'Refund', color: 'text-blue-600', icon: ArrowDownRight },
    cashback: { label: isAr ? 'استرداد نقدي' : 'Cashback', color: 'text-purple-600', icon: ArrowDownRight },
    adjustment: { label: isAr ? 'تعديل' : 'Adjustment', color: 'text-amber-600', icon: ArrowUpRight },
  };
  return map[type] || map.adjustment;
}

function getLoyaltyTxConfig(type: string, isAr: boolean) {
  const map: Record<string, { label: string; color: string; sign: string }> = {
    earn: { label: isAr ? 'كسب' : 'Earned', color: 'text-emerald-600', sign: '+' },
    redeem: { label: isAr ? 'استبدال' : 'Redeemed', color: 'text-red-500', sign: '-' },
    expire: { label: isAr ? 'انتهاء' : 'Expired', color: 'text-muted-foreground', sign: '-' },
    bonus: { label: isAr ? 'مكافأة' : 'Bonus', color: 'text-amber-600', sign: '+' },
  };
  return map[type] || map.earn;
}

/* ─── Animation Variants ─────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ─── Sub-Components ─────────────────────────────────────────── */

function TabButton({ tab, currentTab, onClick, icon: Icon, label, badge }: {
  tab: ProfileTab; currentTab: ProfileTab; onClick: () => void;
  icon: typeof Package; label: string; badge?: number;
}) {
  const active = tab === currentTab;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
        active
          ? 'nabdh-gradient text-white shadow-md shadow-nabdh-primary/20'
          : 'text-muted-foreground hover:text-nabdh-primary hover:bg-nabdh-primary/5'
      )}
    >
      <Icon className="size-4" />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          'min-w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1',
          active ? 'bg-white/20 text-white' : 'bg-nabdh-primary/10 text-nabdh-primary'
        )}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

/* ─── Overview Tab ───────────────────────────────────────────── */
function OverviewTab({ user, isAr, isRTL, onTabChange }: {
  user: UserProfile; isAr: boolean; isRTL: boolean; onTabChange: (tab: ProfileTab) => void;
}) {
  const tierCfg = getLoyaltyTierConfig(user.loyaltyTier, isAr);
  const completedOrders = user.orders.filter((o) => o.status === 'delivered').length;
  const activeOrders = user.orders.filter((o) => !['delivered', 'cancelled', 'refunded'].includes(o.status)).length;
  const totalSpent = user.orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0);

  const stats = [
    { icon: Wallet, label: isAr ? 'المحفظة' : 'Wallet', value: formatCurrency(user.walletBalance, isAr), color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30', tab: 'wallet' as ProfileTab },
    { icon: Gift, label: isAr ? 'نقاط الولاء' : 'Loyalty', value: (user?.loyaltyPoints ?? 0).toString(), color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', tab: 'loyalty' as ProfileTab },
    { icon: ShoppingBag, label: isAr ? 'الطلبات' : 'Orders', value: (user?.orders?.length ?? 0).toString(), color: 'text-nabdh-primary', bg: 'bg-nabdh-primary/10', tab: 'orders' as ProfileTab },
    { icon: CheckCircle2, label: isAr ? 'مكتملة' : 'Completed', value: (completedOrders ?? 0).toString(), color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/30', tab: 'orders' as ProfileTab },
  ];

  const quickActions = [
    { icon: Package, label: isAr ? 'طلباتي' : 'My Orders', desc: isAr ? `${activeOrders} طلب نشط` : `${activeOrders} active`, tab: 'orders' as ProfileTab, color: 'text-nabdh-primary', bg: 'bg-nabdh-primary/10' },
    { icon: MapPin, label: isAr ? 'عناويني' : 'Addresses', desc: isAr ? `${user.addresses.length} عنوان` : `${user.addresses.length} saved`, tab: 'addresses' as ProfileTab, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/30' },
    { icon: CreditCard, label: isAr ? 'المحفظة' : 'Wallet', desc: formatCurrency(user.walletBalance, isAr), tab: 'wallet' as ProfileTab, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { icon: Award, label: isAr ? 'نقاط الولاء' : 'Loyalty', desc: isAr ? `${user.loyaltyPoints} نقطة` : `${user.loyaltyPoints} pts`, tab: 'loyalty' as ProfileTab, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    { icon: Settings, label: isAr ? 'الإعدادات' : 'Settings', desc: isAr ? 'تعديل الملف الشخصي' : 'Edit profile', tab: 'settings' as ProfileTab, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/30' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Loyalty Tier Progress */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className={cn('size-5', tierCfg.color)} />
            <span className="font-semibold">{tierCfg.label}</span>
          </div>
          {tierCfg.nextPts > 0 && (
            <span className="text-xs text-muted-foreground">
              {isAr ? `${tierCfg.nextPts - user.loyaltyPoints} نقطة للترقية` : `${tierCfg.nextPts - user.loyaltyPoints} pts to next tier`}
            </span>
          )}
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (user.loyaltyPoints / tierCfg.nextPts) * 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn('h-full rounded-full bg-gradient-to-l', tierCfg.gradient)}
          />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.button
              key={stat.label}
              variants={itemVariants}
              onClick={() => onTabChange(stat.tab)}
              className="glass-card rounded-xl p-4 flex flex-col items-center justify-center text-center gap-1.5 hover:shadow-md hover:shadow-nabdh-primary/5 transition-all"
            >
              <div className={cn('size-10 rounded-lg flex items-center justify-center', stat.bg)}>
                <Icon className={cn('size-5', stat.color)} />
              </div>
              <span className="text-lg font-bold">{stat.value}</span>
              <span className="text-[11px] text-muted-foreground">{stat.label}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          {isAr ? 'الوصول السريع' : 'Quick Access'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                onClick={() => onTabChange(action.tab)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="glass-card rounded-xl p-4 flex items-center gap-3 text-start hover:shadow-md hover:shadow-nabdh-primary/5 transition-all"
              >
                <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', action.bg)}>
                  <Icon className={cn('size-5', action.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{action.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Orders */}
      {user.orders.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">{isAr ? 'آخر الطلبات' : 'Recent Orders'}</h3>
            <button onClick={() => onTabChange('orders')} className="text-xs text-nabdh-primary hover:underline">
              {isAr ? 'عرض الكل' : 'View All'}
            </button>
          </div>
          <div className="space-y-2">
            {user.orders.slice(0, 3).map((order) => {
              const statusCfg = getStatusConfig(order.status, isAr);
              const StatusIcon = statusCfg.icon;
              return (
                <div key={order.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', statusCfg.bg)}>
                    <StatusIcon className={cn('size-4', statusCfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">#{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt, isAr)}</p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="text-sm font-bold">{formatCurrency(order.total, isAr)}</p>
                    <Badge className={cn('text-[9px] px-1 py-0 border-0', statusCfg.bg, statusCfg.color)}>{statusCfg.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Total Spent Card */}
      {totalSpent > 0 && (
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl nabdh-gradient flex items-center justify-center shrink-0">
              <TrendingUp className="size-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{isAr ? 'إجمالي المشتريات' : 'Total Spent'}</p>
              <p className="text-xl font-bold gradient-text">{formatCurrency(totalSpent, isAr)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Orders Tab ─────────────────────────────────────────────── */
function OrdersTab({ orders, isAr, isRTL }: { orders: Order[]; isAr: boolean; isRTL: boolean }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const statusFilters = [
    { key: 'all', label: isAr ? 'الكل' : 'All' },
    { key: 'pending', label: isAr ? 'معلق' : 'Pending' },
    { key: 'processing', label: isAr ? 'قيد المعالجة' : 'Processing' },
    { key: 'shipped', label: isAr ? 'تم الشحن' : 'Shipped' },
    { key: 'delivered', label: isAr ? 'تم التوصيل' : 'Delivered' },
    { key: 'cancelled', label: isAr ? 'ملغي' : 'Cancelled' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Status Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              statusFilter === f.key
                ? 'nabdh-gradient text-white shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-10 text-center">
          <Package className="size-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">{isAr ? 'لا توجد طلبات' : 'No orders'}</h3>
          <p className="text-sm text-muted-foreground">{isAr ? 'لم يتم العثور على طلبات بهذا الحالة' : 'No orders found with this filter'}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const statusCfg = getStatusConfig(order.status, isAr);
            const StatusIcon = statusCfg.icon;
            const expanded = expandedId === order.id;
            return (
              <motion.div key={order.id} variants={itemVariants} layout className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className="w-full text-start p-4 flex items-center gap-3 hover:bg-nabdh-primary/5 transition-colors"
                >
                  <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', statusCfg.bg)}>
                    <StatusIcon className={cn('size-5', statusCfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">#{order.orderNumber}</span>
                      <Badge className={cn('text-[10px] px-1.5 py-0 border-0 font-medium', statusCfg.bg, statusCfg.color)}>{statusCfg.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(order.createdAt, isAr)} · {order.items.length} {isAr ? 'منتجات' : 'items'}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <p className="font-bold text-sm">{formatCurrency(order.total, isAr)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {order.paymentMethod === 'cod' ? (isAr ? 'عند الاستلام' : 'COD') : order.paymentMethod === 'card' ? (isAr ? 'بطاقة' : 'Card') : (isAr ? 'تحويل' : 'Transfer')}
                    </p>
                  </div>
                  <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' as const }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <Separator className="mb-3" />
                        <div className="space-y-2.5">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="size-11 rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center overflow-hidden shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={isAr ? item.nameAr : item.nameEn} className="size-full object-cover" />
                                ) : (
                                  <ShoppingBag className="size-5 text-muted-foreground/40" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{isAr ? item.nameAr : item.nameEn}</p>
                                <p className="text-xs text-muted-foreground">{item.quantity} × {formatCurrency(item.price, isAr)}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm font-semibold">{formatCurrency(item.total, isAr)}</span>
                                {/* Rate this product — only for delivered orders */}
                                {order.status === 'delivered' && (
                                  <button
                                    onClick={() => useUIStore.getState().openProductDetail(item.productId)}
                                    className="size-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors group"
                                    title={isAr ? 'قيّم هذا المنتج' : 'Rate this product'}
                                  >
                                    <Star className="size-3.5 text-amber-500 group-hover:fill-amber-500 transition-all" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-3 pt-3 border-t border-border/30 space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
                            <span>{formatCurrency(order.subtotal, isAr)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{isAr ? 'التوصيل' : 'Delivery'}</span>
                            <span>{formatCurrency(order.deliveryFee, isAr)}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-xs text-emerald-600">
                              <span>{isAr ? 'الخصم' : 'Discount'}</span>
                              <span>-{formatCurrency(order.discount, isAr)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm font-bold pt-1">
                            <span>{isAr ? 'الإجمالي' : 'Total'}</span>
                            <span>{formatCurrency(order.total, isAr)}</span>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{isAr ? 'حالة الدفع' : 'Payment Status'}</span>
                          <Badge className={cn(
                            'text-[10px] px-1.5 py-0 border-0 font-medium',
                            order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                              : order.paymentStatus === 'failed' ? 'bg-red-50 text-red-500 dark:bg-red-950/30'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
                          )}>
                            {order.paymentStatus === 'paid' ? (isAr ? 'مدفوع' : 'Paid')
                              : order.paymentStatus === 'failed' ? (isAr ? 'فشل' : 'Failed')
                              : (isAr ? 'معلق' : 'Pending')}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Addresses Tab ──────────────────────────────────────────── */
function AddressesTab({ addresses, userId, isAr, onRefresh }: {
  addresses: Address[]; userId: string; isAr: boolean; onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [form, setForm] = useState({ label: 'home', address: '', city: '', area: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const labelOptions = [
    { value: 'home', label: isAr ? 'المنزل' : 'Home', icon: Home },
    { value: 'work', label: isAr ? 'العمل' : 'Work', icon: Building2 },
    { value: 'other', label: isAr ? 'أخرى' : 'Other', icon: MapPin },
  ];

  const openAddForm = () => {
    setEditingAddr(null);
    setForm({ label: 'home', address: '', city: '', area: '', notes: '' });
    setShowForm(true);
  };

  const openEditForm = (addr: Address) => {
    setEditingAddr(addr);
    setForm({ label: addr.label, address: addr.address, city: addr.city, area: addr.area || '', notes: addr.notes || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.address.trim() || !form.city.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        userId,
        label: form.label,
        address: form.address.trim(),
        city: form.city.trim(),
        area: form.area.trim() || null,
        notes: form.notes.trim() || null,
      };

      if (editingAddr) {
        body.id = editingAddr.id;
        const res = await fetch('/api/addresses', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch('/api/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error();
      }
      setShowForm(false);
      onRefresh();
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      onRefresh();
    } catch { /* silent */ } finally {
      setDeleting(null);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={openAddForm} size="sm" className="nabdh-gradient text-white gap-1.5">
          <Plus className="size-4" />
          {isAr ? 'إضافة عنوان' : 'Add Address'}
        </Button>
      </div>

      {/* Address Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-sm">
                {editingAddr ? (isAr ? 'تعديل العنوان' : 'Edit Address') : (isAr ? 'عنوان جديد' : 'New Address')}
              </h3>

              {/* Label Selection */}
              <div className="flex gap-2">
                {labelOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setForm((f) => ({ ...f, label: opt.value }))}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all border',
                        form.label === opt.value
                          ? 'border-nabdh-primary bg-nabdh-primary/5 text-nabdh-primary'
                          : 'border-border bg-transparent text-muted-foreground hover:border-nabdh-primary/30'
                      )}
                    >
                      <Icon className="size-4" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{isAr ? 'المدينة *' : 'City *'}</label>
                  <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder={isAr ? 'طرابلس' : 'Tripoli'} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">{isAr ? 'المنطقة' : 'Area'}</label>
                  <Input value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))} placeholder={isAr ? 'أبونشيم' : 'Abuncheem'} />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{isAr ? 'العنوان التفصيلي *' : 'Street Address *'}</label>
                <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder={isAr ? 'شارع الزاوية، بجوار...' : 'Zawiya St., near...'} />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{isAr ? 'ملاحظات' : 'Notes'}</label>
                <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder={isAr ? 'ملاحظات إضافية للتوصيل' : 'Extra delivery notes'} />
              </div>

              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} disabled={saving || !form.address.trim() || !form.city.trim()} className="nabdh-gradient text-white gap-1.5 flex-1">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {isAr ? 'حفظ' : 'Save'}
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address List */}
      {addresses.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-10 text-center">
          <MapPin className="size-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">{isAr ? 'لا توجد عناوين' : 'No addresses'}</h3>
          <p className="text-sm text-muted-foreground">{isAr ? 'أضف عنواناً لتسهيل التوصيل' : 'Add an address for easier delivery'}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const LabelIcon = addr.label === 'home' ? Home : addr.label === 'work' ? Building2 : MapPin;
            const labelName = addr.label === 'home' ? (isAr ? 'المنزل' : 'Home') : addr.label === 'work' ? (isAr ? 'العمل' : 'Work') : (isAr ? 'أخرى' : 'Other');
            return (
              <motion.div key={addr.id} variants={itemVariants} className="glass-card rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-lg bg-nabdh-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <LabelIcon className="size-5 text-nabdh-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{labelName}</span>
                      {addr.isDefault && (
                        <Badge className="text-[9px] px-1.5 py-0 border-0 bg-nabdh-secondary/10 text-nabdh-secondary">{isAr ? 'افتراضي' : 'Default'}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{addr.address}</p>
                    <p className="text-xs text-muted-foreground">{addr.city}{addr.area ? ` - ${addr.area}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditForm(addr)} className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-nabdh-primary hover:bg-nabdh-primary/5 transition-colors">
                      <Edit3 className="size-3.5" />
                    </button>
                    <button onClick={() => handleDelete(addr.id)} disabled={deleting === addr.id} className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      {deleting === addr.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Wallet Tab ─────────────────────────────────────────────── */
function WalletTab({ balance, userId, isAr }: { balance: number; userId: string; isAr: boolean }) {
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    fetch('/api/wallet')
      .then((r) => r.json())
      .then((data) => setTransactions(data.transactions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < 10) return;
    setDepositing(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, paymentMethod: 'cash' }),
      });
      if (res.ok) {
        const data = await res.json();
        setDepositAmount('');
        // Re-fetch transactions
        const txRes = await fetch('/api/wallet');
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } catch { /* silent */ } finally {
      setDepositing(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {/* Balance Card */}
      <motion.div variants={itemVariants} className="nabdh-gradient rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 start-0 size-32 bg-white/5 rounded-full -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 end-0 size-24 bg-white/5 rounded-full translate-x-8 translate-y-8" />
        <div className="relative">
          <p className="text-sm text-white/70">{isAr ? 'رصيد المحفظة' : 'Wallet Balance'}</p>
          <p className="text-3xl font-bold mt-1">{balance.toFixed(2)} <span className="text-lg">{isAr ? 'د.ل' : 'LYD'}</span></p>
        </div>
      </motion.div>

      {/* Top Up */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-sm">{isAr ? 'شحن المحفظة' : 'Top Up Wallet'}</h3>
        <div className="flex gap-2">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setDepositAmount(amt.toString())}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-medium transition-all border',
                depositAmount === amt.toString()
                  ? 'border-nabdh-primary bg-nabdh-primary/5 text-nabdh-primary'
                  : 'border-border text-muted-foreground hover:border-nabdh-primary/30'
              )}
            >
              {amt} {isAr ? 'د.ل' : 'LYD'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder={isAr ? 'أو أدخل مبلغ آخر...' : 'Or enter amount...'}
            min={10}
          />
          <Button
            onClick={handleDeposit}
            disabled={depositing || !depositAmount || parseFloat(depositAmount) < 10}
            className="nabdh-gradient text-white shrink-0"
          >
            {depositing ? <Loader2 className="size-4 animate-spin" /> : (isAr ? 'شحن' : 'Top Up')}
          </Button>
        </div>
      </motion.div>

      {/* Transactions */}
      <motion.div variants={itemVariants}>
        <h3 className="font-semibold text-sm mb-3">{isAr ? 'سجل المعاملات' : 'Transaction History'}</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-nabdh-primary" /></div>
        ) : transactions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <CreditCard className="size-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{isAr ? 'لا توجد معاملات' : 'No transactions yet'}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-nabdh-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            {transactions.map((tx) => {
              const cfg = getWalletTxConfig(tx.type, isAr);
              const TxIcon = cfg.icon;
              const isPositive = ['deposit', 'refund', 'cashback'].includes(tx.type);
              return (
                <div key={tx.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', isPositive ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30')}>
                    <TxIcon className={cn('size-4', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt, isAr)}</p>
                  </div>
                  <span className={cn('text-sm font-bold shrink-0', isPositive ? 'text-emerald-600' : 'text-red-500')}>
                    {isPositive ? '+' : '-'}{Number(tx.amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Loyalty Tab ────────────────────────────────────────────── */
function LoyaltyTab({ points, tier, isAr }: { points: number; tier: string; isAr: boolean }) {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/loyalty')
      .then((r) => r.json())
      .then((data) => setLoyaltyData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tierCfg = getLoyaltyTierConfig(tier, isAr);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {/* Points Card */}
      <motion.div variants={itemVariants} className={cn('rounded-2xl p-6 text-white relative overflow-hidden bg-gradient-to-l', tierCfg.gradient)}>
        <div className="absolute top-0 start-0 size-32 bg-white/5 rounded-full -translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 end-0 size-24 bg-white/5 rounded-full translate-x-8 translate-y-8" />
        <div className="relative flex items-center gap-4">
          <div className="size-14 rounded-xl bg-white/10 flex items-center justify-center">
            <Crown className="size-7" />
          </div>
          <div>
            <p className="text-sm text-white/80">{isAr ? 'نقاط الولاء' : 'Loyalty Points'}</p>
            <p className="text-3xl font-bold">{loyaltyData?.points ?? points}</p>
            <p className="text-xs text-white/70 mt-0.5">{tierCfg.label}</p>
          </div>
        </div>
      </motion.div>

      {/* Tier Progress */}
      {loyaltyData && loyaltyData.nextTier && (
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{tierCfg.label}</span>
            <span className="text-xs text-muted-foreground">
              {isAr ? `${loyaltyData.pointsToNext} نقطة للترقية` : `${loyaltyData.pointsToNext} pts to ${loyaltyData.nextTier}`}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${loyaltyData.tierProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn('h-full rounded-full bg-gradient-to-l', tierCfg.gradient)}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">{loyaltyData.points}</span>
            <span className="text-[10px] text-muted-foreground">{getLoyaltyTierConfig(loyaltyData.nextTier, isAr).nextPts}</span>
          </div>
        </motion.div>
      )}

      {/* Transactions */}
      <motion.div variants={itemVariants}>
        <h3 className="font-semibold text-sm mb-3">{isAr ? 'سجل النقاط' : 'Points History'}</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-nabdh-primary" /></div>
        ) : !loyaltyData || loyaltyData.transactions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Star className="size-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{isAr ? 'لا توجد حركات نقاط' : 'No points activity'}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-nabdh-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            {loyaltyData.transactions.map((tx) => {
              const cfg = getLoyaltyTxConfig(tx.type, isAr);
              return (
                <div key={tx.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0',
                    tx.type === 'earn' || tx.type === 'bonus' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'
                  )}>
                    <Star className={cn('size-4', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt, isAr)}</p>
                  </div>
                  <span className={cn('text-sm font-bold shrink-0', cfg.color)}>
                    {cfg.sign}{tx.points}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Settings Tab ───────────────────────────────────────────── */
function SettingsTab({ user, isAr, onRefresh }: {
  user: UserProfile; isAr: boolean; onRefresh: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguageStore(useShallow((s) => ({ language: s.language, setLanguage: s.setLanguage })));
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || undefined, email: email.trim() || null }),
      });
      if (res.ok) {
        setSaved(true);
        onRefresh();
        // Sync name/email changes to global UI store so header reflects the change immediately
        const update: Record<string, string | undefined> = {};
        if (name.trim()) update.name = name.trim();
        if (email.trim()) update.email = email.trim();
        if (Object.keys(update).length > 0) useUIStore.getState().updateCurrentUser(update);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    // For now, we'll use a data URL (in production, upload to cloud storage)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUrl = reader.result as string;
      try {
        await fetch('/api/auth/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: dataUrl }),
        });
        onRefresh();
        // Sync avatar to global UI store so header reflects the change immediately
        useUIStore.getState().updateCurrentUser({ avatar: dataUrl });
      } catch { /* silent */ }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const settingSections = [
    {
      title: isAr ? 'المظهر' : 'Appearance',
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: isAr ? 'المظهر' : 'Theme',
          value: theme === 'dark' ? (isAr ? 'داكن' : 'Dark') : (isAr ? 'فاتح' : 'Light'),
          action: () => { const newTheme = theme === 'dark' ? 'light' : 'dark'; setTheme(newTheme); syncThemeToServer(newTheme as 'light' | 'dark'); },
        },
        {
          icon: Globe,
          label: isAr ? 'اللغة' : 'Language',
          value: language === 'ar' ? 'العربية' : 'English',
          action: () => setLanguage(language === 'ar' ? 'en' : 'ar'),
        },
      ],
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {/* Edit Profile */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{isAr ? 'تعديل الملف الشخصي' : 'Edit Profile'}</h3>
          <div className="relative">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="size-10 rounded-xl overflow-hidden ring-2 ring-nabdh-primary/20 hover:ring-nabdh-primary/40 transition-all group"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="" className="size-full object-cover" />
              ) : (
                <div className="size-full nabdh-gradient flex items-center justify-center">
                  <span className="text-white font-bold">{(user.name || 'U').charAt(0).toUpperCase()}</span>
                </div>
              )}
            </button>
            <div className="absolute -bottom-0.5 -end-0.5 size-4 rounded-full nabdh-gradient flex items-center justify-center">
              <Camera className="size-2.5 text-white" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{isAr ? 'الاسم' : 'Name'}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={isAr ? 'أدخل اسمك' : 'Enter your name'} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
          <Input value={user.phone} disabled className="opacity-60" />
          <p className="text-[10px] text-muted-foreground mt-1">{isAr ? 'رقم الهاتف لا يمكن تغييره' : 'Phone number cannot be changed'}</p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="text" inputMode="email" placeholder={isAr ? 'اختياري' : 'Optional'} />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full nabdh-gradient text-white gap-1.5">
          {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
          {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : saved ? (isAr ? 'تم الحفظ' : 'Saved') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
        </Button>
      </motion.div>

      {/* Appearance Settings */}
      {settingSections.map((section) => (
        <motion.div key={section.title} variants={itemVariants} className="glass-card rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-sm">{section.title}</h3>
          {section.items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-nabdh-primary/5 transition-colors text-start"
              >
                <div className="size-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                  <Icon className="size-4 text-nabdh-primary" />
                </div>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.value}</span>
                <ChevronDown className="size-3.5 text-muted-foreground rotate-[-90deg]" />
              </button>
            );
          })}
        </motion.div>
      ))}

      {/* Account Info */}
      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-sm">{isAr ? 'معلومات الحساب' : 'Account Info'}</h3>
        <div className="space-y-2.5">
          {[
            { icon: ShieldCheck, label: isAr ? 'الدور' : 'Role', value: user.role.toLowerCase() === 'admin' ? (isAr ? 'مدير' : 'Admin') : (isAr ? 'عميل' : 'Customer') },
            { icon: Clock, label: isAr ? 'تاريخ التسجيل' : 'Joined', value: formatDate(user.createdAt, isAr) },
            { icon: Crown, label: isAr ? 'مستوى العضوية' : 'Membership', value: getLoyaltyTierConfig(user.loyaltyTier, isAr).label },
          ].map((info) => {
            const Icon = info.icon;
            return (
              <div key={info.label} className="flex items-center gap-3 p-2">
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground flex-1">{info.label}</span>
                <span className="text-sm font-medium">{info.value}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export function UserProfilePage() {
  const { language, direction, t } = useLanguageStore(useShallow((s) => ({ language: s.language, direction: s.direction, t: s.t })));
  const { currentUser, logout, clearAuthView, setAuthView, profileScrollTo, setProfileScrollTo } = useUIStore(useShallow((s) => ({
    currentUser: s.currentUser, logout: s.logout, clearAuthView: s.clearAuthView, setAuthView: s.setAuthView,
    profileScrollTo: s.profileScrollTo, setProfileScrollTo: s.setProfileScrollTo,
  })));
  const isRTL = direction === 'rtl';
  const isAr = language === 'ar';

  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const fetchProfile = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/profile');
      if (res.status === 401) {
        await logout();
        setAuthView('login');
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.user) {
        setError(json.error || (isAr ? 'فشل في تحميل البيانات' : 'Failed to load data'));
        return;
      }
      setData(json.user as UserProfile);
      // Sync avatar/name to global UI store so header stays in sync
      const u = json.user;
      useUIStore.getState().updateCurrentUser({
        avatar: u.avatar || undefined,
        name: u.name || undefined,
        email: u.email || undefined,
      });
    } catch {
      setError(isAr ? 'تعذر الاتصال بالخادم' : 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, isAr, logout, setAuthView]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Auto-scroll to section
  useEffect(() => {
    if (loading || !data) return;
    if (profileScrollTo === 'orders') {
      setActiveTab('orders');
      setProfileScrollTo('top');
    } else if (profileScrollTo === 'addresses') {
      setActiveTab('addresses');
      setProfileScrollTo('top');
    }
  }, [loading, data, profileScrollTo, setProfileScrollTo]);

  const handleLogout = () => { logout(); };
  const handleBackToStore = () => { clearAuthView(); };
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const tabs: { key: ProfileTab; icon: typeof Package; label: string; badge?: number }[] = [
    { key: 'overview', icon: CircleDot, label: isAr ? 'نظرة عامة' : 'Overview' },
    { key: 'orders', icon: Package, label: isAr ? 'الطلبات' : 'Orders', badge: data?.orders.length },
    { key: 'addresses', icon: MapPin, label: isAr ? 'العناوين' : 'Addresses', badge: data?.addresses.length },
    { key: 'wallet', icon: Wallet, label: isAr ? 'المحفظة' : 'Wallet' },
    { key: 'loyalty', icon: Gift, label: isAr ? 'الولاء' : 'Loyalty' },
    { key: 'settings', icon: Settings, label: isAr ? 'الإعدادات' : 'Settings' },
  ];

  /* ─── Loading ──── */
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-full nabdh-gradient flex items-center justify-center">
            <Loader2 className="size-8 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">{isAr ? 'جارٍ تحميل الملف الشخصي...' : 'Loading profile...'}</p>
        </motion.div>
      </div>
    );
  }

  /* ─── Error ──── */
  if (error || !data) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
          <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="size-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">{isAr ? 'حدث خطأ' : 'Something went wrong'}</h2>
          <p className="text-muted-foreground text-sm mb-6">{error || (isAr ? 'لم يتم العثور على البيانات' : 'Data not found')}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={fetchProfile} variant="outline" className="gap-2">{isAr ? 'إعادة المحاولة' : 'Retry'}</Button>
            <Button onClick={handleBackToStore} className="nabdh-gradient text-white gap-2"><Store className="size-4" />{isAr ? 'العودة للمتجر' : 'Back to Store'}</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── Main UI ──── */
  const tierCfg = getLoyaltyTierConfig(data.loyaltyTier, isAr);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="min-h-[calc(100vh-4rem)] py-6 sm:py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* ─── Top Bar ──── */}
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
          <Button onClick={handleBackToStore} variant="ghost" className="gap-2 text-muted-foreground hover:text-nabdh-primary -ms-2">
            <BackArrow className="size-4" />
            <span className="hidden sm:inline">{isAr ? 'العودة للمتجر' : 'Back to Store'}</span>
          </Button>
          <Button onClick={handleLogout} variant="outline" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50">
            <LogOut className="size-4" />
            <span className="hidden sm:inline">{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </Button>
        </motion.div>

        {/* ─── Profile Header ──── */}
        <motion.div variants={itemVariants} className="glass-card rounded-2xl overflow-hidden">
          <div className="relative nabdh-gradient p-5 pb-14">
            <div className="absolute top-0 start-0 size-28 bg-white/5 rounded-full -translate-x-10 -translate-y-10" />
            <div className="absolute bottom-0 end-0 size-20 bg-white/5 rounded-full translate-x-6 translate-y-6" />
            <div className="relative z-10 flex items-center justify-between">
              <h1 className="text-white text-lg sm:text-xl font-bold">{isAr ? 'الملف الشخصي' : 'My Profile'}</h1>
              <Badge className={cn('text-[10px] px-2 py-0.5 border-0 font-semibold', tierCfg.bg, tierCfg.color)}>
                <Crown className="size-3 me-1" />
                {tierCfg.label}
              </Badge>
            </div>
          </div>
          <div className="relative px-5 pb-5">
            <div className="absolute -top-9 start-5">
              {data.avatar ? (
                <div className="size-16 rounded-2xl ring-4 ring-background shadow-xl overflow-hidden">
                  <img src={data.avatar} alt={data.name || 'User'} className="size-full object-cover" onError={(e) => { const el = e.target as HTMLImageElement; el.style.display='none'; const p = el.parentElement; if(p){ p.classList.add('nabdh-gradient','flex','items-center','justify-center'); const s = document.createElement('span'); s.className='text-2xl font-bold text-white'; s.textContent=(data.name||'U').charAt(0).toUpperCase(); p.appendChild(s); }}} />
                </div>
              ) : (
                <div className="size-16 rounded-2xl nabdh-gradient flex items-center justify-center ring-4 ring-background shadow-xl">
                  <span className="text-2xl font-bold text-white">{(data.name || 'U').charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="pt-8 sm:pt-4 sm:ps-20">
              <h2 className="text-lg font-bold">{data.name || (isAr ? 'مستخدم' : 'User')}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5 text-nabdh-primary shrink-0" />
                  <span dir="ltr">{data.phone}</span>
                </div>
                {data.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="size-3.5 text-nabdh-primary shrink-0" />
                    <span>{data.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5 text-nabdh-primary shrink-0" />
                  <span>{isAr ? 'عضو منذ' : 'Since'} {formatDate(data.createdAt, isAr)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Tab Navigation ──── */}
        <motion.div variants={itemVariants} className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <TabButton
              key={tab.key}
              tab={tab.key}
              currentTab={activeTab}
              onClick={() => setActiveTab(tab.key)}
              icon={tab.icon}
              label={tab.label}
              badge={tab.badge}
            />
          ))}
        </motion.div>

        {/* ─── Tab Content ──── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab user={data} isAr={isAr} isRTL={isRTL} onTabChange={setActiveTab} />
            )}
            {activeTab === 'orders' && (
              <OrdersTab orders={data.orders} isAr={isAr} isRTL={isRTL} />
            )}
            {activeTab === 'addresses' && (
              <AddressesTab addresses={data.addresses} userId={data.id} isAr={isAr} onRefresh={fetchProfile} />
            )}
            {activeTab === 'wallet' && (
              <WalletTab balance={data.walletBalance} userId={data.id} isAr={isAr} />
            )}
            {activeTab === 'loyalty' && (
              <LoyaltyTab points={data.loyaltyPoints} tier={data.loyaltyTier} isAr={isAr} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab user={data} isAr={isAr} onRefresh={fetchProfile} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Bottom CTA ──── */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button onClick={handleBackToStore} className="flex-1 nabdh-gradient text-white h-12 text-base font-semibold rounded-xl shadow-lg shadow-nabdh-primary/20 gap-2">
            <Store className="size-5" />
            {isAr ? 'العودة للتسوق' : 'Continue Shopping'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
