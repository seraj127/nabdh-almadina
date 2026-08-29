import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🗑️  Cleaning existing data...')

  // Delete in order to respect foreign keys
  await db.notification.deleteMany()
  await db.auditLog.deleteMany()
  await db.orderStatusLog.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.cartItem.deleteMany()
  await db.favoriteItem.deleteMany()
  await db.review.deleteMany()
  await db.inventoryMovement.deleteMany()
  await db.loyaltyTransaction.deleteMany()
  await db.walletTransaction.deleteMany()
  await db.address.deleteMany()
  await db.oTPVerification.deleteMany()
  await db.vendorPayout.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()
  await db.vendor.deleteMany()
  await db.featureFlag.deleteMany()
  await db.journalEntryLine.deleteMany()
  await db.journalEntry.deleteMany()
  await db.ledgerAccount.deleteMany()
  await db.coupon.deleteMany()
  await db.deliveryZone.deleteMany()
  await db.user.deleteMany()

  console.log('✅ Database cleaned')

  // ─── Categories ─────────────────────────────────────────────
  console.log('📂 Creating categories...')

  const categories = await Promise.all([
    db.category.create({
      data: {
        nameAr: 'أواني الطبخ',
        nameEn: 'Cookware',
        slug: 'cookware',
        description: 'مجموعة متنوعة من أواني الطبخ عالية الجودة',
        icon: '🍳',
        image: '/products/cookware.png',
        sortOrder: 1,
        phase: 'ACTIVE_MVP',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'أدوات المطبخ',
        nameEn: 'Kitchen Tools',
        slug: 'kitchen-tools',
        description: 'أدوات مطبخية عملية ومتينة للاستخدام اليومي',
        icon: '🥄',
        image: '/products/kitchen-tools.png',
        sortOrder: 2,
        phase: 'ACTIVE_MVP',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'أدوات التقديم',
        nameEn: 'Serving Ware',
        slug: 'serving-ware',
        description: 'أدوات تقديم أنيقة لكل مناسبة',
        icon: '🍽️',
        image: '/products/serving-ware.png',
        sortOrder: 3,
        phase: 'ACTIVE_MVP',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'أكواب وأباريق',
        nameEn: 'Cups & Pitchers',
        slug: 'cups-pitchers',
        description: 'أكواب وأباريق بتصاميم عصرية وكلاسيكية',
        icon: '🥤',
        image: '/products/cups-pitchers.png',
        sortOrder: 4,
        phase: 'ACTIVE_MVP',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'أدوات التحضير',
        nameEn: 'Preparation Tools',
        slug: 'preparation-tools',
        description: 'أدوات تحضير الطعام المثالية لكل طباخ',
        icon: '🔪',
        image: '/products/preparation-tools.png',
        sortOrder: 5,
        phase: 'ACTIVE_MVP',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'تخزين الطعام',
        nameEn: 'Food Storage',
        slug: 'food-storage',
        description: 'حلول تخزين الطعام المحكمة الإغلاق',
        icon: '🫙',
        image: '/products/food-storage.png',
        sortOrder: 6,
        phase: 'ACTIVE_MVP',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'ملابس رجالية',
        nameEn: "Men's Fashion",
        slug: 'fashion-men',
        description: 'أحدث صيحات الموضة الرجالية بأسعار منافسة',
        icon: '👔',
        image: '/products/fashion-men.png',
        sortOrder: 7,
        phase: 'PHASE_2',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'ملابس نسائية',
        nameEn: "Women's Fashion",
        slug: 'fashion-women',
        description: 'تشكيلة واسعة من الملابس النسائية الأنيقة',
        icon: '👗',
        image: '/products/fashion-women.png',
        sortOrder: 8,
        phase: 'PHASE_2',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'ملابس أطفال ومواليد',
        nameEn: 'Kids & Baby Fashion',
        slug: 'fashion-kids',
        description: 'ملابس أطفال ومواليد مريحة وعصرية',
        icon: '👶',
        image: '/products/fashion-kids.png',
        sortOrder: 9,
        phase: 'PHASE_2',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'أحذية رجالية',
        nameEn: "Men's Footwear",
        slug: 'footwear-men',
        description: 'أحذية رجالية رسمية وكاجوال بجودة عالية',
        icon: '👞',
        image: '/products/footwear-men.png',
        sortOrder: 10,
        phase: 'PHASE_2',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'أحذية نسائية',
        nameEn: "Women's Footwear",
        slug: 'footwear-women',
        description: 'أحذية نسائية أنيقة ومريحة لكل مناسبة',
        icon: '👠',
        image: '/products/footwear-women.png',
        sortOrder: 11,
        phase: 'PHASE_2',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'أحذية أطفال',
        nameEn: 'Kids Footwear',
        slug: 'footwear-kids',
        description: 'أحذية أطفال متينة ومريحة لجميع الأعمار',
        icon: '🧒',
        image: '/products/footwear-kids.png',
        sortOrder: 12,
        phase: 'PHASE_2',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'العطور والبخور',
        nameEn: 'Perfumes & Oud',
        slug: 'perfumes-oud',
        description: 'أفخر العطور والبخور الشرقي الأصيل',
        icon: '🪔',
        image: '/products/perfumes-oud.png',
        sortOrder: 13,
        phase: 'PHASE_2',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'الإكسسوارات والساعات',
        nameEn: 'Accessories & Watches',
        slug: 'accessories',
        description: 'إكسسوارات وساعات فاخرة بتصاميم مميزة',
        icon: '⌚',
        image: '/products/accessories.png',
        sortOrder: 14,
        phase: 'PHASE_2',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'مستلزمات الأم والطفل',
        nameEn: 'Mother & Baby',
        slug: 'mother-baby',
        description: 'كل ما تحتاجه الأم والطفل من مستلزمات آمنة',
        icon: '🍼',
        image: '/products/mother-baby.png',
        sortOrder: 15,
        phase: 'PHASE_3',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'العناية بالبيت',
        nameEn: 'Home Care',
        slug: 'home-care',
        description: 'منتجات تنظيف وعناية بالمنزل فعالة وآمنة',
        icon: '🧹',
        image: '/products/home-care.png',
        sortOrder: 16,
        phase: 'PHASE_3',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'الأدوات الكهربائية',
        nameEn: 'Electrical Appliances',
        slug: 'electrical-appliances',
        description: 'أدوات كهربائية منزلية موثوقة واقتصادية',
        icon: '⚡',
        image: '/products/electrical-appliances.png',
        sortOrder: 17,
        phase: 'PHASE_3',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'الإلكترونيات',
        nameEn: 'Electronics',
        slug: 'electronics',
        description: 'أحدث الأجهزة الإلكترونية والتقنية',
        icon: '📱',
        image: '/products/electronics.png',
        sortOrder: 18,
        phase: 'PHASE_3',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'ألعاب أطفال',
        nameEn: "Children's Toys",
        slug: 'children-toys',
        description: 'ألعاب تعليمية وترفيهية آمنة للأطفال بجميع الأعمار',
        icon: '🧸',
        image: '/products/children-toys.png',
        sortOrder: 19,
        phase: 'PHASE_4',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'مستلزمات الحيوانات',
        nameEn: 'Pet Supplies',
        slug: 'pet-supplies',
        description: 'كل ما تحتاجه حيوانك الأليف من طعام ومستلزمات وعناية',
        icon: '🐾',
        image: '/products/pet-supplies.png',
        sortOrder: 20,
        phase: 'PHASE_4',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'نباتات الزينة',
        nameEn: 'Ornamental Plants',
        slug: 'ornamental-plants',
        description: 'نباتات زينة داخلية وخارجية لتنسيق وتجميل منزلك',
        icon: '🌿',
        image: '/products/ornamental-plants.png',
        sortOrder: 21,
        phase: 'PHASE_4',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'التحف والهدايا',
        nameEn: 'Antiques & Gifts',
        slug: 'gifts-antiques',
        description: 'تحف شرقية أصيلة وهدايا فاخرة لكل المناسبات',
        icon: '🎁',
        image: '/products/gifts-antiques.png',
        sortOrder: 22,
        phase: 'PHASE_4',
        isActive: true,
      },
    }),
    db.category.create({
      data: {
        nameAr: 'الجداريات',
        nameEn: 'Wall Art & Decor',
        slug: 'wall-art',
        description: 'لوحات جدارية وديكور حائط فني لتزيين مساحتك',
        icon: '🖼️',
        image: '/products/wall-art.png',
        sortOrder: 23,
        phase: 'PHASE_4',
        isActive: true,
      },
    }),
  ])

  console.log(`✅ ${categories.length} categories created`)

  // ─── Products ───────────────────────────────────────────────
  console.log('📦 Creating products...')

  const [cookware, kitchenTools, servingWare, cupsPitchers, preparationTools, foodStorage, fashionMen, fashionWomen, fashionKids, footwearMen, footwearWomen, footwearKids, perfumesOud, accessoriesCat, motherBaby, homeCare, electricalAppliances, electronics, childrenToys, petSupplies, ornamentalPlants, giftsAntiques, wallArt] = categories

  // Helper to build product data
  const product = (
    category: { id: string },
    sku: string,
    nameAr: string,
    nameEn: string,
    descriptionAr: string,
    descriptionEn: string,
    price: number,
    comparePrice: number | null,
    stock: number,
    badges: string[],
    rating: number,
    isFeatured: boolean,
    imageSlug: string,
  ) => ({
    categoryId: category.id,
    sku,
    nameAr,
    nameEn,
    descriptionAr,
    descriptionEn,
    price,
    comparePrice,
    mainImage: `/products/${imageSlug}.png`,
    images: JSON.stringify([
      `/products/${imageSlug}.png`,
    ]),
    stock,
    badges: badges.length > 0 ? JSON.stringify(badges) : null,
    rating,
    reviewCount: Math.floor(Math.random() * 50) + 1,
    isActive: true,
    isFeatured,
  })

  // Cookware products (7)
  const cookwareProducts = [
    product(cookware, 'NBD-COOK-001', 'قدر ستانلس ستيل 5 لتر', 'Stainless Steel Pot 5L',
      'قدر ستانلس ستيل عالي الجودة بسعة 5 لتر مع مقبض مريح', 'High-quality stainless steel pot with 5L capacity and comfortable handle',
      120, 150, 45, ['bestseller'], 4.7, true, 'stainless-steel-pot-5l'),
    product(cookware, 'NBD-COOK-002', 'طقم أواني طبخ 7 قطع', '7-Piece Cookware Set',
      'طقم أواني طبخ كامل من 7 قطع بطبقة غير لاصقة', 'Complete 7-piece non-stick cookware set',
      350, 420, 20, ['sale'], 4.5, true, '7-piece-cookware-set'),
    product(cookware, 'NBD-COOK-003', 'مقلاة تيفال 28 سم', 'Tefal Frying Pan 28cm',
      'مقلاة تيفال بطبقة غير لاصقة وقطر 28 سم', 'Non-stick Tefal frying pan, 28cm diameter',
      85, 110, 60, ['bestseller'], 4.8, false, 'tefal-frying-pan-28cm'),
    product(cookware, 'NBD-COOK-004', 'قدر ضغط 6 لتر', 'Pressure Cooker 6L',
      'قدر ضغط ستانلس ستيل بسعة 6 لتر مع صمام أمان', 'Stainless steel pressure cooker, 6L capacity with safety valve',
      195, null, 30, [], 4.3, false, 'pressure-cooker-6l'),
    product(cookware, 'NBD-COOK-005', 'قدر نحاسي تقليدي 3 لتر', 'Traditional Copper Pot 3L',
      'قدر نحاسي ليبي تقليدي مصنوع يدوياً بسعة 3 لتر', 'Handcrafted traditional Libyan copper pot, 3L capacity',
      280, 320, 15, ['new'], 4.9, true, 'traditional-copper-pot-3l'),
    product(cookware, 'NBD-COOK-006', 'مقلاة غويطات 24 سم', 'Deep Frying Pan 24cm',
      'مقلاة غويطات مع غطاء زجاجي بقطر 24 سم', 'Deep frying pan with glass lid, 24cm diameter',
      95, 115, 40, [], 4.4, false, 'deep-frying-pan-24cm'),
    product(cookware, 'NBD-COOK-007', 'حلة أرز كبيرة 10 لتر', 'Large Rice Pot 10L',
      'حلة أرز ستانلس ستيل بسعة 10 لتر مثالية للمناسبات', 'Large stainless steel rice pot, 10L capacity, ideal for gatherings',
      165, 190, 25, [], 4.2, false, 'large-rice-pot-10l'),
  ]

  // Kitchen Tools products (7)
  const kitchenToolsProducts = [
    product(kitchenTools, 'NBD-KT-001', 'طقم ملاعق طبخ 6 قطع', '6-Piece Cooking Spoon Set',
      'طقم ملاعق طبخ من الخشب الطبيعي 6 قطع', 'Natural wood cooking spoon set, 6 pieces',
      45, 55, 80, ['bestseller'], 4.6, false, 'cooking-spoon-set-6pc'),
    product(kitchenTools, 'NBD-KT-002', 'مصفاة مطبخ ستانلس ستيل', 'Stainless Steel Colander',
      'مصفاة مطبخ ستانلس ستيل متينة بفتحات دقيقة', 'Durable stainless steel colander with fine holes',
      35, null, 70, [], 4.3, false, 'stainless-steel-colander'),
    product(kitchenTools, 'NBD-KT-003', 'خلاط يدوي كهربائي', 'Electric Hand Mixer',
      'خلاط يدوي كهربائي بسرعات متعددة وملحقات متعددة', 'Electric hand mixer with multiple speeds and attachments',
      145, 175, 35, ['new'], 4.5, true, 'electric-hand-mixer'),
    product(kitchenTools, 'NBD-KT-004', 'مبشرة جبن متعددة الاستخدام', 'Multi-Purpose Grater',
      'مبشرة جبن بأربعة أسطح مختلفة للبشر وال تقطيع', 'Four-sided multi-purpose grater for shredding and slicing',
      28, null, 90, [], 4.1, false, 'multi-purpose-grater'),
    product(kitchenTools, 'NBD-KT-005', 'طقم سكاكين مطبخ 5 قطع', '5-Piece Kitchen Knife Set',
      'طقم سكاكين مطبخ ستانلس ستيل مع حامل خشبي', 'Stainless steel kitchen knife set with wooden block',
      195, 240, 25, ['sale'], 4.7, true, 'kitchen-knife-set-5pc'),
    product(kitchenTools, 'NBD-KT-006', 'ملعقة خشبية طويلة', 'Long Wooden Spatula',
      'ملعقة خشبية طويلة مثالية للتحريك والطبخ', 'Long wooden spatula ideal for stirring and cooking',
      15, null, 100, [], 4.0, false, 'long-wooden-spatula'),
    product(kitchenTools, 'NBD-KT-007', 'مقياس كوب جاف وسائل', 'Dry & Liquid Measuring Cup Set',
      'طقم أكواب قياس للسوائل والمكونات الجافة', 'Measuring cup set for liquids and dry ingredients',
      38, 45, 65, [], 4.4, false, 'measuring-cup-set'),
  ]

  // Serving Ware products (7)
  const servingWareProducts = [
    product(servingWare, 'NBD-SW-001', 'صينية تقديم دائرية كبيرة', 'Large Round Serving Tray',
      'صينية تقديم دائرية أنيقة من الستانلس ستيل', 'Elegant round stainless steel serving tray',
      75, 90, 40, ['bestseller'], 4.5, false, 'round-serving-tray-lg'),
    product(servingWare, 'NBD-SW-002', 'طقم صحون تقديم 3 قطع', '3-Piece Serving Bowl Set',
      'طقم صحون تقديم بورسلين بتصاميم شرقية', '3-piece porcelain serving bowl set with oriental designs',
      110, 135, 30, ['new'], 4.6, true, 'serving-bowl-set-3pc'),
    product(servingWare, 'NBD-SW-003', 'طبق كسكس كبير', 'Large Couscous Plate',
      'طبق كسكس فخاري كبير تقليدي', 'Traditional large ceramic couscous plate',
      65, null, 35, [], 4.3, false, 'large-couscous-plate'),
    product(servingWare, 'NBD-SW-004', 'صينية تقديم مستطيلة مزخرفة', 'Decorated Rectangular Serving Tray',
      'صينية تقديم مستطيلة مزخرفة بالنقوش العربية', 'Rectangular serving tray decorated with Arabic patterns',
      95, 120, 20, [], 4.8, true, 'decorated-rectangular-tray'),
    product(servingWare, 'NBD-SW-005', 'طقم أطباق سفرة 12 قطعة', '12-Piece Dinner Plate Set',
      'طقم أطباق سفرة من البورسلين 12 قطعة', '12-piece porcelain dinner plate set',
      220, 270, 15, ['sale'], 4.4, false, 'dinner-plate-set-12pc'),
    product(servingWare, 'NBD-SW-006', 'زبدية تقديم خزفية', 'Ceramic Serving Bowl',
      'زبدية تقديم خزفية يدوية الصنع بألوان طبيعية', 'Handcrafted ceramic serving bowl with natural colors',
      55, null, 50, [], 4.2, false, 'ceramic-serving-bowl'),
    product(servingWare, 'NBD-SW-007', 'غطاء طعام مزخرف', 'Decorated Food Cover',
      'غطاء طعام معدني مزخرف للحفاظ على الطعام دافئاً', 'Decorated metal food cover to keep food warm',
      45, 55, 45, [], 4.1, false, 'decorated-food-cover'),
  ]

  // Cups & Pitchers products (7)
  const cupsPitchersProducts = [
    product(cupsPitchers, 'NBD-CP-001', 'إبريق شاي زجاج مع منخل', 'Glass Teapot with Infuser',
      'إبريق شاي زجاجي مقاوم للحرارة مع منخل مدمج', 'Heat-resistant glass teapot with built-in infuser',
      85, 100, 35, ['bestseller'], 4.7, true, 'glass-teapot-infuser'),
    product(cupsPitchers, 'NBD-CP-002', 'طقم أكواب شاي زجاجية 6 قطع', '6-Piece Glass Tea Cup Set',
      'طقم أكواب شاي زجاجية مقاومة للحرارة', 'Heat-resistant glass tea cup set, 6 pieces',
      55, 65, 55, [], 4.4, false, 'glass-tea-cup-set-6pc'),
    product(cupsPitchers, 'NBD-CP-003', 'إبريق ماء نحاسي تقليدي', 'Traditional Copper Water Pitcher',
      'إبريق ماء نحاسي تقليدي مصنوع يدوياً', 'Handcrafted traditional copper water pitcher',
      180, 220, 10, ['new'], 4.9, true, 'traditional-copper-pitcher'),
    product(cupsPitchers, 'NBD-CP-004', 'كوب قهوة عربية فاخر', 'Premium Arabic Coffee Cup',
      'كوب قهوة عربية بورسلين مطلي بالذهب', 'Gold-trimmed porcelain Arabic coffee cup',
      25, null, 80, [], 4.3, false, 'premium-arabic-coffee-cup'),
    product(cupsPitchers, 'NBD-CP-005', 'طقم دلة قهوة عربية', 'Arabic Coffee Dallah Set',
      'طقم دلة قهوة عربية نحاسية مع فناجين', 'Brass Arabic coffee dallah set with cups',
      250, 300, 12, ['bestseller'], 4.8, true, 'arabic-coffee-dallah-set'),
    product(cupsPitchers, 'NBD-CP-006', 'إبريق عصير زجاج 1.5 لتر', 'Glass Juice Pitcher 1.5L',
      'إبريق عصير زجاجي شفاف بسعة 1.5 لتر مع غطاء', 'Transparent glass juice pitcher, 1.5L with lid',
      42, 50, 60, [], 4.2, false, 'glass-juice-pitcher-1.5l'),
    product(cupsPitchers, 'NBD-CP-007', 'طقم أكواب ماء كريستال 6 قطع', '6-Piece Crystal Water Glass Set',
      'طقم أكواب ماء كريستال أنيق 6 قطع', 'Elegant crystal water glass set, 6 pieces',
      95, 120, 25, ['sale'], 4.5, false, 'crystal-water-glass-set-6pc'),
  ]

  // Preparation Tools products (7)
  const preparationToolsProducts = [
    product(preparationTools, 'NBD-PT-001', 'لوح تقطيع خشبي كبير', 'Large Wooden Cutting Board',
      'لوح تقطيع خشبي من خشب الزان الطبيعي', 'Natural beechwood cutting board',
      55, 70, 50, ['bestseller'], 4.5, false, 'large-wooden-cutting-board'),
    product(preparationTools, 'NBD-PT-002', 'خلاط طعام متعدد السرعات', 'Multi-Speed Food Processor',
      'خلاط طعام كهربائي متعدد السرعات مع ملحقات متعددة', 'Multi-speed electric food processor with attachments',
      320, 380, 15, ['new'], 4.6, true, 'multi-speed-food-processor'),
    product(preparationTools, 'NBD-PT-003', 'هاون ومدقة رخام', 'Marble Mortar and Pestle',
      'هاون ومدقة رخامي للبهارات والأعشاب', 'Marble mortar and pestle for spices and herbs',
      65, null, 40, [], 4.4, false, 'marble-mortar-pestle'),
    product(preparationTools, 'NBD-PT-004', 'طقم سكاكين تقطيع 3 قطع', '3-Piece Paring Knife Set',
      'طقم سكاكين تقطيع ستانلس ستيل بتصميم مريح', 'Stainless steel paring knife set with ergonomic design',
      75, 90, 55, [], 4.3, false, 'paring-knife-set-3pc'),
    product(preparationTools, 'NBD-PT-005', 'مقشرة خضار متعددة الوظائف', 'Multi-Function Vegetable Peeler',
      'مقشرة خضار ستانلس ستيل بشفرة مزدوجة', 'Stainless steel vegetable peeler with dual blade',
      18, null, 95, [], 4.1, false, 'multi-function-vegetable-peeler'),
    product(preparationTools, 'NBD-PT-006', 'وعاء خلط زجاجي 3 لتر', 'Glass Mixing Bowl 3L',
      'وعاء خلط زجاجي بسعة 3 لتر مع غطاء', '3L glass mixing bowl with lid',
      40, 48, 60, [], 4.2, false, 'glass-mixing-bowl-3l'),
    product(preparationTools, 'NBD-PT-007', 'قطاعة خضار يدوية 5 شفرات', 'Manual Vegetable Slicer 5 Blades',
      'قطاعة خضار يدوية مع 5 شفرات قابلة للتبديل', 'Manual vegetable slicer with 5 interchangeable blades',
      68, 85, 35, ['sale'], 4.3, false, 'manual-vegetable-slicer-5blades'),
  ]

  // Food Storage products (6)
  const foodStorageProducts = [
    product(foodStorage, 'NBD-FS-001', 'طقم علب تخزين 5 قطع', '5-Piece Food Storage Container Set',
      'طقم علب تخزين الطعام محكمة الإغلاق 5 قطع', '5-piece airtight food storage container set',
      65, 80, 70, ['bestseller'], 4.5, false, 'food-storage-set-5pc'),
    product(foodStorage, 'NBD-FS-002', 'برطمانات زجاجية 3 قطع', '3-Piece Glass Jars',
      'برطمانات زجاجية محكمة الإغلاق لحفظ المكونات', 'Airtight glass jars for storing ingredients',
      42, null, 55, [], 4.3, false, 'glass-jars-3pc'),
    product(foodStorage, 'NBD-FS-003', 'صندوق غداء ستانلس ستيل 3 طبقات', '3-Tier Stainless Steel Lunch Box',
      'صندوق غداء ستانلس ستيل بثلاث طبقات', 'Three-tier stainless steel lunch box',
      95, 115, 30, ['new'], 4.6, true, '3tier-stainless-lunch-box'),
    product(foodStorage, 'NBD-FS-004', 'أكياس تفريز قابلة لإعادة الاستخدام', 'Reusable Freezer Bags Set',
      'طقم أكياس تفريز سيليكون قابلة لإعادة الاستخدام', 'Reusable silicone freezer bags set',
      35, 45, 80, [], 4.2, false, 'reusable-freezer-bags'),
    product(foodStorage, 'NBD-FS-005', 'علة أرز كبيرة 15 كجم', 'Large Rice Dispenser 15kg',
      'علة أرز بلاستيكية محكمة بسعة 15 كجم مع ميزان', 'Airtight plastic rice dispenser, 15kg capacity with measuring cup',
      125, 150, 25, [], 4.4, false, 'large-rice-dispenser-15kg'),
    product(foodStorage, 'NBD-FS-006', 'طقم علات توابل 6 قطع', '6-Piece Spice Container Set',
      'طقم علات توابل ستانلس ستيل مع حامل دوار', 'Stainless steel spice container set with rotating rack',
      85, 105, 40, ['sale'], 4.5, false, 'spice-container-set-6pc'),
  ]

  // ─── PHASE 2: Fashion & Footwear Products ─────────────────

  // Fashion Men products (6)
  const fashionMenProducts = [
    product(fashionMen, 'NBD-FM-001', 'ثوب ليبي فاخر', 'Premium Libyan Thobe',
      'ثوب ليبي فاخر مصنوع من أجود أنواع القماش بخياطة متقنة', 'Premium Libyan thobe made from finest fabric with expert tailoring',
      250, 300, 35, ['bestseller'], 4.8, true, 'fashion-men'),
    product(fashionMen, 'NBD-FM-002', 'بذلة رسمية', 'Formal Suit',
      'بذلة رسمية أنيقة بتصميم عصري وقماش إيطالي فاخر', 'Elegant formal suit with modern design and premium Italian fabric',
      650, 780, 20, [], 4.6, true, 'fashion-men'),
    product(fashionMen, 'NBD-FM-003', 'قميص كاجوال', 'Casual Shirt',
      'قميص كاجوال قطني مريح مناسب للاستخدام اليومي', 'Comfortable cotton casual shirt for daily wear',
      85, 100, 60, ['new'], 4.4, false, 'fashion-men'),
    product(fashionMen, 'NBD-FM-004', 'بنطلون جينز', 'Jeans Pants',
      'بنطلون جينز عالي الجودة بقصة مريحة وعصرية', 'High-quality jeans with comfortable modern fit',
      120, 150, 50, ['bestseller'], 4.5, false, 'fashion-men'),
    product(fashionMen, 'NBD-FM-005', 'جاكيت جلد', 'Leather Jacket',
      'جاكيت جلد طبيعي فاخر بتصميم كلاسيكي أنيق', 'Premium genuine leather jacket with classic elegant design',
      450, 550, 15, ['sale'], 4.7, true, 'fashion-men'),
    product(fashionMen, 'NBD-FM-006', 'طقم رياضي', 'Sportswear Set',
      'طقم رياضي مريح من القماش التقني الماص للعرق', 'Comfortable sportswear set made from moisture-wicking technical fabric',
      180, 220, 40, [], 4.3, false, 'fashion-men'),
  ]

  // Fashion Women products (6)
  const fashionWomenProducts = [
    product(fashionWomen, 'NBD-FW-001', 'عباية مطرزة', 'Embroidered Abaya',
      'عباية مطرزة يدوياً بخيوط ذهبية وتصميم شرقي فاخر', 'Hand-embroidered abaya with golden threads and premium oriental design',
      320, 400, 30, ['bestseller'], 4.9, true, 'fashion-women'),
    product(fashionWomen, 'NBD-FW-002', 'فستان سهرة', 'Evening Dress',
      'فستان سهرة أنيق بتطريز راقي وقماش فاخر', 'Elegant evening dress with refined embroidery and premium fabric',
      550, 650, 15, [], 4.7, true, 'fashion-women'),
    product(fashionWomen, 'NBD-FW-003', 'بلوزة شيفون', 'Chiffon Blouse',
      'بلوزة شيفون أنيقة بتصميم عصري وألوان متنوعة', 'Elegant chiffon blouse with modern design in various colors',
      75, 95, 55, ['new'], 4.4, false, 'fashion-women'),
    product(fashionWomen, 'NBD-FW-004', 'تنورة أنيقة', 'Elegant Skirt',
      'تنورة أنيقة بقصة عصرية مناسبة للعمل والسهرات', 'Elegant skirt with modern cut suitable for work and occasions',
      110, 135, 40, [], 4.3, false, 'fashion-women'),
    product(fashionWomen, 'NBD-FW-005', 'حجاب قطني', 'Cotton Hijab',
      'حجاب قطني ناعم فاخر بألوان متنوعة وملمس مريح', 'Premium soft cotton hijab in various colors with comfortable texture',
      25, 35, 100, ['bestseller'], 4.6, false, 'fashion-women'),
    product(fashionWomen, 'NBD-FW-006', 'طقم رسمي', 'Formal Set',
      'طقم رسمي نسائي متكامل بتصميم أنيق وراقي', 'Complete women\'s formal set with elegant and refined design',
      420, 500, 20, ['sale'], 4.5, true, 'fashion-women'),
  ]

  // Fashion Kids products (6)
  const fashionKidsProducts = [
    product(fashionKids, 'NBD-FK-001', 'فستان بناتي', 'Girls Dress',
      'فستان بناتي أنيق بألوان زاهية وتصميم عصري', 'Elegant girls dress with vibrant colors and modern design',
      65, 80, 45, ['bestseller'], 4.5, false, 'fashion-kids'),
    product(fashionKids, 'NBD-FK-002', 'طقم أولادي', 'Boys Outfit Set',
      'طقم أولادي متكامل بتصميم رياضي وألوان متنوعة', 'Complete boys outfit set with sporty design and various colors',
      55, 70, 50, [], 4.3, false, 'fashion-kids'),
    product(fashionKids, 'NBD-FK-003', 'بيجامة أطفال', 'Kids Pajamas',
      'بيجامة أطفال قطنية مريحة بتصاميم كرتونية محببة', 'Comfortable cotton kids pajamas with fun cartoon designs',
      35, 45, 70, [], 4.4, false, 'fashion-kids'),
    product(fashionKids, 'NBD-FK-004', 'جاكيت أطفال', 'Kids Jacket',
      'جاكيت أطفال دافئ بتصميم عصري مقاوم للرياح', 'Warm kids jacket with modern wind-resistant design',
      90, 110, 35, ['new'], 4.2, false, 'fashion-kids'),
    product(fashionKids, 'NBD-FK-005', 'حذاء رياضي أطفال', 'Kids Sports Shoes',
      'حذاء رياضي للأطفال خفيف الوزن ومريح للحركة', 'Lightweight and comfortable sports shoes for kids',
      75, 90, 40, [], 4.4, false, 'fashion-kids'),
    product(fashionKids, 'NBD-FK-006', 'فستان مواليد', 'Baby Dress',
      'فستان مواليد ناعم من القطن العضوي الآمن للبشرة الحساسة', 'Soft baby dress made from organic cotton safe for sensitive skin',
      45, null, 30, [], 4.6, true, 'fashion-kids'),
  ]

  // Footwear Men products (6)
  const footwearMenProducts = [
    product(footwearMen, 'NBD-FWM-001', 'حذاء جلد رسمي', 'Formal Leather Shoes',
      'حذاء جلد طبيعي رسمي بتصميم كلاسيكي أنيق', 'Formal genuine leather shoes with classic elegant design',
      280, 350, 25, ['bestseller'], 4.7, true, 'footwear-men'),
    product(footwearMen, 'NBD-FWM-002', 'حذاء رياضي', 'Sports Shoes',
      'حذاء رياضي مريح بنعل طبي ممتص للصدمات', 'Comfortable sports shoes with shock-absorbing orthopedic sole',
      180, 220, 40, ['new'], 4.5, true, 'footwear-men'),
    product(footwearMen, 'NBD-FWM-003', 'نعل صحراوي', 'Desert Sandals',
      'نعل صحراوي جلدي تقليدي متين ومريح', 'Durable and comfortable traditional leather desert sandals',
      65, 80, 60, [], 4.3, false, 'footwear-men'),
    product(footwearMen, 'NBD-FWM-004', 'حذاء كاجوال', 'Casual Shoes',
      'حذاء كاجوال أنيق مناسب للاستخدام اليومي والخروج', 'Elegant casual shoes suitable for daily wear and outings',
      150, 180, 35, [], 4.4, false, 'footwear-men'),
    product(footwearMen, 'NBD-FWM-005', 'جزمة شتوية', 'Winter Boots',
      'جزمة شتوية مبطنة بالفرو مقاومة للماء والبرودة', 'Fur-lined winter boots resistant to water and cold',
      220, 270, 20, ['sale'], 4.6, false, 'footwear-men'),
    product(footwearMen, 'NBD-FWM-006', 'حذاء عمل', 'Work Shoes',
      'حذاء عمل متين بنعل مضاد للانزلاق وحماية للقدم', 'Durable work shoes with anti-slip sole and foot protection',
      130, null, 30, [], 4.2, false, 'footwear-men'),
  ]

  // Footwear Women products (6)
  const footwearWomenProducts = [
    product(footwearWomen, 'NBD-FWW-001', 'حذاء كعب عالي', 'High Heel Shoes',
      'حذاء كعب عالي أنيق بتصميم عصري ونعل مريح', 'Elegant high heel shoes with modern design and comfortable sole',
      160, 200, 30, ['bestseller'], 4.5, true, 'footwear-women'),
    product(footwearWomen, 'NBD-FWW-002', 'صندال نسائي', 'Women Sandals',
      'صندال نسائي أنيق بتصميم مزخرف مناسب للصيف', 'Elegant women sandals with decorative design perfect for summer',
      75, 90, 50, [], 4.3, false, 'footwear-women'),
    product(footwearWomen, 'NBD-FWW-003', 'حذاء مسطح', 'Flat Shoes',
      'حذاء مسطح مريح بتصميم بسيط وأنيق للاستخدام اليومي', 'Comfortable flat shoes with simple elegant design for daily use',
      95, 120, 45, ['new'], 4.4, false, 'footwear-women'),
    product(footwearWomen, 'NBD-FWW-004', 'حذاء رياضي نسائي', 'Women Sports Shoes',
      'حذاء رياضي نسائي خفيف الوزن بتصميم عصري', 'Lightweight women sports shoes with modern design',
      140, 170, 35, [], 4.5, false, 'footwear-women'),
    product(footwearWomen, 'NBD-FWW-005', 'جزمة أنيقة', 'Elegant Boots',
      'جزمة نسائية أنيقة بتصميم عصري مبطنة للراحة', 'Elegant women boots with modern design and padded comfort',
      250, 300, 15, ['sale'], 4.6, true, 'footwear-women'),
    product(footwearWomen, 'NBD-FWW-006', 'شبشب منزلي', 'Home Slippers',
      'شبشب منزلي ناعم ومريح بفرش إسفنجي للراحة', 'Soft and comfortable home slippers with cushioned lining',
      30, null, 80, [], 4.1, false, 'footwear-women'),
  ]

  // Footwear Kids products (6)
  const footwearKidsProducts = [
    product(footwearKids, 'NBD-FWK-001', 'حذاء رياضي أولادي', 'Boys Sports Shoes',
      'حذاء رياضي للأولاد متين ومريح مناسب للمدرسة واللعب', 'Durable and comfortable boys sports shoes for school and play',
      85, 100, 40, ['bestseller'], 4.4, false, 'footwear-kids'),
    product(footwearKids, 'NBD-FWK-002', 'صندال بناتي', 'Girls Sandals',
      'صندال بناتي أنيق بتصميم زهرية محببة ومريح', 'Elegant girls sandals with lovely pink design and comfortable fit',
      55, 70, 50, [], 4.3, false, 'footwear-kids'),
    product(footwearKids, 'NBD-FWK-003', 'حذاء مدرسي', 'School Shoes',
      'حذاء مدرسي رسمي متين بتصميم كلاسيكي للبنات والأولاد', 'Durable formal school shoes with classic design for boys and girls',
      70, 85, 45, [], 4.5, false, 'footwear-kids'),
    product(footwearKids, 'NBD-FWK-004', 'جزمة أطفال', 'Kids Boots',
      'جزمة أطفال دافئة مبطنة بالفرو مقاومة للماء', 'Warm kids boots fur-lined and water-resistant',
      95, 115, 25, ['new'], 4.2, false, 'footwear-kids'),
    product(footwearKids, 'NBD-FWK-005', 'نعل بحر', 'Beach Sandals',
      'نعل بحر للأطفال مقاوم للماء بتصميم ملون وممتع', 'Water-resistant kids beach sandals with colorful fun design',
      25, null, 70, [], 4.0, false, 'footwear-kids'),
    product(footwearKids, 'NBD-FWK-006', 'حذاء مواليد', 'Baby Shoes',
      'حذاء مواليد ناعم من الجلد الطبيعي آمن ومريح', 'Soft baby shoes from genuine leather, safe and comfortable',
      35, 45, 35, [], 4.7, true, 'footwear-kids'),
  ]

  // Perfumes & Oud products (6)
  const perfumesOudProducts = [
    product(perfumesOud, 'NBD-PO-001', 'عود كمبودي فاخر', 'Premium Cambodian Oud',
      'عود كمبودي فاخر طبيعي برائحة عميقة ودافئة', 'Premium natural Cambodian oud with deep warm fragrance',
      450, 550, 20, ['bestseller'], 4.9, true, 'perfumes-oud'),
    product(perfumesOud, 'NBD-PO-002', 'بخور عود هندي', 'Indian Oud Incense',
      'بخور عود هندي أصيل بعبق شرقي فريد ومميز', 'Authentic Indian oud incense with unique oriental fragrance',
      120, 150, 40, [], 4.6, false, 'perfumes-oud'),
    product(perfumesOud, 'NBD-PO-003', 'عطر رجالي فاخر', 'Premium Men Perfume',
      'عطر رجالي فاخر بمزيج أخشاب العود والعنبر', 'Premium men perfume with oud and amber blend',
      180, 220, 35, ['new'], 4.7, true, 'perfumes-oud'),
    product(perfumesOud, 'NBD-PO-004', 'عطر نسائي', 'Women Perfume',
      'عطر نسائي أنيق بمزيج الزهور والفانيليا الشرقي', 'Elegant women perfume with oriental flowers and vanilla blend',
      160, 200, 30, [], 4.5, false, 'perfumes-oud'),
    product(perfumesOud, 'NBD-PO-005', 'دهن العود', 'Oud Oil',
      'دهن عود طبيعي مركز برائحة فاخرة ومميزة', 'Concentrated natural oud oil with premium distinctive fragrance',
      350, 420, 15, ['sale'], 4.8, true, 'perfumes-oud'),
    product(perfumesOud, 'NBD-PO-006', 'مسك أبيض', 'White Musk',
      'مسك أبيض طبيعي نقي برائحة ناعمة ودافئة', 'Pure natural white musk with soft warm fragrance',
      85, null, 50, [], 4.4, false, 'perfumes-oud'),
  ]

  // Accessories products (6)
  const accessoriesProducts = [
    product(accessoriesCat, 'NBD-ACC-001', 'ساعة يد رجالية', "Men's Wristwatch",
      'ساعة يد رجالية فاخرة بتصميم كلاسيكي وإطار ستانلس ستيل', 'Premium men wristwatch with classic design and stainless steel frame',
      350, 420, 20, ['bestseller'], 4.7, true, 'accessories'),
    product(accessoriesCat, 'NBD-ACC-002', 'سوار ذهب', 'Gold Bracelet',
      'سوار ذهب عيار 18 بتصميم شرقي أنيق ومتين', '18K gold bracelet with elegant oriental design',
      1200, 1400, 10, [], 4.9, true, 'accessories'),
    product(accessoriesCat, 'NBD-ACC-003', 'نظارة شمسية', 'Sunglasses',
      'نظارة شمسية بتصميم عصري بعدسات مستقطبة للحماية من الشمس', 'Modern sunglasses with polarized lenses for sun protection',
      85, 110, 45, ['new'], 4.3, false, 'accessories'),
    product(accessoriesCat, 'NBD-ACC-004', 'حزام جلد', 'Leather Belt',
      'حزام جلد طبيعي بتصميم كلاسيكي وإبزيم ستانلس ستيل', 'Genuine leather belt with classic design and stainless steel buckle',
      65, 80, 55, [], 4.4, false, 'accessories'),
    product(accessoriesCat, 'NBD-ACC-005', 'عقد لؤلؤ', 'Pearl Necklace',
      'عقد لؤلؤ طبيعي بتصميم أنيق وفاخر للمناسبات', 'Natural pearl necklace with elegant premium design for occasions',
      450, 550, 12, ['sale'], 4.8, false, 'accessories'),
    product(accessoriesCat, 'NBD-ACC-006', 'خاتم فضة', 'Silver Ring',
      'خاتم فضة استرليني بتصميم شرقي مزخرف يدوي الصنع', 'Sterling silver ring with handcrafted ornate oriental design',
      120, 150, 30, [], 4.5, false, 'accessories'),
  ]

  // ─── PHASE 3: Home, Baby & Electronics Products ───────────

  // Mother & Baby products (6)
  const motherBabyProducts = [
    product(motherBaby, 'NBD-MB-001', 'حليب أطفال', 'Baby Formula',
      'حليب أطفال مرحلة أولى مدعم بالفيتامينات والمعادن الأساسية', 'Stage 1 baby formula enriched with essential vitamins and minerals',
      55, 65, 80, ['bestseller'], 4.6, false, 'mother-baby'),
    product(motherBaby, 'NBD-MB-002', 'حفاضات أطفال', 'Baby Diapers',
      'حفاضات أطفال فائقة الامتصاص بطبقة ناعمة للبشرة الحساسة', 'Super absorbent baby diapers with soft layer for sensitive skin',
      35, 42, 100, [], 4.5, false, 'mother-baby'),
    product(motherBaby, 'NBD-MB-003', 'عربة أطفال', 'Baby Stroller',
      'عربة أطفال خفيفة الوزن قابلة للطي بتصميم آمن ومريح', 'Lightweight foldable baby stroller with safe comfortable design',
      450, 550, 15, ['new'], 4.7, true, 'mother-baby'),
    product(motherBaby, 'NBD-MB-004', 'كرسي سيارة أطفال', 'Baby Car Seat',
      'كرسي سيارة أطفال آمن متوافق مع معايير السلامة الأوروبية', 'Safe baby car seat compliant with European safety standards',
      320, 380, 12, [], 4.8, true, 'mother-baby'),
    product(motherBaby, 'NBD-MB-005', 'ملابس مواليد', 'Newborn Clothes Set',
      'طقم ملابس مواليد قطنية ناعمة بتصاميم ملونة ومريحة', 'Soft cotton newborn clothes set with colorful comfortable designs',
      45, 55, 50, [], 4.3, false, 'mother-baby'),
    product(motherBaby, 'NBD-MB-006', 'رضاعة أطفال', 'Baby Bottle',
      'رضاعة أطفال مضادة للمغص بتصميم يحاكي الرضاعة الطبيعية', 'Anti-colic baby bottle with design mimicking natural breastfeeding',
      18, 22, 90, ['sale'], 4.4, false, 'mother-baby'),
  ]

  // Home Care products (6)
  const homeCareProducts = [
    product(homeCare, 'NBD-HC-001', 'منظف أرضيات', 'Floor Cleaner',
      'منظف أرضيات فعال بعبعطر منعش وصيغة مضادة للبكتيريا', 'Effective floor cleaner with fresh scent and antibacterial formula',
      12, null, 120, ['bestseller'], 4.2, false, 'home-care'),
    product(homeCare, 'NBD-HC-002', 'غسيل ملابس', 'Laundry Detergent',
      'مسحوق غسيل ملابس مركز فعال في إزالة البقع العنيدة', 'Concentrated laundry detergent effective on stubborn stains',
      18, 22, 100, [], 4.4, false, 'home-care'),
    product(homeCare, 'NBD-HC-003', 'صابون أطباق', 'Dish Soap',
      'صابون أطباق سائل لطيف على اليدين وقوي على الدهون', 'Liquid dish soap gentle on hands and tough on grease',
      8, null, 150, [], 4.1, false, 'home-care'),
    product(homeCare, 'NBD-HC-004', 'معطر جو', 'Air Freshener',
      'معطر جو برائحة طبيعية منعشة تدوم طويلاً', 'Air freshener with natural refreshing long-lasting fragrance',
      15, 18, 80, ['new'], 4.3, false, 'home-care'),
    product(homeCare, 'NBD-HC-005', 'ملمع أثاث', 'Furniture Polish',
      'ملمع أثاث بتركيبة حماية مزدوجة تمنح لمعاناً وحماية', 'Furniture polish with dual protection formula for shine and protection',
      14, null, 65, [], 4.0, false, 'home-care'),
    product(homeCare, 'NBD-HC-006', 'مطهر عام', 'General Disinfectant',
      'مطهر عام قوي يقتل 99.9% من الجراثيم والبكتيريا', 'Strong general disinfectant killing 99.9% of germs and bacteria',
      10, null, 110, ['sale'], 4.2, false, 'home-care'),
  ]

  // Electrical Appliances products (6)
  const electricalAppliancesProducts = [
    product(electricalAppliances, 'NBD-EA-001', 'خلاط كهربائي', 'Electric Blender',
      'خلاط كهربائي متعدد السرعات بوعاء زجاجي مقاوم للحرارة', 'Multi-speed electric blender with heat-resistant glass jar',
      120, 150, 35, ['bestseller'], 4.5, true, 'electrical-appliances'),
    product(electricalAppliances, 'NBD-EA-002', 'ماكينة قهوة', 'Coffee Machine',
      'ماكينة قهوة أوتوماتيكية بضغط 15 بار لتحضير إسبريسو مثالي', 'Automatic coffee machine with 15 bar pressure for perfect espresso',
      350, 420, 20, ['new'], 4.7, true, 'electrical-appliances'),
    product(electricalAppliances, 'NBD-EA-003', 'مكنسة كهربائية', 'Vacuum Cleaner',
      'مكنسة كهربائية قوية الشفط بفلتر HEPA لأنظف نتائج', 'Powerful vacuum cleaner with HEPA filter for cleanest results',
      280, 340, 15, [], 4.4, false, 'electrical-appliances'),
    product(electricalAppliances, 'NBD-EA-004', 'مكواة بخار', 'Steam Iron',
      'مكواة بخار بقوة تبخير عالية وبخزان ماء كبير', 'Steam iron with high steam power and large water tank',
      85, 100, 40, [], 4.3, false, 'electrical-appliances'),
    product(electricalAppliances, 'NBD-EA-005', 'سخان مياه', 'Water Heater',
      'سخان مياه كهربائي بسعة 50 لتر مع عزل حراري فعال', 'Electric water heater 50L capacity with effective thermal insulation',
      320, 380, 10, ['sale'], 4.5, false, 'electrical-appliances'),
    product(electricalAppliances, 'NBD-EA-006', 'مروحة كهربائية', 'Electric Fan',
      'مروحة كهربائية ذات ريش كبيرة بسرعات متعددة وميلان قابل للتعديل', 'Large blade electric fan with multiple speeds and adjustable tilt',
      65, 80, 50, [], 4.2, false, 'electrical-appliances'),
  ]

  // Electronics products (6)
  const electronicsProducts = [
    product(electronics, 'NBD-EL-001', 'هاتف ذكي', 'Smartphone',
      'هاتف ذكي بشاشة AMOLED وكاميرا عالية الدقة وبطارية طويلة الأمد', 'Smartphone with AMOLED display, high-res camera, and long-lasting battery',
      850, 1000, 25, ['bestseller'], 4.6, true, 'electronics'),
    product(electronics, 'NBD-EL-002', 'سماعات بلوتوث', 'Bluetooth Headphones',
      'سماعات بلوتوث لاسلكية بجودة صوت استثنائية وعزل للضوضاء', 'Wireless Bluetooth headphones with exceptional sound quality and noise cancellation',
      180, 220, 40, ['new'], 4.5, true, 'electronics'),
    product(electronics, 'NBD-EL-003', 'تابلت', 'Tablet',
      'تابلت بشاشة عالية الدقة ومعالج قوي للاستخدام المتعدد', 'Tablet with high-res display and powerful processor for versatile use',
      550, 650, 20, [], 4.4, false, 'electronics'),
    product(electronics, 'NBD-EL-004', 'شاحن سريع', 'Fast Charger',
      'شاحن سريع بقوة 65 واط متوافق مع جميع الأجهزة الذكية', '65W fast charger compatible with all smart devices',
      35, 45, 80, ['bestseller'], 4.3, false, 'electronics'),
    product(electronics, 'NBD-EL-005', 'ساعة ذكية', 'Smartwatch',
      'ساعة ذكية متطورة بشاشة لمس ومراقبة صحية شاملة', 'Advanced smartwatch with touch screen and comprehensive health monitoring',
      280, 340, 30, ['sale'], 4.5, false, 'electronics'),
    product(electronics, 'NBD-EL-006', 'كاميرا', 'Camera',
      'كاميرا رقمية بعدسة عالية الدقة وتسجيل فيديو 4K', 'Digital camera with high-res lens and 4K video recording',
      1200, 1400, 8, [], 4.7, true, 'electronics'),
  ]

  // ─── PHASE 4: Toys, Pets & Plants Products ────────────────

  // Children's Toys products (6)
  const childrenToysProducts = [
    product(childrenToys, 'NBD-CT-001', 'مجموعة مكعبات بناء ملونة 100 قطعة', 'Colorful Building Blocks Set 100 Pieces',
      'مجموعة مكعبات بناء ملونة 100 قطعة لتعزيز مهارات الطفل الإبداعية والتفكير المنطقي، مناسبة من سن 3 سنوات', 'Colorful 100-piece building blocks set to enhance creative skills and logical thinking, suitable for ages 3+',
      45, 60, 50, ['bestseller'], 4.7, true, 'children-toys-2'),
    product(childrenToys, 'NBD-CT-002', 'دبدوب بلاش ناعم كبير', 'Large Soft Plush Teddy Bear',
      'دبدوب بلاش ناعم وفروي مصنوع من قطن عالي الجودة، آمن للأطفال، مقاس 60 سم', 'Soft and furry plush teddy bear made from high-quality cotton, child-safe, 60cm size',
      65, 85, 35, ['new'], 4.8, true, 'children-toys-3'),
    product(childrenToys, 'NBD-CT-003', 'سيارة سباق ريموت كنترول', 'Remote Control Racing Car',
      'سيارة سباق ريموت كنترول بتصميم رياضي، مقياس 1:16، مع جهاز تحكم عن بعد، بطارية قابلة للشحن', 'Remote control racing car with sporty design, 1:16 scale, with remote and rechargeable battery',
      120, 150, 25, ['sale'], 4.5, false, 'children-toys-4'),
    product(childrenToys, 'NBD-CT-004', 'بازل 500 قطعة مناظر طبيعية', '500-Piece Landscape Puzzle',
      'بازل 500 قطعة بصور مناظر طبيعية خلابة لتطوير التركيز والصبر عند الأطفال والكبار', '500-piece landscape puzzle to develop focus and patience for kids and adults',
      38, 48, 60, [], 4.3, false, 'puzzle-500pc'),
    product(childrenToys, 'NBD-CT-005', 'طائرة درون صغيرة', 'Mini Drone',
      'طائرة درون صغيرة مع كاميرا HD وتحكم عن بعد، مثالية للمبتدئين', 'Mini drone with HD camera and remote control, ideal for beginners',
      180, 220, 15, ['new'], 4.4, true, 'mini-drone'),
    product(childrenToys, 'NBD-CT-006', 'مجموعة حيوانات محشية', 'Stuffed Animals Collection',
      'مجموعة من 6 حيوانات محشية ناعمة بأشكال مختلفة، آمنة للأطفال من سن سنة', 'Set of 6 soft stuffed animals in various shapes, safe for children ages 1+',
      55, 70, 40, [], 4.6, false, 'stuffed-animals'),
  ]

  // Pet Supplies products (6)
  const petSuppliesProducts = [
    product(petSupplies, 'NBD-PS-001', 'طعام قطط جاف بريميوم 2 كجم', 'Premium Dry Cat Food 2kg',
      'طعام قطط جاف بريميوم متوازن غذائياً غني بالبروتين والفيتامينات لصحة قطتك، وزن 2 كجم', 'Premium nutritionally balanced dry cat food rich in protein and vitamins, 2kg',
      55, 68, 80, ['bestseller'], 4.6, true, 'pet-supplies-2'),
    product(petSupplies, 'NBD-PS-002', 'سرير حيوانات أليف ناعم دائري', 'Soft Round Pet Bed',
      'سرير حيوانات أليف ناعم ودافئ بتصميم دائري مريح، مناسب للقطط والكلاب الصغيرة، لون رمادي', 'Soft and warm round pet bed with comfortable design, suitable for cats and small dogs, grey color',
      85, 110, 40, ['new'], 4.4, false, 'pet-supplies-3'),
    product(petSupplies, 'NBD-PS-003', 'حوض أسماك زجاج مع إضاءة LED وفلاتر', 'Glass Aquarium Tank with LED and Filter',
      'حوض أسماك زجاج 30 لتر مع إضاءة LED وفلاتر مدمجة وحصى زخرفي، مجموعة كاملة', '30-liter glass aquarium with LED lighting, built-in filter, and decorative gravel, complete set',
      180, 220, 15, [], 4.3, true, 'pet-supplies-4'),
    product(petSupplies, 'NBD-PS-004', 'طعام كلاب جاف 3 كجم', 'Premium Dry Dog Food 3kg',
      'طعام كلاب جاف بريميوم بحبوب لحم الدجاج والأرز، متوازن غذائياً، وزن 3 كجم', 'Premium dry dog food with chicken and rice, nutritionally balanced, 3kg',
      65, 80, 70, ['bestseller'], 4.5, false, 'pet-care'),
    product(petSupplies, 'NBD-PS-005', 'ألعاب تفاعلية للقطط', 'Interactive Cat Toys Set',
      'مجموعة ألعاب تفاعلية للقطط تشمل صيد الريش وكرة الليزر ونفق القطة', 'Interactive cat toy set including feather chase, laser ball, and cat tunnel',
      35, 45, 55, [], 4.2, false, 'pet-care-2'),
    product(petSupplies, 'NBD-PS-006', 'شامبو وعناية للحيوانات الأليفة', 'Pet Shampoo and Care Set',
      'طقم عناية للحيوانات الأليفة يشمل شامبو وفرشاة ومشط، مناسب للقطط والكلاب', 'Pet care set including shampoo, brush, and comb, suitable for cats and dogs',
      28, null, 90, ['sale'], 4.1, false, 'pet-care-3'),
  ]

  // Ornamental Plants products (6)
  const ornamentalPlantsProducts = [
    product(ornamentalPlants, 'NBD-OP-001', 'نبتة مونستيرا داخلية في أصيص سيراميك', 'Indoor Monstera Plant in Ceramic Pot',
      'نبتة مونستيرا ديليسيوسا الاستوائية في أصيص سيراميك أبيض أنيق، سهلة العناية، تنقي الهواء', 'Tropical Monstera Deliciosa in elegant white ceramic pot, easy care, air purifying',
      75, 95, 20, ['bestseller'], 4.8, true, 'ornamental-plants-2'),
    product(ornamentalPlants, 'NBD-OP-002', 'مجموعة نباتات صبار وأشكال نضرة ملونة', 'Colorful Succulents and Cactus Set',
      'مجموعة من 4 نباتات صبار وأشكال نضرة ملونة في أصص سيراميك صغيرة، مثالية للديكور', 'Set of 4 colorful succulents and cactus in small ceramic pots, perfect for decor',
      35, 45, 45, ['new'], 4.6, false, 'ornamental-plants-3'),
    product(ornamentalPlants, 'NBD-OP-003', 'نبتة بوتوس معلقة في أصيص ماكrame', 'Hanging Pothos Plant in Macrame Planter',
      'نبتة بوتوس معلقة في أصيص ماكrame يدوي الصنع، نبتة متسلبة جميلة تنقي الهواء', 'Hanging Pothos in handcrafted macrame planter, beautiful climbing air-purifying plant',
      55, 70, 30, [], 4.5, true, 'ornamental-plants-4'),
    product(ornamentalPlants, 'NBD-OP-004', 'نبتة الثعبان (سانسيفيريا)', 'Snake Plant (Sansevieria)',
      'نبتة الثعبان المعمرة في أصيص حجري أنيق، مقاومة للإهمال، تنقي الهواء بشكل فعال', 'Hardy Snake Plant in elegant stone pot, neglect-resistant, effective air purifier',
      45, 55, 35, ['bestseller'], 4.7, false, 'snake-plant'),
    product(ornamentalPlants, 'NBD-OP-005', 'نبتة فيكوس ديكورا', 'Ficus Decora Plant',
      'نبتة فيكوس ديكورا بأوراقها الكبيرة اللامعة في أصيص سيراميك أبيض، رائعة للديكور الداخلي', 'Ficus Decora with large glossy leaves in white ceramic pot, great for interior decor',
      90, 110, 15, ['sale'], 4.4, false, 'ficus-decora'),
    product(ornamentalPlants, 'NBD-OP-006', 'وردة حمراء في أصيص زخرفي', 'Red Rose Plant in Decorative Pot',
      'نبتة وردة حمراء في أصيص زخرفي ملون، هدية مثالية ومظهر ساحر للمنزل', 'Red rose plant in colorful decorative pot, perfect gift and charming home appearance',
      60, 75, 25, [], 4.9, true, 'red-rose-plant'),
  ]

  // Gifts & Antiques products (6)
  const giftsAntiquesProducts = [
    product(giftsAntiques, 'NBD-GA-001', 'صينية نحاسية مزخرفة يدوياً', 'Handcrafted Brass Tray',
      'صينية نحاسية مزخرفة بنقوش شرقية أصيلة مصنوعة يدوياً بإتقان', 'Handcrafted brass tray with authentic oriental patterns meticulously engraved',
      180, 220, 20, ['bestseller'], 4.8, true, 'gifts-antiques'),
    product(giftsAntiques, 'NBD-GA-002', 'طقم بخور عود فاخر مع مبخرة', 'Premium Oud Incense Set with Burner',
      'طقم بخور عود فاخر مع مبخرة نحاسية مزخرفة هدية مثالية', 'Premium oud incense set with ornate brass burner, perfect gift',
      120, 150, 35, ['new'], 4.7, true, 'gifts-antiques-2'),
    product(giftsAntiques, 'NBD-GA-003', 'مجسم حصان عربي برونزي', 'Bronze Arabian Horse Sculpture',
      'مجسم حصان عربي أصيل من البرونز المطلي بالذهب، قطعة ديكور فاخرة', 'Authentic Arabian horse sculpture in gold-plated bronze, luxury decor piece',
      350, 420, 10, [], 4.9, false, 'gifts-antiques-3'),
    product(giftsAntiques, 'NBD-GA-004', 'علبة هدايا فاخرة بالعطر والبخور', 'Luxury Gift Box with Perfume and Incense',
      'علبة هدايا فاخرة تحتوي على عطر شرقي وبخور عود ومبخرة صغيرة', 'Luxury gift box containing oriental perfume, oud incense, and small burner',
      95, 120, 45, ['bestseller'], 4.6, false, 'gift-perfume-set'),
    product(giftsAntiques, 'NBD-GA-005', 'إبريق شاي نحاسي تقليدي مع فناجين', 'Traditional Brass Teapot Set with Cups',
      'إبريق شاي نحاسي تقليدي مع 6 فناجين بتصميم شرقي أنيق', 'Traditional brass teapot with 6 cups in elegant oriental design',
      220, 270, 15, ['sale'], 4.5, true, 'gifts-antiques-2'),
    product(giftsAntiques, 'NBD-GA-006', 'صحن كريستال مزخرف بالذهب', 'Gold-Trimmed Crystal Decorative Plate',
      'صحن كريستال فاخر مزخرف بلمسات ذهبية للديكور والضيافة', 'Luxury crystal plate with gold trim for decor and hospitality',
      150, 185, 18, [], 4.4, false, 'gifts-antiques-3'),
  ]

  // Wall Art & Decor products (6)
  const wallArtProducts = [
    product(wallArt, 'NBD-WA-001', 'لوحة جدارية خط عربي يدوي', 'Handwritten Arabic Calligraphy Wall Art',
      'لوحة جدارية بخط عربي أصيل مرسومة يدوياً على قماش كانفاس عالي الجودة', 'Authentic handwritten Arabic calligraphy on high-quality canvas',
      120, 150, 25, ['bestseller'], 4.8, true, 'wall-art'),
    product(wallArt, 'NBD-WA-002', 'لوحة زيتية مناظر طبيعية', 'Oil Painting Landscape',
      'لوحة زيتية رائعة لمناظر طبيعية خلابة مرسومة يدوياً بإطار خشبي فاخر', 'Stunning hand-painted oil landscape in premium wooden frame',
      280, 340, 12, ['new'], 4.7, true, 'wall-art-2'),
    product(wallArt, 'NBD-WA-003', 'مجموعة لوحات جدارية حديثة 3 قطع', 'Modern 3-Piece Wall Art Set',
      'مجموعة من 3 لوحات جدارية بتصميم عصري تجريدي بألوان هادئة', 'Set of 3 modern abstract wall art pieces in calming colors',
      180, 220, 20, [], 4.5, false, 'wall-art-3'),
    product(wallArt, 'NBD-WA-004', 'ساعة حائط خشبية بتصميم عربي', 'Arabic Design Wooden Wall Clock',
      'ساعة حائط خشبية بتصميم عربي تقليدي مع أرقام عربية وأطراف مزخرفة', 'Wooden wall clock with traditional Arabic design and ornate edges',
      95, 120, 30, ['bestseller'], 4.6, false, 'wall-art-4'),
    product(wallArt, 'NBD-WA-005', 'مرآة جدارية مزخرفة بإطار ذهبي', 'Ornate Wall Mirror with Gold Frame',
      'مرآة جدارية أنيقة بإطار ذهبي مزخرف بنقوش شرقية فاخرة', 'Elegant wall mirror with ornate gold frame featuring luxurious oriental patterns',
      160, 195, 15, ['sale'], 4.4, true, 'wall-art-5'),
    product(wallArt, 'NBD-WA-006', 'لوحة ميتال آرت مع إضاءة LED', 'Metal Art Panel with LED Lighting',
      'لوحة معدنية فنية بتصميم هندسي مع إضاءة LED خلفية لتأثير مذهل', 'Artistic metal panel with geometric design and backlit LED for stunning effect',
      220, 270, 10, [], 4.3, false, 'wall-art-6'),
  ]

  const allProducts = [
    ...cookwareProducts,
    ...kitchenToolsProducts,
    ...servingWareProducts,
    ...cupsPitchersProducts,
    ...preparationToolsProducts,
    ...foodStorageProducts,
    ...fashionMenProducts,
    ...fashionWomenProducts,
    ...fashionKidsProducts,
    ...footwearMenProducts,
    ...footwearWomenProducts,
    ...footwearKidsProducts,
    ...perfumesOudProducts,
    ...accessoriesProducts,
    ...motherBabyProducts,
    ...homeCareProducts,
    ...electricalAppliancesProducts,
    ...electronicsProducts,
    ...childrenToysProducts,
    ...petSuppliesProducts,
    ...ornamentalPlantsProducts,
    ...giftsAntiquesProducts,
    ...wallArtProducts,
  ]

  const createdProducts = []
  for (const p of allProducts) {
    const created = await db.product.create({ data: p })
    createdProducts.push(created)
  }

  console.log(`✅ ${createdProducts.length} products created`)

  // ─── Admin User ─────────────────────────────────────────────
  console.log('👤 Creating admin user...')

  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD
  if (!seedAdminPassword || seedAdminPassword.length < 16) {
    throw new Error('SEED_ADMIN_PASSWORD must be provided and at least 16 characters long')
  }
  const adminHash = await bcrypt.hash(seedAdminPassword, 12)
  const admin = await db.user.create({
    data: {
      phone: '+218910000000',
      name: 'مدير النظام',
      role: 'admin',
      language: 'ar',
      isActive: true,
      loyaltyTier: 'platinum',
      loyaltyPoints: 0,
      walletBalance: 0,
      passwordHash: adminHash,
    },
  })

  console.log('✅ Admin user created:', admin.phone)

  // ─── Feature Flags ──────────────────────────────────────────
  console.log('🚩 Creating feature flags...')

  const featureFlags = [
    { key: 'ENABLE_MOAMALAT', value: false, description: 'Enable Moamalat payment gateway integration' },
    { key: 'ENABLE_COD', value: true, description: 'Enable Cash on Delivery payment option' },
    { key: 'ENABLE_MULTI_VENDOR', value: false, description: 'Enable multi-vendor marketplace mode' },
    { key: 'ENABLE_ELASTICSEARCH', value: false, description: 'Enable Elasticsearch for product search' },
    { key: 'ENABLE_FASHION_CATEGORIES', value: true, description: 'Enable fashion product categories' },
    { key: 'ENABLE_KILL_SWITCHES', value: true, description: 'Enable kill switches for emergency feature disabling' },
    { key: 'ENABLE_SYSTEM_MODES', value: true, description: 'Enable system modes (maintenance, readonly, etc.)' },
    { key: 'ENABLE_ADVANCED_FRAUD', value: false, description: 'Enable advanced fraud detection system' },
    { key: 'ENABLE_A_B_TESTING', value: false, description: 'Enable A/B testing framework' },
    { key: 'ENABLE_COUPONS', value: true, description: 'Enable coupon/discount code system' },
    { key: 'ENABLE_REVIEWS', value: false, description: 'Enable product reviews and ratings' },
    { key: 'ENABLE_SIZE_GUIDES', value: false, description: 'Enable size guide for fashion products' },
    { key: 'ENABLE_PRODUCT_BADGES', value: true, description: 'Enable product badges (new, sale, bestseller)' },
    { key: 'ENABLE_WHATSAPP_NOTIFICATIONS', value: false, description: 'Enable WhatsApp notification channel' },
    { key: 'KILL_DISABLE_CHECKOUT', value: false, description: 'EMERGENCY: Disable all new checkouts' },
    { key: 'KILL_DISABLE_PAYMENTS', value: false, description: 'EMERGENCY: Disable payment processing' },
    { key: 'KILL_DISABLE_DELIVERY', value: false, description: 'EMERGENCY: Disable delivery scheduling' },
    { key: 'KILL_DISABLE_REGISTRATION', value: false, description: 'EMERGENCY: Disable new user registration' },
    { key: 'KILL_READONLY_MODE', value: false, description: 'EMERGENCY: Set system to read-only mode' },
    { key: 'ENABLE_ELECTRONICS_CATEGORIES', value: false, description: 'Enable electronics product categories' },
    { key: 'ENABLE_DYNAMIC_CATALOG', value: true, description: 'Enable dynamic catalog expansion with phase-based category activation' },
  ]

  for (const flag of featureFlags) {
    await db.featureFlag.create({ data: flag })
  }

  console.log(`✅ ${featureFlags.length} feature flags created`)

  // ─── Notifications ──────────────────────────────────────────
  console.log('🔔 Creating notifications...')

  const notifications = [
    {
      userId: null,
      titleAr: 'مرحباً بكم في نبض المدينة',
      titleEn: 'Welcome to Nabd Al-Madina',
      bodyAr: 'مرحباً بكم في متجر نبض المدينة الإلكتروني! اكتشفوا مجموعتنا المميزة من أدوات المطبخ عالية الجودة بأسعار تنافسية.',
      bodyEn: 'Welcome to Nabd Al-Madina online store! Discover our premium collection of high-quality kitchenware at competitive prices.',
      type: 'info',
    },
    {
      userId: null,
      titleAr: 'إطلاق كتالوج أدوات المطبخ',
      titleEn: 'Kitchenware Catalog Launch',
      bodyAr: 'تم إطلاق كتالوج أدوات المطبخ الجديد! تصفحوا أواني الطبخ وأدوات التحضير وأدوات التقديم بأفضل الأسعار.',
      bodyEn: 'The new kitchenware catalog is now live! Browse cookware, preparation tools, and serving ware at the best prices.',
      type: 'promo',
    },
    {
      userId: null,
      titleAr: 'توصيل مجاني للطلبات فوق 150 دينار',
      titleEn: 'Free Delivery on Orders Over 150 LYD',
      bodyAr: 'استمتعوا بالتوصيل المجاني على جميع الطلبات التي تتجاوز 150 دينار ليبي! العرض ساري لفترة محدودة.',
      bodyEn: 'Enjoy free delivery on all orders over 150 LYD! Limited time offer.',
      type: 'promo',
    },
    {
      userId: null,
      titleAr: 'عروض خاصة على طقم أواني الطبخ',
      titleEn: 'Special Offers on Cookware Sets',
      bodyAr: 'لا تفوتوا عروضنا الخاصة على طقم أواني الطبخ 7 قطع بسعر حصري! وفر أكثر من 70 دينار.',
      bodyEn: "Don't miss our special offers on the 7-piece cookware set at an exclusive price! Save over 70 LYD.",
      type: 'promo',
    },
  ]

  for (const notification of notifications) {
    await db.notification.create({ data: notification })
  }

  console.log(`✅ ${notifications.length} notifications created`)

  // ─── Coupons ───────────────────────────────────────────────
  console.log('🎟️ Creating coupons...')

  const coupons = [
    {
      code: 'WELCOME10',
      descriptionAr: 'خصم ترحيبي 10% على أول طلب',
      descriptionEn: '10% welcome discount on your first order',
      type: 'percentage',
      value: 10,
      minOrder: 50,
      maxDiscount: 50,
      usageLimit: 1000,
      usageCount: 0,
      perUserLimit: 1,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isActive: true,
    },
    {
      code: 'KITCHEN25',
      descriptionAr: 'خصم 25 دينار على الطلبات فوق 100 دينار',
      descriptionEn: '25 LYD off orders above 100 LYD',
      type: 'fixed',
      value: 25,
      minOrder: 100,
      maxDiscount: null,
      usageLimit: 500,
      usageCount: 0,
      perUserLimit: 2,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      isActive: true,
    },
    {
      code: 'FREEDELIVERY',
      descriptionAr: 'توصيل مجاني بدون حد أدنى',
      descriptionEn: 'Free delivery with no minimum order',
      type: 'fixed',
      value: 10,
      minOrder: 0,
      maxDiscount: null,
      usageLimit: 2000,
      usageCount: 0,
      perUserLimit: 3,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    },
  ]

  for (const coupon of coupons) {
    await db.coupon.create({ data: coupon })
  }

  console.log(`✅ ${coupons.length} coupons created`)

  // ─── Delivery Zones ─────────────────────────────────────────
  console.log('🚚 Creating delivery zones...')

  const deliveryZones = [
    { nameAr: 'طرابلس المركز', nameEn: 'Tripoli Central', city: 'طرابلس', area: 'المركز', fee: 8, freeAbove: 80, estimatedDays: 2, isActive: true },
    { nameAr: 'طرابلس الضواحي', nameEn: 'Tripoli Suburbs', city: 'طرابلس', area: 'الضواحي', fee: 12, freeAbove: 120, estimatedDays: 3, isActive: true },
    { nameAr: 'بنغازي', nameEn: 'Benghazi', city: 'بنغازي', fee: 15, freeAbove: 150, estimatedDays: 4, isActive: true },
    { nameAr: 'مصراتة', nameEn: 'Misrata', city: 'مصراتة', fee: 15, freeAbove: 150, estimatedDays: 4, isActive: true },
    { nameAr: 'سبها', nameEn: 'Sabha', city: 'سبها', fee: 20, freeAbove: 200, estimatedDays: 7, isActive: true },
    { nameAr: 'باقي المدن', nameEn: 'Other Cities', city: 'أخرى', fee: 18, freeAbove: 180, estimatedDays: 5, isActive: true },
  ]

  for (const zone of deliveryZones) {
    await db.deliveryZone.create({ data: zone })
  }

  console.log(`✅ ${deliveryZones.length} delivery zones created`)

  // ─── Ledger Accounts ─────────────────────────────────────────
  console.log('📊 Creating ledger accounts...')

  const ledgerAccounts = [
    { code: '1000', nameAr: 'النقد', nameEn: 'Cash', type: 'asset', category: 'current_asset', balance: 0 },
    { code: '1100', nameAr: 'حساب البنك', nameEn: 'Bank Account', type: 'asset', category: 'current_asset', balance: 0 },
    { code: '1200', nameAr: 'حسابات المدينين', nameEn: 'Accounts Receivable', type: 'asset', category: 'current_asset', balance: 0 },
    { code: '1300', nameAr: 'المخزون', nameEn: 'Inventory', type: 'asset', category: 'current_asset', balance: 0 },
    { code: '2000', nameAr: 'حسابات الدائنين', nameEn: 'Accounts Payable', type: 'liability', category: 'current_liability', balance: 0 },
    { code: '2100', nameAr: 'إيرادات مقدمة', nameEn: 'Unearned Revenue', type: 'liability', category: 'current_liability', balance: 0 },
    { code: '3000', nameAr: 'رأس المال', nameEn: 'Owner Equity', type: 'equity', category: 'owners_equity', balance: 0 },
    { code: '3100', nameAr: 'الأرباح المحتجزة', nameEn: 'Retained Earnings', type: 'equity', category: 'owners_equity', balance: 0 },
    { code: '4000', nameAr: 'إيرادات المبيعات', nameEn: 'Sales Revenue', type: 'revenue', category: 'operating_revenue', balance: 0 },
    { code: '4100', nameAr: 'إيرادات التوصيل', nameEn: 'Delivery Revenue', type: 'revenue', category: 'operating_revenue', balance: 0 },
    { code: '5000', nameAr: 'تكلفة البضاعة المباعة', nameEn: 'Cost of Goods Sold', type: 'expense', category: 'cost_of_sales', balance: 0 },
    { code: '5100', nameAr: 'مصاريف التوصيل', nameEn: 'Delivery Expenses', type: 'expense', category: 'operating_expense', balance: 0 },
    { code: '5200', nameAr: 'مصاريف إدارية', nameEn: 'Administrative Expenses', type: 'expense', category: 'operating_expense', balance: 0 },
    { code: '5300', nameAr: 'خصومات ممنوحة', nameEn: 'Discounts Allowed', type: 'expense', category: 'operating_expense', balance: 0 },
  ]

  for (const account of ledgerAccounts) {
    await db.ledgerAccount.create({ data: account })
  }

  console.log(`✅ ${ledgerAccounts.length} ledger accounts created`)

  // ─── Sample Orders ────────────────────────────────────────────
  console.log('📦 Creating sample orders...')

  // First create a guest customer user
  const demoHash = await bcrypt.hash('123456', 10)
  const guestUser = await db.user.create({
    data: {
      phone: '+218911234567',
      name: 'أحمد محمد',
      role: 'customer',
      language: 'ar',
      isActive: true,
      loyaltyTier: 'silver',
      loyaltyPoints: 150,
      walletBalance: 0,
      passwordHash: demoHash,
    },
  })

  const fatimaHash = await bcrypt.hash('123456', 10)
  const guestUser2 = await db.user.create({
    data: {
      phone: '+218917654321',
      name: 'فاطمة علي',
      role: 'customer',
      language: 'ar',
      isActive: true,
      loyaltyTier: 'gold',
      loyaltyPoints: 500,
      walletBalance: 50,
      passwordHash: fatimaHash,
    },
  })

  // Create unique addresses for each order (addressId is @unique on Order)
  const orderAddresses = await Promise.all([
    db.address.create({
      data: {
        userId: guestUser.id,
        label: 'المنزل',
        address: 'شارع الجمهورية، مبنى 15',
        city: 'طرابلس',
        area: 'المركز',
        notes: 'الطابق الثاني',
        isDefault: true,
      },
    }),
    db.address.create({
      data: {
        userId: guestUser.id,
        label: 'العمل',
        address: 'شارع الحرية، حي الأندلس',
        city: 'طرابلس',
        area: 'الضواحي',
        isDefault: false,
      },
    }),
    db.address.create({
      data: {
        userId: guestUser2.id,
        label: 'المنزل',
        address: 'شارع النصر، بالقرب من المستشفى',
        city: 'بنغازي',
        area: 'المركز',
        isDefault: true,
      },
    }),
    db.address.create({
      data: {
        userId: guestUser2.id,
        label: 'العمل',
        address: 'شارع 1 سبتمبر، عمارة 5',
        city: 'بنغازي',
        isDefault: false,
      },
    }),
    db.address.create({
      data: {
        userId: guestUser.id,
        label: 'عنوان آخر',
        address: 'شارع الوادي، بناية 4',
        city: 'طرابلس',
        area: 'المركز',
        isDefault: false,
      },
    }),
    db.address.create({
      data: {
        userId: admin.id,
        label: 'العمل',
        address: 'شارع السيول، برج التجارة',
        city: 'طرابلس',
        area: 'سيول',
        isDefault: true,
      },
    }),
    db.address.create({
      data: {
        userId: guestUser.id,
        label: 'منزل العائلة',
        address: 'شارع الكورنيش، فيلا 8',
        city: 'طرابلس',
        area: 'الضواحي',
        isDefault: false,
      },
    }),
    db.address.create({
      data: {
        userId: guestUser2.id,
        label: 'عنوان آخر',
        address: 'شارع المصنعة، بناية 12',
        city: 'بنغازي',
        isDefault: false,
      },
    }),
  ])

  // Get some products for orders
  const sampleProducts = await db.product.findMany({ take: 10 })
  if (sampleProducts.length >= 4) {
    const sampleOrders = [
      {
        userId: guestUser.id,
        orderNumber: 'NBD-20260301-1234',
        status: 'delivered',
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        subtotal: 235,
        deliveryFee: 0,
        discount: 23.5,
        total: 211.5,
        currency: 'LYD',
        notes: null,
        fraudScore: 0,
        fraudFlagged: false,
        deliveredAt: new Date('2026-03-04'),
        addressId: orderAddresses[0].id,
        createdAt: new Date('2026-03-01'),
        items: {
          create: [
            { productId: sampleProducts[0].id, nameAr: sampleProducts[0].nameAr, nameEn: sampleProducts[0].nameEn, price: sampleProducts[0].price, quantity: 1, total: sampleProducts[0].price, image: sampleProducts[0].mainImage },
            { productId: sampleProducts[1].id, nameAr: sampleProducts[1].nameAr, nameEn: sampleProducts[1].nameEn, price: sampleProducts[1].price, quantity: 1, total: sampleProducts[1].price, image: sampleProducts[1].mainImage },
          ],
        },
        statusLog: {
          create: [
            { status: 'pending', note: 'Order created', createdAt: new Date('2026-03-01') },
            { status: 'confirmed', note: 'Order confirmed', createdAt: new Date('2026-03-01') },
            { status: 'processing', note: 'Order being prepared', createdAt: new Date('2026-03-02') },
            { status: 'shipped', note: 'Order shipped via local carrier', createdAt: new Date('2026-03-02') },
            { status: 'delivered', note: 'Order delivered successfully', createdAt: new Date('2026-03-04') },
          ],
        },
      },
      {
        userId: guestUser.id,
        orderNumber: 'NBD-20260305-2345',
        status: 'shipped',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        subtotal: 350,
        deliveryFee: 0,
        discount: 0,
        total: 350,
        currency: 'LYD',
        notes: 'يرجى التوصيل قبل الظهر',
        fraudScore: 0,
        fraudFlagged: false,
        addressId: orderAddresses[1].id,
        createdAt: new Date('2026-03-05'),
        items: {
          create: [
            { productId: sampleProducts[2].id, nameAr: sampleProducts[2].nameAr, nameEn: sampleProducts[2].nameEn, price: sampleProducts[2].price, quantity: 1, total: sampleProducts[2].price, image: sampleProducts[2].mainImage },
          ],
        },
        statusLog: {
          create: [
            { status: 'pending', note: 'Order created', createdAt: new Date('2026-03-05') },
            { status: 'confirmed', note: 'Order confirmed', createdAt: new Date('2026-03-05') },
            { status: 'processing', note: 'Order being prepared', createdAt: new Date('2026-03-06') },
            { status: 'shipped', note: 'Order shipped', createdAt: new Date('2026-03-06') },
          ],
        },
      },
      {
        userId: guestUser2.id,
        orderNumber: 'NBD-20260307-3456',
        status: 'processing',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        subtotal: 120,
        deliveryFee: 15,
        discount: 12,
        total: 123,
        currency: 'LYD',
        notes: null,
        fraudScore: 10,
        fraudFlagged: false,
        addressId: orderAddresses[2].id,
        createdAt: new Date('2026-03-07'),
        items: {
          create: [
            { productId: sampleProducts[3].id, nameAr: sampleProducts[3].nameAr, nameEn: sampleProducts[3].nameEn, price: sampleProducts[3].price, quantity: 1, total: sampleProducts[3].price, image: sampleProducts[3].mainImage },
            { productId: sampleProducts[0].id, nameAr: sampleProducts[0].nameAr, nameEn: sampleProducts[0].nameEn, price: sampleProducts[0].price, quantity: 1, total: sampleProducts[0].price, image: sampleProducts[0].mainImage },
          ],
        },
        statusLog: {
          create: [
            { status: 'pending', note: 'Order created', createdAt: new Date('2026-03-07') },
            { status: 'confirmed', note: 'Order confirmed', createdAt: new Date('2026-03-07') },
            { status: 'processing', note: 'Order being prepared', createdAt: new Date('2026-03-08') },
          ],
        },
      },
      {
        userId: guestUser2.id,
        orderNumber: 'NBD-20260309-4567',
        status: 'confirmed',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        subtotal: 85,
        deliveryFee: 8,
        discount: 0,
        total: 93,
        currency: 'LYD',
        notes: null,
        fraudScore: 0,
        fraudFlagged: false,
        addressId: orderAddresses[3].id,
        createdAt: new Date('2026-03-09'),
        items: {
          create: [
            { productId: sampleProducts[1].id, nameAr: sampleProducts[1].nameAr, nameEn: sampleProducts[1].nameEn, price: sampleProducts[1].price, quantity: 1, total: sampleProducts[1].price, image: sampleProducts[1].mainImage },
          ],
        },
        statusLog: {
          create: [
            { status: 'pending', note: 'Order created', createdAt: new Date('2026-03-09') },
            { status: 'confirmed', note: 'Order confirmed', createdAt: new Date('2026-03-09') },
          ],
        },
      },
      {
        userId: guestUser.id,
        orderNumber: 'NBD-20260310-5678',
        status: 'pending',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        subtotal: 530,
        deliveryFee: 0,
        discount: 53,
        total: 477,
        currency: 'LYD',
        notes: null,
        fraudScore: 35,
        fraudFlagged: false,
        addressId: orderAddresses[4].id,
        createdAt: new Date('2026-03-10'),
        items: {
          create: [
            { productId: sampleProducts[0].id, nameAr: sampleProducts[0].nameAr, nameEn: sampleProducts[0].nameEn, price: sampleProducts[0].price, quantity: 2, total: sampleProducts[0].price * 2, image: sampleProducts[0].mainImage },
            { productId: sampleProducts[2].id, nameAr: sampleProducts[2].nameAr, nameEn: sampleProducts[2].nameEn, price: sampleProducts[2].price, quantity: 1, total: sampleProducts[2].price, image: sampleProducts[2].mainImage },
          ],
        },
        statusLog: {
          create: [
            { status: 'pending', note: 'Order created', createdAt: new Date('2026-03-10') },
          ],
        },
      },
      {
        userId: admin.id,
        orderNumber: 'NBD-20260310-6789',
        status: 'pending',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        subtotal: 750,
        deliveryFee: 0,
        discount: 0,
        total: 750,
        currency: 'LYD',
        notes: 'طلب تجريبي',
        fraudScore: 55,
        fraudFlagged: true,
        addressId: orderAddresses[5].id,
        createdAt: new Date('2026-03-10'),
        items: {
          create: [
            { productId: sampleProducts[2].id, nameAr: sampleProducts[2].nameAr, nameEn: sampleProducts[2].nameEn, price: sampleProducts[2].price, quantity: 2, total: sampleProducts[2].price * 2, image: sampleProducts[2].mainImage },
            { productId: sampleProducts[3].id, nameAr: sampleProducts[3].nameAr, nameEn: sampleProducts[3].nameEn, price: sampleProducts[3].price, quantity: 1, total: sampleProducts[3].price, image: sampleProducts[3].mainImage },
          ],
        },
        statusLog: {
          create: [
            { status: 'pending', note: 'Order created - flagged for fraud review', createdAt: new Date('2026-03-10') },
          ],
        },
      },
      {
        userId: guestUser.id,
        orderNumber: 'NBD-20260225-7890',
        status: 'cancelled',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        subtotal: 45,
        deliveryFee: 10,
        discount: 0,
        total: 55,
        currency: 'LYD',
        notes: null,
        fraudScore: 0,
        fraudFlagged: false,
        cancelledAt: new Date('2026-02-26'),
        addressId: orderAddresses[6].id,
        createdAt: new Date('2026-02-25'),
        items: {
          create: [
            { productId: sampleProducts[1].id, nameAr: sampleProducts[1].nameAr, nameEn: sampleProducts[1].nameEn, price: sampleProducts[1].price, quantity: 1, total: sampleProducts[1].price, image: sampleProducts[1].mainImage },
          ],
        },
        statusLog: {
          create: [
            { status: 'pending', note: 'Order created', createdAt: new Date('2026-02-25') },
            { status: 'cancelled', note: 'Customer requested cancellation', createdAt: new Date('2026-02-26') },
          ],
        },
      },
      {
        userId: guestUser2.id,
        orderNumber: 'NBD-20260220-8901',
        status: 'delivered',
        paymentMethod: 'cod',
        paymentStatus: 'paid',
        subtotal: 180,
        deliveryFee: 0,
        discount: 18,
        total: 162,
        currency: 'LYD',
        notes: null,
        fraudScore: 0,
        fraudFlagged: false,
        deliveredAt: new Date('2026-02-24'),
        addressId: orderAddresses[7].id,
        createdAt: new Date('2026-02-20'),
        items: {
          create: [
            { productId: sampleProducts[0].id, nameAr: sampleProducts[0].nameAr, nameEn: sampleProducts[0].nameEn, price: sampleProducts[0].price, quantity: 1, total: sampleProducts[0].price, image: sampleProducts[0].mainImage },
            { productId: sampleProducts[3].id, nameAr: sampleProducts[3].nameAr, nameEn: sampleProducts[3].nameEn, price: sampleProducts[3].price, quantity: 1, total: sampleProducts[3].price, image: sampleProducts[3].mainImage },
          ],
        },
        statusLog: {
          create: [
            { status: 'pending', note: 'Order created', createdAt: new Date('2026-02-20') },
            { status: 'confirmed', note: 'Order confirmed', createdAt: new Date('2026-02-20') },
            { status: 'processing', note: 'Order being prepared', createdAt: new Date('2026-02-21') },
            { status: 'shipped', note: 'Order shipped', createdAt: new Date('2026-02-22') },
            { status: 'delivered', note: 'Order delivered successfully', createdAt: new Date('2026-02-24') },
          ],
        },
      },
    ]

    for (const orderData of sampleOrders) {
      await db.order.create({ data: orderData })
    }

    console.log(`✅ ${sampleOrders.length} sample orders created`)
  } else {
    console.log('⚠️ Not enough products for sample orders')
  }

  // ─── Vendors ────────────────────────────────────────────────
  console.log('🏪 Creating vendors...')

  const vendors = [
    {
      nameAr: 'مطبخ ليبيا',
      nameEn: 'Libya Kitchen',
      type: 'RETAILER',
      commission: 10,
      phone: '+218912000001',
      email: 'info@libyakitchen.ly',
      descriptionAr: 'متجر متخصص في أواني المطبخ ولوازم الطبخ الليبية',
      descriptionEn: 'Specialized store for Libyan kitchen cookware and supplies',
      isActive: true,
      isVerified: true,
      rating: 4.5,
      totalSales: 250,
    },
    {
      nameAr: 'أواني الشرق',
      nameEn: 'East Utensils',
      type: 'BRAND_OFFICIAL',
      commission: 5,
      phone: '+218912000002',
      email: 'sales@eastutensils.ly',
      descriptionAr: 'الوكيل الرسمي لعلامة أواني الشرق التجارية في ليبيا',
      descriptionEn: 'Official distributor of East Utensils brand in Libya',
      isActive: true,
      isVerified: true,
      rating: 4.7,
      totalSales: 500,
    },
    {
      nameAr: 'صناع التراث',
      nameEn: 'Heritage Makers',
      type: 'LOCAL_ARTISAN',
      commission: 15,
      phone: '+218912000003',
      email: 'crafts@heritagemakers.ly',
      descriptionAr: 'حرفيون محليون متخصصون في الأواني النحاسية التقليدية المصنوعة يدوياً',
      descriptionEn: 'Local artisans specializing in handcrafted traditional copper utensils',
      isActive: true,
      isVerified: false,
      rating: 4.9,
      totalSales: 80,
    },
  ]

  const createdVendors = []
  for (const vendor of vendors) {
    const created = await db.vendor.create({ data: vendor })
    createdVendors.push(created)
  }

  console.log(`✅ ${createdVendors.length} vendors created`)

  // ─── Update Product Attributes ─────────────────────────────
  console.log('🔧 Updating product attributes (comprehensive)...')

  const allProductsWithCategories = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  })

  // Category-specific attribute templates
  const categoryAttributes: Record<string, Array<Record<string, unknown>>> = {
    cookware: [
      { sizes: undefined, colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 1.8, width: 24, height: 18, depth: 24, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], capacity: '5L', protection: { ar: 'مقاوم للصدأ', en: 'Rust resistant' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { sizes: undefined, colors: [{ nameAr: 'رمادي غامق', nameEn: 'Dark Gray', hex: '#4a4a4a' }, { nameAr: 'برونزي', nameEn: 'Bronze', hex: '#CD7F32' }], weight: 4.5, width: 35, height: 25, depth: 35, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ألمنيوم', en: 'Aluminum' }, { ar: 'تيفال', en: 'Tefal' }], capacity: '7 قطع', protection: { ar: 'طبقة غير لاصقة', en: 'Non-stick coating' }, warranty: { ar: 'سنتان', en: '2 Years' } },
      { sizes: undefined, colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'رمادي', nameEn: 'Gray', hex: '#808080' }], weight: 1.2, width: 28, height: 6, depth: 28, countryOfOrigin: { ar: 'فرنسا', en: 'France' }, materials: [{ ar: 'ألمنيوم', en: 'Aluminum' }, { ar: 'تيفال', en: 'Tefal' }], capacity: '28سم', protection: { ar: 'طبقة تيتانيوم', en: 'Titanium coating' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { sizes: undefined, colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 2.5, width: 22, height: 22, depth: 22, countryOfOrigin: { ar: 'ألمانيا', en: 'Germany' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], capacity: '6L', protection: { ar: 'صمام أمان', en: 'Safety valve' }, warranty: { ar: '3 سنوات', en: '3 Years' } },
      { sizes: undefined, colors: [{ nameAr: 'نحاسي', nameEn: 'Copper', hex: '#B87333' }, { nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 1.5, width: 20, height: 15, depth: 20, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'نحاس', en: 'Copper' }], capacity: '3L', protection: { ar: 'مصنوع يدوياً', en: 'Handcrafted' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { sizes: undefined, colors: [{ nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 1.0, width: 26, height: 5, depth: 26, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ألمنيوم', en: 'Aluminum' }, { ar: 'سيراميك', en: 'Ceramic' }], capacity: '26سم', protection: { ar: 'طبقة سيراميك', en: 'Ceramic coating' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { sizes: undefined, colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 3.0, width: 30, height: 30, depth: 30, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], capacity: '10L', protection: { ar: 'مقاوم للحرارة', en: 'Heat resistant' }, warranty: { ar: 'سنتان', en: '2 Years' } },
    ],
    'kitchen-tools': [
      { colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 0.3, width: 8, height: 30, depth: 3, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'خشب الزان', en: 'Beech Wood' }], protection: { ar: 'مقاوم للحرارة', en: 'Heat resistant' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 0.2, width: 5, height: 25, depth: 2, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'مقاوم للصدأ', en: 'Rust resistant' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }], weight: 0.15, width: 10, height: 20, depth: 3, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'سيليكون', en: 'Silicone' }], protection: { ar: 'آمن للطبخ', en: 'Cooking safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 0.8, width: 15, height: 35, depth: 15, countryOfOrigin: { ar: 'ألمانيا', en: 'Germany' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'مقاوم للصدأ', en: 'Rust resistant' }, warranty: { ar: 'سنتان', en: '2 Years' } },
      { colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.4, width: 12, height: 28, depth: 8, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }, { ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'آمن للطعام', en: 'Food safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }, { nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }], weight: 0.6, width: 20, height: 25, depth: 10, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'مقاوم للصدأ', en: 'Rust resistant' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
    ],
    'serving-ware': [
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }], weight: 2.0, width: 35, height: 8, depth: 25, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بورسلين', en: 'Porcelain' }], protection: { ar: 'آمن للميكروويف', en: 'Microwave safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'شفاف', nameEn: 'Clear', hex: '#E8F4FD' }], weight: 1.5, width: 30, height: 10, depth: 20, countryOfOrigin: { ar: 'إيطاليا', en: 'Italy' }, materials: [{ ar: 'زجاج مقسى', en: 'Tempered Glass' }], protection: { ar: 'مقاوم للكسر', en: 'Shatter resistant' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 1.8, width: 40, height: 5, depth: 30, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'مقاوم للصدأ', en: 'Rust resistant' }, warranty: { ar: 'سنتان', en: '2 Years' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#0066CC' }], weight: 3.0, width: 50, height: 12, depth: 35, countryOfOrigin: { ar: 'اليابان', en: 'Japan' }, materials: [{ ar: 'بورسلين', en: 'Porcelain' }], protection: { ar: 'آمن للميكروويف', en: 'Microwave safe' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'خشبي', nameEn: 'Wooden', hex: '#DEB887' }], weight: 1.2, width: 35, height: 3, depth: 25, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'خشب الجوز', en: 'Walnut Wood' }], protection: { ar: 'مقاوم للرطوبة', en: 'Moisture resistant' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'شفاف', nameEn: 'Clear', hex: '#E8F4FD' }, { nameAr: 'أخضر', nameEn: 'Green', hex: '#90EE90' }], weight: 0.8, width: 20, height: 15, depth: 15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'زجاج', en: 'Glass' }], protection: { ar: 'مقاوم للحرارة', en: 'Heat resistant' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
    ],
    'cups-pitchers': [
      { colors: [{ nameAr: 'شفاف', nameEn: 'Clear', hex: '#E8F4FD' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 0.3, width: 8, height: 12, depth: 8, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'زجاج', en: 'Glass' }], capacity: '350ml', protection: { ar: 'مقاوم للحرارة', en: 'Heat resistant' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'بيج', nameEn: 'Beige', hex: '#F5F5DC' }], weight: 0.25, width: 7, height: 10, depth: 7, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'سيراميك', en: 'Ceramic' }], capacity: '250ml', protection: { ar: 'آمن للميكروويف', en: 'Microwave safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }, { nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }], weight: 0.2, width: 7, height: 9, depth: 7, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], capacity: '300ml', protection: { ar: 'حافظ للحرارة', en: 'Insulated' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }, { nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 0.35, width: 9, height: 14, depth: 9, countryOfOrigin: { ar: 'اليابان', en: 'Japan' }, materials: [{ ar: 'سيراميك', en: 'Ceramic' }], capacity: '400ml', protection: { ar: 'آمن للميكروويف', en: 'Microwave safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'شفاف', nameEn: 'Clear', hex: '#E8F4FD' }], weight: 0.8, width: 12, height: 25, depth: 12, countryOfOrigin: { ar: 'إيطاليا', en: 'Italy' }, materials: [{ ar: 'زجاج مقسى', en: 'Tempered Glass' }], capacity: '1.5L', protection: { ar: 'مقاوم للحرارة', en: 'Heat resistant' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'نحاسي', nameEn: 'Copper', hex: '#B87333' }], weight: 0.6, width: 10, height: 20, depth: 10, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'نحاس', en: 'Copper' }], capacity: '800ml', protection: { ar: 'مصنوع يدوياً', en: 'Handcrafted' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 0.4, width: 8, height: 18, depth: 8, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], capacity: '500ml', protection: { ar: 'حافظ للحرارة', en: 'Insulated' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
    ],
    'preparation-tools': [
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 0.15, width: 5, height: 20, depth: 2, countryOfOrigin: { ar: 'ألمانيا', en: 'Germany' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'مقاوم للصدأ', en: 'Rust resistant' }, warranty: { ar: 'سنتان', en: '2 Years' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 2.0, width: 20, height: 30, depth: 20, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], power: '300W', protection: { ar: 'حماية من الحرارة الزائدة', en: 'Overheat protection' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 0.3, width: 10, height: 25, depth: 10, countryOfOrigin: { ar: 'اليابان', en: 'Japan' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'شفارات حادة', en: 'Sharp blades' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }], weight: 1.5, width: 18, height: 25, depth: 18, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }, { ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'آمن للطعام', en: 'Food safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 2.5, width: 25, height: 15, depth: 25, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'رخام', en: 'Marble' }], protection: { ar: 'مقاوم للخدش', en: 'Scratch resistant' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
    ],
    'food-storage': [
      { colors: [{ nameAr: 'شفاف', nameEn: 'Clear', hex: '#E8F4FD' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 0.3, width: 15, height: 10, depth: 15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], capacity: '1L', protection: { ar: 'محكم الإغلاق', en: 'Airtight' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'شفاف', nameEn: 'Clear', hex: '#E8F4FD' }], weight: 0.5, width: 12, height: 12, depth: 12, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'زجاج', en: 'Glass' }], capacity: '750ml', protection: { ar: 'آمن للميكروويف', en: 'Microwave safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'شفاف', nameEn: 'Clear', hex: '#E8F4FD' }], weight: 0.2, width: 15, height: 8, depth: 15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], capacity: '500ml', protection: { ar: 'محكم الإغلاق', en: 'Airtight' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 0.4, width: 20, height: 10, depth: 20, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], capacity: '2L', protection: { ar: 'حافظ للبرودة', en: 'Insulated' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'شفاف', nameEn: 'Clear', hex: '#E8F4FD' }, { nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }], weight: 0.6, width: 25, height: 15, depth: 15, countryOfOrigin: { ar: 'إيطاليا', en: 'Italy' }, materials: [{ ar: 'زجاج', en: 'Glass' }], capacity: '1.5L', protection: { ar: 'آمن للميكروويف', en: 'Microwave safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
    ],
    'fashion-men': [
      { sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أزرق فاتح', nameEn: 'Light Blue', hex: '#ADD8E6' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.2, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'قطن 100%', en: '100% Cotton' }], fabric: { ar: 'قطن', en: 'Cotton' }, protection: { ar: 'مريح للبشرة', en: 'Skin friendly' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['M', 'L', 'XL', 'XXL'], colors: [{ nameAr: 'كحلي', nameEn: 'Navy', hex: '#000080' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'رمادي', nameEn: 'Gray', hex: '#808080' }], weight: 0.5, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'بوليستر', en: 'Polyester' }, { ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'قطن مخلوط', en: 'Cotton Blend' }, protection: { ar: 'مقاوم للتجعد', en: 'Wrinkle resistant' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['S', 'M', 'L', 'XL'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'كحلي', nameEn: 'Navy', hex: '#000080' }], weight: 0.4, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'جينز', en: 'Denim' }, protection: { ar: 'مريح', en: 'Comfortable' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['M', 'L', 'XL', 'XXL'], colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'قطن', en: 'Cotton' }, protection: { ar: 'مريح للبشرة', en: 'Skin friendly' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['M', 'L', 'XL'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 0.8, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'جلد طبيعي', en: 'Genuine Leather' }], fabric: { ar: 'جلد', en: 'Leather' }, protection: { ar: 'مقاوم للماء', en: 'Water resistant' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { sizes: ['M', 'L', 'XL', 'XXL'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'كحلي', nameEn: 'Navy', hex: '#000080' }, { nameAr: 'بيج', nameEn: 'Beige', hex: '#F5F5DC' }], weight: 0.6, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'بوليستر', en: 'Polyester' }], fabric: { ar: 'بوليستر', en: 'Polyester' }, protection: { ar: 'مقاوم للرياح', en: 'Wind resistant' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['S', 'M', 'L', 'XL'], colors: [{ nameAr: 'رمادي', nameEn: 'Gray', hex: '#808080' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 0.3, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قطن', en: 'Cotton' }, { ar: 'إيلاستين', en: 'Elastane' }], fabric: { ar: 'قطن مطاطي', en: 'Stretch Cotton' }, protection: { ar: 'مريح للحركة', en: 'Comfortable movement' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
    ],
    'fashion-women': [
      { sizes: ['S', 'M', 'L', 'XL'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 0.2, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'شيفون', en: 'Chiffon' }], fabric: { ar: 'شيفون', en: 'Chiffon' }, protection: { ar: 'مريح', en: 'Comfortable' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['S', 'M', 'L'], colors: [{ nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.3, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'قطن', en: 'Cotton' }, protection: { ar: 'مريح للبشرة', en: 'Skin friendly' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['S', 'M', 'L', 'XL'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'كحلي', nameEn: 'Navy', hex: '#000080' }], weight: 0.4, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بوليستر', en: 'Polyester' }], fabric: { ar: 'جيرسي', en: 'Jersey' }, protection: { ar: 'مطاطي', en: 'Stretchy' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['M', 'L', 'XL'], colors: [{ nameAr: 'بيج', nameEn: 'Beige', hex: '#F5F5DC' }, { nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }], weight: 0.5, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'حرير', en: 'Silk' }], fabric: { ar: 'حرير', en: 'Silk' }, protection: { ar: 'تنظيف جاف', en: 'Dry clean only' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['S', 'M', 'L', 'XL'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'رمادي', nameEn: 'Gray', hex: '#808080' }], weight: 0.5, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'جينز', en: 'Denim' }, protection: { ar: 'مريح', en: 'Comfortable' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['S', 'M', 'L'], colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قطن', en: 'Cotton' }, { ar: 'دانتيل', en: 'Lace' }], fabric: { ar: 'قطن مع دانتيل', en: 'Cotton with Lace' }, protection: { ar: 'مريح للبشرة', en: 'Skin friendly' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['S', 'M', 'L', 'XL'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }], weight: 0.6, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'بوليستر', en: 'Polyester' }], fabric: { ar: 'بوليستر', en: 'Polyester' }, protection: { ar: 'مقاوم للماء', en: 'Water resistant' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
    ],
    'fashion-kids': [
      { sizes: ['2-3', '4-5', '6-7', '8-9'], colors: [{ nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }, { nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }], weight: 0.15, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'قطن', en: 'Cotton' }, ageGroup: { ar: '2-9 سنوات', en: '2-9 years' }, protection: { ar: 'آمن للأطفال', en: 'Child safe' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['4-5', '6-7', '8-9', '10-11'], colors: [{ nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }, { nameAr: 'بنفسجي', nameEn: 'Purple', hex: '#8B008B' }], weight: 0.2, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'قطن', en: 'Cotton' }, ageGroup: { ar: '4-11 سنة', en: '4-11 years' }, protection: { ar: 'آمن للأطفال', en: 'Child safe' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['3-4', '5-6', '7-8'], colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }, { nameAr: 'أصفر', nameEn: 'Yellow', hex: '#FFD700' }], weight: 0.1, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'قطن عضوي', en: 'Organic Cotton' }, ageGroup: { ar: '3-8 سنوات', en: '3-8 years' }, protection: { ar: 'قطن عضوي', en: 'Organic cotton' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['6-7', '8-9', '10-11', '12-13'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'كحلي', nameEn: 'Navy', hex: '#000080' }], weight: 0.3, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'جينز', en: 'Denim' }, ageGroup: { ar: '6-13 سنة', en: '6-13 years' }, protection: { ar: 'مريح', en: 'Comfortable' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { sizes: ['2-3', '4-5', '6-7'], colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 0.1, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قطن', en: 'Cotton' }], fabric: { ar: 'قطن', en: 'Cotton' }, ageGroup: { ar: '2-7 سنوات', en: '2-7 years' }, protection: { ar: 'آمن للأطفال', en: 'Child safe' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
    ],
    'footwear-men': [
      { sizes: ['40', '41', '42', '43', '44'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 0.8, width: 10, height: 12, depth: 30, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'جلد طبيعي', en: 'Genuine Leather' }], sole: { ar: 'مطاط', en: 'Rubber' }, protection: { ar: 'مقاوم للانزلاق', en: 'Anti-slip' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { sizes: ['39', '40', '41', '42', '43', '44', '45'], colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.6, width: 10, height: 8, depth: 28, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قماش', en: 'Fabric' }], sole: { ar: 'مطاط', en: 'Rubber' }, protection: { ar: 'مريح للمشي', en: 'Walking comfort' }, warranty: { ar: 'شهر واحد', en: '1 Month' } },
      { sizes: ['40', '41', '42', '43'], colors: [{ nameAr: 'كحلي', nameEn: 'Navy', hex: '#000080' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.7, width: 10, height: 10, depth: 29, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'جلد صناعي', en: 'Faux Leather' }], sole: { ar: 'بولي يوريثان', en: 'Polyurethane' }, protection: { ar: 'مقاوم للانزلاق', en: 'Anti-slip' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { sizes: ['41', '42', '43', '44'], colors: [{ nameAr: 'رمادي', nameEn: 'Gray', hex: '#808080' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.9, width: 12, height: 14, depth: 32, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'جلد صناعي', en: 'Faux Leather' }], sole: { ar: 'مطاط', en: 'Rubber' }, protection: { ar: 'مقاوم للماء', en: 'Water resistant' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { sizes: ['40', '41', '42', '43', '44'], colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.75, width: 10, height: 8, depth: 28, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'جلد طبيعي', en: 'Genuine Leather' }], sole: { ar: 'جلد', en: 'Leather' }, protection: { ar: 'مريح', en: 'Comfortable' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
    ],
    'footwear-women': [
      { sizes: ['36', '37', '38', '39', '40'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'بيج', nameEn: 'Beige', hex: '#F5F5DC' }, { nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }], weight: 0.4, width: 8, height: 8, depth: 24, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'جلد صناعي', en: 'Faux Leather' }], sole: { ar: 'مطاط', en: 'Rubber' }, protection: { ar: 'مقاوم للانزلاق', en: 'Anti-slip' }, warranty: { ar: 'شهر واحد', en: '1 Month' } },
      { sizes: ['37', '38', '39', '40'], colors: [{ nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }, { nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 0.3, width: 8, height: 5, depth: 22, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'قماش', en: 'Fabric' }], sole: { ar: 'مطاط', en: 'Rubber' }, protection: { ar: 'مريح', en: 'Comfortable' }, warranty: { ar: 'شهر واحد', en: '1 Month' } },
      { sizes: ['36', '37', '38', '39'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }], weight: 0.35, width: 7, height: 10, depth: 23, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'جلد صناعي', en: 'Faux Leather' }], sole: { ar: 'بولي يوريثان', en: 'Polyurethane' }, protection: { ar: 'مقاوم للانزلاق', en: 'Anti-slip' }, warranty: { ar: 'شهر واحد', en: '1 Month' } },
      { sizes: ['38', '39', '40'], colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.5, width: 9, height: 5, depth: 25, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'جلد طبيعي', en: 'Genuine Leather' }], sole: { ar: 'جلد', en: 'Leather' }, protection: { ar: 'مريح للمشي', en: 'Walking comfort' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { sizes: ['36', '37', '38', '39', '40'], colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.3, width: 8, height: 4, depth: 22, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قماش', en: 'Fabric' }], sole: { ar: 'مطاط', en: 'Rubber' }, protection: { ar: 'خفيف الوزن', en: 'Lightweight' }, warranty: { ar: 'شهر واحد', en: '1 Month' } },
    ],
    'footwear-kids': [
      { sizes: ['25', '26', '27', '28', '29', '30'], colors: [{ nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }, { nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }], weight: 0.2, width: 7, height: 5, depth: 18, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قماش', en: 'Fabric' }], sole: { ar: 'مطاط', en: 'Rubber' }, ageGroup: { ar: '3-6 سنوات', en: '3-6 years' }, protection: { ar: 'آمن للأطفال', en: 'Child safe' }, warranty: { ar: 'شهر واحد', en: '1 Month' } },
      { sizes: ['28', '29', '30', '31', '32', '33'], colors: [{ nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }, { nameAr: 'بنفسجي', nameEn: 'Purple', hex: '#8B008B' }], weight: 0.25, width: 8, height: 6, depth: 20, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'جلد صناعي', en: 'Faux Leather' }], sole: { ar: 'مطاط', en: 'Rubber' }, ageGroup: { ar: '5-9 سنوات', en: '5-9 years' }, protection: { ar: 'مضاد للانزلاق', en: 'Anti-slip' }, warranty: { ar: 'شهر واحد', en: '1 Month' } },
      { sizes: ['30', '31', '32', '33', '34', '35'], colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 0.3, width: 9, height: 8, depth: 22, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'قماش', en: 'Fabric' }], sole: { ar: 'مطاط', en: 'Rubber' }, ageGroup: { ar: '7-12 سنة', en: '7-12 years' }, protection: { ar: 'مريح للرياضة', en: 'Sports comfort' }, warranty: { ar: 'شهر واحد', en: '1 Month' } },
      { sizes: ['26', '27', '28', '29', '30'], colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }, { nameAr: 'بيج', nameEn: 'Beige', hex: '#F5F5DC' }], weight: 0.2, width: 7, height: 4, depth: 17, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'جلد صناعي', en: 'Faux Leather' }], sole: { ar: 'مطاط', en: 'Rubber' }, ageGroup: { ar: '3-6 سنوات', en: '3-6 years' }, protection: { ar: 'آمن للأطفال', en: 'Child safe' }, warranty: { ar: 'شهر واحد', en: '1 Month' } },
    ],
    'perfumes-oud': [
      { colors: [{ nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }], weight: 0.15, width: 5, height: 12, depth: 5, countryOfOrigin: { ar: 'الإمارات', en: 'UAE' }, materials: [{ ar: 'عود طبيعي', en: 'Natural Oud' }], fragrance: { ar: 'عود شرقي', en: 'Oriental Oud' }, capacity: '50ml', protection: { ar: 'زجاج فاخر', en: 'Premium glass' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.2, width: 6, height: 15, depth: 6, countryOfOrigin: { ar: 'السعودية', en: 'Saudi Arabia' }, materials: [{ ar: 'عود كمبودي', en: 'Cambodian Oud' }], fragrance: { ar: 'مسك وعنبر', en: 'Musk & Amber' }, capacity: '100ml', protection: { ar: 'زجاج فاخر', en: 'Premium glass' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }, { nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 0.1, width: 4, height: 10, depth: 4, countryOfOrigin: { ar: 'الإمارات', en: 'UAE' }, materials: [{ ar: 'مركب عطري', en: 'Fragrance Compound' }], fragrance: { ar: 'فل وياسمين', en: 'Jasmine & Rose' }, capacity: '30ml', protection: { ar: 'زجاج فاخر', en: 'Premium glass' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 0.3, width: 8, height: 10, depth: 8, countryOfOrigin: { ar: 'السعودية', en: 'Saudi Arabia' }, materials: [{ ar: 'عود طبيعي', en: 'Natural Oud' }], fragrance: { ar: 'بخور عود', en: 'Oud Incense' }, capacity: '50g', protection: { ar: 'تغليف فاخر', en: 'Premium packaging' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 0.05, width: 3, height: 8, depth: 3, countryOfOrigin: { ar: 'الإمارات', en: 'UAE' }, materials: [{ ar: 'مسك أبيض', en: 'White Musk' }], fragrance: { ar: 'مسك أبيض', en: 'White Musk' }, capacity: '15ml', protection: { ar: 'محكم الإغلاق', en: 'Sealed' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'عنبري', nameEn: 'Amber', hex: '#FFBF00' }], weight: 0.25, width: 7, height: 14, depth: 7, countryOfOrigin: { ar: 'السعودية', en: 'Saudi Arabia' }, materials: [{ ar: 'مسك وعنبر', en: 'Musk & Amber' }], fragrance: { ar: 'عنبر ومسك', en: 'Amber & Musk' }, capacity: '75ml', protection: { ar: 'زجاج فاخر', en: 'Premium glass' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
    ],
    accessories: [
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }, { nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }], weight: 0.05, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'مقاوم للبهتان', en: 'Tarnish resistant' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 0.1, width: 4, height: 8, depth: 2, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'جلد طبيعي', en: 'Genuine Leather' }], protection: { ar: 'مقاوم للماء', en: 'Water resistant' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }], weight: 0.03, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ذهب عيار 18', en: '18K Gold' }], protection: { ar: 'شهادة أصالة', en: 'Authenticity certificate' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }], weight: 0.15, width: 12, height: 18, depth: 5, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'جلد صناعي', en: 'Faux Leather' }], protection: { ar: 'مقاوم للخدش', en: 'Scratch resistant' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { colors: [{ nameAr: 'رمادي', nameEn: 'Gray', hex: '#808080' }], weight: 0.08, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], protection: { ar: 'مقاوم للصدأ', en: 'Rust resistant' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.02, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بولي كربونات', en: 'Polycarbonate' }], protection: { ar: 'مقاوم للصدمات', en: 'Shock resistant' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
    ],
    'mother-baby': [
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أزرق فاتح', nameEn: 'Light Blue', hex: '#ADD8E6' }], weight: 0.5, width: 20, height: 15, depth: 8, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قطن عضوي', en: 'Organic Cotton' }], ageGroup: { ar: '0-12 شهر', en: '0-12 months' }, protection: { ar: 'آمن للرضع', en: 'Baby safe' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { colors: [{ nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 2.0, width: 30, height: 40, depth: 20, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك آمن', en: 'BPA-free Plastic' }], ageGroup: { ar: '0-3 سنوات', en: '0-3 years' }, protection: { ar: 'خالي من BPA', en: 'BPA free' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 1.5, width: 25, height: 30, depth: 15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك آمن', en: 'BPA-free Plastic' }], ageGroup: { ar: '0-6 أشهر', en: '0-6 months' }, protection: { ar: 'خالي من BPA', en: 'BPA free' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أصفر', nameEn: 'Yellow', hex: '#FFD700' }, { nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }], weight: 0.3, width: 15, height: 10, depth: 15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'سيليكون', en: 'Silicone' }], ageGroup: { ar: '3-12 شهر', en: '3-12 months' }, protection: { ar: 'آمن للمضغ', en: 'Chew safe' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'بيج', nameEn: 'Beige', hex: '#F5F5DC' }], weight: 0.8, width: 22, height: 18, depth: 10, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'قطن', en: 'Cotton' }], ageGroup: { ar: '0-2 سنة', en: '0-2 years' }, protection: { ar: 'آمن للأطفال', en: 'Child safe' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
      { colors: [{ nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }, { nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }], weight: 0.4, width: 18, height: 12, depth: 12, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بولي بروبيلين', en: 'Polypropylene' }], ageGroup: { ar: '0-6 أشهر', en: '0-6 months' }, protection: { ar: 'خالي من BPA', en: 'BPA free' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }, { nameAr: 'بنفسجي', nameEn: 'Purple', hex: '#8B008B' }], weight: 1.0, width: 35, height: 25, depth: 5, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قطن', en: 'Cotton' }], ageGroup: { ar: '0-3 سنوات', en: '0-3 years' }, protection: { ar: 'قطن طبيعي', en: 'Natural cotton' }, warranty: { ar: 'استبدال خلال 14 يوم', en: '14-day replacement' } },
    ],
    'home-care': [
      { colors: [{ nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }, { nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }], weight: 1.2, width: 15, height: 30, depth: 15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], capacity: '1L', protection: { ar: 'آمن للاستخدام المنزلي', en: 'Home use safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 3.0, width: 25, height: 25, depth: 25, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], capacity: '5L', protection: { ar: 'مقاوم للماء', en: 'Water resistant' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'رمادي', nameEn: 'Gray', hex: '#808080' }], weight: 2.5, width: 30, height: 15, depth: 30, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'معدن', en: 'Metal' }], capacity: '2L', protection: { ar: 'فلتر HEPA', en: 'HEPA filter' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }], weight: 0.5, width: 12, height: 20, depth: 12, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'سيراميك', en: 'Ceramic' }], capacity: '500ml', protection: { ar: 'آمن للطعام', en: 'Food safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'شفاف', nameEn: 'Clear', hex: '#E8F4FD' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 0.3, width: 10, height: 15, depth: 10, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'زجاج', en: 'Glass' }], capacity: '300ml', protection: { ar: 'رذاذ متين', en: 'Durable spray' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 1.5, width: 20, height: 20, depth: 20, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], capacity: '3L', protection: { ar: 'فلتر مدمج', en: 'Built-in filter' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
    ],
    'electrical-appliances': [
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 1.5, width: 20, height: 30, depth: 20, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }, { ar: 'ستانلس ستيل', en: 'Stainless Steel' }], power: '1000W', capacity: '1.7L', protection: { ar: 'حماية من الغليان الجاف', en: 'Dry boil protection' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 8.0, width: 40, height: 35, depth: 30, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], power: '2200W', capacity: '10Kg', protection: { ar: 'حماية من الحرارة الزائدة', en: 'Overheat protection' }, warranty: { ar: 'سنتان', en: '2 Years' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 5.0, width: 45, height: 85, depth: 55, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'معدن', en: 'Metal' }], power: '150W', capacity: '320L', protection: { ar: 'ضاغط موفر للطاقة', en: 'Energy saving compressor' }, warranty: { ar: '5 سنوات', en: '5 Years' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 3.0, width: 30, height: 25, depth: 30, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], power: '900W', capacity: '25L', protection: { ar: 'حماية من الإشعاع', en: 'Radiation protection' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }, { nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 6.0, width: 35, height: 40, depth: 35, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], power: '1800W', capacity: '8Kg', protection: { ar: 'فلتر ذاتي التنظيف', en: 'Self-cleaning filter' }, warranty: { ar: 'سنتان', en: '2 Years' } },
      { colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 2.0, width: 15, height: 25, depth: 15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }], power: '800W', capacity: '1L', protection: { ar: 'حماية من التسخين الزائد', en: 'Overheat protection' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 3.5, width: 25, height: 30, depth: 25, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ستانلس ستيل', en: 'Stainless Steel' }, { ar: 'بلاستيك', en: 'Plastic' }], power: '1200W', capacity: '2L', protection: { ar: 'شفرة أمان', en: 'Safety blade' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
    ],
    electronics: [
      { colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 0.5, width: 15, height: 7, depth: 1, countryOfOrigin: { ar: 'الصين', en: 'China' }, screenSize: '6.5 بوصة', connectivity: ['WiFi', 'Bluetooth', '4G'], protection: { ar: 'زجاج مقسى', en: 'Tempered glass' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'رمادي', nameEn: 'Gray', hex: '#808080' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 1.8, width: 30, height: 20, depth: 2, countryOfOrigin: { ar: 'الصين', en: 'China' }, screenSize: '10.1 بوصة', connectivity: ['WiFi', 'Bluetooth'], protection: { ar: 'شاشة مقاومة للخدش', en: 'Scratch resistant screen' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 2.5, width: 36, height: 24, depth: 2, countryOfOrigin: { ar: 'الصين', en: 'China' }, screenSize: '15.6 بوصة', connectivity: ['WiFi', 'Bluetooth', 'USB-C', 'HDMI'], protection: { ar: 'حقيبة حماية', en: 'Protection bag' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
      { colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }, { nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }], weight: 0.04, width: 5, height: 5, depth: 2, countryOfOrigin: { ar: 'الصين', en: 'China' }, connectivity: ['Bluetooth 5.0'], protection: { ar: 'مقاوم للماء', en: 'Water resistant' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.15, width: 12, height: 8, depth: 3, countryOfOrigin: { ar: 'الصين', en: 'China' }, connectivity: ['WiFi', 'Bluetooth'], protection: { ar: 'شحن ذكي', en: 'Smart charging' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 0.6, width: 20, height: 20, depth: 5, countryOfOrigin: { ar: 'الصين', en: 'China' }, connectivity: ['WiFi', 'Bluetooth', 'USB'], protection: { ar: 'شاشة IPS', en: 'IPS screen' }, warranty: { ar: 'سنة واحدة', en: '1 Year' } },
    ],
    'children-toys': [
      { sizes: undefined, colors: [{ nameAr: 'متعدد الألوان', nameEn: 'Multicolor', hex: '#FF6F61' }], weight: 0.5, width: 20, height: 15, depth: 20, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك آمن', en: 'Safe Plastic' }], ageGroup: { ar: '3+ سنوات', en: '3+ years' }, protection: { ar: 'خالي من المواد السامة', en: 'Non-toxic' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }, { nameAr: 'متعدد الألوان', nameEn: 'Multicolor', hex: '#FF6F61' }], weight: 0.8, width: 25, height: 25, depth: 5, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'خشب', en: 'Wood' }], ageGroup: { ar: '2+ سنوات', en: '2+ years' }, protection: { ar: 'ألوان آمنة', en: 'Safe paints' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }, { nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }], weight: 1.2, width: 30, height: 20, depth: 30, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك آمن', en: 'Safe Plastic' }], ageGroup: { ar: '1-3 سنوات', en: '1-3 years' }, protection: { ar: 'حواف مستديرة', en: 'Rounded edges' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }, { nameAr: 'أصفر', nameEn: 'Yellow', hex: '#FFD700' }], weight: 0.3, width: 15, height: 10, depth: 15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قماش', en: 'Fabric' }], ageGroup: { ar: '0-2 سنة', en: '0-2 years' }, protection: { ar: 'آمن للرضع', en: 'Baby safe' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { colors: [{ nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 0.6, width: 20, height: 20, depth: 10, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], ageGroup: { ar: '5+ سنوات', en: '5+ years' }, protection: { ar: 'بطارية آمنة', en: 'Safe battery' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { colors: [{ nameAr: 'متعدد الألوان', nameEn: 'Multicolor', hex: '#FF6F61' }], weight: 0.2, width: 10, height: 5, depth: 10, countryOfOrigin: { ar: 'بولندا', en: 'Poland' }, materials: [{ ar: 'بلاستيك', en: 'Plastic' }], ageGroup: { ar: '6+ سنوات', en: '6+ years' }, protection: { ar: 'قطع أصلية', en: 'Original pieces' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
    ],
    'pet-supplies': [
      { colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 5.0, width: 40, height: 20, depth: 30, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'حبوب ذرة', en: 'Corn Grains' }], petType: { ar: 'قطط', en: 'Cats' }, protection: { ar: 'غني بالفيتامينات', en: 'Vitamin enriched' }, warranty: { ar: 'صالح لمدة 6 أشهر', en: '6-month shelf life' } },
      { colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }, { nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }], weight: 8.0, width: 45, height: 25, depth: 35, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'لحم وبقوليات', en: 'Meat & Legumes' }], petType: { ar: 'كلاب', en: 'Dogs' }, protection: { ar: 'غني بالبروتين', en: 'Protein enriched' }, warranty: { ar: 'صالح لمدة 6 أشهر', en: '6-month shelf life' } },
      { colors: [{ nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }, { nameAr: 'وردي', nameEn: 'Pink', hex: '#FF69B4' }], weight: 0.5, width: 15, height: 10, depth: 15, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'سيراميك', en: 'Ceramic' }], petType: { ar: 'قطط وكلاب', en: 'Cats & Dogs' }, protection: { ar: 'آمن للطعام', en: 'Food safe' }, warranty: { ar: '6 أشهر', en: '6 Months' } },
      { colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }, { nameAr: 'برتقالي', nameEn: 'Orange', hex: '#FF8C00' }], weight: 0.1, width: 8, height: 8, depth: 8, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'مطاط', en: 'Rubber' }], petType: { ar: 'كلاب', en: 'Dogs' }, protection: { ar: 'غير سام', en: 'Non-toxic' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
      { colors: [{ nameAr: 'بيج', nameEn: 'Beige', hex: '#F5F5DC' }], weight: 1.0, width: 30, height: 20, depth: 25, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قماش', en: 'Fabric' }], petType: { ar: 'قطط', en: 'Cats' }, protection: { ar: 'مريح ودافئ', en: 'Warm & comfortable' }, warranty: { ar: '3 أشهر', en: '3 Months' } },
    ],
    'ornamental-plants': [
      { colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }], weight: 2.0, width: 25, height: 40, depth: 25, countryOfOrigin: { ar: 'هولندا', en: 'Netherlands' }, materials: [{ ar: 'نبات طبيعي', en: 'Natural Plant' }], plantType: { ar: 'داخلي', en: 'Indoor' }, protection: { ar: 'وصول سليم مضمون', en: 'Guaranteed safe arrival' }, warranty: { ar: 'استبدال خلال 7 أيام', en: '7-day replacement' } },
      { colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }, { nameAr: 'أحمر', nameEn: 'Red', hex: '#CC0000' }], weight: 1.5, width: 20, height: 35, depth: 20, countryOfOrigin: { ar: 'هولندا', en: 'Netherlands' }, materials: [{ ar: 'نبات طبيعي', en: 'Natural Plant' }], plantType: { ar: 'داخلي مزهر', en: 'Indoor flowering' }, protection: { ar: 'وصول سليم مضمون', en: 'Guaranteed safe arrival' }, warranty: { ar: 'استبدال خلال 7 أيام', en: '7-day replacement' } },
      { colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }], weight: 0.5, width: 15, height: 20, depth: 15, countryOfOrigin: { ar: 'محلي', en: 'Local' }, materials: [{ ar: 'صبار طبيعي', en: 'Natural Cactus' }], plantType: { ar: 'صحراوي', en: 'Desert' }, protection: { ar: 'يتحمل الجفاف', en: 'Drought tolerant' }, warranty: { ar: 'استبدال خلال 7 أيام', en: '7-day replacement' } },
      { colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }], weight: 3.0, width: 30, height: 50, depth: 30, countryOfOrigin: { ar: 'هولندا', en: 'Netherlands' }, materials: [{ ar: 'نبات طبيعي', en: 'Natural Plant' }], plantType: { ar: 'خارجي', en: 'Outdoor' }, protection: { ar: 'وصول سليم مضمون', en: 'Guaranteed safe arrival' }, warranty: { ar: 'استبدال خلال 7 أيام', en: '7-day replacement' } },
      { colors: [{ nameAr: 'أخضر فاتح', nameEn: 'Light Green', hex: '#90EE90' }], weight: 1.0, width: 18, height: 25, depth: 18, countryOfOrigin: { ar: 'محلي', en: 'Local' }, materials: [{ ar: 'نبات طبيعي', en: 'Natural Plant' }], plantType: { ar: 'عطري', en: 'Aromatic' }, protection: { ar: 'طبيعي 100%', en: '100% Natural' }, warranty: { ar: 'استبدال خلال 7 أيام', en: '7-day replacement' } },
    ],
    'gifts-antiques': [
      { colors: [{ nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }, { nameAr: 'فضي', nameEn: 'Silver', hex: '#C0C0C0' }], weight: 0.5, width: 15, height: 20, depth: 10, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'كريستال', en: 'Crystal' }], finish: { ar: 'لامع', en: 'Glossy' }, protection: { ar: 'تغليف هدايا', en: 'Gift packaging' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 1.0, width: 20, height: 30, depth: 15, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'خشب زان', en: 'Beech Wood' }], finish: { ar: 'قديم', en: 'Antique' }, protection: { ar: 'مصنوع يدوياً', en: 'Handcrafted' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'أبيض', nameEn: 'White', hex: '#FFFFFF' }, { nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }], weight: 2.0, width: 25, height: 25, depth: 25, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'رخام', en: 'Marble' }], finish: { ar: 'مصقول', en: 'Polished' }, protection: { ar: 'قاعدة مانعة للانزلاق', en: 'Anti-slip base' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'نحاسي', nameEn: 'Copper', hex: '#B87333' }], weight: 0.8, width: 12, height: 18, depth: 12, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'نحاس', en: 'Copper' }], finish: { ar: 'مطروق', en: 'Hammered' }, protection: { ar: 'مصنوع يدوياً', en: 'Handcrafted' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'أخضر', nameEn: 'Green', hex: '#228B22' }, { nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 0.3, width: 10, height: 15, depth: 10, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'زجاج', en: 'Glass' }], finish: { ar: 'مطلي', en: 'Painted' }, protection: { ar: 'تغليف فاخر', en: 'Premium packaging' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
    ],
    'wall-art': [
      { colors: [{ nameAr: 'متعدد الألوان', nameEn: 'Multicolor', hex: '#FF6F61' }], weight: 1.0, width: 60, height: 40, depth: 3, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'قماش كنفاس', en: 'Canvas' }], finish: { ar: 'مطلي بإطار', en: 'Framed' }, protection: { ar: 'تغليف آمن', en: 'Safe packaging' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'أسود وأبيض', nameEn: 'Black & White', hex: '#808080' }], weight: 0.8, width: 50, height: 70, depth: 2, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'ورق فاخر', en: 'Premium Paper' }], finish: { ar: 'بدون إطار', en: 'Unframed' }, protection: { ar: 'تغليف أسطواني', en: 'Roll packaging' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'ذهبي', nameEn: 'Gold', hex: '#FFD700' }, { nameAr: 'أسود', nameEn: 'Black', hex: '#1a1a1a' }], weight: 2.0, width: 80, height: 60, depth: 4, countryOfOrigin: { ar: 'تركيا', en: 'Turkey' }, materials: [{ ar: 'خشب', en: 'Wood' }, { ar: 'معدن', en: 'Metal' }], finish: { ar: 'ثلاثي الأبعاد', en: '3D' }, protection: { ar: 'تغليف فاخر', en: 'Premium packaging' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'أزرق', nameEn: 'Blue', hex: '#4A90D9' }], weight: 0.5, width: 40, height: 40, depth: 2, countryOfOrigin: { ar: 'الصين', en: 'China' }, materials: [{ ar: 'أكريليك', en: 'Acrylic' }], finish: { ar: 'لامع', en: 'Glossy' }, protection: { ar: 'تغليف آمن', en: 'Safe packaging' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
      { colors: [{ nameAr: 'بني', nameEn: 'Brown', hex: '#8B4513' }], weight: 1.5, width: 70, height: 50, depth: 3, countryOfOrigin: { ar: 'مصر', en: 'Egypt' }, materials: [{ ar: 'خشب', en: 'Wood' }], finish: { ar: 'حفر يدوي', en: 'Hand carved' }, protection: { ar: 'مصنوع يدوياً', en: 'Handcrafted' }, warranty: { ar: 'استبدال عند الاستلام', en: 'Replacement on delivery' } },
    ],
  }

  let attributesUpdated = 0
  for (const prod of allProductsWithCategories) {
    const catSlug = prod.category?.slug
    if (!catSlug || !categoryAttributes[catSlug]) continue
    const catAttrs = categoryAttributes[catSlug]
    // Find index within this category's products
    const sameCategoryProducts = allProductsWithCategories.filter(p => p.category?.slug === catSlug)
    const idxInCategory = sameCategoryProducts.indexOf(prod)
    const attrTemplate = catAttrs[idxInCategory % catAttrs.length]
    if (!attrTemplate) continue

    await db.product.update({
      where: { id: prod.id },
      data: { attributes: JSON.stringify(attrTemplate) },
    })
    attributesUpdated++
  }

  console.log(`✅ ${attributesUpdated} products updated with comprehensive attributes`)

  // ─── Reviews ───────────────────────────────────────────────
  console.log('⭐ Creating reviews...')

  const reviewProducts = await db.product.findMany({ take: 8 })

  const reviews = [
    {
      productId: reviewProducts[0]?.id,
      userId: guestUser.id,
      rating: 5,
      title: 'منتج ممتاز',
      comment: 'قدر ستانلس ستيل عالي الجودة، أنصح به بشدة. الطبخ فيه متعة والتنظيف سهل جداً.',
      isVerified: true,
      isActive: true,
      createdAt: new Date('2026-02-15'),
    },
    {
      productId: reviewProducts[1]?.id,
      userId: guestUser2.id,
      rating: 4,
      title: 'طقم جيد لكن السعر مرتفع',
      comment: 'طقم أواني ممتاز وعملي، لكن السعر كان يمكن أن يكون أفضل. الجودة عالية والطبقة غير اللاصقة فعالة.',
      isVerified: true,
      isActive: true,
      createdAt: new Date('2026-02-20'),
    },
    {
      productId: reviewProducts[2]?.id,
      userId: guestUser.id,
      rating: 5,
      title: 'أفضل مقلاة',
      comment: 'مقلاة تيفال رائعة! الطبقة غير الاصقة ممتازة ولا تلتصق بها الأطعمة أبداً. أنصح بها لكل ربة بيت.',
      isVerified: true,
      isActive: true,
      createdAt: new Date('2026-03-01'),
    },
    {
      productId: reviewProducts[3]?.id,
      userId: guestUser2.id,
      rating: 3,
      title: 'جودة متوسطة',
      comment: 'المنتج جيد لكن لم يكن كما توقعت. يحتاج إلى تحسين في المقبض.',
      isVerified: false,
      isActive: true,
      createdAt: new Date('2026-03-03'),
    },
    {
      productId: reviewProducts[4]?.id,
      userId: guestUser.id,
      rating: 5,
      title: 'تراث ليبي أصيل',
      comment: 'قدر نحاسي تقليدي مصنوع بحرفية عالية! يعكس التراث الليبي الأصيل. قطعة فنية وعملية في نفس الوقت.',
      isVerified: true,
      isActive: true,
      createdAt: new Date('2026-03-05'),
    },
    {
      productId: reviewProducts[5]?.id,
      userId: guestUser2.id,
      rating: 4,
      title: 'ملاعق خشبية مريحة',
      comment: 'طقم ملاعق خشبية مريح جداً في الاستخدام. الخشب طبيعي ولا يخدش الأواني. سأشتري مرة أخرى.',
      isVerified: false,
      isActive: true,
      createdAt: new Date('2026-03-06'),
    },
    {
      productId: reviewProducts[6]?.id,
      userId: guestUser.id,
      rating: 4,
      title: 'إبريق شاي أنيق',
      comment: 'إبريق شاي زجاجي أنيق جداً. المنخل المدمج ميزة رائعة. فقط يحتاج عناية في الغسيل لأنه زجاج.',
      isVerified: true,
      isActive: true,
      createdAt: new Date('2026-03-08'),
    },
    {
      productId: reviewProducts[7]?.id,
      userId: guestUser2.id,
      rating: 3,
      title: 'منتج عادي',
      comment: 'المنتج يؤدي الغرض لكن لا يوجد شيء مميز. يمكن العثور على أفضل بسعر مشابه.',
      isVerified: false,
      isActive: true,
      createdAt: new Date('2026-03-09'),
    },
  ]

  let reviewsCreated = 0
  for (const review of reviews) {
    if (review.productId) {
      await db.review.create({ data: review })
      reviewsCreated++
    }
  }

  console.log(`✅ ${reviewsCreated} reviews created`)

  // ─── Inventory Movements ──────────────────────────────────
  console.log('📋 Creating inventory movements...')

  const inventoryProducts = await db.product.findMany({ take: 10 })

  const inventoryMovements = [
    { productId: inventoryProducts[0]?.id, type: 'in', quantity: 50, reference: 'PO-2026-001', note: 'Initial stock receipt from Libya Kitchen', createdBy: admin.id, createdAt: new Date('2026-02-01') },
    { productId: inventoryProducts[0]?.id, type: 'out', quantity: 5, reference: 'NBD-20260301-1234', note: 'Order fulfillment', createdBy: admin.id, createdAt: new Date('2026-03-01') },
    { productId: inventoryProducts[1]?.id, type: 'in', quantity: 30, reference: 'PO-2026-002', note: 'Restock from East Utensils', createdBy: admin.id, createdAt: new Date('2026-02-05') },
    { productId: inventoryProducts[1]?.id, type: 'out', quantity: 3, reference: 'NBD-20260305-2345', note: 'Order fulfillment', createdBy: admin.id, createdAt: new Date('2026-03-05') },
    { productId: inventoryProducts[2]?.id, type: 'in', quantity: 80, reference: 'PO-2026-003', note: 'Bulk stock from supplier', createdBy: admin.id, createdAt: new Date('2026-02-10') },
    { productId: inventoryProducts[3]?.id, type: 'adjustment', quantity: -5, reference: 'ADJ-2026-001', note: 'Damaged items during transport', createdBy: admin.id, createdAt: new Date('2026-02-15') },
    { productId: inventoryProducts[4]?.id, type: 'in', quantity: 20, reference: 'PO-2026-004', note: 'Heritage Makers artisan batch', createdBy: admin.id, createdAt: new Date('2026-02-20') },
    { productId: inventoryProducts[5]?.id, type: 'out', quantity: 2, reference: 'NBD-20260307-3456', note: 'Order fulfillment', createdBy: admin.id, createdAt: new Date('2026-03-07') },
    { productId: inventoryProducts[6]?.id, type: 'in', quantity: 60, reference: 'PO-2026-005', note: 'New stock arrival', createdBy: admin.id, createdAt: new Date('2026-02-25') },
    { productId: inventoryProducts[7]?.id, type: 'adjustment', quantity: -3, reference: 'ADJ-2026-002', note: 'Inventory count correction', createdBy: admin.id, createdAt: new Date('2026-03-01') },
    { productId: inventoryProducts[0]?.id, type: 'return', quantity: 2, reference: 'RET-2026-001', note: 'Customer return - wrong size', createdBy: admin.id, createdAt: new Date('2026-03-03') },
    { productId: inventoryProducts[8]?.id, type: 'in', quantity: 40, reference: 'PO-2026-006', note: 'Seasonal restock', createdBy: admin.id, createdAt: new Date('2026-03-05') },
    { productId: inventoryProducts[9]?.id, type: 'out', quantity: 4, reference: 'NBD-20260309-4567', note: 'Order fulfillment', createdBy: admin.id, createdAt: new Date('2026-03-09') },
    { productId: inventoryProducts[3]?.id, type: 'return', quantity: 1, reference: 'RET-2026-002', note: 'Defective item returned by customer', createdBy: admin.id, createdAt: new Date('2026-03-08') },
    { productId: inventoryProducts[5]?.id, type: 'adjustment', quantity: 2, reference: 'ADJ-2026-003', note: 'Found during warehouse audit', createdBy: admin.id, createdAt: new Date('2026-03-10') },
  ]

  let movementsCreated = 0
  for (const movement of inventoryMovements) {
    if (movement.productId) {
      await db.inventoryMovement.create({ data: movement as { productId: string; type: string; quantity: number; reference: string; note: string; createdBy: string; createdAt: Date } })
      movementsCreated++
    }
  }

  console.log(`✅ ${movementsCreated} inventory movements created`)

  // ─── Loyalty Transactions ─────────────────────────────────
  console.log('🏅 Creating loyalty transactions...')

  const loyaltyTransactions = [
    { userId: guestUser.id, type: 'earn', points: 50, description: 'نقاط من الطلب NBD-20260301-1234', createdAt: new Date('2026-03-01') },
    { userId: guestUser.id, type: 'earn', points: 35, description: 'نقاط من الطلب NBD-20260305-2345', createdAt: new Date('2026-03-05') },
    { userId: guestUser.id, type: 'bonus', points: 25, description: 'مكافأة ترحيبية للعميل الجديد', createdAt: new Date('2026-02-20') },
    { userId: guestUser.id, type: 'redeem', points: -20, description: 'استبدال نقاط بخصم على الطلب', createdAt: new Date('2026-03-10') },
    { userId: guestUser2.id, type: 'earn', points: 75, description: 'نقاط من الطلب NBD-20260220-8901', createdAt: new Date('2026-02-20') },
    { userId: guestUser2.id, type: 'earn', points: 60, description: 'نقاط من الطلب NBD-20260307-3456', createdAt: new Date('2026-03-07') },
    { userId: guestUser2.id, type: 'bonus', points: 50, description: 'مكافأة عضوية ذهبية', createdAt: new Date('2026-02-01') },
    { userId: guestUser2.id, type: 'redeem', points: -30, description: 'استبدال نقاط بخصم 30 دينار', createdAt: new Date('2026-03-05') },
  ]

  for (const txn of loyaltyTransactions) {
    await db.loyaltyTransaction.create({ data: txn })
  }

  console.log(`✅ ${loyaltyTransactions.length} loyalty transactions created`)

  // ─── Wallet Transactions ─────────────────────────────────
  console.log('💰 Creating wallet transactions...')

  const walletTransactions = [
    { userId: guestUser.id, type: 'deposit', amount: 100, currency: 'LYD', reference: 'WALLET-DEP-001', description: 'إيداع رصيد في المحفظة', status: 'completed', createdAt: new Date('2026-02-15') },
    { userId: guestUser.id, type: 'cashback', amount: 15, currency: 'LYD', reference: 'NBD-20260301-1234', description: 'استرداد نقدي من الطلب', status: 'completed', createdAt: new Date('2026-03-04') },
    { userId: guestUser.id, type: 'refund', amount: 55, currency: 'LYD', reference: 'NBD-20260225-7890', description: 'استرداد مبلغ الطلب الملغى', status: 'completed', createdAt: new Date('2026-02-26') },
    { userId: guestUser2.id, type: 'deposit', amount: 200, currency: 'LYD', reference: 'WALLET-DEP-002', description: 'إيداع رصيد في المحفظة', status: 'completed', createdAt: new Date('2026-02-10') },
    { userId: guestUser2.id, type: 'cashback', amount: 25, currency: 'LYD', reference: 'NBD-20260220-8901', description: 'استرداد نقدي من الطلب', status: 'completed', createdAt: new Date('2026-02-24') },
    { userId: guestUser2.id, type: 'refund', amount: 12, currency: 'LYD', reference: 'ADJ-REFUND-001', description: 'تعويض عن منتج تالف', status: 'completed', createdAt: new Date('2026-03-08') },
  ]

  for (const txn of walletTransactions) {
    await db.walletTransaction.create({ data: txn })
  }

  console.log(`✅ ${walletTransactions.length} wallet transactions created`)

  // ─── Summary ────────────────────────────────────────────────
  console.log('\n🎉 Seed completed successfully!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📂 Categories:     ${categories.length} (6 ACTIVE_MVP + 8 PHASE_2 + 4 PHASE_3)`)
  console.log(`📦 Products:       ${createdProducts.length} (41 kitchenware + 72 fashion/footwear + 24 home/electronics + 6 oud + 6 accessories)`)
  console.log(`👤 Admin User:     ${admin.phone}`)
  console.log(`👥 Guest Users:    2`)
  console.log(`🏪 Vendors:        ${createdVendors.length}`)
  console.log(`🚩 Feature Flags:  ${featureFlags.length}`)
  console.log(`🔔 Notifications:  ${notifications.length}`)
  console.log(`🎟️ Coupons:        ${coupons.length}`)
  console.log(`🚚 Delivery Zones: ${deliveryZones.length}`)
  console.log(`📊 Ledger Accounts:${ledgerAccounts.length}`)
  console.log(`⭐ Reviews:        ${reviewsCreated}`)
  console.log(`📋 Inv. Movements: ${movementsCreated}`)
  console.log(`🏅 Loyalty Txns:   ${loyaltyTransactions.length}`)
  console.log(`💰 Wallet Txns:    ${walletTransactions.length}`)
  console.log(`🛒 Sample Orders:  8`)
  console.log(`🔧 Product Attrs:  ${attributesUpdated}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
