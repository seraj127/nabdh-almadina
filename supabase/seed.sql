-- ============================================================================
-- نبض المدينة (City Pulse) - Database Seed File
-- بيانات تجريبية واقعية لليبيا
-- Supabase PostgreSQL
-- ============================================================================
-- ملاحظة: هذا الملف يجب أن يُشغّل بعد 001_initial_schema.sql
-- يستخدم UUIDs صريحة لضمان التوافق بين الجداول
-- ============================================================================

-- ─── تنظيف البيانات السابقة (بالترتيب الصحيح للتبعيات) ──────────────────────
DELETE FROM "ShipmentLog";
DELETE FROM "Shipment";
DELETE FROM "InventoryMovement";
DELETE FROM "Review";
DELETE FROM "OrderItem";
DELETE FROM "OrderStatusLog";
DELETE FROM "Order";
DELETE FROM "CartItem";
DELETE FROM "FavoriteItem";
DELETE FROM "PaymentTransaction";
DELETE FROM "Coupon";
DELETE FROM "NotificationReadStatus";
DELETE FROM "Notification";
DELETE FROM "PushToken";
DELETE FROM "UserSession";
DELETE FROM "Address";
DELETE FROM "OTPVerification";
DELETE FROM "Product";
DELETE FROM "Category";
DELETE FROM "DeliveryZone";
DELETE FROM "ShippingCoverageZone";
DELETE FROM "ShippingCompany";
DELETE FROM "ShippingCarrier";
DELETE FROM "VendorPayout";
DELETE FROM "Vendor";
DELETE FROM "FeatureFlag";
DELETE FROM "StoreSetting";
DELETE FROM "LedgerAccount";
DELETE FROM "JournalEntryLine";
DELETE FROM "JournalEntry";
DELETE FROM "EmailLog";
DELETE FROM "ContactMessage";
DELETE FROM "WalletTransaction";
DELETE FROM "LoyaltyTransaction";
DELETE FROM "NewsletterSubscriber";
DELETE FROM "AuditLog";
DELETE FROM "User";

-- ============================================================================
-- ─── 1. Categories (الأقسام الرئيسية + الأقسام الفرعية) ─────────────────────
-- ============================================================================
-- الأقسام الرئيسية: 12 قسماً
-- الأقسام الفرعية: 3-5 لكل قسم رئيسي

-- ─── الأقسام الرئيسية ──────────────────────────────────────────────────────
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
-- 1. إلكترونيات
('c1000000-0000-0000-0000-000000000001', 'إلكترونيات', 'Electronics', 'electronics',
 'أحدث الأجهزة الإلكترونية والكمبيوترات وملحقاتها',
 '💻', '/categories/electronics.png', 1, 'ACTIVE_MVP',
 '{"attributes": [{"key": "brand", "labelAr": "العلامة التجارية", "labelEn": "Brand", "type": "select"}, {"key": "warranty", "labelAr": "الضمان", "labelEn": "Warranty", "type": "text"}]}'::jsonb,
 true, NULL),

-- 2. هواتف وأجهزة لوحية
('c1000000-0000-0000-0000-000000000002', 'هواتف وأجهزة لوحية', 'Phones & Tablets', 'phones-tablets',
 'هواتف ذكية وأجهزة لوحية من أشهر العلامات التجارية',
 '📱', '/categories/electronics-2.png', 2, 'ACTIVE_MVP',
 '{"attributes": [{"key": "brand", "labelAr": "العلامة التجارية", "labelEn": "Brand", "type": "select"}, {"key": "storage", "labelAr": "سعة التخزين", "labelEn": "Storage", "type": "select"}, {"key": "ram", "labelAr": "الرام", "labelEn": "RAM", "type": "select"}]}'::jsonb,
 true, NULL),

-- 3. أجهزة منزلية
('c1000000-0000-0000-0000-000000000003', 'أجهزة منزلية', 'Home Appliances', 'home-appliances',
 'أجهزة كهربائية منزلية لتسهيل حياتك اليومية',
 '🏠', '/categories/electrical-appliances.png', 3, 'ACTIVE_MVP',
 '{"attributes": [{"key": "brand", "labelAr": "العلامة التجارية", "labelEn": "Brand", "type": "select"}, {"key": "capacity", "labelAr": "السعة", "labelEn": "Capacity", "type": "text"}, {"key": "energyRating", "labelAr": "تصنيف الطاقة", "labelEn": "Energy Rating", "type": "select"}]}'::jsonb,
 true, NULL),

-- 4. ملابس رجالية
('c1000000-0000-0000-0000-000000000004', 'ملابس رجالية', 'Men''s Clothing', 'mens-clothing',
 'أحدث صيحات الموضة الرجالية من الملابس الكاجوال والرسمية',
 '👔', '/categories/fashion-men.png', 4, 'ACTIVE_MVP',
 '{"attributes": [{"key": "size", "labelAr": "المقاس", "labelEn": "Size", "type": "select"}, {"key": "color", "labelAr": "اللون", "labelEn": "Color", "type": "select"}, {"key": "material", "labelAr": "الخامة", "labelEn": "Material", "type": "text"}]}'::jsonb,
 true, NULL),

-- 5. ملابس نسائية
('c1000000-0000-0000-0000-000000000005', 'ملابس نسائية', 'Women''s Clothing', 'womens-clothing',
 'تشكيلة واسعة من الملابس النسائية العصرية والأنيقة',
 '👗', '/categories/fashion-women.png', 5, 'ACTIVE_MVP',
 '{"attributes": [{"key": "size", "labelAr": "المقاس", "labelEn": "Size", "type": "select"}, {"key": "color", "labelAr": "اللون", "labelEn": "Color", "type": "select"}, {"key": "material", "labelAr": "الخامة", "labelEn": "Material", "type": "text"}]}'::jsonb,
 true, NULL),

-- 6. أجهزة كهربائية
('c1000000-0000-0000-0000-000000000006', 'أجهزة كهربائية', 'Electrical Equipment', 'electrical-equipment',
 'أدوات ومعدات كهربائية احترافية ومنزلية',
 '⚡', '/categories/electrical-appliances.png', 6, 'ACTIVE_MVP',
 '{"attributes": [{"key": "brand", "labelAr": "العلامة التجارية", "labelEn": "Brand", "type": "select"}, {"key": "power", "labelAr": "القوة", "labelEn": "Power", "type": "text"}]}'::jsonb,
 true, NULL),

-- 7. مستحضرات تجميل
('c1000000-0000-0000-0000-000000000007', 'مستحضرات تجميل', 'Beauty & Cosmetics', 'beauty-cosmetics',
 'مستحضرات تجميل وعناية بالبشرة والشعر من أفضل الماركات',
 '💄', '/categories/perfumes-oud.png', 7, 'ACTIVE_MVP',
 '{"attributes": [{"key": "brand", "labelAr": "العلامة التجارية", "labelEn": "Brand", "type": "select"}, {"key": "volume", "labelAr": "الحجم", "labelEn": "Volume", "type": "text"}]}'::jsonb,
 true, NULL),

-- 8. رياضة ولياقة
('c1000000-0000-0000-0000-000000000008', 'رياضة ولياقة', 'Sports & Fitness', 'sports-fitness',
 'معدات رياضية وملابس رياضية لكل اللاعبين',
 '🏋️', '/categories/fashion-men-2.png', 8, 'ACTIVE_MVP',
 '{"attributes": [{"key": "size", "labelAr": "المقاس", "labelEn": "Size", "type": "select"}, {"key": "sport", "labelAr": "الرياضة", "labelEn": "Sport", "type": "select"}]}'::jsonb,
 true, NULL),

-- 9. كتب ومستلزمات مكتبية
('c1000000-0000-0000-0000-000000000009', 'كتب ومستلزمات مكتبية', 'Books & Stationery', 'books-stationery',
 'كتب متنوعة ومستلزمات مكتبية للدراسة والعمل',
 '📚', '/categories/kitchen-tools.png', 9, 'ACTIVE_MVP',
 '{"attributes": [{"key": "category", "labelAr": "التصنيف", "labelEn": "Category", "type": "select"}]}'::jsonb,
 true, NULL),

-- 10. أغذية ومشروبات
('c1000000-0000-0000-0000-000000000010', 'أغذية ومشروبات', 'Food & Beverages', 'food-beverages',
 'منتجات غذائية ومشروبات متنوعة طازجة ومعلبة',
 '🍽️', '/categories/food-storage.png', 10, 'ACTIVE_MVP',
 '{"attributes": [{"key": "weight", "labelAr": "الوزن", "labelEn": "Weight", "type": "text"}, {"key": "expiry", "labelAr": "تاريخ الانتهاء", "labelEn": "Expiry Date", "type": "text"}]}'::jsonb,
 true, NULL),

-- 11. أثاث ومنزل
('c1000000-0000-0000-0000-000000000011', 'أثاث ومنزل', 'Furniture & Home', 'furniture-home',
 'أثاث منزلي ومكتبي وديكورات لتجميل مساحتك',
 '🛋️', '/categories/wall-art.png', 11, 'ACTIVE_MVP',
 '{"attributes": [{"key": "material", "labelAr": "الخامة", "labelEn": "Material", "type": "select"}, {"key": "dimensions", "labelAr": "الأبعاد", "labelEn": "Dimensions", "type": "text"}]}'::jsonb,
 true, NULL),

-- 12. إكسسوارات
('c1000000-0000-0000-0000-000000000012', 'إكسسوارات', 'Accessories', 'accessories',
 'إكسسوارات ومجوهرات وساعات يد أنيقة',
 '💎', '/categories/accessories.png', 12, 'ACTIVE_MVP',
 '{"attributes": [{"key": "material", "labelAr": "الخامة", "labelEn": "Material", "type": "select"}, {"key": "color", "labelAr": "اللون", "labelEn": "Color", "type": "select"}]}'::jsonb,
 true, NULL);


-- ─── الأقسام الفرعية ──────────────────────────────────────────────────────

-- فرعية إلكترونيات
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1100000-0000-0000-0000-000000000001', 'لابتوب', 'Laptops', 'laptops', 'أجهزة حاسوب محمولة بمختلف المواصفات', '💻', '/categories/electronics.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000001'),
('c1100000-0000-0000-0000-000000000002', 'شاشات', 'Monitors', 'monitors', 'شاشات كمبيوتر بجودة عالية', '🖥️', '/categories/electronics-2.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000001'),
('c1100000-0000-0000-0000-000000000003', 'سماعات', 'Headphones', 'headphones', 'سماعات سلكية ولاسلكية', '🎧', '/categories/electronics.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000001'),
('c1100000-0000-0000-0000-000000000004', 'كاميرات', 'Cameras', 'cameras', 'كاميرات تصوير احترافية ورقمية', '📷', '/categories/electronics-2.png', 4, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000001');

-- فرعية هواتف وأجهزة لوحية
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1200000-0000-0000-0000-000000000001', 'آيفون', 'iPhone', 'iphone', 'هواتف آيفون من آبل', '🍎', '/categories/electronics.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000002'),
('c1200000-0000-0000-0000-000000000002', 'سامسونج', 'Samsung', 'samsung-phones', 'هواتف سامسونج غالاكسي', '📱', '/categories/electronics-2.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000002'),
('c1200000-0000-0000-0000-000000000003', 'شاومي', 'Xiaomi', 'xiaomi-phones', 'هواتف شاومي بسعر ممتاز', '📱', '/categories/electronics.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000002'),
('c1200000-0000-0000-0000-000000000004', 'هواوي', 'Huawei', 'huawei-phones', 'هواتف هواوي بتقنيات متطورة', '📱', '/categories/electronics-2.png', 4, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000002'),
('c1200000-0000-0000-0000-000000000005', 'أجهزة لوحية', 'Tablets', 'tablets', 'أجهزة لوحية بمختلف الأحجام', '📱', '/categories/electronics.png', 5, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000002');

-- فرعية أجهزة منزلية
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1300000-0000-0000-0000-000000000001', 'غسالات', 'Washing Machines', 'washing-machines', 'غسالات أوتوماتيكية وشبه أوتوماتيكية', '🧺', '/categories/electrical-appliances.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000003'),
('c1300000-0000-0000-0000-000000000002', 'ثلاجات', 'Refrigerators', 'refrigerators', 'ثلاجات وفريزرات بسعات مختلفة', '🧊', '/categories/electrical-appliances.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000003'),
('c1300000-0000-0000-0000-000000000003', 'مكيفات', 'Air Conditioners', 'air-conditioners', 'مكيفات هواء سبليت وشباك', '❄️', '/categories/electrical-appliances.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000003'),
('c1300000-0000-0000-0000-000000000004', 'مكانس كهربائية', 'Vacuum Cleaners', 'vacuum-cleaners', 'مكانس كهربائية قوية للتنظيف', '🧹', '/categories/electrical-appliances.png', 4, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000003');

-- فرعية ملابس رجالية
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1400000-0000-0000-0000-000000000001', 'قمصان', 'Shirts', 'mens-shirts', 'قمصان رجالية رسمية وكاجوال', '👔', '/categories/fashion-men.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000004'),
('c1400000-0000-0000-0000-000000000002', 'بناطيل', 'Pants', 'mens-pants', 'بناطيل جينز وقماش', '👖', '/categories/fashion-men.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000004'),
('c1400000-0000-0000-0000-000000000003', 'أحذية رجالية', 'Men''s Shoes', 'mens-shoes', 'أحذية رجالية رسمية ورياضية', '👞', '/categories/fashion-men.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000004'),
('c1400000-0000-0000-0000-000000000004', 'جاكيتات', 'Jackets', 'mens-jackets', 'جاكيتات ومعاطف رجالية', '🧥', '/categories/fashion-men.png', 4, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000004');

-- فرعية ملابس نسائية
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1500000-0000-0000-0000-000000000001', 'فساتين', 'Dresses', 'womens-dresses', 'فساتين سهرة وكاجوال', '👗', '/categories/fashion-women.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000005'),
('c1500000-0000-0000-0000-000000000002', 'عبايات', 'Abayas', 'abayas', 'عبايات أنيقة ومودرن', '🧕', '/categories/fashion-women.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000005'),
('c1500000-0000-0000-0000-000000000003', 'أحذية نسائية', 'Women''s Shoes', 'womens-shoes', 'أحذية نسائية وكعب عالي', '👠', '/categories/fashion-women.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000005'),
('c1500000-0000-0000-0000-000000000004', 'حقائب', 'Bags', 'womens-bags', 'حقائب يد وشنط نسائية', '👜', '/categories/fashion-women.png', 4, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000005');

-- فرعية أجهزة كهربائية
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1600000-0000-0000-0000-000000000001', 'مكواة', 'Irons', 'irons', 'مكواات بخار وكهربائية', '🔌', '/categories/electrical-appliances.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000006'),
('c1600000-0000-0000-0000-000000000002', 'خلاطات', 'Blenders', 'blenders', 'خلاطات كهربائية متعددة الاستخدام', '🔌', '/categories/electrical-appliances.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000006'),
('c1600000-0000-0000-0000-000000000003', 'ماكينات قهوة', 'Coffee Machines', 'coffee-machines', 'ماكينات تحضير القهوة', '🔌', '/categories/electrical-appliances.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000006');

-- فرعية مستحضرات تجميل
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1700000-0000-0000-0000-000000000001', 'عناية بالبشرة', 'Skincare', 'skincare', 'كريمات ومرطبات ومنظفات البشرة', '🧴', '/categories/perfumes-oud.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000007'),
('c1700000-0000-0000-0000-000000000002', 'عطور', 'Perfumes', 'perfumes', 'عطور شرقية وغربية أصلية', '🌸', '/categories/perfumes-oud.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000007'),
('c1700000-0000-0000-0000-000000000003', 'مكياج', 'Makeup', 'makeup', 'مستحضرات مكياج من أفضل الماركات', '💄', '/categories/perfumes-oud.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000007');

-- فرعية رياضة ولياقة
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1800000-0000-0000-0000-000000000001', 'أحذية رياضية', 'Sports Shoes', 'sports-shoes', 'أحذية رياضية للجري والتمارين', '👟', '/categories/fashion-men-2.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000008'),
('c1800000-0000-0000-0000-000000000002', 'ملابس رياضية', 'Sportswear', 'sportswear', 'ملابس رياضية مريحة', '🩳', '/categories/fashion-men-2.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000008'),
('c1800000-0000-0000-0000-000000000003', 'أجهزة رياضية', 'Fitness Equipment', 'fitness-equipment', 'أجهزة ومعدات تمارين منزلية', '🏋️', '/categories/fashion-men-2.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000008');

-- فرعية كتب ومستلزمات مكتبية
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1900000-0000-0000-0000-000000000001', 'كتب', 'Books', 'books', 'كتب متنوعة في جميع المجالات', '📖', '/categories/kitchen-tools.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000009'),
('c1900000-0000-0000-0000-000000000002', 'أدوات مكتبية', 'Office Supplies', 'office-supplies', 'أدوات ومستلزمات مكتبية', '✏️', '/categories/kitchen-tools.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000009'),
('c1900000-0000-0000-0000-000000000003', 'قرطاسية', 'Stationery', 'stationery', 'قرطاسية مدرسية ومكتبية', '📝', '/categories/kitchen-tools.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000009');

-- فرعية أغذية ومشروبات
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1a00000-0000-0000-0000-000000000001', 'تمور ومكسرات', 'Dates & Nuts', 'dates-nuts', 'تمور ليبية فاخرة ومكسرات', '🥜', '/categories/food-storage.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000010'),
('c1a00000-0000-0000-0000-000000000002', 'قهوة وشاي', 'Coffee & Tea', 'coffee-tea', 'قهوة عربية وشاي ليبي', '☕', '/categories/food-storage.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000010'),
('c1a00000-0000-0000-0000-000000000003', 'زيت زيتون', 'Olive Oil', 'olive-oil', 'زيت زيتون ليبي أصلي', '🫒', '/categories/food-storage.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000010');

-- فرعية أثاث ومنزل
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1b00000-0000-0000-0000-000000000001', 'غرف نوم', 'Bedrooms', 'bedrooms', 'أثاث غرف النوم', '🛏️', '/categories/wall-art.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000011'),
('c1b00000-0000-0000-0000-000000000002', 'صالونات', 'Living Rooms', 'living-rooms', 'صالونات وأنتريهات', '🛋️', '/categories/wall-art.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000011'),
('c1b00000-0000-0000-0000-000000000003', 'ديكور', 'Decor', 'decor', 'ديكورات وإكسسوارات منزلية', '🎨', '/categories/wall-art.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000011');

-- فرعية إكسسوارات
INSERT INTO "Category" ("id", "nameAr", "nameEn", "slug", "description", "icon", "image", "sortOrder", "phase", "attributes", "isActive", "parentId") VALUES
('c1c00000-0000-0000-0000-000000000001', 'ساعات', 'Watches', 'watches', 'ساعات يد رجالية ونسائية', '⌚', '/categories/accessories.png', 1, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000012'),
('c1c00000-0000-0000-0000-000000000002', 'مجوهرات', 'Jewelry', 'jewelry', 'مجوهرات ذهبية وفضية', '💍', '/categories/accessories.png', 2, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000012'),
('c1c00000-0000-0000-0000-000000000003', 'نظارات', 'Sunglasses', 'sunglasses', 'نظارات شمسية وطبية', '🕶️', '/categories/accessories.png', 3, 'ACTIVE_MVP', '{}'::jsonb, true, 'c1000000-0000-0000-0000-000000000012');


-- ============================================================================
-- ─── 2. Products (20+ منتج واقعي بأسعار ليبية) ─────────────────────────────
-- ============================================================================

INSERT INTO "Product" ("id", "categoryId", "vendorId", "nameAr", "nameEn", "descriptionAr", "descriptionEn", "sku", "price", "comparePrice", "costPrice", "images", "mainImage", "video", "stock", "reservedStock", "weight", "dimensions", "attributes", "badges", "rating", "reviewCount", "isActive", "isFeatured") VALUES

-- ─── هواتف ──────────────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000001', 'c1200000-0000-0000-0000-000000000001', NULL,
 'آيفون 15 برو ماكس', 'iPhone 15 Pro Max',
 'هاتف آيفون 15 برو ماكس بشريحة A17 Pro وكاميرا 48 ميجابكسل وشاشة Super Retina XDR مقاس 6.7 إنش. يأتي بتصميم من التيتانيوم وبطارية تدوم طوال اليوم.',
 'iPhone 15 Pro Max with A17 Pro chip, 48MP camera, 6.7-inch Super Retina XDR display. Titanium design with all-day battery life.',
 'IPH-15PM-256', 8500.00, 9200.00, 7200.00,
 '["/products/smartphone.png", "/products/electronics.png", "/products/electronics-2.png"]'::jsonb,
 '/products/smartphone.png', NULL,
 25, 3, 0.22, '{"w": 76.7, "h": 159.9, "d": 8.25}'::jsonb,
 '{"brand": "Apple", "storage": "256GB", "ram": "8GB", "color": "Natural Titanium"}'::jsonb,
 '["new", "bestseller"]'::jsonb, 4.80, 127, true, true),

('p1000000-0000-0000-0000-000000000002', 'c1200000-0000-0000-0000-000000000002', NULL,
 'سامسونج غالاكسي S24 ألترا', 'Samsung Galaxy S24 Ultra',
 'هاتف سامسونج غالاكسي S24 ألترا بشريحة Snapdragon 8 Gen 3 وكاميرا 200 ميجابكسل وقلم S Pen مدمج. شاشة Dynamic AMOLED 2X مقاس 6.8 إنش.',
 'Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, 200MP camera, built-in S Pen. 6.8-inch Dynamic AMOLED 2X display.',
 'SAM-S24U-256', 7200.00, 7800.00, 6000.00,
 '["/products/smartphone.png", "/products/electronics.png"]'::jsonb,
 '/products/smartphone.png', NULL,
 30, 5, 0.23, '{"w": 79.0, "h": 162.3, "d": 8.6}'::jsonb,
 '{"brand": "Samsung", "storage": "256GB", "ram": "12GB", "color": "Titanium Black"}'::jsonb,
 '["new", "bestseller"]'::jsonb, 4.70, 98, true, true),

('p1000000-0000-0000-0000-000000000003', 'c1200000-0000-0000-0000-000000000003', NULL,
 'شاومي 14 برو', 'Xiaomi 14 Pro',
 'هاتف شاومي 14 برو بشريحة Snapdragon 8 Gen 3 وكاميرا Leica مزدوجة وشحن سريع 120 واط. أداء ممتاز بسعر مميز.',
 'Xiaomi 14 Pro with Snapdragon 8 Gen 3, Leica dual camera, 120W fast charging. Excellent performance at a great price.',
 'XIA-14P-256', 3800.00, 4200.00, 2900.00,
 '["/products/smartphone.png", "/products/electronics-2.png"]'::jsonb,
 '/products/smartphone.png', NULL,
 40, 2, 0.22, '{"w": 75.3, "h": 161.4, "d": 8.5}'::jsonb,
 '{"brand": "Xiaomi", "storage": "256GB", "ram": "12GB", "color": "Black"}'::jsonb,
 '["sale"]'::jsonb, 4.50, 63, true, true),

('p1000000-0000-0000-0000-000000000004', 'c1200000-0000-0000-0000-000000000004', NULL,
 'هواوي بورا 70 برو', 'Huawei Pura 70 Pro',
 'هاتف هواوي بورا 70 برو بكاميرا XMAGE متطورة وشاشة OLED منحنية وبطارية كبيرة 5050 مللي أمبير.',
 'Huawei Pura 70 Pro with advanced XMAGE camera, curved OLED display, and 5050mAh large battery.',
 'HUA-P70P-256', 4500.00, NULL, 3200.00,
 '["/products/smartphone.png", "/products/electronics.png"]'::jsonb,
 '/products/smartphone.png', NULL,
 18, 0, 0.21, '{"w": 74.5, "h": 162.6, "d": 8.4}'::jsonb,
 '{"brand": "Huawei", "storage": "256GB", "ram": "12GB", "color": "Green"}'::jsonb,
 '["new"]'::jsonb, 4.40, 32, true, false),

-- ─── إلكترونيات ─────────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000005', 'c1100000-0000-0000-0000-000000000001', NULL,
 'ماك بوك برو M3', 'MacBook Pro M3',
 'لابتوب ماك بوك برو بمعالج Apple M3 Pro وشاشة Liquid Retina XDR مقاس 14 إنش وذاكرة 18 جيجابايت وتخزين 512 جيجابايت SSD. مثالي للمحترفين والمبدعين.',
 'MacBook Pro with Apple M3 Pro chip, 14-inch Liquid Retina XDR display, 18GB memory, 512GB SSD. Ideal for professionals and creators.',
 'APP-MBP-M3-14', 15000.00, 16500.00, 12800.00,
 '["/products/electronics.png", "/products/electronics-2.png"]'::jsonb,
 '/products/electronics.png', NULL,
 12, 2, 1.55, '{"w": 312.6, "h": 221.2, "d": 15.5}'::jsonb,
 '{"brand": "Apple", "processor": "M3 Pro", "ram": "18GB", "storage": "512GB SSD"}'::jsonb,
 '["new", "bestseller"]'::jsonb, 4.90, 54, true, true),

('p1000000-0000-0000-0000-000000000006', 'c1100000-0000-0000-0000-000000000003', NULL,
 'سوني WH-1000XM5', 'Sony WH-1000XM5',
 'سماعات سوني اللاسلكية بإلغاء الضوضاء الرائد في فئتها وصوت Hi-Res وبطارية تدوم 30 ساعة. تصميم خفيف ومريح للاستخدام اليومي.',
 'Sony wireless headphones with industry-leading noise cancellation, Hi-Res audio, 30-hour battery. Lightweight and comfortable for daily use.',
 'SNY-WH1000XM5', 1200.00, 1400.00, 850.00,
 '["/products/bluetooth-headphones.png", "/products/electronics.png"]'::jsonb,
 '/products/bluetooth-headphones.png', NULL,
 50, 0, 0.25, '{"w": 20.0, "h": 22.0, "d": 8.0}'::jsonb,
 '{"brand": "Sony", "type": "Over-ear", "battery": "30 hours", "anc": true}'::jsonb,
 '["bestseller"]'::jsonb, 4.70, 89, true, true),

('p1000000-0000-0000-0000-000000000007', 'c1100000-0000-0000-0000-000000000002', NULL,
 'شاشة سامسونج 27 إنش 4K', 'Samsung 27" 4K Monitor',
 'شاشة سامسونج بدقة 4K UHD وحجم 27 إنش مع تقنية HDR10 وزمن استجابة 5 مللي ثانية. مثالية للتصميم والمونتاج والألعاب.',
 'Samsung 27-inch 4K UHD monitor with HDR10, 5ms response time. Perfect for design, editing, and gaming.',
 'SAM-MON-27-4K', 2800.00, 3200.00, 2100.00,
 '["/products/electronics-2.png", "/products/electronics.png"]'::jsonb,
 '/products/electronics-2.png', NULL,
 15, 0, 5.50, '{"w": 613.0, "h": 365.0, "d": 52.0}'::jsonb,
 '{"brand": "Samsung", "size": "27 inch", "resolution": "4K UHD", "panel": "IPS"}'::jsonb,
 '[]'::jsonb, 4.30, 27, true, false),

('p1000000-0000-0000-0000-000000000008', 'c1100000-0000-0000-0000-000000000004', NULL,
 'كاميرا كانون EOS R6 Mark II', 'Canon EOS R6 Mark II',
 'كاميرا كانون بدون مرآة بدقة 24.2 ميجابكسل وتصوير فيديو 4K 60fps وتثبيت صورة مدمج بخمس نقاط. مثالية للتصوير الاحترافي.',
 'Canon mirrorless camera with 24.2MP, 4K 60fps video, 5-axis IBIS. Perfect for professional photography.',
 'CAN-EOSR6M2', 9500.00, NULL, 7200.00,
 '["/products/camera.png", "/products/electronics.png"]'::jsonb,
 '/products/camera.png', NULL,
 8, 0, 0.67, '{"w": 138.4, "h": 98.2, "d": 88.4}'::jsonb,
 '{"brand": "Canon", "type": "Mirrorless", "megapixels": "24.2MP", "video": "4K 60fps"}'::jsonb,
 '["new"]'::jsonb, 4.80, 19, true, false),

-- ─── أجهزة منزلية ───────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000009', 'c1300000-0000-0000-0000-000000000001', NULL,
 'غسالة LG أوتوماتيك 8 كجم', 'LG Washing Machine 8kg',
 'غسالة LG أوتوماتيكية بسعة 8 كجم ومحرك Inverter Direct Drive هادئ بتقنية البخار. 14 برنامج غسيل وفلتر تنظيف ذاتي.',
 'LG automatic washing machine, 8kg capacity, Inverter Direct Drive quiet motor with steam technology. 14 wash programs and self-cleaning filter.',
 'LG-WM-8KG-AUTO', 2800.00, 3100.00, 2000.00,
 '["/products/electrical-appliances.png", "/products/vacuum-cleaner.png"]'::jsonb,
 '/products/electrical-appliances.png', NULL,
 20, 0, 62.00, '{"w": 600, "h": 850, "d": 560}'::jsonb,
 '{"brand": "LG", "capacity": "8kg", "type": "Front Load", "motor": "Inverter"}'::jsonb,
 '["bestseller"]'::jsonb, 4.50, 76, true, true),

('p1000000-0000-0000-0000-000000000010', 'c1300000-0000-0000-0000-000000000002', NULL,
 'ثلاجة سامسونج 400 لتر', 'Samsung Refrigerator 400L',
 'ثلاجة سامسونج بسعة 400 لتر مع تقنية Twin Cooling Plus للحفاظ على الطعام طازجاً فترة أطول. تصميم أنيق بابين مع فريزر سفلي.',
 'Samsung refrigerator with 400L capacity and Twin Cooling Plus technology to keep food fresher longer. Elegant two-door design with bottom freezer.',
 'SAM-RF-400L', 4500.00, 5000.00, 3300.00,
 '["/products/electrical-appliances.png", "/products/vacuum-cleaner.png"]'::jsonb,
 '/products/electrical-appliances.png', NULL,
 14, 0, 75.00, '{"w": 600, "h": 1780, "d": 670}'::jsonb,
 '{"brand": "Samsung", "capacity": "400L", "type": "Two Door", "cooling": "Twin Cooling Plus"}'::jsonb,
 '["sale"]'::jsonb, 4.60, 58, true, true),

('p1000000-0000-0000-0000-000000000011', 'c1300000-0000-0000-0000-000000000003', NULL,
 'مكيف جري 1.5 طن سبليت', 'Gree AC 1.5 Ton Split',
 'مكيف جري سبليت بقوة 1.5 طن مع تقنية Inverter لتوفير الطاقة. يعمل بهدوء مع فلتر هواء متطور وضمان 5 سنوات على الكمبروسر.',
 'Gree split AC with 1.5 ton capacity and Inverter technology for energy saving. Quiet operation with advanced air filter and 5-year compressor warranty.',
 'GRE-AC-15T-SPL', 3200.00, 3600.00, 2400.00,
 '["/products/electrical-appliances.png", "/products/electric-fan.png"]'::jsonb,
 '/products/electrical-appliances.png', NULL,
 22, 3, 35.00, '{"w": 940, "h": 310, "d": 210}'::jsonb,
 '{"brand": "Gree", "capacity": "1.5 Ton", "type": "Split Inverter", "btu": "18000"}'::jsonb,
 '["bestseller"]'::jsonb, 4.40, 102, true, true),

-- ─── رياضة ولياقة ──────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000012', 'c1800000-0000-0000-0000-000000000001', NULL,
 'حذاء أديداس للجري Ultraboost', 'Adidas Ultraboost Running Shoes',
 'حذاء أديداس للجري بتقنية Boost للطاقة المرتدة ونعل Continental المطاطي لقبضة ممتازة. تصميم مريح ومناسب للاستخدام اليومي والتمارين.',
 'Adidas running shoes with Boost energy return technology and Continental rubber outsole for excellent grip. Comfortable for daily use and workouts.',
 'ADI-UB-RUN-42', 450.00, 550.00, 280.00,
 '["/products/mens-running-shoes.png", "/products/mens-sneakers.png"]'::jsonb,
 '/products/mens-running-shoes.png', NULL,
 60, 0, 0.35, '{"w": 28.0, "h": 12.0, "d": 10.0}'::jsonb,
 '{"brand": "Adidas", "type": "Running", "size": "42", "material": "Primeknit"}'::jsonb,
 '["sale"]'::jsonb, 4.60, 145, true, true),

('p1000000-0000-0000-0000-000000000013', 'c1800000-0000-0000-0000-000000000001', NULL,
 'حذاء نايك إير ماكس 270', 'Nike Air Max 270',
 'حذاء نايك إير ماكس 270 بأكبر وحدة Air في تاريخ نايك لراحة فائقة طوال اليوم. تصميم عصري يناسب جميع الإطلالات.',
 'Nike Air Max 270 with the largest Air unit in Nike history for all-day comfort. Modern design that suits all looks.',
 'NK-AM270-43', 550.00, 650.00, 320.00,
 '["/products/mens-sneakers.png", "/products/mens-running-shoes.png"]'::jsonb,
 '/products/mens-sneakers.png', NULL,
 45, 0, 0.32, '{"w": 29.0, "h": 12.0, "d": 10.0}'::jsonb,
 '{"brand": "Nike", "type": "Lifestyle", "size": "43", "technology": "Air Max"}'::jsonb,
 '["bestseller"]'::jsonb, 4.70, 203, true, true),

-- ─── إكسسوارات ──────────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000014', 'c1c00000-0000-0000-0000-000000000001', NULL,
 'ساعة أبل Series 9', 'Apple Watch Series 9',
 'ساعة أبل الذكية Series 9 بشريحة S9 وشاشة Always-On Retina ومراقبة صحة متقدمة تشمل الأكسجين في الدم وتخطيط القلب.',
 'Apple Watch Series 9 with S9 chip, Always-On Retina display, advanced health monitoring including blood oxygen and ECG.',
 'APP-AW-S9-45', 2800.00, 3200.00, 2200.00,
 '["/products/smartwatch.png", "/products/accessories.png"]'::jsonb,
 '/products/smartwatch.png', NULL,
 35, 0, 0.04, '{"w": 46.0, "h": 46.0, "d": 12.7}'::jsonb,
 '{"brand": "Apple", "size": "45mm", "connectivity": "GPS + Cellular", "water_resistance": "50m"}'::jsonb,
 '["new", "bestseller"]'::jsonb, 4.80, 87, true, true),

('p1000000-0000-0000-0000-000000000015', 'c1c00000-0000-0000-0000-000000000002', NULL,
 'سلسال ذهب 18 قيراط', '18K Gold Necklace',
 'سلسال ذهب عيار 18 قيراط بتصميم إيطالي أنيق ووزن 4 جرام. مثالي للإطلالات اليومية والمناسبات الخاصة.',
 '18K gold necklace with elegant Italian design, 4 grams weight. Perfect for everyday wear and special occasions.',
 'GLD-NS-18K-4G', 3200.00, NULL, 2600.00,
 '["/products/gold-bracelet.png", "/products/accessories.png"]'::jsonb,
 '/products/gold-bracelet.png', NULL,
 10, 0, 0.01, '{"w": 45.0, "h": 1.0, "d": 1.0}'::jsonb,
 '{"karat": "18K", "weight": "4g", "color": "Yellow Gold", "origin": "Italian"}'::jsonb,
 '[]'::jsonb, 4.90, 34, true, false),

('p1000000-0000-0000-0000-000000000016', 'c1c00000-0000-0000-0000-000000000003', NULL,
 'نظارة راي بان أفياتور', 'Ray-Ban Aviator Sunglasses',
 'نظارة راي بان أفياتور الكلاسيكية بعدسات بولارايزد وإطار معدني ذهبي. حماية كاملة من أشعة UV مع تصميم لا يفوت.',
 'Classic Ray-Ban Aviator sunglasses with polarized lenses and gold metal frame. Full UV protection with timeless design.',
 'RB-AVI-GOLD-POL', 650.00, 750.00, 380.00,
 '["/products/sunglasses.png", "/products/accessories.png"]'::jsonb,
 '/products/sunglasses.png', NULL,
 30, 0, 0.03, '{"w": 14.0, "h": 5.5, "d": 13.0}'::jsonb,
 '{"brand": "Ray-Ban", "model": "Aviator", "lens": "Polarized", "frame": "Gold Metal"}'::jsonb,
 '["sale"]'::jsonb, 4.50, 67, true, false),

-- ─── مستحضرات تجميل ────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000017', 'c1700000-0000-0000-0000-000000000002', NULL,
 'عطر عود ملكي فاخر', 'Royal Oud Perfume',
 'عطر عود ملكي فاخر بمزيج العود الكمبودي والورد الطائفي والمسك الأبيض. رائحة شرقية أصيلة تدوم طويلاً مناسبة للمناسبات.',
 'Premium royal oud perfume with Cambodian oud, Taifi rose, and white musk. Authentic oriental scent that lasts long, suitable for occasions.',
 'OD-RYL-100ML', 850.00, 1000.00, 450.00,
 '["/products/perfumes-oud.png", "/products/perfumes-oud-2.png"]'::jsonb,
 '/products/perfumes-oud.png', NULL,
 40, 2, 0.35, '{"w": 8.0, "h": 14.0, "d": 6.0}'::jsonb,
 '{"volume": "100ml", "type": "Oud", "origin": "Cambodian", "concentration": "Eau de Parfum"}'::jsonb,
 '["bestseller"]'::jsonb, 4.80, 156, true, true),

-- ─── أثاث ومنزل ─────────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000018', 'c1b00000-0000-0000-0000-000000000002', NULL,
 'صالون 3 قطع مودرن', 'Modern 3-Piece Living Room Set',
 'صالون مودرن من 3 قطع (كنبة 3 مقاعد + كنبة 2 مقاعد + كرسي) بخامة قماش فاخر وأرجل معدنية. تصميم عصري مريح يناسب الصالات الكبيرة.',
 'Modern 3-piece living room set (3-seater sofa + 2-seater sofa + armchair) with premium fabric and metal legs. Contemporary comfortable design for large halls.',
 'FRN-SAL-3PC-MOD', 6500.00, 7500.00, 4200.00,
 '["/products/wall-art.png", "/products/fashion-men.png"]'::jsonb,
 '/products/wall-art.png', NULL,
 6, 0, 95.00, '{"w": 2200, "h": 850, "d": 900}'::jsonb,
 '{"material": "Fabric", "style": "Modern", "pieces": "3", "seating": "5 persons"}'::jsonb,
 '["new"]'::jsonb, 4.30, 18, true, true),

-- ─── أغذية ومشروبات ────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000019', 'c1a00000-0000-0000-0000-000000000001', NULL,
 'تمور ليبية فاخرة 1 كجم', 'Premium Libyan Dates 1kg',
 'تمور ليبية فاخرة من أجود أنواع التمور في ليبيا. طبيعية 100% بدون إضافات. غنية بالألياف والمعادن ومثالية لشهر رمضان المبارك.',
 'Premium Libyan dates from the finest date varieties in Libya. 100% natural with no additives. Rich in fiber and minerals, ideal for Ramadan.',
 'DAT-LBY-1KG-PREM', 120.00, 150.00, 65.00,
 '["/products/food-storage.png", "/products/food-container-set.png"]'::jsonb,
 '/products/food-storage.png', NULL,
 200, 0, 1.00, '{"w": 25.0, "h": 15.0, "d": 10.0}'::jsonb,
 '{"origin": "Libya", "variety": "Saidi", "weight": "1kg", "type": "Premium"}'::jsonb,
 '["bestseller"]'::jsonb, 4.90, 234, true, true),

-- ─── كتب ─────────────────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000020', 'c1900000-0000-0000-0000-000000000001', NULL,
 'كتاب أسرار النجاح المالي', 'Secrets of Financial Success Book',
 'كتاب شامل عن أساسيات النجاح المالي وإدارة المال بذكاء. يغطي موضوعات الادخار والاستثمار وريادة الأعمال بأسلوب مبسط وعملي.',
 'Comprehensive book on financial success fundamentals and smart money management. Covers saving, investing, and entrepreneurship in a practical style.',
 'BK-FIN-SUCC-AR', 45.00, 55.00, 20.00,
 '["/products/kitchen-tools.png", "/products/electronics.png"]'::jsonb,
 '/products/kitchen-tools.png', NULL,
 150, 0, 0.40, '{"w": 16.0, "h": 24.0, "d": 2.0}'::jsonb,
 '{"language": "Arabic", "pages": "320", "publisher": "دار النشر العربية", "cover": "Soft Cover"}'::jsonb,
 '[]'::jsonb, 4.20, 45, true, false),

-- ─── ملابس رجالية ──────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000021', 'c1400000-0000-0000-0000-000000000001', NULL,
 'قميص رجالي كتان فاخر', 'Premium Linen Men''s Shirt',
 'قميص رجالي من الكتان الطبيعي الفاخر بتصميم كاجوال أنيق. خامة مريحة ومتنفسة مثالية للطقس الحار في ليبيا.',
 'Premium men''s shirt made from natural linen with a casual elegant design. Comfortable and breathable fabric, ideal for hot Libyan weather.',
 'MNS-SHRT-LIN-L', 180.00, 220.00, 85.00,
 '["/products/mens-shirt.png", "/products/fashion-men.png"]'::jsonb,
 '/products/mens-shirt.png', NULL,
 80, 0, 0.25, '{"w": 45.0, "h": 70.0, "d": 2.0}'::jsonb,
 '{"material": "Linen", "size": "L", "color": "White", "fit": "Regular"}'::jsonb,
 '["sale"]'::jsonb, 4.40, 56, true, false),

-- ─── ملابس نسائية ──────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000022', 'c1500000-0000-0000-0000-000000000002', NULL,
 'عباية سوداء مطرزة فاخرة', 'Premium Embroidered Black Abaya',
 'عباية سوداء فاخرة بتطريز يدوي راقي على الأكمام والأطراف. خامة كريب خفيف ومريح مع حزام داخلي لقصّة أنيقة ومحتشمة.',
 'Premium black abaya with elegant hand embroidery on sleeves and edges. Lightweight comfortable crepe fabric with internal belt for a chic modest look.',
 'WMN-ABY-BLK-EMB', 350.00, 420.00, 160.00,
 '["/products/womens-abaya.png", "/products/fashion-women.png"]'::jsonb,
 '/products/womens-abaya.png', NULL,
 55, 0, 0.45, '{"w": 55.0, "h": 150.0, "d": 2.0}'::jsonb,
 '{"material": "Crepe", "size": "Free Size", "color": "Black", "embroidery": "Hand-made"}'::jsonb,
 '["bestseller"]'::jsonb, 4.70, 189, true, true),

-- ─── أجهزة كهربائية ────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000023', 'c1600000-0000-0000-0000-000000000002', NULL,
 'خلاط كهربائي متعدد السرعات', 'Multi-Speed Electric Blender',
 'خلاط كهربائي قوي بسرعات متعددة وكوب زجاجي كبير سعة 1.5 لتر. مثالي لإعداد العصائر والشوربات والصلصات بسهولة.',
 'Powerful electric blender with multiple speeds and large 1.5L glass jar. Perfect for making smoothies, soups, and sauces easily.',
 'ELC-BLD-15L-MS', 280.00, 350.00, 155.00,
 '["/products/electric-blender.png", "/products/electrical-appliances.png"]'::jsonb,
 '/products/electric-blender.png', NULL,
 70, 0, 2.80, '{"w": 18.0, "h": 40.0, "d": 18.0}'::jsonb,
 '{"brand": "Generic", "capacity": "1.5L", "speeds": "5", "jar": "Glass"}'::jsonb,
 '["sale"]'::jsonb, 4.20, 41, true, false),

('p1000000-0000-0000-0000-000000000024', 'c1600000-0000-0000-0000-000000000003', NULL,
 'ماكينة قهوة إسبريسو أوتوماتيك', 'Automatic Espresso Coffee Machine',
 'ماكينة قهوة أوتوماتيك بالكامل مع مطحنة مدمجة ورغوة حليب. تحضير جميع أنواع القهوة بضغطة زر واحدة. مثالية لمحبي القهوة العربية.',
 'Fully automatic espresso machine with built-in grinder and milk frother. Prepare all coffee types with one button press. Ideal for Arabic coffee lovers.',
 'ELC-COF-AUTO-ESP', 1800.00, 2100.00, 1100.00,
 '["/products/coffee-machine.png", "/products/electrical-appliances.png"]'::jsonb,
 '/products/coffee-machine.png', NULL,
 18, 0, 8.50, '{"w": 22.0, "h": 34.0, "d": 42.0}'::jsonb,
 '{"brand": "Generic", "type": "Fully Automatic", "pressure": "15 bar", "grinder": "Built-in"}'::jsonb,
 '["new"]'::jsonb, 4.50, 23, true, true),

-- ─── عناية بالبشرة ──────────────────────────────────────────────────────────
('p1000000-0000-0000-0000-000000000025', 'c1700000-0000-0000-0000-000000000001', NULL,
 'كريم مرطب للبشرة الجافة 200 مل', 'Moisturizing Cream for Dry Skin 200ml',
 'كريم مرطب غني بالألوفيرا وفيتامين E للبشرة الجافة والحساسة. يرطب بعمق ويحمي البشرة من الجفاف طوال اليوم. مناسب لجميع أنواع البشرة.',
 'Rich moisturizing cream with Aloe Vera and Vitamin E for dry and sensitive skin. Deep hydration and all-day dryness protection. Suitable for all skin types.',
 'BTY-MST-200ML', 95.00, 120.00, 40.00,
 '["/products/perfume-bottle.png", "/products/perfumes-oud.png"]'::jsonb,
 '/products/perfume-bottle.png', NULL,
 100, 0, 0.25, '{"w": 7.0, "h": 18.0, "d": 7.0}'::jsonb,
 '{"volume": "200ml", "skin_type": "Dry & Sensitive", "ingredients": "Aloe Vera, Vitamin E"}'::jsonb,
 '[]'::jsonb, 4.30, 78, true, false);


-- ============================================================================
-- ─── 3. Delivery Zones (مناطق التوصيل الليبية) ─────────────────────────────
-- ============================================================================

INSERT INTO "DeliveryZone" ("id", "nameAr", "nameEn", "city", "region", "area", "fee", "freeAbove", "estimatedDays", "isActive") VALUES
('dz000001-0000-0000-0000-000000000001', 'طرابلس المركز', 'Tripoli Central', 'طرابلس', 'طرابلس', 'المركز', 10.00, 100.00, 1, true),
('dz000001-0000-0000-0000-000000000002', 'بنغازي المركز', 'Benghazi Central', 'بنغازي', 'بنغازي', 'المركز', 15.00, 150.00, 2, true),
('dz000001-0000-0000-0000-000000000003', 'مصراتة المركز', 'Misrata Central', 'مصراتة', 'مصراتة', 'المركز', 12.00, 120.00, 2, true),
('dz000001-0000-0000-0000-000000000004', 'زليتن المركز', 'Zliten Central', 'زليتن', 'مرزق', 'المركز', 12.00, 120.00, 2, true),
('dz000001-0000-0000-0000-000000000005', 'الخمس المركز', 'Khoms Central', 'الخمس', 'مرزق', 'المركز', 13.00, 130.00, 3, true),
('dz000001-0000-0000-0000-000000000006', 'سبها المركز', 'Sebha Central', 'سبها', 'سبها', 'المركز', 25.00, 200.00, 4, true),
('dz000001-0000-0000-0000-000000000007', 'درنة المركز', 'Derna Central', 'درنة', 'درنة', 'المركز', 20.00, 180.00, 3, true),
('dz000001-0000-0000-0000-000000000008', 'طبرق المركز', 'Tobruk Central', 'طبرق', 'طبرق', 'المركز', 22.00, 190.00, 4, true);


-- ============================================================================
-- ─── 4. Shipping Companies (شركات الشحن الليبية) ────────────────────────────
-- ============================================================================

INSERT INTO "ShippingCompany" ("id", "nameAr", "nameEn", "slug", "logo", "phone", "email", "website", "descriptionAr", "descriptionEn", "apiEndpoint", "apiKey", "apiSecret", "trackingUrl", "isActive", "isDefault", "sortOrder", "baseFee", "freeAbove", "weightLimit", "codSupported", "codFee", "coverageType", "totalDeliveries", "successRate", "avgDeliveryDays") VALUES
('sc000001-0000-0000-0000-000000000001',
 'البريد الليبي', 'Libya Post', 'libya-post',
 '/logo-circle.png', '+218213333333', 'info@libyapost.ly', 'https://libyapost.ly',
 'البريد الليبي هو الشركة الرسمية للبريد والشحن في ليبيا. تغطي جميع المدن والمناطق الليبية بخبرة تمتد لأكثر من 50 عاماً.',
 'Libya Post is the official postal and shipping company in Libya. Covers all Libyan cities and regions with over 50 years of experience.',
 NULL, NULL, NULL, 'https://libyapost.ly/track/{trackingNumber}',
 true, true, 1, 5.00, 100.00, 30.00, true, 1.00, 'all', 15000, 92.50, 3),

('sc000001-0000-0000-0000-000000000002',
 'توفيق للشحن', 'Tawfik Shipping', 'tawfik-shipping',
 '/logo-circle.png', '+218912345678', 'info@tawfikshipping.ly', 'https://tawfikshipping.ly',
 'شركة توفيق للشحن من أبرز شركات الشحن الخاصة في ليبيا. تتميز بالسرعة والموثوقية وتغطي المدن الرئيسية.',
 'Tawfik Shipping is one of the leading private shipping companies in Libya. Known for speed and reliability, covering major cities.',
 NULL, NULL, NULL, 'https://tawfikshipping.ly/track/{trackingNumber}',
 true, false, 2, 8.00, 120.00, 25.00, true, 1.50, 'regional', 8500, 95.00, 2),

('sc000001-0000-0000-0000-000000000003',
 'النور السريع', 'Alnour Express', 'alnour-express',
 '/logo-circle.png', '+218923456789', 'info@alnourexp.ly', 'https://alnourexp.ly',
 'شركة النور السريع للتوصيل السريع في ليبيا. تقدم خدمة توصيل سريعة خلال 24-48 ساعة في المدن الكبرى.',
 'Alnour Express for fast delivery in Libya. Offers 24-48 hour express delivery in major cities.',
 NULL, NULL, NULL, 'https://alnourexp.ly/track/{trackingNumber}',
 true, false, 3, 10.00, 150.00, 20.00, true, 2.00, 'regional', 5200, 94.00, 1);


-- ============================================================================
-- ─── Shipping Carriers (شركات النقل - نسخة مفصلة) ──────────────────────────
-- ============================================================================

INSERT INTO "ShippingCarrier" ("id", "nameAr", "nameEn", "code", "type", "phone", "email", "website", "logo", "apiEndpoint", "apiKey", "apiSecret", "webhookUrl", "trackingUrl", "coverageAreas", "maxWeight", "pricePerKg", "basePrice", "codFee", "codFixedFee", "estimatedDays", "isActive", "isIntegrated", "integrationType", "rating", "totalShipments", "successRate", "avgDeliveryDays", "notes") VALUES
('src00001-0000-0000-0000-000000000001',
 'البريد الليبي', 'Libya Post', 'libya_post', 'national',
 '+218213333333', 'info@libyapost.ly', 'https://libyapost.ly', '/logo-circle.png',
 NULL, NULL, NULL, NULL, 'https://libyapost.ly/track/{trackingNumber}',
 '["طرابلس", "بنغازي", "مصراتة", "زليتن", "الخمس", "سبها", "درنة", "طبرق", "سرت", "اجدابيا", "الزاوية", "زوارة", "ترهونة", "بني وليد", "الكفرة"]'::jsonb,
 30.00, 1.50, 5.00, 0.00, 0.00, 3, true, false, 'manual', 4.20, 15000, 92.50, 3.50, 'الشركة الرسمية - تغطي جميع المدن الليبية'),

('src00001-0000-0000-0000-000000000002',
 'توفيق للشحن', 'Tawfik Shipping', 'tawfik', 'national',
 '+218912345678', 'info@tawfikshipping.ly', 'https://tawfikshipping.ly', '/logo-circle.png',
 NULL, NULL, NULL, NULL, 'https://tawfikshipping.ly/track/{trackingNumber}',
 '["طرابلس", "بنغازي", "مصراتة", "زليتن", "الخمس", "سرت"]'::jsonb,
 25.00, 2.00, 8.00, 1.50, 5.00, 2, true, false, 'manual', 4.50, 8500, 95.00, 2.50, 'شركة خاصة - تغطي المدن الرئيسية'),

('src00001-0000-0000-0000-000000000003',
 'النور السريع', 'Alnour Express', 'alnour', 'local',
 '+218923456789', 'info@alnourexp.ly', 'https://alnourexp.ly', '/logo-circle.png',
 NULL, NULL, NULL, NULL, 'https://alnourexp.ly/track/{trackingNumber}',
 '["طرابلس", "بنغازي", "مصراتة"]'::jsonb,
 20.00, 2.50, 10.00, 2.00, 8.00, 1, true, false, 'manual', 4.60, 5200, 94.00, 1.50, 'توصيل سريع - المدن الكبرى فقط');


-- ============================================================================
-- ─── Shipping Coverage Zones (مناطق تغطية الشحن) ───────────────────────────
-- ============================================================================

INSERT INTO "ShippingCoverageZone" ("id", "companyId", "regionId", "regionNameAr", "cityName", "areaName", "fee", "freeAbove", "estimatedDays", "isActive") VALUES
-- البريد الليبي
('scz00001-0000-0000-0000-000000000001', 'sc000001-0000-0000-0000-000000000001', 'western', 'غرب ليبيا', 'طرابلس', 'المركز', 10.00, 100.00, 1, true),
('scz00001-0000-0000-0000-000000000002', 'sc000001-0000-0000-0000-000000000001', 'eastern', 'شرق ليبيا', 'بنغازي', 'المركز', 15.00, 150.00, 2, true),
('scz00001-0000-0000-0000-000000000003', 'sc000001-0000-0000-0000-000000000001', 'western', 'غرب ليبيا', 'مصراتة', 'المركز', 12.00, 120.00, 2, true),
('scz00001-0000-0000-0000-000000000004', 'sc000001-0000-0000-0000-000000000001', 'southern', 'جنوب ليبيا', 'سبها', 'المركز', 25.00, 200.00, 4, true),
('scz00001-0000-0000-0000-000000000005', 'sc000001-0000-0000-0000-000000000001', 'eastern', 'شرق ليبيا', 'طبرق', 'المركز', 22.00, 190.00, 4, true),

-- توفيق للشحن
('scz00001-0000-0000-0000-000000000006', 'sc000001-0000-0000-0000-000000000002', 'western', 'غرب ليبيا', 'طرابلس', 'المركز', 8.00, 120.00, 1, true),
('scz00001-0000-0000-0000-000000000007', 'sc000001-0000-0000-0000-000000000002', 'eastern', 'شرق ليبيا', 'بنغازي', 'المركز', 12.00, 150.00, 2, true),
('scz00001-0000-0000-0000-000000000008', 'sc000001-0000-0000-0000-000000000002', 'western', 'غرب ليبيا', 'مصراتة', 'المركز', 10.00, 130.00, 2, true),

-- النور السريع
('scz00001-0000-0000-0000-000000000009', 'sc000001-0000-0000-0000-000000000003', 'western', 'غرب ليبيا', 'طرابلس', 'المركز', 10.00, 150.00, 1, true),
('scz00001-0000-0000-0000-000000000010', 'sc000001-0000-0000-0000-000000000003', 'eastern', 'شرق ليبيا', 'بنغازي', 'المركز', 18.00, 200.00, 2, true),
('scz00001-0000-0000-0000-000000000011', 'sc000001-0000-0000-0000-000000000003', 'western', 'غرب ليبيا', 'مصراتة', 'المركز', 12.00, 160.00, 1, true);


-- ============================================================================
-- ─── 5. Coupons (كوبونات الخصم) ────────────────────────────────────────────
-- ============================================================================

INSERT INTO "Coupon" ("id", "code", "descriptionAr", "descriptionEn", "type", "value", "minOrder", "maxDiscount", "usageLimit", "usageCount", "perUserLimit", "startsAt", "expiresAt", "isActive") VALUES
('cpn00001-0000-0000-0000-000000000001',
 'WELCOME10',
 'خصم ترحيبي 10% للمستخدمين الجدد', '10% welcome discount for new users',
 'percentage', 10.00, 0, 500.00, 1000, 0, 1,
 '2024-01-01T00:00:00Z', '2025-12-31T23:59:59Z', true),

('cpn00001-0000-0000-0000-000000000002',
 'SUMMER2024',
 'خصم صيفي 15% على جميع المنتجات', '15% summer discount on all products',
 'percentage', 15.00, 200.00, 800.00, 500, 0, 2,
 '2024-06-01T00:00:00Z', '2025-09-30T23:59:59Z', true),

('cpn00001-0000-0000-0000-000000000003',
 'FREESHIP',
 'شحن مجاني على الطلبات فوق 50 دينار', 'Free shipping on orders above 50 LYD',
 'fixed', 15.00, 50.00, 15.00, 2000, 0, 3,
 '2024-01-01T00:00:00Z', '2025-12-31T23:59:59Z', true);


-- ============================================================================
-- ─── 6. Feature Flags (أعلام الميزات) ──────────────────────────────────────
-- ============================================================================

INSERT INTO "FeatureFlag" ("id", "key", "value", "description") VALUES
('ff000001-0000-0000-0000-000000000001', 'enable_chat', true, 'تفعيل المحادثة المباشرة بين العملاء والدعم الفني / Enable live chat with customer support'),
('ff000001-0000-0000-0000-000000000002', 'enable_reviews', true, 'تفعيل نظام التقييمات والمراجعات للمنتجات / Enable product reviews and ratings'),
('ff000001-0000-0000-0000-000000000003', 'enable_wishlist', true, 'تفعيل قائمة المفضلة والرغبات / Enable wishlist and favorites'),
('ff000001-0000-0000-0000-000000000004', 'enable_multi_vendor', false, 'تفعيل نظام البائعين المتعددين (غير متاح حالياً) / Enable multi-vendor system (not available yet)'),
('ff000001-0000-0000-0000-000000000005', 'enable_realtime', false, 'تفعيل التحديثات الفورية عبر WebSocket (قيد التطوير) / Enable real-time updates via WebSocket (in development)');


-- ============================================================================
-- ─── 7. Store Settings (إعدادات المتجر) ────────────────────────────────────
-- ============================================================================

INSERT INTO "StoreSetting" ("key", "value") VALUES
('store_name_ar', 'نبض المدينة'),
('store_name_en', 'City Pulse'),
('store_phone', '+218910000000'),
('store_email', 'info@citypulse.ly'),
('store_website', 'https://citypulse.ly'),
('store_address_ar', 'طرابلس، ليبيا - شارع الجيش'),
('store_address_en', 'Tripoli, Libya - Al Jaysh Street'),
('default_language', 'ar'),
('default_currency', 'LYD'),
('currency_symbol', 'د.ل'),
('free_shipping_threshold', '100'),
('tax_rate', '0'),
('store_description_ar', 'نبض المدينة - متجرك الإلكتروني الأول في ليبيا. تسوق أفضل المنتجات بأسعار منافسة مع توصيل سريع لجميع المدن الليبية.'),
('store_description_en', 'City Pulse - Your first online store in Libya. Shop the best products at competitive prices with fast delivery to all Libyan cities.'),
('store_facebook', 'https://facebook.com/citypulse.ly'),
('store_instagram', 'https://instagram.com/citypulse.ly'),
('store_whatsapp', '+218910000000'),
('business_hours_ar', 'السبت - الخميس: 9 صباحاً - 9 مساءً'),
('business_hours_en', 'Saturday - Thursday: 9 AM - 9 PM'),
('return_policy_days', '14'),
('min_order_amount', '0'),
('max_cod_amount', '5000'),
('enable_cod', 'true'),
('enable_card_payment', 'false'),
('enable_bank_transfer', 'true'),
('maintenance_mode', 'false'),
('version', '1.0.0');


-- ============================================================================
-- ─── 8. Admin User (مستخدم مدير تجريبي) ───────────────────────────────────
-- ============================================================================
-- ملاحظة: كلمة المرور يجب أن تُشفّر في التطبيق الفعلي
-- هذا حساب مدير تجريبي فقط

INSERT INTO "User" ("id", "phone", "name", "email", "role", "language", "isActive") VALUES
('usr00001-0000-0000-0000-000000000001', '+218910000001', 'مدير النظام', 'admin@citypulse.ly', 'admin', 'ar', true);


-- ============================================================================
-- ─── Verification ───────────────────────────────────────────────────────────
-- ============================================================================
-- التحقق من عدد السجلات المُدخلة

-- SELECT 'Categories' AS "Table", COUNT(*) AS "Count" FROM "Category"
-- UNION ALL SELECT 'Products', COUNT(*) FROM "Product"
-- UNION ALL SELECT 'DeliveryZones', COUNT(*) FROM "DeliveryZone"
-- UNION ALL SELECT 'ShippingCompanies', COUNT(*) FROM "ShippingCompany"
-- UNION ALL SELECT 'ShippingCarriers', COUNT(*) FROM "ShippingCarrier"
-- UNION ALL SELECT 'ShippingCoverageZones', COUNT(*) FROM "ShippingCoverageZone"
-- UNION ALL SELECT 'Coupons', COUNT(*) FROM "Coupon"
-- UNION ALL SELECT 'FeatureFlags', COUNT(*) FROM "FeatureFlag"
-- UNION ALL SELECT 'StoreSettings', COUNT(*) FROM "StoreSetting"
-- UNION ALL SELECT 'Users', COUNT(*) FROM "User";

-- ============================================================================
-- ─── Seed Complete ──────────────────────────────────────────────────────────
-- ============================================================================
-- تم إدخال البيانات التجريبية بنجاح
-- نبض المدينة - City Pulse
-- ============================================================================
-- الملخص:
--   الأقسام الرئيسية:   12
--   الأقسام الفرعية:    44
--   المنتجات:           25
--   مناطق التوصيل:      8
--   شركات الشحن:        3
--   شركات النقل:        3
--   مناطق التغطية:      11
--   كوبونات الخصم:      3
--   أعلام الميزات:      5
--   إعدادات المتجر:     26
--   مستخدمين:           1 (مدير)
-- ============================================================================
