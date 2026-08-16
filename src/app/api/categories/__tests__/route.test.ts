import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    category: { findMany: vi.fn(), findUnique: vi.fn() },
  },
}));

vi.mock('@/lib/db', () => ({ db: mockDb }));

import { GET } from '../route';
import { NextRequest } from 'next/server';

const cat = (overrides: Record<string, unknown> = {}) => ({
  id: 'c1',
  nameAr: 'إلكترونيات',
  nameEn: 'Electronics',
  slug: 'electronics',
  sortOrder: 1,
  isActive: true,
  parentId: null,
  children: [],
  _count: { products: 5 },
  ...overrides,
});

describe('GET /api/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.category.findMany.mockResolvedValue([cat()]);
  });

  it('returns top-level categories with productCount', async () => {
    const req = new NextRequest('http://localhost/api/categories', { method: 'GET' });
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.categories).toHaveLength(1);
    expect(body.categories[0].slug).toBe('electronics');
    expect(body.categories[0].productCount).toBe(5);
    expect(mockDb.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true, parentId: null }) })
    );
  });

  it('filters by slug and returns the single category', async () => {
    mockDb.category.findUnique.mockResolvedValue(
      cat({ _count: { products: 12 }, children: [cat({ id: 'c2', slug: 'phones', parentId: 'c1' })] })
    );
    const req = new NextRequest('http://localhost/api/categories?slug=electronics', { method: 'GET' });
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.category.slug).toBe('electronics');
    expect(body.category.productCount).toBe(12);
    expect(body.category.children).toHaveLength(1);
  });

  it('returns 404 when slug is not found', async () => {
    mockDb.category.findUnique.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/categories?slug=nope', { method: 'GET' });
    const res = await GET(req);
    expect(res.status).toBe(404);
  });
});
