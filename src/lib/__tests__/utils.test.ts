import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility (clsx + tailwind-merge)', () => {
  it('merges plain class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('merges conflicting tailwind classes (last one wins)', () => {
    // tailwind-merge should keep only px-6, overriding px-4
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('handles conditional object syntax', () => {
    expect(cn('base', { hidden: false, block: true })).toBe('base block');
  });

  it('handles arrays and undefined', () => {
    expect(cn(['a', 'b'], undefined as unknown as string, 'c')).toBe('a b c');
  });

  it('returns empty string for no input', () => {
    expect(cn()).toBe('');
  });
});
