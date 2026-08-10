// ─── Nabd Al-Madina Design Tokens ───────────────────────────────────
// Adapted from DPOS Universal Layering System v1.0.0 - Mobile Profile

export const COLORS = {
  primary: {
    main: '#004B63',
    light: '#006B8A',
    dark: '#002F40',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF6F61',
    light: '#FF8F85',
    dark: '#CC5045',
    contrastText: '#FFFFFF',
  },
  neutral: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    border: '#E5E5E5',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textDisabled: '#999999',
  },
  semantic: {
    success: '#238636',
    warning: '#D29922',
    error: '#FF3B30',
    info: '#58A6FF',
  },
  dark: {
    background: '#0B1120',
    surface: '#151D2E',
    border: '#1E2A42',
    textPrimary: '#F0F6FC',
    textSecondary: '#A8B8CC',
  },
} as const;

export const TYPOGRAPHY = {
  arabicFont: 'Cairo, system-ui, sans-serif',
  latinFont: 'Inter, system-ui, sans-serif',
  scale: {
    displayXl: { size: '32px', lineHeight: '1.2', weight: '700' },
    displayLg: { size: '24px', lineHeight: '1.3', weight: '700' },
    headingMd: { size: '20px', lineHeight: '1.4', weight: '600' },
    body: { size: '14px', lineHeight: '1.5', weight: '400' },
    caption: { size: '12px', lineHeight: '1.4', weight: '400' },
    button: { size: '14px', lineHeight: '1.0', weight: '600' },
  },
} as const;

export const SPACING = {
  unit: 4,
  scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96],
} as const;

export const ELEVATION = {
  0: { shadow: 'none', border: 'none' },
  1: { shadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' },
  2: { shadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.1)' },
  3: { shadow: '0 8px 24px rgba(0,0,0,0.2)', border: '1px solid rgba(0,0,0,0.15)' },
  glass: { blur: '12px', overlay: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.4)' },
} as const;

// ─── Product Badge Types ─────────────────────────────────────────────
export type ProductBadge = 'new_arrival' | 'best_seller' | 'sale' | 'limited_stock' | 'official_store';

export const BADGE_CONFIG: Record<ProductBadge, { labelAr: string; labelEn: string; color: string; bg: string }> = {
  new_arrival: { labelAr: 'جديد', labelEn: 'New', color: '#006B8A', bg: 'rgba(0, 107, 138, 0.1)' },
  best_seller: { labelAr: 'الأكثر مبيعاً', labelEn: 'Best Seller', color: '#D4A843', bg: 'rgba(212, 168, 67, 0.12)' },
  sale: { labelAr: 'تخفيض', labelEn: 'Sale', color: '#FF6F61', bg: 'rgba(255, 111, 97, 0.1)' },
  limited_stock: { labelAr: 'مخزون محدود', labelEn: 'Limited', color: '#D29922', bg: 'rgba(210, 153, 34, 0.1)' },
  official_store: { labelAr: 'متجر رسمي', labelEn: 'Official', color: '#238636', bg: 'rgba(35, 134, 54, 0.1)' },
};

// ─── Feature Flags ───────────────────────────────────────────────────
export interface FeatureFlags {
  ENABLE_GLASSMORPHISM: boolean;
  ENABLE_OFFLINE_BANNER: boolean;
  ENABLE_BADGES: boolean;
  ENABLE_DARK_MODE: boolean;
  ENABLE_SKELETON_LOADER: boolean;
  ENABLE_CHECKOUT: boolean;
  ENABLE_AI_SEARCH: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  ENABLE_GLASSMORPHISM: true,
  ENABLE_OFFLINE_BANNER: true,
  ENABLE_BADGES: true,
  ENABLE_DARK_MODE: true,
  ENABLE_SKELETON_LOADER: true,
  ENABLE_CHECKOUT: true,
  ENABLE_AI_SEARCH: false,
};
