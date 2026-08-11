-- ============================================================================
-- نبض المدينة (City Pulse) - Initial Schema Migration
-- قاعدة بيانات Supabase PostgreSQL
-- يتوافق مع Prisma schema الموجود (37 نموذج)
-- ============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Updated At Trigger Function ────────────────────────────────────────────
-- دالة تحديث تلقائي لحقل updatedAt عند أي تعديل
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ─── Users & Auth ───────────────────────────────────────────────────────────
-- ============================================================================

-- جدول المستخدمين
CREATE TABLE "User" (
    "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "supabase_uid"  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    "phone"         TEXT NOT NULL,
    "name"          TEXT,
    "email"         TEXT,
    "avatar"        TEXT,
    "passwordHash"  TEXT,
    "googleId"      TEXT,
    "provider"      TEXT DEFAULT 'local',
    "role"          TEXT NOT NULL DEFAULT 'customer',  -- customer, admin, vendor, driver
    "loyaltyTier"   TEXT NOT NULL DEFAULT 'bronze',     -- bronze, silver, gold, platinum
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "walletBalance" NUMERIC(12,2) NOT NULL DEFAULT 0,
    "language"      TEXT NOT NULL DEFAULT 'ar',         -- ar, en
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt"   TIMESTAMPTZ,
    "loginCount"    INTEGER NOT NULL DEFAULT 0,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "User_phone_key" UNIQUE ("phone"),
    CONSTRAINT "User_email_key" UNIQUE ("email"),
    CONSTRAINT "User_googleId_key" UNIQUE ("googleId")
);

CREATE INDEX "User_role_idx" ON "User" ("role");
CREATE INDEX "User_isActive_idx" ON "User" ("isActive");
CREATE INDEX "User_createdAt_idx" ON "User" ("createdAt");
CREATE INDEX "User_lastLoginAt_idx" ON "User" ("lastLoginAt");
CREATE INDEX "User_supabase_uid_idx" ON "User" ("supabase_uid");

CREATE TRIGGER "User_updatedAt"
    BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "User" IS 'جدول المستخدمين - بيانات الحسابات والمعلومات الشخصية';

-- جدول جلسات المستخدمين
CREATE TABLE "UserSession" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"      UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "token"       TEXT NOT NULL,
    "deviceInfo"  JSONB,          -- {platform, browser, os}
    "ipAddress"   TEXT,
    "platform"    TEXT NOT NULL DEFAULT 'web',  -- web, mobile, admin
    "expiresAt"   TIMESTAMPTZ NOT NULL,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "lastSeenAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "UserSession_token_key" UNIQUE ("token")
);

CREATE INDEX "UserSession_userId_idx" ON "UserSession" ("userId");
CREATE INDEX "UserSession_token_idx" ON "UserSession" ("token");
CREATE INDEX "UserSession_isActive_idx" ON "UserSession" ("isActive");
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession" ("expiresAt");
CREATE INDEX "UserSession_platform_idx" ON "UserSession" ("platform");

CREATE TRIGGER "UserSession_updatedAt"
    BEFORE UPDATE ON "UserSession"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "UserSession" IS 'جدول جلسات المستخدمين - تتبع تسجيل الدخول والأجهزة';

-- جدول العناوين
CREATE TABLE "Address" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "label"     TEXT NOT NULL,           -- home, work, etc.
    "address"   TEXT NOT NULL,
    "city"      TEXT NOT NULL,
    "area"      TEXT,
    "notes"     TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Address_userId_idx" ON "Address" ("userId");

CREATE TRIGGER "Address_updatedAt"
    BEFORE UPDATE ON "Address"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "Address" IS 'جدول عناوين المستخدمين - عناوين الشحن والتوصيل';

-- جدول تحقق OTP
CREATE TABLE "OTPVerification" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "phone"     TEXT NOT NULL,
    "code"      TEXT NOT NULL,
    "verified"  BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "OTPVerification_phone_idx" ON "OTPVerification" ("phone");
CREATE INDEX "OTPVerification_expiresAt_idx" ON "OTPVerification" ("expiresAt");

COMMENT ON TABLE "OTPVerification" IS 'جدول تحقق رمز OTP - أكواد التحقق عبر الهاتف';

-- ============================================================================
-- ─── Product Catalog ────────────────────────────────────────────────────────
-- ============================================================================

-- جدول الأقسام (الفئات)
CREATE TABLE "Category" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nameAr"      TEXT NOT NULL,
    "nameEn"      TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "description" TEXT,
    "icon"        TEXT,
    "image"       TEXT,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    "phase"       TEXT NOT NULL DEFAULT 'ACTIVE_MVP',  -- ACTIVE_MVP, PHASE_2, PHASE_3, PHASE_4
    "attributes"  JSONB,              -- مخطط الخصائص الديناميكية للقسم
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "parentId"    UUID REFERENCES "Category"("id") ON DELETE SET NULL,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Category_slug_key" UNIQUE ("slug")
);

CREATE INDEX "Category_isActive_idx" ON "Category" ("isActive");
CREATE INDEX "Category_sortOrder_idx" ON "Category" ("sortOrder");
CREATE INDEX "Category_parentId_idx" ON "Category" ("parentId");

CREATE TRIGGER "Category_updatedAt"
    BEFORE UPDATE ON "Category"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "Category" IS 'جدول الأقسام - تصنيفات المنتجات الهرمية';

-- جدول المنتجات
CREATE TABLE "Product" (
    "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "categoryId"    UUID NOT NULL REFERENCES "Category"("id") ON DELETE RESTRICT,
    "vendorId"      UUID,
    "nameAr"        TEXT NOT NULL,
    "nameEn"        TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "sku"           TEXT NOT NULL,
    "price"         NUMERIC(12,2) NOT NULL,
    "comparePrice"  NUMERIC(12,2),
    "costPrice"     NUMERIC(12,2),
    "images"        JSONB NOT NULL,        -- مصفوفة روابط الصور
    "mainImage"     TEXT,
    "video"         TEXT,
    "stock"         INTEGER NOT NULL DEFAULT 0,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "weight"        NUMERIC(8,2),           -- الوزن بالكيلوغرام
    "dimensions"    JSONB,                  -- {w, h, d}
    "attributes"    JSONB,                  -- خصائص ديناميكية حسب القسم
    "badges"        JSONB,                  -- ["new", "sale", "bestseller"]
    "rating"        NUMERIC(3,2) NOT NULL DEFAULT 0,
    "reviewCount"   INTEGER NOT NULL DEFAULT 0,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "isFeatured"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Product_sku_key" UNIQUE ("sku")
);

CREATE INDEX "Product_categoryId_idx" ON "Product" ("categoryId");
CREATE INDEX "Product_vendorId_idx" ON "Product" ("vendorId");
CREATE INDEX "Product_isActive_idx" ON "Product" ("isActive");
CREATE INDEX "Product_isFeatured_idx" ON "Product" ("isFeatured");
CREATE INDEX "Product_createdAt_idx" ON "Product" ("createdAt");
CREATE INDEX "Product_rating_idx" ON "Product" ("rating");

CREATE TRIGGER "Product_updatedAt"
    BEFORE UPDATE ON "Product"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "Product" IS 'جدول المنتجات - كتالوج المنتجات الكامل';

-- ============================================================================
-- ─── Shopping Cart ──────────────────────────────────────────────────────────
-- ============================================================================

-- جدول عناصر سلة التسوق
CREATE TABLE "CartItem" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "quantity"  INTEGER NOT NULL DEFAULT 1,
    "reserved"  BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "CartItem_userId_productId_key" UNIQUE ("userId", "productId")
);

CREATE INDEX "CartItem_userId_idx" ON "CartItem" ("userId");
CREATE INDEX "CartItem_productId_idx" ON "CartItem" ("productId");

CREATE TRIGGER "CartItem_updatedAt"
    BEFORE UPDATE ON "CartItem"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "CartItem" IS 'جدول سلة التسوق - منتجات في سلة المستخدم';

-- ============================================================================
-- ─── Orders ─────────────────────────────────────────────────────────────────
-- ============================================================================

-- جدول الطلبات
CREATE TABLE "Order" (
    "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"            UUID NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
    "orderNumber"       TEXT NOT NULL,
    "status"            TEXT NOT NULL DEFAULT 'pending',      -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
    "paymentMethod"     TEXT NOT NULL DEFAULT 'cod',           -- cod, card, bank_transfer
    "paymentStatus"     TEXT NOT NULL DEFAULT 'pending',      -- pending, paid, failed, refunded
    "subtotal"          NUMERIC(12,2) NOT NULL,
    "deliveryFee"       NUMERIC(12,2) NOT NULL DEFAULT 0,
    "discount"          NUMERIC(12,2) NOT NULL DEFAULT 0,
    "total"             NUMERIC(12,2) NOT NULL,
    "currency"          TEXT NOT NULL DEFAULT 'LYD',
    "notes"             TEXT,
    "couponId"          UUID,
    "fraudScore"        INTEGER NOT NULL DEFAULT 0,
    "fraudFlagged"      BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt"       TIMESTAMPTZ,
    "cancelledAt"       TIMESTAMPTZ,
    "refundedAt"        TIMESTAMPTZ,
    "refundAmount"      NUMERIC(12,2) NOT NULL DEFAULT 0,
    "refundReason"      TEXT,
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    "addressId"         UUID UNIQUE REFERENCES "Address"("id") ON DELETE SET NULL,
    "shippingCompanyId" UUID,

    CONSTRAINT "Order_orderNumber_key" UNIQUE ("orderNumber")
);

CREATE INDEX "Order_userId_idx" ON "Order" ("userId");
CREATE INDEX "Order_status_idx" ON "Order" ("status");
CREATE INDEX "Order_paymentStatus_idx" ON "Order" ("paymentStatus");
CREATE INDEX "Order_createdAt_idx" ON "Order" ("createdAt");
CREATE INDEX "Order_shippingCompanyId_idx" ON "Order" ("shippingCompanyId");

CREATE TRIGGER "Order_updatedAt"
    BEFORE UPDATE ON "Order"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "Order" IS 'جدول الطلبات - طلبات الشراء والتوصيل';

-- جدول عناصر الطلب
CREATE TABLE "OrderItem" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId"   UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT,
    "nameAr"    TEXT NOT NULL,
    "nameEn"    TEXT NOT NULL,
    "price"     NUMERIC(12,2) NOT NULL,
    "quantity"  INTEGER NOT NULL,
    "total"     NUMERIC(12,2) NOT NULL,
    "image"     TEXT
);

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem" ("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem" ("productId");

COMMENT ON TABLE "OrderItem" IS 'جدول عناصر الطلب - المنتجات داخل كل طلب';

-- جدول سجل حالات الطلب
CREATE TABLE "OrderStatusLog" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId"   UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "status"    TEXT NOT NULL,
    "note"      TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "OrderStatusLog_orderId_idx" ON "OrderStatusLog" ("orderId");
CREATE INDEX "OrderStatusLog_createdAt_idx" ON "OrderStatusLog" ("createdAt");

COMMENT ON TABLE "OrderStatusLog" IS 'جدول سجل حالات الطلب - تتبع تغييرات حالة الطلب';

-- ============================================================================
-- ─── Coupons & Discounts ───────────────────────────────────────────────────
-- ============================================================================

-- جدول كوبونات الخصم
CREATE TABLE "Coupon" (
    "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code"           TEXT NOT NULL,
    "descriptionAr"  TEXT,
    "descriptionEn"  TEXT,
    "type"           TEXT NOT NULL DEFAULT 'percentage',  -- percentage, fixed
    "value"          NUMERIC(12,2) NOT NULL,
    "minOrder"       NUMERIC(12,2) NOT NULL DEFAULT 0,
    "maxDiscount"    NUMERIC(12,2),
    "usageLimit"     INTEGER,
    "usageCount"     INTEGER NOT NULL DEFAULT 0,
    "perUserLimit"   INTEGER NOT NULL DEFAULT 1,
    "startsAt"       TIMESTAMPTZ NOT NULL,
    "expiresAt"      TIMESTAMPTZ NOT NULL,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Coupon_code_key" UNIQUE ("code")
);

CREATE INDEX "Coupon_isActive_idx" ON "Coupon" ("isActive");
CREATE INDEX "Coupon_expiresAt_idx" ON "Coupon" ("expiresAt");

CREATE TRIGGER "Coupon_updatedAt"
    BEFORE UPDATE ON "Coupon"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "Coupon" IS 'جدول كوبونات الخصم - أكواد الخصم والعروض';

-- ============================================================================
-- ─── Delivery Zones ─────────────────────────────────────────────────────────
-- ============================================================================

-- جدول مناطق التوصيل
CREATE TABLE "DeliveryZone" (
    "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nameAr"        TEXT NOT NULL,
    "nameEn"        TEXT NOT NULL,
    "city"          TEXT NOT NULL,
    "region"        TEXT NOT NULL DEFAULT 'طرابلس',
    "area"          TEXT,
    "fee"           NUMERIC(12,2) NOT NULL DEFAULT 10,
    "freeAbove"     NUMERIC(12,2) DEFAULT 100,
    "estimatedDays" INTEGER NOT NULL DEFAULT 3,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "DeliveryZone_city_idx" ON "DeliveryZone" ("city");
CREATE INDEX "DeliveryZone_region_idx" ON "DeliveryZone" ("region");
CREATE INDEX "DeliveryZone_isActive_idx" ON "DeliveryZone" ("isActive");

CREATE TRIGGER "DeliveryZone_updatedAt"
    BEFORE UPDATE ON "DeliveryZone"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "DeliveryZone" IS 'جدول مناطق التوصيل - المدن والمناطق مع رسوم الشحن';

-- ============================================================================
-- ─── Push Notification Tokens ──────────────────────────────────────────────
-- ============================================================================

-- جدول رموز الإشعارات
CREATE TABLE "PushToken" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "token"     TEXT NOT NULL,        -- FCM device token
    "platform"  TEXT NOT NULL DEFAULT 'web',  -- web, android, ios
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "PushToken_userId_token_key" UNIQUE ("userId", "token")
);

CREATE INDEX "PushToken_userId_idx" ON "PushToken" ("userId");
CREATE INDEX "PushToken_token_idx" ON "PushToken" ("token");
CREATE INDEX "PushToken_isActive_idx" ON "PushToken" ("isActive");

CREATE TRIGGER "PushToken_updatedAt"
    BEFORE UPDATE ON "PushToken"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "PushToken" IS 'جدول رموز الإشعارات - رموز أجهزة المستخدمين للإشعارات';

-- ============================================================================
-- ─── Notifications ──────────────────────────────────────────────────────────
-- ============================================================================

-- جدول الإشعارات
CREATE TABLE "Notification" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID REFERENCES "User"("id") ON DELETE CASCADE,
    "titleAr"   TEXT NOT NULL,
    "titleEn"   TEXT NOT NULL,
    "bodyAr"    TEXT NOT NULL,
    "bodyEn"    TEXT NOT NULL,
    "type"      TEXT NOT NULL DEFAULT 'info',  -- info, order, promo, system
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Notification_userId_idx" ON "Notification" ("userId");
CREATE INDEX "Notification_createdAt_idx" ON "Notification" ("createdAt");

COMMENT ON TABLE "Notification" IS 'جدول الإشعارات - إشعارات المستخدمين والنظام';

-- جدول حالة قراءة الإشعارات
CREATE TABLE "NotificationReadStatus" (
    "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"         UUID NOT NULL,
    "notificationId" UUID NOT NULL REFERENCES "Notification"("id") ON DELETE CASCADE,
    "readAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "NotificationReadStatus_userId_notificationId_key" UNIQUE ("userId", "notificationId")
);

CREATE INDEX "NotificationReadStatus_userId_idx" ON "NotificationReadStatus" ("userId");
CREATE INDEX "NotificationReadStatus_notificationId_idx" ON "NotificationReadStatus" ("notificationId");

COMMENT ON TABLE "NotificationReadStatus" IS 'جدول حالة قراءة الإشعارات - تتبع قراءة كل مستخدم للإشعارات';

-- ============================================================================
-- ─── Feature Flags ──────────────────────────────────────────────────────────
-- ============================================================================

-- جدول أعلام الميزات
CREATE TABLE "FeatureFlag" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "key"         TEXT NOT NULL,
    "value"       BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "FeatureFlag_key_key" UNIQUE ("key")
);

CREATE TRIGGER "FeatureFlag_updatedAt"
    BEFORE UPDATE ON "FeatureFlag"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "FeatureFlag" IS 'جدول أعلام الميزات - التحكم في تفعيل الميزات ديناميكياً';

-- ============================================================================
-- ─── Audit Log ──────────────────────────────────────────────────────────────
-- ============================================================================

-- جدول سجل المراجعة
CREATE TABLE "AuditLog" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "action"    TEXT NOT NULL,
    "entity"    TEXT NOT NULL,
    "entityId"  UUID,
    "details"   JSONB,
    "ip"        TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "AuditLog_action_idx" ON "AuditLog" ("action");
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog" ("entity");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog" ("createdAt");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog" ("userId");

COMMENT ON TABLE "AuditLog" IS 'جدول سجل المراجعة - تتبع جميع العمليات في النظام';

-- ============================================================================
-- ─── Financial Ledger ──────────────────────────────────────────────────────
-- ============================================================================

-- جدول الحسابات المحاسبية
CREATE TABLE "LedgerAccount" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code"      TEXT NOT NULL,        -- كود الحساب مثل "1000", "2000"
    "nameAr"    TEXT NOT NULL,        -- الاسم بالعربي
    "nameEn"    TEXT NOT NULL,        -- الاسم بالإنجليزي
    "type"      TEXT NOT NULL,        -- asset, liability, equity, revenue, expense
    "category"  TEXT NOT NULL,        -- مثل "current_asset", "operating_revenue"
    "balance"   NUMERIC(12,2) NOT NULL DEFAULT 0,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "LedgerAccount_code_key" UNIQUE ("code")
);

CREATE INDEX "LedgerAccount_type_idx" ON "LedgerAccount" ("type");
CREATE INDEX "LedgerAccount_isActive_idx" ON "LedgerAccount" ("isActive");

CREATE TRIGGER "LedgerAccount_updatedAt"
    BEFORE UPDATE ON "LedgerAccount"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "LedgerAccount" IS 'جدول الحسابات المحاسبية - دليل الحسابات للمحاسبة';

-- جدول القيود المحاسبية
CREATE TABLE "JournalEntry" (
    "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "entryNumber"   TEXT NOT NULL,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "reference"     TEXT,              -- رقم الطلب، الفاتورة، إلخ
    "entryDate"     TIMESTAMPTZ NOT NULL,
    "status"        TEXT NOT NULL DEFAULT 'draft',  -- draft, posted, voided
    "createdBy"     UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "JournalEntry_entryNumber_key" UNIQUE ("entryNumber")
);

CREATE INDEX "JournalEntry_status_idx" ON "JournalEntry" ("status");
CREATE INDEX "JournalEntry_entryDate_idx" ON "JournalEntry" ("entryDate");

CREATE TRIGGER "JournalEntry_updatedAt"
    BEFORE UPDATE ON "JournalEntry"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "JournalEntry" IS 'جدول القيود المحاسبية - القيود اليومية';

-- جدول بنود القيد المحاسبي
CREATE TABLE "JournalEntryLine" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "entryId"     UUID NOT NULL REFERENCES "JournalEntry"("id") ON DELETE CASCADE,
    "accountId"   UUID NOT NULL REFERENCES "LedgerAccount"("id") ON DELETE RESTRICT,
    "debit"       NUMERIC(12,2) NOT NULL DEFAULT 0,
    "credit"      NUMERIC(12,2) NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "JournalEntryLine_entryId_idx" ON "JournalEntryLine" ("entryId");
CREATE INDEX "JournalEntryLine_accountId_idx" ON "JournalEntryLine" ("accountId");

COMMENT ON TABLE "JournalEntryLine" IS 'جدول بنود القيد المحاسبي - تفاصيل المدين والدائن';

-- ============================================================================
-- ─── Vendor (Multi-Vendor Phase 4) ─────────────────────────────────────────
-- ============================================================================

-- جدول البائعين
CREATE TABLE "Vendor" (
    "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nameAr"        TEXT NOT NULL,
    "nameEn"        TEXT NOT NULL,
    "type"          TEXT NOT NULL DEFAULT 'RETAILER',  -- RETAILER, BRAND_OFFICIAL, LOCAL_ARTISAN, SERVICE_PROVIDER
    "commission"    NUMERIC(5,2) NOT NULL DEFAULT 10,
    "phone"         TEXT,
    "email"         TEXT,
    "logo"          TEXT,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "bankInfo"      JSONB,             -- {bankName, iban, accountHolder}
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "isVerified"    BOOLEAN NOT NULL DEFAULT false,
    "rating"        NUMERIC(3,2) NOT NULL DEFAULT 0,
    "totalSales"    NUMERIC(12,2) NOT NULL DEFAULT 0,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Vendor_isActive_idx" ON "Vendor" ("isActive");
CREATE INDEX "Vendor_isVerified_idx" ON "Vendor" ("isVerified");

CREATE TRIGGER "Vendor_updatedAt"
    BEFORE UPDATE ON "Vendor"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "Vendor" IS 'جدول البائعين - بيانات البائعين للنظام متعدد البائعين';

-- جدول مدفوعات البائعين
CREATE TABLE "VendorPayout" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "vendorId"    UUID NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
    "amount"      NUMERIC(12,2) NOT NULL,
    "currency"    TEXT NOT NULL DEFAULT 'LYD',
    "status"      TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed
    "periodStart" TIMESTAMPTZ NOT NULL,
    "periodEnd"   TIMESTAMPTZ NOT NULL,
    "note"        TEXT,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "VendorPayout_vendorId_idx" ON "VendorPayout" ("vendorId");
CREATE INDEX "VendorPayout_status_idx" ON "VendorPayout" ("status");

CREATE TRIGGER "VendorPayout_updatedAt"
    BEFORE UPDATE ON "VendorPayout"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "VendorPayout" IS 'جدول مدفوعات البائعين - تحويلات أرباح البائعين';

-- ============================================================================
-- ─── Reviews ───────────────────────────────────────────────────────────────
-- ============================================================================

-- جدول التقييمات
CREATE TABLE "Review" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "userId"    UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "rating"    INTEGER NOT NULL,       -- 1-5
    "title"     TEXT,
    "comment"   TEXT,
    "images"    JSONB,                  -- مصفوفة روابط صور التقييم
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Review_productId_userId_key" UNIQUE ("productId", "userId")
);

CREATE INDEX "Review_productId_idx" ON "Review" ("productId");
CREATE INDEX "Review_userId_idx" ON "Review" ("userId");
CREATE INDEX "Review_isActive_idx" ON "Review" ("isActive");
CREATE INDEX "Review_rating_idx" ON "Review" ("rating");

CREATE TRIGGER "Review_updatedAt"
    BEFORE UPDATE ON "Review"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "Review" IS 'جدول التقييمات - تقييمات ومراجعات المنتجات من المستخدمين';

-- ============================================================================
-- ─── Inventory Movements ──────────────────────────────────────────────────
-- ============================================================================

-- جدول حركات المخزون
CREATE TABLE "InventoryMovement" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "type"      TEXT NOT NULL,          -- in, out, reservation, release, adjustment, return
    "quantity"  INTEGER NOT NULL,
    "reference" TEXT,                   -- رقم الطلب، ملاحظة التعديل، إلخ
    "note"      TEXT,
    "createdBy" UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "InventoryMovement_productId_idx" ON "InventoryMovement" ("productId");
CREATE INDEX "InventoryMovement_type_idx" ON "InventoryMovement" ("type");
CREATE INDEX "InventoryMovement_createdAt_idx" ON "InventoryMovement" ("createdAt");

COMMENT ON TABLE "InventoryMovement" IS 'جدول حركات المخزون - تتبع دخول وخروج المخزون';

-- ============================================================================
-- ─── Loyalty Transactions ─────────────────────────────────────────────────
-- ============================================================================

-- جدول معاملات الولاء
CREATE TABLE "LoyaltyTransaction" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"      UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type"        TEXT NOT NULL,         -- earn, redeem, expire, bonus
    "points"      INTEGER NOT NULL,
    "orderId"     UUID REFERENCES "Order"("id") ON DELETE SET NULL,
    "description" TEXT,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "LoyaltyTransaction_userId_idx" ON "LoyaltyTransaction" ("userId");
CREATE INDEX "LoyaltyTransaction_type_idx" ON "LoyaltyTransaction" ("type");
CREATE INDEX "LoyaltyTransaction_createdAt_idx" ON "LoyaltyTransaction" ("createdAt");

COMMENT ON TABLE "LoyaltyTransaction" IS 'جدول معاملات الولاء - نقاط الولاء والمكافآت';

-- ============================================================================
-- ─── Wallet Transactions ─────────────────────────────────────────────────
-- ============================================================================

-- جدول معاملات المحفظة
CREATE TABLE "WalletTransaction" (
    "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"      UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type"        TEXT NOT NULL,         -- deposit, withdrawal, refund, cashback, adjustment
    "amount"      NUMERIC(12,2) NOT NULL,
    "currency"    TEXT NOT NULL DEFAULT 'LYD',
    "reference"   TEXT,                  -- رقم الطلب، رقم التحويل، إلخ
    "description" TEXT,
    "status"      TEXT NOT NULL DEFAULT 'completed',  -- pending, completed, failed
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "WalletTransaction_userId_idx" ON "WalletTransaction" ("userId");
CREATE INDEX "WalletTransaction_type_idx" ON "WalletTransaction" ("type");
CREATE INDEX "WalletTransaction_createdAt_idx" ON "WalletTransaction" ("createdAt");

COMMENT ON TABLE "WalletTransaction" IS 'جدول معاملات المحفظة - إيداعات وسحوبات ورصيد المحفظة';

-- ============================================================================
-- ─── Shipping Carriers ──────────────────────────────────────────────────────
-- ============================================================================

-- جدول شركات الشحن (المفصل)
CREATE TABLE "ShippingCarrier" (
    "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nameAr"          TEXT NOT NULL,
    "nameEn"          TEXT NOT NULL,
    "code"            TEXT NOT NULL,       -- مثل "libya_post", "tawfik", "alnour"
    "type"            TEXT NOT NULL DEFAULT 'national',  -- local, national, international
    "phone"           TEXT,
    "email"           TEXT,
    "website"         TEXT,
    "logo"            TEXT,
    "apiEndpoint"     TEXT,
    "apiKey"          TEXT,                -- مشفر في الإنتاج
    "apiSecret"       TEXT,                -- مشفر في الإنتاج
    "webhookUrl"      TEXT,
    "trackingUrl"     TEXT,                -- قالب: {trackingNumber}
    "coverageAreas"   JSONB,               -- مصفوفة المدن/المناطق المغطاة
    "maxWeight"       NUMERIC(8,2) DEFAULT 30,
    "pricePerKg"      NUMERIC(12,2) NOT NULL DEFAULT 1.5,
    "basePrice"       NUMERIC(12,2) NOT NULL DEFAULT 5,
    "codFee"          NUMERIC(5,2) NOT NULL DEFAULT 0,
    "codFixedFee"     NUMERIC(12,2) NOT NULL DEFAULT 0,
    "estimatedDays"   INTEGER NOT NULL DEFAULT 3,
    "isActive"        BOOLEAN NOT NULL DEFAULT true,
    "isIntegrated"    BOOLEAN NOT NULL DEFAULT false,
    "integrationType" TEXT NOT NULL DEFAULT 'manual',  -- manual, api, webhook
    "rating"          NUMERIC(3,2) NOT NULL DEFAULT 0,
    "totalShipments"  INTEGER NOT NULL DEFAULT 0,
    "successRate"     NUMERIC(5,2) NOT NULL DEFAULT 0,
    "avgDeliveryDays" NUMERIC(5,2) NOT NULL DEFAULT 0,
    "notes"           TEXT,
    "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "ShippingCarrier_code_key" UNIQUE ("code")
);

CREATE INDEX "ShippingCarrier_isActive_idx" ON "ShippingCarrier" ("isActive");
CREATE INDEX "ShippingCarrier_type_idx" ON "ShippingCarrier" ("type");
CREATE INDEX "ShippingCarrier_code_idx" ON "ShippingCarrier" ("code");

CREATE TRIGGER "ShippingCarrier_updatedAt"
    BEFORE UPDATE ON "ShippingCarrier"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "ShippingCarrier" IS 'جدول شركات الشحن - شركات النقل والتوصيل مع تكامل API';

-- ============================================================================
-- ─── Shipments ──────────────────────────────────────────────────────────────
-- ============================================================================

-- جدول الشحنات
CREATE TABLE "Shipment" (
    "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId"          UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "carrierId"        UUID NOT NULL REFERENCES "ShippingCarrier"("id") ON DELETE RESTRICT,
    "trackingNumber"   TEXT,
    "waybillNumber"    TEXT,
    "status"           TEXT NOT NULL DEFAULT 'created',  -- created, picked_up, in_transit, out_for_delivery, delivered, failed, returned
    "weight"           NUMERIC(8,2),              -- الوزن الفعلي بالكيلوغرام
    "shippingCost"     NUMERIC(12,2) NOT NULL DEFAULT 0,
    "codAmount"        NUMERIC(12,2) NOT NULL DEFAULT 0,
    "codCollected"     BOOLEAN NOT NULL DEFAULT false,
    "estimatedPickup"  TIMESTAMPTZ,
    "actualPickup"     TIMESTAMPTZ,
    "estimatedDelivery" TIMESTAMPTZ,
    "actualDelivery"   TIMESTAMPTZ,
    "failedAttempts"   INTEGER NOT NULL DEFAULT 0,
    "failureReason"    TEXT,
    "notes"            TEXT,
    "carrierData"      JSONB,                     -- استجابة خام من API شركة الشحن
    "lastSyncedAt"     TIMESTAMPTZ,
    "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "Shipment_orderId_key" UNIQUE ("orderId")
);

CREATE INDEX "Shipment_carrierId_idx" ON "Shipment" ("carrierId");
CREATE INDEX "Shipment_status_idx" ON "Shipment" ("status");
CREATE INDEX "Shipment_trackingNumber_idx" ON "Shipment" ("trackingNumber");
CREATE INDEX "Shipment_createdAt_idx" ON "Shipment" ("createdAt");

CREATE TRIGGER "Shipment_updatedAt"
    BEFORE UPDATE ON "Shipment"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "Shipment" IS 'جدول الشحنات - تتبع شحنات الطلبات مع شركات الشحن';

-- جدول سجل تتبع الشحن
CREATE TABLE "ShipmentLog" (
    "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "shipmentId"    UUID NOT NULL REFERENCES "Shipment"("id") ON DELETE CASCADE,
    "status"        TEXT NOT NULL,
    "location"      TEXT,               -- المدينة، اسم المحطة، إلخ
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "latitude"      NUMERIC(10,7),
    "longitude"     NUMERIC(10,7),
    "occurredAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "ShipmentLog_shipmentId_idx" ON "ShipmentLog" ("shipmentId");
CREATE INDEX "ShipmentLog_occurredAt_idx" ON "ShipmentLog" ("occurredAt");

COMMENT ON TABLE "ShipmentLog" IS 'جدول سجل تتبع الشحن - تتبع تحركات الشحنة';

-- ============================================================================
-- ─── Shipping Companies ────────────────────────────────────────────────────
-- ============================================================================

-- جدول شركات الشحن (الأساسي)
CREATE TABLE "ShippingCompany" (
    "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "nameAr"          TEXT NOT NULL,
    "nameEn"          TEXT NOT NULL,
    "slug"            TEXT NOT NULL,
    "logo"            TEXT,
    "phone"           TEXT,
    "email"           TEXT,
    "website"         TEXT,
    "descriptionAr"   TEXT,
    "descriptionEn"   TEXT,
    "apiEndpoint"     TEXT,
    "apiKey"          TEXT,               -- مشفر في الإنتاج
    "apiSecret"       TEXT,               -- مشفر في الإنتاج
    "trackingUrl"     TEXT,               -- قالب: {trackingNumber}
    "isActive"        BOOLEAN NOT NULL DEFAULT true,
    "isDefault"       BOOLEAN NOT NULL DEFAULT false,
    "sortOrder"       INTEGER NOT NULL DEFAULT 0,
    "baseFee"         NUMERIC(12,2) NOT NULL DEFAULT 0,
    "freeAbove"       NUMERIC(12,2) DEFAULT 0,
    "weightLimit"     NUMERIC(8,2) DEFAULT 30,
    "codSupported"    BOOLEAN NOT NULL DEFAULT true,
    "codFee"          NUMERIC(12,2) NOT NULL DEFAULT 0,
    "coverageType"    TEXT NOT NULL DEFAULT 'all',  -- all أو regional
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "successRate"     NUMERIC(5,2) NOT NULL DEFAULT 0,
    "avgDeliveryDays" INTEGER NOT NULL DEFAULT 3,
    "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "ShippingCompany_slug_key" UNIQUE ("slug")
);

CREATE INDEX "ShippingCompany_isActive_idx" ON "ShippingCompany" ("isActive");
CREATE INDEX "ShippingCompany_slug_idx" ON "ShippingCompany" ("slug");
CREATE INDEX "ShippingCompany_sortOrder_idx" ON "ShippingCompany" ("sortOrder");

CREATE TRIGGER "ShippingCompany_updatedAt"
    BEFORE UPDATE ON "ShippingCompany"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "ShippingCompany" IS 'جدول شركات الشحن - شركات التوصيل المتاحة في ليبيا';

-- جدول مناطق تغطية الشحن
CREATE TABLE "ShippingCoverageZone" (
    "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "companyId"    UUID NOT NULL REFERENCES "ShippingCompany"("id") ON DELETE CASCADE,
    "regionId"     TEXT,              -- مثل 'central', 'western', 'eastern', 'southern'
    "regionNameAr" TEXT,
    "cityName"     TEXT NOT NULL,
    "areaName"     TEXT,
    "fee"          NUMERIC(12,2) NOT NULL DEFAULT 0,
    "freeAbove"    NUMERIC(12,2) DEFAULT 0,
    "estimatedDays" INTEGER NOT NULL DEFAULT 3,
    "isActive"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "ShippingCoverageZone_companyId_idx" ON "ShippingCoverageZone" ("companyId");
CREATE INDEX "ShippingCoverageZone_cityName_idx" ON "ShippingCoverageZone" ("cityName");
CREATE INDEX "ShippingCoverageZone_regionId_idx" ON "ShippingCoverageZone" ("regionId");
CREATE INDEX "ShippingCoverageZone_isActive_idx" ON "ShippingCoverageZone" ("isActive");

CREATE TRIGGER "ShippingCoverageZone_updatedAt"
    BEFORE UPDATE ON "ShippingCoverageZone"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "ShippingCoverageZone" IS 'جدول مناطق تغطية الشحن - المدن والمناطق التي تغطيها كل شركة';

-- ============================================================================
-- ─── Email Log ──────────────────────────────────────────────────────────────
-- ============================================================================

-- جدول سجل البريد الإلكتروني
CREATE TABLE "EmailLog" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "to"        TEXT NOT NULL,
    "subjectAr" TEXT NOT NULL,
    "subjectEn" TEXT NOT NULL,
    "template"  TEXT NOT NULL,        -- welcome, order_confirmation, order_shipped, order_delivered, otp, password_reset, payment_confirmed, wallet_deposit, promo
    "status"    TEXT NOT NULL DEFAULT 'pending',  -- pending, sent, failed
    "data"      JSONB,                -- متغيرات القالب
    "error"     TEXT,
    "sentAt"    TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "EmailLog_userId_idx" ON "EmailLog" ("userId");
CREATE INDEX "EmailLog_status_idx" ON "EmailLog" ("status");
CREATE INDEX "EmailLog_template_idx" ON "EmailLog" ("template");
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog" ("createdAt");

COMMENT ON TABLE "EmailLog" IS 'جدول سجل البريد الإلكتروني - تتبع رسائل البريد المرسلة';

-- ============================================================================
-- ─── Favorite Items ────────────────────────────────────────────────────────
-- ============================================================================

-- جدول المفضلات
CREATE TABLE "FavoriteItem" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId"    UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "FavoriteItem_userId_productId_key" UNIQUE ("userId", "productId")
);

CREATE INDEX "FavoriteItem_userId_idx" ON "FavoriteItem" ("userId");
CREATE INDEX "FavoriteItem_productId_idx" ON "FavoriteItem" ("productId");

COMMENT ON TABLE "FavoriteItem" IS 'جدول المفضلات - المنتجات المفضلة لدى المستخدم';

-- ============================================================================
-- ─── Store Settings ────────────────────────────────────────────────────────
-- ============================================================================

-- جدول إعدادات المتجر
CREATE TABLE "StoreSetting" (
    "key"       TEXT PRIMARY KEY,
    "value"     TEXT NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER "StoreSetting_updatedAt"
    BEFORE UPDATE ON "StoreSetting"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "StoreSetting" IS 'جدول إعدادات المتجر - إعدادات التطبيق العامة';

-- ============================================================================
-- ─── Contact Messages ──────────────────────────────────────────────────────
-- ============================================================================

-- جدول رسائل التواصل
CREATE TABLE "ContactMessage" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"      TEXT NOT NULL,
    "phone"     TEXT NOT NULL,
    "email"     TEXT,
    "category"  TEXT NOT NULL DEFAULT 'general',  -- general, order, complaint, suggestion, technical, return
    "subject"   TEXT,
    "message"   TEXT NOT NULL,
    "status"    TEXT NOT NULL DEFAULT 'new',       -- new, read, replied, closed
    "userId"    UUID REFERENCES "User"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage" ("status");
CREATE INDEX "ContactMessage_category_idx" ON "ContactMessage" ("category");
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage" ("createdAt");

CREATE TRIGGER "ContactMessage_updatedAt"
    BEFORE UPDATE ON "ContactMessage"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "ContactMessage" IS 'جدول رسائل التواصل - رسائل الدعم الفني والاستفسارات';

-- ============================================================================
-- ─── Payment Transactions ─────────────────────────────────────────────────
-- ============================================================================

-- جدول معاملات الدفع
CREATE TABLE "PaymentTransaction" (
    "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId"       UUID REFERENCES "Order"("id") ON DELETE SET NULL,
    "userId"        UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "amount"        NUMERIC(12,2) NOT NULL,
    "currency"      TEXT NOT NULL DEFAULT 'LYD',
    "method"        TEXT NOT NULL,           -- card, bank_transfer, wallet, cod
    "status"        TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed, refunded, cancelled
    "gatewayTxnId"  TEXT,
    "gatewayName"   TEXT,                   -- مثل "sadad", "moflihpay", "wallet"
    "cardLast4"     TEXT,
    "cardBrand"     TEXT,                   -- visa, mastercard, etc.
    "bankReference" TEXT,
    "receiptUrl"    TEXT,
    "metadata"      JSONB,
    "refundReason"  TEXT,
    "refundedAt"    TIMESTAMPTZ,
    "paidAt"        TIMESTAMPTZ,
    "expiresAt"     TIMESTAMPTZ,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "PaymentTransaction_orderId_idx" ON "PaymentTransaction" ("orderId");
CREATE INDEX "PaymentTransaction_userId_idx" ON "PaymentTransaction" ("userId");
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction" ("status");
CREATE INDEX "PaymentTransaction_method_idx" ON "PaymentTransaction" ("method");
CREATE INDEX "PaymentTransaction_gatewayTxnId_idx" ON "PaymentTransaction" ("gatewayTxnId");
CREATE INDEX "PaymentTransaction_createdAt_idx" ON "PaymentTransaction" ("createdAt");

CREATE TRIGGER "PaymentTransaction_updatedAt"
    BEFORE UPDATE ON "PaymentTransaction"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "PaymentTransaction" IS 'جدول معاملات الدفع - تتبع عمليات الدفع والتحويلات المالية';

-- ============================================================================
-- ─── Newsletter Subscribers ────────────────────────────────────────────────
-- ============================================================================

-- جدول مشتركي النشرة البريدية
CREATE TABLE "NewsletterSubscriber" (
    "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email"     TEXT NOT NULL,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "NewsletterSubscriber_email_key" UNIQUE ("email")
);

CREATE INDEX "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber" ("email");
CREATE INDEX "NewsletterSubscriber_isActive_idx" ON "NewsletterSubscriber" ("isActive");
CREATE INDEX "NewsletterSubscriber_createdAt_idx" ON "NewsletterSubscriber" ("createdAt");

CREATE TRIGGER "NewsletterSubscriber_updatedAt"
    BEFORE UPDATE ON "NewsletterSubscriber"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE "NewsletterSubscriber" IS 'جدول مشتركي النشرة البريدية - المتابعين للعروض والأخبار';

-- ============================================================================
-- ─── Row Level Security (RLS) Policies ─────────────────────────────────────
-- ============================================================================

-- Helper function: تحقق من أن المستخدم الحالي هو مدير
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM "User"
        WHERE "supabase_uid" = auth.uid()
        AND "role" = 'admin'
        AND "isActive" = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: تحقق من أن المستخدم الحالي هو بائع
CREATE OR REPLACE FUNCTION is_vendor()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM "User"
        WHERE "supabase_uid" = auth.uid()
        AND "role" = 'vendor'
        AND "isActive" = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── User RLS ───────────────────────────────────────────────────────────────
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON "User" FOR SELECT
    USING ("supabase_uid" = auth.uid() OR is_admin());

CREATE POLICY "Users can update own profile"
    ON "User" FOR UPDATE
    USING ("supabase_uid" = auth.uid() OR is_admin());

CREATE POLICY "Admins can insert users"
    ON "User" FOR INSERT
    WITH CHECK (is_admin() OR "supabase_uid" = auth.uid());

CREATE POLICY "Admins can delete users"
    ON "User" FOR DELETE
    USING (is_admin());

-- ─── UserSession RLS ────────────────────────────────────────────────────────
ALTER TABLE "UserSession" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
    ON "UserSession" FOR SELECT
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Users can delete own sessions"
    ON "UserSession" FOR DELETE
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "System can insert sessions"
    ON "UserSession" FOR INSERT
    WITH CHECK (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

-- ─── Address RLS ────────────────────────────────────────────────────────────
ALTER TABLE "Address" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
    ON "Address" FOR ALL
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

-- ─── OTPVerification RLS ────────────────────────────────────────────────────
ALTER TABLE "OTPVerification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage OTP"
    ON "OTPVerification" FOR ALL
    USING (is_admin());

-- ─── Category RLS ───────────────────────────────────────────────────────────
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories"
    ON "Category" FOR SELECT
    USING ("isActive" = true OR is_admin());

CREATE POLICY "Admins can manage categories"
    ON "Category" FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
    ON "Category" FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete categories"
    ON "Category" FOR DELETE
    USING (is_admin());

-- ─── Product RLS ────────────────────────────────────────────────────────────
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
    ON "Product" FOR SELECT
    USING ("isActive" = true OR is_admin());

CREATE POLICY "Admins and vendors can insert products"
    ON "Product" FOR INSERT
    WITH CHECK (is_admin() OR is_vendor());

CREATE POLICY "Admins and vendors can update products"
    ON "Product" FOR UPDATE
    USING (is_admin() OR (
        is_vendor() AND "vendorId" IN (
            SELECT v."id" FROM "Vendor" v
            INNER JOIN "User" u ON u."supabase_uid" = auth.uid()
            WHERE u."isActive" = true
        )
    ));

CREATE POLICY "Admins can delete products"
    ON "Product" FOR DELETE
    USING (is_admin());

-- ─── CartItem RLS ──────────────────────────────────────────────────────────
ALTER TABLE "CartItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cart"
    ON "CartItem" FOR ALL
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

-- ─── Order RLS ──────────────────────────────────────────────────────────────
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
    ON "Order" FOR SELECT
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Users can create orders"
    ON "Order" FOR INSERT
    WITH CHECK (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Admins can update orders"
    ON "Order" FOR UPDATE
    USING (is_admin() OR (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        AND "status" IN ('pending', 'cancelled')
    ));

-- ─── OrderItem RLS ─────────────────────────────────────────────────────────
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
    ON "OrderItem" FOR SELECT
    USING (
        "orderId" IN (SELECT "id" FROM "Order" WHERE "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid()))
        OR is_admin()
    );

CREATE POLICY "Admins can manage order items"
    ON "OrderItem" FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete order items"
    ON "OrderItem" FOR DELETE
    USING (is_admin());

-- ─── OrderStatusLog RLS ────────────────────────────────────────────────────
ALTER TABLE "OrderStatusLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order status logs"
    ON "OrderStatusLog" FOR SELECT
    USING (
        "orderId" IN (SELECT "id" FROM "Order" WHERE "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid()))
        OR is_admin()
    );

CREATE POLICY "Admins can insert order status logs"
    ON "OrderStatusLog" FOR INSERT
    WITH CHECK (is_admin());

-- ─── Coupon RLS ────────────────────────────────────────────────────────────
ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active coupons"
    ON "Coupon" FOR SELECT
    USING ("isActive" = true OR is_admin());

CREATE POLICY "Admins can manage coupons"
    ON "Coupon" FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update coupons"
    ON "Coupon" FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete coupons"
    ON "Coupon" FOR DELETE
    USING (is_admin());

-- ─── DeliveryZone RLS ──────────────────────────────────────────────────────
ALTER TABLE "DeliveryZone" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active delivery zones"
    ON "DeliveryZone" FOR SELECT
    USING ("isActive" = true OR is_admin());

CREATE POLICY "Admins can manage delivery zones"
    ON "DeliveryZone" FOR ALL
    USING (is_admin());

-- ─── PushToken RLS ─────────────────────────────────────────────────────────
ALTER TABLE "PushToken" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push tokens"
    ON "PushToken" FOR ALL
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

-- ─── Notification RLS ──────────────────────────────────────────────────────
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON "Notification" FOR SELECT
    USING (
        "userId" IS NULL  -- إشعارات عامة
        OR "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Admins can manage notifications"
    ON "Notification" FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can delete notifications"
    ON "Notification" FOR DELETE
    USING (is_admin());

-- ─── NotificationReadStatus RLS ─────────────────────────────────────────────
ALTER TABLE "NotificationReadStatus" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own read statuses"
    ON "NotificationReadStatus" FOR ALL
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

-- ─── FeatureFlag RLS ───────────────────────────────────────────────────────
ALTER TABLE "FeatureFlag" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view feature flags"
    ON "FeatureFlag" FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage feature flags"
    ON "FeatureFlag" FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update feature flags"
    ON "FeatureFlag" FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete feature flags"
    ON "FeatureFlag" FOR DELETE
    USING (is_admin());

-- ─── AuditLog RLS ──────────────────────────────────────────────────────────
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
    ON "AuditLog" FOR SELECT
    USING (is_admin());

CREATE POLICY "System can insert audit logs"
    ON "AuditLog" FOR INSERT
    WITH CHECK (is_admin());

-- ─── LedgerAccount RLS ─────────────────────────────────────────────────────
ALTER TABLE "LedgerAccount" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ledger accounts"
    ON "LedgerAccount" FOR ALL
    USING (is_admin());

-- ─── JournalEntry RLS ──────────────────────────────────────────────────────
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage journal entries"
    ON "JournalEntry" FOR ALL
    USING (is_admin());

-- ─── JournalEntryLine RLS ─────────────────────────────────────────────────
ALTER TABLE "JournalEntryLine" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage journal entry lines"
    ON "JournalEntryLine" FOR ALL
    USING (is_admin());

-- ─── Vendor RLS ────────────────────────────────────────────────────────────
ALTER TABLE "Vendor" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active vendors"
    ON "Vendor" FOR SELECT
    USING ("isActive" = true OR is_admin());

CREATE POLICY "Admins can manage vendors"
    ON "Vendor" FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update vendors"
    ON "Vendor" FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete vendors"
    ON "Vendor" FOR DELETE
    USING (is_admin());

-- ─── VendorPayout RLS ──────────────────────────────────────────────────────
ALTER TABLE "VendorPayout" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own payouts"
    ON "VendorPayout" FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can manage vendor payouts"
    ON "VendorPayout" FOR ALL
    USING (is_admin());

-- ─── Review RLS ────────────────────────────────────────────────────────────
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active reviews"
    ON "Review" FOR SELECT
    USING ("isActive" = true OR is_admin());

CREATE POLICY "Users can create reviews"
    ON "Review" FOR INSERT
    WITH CHECK (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Users can update own reviews"
    ON "Review" FOR UPDATE
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Users can delete own reviews"
    ON "Review" FOR DELETE
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

-- ─── InventoryMovement RLS ─────────────────────────────────────────────────
ALTER TABLE "InventoryMovement" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory movements"
    ON "InventoryMovement" FOR ALL
    USING (is_admin());

-- ─── LoyaltyTransaction RLS ────────────────────────────────────────────────
ALTER TABLE "LoyaltyTransaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty transactions"
    ON "LoyaltyTransaction" FOR SELECT
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Admins can manage loyalty transactions"
    ON "LoyaltyTransaction" FOR INSERT
    WITH CHECK (is_admin());

-- ─── WalletTransaction RLS ─────────────────────────────────────────────────
ALTER TABLE "WalletTransaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet transactions"
    ON "WalletTransaction" FOR SELECT
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Admins can manage wallet transactions"
    ON "WalletTransaction" FOR INSERT
    WITH CHECK (is_admin());

-- ─── ShippingCarrier RLS ──────────────────────────────────────────────────
ALTER TABLE "ShippingCarrier" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active shipping carriers"
    ON "ShippingCarrier" FOR SELECT
    USING ("isActive" = true OR is_admin());

CREATE POLICY "Admins can manage shipping carriers"
    ON "ShippingCarrier" FOR ALL
    USING (is_admin());

-- ─── Shipment RLS ──────────────────────────────────────────────────────────
ALTER TABLE "Shipment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shipments"
    ON "Shipment" FOR SELECT
    USING (
        "orderId" IN (SELECT "id" FROM "Order" WHERE "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid()))
        OR is_admin()
    );

CREATE POLICY "Admins can manage shipments"
    ON "Shipment" FOR ALL
    USING (is_admin());

-- ─── ShipmentLog RLS ───────────────────────────────────────────────────────
ALTER TABLE "ShipmentLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shipment logs"
    ON "ShipmentLog" FOR SELECT
    USING (
        "shipmentId" IN (
            SELECT "id" FROM "Shipment"
            WHERE "orderId" IN (SELECT "id" FROM "Order" WHERE "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid()))
        )
        OR is_admin()
    );

CREATE POLICY "Admins can manage shipment logs"
    ON "ShipmentLog" FOR ALL
    USING (is_admin());

-- ─── ShippingCompany RLS ──────────────────────────────────────────────────
ALTER TABLE "ShippingCompany" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active shipping companies"
    ON "ShippingCompany" FOR SELECT
    USING ("isActive" = true OR is_admin());

CREATE POLICY "Admins can manage shipping companies"
    ON "ShippingCompany" FOR ALL
    USING (is_admin());

-- ─── ShippingCoverageZone RLS ─────────────────────────────────────────────
ALTER TABLE "ShippingCoverageZone" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active coverage zones"
    ON "ShippingCoverageZone" FOR SELECT
    USING ("isActive" = true OR is_admin());

CREATE POLICY "Admins can manage coverage zones"
    ON "ShippingCoverageZone" FOR ALL
    USING (is_admin());

-- ─── EmailLog RLS ──────────────────────────────────────────────────────────
ALTER TABLE "EmailLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email logs"
    ON "EmailLog" FOR ALL
    USING (is_admin());

-- ─── FavoriteItem RLS ──────────────────────────────────────────────────────
ALTER TABLE "FavoriteItem" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
    ON "FavoriteItem" FOR ALL
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

-- ─── StoreSetting RLS ──────────────────────────────────────────────────────
ALTER TABLE "StoreSetting" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view store settings"
    ON "StoreSetting" FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage store settings"
    ON "StoreSetting" FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update store settings"
    ON "StoreSetting" FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete store settings"
    ON "StoreSetting" FOR DELETE
    USING (is_admin());

-- ─── ContactMessage RLS ───────────────────────────────────────────────────
ALTER TABLE "ContactMessage" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create contact messages"
    ON "ContactMessage" FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages"
    ON "ContactMessage" FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can update contact messages"
    ON "ContactMessage" FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete contact messages"
    ON "ContactMessage" FOR DELETE
    USING (is_admin());

-- ─── PaymentTransaction RLS ────────────────────────────────────────────────
ALTER TABLE "PaymentTransaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment transactions"
    ON "PaymentTransaction" FOR SELECT
    USING (
        "userId" IN (SELECT "id" FROM "User" WHERE "supabase_uid" = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Admins can manage payment transactions"
    ON "PaymentTransaction" FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update payment transactions"
    ON "PaymentTransaction" FOR UPDATE
    USING (is_admin());

-- ─── NewsletterSubscriber RLS ──────────────────────────────────────────────
ALTER TABLE "NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe"
    ON "NewsletterSubscriber" FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscribers"
    ON "NewsletterSubscriber" FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can update newsletter subscribers"
    ON "NewsletterSubscriber" FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete newsletter subscribers"
    ON "NewsletterSubscriber" FOR DELETE
    USING (is_admin());

-- ============================================================================
-- ─── Complete ───────────────────────────────────────────────────────────────
-- ============================================================================
-- تم إنشاء جميع الجداول والفهارس والقيود وسياسات الأمان
-- نبض المدينة - City Pulse
-- ============================================================================

-- إضافة القيود المرجعية بعد إنشاء جميع الجداول
ALTER TABLE "Product" ADD CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL;
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingCompanyId_fkey" FOREIGN KEY ("shippingCompanyId") REFERENCES "ShippingCompany"("id") ON DELETE SET NULL;
