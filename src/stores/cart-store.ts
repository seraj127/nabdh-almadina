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

// Debounced sync helper — avoids hammering the API on rapid cart changes
let _cartSyncTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedCartSync() {
  if (_cartSyncTimer) clearTimeout(_cartSyncTimer);
  _cartSyncTimer = setTimeout(() => {
    useCartStore.getState().syncToServer();
  }, 1500);
}

function saveCartState(items: CartItem[], deliveryArea: string | null) {
  try {
    localStorage.setItem('nabdh-cart-storage', JSON.stringify({ items, deliveryArea }));
  } catch { /* ignore */ }
}

function loadCartState(): { items?: CartItem[]; deliveryArea?: string | null } {
  try {
    const raw = localStorage.getItem('nabdh-cart-storage');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

export const useCartStore = create<CartStateInternal>()((set, get) => ({
  items: [],
  deliveryArea: null,
  _deliveryFee: 10 as number,

  addItem: (product) => {
    const safePrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0;
    const safeProduct = { ...product, price: safePrice };
    set((state) => {
      const safeStock = (typeof safeProduct.stock === 'number' && safeProduct.stock > 0) ? safeProduct.stock : 99;
      const addQuantity = safeProduct.quantity ?? 1;

      const existingItem = state.items.find(
        (item) => item.productId === safeProduct.productId
      );

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + addQuantity, safeStock);
        const newItems = state.items.map((item) =>
          item.productId === safeProduct.productId ? { ...item, quantity: newQuantity } : item
        );
        saveCartState(newItems, state.deliveryArea);
        return { items: newItems };
      }

      const quantity = Math.min(addQuantity, safeStock);
      const newItems = [...state.items, { ...safeProduct, stock: safeStock, quantity }];
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
      const safeStock = (typeof item.stock === 'number' && item.stock > 0) ? item.stock : 99;
      const clampedQuantity = Math.max(1, Math.min(quantity, safeStock));
      const newItems = state.items.map((i) =>
        i.productId === productId ? { ...i, quantity: clampedQuantity } : i
      );
      saveCartState(newItems, state.deliveryArea);
      return { items: newItems };
    });
    debouncedCartSync();
  },

  clearCart: () => {
    set({ items: [], deliveryArea: null });
    saveCartState([], null);
    get().syncToServer();
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
    }).catch(() => {});
  },

  fetchFromServer: async () => {
    const user = useUIStore.getState().currentUser;
    if (!user || !user.id || user.id.startsWith('local-')) return;

    // Save local (guest) cart items before fetching from server
    // so we can merge them with the server cart after fetching
    const localItems = get().items.slice(); // snapshot of current local cart

    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          // Deduplicate by productId (server should already be unique, but guard against race conditions)
          const seen = new Set<string>();
          const serverItems: CartItem[] = [];
          for (const item of data.items) {
            if (seen.has(item.productId)) continue;
            seen.add(item.productId);
            serverItems.push({
              productId: item.productId,
              nameAr: item.nameAr || '',
              nameEn: item.nameEn || '',
              price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price)) || 0,
              quantity: item.quantity || 1,
              image: item.image || '',
              stock: item.stock || 99,
            });
          }

          // If local cart had items (guest cart), merge them with server cart
          if (localItems.length > 0) {
            const serverMap = new Map(serverItems.map((i) => [i.productId, i]));
            for (const localItem of localItems) {
              const existing = serverMap.get(localItem.productId);
              if (existing) {
                // Item exists in both — keep the higher quantity (capped at stock)
                const maxQty = Math.min(
                  Math.max(existing.quantity, localItem.quantity),
                  existing.stock > 0 ? existing.stock : 99
                );
                existing.quantity = maxQty;
              } else {
                // Item only in local cart — add it to the merged result
                serverItems.push({ ...localItem });
                serverMap.set(localItem.productId, serverItems[serverItems.length - 1]);
              }
            }
            // After merging, sync the merged cart to server
            // (debounced to avoid duplicate syncs)
            setTimeout(() => { get().syncToServer(); }, 300);
          }

          set({ items: serverItems });
          saveCartState(serverItems, get().deliveryArea);
        } else if (data.items && data.items.length === 0) {
          // Server cart is empty — if local cart had items, keep them and sync
          if (localItems.length > 0) {
            // Keep local items, they'll be synced by the syncToServer call
            setTimeout(() => { get().syncToServer(); }, 300);
          } else {
            set({ items: [] });
            saveCartState([], get().deliveryArea);
          }
        }
      }
    } catch { /* silent */ }
  },

  // Computed getters
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
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
