'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface HealthCheck {
  supabase: {
    configured: boolean;
    url: string;
    anonKey: string;
    databaseUrl: string;
    serviceRoleKey: string;
  };
  database: {
    provider: string;
    supabaseEnabled: boolean;
    connectionUrl: string;
  };
  steps: string[];
}

export function SupabaseSetupPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  async function fetchHealth() {
    try {
      const res = await fetch('/api/supabase/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/supabase/test-connection');
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, message: 'فشل الاتصال بالخادم' });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1120' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري التحقق من حالة Supabase...</p>
        </div>
      </div>
    );
  }

  const isConfigured = health?.supabase.configured ?? false;

  return (
    <div className="min-h-screen" style={{ background: '#0B1120' }} dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3ECF8E, #1a9f68)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M21.375 12.375L12 21.75L2.625 12.375C1.925 11.675 1.925 10.575 2.625 9.875L10.375 2.125C11.075 1.425 12.175 1.425 12.875 2.125L20.625 9.875C21.325 10.575 21.325 11.675 21.375 12.375Z" fill="white" opacity="0.8"/>
                <path d="M12 21.75L2.625 12.375C1.925 11.675 1.925 10.575 2.625 9.875L10.375 2.125C11.075 1.425 12.175 1.425 12.875 2.125L12 21.75Z" fill="white"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">إعداد Supabase</h1>
              <p className="text-gray-400 text-sm">ربط نبض المدينة بقاعدة بيانات Supabase السحابية</p>
            </div>
            <Badge
              className="mr-auto text-sm"
              style={{
                background: isConfigured ? 'rgba(62, 207, 142, 0.15)' : 'rgba(251, 146, 60, 0.15)',
                color: isConfigured ? '#3ECF8E' : '#FB923C',
                border: `1px solid ${isConfigured ? 'rgba(62, 207, 142, 0.3)' : 'rgba(251, 146, 60, 0.3)'}`
              }}
            >
              {isConfigured ? '✅ متصل' : '⚠️ غير مُعد'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card style={{ background: '#111827', borderColor: '#1F2937' }}>
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">مزود قاعدة البيانات</CardDescription>
              <CardTitle className="text-white text-lg">
                {health?.database.provider === 'supabase' ? 'Supabase PostgreSQL' : 'SQLite محلي'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card style={{ background: '#111827', borderColor: '#1F2937' }}>
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">رابط الاتصال</CardDescription>
              <CardTitle className="text-white text-sm font-mono truncate">
                {health?.database.connectionUrl || '(غير محدد)'}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card style={{ background: '#111827', borderColor: '#1F2937' }}>
            <CardHeader className="pb-2">
              <CardDescription className="text-gray-400">حالة التكوين</CardDescription>
              <CardTitle className="text-lg" style={{ color: isConfigured ? '#3ECF8E' : '#FB923C' }}>
                {isConfigured ? 'جاهز للإنتاج' : 'يحتاج إعداد'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Configuration Details */}
        <Card style={{ background: '#111827', borderColor: '#1F2937' }}>
          <CardHeader>
            <CardTitle className="text-white">تفاصيل التكوين</CardTitle>
            <CardDescription className="text-gray-400">معلومات اتصال Supabase الحالية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ConfigRow label="NEXT_PUBLIC_SUPABASE_URL" value={health?.supabase.url} />
            <ConfigRow label="NEXT_PUBLIC_SUPABASE_ANON_KEY" value={health?.supabase.anonKey} />
            <ConfigRow label="SUPABASE_DATABASE_URL" value={health?.supabase.databaseUrl} />
            <ConfigRow label="SUPABASE_SERVICE_ROLE_KEY" value={health?.supabase.serviceRoleKey} />
          </CardContent>
        </Card>

        {/* Test Connection */}
        <Card style={{ background: '#111827', borderColor: '#1F2937' }}>
          <CardHeader>
            <CardTitle className="text-white">اختبار الاتصال</CardTitle>
            <CardDescription className="text-gray-400">تحقق من أن الاتصال بـ Supabase يعمل بشكل صحيح</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testConnection}
              disabled={!isConfigured || testing}
              className="w-full md:w-auto"
              style={{
                background: isConfigured ? 'linear-gradient(135deg, #3ECF8E, #1a9f68)' : '#374151',
                color: isConfigured ? 'white' : '#6B7280'
              }}
            >
              {testing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الاختبار...
                </span>
              ) : (
                '🔍 اختبار الاتصال'
              )}
            </Button>
            {testResult && (
              <div
                className="mt-4 p-4 rounded-lg text-sm"
                style={{
                  background: testResult.success ? 'rgba(62, 207, 142, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${testResult.success ? 'rgba(62, 207, 142, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  color: testResult.success ? '#3ECF8E' : '#EF4444'
                }}
              >
                {testResult.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <Card style={{ background: '#111827', borderColor: '#1F2937' }}>
          <CardHeader>
            <CardTitle className="text-white">
              {isConfigured ? '✅ خطوات مكتملة' : '📋 خطوات الإعداد'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isConfigured
                ? 'تم تكوين Supabase بنجاح! تأكد من تنفيذ SQL migration'
                : 'اتبع هذه الخطوات لربط المشروع بـ Supabase'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {health?.steps.map((step, i) => (
              <div
                key={i}
                className="p-3 rounded-lg text-sm whitespace-pre-wrap"
                style={{ background: '#0B1120', color: '#D1D5DB' }}
              >
                {step}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Migration Files */}
        <Card style={{ background: '#111827', borderColor: '#1F2937' }}>
          <CardHeader>
            <CardTitle className="text-white">📁 ملفات الترحيل</CardTitle>
            <CardDescription className="text-gray-400">ملفات SQL لتشغيلها في Supabase SQL Editor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <MigrationFile
              name="001_initial_schema.sql"
              path="supabase/migrations/001_initial_schema.sql"
              description="إنشاء جميع الجداول والفهارس وسياسات الأمان (RLS) - 30 جدول"
            />
            <Separator style={{ background: '#1F2937' }} />
            <MigrationFile
              name="seed.sql"
              path="supabase/seed.sql"
              description="بذر قاعدة البيانات ببيانات ليبيا حقيقية - أقسام، منتجات، مناطق توصيل"
            />
          </CardContent>
        </Card>

        {/* Features */}
        <Card style={{ background: '#111827', borderColor: '#1F2937' }}>
          <CardHeader>
            <CardTitle className="text-white">✨ مميزات Supabase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureItem
                icon="🔐"
                title="مصادقة آمنة"
                description="OTP عبر الهاتف، Google OAuth، إدارة جلسات آمنة"
              />
              <FeatureItem
                icon="📊"
                title="PostgreSQL قوي"
                description="قاعدة بيانات علائقية قابلة للتوسع مع JSONB و RLS"
              />
              <FeatureItem
                icon="📁"
                title="تخزين ملفات"
                description="رفع صور المنتجات والإيصالات مع CDN مدمج"
              />
              <FeatureItem
                icon="⚡"
                title="Realtime"
                description="تحديثات فورية للإشعارات وتتبع الطلبات"
              />
              <FeatureItem
                icon="🛡️"
                title="Row Level Security"
                description="حماية البيانات على مستوى الصفوف"
              />
              <FeatureItem
                icon="🔄"
                title="مزامنة تلقائية"
                description="مزامنة بين الموبايل والويب في الوقت الحقيقي"
              />
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card style={{ background: '#111827', borderColor: '#1F2937' }}>
          <CardHeader>
            <CardTitle className="text-white">🏗️ هيكل التكامل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg p-4 font-mono text-sm" style={{ background: '#0B1120', color: '#D1D5DB', direction: 'ltr' }}>
              <pre>{`┌─────────────────────────────────────────────────┐
│              City Pulse / نبض المدينة            │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  المتجر   │  │  الموبايل │  │ لوحة تحكم│      │
│  │  (Store)  │  │ (Mobile)  │  │  (Admin)  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │              │              │              │
│       └──────────────┼──────────────┘              │
│                      │                              │
│              ┌───────┴───────┐                      │
│              │  Next.js API  │                      │
│              │    Routes     │                      │
│              └───────┬───────┘                      │
│                      │                              │
│         ┌────────────┼────────────┐                │
│         │            │            │                 │
│    ┌────┴────┐ ┌────┴────┐ ┌────┴────┐           │
│    │ Prisma  │ │Supabase │ │Supabase │           │
│    │  ORM    │ │  Auth   │ │ Storage │           │
│    └────┬────┘ └────┬────┘ └────┬────┘           │
│         │            │            │                 │
│         └────────────┼────────────┘                │
│                      │                              │
│              ┌───────┴───────┐                      │
│              │   Supabase    │                      │
│              │  PostgreSQL   │                      │
│              └───────────────┘                      │
└─────────────────────────────────────────────────┘`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => { window.location.hash = ''; }}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            ← العودة للمتجر
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value?: string }) {
  const isSet = value?.includes('✅');
  return (
    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: '#0B1120' }}>
      <code className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{label}</code>
      <span className="text-sm" style={{ color: isSet ? '#3ECF8E' : '#FB923C' }}>{value}</span>
    </div>
  );
}

function MigrationFile({ name, path, description }: { name: string; path: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(62, 207, 142, 0.15)' }}>
        <span className="text-lg">📄</span>
      </div>
      <div>
        <p className="text-white font-medium text-sm">{name}</p>
        <p className="text-gray-500 text-xs font-mono">{path}</p>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: '#0B1120' }}>
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-white font-medium text-sm">{title}</p>
        <p className="text-gray-400 text-xs mt-0.5">{description}</p>
      </div>
    </div>
  );
}
