import { create } from 'zustand';
import { useUIStore } from './ui-store';

export interface CartItem {
  productId: string;
  nameAr: string;
  nameEn: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
  /** Remaining purchasable stock (stock minus reservations). Falls back to stock. */
  available?: number;
  /** Client-only: timestamp of the last local edit, used for cross-device merge decisions. */
  updatedAt?: number;
}

interface CartState {
  items: CartItem[];
  deliveryArea: string | null;

  // Actions
  addItem: (product: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryFee: (fee: number, area?: string) => void;

  // Server sync
  syncToServer: () => void;
  fetchFromServer: () => Promise<void>;

  // Computed getters
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;

  // Manual persistence
  rehydrate: () => void;
}

interface CartStateInternal extends CartState {
  _deliveryFee: number;
}

const STORAGE_KEY = 'nabdh-cart-storage';

// ─── Sync bookkeeping ────────────────────────────────────────────
// The server cart is the cross-device source of truth. These timestamps make
// merge decisions safe: a local edit that happened AFTER the last successful
// server sync is treated as a pending (unsynced) change and wins locally;
// anything else yields to the server, so deletions made on another device
// are never resurrected by a stale device.
let _lastServerSyncAt = 0;
let _fetchInFlight = false;
let _fetchPending = false;

function now() {
  return Date.now();
}

// Debounced sync helper — avoids hammering the API on rapid cart changes
let _cartSyncTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedCartSync() {
  if (_cartSyncTimer) clearTimeout(_cartSyncTimer);
  _cartSyncTimer = setTimeout(() => {
    useCartStore.getState().syncToServer();
  }, 1200);
}

function saveCartState(items: CartItem[], deliveryArea: string | null, syncedAt = _lastServerSyncAt) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, deliveryArea, syncedAt }));
  } catch { /* ignore */ }
}

function loadCartState(): { items?: CartItem[]; deliveryArea?: string | null; syncedAt?: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed?.syncedAt === 'number') _lastServerSyncAt = parsed.syncedAt;
    return parsed;
  } catch { return {}; }
}

/** Maximum quantity a cart line may hold, based on available/stock. */
function cartMaxQuantity(item: { stock?: number; available?: number }): number {
  const stock = (typeof item.stock === 'number' && item.stock > 0) ? item.stock : 99;
  if (typeof item.available === 'number' && item.available >= 0) {
    return Math.min(stock, item.available);
  }
  return stock;
}

/** Normalize a raw API cart item into a CartItem. */
function normalizeServerItem(raw: Record<string, unknown>): CartItem {
  return {
    productId: String(raw.productId || ''),
    nameAr: typeof raw.nameAr === 'string' ? raw.nameAr : '',
    nameEn: typeof raw.nameEn === 'string' ? raw.nameEn : '',
    price: typeof raw.price === 'number' ? raw.price : parseFloat(String(raw.price)) || 0,
    quantity: Math.max(1, Math.floor(Number(raw.quantity) || 1)),
    image: typeof raw.image === 'string' ? raw.image : '',
    stock: typeof raw.stock === 'number' ? raw.stock : (parseFloat(String(raw.stock)) || 0),
    available: typeof raw.available === 'number' ? raw.available : undefined,
  };
}

/**
 * Merge server items with local items for a pull.
 * Rules:
 *  - A local item that was edited AFTER the last successful sync is a pending
 *    unsynced change → keep its quantity locally.
 *  - A local-only item is kept only if we have never synced with the server
 *    (guest cart) or it was edited after the last sync (pending add).
 *  - Everything else yields to the server (server is the cross-device truth).
 */
function mergePull(serverItems: CartItem[], localItems: CartItem[]): { merged: CartItem[]; needsPush: boolean } {
  const serverMap = new Map(serverItems.map((s) => [s.productId, s]));
  let needsPush = false;
  const merged: CartItem[] = [];

  for (const serverItem of serverItems) {
    const local = localItems.find((l) => l.productId === serverItem.productId);
    if (local && typeof local.updatedAt === 'number' && local.updatedAt > _lastServerSyncAt && local.quantity !== serverItem.quantity) {
      // Unsynced local edit → prefer the local quantity (clamped to availability)
      merged.push({ ...serverItem, quantity: Math.min(local.quantity, cartMaxQuantity(serverItem)), updatedAt: local.updatedAt });
      needsPush = true;
    } else {
      merged.push(serverItem);
    }
    serverMap.delete(serverItem.productId);
  }

  // Local-only items
  for (const localItem of localItems) {
    if (serverMap.has(localItem.productId)) continue;
    const isGuestCart = _lastServerSyncAt === 0;
    const isPendingLocalAdd = typeof localItem.updatedAt === 'number' && localItem.updatedAt > _lastServerSyncAt;
    if (isGuestCart || isPendingLocalAdd) {
      merged.push(localItem);
      needsPush = true;
    }
  }

  return { merged, needsPush };
}

/** Merge the server's post-push response into local state without losing pending edits. */
function mergeAdopt(serverItems: CartItem[], localItems: CartItem[]): { merged: CartItem[]; needsResync: boolean } {
  const localMap = new Map(localItems.map((l) => [l.productId, l]));
  let needsResync = false;
  const merged: CartItem[] = [];

  for (const serverItem of serverItems) {
    const local = localMap.get(serverItem.productId);
    if (local && typeof local.updatedAt === 'number' && local.updatedAt > _lastServerSyncAt && local.quantity !== serverItem.quantity) {
      // A local edit landed while the push was in flight → keep it, resync later
      merged.push({ ...serverItem, quantity: Math.min(local.quantity, cartMaxQuantity(serverItem)), updatedAt: local.updatedAt });
      needsResync = true;
    } else {
      merged.push(serverItem);
    }
    localMap.delete(serverItem.productId);
  }

  // Local items the server response doesn't know about (added during flight) → keep + resync
  for (const local of localItems) {
    if (localMap.has(local.productId) && typeof local.updatedAt === 'number' && local.updatedAt > _lastServerSyncAt) {
      merged.push(local);
      needsResync = true;
    }
  }

  return { merged, needsResync };
}

export const useCartStore = create<CartStateInternal>()((set, get) => ({
  items: [],
  deliveryArea: null,
  _deliveryFee: 10 as number,

  addItem: (product) => {
    const safePrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;
    const safeProduct = { ...product, price: safePrice };
    set((state) => {
      const maxQty = cartMaxQuantity(safeProduct);
      const addQuantity = safeProduct.quantity ?? 1;

      const existingItem = state.items.find(
        (item) => item.productId === safeProduct.productId
      );

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + addQuantity, maxQty);
        if (newQuantity < 1) return state;
        const updatedAt = now();
        const newItems = state.items.map((item) =>
          item.productId === safeProduct.productId
            ? { ...item, quantity: newQuantity, updatedAt }
            : item
        );
        saveCartState(newItems, state.deliveryArea);
        return { items: newItems };
      }

      if (maxQty < 1) return state;
      const quantity = Math.min(addQuantity, maxQty);
      const newItems = [...state.items, { ...safeProduct, stock: safeProduct.stock, quantity, updatedAt: now() }];
      saveCartState(newItems, state.deliveryArea);
      return { items: newItems };
    });
    debouncedCartSync();
    // ─── Cross-component notification ───
    import('@/lib/sync-bridge').then(({ dispatchSyncEvent }) => {
      dispatchSyncEvent('nabdh:cart-changed', get().items.length);
    }).catch(() => {});
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.productId !== productId);
      saveCartState(newItems, state.deliveryArea);
      return { items: newItems };
    });
    get().syncToServer();
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      const item = state.items.find((i) => i.productId === productId);
      if (!item) return state;
      const maxQty = cartMaxQuantity(item);
      if (maxQty < 1) return state;
      const clampedQuantity = Math.max(1, Math.min(quantity, maxQty));
      const updatedAt = now();
      const newItems = state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: clampedQuantity, updatedAt } : i
      );
      saveCartState(newItems, state.deliveryArea);
      return { items: newItems };
    });
    debouncedCartSync();
  },

  clearCart: () => {
    const user = useUIStore.getState().currentUser;
    if (user && !user.id.startsWith('local-')) {
      // Clear the server cart first so its items don't come back on next fetch
      fetch('/api/cart/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      })
        .then(() => {
          _lastServerSyncAt = now();
          saveCartState([], null, _lastServerSyncAt);
        })
        .catch(() => {});
    }
    set({ items: [], deliveryArea: null });
    saveCartState([], null);
  },

  setDeliveryFee: (fee: number, area?: string) => {
    set({ _deliveryFee: fee, deliveryArea: area || null });
  },

  syncToServer: () => {
    const user = useUIStore.getState().currentUser;
    if (!user || !user.id || user.id.startsWith('local-')) return;

    const items = get().items;

    fetch('/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map(item => ({ productId: item.productId, quantity: item.quantity })) }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !Array.isArray(data.items)) return;
        const serverItems = data.items.map((raw: Record<string, unknown>) => normalizeServerItem(raw));
        // Adopt the server state without losing edits that landed during the push
        const { merged, needsResync } = mergeAdopt(serverItems, get().items);
        _lastServerSyncAt = now();
        set({ items: merged });
        saveCartState(merged, get().deliveryArea, _lastServerSyncAt);
        if (needsResync) debouncedCartSync();
      })
      .catch(() => {});
  },

  fetchFromServer: async () => {
    const user = useUIStore.getState().currentUser;
    if (!user || !user.id || user.id.startsWith('local-')) return;

    // Guard against overlapping fetches (e.g. foreground + storage events firing together)
    if (_fetchInFlight) {
      _fetchPending = true;
      return;
    }
    _fetchInFlight = true;

    try {
      // Snapshot of current local cart (guest or pending-edit items)
      const localItems = get().items.slice();

      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          const serverItems = data.items.map((raw: Record<string, unknown>) => normalizeServerItem(raw));
          const { merged, needsPush } = mergePull(serverItems, localItems);
          set({ items: merged });
          saveCartState(merged, get().deliveryArea);
          // Guest cart / pending local adds → push the merged cart to the server
          if (needsPush) {
            get().syncToServer();
          }
        } else {
          // Server cart is empty
          if (localItems.length > 0) {
            const isGuestCart = _lastServerSyncAt === 0;
            const hasPendingLocalAdds = localItems.some((l) => typeof l.updatedAt === 'number' && l.updatedAt > _lastServerSyncAt);
            if (isGuestCart || hasPendingLocalAdds) {
              // Keep local items, they'll be synced by syncToServer
              get().syncToServer();
            } else {
              // Server is the truth and it's empty — drop stale local items
              set({ items: [] });
              saveCartState([], get().deliveryArea);
            }
          } else {
            set({ items: [] });
            saveCartState([], get().deliveryArea);
          }
        }
      }
    } catch {
      // Silent — keep local cart (offline)
    } finally {
      _fetchInFlight = false;
      if (_fetchPending) {
        _fetchPending = false;
        get().fetchFromServer().catch(() => {});
      }
    }
  },

  // Computed getters
  getTotalItems: () => {
    return get().items.length;
  },

  getSubtotal: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },

  getDeliveryFee: () => {
    return get()._deliveryFee ?? 10;
  },

  getTotal: () => {
    return get().getSubtotal() + get().getDeliveryFee();
  },

  // Manual rehydration
  rehydrate: () => {
    // Load from localStorage for instant display
    const saved = loadCartState();
    if (saved.items && saved.items.length > 0) {
      set({ items: saved.items, deliveryArea: saved.deliveryArea ?? null });
    }
    // If user is logged in, server is the source of truth — sync immediately
    const user = useUIStore.getState().currentUser;
    if (user && !user.id.startsWith('local-')) {
      get().fetchFromServer().catch(() => {});
    }
  },
}));

// ─── Cross-tab & foreground sync listeners ──────────────────────
let _cartListenersSetup = false;

/**
 * Sets up cart sync listeners:
 *  1. `storage` event → another tab changed the cart in localStorage → re-pull.
 *  2. `focus`/`visibilitychange` → user returned to the browser/app window → re-pull.
 *     (Skipped inside the native Capacitor app — mobile-store handles foreground refresh.)
 */
export function setupCartSyncListeners() {
  if (_cartListenersSetup || typeof window === 'undefined') return;
  _cartListenersSetup = true;

  const isNativeApp = (window as unknown as Record<string, unknown>).Capacitor !== undefined;

  const pullFromServer = () => {
    const user = useUIStore.getState().currentUser;
    if (!user || !user.id || user.id.startsWith('local-')) return;
    useCartStore.getState().fetchFromServer().catch(() => {});
  };

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) pullFromServer();
  });

  if (!isNativeApp) {
    const onVisible = () => {
      if (!document.hidden) pullFromServer();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
  }
}
