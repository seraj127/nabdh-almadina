import { describe, it, expect, vi, beforeEach } from 'vitest';

// Contract: asserts the stable public shape of API responses so that an
// accidental breaking change (renamed/removed/retyped field) fails the suite.

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    product: { count: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock('@/lib/db', () => ({ db: mockDb }));

import { GET } from '../route';
import { NextRequest } from 'next/server';

const product = () => ({
  id: 'p1',
  nameAr: 'آيفون',
  nameEn: 'iPhone',
  slug: 'iphone',
  price: 8500,
  comparePrice: 9000,
  costPrice: 7000,
  weight: 0.2,
  rating: 4.5,
  images: '["img1.jpg"]',
  stock: 10,
  isActive: true,
  category: { id: 'c1', nameAr: 'إلكترونيات', nameEn: 'Electronics', slug: 'electronics' },
});

const isFiniteNumber = (v: unknown) => typeof v === 'number' && Number.isFinite(v);

describe('Product list API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.product.count.mockResolvedValue(1);
    mockDb.product.findMany.mockResolvedValue([product()]);
  });

  it('response envelope has products/total/limit/offset of the agreed types', async () => {
    const res = await GET(new NextRequest('http://localhost/api/products', { method: 'GET' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body.products)).toBe(true);
    expect(isFiniteNumber(body.total)).toBe(true);
    expect(isFiniteNumber(body.limit)).toBe(true);
    expect(isFiniteNumber(body.offset)).toBe(true);
  });

  it('each product item satisfies the agreed item contract', async () => {
    const res = await GET(new NextRequest('http://localhost/api/products', { method: 'GET' }));
    const body = await res.json();
    for (const p of body.products) {
      expect(typeof p.id).toBe('string');
      expect(typeof p.nameAr).toBe('string');
      expect(isFiniteNumber(p.price)).toBe(true);
      // comparePrice/costPrice null or finite number (never undefined)
      expect(p.comparePrice === null || isFiniteNumber(p.comparePrice)).toBe(true);
      expect(p.costPrice === null || isFiniteNumber(p.costPrice)).toBe(true);
      expect(p.rating === null || isFiniteNumber(p.rating)).toBe(true);
      expect(p.category).toBeDefined();
      expect(typeof p.category.id).toBe('string');
    }
  });
});
