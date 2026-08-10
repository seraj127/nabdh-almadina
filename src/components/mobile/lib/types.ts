// ─── Mobile App Types ────────────────────────────────────────────────

export type Screen = 'splash' | 'login' | 'register' | 'forgot-password' | 'main' | 'notifications' | 'contact' | 'privacy-policy' | 'terms' | 'return-policy' | 'order-tracking' | 'delivery-zones' | 'chat' | 'orderDetail' | 'orderTracking' | 'search' | 'settings' | 'webview';
export type Tab = 'home' | 'categories' | 'cart' | 'favorites' | 'profile';

export interface ProductAttributes {
  // Common
  sizes?: string[];              // e.g. ['S', 'M', 'L', 'XL']
  colors?: Array<{ nameAr: string; nameEn: string; hex: string }>;
  weight?: number;               // in kg
  width?: number;                // in cm
  height?: number;               // in cm
  depth?: number;                // in cm
  countryOfOrigin?: { ar: string; en: string };
  materials?: Array<{ ar: string; en: string }>;
  protection?: { ar: string; en: string };
  warranty?: { ar: string; en: string };
  // Category-specific
  capacity?: string;             // e.g. '5L', '2kg' — for cookware/containers
  power?: string;                // e.g. '1500W' — for electrical
  fabric?: { ar: string; en: string };  // for clothing
  sole?: { ar: string; en: string };    // for footwear
  fragrance?: { ar: string; en: string }; // for perfumes
  ageGroup?: { ar: string; en: string };  // for toys
  petType?: { ar: string; en: string };   // for pet supplies
  plantType?: { ar: string; en: string }; // for plants
  finish?: { ar: string; en: string };    // for gifts/wall-art
  screenSize?: string;           // for electronics
  connectivity?: string[];       // for electronics
}

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  comparePrice?: number;
  mainImage?: string;
  image?: string;
  images?: string | string[];
  descriptionAr?: string;
  descriptionEn?: string;
  sku?: string;
  categoryId?: string;
  category?: { id: string; nameAr: string; nameEn: string; slug: string; icon?: string };
  inStock?: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  video?: string;
  weight?: number;
  dimensions?: string;
  badges?: string[];
  attributes?: ProductAttributes;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon?: string;
  image?: string;
  productCount: number;
  parentId?: string | null;
  children?: Subcategory[];
}

export interface Subcategory {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon?: string;
  image?: string;
  productCount: number;
  parentId: string;
}

export interface MobileUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: string;
}

export interface Offer {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  discount: number;
  image: string;
  productId?: string;
  originalPrice: number;
  offerPrice: number;
  endsAt: string; // ISO date string
  badge?: string; // e.g. '🔥', '⏰', '💰'
  limited?: boolean;
}

export interface Address {
  id: string;
  label: string;
  address: string;
  city: string;
  area?: string;
  notes?: string;
  isDefault: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified?: boolean;
  helpful?: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  nameAr: string;
  nameEn: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  address?: ShippingAddress;
  createdAt: string;
}
