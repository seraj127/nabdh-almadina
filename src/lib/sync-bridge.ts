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

// ─── Favorites Sync ─────────────────────────────────────────────────

/** Sync favorites from mobile store → web favorites store */
export async function syncMobileToFavoritesStore(favoriteIds: string[]) {
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
  } catch {
    // Silent fail — might be circular import
  }
}

/** Full bidirectional favorites sync — merge both stores and update both */
export async function syncFavoritesBidirectional() {
  try {
    const { useFavoritesStore } = await import('@/stores/favorites-store');
    const { useMobileStore } = await import('@/components/mobile/lib/mobile-store');
    
    const webIds = useFavoritesStore.getState().favoriteIds;
    const mobileIds = useMobileStore.getState().favorites;
    
    // Merge (union) both sets
    const merged = [...new Set([...webIds, ...mobileIds])];
    
    // Update both stores if they differ
    const webSet = new Set(webIds);
    const mergedSet = new Set(merged);
    
    const webNeedsUpdate = !(webSet.size === mergedSet.size && [...webSet].every(id => mergedSet.has(id)));
    const mobileNeedsUpdate = !(new Set(mobileIds).size === mergedSet.size && [...new Set(mobileIds)].every(id => mergedSet.has(id)));
    
    if (webNeedsUpdate) {
      useFavoritesStore.getState().syncIds(merged);
    }
    if (mobileNeedsUpdate) {
      useMobileStore.setState({ favorites: merged });
      try {
        localStorage.setItem('mobile_favorites', JSON.stringify(merged));
      } catch { /* ignore */ }
    }
  } catch {
    // Silent fail
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
