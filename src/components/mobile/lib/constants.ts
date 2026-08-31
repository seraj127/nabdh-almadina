import type { Category, Product, Offer, Subcategory } from './types';

// ─── Color Constants ─────────────────────────────────────────────────
export const PRIMARY = '#004B63';
export const PRIMARY_LIGHT = '#006B8A';
export const SECONDARY = '#FF6F61';
export const TEAL = '#00897B';
export const DARK_BG = '#0D1117';
export const APP_VERSION = '1.9'; // Must match versionName in android/app/build.gradle

// ─── Capacitor Platform Detection ────────────────────────────────────
export const isNative = typeof window !== 'undefined' && !window.location.protocol.startsWith('http');

// ─── Offline Users for Fallback Authentication ───────────────────────
// These users are available when the API server is unreachable (e.g., APK mode)
// Passwords are stored in plaintext for offline comparison (dev only)
export const OFFLINE_USERS = [
  { phone: '+218910000000', password: 'admin123', name: 'مدير النظام', role: 'admin' as const, loyaltyTier: 'platinum', loyaltyPoints: 0, walletBalance: 0 },
  { phone: '+218911234567', password: '123456', name: 'أحمد محمد', role: 'customer' as const, loyaltyTier: 'silver', loyaltyPoints: 150, walletBalance: 0 },
  { phone: '+218917654321', password: '123456', name: 'فاطمة علي', role: 'customer' as const, loyaltyTier: 'gold', loyaltyPoints: 500, walletBalance: 50 },
];

// Backward compatibility alias
export const DEMO_USER = { phone: '+218911234567', password: '123456', name: 'أحمد محمد' };

// ─── Local Categories for Offline Fallback ───────────────────────────
export const LOCAL_CATEGORIES: Category[] = [
  { id: 'cmocboa8b0000mtchox0rocv3', nameAr: 'أواني الطبخ', nameEn: 'Cookware', slug: 'cookware', icon: '🍳', image: '/categories/cookware.png', productCount: 7 },
  { id: 'cmocboa8c0003mtch8sbbvg8d', nameAr: 'أدوات المطبخ', nameEn: 'Kitchen Tools', slug: 'kitchen-tools', icon: '🥄', image: '/categories/kitchen-tools.png', productCount: 7 },
  { id: 'cmocboa8c0002mtchjyp2zx9e', nameAr: 'أدوات التقديم', nameEn: 'Serving Ware', slug: 'serving-ware', icon: '🍽️', image: '/categories/serving-ware.png', productCount: 7 },
  { id: 'cmocboa8c0001mtchef5g12ko', nameAr: 'أكواب وأباريق', nameEn: 'Cups & Pitchers', slug: 'cups-pitchers', icon: '🥤', image: '/categories/cups-pitchers.png', productCount: 7 },
  { id: 'cmocboa8c0004mtch8odtpp94', nameAr: 'أدوات التحضير', nameEn: 'Preparation Tools', slug: 'preparation-tools', icon: '🔪', image: '/categories/preparation-tools.png', productCount: 7 },
  { id: 'cmocboa8i0009mtchthci2sqh', nameAr: 'تخزين الطعام', nameEn: 'Food Storage', slug: 'food-storage', icon: '🫙', image: '/categories/food-storage.png', productCount: 6 },
  { id: 'cmocboa8j000bmtcho6vog83e', nameAr: 'ملابس رجالية', nameEn: "Men's Fashion", slug: 'fashion-men', icon: '👔', image: '/categories/fashion-men.png', productCount: 6 },
  { id: 'cmocboa8m000gmtchupoagia2', nameAr: 'ملابس نسائية', nameEn: "Women's Fashion", slug: 'fashion-women', icon: '👗', image: '/categories/fashion-women.png', productCount: 6 },
  { id: 'cmocboa8e0005mtchuu4pjpl4', nameAr: 'ملابس أطفال ومواليد', nameEn: 'Kids & Baby Fashion', slug: 'fashion-kids', icon: '👶', image: '/categories/fashion-kids.png', productCount: 6 },
  { id: 'cmocboa8f0006mtch4owo3wq4', nameAr: 'أحذية رجالية', nameEn: "Men's Footwear", slug: 'footwear-men', icon: '👞', image: '/categories/footwear-men.png', productCount: 6 },
  { id: 'cmocboa8j000cmtchs4kw6v5f', nameAr: 'أحذية نسائية', nameEn: "Women's Footwear", slug: 'footwear-women', icon: '👠', image: '/categories/footwear-women.png', productCount: 6 },
  { id: 'cmocboa8l000fmtchrsja04mm', nameAr: 'أحذية أطفال', nameEn: 'Kids Footwear', slug: 'footwear-kids', icon: '🧒', image: '/categories/footwear-kids.png', productCount: 6 },
  { id: 'cmocboa8g0007mtch4caumuad', nameAr: 'العطور والبخور', nameEn: 'Perfumes & Oud', slug: 'perfumes-oud', icon: '🪔', image: '/categories/perfumes-oud.png', productCount: 6 },
  { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'الإكسسوارات والساعات', nameEn: 'Accessories & Watches', slug: 'accessories', icon: '⌚', image: '/categories/accessories.png', productCount: 6 },
  { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'مستلزمات الأم والطفل', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: '🍼', image: '/categories/mother-baby.png', productCount: 6 },
  { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'العناية بالبيت', nameEn: 'Home Care', slug: 'home-care', icon: '🧹', image: '/categories/home-care.png', productCount: 6 },
  { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'الأدوات الكهربائية', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: '⚡', image: '/categories/electrical-appliances.png', productCount: 6 },
  { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱', image: '/categories/electronics.png', productCount: 6 },
  { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'نباتات الزينة', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: '🌿', image: '/categories/ornamental-plants.png', productCount: 6 },
  { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'مستلزمات الحيوانات', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾', image: '/categories/pet-supplies.png', productCount: 6 },
  { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ألعاب أطفال', nameEn: "Children's Toys", slug: 'children-toys', icon: '🧸', image: '/categories/children-toys.png', productCount: 6 },
  { id: 'cat-gifts-antiques-001', nameAr: 'التحف والهدايا', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: '🎁', image: '/categories/gifts-antiques.png', productCount: 6 },
  { id: 'cat-wall-art-001', nameAr: 'الجداريات', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: '🖼️', image: '/categories/wall-art.png', productCount: 6 },
];

// ─── Local Subcategories for Offline Fallback ────────────────────────
export const LOCAL_SUBCATEGORIES: Subcategory[] = [
  // cookware - أواني الطبخ
  { id: 'sub-pots-pans', nameAr: 'طناجر وقدور', nameEn: 'Pots & Pans', slug: 'pots-pans', icon: '🫕', productCount: 0, parentId: 'cookware' },
  { id: 'sub-frying-pans', nameAr: 'مقالي', nameEn: 'Frying Pans', slug: 'frying-pans', icon: '🍳', productCount: 0, parentId: 'cookware' },
  { id: 'sub-ovenware', nameAr: 'أواني الفرن', nameEn: 'Ovenware', slug: 'ovenware', icon: '🥘', productCount: 0, parentId: 'cookware' },
  { id: 'sub-pressure-cookers', nameAr: 'قدور الضغط', nameEn: 'Pressure Cookers', slug: 'pressure-cookers', icon: '♨️', productCount: 0, parentId: 'cookware' },
  { id: 'sub-nonstick', nameAr: 'أواني التيفال', nameEn: 'Nonstick', slug: 'nonstick', icon: '🥞', productCount: 0, parentId: 'cookware' },
  { id: 'sub-stainless-steel', nameAr: 'ستانلس ستيل', nameEn: 'Stainless Steel', slug: 'stainless-steel', icon: '🪙', productCount: 0, parentId: 'cookware' },
  { id: 'sub-fryer-pots', nameAr: 'قدور القلي', nameEn: 'Fryer Pots', slug: 'fryer-pots', icon: '🍟', productCount: 0, parentId: 'cookware' },
  // kitchen-tools - أدوات المطبخ
  { id: 'sub-spoons-whisks', nameAr: 'ملاعق ومضارب', nameEn: 'Spoons & Whisks', slug: 'spoons-whisks', icon: '🥄', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-knives-cutting', nameAr: 'سكاكين وتقطيع', nameEn: 'Knives & Cutting', slug: 'knives-cutting', icon: '🔪', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-spatulas-turners', nameAr: 'ملاقط ومحاور', nameEn: 'Spatulas & Turners', slug: 'spatulas-turners', icon: '🥄', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-strainers-squeezers', nameAr: 'مصافي ومعصرات', nameEn: 'Strainers & Squeezers', slug: 'strainers-squeezers', icon: '🧃', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-measuring-tools', nameAr: 'أدوات القياس', nameEn: 'Measuring Tools', slug: 'measuring-tools', icon: '🧮', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-cutting-boards', nameAr: 'لوح تقطيع', nameEn: 'Cutting Boards', slug: 'cutting-boards', icon: '🪵', productCount: 0, parentId: 'kitchen-tools' },
  // serving-ware - أدوات التقديم
  { id: 'sub-plates-dishes', nameAr: 'صحون وأطباق', nameEn: 'Plates & Dishes', slug: 'plates-dishes', icon: '🍽️', productCount: 0, parentId: 'serving-ware' },
  { id: 'sub-serving-trays', nameAr: 'صواني تقديم', nameEn: 'Serving Trays', slug: 'serving-trays', icon: '🔲', productCount: 0, parentId: 'serving-ware' },
  { id: 'sub-salad-bowls', nameAr: 'طبقات سلطة', nameEn: 'Salad Bowls', slug: 'salad-bowls', icon: '🥗', productCount: 0, parentId: 'serving-ware' },
  { id: 'sub-hospitality-sets', nameAr: 'طقم ضيافة', nameEn: 'Hospitality Sets', slug: 'hospitality-sets', icon: '☕', productCount: 0, parentId: 'serving-ware' },
  { id: 'sub-dining-sets', nameAr: 'طقم سفرة', nameEn: 'Dining Sets', slug: 'dining-sets', icon: '🥘', productCount: 0, parentId: 'serving-ware' },
  // cups-pitchers - أكواب وأباريق
  { id: 'sub-tea-coffee-cups', nameAr: 'فناجين شاي وقهوة', nameEn: 'Tea & Coffee Cups', slug: 'tea-coffee-cups', icon: '☕', productCount: 0, parentId: 'cups-pitchers' },
  { id: 'sub-pitchers', nameAr: 'أباريق', nameEn: 'Pitchers', slug: 'pitchers', icon: '🫗', productCount: 0, parentId: 'cups-pitchers' },
  { id: 'sub-water-juice-glasses', nameAr: 'كاسات ماء وعصير', nameEn: 'Water & Juice Glasses', slug: 'water-juice-glasses', icon: '🥤', productCount: 0, parentId: 'cups-pitchers' },
  { id: 'sub-serving-cups', nameAr: 'أكواب تقديم', nameEn: 'Serving Cups', slug: 'serving-cups', icon: '🍵', productCount: 0, parentId: 'cups-pitchers' },
  { id: 'sub-cup-sets', nameAr: 'طقم أكواب', nameEn: 'Cup Sets', slug: 'cup-sets', icon: '🫖', productCount: 0, parentId: 'cups-pitchers' },
  // preparation-tools - أدوات التحضير
  { id: 'sub-blenders-choppers', nameAr: 'خلاطات وفرامات', nameEn: 'Blenders & Choppers', slug: 'blenders-choppers', icon: '🫙', productCount: 0, parentId: 'preparation-tools' },
  { id: 'sub-mixing-bowls', nameAr: 'طبقات خلط', nameEn: 'Mixing Bowls', slug: 'mixing-bowls', icon: '🥣', productCount: 0, parentId: 'preparation-tools' },
  { id: 'sub-graters-squeezers', nameAr: 'مبشرات ومعصرات', nameEn: 'Graters & Squeezers', slug: 'graters-squeezers', icon: '🧀', productCount: 0, parentId: 'preparation-tools' },
  { id: 'sub-molds-measures', nameAr: 'قوالب ومقاييس', nameEn: 'Molds & Measures', slug: 'molds-measures', icon: '🧁', productCount: 0, parentId: 'preparation-tools' },
  { id: 'sub-wrapping-tools', nameAr: 'أدوات التغليف', nameEn: 'Wrapping Tools', slug: 'wrapping-tools', icon: '📦', productCount: 0, parentId: 'preparation-tools' },
  // food-storage - تخزين الطعام
  { id: 'sub-plastic-containers', nameAr: 'ع بلاستيكية', nameEn: 'Plastic Containers', slug: 'plastic-containers', icon: '🫙', productCount: 0, parentId: 'food-storage' },
  { id: 'sub-glass-containers', nameAr: 'ع زجاجية', nameEn: 'Glass Containers', slug: 'glass-containers', icon: '🧴', productCount: 0, parentId: 'food-storage' },
  { id: 'sub-jars', nameAr: 'برطمانات', nameEn: 'Jars', slug: 'jars', icon: '🫙', productCount: 0, parentId: 'food-storage' },
  { id: 'sub-vacuum-bags', nameAr: 'أكياس تفريغ', nameEn: 'Vacuum Bags', slug: 'vacuum-bags', icon: '💾', productCount: 0, parentId: 'food-storage' },
  { id: 'sub-lunch-boxes', nameAr: 'حافظات طعام', nameEn: 'Lunch Boxes', slug: 'lunch-boxes', icon: '🍱', productCount: 0, parentId: 'food-storage' },
  // fashion-men - ملابس رجالية
  { id: 'sub-mens-shirts', nameAr: 'قمصان رجالية', nameEn: "Men's Shirts", slug: 'mens-shirts', icon: '👔', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-pants-jeans', nameAr: 'بنطلونات وجينز', nameEn: "Men's Pants & Jeans", slug: 'mens-pants-jeans', icon: '👖', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-jalabiyat', nameAr: 'جلابيات رجالية', nameEn: "Men's Jalabiyat", slug: 'mens-jalabiyat', icon: '🧥', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-jackets', nameAr: 'جاكيتات رجالية', nameEn: "Men's Jackets", slug: 'mens-jackets', icon: '🧥', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-underwear', nameAr: 'ملابس داخلية رجالية', nameEn: "Men's Underwear", slug: 'mens-underwear', icon: '🩲', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-sportswear', nameAr: 'ملابس رياضية رجالية', nameEn: "Men's Sportswear", slug: 'mens-sportswear', icon: '🏃', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-hats-scarves', nameAr: 'قبعات وأوشحة رجالية', nameEn: "Men's Hats & Scarves", slug: 'mens-hats-scarves', icon: '🧢', productCount: 0, parentId: 'fashion-men' },
  // fashion-women - ملابس نسائية
  { id: 'sub-womens-dresses', nameAr: 'فساتين نسائية', nameEn: "Women's Dresses", slug: 'womens-dresses', icon: '👗', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-abayas-hijabs', nameAr: 'عبايات وحجابات', nameEn: 'Abayas & Hijabs', slug: 'abayas-hijabs', icon: '🧕', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-blouses', nameAr: 'بلوزات نسائية', nameEn: "Women's Blouses", slug: 'womens-blouses', icon: '👚', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-skirts', nameAr: 'تنانير نسائية', nameEn: "Women's Skirts", slug: 'womens-skirts', icon: '👠', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-loungewear', nameAr: 'ملابس منزلية نسائية', nameEn: "Women's Loungewear", slug: 'womens-loungewear', icon: '🛋️', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-lingerie', nameAr: 'ملابس داخلية نسائية', nameEn: "Women's Lingerie", slug: 'womens-lingerie', icon: '🩱', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-sportswear', nameAr: 'ملابس رياضية نسائية', nameEn: "Women's Sportswear", slug: 'womens-sportswear', icon: '🏃‍♀️', productCount: 0, parentId: 'fashion-women' },
  // fashion-kids - ملابس أطفال ومواليد
  { id: 'sub-newborn-0-3m', nameAr: 'حديثي الولادة 0-3 أشهر', nameEn: 'Newborn 0-3m', slug: 'newborn-0-3m', icon: '👶', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-baby-3-6m', nameAr: 'رضيع 3-6 أشهر', nameEn: 'Baby 3-6m', slug: 'baby-3-6m', icon: '👶', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-baby-6-12m', nameAr: 'رضيع 6-12 شهر', nameEn: 'Baby 6-12m', slug: 'baby-6-12m', icon: '🧒', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-toddler-1-2y', nameAr: 'طفل 1-2 سنة', nameEn: 'Toddler 1-2y', slug: 'toddler-1-2y', icon: '👦', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-toddler-2-4y', nameAr: 'طفل 2-4 سنوات', nameEn: 'Toddler 2-4y', slug: 'toddler-2-4y', icon: '👧', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-girls-clothes', nameAr: 'ملابس بنات', nameEn: "Girls' Clothes", slug: 'girls-clothes', icon: '👗', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-boys-clothes', nameAr: 'ملابس أولاد', nameEn: "Boys' Clothes", slug: 'boys-clothes', icon: '🧒', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-school-uniforms', nameAr: 'زي مدرسي', nameEn: 'School Uniforms', slug: 'school-uniforms', icon: '🎒', productCount: 0, parentId: 'fashion-kids' },
  // footwear-men - أحذية رجالية
  { id: 'sub-mens-formal-shoes', nameAr: 'أحذية رسمية رجالية', nameEn: "Men's Formal Shoes", slug: 'mens-formal-shoes', icon: '👞', productCount: 0, parentId: 'footwear-men' },
  { id: 'sub-mens-sneakers', nameAr: 'سنيكرز رجالي', nameEn: "Men's Sneakers", slug: 'mens-sneakers', icon: '👟', productCount: 0, parentId: 'footwear-men' },
  { id: 'sub-mens-slippers-sandals', nameAr: 'شباشب وصنادل رجالية', nameEn: "Men's Slippers & Sandals", slug: 'mens-slippers-sandals', icon: '🩴', productCount: 0, parentId: 'footwear-men' },
  { id: 'sub-mens-work-shoes', nameAr: 'أحذية عمل رجالية', nameEn: "Men's Work Shoes", slug: 'mens-work-shoes', icon: '🥾', productCount: 0, parentId: 'footwear-men' },
  // footwear-women - أحذية نسائية
  { id: 'sub-womens-heels', nameAr: 'كعب عالي نسائي', nameEn: "Women's Heels", slug: 'womens-heels', icon: '👠', productCount: 0, parentId: 'footwear-women' },
  { id: 'sub-womens-flats', nameAr: 'أحذية مسطحة نسائية', nameEn: "Women's Flats", slug: 'womens-flats', icon: '🥿', productCount: 0, parentId: 'footwear-women' },
  { id: 'sub-womens-sneakers', nameAr: 'سنيكرز نسائي', nameEn: "Women's Sneakers", slug: 'womens-sneakers', icon: '👟', productCount: 0, parentId: 'footwear-women' },
  { id: 'sub-womens-slippers', nameAr: 'شباشب نسائية', nameEn: "Women's Slippers", slug: 'womens-slippers', icon: '🩴', productCount: 0, parentId: 'footwear-women' },
  // footwear-kids - أحذية أطفال
  { id: 'sub-baby-booties', nameAr: 'بوط أطفال', nameEn: 'Baby Booties', slug: 'baby-booties', icon: '🧦', productCount: 0, parentId: 'footwear-kids' },
  { id: 'sub-kids-sneakers', nameAr: 'سنيكرز أطفال', nameEn: 'Kids Sneakers', slug: 'kids-sneakers', icon: '👟', productCount: 0, parentId: 'footwear-kids' },
  { id: 'sub-kids-sandals', nameAr: 'صنادل أطفال', nameEn: 'Kids Sandals', slug: 'kids-sandals', icon: '🩴', productCount: 0, parentId: 'footwear-kids' },
  { id: 'sub-school-shoes', nameAr: 'أحذية مدرسية', nameEn: 'School Shoes', slug: 'school-shoes', icon: '👞', productCount: 0, parentId: 'footwear-kids' },
  // perfumes-oud - العطور والبخور
  { id: 'sub-mens-perfumes', nameAr: 'عطور رجالية', nameEn: "Men's Perfumes", slug: 'mens-perfumes', icon: '🧴', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-womens-perfumes', nameAr: 'عطور نسائية', nameEn: "Women's Perfumes", slug: 'womens-perfumes', icon: '💐', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-oud-incense', nameAr: 'عود وبخور', nameEn: 'Oud & Incense', slug: 'oud-incense', icon: '🪵', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-musk-oils', nameAr: 'مسك وزيوت', nameEn: 'Musk & Oils', slug: 'musk-oils', icon: '💧', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-incense-burners', nameAr: 'مباخر', nameEn: 'Incense Burners', slug: 'incense-burners', icon: '🪔', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-car-home-fragrance', nameAr: 'معطرات سيارة ومنزل', nameEn: 'Car & Home Fragrance', slug: 'car-home-fragrance', icon: '🚗', productCount: 0, parentId: 'perfumes-oud' },
  // accessories - الإكسسوارات والساعات
  { id: 'sub-mens-watches', nameAr: 'ساعات رجالية', nameEn: "Men's Watches", slug: 'mens-watches', icon: '⌚', productCount: 0, parentId: 'accessories' },
  { id: 'sub-womens-watches', nameAr: 'ساعات نسائية', nameEn: "Women's Watches", slug: 'womens-watches', icon: '⌚', productCount: 0, parentId: 'accessories' },
  { id: 'sub-kids-watches', nameAr: 'ساعات أطفال', nameEn: "Kids' Watches", slug: 'kids-watches', icon: '⌚', productCount: 0, parentId: 'accessories' },
  { id: 'sub-jewelry', nameAr: 'مجوهرات', nameEn: 'Jewelry', slug: 'jewelry', icon: '💍', productCount: 0, parentId: 'accessories' },
  { id: 'sub-sunglasses', nameAr: 'نظارات شمسية', nameEn: 'Sunglasses', slug: 'sunglasses', icon: '🕶️', productCount: 0, parentId: 'accessories' },
  { id: 'sub-bags-wallets', nameAr: 'حقائب ومحافظ', nameEn: 'Bags & Wallets', slug: 'bags-wallets', icon: '👜', productCount: 0, parentId: 'accessories' },
  { id: 'sub-phone-cases', nameAr: 'كفرات هواتف', nameEn: 'Phone Cases', slug: 'phone-cases', icon: '📱', productCount: 0, parentId: 'accessories' },
  // mother-baby - مستلزمات الأم والطفل
  { id: 'sub-diapers-wipes', nameAr: 'حفاضات ومناديل', nameEn: 'Diapers & Wipes', slug: 'diapers-wipes', icon: '🧷', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-bottles-pacifiers', nameAr: 'رضعات ومصاصات', nameEn: 'Bottles & Pacifiers', slug: 'bottles-pacifiers', icon: '🍼', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-strollers-car-seats', nameAr: 'عربات ومقاعد سيارة', nameEn: 'Strollers & Car Seats', slug: 'strollers-car-seats', icon: '🚼', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-breastfeeding', nameAr: 'رضاعة طبيعية', nameEn: 'Breastfeeding', slug: 'breastfeeding', icon: '🤱', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-nursery-furniture', nameAr: 'أثاث غرفة الأطفال', nameEn: 'Nursery Furniture', slug: 'nursery-furniture', icon: '🛏️', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-newborn-clothes-mb', nameAr: 'ملابس مواليد', nameEn: 'Newborn Clothes', slug: 'newborn-clothes-mb', icon: '👶', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-infant-clothes-mb', nameAr: 'ملابس رضع', nameEn: 'Infant Clothes', slug: 'infant-clothes-mb', icon: '👶', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-baby-food', nameAr: 'غذاء أطفال', nameEn: 'Baby Food', slug: 'baby-food', icon: '🥄', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-baby-care', nameAr: 'عناية بالطفل', nameEn: 'Baby Care', slug: 'baby-care', icon: '🧴', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-bath-toys', nameAr: 'ألعاب استحمام', nameEn: 'Bath Toys', slug: 'bath-toys', icon: '🛁', productCount: 0, parentId: 'mother-baby' },
  // home-care - العناية بالبيت
  { id: 'sub-cleaners-disinfectants', nameAr: 'منظفات ومطهرات', nameEn: 'Cleaners & Disinfectants', slug: 'cleaners-disinfectants', icon: '🧹', productCount: 0, parentId: 'home-care' },
  { id: 'sub-cleaning-tools', nameAr: 'أدوات تنظيف', nameEn: 'Cleaning Tools', slug: 'cleaning-tools', icon: '🧽', productCount: 0, parentId: 'home-care' },
  { id: 'sub-cleaning-machines', nameAr: 'ماكينات تنظيف', nameEn: 'Cleaning Machines', slug: 'cleaning-machines', icon: '🤖', productCount: 0, parentId: 'home-care' },
  { id: 'sub-soap-fresheners', nameAr: 'صابون ومعطرات', nameEn: 'Soap & Fresheners', slug: 'soap-fresheners', icon: '🧼', productCount: 0, parentId: 'home-care' },
  { id: 'sub-laundry-supplies', nameAr: 'مستلزمات غسيل', nameEn: 'Laundry Supplies', slug: 'laundry-supplies', icon: '🧺', productCount: 0, parentId: 'home-care' },
  // electrical-appliances - الأدوات الكهربائية
  { id: 'sub-kitchen-appliances', nameAr: 'أجهزة مطبخ', nameEn: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: '🔌', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-ac-fans', nameAr: 'مكيفات ومراوح', nameEn: 'AC & Fans', slug: 'ac-fans', icon: '❄️', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-washers-dryers', nameAr: 'غسالات ومجففات', nameEn: 'Washers & Dryers', slug: 'washers-dryers', icon: '🫧', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-heaters', nameAr: 'سخانات', nameEn: 'Heaters', slug: 'heaters', icon: '🌡️', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-vacuum-cleaners', nameAr: 'مكانس كهربائية', nameEn: 'Vacuum Cleaners', slug: 'vacuum-cleaners', icon: '🤖', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-small-appliances', nameAr: 'أجهزة صغيرة', nameEn: 'Small Appliances', slug: 'small-appliances', icon: '⚡', productCount: 0, parentId: 'electrical-appliances' },
  // electronics - الإلكترونيات
  { id: 'sub-phones-accessories', nameAr: 'هواتف وإكسسوارات', nameEn: 'Phones & Accessories', slug: 'phones-accessories', icon: '📱', productCount: 0, parentId: 'electronics' },
  { id: 'sub-tablets', nameAr: 'تابلت', nameEn: 'Tablets', slug: 'tablets', icon: '📟', productCount: 0, parentId: 'electronics' },
  { id: 'sub-headphones', nameAr: 'سماعات', nameEn: 'Headphones', slug: 'headphones', icon: '🎧', productCount: 0, parentId: 'electronics' },
  { id: 'sub-tvs-monitors', nameAr: 'تلفزيونات وشاشات', nameEn: 'TVs & Monitors', slug: 'tvs-monitors', icon: '📺', productCount: 0, parentId: 'electronics' },
  { id: 'sub-cameras', nameAr: 'كاميرات', nameEn: 'Cameras', slug: 'cameras', icon: '📷', productCount: 0, parentId: 'electronics' },
  { id: 'sub-audio-devices', nameAr: 'أجهزة صوت', nameEn: 'Audio Devices', slug: 'audio-devices', icon: '🔊', productCount: 0, parentId: 'electronics' },
  { id: 'sub-smart-home', nameAr: 'منزل ذكي', nameEn: 'Smart Home', slug: 'smart-home', icon: '🏠', productCount: 0, parentId: 'electronics' },
  { id: 'sub-chargers-batteries', nameAr: 'شواحن وبطاريات', nameEn: 'Chargers & Batteries', slug: 'chargers-batteries', icon: '🔋', productCount: 0, parentId: 'electronics' },
  // children-toys - ألعاب أطفال
  { id: 'sub-educational-toys', nameAr: 'ألعاب تعليمية', nameEn: 'Educational Toys', slug: 'educational-toys', icon: '🧩', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-fun-toys', nameAr: 'ألعاب ترفيهية', nameEn: 'Fun Toys', slug: 'fun-toys', icon: '🎮', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-girls-toys', nameAr: 'ألعاب بنات', nameEn: "Girls' Toys", slug: 'girls-toys', icon: '🧸', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-boys-toys', nameAr: 'ألعاب أولاد', nameEn: "Boys' Toys", slug: 'boys-toys', icon: '🚗', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-sports-toys', nameAr: 'ألعاب رياضية', nameEn: 'Sports Toys', slug: 'sports-toys', icon: '⚽', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-outdoor-toys', nameAr: 'ألعاب خارجية', nameEn: 'Outdoor Toys', slug: 'outdoor-toys', icon: '🌳', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-baby-toys', nameAr: 'ألعاب مواليد', nameEn: 'Baby Toys', slug: 'baby-toys', icon: '👶', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-lego-puzzles', nameAr: 'ليغو وبازل', nameEn: 'Lego & Puzzles', slug: 'lego-puzzles', icon: '🧱', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-electronic-toys', nameAr: 'ألعاب إلكترونية', nameEn: 'Electronic Toys', slug: 'electronic-toys', icon: '🤖', productCount: 0, parentId: 'children-toys' },
  // pet-supplies - مستلزمات الحيوانات
  { id: 'sub-cat-food', nameAr: 'طعام قطط', nameEn: 'Cat Food', slug: 'cat-food', icon: '🐱', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-dog-food', nameAr: 'طعام كلاب', nameEn: 'Dog Food', slug: 'dog-food', icon: '🐶', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-pet-toys', nameAr: 'ألعاب حيوانات', nameEn: 'Pet Toys', slug: 'pet-toys', icon: '🧸', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-cages-beds', nameAr: 'أقفاص وأسرّة', nameEn: 'Cages & Beds', slug: 'cages-beds', icon: '🏠', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-pet-hygiene', nameAr: 'نظافة الحيوانات', nameEn: 'Pet Hygiene', slug: 'pet-hygiene', icon: '🧴', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-collars-leashes', nameAr: 'أطواق وأقيدة', nameEn: 'Collars & Leashes', slug: 'collars-leashes', icon: '🔗', productCount: 0, parentId: 'pet-supplies' },
  // ornamental-plants - نباتات الزينة
  { id: 'sub-indoor-plants', nameAr: 'نباتات داخلية', nameEn: 'Indoor Plants', slug: 'indoor-plants', icon: '🌿', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-outdoor-plants', nameAr: 'نباتات خارجية', nameEn: 'Outdoor Plants', slug: 'outdoor-plants', icon: '🌳', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-pots-planters', nameAr: 'أصيص وزراعة', nameEn: 'Pots & Planters', slug: 'pots-planters', icon: '🪴', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-fertilizers-supplies', nameAr: 'أسمدة ومستلزمات', nameEn: 'Fertilizers & Supplies', slug: 'fertilizers-supplies', icon: '🧪', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-fresh-flowers', nameAr: 'ورود طازجة', nameEn: 'Fresh Flowers', slug: 'fresh-flowers', icon: '💐', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-artificial-plants', nameAr: 'نباتات صناعية', nameEn: 'Artificial Plants', slug: 'artificial-plants', icon: '🌺', productCount: 0, parentId: 'ornamental-plants' },
  // gifts-antiques - التحف والهدايا
  { id: 'sub-occasion-gifts', nameAr: 'هدايا مناسبات', nameEn: 'Occasion Gifts', slug: 'occasion-gifts', icon: '🎁', productCount: 0, parentId: 'gifts-antiques' },
  { id: 'sub-antiques-decor', nameAr: 'تحف وديكور', nameEn: 'Antiques & Decor', slug: 'antiques-decor', icon: '🏺', productCount: 0, parentId: 'gifts-antiques' },
  { id: 'sub-souvenirs', nameAr: 'تذكارات', nameEn: 'Souvenirs', slug: 'souvenirs', icon: '🗽', productCount: 0, parentId: 'gifts-antiques' },
  { id: 'sub-gift-wrapping', nameAr: 'تغليف هدايا', nameEn: 'Gift Wrapping', slug: 'gift-wrapping', icon: '🎀', productCount: 0, parentId: 'gifts-antiques' },
  { id: 'sub-candles-diffusers', nameAr: 'شموع ومعطرات', nameEn: 'Candles & Diffusers', slug: 'candles-diffusers', icon: '🕯️', productCount: 0, parentId: 'gifts-antiques' },
  // wall-art - الجداريات
  { id: 'sub-paintings', nameAr: 'لوحات فنية', nameEn: 'Paintings', slug: 'paintings', icon: '🎨', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-clocks', nameAr: 'ساعات حائط', nameEn: 'Wall Clocks', slug: 'wall-clocks', icon: '🕰️', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-mirrors', nameAr: 'مرايا جدارية', nameEn: 'Wall Mirrors', slug: 'wall-mirrors', icon: '🪞', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-shelves', nameAr: 'أرفف جدارية', nameEn: 'Wall Shelves', slug: 'wall-shelves', icon: '📚', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-decor', nameAr: 'ديكور جداري', nameEn: 'Wall Decor', slug: 'wall-decor', icon: '🖼️', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-stickers', nameAr: 'ستيكرات جدارية', nameEn: 'Wall Stickers', slug: 'wall-stickers', icon: '✨', productCount: 0, parentId: 'wall-art' },
];

// ─── Local Products for Offline Fallback ─────────────────────────────
export const LOCAL_PRODUCTS: Product[] = [
  { id: 'cmocboacb006rmtch97z9qzyb', nameAr: 'كاميرا', nameEn: 'Camera', price: 1200, comparePrice: 1400, mainImage: '/products/electronics-3.png', images: ['/products/electronics-3.png', '/products/electronics.png', '/products/electronics-2.png'], descriptionAr: 'كاميرا رقمية بعدسة عالية الدقة وتسجيل فيديو 4K', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱' }, stock: 8, rating: 4.7, reviewCount: 12, inStock: true, isActive: true },
  { id: 'cmocboaca006pmtchi780yw7o', nameAr: 'ساعة ذكية', nameEn: 'Smartwatch', price: 280, comparePrice: 340, mainImage: '/products/electronics-2.png', images: ['/products/electronics-2.png', '/products/electronics.png', '/products/electronics-3.png'], descriptionAr: 'ساعة ذكية متطورة بشاشة لمس ومراقبة صحية شاملة', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱' }, stock: 30, rating: 4.5, reviewCount: 39, inStock: true, isActive: true },
  { id: 'cmocboac9006nmtchlzyvaeqb', nameAr: 'شاحن سريع', nameEn: 'Fast Charger', price: 35, comparePrice: 45, mainImage: '/products/electronics.png', images: ['/products/electronics.png', '/products/electronics-2.png', '/products/electronics-3.png'], descriptionAr: 'شاحن سريع بقوة 65 واط متوافق مع جميع الأجهزة الذكية', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱' }, stock: 80, rating: 4.3, reviewCount: 36, inStock: true, isActive: true },
  { id: 'cmocboac8006lmtchzjkxcl2r', nameAr: 'تابلت', nameEn: 'Tablet', price: 550, comparePrice: 650, mainImage: '/products/electronics-3.png', images: ['/products/electronics-3.png', '/products/electronics.png', '/products/electronics-2.png'], descriptionAr: 'تابلت بشاشة عالية الدقة ومعالج قوي للاستخدام المتعدد', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱' }, stock: 20, rating: 4.4, reviewCount: 9, inStock: true, isActive: true },
  { id: 'cmocboac6006jmtcho4z8b2jq', nameAr: 'سماعات بلوتوث', nameEn: 'Bluetooth Headphones', price: 180, comparePrice: 220, mainImage: '/products/electronics-2.png', images: ['/products/electronics-2.png', '/products/electronics.png', '/products/electronics-3.png'], descriptionAr: 'سماعات بلوتوث لاسلكية بجودة صوت استثنائية وعزل للضوضاء', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱' }, stock: 40, rating: 4.5, reviewCount: 14, inStock: true, isActive: true },
  { id: 'cmocboac5006hmtch141gb5a8', nameAr: 'هاتف ذكي', nameEn: 'Smartphone', price: 850, comparePrice: 1000, mainImage: '/products/electronics.png', images: ['/products/electronics.png', '/products/electronics-2.png', '/products/electronics-3.png'], descriptionAr: 'هاتف ذكي بشاشة AMOLED وكاميرا عالية الدقة وبطارية طويلة الأمد', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'الإلكترونيات', nameEn: 'Electronics', slug: 'electronics', icon: '📱' }, stock: 25, rating: 4.6, reviewCount: 16, inStock: true, isActive: true },
  { id: 'cmocboac4006fmtchcrzzjnnn', nameAr: 'مروحة كهربائية', nameEn: 'Electric Fan', price: 65, comparePrice: 80, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'مروحة كهربائية ذات ريش كبيرة بسرعات متعددة وميلان قابل للتعديل', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'الأدوات الكهربائية', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: '⚡' }, stock: 50, rating: 4.2, reviewCount: 14, inStock: true, isActive: true },
  { id: 'cmocboac3006dmtch92go5tl4', nameAr: 'سخان مياه', nameEn: 'Water Heater', price: 320, comparePrice: 380, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'سخان مياه كهربائي بسعة 50 لتر مع عزل حراري فعال', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'الأدوات الكهربائية', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: '⚡' }, stock: 10, rating: 4.5, reviewCount: 12, inStock: true, isActive: true },
  { id: 'cmocboac2006bmtchnf9adn2b', nameAr: 'مكواة بخار', nameEn: 'Steam Iron', price: 85, comparePrice: 100, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'مكواة بخار بقوة تبخير عالية وبخزان ماء كبير', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'الأدوات الكهربائية', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: '⚡' }, stock: 40, rating: 4.3, reviewCount: 2, inStock: true, isActive: true },
  { id: 'cmocboac10069mtchqe8nnhgl', nameAr: 'مكنسة كهربائية', nameEn: 'Vacuum Cleaner', price: 280, comparePrice: 340, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'مكنسة كهربائية قوية الشفط بفلتر HEPA لأنظف نتائج', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'الأدوات الكهربائية', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: '⚡' }, stock: 15, rating: 4.4, reviewCount: 8, inStock: true, isActive: true },
  { id: 'cmocboabz0067mtch5g6r243h', nameAr: 'ماكينة قهوة', nameEn: 'Coffee Machine', price: 350, comparePrice: 420, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'ماكينة قهوة أوتوماتيكية بضغط 15 بار لتحضير إسبريسو مثالي', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'الأدوات الكهربائية', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: '⚡' }, stock: 20, rating: 4.7, reviewCount: 14, inStock: true, isActive: true },
  { id: 'cmocboaby0065mtchkgobdb67', nameAr: 'خلاط كهربائي', nameEn: 'Electric Blender', price: 120, comparePrice: 150, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'خلاط كهربائي متعدد السرعات بوعاء زجاجي مقاوم للحرارة', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'الأدوات الكهربائية', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: '⚡' }, stock: 35, rating: 4.5, reviewCount: 12, inStock: true, isActive: true },
  { id: 'cmocboabx0063mtch7m6o3ufb', nameAr: 'مطهر عام', nameEn: 'General Disinfectant', price: 10, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'مطهر عام قوي يقتل 99.9% من الجراثيم والبكتيريا', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'العناية بالبيت', nameEn: 'Home Care', slug: 'home-care', icon: '🧹' }, stock: 110, rating: 4.2, reviewCount: 29, inStock: true, isActive: true },
  { id: 'cmocboabw0061mtchio8iyxq7', nameAr: 'ملمع أثاث', nameEn: 'Furniture Polish', price: 14, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'ملمع أثاث بتركيبة حماية مزدوجة تمنح لمعاناً وحماية', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'العناية بالبيت', nameEn: 'Home Care', slug: 'home-care', icon: '🧹' }, stock: 65, rating: 4, reviewCount: 41, inStock: true, isActive: true },
  { id: 'cmocboabv005zmtchcz9g6rlq', nameAr: 'معطر جو', nameEn: 'Air Freshener', price: 15, comparePrice: 18, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'معطر جو برائحة طبيعية منعشة تدوم طويلاً', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'العناية بالبيت', nameEn: 'Home Care', slug: 'home-care', icon: '🧹' }, stock: 80, rating: 4.3, reviewCount: 1, inStock: true, isActive: true },
  { id: 'cmocboabu005xmtchjd2goa0o', nameAr: 'صابون أطباق', nameEn: 'Dish Soap', price: 8, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'صابون أطباق سائل لطيف على اليدين وقوي على الدهون', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'العناية بالبيت', nameEn: 'Home Care', slug: 'home-care', icon: '🧹' }, stock: 150, rating: 4.1, reviewCount: 44, inStock: true, isActive: true },
  { id: 'cmocboabt005vmtchrchqb947', nameAr: 'غسيل ملابس', nameEn: 'Laundry Detergent', price: 18, comparePrice: 22, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'مسحوق غسيل ملابس مركز فعال في إزالة البقع العنيدة', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'العناية بالبيت', nameEn: 'Home Care', slug: 'home-care', icon: '🧹' }, stock: 100, rating: 4.4, reviewCount: 47, inStock: true, isActive: true },
  { id: 'cmocboabs005tmtchmgnl5obz', nameAr: 'منظف أرضيات', nameEn: 'Floor Cleaner', price: 12, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'منظف أرضيات فعال بعبقطر منعش وصيغة مضادة للبكتيريا', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'العناية بالبيت', nameEn: 'Home Care', slug: 'home-care', icon: '🧹' }, stock: 120, rating: 4.2, reviewCount: 17, inStock: true, isActive: true },
  { id: 'cmocboabr005rmtchz5iiuqij', nameAr: 'رضاعة أطفال', nameEn: 'Baby Bottle', price: 18, comparePrice: 22, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'رضاعة أطفال مضادة للمغص بتصميم يحاكي الرضاعة الطبيعية', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'مستلزمات الأم والطفل', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: '🍼' }, stock: 90, rating: 4.4, reviewCount: 39, inStock: true, isActive: true },
  { id: 'cmocboabq005pmtchu7dhuof3', nameAr: 'ملابس مواليد', nameEn: 'Newborn Clothes Set', price: 45, comparePrice: 55, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'طقم ملابس مواليد قطنية ناعمة بتصاميم ملونة ومريحة', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'مستلزمات الأم والطفل', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: '🍼' }, stock: 50, rating: 4.3, reviewCount: 6, inStock: true, isActive: true },
  { id: 'cmocboabp005nmtch5ds9z5pl', nameAr: 'كرسي سيارة أطفال', nameEn: 'Baby Car Seat', price: 320, comparePrice: 380, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'كرسي سيارة أطفال آمن متوافق مع معايير السلامة الأوروبية', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'مستلزمات الأم والطفل', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: '🍼' }, stock: 12, rating: 4.8, reviewCount: 40, inStock: true, isActive: true },
  { id: 'cmocboabo005lmtchwcm4ur8i', nameAr: 'عربة أطفال', nameEn: 'Baby Stroller', price: 450, comparePrice: 550, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'عربة أطفال خفيفة الوزن قابلة للطي بتصميم آمن ومريح', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'مستلزمات الأم والطفل', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: '🍼' }, stock: 15, rating: 4.7, reviewCount: 38, inStock: true, isActive: true },
  { id: 'cmocboabn005jmtchm6gef3gt', nameAr: 'حفاضات أطفال', nameEn: 'Baby Diapers', price: 35, comparePrice: 42, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'حفاضات أطفال فائقة الامتصاص بطبقة ناعمة للبشرة الحساسة', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'مستلزمات الأم والطفل', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: '🍼' }, stock: 100, rating: 4.5, reviewCount: 22, inStock: true, isActive: true },
  { id: 'cmocboabm005hmtch2hsf1h88', nameAr: 'حليب أطفال', nameEn: 'Baby Formula', price: 55, comparePrice: 65, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'حليب أطفال مرحلة أولى مدعم بالفيتامينات والمعادن الأساسية', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'مستلزمات الأم والطفل', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: '🍼' }, stock: 80, rating: 4.6, reviewCount: 38, inStock: true, isActive: true },
  { id: 'cmocboabl005fmtch2hzxc70h', nameAr: 'خاتم فضة', nameEn: 'Silver Ring', price: 120, comparePrice: 150, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'خاتم فضة استرليني بتصميم شرقي مزخرف يدوي الصنع', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'الإكسسوارات والساعات', nameEn: 'Accessories & Watches', slug: 'accessories', icon: '⌚' }, stock: 30, rating: 4.5, reviewCount: 49, inStock: true, isActive: true },
  { id: 'cmocboabk005dmtch38udjrl2', nameAr: 'عقد لؤلؤ', nameEn: 'Pearl Necklace', price: 450, comparePrice: 550, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'عقد لؤلؤ طبيعي بتصميم أنيق وفاخر للمناسبات', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'الإكسسوارات والساعات', nameEn: 'Accessories & Watches', slug: 'accessories', icon: '⌚' }, stock: 12, rating: 4.8, reviewCount: 41, inStock: true, isActive: true },
  { id: 'cmocboabj005bmtcht7c4v39r', nameAr: 'حزام جلد', nameEn: 'Leather Belt', price: 65, comparePrice: 80, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'حزام جلد طبيعي بتصميم كلاسيكي وإبزيم ستانلس ستيل', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'الإكسسوارات والساعات', nameEn: 'Accessories & Watches', slug: 'accessories', icon: '⌚' }, stock: 55, rating: 4.4, reviewCount: 30, inStock: true, isActive: true },
  { id: 'cmocboabi0059mtchk4rid5q2', nameAr: 'نظارة شمسية', nameEn: 'Sunglasses', price: 85, comparePrice: 110, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'نظارة شمسية بتصميم عصري بعدسات مستقطبة للحماية من الشمس', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'الإكسسوارات والساعات', nameEn: 'Accessories & Watches', slug: 'accessories', icon: '⌚' }, stock: 45, rating: 4.3, reviewCount: 35, inStock: true, isActive: true },
  { id: 'cmocboabg0057mtchidux1hxp', nameAr: 'سوار ذهب', nameEn: 'Gold Bracelet', price: 1200, comparePrice: 1400, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'سوار ذهب عيار 18 بتصميم شرقي أنيق ومتين', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'الإكسسوارات والساعات', nameEn: 'Accessories & Watches', slug: 'accessories', icon: '⌚' }, stock: 10, rating: 4.9, reviewCount: 24, inStock: true, isActive: true },
  { id: 'cmocboabf0055mtchw2npcixo', nameAr: 'ساعة يد رجالية', nameEn: "Men's Wristwatch", price: 350, comparePrice: 420, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'ساعة يد رجالية فاخرة بتصميم كلاسيكي وإطار ستانلس ستيل', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'الإكسسوارات والساعات', nameEn: 'Accessories & Watches', slug: 'accessories', icon: '⌚' }, stock: 20, rating: 4.7, reviewCount: 10, inStock: true, isActive: true },
  // ─── Ornamental Plants Products ───
  { id: 'prod-plant-monstera-001', nameAr: 'نبتة مونستيرا داخلية في أصيص سيراميك', nameEn: 'Indoor Monstera Plant in Ceramic Pot', price: 75, comparePrice: 95, mainImage: '/products/ornamental-plants-2.png', images: ['/products/ornamental-plants-2.png'], descriptionAr: 'نبتة مونستيرا ديليسيوسا الاستوائية في أصيص سيراميك أبيض أنيق، سهلة العناية، تنقي الهواء', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'نباتات الزينة', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: '🌿' }, stock: 20, rating: 4.8, reviewCount: 27, inStock: true, isActive: true },
  { id: 'prod-plant-succulents-002', nameAr: 'مجموعة نباتات صبار وأشكال نضرة ملونة', nameEn: 'Colorful Succulents and Cactus Set', price: 35, comparePrice: 45, mainImage: '/products/ornamental-plants-3.png', images: ['/products/ornamental-plants-3.png'], descriptionAr: 'مجموعة من 4 نباتات صبار وأشكال نضرة ملونة في أصص سيراميك صغيرة، مثالية للديكور', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'نباتات الزينة', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: '🌿' }, stock: 45, rating: 4.6, reviewCount: 33, inStock: true, isActive: true },
  { id: 'prod-plant-pothos-003', nameAr: 'نبتة بوتوس معلقة في أصيص ماكrame', nameEn: 'Hanging Pothos Plant in Macrame Planter', price: 55, comparePrice: 70, mainImage: '/products/ornamental-plants-4.png', images: ['/products/ornamental-plants-4.png'], descriptionAr: 'نبتة بوتوس معلقة في أصيص ماكrame يدوي الصنع، نبتة متسلبة جميلة تنقي الهواء', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'نباتات الزينة', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: '🌿' }, stock: 30, rating: 4.5, reviewCount: 19, inStock: true, isActive: true },
  { id: 'prod-plant-snake-004', nameAr: 'نبتة الثعبان (سانسيفيريا)', nameEn: 'Snake Plant (Sansevieria)', price: 45, comparePrice: 55, mainImage: '/products/snake-plant.png', images: ['/products/snake-plant.png'], descriptionAr: 'نبتة الثعبان المعمرة في أصيص حجري أنيق، مقاومة للإهمال، تنقي الهواء بشكل فعال', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'نباتات الزينة', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: '🌿' }, stock: 35, rating: 4.7, reviewCount: 24, inStock: true, isActive: true },
  { id: 'prod-plant-ficus-005', nameAr: 'نبتة فيكوس ديكورا', nameEn: 'Ficus Decora Plant', price: 90, comparePrice: 110, mainImage: '/products/ficus-decora.png', images: ['/products/ficus-decora.png'], descriptionAr: 'نبتة فيكوس ديكورا بأوراقها الكبيرة اللامعة في أصيص سيراميك أبيض، رائعة للديكور الداخلي', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'نباتات الزينة', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: '🌿' }, stock: 15, rating: 4.4, reviewCount: 13, inStock: true, isActive: true },
  { id: 'prod-plant-rose-006', nameAr: 'وردة حمراء في أصيص زخرفي', nameEn: 'Red Rose Plant in Decorative Pot', price: 60, comparePrice: 75, mainImage: '/products/red-rose-plant.png', images: ['/products/red-rose-plant.png'], descriptionAr: 'نبتة وردة حمراء في أصيص زخرفي ملون، هدية مثالية ومظهر ساحر للمنزل', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'نباتات الزينة', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: '🌿' }, stock: 25, rating: 4.9, reviewCount: 36, inStock: true, isActive: true },
  // ─── Pet Supplies Products ───
  { id: 'prod-pet-catfood-001', nameAr: 'طعام قطط جاف بريميوم 2 كجم', nameEn: 'Premium Dry Cat Food 2kg', price: 55, comparePrice: 68, mainImage: '/products/pet-supplies-2.png', images: ['/products/pet-supplies-2.png'], descriptionAr: 'طعام قطط جاف بريميوم متوازن غذائياً غني بالبروتين والفيتامينات لصحة قطتك، وزن 2 كجم', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'مستلزمات الحيوانات', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾' }, stock: 80, rating: 4.6, reviewCount: 42, inStock: true, isActive: true },
  { id: 'prod-pet-bed-002', nameAr: 'سرير حيوانات أليف ناعم دائري', nameEn: 'Soft Round Pet Bed', price: 85, comparePrice: 110, mainImage: '/products/pet-supplies-3.png', images: ['/products/pet-supplies-3.png'], descriptionAr: 'سرير حيوانات أليف ناعم ودافئ بتصميم دائري مريح، مناسب للقطط والكلاب الصغيرة، لون رمادي', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'مستلزمات الحيوانات', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾' }, stock: 40, rating: 4.4, reviewCount: 15, inStock: true, isActive: true },
  { id: 'prod-pet-aqua-003', nameAr: 'حوض أسماك زجاج مع إضاءة LED وفلاتر', nameEn: 'Glass Aquarium Tank with LED and Filter', price: 180, comparePrice: 220, mainImage: '/products/pet-supplies-4.png', images: ['/products/pet-supplies-4.png'], descriptionAr: 'حوض أسماك زجاج 30 لتر مع إضاءة LED وفلاتر مدمجة وحصى زخرفي، مجموعة كاملة', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'مستلزمات الحيوانات', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾' }, stock: 15, rating: 4.3, reviewCount: 9, inStock: true, isActive: true },
  { id: 'prod-pet-dogfood-004', nameAr: 'طعام كلاب جاف 3 كجم', nameEn: 'Premium Dry Dog Food 3kg', price: 65, comparePrice: 80, mainImage: '/products/pet-care.png', images: ['/products/pet-care.png'], descriptionAr: 'طعام كلاب جاف بريميوم بحبوب لحم الدجاج والأرز، متوازن غذائياً، وزن 3 كجم', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'مستلزمات الحيوانات', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾' }, stock: 70, rating: 4.5, reviewCount: 28, inStock: true, isActive: true },
  { id: 'prod-pet-toys-005', nameAr: 'ألعاب تفاعلية للقطط', nameEn: 'Interactive Cat Toys Set', price: 35, comparePrice: 45, mainImage: '/products/pet-care-2.png', images: ['/products/pet-care-2.png'], descriptionAr: 'مجموعة ألعاب تفاعلية للقطط تشمل صيد الريش وكرة الليزر ونفق القطة', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'مستلزمات الحيوانات', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾' }, stock: 55, rating: 4.2, reviewCount: 16, inStock: true, isActive: true },
  { id: 'prod-pet-shampoo-006', nameAr: 'شامبو وعناية للحيوانات الأليفة', nameEn: 'Pet Shampoo and Care Set', price: 28, mainImage: '/products/pet-care-3.png', images: ['/products/pet-care-3.png'], descriptionAr: 'طقم عناية للحيوانات الأليفة يشمل شامبو وفرشاة ومشط، مناسب للقطط والكلاب', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'مستلزمات الحيوانات', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾' }, stock: 90, rating: 4.1, reviewCount: 11, inStock: true, isActive: true },
  // ─── Children's Toys Products ───
  { id: 'prod-toy-blocks-001', nameAr: 'مجموعة مكعبات بناء ملونة 100 قطعة', nameEn: 'Colorful Building Blocks Set 100 Pieces', price: 45, comparePrice: 60, mainImage: '/products/children-toys-2.png', images: ['/products/children-toys-2.png'], descriptionAr: 'مجموعة مكعبات بناء ملونة 100 قطعة لتعزيز مهارات الطفل الإبداعية والتفكير المنطقي، مناسبة من سن 3 سنوات', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ألعاب أطفال', nameEn: "Children's Toys", slug: 'children-toys', icon: '🧸' }, stock: 50, rating: 4.7, reviewCount: 23, inStock: true, isActive: true },
  { id: 'prod-toy-teddy-002', nameAr: 'دبدوب بلاش ناعم كبير', nameEn: 'Large Soft Plush Teddy Bear', price: 65, comparePrice: 85, mainImage: '/products/children-toys-3.png', images: ['/products/children-toys-3.png'], descriptionAr: 'دبدوب بلاش ناعم وفروي مصنوع من قطن عالي الجودة، آمن للأطفال، مقاس 60 سم', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ألعاب أطفال', nameEn: "Children's Toys", slug: 'children-toys', icon: '🧸' }, stock: 35, rating: 4.8, reviewCount: 18, inStock: true, isActive: true },
  { id: 'prod-toy-rccar-003', nameAr: 'سيارة سباق ريموت كنترول', nameEn: 'Remote Control Racing Car', price: 120, comparePrice: 150, mainImage: '/products/children-toys-4.png', images: ['/products/children-toys-4.png'], descriptionAr: 'سيارة سباق ريموت كنترول بتصميم رياضي، مقياس 1:16، مع جهاز تحكم عن بعد، بطارية قابلة للشحن', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ألعاب أطفال', nameEn: "Children's Toys", slug: 'children-toys', icon: '🧸' }, stock: 25, rating: 4.5, reviewCount: 31, inStock: true, isActive: true },
  { id: 'prod-toy-puzzle-004', nameAr: 'بازل 500 قطعة مناظر طبيعية', nameEn: '500-Piece Landscape Puzzle', price: 38, comparePrice: 48, mainImage: '/products/puzzle-500pc.png', images: ['/products/puzzle-500pc.png'], descriptionAr: 'بازل 500 قطعة بصور مناظر طبيعية خلابة لتطوير التركيز والصبر عند الأطفال والكبار', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ألعاب أطفال', nameEn: "Children's Toys", slug: 'children-toys', icon: '🧸' }, stock: 60, rating: 4.3, reviewCount: 14, inStock: true, isActive: true },
  { id: 'prod-toy-drone-005', nameAr: 'طائرة درون صغيرة', nameEn: 'Mini Drone', price: 180, comparePrice: 220, mainImage: '/products/mini-drone.png', images: ['/products/mini-drone.png'], descriptionAr: 'طائرة درون صغيرة مع كاميرا HD وتحكم عن بعد، مثالية للمبتدئين', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ألعاب أطفال', nameEn: "Children's Toys", slug: 'children-toys', icon: '🧸' }, stock: 15, rating: 4.4, reviewCount: 9, inStock: true, isActive: true },
  { id: 'prod-toy-stuffed-006', nameAr: 'مجموعة حيوانات محشية', nameEn: 'Stuffed Animals Collection', price: 55, comparePrice: 70, mainImage: '/products/stuffed-animals.png', images: ['/products/stuffed-animals.png'], descriptionAr: 'مجموعة من 6 حيوانات محشية ناعمة بأشكال مختلفة، آمنة للأطفال من سن سنة', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ألعاب أطفال', nameEn: "Children's Toys", slug: 'children-toys', icon: '🧸' }, stock: 40, rating: 4.6, reviewCount: 22, inStock: true, isActive: true },
  // ─── Gifts & Antiques Products ───
  { id: 'prod-ga-brass-001', nameAr: 'صينية نحاسية مزخرفة يدوياً', nameEn: 'Handcrafted Brass Tray', price: 180, comparePrice: 220, mainImage: '/products/gifts-antiques.png', images: ['/products/gifts-antiques.png'], descriptionAr: 'صينية نحاسية مزخرفة بنقوش شرقية أصيلة مصنوعة يدوياً بإتقان', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'التحف والهدايا', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: '🎁' }, stock: 20, rating: 4.8, reviewCount: 35, inStock: true, isActive: true },
  { id: 'prod-ga-incense-002', nameAr: 'طقم بخور عود فاخر مع مبخرة', nameEn: 'Premium Oud Incense Set with Burner', price: 120, comparePrice: 150, mainImage: '/products/gifts-antiques-2.png', images: ['/products/gifts-antiques-2.png'], descriptionAr: 'طقم بخور عود فاخر مع مبخرة نحاسية مزخرفة هدية مثالية', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'التحف والهدايا', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: '🎁' }, stock: 35, rating: 4.7, reviewCount: 28, inStock: true, isActive: true },
  { id: 'prod-ga-horse-003', nameAr: 'مجسم حصان عربي برونزي', nameEn: 'Bronze Arabian Horse Sculpture', price: 350, comparePrice: 420, mainImage: '/products/gifts-antiques-3.png', images: ['/products/gifts-antiques-3.png'], descriptionAr: 'مجسم حصان عربي أصيل من البرونز المطلي بالذهب، قطعة ديكور فاخرة', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'التحف والهدايا', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: '🎁' }, stock: 10, rating: 4.9, reviewCount: 19, inStock: true, isActive: true },
  { id: 'prod-ga-giftbox-004', nameAr: 'علبة هدايا فاخرة بالعطر والبخور', nameEn: 'Luxury Gift Box with Perfume and Incense', price: 95, comparePrice: 120, mainImage: '/products/gift-perfume-set.png', images: ['/products/gift-perfume-set.png'], descriptionAr: 'علبة هدايا فاخرة تحتوي على عطر شرقي وبخور عود ومبخرة صغيرة', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'التحف والهدايا', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: '🎁' }, stock: 45, rating: 4.6, reviewCount: 24, inStock: true, isActive: true },
  { id: 'prod-ga-teapot-005', nameAr: 'إبريق شاي نحاسي تقليدي مع فناجين', nameEn: 'Traditional Brass Teapot Set with Cups', price: 220, comparePrice: 270, mainImage: '/products/gifts-antiques-2.png', images: ['/products/gifts-antiques-2.png'], descriptionAr: 'إبريق شاي نحاسي تقليدي مع 6 فناجين بتصميم شرقي أنيق', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'التحف والهدايا', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: '🎁' }, stock: 15, rating: 4.5, reviewCount: 17, inStock: true, isActive: true },
  { id: 'prod-ga-crystal-006', nameAr: 'صحن كريستال مزخرف بالذهب', nameEn: 'Gold-Trimmed Crystal Decorative Plate', price: 150, comparePrice: 185, mainImage: '/products/gifts-antiques-3.png', images: ['/products/gifts-antiques-3.png'], descriptionAr: 'صحن كريستال فاخر مزخرف بلمسات ذهبية للديكور والضيافة', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'التحف والهدايا', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: '🎁' }, stock: 18, rating: 4.4, reviewCount: 13, inStock: true, isActive: true },
  // ─── Wall Art & Decor Products ───
  { id: 'prod-wa-calligraphy-001', nameAr: 'لوحة جدارية خط عربي يدوي', nameEn: 'Handwritten Arabic Calligraphy Wall Art', price: 120, comparePrice: 150, mainImage: '/products/wall-art.png', images: ['/products/wall-art.png'], descriptionAr: 'لوحة جدارية بخط عربي أصيل مرسومة يدوياً على قماش كانفاس عالي الجودة', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'الجداريات', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: '🖼️' }, stock: 25, rating: 4.8, reviewCount: 31, inStock: true, isActive: true },
  { id: 'prod-wa-oil-002', nameAr: 'لوحة زيتية مناظر طبيعية', nameEn: 'Oil Painting Landscape', price: 280, comparePrice: 340, mainImage: '/products/wall-art-2.png', images: ['/products/wall-art-2.png'], descriptionAr: 'لوحة زيتية رائعة لمناظر طبيعية خلابة مرسومة يدوياً بإطار خشبي فاخر', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'الجداريات', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: '🖼️' }, stock: 12, rating: 4.7, reviewCount: 22, inStock: true, isActive: true },
  { id: 'prod-wa-modern-003', nameAr: 'مجموعة لوحات جدارية حديثة 3 قطع', nameEn: 'Modern 3-Piece Wall Art Set', price: 180, comparePrice: 220, mainImage: '/products/wall-art-3.png', images: ['/products/wall-art-3.png'], descriptionAr: 'مجموعة من 3 لوحات جدارية بتصميم عصري تجريدي بألوان هادئة', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'الجداريات', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: '🖼️' }, stock: 20, rating: 4.5, reviewCount: 16, inStock: true, isActive: true },
  { id: 'prod-wa-clock-004', nameAr: 'ساعة حائط خشبية بتصميم عربي', nameEn: 'Arabic Design Wooden Wall Clock', price: 95, comparePrice: 120, mainImage: '/products/wall-art-4.png', images: ['/products/wall-art-4.png'], descriptionAr: 'ساعة حائط خشبية بتصميم عربي تقليدي مع أرقام عربية وأطراف مزخرفة', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'الجداريات', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: '🖼️' }, stock: 30, rating: 4.6, reviewCount: 20, inStock: true, isActive: true },
  { id: 'prod-wa-mirror-005', nameAr: 'مرآة جدارية مزخرفة بإطار ذهبي', nameEn: 'Ornate Wall Mirror with Gold Frame', price: 160, comparePrice: 195, mainImage: '/products/wall-art-5.png', images: ['/products/wall-art-5.png'], descriptionAr: 'مرآة جدارية أنيقة بإطار ذهبي مزخرف بنقوش شرقية فاخرة', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'الجداريات', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: '🖼️' }, stock: 15, rating: 4.4, reviewCount: 14, inStock: true, isActive: true },
  { id: 'prod-wa-metal-006', nameAr: 'لوحة ميتال آرت مع إضاءة LED', nameEn: 'Metal Art Panel with LED Lighting', price: 220, comparePrice: 270, mainImage: '/products/wall-art-6.png', images: ['/products/wall-art-6.png'], descriptionAr: 'لوحة معدنية فنية بتصميم هندسي مع إضاءة LED خلفية لتأثير مذهل', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'الجداريات', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: '🖼️' }, stock: 10, rating: 4.3, reviewCount: 8, inStock: true, isActive: true },
];

// ─── Local Offers for Offline Fallback ────────────────────────────────
// Generate end dates 2-7 days from now
function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
}

export const LOCAL_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    titleAr: 'عرض الهواتف الذكية',
    titleEn: 'Smartphone Sale',
    descriptionAr: 'خصم 15% على جميع الهواتف الذكية - عرض محدود!',
    descriptionEn: '15% off all smartphones - Limited offer!',
    discount: 15,
    image: '/products/electronics.png',
    productId: 'cmocboac5006hmtch141gb5a8',
    originalPrice: 1000,
    offerPrice: 850,
    endsAt: daysFromNow(3),
    badge: '🔥',
    limited: true,
  },
  {
    id: 'offer-2',
    titleAr: 'عرض السماعات اللاسلكية',
    titleEn: 'Wireless Headphones Deal',
    descriptionAr: 'سماعات بلوتوث بخصم 18% - لا تفوّت الفرصة!',
    descriptionEn: 'Bluetooth headphones at 18% off - Don\'t miss out!',
    discount: 18,
    image: '/products/electronics-2.png',
    productId: 'cmocboac6006jmtcho4z8b2jq',
    originalPrice: 220,
    offerPrice: 180,
    endsAt: daysFromNow(5),
    badge: '⏰',
  },
  {
    id: 'offer-3',
    titleAr: 'عرض ماكينة القهوة',
    titleEn: 'Coffee Machine Offer',
    descriptionAr: 'خصم 17% على ماكينة القهوة الأوتوماتيكية',
    descriptionEn: '17% off the automatic coffee machine',
    discount: 17,
    image: '/products/electrical-appliances.png',
    productId: 'cmocboabz0067mtch5g6r243h',
    originalPrice: 420,
    offerPrice: 350,
    endsAt: daysFromNow(2),
    badge: '💰',
    limited: true,
  },
  {
    id: 'offer-4',
    titleAr: 'عرض عربة الأطفال',
    titleEn: 'Baby Stroller Sale',
    descriptionAr: 'خصم 18% على عربة أطفال خفيفة وقابلة للطي',
    descriptionEn: '18% off lightweight foldable baby stroller',
    discount: 18,
    image: '/products/mother-baby.png',
    productId: 'cmocboabo005lmtchwcm4ur8i',
    originalPrice: 550,
    offerPrice: 450,
    endsAt: daysFromNow(7),
    badge: '🔥',
    limited: true,
  },
  {
    id: 'offer-5',
    titleAr: 'عرض عقد اللؤلؤ',
    titleEn: 'Pearl Necklace Deal',
    descriptionAr: 'خصم 18% على عقد لؤلؤ طبيعي فاخر',
    descriptionEn: '18% off luxury natural pearl necklace',
    discount: 18,
    image: '/products/accessories.png',
    productId: 'cmocboabk005dmtch38udjrl2',
    originalPrice: 550,
    offerPrice: 450,
    endsAt: daysFromNow(4),
    badge: '💎',
  },
  {
    id: 'offer-6',
    titleAr: 'عرض الكاميرا الرقمية',
    titleEn: 'Digital Camera Sale',
    descriptionAr: 'خصم 14% على كاميرا بدقة عالية وتسجيل 4K',
    descriptionEn: '14% off high-res camera with 4K recording',
    discount: 14,
    image: '/products/electronics-3.png',
    productId: 'cmocboacb006rmtch97z9qzyb',
    originalPrice: 1400,
    offerPrice: 1200,
    endsAt: daysFromNow(6),
    badge: '📸',
  },
];
