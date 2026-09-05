import { create } from 'zustand';
import { useUIStore } from '@/stores/ui-store';
import { saveLocal, loadLocal } from './helpers';
import { LOCAL_PRODUCTS, LOCAL_CATEGORIES } from './constants';
import { normalizeProduct, readThemeDark, writeThemeDark } from './helpers';
import { syncThemeToServer, fetchThemeFromServer } from '@/lib/theme-sync';
import { normalizePhone } from '@/lib/phone-utils';
import type { Screen, Tab, Product, Category, Subcategory, MobileUser, Address, Review, Order } from './types';

// Re-export normalizePhone from shared phone-utils for convenience
export { normalizePhone } from '@/lib/phone-utils';

// Refresh interval management — prevents stacking and pauses when backgrounded
let _refreshIntervalId: ReturnType<typeof setInterval> | null = null;
let _fastSyncIntervalId: ReturnType<typeof setInterval> | null = null;
let _visibilityListenerAdded = false;

// ─── Favorites sync bookkeeping ──────────────────────────────────────
// Same philosophy as the web favorites store: a local favorite toggle that
// happened AFTER the last successful server sync is a pending change and makes
// the local list authoritative; otherwise the server list wins (removals made
// on another device are never resurrected).
let _favLastServerSyncAt = 0;
let _favLastEditAt = 0;
const FAV_META_KEY = 'mobile_favorites_meta';

function favMetaNow() {
  return Date.now();
}

function saveFavMeta(lastServerSyncAt = _favLastServerSyncAt, lastEditAt = _favLastEditAt) {
  try {
    localStorage.setItem(FAV_META_KEY, JSON.stringify({ lastServerSyncAt, lastEditAt }));
  } catch { /* ignore */ }
}

function loadFavMeta() {
  try {
    const raw = localStorage.getItem(FAV_META_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lastServerSyncAt === 'number') _favLastServerSyncAt = parsed.lastServerSyncAt;
    if (typeof parsed?.lastEditAt === 'number') _favLastEditAt = parsed.lastEditAt;
  } catch { /* ignore */ }
}

function favHasPendingEdits() {
  return _favLastEditAt > _favLastServerSyncAt;
}

/** Push the given favorites to the server as the authoritative list (full replace). */
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

// ─── AppNotification type ─────────────────────────────────────────────
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promo' | 'wallet' | 'system';
  isRead: boolean;
  date: string;
}

// ─── Demo Notifications (Arabic) ──────────────────────────────────────
export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'تم تأكيد طلبك',
    body: 'طلبك رقم #NB-2024-0891 تم تأكيده بنجاح وسيتم شحنه قريباً',
    type: 'order',
    isRead: false,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'عرض خاص 🔥',
    body: 'خصم 25% على جميع منتجات المطبخ! العرض ينتهي خلال 48 ساعة',
    type: 'promo',
    isRead: false,
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    title: 'استرداد نقاط مكافأة',
    body: 'تم إضافة 50 نقطة ولاء إلى رصيدك ك مكافأة على طلبك الأخير',
    type: 'wallet',
    isRead: true,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    title: 'تحديث التطبيق',
    body: 'تم تحديث نبض المدينة إلى الإصدار 1.1.0 مع ميزات جديدة وتحسينات في الأداء',
    type: 'system',
    isRead: true,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    title: 'تم شحن طلبك',
    body: 'طلبك رقم #NB-2024-0876 في الطريق إليك! التوصيل المتوقع خلال 24 ساعة',
    type: 'order',
    isRead: false,
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// Convert +218XXX to 0XXX for LOCAL DISPLAY (Libyan format)
// Internal/DB storage stays as +218, but UI always shows 0-prefix
export const toLocalPhone = (phone: string): string => phone.replace(/^\+218/, '0');

interface FetchProductsOptions {
  page?: number;
  append?: boolean;
  search?: string;
}

// ─── Navigation History Entry ────────────────────────────────────────
export interface NavHistoryEntry {
  screen: Screen;
  activeTab: Tab;
  selectedCatId: string | null; // for restoring category detail view
}

interface MobileAppState {
  // Navigation
  screen: Screen;
  activeTab: Tab;
  setScreen: (s: Screen) => void;
  setActiveTab: (t: Tab) => void;

  // Navigation History
  navHistory: NavHistoryEntry[];
  pushNavHistory: () => void;    // push current state to history
  goBack: () => boolean;         // pop and restore; returns false if no history
  clearNavHistory: () => void;   // clear all history

  // Category detail restoration
  selectedCatId: string | null;
  setSelectedCatId: (id: string | null) => void;

  // Subcategory support
  selectedSubcategorySlug: string | null;
  subcategories: Subcategory[];
  setSelectedSubcategory: (slug: string | null) => void;
  fetchSubcategories: (parentSlug: string) => Promise<void>;
  clearSubcategories: () => void;

  // Auth
  user: MobileUser | null;
  loading: boolean;
  isReturningUser: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (name: string, phone: string, password: string, email?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<MobileUser>) => void;
  avatar: string | null;
  setAvatar: (avatar: string | null) => void;

  // Data
  products: Product[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fetchProducts: (opts?: FetchProductsOptions | string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  mergeProducts: (newProducts: Product[]) => void; // Merge category products into store

  // Pagination
  productsPage: number;
  productsHasMore: boolean;
  productsLoading: boolean;
  hasMore: boolean; // Alias for productsHasMore (used by home-tab)
  loadMore: () => Promise<void>;
  refreshData: () => Promise<void>;
  loadMoreSearch: () => Promise<void>;

  // Search pagination
  searchPage: number;
  searchHasMore: boolean;

  // Favorites
  favorites: string[];
  favoriteProducts: Product[];
  toggleFavorite: (id: string) => void;
  refreshFavoriteProducts: () => Promise<void>;
  cleanupOrphanedFavorites: () => void;
  syncFavoritesToServer: () => Promise<void>;
  fetchFavoritesFromServer: () => Promise<void>;

  // Product detail
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;

  // Dark mode
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;

  // Addresses (synced with DB)
  addresses: Address[];
  fetchAddresses: () => Promise<void>;
  addAddress: (addr: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, addr: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;

  // Orders (synced with DB)
  orders: Order[];
  fetchOrders: () => Promise<void>;

  // Notification preferences (synced with DB via user profile)
  notificationPrefs: { orders: boolean; offers: boolean; points: boolean; news: boolean };
  setNotificationPrefs: (prefs: Partial<{ orders: boolean; offers: boolean; points: boolean; news: boolean }>) => void;

  // User profile data (from DB)
  loyaltyPoints: number;
  loyaltyTier: string;
  walletBalance: number;
  fetchUserProfile: () => Promise<void>;

  // Delivery zones
  deliveryZones: Array<{ id: string; nameAr: string; nameEn: string; city: string; fee: number; estimatedDays: number }>;
  fetchDeliveryZones: () => Promise<void>;
  getDeliveryFeeForCity: (city: string) => number;

  // Selected order
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;

  // Order tracking number (for navigating from checkout)
  trackingOrderNumber: string | null;
  setTrackingOrderNumber: (orderNumber: string | null) => void;

  // Unread notifications
  unreadNotificationCount: number;
  setUnreadNotificationCount: (count: number) => void;

  // Account sub-target navigation
  accountSubTarget: string | null;
  setAccountSubTarget: (target: string | null) => void;

  // WebView (in-app browser)
  webviewUrl: string | null;
  webviewTitle: string | null;
  openWebview: (url: string, title?: string | null) => void;
  closeWebview: () => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useMobileStore = create<MobileAppState>((set, get) => ({
  // Navigation
  screen: 'splash',
  activeTab: 'home',
  setScreen: (screen) => set({ screen }),
  setActiveTab: (activeTab) => {
    set({ activeTab });
    // Scroll to top when switching tabs (find the content scroll container)
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        const scrollContainer = document.querySelector('[data-content-scroll]') as HTMLElement;
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }
      });
    }
  },

  // Navigation History
  navHistory: [],
  pushNavHistory: () => {
    const { screen, activeTab, selectedCatId } = get();
    set({ navHistory: [...get().navHistory, { screen, activeTab, selectedCatId }] });
  },
  goBack: () => {
    const history = get().navHistory;
    if (history.length === 0) return false;
    const prev = history[history.length - 1];
    set({
      navHistory: history.slice(0, -1),
      screen: prev.screen,
      activeTab: prev.activeTab,
      selectedCatId: prev.selectedCatId,
    });
    return true;
  },
  clearNavHistory: () => set({ navHistory: [] }),

  // Category detail restoration
  selectedCatId: null,
  setSelectedCatId: (id) => set({ selectedCatId: id }),

  // Subcategory support
  selectedSubcategorySlug: null,
  subcategories: [],
  setSelectedSubcategory: (slug) => set({ selectedSubcategorySlug: slug }),
  fetchSubcategories: async (parentSlug: string) => {
    try {
      const res = await fetch(`/api/categories?slug=${encodeURIComponent(parentSlug)}`);
      if (res.ok) {
        const data = await res.json();
        const children: Subcategory[] = (data.category?.children || []).map((child: Record<string, unknown>) => ({
          id: String(child.id),
          nameAr: String(child.nameAr || ''),
          nameEn: String(child.nameEn || ''),
          slug: String(child.slug || ''),
          icon: child.icon ? String(child.icon) : undefined,
          image: child.image ? String(child.image) : undefined,
          productCount: Number(child.productCount || 0),
          parentId: String(child.parentId || ''),
        }));
        set({ subcategories: children });
        return;
      }
    } catch (e) {
      console.warn('Fetch subcategories API failed:', e);
    }
    set({ subcategories: [] });
  },
  clearSubcategories: () => set({ subcategories: [], selectedSubcategorySlug: null }),

  // Auth
  user: null,
  loading: false,
  isReturningUser: false,
  login: async (phone, password) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, platform: 'mobile' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        const u: MobileUser = { id: data.user.id, name: data.user.name, phone: toLocalPhone(data.user.phone), email: data.user.email, avatar: data.user.avatar, role: data.user.role };
        set({ user: u, screen: 'main', loading: false, isReturningUser: data.isReturningUser || false });
        saveLocal('mobile_user', u);
        useUIStore.getState().login({ id: u.id, name: u.name, phone: u.phone, email: u.email, avatar: u.avatar, role: u.role });
        // Clear the locally-stored avatar if this account has none, otherwise sync it
        if (u.avatar) {
          set({ avatar: u.avatar });
          saveLocal('mobileAvatar', u.avatar);
          try { localStorage.setItem('mobile_user_photo', u.avatar); } catch { /* ignore */ }
        } else {
          set({ avatar: null });
          saveLocal('mobileAvatar', null);
          try { localStorage.removeItem('mobile_user_photo'); } catch { /* ignore */ }
        }
        get().fetchUserProfile();
        get().fetchAddresses();
        get().fetchOrders();
        get().fetchDeliveryZones();
        await get().fetchFavoritesFromServer();
        try {
          const { useCartStore } = await import('@/stores/cart-store');
          await useCartStore.getState().fetchFromServer();
        } catch { /* non-critical background sync */ }
        return true;
      }
    } catch {
      // The client never authenticates locally. The caller receives a normal failure.
    }
    set({ loading: false });
    return false;
  },
  register: async (name, phone, password, email) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        const u: MobileUser = { id: data.user.id, name: data.user.name, phone: toLocalPhone(data.user.phone), email: data.user.email, role: data.user.role };
        set({ user: u, screen: 'main', loading: false });
        saveLocal('mobile_user', u);
        useUIStore.getState().login({ id: u.id, name: u.name, phone: u.phone, email: u.email, avatar: undefined, role: u.role });
        // New accounts have no avatar — clear any leftover image from a previous session
        set({ avatar: null });
        saveLocal('mobileAvatar', null);
        try { localStorage.removeItem('mobile_user_photo'); } catch { /* ignore */ }
        return true;
      }
    } catch {
      // Registration requires the server; no local account is created.
    }
    set({ loading: false });
    return false;
  },
  logout: async () => {
    const user = get().user;
    // Call logout API to revoke server-side session
    if (user) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      } catch {
        console.warn('Logout API call failed, clearing client state anyway');
      }
    }
    // Clear all user-specific state
    set({
      user: null,
      screen: 'login',
      addresses: [],
      orders: [],
      loyaltyPoints: 0,
      walletBalance: 0,
      loyaltyTier: 'bronze',
      isReturningUser: false,
      selectedOrder: null,
      trackingOrderNumber: null,
      unreadNotificationCount: 0,
      accountSubTarget: null,
      favorites: [],
    });
localStorage.removeItem('mobile_user');
    // Clear any leftover avatar from the previous account so a new user does not see it
    set({ avatar: null });
    saveLocal('mobileAvatar', null);
    try { localStorage.removeItem('mobile_user_photo'); } catch { /* ignore */ }
    // Also clear web favorites to keep in sync
    import('@/lib/sync-bridge').then(({ syncMobileToFavoritesStore }) => {
      syncMobileToFavoritesStore([]);
    }).catch(() => {});
    useUIStore.getState().logout();
  },

  // Data
  products: [],
  categories: LOCAL_CATEGORIES,
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  productsPage: 1,
  productsHasMore: true,
  productsLoading: false,
  hasMore: true,
  fetchProducts: async (opts?: FetchProductsOptions | string) => {
    // Support legacy string argument
    const options: FetchProductsOptions = typeof opts === 'string'
      ? { search: opts, page: 1, append: false }
      : { page: 1, append: false, ...opts };
    const { page = 1, append = false, search } = options;

    // Prevent duplicate loads
    if (get().productsLoading) return;

    set({ productsLoading: true });

    const limit = 20;
    const offset = (page - 1) * limit;

    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (search) params.set('search', search);
      // When a subcategory is selected, use subcategory param instead of category
      const subcatSlug = get().selectedSubcategorySlug;
      if (subcatSlug) {
        params.set('subcategory', subcatSlug);
      }
      const res = await fetch(`/api/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        const newProducts = (data.products || []).map(normalizeProduct);
        const total = data.total ?? 0;
        const hasMore = offset + newProducts.length < total;
        set((state) => ({
          products: append ? [...state.products, ...newProducts] : newProducts,
          productsPage: page,
          productsHasMore: hasMore,
          hasMore: hasMore,
          productsLoading: false,
        }));
        return;
      }
    } catch (e) {
      console.warn('Fetch products API failed, using local fallback:', e);
    }
    // Fallback to local data
    let filtered = LOCAL_PRODUCTS;
    if (search) {
      const q = search.toLowerCase();
      filtered = LOCAL_PRODUCTS.filter((p) => p.nameAr.includes(q) || p.nameEn.toLowerCase().includes(q));
    }
    set((state) => ({
      products: append ? [...state.products, ...filtered] : filtered,
      productsPage: page,
      productsHasMore: false,
      hasMore: false,
      productsLoading: false,
    }));
  },
  loadMore: async () => {
    const { productsPage, productsHasMore, productsLoading } = get();
    if (!productsHasMore || productsLoading) return;
    await get().fetchProducts({ page: productsPage + 1, append: true });
  },
  refreshData: async () => {
    set({ productsPage: 1, productsHasMore: true, hasMore: true });
    await Promise.all([
      get().fetchProducts({ page: 1, append: false }),
      get().fetchCategories(),
    ]);
  },
  loadMoreSearch: async () => {
    const { productsPage, productsHasMore, productsLoading, searchQuery } = get();
    if (!productsHasMore || productsLoading) return;
    await get().fetchProducts({ page: productsPage + 1, append: true, search: searchQuery || undefined });
  },
  searchPage: 1,
  searchHasMore: true,
  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        // Use the complete local catalog so every section (pets, kids,
        // plants, gifts, etc.) always appears even if the live database only
        // holds the original seed categories. DB categories with matching
        // slugs are used to enrich (children/productCount), never to inflate.
        const dbCats: Category[] = (data.categories || []).map((cat: Category & { children?: Subcategory[] }) => ({
          ...cat,
          children: cat.children || [],
        }));
        const localBySlug = new Map(LOCAL_CATEGORIES.map((c) => [c.slug, c]));
        const localByNameAr = new Set(LOCAL_CATEGORIES.map((c) => c.nameAr));
        // Start with the curated local catalog (clean names, icons, presentation).
        // Enrich each with DB children/productCount when a matching slug exists.
        const categories = LOCAL_CATEGORIES.map((local) => {
          const db = dbCats.find((c) => c.slug === local.slug);
          return db ? { ...db, ...local, children: db.children || [] } : local;
        });
        // Union: append any DB category not already covered by the local catalog
        // (e.g. phones-tablets, home-appliances, beauty-cosmetics, sports-fitness,
        // books-stationery, food-beverages, furniture-home). Skip duplicate slugs,
        // and skip DB categories that merely re-route an existing local category
        // under a different slug with the same Arabic name (e.g. mens-clothing ==
        // fashion-men) to avoid showing the same section twice.
        for (const db of dbCats) {
          if (!localBySlug.has(db.slug) && !localByNameAr.has(db.nameAr)) {
            categories.push({ ...db, children: db.children || [] });
          }
        }
        set({ categories });
        return;
      }
    } catch (e) {
      console.warn('Fetch categories API failed, using local fallback:', e);
    }
    set({ categories: LOCAL_CATEGORIES });
  },

  // Merge products from category fetches into the store so they're available for favorites, etc.
  mergeProducts: (newProducts) => {
    const existing = get().products;
    const existingIds = new Set(existing.map((p) => p.id));
    const toAdd = newProducts.filter((p) => !existingIds.has(p.id));
    if (toAdd.length > 0) {
      set({ products: [...existing, ...toAdd] });
    }
  },

  // Favorites
  favorites: [],
  favoriteProducts: [],
  toggleFavorite: (productId) => {
    const user = get().user;
    // Explicit intent (add/remove) instead of a state-agnostic toggle — see the
    // web favorites store for why (toggle inverts the server when states drift).
    const wasFav = get().favorites.includes(productId);
    const next = wasFav
      ? get().favorites.filter((id) => id !== productId)
      : [...get().favorites, productId];
    set({ favorites: next });
    _favLastEditAt = favMetaNow();
    saveLocal('mobile_favorites', next);
    saveFavMeta();
    // Sync to server if logged in — idempotent add (POST) or remove (DELETE)
    if (user && !user.id.startsWith('local-')) {
      const req = wasFav
        ? fetch(`/api/favorites?productId=${encodeURIComponent(productId)}`, { method: 'DELETE' })
        : fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId }),
          });
      req
        .then(async (res) => {
          if (res.ok) {
            _favLastServerSyncAt = favMetaNow();
            saveFavMeta();
          }
        })
        .catch(() => {});
    }
    // ─── Cross-store sync: update web favorites store too ───
    const updatedFavs = get().favorites;
    import('@/lib/sync-bridge').then(({ syncMobileToFavoritesStore, dispatchSyncEvent }) => {
      syncMobileToFavoritesStore(updatedFavs);
      dispatchSyncEvent('nabdh:favorites-changed', updatedFavs);
    }).catch(() => {});
    // Refresh the products shown on the favorites screen
    get().refreshFavoriteProducts().catch(() => {});
  },
  /**
   * Rebuild the products list shown on the favorites screen.
   *
   * The favorites screen must NOT depend on the paginated `products` feed — a
   * favorite made on the web (or on page 2+ of the feed) would be invisible.
   * For logged-in users we fetch full details via includeProducts (server truth,
   * includes products outside the loaded feed); for guests we fall back to the
   * loaded products.
   */
  refreshFavoriteProducts: async () => {
    const favIds = get().favorites;
    const favSet = new Set(favIds);
    const buildLocal = () => {
      const byId = new Map<string, Product>();
      for (const p of get().products) byId.set(p.id, p);
      set({ favoriteProducts: [...byId.values()].filter((p) => favSet.has(p.id)) });
    };
    // Instant local feedback (products already loaded)
    buildLocal();
    const user = get().user;
    if (user && !user.id.startsWith('local-')) {
      try {
        const res = await fetch('/api/favorites?includeProducts=true');
        if (res.ok) {
          const data = await res.json();
          const favs: Array<{ productId: string; product?: Record<string, unknown> }> = data.favorites || [];
          const byId = new Map<string, Product>();
          for (const f of favs) {
            if (!f.product) continue;
            const p = normalizeProduct(f.product);
            byId.set(p.id, p);
          }
          // Keep any locally-known favorite the server response might not carry
          for (const p of get().products) {
            if (!byId.has(p.id)) byId.set(p.id, p);
          }
          set({ favoriteProducts: [...byId.values()].filter((p) => favSet.has(p.id)) });
          return;
        }
      } catch {
        // Fall through to per-id fetch below
      }
    }
    // Guest / fallback: fetch details for any favorite outside the loaded feed
    // from the public product API, so favorites made on the web still render.
    const known = new Set(get().products.map((p) => p.id));
    const missing = favIds.filter((id) => !known.has(id));
    if (missing.length > 0) {
      const fetched = await Promise.all(missing.map(async (id) => {
        try {
          const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
          if (!res.ok) return null;
          const data = await res.json();
          const p = data.product || data;
          return p && p.id ? normalizeProduct(p) : null;
        } catch {
          return null;
        }
      }));
      const byId = new Map<string, Product>();
      for (const p of get().products) byId.set(p.id, p);
      for (const p of fetched) {
        if (p) byId.set(p.id, p);
      }
      set({ favoriteProducts: [...byId.values()].filter((p) => favSet.has(p.id)) });
    }
  },
  cleanupOrphanedFavorites: () => {
    const { favorites, products, user } = get();
    // Never clean server-backed favorites (they are synced from the server and
    // may legitimately reference products outside the loaded feed).
    if (user && !user.id.startsWith('local-')) return;
    // Only prune ids that are NOT present in the store's loaded catalog at all.
    // This is a display helper: the favorites screen silently skips products it
    // cannot load, so pruning must never remove a favorite that might simply be
    // on a later page of the paginated feed.
    const validFavorites = favorites.filter((id) => products.some((p) => p.id === id));
    if (validFavorites.length !== favorites.length) {
      // Cleaned up orphaned favorites silently
      saveLocal('mobile_favorites', validFavorites);
      set({ favorites: validFavorites });
    }
  },

  // Product detail
  selectedProduct: null,
  setSelectedProduct: (selectedProduct) => {
    set({ selectedProduct });
    // Scroll product detail to top when a new product is selected
    if (typeof window !== 'undefined' && selectedProduct) {
      requestAnimationFrame(() => {
        const productDetailScroll = document.querySelector('[data-product-detail-scroll]') as HTMLElement;
        if (productDetailScroll) {
          productDetailScroll.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }
      });
    }
  },

  // Dark mode toggle (unified with web via localStorage 'theme', default follows system)
  darkMode: readThemeDark(),
  setDarkMode: (darkMode: boolean) => {
    set({ darkMode });
    writeThemeDark(darkMode);
    // Sync CSS class on the root element so the UI updates immediately
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
    }
    // Persist to server if user is logged in
    const user = useMobileStore.getState().user;
    if (user && !user.id.startsWith('local-') && !user.id.startsWith('offline-')) {
      syncThemeToServer(darkMode ? 'dark' : 'light');
    }
  },



  // ─── Addresses (synced with DB) ────────────────────────────────────
  addresses: [],
  fetchAddresses: async () => {
    const user = get().user;
    if (!user || user.id.startsWith('local-')) {
      // Load from localStorage for offline/local users
      const saved = loadLocal<Address[]>('mobile_addresses');
      if (saved) set({ addresses: saved });
      return;
    }
    try {
      const res = await fetch(`/api/addresses?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        set({ addresses: data.addresses || [] });
        saveLocal('mobile_addresses', data.addresses || []);
      }
    } catch {
      const saved = loadLocal<Address[]>('mobile_addresses');
      if (saved) set({ addresses: saved });
    }
  },
  addAddress: async (addr) => {
    const user = get().user;
    const newAddr: Address = { ...addr, id: `addr-${Date.now()}` };

    if (user && !user.id.startsWith('local-')) {
      try {
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            label: addr.label,
            address: addr.address,
            city: addr.city,
            area: addr.area,
            notes: addr.notes,
            isDefault: addr.isDefault,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          newAddr.id = data.address.id;
        }
      } catch {
        // Fallback to local
      }
    }

    set((state) => {
      const addresses = addr.isDefault
        ? [...state.addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
        : [...state.addresses, newAddr];
      saveLocal('mobile_addresses', addresses);
      return { addresses };
    });
  },
  updateAddress: async (id, addr) => {
    const user = get().user;
    if (user && !user.id.startsWith('local-')) {
      try {
        await fetch('/api/addresses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, userId: user.id, ...addr }),
        });
      } catch {
        // Fallback to local
      }
    }
    set((state) => {
      const addresses = state.addresses.map((a) =>
        a.id === id ? { ...a, ...addr } : a
      );
      saveLocal('mobile_addresses', addresses);
      return { addresses };
    });
  },
  deleteAddress: async (id) => {
    const user = get().user;
    if (user && !user.id.startsWith('local-')) {
      try {
        await fetch(`/api/addresses?id=${id}&userId=${user.id}`, { method: 'DELETE' });
      } catch {
        // Fallback to local
      }
    }
    set((state) => {
      const addresses = state.addresses.filter((a) => a.id !== id);
      saveLocal('mobile_addresses', addresses);
      return { addresses };
    });
  },
  setDefaultAddress: async (id) => {
    const user = get().user;
    if (user && !user.id.startsWith('local-')) {
      try {
        await fetch('/api/addresses', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, userId: user.id, isDefault: true }),
        });
      } catch {
        // Fallback to local
      }
    }
    set((state) => {
      const addresses = state.addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      saveLocal('mobile_addresses', addresses);
      return { addresses };
    });
  },

  // ─── Orders (synced with DB) ──────────────────────────────────────
  orders: [],
  fetchOrders: async () => {
    const user = get().user;
    if (!user || user.id.startsWith('local-')) return;
    try {
      const res = await fetch(`/api/orders?userId=${user.id}`);
      if (res.status === 401) {
        get().logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        set({ orders: data.orders || [] });
        saveLocal('mobile_orders', data.orders || []);
      }
    } catch {
      // Silent — keep whatever is in the store
    }
  },

  // ─── Notification Preferences (synced with DB) ────────────────────
  notificationPrefs: { orders: true, offers: true, points: true, news: false },
  setNotificationPrefs: (prefs) => {
    set({ notificationPrefs: { ...get().notificationPrefs, ...prefs } });
    try { localStorage.setItem('nabdh-notif-prefs', JSON.stringify(get().notificationPrefs)); } catch { /* ignore */ }
  },

  // ─── User Profile Data (from DB) ───────────────────────────────────
  loyaltyPoints: 0,
  loyaltyTier: 'bronze',
  walletBalance: 0,
  fetchUserProfile: async () => {
    const user = get().user;
    if (!user || user.id.startsWith('local-')) return;
    try {
      const res = await fetch(`/api/auth/profile?userId=${user.id}`);
      if (res.status === 401) {
        // Session revoked/expired (e.g. logged out from another device) → full logout
        get().logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          set({
            loyaltyPoints: data.user.loyaltyPoints || 0,
            loyaltyTier: data.user.loyaltyTier || 'bronze',
            walletBalance: data.user.walletBalance || 0,
          });
          // Apply server-side language (changed on another device)
          if (data.user.language === 'ar' || data.user.language === 'en') {
            import('@/stores/language-store').then(({ useLanguageStore }) => {
              useLanguageStore.getState().applyServerLanguage(data.user.language);
            }).catch(() => {});
          }
          // Apply notification preferences from the server
          const notif = data.user.preferences?.notifications;
          if (notif && typeof notif === 'object') {
            const next = { ...get().notificationPrefs };
            if (typeof notif.orders === 'boolean') next.orders = notif.orders;
            if (typeof notif.offers === 'boolean') next.offers = notif.offers;
            if (typeof notif.points === 'boolean') next.points = notif.points;
            if (typeof notif.news === 'boolean') next.news = notif.news;
            set({ notificationPrefs: next });
            try { localStorage.setItem('nabdh-notif-prefs', JSON.stringify(next)); } catch { /* ignore */ }
          }
          // Also update user data if name/email/avatar changed
          if (data.user.name !== user.name || data.user.email !== user.email || data.user.avatar !== user.avatar) {
            const updatedUser: MobileUser = {
              ...user,
              name: data.user.name || user.name,
              email: data.user.email || user.email,
              avatar: data.user.avatar ?? user.avatar,
            };
            set({ user: updatedUser });
            saveLocal('mobile_user', updatedUser);
            // Sync avatar to local state and localStorage
            if (data.user.avatar) {
              set({ avatar: data.user.avatar });
              saveLocal('mobileAvatar', data.user.avatar);
              try { localStorage.setItem('mobile_user_photo', data.user.avatar); } catch { /* ignore */ }
            } else if (data.user.avatar === '' || data.user.avatar === null) {
              // Avatar was removed on another device
              set({ avatar: null });
              saveLocal('mobileAvatar', null);
              try { localStorage.removeItem('mobile_user_photo'); } catch { /* ignore */ }
            }
          }
        }
        // Sync unread notification count from server (matches site's NotificationBell)
        try {
          const notifRes = await fetch(`/api/notifications?userId=${user.id}&limit=1`);
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            set({ unreadNotificationCount: notifData.unreadCount || 0 });
          }
        } catch { /* silent */ }
      }
    } catch {
      // Silent - use defaults
    }
  },

  // ─── Delivery Zones ────────────────────────────────────────────────
  deliveryZones: [],
  fetchDeliveryZones: async () => {
    try {
      const res = await fetch('/api/delivery-zones');
      if (res.ok) {
        const data = await res.json();
        set({ deliveryZones: data.zones || [] });
      }
    } catch {
      // Silent - use defaults
    }
  },
  getDeliveryFeeForCity: (city: string) => {
    const zones = get().deliveryZones;
    const zone = zones.find((z) =>
      z.city === city ||
      z.nameAr === city ||
      z.nameEn.toLowerCase() === city.toLowerCase()
    );
    return zone ? zone.fee : 10; // Default 10 LYD
  },

  // ─── Update User ────────────────────────────────────────────────
  updateUser: (data) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...data };
      saveLocal('mobile_user', updatedUser);
      return { user: updatedUser };
    });
  },

  // ─── Set Avatar ────────────────────────────────────────────────
  // Check mobileAvatar first, then fall back to mobile_user_photo (used by profile-tab)
  avatar: loadLocal<string>('mobileAvatar') || (typeof window !== 'undefined' ? ((): string | null => { try { return localStorage.getItem('mobile_user_photo'); } catch { return null; } })() : null),
  setAvatar: (avatar) => {
    set({ avatar });
    saveLocal('mobileAvatar', avatar);
    // Also sync to mobile_user_photo localStorage (used by profile-tab, settings-overlays)
    try {
      if (avatar) {
        localStorage.setItem('mobile_user_photo', avatar);
      } else {
        localStorage.removeItem('mobile_user_photo');
      }
    } catch { /* ignore */ }
    // Also update user object if present
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, avatar: avatar || undefined };
      saveLocal('mobile_user', updatedUser);
      return { user: updatedUser };
    });
  },

  // ─── Selected Order ────────────────────────────────────────────
  selectedOrder: null,
  setSelectedOrder: (selectedOrder) => set({ selectedOrder }),

  // ─── Tracking Order Number ──────────────────────────────────────
  trackingOrderNumber: null,
  setTrackingOrderNumber: (trackingOrderNumber) => set({ trackingOrderNumber }),

  // ─── Unread Notification Count ─────────────────────────────────
  unreadNotificationCount: 0,
  setUnreadNotificationCount: (unreadNotificationCount) => set({ unreadNotificationCount }),

  // ─── Account Sub-Target ────────────────────────────────────────
  accountSubTarget: null,
  setAccountSubTarget: (accountSubTarget) => set({ accountSubTarget }),

  // ─── WebView (In-App Browser) ────────────────────────────────────
  webviewUrl: null,
  webviewTitle: null,
  openWebview: (url, title) => {
    set({ webviewUrl: url, webviewTitle: title || null, screen: 'webview' });
  },
  closeWebview: () => {
    set({ webviewUrl: null, webviewTitle: null, screen: 'main' });
  },

  // ─── Notifications ────────────────────────────────────────────
  notifications: loadLocal<AppNotification[]>('mobile_notifications') || DEMO_NOTIFICATIONS,
  markNotificationRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      saveLocal('mobile_notifications', notifications);
      return { notifications };
    });
  },
  markAllNotificationsRead: () => {
    set((state) => {
      const notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      saveLocal('mobile_notifications', notifications);
      return { notifications };
    });
  },

  // ─── Sync Favorites to Server ────────────────────────────────────
  syncFavoritesToServer: async () => {
    const user = get().user;
    const favorites = get().favorites;
    if (!user || user.id.startsWith('local-') || favorites.length === 0) return;
    try {
      const ok = await pushFavorites(favorites);
      if (ok) {
        _favLastServerSyncAt = favMetaNow();
        saveFavMeta();
      }
    } catch { /* silent */ }
  },

  // ─── Fetch Favorites from Server ────────────────────────────────
  fetchFavoritesFromServer: async () => {
    const user = get().user;
    if (!user || user.id.startsWith('local-')) return;
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        const serverFavorites: string[] = Array.from(new Set(
          (data.favorites || []).map((f: { productId: string }) => f.productId)
        ));
        const localFavorites = get().favorites;

        let finalIds: string[];
        let needsPush = false;

        if (_favLastServerSyncAt === 0 && localFavorites.length > 0) {
          // Never synced on this device → guest favorites → merge with server (union)
          finalIds = Array.from(new Set([...localFavorites, ...serverFavorites]));
          needsPush = true;
        } else if (favHasPendingEdits()) {
          // Pending local toggles → local is authoritative
          finalIds = localFavorites;
          needsPush = true;
        } else {
          // No pending edits → server is the cross-device truth (removals propagate)
          finalIds = serverFavorites;
        }

        set({ favorites: finalIds });
        saveLocal('mobile_favorites', finalIds);

        if (needsPush) {
          const ok = await pushFavorites(finalIds);
          if (ok) {
            _favLastServerSyncAt = favMetaNow();
            saveFavMeta();
          }
        } else {
          _favLastServerSyncAt = favMetaNow();
          saveFavMeta();
        }

        // ─── Cross-store sync: update web favorites store too ───
        import('@/lib/sync-bridge').then(({ syncMobileToFavoritesStore }) => {
          syncMobileToFavoritesStore(finalIds);
        }).catch(() => {});
        // Rebuild the favorites-screen products with full details from the server
        get().refreshFavoriteProducts().catch(() => {});
      }
    } catch { /* silent */ }
  },
}));

// ─── Initialize store from localStorage ───────────────────────────────
export function initMobileStore() {
  const savedUserCandidate = loadLocal<MobileUser>('mobile_user');
  const savedUser = savedUserCandidate && !savedUserCandidate.id.startsWith('local-') && !savedUserCandidate.id.startsWith('offline-')
    ? savedUserCandidate
    : null;
  if (!savedUser && savedUserCandidate && typeof window !== 'undefined') {
    try { localStorage.removeItem('mobile_user'); } catch { /* ignore */ }
  }
  // Convert +218 to 0 in case user was saved with international format
  if (savedUser && savedUser.phone && savedUser.phone.startsWith('+218')) {
    savedUser.phone = savedUser.phone.replace(/^\+218/, '0');
  }
  const _onboardingDone = loadLocal<boolean>('mobile_onboarding_done'); // kept for localStorage compat
  const savedFavs = loadLocal<string[]>('mobile_favorites');
  loadFavMeta();
  // Dark mode is unified with the web — read from localStorage 'theme'
  const savedAddresses = loadLocal<Address[]>('mobile_addresses');

  const updates: Partial<MobileAppState> = {};
  if (savedFavs) updates.favorites = savedFavs;
  if (savedUser) updates.user = savedUser;
  if (savedAddresses) updates.addresses = savedAddresses;

  // ─── Unified session: adopt the web store's user if the mobile store has none ──
  // Single source of truth for the session is useUIStore.currentUser. If the web
  // store is logged in but the mobile store has no (matching) user — e.g. the user
  // logged in on the web before ever opening the mobile view — adopt it so the
  // mobile view opens into the app (and server-backed data syncs immediately).
  try {
    const webUser = useUIStore.getState().currentUser;
    const mobileUser = useMobileStore.getState().user;
    if (webUser && (!mobileUser || mobileUser.id !== webUser.id)) {
      useMobileStore.setState({
        user: { id: webUser.id, name: webUser.name, phone: toLocalPhone(webUser.phone), email: webUser.email, avatar: webUser.avatar, role: webUser.role },
        ...(useMobileStore.getState().screen === 'splash' || useMobileStore.getState().screen === 'login' ? { screen: 'main' as const } : {}),
      });
      saveLocal('mobile_user', { id: webUser.id, name: webUser.name, phone: toLocalPhone(webUser.phone), email: webUser.email, avatar: webUser.avatar, role: webUser.role });
      // Sync avatar keys — never carry over the previous account's photo
      try {
        if (webUser.avatar) {
          useMobileStore.setState({ avatar: webUser.avatar });
          localStorage.setItem('mobileAvatar', webUser.avatar);
          localStorage.setItem('mobile_user_photo', webUser.avatar);
        } else {
          useMobileStore.setState({ avatar: null });
          localStorage.setItem('mobileAvatar', JSON.stringify(null));
          localStorage.removeItem('mobile_user_photo');
        }
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }

  if (Object.keys(updates).length > 0) {
    useMobileStore.setState(updates);
  }

  // ─── Sync theme from server if user is logged in ────────────────────────
  // If user has a server-side theme preference, apply it to localStorage and state
  const currentUser = useMobileStore.getState().user;
  if (currentUser && !currentUser.id.startsWith('local-') && !currentUser.id.startsWith('offline-')) {
    fetchThemeFromServer().then((serverTheme) => {
      if (serverTheme && serverTheme !== 'system') {
        const shouldBeDark = serverTheme === 'dark';
        const currentDark = readThemeDark();
        if (shouldBeDark !== currentDark) {
          useMobileStore.setState({ darkMode: shouldBeDark });
          writeThemeDark(shouldBeDark);
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', shouldBeDark);
          }
        }
      }
    }).catch(() => {});
  }

  // ─── Setup cross-component event listeners ───
  // Server sync (fetchFavoritesFromServer) handles reconciliation now; the old
  // bidirectional union-merge was removed because it resurrected items that
  // were unfavorited on another device.
  import('@/lib/sync-bridge').then(({ setupSyncListeners }) => {
    setupSyncListeners();
  }).catch(() => {});

  // Fetch initial data
  useMobileStore.getState().fetchProducts().then(() => {
    // Build the favorites-screen products (guests fetch missing favorites by id
    // from the public API, so web-added favorites outside the feed still render)
    useMobileStore.getState().refreshFavoriteProducts().catch(() => {});
  });
  useMobileStore.getState().fetchCategories();
  useMobileStore.getState().fetchDeliveryZones();

  // Fetch user profile if logged in (effective user — includes a web-adopted one)
  const initUser = useMobileStore.getState().user;
  if (initUser && !initUser.id.startsWith('local-')) {
    useMobileStore.getState().fetchUserProfile();
    useMobileStore.getState().fetchAddresses();
    useMobileStore.getState().fetchOrders();
    useMobileStore.getState().fetchFavoritesFromServer();
    // Sync cart with server (dynamic import to avoid circular dep)
    import('@/stores/cart-store').then((m) => m.useCartStore.getState().fetchFromServer()).catch(() => {});
    // Sync unread notification count from server immediately
    fetch(`/api/notifications?userId=${initUser.id}&limit=1`).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        useMobileStore.getState().setUnreadNotificationCount(data.unreadCount || 0);
      }
    }).catch(() => {});
  }

  // Background refresh every 5 minutes — ensures admin changes are reflected
  // (with proper cleanup to prevent stacking and pause when backgrounded)
  if (typeof window !== 'undefined') {
    // Clear any existing interval to prevent stacking
    if ((_refreshIntervalId as ReturnType<typeof setInterval> | null) !== null) {
      clearInterval(_refreshIntervalId as ReturnType<typeof setInterval>);
    }

    _refreshIntervalId = setInterval(() => {
      useMobileStore.getState().refreshData();
      // Also refresh user profile (wallet/loyalty may have changed)
      const user = useMobileStore.getState().user;
      if (user && !user.id.startsWith('local-')) {
        useMobileStore.getState().fetchUserProfile();
        useMobileStore.getState().fetchAddresses();
        useMobileStore.getState().fetchOrders();
        // Sync favorites from server periodically
        useMobileStore.getState().fetchFavoritesFromServer();
        // Keep cart in sync with the web store
        import('@/stores/cart-store').then((m) => m.useCartStore.getState().fetchFromServer()).catch(() => {});
        // Sync unread notification count
        fetch(`/api/notifications?userId=${user.id}&limit=1`).then(async (res) => {
          if (res.ok) { const d = await res.json(); useMobileStore.getState().setUnreadNotificationCount(d.unreadCount || 0); }
        }).catch(() => {});
      }
    }, 5 * 60 * 1000);

    // ─── Fast sync: favorites + cart every 60s (lightweight, near-real-time) ───
    if (_fastSyncIntervalId !== null) {
      clearInterval(_fastSyncIntervalId);
    }
    _fastSyncIntervalId = setInterval(() => {
      const fu = useMobileStore.getState().user;
      if (fu && !fu.id.startsWith('local-')) {
        useMobileStore.getState().fetchFavoritesFromServer();
        import('@/stores/cart-store').then((m) => m.useCartStore.getState().fetchFromServer()).catch(() => {});
        // Sync notification count on fast sync too
        fetch(`/api/notifications?userId=${fu.id}&limit=1`).then(async (res) => {
          if (res.ok) { const d = await res.json(); useMobileStore.getState().setUnreadNotificationCount(d.unreadCount || 0); }
        }).catch(() => {});
      }
    }, 60 * 1000);

    // Pause interval when app is backgrounded, resume when foregrounded
    if (!_visibilityListenerAdded) {
      _visibilityListenerAdded = true;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // App is backgrounded — clear the intervals to save battery/CPU
          if (_refreshIntervalId !== null) {
            clearInterval(_refreshIntervalId);
            _refreshIntervalId = null;
          }
          if (_fastSyncIntervalId !== null) {
            clearInterval(_fastSyncIntervalId);
            _fastSyncIntervalId = null;
          }
        } else {
          // App is foregrounded — resume refresh and do an immediate refresh
          useMobileStore.getState().refreshData();
          const user = useMobileStore.getState().user;
          if (user && !user.id.startsWith('local-')) {
            useMobileStore.getState().fetchUserProfile();
            useMobileStore.getState().fetchAddresses();
            useMobileStore.getState().fetchOrders();
            useMobileStore.getState().fetchFavoritesFromServer();
            // Also sync cart from server
            import('@/stores/cart-store').then((m) => m.useCartStore.getState().fetchFromServer()).catch(() => {});
            // Sync unread notification count on resume
            fetch(`/api/notifications?userId=${user.id}&limit=1`).then(async (res) => {
              if (res.ok) { const d = await res.json(); useMobileStore.getState().setUnreadNotificationCount(d.unreadCount || 0); }
            }).catch(() => {});
          }
          _refreshIntervalId = setInterval(() => {
            useMobileStore.getState().refreshData();
            const u = useMobileStore.getState().user;
            if (u && !u.id.startsWith('local-')) {
              useMobileStore.getState().fetchUserProfile();
              useMobileStore.getState().fetchAddresses();
              useMobileStore.getState().fetchOrders();
              useMobileStore.getState().fetchFavoritesFromServer();
              // Keep cart in sync with the web store
              import('@/stores/cart-store').then((m) => m.useCartStore.getState().fetchFromServer()).catch(() => {});
            }
          }, 5 * 60 * 1000);

          // ─── Fast sync: favorites + cart every 60s (lightweight, near-real-time) ───
          // The full refresh above reloads product lists (disruptive) so it stays at
          // 5 minutes; favorites/cart are cheap server-truth pulls that make the app
          // reflect changes made on the web almost immediately.
          _fastSyncIntervalId = setInterval(() => {
            const fu = useMobileStore.getState().user;
            if (fu && !fu.id.startsWith('local-')) {
              useMobileStore.getState().fetchFavoritesFromServer();
              import('@/stores/cart-store').then((m) => m.useCartStore.getState().fetchFromServer()).catch(() => {});
            }
          }, 60 * 1000);
        }
      });
    }
  }
}

/** Cleanup function — clears the refresh interval and removes the visibility listener.
 *  Call this when the app unmounts or the store is torn down. */
export function cleanupMobileRefresh() {
  if (_refreshIntervalId !== null) {
    clearInterval(_refreshIntervalId);
    _refreshIntervalId = null;
  }
  if (_fastSyncIntervalId !== null) {
    clearInterval(_fastSyncIntervalId);
    _fastSyncIntervalId = null;
  }
}
