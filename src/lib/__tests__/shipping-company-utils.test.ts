import { describe, expect, it } from 'vitest';
import { serializePublicShippingCompany } from '@/lib/shipping-company-utils';

describe('serializePublicShippingCompany', () => {
  it('removes carrier credentials while preserving public fields', () => {
    const result = serializePublicShippingCompany({
      id: 'carrier-1',
      nameAr: 'شركة اختبار',
      apiKey: 'secret-key',
      apiSecret: 'secret-value',
      baseFee: { toNumber: () => 12.5, d: [125], e: 1, s: 1 },
    });

    expect(result).toMatchObject({ id: 'carrier-1', nameAr: 'شركة اختبار' });
    expect(result).not.toHaveProperty('apiKey');
    expect(result).not.toHaveProperty('apiSecret');
  });
});
