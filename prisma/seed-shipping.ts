import { db } from '../src/lib/db'

async function main() {
  console.log('🚢 Seeding shipping companies...')
  console.log('━'.repeat(50))

  // ─── 1. Libya Express ─────────────────────────────────────────
  console.log('\n📦 Creating شركة ليبيا للشحن السريع (Libya Express)...')

  const libyaExpress = await db.shippingCompany.upsert({
    where: { slug: 'libya-express' },
    update: {
      nameAr: 'شركة ليبيا للشحن السريع',
      nameEn: 'Libya Express',
      logo: '🚀',
      phone: '+218 21 1234567',
      descriptionAr: 'أسرع خدمة توصيل في ليبيا - تغطية جميع المدن',
      trackingUrl: 'https://libyaexpress.ly/track/{trackingNumber}',
      isActive: true,
      isDefault: true,
      sortOrder: 1,
      baseFee: 15,
      freeAbove: 150,
      codSupported: true,
      codFee: 2,
      coverageType: 'all',
      avgDeliveryDays: 2,
    },
    create: {
      nameAr: 'شركة ليبيا للشحن السريع',
      nameEn: 'Libya Express',
      slug: 'libya-express',
      logo: '🚀',
      phone: '+218 21 1234567',
      descriptionAr: 'أسرع خدمة توصيل في ليبيا - تغطية جميع المدن',
      trackingUrl: 'https://libyaexpress.ly/track/{trackingNumber}',
      isActive: true,
      isDefault: true,
      sortOrder: 1,
      baseFee: 15,
      freeAbove: 150,
      codSupported: true,
      codFee: 2,
      coverageType: 'all',
      avgDeliveryDays: 2,
    },
  })

  console.log(`   ✅ Upserted: ${libyaExpress.nameAr} (id: ${libyaExpress.id})`)

  // ─── 2. Libya Post ─────────────────────────────────────────────
  console.log('\n📦 Creating بريد ليبيا (Libya Post)...')

  const libyaPost = await db.shippingCompany.upsert({
    where: { slug: 'libya-post' },
    update: {
      nameAr: 'بريد ليبيا',
      nameEn: 'Libya Post',
      logo: '📮',
      phone: '+218 21 9876543',
      descriptionAr: 'الخدمة البريدية الوطنية - أسعار اقتصادية',
      isActive: true,
      isDefault: false,
      sortOrder: 2,
      baseFee: 10,
      freeAbove: 100,
      codSupported: true,
      codFee: 0,
      coverageType: 'all',
      avgDeliveryDays: 4,
    },
    create: {
      nameAr: 'بريد ليبيا',
      nameEn: 'Libya Post',
      slug: 'libya-post',
      logo: '📮',
      phone: '+218 21 9876543',
      descriptionAr: 'الخدمة البريدية الوطنية - أسعار اقتصادية',
      isActive: true,
      isDefault: false,
      sortOrder: 2,
      baseFee: 10,
      freeAbove: 100,
      codSupported: true,
      codFee: 0,
      coverageType: 'all',
      avgDeliveryDays: 4,
    },
  })

  console.log(`   ✅ Upserted: ${libyaPost.nameAr} (id: ${libyaPost.id})`)

  // ─── 3. Al-Madina Delivery ─────────────────────────────────────
  console.log('\n📦 Creating شركة المدينة للتوصيل (Al-Madina Delivery)...')

  const alMadina = await db.shippingCompany.upsert({
    where: { slug: 'al-madina-delivery' },
    update: {
      nameAr: 'شركة المدينة للتوصيل',
      nameEn: 'Al-Madina Delivery',
      logo: '🏙️',
      descriptionAr: 'توصيل سريع داخل طرابلس والمنطقة الوسطى',
      isActive: true,
      isDefault: false,
      sortOrder: 3,
      baseFee: 8,
      freeAbove: 80,
      codSupported: true,
      codFee: 1,
      coverageType: 'regional',
      avgDeliveryDays: 1,
    },
    create: {
      nameAr: 'شركة المدينة للتوصيل',
      nameEn: 'Al-Madina Delivery',
      slug: 'al-madina-delivery',
      logo: '🏙️',
      descriptionAr: 'توصيل سريع داخل طرابلس والمنطقة الوسطى',
      isActive: true,
      isDefault: false,
      sortOrder: 3,
      baseFee: 8,
      freeAbove: 80,
      codSupported: true,
      codFee: 1,
      coverageType: 'regional',
      avgDeliveryDays: 1,
    },
  })

  console.log(`   ✅ Upserted: ${alMadina.nameAr} (id: ${alMadina.id})`)

  // ─── 4. Sahara Transport ───────────────────────────────────────
  console.log('\n📦 Creating شركة الصحراء للنقل (Sahara Transport)...')

  const saharaTransport = await db.shippingCompany.upsert({
    where: { slug: 'sahara-transport' },
    update: {
      nameAr: 'شركة الصحراء للنقل',
      nameEn: 'Sahara Transport',
      logo: '🏜️',
      descriptionAr: 'متخصصون في التوصيل للمناطق الجنوبية والجبلية',
      isActive: true,
      isDefault: false,
      sortOrder: 4,
      baseFee: 25,
      freeAbove: 200,
      codSupported: false,
      codFee: 0,
      coverageType: 'regional',
      avgDeliveryDays: 5,
    },
    create: {
      nameAr: 'شركة الصحراء للنقل',
      nameEn: 'Sahara Transport',
      slug: 'sahara-transport',
      logo: '🏜️',
      descriptionAr: 'متخصصون في التوصيل للمناطق الجنوبية والجبلية',
      isActive: true,
      isDefault: false,
      sortOrder: 4,
      baseFee: 25,
      freeAbove: 200,
      codSupported: false,
      codFee: 0,
      coverageType: 'regional',
      avgDeliveryDays: 5,
    },
  })

  console.log(`   ✅ Upserted: ${saharaTransport.nameAr} (id: ${saharaTransport.id})`)

  // ─── Coverage Zones ─────────────────────────────────────────────
  console.log('\n' + '━'.repeat(50))
  console.log('🗺️  Creating coverage zones...')
  console.log('━'.repeat(50))

  // ─── Al-Madina Delivery Coverage Zones ──────────────────────────
  console.log('\n🏙️  Creating coverage zones for Al-Madina Delivery...')

  // Check existing zones for Al-Madina to avoid duplicates
  const existingAlMadinaZones = await db.shippingCoverageZone.findMany({
    where: { companyId: alMadina.id },
    select: { cityName: true, areaName: true },
  })
  const alMadinaZoneKeys = new Set(
    existingAlMadinaZones.map((z) => `${z.cityName}||${z.areaName ?? ''}`)
  )

  const alMadinaZones = [
    // ── طرابلس center areas (10 LYD) ──
    { cityName: 'طرابلس', areaName: 'السياحية', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'قرقارش', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'حي الأندلس', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'قرجي', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'الدمشقي', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'المدينة القديمة', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'بن عاشور', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'الظهراء', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'شارع الزاوية', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'شارع بنغازي', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 10, freeAbove: 80, estimatedDays: 1 },

    // ── طرابلس outer areas (15 LYD) ──
    { cityName: 'طرابلس', areaName: 'تاجوراء', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 15, freeAbove: 100, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'عين زارة', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 15, freeAbove: 100, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'جنزور', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 15, freeAbove: 100, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'الهضبة الخضراء', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 15, freeAbove: 100, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'أبو سليم', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 15, freeAbove: 100, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'الحناكي', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 15, freeAbove: 100, estimatedDays: 1 },

    // ── طرابلس far areas (20 LYD) ──
    { cityName: 'طرابلس', areaName: 'الخلة', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 20, freeAbove: 120, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'السواني', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 20, freeAbove: 120, estimatedDays: 1 },
    { cityName: 'طرابلس', areaName: 'سوق الجمعة', regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 20, freeAbove: 120, estimatedDays: 1 },

    // ── هراوة (25 LYD) ──
    { cityName: 'هراوة', areaName: null, regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 25, freeAbove: 130, estimatedDays: 1 },

    // ── البريقة (28 LYD) ──
    { cityName: 'البريقة', areaName: null, regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 28, freeAbove: 140, estimatedDays: 1 },

    // ── رأس الأنوف (30 LYD) ──
    { cityName: 'رأس الأنوف', areaName: null, regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 30, freeAbove: 150, estimatedDays: 2 },

    // ── زليتن (25 LYD) ──
    { cityName: 'زليتن', areaName: null, regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 25, freeAbove: 130, estimatedDays: 1 },

    // ── الخمس (25 LYD) ──
    { cityName: 'الخمس', areaName: null, regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 25, freeAbove: 130, estimatedDays: 1 },

    // ── مصراتة (30 LYD) ──
    { cityName: 'مصراتة', areaName: null, regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 30, freeAbove: 150, estimatedDays: 2 },

    // ── ترهونة (28 LYD) ──
    { cityName: 'ترهونة', areaName: null, regionId: 'central', regionNameAr: 'المنطقة الوسطى', fee: 28, freeAbove: 140, estimatedDays: 2 },
  ]

  let alMadinaCreated = 0
  for (const zone of alMadinaZones) {
    const key = `${zone.cityName}||${zone.areaName ?? ''}`
    if (alMadinaZoneKeys.has(key)) {
      console.log(`   ⏭️  Skipped existing zone: ${zone.cityName}${zone.areaName ? ` - ${zone.areaName}` : ''}`)
      continue
    }
    await db.shippingCoverageZone.create({
      data: {
        companyId: alMadina.id,
        regionId: zone.regionId,
        regionNameAr: zone.regionNameAr,
        cityName: zone.cityName,
        areaName: zone.areaName,
        fee: zone.fee,
        freeAbove: zone.freeAbove,
        estimatedDays: zone.estimatedDays,
        isActive: true,
      },
    })
    alMadinaCreated++
    console.log(`   ✅ Created zone: ${zone.cityName}${zone.areaName ? ` - ${zone.areaName}` : ''} (${zone.fee} LYD)`)
  }
  console.log(`   📊 Al-Madina zones: ${alMadinaCreated} created, ${alMadinaZones.length - alMadinaCreated} skipped`)

  // ─── Sahara Transport Coverage Zones ────────────────────────────
  console.log('\n🏜️  Creating coverage zones for Sahara Transport...')

  // Check existing zones for Sahara Transport to avoid duplicates
  const existingSaharaZones = await db.shippingCoverageZone.findMany({
    where: { companyId: saharaTransport.id },
    select: { cityName: true, areaName: true },
  })
  const saharaZoneKeys = new Set(
    existingSaharaZones.map((z) => `${z.cityName}||${z.areaName ?? ''}`)
  )

  const saharaZones = [
    // ── سبها and surroundings (25-30 LYD) ──
    { cityName: 'سبها', areaName: 'المدينة', regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 25, freeAbove: 200, estimatedDays: 3 },
    { cityName: 'سبها', areaName: 'المنشة', regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 25, freeAbove: 200, estimatedDays: 3 },
    { cityName: 'سبها', areaName: 'الحكمة', regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 25, freeAbove: 200, estimatedDays: 3 },
    { cityName: 'سبها', areaName: 'النصر', regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 25, freeAbove: 200, estimatedDays: 3 },
    { cityName: 'سبها', areaName: 'الجديد', regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 25, freeAbove: 200, estimatedDays: 3 },

    // ── أوباري (30 LYD) ──
    { cityName: 'أوباري', areaName: 'المدينة', regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 30, freeAbove: 200, estimatedDays: 4 },
    { cityName: 'أوباري', areaName: 'المطار', regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 30, freeAbove: 200, estimatedDays: 4 },

    // ── مرزق (30 LYD) ──
    { cityName: 'مرزق', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 30, freeAbove: 200, estimatedDays: 4 },

    // ── براك الشاطي (35 LYD) ──
    { cityName: 'براك الشاطي', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 35, freeAbove: 200, estimatedDays: 4 },

    // ── أغرمي (35 LYD) ──
    { cityName: 'أغرمي', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 35, freeAbove: 200, estimatedDays: 4 },

    // ── غات (40 LYD) ──
    { cityName: 'غات', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 40, freeAbove: 200, estimatedDays: 5 },

    // ── غدامس (40 LYD) ──
    { cityName: 'غدامس', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 40, freeAbove: 200, estimatedDays: 5 },

    // ── الكفرة (45 LYD) ──
    { cityName: 'الكفرة', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 45, freeAbove: 200, estimatedDays: 5 },

    // ── أوجلة (40 LYD) ──
    { cityName: 'أوجلة', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 40, freeAbove: 200, estimatedDays: 5 },

    // ── جالو (42 LYD) ──
    { cityName: 'جالو', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 42, freeAbove: 200, estimatedDays: 5 },

    // ── الزويتينة (45 LYD) ──
    { cityName: 'الزويتينة', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 45, freeAbove: 200, estimatedDays: 5 },

    // ── Mountain region cities ──
    // ── يفرن (28 LYD) ──
    { cityName: 'يفرن', areaName: null, regionId: 'mountain-south', regionNameAr: 'المنطقة الجبلية', fee: 28, freeAbove: 200, estimatedDays: 3 },

    // ── نالوت (32 LYD) ──
    { cityName: 'نالوت', areaName: null, regionId: 'mountain-south', regionNameAr: 'المنطقة الجبلية', fee: 32, freeAbove: 200, estimatedDays: 3 },

    // ── كاباو (35 LYD) ──
    { cityName: 'كاباو', areaName: null, regionId: 'mountain-south', regionNameAr: 'المنطقة الجبلية', fee: 35, freeAbove: 200, estimatedDays: 4 },

    // ── جادو (30 LYD) ──
    { cityName: 'جادو', areaName: null, regionId: 'mountain-south', regionNameAr: 'المنطقة الجبلية', fee: 30, freeAbove: 200, estimatedDays: 3 },

    // ── مزدة (28 LYD) ──
    { cityName: 'مزدة', areaName: null, regionId: 'mountain-south', regionNameAr: 'المنطقة الجبلية', fee: 28, freeAbove: 200, estimatedDays: 3 },

    // ── بئر الغنم (30 LYD) ──
    { cityName: 'بئر الغنم', areaName: null, regionId: 'mountain-south', regionNameAr: 'المنطقة الجبلية', fee: 30, freeAbove: 200, estimatedDays: 3 },

    // ── وادي الشاطي (38 LYD) ──
    { cityName: 'وادي الشاطي', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 38, freeAbove: 200, estimatedDays: 4 },

    // ── مرزق المناطق (35 LYD) ──
    { cityName: 'تراغن', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 35, freeAbove: 200, estimatedDays: 4 },

    // ── القرضة (50 LYD) ──
    { cityName: 'القرضة', areaName: null, regionId: 'southern', regionNameAr: 'المنطقة الجنوبية', fee: 50, freeAbove: 200, estimatedDays: 5 },
  ]

  let saharaCreated = 0
  for (const zone of saharaZones) {
    const key = `${zone.cityName}||${zone.areaName ?? ''}`
    if (saharaZoneKeys.has(key)) {
      console.log(`   ⏭️  Skipped existing zone: ${zone.cityName}${zone.areaName ? ` - ${zone.areaName}` : ''}`)
      continue
    }
    await db.shippingCoverageZone.create({
      data: {
        companyId: saharaTransport.id,
        regionId: zone.regionId,
        regionNameAr: zone.regionNameAr,
        cityName: zone.cityName,
        areaName: zone.areaName,
        fee: zone.fee,
        freeAbove: zone.freeAbove,
        estimatedDays: zone.estimatedDays,
        isActive: true,
      },
    })
    saharaCreated++
    console.log(`   ✅ Created zone: ${zone.cityName}${zone.areaName ? ` - ${zone.areaName}` : ''} (${zone.fee} LYD)`)
  }
  console.log(`   📊 Sahara zones: ${saharaCreated} created, ${saharaZones.length - saharaCreated} skipped`)

  // ─── Summary ────────────────────────────────────────────────────
  console.log('\n' + '━'.repeat(50))
  console.log('📋 SEED SUMMARY')
  console.log('━'.repeat(50))

  const totalCompanies = await db.shippingCompany.count()
  const totalZones = await db.shippingCoverageZone.count()

  console.log(`
  🏢 Shipping Companies: ${totalCompanies}
     ├── 🚀 Libya Express (وطنية - تغطية شاملة)
     ├── 📮 Libya Post (وطنية - اقتصادية)
     ├── 🏙️ Al-Madina Delivery (وسطى - طرابلس والمنطقة الوسطى)
     └── 🏜️ Sahara Transport (جنوبية وجبلية - المناطق النائية)

  🗺️  Coverage Zones: ${totalZones}
     ├── Al-Madina Delivery: ${alMadinaCreated + existingAlMadinaZones.length} zones
     └── Sahara Transport: ${saharaCreated + existingSaharaZones.length} zones

  ✅ Shipping seed completed successfully!
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
