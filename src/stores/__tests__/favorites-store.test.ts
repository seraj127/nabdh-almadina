import { describe, it, expect, beforeEach } from 'vitest';
import { useFavoritesStore } from '../favorites-store';

describe('favorites-store', () => {
  beforeEach(() => {
    localStorage.clear();
    useFavoritesStore.setState({ favoriteIds: [] });
  });

  it('toggleFavorite adds then removes an id (guest — local only)', () => {
    const store = useFavoritesStore.getState();
    store.toggleFavorite('product-1');
    expect(useFavoritesStore.getState().favoriteIds).toEqual(['product-1']);

    store.toggleFavorite('product-1');
    expect(useFavoritesStore.getState().favoriteIds).toEqual([]);
  });

  it('toggleFavorite keeps multiple favorites and removes only the target', () => {
    const store = useFavoritesStore.getState();
    store.toggleFavorite('a');
    store.toggleFavorite('b');
    store.toggleFavorite('c');
    expect(useFavoritesStore.getState().favoriteIds).toEqual(['a', 'b', 'c']);
    store.toggleFavorite('b');
    expect(useFavoritesStore.getState().favoriteIds).toEqual(['a', 'c']);
  });

  it('syncIds replaces the list and persists it', () => {
    useFavoritesStore.getState().syncIds(['x', 'y']);
    expect(useFavoritesStore.getState().favoriteIds).toEqual(['x', 'y']);
    const saved = JSON.parse(localStorage.getItem('nabdh-favorites-storage') || '{}');
    expect(saved.ids).toEqual(['x', 'y']);
  });

  it('clearFavorites empties the list and persists', () => {
    useFavoritesStore.getState().syncIds(['a', 'b']);
    useFavoritesStore.getState().clearFavorites();
    expect(useFavoritesStore.getState().favoriteIds).toEqual([]);
    const saved = JSON.parse(localStorage.getItem('nabdh-favorites-storage') || '{}');
    expect(saved.ids).toEqual([]);
  });
});
