import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, mockAuth } = vi.hoisted(() => ({
  mockDb: {
    favoriteItem: { createMany: vi.fn(), findMany: vi.fn(), deleteMany: vi.fn() },
    product: { findUnique: vi.fn(), findMany: vi.fn() },
  },
  mockAuth: { requireAuth: vi.fn() },
}));

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth-utils', () => mockAuth);

import { POST, DELETE, GET } from '../route';
import { NextRequest } from 'next/server';

describe('Favorites API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.requireAuth.mockResolvedValue({ userId: 'user-1' });
    mockDb.favoriteItem.createMany.mockResolvedValue({ count: 1 });
    mockDb.favoriteItem.deleteMany.mockResolvedValue({ count: 1 });
    mockDb.favoriteItem.findMany.mockResolvedValue([]);
    mockDb.product.findUnique.mockResolvedValue({ id: 'p1' });
    mockDb.product.findMany.mockResolvedValue([]);
  });

  it('POST adds with skipDuplicates (idempotent) and returns isFavorite', async () => {
    const req = new NextRequest('http://localhost/api/favorites', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId: 'p1' }),
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.isFavorite).toBe(true);
    expect(mockDb.favoriteItem.createMany).toHaveBeenCalledWith({
      data: [{ userId: 'user-1', productId: 'p1' }],
      skipDuplicates: true,
    });
  });

  it('POST returns 400 when productId is missing', async () => {
    const req = new NextRequest('http://localhost/api/favorites', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockDb.favoriteItem.createMany).not.toHaveBeenCalled();
  });

  it('POST returns 404 when the product does not exist', async () => {
    mockDb.product.findUnique.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/favorites', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId: 'missing' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
    expect(mockDb.favoriteItem.createMany).not.toHaveBeenCalled();
  });

  it('DELETE removes by productId query param', async () => {
    const req = new NextRequest('http://localhost/api/favorites?productId=p1', { method: 'DELETE' });
    const res = await DELETE(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.deleted).toBe(1);
    expect(mockDb.favoriteItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', productId: 'p1' },
    });
  });

  it('DELETE returns 400 when no productId is provided', async () => {
    const req = new NextRequest('http://localhost/api/favorites', { method: 'DELETE' });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('GET returns favorites list', async () => {
    mockDb.favoriteItem.findMany.mockResolvedValue([{ id: 'f1', productId: 'p1', createdAt: new Date() }]);
    const req = new NextRequest('http://localhost/api/favorites', { method: 'GET' });
    const res = await GET(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.favorites).toHaveLength(1);
    expect(body.favorites[0].productId).toBe('p1');
  });
});
