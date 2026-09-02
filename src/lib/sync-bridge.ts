/**
 * Sync Bridge — Keeps mobile store and web store in sync
 * 
 * The app has two interfaces (web store + mobile app) that share the same
 * browser session. This bridge ensures that:
 * 
 * 1. Favorites are synchronized between useMobileStore.favorites and useFavoritesStore.favoriteIds
 * 2. Cart is shared via the same useCartStore (no bridge needed)
 * 3. Auth state is shared via useUIStore (mobile login calls useUIStore.login)
 * 4. Custom events notify the other interface when data changes
 */

// ─── Custom Events for Cross-Component Sync ─────────────────────────
export const SYNC_EVENTS = {
  FAVORITES_CHANGED: 'nabdh:favorites-changed',
  CART_CHANGED: 'nabdh:cart-changed',
  AUTH_CHANGED: 'nabdh:auth-changed',
} as const;

/** Dispatch a custom event to notify other parts of the app */
export function dispatchSyncEvent(type: string, detail?: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  } catch {
    // Silent fail
  }
}

// ─── Auth Sync (unified session) ───────────────────────────────────────
// Single source of truth for the session = useUIStore.currentUser. Whenever a
// web user logs in, is re-validated, or the mobile view initializes, the mobile
// store adopts that user so the mobile view never shows a guest while a web
// session exists (and vice versa the mobile login already calls useUIStore.login).

export type WebUserLike = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: string;
};

/** Copy the web store's logged-in user into the mobile store (unified session). */
export async function syncWebUserToMobile(user: WebUserLike): Promise<void> {
  try {
    const { useMobileStore, toLocalPhone } = await import('@/components/mobile/lib/mobile-store');
    const current = useMobileStore.getState().user;
    if (current && current.id === user.id) return;
    const s = useMobileStore.getState();
    const authScreens = ['splash', 'login', 'register', 'forgot-password'];
    const adopted = { id: user.id, name: user.name, phone: toLocalPhone(user.phone), email: user.email, avatar: user.avatar, role: user.role };
    useMobileStore.setState({
      user: adopted,
      ...(authScreens.includes(s.screen) ? { screen: 'main' as const } : {}),
    });
    try {
      localStorage.setItem('mobile_user', JSON.stringify(adopted));
    } catch { /* ignore */ }
    // Sync the user avatar to the mobile photo keys. This prevents a previous
    // account's photo (mobile_user_photo / mobileAvatar) from sticking on a new user.
    try {
      if (user.avatar) {
        useMobileStore.setState({ avatar: user.avatar });
        localStorage.setItem('mobileAvatar', user.avatar);
        localStorage.setItem('mobile_user_photo', user.avatar);
      } else {
        useMobileStore.setState({ avatar: null });
        localStorage.setItem('mobileAvatar', JSON.stringify(null));
        localStorage.removeItem('mobile_user_photo');
      }
    } catch { /* ignore */ }
  } catch {
    // Silent fail — might be circular import
  }
}

// ─── Favorites Sync ─────────────────────────────────────────────────

/** Sync favorites from mobile store → web favorites store */export async function syncMobileToFavoritesStore(favoriteIds: string[]) {
  try {
    const { useFavoritesStore } = await import('@/stores/favorites-store');
    const currentWebIds = useFavoritesStore.getState().favoriteIds;
    // Only update if different (avoid infinite loops)
    const currentSet = new Set(currentWebIds);
    const newSet = new Set(favoriteIds);
    if (currentSet.size === newSet.size && [...currentSet].every(id => newSet.has(id))) return;
    useFavoritesStore.getState().syncIds(favoriteIds);
  } catch {
    // Silent fail — might be circular import
  }
}

/** Sync favorites from web favorites store → mobile store */
export async function syncFavoritesToMobileStore(favoriteIds: string[]) {
  try {
    const { useMobileStore } = await import('@/components/mobile/lib/mobile-store');
    const currentMobileIds = useMobileStore.getState().favorites;
    // Only update if different (avoid infinite loops)
    const currentSet = new Set(currentMobileIds);
    const newSet = new Set(favoriteIds);
    if (currentSet.size === newSet.size && [...currentSet].every(id => newSet.has(id))) return;
    useMobileStore.setState({ favorites: favoriteIds });
    // Also save to mobile localStorage
    try {
      localStorage.setItem('mobile_favorites', JSON.stringify(favoriteIds));
    } catch { /* ignore */ }
    // Rebuild the favorites-screen products (fetches full details from the server
    // so a favorite made on the web appears even if it's outside the mobile feed)
    useMobileStore.getState().refreshFavoriteProducts().catch(() => {});
  } catch {
    // Silent fail — might be circular import
  }
}

/**
 * Reconcile both UI stores from the server. The server is the only cross-device
 * source of truth; local stores must never union stale IDs back into it.
 */
export async function syncFavoritesBidirectional() {
  try {
    const { useFavoritesStore } = await import('@/stores/favorites-store');
    await useFavoritesStore.getState().fetchFavorites();
    const serverIds = useFavoritesStore.getState().favoriteIds;
    await syncFavoritesToMobileStore(serverIds);
  } catch {
    // Keep the last known local state during a transient network failure.
  }
}

// ─── Full Data Sync from Server ─────────────────────────────────────

/** Fetch all user data from server and sync to both stores */
export async function syncAllFromServer() {
  try {
    const { useUIStore } = await import('@/stores/ui-store');
    const user = useUIStore.getState().currentUser;
    if (!user || user.id.startsWith('local-')) return;

    // Sync favorites from server → both stores
    const { useFavoritesStore } = await import('@/stores/favorites-store');
    await useFavoritesStore.getState().fetchFavorites();
    
    // After web store is updated, sync to mobile store
    const webFavs = useFavoritesStore.getState().favoriteIds;
    await syncFavoritesToMobileStore(webFavs);
    
    // Sync cart from server
    const { useCartStore } = await import('@/stores/cart-store');
    await useCartStore.getState().fetchFromServer();
  } catch {
    // Silent fail
  }
}

// ─── Event Listener Setup ───────────────────────────────────────────

let _listenersSetup = false;

/** Setup cross-component event listeners */
export function setupSyncListeners() {
  if (_listenersSetup || typeof window === 'undefined') return;
  _listenersSetup = true;

  // When favorites change in web store, sync to mobile store
  window.addEventListener(SYNC_EVENTS.FAVORITES_CHANGED, ((e: CustomEvent) => {
    const ids = e.detail as string[];
    if (ids) syncFavoritesToMobileStore(ids);
  }) as EventListener);

  // When auth changes (login/logout), do a full sync
  window.addEventListener(SYNC_EVENTS.AUTH_CHANGED, () => {
    syncAllFromServer().catch(() => {});
  });
}
