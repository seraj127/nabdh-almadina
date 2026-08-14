'use client';

// ─── Live API Bridge for Native App ──────────────────────────────────
// In the APK (Capacitor WebView) the app is served from https://localhost
// with no API routes. Redirect every relative /api/* request to the live
// Vercel deployment so login, catalog, cart, and orders hit the real
// backend backed by Supabase.

export const LIVE_API_BASE = 'https://nabdh-almadina.vercel.app';

export function isNativeAppRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  return (window as unknown as Record<string, unknown>).Capacitor !== undefined;
}

export function toLiveApiUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return LIVE_API_BASE + p;
}

/**
 * Patch window.fetch so relative /api/* calls are sent to the live server
 * when running inside the Capacitor WebView. Must run after Capacitor's own
 * fetch patch (CapacitorHttp) so the rewritten absolute URL goes through the
 * native HTTP layer (which bypasses CORS).
 */
export function patchFetchForNative(): () => void {
  if (!isNativeAppRuntime()) return () => {};
  const original = window.fetch.bind(window);
  const patched: typeof fetch = (input, init) => {
    let url = input;
    if (typeof input === 'string') {
      if (input.startsWith('/api/')) url = toLiveApiUrl(input);
    } else if (input instanceof Request) {
      const href = input.url;
      if (href.startsWith('/api/') || href.startsWith('https://localhost/api/')) {
        const next = toLiveApiUrl(input.url.startsWith('/') ? input.url : input.url.replace(/^https:\/\/localhost/, ''));
        url = next;
      }
    }
    return original(url, init);
  };
  window.fetch = patched;
  return () => { window.fetch = original; };
}
