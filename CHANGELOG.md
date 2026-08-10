# 📋 التوثيق الشامل لمشروع نبض المدينة — City Pulse E-Commerce
## من بداية التأسيس وحتى الآن

**المشروع:** متجر نبض المدينة الإلكتروني (Nabd Al-Madina / City Pulse)  
**التقنيات الأساسية:** Next.js 16 · TypeScript 5 · Prisma ORM (SQLite) · Tailwind CSS 4 · Zustand v5 · Framer Motion · shadcn/ui  
**العملة:** دينار ليبي (LYD)  
**الموقع:** طرابلس، ليبيا 🇱🇾  
**الإصدار:** v0.2.0  

---

## 📑 جدول المحتويات

1. [نظرة عامة على المشروع](#1-نظرة-عامة-على-المشروع)
2. [البنية التحتية والهيكل العام](#2-البنية-التحتية-والهيكل-العام)
3. [قاعدة البيانات — جميع النماذج](#3-قاعدة-البيانات--جميع-النماذج)
4. [واجهة المتجر الإلكتروني (Web Store)](#4-واجهة-المتجر-الإلكتروني-web-store)
5. [تطبيق الموبايل (Mobile App)](#5-تطبيق-الموبايل-mobile-app)
6. [لوحة تحكم الإدارة (Admin Dashboard)](#6-لوحة-تحكم-الإدارة-admin-dashboard)
7. [مسارات API — جميع النقاط](#7-مسارات-api--جميع-النقاط)
8. [إدارة الحالة — Zustand Stores](#8-إدارة-الحالة--zustand-stores)
9. [المكتبات والخدمات المساعدة](#9-المكتبات-والخدمات-المساعدة)
10. [الخدمات المصغرة (Mini Services)](#10-الخدمات-المصغرة-mini-services)
11. [نظام الدفع المتكامل](#11-نظام-الدفع-المتكامل)
12. [نظام الشحن والتوصيل](#12-نظام-الشحن-والتوصيل)
13. [نظام المصادقة والأمان](#13-نظام-المصادقة-والأمان)
14. [نظام الإشعارات](#14-نظام-الإشعارات)
15. [نظام الولاء والمحفظة](#15-نظام-الولاء-والمحفظة)
16. [نظام الكوبونات والخصومات](#16-نظام-الكوبونات-والخصومات)
17. [نظام التقييمات والمراجعات](#17-نظام-التقييمات-والمراجعات)
18. [نظام البحث المتقدم](#18-نظام-البحث-المتقدم)
19. [الذكاء الاصطناعي — المحادثة الذكية](#19-الذكاء-الاصطناعي--المحادثة-الذكية)
20. [دعم اللغات والاتجاهات](#20-دعم-اللغات-والاتجاهات)
21. [التصميم والسمات (Themes)](#21-التصميم-والسمات-themes)
22. [تطبيق أندرويد (APK)](#22-تطبيق-أندرويد-apk)
23. [الإصلاحات الحرجة](#23-الإصلاحات-الحرجة)
24. [إحصائيات المشروع](#24-إحصائيات-المشروع)

---

## 1. نظرة عامة على المشروع

مشروع **نبض المدينة** هو منصة تجارة إلكترونية متكاملة مخصصة للسوق الليبي، تتضمن:

- **متجر ويب** احترافي متجاوب (Responsive)
- **تطبيق موبايل** (Capacitor/Android) مع تصميم Native
- **لوحة تحكم إدارية** كاملة (Command Center)
- **نظام دفع** متعدد الطرق (COD، بطاقة، تحويل بنكي، محفظة)
- **نظام شحن** مع تكامل شركات النقل الليبية
- **محادثة ذكية** مدعومة بالذكاء الاصطناعي
- **نظام ولاء ونقاط** للمستخدمين
- **دعم ثنائي اللغة** (عربي/إنجليزي) مع RTL/LTR

---

## 2. البنية التحتية والهيكل العام

### التطبيقات الثلاثة

| التطبيق | الملف الرئيسي | الوصف |
|---------|--------------|-------|
| **Web Store** | `src/components/store/store-view.tsx` | واجهة المتجر الإلكتروني |
| **Mobile App** | `src/components/mobile/mobile-app.tsx` | تطبيق الموبايل (Capacitor) |
| **Admin Dashboard** | `src/components/admin/command-center.tsx` | لوحة تحكم الإدارة |

### نظام التوجيه

المشروع يستخدم نظام `authView` أحادي الصفحة (SPA) بدلاً من مسارات Next.js التقليدية:
- جميع الصفحات تُعرض ضمن مسار `/` الوحيد
- التنقل يتم عبر Zustand store (`useUIStore.setAuthView`)
- الصفحات المحمية تتطلب تسجيل دخول (checkout, profile, settings, points-rewards)

### التحميل الكسول (Lazy Loading)

| المكون | استراتيجية التحميل |
|--------|-------------------|
| `StoreView` | **تحميل مباشر** (Direct import) — للعرض الفوري |
| `MobileApp` | `dynamic()` مع `ssr: false` |
| `CommandCenter` | `dynamic()` مع `ssr: false` |
| `ApkDownloadPage` | `dynamic()` مع `ssr: false` |
| صفحات المتجر الفرعية | `dynamic()` مع `ssr: false` + skeleton loading |
| `ChatWidget` | تحميل بعد 2 ثانية |
| `OrderTrackingDialog` | تحميل عند أول فتح فقط |
| `OffersSection`, `FeaturedSection` | تحميل كسول (تحت الطية) |

### نظام الحماية (Error Boundary)

- `ErrorBoundary` class component يلتقط جميع أخطاء العميل
- عرض رسالة خطأ بالعربية مع تفاصيل تقنية قابلة للطي
- زر "إعادة المحاولة" لإعادة تعيين الحالة

---

## 3. قاعدة البيانات — جميع النماذج

### نماذج المستخدمين والمصادقة

| النموذج | الوصف | الحقول الرئيسية |
|---------|-------|----------------|
| **User** | المستخدمون | phone (unique), email, name, avatar, passwordHash, googleId, role (customer/admin/vendor/driver), loyaltyTier (bronze/silver/gold/platinum), loyaltyPoints, walletBalance, language, lastLoginAt, loginCount |
| **UserSession** | جلسات المستخدم | token (JWT jti), deviceInfo, ipAddress, platform (web/mobile/admin), expiresAt |
| **Address** | عناوين المستخدمين | label, address, city, area, notes, isDefault, zoneId |
| **OTPVerification** | تحقق OTP | phone, code, verified, expiresAt |

### نماذج كتالوج المنتجات

| النموذج | الوصف | الحقول الرئيسية |
|---------|-------|----------------|
| **Category** | الفئات (20 فئة) | nameAr, nameEn, slug, icon, image, sortOrder, phase (ACTIVE_MVP/PHASE_2/3/4), attributes (JSON schema) |
| **Product** | المنتجات (100+ منتج) | nameAr/En, descriptionAr/En, sku, price, comparePrice, costPrice, images (JSON), mainImage, video, stock, reservedStock, weight, dimensions (JSON), attributes (JSON), badges (JSON), rating, reviewCount, isFeatured |

### نماذج التسوق والطلبات

| النموذج | الوصف | الحقول الرئيسية |
|---------|-------|----------------|
| **CartItem** | سلة التسوق | userId, productId, quantity, reserved, expiresAt |
| **Order** | الطلبات | orderNumber (unique), status (7 حالات), paymentMethod (cod/card/bank_transfer), paymentStatus, subtotal, deliveryFee, discount, total, fraudScore, fraudFlagged |
| **OrderItem** | عناصر الطلب | productId, nameAr/En, price, quantity, total, image |
| **OrderStatusLog** | سجل حالات الطلب | status, note |

### نماذج الكوبونات والخصومات

| النموذج | الوصف | الحقول الرئيسية |
|---------|-------|----------------|
| **Coupon** | كوبونات الخصم | code (unique), type (percentage/fixed), value, minOrder, maxDiscount, usageLimit, usageCount, perUserLimit, startsAt, expiresAt |

### نماذج الشحن والتوصيل

| النموذج | الوصف | الحقول الرئيسية |
|---------|-------|----------------|
| **DeliveryZone** | مناطق التوصيل | nameAr/En, city, region, area, fee, freeAbove, estimatedDays |
| **ShippingCarrier** | شركات الشحن | code (unique), type (local/national/international), apiEndpoint, apiKey, apiSecret, trackingUrl, coverageAreas (JSON), pricePerKg, basePrice, codFee, isIntegrated, rating, successRate |
| **Shipment** | الشحنات | trackingNumber, waybillNumber, status (7 حالات), weight, shippingCost, codAmount, codCollected, estimatedPickup/Delivery, actualPickup/Delivery, carrierData (JSON) |
| **ShipmentLog** | سجل الشحن | status, location, descriptionAr/En, latitude, longitude |
| **ShippingCompany** | شركات الشحن (واجهة المستخدم) | slug, logo, baseFee, freeAbove, weightLimit, codSupported, codFee, coverageType |
| **ShippingCoverageZone** | مناطق تغطية الشحن | regionId, cityName, areaName, fee, freeAbove, estimatedDays |

### نماذج المالية والمحاسبة

| النموذج | الوصف | الحقول الرئيسية |
|---------|-------|----------------|
| **PaymentTransaction** | معاملات الدفع | orderId, amount, method (card/bank_transfer/wallet/cod), status (6 حالات), gatewayTxnId, gatewayName, cardLast4, cardBrand, bankReference, receiptUrl |
| **LedgerAccount** | حسابات دفتر الأستاذ | code (unique), nameAr/En, type (asset/liability/equity/revenue/expense), category, balance |
| **JournalEntry** | القيود المحاسبية | entryNumber (unique), descriptionAr/En, reference, status (draft/posted/voided) |
| **JournalEntryLine** | بنود القيد | accountId, debit, credit |

### نماذج الولاء والمحفظة

| النموذج | الوصف | الحقول الرئيسية |
|---------|-------|----------------|
| **LoyaltyTransaction** | معاملات النقاط | type (earn/redeem/expire/bonus), points, orderId |
| **WalletTransaction** | معاملات المحفظة | type (deposit/withdrawal/refund/cashback/adjustment), amount, reference, status |

### نماذج أخرى

| النموذج | الوصف | الحقول الرئيسية |
|---------|-------|----------------|
| **Review** | التقييمات | productId, userId, rating (1-5), title, comment, images (JSON), isVerified |
| **FavoriteItem** | المفضلة | userId, productId |
| **InventoryMovement** | حركات المخزون | type (in/out/reservation/release/adjustment/return), quantity, reference |
| **Notification** | الإشعارات | userId (nullable=broadcast), titleAr/En, bodyAr/En, type (info/order/promo/system) |
| **NotificationReadStatus** | حالة قراءة الإشعارات | userId, notificationId, readAt |
| **ContactMessage** | رسائل التواصل | name, phone, email, category (6 أنواع), subject, message, status (new/read/replied/closed) |
| **PushToken** | رموز الإشعارات الفورية | token, platform (web/android/ios) |
| **FeatureFlag** | أعلام الميزات | key (unique), value, description |
| **AuditLog** | سجل التدقيق | action, entity, entityId, details, ip |
| **StoreSetting** | إعدادات المتجر | key (id), value |
| **EmailLog** | سجل البريد | to, template (10 أنواع), status, data (JSON) |
| **Vendor** | البائعون (Phase 4) | type (4 أنواع), commission, bankInfo (JSON), isVerified, rating, totalSales |
| **VendorPayout** | مدفوعات البائعين | amount, status (4 حالات), periodStart/End |

---

## 4. واجهة المتجر الإلكتروني (Web Store)

### الصفحة الرئيسية — الأقسام

| القسم | المكون | الوصف |
|-------|--------|-------|
| **Hero** | `hero.tsx` | تدرج لوني سينمائي + عناصر متحركة (جسيمات، خطوط SVG، أشكال عائمة) + أزرار CTA + شارات ثقة. يدعم الوضع الداكن/الفاتح |
| **كتالوج المنتجات** | `product-catalog.tsx` | شريط فئات متحرك (Infinite Marquee) + شبكة منتجات 2×3×4 + بحث + فلتر + ترتيب + تحميل المزيد |
| **الأكثر مبيعاً** | `featured-section.tsx` | كاروسيل أفقي لا نهائي مع سحب + أزرار تنقل + إيقاف/تشغيل + بطاقات منتجات كبيرة |
| **لماذا نحن** | `trust-features.tsx` | 4 بطاقات: جودة، توصيل سريع، دفع آمن، إرجاع سهل |
| **العروض** | `offers-section.tsx` | عد تنازلي لنهاية اليوم + منتجات مخفضة + أزرار معاينة ومفضلة |
| **شهادات العملاء** | `testimonials.tsx` | تقييمات عملاء مع نجوم ورسائل |
| **تواصل معنا** | `contact-section.tsx` | بطاقة ترويجية مختصرة + أزرار سريعة |

### الصفحات الفرعية

| الصفحة | المكون | الميزات |
|--------|--------|---------|
| **تسجيل الدخول** | `auth-login-page.tsx` | هاتف + كلمة مرور + Google OAuth + OTP + رابط تسجيل جديد |
| **حساب جديد** | `auth-register-page.tsx` | اسم + هاتف + إيميل + كلمة مرور + تأكيد |
| **الملف الشخصي** | `user-profile-page.tsx` | معلومات شخصية + طلباتي + عناويني + محفظتي + نقاطي |
| **تفاصيل المنتج** | `product-detail-page.tsx` | صور + فيديو + وصف + سمات + تقييمات + منتجات مشابهة + إضافة للسلة |
| **السلة** | `cart-page.tsx` | قائمة المنتجات + تعديل الكميات + كوبون + ملخص + زر الدفع |
| **الدفع** | `checkout-page.tsx` | 3 خطوات: عنوان + دفع + مراجعة. عناوين محفوظة + مناطق توصيل + كوبون + تأكيد الطلب مع ألعاب نارية |
| **المفضلة** | `favorites-page.tsx` | قائمة المنتجات المفضلة + إضافة للسلة |
| **تتبع الطلب** | `order-tracking-page.tsx` | رقم الطلب + حالة الشحن + سجل التتبع |
| **مناطق التوصيل** | `delivery-zones-page.tsx` | خريطة مناطق التوصيل + رسوم + أوقات التوصيل |
| **النقاط والمكافآت** | `points-rewards-page.tsx` | رصيد النقاط + تاريخ المعاملات + مستويات الولاء |
| **الإعدادات** | `settings-page.tsx` | الملف الشخصي + تغيير كلمة المرور + اللغة + الإشعارات |
| **تواصل معنا** | `contact-page.tsx` | خريطة OSM + نموذج تواصل (6 أنواع) + أسئلة شائعة + ساعات عمل |
| **خريطة الموقع** | `sitemap-page.tsx` | هيكل الموقع + بحث + 5 أقسام مصنفة |
| **الشروط والأحكام** | `policy-pages.tsx` | شروط الاستخدام |
| **سياسة الخصوصية** | `policy-pages.tsx` | حماية البيانات |
| **سياسة الإرجاع** | `policy-pages.tsx` | شروط وأحكام الإرجاع |

### المكونات المشتركة

| المكون | الوصف |
|--------|-------|
| `header.tsx` | شريط علوي ثابت + شعار + بحث + سلة + مفضلة + إشعارات + قائمة مستخدم + تبديل لغة/سمة |
| `footer.tsx` | 4 أعمدة: معلومات + روابط سريعة + خدمة العملاء + تواصل. سوشال ميديا + حقوق |
| `product-card.tsx` | بطاقة منتج مع صورة + اسم + تقييم + سعر + أزرار سريعة (معاينة/مفضلة) |
| `cart-sheet.tsx` | لوحة سلة جانبية مع ملخص وإجراءات |
| `search-dialog.tsx` | حوار بحث متقدم |
| `expandable-search.tsx` | شريط بحث قابل للتوسيع |
| `notification-bell.tsx` | جرس الإشعارات مع عداد |
| `chat-widget.tsx` | ويدجت محادثة ذكية عائم |
| `order-tracking-dialog.tsx` | حوار تتبع الطلب |
| `write-review-dialog.tsx` | حوار كتابة تقييم |
| `product-reviews-section.tsx` | قسم عرض التقييمات |
| `back-to-top.tsx` | زر العودة للأعلى |
| `theme-toggle.tsx` | تبديل الوضع الداكن/الفاتح |

### بطاقة المنتج — الميزات

- **شارات ديناميكية:** new, sale, bestseller, limited, hot — بألوان وتأثيرات مختلفة
- **نسبة الخصم:** حساب تلقائي من comparePrice
- **مؤشر المخزون:** متاح/غير متاح بألوان مختلفة
- **تأثيرات التمرير:** shimmer overlay + img-zoom + hover-glow
- **أزرار سريعة:** معاينة + مفضلة (تظهر عند التمرير)
- **تغذية راجعة متحركة:** زر "تمت الإضافة" مع أنيميشن Check

---

## 5. تطبيق الموبايل (Mobile App)

### الشاشات

| الشاشة | الملف | الوصف |
|--------|-------|-------|
| **Splash** | `mobile-app.tsx` | شاشة بداية سينمائية: نجوم متحركة X-pattern + كرة مدارية ذهبية + تقدم تحميل + اسم متحرك |
| **Login** | `mobile-app.tsx` | هاتف + كلمة مرور + تأثيرات زجاجية |
| **Register** | `mobile-app.tsx` | تسجيل جديد |
| **Forgot Password** | `mobile-app.tsx` | استعادة كلمة المرور |
| **Home** | `home-tab.tsx` | شاشة رئيسية مع فئات + منتجات + عروض |
| **Profile** | `profile-tab.tsx` | معلومات + طلبات + عناوين |
| **Cart** | `cart-screen.tsx` | سلة التسوق |
| **Favorites** | `favorites-screen.tsx` | المفضلة |
| **Product Detail** | `product-detail-screen.tsx` | تفاصيل المنتج |
| **Chat** | `chat-screen.tsx` | المحادثة الذكية |
| **Contact** | `contact-screen.tsx` | تواصل معنا |
| **Notifications** | `notifications-screen.tsx` | الإشعارات |
| **Search** | `search-screen.tsx` | بحث متقدم |
| **Delivery Zones** | `delivery-zones-screen.tsx` | مناطق التوصيل |
| **Terms** | `terms-screen.tsx` | الشروط والأحكام |
| **Return Policy** | `return-policy-screen.tsx` | سياسة الإرجاع |
| **Privacy** | `privacy-policy-screen.tsx` | الخصوصية |
| **Order Tracking** | `order-tracking.tsx` | تتبع الطلب |
| **Order Detail** | `order-detail-screen.tsx` | تفاصيل الطلب |
| **Checkout** | `checkout-screen.tsx` + `checkout-flow.tsx` | إتمام الشراء |
| **Settings** | `settings-screen.tsx` | الإعدادات |
| **Write Review** | `write-review.tsx` | كتابة تقييم |
| **Address Management** | `address-management.tsx` | إدارة العناوين |
| **Account** | `account-screen.tsx` | الحساب |

### مكونات الموبايل

| المكون | الوصف |
|--------|-------|
| `offline-banner.tsx` | شعار حالة الاتصال |
| `chat-widget.tsx` | ويدجت المحادثة |
| `nav-3d-icons.tsx` | أيقونات تنقل ثلاثية الأبعاد |
| `skeleton-loader.tsx` | هياكل تحميل |
| `advanced-search.tsx` | بحث متقدم |
| `product-card.tsx` | بطاقة منتج |

### مكتبات الموبايل

| المكتبة | الوصف |
|---------|-------|
| `mobile-store.ts` | متجر حالة الموبايل |
| `helpers.ts` | دوال مساعدة |
| `design-tokens.ts` | رموز التصميم |
| `constants.ts` | ثوابت المنتجات والعروض المحلية |
| `delivery-zones.ts` | مناطق التوصيل الليبية |
| `libya-delivery-data.ts` | بيانات التوصيل في ليبيا |
| `theme.ts` | سمات الموبايل |
| `types.ts` | أنواع TypeScript |

---

## 6. لوحة تحكم الإدارة (Admin Dashboard)

### القائمة الجانبية — 13 قسم

| القسم | المكون | الوصف |
|-------|--------|-------|
| **لوحة التحكم** | `dashboard-view.tsx` | إحصائيات عامة + رسوم بيانية + آخر الطلبات |
| **المنتجات** | `products-view.tsx` | إدارة المنتجات (CRUD) + صور + سمات |
| **الطلبات** | `orders-view.tsx` | إدارة الطلبات + تغيير الحالة + تفاصيل |
| **المالية** | `financial-view.tsx` | دفتر الأستاذ + القيود المحاسبية + تقارير |
| **العملاء** | `customers-view.tsx` | إدارة المستخدمين + رصيد المحفظة + نقاط الولاء |
| **اللوجستيات** | `logistics-view.tsx` | شركات الشحن + الشحنات + التتبع |
| **المحفظة والولاء** | `wallet-loyalty-view.tsx` | معاملات المحفظة + نقاط الولاء + المستويات |
| **الكوبونات** | `coupons-view.tsx` | إنشاء وإدارة كوبونات الخصم |
| **التقييمات** | `reviews-view.tsx` | إدارة تقييمات المنتجات |
| **التحليلات** | `analytics-view.tsx` | رسوم بيانية + إحصائيات متقدمة |
| **سجل التدقيق** | `audit-log-view.tsx` | سجل جميع العمليات الإدارية |
| **الإشعارات** | `notifications-view.tsx` | إرسال إشعارات + سجل الإشعارات |
| **الإعدادات** | `settings-view.tsx` | إعدادات المتجر + أعلام الميزات |

### نظام المصادقة الإداري

- شاشة تسجيل دخول منفصلة (`admin-login.tsx`)
- متجر حالة منفصل (`admin-auth-store.ts`)
- جلسة JWT مع صلاحيات admin
- سجل تدقيق لجميع العمليات

### المكونات المشتركة

| الملف | الوصف |
|-------|-------|
| `shared/constants.ts` | ألوان وثوابت لوحة التحكم |
| `shared/components.tsx` | مكونات مشتركة (جداول، بطاقات، إلخ) |
| `shared/types.ts` | أنواع TypeScript |
| `shared/index.ts` | تصدير موحد |

---

## 7. مسارات API — جميع النقاط

### المصادقة (`/api/auth/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/auth/login` | POST | تسجيل الدخول (هاتف + كلمة مرور) |
| `/api/auth/register` | POST | إنشاء حساب جديد |
| `/api/auth/google` | POST | تسجيل دخول Google OAuth |
| `/api/auth/profile` | GET | جلب بيانات الملف الشخصي |
| `/api/auth/logout` | POST | تسجيل الخروج |
| `/api/auth/change-password` | POST | تغيير كلمة المرور |
| `/api/auth/forgot-password` | POST | استعادة كلمة المرور |

### المنتجات (`/api/products/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/products` | GET | قائمة المنتجات مع بحث وفلترة وترقيم |
| `/api/products/[id]` | GET | تفاصيل منتج واحد |

### الفئات (`/api/categories/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/categories` | GET | قائمة الفئات |

### الطلبات (`/api/orders/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/orders` | GET/POST | قائمة طلبات المستخدم / إنشاء طلب جديد |
| `/api/orders/[id]` | GET | تفاصيل طلب |

### السلة (`/api/cart/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/cart` | GET/POST/DELETE | إدارة سلة التسوق |
| `/api/cart/sync` | POST | مزامنة السلة مع الخادم |

### المفضلة (`/api/favorites/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/favorites` | GET | قائمة المفضلة |
| `/api/favorites/toggle` | POST | إضافة/إزالة من المفضلة |

### الدفع (`/api/payment/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/payment/initiate` | POST | بدء عملية الدفع |
| `/api/payment/verify` | POST | التحقق من حالة الدفع |
| `/api/payment/webhook` | POST | استقبال تحديثات بوابة الدفع |
| `/api/payment/[id]` | GET | تفاصيل معاملة |
| `/api/payment/upload-receipt` | POST | رفع إيصال تحويل بنكي |

### الشحن (`/api/shipping/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/shipping/calculate` | POST | حساب تكلفة الشحن |
| `/api/shipping/create-shipment` | POST | إنشاء شحنة |
| `/api/shipping/track` | GET | تتبع شحنة |
| `/api/shipping/cancel-shipment` | POST | إلغاء شحنة |
| `/api/shipping/label` | GET | طباعة ملصق شحن |
| `/api/shipping/sync` | POST | مزامنة تتبع الشحنات |
| `/api/shipping/webhook` | POST | استقبال تحديثات شركة الشحن |

### شركات الشحن (`/api/shipping-companies/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/shipping-companies` | GET | قائمة شركات الشحن |
| `/api/shipping-companies/[id]` | GET | تفاصيل شركة |
| `/api/shipping-companies/[id]/zones` | GET | مناطق تغطية شركة |
| `/api/shipping-companies/[id]/zones/[zoneId]` | GET | تفاصيل منطقة |

### مناطق التوصيل (`/api/delivery-zones/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/delivery-zones` | GET | قائمة مناطق التوصيل |
| `/api/delivery-zones/[id]` | GET | تفاصيل منطقة |

### الكوبونات (`/api/coupons/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/coupons/validate` | POST | التحقق من صلاحية كوبون |

### المحفظة (`/api/wallet/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/wallet` | GET | رصيد المحفظة + المعاملات |

### الولاء (`/api/loyalty/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/loyalty` | GET | نقاط الولاء + المعاملات |

### الإشعارات (`/api/notifications/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/notifications` | GET | قائمة الإشعارات |
| `/api/push-tokens` | POST/GET | تسجيل رمز FCM |

### التقييمات (`/api/reviews/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/reviews` | GET/POST | قائمة تقييمات / كتابة تقييم |

### التواصل (`/api/contact/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/contact` | POST/GET | إرسال رسالة / عرض الرسائل |

### المحادثة (`/api/chat/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/chat` | POST | محادثة ذكية (AI) |

### البحث المتقدم (`/api/search/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/search/image` | POST | بحث بالصورة (VLM) |
| `/api/search/voice` | POST | بحث صوتي (ASR) |

### العناوين (`/api/addresses/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/addresses` | GET/POST/PATCH/DELETE | إدارة عناوين المستخدم |

### المستخدمين (`/api/users/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/users/[id]` | GET/PATCH | بيانات مستخدم / تحديث |

### الإحصائيات (`/api/stats/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/stats` | GET | إحصائيات المتجر |

### المزامنة (`/api/sync/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/sync` | POST | مزامنة البيانات |

### التحميل (`/api/download/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/download` | GET | تحميل التطبيق |
| `/api/download-mobile` | GET | تحميل نسخة الموبايل |
| `/api/download-apk` | GET | تحميل APK |

### مسارات الإدارة (`/api/admin/`)

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/admin/dashboard` | GET | بيانات لوحة التحكم |
| `/api/admin/stats` | GET | إحصائيات متقدمة |
| `/api/admin/products` | GET/POST | إدارة المنتجات |
| `/api/admin/products/[id]` | GET/PATCH/DELETE | منتج واحد |
| `/api/admin/categories` | GET/POST | إدارة الفئات |
| `/api/admin/categories/[id]` | GET/PATCH/DELETE | فئة واحدة |
| `/api/admin/orders` | GET | جميع الطلبات |
| `/api/admin/orders/[id]` | GET/PATCH | طلب واحد |
| `/api/admin/users` | GET | جميع المستخدمين |
| `/api/admin/users/[id]` | GET/PATCH | مستخدم واحد |
| `/api/admin/users/wallet` | POST | تعديل رصيد المحفظة |
| `/api/admin/users/loyalty` | POST | تعديل نقاط الولاء |
| `/api/admin/inventory` | GET/POST | إدارة المخزون |
| `/api/admin/financial` | GET | التقارير المالية |
| `/api/admin/financial/ledger` | GET | دفتر الأستاذ |
| `/api/admin/financial/journal` | GET/POST | القيود المحاسبية |
| `/api/admin/coupons` | GET/POST | إدارة الكوبونات |
| `/api/admin/coupons/[id]` | GET/PATCH/DELETE | كوبون واحد |
| `/api/admin/coupons/validate` | POST | تحقق من كوبون |
| `/api/admin/loyalty` | GET/POST | إدارة الولاء |
| `/api/admin/reviews` | GET | تقييمات الإدارة |
| `/api/admin/shipping/carriers` | GET | شركات الشحن |
| `/api/admin/shipping/shipments` | GET | الشحنات |
| `/api/admin/notifications` | GET/POST | إدارة الإشعارات |
| `/api/admin/audit-log` | GET | سجل التدقيق |
| `/api/admin/settings` | GET/PATCH | إعدادات المتجر |
| `/api/admin/feature-flags` | GET/PATCH | أعلام الميزات |
| `/api/admin/seed` | POST | بذر البيانات |
| `/api/admin/vendors` | GET/POST | إدارة البائعين |
| `/api/admin/vendors/[id]` | GET/PATCH/DELETE | بائع واحد |
| `/api/admin/delivery-zones` | GET/POST | إدارة مناطق التوصيل |
| `/api/admin/email/logs` | GET | سجل البريد |

---

## 8. إدارة الحالة — Zustand Stores

| المتجر | الملف | الوصف |
|--------|-------|-------|
| **UI Store** | `ui-store.ts` | حالة الواجهة: authView, isLoggedIn, currentUser, isCartOpen, isSearchOpen, isChatOpen, isAdminMode, notifications, catalogSearchQuery |
| **Cart Store** | `cart-store.ts` | سلة التسوق: items, addItem, removeItem, updateQuantity, getSubtotal, fetchFromServer |
| **Favorites Store** | `favorites-store.ts` | المفضلة: favoriteIds, toggleFavorite, fetchFavorites |
| **Language Store** | `language-store.ts` | اللغة: language (ar/en), direction (rtl/ltr), t() ترجمة, +500 مفتاح ترجمة |
| **Coupon Store** | `coupon-store.ts` | الكوبونات: appliedCoupon, applyCoupon, removeCoupon, calcCouponDiscount |
| **Admin Auth Store** | `admin-auth-store.ts` | مصادقة الإدارة: isAuthenticated, user, login, logout |
| **Mobile Store** | `mobile/mobile-store.ts` | حالة الموبايل: screen, darkMode, selectedProduct, favorites, searchQuery |

### ميزات إدارة الحالة

- **استمرار محلي:** جميع المتاجر تحفظ حالة في localStorage
- **إعادة إماهة:** `rehydrate()` يستعيد الحالة عند تحميل الصفحة
- **مزامنة الخادم:** السلة والمفضلة تتزامن مع الخادم عند تسجيل الدخول
- **useShallow:** أي selector يُرجع كائن `{}` يجب أن يُلفّ بـ `useShallow()` لمنع الحلقات اللانهائية

---

## 9. المكتبات والخدمات المساعدة

| المكتبة | الملف | الوصف |
|---------|-------|-------|
| **قاعدة البيانات** | `lib/db.ts` | Prisma Client مفرد |
| **الدفع** | `lib/payment.ts` | بوابة الدفع: COD، بطاقة، تحويل بنكي، محفظة |
| **الشحن** | `lib/shipping-integration.ts` | تكامل شركات الشحن (Adapter Pattern) |
| **JWT** | `lib/jwt.ts` | إنشاء والتحقق من رموز JWT |
| **جلسة JWT** | `lib/jwt-session.ts` | إدارة جلسات المستخدم |
| **مصادقة** | `lib/auth-utils.ts` | دوال مساعدة للمصادقة |
| **البريد** | `lib/email.ts` | إرسال البريد الإلكتروني |
| **قوالب البريد** | `lib/email-templates.ts` | 10 قوالب بريد (welcome, order_confirmation, order_shipped, order_delivered, otp, password_reset, payment_confirmed, wallet_deposit, promo) |
| **هاتف** | `lib/phone-utils.ts` | التحقق من أرقام الهواتف الليبية |
| **إيميل** | `lib/email.ts` | التحقق من البريد الإلكتروني |
| **تسلسل** | `lib/serialize.ts` | تحويل Decimal إلى number للـ JSON |
| **معدل الطلبات** | `lib/rate-limit.ts` | تحديد عدد الطلبات |
| **بيانات التوصيل** | `lib/delivery-data.ts` | بيانات مناطق التوصيل |
| **إشعارات فورية** | `lib/push-notifications.ts` | إرسال إشعارات FCM |
| **Radix Patch** | `lib/radix-patch.ts` | إصلاح مشاكل Radix UI |
| **أدوات** | `lib/utils.ts` | cn() وغيرها من الدوال المساعدة |

---

## 10. الخدمات المصغرة (Mini Services)

| الخدمة | المنفذ | الوصف |
|--------|--------|-------|
| **Sync Service** | 3004 | خادم WebSocket (Socket.IO) للمزامنة الفورية: طلبات جديدة، تحديث حالات، إشعارات |
| **Download Service** | 3001 | خدمة تحميل APK |
| **Server Watchdog** | 3002 | مراقبة حالة الخادم |

### أحداث WebSocket

| الحدث | الاتجاه | الوصف |
|-------|---------|-------|
| `join` | Client → Server | الانضمام بمعرف المستخدم والدور |
| `order-created` | Client → Server | إشعار طلب جديد → المديرين |
| `order-updated` | Client → Server | تحديث حالة طلب → المستخدم + المديرين |
| `notify-user` | Client → Server | إشعار مستخدم محدد |
| `dashboard-refresh` | Client → Server | طلب تحديث لوحة التحكم |
| `broadcast` | Client → Server | بث لجميع المتصلين |
| `new-order` | Server → Client | طلب جديد (للمديرين) |
| `order-status-changed` | Server → Client | تغيير حالة طلب |
| `notification` | Server → Client | إشعار جديد |
| `refresh-stats` | Server → Client | تحديث إحصائيات |

---

## 11. نظام الدفع المتكامل

### الطرق المدعومة

| الطريقة | الوصف | المعالجة |
|---------|-------|---------|
| **COD** | الدفع عند الاستلام | لا حاجة لمعالجة فورية |
| **Card** | بطاقة ائتمان | تكامل مع بوابة الدفع + 3D Secure |
| **Bank Transfer** | تحويل بنكي | رفع إيصال + مراجعة يدوية |
| **Wallet** | محفظة إلكترونية | خصم فوري من الرصيد |

### البنك الليبي

```typescript
LIBYAN_BANKS = {
  nameAr: 'مصرف الجمهورية',
  nameEn: 'Republic Bank',
  accountName: 'نبض المدينة للتجارة الإلكترونية',
  accountNumber: '0123456789012',
  iban: 'LY00 0100 0000 0000 0012 3456 78',
  swiftCode: 'JUMOLYLA',
}
```

### حالة الدفع

```
pending → processing → completed
                    → failed
completed → refunded
```

### الاسترداد

- **محفظة:** إرجاع فوري للرصيد
- **أخرى:** تسجيل طلب استرداد

---

## 12. نظام الشحن والتوصيل

### محولات شركات الشحن (Adapter Pattern)

| المحول | الكود | التوصيل | التكلفة |
|--------|-------|---------|---------|
| **Libya Post** | `libya_post` | 5 أيام | 5 + 1.5/كغ |
| **Libya Express** | `libya_express` | 2 يوم | 8 + 2/كغ |
| **Local Delivery** | `local_delivery` | 1 يوم | 3 + 1/كغ |
| **Manual** | `manual` | يدوي | يدوي |

### حالة الشحنة

```
created → picked_up → in_transit → out_for_delivery → delivered
                                                  → failed → returned
```

### مناطق التوصيل

- 4 مناطق رئيسية: طرابلس المركز، الضواحي، المدن القريبة، التوصيل الوطني
- كل منطقة تحتوي مناطق فرعية مع رسوم وأوقات توصيل مختلفة
- شحن مجاني للطلبات فوق 100 دينار

---

## 13. نظام المصادقة والأمان

### المصادقة المحلية

- تسجيل دخول بالهاتف + كلمة مرور (bcrypt)
- تسجيل حساب جديد مع التحقق
- جلسات JWT مع رموز فريدة (jti)
- تحقق من الجلسة مع الخادم عند كل تحميل

### Google OAuth

- تكامل مع Google OAuth 2.0
- إنشاء حساب تلقائي عند أول تسجيل دخول

### الأمان

- تشفير كلمات المرور بـ bcrypt
- رموز JWT مع تاريخ انتهاء
- تحديد عدد الطلبات (Rate Limiting)
- سجل تدقيق لجميع العمليات الإدارية
- كشف الاحتيال (fraudScore, fraudFlagged)

---

## 14. نظام الإشعارات

### أنواع الإشعارات

| النوع | الوصف |
|-------|-------|
| `info` | معلومات عامة |
| `order` | تحديثات الطلبات |
| `promo` | عروض ترويجية |
| `system` | إشعارات النظام |

### قنوات الإشعارات

- **داخل التطبيق:** ويدجت جرس الإشعارات
- **إشعارات فورية:** FCM (web/android/ios)
- **بريد إلكتروني:** 10 قوالب بريد مختلفة
- **WebSocket:** إشعارات فورية في الوقت الحقيقي

### تتبع القراءة

- `NotificationReadStatus` لتتبع القراءة لكل مستخدم
- دعم الإشعارات المجمعة (broadcast) مع userId=null

---

## 15. نظام الولاء والمحفظة

### مستويات الولاء

| المستوى | النقاط المطلوبة | المزايا |
|---------|----------------|---------|
| **Bronze** | 0 | أساسية |
| **Silver** | 500 | خصم 5% |
| **Gold** | 1500 | خصم 10% + شحن مجاني |
| **Platinum** | 5000 | خصم 15% + شحن مجاني + أولوية |

### معاملات النقاط

- `earn`: كسب نقاط من المشتريات
- `redeem`: استبدال نقاط
- `expire`: انتهاء صلاحية النقاط
- `bonus`: نقاط مكافأة

### معاملات المحفظة

- `deposit`: إيداع
- `withdrawal`: سحب (شراء)
- `refund`: استرداد
- `cashback`: استرداد نقدي
- `adjustment`: تعديل (إداري)

---

## 16. نظام الكوبونات والخصومات

### أنواع الكوبونات

| النوع | الوصف | مثال |
|-------|-------|------|
| `percentage` | خصم نسبة مئوية | 10% خصم |
| `fixed` | خصم مبلغ ثابت | 5 دينار خصم |

### قواعد الكوبونات

- حد أدنى للطلب (`minOrder`)
- حد أقصى للخصم (`maxDiscount`)
- حد استخدام كلي (`usageLimit`)
- حد استخدام لكل مستخدم (`perUserLimit`)
- تاريخ بداية وانتهاء (`startsAt`, `expiresAt`)
- إعادة التحقق من الصلاحية عند الدفع

---

## 17. نظام التقييمات والمراجعات

- تقييم 1-5 نجوم مع تعليق
- عنوان اختياري
- صور مرفقة (JSON array)
- تحقق من شراء المنتج (`isVerified`)
- تقييم واحد لكل مستخدم لكل منتج (`@@unique([productId, userId])`)
- حوار كتابة تقييم منفصل (`write-review-dialog.tsx`)
- قسم عرض التقييمات (`product-reviews-section.tsx`)

---

## 18. نظام البحث المتقدم

### أنواع البحث

| النوع | API | الوصف |
|-------|-----|-------|
| **نصي** | `/api/products?search=` | بحث بالاسم والوصف |
| **بالصورة** | `/api/search/image` | البحث بالصورة باستخدام VLM |
| **صوتي** | `/api/search/voice` | البحث الصوتي باستخدام ASR |

### البحث في الكتالوج

- شريط بحث قابل للتوسيع في الهيدر
- شريط بحث في كتالوج المنتجات
- فلترة النتائج في الوقت الحقيقي
- عرض عدد النتائج

---

## 19. الذكاء الاصطناعي — المحادثة الذكية

### ويدجت المحادثة

- زر عائم في أسفل الشاشة مع نبضة متحركة
- لوحة محادثة مع رأس متدرج
- رسائل مستخدم ومساعد بأنماط مختلفة
- ردود سريعة مقترحة (4 أسئلة)
- مؤشر "يفكر..." أثناء انتظار الرد
- API: `/api/chat` (POST) مع تكامل z-ai-web-dev-sdk

### الأسئلة السريعة

1. ما المنتجات المتوفرة؟
2. كيف يعمل التوصيل؟
3. طرق الدفع المتاحة؟
4. تتبع طلبي

---

## 20. دعم اللغات والاتجاهات

### اللغات المدعومة

| اللغة | الكود | الاتجاه |
|-------|-------|---------|
| العربية | `ar` | RTL (يمين لليسار) |
| الإنجليزية | `en` | LTR (يسار لليمين) |

### مفاتيح الترجمة

- **+500 مفتاح ترجمة** للغتين
- فئات المفاتيح: hero, product, catalog, cart, checkout, payment, order, delivery, coupon, auth, profile, settings, chat, contact, sitemap, footer, admin, mobile, common, validation, offers, section, feature, nav, error

### الدعم الكامل لـ RTL

- جميع المكونات تدعم `direction="rtl"` و `direction="ltr"`
- استخدام `start`/`end` بدلاً من `left`/`right` في CSS
- تكيف تلقائي للرسوم المتحركة والكاروسيلات

---

## 21. التصميم والسمات (Themes)

### نظام الألوان

| اللون | المتغير | الاستخدام |
|-------|---------|-----------|
| Primary | `--nabdh-primary` | اللون الرئيسي (#004B63) |
| Accent | `--nabdh-accent` | اللون المميز (#00A8CC) |
| Secondary | `--nabdh-secondary` | اللون الثانوي (#FF6F61) |
| Gold | `--nabdh-gold` | الذهبي (#D4A843) |
| Price | `--nabdh-price` | لون الأسعار |
| Surface | `--nabdh-surface` | سطح البطاقات |

### الوضع الداكن/الفاتح

- تكامل مع `next-themes`
- تبديل سلس بين الأوضاع
- تدرجات لونية مختلفة لكل وضع
- دعم كامل في Hero, Header, Footer, وبطاقات المنتجات

### تأثيرات بصرية

- **Glass Morphism:** بطاقات شفافة مع ضبابية
- **Gradient Text:** نصوص متدرجة متحركة
- **Shimmer:** تأثير لمعان عند التمرير
- **Pulse Ring:** نبضة متحركة للأزرار العائمة
- **Badge Pulse:** نبضة للشارات
- **Hover Glow:** توهج عند التمرير
- **Img Zoom:** تكبير الصور عند التمرير
- **Back to Top:** زر عودة للأعلى مع ظهور تدريجي

### خطوط مخصصة

- تأثيرات حركية Framer Motion في جميع الأقسام
- Stagger children, whileInView, spring animations

---

## 22. تطبيق أندرويد (APK)

### التكوين

- **Capacitor v8** لتغليف التطبيق
- ملف `capacitor.config.json` للإعدادات
- مجلد `android/` كامل لمشروع أندرويد
- مفتاح توقيع الإصدار (`nabd-release-key.jks`)

### أوامر البناء

```bash
bun run apk:debug    # بناء نسخة تجريبية
bun run apk:release  # بناء نسخة إنتاجية
```

### صفحة التحميل

- `apk-download-page.tsx` — صفحة تحميل التطبيق
- `download-page.tsx` — صفحة تحميل بديلة
- API: `/api/download-apk` و `/api/download-mobile`

---

## 23. الإصلاحات الحرجة

### 🔴 1. خطأ الحلقة اللانهائية (Maximum Update Depth Exceeded)

**السبب الجذري:** استخدام `useLanguageStore` بدون `useShallow` في `footer.tsx`

```tsx
// ❌ قبل: كائن جديد كل مرة = إعادة تصيير لا نهائية
const { t, language } = useLanguageStore((s) => ({ t: s.t, language: s.language }));

// ✅ بعد: useShallow يقارن الخصائص سطحياً
const { t, language } = useLanguageStore(useShallow((s) => ({ t: s.t, language: s.language })));
```

**الآلية:** rehydrate() → كائن جديد → Object.is() = false → إعادة تصيير → كائن جديد → ♾️

### 🔴 2. خطأ مشابه في contact-page.tsx

استخدام `useState(() => {...})` بدلاً من `useEffect` لمؤقتات الخريطة وساعات العمل

```tsx
// ❌ قبل
useState(() => { const timer = setTimeout(...); return () => clearTimeout(timer); });

// ✅ بعد
useEffect(() => { const timer = setTimeout(...); return () => clearTimeout(timer); }, []);
```

### 🔴 3. الخريطة لا تظهر في صفحة التواصل

استبدال `<iframe>` المحظور بـ CSP بنظام مزدوج:
1. بلاطات OSM عبر `<img>`
2. خريطة CSS/SVG تفاعلية كاحتياطي

### 🔴 4. روابط التنقل لا تعمل

تحديث جميع روابط "تواصل معنا" من `#contact` إلى `navigateTo: 'contact'`

### 🔴 5. تكرار صفحات وروابط التواصل

- صفحة رئيسية: بطاقة ترويجية مختصرة بدلاً من قسم كامل
- الفوتر: "تواصل معنا" + "مركز المساعدة" بدون تكرار

---

## 24. إحصائيات المشروع

| المقياس | القيمة |
|---------|--------|
| **نماذج قاعدة البيانات** | 25+ نموذج |
| **مسارات API** | 70+ مسار |
| **مكونات المتجر** | 30+ مكون |
| **شاشات الموبايل** | 22 شاشة |
| **أقسام الإدارة** | 13 قسم |
| **مكونات UI (shadcn)** | 45+ مكون |
| **متاجر Zustand** | 7 متاجر |
| **مفاتيح الترجمة** | +500 مفتاح (عربي/إنجليزي) |
| **مكتبات مساعدة** | 15+ مكتبة |
| **خدمات مصغرة** | 3 خدمات |
| **فئات المنتجات** | 20 فئة |
| **منتجات البذر** | 100+ منتج |
| **صور المنتجات** | 140+ صورة |
| **صور الفئات** | 20 صورة |

---

## 📁 هيكل الملفات الرئيسي

```
src/
├── app/
│   ├── page.tsx                    # الصفحة الرئيسية
│   ├── layout.tsx                  # التخطيط العام
│   ├── globals.css                 # الأنماط العامة
│   ├── sitemap.ts                  # خريطة الموقع
│   ├── robots.ts                   # ملف الروبوتات
│   └── api/                        # مسارات API (70+)
│       ├── auth/                   # المصادقة
│       ├── products/               # المنتجات
│       ├── categories/             # الفئات
│       ├── orders/                 # الطلبات
│       ├── cart/                   # السلة
│       ├── favorites/              # المفضلة
│       ├── payment/                # الدفع
│       ├── shipping/               # الشحن
│       ├── shipping-companies/     # شركات الشحن
│       ├── delivery-zones/         # مناطق التوصيل
│       ├── coupons/                # الكوبونات
│       ├── wallet/                 # المحفظة
│       ├── loyalty/                # الولاء
│       ├── notifications/         # الإشعارات
│       ├── reviews/                # التقييمات
│       ├── contact/                # التواصل
│       ├── chat/                   # المحادثة
│       ├── search/                 # البحث
│       ├── addresses/              # العناوين
│       ├── users/                  # المستخدمون
│       ├── stats/                  # الإحصائيات
│       ├── sync/                   # المزامنة
│       ├── push-tokens/            # إشعارات FCM
│       ├── download/               # التحميل
│       └── admin/                  # مسارات الإدارة
├── components/
│   ├── store/                      # مكونات المتجر (30+)
│   ├── admin/                      # مكونات الإدارة (15+)
│   ├── mobile/                     # مكونات الموبايل (25+)
│   ├── ui/                         # مكونات shadcn/ui (45+)
│   └── theme-provider.tsx         # مزود السمة
├── stores/                         # متاجر Zustand (7)
├── hooks/                          # React Hooks
├── lib/                            # مكتبات مساعدة (15+)
└── middleware.ts                    # وسيط Next.js

mini-services/                      # الخدمات المصغرة
├── sync-service/                   # مزامنة WebSocket
├── download-service/               # خدمة التحميل
└── server-watchdog/                # مراقب الخادم

prisma/                             # قاعدة البيانات
├── schema.prisma                   # مخطط قاعدة البيانات
├── seed.ts                         # بذر البيانات
└── seed-shipping.ts                # بذر بيانات الشحن
```

---

> **آخر تحديث:** التوثيق الشامل من بداية التأسيس  
> **المشروع:** نبض المدينة — City Pulse 🏙️  
> **التقنيات:** Next.js 16 · TypeScript · Prisma · Tailwind CSS · Zustand · Framer Motion · shadcn/ui · Socket.IO · Capacitor
