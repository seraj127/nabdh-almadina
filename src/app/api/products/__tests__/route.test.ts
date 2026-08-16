import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    product: { count: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock('@/lib/db', () => ({ db: mockDb }));

import { GET } from '../route';
import { NextRequest } from 'next/server';

const product = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  nameAr: 'آيفون',
  nameEn: 'iPhone',
  slug: 'iphone',
  price: 8500,
  comparePrice: 9000,
  costPrice: 7000,
  weight: 0.2,
  rating: 4.5,
  images: '["img1.jpg","img2.jpg"]',
  stock: 10,
  isActive: true,
  category: { id: 'c1', nameAr: 'إلكترونيات', nameEn: 'Electronics', slug: 'electronics' },
  ...overrides,
});

describe('GET /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.product.count.mockResolvedValue(1);
    mockDb.product.findMany.mockResolvedValue([product()]);
  });

  it('returns products with parsed numbers and images', async () => {
    const req = new NextRequest('http://localhost/api/products', { method: 'GET' });
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.products).toHaveLength(1);
    const p = body.products[0];
    expect(p.price).toBe(8500);
    expect(p.images).toEqual(['img1.jpg', 'img2.jpg']);
    expect(p.category.slug).toBe('electronics');
    expect(body.total).toBe(1);
    expect(body.limit).toBe(20);
  });

  it('only fetches active products by default', async () => {
    const req = new NextRequest('http://localhost/api/products', { method: 'GET' });
    await GET(req);
    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });

  it('honors search and limit params', async () => {
    const req = new NextRequest('http://localhost/api/products?search=iphone&limit=5', { method: 'GET' });
    await GET(req);
    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5, where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });
});
