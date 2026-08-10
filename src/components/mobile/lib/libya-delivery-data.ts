// ═══════════════════════════════════════════════════════════════════════
// بيانات التوصيل لجميع مدن ومناطق ليبيا
// Libya Delivery Data - Cities, Areas, Prices & Durations
// ═══════════════════════════════════════════════════════════════════════

export interface DeliveryArea {
  name: string;         // اسم الحي/المدينة
  price: number;        // سعر التوصيل بالدينار
  duration: string;     // مدة التوصيل
}

export interface DeliveryRegion {
  id: string;
  nameAr: string;       // اسم المنطقة بالعربي
  nameEn: string;       // اسم المنطقة بالإنجليزي
  icon: string;         // أيقونة المنطقة (emoji)
  isTripoli: boolean;   // هل هي طرابلس (لها أحياء)
  areas: DeliveryArea[];
}

// ═══════════════════════════════════════════════════════════════════════
// البيانات الكاملة
// ═══════════════════════════════════════════════════════════════════════

export const LIBYA_DELIVERY_DATA: DeliveryRegion[] = [
  // ─── طرابلس ───────────────────────────────────────────────────────
  {
    id: 'tripoli',
    nameAr: 'طرابلس',
    nameEn: 'Tripoli',
    icon: '🏛️',
    isTripoli: true,
    areas: [
      { name: 'السياحية', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'قرقارش', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'حي الأندلس', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'قرجي', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'السراج', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'الدعوة الإسلامية', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الحي الإسلامي', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الرياضية', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'عمر المختار', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'شارع الصريم', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'شارع النصر', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'جزيرة القدس', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'حي الانتصار', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'أبوسليم', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الهضبة الخضراء', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الهضبة القاسي', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الهضبة الكيزة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الهضبة طول', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'صلاح الدين', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'السدرة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الخلة', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'عين زارة', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'الفرناج', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'زناتة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'جامع الصقع', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'السبعة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'طريق المشتل', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'تاجوراء', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'البيفي', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'وادي الربيع', price: 25, duration: 'خلال 24 ساعة' },
      { name: 'جنزور', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'الكريمية', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'طريق المطار', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'سوق الثلاثاء', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الدرن', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'قرية صالح', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'شارع المدار', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الجرابة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'بن عاشور', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'نادي الاتحاد', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'شارع الجمهورية', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'المدينة القديمة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'ذات العماد', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'طريق الشط', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الظهرة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'فشلوم', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'المنصورة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'السواني', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'كوبري الحديد', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'شارع الخلاطات', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'جزيرة العريف', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'مشروع الهضبة', price: 15, duration: 'خلال 24 ساعة' },
      { name: 'باب العزيزية', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'البطاطا', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'غابة النصر', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'جزيرة الفحم', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'حينا', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الشقة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'حى الإيطالي', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'السيمي', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'السقالة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'المنخفض', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'ضاحية الصفائي', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الغريفة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الوادي', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الحكيمة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الواحة', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'صلاح الدين السكني', price: 10, duration: 'خلال 24 ساعة' },
      { name: 'الأزهاري', price: 10, duration: 'خلال 24 ساعة' },
    ],
  },

  // ─── المنطقة الغربية ──────────────────────────────────────────────
  {
    id: 'western',
    nameAr: 'المنطقة الغربية',
    nameEn: 'Western Region',
    icon: '🌅',
    isTripoli: false,
    areas: [
      { name: 'الزاوية', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'صرمان', price: 25, duration: 'خلال 24 ساعة' },
      { name: 'صبراتة', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'زوارة', price: 30, duration: 'خلال 24 ساعة' },
      { name: 'الجميل', price: 35, duration: 'خلال 24 ساعة' },
      { name: 'العجيلات', price: 30, duration: 'خلال 24 ساعة' },
      { name: 'المطرد', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'مصراتة', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'الخمس', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'زليتن', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'القربولي', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'رقدالين', price: 35, duration: 'خلال 24 ساعة' },
      { name: 'زلطن', price: 35, duration: 'خلال 24 ساعة' },
      { name: 'ورشفانة', price: 25, duration: 'خلال 24 ساعة' },
      { name: 'بني وليد', price: 25, duration: 'خلال 24 ساعة' },
      { name: 'مسلاتة', price: 30, duration: 'خلال 24 ساعة' },
      { name: 'الطويلة', price: 30, duration: 'خلال 24 ساعة' },
      { name: 'قصر بن غشير', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'ترهونة', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'السايح', price: 30, duration: 'خلال 24 ساعة' },
      { name: 'سوق الخميس', price: 30, duration: 'خلال 24 ساعة' },
      { name: 'اسبيعة', price: 30, duration: 'خلال 24 ساعة' },
      { name: 'سوق السبت', price: 30, duration: 'خلال 24 ساعة' },
      { name: 'كوبري 27', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'أبوعيسى', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'الماية', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'العلوص', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'وادي كعام', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'غنية', price: 20, duration: 'خلال 24 ساعة' },
      { name: 'أبوكماش', price: 35, duration: 'خلال 24 ساعة' },
    ],
  },

  // ─── المنطقة الشرقية ──────────────────────────────────────────────
  {
    id: 'eastern',
    nameAr: 'المنطقة الشرقية',
    nameEn: 'Eastern Region',
    icon: '🌊',
    isTripoli: false,
    areas: [
      { name: 'بنغازي', price: 20, duration: 'من 2 الى 3 أيام' },
      { name: 'أجدابيا', price: 25, duration: 'من 2 الى 3 أيام' },
      { name: 'البيضاء', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'المرج', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'توكرة', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'سلوق', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'الأبيار', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'البياضة', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'الأبرق', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'الرجمة', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'القبة', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'قصر ليبيا', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'سوسة', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'شحات', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'درنة', price: 40, duration: 'من 2 الى 3 أيام' },
      { name: 'طبرق', price: 35, duration: 'من 2 الى 3 أيام' },
      { name: 'التميمي', price: 45, duration: 'من 2 الى 4 أيام' },
      { name: 'جالو', price: 45, duration: 'من 2 الى 4 أيام' },
      { name: 'أوجلة', price: 45, duration: 'من 2 الى 4 أيام' },
      { name: 'أجخرة', price: 45, duration: 'من 2 الى 4 أيام' },
      { name: 'الكفرة', price: 45, duration: 'من 2 الى 4 أيام' },
    ],
  },

  // ─── المنطقة الجبل والجنوب ────────────────────────────────────────
  {
    id: 'mountain-south',
    nameAr: 'الجبل والجنوب',
    nameEn: 'Mountain & South',
    icon: '⛰️',
    isTripoli: false,
    areas: [
      { name: 'سبها', price: 30, duration: 'من 2 الى 3 أيام' },
      { name: 'براك الشاطي', price: 35, duration: 'من 3 الى 4 أيام' },
      { name: 'القطرون', price: 50, duration: 'من 3 الى 5 أيام' },
      { name: 'أوباري', price: 45, duration: 'من 3 الى 4 أيام' },
      { name: 'مرزق', price: 45, duration: 'من 1 الى 2 أيام' },
      { name: 'جادو', price: 35, duration: 'من 1 الى 2 أيام' },
      { name: 'الزنتان', price: 35, duration: 'من 1 الى 2 أيام' },
      { name: 'كاباو', price: 35, duration: 'من 1 الى 2 أيام' },
      { name: 'تيجي', price: 35, duration: 'من 1 الى 2 أيام' },
      { name: 'ككلة', price: 35, duration: 'من 1 الى 2 أيام' },
      { name: 'غريان', price: 25, duration: 'من 1 الى 2 أيام' },
      { name: 'الرياينة', price: 35, duration: 'من 1 الى 2 أيام' },
      { name: 'القلعة', price: 35, duration: 'من 1 الى 2 أيام' },
      { name: 'الجبل الغربي', price: 35, duration: 'من 1 الى 2 أيام' },
      { name: 'ودان', price: 30, duration: 'من 1 الى 2 أيام' },
      { name: 'هون', price: 30, duration: 'من 1 الى 2 أيام' },
      { name: 'سوكنة', price: 30, duration: 'من 1 الى 2 أيام' },
      { name: 'الشويرف', price: 35, duration: 'من 1 الى 2 أيام' },
    ],
  },

  // ─── المنطقة الوسطى ───────────────────────────────────────────────
  {
    id: 'central',
    nameAr: 'المنطقة الوسطى',
    nameEn: 'Central Region',
    icon: '🏜️',
    isTripoli: false,
    areas: [
      { name: 'البريقة', price: 30, duration: 'من 1 الى 2 أيام' },
      { name: 'رأس الأنوف', price: 30, duration: 'من 1 الى 2 أيام' },
      { name: 'هراوة', price: 30, duration: 'خلال 24 ساعة' },
      { name: 'العقيلة', price: 30, duration: 'من 1 الى 2 أيام' },
      { name: 'امساعد', price: 50, duration: 'من 2 الى 4 أيام' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════

/** الحصول على سعر التوصيل بناءً على المدينة والحي */
export function getDeliveryPrice(city: string, area: string): number {
  for (const region of LIBYA_DELIVERY_DATA) {
    const found = region.areas.find((a) => a.name === area);
    if (found) return found.price;
  }
  // Fallback: search by city name
  if (city === 'طرابلس') return 10;
  for (const region of LIBYA_DELIVERY_DATA) {
    const found = region.areas.find((a) => a.name === city);
    if (found) return found.price;
  }
  return 10; // default
}

/** الحصول على مدة التوصيل بناءً على المدينة والحي */
export function getDeliveryDuration(city: string, area: string): string {
  for (const region of LIBYA_DELIVERY_DATA) {
    const found = region.areas.find((a) => a.name === area);
    if (found) return found.duration;
  }
  if (city === 'طرابلس') return 'خلال 24 ساعة';
  for (const region of LIBYA_DELIVERY_DATA) {
    const found = region.areas.find((a) => a.name === city);
    if (found) return found.duration;
  }
  return 'خلال 24 ساعة'; // default
}

/** الحصول على أحياء/مناطق بناءً على المنطقة المختارة */
export function getAreasForRegion(regionId: string): DeliveryArea[] {
  const region = LIBYA_DELIVERY_DATA.find((r) => r.id === regionId);
  return region ? region.areas : [];
}

/** الحصول على معلومات المنطقة بناءً على اسم المدينة/الحي */
export function findRegionByAreaName(areaName: string): DeliveryRegion | undefined {
  return LIBYA_DELIVERY_DATA.find((r) => r.areas.some((a) => a.name === areaName));
}
