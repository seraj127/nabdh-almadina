import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPreferencesFromServer,
  pushPreferencesToServer,
  syncThemeToServer,
  syncLanguageToServer,
} from '../profile-sync';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('profile-sync', () => {
  it('fetchPreferencesFromServer returns both theme and language', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ user: { preferences: { theme: 'dark' }, language: 'ar' } }),
        { status: 200 }
      )
    ) as typeof fetch;
    const prefs = await fetchPreferencesFromServer();
    expect(prefs).toEqual({ theme: 'dark', language: 'ar' });
  });

  it('fetchPreferencesFromServer returns null on 401/403 or non-OK', async () => {
    globalThis.fetch = vi.fn(async () => new Response('Unauthorized', { status: 401 })) as typeof fetch;
    expect(await fetchPreferencesFromServer()).toBeNull();
  });

  it('fetchPreferencesFromServer returns null on network failure', async () => {
    globalThis.fetch = vi.fn(async () => Promise.reject(new Error('network'))) as unknown as typeof fetch;
    expect(await fetchPreferencesFromServer()).toBeNull();
  });

  it('pushPreferencesToServer returns true on 200 PATCH', async () => {
    globalThis.fetch = vi.fn(async () => new Response('{}', { status: 200 })) as typeof fetch;
    const ok = await pushPreferencesToServer({ theme: 'dark' });
    expect(ok).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/profile',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('pushPreferencesToServer returns false on 401/403 (no retry)', async () => {
    globalThis.fetch = vi.fn(async () => new Response(null, { status: 401 })) as typeof fetch;
    const ok = await pushPreferencesToServer({ theme: 'dark' });
    expect(ok).toBe(false);
  });

  it('pushPreferencesToServer retries on 5xx before failing', async () => {
    let calls = 0;
    globalThis.fetch = vi.fn(async () => { calls++; return new Response(null, { status: 500 }) }) as typeof fetch;
    const ok = await pushPreferencesToServer({ language: 'ar' });
    expect(ok).toBe(false);
    expect(calls).toBeGreaterThan(1); // retried at least once
  });

  it('syncThemeToServer persists theme field', async () => {
    globalThis.fetch = vi.fn(async () => new Response('{}', { status: 200 })) as typeof fetch;
    const ok = await syncThemeToServer('dark');
    expect(ok).toBe(true);
  });

  it('syncLanguageToServer persists language field', async () => {
    globalThis.fetch = vi.fn(async () => new Response('{}', { status: 200 })) as typeof fetch;
    const ok = await syncLanguageToServer('en');
    expect(ok).toBe(true);
  });
});
