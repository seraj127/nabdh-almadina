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

function saveFavoritesState(ids: string[]) {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

function loadFavoritesState(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  favoriteIds: [],

  toggleFavorite: (id: string) => {
    set((state) => {
      const isFav = state.favoriteIds.includes(id);
      const newIds = isFav
        ? state.favoriteIds.filter((fid) => fid !== id)
        : [...state.favoriteIds, id];
      saveFavoritesState(newIds);
      return { favoriteIds: newIds };
    });

    // Sync with server if user is logged in
    const user = useUIStore.getState().currentUser;
    if (user && !user.id.startsWith('local-')) {
      fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      }).catch(() => {
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
          const serverIds = data.favorites.map(
            (f: { productId: string }) => f.productId
          );
          // Use server as source of truth — replace local with server IDs
          // (avoids stale local IDs accumulating)
          const deduped = Array.from(new Set(serverIds));
          set({ favoriteIds: deduped });
          saveFavoritesState(deduped);
          // ─── Cross-store sync: update mobile favorites store too ───
          import('@/lib/sync-bridge').then(({ syncFavoritesToMobileStore }) => {
            syncFavoritesToMobileStore(deduped);
          }).catch(() => {});
        }
      }
    } catch {
      // Silent fail — use local favorites
    }
  },

  syncIds: (ids: string[]) => {
    set({ favoriteIds: ids });
    saveFavoritesState(ids);
  },

  clearFavorites: () => {
    set({ favoriteIds: [] });
    saveFavoritesState([]);
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
