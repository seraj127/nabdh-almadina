import type { Category, Product, Offer, Subcategory } from './types';

// â”€â”€â”€ Color Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const PRIMARY = '#004B63';
export const PRIMARY_LIGHT = '#006B8A';
export const SECONDARY = '#FF6F61';
export const TEAL = '#00897B';
export const DARK_BG = '#0D1117';
export const APP_VERSION = '1.9'; // Must match versionName in android/app/build.gradle

// â”€â”€â”€ Capacitor Platform Detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const isNative = typeof window !== 'undefined' && !window.location.protocol.startsWith('http');

// â”€â”€â”€ Offline Users for Fallback Authentication â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// These users are available when the API server is unreachable (e.g., APK mode)
// Passwords are stored in plaintext for offline comparison (dev only)
export const OFFLINE_USERS = [
  { phone: '+218910000000', password: 'admin123', name: 'ظ…ط¯ظٹط± ط§ظ„ظ†ط¸ط§ظ…', role: 'admin' as const, loyaltyTier: 'platinum', loyaltyPoints: 0, walletBalance: 0 },
  { phone: '+218911234567', password: '123456', name: 'ط£ط­ظ…ط¯ ظ…ط­ظ…ط¯', role: 'customer' as const, loyaltyTier: 'silver', loyaltyPoints: 150, walletBalance: 0 },
  { phone: '+218917654321', password: '123456', name: 'ظپط§ط·ظ…ط© ط¹ظ„ظٹ', role: 'customer' as const, loyaltyTier: 'gold', loyaltyPoints: 500, walletBalance: 50 },
];

// Backward compatibility alias
export const DEMO_USER = { phone: '+218911234567', password: '123456', name: 'ط£ط­ظ…ط¯ ظ…ط­ظ…ط¯' };

// â”€â”€â”€ Local Categories for Offline Fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LOCAL_CATEGORIES: Category[] = [
  { id: 'cmocboa8b0000mtchox0rocv3', nameAr: 'ط£ظˆط§ظ†ظٹ ط§ظ„ط·ط¨ط®', nameEn: 'Cookware', slug: 'cookware', icon: 'ًںچ³', image: '/categories/cookware.png', productCount: 7 },
  { id: 'cmocboa8c0003mtch8sbbvg8d', nameAr: 'ط£ط¯ظˆط§طھ ط§ظ„ظ…ط·ط¨ط®', nameEn: 'Kitchen Tools', slug: 'kitchen-tools', icon: 'ًں¥„', image: '/categories/kitchen-tools.png', productCount: 7 },
  { id: 'cmocboa8c0002mtchjyp2zx9e', nameAr: 'ط£ط¯ظˆط§طھ ط§ظ„طھظ‚ط¯ظٹظ…', nameEn: 'Serving Ware', slug: 'serving-ware', icon: 'ًںچ½ï¸ڈ', image: '/categories/serving-ware.png', productCount: 7 },
  { id: 'cmocboa8c0001mtchef5g12ko', nameAr: 'ط£ظƒظˆط§ط¨ ظˆط£ط¨ط§ط±ظٹظ‚', nameEn: 'Cups & Pitchers', slug: 'cups-pitchers', icon: 'ًں¥¤', image: '/categories/cups-pitchers.png', productCount: 7 },
  { id: 'cmocboa8c0004mtch8odtpp94', nameAr: 'ط£ط¯ظˆط§طھ ط§ظ„طھط­ط¶ظٹط±', nameEn: 'Preparation Tools', slug: 'preparation-tools', icon: 'ًں”ھ', image: '/categories/preparation-tools.png', productCount: 7 },
  { id: 'cmocboa8i0009mtchthci2sqh', nameAr: 'طھط®ط²ظٹظ† ط§ظ„ط·ط¹ط§ظ…', nameEn: 'Food Storage', slug: 'food-storage', icon: 'ًں«™', image: '/categories/food-storage.png', productCount: 6 },
  { id: 'cmocboa8j000bmtcho6vog83e', nameAr: 'ظ…ظ„ط§ط¨ط³ ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Fashion", slug: 'fashion-men', icon: 'ًں‘”', image: '/categories/fashion-men.png', productCount: 6 },
  { id: 'cmocboa8m000gmtchupoagia2', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Fashion", slug: 'fashion-women', icon: 'ًں‘—', image: '/categories/fashion-women.png', productCount: 6 },
  { id: 'cmocboa8e0005mtchuu4pjpl4', nameAr: 'ظ…ظ„ط§ط¨ط³ ط£ط·ظپط§ظ„ ظˆظ…ظˆط§ظ„ظٹط¯', nameEn: 'Kids & Baby Fashion', slug: 'fashion-kids', icon: 'ًں‘¶', image: '/categories/fashion-kids.png', productCount: 6 },
  { id: 'cmocboa8f0006mtch4owo3wq4', nameAr: 'ط£ط­ط°ظٹط© ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Footwear", slug: 'footwear-men', icon: 'ًں‘‍', image: '/categories/footwear-men.png', productCount: 6 },
  { id: 'cmocboa8j000cmtchs4kw6v5f', nameAr: 'ط£ط­ط°ظٹط© ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Footwear", slug: 'footwear-women', icon: 'ًں‘ ', image: '/categories/footwear-women.png', productCount: 6 },
  { id: 'cmocboa8l000fmtchrsja04mm', nameAr: 'ط£ط­ط°ظٹط© ط£ط·ظپط§ظ„', nameEn: 'Kids Footwear', slug: 'footwear-kids', icon: 'ًں§’', image: '/categories/footwear-kids.png', productCount: 6 },
  { id: 'cmocboa8g0007mtch4caumuad', nameAr: 'ط§ظ„ط¹ط·ظˆط± ظˆط§ظ„ط¨ط®ظˆط±', nameEn: 'Perfumes & Oud', slug: 'perfumes-oud', icon: 'ًںھ”', image: '/categories/perfumes-oud.png', productCount: 6 },
  { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'ط§ظ„ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظˆط§ظ„ط³ط§ط¹ط§طھ', nameEn: 'Accessories & Watches', slug: 'accessories', icon: 'âŒڑ', image: '/categories/accessories.png', productCount: 6 },
  { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط£ظ… ظˆط§ظ„ط·ظپظ„', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: 'ًںچ¼', image: '/categories/mother-baby.png', productCount: 6 },
  { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ظٹطھ', nameEn: 'Home Care', slug: 'home-care', icon: 'ًں§¹', image: '/categories/home-care.png', productCount: 6 },
  { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: 'âڑ،', image: '/categories/electrical-appliances.png', productCount: 6 },
  { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط§طھ', nameEn: 'Electronics', slug: 'electronics', icon: 'ًں“±', image: '/categories/electronics.png', productCount: 6 },
  { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'ظ†ط¨ط§طھط§طھ ط§ظ„ط²ظٹظ†ط©', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: 'ًںŒ؟', image: '/categories/ornamental-plants.png', productCount: 6 },
  { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: 'ًںگ¾', image: '/categories/pet-supplies.png', productCount: 6 },
  { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ط£ظ„ط¹ط§ط¨ ط£ط·ظپط§ظ„', nameEn: "Children's Toys", slug: 'children-toys', icon: 'ًں§¸', image: '/categories/children-toys.png', productCount: 6 },
  { id: 'cat-gifts-antiques-001', nameAr: 'ط§ظ„طھط­ظپ ظˆط§ظ„ظ‡ط¯ط§ظٹط§', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: 'ًںژپ', image: '/categories/gifts-antiques.png', productCount: 6 },
  { id: 'cat-wall-art-001', nameAr: 'ط§ظ„ط¬ط¯ط§ط±ظٹط§طھ', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: 'ًں–¼ï¸ڈ', image: '/categories/wall-art.png', productCount: 6 },
];

// â”€â”€â”€ Local Subcategories for Offline Fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LOCAL_SUBCATEGORIES: Subcategory[] = [
  // cookware - ط£ظˆط§ظ†ظٹ ط§ظ„ط·ط¨ط®
  { id: 'sub-pots-pans', nameAr: 'ط·ظ†ط§ط¬ط± ظˆظ‚ط¯ظˆط±', nameEn: 'Pots & Pans', slug: 'pots-pans', icon: 'ًں«•', productCount: 0, parentId: 'cookware' },
  { id: 'sub-frying-pans', nameAr: 'ظ…ظ‚ط§ظ„ظٹ', nameEn: 'Frying Pans', slug: 'frying-pans', icon: 'ًںچ³', productCount: 0, parentId: 'cookware' },
  { id: 'sub-ovenware', nameAr: 'ط£ظˆط§ظ†ظٹ ط§ظ„ظپط±ظ†', nameEn: 'Ovenware', slug: 'ovenware', icon: 'ًں¥ک', productCount: 0, parentId: 'cookware' },
  { id: 'sub-pressure-cookers', nameAr: 'ظ‚ط¯ظˆط± ط§ظ„ط¶ط؛ط·', nameEn: 'Pressure Cookers', slug: 'pressure-cookers', icon: 'â™¨ï¸ڈ', productCount: 0, parentId: 'cookware' },
  { id: 'sub-nonstick', nameAr: 'ط£ظˆط§ظ†ظٹ ط§ظ„طھظٹظپط§ظ„', nameEn: 'Nonstick', slug: 'nonstick', icon: 'ًں¥‍', productCount: 0, parentId: 'cookware' },
  { id: 'sub-stainless-steel', nameAr: 'ط³طھط§ظ†ظ„ط³ ط³طھظٹظ„', nameEn: 'Stainless Steel', slug: 'stainless-steel', icon: 'ًںھ™', productCount: 0, parentId: 'cookware' },
  { id: 'sub-fryer-pots', nameAr: 'ظ‚ط¯ظˆط± ط§ظ„ظ‚ظ„ظٹ', nameEn: 'Fryer Pots', slug: 'fryer-pots', icon: 'ًںچں', productCount: 0, parentId: 'cookware' },
  // kitchen-tools - ط£ط¯ظˆط§طھ ط§ظ„ظ…ط·ط¨ط®
  { id: 'sub-spoons-whisks', nameAr: 'ظ…ظ„ط§ط¹ظ‚ ظˆظ…ط¶ط§ط±ط¨', nameEn: 'Spoons & Whisks', slug: 'spoons-whisks', icon: 'ًں¥„', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-knives-cutting', nameAr: 'ط³ظƒط§ظƒظٹظ† ظˆطھظ‚ط·ظٹط¹', nameEn: 'Knives & Cutting', slug: 'knives-cutting', icon: 'ًں”ھ', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-spatulas-turners', nameAr: 'ظ…ظ„ط§ظ‚ط· ظˆظ…ط­ط§ظˆط±', nameEn: 'Spatulas & Turners', slug: 'spatulas-turners', icon: 'ًں¥„', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-strainers-squeezers', nameAr: 'ظ…طµط§ظپظٹ ظˆظ…ط¹طµط±ط§طھ', nameEn: 'Strainers & Squeezers', slug: 'strainers-squeezers', icon: 'ًں§ƒ', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-measuring-tools', nameAr: 'ط£ط¯ظˆط§طھ ط§ظ„ظ‚ظٹط§ط³', nameEn: 'Measuring Tools', slug: 'measuring-tools', icon: 'ًں§®', productCount: 0, parentId: 'kitchen-tools' },
  { id: 'sub-cutting-boards', nameAr: 'ظ„ظˆط­ طھظ‚ط·ظٹط¹', nameEn: 'Cutting Boards', slug: 'cutting-boards', icon: 'ًںھµ', productCount: 0, parentId: 'kitchen-tools' },
  // serving-ware - ط£ط¯ظˆط§طھ ط§ظ„طھظ‚ط¯ظٹظ…
  { id: 'sub-plates-dishes', nameAr: 'طµط­ظˆظ† ظˆط£ط·ط¨ط§ظ‚', nameEn: 'Plates & Dishes', slug: 'plates-dishes', icon: 'ًںچ½ï¸ڈ', productCount: 0, parentId: 'serving-ware' },
  { id: 'sub-serving-trays', nameAr: 'طµظˆط§ظ†ظٹ طھظ‚ط¯ظٹظ…', nameEn: 'Serving Trays', slug: 'serving-trays', icon: 'ًں”²', productCount: 0, parentId: 'serving-ware' },
  { id: 'sub-salad-bowls', nameAr: 'ط·ط¨ظ‚ط§طھ ط³ظ„ط·ط©', nameEn: 'Salad Bowls', slug: 'salad-bowls', icon: 'ًں¥—', productCount: 0, parentId: 'serving-ware' },
  { id: 'sub-hospitality-sets', nameAr: 'ط·ظ‚ظ… ط¶ظٹط§ظپط©', nameEn: 'Hospitality Sets', slug: 'hospitality-sets', icon: 'âک•', productCount: 0, parentId: 'serving-ware' },
  { id: 'sub-dining-sets', nameAr: 'ط·ظ‚ظ… ط³ظپط±ط©', nameEn: 'Dining Sets', slug: 'dining-sets', icon: 'ًں¥ک', productCount: 0, parentId: 'serving-ware' },
  // cups-pitchers - ط£ظƒظˆط§ط¨ ظˆط£ط¨ط§ط±ظٹظ‚
  { id: 'sub-tea-coffee-cups', nameAr: 'ظپظ†ط§ط¬ظٹظ† ط´ط§ظٹ ظˆظ‚ظ‡ظˆط©', nameEn: 'Tea & Coffee Cups', slug: 'tea-coffee-cups', icon: 'âک•', productCount: 0, parentId: 'cups-pitchers' },
  { id: 'sub-pitchers', nameAr: 'ط£ط¨ط§ط±ظٹظ‚', nameEn: 'Pitchers', slug: 'pitchers', icon: 'ًں«—', productCount: 0, parentId: 'cups-pitchers' },
  { id: 'sub-water-juice-glasses', nameAr: 'ظƒط§ط³ط§طھ ظ…ط§ط، ظˆط¹طµظٹط±', nameEn: 'Water & Juice Glasses', slug: 'water-juice-glasses', icon: 'ًں¥¤', productCount: 0, parentId: 'cups-pitchers' },
  { id: 'sub-serving-cups', nameAr: 'ط£ظƒظˆط§ط¨ طھظ‚ط¯ظٹظ…', nameEn: 'Serving Cups', slug: 'serving-cups', icon: 'ًںچµ', productCount: 0, parentId: 'cups-pitchers' },
  { id: 'sub-cup-sets', nameAr: 'ط·ظ‚ظ… ط£ظƒظˆط§ط¨', nameEn: 'Cup Sets', slug: 'cup-sets', icon: 'ًں«–', productCount: 0, parentId: 'cups-pitchers' },
  // preparation-tools - ط£ط¯ظˆط§طھ ط§ظ„طھط­ط¶ظٹط±
  { id: 'sub-blenders-choppers', nameAr: 'ط®ظ„ط§ط·ط§طھ ظˆظپط±ط§ظ…ط§طھ', nameEn: 'Blenders & Choppers', slug: 'blenders-choppers', icon: 'ًں«™', productCount: 0, parentId: 'preparation-tools' },
  { id: 'sub-mixing-bowls', nameAr: 'ط·ط¨ظ‚ط§طھ ط®ظ„ط·', nameEn: 'Mixing Bowls', slug: 'mixing-bowls', icon: 'ًں¥£', productCount: 0, parentId: 'preparation-tools' },
  { id: 'sub-graters-squeezers', nameAr: 'ظ…ط¨ط´ط±ط§طھ ظˆظ…ط¹طµط±ط§طھ', nameEn: 'Graters & Squeezers', slug: 'graters-squeezers', icon: 'ًں§€', productCount: 0, parentId: 'preparation-tools' },
  { id: 'sub-molds-measures', nameAr: 'ظ‚ظˆط§ظ„ط¨ ظˆظ…ظ‚ط§ظٹظٹط³', nameEn: 'Molds & Measures', slug: 'molds-measures', icon: 'ًں§پ', productCount: 0, parentId: 'preparation-tools' },
  { id: 'sub-wrapping-tools', nameAr: 'ط£ط¯ظˆط§طھ ط§ظ„طھط؛ظ„ظٹظپ', nameEn: 'Wrapping Tools', slug: 'wrapping-tools', icon: 'ًں“¦', productCount: 0, parentId: 'preparation-tools' },
  // food-storage - طھط®ط²ظٹظ† ط§ظ„ط·ط¹ط§ظ…
  { id: 'sub-plastic-containers', nameAr: 'ط¹ ط¨ظ„ط§ط³طھظٹظƒظٹط©', nameEn: 'Plastic Containers', slug: 'plastic-containers', icon: 'ًں«™', productCount: 0, parentId: 'food-storage' },
  { id: 'sub-glass-containers', nameAr: 'ط¹ ط²ط¬ط§ط¬ظٹط©', nameEn: 'Glass Containers', slug: 'glass-containers', icon: 'ًں§´', productCount: 0, parentId: 'food-storage' },
  { id: 'sub-jars', nameAr: 'ط¨ط±ط·ظ…ط§ظ†ط§طھ', nameEn: 'Jars', slug: 'jars', icon: 'ًں«™', productCount: 0, parentId: 'food-storage' },
  { id: 'sub-vacuum-bags', nameAr: 'ط£ظƒظٹط§ط³ طھظپط±ظٹط؛', nameEn: 'Vacuum Bags', slug: 'vacuum-bags', icon: 'ًں’¾', productCount: 0, parentId: 'food-storage' },
  { id: 'sub-lunch-boxes', nameAr: 'ط­ط§ظپط¸ط§طھ ط·ط¹ط§ظ…', nameEn: 'Lunch Boxes', slug: 'lunch-boxes', icon: 'ًںچ±', productCount: 0, parentId: 'food-storage' },
  // fashion-men - ظ…ظ„ط§ط¨ط³ ط±ط¬ط§ظ„ظٹط©
  { id: 'sub-mens-shirts', nameAr: 'ظ‚ظ…طµط§ظ† ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Shirts", slug: 'mens-shirts', icon: 'ًں‘”', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-pants-jeans', nameAr: 'ط¨ظ†ط·ظ„ظˆظ†ط§طھ ظˆط¬ظٹظ†ط²', nameEn: "Men's Pants & Jeans", slug: 'mens-pants-jeans', icon: 'ًں‘–', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-jalabiyat', nameAr: 'ط¬ظ„ط§ط¨ظٹط§طھ ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Jalabiyat", slug: 'mens-jalabiyat', icon: 'ًں§¥', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-jackets', nameAr: 'ط¬ط§ظƒظٹطھط§طھ ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Jackets", slug: 'mens-jackets', icon: 'ًں§¥', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-underwear', nameAr: 'ظ…ظ„ط§ط¨ط³ ط¯ط§ط®ظ„ظٹط© ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Underwear", slug: 'mens-underwear', icon: 'ًں©²', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-sportswear', nameAr: 'ظ…ظ„ط§ط¨ط³ ط±ظٹط§ط¶ظٹط© ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Sportswear", slug: 'mens-sportswear', icon: 'ًںڈƒ', productCount: 0, parentId: 'fashion-men' },
  { id: 'sub-mens-hats-scarves', nameAr: 'ظ‚ط¨ط¹ط§طھ ظˆط£ظˆط´ط­ط© ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Hats & Scarves", slug: 'mens-hats-scarves', icon: 'ًں§¢', productCount: 0, parentId: 'fashion-men' },
  // fashion-women - ظ…ظ„ط§ط¨ط³ ظ†ط³ط§ط¦ظٹط©
  { id: 'sub-womens-dresses', nameAr: 'ظپط³ط§طھظٹظ† ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Dresses", slug: 'womens-dresses', icon: 'ًں‘—', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-abayas-hijabs', nameAr: 'ط¹ط¨ط§ظٹط§طھ ظˆط­ط¬ط§ط¨ط§طھ', nameEn: 'Abayas & Hijabs', slug: 'abayas-hijabs', icon: 'ًں§•', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-blouses', nameAr: 'ط¨ظ„ظˆط²ط§طھ ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Blouses", slug: 'womens-blouses', icon: 'ًں‘ڑ', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-skirts', nameAr: 'طھظ†ط§ظ†ظٹط± ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Skirts", slug: 'womens-skirts', icon: 'ًں‘ ', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-loungewear', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ…ظ†ط²ظ„ظٹط© ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Loungewear", slug: 'womens-loungewear', icon: 'ًں›‹ï¸ڈ', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-lingerie', nameAr: 'ظ…ظ„ط§ط¨ط³ ط¯ط§ط®ظ„ظٹط© ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Lingerie", slug: 'womens-lingerie', icon: 'ًں©±', productCount: 0, parentId: 'fashion-women' },
  { id: 'sub-womens-sportswear', nameAr: 'ظ…ظ„ط§ط¨ط³ ط±ظٹط§ط¶ظٹط© ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Sportswear", slug: 'womens-sportswear', icon: 'ًںڈƒâ€چâ™€ï¸ڈ', productCount: 0, parentId: 'fashion-women' },
  // fashion-kids - ظ…ظ„ط§ط¨ط³ ط£ط·ظپط§ظ„ ظˆظ…ظˆط§ظ„ظٹط¯
  { id: 'sub-newborn-0-3m', nameAr: 'ط­ط¯ظٹط«ظٹ ط§ظ„ظˆظ„ط§ط¯ط© 0-3 ط£ط´ظ‡ط±', nameEn: 'Newborn 0-3m', slug: 'newborn-0-3m', icon: 'ًں‘¶', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-baby-3-6m', nameAr: 'ط±ط¶ظٹط¹ 3-6 ط£ط´ظ‡ط±', nameEn: 'Baby 3-6m', slug: 'baby-3-6m', icon: 'ًں‘¶', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-baby-6-12m', nameAr: 'ط±ط¶ظٹط¹ 6-12 ط´ظ‡ط±', nameEn: 'Baby 6-12m', slug: 'baby-6-12m', icon: 'ًں§’', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-toddler-1-2y', nameAr: 'ط·ظپظ„ 1-2 ط³ظ†ط©', nameEn: 'Toddler 1-2y', slug: 'toddler-1-2y', icon: 'ًں‘¦', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-toddler-2-4y', nameAr: 'ط·ظپظ„ 2-4 ط³ظ†ظˆط§طھ', nameEn: 'Toddler 2-4y', slug: 'toddler-2-4y', icon: 'ًں‘§', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-girls-clothes', nameAr: 'ظ…ظ„ط§ط¨ط³ ط¨ظ†ط§طھ', nameEn: "Girls' Clothes", slug: 'girls-clothes', icon: 'ًں‘—', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-boys-clothes', nameAr: 'ظ…ظ„ط§ط¨ط³ ط£ظˆظ„ط§ط¯', nameEn: "Boys' Clothes", slug: 'boys-clothes', icon: 'ًں§’', productCount: 0, parentId: 'fashion-kids' },
  { id: 'sub-school-uniforms', nameAr: 'ط²ظٹ ظ…ط¯ط±ط³ظٹ', nameEn: 'School Uniforms', slug: 'school-uniforms', icon: 'ًںژ’', productCount: 0, parentId: 'fashion-kids' },
  // footwear-men - ط£ط­ط°ظٹط© ط±ط¬ط§ظ„ظٹط©
  { id: 'sub-mens-formal-shoes', nameAr: 'ط£ط­ط°ظٹط© ط±ط³ظ…ظٹط© ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Formal Shoes", slug: 'mens-formal-shoes', icon: 'ًں‘‍', productCount: 0, parentId: 'footwear-men' },
  { id: 'sub-mens-sneakers', nameAr: 'ط³ظ†ظٹظƒط±ط² ط±ط¬ط§ظ„ظٹ', nameEn: "Men's Sneakers", slug: 'mens-sneakers', icon: 'ًں‘ں', productCount: 0, parentId: 'footwear-men' },
  { id: 'sub-mens-slippers-sandals', nameAr: 'ط´ط¨ط§ط´ط¨ ظˆطµظ†ط§ط¯ظ„ ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Slippers & Sandals", slug: 'mens-slippers-sandals', icon: 'ًں©´', productCount: 0, parentId: 'footwear-men' },
  { id: 'sub-mens-work-shoes', nameAr: 'ط£ط­ط°ظٹط© ط¹ظ…ظ„ ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Work Shoes", slug: 'mens-work-shoes', icon: 'ًں¥¾', productCount: 0, parentId: 'footwear-men' },
  // footwear-women - ط£ط­ط°ظٹط© ظ†ط³ط§ط¦ظٹط©
  { id: 'sub-womens-heels', nameAr: 'ظƒط¹ط¨ ط¹ط§ظ„ظٹ ظ†ط³ط§ط¦ظٹ', nameEn: "Women's Heels", slug: 'womens-heels', icon: 'ًں‘ ', productCount: 0, parentId: 'footwear-women' },
  { id: 'sub-womens-flats', nameAr: 'ط£ط­ط°ظٹط© ظ…ط³ط·ط­ط© ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Flats", slug: 'womens-flats', icon: 'ًں¥؟', productCount: 0, parentId: 'footwear-women' },
  { id: 'sub-womens-sneakers', nameAr: 'ط³ظ†ظٹظƒط±ط² ظ†ط³ط§ط¦ظٹ', nameEn: "Women's Sneakers", slug: 'womens-sneakers', icon: 'ًں‘ں', productCount: 0, parentId: 'footwear-women' },
  { id: 'sub-womens-slippers', nameAr: 'ط´ط¨ط§ط´ط¨ ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Slippers", slug: 'womens-slippers', icon: 'ًں©´', productCount: 0, parentId: 'footwear-women' },
  // footwear-kids - ط£ط­ط°ظٹط© ط£ط·ظپط§ظ„
  { id: 'sub-baby-booties', nameAr: 'ط¨ظˆط· ط£ط·ظپط§ظ„', nameEn: 'Baby Booties', slug: 'baby-booties', icon: 'ًں§¦', productCount: 0, parentId: 'footwear-kids' },
  { id: 'sub-kids-sneakers', nameAr: 'ط³ظ†ظٹظƒط±ط² ط£ط·ظپط§ظ„', nameEn: 'Kids Sneakers', slug: 'kids-sneakers', icon: 'ًں‘ں', productCount: 0, parentId: 'footwear-kids' },
  { id: 'sub-kids-sandals', nameAr: 'طµظ†ط§ط¯ظ„ ط£ط·ظپط§ظ„', nameEn: 'Kids Sandals', slug: 'kids-sandals', icon: 'ًں©´', productCount: 0, parentId: 'footwear-kids' },
  { id: 'sub-school-shoes', nameAr: 'ط£ط­ط°ظٹط© ظ…ط¯ط±ط³ظٹط©', nameEn: 'School Shoes', slug: 'school-shoes', icon: 'ًں‘‍', productCount: 0, parentId: 'footwear-kids' },
  // perfumes-oud - ط§ظ„ط¹ط·ظˆط± ظˆط§ظ„ط¨ط®ظˆط±
  { id: 'sub-mens-perfumes', nameAr: 'ط¹ط·ظˆط± ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Perfumes", slug: 'mens-perfumes', icon: 'ًں§´', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-womens-perfumes', nameAr: 'ط¹ط·ظˆط± ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Perfumes", slug: 'womens-perfumes', icon: 'ًں’گ', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-oud-incense', nameAr: 'ط¹ظˆط¯ ظˆط¨ط®ظˆط±', nameEn: 'Oud & Incense', slug: 'oud-incense', icon: 'ًںھµ', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-musk-oils', nameAr: 'ظ…ط³ظƒ ظˆط²ظٹظˆطھ', nameEn: 'Musk & Oils', slug: 'musk-oils', icon: 'ًں’§', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-incense-burners', nameAr: 'ظ…ط¨ط§ط®ط±', nameEn: 'Incense Burners', slug: 'incense-burners', icon: 'ًںھ”', productCount: 0, parentId: 'perfumes-oud' },
  { id: 'sub-car-home-fragrance', nameAr: 'ظ…ط¹ط·ط±ط§طھ ط³ظٹط§ط±ط© ظˆظ…ظ†ط²ظ„', nameEn: 'Car & Home Fragrance', slug: 'car-home-fragrance', icon: 'ًںڑ—', productCount: 0, parentId: 'perfumes-oud' },
  // accessories - ط§ظ„ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظˆط§ظ„ط³ط§ط¹ط§طھ
  { id: 'sub-mens-watches', nameAr: 'ط³ط§ط¹ط§طھ ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Watches", slug: 'mens-watches', icon: 'âŒڑ', productCount: 0, parentId: 'accessories' },
  { id: 'sub-womens-watches', nameAr: 'ط³ط§ط¹ط§طھ ظ†ط³ط§ط¦ظٹط©', nameEn: "Women's Watches", slug: 'womens-watches', icon: 'âŒڑ', productCount: 0, parentId: 'accessories' },
  { id: 'sub-kids-watches', nameAr: 'ط³ط§ط¹ط§طھ ط£ط·ظپط§ظ„', nameEn: "Kids' Watches", slug: 'kids-watches', icon: 'âŒڑ', productCount: 0, parentId: 'accessories' },
  { id: 'sub-jewelry', nameAr: 'ظ…ط¬ظˆظ‡ط±ط§طھ', nameEn: 'Jewelry', slug: 'jewelry', icon: 'ًں’چ', productCount: 0, parentId: 'accessories' },
  { id: 'sub-sunglasses', nameAr: 'ظ†ط¸ط§ط±ط§طھ ط´ظ…ط³ظٹط©', nameEn: 'Sunglasses', slug: 'sunglasses', icon: 'ًں•¶ï¸ڈ', productCount: 0, parentId: 'accessories' },
  { id: 'sub-bags-wallets', nameAr: 'ط­ظ‚ط§ط¦ط¨ ظˆظ…ط­ط§ظپط¸', nameEn: 'Bags & Wallets', slug: 'bags-wallets', icon: 'ًں‘œ', productCount: 0, parentId: 'accessories' },
  { id: 'sub-phone-cases', nameAr: 'ظƒظپط±ط§طھ ظ‡ظˆط§طھظپ', nameEn: 'Phone Cases', slug: 'phone-cases', icon: 'ًں“±', productCount: 0, parentId: 'accessories' },
  // mother-baby - ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط£ظ… ظˆط§ظ„ط·ظپظ„
  { id: 'sub-diapers-wipes', nameAr: 'ط­ظپط§ط¶ط§طھ ظˆظ…ظ†ط§ط¯ظٹظ„', nameEn: 'Diapers & Wipes', slug: 'diapers-wipes', icon: 'ًں§·', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-bottles-pacifiers', nameAr: 'ط±ط¶ط¹ط§طھ ظˆظ…طµط§طµط§طھ', nameEn: 'Bottles & Pacifiers', slug: 'bottles-pacifiers', icon: 'ًںچ¼', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-strollers-car-seats', nameAr: 'ط¹ط±ط¨ط§طھ ظˆظ…ظ‚ط§ط¹ط¯ ط³ظٹط§ط±ط©', nameEn: 'Strollers & Car Seats', slug: 'strollers-car-seats', icon: 'ًںڑ¼', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-breastfeeding', nameAr: 'ط±ط¶ط§ط¹ط© ط·ط¨ظٹط¹ظٹط©', nameEn: 'Breastfeeding', slug: 'breastfeeding', icon: 'ًں¤±', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-nursery-furniture', nameAr: 'ط£ط«ط§ط« ط؛ط±ظپط© ط§ظ„ط£ط·ظپط§ظ„', nameEn: 'Nursery Furniture', slug: 'nursery-furniture', icon: 'ًں›ڈï¸ڈ', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-newborn-clothes-mb', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ…ظˆط§ظ„ظٹط¯', nameEn: 'Newborn Clothes', slug: 'newborn-clothes-mb', icon: 'ًں‘¶', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-infant-clothes-mb', nameAr: 'ظ…ظ„ط§ط¨ط³ ط±ط¶ط¹', nameEn: 'Infant Clothes', slug: 'infant-clothes-mb', icon: 'ًں‘¶', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-baby-food', nameAr: 'ط؛ط°ط§ط، ط£ط·ظپط§ظ„', nameEn: 'Baby Food', slug: 'baby-food', icon: 'ًں¥„', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-baby-care', nameAr: 'ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط·ظپظ„', nameEn: 'Baby Care', slug: 'baby-care', icon: 'ًں§´', productCount: 0, parentId: 'mother-baby' },
  { id: 'sub-bath-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط§ط³طھط­ظ…ط§ظ…', nameEn: 'Bath Toys', slug: 'bath-toys', icon: 'ًں›پ', productCount: 0, parentId: 'mother-baby' },
  // home-care - ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ظٹطھ
  { id: 'sub-cleaners-disinfectants', nameAr: 'ظ…ظ†ط¸ظپط§طھ ظˆظ…ط·ظ‡ط±ط§طھ', nameEn: 'Cleaners & Disinfectants', slug: 'cleaners-disinfectants', icon: 'ًں§¹', productCount: 0, parentId: 'home-care' },
  { id: 'sub-cleaning-tools', nameAr: 'ط£ط¯ظˆط§طھ طھظ†ط¸ظٹظپ', nameEn: 'Cleaning Tools', slug: 'cleaning-tools', icon: 'ًں§½', productCount: 0, parentId: 'home-care' },
  { id: 'sub-cleaning-machines', nameAr: 'ظ…ط§ظƒظٹظ†ط§طھ طھظ†ط¸ظٹظپ', nameEn: 'Cleaning Machines', slug: 'cleaning-machines', icon: 'ًں¤–', productCount: 0, parentId: 'home-care' },
  { id: 'sub-soap-fresheners', nameAr: 'طµط§ط¨ظˆظ† ظˆظ…ط¹ط·ط±ط§طھ', nameEn: 'Soap & Fresheners', slug: 'soap-fresheners', icon: 'ًں§¼', productCount: 0, parentId: 'home-care' },
  { id: 'sub-laundry-supplies', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط؛ط³ظٹظ„', nameEn: 'Laundry Supplies', slug: 'laundry-supplies', icon: 'ًں§؛', productCount: 0, parentId: 'home-care' },
  // electrical-appliances - ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط©
  { id: 'sub-kitchen-appliances', nameAr: 'ط£ط¬ظ‡ط²ط© ظ…ط·ط¨ط®', nameEn: 'Kitchen Appliances', slug: 'kitchen-appliances', icon: 'ًں”Œ', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-ac-fans', nameAr: 'ظ…ظƒظٹظپط§طھ ظˆظ…ط±ط§ظˆط­', nameEn: 'AC & Fans', slug: 'ac-fans', icon: 'â‌„ï¸ڈ', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-washers-dryers', nameAr: 'ط؛ط³ط§ظ„ط§طھ ظˆظ…ط¬ظپظپط§طھ', nameEn: 'Washers & Dryers', slug: 'washers-dryers', icon: 'ًں«§', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-heaters', nameAr: 'ط³ط®ط§ظ†ط§طھ', nameEn: 'Heaters', slug: 'heaters', icon: 'ًںŒ،ï¸ڈ', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-vacuum-cleaners', nameAr: 'ظ…ظƒط§ظ†ط³ ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Vacuum Cleaners', slug: 'vacuum-cleaners', icon: 'ًں¤–', productCount: 0, parentId: 'electrical-appliances' },
  { id: 'sub-small-appliances', nameAr: 'ط£ط¬ظ‡ط²ط© طµط؛ظٹط±ط©', nameEn: 'Small Appliances', slug: 'small-appliances', icon: 'âڑ،', productCount: 0, parentId: 'electrical-appliances' },
  // electronics - ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط§طھ
  { id: 'sub-phones-accessories', nameAr: 'ظ‡ظˆط§طھظپ ظˆط¥ظƒط³ط³ظˆط§ط±ط§طھ', nameEn: 'Phones & Accessories', slug: 'phones-accessories', icon: 'ًں“±', productCount: 0, parentId: 'electronics' },
  { id: 'sub-tablets', nameAr: 'طھط§ط¨ظ„طھ', nameEn: 'Tablets', slug: 'tablets', icon: 'ًں“ں', productCount: 0, parentId: 'electronics' },
  { id: 'sub-headphones', nameAr: 'ط³ظ…ط§ط¹ط§طھ', nameEn: 'Headphones', slug: 'headphones', icon: 'ًںژ§', productCount: 0, parentId: 'electronics' },
  { id: 'sub-tvs-monitors', nameAr: 'طھظ„ظپط²ظٹظˆظ†ط§طھ ظˆط´ط§ط´ط§طھ', nameEn: 'TVs & Monitors', slug: 'tvs-monitors', icon: 'ًں“؛', productCount: 0, parentId: 'electronics' },
  { id: 'sub-cameras', nameAr: 'ظƒط§ظ…ظٹط±ط§طھ', nameEn: 'Cameras', slug: 'cameras', icon: 'ًں“·', productCount: 0, parentId: 'electronics' },
  { id: 'sub-audio-devices', nameAr: 'ط£ط¬ظ‡ط²ط© طµظˆطھ', nameEn: 'Audio Devices', slug: 'audio-devices', icon: 'ًں”ٹ', productCount: 0, parentId: 'electronics' },
  { id: 'sub-smart-home', nameAr: 'ظ…ظ†ط²ظ„ ط°ظƒظٹ', nameEn: 'Smart Home', slug: 'smart-home', icon: 'ًںڈ ', productCount: 0, parentId: 'electronics' },
  { id: 'sub-chargers-batteries', nameAr: 'ط´ظˆط§ط­ظ† ظˆط¨ط·ط§ط±ظٹط§طھ', nameEn: 'Chargers & Batteries', slug: 'chargers-batteries', icon: 'ًں”‹', productCount: 0, parentId: 'electronics' },
  // children-toys - ط£ظ„ط¹ط§ط¨ ط£ط·ظپط§ظ„
  { id: 'sub-educational-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ طھط¹ظ„ظٹظ…ظٹط©', nameEn: 'Educational Toys', slug: 'educational-toys', icon: 'ًں§©', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-fun-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ طھط±ظپظٹظ‡ظٹط©', nameEn: 'Fun Toys', slug: 'fun-toys', icon: 'ًںژ®', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-girls-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط¨ظ†ط§طھ', nameEn: "Girls' Toys", slug: 'girls-toys', icon: 'ًں§¸', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-boys-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط£ظˆظ„ط§ط¯', nameEn: "Boys' Toys", slug: 'boys-toys', icon: 'ًںڑ—', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-sports-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط±ظٹط§ط¶ظٹط©', nameEn: 'Sports Toys', slug: 'sports-toys', icon: 'âڑ½', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-outdoor-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط®ط§ط±ط¬ظٹط©', nameEn: 'Outdoor Toys', slug: 'outdoor-toys', icon: 'ًںŒ³', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-baby-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ظ…ظˆط§ظ„ظٹط¯', nameEn: 'Baby Toys', slug: 'baby-toys', icon: 'ًں‘¶', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-lego-puzzles', nameAr: 'ظ„ظٹط؛ظˆ ظˆط¨ط§ط²ظ„', nameEn: 'Lego & Puzzles', slug: 'lego-puzzles', icon: 'ًں§±', productCount: 0, parentId: 'children-toys' },
  { id: 'sub-electronic-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط¥ظ„ظƒطھط±ظˆظ†ظٹط©', nameEn: 'Electronic Toys', slug: 'electronic-toys', icon: 'ًں¤–', productCount: 0, parentId: 'children-toys' },
  // pet-supplies - ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط­ظٹظˆط§ظ†ط§طھ
  { id: 'sub-cat-food', nameAr: 'ط·ط¹ط§ظ… ظ‚ط·ط·', nameEn: 'Cat Food', slug: 'cat-food', icon: 'ًںگ±', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-dog-food', nameAr: 'ط·ط¹ط§ظ… ظƒظ„ط§ط¨', nameEn: 'Dog Food', slug: 'dog-food', icon: 'ًںگ¶', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-pet-toys', nameAr: 'ط£ظ„ط¹ط§ط¨ ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Toys', slug: 'pet-toys', icon: 'ًں§¸', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-cages-beds', nameAr: 'ط£ظ‚ظپط§طµ ظˆط£ط³ط±ظ‘ط©', nameEn: 'Cages & Beds', slug: 'cages-beds', icon: 'ًںڈ ', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-pet-hygiene', nameAr: 'ظ†ط¸ط§ظپط© ط§ظ„ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Hygiene', slug: 'pet-hygiene', icon: 'ًں§´', productCount: 0, parentId: 'pet-supplies' },
  { id: 'sub-collars-leashes', nameAr: 'ط£ط·ظˆط§ظ‚ ظˆط£ظ‚ظٹط¯ط©', nameEn: 'Collars & Leashes', slug: 'collars-leashes', icon: 'ًں”—', productCount: 0, parentId: 'pet-supplies' },
  // ornamental-plants - ظ†ط¨ط§طھط§طھ ط§ظ„ط²ظٹظ†ط©
  { id: 'sub-indoor-plants', nameAr: 'ظ†ط¨ط§طھط§طھ ط¯ط§ط®ظ„ظٹط©', nameEn: 'Indoor Plants', slug: 'indoor-plants', icon: 'ًںŒ؟', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-outdoor-plants', nameAr: 'ظ†ط¨ط§طھط§طھ ط®ط§ط±ط¬ظٹط©', nameEn: 'Outdoor Plants', slug: 'outdoor-plants', icon: 'ًںŒ³', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-pots-planters', nameAr: 'ط£طµظٹطµ ظˆط²ط±ط§ط¹ط©', nameEn: 'Pots & Planters', slug: 'pots-planters', icon: 'ًںھ´', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-fertilizers-supplies', nameAr: 'ط£ط³ظ…ط¯ط© ظˆظ…ط³طھظ„ط²ظ…ط§طھ', nameEn: 'Fertilizers & Supplies', slug: 'fertilizers-supplies', icon: 'ًں§ھ', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-fresh-flowers', nameAr: 'ظˆط±ظˆط¯ ط·ط§ط²ط¬ط©', nameEn: 'Fresh Flowers', slug: 'fresh-flowers', icon: 'ًں’گ', productCount: 0, parentId: 'ornamental-plants' },
  { id: 'sub-artificial-plants', nameAr: 'ظ†ط¨ط§طھط§طھ طµظ†ط§ط¹ظٹط©', nameEn: 'Artificial Plants', slug: 'artificial-plants', icon: 'ًںŒ؛', productCount: 0, parentId: 'ornamental-plants' },
  // gifts-antiques - ط§ظ„طھط­ظپ ظˆط§ظ„ظ‡ط¯ط§ظٹط§
  { id: 'sub-occasion-gifts', nameAr: 'ظ‡ط¯ط§ظٹط§ ظ…ظ†ط§ط³ط¨ط§طھ', nameEn: 'Occasion Gifts', slug: 'occasion-gifts', icon: 'ًںژپ', productCount: 0, parentId: 'gifts-antiques' },
  { id: 'sub-antiques-decor', nameAr: 'طھط­ظپ ظˆط¯ظٹظƒظˆط±', nameEn: 'Antiques & Decor', slug: 'antiques-decor', icon: 'ًںڈ؛', productCount: 0, parentId: 'gifts-antiques' },
  { id: 'sub-souvenirs', nameAr: 'طھط°ظƒط§ط±ط§طھ', nameEn: 'Souvenirs', slug: 'souvenirs', icon: 'ًں—½', productCount: 0, parentId: 'gifts-antiques' },
  { id: 'sub-gift-wrapping', nameAr: 'طھط؛ظ„ظٹظپ ظ‡ط¯ط§ظٹط§', nameEn: 'Gift Wrapping', slug: 'gift-wrapping', icon: 'ًںژ€', productCount: 0, parentId: 'gifts-antiques' },
  { id: 'sub-candles-diffusers', nameAr: 'ط´ظ…ظˆط¹ ظˆظ…ط¹ط·ط±ط§طھ', nameEn: 'Candles & Diffusers', slug: 'candles-diffusers', icon: 'ًں•¯ï¸ڈ', productCount: 0, parentId: 'gifts-antiques' },
  // wall-art - ط§ظ„ط¬ط¯ط§ط±ظٹط§طھ
  { id: 'sub-paintings', nameAr: 'ظ„ظˆط­ط§طھ ظپظ†ظٹط©', nameEn: 'Paintings', slug: 'paintings', icon: 'ًںژ¨', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-clocks', nameAr: 'ط³ط§ط¹ط§طھ ط­ط§ط¦ط·', nameEn: 'Wall Clocks', slug: 'wall-clocks', icon: 'ًں•°ï¸ڈ', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-mirrors', nameAr: 'ظ…ط±ط§ظٹط§ ط¬ط¯ط§ط±ظٹط©', nameEn: 'Wall Mirrors', slug: 'wall-mirrors', icon: 'ًںھ‍', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-shelves', nameAr: 'ط£ط±ظپظپ ط¬ط¯ط§ط±ظٹط©', nameEn: 'Wall Shelves', slug: 'wall-shelves', icon: 'ًں“ڑ', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-decor', nameAr: 'ط¯ظٹظƒظˆط± ط¬ط¯ط§ط±ظٹ', nameEn: 'Wall Decor', slug: 'wall-decor', icon: 'ًں–¼ï¸ڈ', productCount: 0, parentId: 'wall-art' },
  { id: 'sub-wall-stickers', nameAr: 'ط³طھظٹظƒط±ط§طھ ط¬ط¯ط§ط±ظٹط©', nameEn: 'Wall Stickers', slug: 'wall-stickers', icon: 'âœ¨', productCount: 0, parentId: 'wall-art' },
];

// â”€â”€â”€ Local Products for Offline Fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LOCAL_PRODUCTS: Product[] = [
  { id: 'cmocboacb006rmtch97z9qzyb', nameAr: 'ظƒط§ظ…ظٹط±ط§', nameEn: 'Camera', price: 1200, comparePrice: 1400, mainImage: '/products/electronics-3.png', images: ['/products/electronics-3.png', '/products/electronics.png', '/products/electronics-2.png'], descriptionAr: 'ظƒط§ظ…ظٹط±ط§ ط±ظ‚ظ…ظٹط© ط¨ط¹ط¯ط³ط© ط¹ط§ظ„ظٹط© ط§ظ„ط¯ظ‚ط© ظˆطھط³ط¬ظٹظ„ ظپظٹط¯ظٹظˆ 4K', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط§طھ', nameEn: 'Electronics', slug: 'electronics', icon: 'ًں“±' }, stock: 8, rating: 4.7, reviewCount: 12, inStock: true, isActive: true },
  { id: 'cmocboaca006pmtchi780yw7o', nameAr: 'ط³ط§ط¹ط© ط°ظƒظٹط©', nameEn: 'Smartwatch', price: 280, comparePrice: 340, mainImage: '/products/electronics-2.png', images: ['/products/electronics-2.png', '/products/electronics.png', '/products/electronics-3.png'], descriptionAr: 'ط³ط§ط¹ط© ط°ظƒظٹط© ظ…طھط·ظˆط±ط© ط¨ط´ط§ط´ط© ظ„ظ…ط³ ظˆظ…ط±ط§ظ‚ط¨ط© طµط­ظٹط© ط´ط§ظ…ظ„ط©', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط§طھ', nameEn: 'Electronics', slug: 'electronics', icon: 'ًں“±' }, stock: 30, rating: 4.5, reviewCount: 39, inStock: true, isActive: true },
  { id: 'cmocboac9006nmtchlzyvaeqb', nameAr: 'ط´ط§ط­ظ† ط³ط±ظٹط¹', nameEn: 'Fast Charger', price: 35, comparePrice: 45, mainImage: '/products/electronics.png', images: ['/products/electronics.png', '/products/electronics-2.png', '/products/electronics-3.png'], descriptionAr: 'ط´ط§ط­ظ† ط³ط±ظٹط¹ ط¨ظ‚ظˆط© 65 ظˆط§ط· ظ…طھظˆط§ظپظ‚ ظ…ط¹ ط¬ظ…ظٹط¹ ط§ظ„ط£ط¬ظ‡ط²ط© ط§ظ„ط°ظƒظٹط©', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط§طھ', nameEn: 'Electronics', slug: 'electronics', icon: 'ًں“±' }, stock: 80, rating: 4.3, reviewCount: 36, inStock: true, isActive: true },
  { id: 'cmocboac8006lmtchzjkxcl2r', nameAr: 'طھط§ط¨ظ„طھ', nameEn: 'Tablet', price: 550, comparePrice: 650, mainImage: '/products/electronics-3.png', images: ['/products/electronics-3.png', '/products/electronics.png', '/products/electronics-2.png'], descriptionAr: 'طھط§ط¨ظ„طھ ط¨ط´ط§ط´ط© ط¹ط§ظ„ظٹط© ط§ظ„ط¯ظ‚ط© ظˆظ…ط¹ط§ظ„ط¬ ظ‚ظˆظٹ ظ„ظ„ط§ط³طھط®ط¯ط§ظ… ط§ظ„ظ…طھط¹ط¯ط¯', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط§طھ', nameEn: 'Electronics', slug: 'electronics', icon: 'ًں“±' }, stock: 20, rating: 4.4, reviewCount: 9, inStock: true, isActive: true },
  { id: 'cmocboac6006jmtcho4z8b2jq', nameAr: 'ط³ظ…ط§ط¹ط§طھ ط¨ظ„ظˆطھظˆط«', nameEn: 'Bluetooth Headphones', price: 180, comparePrice: 220, mainImage: '/products/electronics-2.png', images: ['/products/electronics-2.png', '/products/electronics.png', '/products/electronics-3.png'], descriptionAr: 'ط³ظ…ط§ط¹ط§طھ ط¨ظ„ظˆطھظˆط« ظ„ط§ط³ظ„ظƒظٹط© ط¨ط¬ظˆط¯ط© طµظˆطھ ط§ط³طھط«ظ†ط§ط¦ظٹط© ظˆط¹ط²ظ„ ظ„ظ„ط¶ظˆط¶ط§ط،', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط§طھ', nameEn: 'Electronics', slug: 'electronics', icon: 'ًں“±' }, stock: 40, rating: 4.5, reviewCount: 14, inStock: true, isActive: true },
  { id: 'cmocboac5006hmtch141gb5a8', nameAr: 'ظ‡ط§طھظپ ط°ظƒظٹ', nameEn: 'Smartphone', price: 850, comparePrice: 1000, mainImage: '/products/electronics.png', images: ['/products/electronics.png', '/products/electronics-2.png', '/products/electronics-3.png'], descriptionAr: 'ظ‡ط§طھظپ ط°ظƒظٹ ط¨ط´ط§ط´ط© AMOLED ظˆظƒط§ظ…ظٹط±ط§ ط¹ط§ظ„ظٹط© ط§ظ„ط¯ظ‚ط© ظˆط¨ط·ط§ط±ظٹط© ط·ظˆظٹظ„ط© ط§ظ„ط£ظ…ط¯', categoryId: 'cmocboa8l000emtchthhfs6m2', category: { id: 'cmocboa8l000emtchthhfs6m2', nameAr: 'ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹط§طھ', nameEn: 'Electronics', slug: 'electronics', icon: 'ًں“±' }, stock: 25, rating: 4.6, reviewCount: 16, inStock: true, isActive: true },
  { id: 'cmocboac4006fmtchcrzzjnnn', nameAr: 'ظ…ط±ظˆط­ط© ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Electric Fan', price: 65, comparePrice: 80, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'ظ…ط±ظˆط­ط© ظƒظ‡ط±ط¨ط§ط¦ظٹط© ط°ط§طھ ط±ظٹط´ ظƒط¨ظٹط±ط© ط¨ط³ط±ط¹ط§طھ ظ…طھط¹ط¯ط¯ط© ظˆظ…ظٹظ„ط§ظ† ظ‚ط§ط¨ظ„ ظ„ظ„طھط¹ط¯ظٹظ„', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: 'âڑ،' }, stock: 50, rating: 4.2, reviewCount: 14, inStock: true, isActive: true },
  { id: 'cmocboac3006dmtch92go5tl4', nameAr: 'ط³ط®ط§ظ† ظ…ظٹط§ظ‡', nameEn: 'Water Heater', price: 320, comparePrice: 380, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'ط³ط®ط§ظ† ظ…ظٹط§ظ‡ ظƒظ‡ط±ط¨ط§ط¦ظٹ ط¨ط³ط¹ط© 50 ظ„طھط± ظ…ط¹ ط¹ط²ظ„ ط­ط±ط§ط±ظٹ ظپط¹ط§ظ„', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: 'âڑ،' }, stock: 10, rating: 4.5, reviewCount: 12, inStock: true, isActive: true },
  { id: 'cmocboac2006bmtchnf9adn2b', nameAr: 'ظ…ظƒظˆط§ط© ط¨ط®ط§ط±', nameEn: 'Steam Iron', price: 85, comparePrice: 100, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'ظ…ظƒظˆط§ط© ط¨ط®ط§ط± ط¨ظ‚ظˆط© طھط¨ط®ظٹط± ط¹ط§ظ„ظٹط© ظˆط¨ط®ط²ط§ظ† ظ…ط§ط، ظƒط¨ظٹط±', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: 'âڑ،' }, stock: 40, rating: 4.3, reviewCount: 2, inStock: true, isActive: true },
  { id: 'cmocboac10069mtchqe8nnhgl', nameAr: 'ظ…ظƒظ†ط³ط© ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Vacuum Cleaner', price: 280, comparePrice: 340, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'ظ…ظƒظ†ط³ط© ظƒظ‡ط±ط¨ط§ط¦ظٹط© ظ‚ظˆظٹط© ط§ظ„ط´ظپط· ط¨ظپظ„طھط± HEPA ظ„ط£ظ†ط¸ظپ ظ†طھط§ط¦ط¬', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: 'âڑ،' }, stock: 15, rating: 4.4, reviewCount: 8, inStock: true, isActive: true },
  { id: 'cmocboabz0067mtch5g6r243h', nameAr: 'ظ…ط§ظƒظٹظ†ط© ظ‚ظ‡ظˆط©', nameEn: 'Coffee Machine', price: 350, comparePrice: 420, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'ظ…ط§ظƒظٹظ†ط© ظ‚ظ‡ظˆط© ط£ظˆطھظˆظ…ط§طھظٹظƒظٹط© ط¨ط¶ط؛ط· 15 ط¨ط§ط± ظ„طھط­ط¶ظٹط± ط¥ط³ط¨ط±ظٹط³ظˆ ظ…ط«ط§ظ„ظٹ', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: 'âڑ،' }, stock: 20, rating: 4.7, reviewCount: 14, inStock: true, isActive: true },
  { id: 'cmocboaby0065mtchkgobdb67', nameAr: 'ط®ظ„ط§ط· ظƒظ‡ط±ط¨ط§ط¦ظٹ', nameEn: 'Electric Blender', price: 120, comparePrice: 150, mainImage: '/products/electrical-appliances.png', images: ['/products/electrical-appliances.png'], descriptionAr: 'ط®ظ„ط§ط· ظƒظ‡ط±ط¨ط§ط¦ظٹ ظ…طھط¹ط¯ط¯ ط§ظ„ط³ط±ط¹ط§طھ ط¨ظˆط¹ط§ط، ط²ط¬ط§ط¬ظٹ ظ…ظ‚ط§ظˆظ… ظ„ظ„ط­ط±ط§ط±ط©', categoryId: 'cmocboa8l000dmtch78o93ne0', category: { id: 'cmocboa8l000dmtch78o93ne0', nameAr: 'ط§ظ„ط£ط¯ظˆط§طھ ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط©', nameEn: 'Electrical Appliances', slug: 'electrical-appliances', icon: 'âڑ،' }, stock: 35, rating: 4.5, reviewCount: 12, inStock: true, isActive: true },
  { id: 'cmocboabx0063mtch7m6o3ufb', nameAr: 'ظ…ط·ظ‡ط± ط¹ط§ظ…', nameEn: 'General Disinfectant', price: 10, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'ظ…ط·ظ‡ط± ط¹ط§ظ… ظ‚ظˆظٹ ظٹظ‚طھظ„ 99.9% ظ…ظ† ط§ظ„ط¬ط±ط§ط«ظٹظ… ظˆط§ظ„ط¨ظƒطھظٹط±ظٹط§', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ظٹطھ', nameEn: 'Home Care', slug: 'home-care', icon: 'ًں§¹' }, stock: 110, rating: 4.2, reviewCount: 29, inStock: true, isActive: true },
  { id: 'cmocboabw0061mtchio8iyxq7', nameAr: 'ظ…ظ„ظ…ط¹ ط£ط«ط§ط«', nameEn: 'Furniture Polish', price: 14, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'ظ…ظ„ظ…ط¹ ط£ط«ط§ط« ط¨طھط±ظƒظٹط¨ط© ط­ظ…ط§ظٹط© ظ…ط²ط¯ظˆط¬ط© طھظ…ظ†ط­ ظ„ظ…ط¹ط§ظ†ط§ظ‹ ظˆط­ظ…ط§ظٹط©', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ظٹطھ', nameEn: 'Home Care', slug: 'home-care', icon: 'ًں§¹' }, stock: 65, rating: 4, reviewCount: 41, inStock: true, isActive: true },
  { id: 'cmocboabv005zmtchcz9g6rlq', nameAr: 'ظ…ط¹ط·ط± ط¬ظˆ', nameEn: 'Air Freshener', price: 15, comparePrice: 18, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'ظ…ط¹ط·ط± ط¬ظˆ ط¨ط±ط§ط¦ط­ط© ط·ط¨ظٹط¹ظٹط© ظ…ظ†ط¹ط´ط© طھط¯ظˆظ… ط·ظˆظٹظ„ط§ظ‹', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ظٹطھ', nameEn: 'Home Care', slug: 'home-care', icon: 'ًں§¹' }, stock: 80, rating: 4.3, reviewCount: 1, inStock: true, isActive: true },
  { id: 'cmocboabu005xmtchjd2goa0o', nameAr: 'طµط§ط¨ظˆظ† ط£ط·ط¨ط§ظ‚', nameEn: 'Dish Soap', price: 8, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'طµط§ط¨ظˆظ† ط£ط·ط¨ط§ظ‚ ط³ط§ط¦ظ„ ظ„ط·ظٹظپ ط¹ظ„ظ‰ ط§ظ„ظٹط¯ظٹظ† ظˆظ‚ظˆظٹ ط¹ظ„ظ‰ ط§ظ„ط¯ظ‡ظˆظ†', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ظٹطھ', nameEn: 'Home Care', slug: 'home-care', icon: 'ًں§¹' }, stock: 150, rating: 4.1, reviewCount: 44, inStock: true, isActive: true },
  { id: 'cmocboabt005vmtchrchqb947', nameAr: 'ط؛ط³ظٹظ„ ظ…ظ„ط§ط¨ط³', nameEn: 'Laundry Detergent', price: 18, comparePrice: 22, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'ظ…ط³ط­ظˆظ‚ ط؛ط³ظٹظ„ ظ…ظ„ط§ط¨ط³ ظ…ط±ظƒط² ظپط¹ط§ظ„ ظپظٹ ط¥ط²ط§ظ„ط© ط§ظ„ط¨ظ‚ط¹ ط§ظ„ط¹ظ†ظٹط¯ط©', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ظٹطھ', nameEn: 'Home Care', slug: 'home-care', icon: 'ًں§¹' }, stock: 100, rating: 4.4, reviewCount: 47, inStock: true, isActive: true },
  { id: 'cmocboabs005tmtchmgnl5obz', nameAr: 'ظ…ظ†ط¸ظپ ط£ط±ط¶ظٹط§طھ', nameEn: 'Floor Cleaner', price: 12, mainImage: '/products/home-care.png', images: ['/products/home-care.png'], descriptionAr: 'ظ…ظ†ط¸ظپ ط£ط±ط¶ظٹط§طھ ظپط¹ط§ظ„ ط¨ط¹ط¨ظ‚ط·ط± ظ…ظ†ط¹ط´ ظˆطµظٹط؛ط© ظ…ط¶ط§ط¯ط© ظ„ظ„ط¨ظƒطھظٹط±ظٹط§', categoryId: 'cmocboa8i000amtchd15exbe6', category: { id: 'cmocboa8i000amtchd15exbe6', nameAr: 'ط§ظ„ط¹ظ†ط§ظٹط© ط¨ط§ظ„ط¨ظٹطھ', nameEn: 'Home Care', slug: 'home-care', icon: 'ًں§¹' }, stock: 120, rating: 4.2, reviewCount: 17, inStock: true, isActive: true },
  { id: 'cmocboabr005rmtchz5iiuqij', nameAr: 'ط±ط¶ط§ط¹ط© ط£ط·ظپط§ظ„', nameEn: 'Baby Bottle', price: 18, comparePrice: 22, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'ط±ط¶ط§ط¹ط© ط£ط·ظپط§ظ„ ظ…ط¶ط§ط¯ط© ظ„ظ„ظ…ط؛طµ ط¨طھطµظ…ظٹظ… ظٹط­ط§ظƒظٹ ط§ظ„ط±ط¶ط§ط¹ط© ط§ظ„ط·ط¨ظٹط¹ظٹط©', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط£ظ… ظˆط§ظ„ط·ظپظ„', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: 'ًںچ¼' }, stock: 90, rating: 4.4, reviewCount: 39, inStock: true, isActive: true },
  { id: 'cmocboabq005pmtchu7dhuof3', nameAr: 'ظ…ظ„ط§ط¨ط³ ظ…ظˆط§ظ„ظٹط¯', nameEn: 'Newborn Clothes Set', price: 45, comparePrice: 55, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'ط·ظ‚ظ… ظ…ظ„ط§ط¨ط³ ظ…ظˆط§ظ„ظٹط¯ ظ‚ط·ظ†ظٹط© ظ†ط§ط¹ظ…ط© ط¨طھطµط§ظ…ظٹظ… ظ…ظ„ظˆظ†ط© ظˆظ…ط±ظٹط­ط©', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط£ظ… ظˆط§ظ„ط·ظپظ„', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: 'ًںچ¼' }, stock: 50, rating: 4.3, reviewCount: 6, inStock: true, isActive: true },
  { id: 'cmocboabp005nmtch5ds9z5pl', nameAr: 'ظƒط±ط³ظٹ ط³ظٹط§ط±ط© ط£ط·ظپط§ظ„', nameEn: 'Baby Car Seat', price: 320, comparePrice: 380, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'ظƒط±ط³ظٹ ط³ظٹط§ط±ط© ط£ط·ظپط§ظ„ ط¢ظ…ظ† ظ…طھظˆط§ظپظ‚ ظ…ط¹ ظ…ط¹ط§ظٹظٹط± ط§ظ„ط³ظ„ط§ظ…ط© ط§ظ„ط£ظˆط±ظˆط¨ظٹط©', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط£ظ… ظˆط§ظ„ط·ظپظ„', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: 'ًںچ¼' }, stock: 12, rating: 4.8, reviewCount: 40, inStock: true, isActive: true },
  { id: 'cmocboabo005lmtchwcm4ur8i', nameAr: 'ط¹ط±ط¨ط© ط£ط·ظپط§ظ„', nameEn: 'Baby Stroller', price: 450, comparePrice: 550, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'ط¹ط±ط¨ط© ط£ط·ظپط§ظ„ ط®ظپظٹظپط© ط§ظ„ظˆط²ظ† ظ‚ط§ط¨ظ„ط© ظ„ظ„ط·ظٹ ط¨طھطµظ…ظٹظ… ط¢ظ…ظ† ظˆظ…ط±ظٹط­', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط£ظ… ظˆط§ظ„ط·ظپظ„', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: 'ًںچ¼' }, stock: 15, rating: 4.7, reviewCount: 38, inStock: true, isActive: true },
  { id: 'cmocboabn005jmtchm6gef3gt', nameAr: 'ط­ظپط§ط¶ط§طھ ط£ط·ظپط§ظ„', nameEn: 'Baby Diapers', price: 35, comparePrice: 42, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'ط­ظپط§ط¶ط§طھ ط£ط·ظپط§ظ„ ظپط§ط¦ظ‚ط© ط§ظ„ط§ظ…طھطµط§طµ ط¨ط·ط¨ظ‚ط© ظ†ط§ط¹ظ…ط© ظ„ظ„ط¨ط´ط±ط© ط§ظ„ط­ط³ط§ط³ط©', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط£ظ… ظˆط§ظ„ط·ظپظ„', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: 'ًںچ¼' }, stock: 100, rating: 4.5, reviewCount: 22, inStock: true, isActive: true },
  { id: 'cmocboabm005hmtch2hsf1h88', nameAr: 'ط­ظ„ظٹط¨ ط£ط·ظپط§ظ„', nameEn: 'Baby Formula', price: 55, comparePrice: 65, mainImage: '/products/mother-baby.png', images: ['/products/mother-baby.png'], descriptionAr: 'ط­ظ„ظٹط¨ ط£ط·ظپط§ظ„ ظ…ط±ط­ظ„ط© ط£ظˆظ„ظ‰ ظ…ط¯ط¹ظ… ط¨ط§ظ„ظپظٹطھط§ظ…ظٹظ†ط§طھ ظˆط§ظ„ظ…ط¹ط§ط¯ظ† ط§ظ„ط£ط³ط§ط³ظٹط©', categoryId: 'cmocboa8h0008mtchcuzzgudx', category: { id: 'cmocboa8h0008mtchcuzzgudx', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط£ظ… ظˆط§ظ„ط·ظپظ„', nameEn: 'Mother & Baby', slug: 'mother-baby', icon: 'ًںچ¼' }, stock: 80, rating: 4.6, reviewCount: 38, inStock: true, isActive: true },
  { id: 'cmocboabl005fmtch2hzxc70h', nameAr: 'ط®ط§طھظ… ظپط¶ط©', nameEn: 'Silver Ring', price: 120, comparePrice: 150, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'ط®ط§طھظ… ظپط¶ط© ط§ط³طھط±ظ„ظٹظ†ظٹ ط¨طھطµظ…ظٹظ… ط´ط±ظ‚ظٹ ظ…ط²ط®ط±ظپ ظٹط¯ظˆظٹ ط§ظ„طµظ†ط¹', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'ط§ظ„ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظˆط§ظ„ط³ط§ط¹ط§طھ', nameEn: 'Accessories & Watches', slug: 'accessories', icon: 'âŒڑ' }, stock: 30, rating: 4.5, reviewCount: 49, inStock: true, isActive: true },
  { id: 'cmocboabk005dmtch38udjrl2', nameAr: 'ط¹ظ‚ط¯ ظ„ط¤ظ„ط¤', nameEn: 'Pearl Necklace', price: 450, comparePrice: 550, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'ط¹ظ‚ط¯ ظ„ط¤ظ„ط¤ ط·ط¨ظٹط¹ظٹ ط¨طھطµظ…ظٹظ… ط£ظ†ظٹظ‚ ظˆظپط§ط®ط± ظ„ظ„ظ…ظ†ط§ط³ط¨ط§طھ', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'ط§ظ„ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظˆط§ظ„ط³ط§ط¹ط§طھ', nameEn: 'Accessories & Watches', slug: 'accessories', icon: 'âŒڑ' }, stock: 12, rating: 4.8, reviewCount: 41, inStock: true, isActive: true },
  { id: 'cmocboabj005bmtcht7c4v39r', nameAr: 'ط­ط²ط§ظ… ط¬ظ„ط¯', nameEn: 'Leather Belt', price: 65, comparePrice: 80, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'ط­ط²ط§ظ… ط¬ظ„ط¯ ط·ط¨ظٹط¹ظٹ ط¨طھطµظ…ظٹظ… ظƒظ„ط§ط³ظٹظƒظٹ ظˆط¥ط¨ط²ظٹظ… ط³طھط§ظ†ظ„ط³ ط³طھظٹظ„', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'ط§ظ„ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظˆط§ظ„ط³ط§ط¹ط§طھ', nameEn: 'Accessories & Watches', slug: 'accessories', icon: 'âŒڑ' }, stock: 55, rating: 4.4, reviewCount: 30, inStock: true, isActive: true },
  { id: 'cmocboabi0059mtchk4rid5q2', nameAr: 'ظ†ط¸ط§ط±ط© ط´ظ…ط³ظٹط©', nameEn: 'Sunglasses', price: 85, comparePrice: 110, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'ظ†ط¸ط§ط±ط© ط´ظ…ط³ظٹط© ط¨طھطµظ…ظٹظ… ط¹طµط±ظٹ ط¨ط¹ط¯ط³ط§طھ ظ…ط³طھظ‚ط·ط¨ط© ظ„ظ„ط­ظ…ط§ظٹط© ظ…ظ† ط§ظ„ط´ظ…ط³', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'ط§ظ„ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظˆط§ظ„ط³ط§ط¹ط§طھ', nameEn: 'Accessories & Watches', slug: 'accessories', icon: 'âŒڑ' }, stock: 45, rating: 4.3, reviewCount: 35, inStock: true, isActive: true },
  { id: 'cmocboabg0057mtchidux1hxp', nameAr: 'ط³ظˆط§ط± ط°ظ‡ط¨', nameEn: 'Gold Bracelet', price: 1200, comparePrice: 1400, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'ط³ظˆط§ط± ط°ظ‡ط¨ ط¹ظٹط§ط± 18 ط¨طھطµظ…ظٹظ… ط´ط±ظ‚ظٹ ط£ظ†ظٹظ‚ ظˆظ…طھظٹظ†', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'ط§ظ„ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظˆط§ظ„ط³ط§ط¹ط§طھ', nameEn: 'Accessories & Watches', slug: 'accessories', icon: 'âŒڑ' }, stock: 10, rating: 4.9, reviewCount: 24, inStock: true, isActive: true },
  { id: 'cmocboabf0055mtchw2npcixo', nameAr: 'ط³ط§ط¹ط© ظٹط¯ ط±ط¬ط§ظ„ظٹط©', nameEn: "Men's Wristwatch", price: 350, comparePrice: 420, mainImage: '/products/accessories.png', images: ['/products/accessories.png'], descriptionAr: 'ط³ط§ط¹ط© ظٹط¯ ط±ط¬ط§ظ„ظٹط© ظپط§ط®ط±ط© ط¨طھطµظ…ظٹظ… ظƒظ„ط§ط³ظٹظƒظٹ ظˆط¥ط·ط§ط± ط³طھط§ظ†ظ„ط³ ط³طھظٹظ„', categoryId: 'cmocboa8m000hmtchtef3fxae', category: { id: 'cmocboa8m000hmtchtef3fxae', nameAr: 'ط§ظ„ط¥ظƒط³ط³ظˆط§ط±ط§طھ ظˆط§ظ„ط³ط§ط¹ط§طھ', nameEn: 'Accessories & Watches', slug: 'accessories', icon: 'âŒڑ' }, stock: 20, rating: 4.7, reviewCount: 10, inStock: true, isActive: true },
  // â”€â”€â”€ Ornamental Plants Products â”€â”€â”€
  { id: 'prod-plant-monstera-001', nameAr: 'ظ†ط¨طھط© ظ…ظˆظ†ط³طھظٹط±ط§ ط¯ط§ط®ظ„ظٹط© ظپظٹ ط£طµظٹطµ ط³ظٹط±ط§ظ…ظٹظƒ', nameEn: 'Indoor Monstera Plant in Ceramic Pot', price: 75, comparePrice: 95, mainImage: '/products/ornamental-plants-2.png', images: ['/products/ornamental-plants-2.png'], descriptionAr: 'ظ†ط¨طھط© ظ…ظˆظ†ط³طھظٹط±ط§ ط¯ظٹظ„ظٹط³ظٹظˆط³ط§ ط§ظ„ط§ط³طھظˆط§ط¦ظٹط© ظپظٹ ط£طµظٹطµ ط³ظٹط±ط§ظ…ظٹظƒ ط£ط¨ظٹط¶ ط£ظ†ظٹظ‚طŒ ط³ظ‡ظ„ط© ط§ظ„ط¹ظ†ط§ظٹط©طŒ طھظ†ظ‚ظٹ ط§ظ„ظ‡ظˆط§ط،', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'ظ†ط¨ط§طھط§طھ ط§ظ„ط²ظٹظ†ط©', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: 'ًںŒ؟' }, stock: 20, rating: 4.8, reviewCount: 27, inStock: true, isActive: true },
  { id: 'prod-plant-succulents-002', nameAr: 'ظ…ط¬ظ…ظˆط¹ط© ظ†ط¨ط§طھط§طھ طµط¨ط§ط± ظˆط£ط´ظƒط§ظ„ ظ†ط¶ط±ط© ظ…ظ„ظˆظ†ط©', nameEn: 'Colorful Succulents and Cactus Set', price: 35, comparePrice: 45, mainImage: '/products/ornamental-plants-3.png', images: ['/products/ornamental-plants-3.png'], descriptionAr: 'ظ…ط¬ظ…ظˆط¹ط© ظ…ظ† 4 ظ†ط¨ط§طھط§طھ طµط¨ط§ط± ظˆط£ط´ظƒط§ظ„ ظ†ط¶ط±ط© ظ…ظ„ظˆظ†ط© ظپظٹ ط£طµطµ ط³ظٹط±ط§ظ…ظٹظƒ طµط؛ظٹط±ط©طŒ ظ…ط«ط§ظ„ظٹط© ظ„ظ„ط¯ظٹظƒظˆط±', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'ظ†ط¨ط§طھط§طھ ط§ظ„ط²ظٹظ†ط©', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: 'ًںŒ؟' }, stock: 45, rating: 4.6, reviewCount: 33, inStock: true, isActive: true },
  { id: 'prod-plant-pothos-003', nameAr: 'ظ†ط¨طھط© ط¨ظˆطھظˆط³ ظ…ط¹ظ„ظ‚ط© ظپظٹ ط£طµظٹطµ ظ…ط§ظƒrame', nameEn: 'Hanging Pothos Plant in Macrame Planter', price: 55, comparePrice: 70, mainImage: '/products/ornamental-plants-4.png', images: ['/products/ornamental-plants-4.png'], descriptionAr: 'ظ†ط¨طھط© ط¨ظˆطھظˆط³ ظ…ط¹ظ„ظ‚ط© ظپظٹ ط£طµظٹطµ ظ…ط§ظƒrame ظٹط¯ظˆظٹ ط§ظ„طµظ†ط¹طŒ ظ†ط¨طھط© ظ…طھط³ظ„ط¨ط© ط¬ظ…ظٹظ„ط© طھظ†ظ‚ظٹ ط§ظ„ظ‡ظˆط§ط،', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'ظ†ط¨ط§طھط§طھ ط§ظ„ط²ظٹظ†ط©', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: 'ًںŒ؟' }, stock: 30, rating: 4.5, reviewCount: 19, inStock: true, isActive: true },
  { id: 'prod-plant-snake-004', nameAr: 'ظ†ط¨طھط© ط§ظ„ط«ط¹ط¨ط§ظ† (ط³ط§ظ†ط³ظٹظپظٹط±ظٹط§)', nameEn: 'Snake Plant (Sansevieria)', price: 45, comparePrice: 55, mainImage: '/products/snake-plant.png', images: ['/products/snake-plant.png'], descriptionAr: 'ظ†ط¨طھط© ط§ظ„ط«ط¹ط¨ط§ظ† ط§ظ„ظ…ط¹ظ…ط±ط© ظپظٹ ط£طµظٹطµ ط­ط¬ط±ظٹ ط£ظ†ظٹظ‚طŒ ظ…ظ‚ط§ظˆظ…ط© ظ„ظ„ط¥ظ‡ظ…ط§ظ„طŒ طھظ†ظ‚ظٹ ط§ظ„ظ‡ظˆط§ط، ط¨ط´ظƒظ„ ظپط¹ط§ظ„', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'ظ†ط¨ط§طھط§طھ ط§ظ„ط²ظٹظ†ط©', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: 'ًںŒ؟' }, stock: 35, rating: 4.7, reviewCount: 24, inStock: true, isActive: true },
  { id: 'prod-plant-ficus-005', nameAr: 'ظ†ط¨طھط© ظپظٹظƒظˆط³ ط¯ظٹظƒظˆط±ط§', nameEn: 'Ficus Decora Plant', price: 90, comparePrice: 110, mainImage: '/products/ficus-decora.png', images: ['/products/ficus-decora.png'], descriptionAr: 'ظ†ط¨طھط© ظپظٹظƒظˆط³ ط¯ظٹظƒظˆط±ط§ ط¨ط£ظˆط±ط§ظ‚ظ‡ط§ ط§ظ„ظƒط¨ظٹط±ط© ط§ظ„ظ„ط§ظ…ط¹ط© ظپظٹ ط£طµظٹطµ ط³ظٹط±ط§ظ…ظٹظƒ ط£ط¨ظٹط¶طŒ ط±ط§ط¦ط¹ط© ظ„ظ„ط¯ظٹظƒظˆط± ط§ظ„ط¯ط§ط®ظ„ظٹ', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'ظ†ط¨ط§طھط§طھ ط§ظ„ط²ظٹظ†ط©', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: 'ًںŒ؟' }, stock: 15, rating: 4.4, reviewCount: 13, inStock: true, isActive: true },
  { id: 'prod-plant-rose-006', nameAr: 'ظˆط±ط¯ط© ط­ظ…ط±ط§ط، ظپظٹ ط£طµظٹطµ ط²ط®ط±ظپظٹ', nameEn: 'Red Rose Plant in Decorative Pot', price: 60, comparePrice: 75, mainImage: '/products/red-rose-plant.png', images: ['/products/red-rose-plant.png'], descriptionAr: 'ظ†ط¨طھط© ظˆط±ط¯ط© ط­ظ…ط±ط§ط، ظپظٹ ط£طµظٹطµ ط²ط®ط±ظپظٹ ظ…ظ„ظˆظ†طŒ ظ‡ط¯ظٹط© ظ…ط«ط§ظ„ظٹط© ظˆظ…ط¸ظ‡ط± ط³ط§ط­ط± ظ„ظ„ظ…ظ†ط²ظ„', categoryId: 'cmp1fpqxn0002o6xli34pbv6h', category: { id: 'cmp1fpqxn0002o6xli34pbv6h', nameAr: 'ظ†ط¨ط§طھط§طھ ط§ظ„ط²ظٹظ†ط©', nameEn: 'Ornamental Plants', slug: 'ornamental-plants', icon: 'ًںŒ؟' }, stock: 25, rating: 4.9, reviewCount: 36, inStock: true, isActive: true },
  // â”€â”€â”€ Pet Supplies Products â”€â”€â”€
  { id: 'prod-pet-catfood-001', nameAr: 'ط·ط¹ط§ظ… ظ‚ط·ط· ط¬ط§ظپ ط¨ط±ظٹظ…ظٹظˆظ… 2 ظƒط¬ظ…', nameEn: 'Premium Dry Cat Food 2kg', price: 55, comparePrice: 68, mainImage: '/products/pet-supplies-2.png', images: ['/products/pet-supplies-2.png'], descriptionAr: 'ط·ط¹ط§ظ… ظ‚ط·ط· ط¬ط§ظپ ط¨ط±ظٹظ…ظٹظˆظ… ظ…طھظˆط§ط²ظ† ط؛ط°ط§ط¦ظٹط§ظ‹ ط؛ظ†ظٹ ط¨ط§ظ„ط¨ط±ظˆطھظٹظ† ظˆط§ظ„ظپظٹطھط§ظ…ظٹظ†ط§طھ ظ„طµط­ط© ظ‚ط·طھظƒطŒ ظˆط²ظ† 2 ظƒط¬ظ…', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: 'ًںگ¾' }, stock: 80, rating: 4.6, reviewCount: 42, inStock: true, isActive: true },
  { id: 'prod-pet-bed-002', nameAr: 'ط³ط±ظٹط± ط­ظٹظˆط§ظ†ط§طھ ط£ظ„ظٹظپ ظ†ط§ط¹ظ… ط¯ط§ط¦ط±ظٹ', nameEn: 'Soft Round Pet Bed', price: 85, comparePrice: 110, mainImage: '/products/pet-supplies-3.png', images: ['/products/pet-supplies-3.png'], descriptionAr: 'ط³ط±ظٹط± ط­ظٹظˆط§ظ†ط§طھ ط£ظ„ظٹظپ ظ†ط§ط¹ظ… ظˆط¯ط§ظپط¦ ط¨طھطµظ…ظٹظ… ط¯ط§ط¦ط±ظٹ ظ…ط±ظٹط­طŒ ظ…ظ†ط§ط³ط¨ ظ„ظ„ظ‚ط·ط· ظˆط§ظ„ظƒظ„ط§ط¨ ط§ظ„طµط؛ظٹط±ط©طŒ ظ„ظˆظ† ط±ظ…ط§ط¯ظٹ', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: 'ًںگ¾' }, stock: 40, rating: 4.4, reviewCount: 15, inStock: true, isActive: true },
  { id: 'prod-pet-aqua-003', nameAr: 'ط­ظˆط¶ ط£ط³ظ…ط§ظƒ ط²ط¬ط§ط¬ ظ…ط¹ ط¥ط¶ط§ط،ط© LED ظˆظپظ„ط§طھط±', nameEn: 'Glass Aquarium Tank with LED and Filter', price: 180, comparePrice: 220, mainImage: '/products/pet-supplies-4.png', images: ['/products/pet-supplies-4.png'], descriptionAr: 'ط­ظˆط¶ ط£ط³ظ…ط§ظƒ ط²ط¬ط§ط¬ 30 ظ„طھط± ظ…ط¹ ط¥ط¶ط§ط،ط© LED ظˆظپظ„ط§طھط± ظ…ط¯ظ…ط¬ط© ظˆط­طµظ‰ ط²ط®ط±ظپظٹطŒ ظ…ط¬ظ…ظˆط¹ط© ظƒط§ظ…ظ„ط©', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: 'ًںگ¾' }, stock: 15, rating: 4.3, reviewCount: 9, inStock: true, isActive: true },
  { id: 'prod-pet-dogfood-004', nameAr: 'ط·ط¹ط§ظ… ظƒظ„ط§ط¨ ط¬ط§ظپ 3 ظƒط¬ظ…', nameEn: 'Premium Dry Dog Food 3kg', price: 65, comparePrice: 80, mainImage: '/products/pet-care.png', images: ['/products/pet-care.png'], descriptionAr: 'ط·ط¹ط§ظ… ظƒظ„ط§ط¨ ط¬ط§ظپ ط¨ط±ظٹظ…ظٹظˆظ… ط¨ط­ط¨ظˆط¨ ظ„ط­ظ… ط§ظ„ط¯ط¬ط§ط¬ ظˆط§ظ„ط£ط±ط²طŒ ظ…طھظˆط§ط²ظ† ط؛ط°ط§ط¦ظٹط§ظ‹طŒ ظˆط²ظ† 3 ظƒط¬ظ…', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: 'ًںگ¾' }, stock: 70, rating: 4.5, reviewCount: 28, inStock: true, isActive: true },
  { id: 'prod-pet-toys-005', nameAr: 'ط£ظ„ط¹ط§ط¨ طھظپط§ط¹ظ„ظٹط© ظ„ظ„ظ‚ط·ط·', nameEn: 'Interactive Cat Toys Set', price: 35, comparePrice: 45, mainImage: '/products/pet-care-2.png', images: ['/products/pet-care-2.png'], descriptionAr: 'ظ…ط¬ظ…ظˆط¹ط© ط£ظ„ط¹ط§ط¨ طھظپط§ط¹ظ„ظٹط© ظ„ظ„ظ‚ط·ط· طھط´ظ…ظ„ طµظٹط¯ ط§ظ„ط±ظٹط´ ظˆظƒط±ط© ط§ظ„ظ„ظٹط²ط± ظˆظ†ظپظ‚ ط§ظ„ظ‚ط·ط©', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: 'ًںگ¾' }, stock: 55, rating: 4.2, reviewCount: 16, inStock: true, isActive: true },
  { id: 'prod-pet-shampoo-006', nameAr: 'ط´ط§ظ…ط¨ظˆ ظˆط¹ظ†ط§ظٹط© ظ„ظ„ط­ظٹظˆط§ظ†ط§طھ ط§ظ„ط£ظ„ظٹظپط©', nameEn: 'Pet Shampoo and Care Set', price: 28, mainImage: '/products/pet-care-3.png', images: ['/products/pet-care-3.png'], descriptionAr: 'ط·ظ‚ظ… ط¹ظ†ط§ظٹط© ظ„ظ„ط­ظٹظˆط§ظ†ط§طھ ط§ظ„ط£ظ„ظٹظپط© ظٹط´ظ…ظ„ ط´ط§ظ…ط¨ظˆ ظˆظپط±ط´ط§ط© ظˆظ…ط´ط·طŒ ظ…ظ†ط§ط³ط¨ ظ„ظ„ظ‚ط·ط· ظˆط§ظ„ظƒظ„ط§ط¨', categoryId: 'cmp1fpqxl0001o6xleutclkvs', category: { id: 'cmp1fpqxl0001o6xleutclkvs', nameAr: 'ظ…ط³طھظ„ط²ظ…ط§طھ ط§ظ„ط­ظٹظˆط§ظ†ط§طھ', nameEn: 'Pet Supplies', slug: 'pet-supplies', icon: 'ًںگ¾' }, stock: 90, rating: 4.1, reviewCount: 11, inStock: true, isActive: true },
  // â”€â”€â”€ Children's Toys Products â”€â”€â”€
  { id: 'prod-toy-blocks-001', nameAr: 'ظ…ط¬ظ…ظˆط¹ط© ظ…ظƒط¹ط¨ط§طھ ط¨ظ†ط§ط، ظ…ظ„ظˆظ†ط© 100 ظ‚ط·ط¹ط©', nameEn: 'Colorful Building Blocks Set 100 Pieces', price: 45, comparePrice: 60, mainImage: '/products/children-toys-2.png', images: ['/products/children-toys-2.png'], descriptionAr: 'ظ…ط¬ظ…ظˆط¹ط© ظ…ظƒط¹ط¨ط§طھ ط¨ظ†ط§ط، ظ…ظ„ظˆظ†ط© 100 ظ‚ط·ط¹ط© ظ„طھط¹ط²ظٹط² ظ…ظ‡ط§ط±ط§طھ ط§ظ„ط·ظپظ„ ط§ظ„ط¥ط¨ط¯ط§ط¹ظٹط© ظˆط§ظ„طھظپظƒظٹط± ط§ظ„ظ…ظ†ط·ظ‚ظٹطŒ ظ…ظ†ط§ط³ط¨ط© ظ…ظ† ط³ظ† 3 ط³ظ†ظˆط§طھ', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ط£ظ„ط¹ط§ط¨ ط£ط·ظپط§ظ„', nameEn: "Children's Toys", slug: 'children-toys', icon: 'ًں§¸' }, stock: 50, rating: 4.7, reviewCount: 23, inStock: true, isActive: true },
  { id: 'prod-toy-teddy-002', nameAr: 'ط¯ط¨ط¯ظˆط¨ ط¨ظ„ط§ط´ ظ†ط§ط¹ظ… ظƒط¨ظٹط±', nameEn: 'Large Soft Plush Teddy Bear', price: 65, comparePrice: 85, mainImage: '/products/children-toys-3.png', images: ['/products/children-toys-3.png'], descriptionAr: 'ط¯ط¨ط¯ظˆط¨ ط¨ظ„ط§ط´ ظ†ط§ط¹ظ… ظˆظپط±ظˆظٹ ظ…طµظ†ظˆط¹ ظ…ظ† ظ‚ط·ظ† ط¹ط§ظ„ظٹ ط§ظ„ط¬ظˆط¯ط©طŒ ط¢ظ…ظ† ظ„ظ„ط£ط·ظپط§ظ„طŒ ظ…ظ‚ط§ط³ 60 ط³ظ…', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ط£ظ„ط¹ط§ط¨ ط£ط·ظپط§ظ„', nameEn: "Children's Toys", slug: 'children-toys', icon: 'ًں§¸' }, stock: 35, rating: 4.8, reviewCount: 18, inStock: true, isActive: true },
  { id: 'prod-toy-rccar-003', nameAr: 'ط³ظٹط§ط±ط© ط³ط¨ط§ظ‚ ط±ظٹظ…ظˆطھ ظƒظ†طھط±ظˆظ„', nameEn: 'Remote Control Racing Car', price: 120, comparePrice: 150, mainImage: '/products/children-toys-4.png', images: ['/products/children-toys-4.png'], descriptionAr: 'ط³ظٹط§ط±ط© ط³ط¨ط§ظ‚ ط±ظٹظ…ظˆطھ ظƒظ†طھط±ظˆظ„ ط¨طھطµظ…ظٹظ… ط±ظٹط§ط¶ظٹطŒ ظ…ظ‚ظٹط§ط³ 1:16طŒ ظ…ط¹ ط¬ظ‡ط§ط² طھط­ظƒظ… ط¹ظ† ط¨ط¹ط¯طŒ ط¨ط·ط§ط±ظٹط© ظ‚ط§ط¨ظ„ط© ظ„ظ„ط´ط­ظ†', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ط£ظ„ط¹ط§ط¨ ط£ط·ظپط§ظ„', nameEn: "Children's Toys", slug: 'children-toys', icon: 'ًں§¸' }, stock: 25, rating: 4.5, reviewCount: 31, inStock: true, isActive: true },
  { id: 'prod-toy-puzzle-004', nameAr: 'ط¨ط§ط²ظ„ 500 ظ‚ط·ط¹ط© ظ…ظ†ط§ط¸ط± ط·ط¨ظٹط¹ظٹط©', nameEn: '500-Piece Landscape Puzzle', price: 38, comparePrice: 48, mainImage: '/products/puzzle-500pc.png', images: ['/products/puzzle-500pc.png'], descriptionAr: 'ط¨ط§ط²ظ„ 500 ظ‚ط·ط¹ط© ط¨طµظˆط± ظ…ظ†ط§ط¸ط± ط·ط¨ظٹط¹ظٹط© ط®ظ„ط§ط¨ط© ظ„طھط·ظˆظٹط± ط§ظ„طھط±ظƒظٹط² ظˆط§ظ„طµط¨ط± ط¹ظ†ط¯ ط§ظ„ط£ط·ظپط§ظ„ ظˆط§ظ„ظƒط¨ط§ط±', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ط£ظ„ط¹ط§ط¨ ط£ط·ظپط§ظ„', nameEn: "Children's Toys", slug: 'children-toys', icon: 'ًں§¸' }, stock: 60, rating: 4.3, reviewCount: 14, inStock: true, isActive: true },
  { id: 'prod-toy-drone-005', nameAr: 'ط·ط§ط¦ط±ط© ط¯ط±ظˆظ† طµط؛ظٹط±ط©', nameEn: 'Mini Drone', price: 180, comparePrice: 220, mainImage: '/products/mini-drone.png', images: ['/products/mini-drone.png'], descriptionAr: 'ط·ط§ط¦ط±ط© ط¯ط±ظˆظ† طµط؛ظٹط±ط© ظ…ط¹ ظƒط§ظ…ظٹط±ط§ HD ظˆطھط­ظƒظ… ط¹ظ† ط¨ط¹ط¯طŒ ظ…ط«ط§ظ„ظٹط© ظ„ظ„ظ…ط¨طھط¯ط¦ظٹظ†', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ط£ظ„ط¹ط§ط¨ ط£ط·ظپط§ظ„', nameEn: "Children's Toys", slug: 'children-toys', icon: 'ًں§¸' }, stock: 15, rating: 4.4, reviewCount: 9, inStock: true, isActive: true },
  { id: 'prod-toy-stuffed-006', nameAr: 'ظ…ط¬ظ…ظˆط¹ط© ط­ظٹظˆط§ظ†ط§طھ ظ…ط­ط´ظٹط©', nameEn: 'Stuffed Animals Collection', price: 55, comparePrice: 70, mainImage: '/products/stuffed-animals.png', images: ['/products/stuffed-animals.png'], descriptionAr: 'ظ…ط¬ظ…ظˆط¹ط© ظ…ظ† 6 ط­ظٹظˆط§ظ†ط§طھ ظ…ط­ط´ظٹط© ظ†ط§ط¹ظ…ط© ط¨ط£ط´ظƒط§ظ„ ظ…ط®طھظ„ظپط©طŒ ط¢ظ…ظ†ط© ظ„ظ„ط£ط·ظپط§ظ„ ظ…ظ† ط³ظ† ط³ظ†ط©', categoryId: 'cmp1fpqxf0000o6xlmntl1wrh', category: { id: 'cmp1fpqxf0000o6xlmntl1wrh', nameAr: 'ط£ظ„ط¹ط§ط¨ ط£ط·ظپط§ظ„', nameEn: "Children's Toys", slug: 'children-toys', icon: 'ًں§¸' }, stock: 40, rating: 4.6, reviewCount: 22, inStock: true, isActive: true },
  // â”€â”€â”€ Gifts & Antiques Products â”€â”€â”€
  { id: 'prod-ga-brass-001', nameAr: 'طµظٹظ†ظٹط© ظ†ط­ط§ط³ظٹط© ظ…ط²ط®ط±ظپط© ظٹط¯ظˆظٹط§ظ‹', nameEn: 'Handcrafted Brass Tray', price: 180, comparePrice: 220, mainImage: '/products/gifts-antiques.png', images: ['/products/gifts-antiques.png'], descriptionAr: 'طµظٹظ†ظٹط© ظ†ط­ط§ط³ظٹط© ظ…ط²ط®ط±ظپط© ط¨ظ†ظ‚ظˆط´ ط´ط±ظ‚ظٹط© ط£طµظٹظ„ط© ظ…طµظ†ظˆط¹ط© ظٹط¯ظˆظٹط§ظ‹ ط¨ط¥طھظ‚ط§ظ†', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'ط§ظ„طھط­ظپ ظˆط§ظ„ظ‡ط¯ط§ظٹط§', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: 'ًںژپ' }, stock: 20, rating: 4.8, reviewCount: 35, inStock: true, isActive: true },
  { id: 'prod-ga-incense-002', nameAr: 'ط·ظ‚ظ… ط¨ط®ظˆط± ط¹ظˆط¯ ظپط§ط®ط± ظ…ط¹ ظ…ط¨ط®ط±ط©', nameEn: 'Premium Oud Incense Set with Burner', price: 120, comparePrice: 150, mainImage: '/products/gifts-antiques-2.png', images: ['/products/gifts-antiques-2.png'], descriptionAr: 'ط·ظ‚ظ… ط¨ط®ظˆط± ط¹ظˆط¯ ظپط§ط®ط± ظ…ط¹ ظ…ط¨ط®ط±ط© ظ†ط­ط§ط³ظٹط© ظ…ط²ط®ط±ظپط© ظ‡ط¯ظٹط© ظ…ط«ط§ظ„ظٹط©', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'ط§ظ„طھط­ظپ ظˆط§ظ„ظ‡ط¯ط§ظٹط§', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: 'ًںژپ' }, stock: 35, rating: 4.7, reviewCount: 28, inStock: true, isActive: true },
  { id: 'prod-ga-horse-003', nameAr: 'ظ…ط¬ط³ظ… ط­طµط§ظ† ط¹ط±ط¨ظٹ ط¨ط±ظˆظ†ط²ظٹ', nameEn: 'Bronze Arabian Horse Sculpture', price: 350, comparePrice: 420, mainImage: '/products/gifts-antiques-3.png', images: ['/products/gifts-antiques-3.png'], descriptionAr: 'ظ…ط¬ط³ظ… ط­طµط§ظ† ط¹ط±ط¨ظٹ ط£طµظٹظ„ ظ…ظ† ط§ظ„ط¨ط±ظˆظ†ط² ط§ظ„ظ…ط·ظ„ظٹ ط¨ط§ظ„ط°ظ‡ط¨طŒ ظ‚ط·ط¹ط© ط¯ظٹظƒظˆط± ظپط§ط®ط±ط©', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'ط§ظ„طھط­ظپ ظˆط§ظ„ظ‡ط¯ط§ظٹط§', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: 'ًںژپ' }, stock: 10, rating: 4.9, reviewCount: 19, inStock: true, isActive: true },
  { id: 'prod-ga-giftbox-004', nameAr: 'ط¹ظ„ط¨ط© ظ‡ط¯ط§ظٹط§ ظپط§ط®ط±ط© ط¨ط§ظ„ط¹ط·ط± ظˆط§ظ„ط¨ط®ظˆط±', nameEn: 'Luxury Gift Box with Perfume and Incense', price: 95, comparePrice: 120, mainImage: '/products/gift-perfume-set.png', images: ['/products/gift-perfume-set.png'], descriptionAr: 'ط¹ظ„ط¨ط© ظ‡ط¯ط§ظٹط§ ظپط§ط®ط±ط© طھط­طھظˆظٹ ط¹ظ„ظ‰ ط¹ط·ط± ط´ط±ظ‚ظٹ ظˆط¨ط®ظˆط± ط¹ظˆط¯ ظˆظ…ط¨ط®ط±ط© طµط؛ظٹط±ط©', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'ط§ظ„طھط­ظپ ظˆط§ظ„ظ‡ط¯ط§ظٹط§', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: 'ًںژپ' }, stock: 45, rating: 4.6, reviewCount: 24, inStock: true, isActive: true },
  { id: 'prod-ga-teapot-005', nameAr: 'ط¥ط¨ط±ظٹظ‚ ط´ط§ظٹ ظ†ط­ط§ط³ظٹ طھظ‚ظ„ظٹط¯ظٹ ظ…ط¹ ظپظ†ط§ط¬ظٹظ†', nameEn: 'Traditional Brass Teapot Set with Cups', price: 220, comparePrice: 270, mainImage: '/products/gifts-antiques-2.png', images: ['/products/gifts-antiques-2.png'], descriptionAr: 'ط¥ط¨ط±ظٹظ‚ ط´ط§ظٹ ظ†ط­ط§ط³ظٹ طھظ‚ظ„ظٹط¯ظٹ ظ…ط¹ 6 ظپظ†ط§ط¬ظٹظ† ط¨طھطµظ…ظٹظ… ط´ط±ظ‚ظٹ ط£ظ†ظٹظ‚', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'ط§ظ„طھط­ظپ ظˆط§ظ„ظ‡ط¯ط§ظٹط§', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: 'ًںژپ' }, stock: 15, rating: 4.5, reviewCount: 17, inStock: true, isActive: true },
  { id: 'prod-ga-crystal-006', nameAr: 'طµط­ظ† ظƒط±ظٹط³طھط§ظ„ ظ…ط²ط®ط±ظپ ط¨ط§ظ„ط°ظ‡ط¨', nameEn: 'Gold-Trimmed Crystal Decorative Plate', price: 150, comparePrice: 185, mainImage: '/products/gifts-antiques-3.png', images: ['/products/gifts-antiques-3.png'], descriptionAr: 'طµط­ظ† ظƒط±ظٹط³طھط§ظ„ ظپط§ط®ط± ظ…ط²ط®ط±ظپ ط¨ظ„ظ…ط³ط§طھ ط°ظ‡ط¨ظٹط© ظ„ظ„ط¯ظٹظƒظˆط± ظˆط§ظ„ط¶ظٹط§ظپط©', categoryId: 'cat-gifts-antiques-001', category: { id: 'cat-gifts-antiques-001', nameAr: 'ط§ظ„طھط­ظپ ظˆط§ظ„ظ‡ط¯ط§ظٹط§', nameEn: 'Antiques & Gifts', slug: 'gifts-antiques', icon: 'ًںژپ' }, stock: 18, rating: 4.4, reviewCount: 13, inStock: true, isActive: true },
  // â”€â”€â”€ Wall Art & Decor Products â”€â”€â”€
  { id: 'prod-wa-calligraphy-001', nameAr: 'ظ„ظˆط­ط© ط¬ط¯ط§ط±ظٹط© ط®ط· ط¹ط±ط¨ظٹ ظٹط¯ظˆظٹ', nameEn: 'Handwritten Arabic Calligraphy Wall Art', price: 120, comparePrice: 150, mainImage: '/products/wall-art.png', images: ['/products/wall-art.png'], descriptionAr: 'ظ„ظˆط­ط© ط¬ط¯ط§ط±ظٹط© ط¨ط®ط· ط¹ط±ط¨ظٹ ط£طµظٹظ„ ظ…ط±ط³ظˆظ…ط© ظٹط¯ظˆظٹط§ظ‹ ط¹ظ„ظ‰ ظ‚ظ…ط§ط´ ظƒط§ظ†ظپط§ط³ ط¹ط§ظ„ظٹ ط§ظ„ط¬ظˆط¯ط©', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'ط§ظ„ط¬ط¯ط§ط±ظٹط§طھ', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: 'ًں–¼ï¸ڈ' }, stock: 25, rating: 4.8, reviewCount: 31, inStock: true, isActive: true },
  { id: 'prod-wa-oil-002', nameAr: 'ظ„ظˆط­ط© ط²ظٹطھظٹط© ظ…ظ†ط§ط¸ط± ط·ط¨ظٹط¹ظٹط©', nameEn: 'Oil Painting Landscape', price: 280, comparePrice: 340, mainImage: '/products/wall-art-2.png', images: ['/products/wall-art-2.png'], descriptionAr: 'ظ„ظˆط­ط© ط²ظٹطھظٹط© ط±ط§ط¦ط¹ط© ظ„ظ…ظ†ط§ط¸ط± ط·ط¨ظٹط¹ظٹط© ط®ظ„ط§ط¨ط© ظ…ط±ط³ظˆظ…ط© ظٹط¯ظˆظٹط§ظ‹ ط¨ط¥ط·ط§ط± ط®ط´ط¨ظٹ ظپط§ط®ط±', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'ط§ظ„ط¬ط¯ط§ط±ظٹط§طھ', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: 'ًں–¼ï¸ڈ' }, stock: 12, rating: 4.7, reviewCount: 22, inStock: true, isActive: true },
  { id: 'prod-wa-modern-003', nameAr: 'ظ…ط¬ظ…ظˆط¹ط© ظ„ظˆط­ط§طھ ط¬ط¯ط§ط±ظٹط© ط­ط¯ظٹط«ط© 3 ظ‚ط·ط¹', nameEn: 'Modern 3-Piece Wall Art Set', price: 180, comparePrice: 220, mainImage: '/products/wall-art-3.png', images: ['/products/wall-art-3.png'], descriptionAr: 'ظ…ط¬ظ…ظˆط¹ط© ظ…ظ† 3 ظ„ظˆط­ط§طھ ط¬ط¯ط§ط±ظٹط© ط¨طھطµظ…ظٹظ… ط¹طµط±ظٹ طھط¬ط±ظٹط¯ظٹ ط¨ط£ظ„ظˆط§ظ† ظ‡ط§ط¯ط¦ط©', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'ط§ظ„ط¬ط¯ط§ط±ظٹط§طھ', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: 'ًں–¼ï¸ڈ' }, stock: 20, rating: 4.5, reviewCount: 16, inStock: true, isActive: true },
  { id: 'prod-wa-clock-004', nameAr: 'ط³ط§ط¹ط© ط­ط§ط¦ط· ط®ط´ط¨ظٹط© ط¨طھطµظ…ظٹظ… ط¹ط±ط¨ظٹ', nameEn: 'Arabic Design Wooden Wall Clock', price: 95, comparePrice: 120, mainImage: '/products/wall-art-4.png', images: ['/products/wall-art-4.png'], descriptionAr: 'ط³ط§ط¹ط© ط­ط§ط¦ط· ط®ط´ط¨ظٹط© ط¨طھطµظ…ظٹظ… ط¹ط±ط¨ظٹ طھظ‚ظ„ظٹط¯ظٹ ظ…ط¹ ط£ط±ظ‚ط§ظ… ط¹ط±ط¨ظٹط© ظˆط£ط·ط±ط§ظپ ظ…ط²ط®ط±ظپط©', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'ط§ظ„ط¬ط¯ط§ط±ظٹط§طھ', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: 'ًں–¼ï¸ڈ' }, stock: 30, rating: 4.6, reviewCount: 20, inStock: true, isActive: true },
  { id: 'prod-wa-mirror-005', nameAr: 'ظ…ط±ط¢ط© ط¬ط¯ط§ط±ظٹط© ظ…ط²ط®ط±ظپط© ط¨ط¥ط·ط§ط± ط°ظ‡ط¨ظٹ', nameEn: 'Ornate Wall Mirror with Gold Frame', price: 160, comparePrice: 195, mainImage: '/products/wall-art-5.png', images: ['/products/wall-art-5.png'], descriptionAr: 'ظ…ط±ط¢ط© ط¬ط¯ط§ط±ظٹط© ط£ظ†ظٹظ‚ط© ط¨ط¥ط·ط§ط± ط°ظ‡ط¨ظٹ ظ…ط²ط®ط±ظپ ط¨ظ†ظ‚ظˆط´ ط´ط±ظ‚ظٹط© ظپط§ط®ط±ط©', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'ط§ظ„ط¬ط¯ط§ط±ظٹط§طھ', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: 'ًں–¼ï¸ڈ' }, stock: 15, rating: 4.4, reviewCount: 14, inStock: true, isActive: true },
  { id: 'prod-wa-metal-006', nameAr: 'ظ„ظˆط­ط© ظ…ظٹطھط§ظ„ ط¢ط±طھ ظ…ط¹ ط¥ط¶ط§ط،ط© LED', nameEn: 'Metal Art Panel with LED Lighting', price: 220, comparePrice: 270, mainImage: '/products/wall-art-6.png', images: ['/products/wall-art-6.png'], descriptionAr: 'ظ„ظˆط­ط© ظ…ط¹ط¯ظ†ظٹط© ظپظ†ظٹط© ط¨طھطµظ…ظٹظ… ظ‡ظ†ط¯ط³ظٹ ظ…ط¹ ط¥ط¶ط§ط،ط© LED ط®ظ„ظپظٹط© ظ„طھط£ط«ظٹط± ظ…ط°ظ‡ظ„', categoryId: 'cat-wall-art-001', category: { id: 'cat-wall-art-001', nameAr: 'ط§ظ„ط¬ط¯ط§ط±ظٹط§طھ', nameEn: 'Wall Art & Decor', slug: 'wall-art', icon: 'ًں–¼ï¸ڈ' }, stock: 10, rating: 4.3, reviewCount: 8, inStock: true, isActive: true },
];

// â”€â”€â”€ Local Offers for Offline Fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    titleAr: 'ط¹ط±ط¶ ط§ظ„ظ‡ظˆط§طھظپ ط§ظ„ط°ظƒظٹط©',
    titleEn: 'Smartphone Sale',
    descriptionAr: 'ط®طµظ… 15% ط¹ظ„ظ‰ ط¬ظ…ظٹط¹ ط§ظ„ظ‡ظˆط§طھظپ ط§ظ„ط°ظƒظٹط© - ط¹ط±ط¶ ظ…ط­ط¯ظˆط¯!',
    descriptionEn: '15% off all smartphones - Limited offer!',
    discount: 15,
    image: '/products/electronics.png',
    productId: 'cmocboac5006hmtch141gb5a8',
    originalPrice: 1000,
    offerPrice: 850,
    endsAt: daysFromNow(3),
    badge: 'ًں”¥',
    limited: true,
  },
  {
    id: 'offer-2',
    titleAr: 'ط¹ط±ط¶ ط§ظ„ط³ظ…ط§ط¹ط§طھ ط§ظ„ظ„ط§ط³ظ„ظƒظٹط©',
    titleEn: 'Wireless Headphones Deal',
    descriptionAr: 'ط³ظ…ط§ط¹ط§طھ ط¨ظ„ظˆطھظˆط« ط¨ط®طµظ… 18% - ظ„ط§ طھظپظˆظ‘طھ ط§ظ„ظپط±طµط©!',
    descriptionEn: 'Bluetooth headphones at 18% off - Don\'t miss out!',
    discount: 18,
    image: '/products/electronics-2.png',
    productId: 'cmocboac6006jmtcho4z8b2jq',
    originalPrice: 220,
    offerPrice: 180,
    endsAt: daysFromNow(5),
    badge: 'âڈ°',
  },
  {
    id: 'offer-3',
    titleAr: 'ط¹ط±ط¶ ظ…ط§ظƒظٹظ†ط© ط§ظ„ظ‚ظ‡ظˆط©',
    titleEn: 'Coffee Machine Offer',
    descriptionAr: 'ط®طµظ… 17% ط¹ظ„ظ‰ ظ…ط§ظƒظٹظ†ط© ط§ظ„ظ‚ظ‡ظˆط© ط§ظ„ط£ظˆطھظˆظ…ط§طھظٹظƒظٹط©',
    descriptionEn: '17% off the automatic coffee machine',
    discount: 17,
    image: '/products/electrical-appliances.png',
    productId: 'cmocboabz0067mtch5g6r243h',
    originalPrice: 420,
    offerPrice: 350,
    endsAt: daysFromNow(2),
    badge: 'ًں’°',
    limited: true,
  },
  {
    id: 'offer-4',
    titleAr: 'ط¹ط±ط¶ ط¹ط±ط¨ط© ط§ظ„ط£ط·ظپط§ظ„',
    titleEn: 'Baby Stroller Sale',
    descriptionAr: 'ط®طµظ… 18% ط¹ظ„ظ‰ ط¹ط±ط¨ط© ط£ط·ظپط§ظ„ ط®ظپظٹظپط© ظˆظ‚ط§ط¨ظ„ط© ظ„ظ„ط·ظٹ',
    descriptionEn: '18% off lightweight foldable baby stroller',
    discount: 18,
    image: '/products/mother-baby.png',
    productId: 'cmocboabo005lmtchwcm4ur8i',
    originalPrice: 550,
    offerPrice: 450,
    endsAt: daysFromNow(7),
    badge: 'ًں”¥',
    limited: true,
  },
  {
    id: 'offer-5',
    titleAr: 'ط¹ط±ط¶ ط¹ظ‚ط¯ ط§ظ„ظ„ط¤ظ„ط¤',
    titleEn: 'Pearl Necklace Deal',
    descriptionAr: 'ط®طµظ… 18% ط¹ظ„ظ‰ ط¹ظ‚ط¯ ظ„ط¤ظ„ط¤ ط·ط¨ظٹط¹ظٹ ظپط§ط®ط±',
    descriptionEn: '18% off luxury natural pearl necklace',
    discount: 18,
    image: '/products/accessories.png',
    productId: 'cmocboabk005dmtch38udjrl2',
    originalPrice: 550,
    offerPrice: 450,
    endsAt: daysFromNow(4),
    badge: 'ًں’ژ',
  },
  {
    id: 'offer-6',
    titleAr: 'ط¹ط±ط¶ ط§ظ„ظƒط§ظ…ظٹط±ط§ ط§ظ„ط±ظ‚ظ…ظٹط©',
    titleEn: 'Digital Camera Sale',
    descriptionAr: 'ط®طµظ… 14% ط¹ظ„ظ‰ ظƒط§ظ…ظٹط±ط§ ط¨ط¯ظ‚ط© ط¹ط§ظ„ظٹط© ظˆطھط³ط¬ظٹظ„ 4K',
    descriptionEn: '14% off high-res camera with 4K recording',
    discount: 14,
    image: '/products/electronics-3.png',
    productId: 'cmocboacb006rmtch97z9qzyb',
    originalPrice: 1400,
    offerPrice: 1200,
    endsAt: daysFromNow(6),
    badge: 'ًں“¸',
  },
];

