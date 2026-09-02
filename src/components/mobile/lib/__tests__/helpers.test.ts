import { describe, it, expect, beforeEach } from 'vitest';
import {
  readThemeDark,
  writeThemeDark,
  parseImages,
  parseBadges,
  parseAttributes,
  normalizeProduct,
} from '../helpers';

describe('theme helpers (unified with web localStorage.theme)', () => {
  beforeEach(() => {
    localStorage.clear();
    // window.matchMedia may not exist in jsdom by default; define as unmatching.
    if (!window.matchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }),
      });
    }
  });

  it('returns true when localStorage.theme is dark', () => {
    localStorage.setItem('theme', 'dark');
    expect(readThemeDark()).toBe(true);
  });

  it('returns false when localStorage.theme is light', () => {
    localStorage.setItem('theme', 'light');
    expect(readThemeDark()).toBe(false);
  });

  it('writeThemeDark persists the dark value to localStorage.theme', () => {
    writeThemeDark(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    writeThemeDark(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});

describe('parseImages', () => {
  it('returns array as-is', () => {
    expect(parseImages(['a.png', 'b.png'])).toEqual(['a.png', 'b.png']);
  });

  it('parses a JSON string array', () => {
    expect(parseImages('["a.png","b.png"]')).toEqual(['a.png', 'b.png']);
  });

  it('wraps a plain string in an array', () => {
    expect(parseImages('a.png')).toEqual(['a.png']);
  });

  it('returns undefined for empty input', () => {
    expect(parseImages(undefined)).toBeUndefined();
  });
});

describe('parseBadges', () => {
  it('keeps an array', () => {
    expect(parseBadges(['new', 'offer'])).toEqual(['new', 'offer']);
  });
  it('parses JSON string array', () => {
    expect(parseBadges('["new","offer"]')).toEqual(['new', 'offer']);
  });
  it('returns undefined for a non-array string', () => {
    expect(parseBadges('new')).toBeUndefined();
  });
});

describe('parseAttributes', () => {
  it('returns object attributes as-is', () => {
    const attrs = { color: 'red', size: 'M' };
    expect(parseAttributes(attrs)).toEqual(attrs);
  });
  it('parses JSON string', () => {
    expect(parseAttributes('{"color":"red"}')).toEqual({ color: 'red' });
  });
  it('returns undefined for invalid input', () => {
    expect(parseAttributes('not-json')).toBeUndefined();
  });
});

describe('normalizeProduct', () => {
  it('normalizes numeric fields and parses images/attributes', () => {
    const p = normalizeProduct({
      id: 'p1',
      nameAr: 'منتج',
      nameEn: 'Product',
      price: '49.9',
      comparePrice: '59.9',
      images: '["a.png"]',
      badges: '["offer"]',
      attributes: '{"color":"blue"}',
      rating: '4.5',
      reviewCount: '12',
      inStock: 'true',
    });

    expect(p.id).toBe('p1');
    expect(p.price).toBe(49.9);
    expect(p.comparePrice).toBe(59.9);
    expect(p.images).toEqual(['a.png']);
    expect(p.badges).toEqual(['offer']);
    expect(p.attributes).toEqual({ color: 'blue' });
    expect(p.rating).toBe(4.5);
    expect(p.reviewCount).toBe(12);
    expect(p.inStock).toBe(true);
  });

  it('derives inStock from stock when inStock is not provided', () => {
    expect(normalizeProduct({ id: 'p1', nameAr: 'x', stock: 0 }).inStock).toBe(false);
    expect(normalizeProduct({ id: 'p2', nameAr: 'x', stock: 5 }).inStock).toBe(true);
  });
});
