# أدلة التحقق من النسخة المصلحة

| الفحص | النتيجة |
|---|---|
| `tsc --noEmit` | 0 — نجاح |
| `npm run test:run` | 8 ملفات، 31 اختبارًا ناجحًا |
| `npm run lint` | 0 أخطاء، 41 تحذيرًا غير حاجب |
| `npm run build` | نجاح بمتغيرات بيئة اختبارية خارج الملفات |
| `npm run build:mobile` | نجاح مع `CAPACITOR_SERVER_URL` HTTPS تجريبي و`npx cap sync android` |
| تشغيل `/api/products` محليًا | 200 |
| تشغيل `/api/categories` محليًا | 200 |
| `/api/admin/dashboard` بلا جلسة | 401 |
| POST/PUT شركات الشحن بلا جلسة | 401 |
| `/api/supabase/health` | 200 دون connection URL أو service-role status |
| Socket.IO بلا JWT | مرفوض: `Authentication required` |
| Socket.IO مع JWT اختبار صالح | متصل في وضع الاختبار؛ في الإنتاج يلزم `SYNC_SESSION_CHECK_URL` |
| markers الأسرار القديمة | 0 تطابقات في المصدر المفحوص |
| الملفات الحساسة | `.env`, `.env.local`, و`android/nabd-release-key.jks` غير موجودة في نسخة التسليم |
| npm audit بعد تحديث sharp | 14 High و8 Moderate متبقية؛ أغلبها يتطلب ترقية Expo/Prisma كبرى |

## أوامر البناء والتشغيل

```text
npm ci
npm run db:generate
npm run test:run
npm run lint
JWT_SECRET=<secret> DATABASE_URL=file:/tmp/build.db npm run build
CAPACITOR_SERVER_URL=https://your-app.example JWT_SECRET=<secret> DATABASE_URL=file:/tmp/build.db npm run build:mobile
```

لا توجد قيم أسرار فعلية في هذا الملف أو في أرشيف التسليم. يجب إنشاء `.env` محليًا من `.env.example` عبر مدير أسرار، وتدوير كل القيم التي كانت موجودة في الأرشيف القديم قبل أي نشر.
