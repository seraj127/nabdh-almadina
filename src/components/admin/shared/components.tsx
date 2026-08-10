'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { COLORS, STATUS_COLORS } from './constants';
import { useLanguageStore } from '@/stores/language-store';

export function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguageStore();
  const color = STATUS_COLORS[status] || COLORS.muted;
  const label = t(`order.${status}`) || status;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl cc-skeleton"
            style={{ backgroundColor: COLORS.surface }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-80 rounded-xl cc-skeleton"
            style={{ backgroundColor: COLORS.surface }}
          />
        ))}
      </div>
    </div>
  );
}

export function ErrorDisplay({ message }: { message: string }) {
  const { t } = useLanguageStore();
  return (
    <div
      className="flex flex-col items-center justify-center py-12 gap-3 rounded-xl border animate-slide-in"
      style={{
        backgroundColor: `${COLORS.danger}10`,
        borderColor: `${COLORS.danger}30`,
      }}
    >
      <AlertTriangle className="h-8 w-8 animate-bounce" style={{ color: COLORS.danger }} />
      <p className="text-sm font-medium" style={{ color: COLORS.danger }}>
        {t('common.error')}
      </p>
      <p className="text-xs" style={{ color: COLORS.muted }}>
        {message}
      </p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div
      className="group relative rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] cc-stat-card"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
      }}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `0 0 20px ${color}20, 0 0 40px ${color}10`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {icon}
          </div>
          {trend && (
            <div
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: trendUp ? COLORS.success : COLORS.danger }}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>
          {value}
        </div>
        <div className="text-sm" style={{ color: COLORS.muted }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function PaginationControls({
  page,
  totalPages,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useLanguageStore();
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: COLORS.muted }}>
        {t('admin.page')} {page} / {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 hover:brightness-110 active:scale-[0.97]"
          style={{
            borderColor: COLORS.border,
            color: COLORS.text,
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {t('admin.previous')}
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 hover:brightness-110 active:scale-[0.97]"
          style={{
            borderColor: COLORS.border,
            color: COLORS.text,
            backgroundColor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
