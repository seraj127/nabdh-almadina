import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, mockBcrypt, mockRateLimit, mockPhone, mockJwt } = vi.hoisted(() => ({
  mockDb: {
    user: { findUnique: vi.fn() },
    auditLog: { create: vi.fn() },
  },
  mockBcrypt: { compare: vi.fn() },
  mockRateLimit: { checkRateLimit: vi.fn() },
  mockPhone: { getPhoneVariants: vi.fn((p: string) => [p]) },
  mockJwt: { createSessionToken: vi.fn(async () => 'test-token') },
}));

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('bcryptjs', () => ({ default: mockBcrypt }));
vi.mock('@/lib/rate-limit', () => mockRateLimit);
vi.mock('@/lib/phone-utils', () => mockPhone);
vi.mock('@/lib/jwt-session', () => mockJwt);

import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: 'user-1',
  phone: '+218910000001',
  name: 'أحمد',
  email: 'a@a.com',
  role: 'customer',
  language: 'ar',
  avatar: null,
  loyaltyTier: 'bronze',
  loyaltyPoints: 0,
  walletBalance: 0,
  lastLoginAt: null,
  loginCount: 0,
  isActive: true,
  passwordHash: 'hash',
  ...overrides,
});

const loginReq = (body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRateLimit.checkRateLimit.mockReturnValue(null);
    mockBcrypt.compare.mockResolvedValue(true);
    mockDb.user.findUnique.mockResolvedValue(makeUser());
    mockDb.auditLog.create.mockResolvedValue({});
  });

  it('logs in with valid credentials and sets a session cookie', async () => {
    const res = await POST(loginReq({ phone: '0910000001', password: 'secret' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.user.id).toBe('user-1');
    const setCookie = res.headers.get('set-cookie') || '';
    expect(setCookie).toContain('session_token=test-token');
    expect(mockJwt.createSessionToken).toHaveBeenCalled();
  });

  it('returns 400 when phone/password missing', async () => {
    const res = await POST(loginReq({ phone: '0910000001' }));
    expect(res.status).toBe(400);
    expect(mockDb.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns 401 and logs audit when user not found', async () => {
    mockDb.user.findUnique.mockResolvedValue(null);
    const res = await POST(loginReq({ phone: '0910000000', password: 'x' }));
    expect(res.status).toBe(401);
    expect(mockDb.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'login_failed' }) })
    );
  });

  it('returns 401 when password is wrong', async () => {
    mockBcrypt.compare.mockResolvedValue(false);
    const res = await POST(loginReq({ phone: '0910000001', password: 'wrong' }));
    expect(res.status).toBe(401);
  });

  it('returns 403 when the account is deactivated', async () => {
    mockDb.user.findUnique.mockResolvedValue(makeUser({ isActive: false }));
    const res = await POST(loginReq({ phone: '0910000001', password: 'secret' }));
    expect(res.status).toBe(403);
  });

  it('returns 429 when rate-limited', async () => {
    mockRateLimit.checkRateLimit.mockReturnValue(
      NextResponse.json({ error: 'rate limited' }, { status: 429 }) as never
    );
    const res = await POST(loginReq({ phone: '0910000001', password: 'secret' }));
    expect(res.status).toBe(429);
  });
});
