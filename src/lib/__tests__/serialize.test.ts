import { describe, it, expect } from 'vitest';
import { serializeDecimal } from '../serialize';

describe('serializeDecimal (Prisma Decimal -> JSON-safe)', () => {
  it('passes primitives through unchanged', () => {
    expect(serializeDecimal(5)).toBe(5);
    expect(serializeDecimal('hi')).toBe('hi');
    expect(serializeDecimal(true)).toBe(true);
    expect(serializeDecimal(null)).toBeNull();
    expect(serializeDecimal(undefined)).toBeUndefined();
  });

  it('preserves Date instances', () => {
    const d = new Date('2026-01-01T00:00:00Z');
    const out = serializeDecimal(d);
    expect(out instanceof Date).toBe(true);
    expect((out as Date).toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('recurses into arrays and objects without mutating plain data', () => {
    const input = { list: [1, 2, { nested: true }], name: 'x' };
    expect(serializeDecimal(input)).toEqual(input);
  });

  it('converts Prisma Decimal-like objects to numbers', () => {
    // Prisma Decimal shape: { d: [...], e: number, s: number, toNumber() }
    const decimalLike = {
      d: [1234],
      e: 3,
      s: 1,
      toNumber: () => 123.4,
    } as unknown as { toNumber: () => number };
    expect(serializeDecimal(decimalLike)).toBe(123.4);
  });
});
