'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, Search, Plus, Trash2, Eye, EyeOff, CheckCheck,
  Info, ShoppingCart, Megaphone, Settings2, Loader2,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { useAdminAuthStore } from '@/stores/admin-auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  COLORS,
  LoadingSkeleton,
  ErrorDisplay,
  PaginationControls,
} from '@/components/admin/shared';

// ─── Types ────────────────────────────────────────────────────
interface NotificationRow {
  id: string;
  userId: string | null;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: {
    total: number;
    unread: number;
    broadcast: number;
    sentToday: number;
    byType: Record<string, number>;
  };
}

// ─── Notification type config ─────────────────────────────────
const NOTIF_TYPE_CONFIG: Record<string, { ar: string; en: string; color: string; icon: React.ReactNode }> = {
  info: { ar: 'معلومات', en: 'Info', color: COLORS.active, icon: <Info className="h-3.5 w-3.5" /> },
  order: { ar: 'طلب', en: 'Order', color: COLORS.purple, icon: <ShoppingCart className="h-3.5 w-3.5" /> },
  promo: { ar: 'ترويجي', en: 'Promo', color: COLORS.warning, icon: <Megaphone className="h-3.5 w-3.5" /> },
  system: { ar: 'نظام', en: 'System', color: COLORS.danger, icon: <Settings2 className="h-3.5 w-3.5" /> },
};

// ─── Relative time helper ─────────────────────────────────────
function relativeTime(dateStr: string, lang: 'ar' | 'en'): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);
    if (min < 1) return lang === 'ar' ? 'الآن' : 'Just now';
    if (min < 60) return lang === 'ar' ? `منذ ${min} دقيقة` : `${min}m ago`;
    if (hr < 24) return lang === 'ar' ? `منذ ${hr} ساعة` : `${hr}h ago`;
    if (day < 7) return lang === 'ar' ? `منذ ${day} يوم` : `${day}d ago`;
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-LY' : 'en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

// ─── Create form type ─────────────────────────────────────────
interface CreateForm {
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  type: string;
  recipientMode: 'broadcast' | 'specific';
  userId: string;
}

const EMPTY_FORM: CreateForm = {
  titleAr: '',
  titleEn: '',
  bodyAr: '',
  bodyEn: '',
  type: 'info',
  recipientMode: 'broadcast',
  userId: '',
};

// ─── Notifications View ───────────────────────────────────────
export function NotificationsView() {
  const { t, language } = useLanguageStore();
  const { authFetch } = useAdminAuthStore();
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [page, setPage] = useState(1);

  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_FORM);
  const [deleteNotifId, setDeleteNotifId] = useState<string | null>(null);

  // ─── Data fetching ──────────────────────────────────────────
  const { data, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: ['admin-notifications', search, typeFilter, readFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '15' });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (readFilter) params.set('isRead', readFilter);
      return authFetch(`/api/admin/notifications?${params}`).then((r) => r.json());
    },
  });

  // ─── Mutations ──────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async (form: CreateForm) => {
      const res = await authFetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleAr: form.titleAr,
          titleEn: form.titleEn,
          bodyAr: form.bodyAr,
          bodyEn: form.bodyEn,
          type: form.type,
          userId: form.recipientMode === 'specific' ? form.userId : null,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setShowCreateDialog(false);
      setCreateForm(EMPTY_FORM);
    },
  });

  const toggleReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const res = await authFetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await authFetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setDeleteNotifId(null);
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={String(error)} />;

  const summary = data?.summary ?? { total: 0, unread: 0, broadcast: 0, sentToday: 0 };

  const statCards = [
    { label: t('admin.totalNotifications'), value: summary?.total?.toString() || '0', icon: <Bell className="h-5 w-5" />, color: COLORS.active },
    { label: t('admin.unread'), value: summary?.unread?.toString() || '0', icon: <EyeOff className="h-5 w-5" />, color: COLORS.danger },
    { label: t('admin.broadcast'), value: summary?.broadcast?.toString() || '0', icon: <Megaphone className="h-5 w-5" />, color: COLORS.purple },
    { label: t('admin.sentToday'), value: summary?.sentToday?.toString() || '0', icon: <CheckCheck className="h-5 w-5" />, color: COLORS.success },
  ];

  const typeFilterOptions = [
    { key: '', label: t('admin.all') },
    ...Object.entries(NOTIF_TYPE_CONFIG).map(([key, val]) => ({
      key,
      label: language === 'ar' ? val.ar : val.en,
    })),
  ];

  const readFilterOptions = [
    { key: '', label: t('admin.all') },
    { key: 'false', label: t('admin.unread') },
    { key: 'true', label: t('admin.read') },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="group relative rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02]"
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
              <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>{card.value}</div>
              <div className="text-sm" style={{ color: COLORS.muted }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters + Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: COLORS.muted, [language === 'ar' ? 'right' : 'left']: '12px' }}
          />
          <Input
            placeholder={t('admin.searchNotifications')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={language === 'ar' ? 'pr-10' : 'pl-10'}
            style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {typeFilterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setTypeFilter(opt.key); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: typeFilter === opt.key ? `${COLORS.active}20` : COLORS.surface,
                color: typeFilter === opt.key ? COLORS.active : COLORS.muted,
                border: `1px solid ${typeFilter === opt.key ? `${COLORS.active}40` : COLORS.border}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {readFilterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => { setReadFilter(opt.key); setPage(1); }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: readFilter === opt.key ? `${COLORS.purple}20` : COLORS.surface,
                color: readFilter === opt.key ? COLORS.purple : COLORS.muted,
                border: `1px solid ${readFilter === opt.key ? `${COLORS.purple}40` : COLORS.border}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          {summary.unread > 0 && (
            <Button
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="gap-1.5"
              style={{ backgroundColor: `${COLORS.success}20`, color: COLORS.success, border: `1px solid ${COLORS.success}30` }}
            >
              <CheckCheck className="h-4 w-4" />
              {t('admin.markAllAsRead')}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => { setCreateForm(EMPTY_FORM); setShowCreateDialog(true); }}
            className="gap-1.5"
            style={{ backgroundColor: COLORS.active, color: '#fff' }}
          >
            <Plus className="h-4 w-4" />
            {t('admin.createNotification')}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <Card className="border" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2" style={{ color: COLORS.text }}>
              <Bell className="h-4 w-4" style={{ color: COLORS.active }} />
              {t('admin.notifications')}
            </CardTitle>
            <Badge
              className="text-xs"
              style={{ backgroundColor: `${COLORS.active}20`, color: COLORS.active, border: 'none' }}
            >
              {data?.pagination?.total ?? 0}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {(data?.notifications ?? []).length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-3" style={{ color: COLORS.muted }} />
              <p className="text-sm" style={{ color: COLORS.muted }}>
                {t('admin.noNotifications')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${COLORS.border} transparent` }}>
              {(data?.notifications ?? []).map((notif) => {
                const typeConf = NOTIF_TYPE_CONFIG[notif.type] || NOTIF_TYPE_CONFIG.info;
                return (
                  <div
                    key={notif.id}
                    className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:border-opacity-60"
                    style={{
                      backgroundColor: notif.isRead ? 'transparent' : `${typeConf.color}05`,
                      borderColor: notif.isRead ? COLORS.border : `${typeConf.color}30`,
                    }}
                  >
                    {/* Type icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: `${typeConf.color}15`, color: typeConf.color }}
                    >
                      {typeConf.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold truncate" style={{ color: COLORS.text }}>
                          {language === 'ar' ? notif.titleAr : notif.titleEn}
                        </span>
                        <Badge
                          className="text-[10px] shrink-0"
                          style={{ backgroundColor: `${typeConf.color}20`, color: typeConf.color, border: 'none' }}
                        >
                          {language === 'ar' ? typeConf.ar : typeConf.en}
                        </Badge>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: typeConf.color }} />
                        )}
                      </div>
                      <p className="text-xs line-clamp-2 mb-1.5" style={{ color: COLORS.muted }}>
                        {language === 'ar' ? notif.bodyAr : notif.bodyEn}
                      </p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: COLORS.muted }}>
                        <span>
                          {notif.userId
                            ? t('admin.specificUser')
                            : t('admin.broadcast')}
                        </span>
                        <span>{relativeTime(notif.createdAt, language)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleReadMutation.mutate({ id: notif.id, isRead: !notif.isRead })}
                        className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-white/10"
                        title={notif.isRead ? t('admin.markAsUnread') : t('admin.markAsRead')}
                        style={{ color: notif.isRead ? COLORS.muted : COLORS.success }}
                      >
                        {notif.isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteNotifId(notif.id)}
                        className="p-1.5 rounded-lg transition-colors duration-200 hover:bg-white/10"
                        title={t('common.delete')}
                        style={{ color: COLORS.danger }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && (
        <PaginationControls
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          hasPrev={data.pagination.hasPrev}
          hasNext={data.pagination.hasNext}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => p + 1)}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          CREATE NOTIFICATION DIALOG
          ═══════════════════════════════════════════════════════════ */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { if (!open) setShowCreateDialog(false); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" style={{ backgroundColor: COLORS.bg, borderColor: COLORS.border, color: COLORS.text }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: COLORS.text }}>
              <Bell className="h-5 w-5" style={{ color: COLORS.active }} />
              {t('admin.createNotification')}
            </DialogTitle>
            <DialogDescription style={{ color: COLORS.muted }}>
              {t('admin.enterNotifDetails')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title Arabic */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>
                {t('admin.titleArabic')} <span style={{ color: COLORS.danger }}>*</span>
              </Label>
              <Input
                value={createForm.titleAr}
                onChange={(e) => setCreateForm((f) => ({ ...f, titleAr: e.target.value }))}
                placeholder={t('admin.notifTitleArPlaceholder')}
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
                dir="rtl"
              />
            </div>

            {/* Title English */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>
                {t('admin.titleEnglish')} <span style={{ color: COLORS.danger }}>*</span>
              </Label>
              <Input
                value={createForm.titleEn}
                onChange={(e) => setCreateForm((f) => ({ ...f, titleEn: e.target.value }))}
                placeholder="Notification title in English"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
                dir="ltr"
              />
            </div>

            {/* Body Arabic */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>
                {t('admin.bodyArabic')} <span style={{ color: COLORS.danger }}>*</span>
              </Label>
              <Textarea
                value={createForm.bodyAr}
                onChange={(e) => setCreateForm((f) => ({ ...f, bodyAr: e.target.value }))}
                placeholder={t('admin.notifBodyArPlaceholder')}
                rows={3}
                dir="rtl"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>

            {/* Body English */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>
                {t('admin.bodyEnglish')} <span style={{ color: COLORS.danger }}>*</span>
              </Label>
              <Textarea
                value={createForm.bodyEn}
                onChange={(e) => setCreateForm((f) => ({ ...f, bodyEn: e.target.value }))}
                placeholder="Notification body in English"
                rows={3}
                dir="ltr"
                style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>{t('admin.notificationType')}</Label>
              <Select value={createForm.type} onValueChange={(v) => setCreateForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="w-full" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
                  {Object.entries(NOTIF_TYPE_CONFIG).map(([key, val]) => (
                    <SelectItem key={key} value={key} style={{ color: COLORS.text }}>
                      {language === 'ar' ? val.ar : val.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <Label style={{ color: COLORS.muted }}>{t('admin.recipient')}</Label>
              <Select value={createForm.recipientMode} onValueChange={(v) => setCreateForm((f) => ({ ...f, recipientMode: v as 'broadcast' | 'specific', userId: '' }))}>
                <SelectTrigger className="w-full" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
                  <SelectItem value="broadcast" style={{ color: COLORS.text }}>
                    {t('admin.broadcastToAll')}
                  </SelectItem>
                  <SelectItem value="specific" style={{ color: COLORS.text }}>
                    {t('admin.specificUser')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {createForm.recipientMode === 'specific' && (
              <div className="space-y-2">
                <Label style={{ color: COLORS.muted }}>{t('admin.userId')}</Label>
                <Input
                  value={createForm.userId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, userId: e.target.value }))}
                  placeholder="user_id"
                  style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }}
                  dir="ltr"
                />
              </div>
            )}
          </div>

          {createMutation.error && (
            <div className="text-xs p-2.5 rounded-lg" style={{ backgroundColor: `${COLORS.danger}15`, color: COLORS.danger, border: `1px solid ${COLORS.danger}30` }}>
              {createMutation.error.message}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={createMutation.isPending}
              style={{ borderColor: COLORS.border, color: COLORS.muted }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => createMutation.mutate(createForm)}
              disabled={createMutation.isPending || !createForm.titleAr.trim() || !createForm.titleEn.trim() || !createForm.bodyAr.trim() || !createForm.bodyEn.trim()}
              className="transition-all duration-300"
              style={{ backgroundColor: createMutation.isPending ? COLORS.muted : COLORS.active, color: '#fff' }}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Bell className="h-4 w-4 mr-1.5" />}
              {createMutation.isPending ? t('admin.sending') : t('admin.sendNotification')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════
          DELETE NOTIFICATION CONFIRMATION
          ═══════════════════════════════════════════════════════════ */}
      <AlertDialog open={!!deleteNotifId} onOpenChange={() => setDeleteNotifId(null)}>
        <AlertDialogContent style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: COLORS.text }}>
              {t('admin.deleteNotification')}
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: COLORS.muted }}>
              {t('admin.deleteNotifConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ borderColor: COLORS.border, color: COLORS.text, backgroundColor: COLORS.bg }}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteNotifId && deleteMutation.mutate(deleteNotifId)}
              disabled={deleteMutation.isPending}
              style={{ backgroundColor: COLORS.danger, color: '#fff' }}
            >
              {deleteMutation.isPending ? t('common.loading') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
