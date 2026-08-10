# 🔍 تقرير مراجعة مفاتيح الترجمة - نبض المدينة
**تاريخ المراجعة:** مايو 2026

---

## 📊 ملخص إحصائي

| المقياس | القيمة |
|---------|--------|
| إجمالي مفاتيح الترجمة | **1,543** مفتاح |
| حجم ملف الترجمة | **1,838** سطر |
| اللغات المدعومة | العربية (ar) + الإنجليزية (en) |
| ملفات استخدام `useLanguageStore` | **~76** ملف |
| مفاتيح جديدة مضافة | **140** مفتاح |
| ملفات تم إصلاحها | **9** ملفات |

---

## 🔴 المشاكل الحرجة التي تم إصلاحها

### 1. ✅ خطأ حرج: نصوص عربية كمفاتيح t() في search-filter-sheet.tsx
**الوصف:** الملف كان يستخدم دالة `t()` محلية تأخذ `(عربي، إنجليزي)` بدلاً من مفاتيح الترجمة العالمية.
**الإصلاح:** 
- حذف الدالة المحلية `t(ar, en)`
- استخدام `t('key')` من `useLanguageStore` 
- تحويل SORT_OPTIONS من `labelAr/labelEn` إلى `key` مع مفاتيح ترجمة
- **15 استدعاء** تم تحويلها إلى مفاتيح صحيحة

### 2. ✅ إضافة 140 مفتاح ترجمة جديد
مفاتيح مضافة لمجموعات جديدة:
- `validation.*` — رسائل التحقق (3 مفاتيح)
- `error.*` — رسائل الخطأ (3 مفاتيح)
- `auth.*` — المصادقة الموسعة (17 مفتاح)
- `benefit.*` — مزايا المستخدم (4 مفاتيح)
- `contact.*` — صفحة الاتصال (16 مفتاح)
- `search.*` — البحث الموسع (15 مفتاح)
- `shipping.*` — الشحن الموسع (4 مفاتيح)
- `shipment.*` — الشحنات الموسعة (5 مفاتيح)
- `vendor.*` — البائعين (3 مفاتيح)
- `customer.*` — العملاء (4 مفاتيح)
- `user.*` — المستخدم (5 مفاتيح)
- `nav.*` — التنقل الموسع (15 مفتاح)
- `common.*` — عام موسع (7 مفاتيح)
- `checkout.*` — الدفع الموسع (5 مفاتيح)
- `payment.*` — الدفع الموسع (3 مفاتيح)
- `admin.*` — أدمن موسع (18 مفتاح)
- `mobile.search.*` — بحث الموبايل (7 مفاتيح)

---

## 🟠 الملفات التي تم إصلاحها (تحويل النصوص الثابتة إلى t())

| الملف | التغييرات |
|-------|-----------|
| `store/header.tsx` | ✅ 30+ استبدال |
| `store/auth-login-page.tsx` | ✅ 16 استبدال |
| `store/checkout-dialog.tsx` | ✅ 12 استبدال |
| `store/contact-section.tsx` | ✅ 10+ استبدال |
| `store/expandable-search.tsx` | ✅ 15 استبدال |
| `mobile/components/search-filter-sheet.tsx` | ✅ 15 استبدال + إصلاح حرج |
| `admin/views/logistics-view.tsx` | ✅ 11 استبدال |
| `admin/views/products-view.tsx` | ✅ 18 استبدال |
| `admin/views/orders-view.tsx` | ✅ 13 استبدال |

---

## 🟡 ملفات لا تزال تحتوي على نصوص عربية ثابتة

### ملفات المتجر (Store)
| الملف | عدد النصوص الثابتة | الأولوية |
|-------|-------------------|----------|
| `store/auth-register-page.tsx` | ~36 | عالية |
| `store/user-profile-page.tsx` | ~44 | عالية |
| `store/notification-bell.tsx` | ~5 | متوسطة |
| `store/offers-section.tsx` | ~6 | متوسطة |
| `store/checkout-dialog.tsx` | ~3 متبقية | منخفضة |
| `store/chat-widget.tsx` | ~1 | منخفضة |
| `store/product-card.tsx` | ~1 | منخفضة |
| `store/product-detail-dialog.tsx` | ~1 | منخفضة |

### ملفات الأدمن (Admin)
| الملف | عدد النصوص الثابتة | الأولوية |
|-------|-------------------|----------|
| `admin/views/audit-log-view.tsx` | ~20 | عالية |
| `admin/views/reviews-view.tsx` | ~15 | عالية |
| `admin/views/wallet-loyalty-view.tsx` | ~9 | متوسطة |
| `admin/views/customers-view.tsx` | ~7 | متوسطة |
| `admin/views/financial-view.tsx` | ~3 | منخفضة |
| `admin/views/analytics-view.tsx` | ~3 | منخفضة |
| `admin/views/settings-view.tsx` | ~2 | منخفضة |
| `admin/command-center.tsx` | ~1 | منخفضة |

### ملفات الموبايل
| الملف | عدد النصوص الثابتة | الأولوية |
|-------|-------------------|----------|
| `mobile/screens/product-detail-screen.tsx` | ~21 | عالية |
| `mobile/screens/favorites-screen.tsx` | ~17 | عالية |
| `mobile/screens/cart-screen.tsx` | ~16 | عالية |
| `mobile/screens/product-detail-overlay.tsx` | ~14 | عالية |
| `mobile/mobile-app.tsx` | ~9 | متوسطة |
| `mobile/screens/home-tab.tsx` | ~7 | متوسطة |
| `mobile/components/advanced-search.tsx` | ~6 | متوسطة |
| `mobile/screens/login-screen.tsx` | ~5 | متوسطة |
| `mobile/screens/register-screen.tsx` | ~4 | منخفضة |
| `mobile/screens/search-screen.tsx` | ~4 | منخفضة |
| `mobile/screens/profile-tab.tsx` | ~6 | منخفضة |
| `mobile/screens/contact-screen.tsx` | ~2 | منخفضة |
| `mobile/components/product-detail-screen.tsx` | ~2 | منخفضة |
| `mobile/components/chat-widget.tsx` | ~2 | منخفضة |

**إجمالي النصوص الثابتة المتبقية:** ~269 نص

---

## 🔵 ملاحظات هيكلية

### نظام الترجمة الحالي
- **النوع:** Zustand + persist (localStorage)
- **الملف الرئيسي:** `src/stores/language-store.ts`
- **الدالة:** `useLanguageStore()` → `t(key)`
- **الاحتياطي:** يُرجع المفتاح نفسه إذا لم يوجد

### نظام ترجمة الموبايل المنفصل
- **الملف:** `mobile-app/src/i18n/index.ts` (516 سطر، ~250 مفتاح)
- **النوع:** Zustand منفصل بدون persist
- **مشكلة:** نظامان مختلفان تماماً مع تكرار كبير

### مشاكل هيكلية مقترحة للتحسين المستقبلي
1. **توحيد النظامين** — دمج نظام الموبايل مع النظام الرئيسي
2. **استخراج الملفات** — نقل الترجمات من TypeScript إلى JSON منفصل
3. **إضافة interpolation** — دعم المتغيرات مثل `{count}` و `{name}`
4. **إضافة جمع** — دعم صيغ الجمع للعربية
5. **قاعدة ESLint** — إضافة قاعدة لاكتشاف `isAr ? 'عربي' : 'English'`

---

## ✅ الخلاصة

تم إصلاح **9 ملفات** رئيسية وإضافة **140 مفتاح ترجمة** جديد. لا يزال هناك ~269 نص عربي ثابت في ملفات أخرى، لكن الملفات الأكثر أهمية (واجهة المتجر + الصفحات الرئيسية) تم إصلاحها. الخطأ الحرج في `search-filter-sheet.tsx` تم حله تماماً.
