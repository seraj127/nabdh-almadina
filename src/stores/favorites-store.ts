import { create } from 'zustand';
import { useUIStore } from './ui-store';

interface FavoritesState {
  favoriteIds: string[];

  // Actions
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  fetchFavorites: () => Promise<void>;
  syncIds: (ids: string[]) => void;
  clearFavorites: () => void;
  rehydrate: () => void;
}

const FAVORITES_STORAGE_KEY = 'nabdh-favorites-storage';

// ─── Sync bookkeeping ────────────────────────────────────────────
// Same philosophy as the cart: the server favorites are the cross-device
// source of truth. A local toggle that happened AFTER the last successful
// server sync is a pending change and makes the local list authoritative;
// otherwise the server wins (so removals made elsewhere are never resurrected).
let _lastServerSyncAt = 0;
let _lastEditAt = 0;

function now() {
  return Date.now();
}

function saveFavoritesState(ids: string[], lastServerSyncAt = _lastServerSyncAt, lastEditAt = _lastEditAt) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ ids, lastServerSyncAt, lastEditAt }));
  } catch { /* ignore */ }
}

function loadFavoritesState(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Legacy format (plain array) — no timestamps yet
      return parsed;
    }
    if (typeof parsed?.lastServerSyncAt === 'number') _lastServerSyncAt = parsed.lastServerSyncAt;
    if (typeof parsed?.lastEditAt === 'number') _lastEditAt = parsed.lastEditAt;
    return Array.isArray(parsed?.ids) ? parsed.ids : [];
  } catch { return []; }
}

function hasPendingEdits() {
  return _lastEditAt > _lastServerSyncAt;
}

/** Push the given list to the server as the authoritative favorites (full replace). */
async function pushFavorites(ids: string[]): Promise<boolean> {
  try {
    const res = await fetch('/api/favorites', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: ids }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favoriteIds: [],

  toggleFavorite: (id: string) => {
    // Send an EXPLICIT intent (add/remove) to the server — never a state-agnostic
    // toggle. A toggle can invert the server state whenever the local list and the
    // server list drift apart (other device, cross-store sync, stale storage),
    // leaving the counter up but the favorites page (server-driven) empty.
    const wasFav = get().favoriteIds.includes(id);
    const newIds = wasFav
      ? get().favoriteIds.filter((fid) => fid !== id)
      : [...get().favoriteIds, id];
    _lastEditAt = now();
    saveFavoritesState(newIds);
    set({ favoriteIds: newIds });

    // Sync with server if user is logged in — idempotent add (POST) or remove (DELETE)
    const user = useUIStore.getState().currentUser;
    if (user && !user.id.startsWith('local-')) {
      const req = wasFav
        ? fetch(`/api/favorites?productId=${encodeURIComponent(id)}`, { method: 'DELETE' })
        : fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: id }),
          });
      req
        .then(async (res) => {
          if (res.ok) {
            _lastServerSyncAt = now();
            saveFavoritesState(get().favoriteIds);
          }
        })
        .catch(() => {
          // Silent fail — favorites are still stored locally
        });
    }

    // ─── Cross-store sync: update mobile favorites store too ───
    const updatedIds = get().favoriteIds;
    import('@/lib/sync-bridge').then(({ syncFavoritesToMobileStore, dispatchSyncEvent }) => {
      syncFavoritesToMobileStore(updatedIds);
      dispatchSyncEvent('nabdh:favorites-changed', updatedIds);
    }).catch(() => {});
  },

  isFavorite: (id: string) => {
    return get().favoriteIds.includes(id);
  },

  fetchFavorites: async () => {
    const user = useUIStore.getState().currentUser;
    if (!user || user.id.startsWith('local-')) return;

    try {
      const res = await fetch('/api/favorites?includeProducts=true');
      if (res.ok) {
        const data = await res.json();
        if (data.favorites && Array.isArray(data.favorites)) {
          const serverIds: string[] = Array.from(new Set(
            data.favorites.map((f: { productId: string }) => f.productId)
          ));
          const localIds = get().favoriteIds;

          let finalIds: string[];
          let needsPush = false;

          if (_lastServerSyncAt === 0 && localIds.length > 0) {
            // Never synced on this device → guest favorites → merge with server (union)
            finalIds = Array.from(new Set([...localIds, ...serverIds]));
            needsPush = true;
          } else if (hasPendingEdits()) {
            // Pending local toggles → local is authoritative
            finalIds = localIds;
            needsPush = true;
          } else {
            // No pending edits → server is the cross-device truth
            finalIds = serverIds;
          }

          set({ favoriteIds: finalIds });
          saveFavoritesState(finalIds);

          if (needsPush) {
            const ok = await pushFavorites(finalIds);
            if (ok) {
              _lastServerSyncAt = now();
              saveFavoritesState(finalIds);
            }
          } else {
            _lastServerSyncAt = now();
            saveFavoritesState(finalIds);
          }

          // ─── Cross-store sync: update mobile favorites store too ───
          import('@/lib/sync-bridge').then(({ syncFavoritesToMobileStore }) => {
            syncFavoritesToMobileStore(finalIds);
          }).catch(() => {});
        }
      }
    } catch {
      // Silent fail — use local favorites
    }
  },

  syncIds: (ids: string[]) => {
    // Cross-store mirror (mobile → web, server pulls → page). The idempotent
    // POST/DELETE intents above already persist every real toggle, so a mirror
    // must NOT be stamped as a pending local edit (that would make the next pull
    // treat an empty page list as authoritative and wipe server favorites).
    set({ favoriteIds: ids });
    saveFavoritesState(ids);
  },

  clearFavorites: () => {
    set({ favoriteIds: [] });
    _lastEditAt = now();
    saveFavoritesState([]);
    // Persist the clear to the server so favorites don't resurrect on next pull
    const user = useUIStore.getState().currentUser;
    if (user && !user.id.startsWith('local-')) {
      pushFavorites([]).then((ok) => {
        if (ok) {
          _lastServerSyncAt = now();
          saveFavoritesState([]);
        }
      }).catch(() => {});
    }
    // ─── Cross-store sync: clear mobile favorites too ───
    import('@/lib/sync-bridge').then(({ syncFavoritesToMobileStore }) => {
      syncFavoritesToMobileStore([]);
    }).catch(() => {});
  },

  rehydrate: () => {
    // Load from localStorage for instant display
    const saved = loadFavoritesState();
    if (saved.length > 0) {
      set({ favoriteIds: saved });
    }
    // If user is logged in, server is the source of truth — sync immediately
    const user = useUIStore.getState().currentUser;
    if (user && !user.id.startsWith('local-')) {
      get().fetchFavorites().catch(() => {});
    }
  },
}));

// ─── Cross-tab & foreground sync listeners ──────────────────────
let _favListenersSetup = false;

/**
 * Sets up favorites sync listeners:
 *  1. `storage` event → another tab changed favorites in localStorage → re-pull.
 *  2. `focus`/`visibilitychange` → user returned to the browser window → re-pull.
 *     (Skipped inside the native Capacitor app — mobile-store handles foreground refresh.)
 */
export function setupFavoritesSyncListeners() {
  if (_favListenersSetup || typeof window === 'undefined') return;
  _favListenersSetup = true;

  const isNativeApp = (window as unknown as Record<string, unknown>).Capacitor !== undefined;

  const pullFromServer = () => {
    const user = useUIStore.getState().currentUser;
    if (!user || !user.id || user.id.startsWith('local-')) return;
    useFavoritesStore.getState().fetchFavorites().catch(() => {});
  };

  window.addEventListener('storage', (e) => {
    if (e.key === FAVORITES_STORAGE_KEY) pullFromServer();
  });

  if (!isNativeApp) {
    const onVisible = () => {
      if (!document.hidden) pullFromServer();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
  }
}
