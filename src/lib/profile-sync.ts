'use client';

// ─── Unified, robust profile-preference sync ───────────────────────────
// Single source of truth for pushing/pulling user preferences (theme + language)
// between the storefront and the mobile app. Shared by both surfaces.

const PROFILE_URL = '/api/auth/profile';
const MAX_RETRIES = 2;

export type ThemeValue = 'light' | 'dark' | 'system';
export type LangValue = 'ar' | 'en';

export interface UserPreferences {
  theme?: ThemeValue;
  language?: LangValue;
}

/**
 * Fetch both theme and language from the server profile.
 * Returns null when unauthenticated / network fails.
 */
export async function fetchPreferencesFromServer(): Promise<UserPreferences | null> {
  try {
    const res = await fetch(PROFILE_URL, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = await res.json();
    const user = data?.user;
    if (!user) return null;

    const theme: ThemeValue | undefined =
      user.preferences?.theme === 'light' || user.preferences?.theme === 'dark'
        ? user.preferences.theme
        : undefined;

    const language: LangValue | undefined =
      user.language === 'ar' || user.language === 'en' ? user.language : undefined;

    return { theme, language };
  } catch {
    return null;
  }
}

/**
 * Push theme and/or language to the server. Retries briefly on transient failures
 * and returns whether the sync ultimately succeeded so callers can choose to
 * surface a toast or keep the change local-only — never swallow silently.
 */
export async function pushPreferencesToServer(update: UserPreferences): Promise<boolean> {
  const body: Record<string, unknown> = {};
  if (update.theme) body.preferences = { theme: update.theme };
  if (update.language) body.language = update.language;
  if (Object.keys(body).length === 0) return true; // nothing to do

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(PROFILE_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return true;
      // 401/403 = not authenticated; no point retrying (state is already local).
      if (res.status === 401 || res.status === 403) return false;
    } catch {
      // Network blip — wait and retry once.
    }
    if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
  }

  console.warn('[profile-sync] failed to persist preferences to server', body);
  return false;
}

/** Convenience: only push the theme (kept for backward compatibility). */
export async function syncThemeToServer(theme: ThemeValue): Promise<boolean> {
  return pushPreferencesToServer({ theme });
}

/** Convenience: only push the language. */
export async function syncLanguageToServer(language: LangValue): Promise<boolean> {
  return pushPreferencesToServer({ language });
}
