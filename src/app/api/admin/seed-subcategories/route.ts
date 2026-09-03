import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

// POST /api/admin/seed-subcategories â€” Seed all subcategories for the 23 parent categories
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const subcategories = [
      // cookware - ط£ظˆط§ظ†ظٹ ط§ظ„ط·ط¨ط®
      { slug: 'pots-pans', nameAr: 'ط·ظ†ط§ط¬ط± ظˆظ‚ط¯ظˆط±', nameEn: 'Pots & Pans', parentSlug: 'cookware', icon: 'ًں«•', sortOrder: 1 },
      { slug: 'frying-pans', nameAr: 'ظ…ظ‚ط§ظ„ظٹ ظˆطھط§ظˆط§طھ', nameEn: 'Frying Pans', parentSlug: 'cookware', icon: 'ًںچ³', sortOrder: 2 },
      { slug: 'ovenware', nameAr: 'ط£ظˆط§ظ†ظٹ ظپط±ظ†', nameEn: 'Ovenware', parentSlug: 'cookware', icon: 'ًں¥ک', sortOrder: 3 },
      { slug: 'pressure-cookers', nameAr: 'ط£ظˆط§ظ†ظٹ ط¶ط؛ط·', nameEn: 'Pressure Cookers', parentSlug: 'cookware', icon: 'â™¨ï¸ڈ', sortOrder: 4 },
      { slug: 'nonstick', nameAr: 'ط£ظˆط§ظ†ظٹ ط؛ظٹط± ظ„ط§طµظ‚ط©', nameEn: 'Nonstick Cookware', parentSlug: 'cookware', icon: 'ًں¥‍', sortOrder: 5 },
      { slug: 'stainless-steel', nameAr: 'ط£ظˆط§ظ†ظٹ ط³طھط§ظ†ظ„ط³ ط³طھظٹظ„', nameEn: 'Stainless Steel', parentSlug: 'cookware', icon: 'ًںھ™', sortOrder: 6 },
      { slug: 'fryer-pots', nameAr: 'ط·ظ†ط§ط¬ط± ظپط±ط§ظٹط²ط±', nameEn: 'Fryer Pots', parentSlug: 'cookware', icon: 'ًںچں', sortOrder: 7 },

      // kitchen-tools - ط£ط¯ظˆط§طھ ط§ظ„ظ…ط·ط¨ط®
      { slug: 'spoons-whisks', nameAr: 'ظ…ظ„ط§ط¹ظ‚ ظˆظ…ط؛ط§ط²ظ„', nameEn: 'Spoons & Whisks', parentSlug: 'kitchen-tools', icon: 'ًں¥„', sortOrder: 1 },
      { slug: 'knives-cutting', nameAr: 'ط³ظƒط§ظƒظٹظ† ظˆط£ط¯ظˆط§طھ طھظ‚ط·ظٹط¹', nameEn: 'Knives & Cutting', parentSlug: 'kitchen-tools', icon: 'ًں”ھ', sortOrder: 2 },
      { slug: 'spatulas-turners', nameAr: 'ظ…ط¨ط§ط´ط± ظˆط£ط¯ظˆط§طھ طھظ‚ظ„ظٹط¨', nameEn: 'Spatulas & Turners', parentSlug: 'kitchen-tools', icon: 'ًں¥„', sortOrder: 3 },
      { slug: 'strainers-squeezers', nameAr: 'ط¹طµط± ظˆطھطµظپظٹط©', nameEn: 'Strainers & Squeezers', parentSlug: 'kitchen-tools', icon: 'ًں§ƒ', sortOrder: 4 },
      { slug: 'measuring-tools', nameAr: 'ط£ط¯ظˆط§طھ ظ‚ظٹط§ط³', nameEn: 'Measuring Tools', parentSlug: 'kitchen-tools', icon: 'ًں§®', sortOrder: 5 },
      { slug: 'cutting-boards', nameAr: 'ط£ظ„ظˆط§ط­ طھظ‚ط·ظٹط¹', nameEn: 'Cutting Boards', parentSlug: 'kitchen-tools', icon: 'ًںھµ', sortOrder: 6 },

      // serving-ware - ط£ط¯ظˆط§طھ ط§ظ„طھظ‚ط¯ظٹظ…
      { slug: 'plates-dishes', nameAr: 'طµط­ظˆظ† ظˆط£ط·ط¨ط§ظ‚', nameEn: 'Plates & Dishes', parentSlug: 'serving-ware', icon: 'ًںچ½ï¸ڈ', sortOrder: 1 },
      { slug: 'serving-trays', nameAr: 'طµظˆط§ظ†ظٹ طھظ‚ط¯ظٹظ…', nameEn: 'Serving Trays', parentSlug: 'serving-ware', icon: 'ًں”²', sortOrder: 2 },
      { slug: 'salad-bowls', nameAr: 'ط£ظˆط¹ظٹط© ط³ظ„ط·ط©', nameEn: 'Salad Bowls', parentSlug: 'serving-ware', icon: 'ًں¥—', sortOrder: 3 },
      { slug: 'hospitality-sets', nameAr: 'ط£ط¯ظˆط§طھ ط¶ظٹط§ظپط©', nameEn: 'Hospitality Sets', parentSlug: 'serving-ware', icon: 'âک•', sortOrder: 4 },
      { slug: 'dining-sets', nameAr: 'ط·ظ‚ظ… ط³ظپط±ط©', nameEn: 'Dining Sets', parentSlug: 'serving-ware', icon: 'ًں¥ک', sortOrder: 5 },

      // cups-pitchers - ط£ظƒظˆط§ط¨ ظˆط£ط¨ط§ط±ظٹظ‚
      { slug: 'tea-coffee-cups', nameAr: 'ط£ظƒظˆط§ط¨ ط´ط§ظٹ ظˆظ‚ظ‡ظˆط©', nameEn: 'Tea & Coffee Cups', parentSlug: 'cups-pitchers', icon: 'âک•', sortOrder: 1 },
      { slug: 'pitchers', nameAr: 'ط£ط¨ط§ط±ظٹظ‚', nameEn: 'Pitchers', parentSlug: 'cups-pitchers', icon: 'ًں«—', sortOrder: 2 },
      { slug: 'water-juice-glasses', nameAr: 'ط£ظƒظˆط§ط¨ ظ…ط§ط، ظˆط¹طµط§ط¦ط±', nameEn: 'Water & Juice Glasses', parentSlug: 'cups-pitchers', icon: 'ًں¥¤', sortOrder: 3 },
      { slug: 'serving-cups', nameAr: 'ظپظ†ط§ط¬ظٹظ† ظˆط£ظƒظˆط§ط¨ طھظ‚ط¯ظٹظ…', nameEn: 'Serving Cups', parentSlug: 'cups-pitchers', icon: 'ًںچµ', sortOrder: 4 },
      { slug: 'cup-sets', nameAr: 'ط·ظ‚ظ… ط£ظƒظˆط§ط¨', nameEn: 'Cup Sets', parentSlug: 'cups-pitchers', icon: 'ًں«–', sortOrder: 5 },

      // preparation-tools - ط£ط¯ظˆط§طھ ط§ظ„طھط­ط¶ظٹط±
      { slug: 'blenders-choppers', nameAr: 'ط®ظ„ط§ط·ط§طھ ظˆظپط±ط§ظ…ط§طھ', nameEn: 'Blenders & Choppers', parentSlug: 'preparation-tools', icon: 'ًں«™', sortOrder: 1 },
      { slug: 'mixing-bowls', nameAr: 'ط£ط­ظˆط§ط¶ ظˆط¹ط¬ظ‘ط§ظ†ط§طھ', nameEn: 'Mixing Bowls', parentSlug: 'preparation-tools', icon: 'ًں¥£', sortOrder: 2 },
      { slug: 'graters-squeezers', nameAr: 'ط£ط¯ظˆط§طھ ط¨ط´ط± ظˆط¹طµط±', nameEn: 'Graters & Squeezers', parentSlug: 'preparation-tools', icon: 'ًں§€', sortOrder: 3 },
      { slug: 'molds-measures', nameAr: 'ظ‚ظˆط§ظ„ط¨ ظˆظ…ظ‚ط§ط³ط§طھ', nameEn: 'Molds & Measures', parentSlug: 'preparation-tools', icon: 'ًں§پ', sortOrder: 4 },
      { slug: 'wrapping-tools', nameAr: 'ط£ط¯ظˆط§طھ ط­ظپط¸ ظˆطھط؛ظ„ظٹظپ', nameEn: 'Wrapping Tools', parentSlug: 'preparation-tools', icon: 'ًں“¦', sortOrder: 5 },

      // food-storage - طھط®ط²ظٹظ† ط§ظ„ط·ط¹ط§ظ…
      { slug: 'plastic-containers', nameAr: 'ط¹ظ„ط¨ ط¨ظ„ط§ط³طھظٹظƒظٹط©', nameEn: 'Plastic Containers', parentSlug: 'food-storage', icon: 'ًں«™', sortOrder: 1 },
      { slug: 'glass-containers', nameAr: 'ط¹ظ„ط¨ ط²ط¬ط§ط¬ظٹط©', nameEn: 'Glass Containers', parentSlug: 'food-storage', icon: 'ًں§´', sortOrder: 2 },
      { slug: 'jars', nameAr: 'ط¨ط±ط·ظ…ط§ظ†ط§طھ ط­ظپط¸', nameEn: 'Jars', parentSlug: 'food-storage', icon: 'ًں«™', sortOrder: 3 },
      { slug: 'vacuum-bags', nameAr: 'ط£ظƒظٹط§ط³ ظˆط£ظˆط¹ظٹط© طھظپط±ظٹط؛', nameEn: 'Vacuum Bags', parentSlug: 'food-storage', icon: 'ًں’¾', sortOrder: 4 },
      { slug: 'lunch-boxes', nameAr: 'طµظ†ط§ط¯ظٹظ‚ ط؛ط¯ط§ط،', nameEn: 'Lunch Boxes', parentSlug: 'food-storage', icon: 'ًںچ±', sortOrder: 5 },

      // fashion-men - ظ…ظ„ط§ط¨ط³ ط±ط¬ط§ظ„ظٹط©
      { slug: 'mens-shirts', nameAr: 'ظ‚ظ…طµط§ظ†', nameEn: 'Shirts', parentSlug: 'fashion-men', icon: 'ًں‘”', sortOrder: 1 },
      { slug: 'mens-pants-jeans', nameAr: 'ط¨ظ†ط§ط·ظٹظ„ ظˆط¬ظٹظ†ط²', nameEn: 'Pants & Jeans', parentSlug: 'fashion-men', icon: 'ًں‘–', sortOrder: 2 },
      { slug: 'mens-jalabiyat', nameAr: 'ط¬ظ„ط§ط¨ظٹط§طھ ظˆط«ظٹط§ط¨', nameEn: 'Jalabiyat', parentSlug: 'fashion-men', icon: 'ًں§¥', sortOrder: 3 },
      { slug: 'mens-jackets', nameAr: 'ط³طھط±ط§طھ ظˆط¬ط§ظƒظٹطھط§طھ', nameEn: 'Jackets', parentSlug: 'fashion-men', icon: 'ًں§¥', sortOrder: 4 },
      { slug: 'mens-underwear', nameAr: 'ظ…ظ„ط§ط¨ط³ ط¯ط§ط®ظ„ظٹط©', nameEn: 'Underwear', parentSlug: 'fashion-men', icon: 'ًں©²', sortOrder: 5 },
      { slug: 'mens-sportswear', nameAr: 'ظ…ظ„ط§ط¨ط³ ط±ظٹط§ط¶ظٹط©', nameEn: 'Sportswear', parentSlug: 'fashion-men', icon: 'ًںڈƒ', sortOrder: 6 },
      { slug: 'mens-hats-scarves', nameAr: 'ط·ط§ظ‚ظٹط§طھ ظˆط´ظ…ط§ط؛ط§طھ', nameEn: 'Hats & Scarves', parentSlug: 'fashion-men', icon: 'ًں§¢', sortOrder: 7 },

      // fashion-women - ظ…ظ„ط§ط¨ط³ ظ†ط³ط§ط¦ظٹط©
      { slug: 'womens-dresses', nameAr: 'ظپط³ط§طھظٹظ†', nameEn: 'Dresses', parentSlug: 'fashion-women', icon: 'ًں‘—', sortOrder: 1 },
      { slug: 'abayas-hijabs', nameAr: 'ط¹ط¨ط§ظٹط§طھ ظˆط­ط¬ط§ط¨ط§طھ', nameEn: 'Abayas & Hijabs', parentSlug: 'fashion-women', icon: 'ًں§•', sortOrder: 2 },
      { slug: 'womens-blouses', nameAr: 'ط¨ظ„ظˆط²ط§طھ ظˆطھظˆظ†ظٹظƒ', nameEn: 'Blouses & Tunics', parentSlug: 'fashion-women', icon: 'ًں‘ڑ', sortOrder: 3 },
      { slug: 'womens-skirts', nameAr: 'طھظ†ط§ظ†ظٹط±', nameEn: 'Skirts', parentSlug: 'fashion-women', icon: 'ًں‘ ', sortOrder: 4 },
      { slug: 'womens-loungewear', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ…ظ†ط²ظ„ظٹط©', nameEn: 'Loungewear', parentSlug: 'fashion-women', icon: 'ًں›‹ï¸ڈ', sortOrder: 5 },
      { slug: 'womens-lingerie', nameAr: 'ظ…ظ„ط§ط¨ط³ ط¯ط§ط®ظ„ظٹط©', nameEn: 'Lingerie', parentSlug: 'fashion-women', icon: 'ًں©±', sortOrder: 6 },
      { slug: 'womens-sportswear', nameAr: 'ظ…ظ„ط§ط¨ط³ ط±ظٹط§ط¶ظٹط© ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Sportswear", parentSlug: 'fashion-women', icon: 'ًںڈƒâ€چâ™€ï¸ڈ', sortOrder: 7 },

      // fashion-kids - ظ…ظ„ط§ط¨ط³ ط£ط·ظپط§ظ„ ظˆظ…ظˆط§ظ„ظٹط¯
      { slug: 'newborn-0-3m', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ…ظˆط§ظ„ظٹط¯ (0-3 ط£ط´ظ‡ط±)', nameEn: 'Newborn (0-3 months)', parentSlug: 'fashion-kids', icon: 'ًں‘¶', sortOrder: 1 },
      { slug: 'baby-3-6m', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ…ظˆط§ظ„ظٹط¯ (3-6 ط£ط´ظ‡ط±)', nameEn: 'Baby (3-6 months)', parentSlug: 'fashion-kids', icon: 'ًں‘¶', sortOrder: 2 },
      { slug: 'baby-6-12m', nameAr: 'ظ…ظ„ط§ط¨ط³ ط£ط·ظپط§ظ„ (6-12 ط´ظ‡ط±)', nameEn: 'Baby (6-12 months)', parentSlug: 'fashion-kids', icon: 'ًں§’', sortOrder: 3 },
      { slug: 'toddler-1-2y', nameAr: 'ظ…ظ„ط§ط¨ط³ ط£ط·ظپط§ظ„ (1-2 ط³ظ†ط©)', nameEn: 'Toddler (1-2 years)', parentSlug: 'fashion-kids', icon: 'ًں‘¦', sortOrder: 4 },
      { slug: 'toddler-2-4y', nameAr: 'ظ…ظ„ط§ط¨ط³ ط£ط·ظپط§ظ„ (2-4 ط³ظ†ط©)', nameEn: 'Toddler (2-4 years)', parentSlug: 'fashion-kids', icon: 'ًں‘§', sortOrder: 5 },
      { slug: 'girls-clothes', nameAr: 'ظ…ظ„ط§ط¨ط³ ط¨ظ†ط§طھ', nameEn: "Girls' Clothes", parentSlug: 'fashion-kids', icon: 'ًں‘—', sortOrder: 6 },
      { slug: 'boys-clothes', nameAr: 'ظ…ظ„ط§ط¨ط³ ط£ظˆظ„ط§ط¯', nameEn: "Boys' Clothes", parentSlug: 'fashion-kids', icon: 'ًں§’', sortOrder: 7 },
      { slug: 'school-uniforms', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ…ط¯ط±ط³ظٹط©', nameEn: 'School Uniforms', parentSlug: 'fashion-kids', icon: 'ًںژ’', sortOrder: 8 },

      // footwear-men - ط£ط­ط°ظٹط© ط±ط¬ط§ظ„ظٹط©
      { slug: 'mens-formal-shoes', nameAr: 'ط£ط­ط°ظٹط© ط±ط³ظ…ظٹط©', nameEn: 'Formal Shoes', parentSlug: 'footwear-men', icon: 'ًں‘‍', sortOrder: 1 },
      { slug: 'mens-sneakers', nameAr: 'ط£ط­ط°ظٹط© ط±ظٹط§ط¶ظٹط©', nameEn: 'Sneakers', parentSlug: 'footwear-men', icon: 'ًں‘ں', sortOrder: 2 },
      { slug: 'mens-slippers-sandals', nameAr: 'ط´ط¨ط´ط¨ ظˆطµظ†ط§ط¯ظ„', nameEn: 'Slippers & Sandals', parentSlug: 'footwear-men', icon: 'ًں©´', sortOrder: 3 },
      { slug: 'mens-work-shoes', nameAr: 'ط£ط­ط°ظٹط© ط¹ظ…ظ„', nameEn: 'Work Shoes', parentSlug: 'footwear-men', icon: 'ًں¥¾', sortOrder: 4 },

      // footwear-women - ط£ط­ط°ظٹط© ظ†ط³ط§ط¦ظٹط©
      { slug: 'womens-heels', nameAr: 'ط£ط­ط°ظٹط© ظƒط¹ط¨ ط¹ط§ظ„ظٹ', nameEn: 'Heels', parentSlug: 'footwear-women', icon: 'ًں‘ ', sortOrder: 1 },
      { slug: 'womens-flats', nameAr: 'ط£ط­ط°ظٹط© ظ…ط³ط·ط­ط©', nameEn: 'Flats', parentSlug: 'footwear-women', icon: 'ًں¥؟', sortOrder: 2 },
      { slug: 'womens-sneakers', nameAr: 'ط£ط­ط°ظٹط© ط±ظٹط§ط¶ظٹط© ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Sneakers", parentSlug: 'footwear-women', icon: 'ًں‘ں', sortOrder: 3 },
      { slug: 'womens-slippers', nameAr: 'ط´ط¨ط´ط¨ ظˆطµظ†ط§ط¯ظ„ ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Slippers", parentSlug: 'footwear-women', icon: 'ًں©´', sortOrder: 4 },

      // footwear-kids - ط£ط­ط°ظٹط© ط£ط·ظپط§ظ„
      { slug: 'baby-booties', nameAr: 'ط£ط­ط°ظٹط© ظ…ظˆط§ظ„ظٹط¯ ظ†ط§ط¹ظ…ط©', nameEn: 'Baby Booties', parentSlug: 'footwear-kids', icon: 'ًں§¦', sortOrder: 1 },
      { slug: 'kids-sneakers', nameAr: 'ط£ط­ط°ظٹط© ط£ط·ظپط§ظ„ ط±ظٹط§ط¶ظٹط©', nameEn: 'Kids Sneakers', parentSlug: 'footwear-kids', icon: 'ًں‘ں', sortOrder: 2 },
      { slug: 'kids-sandals', nameAr: 'طµظ†ط§ط¯ظ„ ط£ط·ظپط§ظ„', nameEn: 'Kids Sandals', parentSlug: 'footwear-kids', icon: 'ًں©´', sortOrder: 3 },
      { slug: 'school-shoes', nameAr: 'ط£ط­ط°ظٹط© ظ…ط¯ط±ط³ظٹط©', nameEn: 'School Shoes', parentSlug: 'footwear-kids', icon: 'ًں‘‍', sortOrder: 4 },

      // perfumes-oud - ط§ظ„ط¹ط·ظˆط± ظˆط§ظ„ط¨ط®ظˆط±
      { slug: 'mens-perfumes', nameAr: 'ط¹ط·ظˆط± ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Perfumes", parentSlug: 'perfumes-oud', icon: 'ًں§´', sortOrder: 1 },
      { slug: 'womens-perfumes', nameAr: 'ط¹ط·ظˆط± ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Perfumes", parentSlug: 'perfumes-oud', icon: 'ًں’گ', sortOrder: 2 },
      { slug: 'oud-incense', nameAr: 'ط¹ظˆط¯ ظˆط¨ط®ظˆط±', nameEn: 'Oud & Incense', parentSlug: 'perfumes-oud', icon: 'ًںھµ', sortOrder: 3 },
      { slug: 'musk-oils', nameAr: 'ط¯ظ‡ظˆظ† ظˆظ…ط³ظƒ', nameEn: 'Musk & Oils', parentSlug: 'perfumes-oud', icon: 'ًں’§', sortOrder: 4 },
      { slug: 'incense-burners', nameAr: 'ط¨ط®ظˆط± ظˆظ…ط¨ط§ط®ط±', nameEn: 'Incense Burners', parentSlug: 'perfumes-oud', icon: 'ًںھ”', sortOrder: 5 },
      { slug: 'car-home-fragrance', nameAr: 'ط¹ط·ظˆط± ط§ظ„ط³ظٹط§ط±ط§طھ ظˆط§ظ„ظ…ظƒط§ظ†', nameEn: 'Car & Home Fragrance', parentSlug: 'perfumes-oud', icon: 'ًںڑ—', sortOrder: 6 },

      // accessories - ط§ظ„ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظˆط§ظ„ط³ط§ط¹ط§طھ
      { slug: 'mens-watches', nameAr: 'ط³ط§ط¹ط§طھ ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Watches", parentSlug: 'accessories', icon: 'âŒڑ', sortOrder: 1 },
      { slug: 'womens-watches', nameAr: 'ط³ط§ط¹ط§طھ ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Watches", parentSlug: 'accessories', icon: 'âŒڑ', sortOrder: 2 },
      { slug: 'kids-watches', nameAr: 'ط³ط§ط¹ط§طھ ط£ط·ظپط§ظ„', nameEn: "Kids' Watches", parentSlug: 'accessories', icon: 'âŒڑ', sortOrder: 3 },
      { slug: 'jewelry', nameAr: 'ظ…ط¬ظˆظ‡ط±ط§طھ ظˆط¥ظƒط³ط³ظˆط§ط±ط§طھ', nameEn: 'Jewelry', parentSlug: 'accessories', icon: 'ًں’چ', sortOrder: 4 },
      { slug: 'sunglasses', nameAr: 'ظ†ط¸ط§ط±ط§طھ', nameEn: 'Sunglasses', parentSlug: 'accessories', icon: 'ًں•¶ï¸ڈ', sortOrder: 5 },
      { slug: 'bags-wallets', nameAr: 'ط­ظ‚ط§ط¦ط¨ ظˆظ…ط­ط§ظپط¸', nameEn: 'Bags & Wallets', parentSlug: 'accessories', icon: 'ًں‘œ', sortOrder: 6 },
      { slug: 'phone-cases', nameAr: 'ط£ط؛ط·ظٹط© ظ‡ظˆط§طھظپ', nameEn: 'Phone Cases', parentSlug: 'accessories', icon: 'ًں“±', sortOrder: 7 },

      // mother-baby - ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط£ظ… ظˆط§ظ„ط·ظپظ„
      { slug: 'diapers-wipes', nameAr: 'ط­ظپط§ط¶ط§طھ ظˆظ…ظ†ط§ط¯ظٹظ„', nameEn: 'Diapers & Wipes', parentSlug: 'mother-baby', icon: 'ًں§·', sortOrder: 1 },
      { slug: 'bottles-pacifiers', nameAr: 'ط±ط¶ط§ط¹ط§طھ ظˆظ…طµط§طµط§طھ', nameEn: 'Bottles & Pacifiers', parentSlug: 'mother-baby', icon: 'ًںچ¼', sortOrder: 2 },
      { slug: 'strollers-car-seats', nameAr: 'ط¹ط±ط¨ط§طھ ظˆظƒط±ط§ط³ظٹ', nameEn: 'Strollers & Car Seats', parentSlug: 'mother-baby', icon: 'ًںڑ¼', sortOrder: 3 },
      { slug: 'breastfeeding', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط±ط¶ط§ط¹ط©', nameEn: 'Breastfeeding', parentSlug: 'mother-baby', icon: 'ًں¤±', sortOrder: 4 },
      { slug: 'nursery-furniture', nameAr: 'ط£ط«ط§ط« ط£ط·ظپط§ظ„ (ط³ط±ط§ط¦ط±)', nameEn: 'Nursery Furniture', parentSlug: 'mother-baby', icon: 'ًں›ڈï¸ڈ', sortOrder: 5 },
      { slug: 'newborn-clothes-mb', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ…ظˆط§ظ„ظٹط¯ (0-3 ط´ظ‡ظˆط±)', nameEn: 'Newborn Clothes (0-3 months)', parentSlug: 'mother-baby', icon: 'ًں‘¶', sortOrder: 6 },
      { slug: 'infant-clothes-mb', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ…ظˆط§ظ„ظٹط¯ (3-6 ط´ظ‡ظˆط±)', nameEn: 'Infant Clothes (3-6 months)', parentSlug: 'mother-baby', icon: 'ًں‘¶', sortOrder: 7 },
      { slug: 'baby-food', nameAr: 'ط·ط¹ط§ظ… ط£ط·ظپط§ظ„', nameEn: 'Baby Food', parentSlug: 'mother-baby', icon: 'ًں¥„', sortOrder: 8 },
      { slug: 'baby-care', nameAr: 'طµط­ط© ظˆط¹ظ†ط§ظٹط© ط¨ط§ظ„ط·ظپظ„', nameEn: 'Baby Care', parentSlug: 'mother-baby', icon: 'ًں§´', sortOrder: 9 },
      { slug: 'bath-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط§ط³طھط­ظ…ط§ظ…', nameEn: 'Bath Toys', parentSlug: 'mother-baby', icon: 'ًں›پ', sortOrder: 10 },

      // home-care - ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ظٹطھ
      { slug: 'cleaners-disinfectants', nameAr: 'ظ…ظ†ط¸ظپط§طھ ظˆظ…ط·ظ‡ط±ط§طھ', nameEn: 'Cleaners & Disinfectants', parentSlug: 'home-care', icon: 'ًں§¹', sortOrder: 1 },
      { slug: 'cleaning-tools', nameAr: 'ط£ط¯ظˆط§طھ طھظ†ط¸ظٹظپ', nameEn: 'Cleaning Tools', parentSlug: 'home-care', icon: 'ًں§½', sortOrder: 2 },
      { slug: 'cleaning-machines', nameAr: 'ط£ط¬ظ‡ط²ط© طھظ†ط¸ظٹظپ', nameEn: 'Cleaning Machines', parentSlug: 'home-care', icon: 'ًں¤–', sortOrder: 3 },
      { slug: 'soap-fresheners', nameAr: 'طµط§ط¨ظˆظ† ظˆظ…ط¹ط·ط±ط§طھ', nameEn: 'Soap & Fresheners', parentSlug: 'home-care', icon: 'ًں§¼', sortOrder: 4 },
      { slug: 'laundry-supplies', nameAr: 'ط£ط¯ظˆط§طھ ط؛ط³ظٹظ„', nameEn: 'Laundry Supplies', parentSlug: 'home-care', icon: 'ًں§؛', sortOrder: 5 },

      // electrical-appliances - ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط©
      { slug: 'kitchen-appliances', nameAr: 'ط£ط¬ظ‡ط²ط© ظ…ط·ط¨ط® ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Kitchen Appliances', parentSlug: 'electrical-appliances', icon: 'ًں”Œ', sortOrder: 1 },
      { slug: 'ac-fans', nameAr: 'ظ…ظƒظٹظپط§طھ ظˆظ…ط±ط§ظˆط­', nameEn: 'AC & Fans', parentSlug: 'electrical-appliances', icon: 'â‌„ï¸ڈ', sortOrder: 2 },
      { slug: 'washers-dryers', nameAr: 'ط؛ط³ط§ظ„ط§طھ ظˆظ…ط¬ظپظپط§طھ', nameEn: 'Washers & Dryers', parentSlug: 'electrical-appliances', icon: 'ًں«§', sortOrder: 3 },
      { slug: 'heaters', nameAr: 'ط£ط¬ظ‡ط²ط© طھط¯ظپط¦ط©', nameEn: 'Heaters', parentSlug: 'electrical-appliances', icon: 'ًںŒ،ï¸ڈ', sortOrder: 4 },
      { slug: 'vacuum-cleaners', nameAr: 'ظ…ظƒط§ظ†ط³ ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Vacuum Cleaners', parentSlug: 'electrical-appliances', icon: 'ًں¤–', sortOrder: 5 },
      { slug: 'small-appliances', nameAr: 'ط£ط¬ظ‡ط²ط© طµط؛ظٹط±ط©', nameEn: 'Small Appliances', parentSlug: 'electrical-appliances', icon: 'âڑ،', sortOrder: 6 },

      // electronics - ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط§طھ
      { slug: 'phones-accessories', nameAr: 'ظ‡ظˆط§طھظپ ظˆظ„ظˆط§ط²ظ…ظ‡ط§', nameEn: 'Phones & Accessories', parentSlug: 'electronics', icon: 'ًں“±', sortOrder: 1 },
      { slug: 'tablets', nameAr: 'ط£ط¬ظ‡ط²ط© ظ„ظˆط­ظٹط©', nameEn: 'Tablets', parentSlug: 'electronics', icon: 'ًں“ں', sortOrder: 2 },
      { slug: 'headphones', nameAr: 'ط³ظ…ط§ط¹ط§طھ', nameEn: 'Headphones', parentSlug: 'electronics', icon: 'ًںژ§', sortOrder: 3 },
      { slug: 'tvs-monitors', nameAr: 'ط´ط§ط´ط§طھ ظˆطھظ„ظپط²ظٹظˆظ†ط§طھ', nameEn: 'TVs & Monitors', parentSlug: 'electronics', icon: 'ًں“؛', sortOrder: 4 },
      { slug: 'cameras', nameAr: 'ظƒط§ظ…ظٹط±ط§طھ', nameEn: 'Cameras', parentSlug: 'electronics', icon: 'ًں“·', sortOrder: 5 },
      { slug: 'audio-devices', nameAr: 'ط³ظ…ط§ط¹ط§طھ ظˆط£ط¬ظ‡ط²ط© طµظˆطھ', nameEn: 'Audio Devices', parentSlug: 'electronics', icon: 'ًں”ٹ', sortOrder: 6 },
      { slug: 'smart-home', nameAr: 'ط£ط¬ظ‡ط²ط© ظ…ظ†ط²ظ„ ط°ظƒظٹط©', nameEn: 'Smart Home', parentSlug: 'electronics', icon: 'ًںڈ ', sortOrder: 7 },
      { slug: 'chargers-batteries', nameAr: 'ط´ظˆط§ط­ظ† ظˆط¨ط·ط§ط±ظٹط§طھ', nameEn: 'Chargers & Batteries', parentSlug: 'electronics', icon: 'ًں”‹', sortOrder: 8 },

      // children-toys - ط£ظ„ط¹ط§ط¨ ط£ط·ظپط§ظ„
      { slug: 'educational-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط°ظƒط§ط، ظˆطھط¹ظ„ظٹظ…ظٹط©', nameEn: 'Educational Toys', parentSlug: 'children-toys', icon: 'ًں§©', sortOrder: 1 },
      { slug: 'fun-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ طھط³ظ„ظٹط© ظˆطھط±ظپظٹظ‡', nameEn: 'Fun & Entertainment', parentSlug: 'children-toys', icon: 'ًںژ®', sortOrder: 2 },
      { slug: 'girls-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط¨ظ†ط§طھ (ط¯ظˆظ„طŒ ظ…ط·ط§ط¨ط®)', nameEn: "Girls' Toys", parentSlug: 'children-toys', icon: 'ًں§¸', sortOrder: 3 },
      { slug: 'boys-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط£ظˆظ„ط§ط¯ (ط³ظٹط§ط±ط§طھطŒ ط£ط¨ط·ط§ظ„)', nameEn: "Boys' Toys", parentSlug: 'children-toys', icon: 'ًںڑ—', sortOrder: 4 },
      { slug: 'sports-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط±ظٹط§ط¶ظٹط©', nameEn: 'Sports Toys', parentSlug: 'children-toys', icon: 'âڑ½', sortOrder: 5 },
      { slug: 'outdoor-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط®ط§ط±ط¬ظٹط©', nameEn: 'Outdoor Toys', parentSlug: 'children-toys', icon: 'ًںŒ³', sortOrder: 6 },
      { slug: 'baby-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ظ…ظˆط§ظ„ظٹط¯', nameEn: 'Baby Toys', parentSlug: 'children-toys', icon: 'ًں‘¶', sortOrder: 7 },
      { slug: 'lego-puzzles', nameAr: 'ظ„ظٹط؛ظˆ ظˆط¨ط§ط²ظ„', nameEn: 'Lego & Puzzles', parentSlug: 'children-toys', icon: 'ًں§±', sortOrder: 8 },
      { slug: 'electronic-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط¥ظ„ظƒطھط±ظˆظ†ظٹط©', nameEn: 'Electronic Toys', parentSlug: 'children-toys', icon: 'ًں¤–', sortOrder: 9 },

      // pet-supplies - ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط­ظٹظˆط§ظ†ط§طھ
      { slug: 'cat-food', nameAr: 'ط·ط¹ط§ظ… ظ‚ط·ط·', nameEn: 'Cat Food', parentSlug: 'pet-supplies', icon: 'ًںگ±', sortOrder: 1 },
      { slug: 'dog-food', nameAr: 'ط·ط¹ط§ظ… ظƒظ„ط§ط¨', nameEn: 'Dog Food', parentSlug: 'pet-supplies', icon: 'ًںگ¶', sortOrder: 2 },
      { slug: 'pet-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Toys', parentSlug: 'pet-supplies', icon: 'ًں§¸', sortOrder: 3 },
      { slug: 'cages-beds', nameAr: 'ط£ظ‚ظپط§طµ ظˆط£ط³ط±ظ‘ط©', nameEn: 'Cages & Beds', parentSlug: 'pet-supplies', icon: 'ًںڈ ', sortOrder: 4 },
      { slug: 'pet-hygiene', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ظ†ط¸ط§ظپط©', nameEn: 'Pet Hygiene', parentSlug: 'pet-supplies', icon: 'ًں§´', sortOrder: 5 },
      { slug: 'collars-leashes', nameAr: 'ط£ط·ظˆط§ظ‚ ظˆظ…ظ‚ظˆط¯ط§طھ', nameEn: 'Collars & Leashes', parentSlug: 'pet-supplies', icon: 'ًں”—', sortOrder: 6 },

      // ornamental-plants - ظ†ط¨ط§طھط§طھ ط§ظ„ط²ظٹظ†ط©
      { slug: 'indoor-plants', nameAr: 'ظ†ط¨ط§طھط§طھ ط¯ط§ط®ظ„ظٹط©', nameEn: 'Indoor Plants', parentSlug: 'ornamental-plants', icon: 'ًںŒ؟', sortOrder: 1 },
      { slug: 'outdoor-plants', nameAr: 'ظ†ط¨ط§طھط§طھ ط®ط§ط±ط¬ظٹط©', nameEn: 'Outdoor Plants', parentSlug: 'ornamental-plants', icon: 'ًںŒ³', sortOrder: 2 },
      { slug: 'pots-planters', nameAr: 'ط£طµطµ ظˆط£ظˆط¹ظٹط©', nameEn: 'Pots & Planters', parentSlug: 'ornamental-plants', icon: 'ًںھ´', sortOrder: 3 },
      { slug: 'fertilizers-supplies', nameAr: 'ط£ط³ظ…ط¯ط© ظˆظ…ط³طھظ„ط²ظ…ط§طھ', nameEn: 'Fertilizers & Supplies', parentSlug: 'ornamental-plants', icon: 'ًں§ھ', sortOrder: 4 },
      { slug: 'fresh-flowers', nameAr: 'ط²ظ‡ظˆط± ط·ط¨ظٹط¹ظٹط©', nameEn: 'Fresh Flowers', parentSlug: 'ornamental-plants', icon: 'ًں’گ', sortOrder: 5 },
      { slug: 'artificial-plants', nameAr: 'ظ†ط¨ط§طھط§طھ طµظ†ط§ط¹ظٹط©', nameEn: 'Artificial Plants', parentSlug: 'ornamental-plants', icon: 'ًںŒ؛', sortOrder: 6 },

      // gifts-antiques - ط§ظ„طھط­ظپ ظˆط§ظ„ظ‡ط¯ط§ظٹط§
      { slug: 'occasion-gifts', nameAr: 'ظ‡ط¯ط§ظٹط§ ظ…ظ†ط§ط³ط¨ط§طھ', nameEn: 'Occasion Gifts', parentSlug: 'gifts-antiques', icon: 'ًںژپ', sortOrder: 1 },
      { slug: 'antiques-decor', nameAr: 'طھط­ظپ ظˆط¯ظٹظƒظˆط±ط§طھ', nameEn: 'Antiques & Decor', parentSlug: 'gifts-antiques', icon: 'ًںڈ؛', sortOrder: 2 },
      { slug: 'souvenirs', nameAr: 'ظ‡ط¯ط§ظٹط§ طھط°ظƒط§ط±ظٹط©', nameEn: 'Souvenirs', parentSlug: 'gifts-antiques', icon: 'ًں—½', sortOrder: 3 },
      { slug: 'gift-wrapping', nameAr: 'طھط؛ظ„ظٹظپ ظ‡ط¯ط§ظٹط§', nameEn: 'Gift Wrapping', parentSlug: 'gifts-antiques', icon: 'ًںژ€', sortOrder: 4 },
      { slug: 'candles-diffusers', nameAr: 'ط´ظ…ظˆط¹ ظˆظ…ط¹ط·ط±ط§طھ', nameEn: 'Candles & Diffusers', parentSlug: 'gifts-antiques', icon: 'ًں•¯ï¸ڈ', sortOrder: 5 },

      // wall-art - ط§ظ„ط¬ط¯ط§ط±ظٹط§طھ
      { slug: 'paintings', nameAr: 'ظ„ظˆط­ط§طھ ظپظ†ظٹط©', nameEn: 'Paintings', parentSlug: 'wall-art', icon: 'ًںژ¨', sortOrder: 1 },
      { slug: 'wall-clocks', nameAr: 'ط³ط§ط¹ط§طھ ط¬ط¯ط§ط±ظٹط©', nameEn: 'Wall Clocks', parentSlug: 'wall-art', icon: 'ًں•°ï¸ڈ', sortOrder: 2 },
      { slug: 'wall-mirrors', nameAr: 'ظ…ط±ط§ظٹط§ ط¬ط¯ط§ط±ظٹط©', nameEn: 'Wall Mirrors', parentSlug: 'wall-art', icon: 'ًںھ‍', sortOrder: 3 },
      { slug: 'wall-shelves', nameAr: 'ط±ظپظˆظپ ط¬ط¯ط§ط±ظٹط©', nameEn: 'Wall Shelves', parentSlug: 'wall-art', icon: 'ًں“ڑ', sortOrder: 4 },
      { slug: 'wall-decor', nameAr: 'ط¯ظٹظƒظˆط±ط§طھ ط¬ط¯ط§ط±ظٹط©', nameEn: 'Wall Decor', parentSlug: 'wall-art', icon: 'ًں–¼ï¸ڈ', sortOrder: 5 },
      { slug: 'wall-stickers', nameAr: 'ظ…ظ„طµظ‚ط§طھ ظˆط³طھظٹظƒط±ط²', nameEn: 'Wall Stickers', parentSlug: 'wall-art', icon: 'âœ¨', sortOrder: 6 },
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
