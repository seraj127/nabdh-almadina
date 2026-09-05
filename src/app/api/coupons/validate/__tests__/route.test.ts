import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    coupon: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    order: { count: vi.fn() },
  },
}));

vi.mock('@/lib/db', () => ({ db: mockDb }));

import { POST } from '../route';
import { NextRequest } from 'next/server';

const makeCoupon = (overrides: Record<string, unknown> = {}) => ({
  id: 'cp-1',
  code: 'SAVE10',
  isActive: true,
  type: 'percentage',
  value: 10,
  minOrder: null,
  maxDiscount: null,
  usageLimit: null,
  usageCount: 0,
  perUserLimit: null,
  startsAt: null,
  expiresAt: null,
  descriptionAr: '',
  descriptionEn: '',
  ...overrides,
});

const req = (body: unknown) =>
  new NextRequest('http://localhost/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/coupons/validate', () => {
  beforeEach(() => { vi.clearAllMocks(); mockDb.order.count.mockResolvedValue(0); });

  it('rejects when code or subtotal is missing', async () => {
    const a = await POST(req({ subtotal: 100 }));
    expect(a.status).toBe(400);
    const b = await POST(req({ code: 'X' }));
    expect(b.status).toBe(400);
  });

  it('applies a percentage coupon and caps by maxDiscount', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(makeCoupon({ value: 10, maxDiscount: 5 }));
    const res = await POST(req({ code: 'save10', subtotal: 100, userId: 'u1' }));
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.coupon.discount).toBe(5); // capped by maxDiscount
    expect(body.coupon.code).toBe('SAVE10');
  });

  it('applies a percentage coupon without cap', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(makeCoupon({ value: 20 }));
    const res = await POST(req({ code: 'SAVE10', subtotal: 200, userId: 'u1' }));
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.coupon.discount).toBe(40);
  });

  it('fixed coupon clamps to subtotal (never exceeds it)', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(makeCoupon({ type: 'fixed', value: 300 }));
    const res = await POST(req({ code: 'SAVE10', subtotal: 100, userId: 'u1' }));
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.coupon.discount).toBe(100);
  });

  it('rejects an inactive coupon', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(makeCoupon({ isActive: false }));
    const res = await POST(req({ code: 'SAVE10', subtotal: 100 }));
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.error).toMatch(/غير مفعّل/);
  });

  it('rejects a not-yet-active coupon', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(makeCoupon({ startsAt: new Date(Date.now() + 86_400_000).toISOString() }));
    const res = await POST(req({ code: 'SAVE10', subtotal: 100 }));
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.error).toMatch(/لم يبدأ بعد/);
  });

  it('rejects an expired coupon', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(makeCoupon({ expiresAt: new Date(Date.now() - 86_400_000).toISOString() }));
    const res = await POST(req({ code: 'SAVE10', subtotal: 100 }));
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.error).toMatch(/انتهت/);
  });

  it('rejects when the global usage limit is reached', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(makeCoupon({ usageLimit: 5, usageCount: 5 }));
    const res = await POST(req({ code: 'SAVE10', subtotal: 100 }));
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.error).toMatch(/تجاوز/);
  });

  it('rejects when below the minimum order amount', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(makeCoupon({ minOrder: 200 }));
    const res = await POST(req({ code: 'SAVE10', subtotal: 100 }));
    const body = await res.json();
    expect(body.valid).toBe(false);
    expect(body.error).toContain('200');
  });

  it('per-user limit: indexes orders that are NOT cancelled only', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(makeCoupon({ perUserLimit: 1 }));
    mockDb.order.count.mockResolvedValue(1);
    const res = await POST(req({ code: 'SAVE10', subtotal: 100, userId: 'u9' }));
    const body = await res.json();
    // The count query MUST filter out status='cancelled' orders.
    expect(mockDb.order.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: expect.objectContaining({ notIn: ['cancelled'] }) }) })
    );
    expect(body.valid).toBe(false);
    expect(body.error).toMatch(/المسموح/);
  });

  it('returns 404-like valid:false when coupon does not exist', async () => {
    mockDb.coupon.findUnique.mockResolvedValue(null);
    const res = await POST(req({ code: 'NOPE', subtotal: 100 }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.valid).toBe(false);
    expect(body.error).toMatch(/غير موجود/);
  });
});
