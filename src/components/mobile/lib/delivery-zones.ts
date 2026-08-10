// ─── Delivery Zones Data ─────────────────────────────────────────────
// Real Libya delivery data: 5 regions, 146 zones
// Source: Official delivery pricing sheet

export interface DeliveryZone {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;       // LYD
  durationAr: string;  // e.g. "خلال 24 ساعة", "من 2 الى 3 ايام"
  durationEn: string;
}

export interface DeliveryRegion {
  id: string;
  nameAr: string;
  nameEn: string;
  zones: DeliveryZone[];
}

// ─── Region 1: طرابلس والضواحي (Tripoli & Suburbs) ────────────────
const TRIPOLI_ZONES: DeliveryZone[] = [
  { id: 'tripoli-0', nameAr: 'السياحية', nameEn: 'السياحية', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-1', nameAr: 'قرقارش', nameEn: 'قرقارش', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-2', nameAr: 'حي الأندلس', nameEn: 'حي الأندلس', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-3', nameAr: 'قرجي', nameEn: 'قرجي', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-4', nameAr: 'السراج', nameEn: 'السراج', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-5', nameAr: 'الدعوة الإسلامية', nameEn: 'الدعوة الإسلامية', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-6', nameAr: 'الحي الإسلامي', nameEn: 'الحي الإسلامي', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-7', nameAr: 'الرياضية', nameEn: 'الرياضية', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-8', nameAr: 'عمر المختار', nameEn: 'عمر المختار', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-9', nameAr: 'شارع الصريم', nameEn: 'شارع الصريم', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-10', nameAr: 'شارع النصر', nameEn: 'شارع النصر', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-11', nameAr: 'جزيرة القدس', nameEn: 'جزيرة القدس', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-12', nameAr: 'حي الانتصار', nameEn: 'حي الانتصار', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-13', nameAr: 'أبوسليم', nameEn: 'أبوسليم', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-14', nameAr: 'الهضبة الخضراء', nameEn: 'الهضبة الخضراء', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-15', nameAr: 'الهضبة القاسي', nameEn: 'الهضبة القاسي', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-16', nameAr: 'الهضبة الكيزة', nameEn: 'الهضبة الكيزة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-17', nameAr: 'الهضبة طول', nameEn: 'الهضبة طول', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-18', nameAr: 'صلاح الدين', nameEn: 'صلاح الدين', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-19', nameAr: 'السدرة', nameEn: 'السدرة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-20', nameAr: 'الخلة', nameEn: 'الخلة', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-21', nameAr: 'عين زارة', nameEn: 'عين زارة', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-22', nameAr: 'الفرناج', nameEn: 'الفرناج', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-23', nameAr: 'زناتة', nameEn: 'زناتة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-24', nameAr: 'جامع الصقع', nameEn: 'جامع الصقع', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-25', nameAr: 'السبعة', nameEn: 'السبعة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-26', nameAr: 'طريق المشتل', nameEn: 'طريق المشتل', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-27', nameAr: 'تاجوراء', nameEn: 'تاجوراء', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-28', nameAr: 'البيفي', nameEn: 'البيفي', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-29', nameAr: 'وادي الربيع', nameEn: 'وادي الربيع', price: 25, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-30', nameAr: 'جنزور', nameEn: 'جنزور', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-31', nameAr: 'الكريمية', nameEn: 'الكريمية', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-32', nameAr: 'طريق المطار', nameEn: 'طريق المطار', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-33', nameAr: 'سوق الثلاتاء', nameEn: 'سوق الثلاتاء', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-34', nameAr: 'الدرن', nameEn: 'الدرن', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-35', nameAr: 'قرية صالح', nameEn: 'قرية صالح', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-36', nameAr: 'شارع المدار', nameEn: 'شارع المدار', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-37', nameAr: 'الجرابة', nameEn: 'الجرابة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-38', nameAr: 'بن عاشور', nameEn: 'بن عاشور', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-39', nameAr: 'نادي الإتحاد', nameEn: 'نادي الإتحاد', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-40', nameAr: 'شارع الجمهورية', nameEn: 'شارع الجمهورية', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-41', nameAr: 'المدينة القديمة', nameEn: 'المدينة القديمة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-42', nameAr: 'ذات العماد', nameEn: 'ذات العماد', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-43', nameAr: 'طريق الشط', nameEn: 'طريق الشط', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-44', nameAr: 'الظهرة', nameEn: 'الظهرة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-45', nameAr: 'فشلوم', nameEn: 'فشلوم', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-46', nameAr: 'المنصورة', nameEn: 'المنصورة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-47', nameAr: 'السواني', nameEn: 'السواني', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-48', nameAr: 'كوبري الحديد', nameEn: 'كوبري الحديد', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-49', nameAr: 'شارع الخلاطات', nameEn: 'شارع الخلاطات', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-50', nameAr: 'جزيرة العريف', nameEn: 'جزيرة العريف', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-51', nameAr: 'مشروع الهضبة', nameEn: 'مشروع الهضبة', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-52', nameAr: 'باب العزيزية', nameEn: 'باب العزيزية', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-53', nameAr: 'البطاطا', nameEn: 'البطاطا', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-54', nameAr: 'غابة النصر', nameEn: 'غابة النصر', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-55', nameAr: 'جزيرة الفحم', nameEn: 'جزيرة الفحم', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-56', nameAr: 'الملكية مول', nameEn: 'الملكية مول', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-57', nameAr: 'سوق الجمعة', nameEn: 'سوق الجمعة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-58', nameAr: 'عرادة', nameEn: 'عرادة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-59', nameAr: 'الهاني', nameEn: 'الهاني', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-60', nameAr: 'كوبري الصفصفة', nameEn: 'كوبري الصفصفة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-61', nameAr: 'أبوستة', nameEn: 'أبوستة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-62', nameAr: 'رأس حسن', nameEn: 'رأس حسن', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-63', nameAr: 'النادي الدبلوماسي', nameEn: 'النادي الدبلوماسي', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-64', nameAr: 'الكحيلي', nameEn: 'الكحيلي', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-65', nameAr: 'بئر اسطى ميلاد', nameEn: 'بئر اسطى ميلاد', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-66', nameAr: 'معيتيقة', nameEn: 'معيتيقة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-67', nameAr: 'النوفليين', nameEn: 'النوفليين', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-68', nameAr: 'ابومشماشة', nameEn: 'ابومشماشة', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-69', nameAr: 'زاوية الدهماني', nameEn: 'زاوية الدهماني', price: 10, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'tripoli-70', nameAr: 'شوارع الكهرباء 4', nameEn: 'شوارع الكهرباء 4', price: 15, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
];

// ─── Region 2: المنطقة الغربية (Western Region) ──────────────────
const WESTERN_ZONES: DeliveryZone[] = [
  { id: 'western-0', nameAr: 'الزاوية', nameEn: 'الزاوية', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-1', nameAr: 'صرمان', nameEn: 'صرمان', price: 25, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-2', nameAr: 'صبراتة', nameEn: 'صبراتة', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-3', nameAr: 'زوارة', nameEn: 'زوارة', price: 30, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-4', nameAr: 'الجميل', nameEn: 'الجميل', price: 35, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-5', nameAr: 'العجيلات', nameEn: 'العجيلات', price: 30, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-6', nameAr: 'المطرد', nameEn: 'المطرد', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-7', nameAr: 'مصراتة', nameEn: 'مصراتة', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-8', nameAr: 'الخمس', nameEn: 'الخمس', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-9', nameAr: 'زليتن', nameEn: 'زليتن', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-10', nameAr: 'القربولي', nameEn: 'القربولي', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-11', nameAr: 'رقدالين', nameEn: 'رقدالين', price: 35, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-12', nameAr: 'زلطن', nameEn: 'زلطن', price: 35, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-13', nameAr: 'ورشفانة', nameEn: 'ورشفانة', price: 25, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-14', nameAr: 'بني وليد', nameEn: 'بني وليد', price: 25, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-15', nameAr: 'مسلاتة', nameEn: 'مسلاتة', price: 30, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-16', nameAr: 'الطويلة', nameEn: 'الطويلة', price: 30, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-17', nameAr: 'قصر بن غشير', nameEn: 'قصر بن غشير', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-18', nameAr: 'ترهونة', nameEn: 'ترهونة', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-19', nameAr: 'السايح', nameEn: 'السايح', price: 30, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-20', nameAr: 'سوق الخميس', nameEn: 'سوق الخميس', price: 30, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-21', nameAr: 'اسبيعة', nameEn: 'اسبيعة', price: 30, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-22', nameAr: 'سوق السبت', nameEn: 'سوق السبت', price: 30, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-23', nameAr: 'كوبري 27', nameEn: 'كوبري 27', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-24', nameAr: 'ابوعيسى', nameEn: 'ابوعيسى', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-25', nameAr: 'الماية', nameEn: 'الماية', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-26', nameAr: 'العلوص', nameEn: 'العلوص', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-27', nameAr: 'وادي كعام', nameEn: 'وادي كعام', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-28', nameAr: 'غنية', nameEn: 'غنية', price: 20, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'western-29', nameAr: 'أبوكماش', nameEn: 'أبوكماش', price: 35, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
];

// ─── Region 3: المنطقة الشرقية (Eastern Region) ──────────────────
const EASTERN_ZONES: DeliveryZone[] = [
  { id: 'eastern-0', nameAr: 'بنغازي', nameEn: 'بنغازي', price: 20, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-1', nameAr: 'اجدابيا', nameEn: 'اجدابيا', price: 25, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-2', nameAr: 'البيضاء', nameEn: 'البيضاء', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-3', nameAr: 'المرج', nameEn: 'المرج', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-4', nameAr: 'توكرة', nameEn: 'توكرة', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-5', nameAr: 'سلوق', nameEn: 'سلوق', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-6', nameAr: 'الابيار', nameEn: 'الابيار', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-7', nameAr: 'البياضة', nameEn: 'البياضة', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-8', nameAr: 'الأبرق', nameEn: 'الأبرق', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-9', nameAr: 'الرجمة', nameEn: 'الرجمة', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-10', nameAr: 'القبة', nameEn: 'القبة', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-11', nameAr: 'قصر ليبيا', nameEn: 'قصر ليبيا', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-12', nameAr: 'سوسة', nameEn: 'سوسة', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-13', nameAr: 'شحات', nameEn: 'شحات', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-14', nameAr: 'درنة', nameEn: 'درنة', price: 40, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-15', nameAr: 'طبرق', nameEn: 'طبرق', price: 35, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-16', nameAr: 'التميمي', nameEn: 'التميمي', price: 45, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'eastern-17', nameAr: 'جالو', nameEn: 'جالو', price: 45, durationAr: 'من 2 الى 4 ايام', durationEn: '2-4 days' },
  { id: 'eastern-18', nameAr: 'أوجلة', nameEn: 'أوجلة', price: 45, durationAr: 'من 2 الى 4 ايام', durationEn: '2-4 days' },
  { id: 'eastern-19', nameAr: 'أجخرة', nameEn: 'أجخرة', price: 45, durationAr: 'من 2 الى 4 ايام', durationEn: '2-4 days' },
  { id: 'eastern-20', nameAr: 'الكفرة', nameEn: 'الكفرة', price: 45, durationAr: 'من 2 الى 4 ايام', durationEn: '2-4 days' },
];

// ─── Region 4: الجبل والجنوب (Mountain & South) ──────────────────
const MOUNTAIN_ZONES: DeliveryZone[] = [
  { id: 'mountain-0', nameAr: 'سبها', nameEn: 'سبها', price: 30, durationAr: 'من 2 الى 3 ايام', durationEn: '2-3 days' },
  { id: 'mountain-1', nameAr: 'براك الشاطي', nameEn: 'براك الشاطي', price: 35, durationAr: 'من 3 الى 4 ايام', durationEn: '3-4 days' },
  { id: 'mountain-2', nameAr: 'القطرون', nameEn: 'القطرون', price: 50, durationAr: 'من 3 الى 5 ايام', durationEn: '3-5 days' },
  { id: 'mountain-3', nameAr: 'أوباري', nameEn: 'أوباري', price: 45, durationAr: 'من 3 الى 4 ايام', durationEn: '3-4 days' },
  { id: 'mountain-4', nameAr: 'مرزق', nameEn: 'مرزق', price: 45, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-5', nameAr: 'جادو', nameEn: 'جادو', price: 35, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-6', nameAr: 'الزنتان', nameEn: 'الزنتان', price: 35, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-7', nameAr: 'كاباو', nameEn: 'كاباو', price: 35, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-8', nameAr: 'تيجي', nameEn: 'تيجي', price: 35, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-9', nameAr: 'ككلة', nameEn: 'ككلة', price: 35, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-10', nameAr: 'غريان', nameEn: 'غريان', price: 25, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-11', nameAr: 'الرياينة', nameEn: 'الرياينة', price: 35, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-12', nameAr: 'القلعة', nameEn: 'القلعة', price: 35, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-13', nameAr: 'الجبل الغربي', nameEn: 'الجبل الغربي', price: 35, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-14', nameAr: 'ودان', nameEn: 'ودان', price: 30, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-15', nameAr: 'هون', nameEn: 'هون', price: 30, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-16', nameAr: 'سوكنة', nameEn: 'سوكنة', price: 30, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'mountain-17', nameAr: 'الشويرف', nameEn: 'الشويرف', price: 35, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
];

// ─── Region 5: المنطقة الوسطى (Central Region) ───────────────────
const CENTRAL_ZONES: DeliveryZone[] = [
  { id: 'central-0', nameAr: 'البريقة', nameEn: 'البريقة', price: 30, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'central-1', nameAr: 'رأس الأنوف', nameEn: 'رأس الأنوف', price: 30, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'central-2', nameAr: 'هراوة', nameEn: 'هراوة', price: 30, durationAr: 'خلال 24 ساعة', durationEn: 'Within 24 hours' },
  { id: 'central-3', nameAr: 'العقيلة', nameEn: 'العقيلة', price: 30, durationAr: 'من 1 الى 2 ايام', durationEn: '1-2 days' },
  { id: 'central-4', nameAr: 'امساعد', nameEn: 'امساعد', price: 50, durationAr: 'من 2 الى 4 ايام', durationEn: '2-4 days' },
];

// ─── All Delivery Regions ──────────────────────────────────────────
export const DELIVERY_REGIONS: DeliveryRegion[] = [
  {
    id: 'tripoli',
    nameAr: 'طرابلس والضواحي',
    nameEn: 'Tripoli & Suburbs',
    zones: TRIPOLI_ZONES,
  },
  {
    id: 'western',
    nameAr: 'المنطقة الغربية',
    nameEn: 'Western Region',
    zones: WESTERN_ZONES,
  },
  {
    id: 'eastern',
    nameAr: 'المنطقة الشرقية',
    nameEn: 'Eastern Region',
    zones: EASTERN_ZONES,
  },
  {
    id: 'mountain',
    nameAr: 'الجبل والجنوب',
    nameEn: 'Mountain & South',
    zones: MOUNTAIN_ZONES,
  },
  {
    id: 'central',
    nameAr: 'المنطقة الوسطى',
    nameEn: 'Central Region',
    zones: CENTRAL_ZONES,
  },
];

// ─── Helper Functions ──────────────────────────────────────────────

/** Find a delivery zone by name (searches both Arabic and English) */
export function findDeliveryZone(query: string): DeliveryZone | null {
  const normalizedQuery = query.trim().toLowerCase();
  for (const region of DELIVERY_REGIONS) {
    for (const zone of region.zones) {
      if (
        zone.nameAr === query.trim() ||
        zone.nameEn.toLowerCase() === normalizedQuery
      ) {
        return zone;
      }
    }
  }
  return null;
}

/** Get delivery fee for a given zone name */
export function getDeliveryFeeForArea(areaName: string): number {
  const zone = findDeliveryZone(areaName);
  return zone?.price ?? 0;
}

/** Get delivery duration for a given zone name in the specified language */
export function getDeliveryDurationForArea(areaName: string, language: 'ar' | 'en'): string {
  const zone = findDeliveryZone(areaName);
  if (!zone) return '';
  return language === 'ar' ? zone.durationAr : zone.durationEn;
}

/** Get a flat list of all delivery zones across all regions */
export function getAllDeliveryZones(): DeliveryZone[] {
  return DELIVERY_REGIONS.flatMap((region) => region.zones);
}

/** Min and max delivery prices across all regions */
export const DELIVERY_PRICE_RANGE = {
  min: Math.min(...getAllDeliveryZones().map((z) => z.price)),
  max: Math.max(...getAllDeliveryZones().map((z) => z.price)),
};

// ─── Backward Compatibility Aliases ────────────────────────────────
// These aliases maintain compatibility with code that still uses the old naming

/** @deprecated Use DeliveryRegion instead */
export type DeliveryArea = DeliveryZone;

/** @deprecated Use DELIVERY_REGIONS instead */
export const DELIVERY_ZONES = DELIVERY_REGIONS;
