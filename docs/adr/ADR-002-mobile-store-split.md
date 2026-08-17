# ADR-002 — تقسيم mobile-store (ORG-002)

- **Status:** Accepted (خطة)
- **Date:** 2026-08-17
- **Owner:** مالك المشروع
- **Related Rules:** ORG-002 (حدود حجم الوحدة)، PRIN-004 (KISS)، PRIN-005 (YAGNI)
- **Reversal Conditions:** إذا تجاوز عدد الملفات 100 ملف src وبدأ الارتباك أعمق من الربح، يُعاد تقييم.

## Context
`src/components/mobile/lib/mobile-store.ts` = ~1305 سطراً. القاعدة تقترح مراجعة ملفات >300 سطراً. الملف يحتوي: إعلان الحالة + إجراءات (auth، منتجات، مفضلة، عناوين، طلبات) + تهيئة + تحديثات دورية. التكرار في الإجراءات (كل دالة تستخدم `get() / set()`) يجعل الفصل بالكامل خطيراً (يُغيّر طريقة Zustand).

## Decision
تقسيم **تدريجي** بدلاً من إعادة بناء مفاجئة:

1. **(مكتمل — هذه الجولة):** إخراج بيانات مجمّعة إلى ملفات مستقلة (`translations.ts`).
2. **(الخطوة التالية):** استخراج وحدة `product-fetcher.ts` — `fetchProducts/loadMore/refreshData/loadMoreSearch` (منطق جلب المنتجات فقط، لا الحالة). الدالة تأخذ `get`/`set` كمعاملات.
3. **الخطوة الثالثة:** استخراج `mobile-auth-actions.ts` — `login/register/logout` (الممر المستقل: API + fallback محلي + useUIStore).
4. **الخطوة الرابعة:** استخراج `mobile-data-fetcher.ts` — `fetchUserProfile/fetchAddresses/fetchOrders/fetchDeliveryZones`.

**لا ننفصل عن Zustand** — نحتفظ بالحالة في `mobile-store` ونستورد الدوال المنفصلة.

## Alternatives Considered
| البديل | سبب الرفض |
|---|---|
| إعادة بناء كاملة للحالة (modular stores) | خطيرة جداً؛ تكسر كل الاستدعاءات والاختبارات |
| فصل البيانات فقط (LOCAL_*) | مكتمل بالفعل (ملف constants) |
| فصل المكونات (components) | لا يقلل حجم mobile-store |

## Consequences
**إيجابية (+):**
- ملف أصغر وأكثر تركيزاً = مراجعة أسهل + احتمال تعارض أقل.
- وحدات مستقلة قابلة للاختبار بشكل منفصل.
- وحدة `product-fetcher` يمكنها اختبارها بـ API mock بدون بناء كامل.

**سلبية (−):**
- إضافة ملفات جديدة = مسارات استيراد أطول قليلاً.
- كل تقسيم لاحق يحتاج اختبارات سلوكية تأكّدية.

## Validation
- 29 اختباراً حالية تبقى خضراء بعد كل خطوة.
- التحقق من بناء Vercel + تشغيل `localhost:3000` بعد كل تقسيم.
- نشر على الإنتاج والتحقق من المفضلة/السلة بعد كل خطوة.

## References
- `docs/COMPLIANCE_MATRIX.md` (ORG-002)
- `src/components/mobile/lib/mobile-store.ts` (الملف المستهدف)
- `src/lib/i18n/translations.ts` (النموذج المتبع — تقسيم البيانات نجح)
