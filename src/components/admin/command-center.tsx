'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Zap,
  Tag,
  Star,
  FileText,
  LogOut,
  User,
  Bell,
  Warehouse,
  FolderTree,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import {
  type ViewType,
  COLORS,
} from '@/components/admin/shared';
import {
  DashboardView,
  ProductsView,
  OrdersView,
  FinancialView,
  CustomersView,
  LogisticsView,
  WalletLoyaltyView,
  AnalyticsView,
  SettingsView,
  CouponsView,
  ReviewsView,
  AuditLogView,
  NotificationsView,
  InventoryView,
  SubcategoriesView,
} from '@/components/admin/views';
import { AdminLogin } from '@/components/admin/admin-login';
import { useRealtimeSync } from '@/hooks/use-realtime-sync';

// ─── Main Component ──────────────────────────────────────────
export function CommandCenter() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toggleAdminMode } = useUIStore();
  const { t, language } = useLanguageStore();
  const { isAuthenticated, user, logout } = useAdminAuthStore();
  const isRTL = language === 'ar';

  // Real-time sync for admin dashboard
  useRealtimeSync({
    userId: user?.id || '',
    role: 'admin',
    onNewOrder: () => {
      // New order received — admins will see it on next data refetch
    },
    onOrderStatusChanged: () => {
      // Order status changed — orders list will auto-refetch
    },
    onRefreshStats: () => {
      // Dashboard stats refresh triggered
    },
  });

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const navItems: { key: ViewType; icon: React.ReactNode; label: string }[] = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: t('admin.dashboard'),
    },
    {
      key: 'products',
      icon: <Package className="h-5 w-5" />,
      label: t('admin.products'),
    },
    {
      key: 'orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      label: t('admin.orders'),
    },
    {
      key: 'financial',
      icon: <DollarSign className="h-5 w-5" />,
      label: t('admin.financial'),
    },
    {
      key: 'customers',
      icon: <Users className="h-5 w-5" />,
      label: t('admin.customers'),
    },
    {
      key: 'logistics',
      icon: <Truck className="h-5 w-5" />,
      label: t('admin.logistics'),
    },
    {
      key: 'walletLoyalty',
      icon: <Wallet className="h-5 w-5" />,
      label: t('admin.walletLoyalty'),
    },
    {
      key: 'coupons',
      icon: <Tag className="h-5 w-5" />,
      label: t('admin.coupons'),
    },
    {
      key: 'reviews',
      icon: <Star className="h-5 w-5" />,
      label: t('admin.reviews'),
    },
    {
      key: 'analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      label: t('admin.analytics'),
    },
    {
      key: 'auditLog',
      icon: <FileText className="h-5 w-5" />,
      label: t('admin.auditLog'),
    },
    {
      key: 'notifications',
      icon: <Bell className="h-5 w-5" />,
      label: t('admin.notifications'),
    },
    {
      key: 'inventory',
      icon: <Warehouse className="h-5 w-5" />,
      label: t('admin.inventory'),
    },
    {
      key: 'subcategories',
      icon: <FolderTree className="h-5 w-5" />,
      label: language === 'ar' ? 'التصنيفات الفرعية' : 'Subcategories',
    },
    {
      key: 'settings',
      icon: <Settings className="h-5 w-5" />,
      label: t('admin.settings'),
    },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'products': return <ProductsView />;
      case 'orders': return <OrdersView />;
      case 'financial': return <FinancialView />;
      case 'customers': return <CustomersView />;
      case 'logistics': return <LogisticsView />;
      case 'walletLoyalty': return <WalletLoyaltyView />;
      case 'coupons': return <CouponsView />;
      case 'reviews': return <ReviewsView />;
      case 'analytics': return <AnalyticsView />;
      case 'auditLog': return <AuditLogView />;
      case 'notifications': return <NotificationsView />;
      case 'inventory': return <InventoryView />;
      case 'subcategories': return <SubcategoriesView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="cc-dark min-h-screen flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-60'
        } flex flex-col border-r transition-all duration-300 shrink-0`}
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
        }}
      >
        {/* Logo / Title */}
        <div
          className="h-14 flex items-center gap-3 px-3 border-b shrink-0"
          style={{ borderColor: COLORS.border }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: COLORS.active }}
          >
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span
              className="font-bold text-sm truncate"
              style={{ color: COLORS.text }}
            >
              {t('nav.admin')}
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 flex flex-col gap-1 px-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cc-nav-item ${
                  isActive ? 'cc-nav-item-active' : ''
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                style={{
                  backgroundColor: isActive ? `${COLORS.active}20` : 'transparent',
                  color: isActive ? COLORS.active : COLORS.muted,
                  border: isActive ? `1px solid ${COLORS.active}30` : '1px solid transparent',
                }}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span
                  className={`shrink-0 transition-all duration-200 ${
                    isActive ? 'drop-shadow-[0_0_6px_rgba(88,166,255,0.5)]' : ''
                  }`}
                >
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-2 py-2 border-t" style={{ borderColor: COLORS.border }}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors cc-btn-action"
            style={{ color: COLORS.muted }}
          >
            {sidebarCollapsed ? (
              isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            ) : (
              isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && user && (
          <div
            className="mx-2 mb-2 p-2 rounded-lg flex items-center gap-2"
            style={{ backgroundColor: `${COLORS.border}20` }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${COLORS.active}30` }}
            >
              <User className="h-3.5 w-3.5" style={{ color: COLORS.active }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: COLORS.text }}>
                {user.name === 'مدير النظام' ? t('admin.systemAdmin') : user.name}
              </p>
              <p className="text-[10px] truncate" style={{ color: COLORS.muted }}>
                {user.role === 'admin' ? t('admin.systemAdminRole') : user.role}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-2 pb-3 space-y-1">
          {/* Logout */}
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cc-btn-logout ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            style={{
              backgroundColor: `${COLORS.warning || '#F59E0B'}15`,
              color: COLORS.warning || '#F59E0B',
              border: `1px solid ${COLORS.warning || '#F59E0B'}30`,
            }}
            title={sidebarCollapsed ? t('auth.logout') : undefined}
          >
            <LogOut className={`h-4 w-4 shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">{t('auth.logout')}</span>
            )}
          </button>

          {/* Back to Store */}
          <button
            onClick={toggleAdminMode}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cc-btn-back ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            style={{
              backgroundColor: `${COLORS.danger}15`,
              color: COLORS.danger,
              border: `1px solid ${COLORS.danger}30`,
            }}
            title={sidebarCollapsed ? t('admin.backToStore') : undefined}
          >
            <ArrowLeft className={`h-4 w-4 shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">{t('admin.backToStore')}</span>
            )}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header
          className="h-14 flex items-center justify-between px-6 border-b shrink-0"
          style={{
            backgroundColor: COLORS.surface,
            borderColor: COLORS.border,
          }}
        >
          <h1 className="text-lg font-bold" style={{ color: COLORS.text }}>
            {navItems.find((n) => n.key === activeView)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full cc-live-dot"
              style={{ backgroundColor: COLORS.success }}
            />
            <span className="text-xs" style={{ color: COLORS.muted }}>
              {language === 'ar' ? 'مباشر' : 'Live'}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div
          className="flex-1 overflow-y-auto p-6 custom-scrollbar cc-content"
          style={{ backgroundColor: COLORS.bg }}
        >
          {renderView()}
        </div>
      </main>
    </div>
  );
}
