import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toLiveApiUrl, isNativeAppRuntime } from '../api-bridge';
import { syncThemeToServer, fetchThemeFromServer } from '../theme-sync';

/**
 * Integration: how mobile/theme sync rewrites relative /api/* URLs to the
 * live deployment and round-trips the theme through the profile endpoint.
 */

describe('api-bridge URL rewriting (live API integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rewrites a relative /api path to the live Vercel URL', () => {
    expect(toLiveApiUrl('/api/auth/profile')).toBe(
      'https://nabdh-almadina.vercel.app/api/auth/profile'
    );
  });

  it('leaves absolute http(s) URLs untouched', () => {
    expect(toLiveApiUrl('https://example.com/api/x')).toBe('https://example.com/api/x');
  });

  it('is not a native runtime under jsdom (no Capacitor global)', () => {
    expect(isNativeAppRuntime()).toBe(false);
  });
});

describe('theme-sync round-trip with mocked fetch', () => {
  const profileFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = profileFetch as unknown as typeof fetch;
  });

  it('syncThemeToServer PATCHes preferences.theme to the profile endpoint', async () => {
    profileFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await syncThemeToServer('dark');

    expect(profileFetch).toHaveBeenCalledTimes(1);
    const [url, init] = profileFetch.mock.calls[0];
    expect(url).toBe('/api/auth/profile');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({ preferences: { theme: 'dark' } });
  });

  it('fetchThemeFromServer reads preferences.theme from the profile response', async () => {
    profileFetch.mockResolvedValue(
      new Response(JSON.stringify({ user: { preferences: { theme: 'dark' } } }), { status: 200 })
    );
    await expect(fetchThemeFromServer()).resolves.toBe('dark');
  });

  it('fetchThemeFromServer returns null for an unknown theme value', async () => {
    profileFetch.mockResolvedValue(
      new Response(JSON.stringify({ user: { preferences: { theme: 'banana' } } }), { status: 200 })
    );
    await expect(fetchThemeFromServer()).resolves.toBeNull();
  });

  it('fetchThemeFromServer resolves null on network failure (no throw)', async () => {
    profileFetch.mockRejectedValue(new Error('offline'));
    await expect(fetchThemeFromServer()).resolves.toBeNull();
  });

  it('syncThemeToServer swallows failures silently', async () => {
    profileFetch.mockRejectedValue(new Error('offline'));
    await expect(syncThemeToServer('light')).resolves.toBeUndefined();
  });
});
