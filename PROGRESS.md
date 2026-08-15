# سجل التقدم — نبض المدينة

## جلسة (15 أغسطس 2026): إصلاح المشروع محلياً + استعادة تحميل الـAPK

### المشكلة: "التطبيق على الموبايل توقف"
- **السبب:** تكامل Vercel مع git ينشر تلقائياً مع كل رفع للكود (`git push`). النشر القادم من git **لا يحتوي الـAPK** لأنه متجاهل في git (`*.apk`) → أصبح `/nabd-al-madina.apk` يعيد 404 → توقف تحميل/تحديث التطبيق.
- **الإصلاح الفوري:** إعادة نشر عبر CLI (`vercel --prod`) → النشر `l4xb6zjai` يضم الـAPK → عاد 200 (27,860,253 بايت).

### الإصلاح المحلي (كان المشروع لا يعمل)
- الأسباب: `node_modules` تالف (ملفات next ناقصة + ثنائي SWC + framer-motion) + خادم إنتاج قديم يحتكر بورت 3000 + عميل Prisma غير مولّد.
- الإصلاح: حذف كامل وإعادة `npm install` + `prisma generate` + إعادة تشغيل → الموقع يعمل محلياً على `localhost:3000` (home/products/categories كلها 200).
- خطأ ذاتي تم اكتشافه: `cmd /c "npm install *> log"` كان يمرر `*` لـnpm → خطأ `*@*`؛ يُستدعى عبر `npm.cmd`.

### متبقٍ
- **قرار ضروري من المالك:** منع نشر git من حذف الـAPK مستقبلاً:
  - (أ) رفع الـAPK في git (الرفع فشل هنا HTTP 408 لملف 27MB — يمكن رفعه من جهاز المالك)، أو
  - (ب) تعطيل تكامل Vercel مع git من لوحة التحكم (يُبقي نشر CLI فقط)، أو
  - (ج) CI/CD ينشر الـAPK كـGitHub Release.
- أمن مفتاح التوقيع (`nabd-release-key.jks` + كلمة المرور مكشوفة في git).
- رفع ملف CI/CD (`workflow` scope في التوكن).
- اختبار الـAPK الجديد على الجهاز.
- التنظيف: نصوص/سجلات مؤقتة في `D:\temp\opencode` و`dev-server.log`/`npm-install.log`/`deploy*.log` في جذر المشروع.

---

## جلسة سابقة (15 أغسطس 2026): توحيد الجلسة ويب↔موبايل

### المشكلة
حساب موقع الويب (`useUIStore.currentUser`) منفصل عن حساب واجهة الموبايل (`mobile_user`) — لو سُجّل الدخول في الويب وفتحت واجهة الموبايل تظهر كضيف، وتختل مفاضل الموبايل.

### الإصلاح (منشور + APK معاد بناؤه)
- مصدر الحقيقة الوحيد للجلسة = `useUIStore.currentUser`.
- `sync-bridge.ts`: دالة جديدة `syncWebUserToMobile(user)` — تنسخ مستخدم الويب للموبايل (مع صيغة هاتف محلية `0...` عبر `toLocalPhone` المصدَّر الآن) وتحوّل شاشة الموبايل إلى `main` إن كانت شاشة تسجيل.
- `ui-store.login`: يستخدم الدالة بدل الكتلة الداخلية.
- `ui-store.rehydrate`: عند نجاح التحقق من الجلسة يزامن المستخدم مع الموبايل.
- `mobile-store.initMobileStore`: يتبنى مستخدم الويب إن لم يوجد مطابق، ويجلب بياناته (بروفايل/عناوين/طلبات/مفضلة/سلة) بناءً على المستخدم الفعلي.

### النشر
- Vercel: النشر `4q44yqtur` READY ومرتبط بالاسم `nabdh-almadina.vercel.app`.
- الـAPK أُعيد بناؤه (9:34 ص، JDK 21) ونُشر — `Content-Length: 27860253` (200) من `/nabd-al-madina.apk`.

### أدوات مؤقتة
- `D:\temp\opencode\deploy*.log`, `D:\temp\opencode\apk-head.log` (سجلات نشر/فحص).

---

## جلسة سابقة (14 أغسطس 2026): إصلاح مزامنة المفضلة

### المشكلة
منتج يُضاف للمفضلة على موقع الويب لا يظهر في مفضلة الموبايل، والمزامنة بين الطرفين معطلة.

### الأسباب الجذرية (3)
1. **الويب:** زر القلب كان يرسل `POST /api/favorites/toggle` (تبديل حالة الخادم). عند انحراف الحالة المحلية عن الخادم (مزامنة/جهاز آخر/تخزين قديم) كانت "الإضافة" تحذف من الخادم → العداد 1 والصفحة فارغة.
2. **الموبايل:** شاشة المفضلة كانت تعرض فقط منتجات أول 20 في التغذية، و`cleanupOrphanedFavorites` كان يحذف المفاضل خارجها (خاصة الضيوف).
3. **الـAPK:** كان يعمل بكود قديم خالٍ من الإصلاحات.

### الإصلاحات (كلها منشورة على Vercel)
- `favorites-store.ts` (ويب): نية صريحة `POST` إضافة / `DELETE` إزالة بدل toggle؛ `syncIds` لم يعد يُعلّم تعديلاً محلياً؛ `clearFavorites` يدفع للخادم.
- `api/favorites/route.ts`: `POST` أصبح idempotent عبر `createMany skipDuplicates`.
- `mobile-store.ts`: حالة `favoriteProducts` تُجلب من `/api/favorites?includeProducts=true` بكل التفاصيل؛ للضيوف جلب بالمعرّف من `/api/products/[id]` العام؛ أُزيل الاستدعاء المدمر لـ`cleanupOrphanedFavorites` من التهيئة.
- `favorites-screen.tsx`: تعرض `favoriteProducts` بدل `products.filter(...)` + تحديث عند فتح التبويب.
- `sync-bridge.ts` + `mobile-app.tsx`: مزامنة ويب↔موبايل + تمرير `favoriteProducts`.

### الـAPK
- أُعيد بناؤه بالكود الجديد عبر **JDK 21** (الافتراضي 17 يفشل بـ`invalid source release: 21`).
- مسار البناء: `D:\temp\opencode\apk-src\apk-build` (سكربت `apk:release`).
- ملف APK المثبّت: `android\app\build\outputs\apk\release\app-release.apk`.
- نُسخ إلى `public/nabd-al-madina.apk` في الريبو الحي وهو متاح للتحميل من:
  `https://nabdh-almadina.vercel.app/nabd-al-madina.apk`

### النشر والحسابات
- المشروع: Vercel `hoorperfum-2998s-projects/nabdh-almadina` → `https://nabdh-almadina.vercel.app`
- قاعدة الإنتاج: **Supabase** (المشروع `bqcymuoednrbtdywwmwz`) عبر `SUPABASE_DATABASE_URL`.
- حساب اختبار: `+218910000001/admin123` (أدمن، id `d1000001-0000-0000-0000-000000000001`).
- GitHub: `seraj127/nabdh-almadina` — آخر رفع `bcc529e` (مزامنة المفضلة والإعدادات).
- الفحص الصحي: جميع نقاط API تعمل 200.

### مهم للاختبار
- المفضلة تُخزَّن على الخادم **للمستخدمين المسجّلين فقط**؛ إضافة الضيف تبقى محلية على الجهاز.
- لاختبار المزامنة: سجّل الدخول بنفس الحساب في الموقع والـAPK الجديد ثم أضف مفضلة من الويب.
- الـAPK الأصلي يتزامن عبر مؤقت 5 دقائق أو عند استئناف التطبيق.

### أدوات مؤقتة (تُنظَّف عند الانتهاء)
- `D:\temp\opencode\test-fav-intent.js`, `health-check.js`, `test-fav-toggle.js`, `test-login.json`, `fav-inspect*.js`, `fav-prod*.js`.
