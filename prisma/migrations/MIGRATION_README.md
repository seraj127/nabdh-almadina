# Migrations — استراتيجية التبني

## الوضع السابق (المخالفة)
كانت تغييرات الـSchema تُطبق عبر `prisma db push` وتعديلات ALTER يدوية على قاعدة الإنتاج (مثل عمود `User.preferences`) — هذا يخالف **DB-001** (يجب أن تكون كل التغييرات عبر migrations مفهرسة قابلة للعكس).

## التبني
1. **Baseline:** `20260815000000_init/migration.sql` — يُمثّل كامل الـSchema الحالي (37 جدولاً) مُولَّد عبر `prisma migrate diff --from-empty --to-schema-datamodel`. **لا يُعاد تطبيقه على قاعدة موجودة.**
2. **تثبيت الـbaseline على الإنتاج (مرة واحدة):**
   - تنفيذ `prisma migrate resolve --applied 20260815000000_init --schema prisma/schema.postgresql.prisma`
   - هذا يعلّم الـbaseline كمنفّذ دون إعادة إنشاء الجداول (لأنها موجودة فعلاً).
3. **من الآن فصاعداً:** أي تغيير في `prisma/schema.postgresql.prisma` → `npx prisma migrate dev --schema prisma/schema.postgresql.prisma` (محلياً) ثم `prisma migrate deploy` على الإنتاج.

## ملاحظات
- الـschema الثاني `prisma/schema.prisma` يُحافظ عليه متطابقاً (يُستخدم محلياً/تطويرياً).
- أي تغيير هيكلي مستقبلاً يجب أن يكون عبر migration مع خطوة rollback موثقة.
- لا تعديلات DDL يدوية على أي بيئة.
