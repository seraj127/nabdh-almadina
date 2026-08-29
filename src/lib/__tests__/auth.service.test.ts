import { describe, expect, it, vi } from 'vitest';

const { mockDb, mockBcrypt, mockCreateSessionToken } = vi.hoisted(() => ({
  mockDb: {
    user: { findUnique: vi.fn() },
    auditLog: { create: vi.fn() },
  },
  mockBcrypt: { compare: vi.fn() },
  mockCreateSessionToken: vi.fn(),
}));

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('bcryptjs', () => ({ default: mockBcrypt }));
vi.mock('@/lib/phone-utils', () => ({ getPhoneVariants: (phone: string) => [phone] }));
vi.mock('@/lib/jwt-session', () => ({ createSessionToken: mockCreateSessionToken }));

import { authenticate } from '@/lib/auth.service';

describe('authenticate platform authorization', () => {
  it('rejects an admin session request from a customer account', async () => {
    mockDb.user.findUnique.mockResolvedValue({
      id: 'customer-1',
      phone: '+218910000001',
      name: 'Customer',
      email: null,
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
    });
    mockBcrypt.compare.mockResolvedValue(true);
    mockDb.auditLog.create.mockResolvedValue({});

    const result = await authenticate({
      phone: '+218910000001',
      password: 'not-embedded',
      platform: 'admin',
      ip: '127.0.0.1',
    });

    expect(result).toEqual({ ok: false, status: 403, message: 'Admin access required' });
    expect(mockCreateSessionToken).not.toHaveBeenCalled();
    expect(mockDb.auditLog.create).toHaveBeenCalled();
  });
});
