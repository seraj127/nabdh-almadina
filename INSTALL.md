# نبض المدينة - Nabd Al-Madina
## متجر إلكتروني ليبي | Libyan E-Commerce Store

---

## المتطلبات | Requirements

- **Node.js** 18+ أو **Bun** 1.0+
- **npm** أو **bun** (يُفضل bun)

---

## التثبيت | Installation

### 1. فك الضغط
```bash
tar -xzf nabd-almadina-project.tar.gz
cd nabd-almadina
```

### 2. تثبيت الحزم
```bash
bun install
# أو
npm install
```

### 3. إعداد قاعدة البيانات
```bash
bun run db:push
bun run db:generate
bun run db:seed
```

### 4. تشغيل المشروع
```bash
bun run dev
```

المشروع سيعمل على: `http://localhost:3000`

---

## بنية المشروع | Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # المصادقة (تسجيل دخول/خروج)
│   │   │   ├── products/       # المنتجات
│   │   │   ├── orders/         # الطلبات
│   │   │   ├── cart/           # سلة التسوق
│   │   │   ├── favorites/      # المفضلة
│   │   │   ├── categories/     # التصنيفات
│   │   │   ├── shipping/       # الشحن والتوصيل
│   │   │   ├── payment/        # الدفع
│   │   │   ├── admin/          # لوحة الإدارة
│   │   │   └── ...
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── mobile/             # تطبيق الموبايل
│   │   │   ├── components/     # مكونات المشتركات
│   │   │   ├── screens/        # شاشات التطبيق
│   │   │   ├── lib/            # مكتبات مساعدة
│   │   │   └── mobile-app.tsx  # المكون الرئيسي
│   │   ├── admin/              # لوحة الإدارة
│   │   ├── store/              # واجهة المتجر
│   │   └── ui/                 # مكونات shadcn/ui
│   ├── stores/                 # Zustand stores
│   ├── lib/                    # مكتبات مشتركة
│   └── hooks/                  # React hooks
├── prisma/
│   ├── schema.prisma           # قاعدة البيانات
│   └── seed.ts                 # بيانات أولية
├── db/                         # SQLite database
├── public/                     # ملفات ثابتة
│   ├── products/               # صور المنتجات
│   └── categories/             # صور التصنيفات
├── mobile-app/                 # تطبيق React Native
├── android/                    # مشروع Android (Capacitor)
├── mini-services/              # خدمات مصغرة
└── package.json
```

---

## المميزات | Features

- 🛒 تجارة إلكترونية كاملة
- 📱 تطبيق موبايل (PWA + Android)
- 🌐 دعم ثنائي اللغة (عربي/إنجليزي)
- 🌙 الوضع الداكن
- ❤️ قائمة المفضلة
- 🛍️ سلة التسوق
- 📦 تتبع الطلبات
- 💬 دردشة مباشرة
- 🔔 إشعارات
- 💰 محفظة إلكترونية ونقاط ولاء
- 🚚 تكامل شركات الشحن الليبية
- 🎫 كوبونات خصم
- ⭐ تقييمات ومراجعات
- 📊 لوحة إدارة متقدمة

---

## المتغيرات البيئية | Environment Variables

أنشئ ملف `.env` في المجلد الرئيسي:

```env
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-secret-key-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## أوامر مفيدة | Useful Commands

| الأمر | الوصف |
|-------|-------|
| `bun run dev` | تشغيل سيرفر التطوير |
| `bun run lint` | فحص الكود |
| `bun run db:push` | تحديث قاعدة البيانات |
| `bun run db:seed` | ملء قاعدة البيانات بالبيانات |
| `bun run db:generate` | توليد Prisma Client |

---

## التقنيات | Tech Stack

- **Next.js 16** + App Router
- **TypeScript 5**
- **Tailwind CSS 4** + shadcn/ui
- **Prisma ORM** + SQLite
- **Framer Motion** (أنيميشن)
- **Zustand** (إدارة الحالة)
- **Capacitor** (تطبيق Android)
- **React Native** (تطبيق موبايل)

---

## الترخيص | License

© 2026 نبض المدينة - Nabd Al-Madina. جميع الحقوق محفوظة.
