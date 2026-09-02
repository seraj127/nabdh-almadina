// ─── Server-side theme sync (persists in user.preferences) ────────────
// Used by both mobile and web to keep theme in sync across platforms.

export async function syncThemeToServer(theme: 'light' | 'dark' | 'system'): Promise<void> {
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: { theme } }),
    });
    if (!res.ok) console.warn('Theme sync failed:', res.status);
  } catch { /* ignore — offline or unauthenticated */ }
}

export async function fetchThemeFromServer(): Promise<'light' | 'dark' | 'system' | null> {
  try {
    const res = await fetch('/api/auth/profile');
    if (!res.ok) return null;
    const data = await res.json();
    const theme = data?.user?.preferences?.theme;
    if (theme === 'light' || theme === 'dark' || theme === 'system') return theme;
  } catch { /* ignore */ }
  return null;
}
