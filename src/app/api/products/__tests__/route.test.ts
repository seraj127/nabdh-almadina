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
  reservedStock: 2,
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

  it('honors search params and fetches all products', async () => {
    const req = new NextRequest('http://localhost/api/products?search=iphone&limit=5', { method: 'GET' });
    await GET(req);
    expect(mockDb.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200, where: expect.objectContaining({ OR: expect.any(Array) }) })
    );
  });

  it('filters sold-out products out of total and pagination', async () => {
    const available = [
      product({ id: 'a1', stock: 5, reservedStock: 0 }),
      product({ id: 'a2', stock: 10, reservedStock: 2 }),
    ];
    const soldOut = [
      product({ id: 's1', stock: 0, reservedStock: 0 }),
      product({ id: 's2', stock: 3, reservedStock: 5 }),
    ];
    mockDb.product.findMany.mockResolvedValue([...available, ...soldOut]);
    mockDb.product.count.mockResolvedValue(4);

    const req = new NextRequest('http://localhost/api/products?limit=20&offset=0', { method: 'GET' });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.total).toBe(2);
    expect(body.products.map((p: { id: string }) => p.id)).toEqual(['a1', 'a2']);
  });

  it('paginates available products across offsets without counting sold-out rows', async () => {
    const products = [
      product({ id: 'a1', stock: 5, reservedStock: 0 }),
      product({ id: 'skip-me', stock: 0, reservedStock: 0 }),
      product({ id: 'a2', stock: 10, reservedStock: 2 }),
    ];
    mockDb.product.findMany.mockResolvedValue(products);
    mockDb.product.count.mockResolvedValue(3);

    // Page 1 of 1 (limit 2, offset 0): only the 2 available products are returned
    const page1 = new NextRequest('http://localhost/api/products?limit=2&offset=0', { method: 'GET' });
    const res1 = await GET(page1);
    const body1 = await res1.json();
    expect(body1.total).toBe(2);
    expect(body1.products.map((p: { id: string }) => p.id)).toEqual(['a1', 'a2']);

    // Page 2 (offset 2): empty page because all available products fit on page 1
    const page2 = new NextRequest('http://localhost/api/products?limit=2&offset=2', { method: 'GET' });
    const res2 = await GET(page2);
    const body2 = await res2.json();
    expect(body2.products).toHaveLength(0);
    expect(body2.total).toBe(2);
  });

  it('respects the limit above and below the allowed range', async () => {
    mockDb.product.findMany.mockResolvedValue([product()]);
    mockDb.product.count.mockResolvedValue(1);

    const over = new NextRequest('http://localhost/api/products?limit=9999', { method: 'GET' });
    const under = new NextRequest('http://localhost/api/products?limit=0', { method: 'GET' });
    const bad = new NextRequest('http://localhost/api/products?limit=abc', { method: 'GET' });

    const [overRes, underRes, badRes] = await Promise.all([GET(over), GET(under), GET(bad)]);
    const [overBody, underBody, badBody] = await Promise.all([overRes.json(), underRes.json(), badRes.json()]);

    expect(overBody.limit).toBe(100);   // capped
    expect(underBody.limit).toBe(20);   // 0 falls back to the default
    expect(badBody.limit).toBe(20);     // non-numeric falls back to the default
  });

  it('maps category, subcategory and sort query params', async () => {
    mockDb.product.findMany.mockResolvedValue([product()]);
    mockDb.product.count.mockResolvedValue(1);

    const byCat = new NextRequest('http://localhost/api/products?categoryId=c1', { method: 'GET' });
    await GET(byCat);
    expect(mockDb.product.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ categoryId: 'c1' }) })
    );

    const bySlug = new NextRequest('http://localhost/api/products?category=electronics', { method: 'GET' });
    await GET(bySlug);
    expect(mockDb.product.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: { slug: 'electronics' } }) })
    );

    const bySub = new NextRequest('http://localhost/api/products?subcategory=mobiles', { method: 'GET' });
    await GET(bySub);
    expect(mockDb.product.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: { slug: 'mobiles', parentId: { not: null } } }) })
    );

    const byPrice = new NextRequest('http://localhost/api/products?sort=priceAsc', { method: 'GET' });
    await GET(byPrice);
    expect(mockDb.product.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ orderBy: { price: 'asc' } })
    );
  });

  it('shows sold-out products to admins when isActive=all', async () => {
    mockDb.product.findMany.mockResolvedValue([product({ id: 'sold', stock: 0, reservedStock: 0 })]);
    mockDb.product.count.mockResolvedValue(1);

    const req = new NextRequest('http://localhost/api/products?isActive=all', { method: 'GET' });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.total).toBe(1);
    expect(body.products[0].id).toBe('sold');
  });
});
