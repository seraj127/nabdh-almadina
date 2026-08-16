# Architecture — نبض المدينة (C4-light)

> يُكمّل ADR-001. وصف معماري موجز بنمط C4 المستويات 1–3.

## Context (المستوى 1)

```
[عميل ويب] ─┐
[تطبيق موبايل (APK / WebView)] ─┤──> [Vercel: Next.js 16 (App Router + API Routes)]
                              └──> https://nabdh-almadina.vercel.app
                                         │
                                         ├──> [Supabase Postgres (Prisma)]
                                         ├──> [Supabase Storage (الـAPK)]
                                         └──> [خدمات خارجية: بوابة دفع، SMTP، إلخ]
```

- **المصادقة:** جلسة cookie httpOnly (`session_token` / `admin_session`) عبر JWT (`jose`) — لا تسريب توكنات في localStorage.
- **الـAPK:** WebView Capacitor يعيد توجيه `/api/*` عبر `src/lib/api-bridge.ts` إلى الخادم الحي.

## Containers (المستوى 2)

| الحاوية | المسؤولية | التقنية |
|---|---|---|
| متجر ويب | عرض المنتجات/السلة/الطلبات/المفضلة/الحساب | React + Zustand (`src/components/store`, `src/stores`) |
| عرض الموبايل | واجهة تطبيق داخل نفس الحزمة | React + Zustand (`src/components/mobile`) |
| لوحة الأدمن | إدارة الكتالوج/الطلبات/المالية | `src/components/admin*` + `src/app/api/admin/*` |
| API Routes | منطق الأعمال الخادمي | Next.js Route Handlers (`src/app/api/*`) |
| قاعدة البيانات | التخزين الدائم | Supabase Postgres عبر Prisma |

## Components (المستوى 3 — أمثلة حرجة)

- **المفضلة:** `src/lib/favorites.service.ts` (منطق) ← `src/app/api/favorites/route.ts` (HTTP) ← `src/stores/favorites-store.ts` (عميل). المزامنة بنية صريحة (POST/DELETE) idempotent؛ الخادم مصدر الحقيقة.
- **الجلسة:** `src/lib/jwt-session.ts` + `src/lib/auth-utils.ts` (requireAuth) + `src/stores/ui-store.ts` (حالة موحّدة ويب/موبايل).
- **الإعدادات/اللغة:** `src/stores/language-store.ts` (حالة) + `src/lib/i18n/translations.ts` (بيانات) + `PATCH /api/auth/profile`.

## حدود البيانات والأمان

- **Supabase** هو مصدر الحقيقة الوحيد؛ لا نسخ محلية رسمية.
- حدود الأمان: `requireAuth` على كل نقطة محمية، فحص أدوار للأدمن، rate-limit للمصادقة، `HttpOnly/SameSite` للكوكيز.
- **الـAPK:** يُخدَّم من Supabase Storage (رابط ثابت) — لا اعتماد على مجلد `public` في نشرات git.

## Deployment

- **Vercel:** نشر يدوي (CLI) + تكامل git (يُنشر تلقائياً مع الـpush).
- **قاعدة الإنتاج:** Supabase عبر `SUPABASE_DATABASE_URL` (pooler).
- **التغييرات الهيكلية:** عبر `prisma/migrations` فقط (راجع MIGRATION_README.md).
