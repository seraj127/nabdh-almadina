/**
 * Generate high-quality category images for City Pulse (نبض المدينة)
 * Uses z-ai-web-dev-sdk image generation
 * 
 * Run: bun run scripts/generate-category-images.ts
 */
import ZAI from 'z-ai-web-dev-sdk';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'public', 'categories');

interface CategoryDef {
  slug: string;
  nameAr: string;
  nameEn: string;
  prompt: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    slug: 'cookware',
    nameAr: 'أواني الطبخ',
    nameEn: 'Cookware',
    prompt: 'Professional product photography of premium cookware set including pots, pans and saucepans arranged elegantly on a dark marble countertop, warm golden lighting, studio quality, luxury kitchenware, top-down view, 4K commercial photography style, soft shadows, clean background',
  },
  {
    slug: 'kitchen-tools',
    nameAr: 'أدوات المطبخ',
    nameEn: 'Kitchen Tools',
    prompt: 'Professional product photography of premium kitchen utensils set - wooden spoons, whisks, spatulas, tongs arranged artistically on dark surface, warm ambient lighting, studio quality, luxury kitchen tools, commercial photography, soft shadows, elegant composition',
  },
  {
    slug: 'serving-ware',
    nameAr: 'أدوات التقديم',
    nameEn: 'Serving Ware',
    prompt: 'Professional product photography of elegant serving ware - decorative plates, platters, and serving dishes arranged on a dark table, warm golden lighting, studio quality, fine dining presentation, luxury tableware, 4K commercial photography, soft bokeh background',
  },
  {
    slug: 'cups-pitchers',
    nameAr: 'أكواب وأباريق',
    nameEn: 'Cups & Pitchers',
    prompt: 'Professional product photography of beautiful glass cups, tea sets and elegant pitchers arranged on dark surface, warm ambient lighting, studio quality, luxury drinkware, crystal and glass reflections, 4K commercial photography, moody elegant atmosphere',
  },
  {
    slug: 'preparation-tools',
    nameAr: 'أدوات التحضير',
    nameEn: 'Preparation Tools',
    prompt: 'Professional product photography of kitchen preparation tools - cutting boards, knives, mixing bowls, measuring cups arranged on dark countertop, warm lighting, studio quality, premium cooking tools, 4K commercial photography, clean minimalist composition',
  },
  {
    slug: 'food-storage',
    nameAr: 'تخزين الطعام',
    nameEn: 'Food Storage',
    prompt: 'Professional product photography of premium food storage containers - glass and plastic containers, jars organized neatly on dark surface, warm lighting, studio quality, modern kitchen organization, 4K commercial photography, clean elegant styling',
  },
  {
    slug: 'fashion-men',
    nameAr: 'ملابس رجالية',
    nameEn: "Men's Fashion",
    prompt: 'Professional fashion photography of stylish men clothing - tailored suit, dress shirts, and accessories arranged elegantly, dark moody background, studio quality lighting, luxury menswear, fashion editorial style, 4K commercial photography, sophisticated atmosphere',
  },
  {
    slug: 'fashion-women',
    nameAr: 'ملابس نسائية',
    nameEn: "Women's Fashion",
    prompt: 'Professional fashion photography of elegant women clothing - beautiful dress, abaya, and fashionable outfits arranged artistically, soft warm lighting, dark background, luxury fashion, editorial style, 4K commercial photography, glamorous and sophisticated',
  },
  {
    slug: 'fashion-kids',
    nameAr: 'ملابس أطفال ومواليد',
    nameEn: 'Kids & Baby Fashion',
    prompt: 'Professional photography of adorable children and baby clothing - colorful kids outfits, baby onesies, and cute dresses arranged beautifully, soft warm lighting, pastel colors, dark subtle background, studio quality, 4K commercial photography, heartwarming and cheerful',
  },
  {
    slug: 'footwear-men',
    nameAr: 'أحذية رجالية',
    nameEn: "Men's Footwear",
    prompt: 'Professional product photography of premium men shoes - leather dress shoes, sneakers, and boots arranged on dark surface, dramatic studio lighting, luxury footwear, 4K commercial photography, elegant masculine composition, rich textures and materials',
  },
  {
    slug: 'footwear-women',
    nameAr: 'أحذية نسائية',
    nameEn: "Women's Footwear",
    prompt: 'Professional product photography of elegant women shoes - heels, flats, and fashionable sandals arranged artistically, soft warm lighting, dark background, luxury women footwear, 4K commercial photography, glamorous and feminine, refined details',
  },
  {
    slug: 'footwear-kids',
    nameAr: 'أحذية أطفال',
    nameEn: 'Kids Footwear',
    prompt: 'Professional product photography of cute kids shoes - small sneakers, sandals, and boots arranged playfully, bright warm lighting, dark subtle background, quality children footwear, 4K commercial photography, colorful and cheerful, adorable composition',
  },
  {
    slug: 'perfumes-oud',
    nameAr: 'العطور والبخور',
    nameEn: 'Perfumes & Oud',
    prompt: 'Professional product photography of luxury perfume bottles and oud - elegant fragrance bottles, incense burners, and oud wood arranged on dark velvet surface, dramatic golden lighting, luxury Arabian perfumery, 4K commercial photography, opulent and mystical atmosphere, rich colors',
  },
  {
    slug: 'accessories',
    nameAr: 'الإكسسوارات والساعات',
    nameEn: 'Accessories & Watches',
    prompt: 'Professional product photography of luxury accessories - elegant watches, jewelry, sunglasses, and leather bags arranged on dark surface, dramatic studio lighting, luxury lifestyle accessories, 4K commercial photography, sophisticated and refined, golden accents',
  },
  {
    slug: 'mother-baby',
    nameAr: 'مستلزمات الأم والطفل',
    nameEn: 'Mother & Baby',
    prompt: 'Professional product photography of baby products - baby bottles, diapers, baby care items, and stroller arranged warmly, soft gentle lighting, dark subtle background, premium baby products, 4K commercial photography, tender and caring atmosphere, pastel accents',
  },
  {
    slug: 'home-care',
    nameAr: 'العناية بالبيت',
    nameEn: 'Home Care',
    prompt: 'Professional product photography of home care products - premium cleaning supplies, fresheners, and detergents arranged neatly, clean bright lighting, dark surface, quality household products, 4K commercial photography, fresh and clean aesthetic, organized composition',
  },
  {
    slug: 'electrical-appliances',
    nameAr: 'الأدوات الكهربائية',
    nameEn: 'Electrical Appliances',
    prompt: 'Professional product photography of modern home appliances - coffee maker, blender, vacuum cleaner arranged on dark surface, dramatic blue-white lighting, premium home appliances, 4K commercial photography, sleek and modern technology, metallic accents',
  },
  {
    slug: 'electronics',
    nameAr: 'الإلكترونيات',
    nameEn: 'Electronics',
    prompt: 'Professional product photography of latest electronics - smartphone, laptop, headphones, and smartwatch arranged on dark surface, dramatic blue accent lighting, premium tech products, 4K commercial photography, futuristic and sleek, screen glow effects',
  },
  {
    slug: 'ornamental-plants',
    nameAr: 'نباتات الزينة',
    nameEn: 'Ornamental Plants',
    prompt: 'Professional photography of beautiful ornamental plants - indoor potted plants, succulents, and fresh flowers arranged in decorative pots, warm natural lighting, dark background, lush green plants, 4K commercial photography, fresh and vibrant, botanical elegance',
  },
  {
    slug: 'pet-supplies',
    nameAr: 'مستلزمات الحيوانات',
    nameEn: 'Pet Supplies',
    prompt: 'Professional product photography of pet supplies - premium pet food, toys, collars, and beds arranged playfully, warm friendly lighting, dark subtle background, quality pet products, 4K commercial photography, fun and inviting atmosphere, adorable pet accessories',
  },
  {
    slug: 'children-toys',
    nameAr: 'ألعاب أطفال',
    nameEn: "Children's Toys",
    prompt: 'Professional product photography of colorful children toys - building blocks, stuffed animals, educational toys arranged creatively, bright warm lighting, dark subtle background, premium toy collection, 4K commercial photography, playful and magical atmosphere, vibrant colors',
  },
  {
    slug: 'gifts-antiques',
    nameAr: 'التحف والهدايا',
    nameEn: 'Antiques & Gifts',
    prompt: 'Professional product photography of elegant gifts and antiques - decorative antique vase, gift boxes, candles, and ornamental pieces arranged on dark velvet surface, warm golden lighting, luxury collectibles, 4K commercial photography, opulent and timeless, rich textures',
  },
  {
    slug: 'wall-art',
    nameAr: 'الجداريات',
    nameEn: 'Wall Art & Decor',
    prompt: 'Professional photography of stunning wall art and decor - framed paintings, wall clocks, mirrors, and decorative wall pieces arranged artistically, warm ambient lighting, dark background, luxury home decor, 4K commercial photography, gallery style presentation, elegant and refined',
  },
];

async function generateImages() {
  console.log(`\n🎨 Generating ${CATEGORIES.length} category images...\n`);

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const zai = await ZAI.create();
  
  let success = 0;
  let failed = 0;

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const outputPath = join(OUTPUT_DIR, `${cat.slug}.png`);
    
    // Skip if image already exists
    if (existsSync(outputPath)) {
      console.log(`⏭️  [${i + 1}/${CATEGORIES.length}] Skipping ${cat.slug} - already exists`);
      success++;
      continue;
    }

    console.log(`🖼️  [${i + 1}/${CATEGORIES.length}] Generating: ${cat.nameEn} (${cat.slug})...`);

    try {
      const response = await zai.images.generations.create({
        prompt: cat.prompt,
        size: '1024x1024',
      });

      if (response.data && response.data.length > 0 && response.data[0].base64) {
        const buffer = Buffer.from(response.data[0].base64, 'base64');
        writeFileSync(outputPath, buffer);
        console.log(`✅  Saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
        success++;
      } else {
        console.error(`❌  No image data returned for ${cat.slug}`);
        failed++;
      }
    } catch (error: any) {
      console.error(`❌  Error generating ${cat.slug}: ${error.message || error}`);
      failed++;
    }

    // Small delay between requests
    if (i < CATEGORIES.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n📊 Results: ${success} generated, ${failed} failed out of ${CATEGORIES.length}\n`);
}

generateImages().catch(console.error);
