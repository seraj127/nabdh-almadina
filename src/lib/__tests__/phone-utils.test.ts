import { describe, it, expect } from 'vitest';
import { normalizePhone, getPhoneVariants } from '../phone-utils';

describe('normalizePhone', () => {
  it('keeps a normalized +218 number unchanged', () => {
    expect(normalizePhone('+218911234567')).toBe('+218911234567');
  });
  it('converts a 0-prefixed number', () => {
    expect(normalizePhone('0911234567')).toBe('+218911234567');
  });
  it('adds +218 to a bare 9-number', () => {
    expect(normalizePhone('911234567')).toBe('+218911234567');
  });
  it('strips spaces and dashes', () => {
    expect(normalizePhone('091 123 4567')).toBe('+218911234567');
    expect(normalizePhone('+218-91-123-4567')).toBe('+218911234567');
  });
});

describe('getPhoneVariants', () => {
  it('returns +218, 0-prefix, and bare variants', () => {
    expect(getPhoneVariants('0911234567')).toEqual(['+218911234567', '0911234567', '911234567']);
  });
});
