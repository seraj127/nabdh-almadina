# نبض المدينة | Nabdh Al-Madina

منصة تجارة إلكترونية متكاملة للصيدليات والعطارة، تشمل متجر ويب وتطبيق جوال وأدوات إدارة.

## المميزات

- **متجر ويب** (Next.js 16) — تصفح المنتجات، سلة الشراء، الطلبات، المفضلة، الدفع
- **تطبيق جوال** (Capacitor + React Native Web) — تجربة محمولة كاملة
- **لوحة تحكم** — إدارة المنتجات، الطلبات، المخزون، الكوبونات، العملاء، الشحن، التقارير المالية
- **نظام شحن** — شركات شحن، مناطق توصيل، تتبع شحنات
- **نقاط ومكافآت** — برنامج ولاء للعملاء
- **اشعارات** — إشعارات فورية

## التقنيات

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** SQLite (تطوير) / PostgreSQL (إنتاج) عبر Supabase
- **Mobile:** Capacitor 8, Expo, React Native Web
- **Other:** Zustand, React Query, Socket.IO, Recharts

## التشغيل

```bash
bun install        # تثبيت الاعتماديات
bun run db:push    # إنشاء قاعدة البيانات
bun run dev        # تشغيل خادم التطوير على :3000
```

## النسخة الجوالة (APK)

```bash
npm run apk:debug    # بناء APK للاختبار
npm run apk:release  # بناء APK للإنتاج
```

## المجلدات الرئيسية

| المسار | الوصف |
| ------ | ------ |
| `src/app` | صفحات التطبيق و API routes |
| `src/components/store` | مكونات المتجر |
| `src/components/mobile` | مكونات التطبيق الجوال |
| `src/components/admin` | لوحة التحكم |
| `prisma` | مخطط قاعدة البيانات والبذور |
| `supabase` | مخططات ومنابع Supabase |
| `android` | مشروع أندرويد (Capacitor) |
