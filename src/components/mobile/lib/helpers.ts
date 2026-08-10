import type { Product, ProductAttributes } from './types';

// ─── Persistence Helpers ──────────────────────────────────────────────
export function saveLocal(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

export function loadLocal<T>(key: string): T | null {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}

// ─── Helper: Parse images field (may be JSON string or array) ──────────
export function parseImages(images: string | string[] | undefined): string[] | undefined {
  if (!images) return undefined;
  if (Array.isArray(images)) return images;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [images];
  } catch {
    return [images];
  }
}

// ─── Helper: Parse attributes JSON field ──────────────────────────────
export function parseAttributes(attr: unknown): ProductAttributes | undefined {
  if (!attr) return undefined;
  if (typeof attr === 'object' && !Array.isArray(attr)) return attr as ProductAttributes;
  if (typeof attr === 'string') {
    try {
      const parsed = JSON.parse(attr);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as ProductAttributes;
    } catch {}
  }
  return undefined;
}

// ─── Helper: Parse badges JSON field ──────────────────────────────────
export function parseBadges(badges: unknown): string[] | undefined {
  if (!badges) return undefined;
  if (Array.isArray(badges)) return badges;
  if (typeof badges === 'string') {
    try {
      const parsed = JSON.parse(badges);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch { return undefined; }
  }
  return undefined;
}

// ─── Helper: Normalize product data (convert string prices, parse images) ─
export function normalizeProduct(p: Record<string, unknown>): Product {
  return {
    id: String(p.id),
    nameAr: String(p.nameAr),
    nameEn: String(p.nameEn || ''),
    price: Number(p.price) || 0,
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    mainImage: p.mainImage ? String(p.mainImage) : undefined,
    image: p.image ? String(p.image) : undefined,
    images: parseImages(p.images as string | string[] | undefined),
    descriptionAr: p.descriptionAr ? String(p.descriptionAr) : undefined,
    descriptionEn: p.descriptionEn ? String(p.descriptionEn) : undefined,
    sku: p.sku ? String(p.sku) : undefined,
    categoryId: p.categoryId ? String(p.categoryId) : undefined,
    category: p.category as Product['category'],
    inStock: p.inStock !== undefined ? Boolean(p.inStock) : (Number(p.stock) > 0),
    stock: Number(p.stock) || 0,
    rating: p.rating ? Number(p.rating) : undefined,
    reviewCount: p.reviewCount ? Number(p.reviewCount) : undefined,
    isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
    isFeatured: p.isFeatured !== undefined ? Boolean(p.isFeatured) : undefined,
    video: p.video ? String(p.video) : undefined,
    weight: p.weight ? Number(p.weight) : undefined,
    dimensions: p.dimensions ? String(p.dimensions) : undefined,
    badges: parseBadges(p.badges),
    attributes: parseAttributes(p.attributes),
  };
}
