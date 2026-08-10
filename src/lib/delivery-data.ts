// ─── Libyan Delivery Data ──────────────────────────────────────────
// مناطق ليبيا مع مدنها وأحيائها وأسعار التوصيل والمدد المتوقعة
// تصنيف احترافي: منطقة رئيسية → مدينة → منطقة فرعية (Zone) → حي
// مع مناطق تتبع (Tracking Zones) لكل مدينة رئيسية
// المصدر: ملف بيانات وأسعار التوصيل

export interface DeliveryTrackingZone {
  id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  fee: number;
  estimatedDays: number;
  estimatedDaysText: string;
}

export interface DeliveryNeighborhood {
  id: string;
  nameAr: string;
  nameEn: string;
  fee?: number;
  estimatedDays?: number;
  estimatedDaysText?: string;
}

export interface DeliveryDistrict {
  id: string;
  nameAr: string;
  nameEn: string;
  zoneId?: string;
  areas: DeliveryNeighborhood[];
}

export interface DeliveryCity {
  id: string;
  nameAr: string;
  nameEn: string;
  districts?: DeliveryDistrict[];
  trackingZones?: DeliveryTrackingZone[];
  fee: number;
  estimatedDays: number;
  estimatedDaysText?: string;
}

export interface DeliveryArea {
  id: string;
  nameAr: string;
  nameEn: string;
  cities: DeliveryCity[];
}

export interface DeliveryAreaDetail {
  id: string;
  nameAr: string;
  nameEn: string;
  fee?: number;
  estimatedDays?: number;
  estimatedDaysText?: string;
}

// ═══════════════════════════════════════════════════════════════════════
// مناطق التتبع لطرابلس (Tracking Zones)
// ═══════════════════════════════════════════════════════════════════════
export const TRIPOLI_TRACKING_ZONES: DeliveryTrackingZone[] = [
  {
    id: 'zone-tripoli-center',
    nameAr: 'المنطقة المركزية',
    nameEn: 'Central Zone',
    color: '#004B63',
    fee: 10,
    estimatedDays: 1,
    estimatedDaysText: 'خلال 24 ساعة',
  },
  {
    id: 'zone-tripoli-north',
    nameAr: 'المنطقة الشمالية',
    nameEn: 'Northern Zone',
    color: '#00897B',
    fee: 10,
    estimatedDays: 1,
    estimatedDaysText: 'خلال 24 ساعة',
  },
  {
    id: 'zone-tripoli-east',
    nameAr: 'المنطقة الشرقية',
    nameEn: 'Eastern Zone',
    color: '#F59E0B',
    fee: 10,
    estimatedDays: 1,
    estimatedDaysText: 'خلال 24 ساعة',
  },
  {
    id: 'zone-tripoli-south',
    nameAr: 'المنطقة الجنوبية',
    nameEn: 'Southern Zone',
    color: '#FF6F61',
    fee: 10,
    estimatedDays: 1,
    estimatedDaysText: 'خلال 24 ساعة',
  },
  {
    id: 'zone-tripoli-west',
    nameAr: 'المنطقة الغربية',
    nameEn: 'Western Zone',
    color: '#8B5CF6',
    fee: 15,
    estimatedDays: 1,
    estimatedDaysText: 'خلال 24 ساعة',
  },
];

// ═══════════════════════════════════════════════════════════════════════
// بيانات التوصيل الرئيسية
// ═══════════════════════════════════════════════════════════════════════
export const DELIVERY_AREAS: DeliveryArea[] = [

  // ╔═══════════════════════════════════════════════════════════════════╗
  // ║  طرابلس                                                          ║
  // ╚═══════════════════════════════════════════════════════════════════╝
  {
    id: 'tripoli-greater',
    nameAr: 'طرابلس',
    nameEn: 'Tripoli',
    cities: [
      {
        id: 'tripoli-city',
        nameAr: 'طرابلس',
        nameEn: 'Tripoli',
        fee: 10,
        estimatedDays: 1,
        estimatedDaysText: 'خلال 24 ساعة',
        trackingZones: TRIPOLI_TRACKING_ZONES,
        districts: [

          // ┌─────────────────────────────────────────────────────────┐
          // │  المنطقة المركزية                                       │
          // └─────────────────────────────────────────────────────────┘
          {
            id: 'tripoli-central-zone',
            nameAr: 'المنطقة المركزية',
            nameEn: 'Central Zone',
            zoneId: 'zone-tripoli-center',
            areas: [
              { id: 'tripoli-souq-talata', nameAr: 'سوق الثلاتاء', nameEn: 'Souq Al-Talata', fee: 10 },
              { id: 'tripoli-benashur', nameAr: 'بن عاشور', nameEn: 'Ben Ashour', fee: 10 },
              { id: 'tripoli-jumhuriya', nameAr: 'شارع الجمهورية', nameEn: 'Jumhuriya St', fee: 10 },
              { id: 'tripoli-madina-qadima', nameAr: 'المدينة القديمة', nameEn: 'Old City (Medina)', fee: 10 },
              { id: 'tripoli-that-al-amad', nameAr: 'ذات العماد', nameEn: 'That Al-Amad', fee: 10 },
              { id: 'tripoli-shatt', nameAr: 'طريق الشط', nameEn: 'Shatt Road', fee: 10 },
              { id: 'tripoli-dahra', nameAr: 'الظهرة', nameEn: 'Dahra', fee: 10 },
              { id: 'tripoli-fashloum', nameAr: 'فشلوم', nameEn: 'Fashloum', fee: 10 },
              { id: 'tripoli-mansoura', nameAr: 'المنصورة', nameEn: 'Al-Mansoura', fee: 10 },
              { id: 'tripoli-kobri-hadid', nameAr: 'كوبري الحديد', nameEn: 'Kobri Al-Hadid', fee: 10 },
              { id: 'tripoli-bab-aziziya', nameAr: 'باب العزيزية', nameEn: 'Bab Al-Aziziya', fee: 10 },
              { id: 'tripoli-batata', nameAr: 'البطاطا', nameEn: 'Al-Batata', fee: 10 },
              { id: 'tripoli-ghabat-nasr', nameAr: 'غابة النصر', nameEn: 'Ghabat Al-Nasr', fee: 10 },
              { id: 'tripoli-jazirat-fahm', nameAr: 'جزيرة الفحم', nameEn: 'Jazirat Al-Fahm', fee: 10 },
              { id: 'tripoli-malikiya-mall', nameAr: 'الملكية مول', nameEn: 'Malikiya Mall', fee: 10 },
              { id: 'tripoli-souq-juma', nameAr: 'سوق الجمعة', nameEn: 'Souq Al-Juma', fee: 10 },
              { id: 'tripoli-meitiga', nameAr: 'معيتيقة', nameEn: 'Meitiga', fee: 10 },
              { id: 'tripoli-nofleen', nameAr: 'النوفليين', nameEn: 'Al-Nofleen', fee: 10 },
              { id: 'tripoli-abu-mashmasha', nameAr: 'ابومشماشة', nameEn: 'Abu Mashmasha', fee: 10 },
              { id: 'tripoli-zawiya-dahmani', nameAr: 'زاوية الدهماني', nameEn: 'Zawiya Al-Dahmani', fee: 10 },
            ],
          },

          // ┌─────────────────────────────────────────────────────────┐
          // │  المنطقة الشمالية                                       │
          // └─────────────────────────────────────────────────────────┘
          {
            id: 'tripoli-north-zone',
            nameAr: 'المنطقة الشمالية',
            nameEn: 'Northern Zone',
            zoneId: 'zone-tripoli-north',
            areas: [
              { id: 'tripoli-siyahiya', nameAr: 'السياحية', nameEn: 'Siyahiya', fee: 10 },
              { id: 'tripoli-qurqarsh', nameAr: 'قرقارش', nameEn: 'Qurqarsh', fee: 10 },
              { id: 'tripoli-andalus', nameAr: 'حي الأندلس', nameEn: 'Hay Al-Andalus', fee: 10 },
              { id: 'tripoli-dawa', nameAr: 'الدعوة الإسلامية', nameEn: 'Al-Dawa', fee: 10 },
              { id: 'tripoli-hay-islami', nameAr: 'الحي الإسلامي', nameEn: 'Al-Hay Al-Islami', fee: 10 },
              { id: 'tripoli-riyadiya', nameAr: 'الرياضية', nameEn: 'Riyadiya', fee: 10 },
              { id: 'tripoli-omar-mukhtar', nameAr: 'عمر المختار', nameEn: 'Omar Al-Mukhtar', fee: 10 },
              { id: 'tripoli-sareem', nameAr: 'شارع الصريم', nameEn: 'Sareem St', fee: 10 },
              { id: 'tripoli-nasr', nameAr: 'شارع النصر', nameEn: 'Nasr St', fee: 10 },
              { id: 'tripoli-sabaa', nameAr: 'السبعة', nameEn: 'Al-Sabaa', fee: 10 },
              { id: 'tripoli-madar', nameAr: 'شارع المدار', nameEn: 'Madar St', fee: 10 },
              { id: 'tripoli-ittihad', nameAr: 'نادي الإتحاد', nameEn: 'Ittihad Club', fee: 10 },
              { id: 'tripoli-jazirat-areef', nameAr: 'جزيرة العريف', nameEn: 'Jazirat Al-Areef', fee: 10 },
              { id: 'tripoli-arada', nameAr: 'عرادة', nameEn: 'Arada', fee: 10 },
              { id: 'tripoli-kobri-safsafa', nameAr: 'كوبري الصفصفة', nameEn: 'Kobri Al-Safsafa', fee: 10 },
              { id: 'tripoli-abusta', nameAr: 'أبوستة', nameEn: 'Abusta', fee: 10 },
              { id: 'tripoli-ras-hassan', nameAr: 'رأس حسن', nameEn: 'Ras Hassan', fee: 10 },
            ],
          },

          // ┌─────────────────────────────────────────────────────────┐
          // │  المنطقة الشرقية                                        │
          // └─────────────────────────────────────────────────────────┘
          {
            id: 'tripoli-east-zone',
            nameAr: 'المنطقة الشرقية',
            nameEn: 'Eastern Zone',
            zoneId: 'zone-tripoli-east',
            areas: [
              { id: 'tripoli-qarji', nameAr: 'قرجي', nameEn: 'Qarji', fee: 10 },
              { id: 'tripoli-quds', nameAr: 'جزيرة القدس', nameEn: 'Jazirat Al-Quds', fee: 10 },
              { id: 'tripoli-intisar', nameAr: 'حي الانتصار', nameEn: 'Hay Al-Intisar', fee: 10 },
              { id: 'tripoli-furnaj', nameAr: 'الفرناج', nameEn: 'Furnaj', fee: 10 },
              { id: 'tripoli-zanata', nameAr: 'زناتة', nameEn: 'Zanata', fee: 10 },
              { id: 'tripoli-jama-soqa', nameAr: 'جامع الصقع', nameEn: 'Jama Al-Soqa', fee: 10 },
              { id: 'tripoli-sarraj', nameAr: 'السراج', nameEn: 'Sarraj', fee: 15 },
              { id: 'tripoli-salaheddin', nameAr: 'صلاح الدين', nameEn: 'Salaheddin', fee: 10 },
              { id: 'tripoli-sidra', nameAr: 'السدرة', nameEn: 'Sidra', fee: 10 },
              { id: 'tripoli-darn', nameAr: 'الدرن', nameEn: 'Darn', fee: 10 },
              { id: 'tripoli-qarya-saleh', nameAr: 'قرية صالح', nameEn: 'Qarya Saleh', fee: 10 },
              { id: 'tripoli-jaraba', nameAr: 'الجرابة', nameEn: 'Al-Jaraba', fee: 10 },
              { id: 'tripoli-hani', nameAr: 'الهاني', nameEn: 'Al-Hani', fee: 10 },
              { id: 'tripoli-sharea-khalatat', nameAr: 'شارع الخلاطات', nameEn: 'Sharea Al-Khalatat', fee: 15 },
              { id: 'tripoli-nadi-diplomasi', nameAr: 'النادي الدبلوماسي', nameEn: 'Diplomatic Club', fee: 15 },
            ],
          },

          // ┌─────────────────────────────────────────────────────────┐
          // │  المنطقة الجنوبية                                       │
          // └─────────────────────────────────────────────────────────┘
          {
            id: 'tripoli-south-zone',
            nameAr: 'المنطقة الجنوبية',
            nameEn: 'Southern Zone',
            zoneId: 'zone-tripoli-south',
            areas: [
              { id: 'tripoli-abuslim', nameAr: 'أبوسليم', nameEn: 'Abu Salim', fee: 10 },
              { id: 'tripoli-hadba-khadra', nameAr: 'الهضبة الخضراء', nameEn: 'Hadba Khadra', fee: 10 },
              { id: 'tripoli-hadba-qasi', nameAr: 'الهضبة القاسي', nameEn: 'Hadba Qasi', fee: 10 },
              { id: 'tripoli-hadba-kayza', nameAr: 'الهضبة الكيزة', nameEn: 'Hadba Kayza', fee: 10 },
              { id: 'tripoli-hadba-tawil', nameAr: 'الهضبة طول', nameEn: 'Hadba Tawil', fee: 10 },
              { id: 'tripoli-khalla', nameAr: 'الخلة', nameEn: 'Al-Khalla', fee: 20 },
              { id: 'tripoli-ainzara', nameAr: 'عين زارة', nameEn: 'Ain Zara', fee: 15 },
              { id: 'tripoli-sawani', nameAr: 'السواني', nameEn: 'Al-Sawani', fee: 20 },
              { id: 'tripoli-mashroa-hadba', nameAr: 'مشروع الهضبة', nameEn: 'Mashroa Al-Hadba', fee: 15 },
              { id: 'tripoli-kahili', nameAr: 'الكحيلي', nameEn: 'Al-Kahili', fee: 15 },
              { id: 'tripoli-bir-ista-milad', nameAr: 'بئر اسطى ميلاد', nameEn: 'Bir Ista Milad', fee: 15 },
              { id: 'tripoli-shawarea-kahraba', nameAr: 'شوارع الكهرباء 4', nameEn: 'Shawarea Al-Kahraba 4', fee: 15 },
            ],
          },

          // ┌─────────────────────────────────────────────────────────┐
          // │  المنطقة الغربية                                        │
          // └─────────────────────────────────────────────────────────┘
          {
            id: 'tripoli-west-zone',
            nameAr: 'المنطقة الغربية',
            nameEn: 'Western Zone',
            zoneId: 'zone-tripoli-west',
            areas: [
              { id: 'tripoli-mushtal', nameAr: 'طريق المشتل', nameEn: 'Mushtal Road', fee: 15 },
              { id: 'tripoli-tajoura', nameAr: 'تاجوراء', nameEn: 'Tajoura', fee: 15 },
              { id: 'tripoli-bife', nameAr: 'البيفي', nameEn: 'Bife', fee: 15 },
              { id: 'tripoli-wadi-rabie', nameAr: 'وادي الربيع', nameEn: 'Wadi Al-Rabie', fee: 25 },
              { id: 'tripoli-janzour', nameAr: 'جنزور', nameEn: 'Janzour', fee: 15 },
              { id: 'tripoli-kremia', nameAr: 'الكريمية', nameEn: 'Al-Kremia', fee: 15 },
              { id: 'tripoli-matar-road', nameAr: 'طريق المطار', nameEn: 'Airport Road', fee: 15 },
            ],
          },
        ],
      },
    ],
  },

  // ╔═══════════════════════════════════════════════════════════════════╗
  // ║  المنطقة الغربية                                                  ║
  // ╚═══════════════════════════════════════════════════════════════════╝
  {
    id: 'western',
    nameAr: 'المنطقة الغربية',
    nameEn: 'Western Region',
    cities: [
      { id: 'zawiya', nameAr: 'الزاوية', nameEn: 'Zawiya', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'surman', nameAr: 'صرمان', nameEn: 'Surman', fee: 25, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'sabratha', nameAr: 'صبراتة', nameEn: 'Sabratha', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'zuwara', nameAr: 'زوارة', nameEn: 'Zuwara', fee: 30, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'jamal', nameAr: 'الجميل', nameEn: 'Al-Jamal', fee: 35, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'ajilat', nameAr: 'العجيلات', nameEn: 'Ajilat', fee: 30, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'matrad', nameAr: 'المطرد', nameEn: 'Al-Matrad', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'misrata', nameAr: 'مصراتة', nameEn: 'Misrata', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'khoms', nameAr: 'الخمس', nameEn: 'Al-Khoms', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'zlitn', nameAr: 'زليتن', nameEn: 'Zliten', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'qarboli', nameAr: 'القربولي', nameEn: 'Qarboli', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'raqdalin', nameAr: 'رقدالين', nameEn: 'Raqdalin', fee: 35, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'zaltan', nameAr: 'زلطن', nameEn: 'Zaltan', fee: 35, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'warshafana', nameAr: 'ورشفانة', nameEn: 'Warshafana', fee: 25, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'bani-walid', nameAr: 'بني وليد', nameEn: 'Bani Walid', fee: 25, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'mesllata', nameAr: 'مسلاتة', nameEn: 'Mesllata', fee: 30, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'tawila', nameAr: 'الطويلة', nameEn: 'Al-Tawila', fee: 30, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'qasr-bin-ghashir', nameAr: 'قصر بن غشير', nameEn: 'Qasr Bin Ghashir', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'tarhuna', nameAr: 'ترهونة', nameEn: 'Tarhuna', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'sayh', nameAr: 'السايح', nameEn: 'Al-Sayh', fee: 30, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'souq-khamis', nameAr: 'سوق الخميس', nameEn: 'Souq Al-Khamis', fee: 30, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'asbiaa', nameAr: 'اسبيعة', nameEn: 'Asbiaa', fee: 30, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'souq-sabt', nameAr: 'سوق السبت', nameEn: 'Souq Al-Sabt', fee: 30, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'kobri-27', nameAr: 'كوبري 27', nameEn: 'Kobri 27', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'abu-issa', nameAr: 'ابوعيسى', nameEn: 'Abu Issa', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'maya', nameAr: 'الماية', nameEn: 'Al-Maya', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'alaws', nameAr: 'العلوص', nameEn: 'Al-Alaws', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'wadi-kaam', nameAr: 'وادي كعام', nameEn: 'Wadi Kaam', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'ghaniya', nameAr: 'غنية', nameEn: 'Ghaniya', fee: 20, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'abu-kamash', nameAr: 'أبوكماش', nameEn: 'Abu Kamash', fee: 35, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
    ],
  },

  // ╔═══════════════════════════════════════════════════════════════════╗
  // ║  المنطقة الشرقية                                                  ║
  // ╚═══════════════════════════════════════════════════════════════════╝
  {
    id: 'eastern',
    nameAr: 'المنطقة الشرقية',
    nameEn: 'Eastern Region',
    cities: [
      { id: 'benghazi', nameAr: 'بنغازي', nameEn: 'Benghazi', fee: 20, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'ajdabiya', nameAr: 'اجدابيا', nameEn: 'Ajdabiya', fee: 25, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'bayda', nameAr: 'البيضاء', nameEn: 'Bayda', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'marj', nameAr: 'المرج', nameEn: 'Marj', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'tokra', nameAr: 'توكرة', nameEn: 'Tokra', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'sulug-east', nameAr: 'سلوق', nameEn: 'Sulug', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'abyar', nameAr: 'الابيار', nameEn: 'Al-Abyar', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'bayada', nameAr: 'البياضة', nameEn: 'Al-Bayada', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'abraq', nameAr: 'الأبرق', nameEn: 'Al-Abraq', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'rajma', nameAr: 'الرجمة', nameEn: 'Al-Rajma', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'quba', nameAr: 'القبة', nameEn: 'Al-Quba', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'qasr-libya', nameAr: 'قصر ليبيا', nameEn: 'Qasr Libya', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'susah', nameAr: 'سوسة', nameEn: 'Susah', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'shahhat', nameAr: 'شحات', nameEn: 'Shahhat', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'derna', nameAr: 'درنة', nameEn: 'Derna', fee: 40, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'tobruk', nameAr: 'طبرق', nameEn: 'Tobruk', fee: 35, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'tamimi', nameAr: 'التميمي', nameEn: 'Al-Tamimi', fee: 45, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'jalo', nameAr: 'جالو', nameEn: 'Jalo', fee: 45, estimatedDays: 4, estimatedDaysText: 'من 2 الى 4 أيام' },
      { id: 'awjila', nameAr: 'أوجلة', nameEn: 'Awjila', fee: 45, estimatedDays: 4, estimatedDaysText: 'من 2 الى 4 أيام' },
      { id: 'ajkhara', nameAr: 'أجخرة', nameEn: 'Ajkhara', fee: 45, estimatedDays: 4, estimatedDaysText: 'من 2 الى 4 أيام' },
      { id: 'kufra', nameAr: 'الكفرة', nameEn: 'Kufra', fee: 45, estimatedDays: 4, estimatedDaysText: 'من 2 الى 4 أيام' },
    ],
  },

  // ╔═══════════════════════════════════════════════════════════════════╗
  // ║  المنطقة الجبل والجنوب                                            ║
  // ╚═══════════════════════════════════════════════════════════════════╝
  {
    id: 'mountain-south',
    nameAr: 'المنطقة الجبل والجنوب',
    nameEn: 'Mountain & South Region',
    cities: [
      { id: 'sebha', nameAr: 'سبها', nameEn: 'Sebha', fee: 30, estimatedDays: 3, estimatedDaysText: 'من 2 الى 3 أيام' },
      { id: 'brak', nameAr: 'براك الشاطي', nameEn: 'Brak Al-Shati', fee: 35, estimatedDays: 4, estimatedDaysText: 'من 3 الى 4 أيام' },
      { id: 'qatrun', nameAr: 'القطرون', nameEn: 'Qatrun', fee: 50, estimatedDays: 5, estimatedDaysText: 'من 3 الى 5 أيام' },
      { id: 'ubari', nameAr: 'أوباري', nameEn: 'Ubari', fee: 45, estimatedDays: 4, estimatedDaysText: 'من 3 الى 4 أيام' },
      { id: 'murzuq', nameAr: 'مرزق', nameEn: 'Murzuq', fee: 45, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'jadu', nameAr: 'جادو', nameEn: 'Jadu', fee: 35, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'zintan', nameAr: 'الزنتان', nameEn: 'Zintan', fee: 35, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'kabaw', nameAr: 'كاباو', nameEn: 'Kabaw', fee: 35, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'tiji', nameAr: 'تيجي', nameEn: 'Tiji', fee: 35, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'kakla', nameAr: 'ككلة', nameEn: 'Kakla', fee: 35, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'gharyan', nameAr: 'غريان', nameEn: 'Gharyan', fee: 25, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'riyayna', nameAr: 'الرياينة', nameEn: 'Riyayna', fee: 35, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'qalaa', nameAr: 'القلعة', nameEn: 'Qalaa', fee: 35, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'jabal-gharbi', nameAr: 'الجبل الغربي', nameEn: 'Jabal Gharbi', fee: 35, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'waddan', nameAr: 'ودان', nameEn: 'Waddan', fee: 30, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'hun', nameAr: 'هون', nameEn: 'Hun', fee: 30, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'sukna', nameAr: 'سوكنة', nameEn: 'Sukna', fee: 30, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'shuwayrif', nameAr: 'الشويرف', nameEn: 'Shuwayrif', fee: 35, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
    ],
  },

  // ╔═══════════════════════════════════════════════════════════════════╗
  // ║  المنطقة الوسطى                                                   ║
  // ╚═══════════════════════════════════════════════════════════════════╝
  {
    id: 'central',
    nameAr: 'المنطقة الوسطى',
    nameEn: 'Central Region',
    cities: [
      { id: 'brega', nameAr: 'البريقة', nameEn: 'Brega', fee: 30, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'ras-lanuf', nameAr: 'رأس الأنوف', nameEn: 'Ras Lanuf', fee: 30, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'harawa', nameAr: 'هراوة', nameEn: 'Harawa', fee: 30, estimatedDays: 1, estimatedDaysText: 'خلال 24 ساعة' },
      { id: 'aqila', nameAr: 'العقيلة', nameEn: 'Aqila', fee: 30, estimatedDays: 2, estimatedDaysText: 'من 1 الى 2 يوم' },
      { id: 'amsaad', nameAr: 'امساعد', nameEn: 'Amsaad', fee: 50, estimatedDays: 4, estimatedDaysText: 'من 2 الى 4 أيام' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// Helper Functions — دوال مساعدة
// ═══════════════════════════════════════════════════════════════════════

/** جلب جميع المدن كقائمة مسطحة */
export function getAllCities(): DeliveryCity[] {
  const cities: DeliveryCity[] = [];
  for (const area of DELIVERY_AREAS) {
    for (const city of area.cities) {
      cities.push(city);
    }
  }
  return cities;
}

/** جلب مدينة بالمعرف */
export function getCityById(cityId: string): DeliveryCity | undefined {
  for (const area of DELIVERY_AREAS) {
    const city = area.cities.find((c) => c.id === cityId);
    if (city) return city;
  }
  return undefined;
}

/** جلب منطقة تتبع بالمعرف */
export function getTrackingZoneById(cityId: string, zoneId: string): DeliveryTrackingZone | undefined {
  const city = getCityById(cityId);
  if (!city?.trackingZones) return undefined;
  return city.trackingZones.find(z => z.id === zoneId);
}

/** جلب منطقة تتبع لمنطقة معينة */
export function getTrackingZoneForDistrict(cityId: string, districtId: string): DeliveryTrackingZone | undefined {
  const city = getCityById(cityId);
  if (!city?.trackingZones || !city.districts) return undefined;
  const district = city.districts.find(d => d.id === districtId);
  if (!district?.zoneId) return undefined;
  return city.trackingZones.find(z => z.id === district.zoneId);
}

/** حساب رسوم التوصيل لمدينة وحي معين */
export function getDeliveryFee(cityId: string, areaId?: string): number {
  const city = getCityById(cityId);
  if (!city) return 15;
  if (areaId && city.districts) {
    for (const district of city.districts) {
      const area = district.areas.find((a) => a.id === areaId);
      if (area?.fee !== undefined) return area.fee;
    }
  }
  return city.fee;
}

/** حساب مدة التوصيل المتوقعة */
export function getEstimatedDays(cityId: string, areaId?: string): number {
  const city = getCityById(cityId);
  if (!city) return 3;
  if (areaId && city.districts) {
    for (const district of city.districts) {
      const area = district.areas.find((a) => a.id === areaId);
      if (area?.estimatedDays !== undefined) return area.estimatedDays;
    }
  }
  return city.estimatedDays;
}

/** نص مدة التوصيل المتوقعة */
export function getEstimatedDaysText(cityId: string, areaId?: string): string {
  const city = getCityById(cityId);
  if (!city) return '3-5 أيام';
  if (areaId && city.districts) {
    for (const district of city.districts) {
      const area = district.areas.find((a) => a.id === areaId);
      if (area?.estimatedDaysText) return area.estimatedDaysText;
    }
  }
  if (city.estimatedDaysText) return city.estimatedDaysText;
  if (city.estimatedDays <= 1) return 'خلال 24 ساعة';
  return `${city.estimatedDays}-${city.estimatedDays + 1} أيام`;
}

/** حساب رسوم التوصيل بناءً على منطقة التتبع */
export function getDeliveryFeeByZone(cityId: string, zoneId?: string): number {
  if (!zoneId) return getDeliveryFee(cityId);
  const zone = getTrackingZoneById(cityId, zoneId);
  return zone?.fee ?? getDeliveryFee(cityId);
}

/** جلب المنطقة الرئيسية لمدينة معينة */
export function getRegionForCity(cityId: string): DeliveryArea | undefined {
  for (const area of DELIVERY_AREAS) {
    if (area.cities.some(c => c.id === cityId)) return area;
  }
  return undefined;
}
