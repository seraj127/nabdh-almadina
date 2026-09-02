import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, mockAuth } = vi.hoisted(() => ({
  mockDb: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  mockAuth: { requireAuth: vi.fn() },
}));

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth-utils', () => mockAuth);

import { GET, PATCH } from '../route';
import { NextRequest, NextResponse } from 'next/server';

const profileReq = (method: string, body?: unknown, headers: Record<string, string> = {}) =>
  new NextRequest('http://localhost/api/auth/profile', {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe('PATCH /api/auth/profile (theme sync via preferences merge)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.requireAuth.mockResolvedValue({ userId: 'user-1' });
    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-1',
      preferences: { language: 'ar', loyalty: 'gold' },
    });
    mockDb.user.update.mockImplementation(async ({ data }) => ({
      id: 'user-1',
      name: 'أحمد',
      phone: '0910000001',
      email: null,
      avatar: null,
      role: 'customer',
      loyaltyTier: 'gold',
      loyaltyPoints: 10,
      walletBalance: 0,
      language: 'ar',
      preferences: data.preferences,
    }));
  });

  it('merges new preferences with existing ones (does NOT overwrite other prefs)', async () => {
    const res = await PATCH(profileReq('PATCH', { preferences: { theme: 'dark' } }));
    expect(res.status).toBe(200);

    expect(mockDb.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: { preferences: true },
    });

    const updateCall = mockDb.user.update.mock.calls[0];
    expect(updateCall[0].data.preferences).toEqual({
      language: 'ar',
      loyalty: 'gold',
      theme: 'dark',
    });
  });

  it('returns the merged preferences in the response body', async () => {
    const res = await PATCH(profileReq('PATCH', { preferences: { theme: 'light' } }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.user.preferences).toEqual({
      language: 'ar',
      loyalty: 'gold',
      theme: 'light',
    });
  });

  it('returns 400 when there are no fields to update', async () => {
    const res = await PATCH(profileReq('PATCH', {}));
    expect(res.status).toBe(400);
    expect(mockDb.user.update).not.toHaveBeenCalled();
  });
});

describe('GET /api/auth/profile (reads persisted theme + user data)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.requireAuth.mockResolvedValue({ userId: 'user-1' });
    mockDb.user.findUnique.mockResolvedValue({
      id: 'user-1',
      name: 'أحمد',
      phone: '0910000001',
      email: null,
      avatar: null,
      role: 'customer',
      loyaltyTier: 'gold',
      loyaltyPoints: 10,
      walletBalance: 0,
      language: 'ar',
      preferences: { theme: 'dark' },
      isActive: true,
      lastLoginAt: null,
      loginCount: 1,
      createdAt: new Date(),
      addresses: [],
      orders: [],
    });
  });

  it('returns the persisted theme in user.preferences.theme', async () => {
    const res = await GET(profileReq('GET'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.user.preferences.theme).toBe('dark');
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.requireAuth.mockResolvedValue(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    const res = await GET(profileReq('GET'));
    expect(res.status).toBe(401);
  });
});
