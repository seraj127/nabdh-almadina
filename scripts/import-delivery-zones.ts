import { db } from '@/lib/db';

const ZONES_DATA = [
  // ─── طرابلس - Tripoli Areas ─────────────────────────────────
  { nameAr: 'السياحية', nameEn: 'Al-Siyahiya', city: 'طرابلس', area: 'السياحية', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'قرقارش', nameEn: 'Gargaresh', city: 'طرابلس', area: 'قرقارش', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'حي الأندلس', nameEn: 'Hay Al-Andalus', city: 'طرابلس', area: 'حي الأندلس', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'قرجي', nameEn: 'Gurgi', city: 'طرابلس', area: 'قرجي', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'السراج', nameEn: 'Al-Saraj', city: 'طرابلس', area: 'السراج', fee: 15, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الدعوة الإسلامية', nameEn: 'Al-Dawa Al-Islamiya', city: 'طرابلس', area: 'الدعوة الإسلامية', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الحي الإسلامي', nameEn: 'Al-Hay Al-Islami', city: 'طرابلس', area: 'الحي الإسلامي', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الرياضية', nameEn: 'Al-Riyadiya', city: 'طرابلس', area: 'الرياضية', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'عمر المختار', nameEn: 'Omar Al-Mukhtar', city: 'طرابلس', area: 'عمر المختار', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'شارع الصريم', nameEn: 'Al-Sarim Street', city: 'طرابلس', area: 'شارع الصريم', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'شارع النصر', nameEn: 'Al-Nasr Street', city: 'طرابلس', area: 'شارع النصر', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'جزيرة القدس', nameEn: 'Jazirat Al-Quds', city: 'طرابلس', area: 'جزيرة القدس', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'حي الانتصار', nameEn: 'Hay Al-Intisar', city: 'طرابلس', area: 'حي الانتصار', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'أبوسليم', nameEn: 'Abu Salim', city: 'طرابلس', area: 'أبوسليم', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الهضبة الخضراء', nameEn: 'Al-Hadba Al-Khadra', city: 'طرابلس', area: 'الهضبة الخضراء', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الهضبة القاسي', nameEn: 'Al-Hadba Al-Qasi', city: 'طرابلس', area: 'الهضبة القاسي', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الهضبة الكيزة', nameEn: 'Al-Hadba Al-Kaiza', city: 'طرابلس', area: 'الهضبة الكيزة', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الهضبة طول', nameEn: 'Al-Hadba Tawil', city: 'طرابلس', area: 'الهضبة طول', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'صلاح الدين', nameEn: 'Salah Al-Din', city: 'طرابلس', area: 'صلاح الدين', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'السدرة', nameEn: 'Al-Sidra', city: 'طرابلس', area: 'السدرة', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الخلة', nameEn: 'Al-Khalla', city: 'طرابلس', area: 'الخلة', fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'عين زارة', nameEn: 'Ain Zara', city: 'طرابلس', area: 'عين زارة', fee: 15, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الفرناج', nameEn: 'Al-Furnaj', city: 'طرابلس', area: 'الفرناج', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'زناتة', nameEn: 'Zanata', city: 'طرابلس', area: 'زناتة', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'جامع الصقع', nameEn: 'Jama Al-Saqa', city: 'طرابلس', area: 'جامع الصقع', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'السبعة', nameEn: 'Al-Saba', city: 'طرابلس', area: 'السبعة', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'طريق المشتل', nameEn: 'Tariq Al-Mushtal', city: 'طرابلس', area: 'طريق المشتل', fee: 15, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'تاجوراء', nameEn: 'Tajoura', city: 'طرابلس', area: 'تاجوراء', fee: 15, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'البيفي', nameEn: 'Al-Bifi', city: 'طرابلس', area: 'البيفي', fee: 15, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'وادي الربيع', nameEn: 'Wadi Al-Rabie', city: 'طرابلس', area: 'وادي الربيع', fee: 25, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'جنزور', nameEn: 'Janzour', city: 'طرابلس', area: 'جنزور', fee: 15, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الكريمية', nameEn: 'Al-Karimiya', city: 'طرابلس', area: 'الكريمية', fee: 15, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'طريق المطار', nameEn: 'Tariq Al-Matar', city: 'طرابلس', area: 'طريق المطار', fee: 15, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'سوق الثلاتاء', nameEn: 'Souq Al-Thulatha', city: 'طرابلس', area: 'سوق الثلاتاء', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الدرن', nameEn: 'Al-Darn', city: 'طرابلس', area: 'الدرن', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'قرية صالح', nameEn: 'Qaryat Salih', city: 'طرابلس', area: 'قرية صالح', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'شارع المدار', nameEn: 'Al-Madar Street', city: 'طرابلس', area: 'شارع المدار', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الجرابة', nameEn: 'Al-Jaraba', city: 'طرابلس', area: 'الجرابة', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'بن عاشور', nameEn: 'Ben Ashour', city: 'طرابلس', area: 'بن عاشور', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'نادي الإتحاد', nameEn: 'Nadi Al-Ittihad', city: 'طرابلس', area: 'نادي الإتحاد', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'شارع الجمهورية', nameEn: 'Al-Jumhuriya Street', city: 'طرابلس', area: 'شارع الجمهورية', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'المدينة القديمة', nameEn: 'Old City', city: 'طرابلس', area: 'المدينة القديمة', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'ذات العماد', nameEn: 'That Al-Amad', city: 'طرابلس', area: 'ذات العماد', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'طريق الشط', nameEn: 'Tariq Al-Shatt', city: 'طرابلس', area: 'طريق الشط', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الظهرة', nameEn: 'Al-Dhahra', city: 'طرابلس', area: 'الظهرة', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'فشلوم', nameEn: 'Feshlom', city: 'طرابلس', area: 'فشلوم', fee: 10, freeAbove: 150, estimatedDays: 1, isActive: true },

  // ─── المنطقة الغربية - Western Region ──────────────────────
  { nameAr: 'الزاوية', nameEn: 'Az-Zawiya', city: 'الزاوية', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'صرمان', nameEn: 'Surman', city: 'صرمان', area: null, fee: 25, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'صبراتة', nameEn: 'Sabratha', city: 'صبراتة', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'زوارة', nameEn: 'Zuwara', city: 'زوارة', area: null, fee: 30, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'الجميل', nameEn: 'Al-Jamil', city: 'الجميل', area: null, fee: 35, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'العجيلات', nameEn: 'Al-Ajilat', city: 'العجيلات', area: null, fee: 30, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'المطرد', nameEn: 'Al-Matrad', city: 'المطرد', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'مصراتة', nameEn: 'Misrata', city: 'مصراتة', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الخمس', nameEn: 'Al-Khums', city: 'الخمس', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'زليتن', nameEn: 'Zliten', city: 'زليتن', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'القربولي', nameEn: 'Al-Qarabuli', city: 'القربولي', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'رقدالين', nameEn: 'Riqdalin', city: 'رقدالين', area: null, fee: 35, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'زلطن', nameEn: 'Zaltan', city: 'زلطن', area: null, fee: 35, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'ورشفانة', nameEn: 'Warshefana', city: 'ورشفانة', area: null, fee: 25, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'بني وليد', nameEn: 'Bani Walid', city: 'بني وليد', area: null, fee: 25, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'مسلاتة', nameEn: 'Misallata', city: 'مسلاتة', area: null, fee: 30, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'الطويلة', nameEn: 'Al-Tawila', city: 'الطويلة', area: null, fee: 30, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'قصر بن غشير', nameEn: 'Qasr Bin Ghashir', city: 'قصر بن غشير', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'ترهونة', nameEn: 'Tarhuna', city: 'ترهونة', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'السايح', nameEn: 'Al-Sayeh', city: 'السايح', area: null, fee: 30, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'سوق الخميس', nameEn: 'Souk Al-Khamis', city: 'سوق الخميس', area: null, fee: 30, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'اسبيعة', nameEn: "Asbia", city: 'اسبيعة', area: null, fee: 30, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'سوق السبت', nameEn: 'Souk Al-Sabt', city: 'سوق السبت', area: null, fee: 30, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'كوبري 27', nameEn: 'Kobri 27', city: 'كوبري 27', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'ابوعيسى', nameEn: 'Abu Isa', city: 'ابوعيسى', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'الماية', nameEn: 'Al-Maya', city: 'الماية', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'العلوص', nameEn: 'Al-Alous', city: 'العلوص', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'وادي كعام', nameEn: "Wadi Kaam", city: 'وادي كعام', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'غنية', nameEn: 'Ghaniya', city: 'غنية', area: null, fee: 20, freeAbove: 150, estimatedDays: 1, isActive: true },
  { nameAr: 'أبوكماش', nameEn: 'Abu Kammash', city: 'أبوكماش', area: null, fee: 35, freeAbove: 200, estimatedDays: 1, isActive: true },

  // ─── المنطقة الشرقية - Eastern Region ──────────────────────
  { nameAr: 'بنغازي', nameEn: 'Benghazi', city: 'بنغازي', area: null, fee: 20, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'اجدابيا', nameEn: 'Ajdabiya', city: 'اجدابيا', area: null, fee: 25, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'البيضاء', nameEn: 'Al-Bayda', city: 'البيضاء', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'المرج', nameEn: 'Al-Marj', city: 'المرج', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'توكرة', nameEn: 'Tukra', city: 'توكرة', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'سلوق', nameEn: 'Suluq', city: 'سلوق', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'الابيار', nameEn: 'Al-Abyar', city: 'الابيار', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'البياضة', nameEn: 'Al-Bayada', city: 'البياضة', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'الأبرق', nameEn: 'Al-Abraq', city: 'الأبرق', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'الرجمة', nameEn: 'Al-Rajma', city: 'الرجمة', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'القبة', nameEn: 'Al-Qubah', city: 'القبة', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'قصر ليبيا', nameEn: 'Qasr Libya', city: 'قصر ليبيا', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'سوسة', nameEn: 'Susah', city: 'سوسة', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'شحات', nameEn: 'Shahat', city: 'شحات', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'درنة', nameEn: 'Derna', city: 'درنة', area: null, fee: 40, freeAbove: 250, estimatedDays: 3, isActive: true },
  { nameAr: 'طبرق', nameEn: 'Tobruk', city: 'طبرق', area: null, fee: 35, freeAbove: 250, estimatedDays: 3, isActive: true },
  { nameAr: 'التميمي', nameEn: 'Al-Tamimi', city: 'التميمي', area: null, fee: 45, freeAbove: 250, estimatedDays: 3, isActive: true },
  { nameAr: 'جالو', nameEn: 'Jalu', city: 'جالو', area: null, fee: 45, freeAbove: 250, estimatedDays: 3, isActive: true },
  { nameAr: 'أوجلة', nameEn: 'Awjila', city: 'أوجلة', area: null, fee: 45, freeAbove: 250, estimatedDays: 3, isActive: true },
  { nameAr: 'أجخرة', nameEn: 'Ajkhara', city: 'أجخرة', area: null, fee: 45, freeAbove: 250, estimatedDays: 4, isActive: true },
  { nameAr: 'الكفرة', nameEn: 'Al-Kufra', city: 'الكفرة', area: null, fee: 45, freeAbove: 250, estimatedDays: 4, isActive: true },

  // ─── الجبل والجنوب - Mountain & South ──────────────────────
  { nameAr: 'سبها', nameEn: 'Sabha', city: 'سبها', area: null, fee: 30, freeAbove: 200, estimatedDays: 3, isActive: true },
  { nameAr: 'براك الشاطي', nameEn: 'Brak Al-Shati', city: 'براك الشاطي', area: null, fee: 35, freeAbove: 250, estimatedDays: 4, isActive: true },
  { nameAr: 'القطرون', nameEn: 'Al-Qatrun', city: 'القطرون', area: null, fee: 50, freeAbove: 300, estimatedDays: 4, isActive: true },
  { nameAr: 'أوباري', nameEn: 'Ubari', city: 'أوباري', area: null, fee: 45, freeAbove: 250, estimatedDays: 4, isActive: true },
  { nameAr: 'مرزق', nameEn: 'Murzuq', city: 'مرزق', area: null, fee: 45, freeAbove: 250, estimatedDays: 2, isActive: true },
  { nameAr: 'جادو', nameEn: 'Jadu', city: 'جادو', area: null, fee: 35, freeAbove: 250, estimatedDays: 2, isActive: true },
  { nameAr: 'الزنتان', nameEn: 'Zintan', city: 'الزنتان', area: null, fee: 35, freeAbove: 250, estimatedDays: 2, isActive: true },
  { nameAr: 'كاباو', nameEn: 'Kabaw', city: 'كاباو', area: null, fee: 35, freeAbove: 250, estimatedDays: 2, isActive: true },
  { nameAr: 'تيجي', nameEn: 'Tigi', city: 'تيجي', area: null, fee: 35, freeAbove: 250, estimatedDays: 2, isActive: true },
  { nameAr: 'ككلة', nameEn: 'Kakla', city: 'ككلة', area: null, fee: 35, freeAbove: 250, estimatedDays: 2, isActive: true },
  { nameAr: 'غريان', nameEn: 'Gharyan', city: 'غريان', area: null, fee: 25, freeAbove: 200, estimatedDays: 2, isActive: true },
  { nameAr: 'الرياينة', nameEn: 'Al-Riyaina', city: 'الرياينة', area: null, fee: 35, freeAbove: 250, estimatedDays: 2, isActive: true },
  { nameAr: 'القلعة', nameEn: "Al-Qala", city: 'القلعة', area: null, fee: 35, freeAbove: 250, estimatedDays: 2, isActive: true },
  { nameAr: 'الجبل الغربي', nameEn: 'Western Mountain', city: 'الجبل الغربي', area: null, fee: 35, freeAbove: 250, estimatedDays: 2, isActive: true },
  { nameAr: 'ودان', nameEn: 'Waddan', city: 'ودان', area: null, fee: 30, freeAbove: 200, estimatedDays: 2, isActive: true },
  { nameAr: 'هون', nameEn: 'Hun', city: 'هون', area: null, fee: 30, freeAbove: 200, estimatedDays: 2, isActive: true },
  { nameAr: 'سوكنة', nameEn: 'Sukna', city: 'سوكنة', area: null, fee: 30, freeAbove: 200, estimatedDays: 2, isActive: true },
  { nameAr: 'الشويرف', nameEn: 'Al-Shuwayrif', city: 'الشويرف', area: null, fee: 35, freeAbove: 250, estimatedDays: 2, isActive: true },

  // ─── المنطقة الوسطى - Central Region ──────────────────────
  { nameAr: 'البريقة', nameEn: 'Al-Brega', city: 'البريقة', area: null, fee: 30, freeAbove: 200, estimatedDays: 2, isActive: true },
  { nameAr: 'رأس الأنوف', nameEn: 'Ras Lanuf', city: 'رأس الأنوف', area: null, fee: 30, freeAbove: 200, estimatedDays: 2, isActive: true },
  { nameAr: 'هراوة', nameEn: 'Harawa', city: 'هراوة', area: null, fee: 30, freeAbove: 200, estimatedDays: 1, isActive: true },
  { nameAr: 'العقيلة', nameEn: 'Al-Aqila', city: 'العقيلة', area: null, fee: 30, freeAbove: 200, estimatedDays: 2, isActive: true },
  { nameAr: 'امساعد', nameEn: 'Amsaad', city: 'امساعد', area: null, fee: 50, freeAbove: 300, estimatedDays: 3, isActive: true },
];

async function importDeliveryZones() {
  console.log('🚀 بدء استيراد مناطق التوصيل...');

  // Delete existing zones
  const deleted = await db.deliveryZone.deleteMany({});
  console.log(`🗑️  تم حذف ${deleted.count} مناطق موجودة`);

  // Insert all zones
  const result = await db.deliveryZone.createMany({
    data: ZONES_DATA,
  });

  console.log(`✅ تم استيراد ${result.count} منطقة توصيل`);

  // Summary
  const allZones = await db.deliveryZone.findMany({});
  const tripoli = allZones.filter((z) => z.city === 'طرابلس').length;
  console.log(`\n📊 ملخص:`);
  console.log(`  طرابلس: ${tripoli} منطقة`);
  console.log(`  مناطق أخرى: ${allZones.length - tripoli} مدينة`);
  console.log(`  الإجمالي: ${allZones.length} منطقة`);
}

importDeliveryZones()
  .catch(console.error)
  .finally(() => db.$disconnect());
