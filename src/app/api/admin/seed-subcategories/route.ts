import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// POST /api/admin/seed-subcategories — Seed all subcategories for the 23 parent categories
export async function POST() {
  try {
    const subcategories = [
      // cookware - أواني الطبخ
      { slug: 'pots-pans', nameAr: 'طناجر وقدور', nameEn: 'Pots & Pans', parentSlug: 'cookware', icon: '🫕', sortOrder: 1 },
      { slug: 'frying-pans', nameAr: 'مقالي وتاوات', nameEn: 'Frying Pans', parentSlug: 'cookware', icon: '🍳', sortOrder: 2 },
      { slug: 'ovenware', nameAr: 'أواني فرن', nameEn: 'Ovenware', parentSlug: 'cookware', icon: '🥘', sortOrder: 3 },
      { slug: 'pressure-cookers', nameAr: 'أواني ضغط', nameEn: 'Pressure Cookers', parentSlug: 'cookware', icon: '♨️', sortOrder: 4 },
      { slug: 'nonstick', nameAr: 'أواني غير لاصقة', nameEn: 'Nonstick Cookware', parentSlug: 'cookware', icon: '🥞', sortOrder: 5 },
      { slug: 'stainless-steel', nameAr: 'أواني ستانلس ستيل', nameEn: 'Stainless Steel', parentSlug: 'cookware', icon: '🪙', sortOrder: 6 },
      { slug: 'fryer-pots', nameAr: 'طناجر فرايزر', nameEn: 'Fryer Pots', parentSlug: 'cookware', icon: '🍟', sortOrder: 7 },

      // kitchen-tools - أدوات المطبخ
      { slug: 'spoons-whisks', nameAr: 'ملاعق ومغازل', nameEn: 'Spoons & Whisks', parentSlug: 'kitchen-tools', icon: '🥄', sortOrder: 1 },
      { slug: 'knives-cutting', nameAr: 'سكاكين وأدوات تقطيع', nameEn: 'Knives & Cutting', parentSlug: 'kitchen-tools', icon: '🔪', sortOrder: 2 },
      { slug: 'spatulas-turners', nameAr: 'مباشر وأدوات تقليب', nameEn: 'Spatulas & Turners', parentSlug: 'kitchen-tools', icon: '🥄', sortOrder: 3 },
      { slug: 'strainers-squeezers', nameAr: 'عصر وتصفية', nameEn: 'Strainers & Squeezers', parentSlug: 'kitchen-tools', icon: '🧃', sortOrder: 4 },
      { slug: 'measuring-tools', nameAr: 'أدوات قياس', nameEn: 'Measuring Tools', parentSlug: 'kitchen-tools', icon: '🧮', sortOrder: 5 },
      { slug: 'cutting-boards', nameAr: 'ألواح تقطيع', nameEn: 'Cutting Boards', parentSlug: 'kitchen-tools', icon: '🪵', sortOrder: 6 },

      // serving-ware - أدوات التقديم
      { slug: 'plates-dishes', nameAr: 'صحون وأطباق', nameEn: 'Plates & Dishes', parentSlug: 'serving-ware', icon: '🍽️', sortOrder: 1 },
      { slug: 'serving-trays', nameAr: 'صواني تقديم', nameEn: 'Serving Trays', parentSlug: 'serving-ware', icon: '🔲', sortOrder: 2 },
      { slug: 'salad-bowls', nameAr: 'أوعية سلطة', nameEn: 'Salad Bowls', parentSlug: 'serving-ware', icon: '🥗', sortOrder: 3 },
      { slug: 'hospitality-sets', nameAr: 'أدوات ضيافة', nameEn: 'Hospitality Sets', parentSlug: 'serving-ware', icon: '☕', sortOrder: 4 },
      { slug: 'dining-sets', nameAr: 'طقم سفرة', nameEn: 'Dining Sets', parentSlug: 'serving-ware', icon: '🥘', sortOrder: 5 },

      // cups-pitchers - أكواب وأباريق
      { slug: 'tea-coffee-cups', nameAr: 'أكواب شاي وقهوة', nameEn: 'Tea & Coffee Cups', parentSlug: 'cups-pitchers', icon: '☕', sortOrder: 1 },
      { slug: 'pitchers', nameAr: 'أباريق', nameEn: 'Pitchers', parentSlug: 'cups-pitchers', icon: '🫗', sortOrder: 2 },
      { slug: 'water-juice-glasses', nameAr: 'أكواب ماء وعصائر', nameEn: 'Water & Juice Glasses', parentSlug: 'cups-pitchers', icon: '🥤', sortOrder: 3 },
      { slug: 'serving-cups', nameAr: 'فناجين وأكواب تقديم', nameEn: 'Serving Cups', parentSlug: 'cups-pitchers', icon: '🍵', sortOrder: 4 },
      { slug: 'cup-sets', nameAr: 'طقم أكواب', nameEn: 'Cup Sets', parentSlug: 'cups-pitchers', icon: '🫖', sortOrder: 5 },

      // preparation-tools - أدوات التحضير
      { slug: 'blenders-choppers', nameAr: 'خلاطات وفرامات', nameEn: 'Blenders & Choppers', parentSlug: 'preparation-tools', icon: '🫙', sortOrder: 1 },
      { slug: 'mixing-bowls', nameAr: 'أحواض وعجّانات', nameEn: 'Mixing Bowls', parentSlug: 'preparation-tools', icon: '🥣', sortOrder: 2 },
      { slug: 'graters-squeezers', nameAr: 'أدوات بشر وعصر', nameEn: 'Graters & Squeezers', parentSlug: 'preparation-tools', icon: '🧀', sortOrder: 3 },
      { slug: 'molds-measures', nameAr: 'قوالب ومقاسات', nameEn: 'Molds & Measures', parentSlug: 'preparation-tools', icon: '🧁', sortOrder: 4 },
      { slug: 'wrapping-tools', nameAr: 'أدوات حفظ وتغليف', nameEn: 'Wrapping Tools', parentSlug: 'preparation-tools', icon: '📦', sortOrder: 5 },

      // food-storage - تخزين الطعام
      { slug: 'plastic-containers', nameAr: 'علب بلاستيكية', nameEn: 'Plastic Containers', parentSlug: 'food-storage', icon: '🫙', sortOrder: 1 },
      { slug: 'glass-containers', nameAr: 'علب زجاجية', nameEn: 'Glass Containers', parentSlug: 'food-storage', icon: '🧴', sortOrder: 2 },
      { slug: 'jars', nameAr: 'برطمانات حفظ', nameEn: 'Jars', parentSlug: 'food-storage', icon: '🫙', sortOrder: 3 },
      { slug: 'vacuum-bags', nameAr: 'أكياس وأوعية تفريغ', nameEn: 'Vacuum Bags', parentSlug: 'food-storage', icon: '💾', sortOrder: 4 },
      { slug: 'lunch-boxes', nameAr: 'صناديق غداء', nameEn: 'Lunch Boxes', parentSlug: 'food-storage', icon: '🍱', sortOrder: 5 },

      // fashion-men - ملابس رجالية
      { slug: 'mens-shirts', nameAr: 'قمصان', nameEn: 'Shirts', parentSlug: 'fashion-men', icon: '👔', sortOrder: 1 },
      { slug: 'mens-pants-jeans', nameAr: 'بناطيل وجينز', nameEn: 'Pants & Jeans', parentSlug: 'fashion-men', icon: '👖', sortOrder: 2 },
      { slug: 'mens-jalabiyat', nameAr: 'جلابيات وثياب', nameEn: 'Jalabiyat', parentSlug: 'fashion-men', icon: '🧥', sortOrder: 3 },
      { slug: 'mens-jackets', nameAr: 'سترات وجاكيتات', nameEn: 'Jackets', parentSlug: 'fashion-men', icon: '🧥', sortOrder: 4 },
      { slug: 'mens-underwear', nameAr: 'ملابس داخلية', nameEn: 'Underwear', parentSlug: 'fashion-men', icon: '🩲', sortOrder: 5 },
      { slug: 'mens-sportswear', nameAr: 'ملابس رياضية', nameEn: 'Sportswear', parentSlug: 'fashion-men', icon: '🏃', sortOrder: 6 },
      { slug: 'mens-hats-scarves', nameAr: 'طاقيات وشماغات', nameEn: 'Hats & Scarves', parentSlug: 'fashion-men', icon: '🧢', sortOrder: 7 },

      // fashion-women - ملابس نسائية
      { slug: 'womens-dresses', nameAr: 'فساتين', nameEn: 'Dresses', parentSlug: 'fashion-women', icon: '👗', sortOrder: 1 },
      { slug: 'abayas-hijabs', nameAr: 'عبايات وحجابات', nameEn: 'Abayas & Hijabs', parentSlug: 'fashion-women', icon: '🧕', sortOrder: 2 },
      { slug: 'womens-blouses', nameAr: 'بلوزات وتونيك', nameEn: 'Blouses & Tunics', parentSlug: 'fashion-women', icon: '👚', sortOrder: 3 },
      { slug: 'womens-skirts', nameAr: 'تنانير', nameEn: 'Skirts', parentSlug: 'fashion-women', icon: '👠', sortOrder: 4 },
      { slug: 'womens-loungewear', nameAr: 'ملابس منزلية', nameEn: 'Loungewear', parentSlug: 'fashion-women', icon: '🛋️', sortOrder: 5 },
      { slug: 'womens-lingerie', nameAr: 'ملابس داخلية', nameEn: 'Lingerie', parentSlug: 'fashion-women', icon: '🩱', sortOrder: 6 },
      { slug: 'womens-sportswear', nameAr: 'ملابس رياضية نسائية', nameEn: "Women's Sportswear", parentSlug: 'fashion-women', icon: '🏃‍♀️', sortOrder: 7 },

      // fashion-kids - ملابس أطفال ومواليد
      { slug: 'newborn-0-3m', nameAr: 'ملابس مواليد (0-3 أشهر)', nameEn: 'Newborn (0-3 months)', parentSlug: 'fashion-kids', icon: '👶', sortOrder: 1 },
      { slug: 'baby-3-6m', nameAr: 'ملابس مواليد (3-6 أشهر)', nameEn: 'Baby (3-6 months)', parentSlug: 'fashion-kids', icon: '👶', sortOrder: 2 },
      { slug: 'baby-6-12m', nameAr: 'ملابس أطفال (6-12 شهر)', nameEn: 'Baby (6-12 months)', parentSlug: 'fashion-kids', icon: '🧒', sortOrder: 3 },
      { slug: 'toddler-1-2y', nameAr: 'ملابس أطفال (1-2 سنة)', nameEn: 'Toddler (1-2 years)', parentSlug: 'fashion-kids', icon: '👦', sortOrder: 4 },
      { slug: 'toddler-2-4y', nameAr: 'ملابس أطفال (2-4 سنة)', nameEn: 'Toddler (2-4 years)', parentSlug: 'fashion-kids', icon: '👧', sortOrder: 5 },
      { slug: 'girls-clothes', nameAr: 'ملابس بنات', nameEn: "Girls' Clothes", parentSlug: 'fashion-kids', icon: '👗', sortOrder: 6 },
      { slug: 'boys-clothes', nameAr: 'ملابس أولاد', nameEn: "Boys' Clothes", parentSlug: 'fashion-kids', icon: '🧒', sortOrder: 7 },
      { slug: 'school-uniforms', nameAr: 'ملابس مدرسية', nameEn: 'School Uniforms', parentSlug: 'fashion-kids', icon: '🎒', sortOrder: 8 },

      // footwear-men - أحذية رجالية
      { slug: 'mens-formal-shoes', nameAr: 'أحذية رسمية', nameEn: 'Formal Shoes', parentSlug: 'footwear-men', icon: '👞', sortOrder: 1 },
      { slug: 'mens-sneakers', nameAr: 'أحذية رياضية', nameEn: 'Sneakers', parentSlug: 'footwear-men', icon: '👟', sortOrder: 2 },
      { slug: 'mens-slippers-sandals', nameAr: 'شبشب وصنادل', nameEn: 'Slippers & Sandals', parentSlug: 'footwear-men', icon: '🩴', sortOrder: 3 },
      { slug: 'mens-work-shoes', nameAr: 'أحذية عمل', nameEn: 'Work Shoes', parentSlug: 'footwear-men', icon: '🥾', sortOrder: 4 },

      // footwear-women - أحذية نسائية
      { slug: 'womens-heels', nameAr: 'أحذية كعب عالي', nameEn: 'Heels', parentSlug: 'footwear-women', icon: '👠', sortOrder: 1 },
      { slug: 'womens-flats', nameAr: 'أحذية مسطحة', nameEn: 'Flats', parentSlug: 'footwear-women', icon: '🥿', sortOrder: 2 },
      { slug: 'womens-sneakers', nameAr: 'أحذية رياضية نسائية', nameEn: "Women's Sneakers", parentSlug: 'footwear-women', icon: '👟', sortOrder: 3 },
      { slug: 'womens-slippers', nameAr: 'شبشب وصنادل نسائية', nameEn: "Women's Slippers", parentSlug: 'footwear-women', icon: '🩴', sortOrder: 4 },

      // footwear-kids - أحذية أطفال
      { slug: 'baby-booties', nameAr: 'أحذية مواليد ناعمة', nameEn: 'Baby Booties', parentSlug: 'footwear-kids', icon: '🧦', sortOrder: 1 },
      { slug: 'kids-sneakers', nameAr: 'أحذية أطفال رياضية', nameEn: 'Kids Sneakers', parentSlug: 'footwear-kids', icon: '👟', sortOrder: 2 },
      { slug: 'kids-sandals', nameAr: 'صنادل أطفال', nameEn: 'Kids Sandals', parentSlug: 'footwear-kids', icon: '🩴', sortOrder: 3 },
      { slug: 'school-shoes', nameAr: 'أحذية مدرسية', nameEn: 'School Shoes', parentSlug: 'footwear-kids', icon: '👞', sortOrder: 4 },

      // perfumes-oud - العطور والبخور
      { slug: 'mens-perfumes', nameAr: 'عطور رجالية', nameEn: "Men's Perfumes", parentSlug: 'perfumes-oud', icon: '🧴', sortOrder: 1 },
      { slug: 'womens-perfumes', nameAr: 'عطور نسائية', nameEn: "Women's Perfumes", parentSlug: 'perfumes-oud', icon: '💐', sortOrder: 2 },
      { slug: 'oud-incense', nameAr: 'عود وبخور', nameEn: 'Oud & Incense', parentSlug: 'perfumes-oud', icon: '🪵', sortOrder: 3 },
      { slug: 'musk-oils', nameAr: 'دهون ومسك', nameEn: 'Musk & Oils', parentSlug: 'perfumes-oud', icon: '💧', sortOrder: 4 },
      { slug: 'incense-burners', nameAr: 'بخور ومباخر', nameEn: 'Incense Burners', parentSlug: 'perfumes-oud', icon: '🪔', sortOrder: 5 },
      { slug: 'car-home-fragrance', nameAr: 'عطور السيارات والمكان', nameEn: 'Car & Home Fragrance', parentSlug: 'perfumes-oud', icon: '🚗', sortOrder: 6 },

      // accessories - الإكسسوارات والساعات
      { slug: 'mens-watches', nameAr: 'ساعات رجالية', nameEn: "Men's Watches", parentSlug: 'accessories', icon: '⌚', sortOrder: 1 },
      { slug: 'womens-watches', nameAr: 'ساعات نسائية', nameEn: "Women's Watches", parentSlug: 'accessories', icon: '⌚', sortOrder: 2 },
      { slug: 'kids-watches', nameAr: 'ساعات أطفال', nameEn: "Kids' Watches", parentSlug: 'accessories', icon: '⌚', sortOrder: 3 },
      { slug: 'jewelry', nameAr: 'مجوهرات وإكسسوارات', nameEn: 'Jewelry', parentSlug: 'accessories', icon: '💍', sortOrder: 4 },
      { slug: 'sunglasses', nameAr: 'نظارات', nameEn: 'Sunglasses', parentSlug: 'accessories', icon: '🕶️', sortOrder: 5 },
      { slug: 'bags-wallets', nameAr: 'حقائب ومحافظ', nameEn: 'Bags & Wallets', parentSlug: 'accessories', icon: '👜', sortOrder: 6 },
      { slug: 'phone-cases', nameAr: 'أغطية هواتف', nameEn: 'Phone Cases', parentSlug: 'accessories', icon: '📱', sortOrder: 7 },

      // mother-baby - مستلزمات الأم والطفل
      { slug: 'diapers-wipes', nameAr: 'حفاضات ومناديل', nameEn: 'Diapers & Wipes', parentSlug: 'mother-baby', icon: '🧷', sortOrder: 1 },
      { slug: 'bottles-pacifiers', nameAr: 'رضاعات ومصاصات', nameEn: 'Bottles & Pacifiers', parentSlug: 'mother-baby', icon: '🍼', sortOrder: 2 },
      { slug: 'strollers-car-seats', nameAr: 'عربات وكراسي', nameEn: 'Strollers & Car Seats', parentSlug: 'mother-baby', icon: '🚼', sortOrder: 3 },
      { slug: 'breastfeeding', nameAr: 'مستلزمات الرضاعة', nameEn: 'Breastfeeding', parentSlug: 'mother-baby', icon: '🤱', sortOrder: 4 },
      { slug: 'nursery-furniture', nameAr: 'أثاث أطفال (سرائر)', nameEn: 'Nursery Furniture', parentSlug: 'mother-baby', icon: '🛏️', sortOrder: 5 },
      { slug: 'newborn-clothes-mb', nameAr: 'ملابس مواليد (0-3 شهور)', nameEn: 'Newborn Clothes (0-3 months)', parentSlug: 'mother-baby', icon: '👶', sortOrder: 6 },
      { slug: 'infant-clothes-mb', nameAr: 'ملابس مواليد (3-6 شهور)', nameEn: 'Infant Clothes (3-6 months)', parentSlug: 'mother-baby', icon: '👶', sortOrder: 7 },
      { slug: 'baby-food', nameAr: 'طعام أطفال', nameEn: 'Baby Food', parentSlug: 'mother-baby', icon: '🥄', sortOrder: 8 },
      { slug: 'baby-care', nameAr: 'صحة وعناية بالطفل', nameEn: 'Baby Care', parentSlug: 'mother-baby', icon: '🧴', sortOrder: 9 },
      { slug: 'bath-toys', nameAr: 'ألعاب استحمام', nameEn: 'Bath Toys', parentSlug: 'mother-baby', icon: '🛁', sortOrder: 10 },

      // home-care - العناية بالبيت
      { slug: 'cleaners-disinfectants', nameAr: 'منظفات ومطهرات', nameEn: 'Cleaners & Disinfectants', parentSlug: 'home-care', icon: '🧹', sortOrder: 1 },
      { slug: 'cleaning-tools', nameAr: 'أدوات تنظيف', nameEn: 'Cleaning Tools', parentSlug: 'home-care', icon: '🧽', sortOrder: 2 },
      { slug: 'cleaning-machines', nameAr: 'أجهزة تنظيف', nameEn: 'Cleaning Machines', parentSlug: 'home-care', icon: '🤖', sortOrder: 3 },
      { slug: 'soap-fresheners', nameAr: 'صابون ومعطرات', nameEn: 'Soap & Fresheners', parentSlug: 'home-care', icon: '🧼', sortOrder: 4 },
      { slug: 'laundry-supplies', nameAr: 'أدوات غسيل', nameEn: 'Laundry Supplies', parentSlug: 'home-care', icon: '🧺', sortOrder: 5 },

      // electrical-appliances - الأدوات الكهربائية
      { slug: 'kitchen-appliances', nameAr: 'أجهزة مطبخ كهربائية', nameEn: 'Kitchen Appliances', parentSlug: 'electrical-appliances', icon: '🔌', sortOrder: 1 },
      { slug: 'ac-fans', nameAr: 'مكيفات ومراوح', nameEn: 'AC & Fans', parentSlug: 'electrical-appliances', icon: '❄️', sortOrder: 2 },
      { slug: 'washers-dryers', nameAr: 'غسالات ومجففات', nameEn: 'Washers & Dryers', parentSlug: 'electrical-appliances', icon: '🫧', sortOrder: 3 },
      { slug: 'heaters', nameAr: 'أجهزة تدفئة', nameEn: 'Heaters', parentSlug: 'electrical-appliances', icon: '🌡️', sortOrder: 4 },
      { slug: 'vacuum-cleaners', nameAr: 'مكانس كهربائية', nameEn: 'Vacuum Cleaners', parentSlug: 'electrical-appliances', icon: '🤖', sortOrder: 5 },
      { slug: 'small-appliances', nameAr: 'أجهزة صغيرة', nameEn: 'Small Appliances', parentSlug: 'electrical-appliances', icon: '⚡', sortOrder: 6 },

      // electronics - الإلكترونيات
      { slug: 'phones-accessories', nameAr: 'هواتف ولوازمها', nameEn: 'Phones & Accessories', parentSlug: 'electronics', icon: '📱', sortOrder: 1 },
      { slug: 'tablets', nameAr: 'أجهزة لوحية', nameEn: 'Tablets', parentSlug: 'electronics', icon: '📟', sortOrder: 2 },
      { slug: 'headphones', nameAr: 'سماعات', nameEn: 'Headphones', parentSlug: 'electronics', icon: '🎧', sortOrder: 3 },
      { slug: 'tvs-monitors', nameAr: 'شاشات وتلفزيونات', nameEn: 'TVs & Monitors', parentSlug: 'electronics', icon: '📺', sortOrder: 4 },
      { slug: 'cameras', nameAr: 'كاميرات', nameEn: 'Cameras', parentSlug: 'electronics', icon: '📷', sortOrder: 5 },
      { slug: 'audio-devices', nameAr: 'سماعات وأجهزة صوت', nameEn: 'Audio Devices', parentSlug: 'electronics', icon: '🔊', sortOrder: 6 },
      { slug: 'smart-home', nameAr: 'أجهزة منزل ذكية', nameEn: 'Smart Home', parentSlug: 'electronics', icon: '🏠', sortOrder: 7 },
      { slug: 'chargers-batteries', nameAr: 'شواحن وبطاريات', nameEn: 'Chargers & Batteries', parentSlug: 'electronics', icon: '🔋', sortOrder: 8 },

      // children-toys - ألعاب أطفال
      { slug: 'educational-toys', nameAr: 'ألعاب ذكاء وتعليمية', nameEn: 'Educational Toys', parentSlug: 'children-toys', icon: '🧩', sortOrder: 1 },
      { slug: 'fun-toys', nameAr: 'ألعاب تسلية وترفيه', nameEn: 'Fun & Entertainment', parentSlug: 'children-toys', icon: '🎮', sortOrder: 2 },
      { slug: 'girls-toys', nameAr: 'ألعاب بنات (دول، مطابخ)', nameEn: "Girls' Toys", parentSlug: 'children-toys', icon: '🧸', sortOrder: 3 },
      { slug: 'boys-toys', nameAr: 'ألعاب أولاد (سيارات، أبطال)', nameEn: "Boys' Toys", parentSlug: 'children-toys', icon: '🚗', sortOrder: 4 },
      { slug: 'sports-toys', nameAr: 'ألعاب رياضية', nameEn: 'Sports Toys', parentSlug: 'children-toys', icon: '⚽', sortOrder: 5 },
      { slug: 'outdoor-toys', nameAr: 'ألعاب خارجية', nameEn: 'Outdoor Toys', parentSlug: 'children-toys', icon: '🌳', sortOrder: 6 },
      { slug: 'baby-toys', nameAr: 'ألعاب مواليد', nameEn: 'Baby Toys', parentSlug: 'children-toys', icon: '👶', sortOrder: 7 },
      { slug: 'lego-puzzles', nameAr: 'ليغو وبازل', nameEn: 'Lego & Puzzles', parentSlug: 'children-toys', icon: '🧱', sortOrder: 8 },
      { slug: 'electronic-toys', nameAr: 'ألعاب إلكترونية', nameEn: 'Electronic Toys', parentSlug: 'children-toys', icon: '🤖', sortOrder: 9 },

      // pet-supplies - مستلزمات الحيوانات
      { slug: 'cat-food', nameAr: 'طعام قطط', nameEn: 'Cat Food', parentSlug: 'pet-supplies', icon: '🐱', sortOrder: 1 },
      { slug: 'dog-food', nameAr: 'طعام كلاب', nameEn: 'Dog Food', parentSlug: 'pet-supplies', icon: '🐶', sortOrder: 2 },
      { slug: 'pet-toys', nameAr: 'ألعاب حيوانات', nameEn: 'Pet Toys', parentSlug: 'pet-supplies', icon: '🧸', sortOrder: 3 },
      { slug: 'cages-beds', nameAr: 'أقفاص وأسرّة', nameEn: 'Cages & Beds', parentSlug: 'pet-supplies', icon: '🏠', sortOrder: 4 },
      { slug: 'pet-hygiene', nameAr: 'مستلزمات نظافة', nameEn: 'Pet Hygiene', parentSlug: 'pet-supplies', icon: '🧴', sortOrder: 5 },
      { slug: 'collars-leashes', nameAr: 'أطواق ومقودات', nameEn: 'Collars & Leashes', parentSlug: 'pet-supplies', icon: '🔗', sortOrder: 6 },

      // ornamental-plants - نباتات الزينة
      { slug: 'indoor-plants', nameAr: 'نباتات داخلية', nameEn: 'Indoor Plants', parentSlug: 'ornamental-plants', icon: '🌿', sortOrder: 1 },
      { slug: 'outdoor-plants', nameAr: 'نباتات خارجية', nameEn: 'Outdoor Plants', parentSlug: 'ornamental-plants', icon: '🌳', sortOrder: 2 },
      { slug: 'pots-planters', nameAr: 'أصص وأوعية', nameEn: 'Pots & Planters', parentSlug: 'ornamental-plants', icon: '🪴', sortOrder: 3 },
      { slug: 'fertilizers-supplies', nameAr: 'أسمدة ومستلزمات', nameEn: 'Fertilizers & Supplies', parentSlug: 'ornamental-plants', icon: '🧪', sortOrder: 4 },
      { slug: 'fresh-flowers', nameAr: 'زهور طبيعية', nameEn: 'Fresh Flowers', parentSlug: 'ornamental-plants', icon: '💐', sortOrder: 5 },
      { slug: 'artificial-plants', nameAr: 'نباتات صناعية', nameEn: 'Artificial Plants', parentSlug: 'ornamental-plants', icon: '🌺', sortOrder: 6 },

      // gifts-antiques - التحف والهدايا
      { slug: 'occasion-gifts', nameAr: 'هدايا مناسبات', nameEn: 'Occasion Gifts', parentSlug: 'gifts-antiques', icon: '🎁', sortOrder: 1 },
      { slug: 'antiques-decor', nameAr: 'تحف وديكورات', nameEn: 'Antiques & Decor', parentSlug: 'gifts-antiques', icon: '🏺', sortOrder: 2 },
      { slug: 'souvenirs', nameAr: 'هدايا تذكارية', nameEn: 'Souvenirs', parentSlug: 'gifts-antiques', icon: '🗽', sortOrder: 3 },
      { slug: 'gift-wrapping', nameAr: 'تغليف هدايا', nameEn: 'Gift Wrapping', parentSlug: 'gifts-antiques', icon: '🎀', sortOrder: 4 },
      { slug: 'candles-diffusers', nameAr: 'شموع ومعطرات', nameEn: 'Candles & Diffusers', parentSlug: 'gifts-antiques', icon: '🕯️', sortOrder: 5 },

      // wall-art - الجداريات
      { slug: 'paintings', nameAr: 'لوحات فنية', nameEn: 'Paintings', parentSlug: 'wall-art', icon: '🎨', sortOrder: 1 },
      { slug: 'wall-clocks', nameAr: 'ساعات جدارية', nameEn: 'Wall Clocks', parentSlug: 'wall-art', icon: '🕰️', sortOrder: 2 },
      { slug: 'wall-mirrors', nameAr: 'مرايا جدارية', nameEn: 'Wall Mirrors', parentSlug: 'wall-art', icon: '🪞', sortOrder: 3 },
      { slug: 'wall-shelves', nameAr: 'رفوف جدارية', nameEn: 'Wall Shelves', parentSlug: 'wall-art', icon: '📚', sortOrder: 4 },
      { slug: 'wall-decor', nameAr: 'ديكورات جدارية', nameEn: 'Wall Decor', parentSlug: 'wall-art', icon: '🖼️', sortOrder: 5 },
      { slug: 'wall-stickers', nameAr: 'ملصقات وستيكرز', nameEn: 'Wall Stickers', parentSlug: 'wall-art', icon: '✨', sortOrder: 6 },
    ]

    // Step 1: Look up all parent categories by slug
    const parentSlugs = [...new Set(subcategories.map(s => s.parentSlug))]
    const parentCategories = await db.category.findMany({
      where: { slug: { in: parentSlugs } },
      select: { id: true, slug: true },
    })

    // Build a map of slug -> id for quick lookup
    const parentMap = new Map<string, string>()
    for (const parent of parentCategories) {
      parentMap.set(parent.slug, parent.id)
    }

    // Check for missing parents
    const missingParents = parentSlugs.filter(slug => !parentMap.has(slug))
    if (missingParents.length > 0) {
      return NextResponse.json(
        { error: 'Missing parent categories', missingSlugs: missingParents },
        { status: 400 }
      )
    }

    // Step 2: Get existing subcategory slugs to track created vs updated
    const subcategorySlugs = subcategories.map(s => s.slug)
    const existingSubcats = await db.category.findMany({
      where: { slug: { in: subcategorySlugs } },
      select: { slug: true },
    })
    const existingSlugSet = new Set(existingSubcats.map(s => s.slug))

    // Step 3: Upsert each subcategory
    let created = 0
    let updated = 0

    for (const sub of subcategories) {
      const parentId = parentMap.get(sub.parentSlug)!
      const isExisting = existingSlugSet.has(sub.slug)

      await db.category.upsert({
        where: { slug: sub.slug },
        update: {
          nameAr: sub.nameAr,
          nameEn: sub.nameEn,
          icon: sub.icon,
          sortOrder: sub.sortOrder,
          parentId: parentId,
          isActive: true,
        },
        create: {
          slug: sub.slug,
          nameAr: sub.nameAr,
          nameEn: sub.nameEn,
          icon: sub.icon,
          sortOrder: sub.sortOrder,
          parentId: parentId,
          isActive: true,
          phase: 'ACTIVE_MVP',
        },
      })

      if (isExisting) {
        updated++
      } else {
        created++
      }
    }

    // Step 4: Return summary grouped by parent
    const groupedByParent: Record<string, number> = {}
    for (const sub of subcategories) {
      groupedByParent[sub.parentSlug] = (groupedByParent[sub.parentSlug] || 0) + 1
    }

    return NextResponse.json({
      success: true,
      message: 'Subcategories seeded successfully',
      summary: {
        total: subcategories.length,
        created,
        updated,
        parentsWithSubcategories: Object.entries(groupedByParent).map(
          ([parentSlug, count]) => ({ parentSlug, subcategoryCount: count })
        ),
      },
    })
  } catch (error) {
    console.error('[SEED_SUBCATEGORIES_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to seed subcategories', details: String(error) },
      { status: 500 }
    )
  }
}
