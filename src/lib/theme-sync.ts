'use client';

// ─── Server-side theme sync (persists in user.preferences) ────────────
// Kept as a thin wrapper around the shared profile-sync helpers so legacy
// call-sites continue to work while new code gets retries, language support
// and consistent error surfacing.
//
// New code should prefer the unified helpers directly:
//   import { pushPreferencesToServer, fetchPreferencesFromServer } from '@/lib/profile-sync'
//
// Domain guarantees:
//   - fetchThemeFromServer returns the user's stored theme or null
//   - syncThemeToServer PATCHes to /api/auth/profile, retries on 5xx,
//     returns true on success / false on permanent failure.

import {
  fetchPreferencesFromServer,
  syncThemeToServer as _syncThemeToServer,
  syncLanguageToServer as _syncLanguageToServer,
  type ThemeValue,
  type LangValue,
} from './profile-sync';

export type { ThemeValue, LangValue };

export async function syncThemeToServer(theme: ThemeValue): Promise<void> {
  // Prefer the robust retrying variant; ignore its boolean return for
  // backward compatibility with existing call sites.
  await _syncThemeToServer(theme);
}

export async function fetchThemeFromServer(): Promise<ThemeValue | null> {
  const prefs = await fetchPreferencesFromServer();
  return prefs?.theme ?? null;
}

// Re-export language variants so existing imports keep working.
export { _syncLanguageToServer as syncLanguageToServer };
