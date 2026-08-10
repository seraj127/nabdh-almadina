import { create } from 'zustand';
import { useUIStore } from '@/stores/ui-store';
import { saveLocal, loadLocal } from './helpers';
import { DEMO_USER, OFFLINE_USERS, LOCAL_PRODUCTS, LOCAL_CATEGORIES } from './constants';
import { normalizeProduct } from './helpers';
import { normalizePhone } from '@/lib/phone-utils';
import bcrypt from 'bcryptjs';
import type { Screen, Tab, Product, Category, Subcategory, MobileUser, Address, Review, Order } from './types';

// Re-export normalizePhone from shared phone-utils for convenience
export { normalizePhone } from '@/lib/phone-utils';

// Refresh interval management — prevents stacking and pauses when backgrounded
let _refreshIntervalId: ReturnType<typeof setInterval> | null = null;
let _visibilityListenerAdded = false;

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
const toLocalPhone = (phone: string): string => phone.replace(/^\+218/, '0');

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
  toggleFavorite: (id: string) => void;
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

  // Coupon
  appliedCoupon: { code: string; type: string; value: number; discount: number } | null;
  applyCoupon: (code: string, subtotal: number) => Promise<boolean>;
  removeCoupon: () => void;
  getCouponDiscount: (subtotal: number) => number;

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
      const data = await res.json();
      if (res.ok && data.user) {
        const u: MobileUser = { id: data.user.id, name: data.user.name, phone: toLocalPhone(data.user.phone), email: data.user.email, avatar: data.user.avatar, role: data.user.role };
        set({ user: u, screen: 'main', loading: false, isReturningUser: data.isReturningUser || false });
        saveLocal('mobile_user', u);
        useUIStore.getState().login({ id: u.id, name: u.name, phone: u.phone, email: u.email, avatar: u.avatar, role: u.role });
        // Fetch user profile, addresses, and delivery zones after login
        get().fetchUserProfile();
        get().fetchAddresses();
        get().fetchDeliveryZones();
        // Merge guest favorites with user account
        get().syncFavoritesToServer();
        get().fetchFavoritesFromServer();
        // Sync cart with server
        try {
          const { useCartStore } = await import('@/stores/cart-store');
          useCartStore.getState().fetchFromServer();
          useCartStore.getState().syncToServer();
        } catch { /* silent */ }
        return true;
      }
    } catch {
      console.warn('Login API failed, checking offline fallback');
    }
    // Offline fallback: check all offline users (normalize phone for comparison)
    const normalizedInput = normalizePhone(phone);
    const offlineUser = OFFLINE_USERS.find((u) => normalizePhone(u.phone) === normalizedInput && u.password === password);
    if (offlineUser) {
      const u: MobileUser = {
        id: offlineUser.role === 'admin' ? 'offline-admin-001' : `offline-${Date.now()}`,
        name: offlineUser.name,
        phone: toLocalPhone(offlineUser.phone),
        role: offlineUser.role,
      };
      set({ user: u, screen: 'main', loading: false });
      saveLocal('mobile_user', u);
      useUIStore.getState().login({ id: u.id, name: u.name, phone: u.phone, email: undefined, avatar: undefined, role: u.role });
      // Set loyalty data for offline users
      if ('loyaltyPoints' in offlineUser) {
        set({
          loyaltyPoints: offlineUser.loyaltyPoints || 0,
          loyaltyTier: offlineUser.loyaltyTier || 'bronze',
          walletBalance: offlineUser.walletBalance || 0,
        });
      }
      return true;
    }
    // Check locally registered users (use bcrypt.compare for hashed passwords)
    const localUsers = loadLocal<Array<{ phone: string; password: string; name: string; email?: string }>>('mobile_local_users') || [];
    const localUser = localUsers.find((u) => normalizePhone(u.phone) === normalizePhone(phone));
    if (localUser && await bcrypt.compare(password, localUser.password)) {
      const u: MobileUser = { id: `local-${phone}`, name: localUser.name, phone: toLocalPhone(localUser.phone), email: localUser.email, role: 'customer' };
      set({ user: u, screen: 'main', loading: false });
      saveLocal('mobile_user', u);
      useUIStore.getState().login({ id: u.id, name: u.name, phone: u.phone, email: u.email, avatar: undefined, role: u.role });
      return true;
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
      const data = await res.json();
      if (res.ok && data.user) {
        const u: MobileUser = { id: data.user.id, name: data.user.name, phone: toLocalPhone(data.user.phone), email: data.user.email, role: data.user.role };
        set({ user: u, screen: 'main', loading: false });
        saveLocal('mobile_user', u);
        useUIStore.getState().login({ id: u.id, name: u.name, phone: u.phone, email: u.email, avatar: undefined, role: u.role });
        return true;
      }
    } catch {
      console.warn('Register API failed, using offline fallback');
    }
    // Offline fallback: store user locally (hash password before storing)
    const localUsers = loadLocal<Array<{ phone: string; password: string; name: string; email?: string }>>('mobile_local_users') || [];
    if (localUsers.some((u) => normalizePhone(u.phone) === normalizePhone(phone))) {
      set({ loading: false });
      return false;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    localUsers.push({ phone, password: hashedPassword, name, email });
    saveLocal('mobile_local_users', localUsers);
    const u: MobileUser = { id: `local-${phone}`, name, phone, email, role: 'customer' };
    set({ user: u, screen: 'main', loading: false });
    saveLocal('mobile_user', u);
    useUIStore.getState().login({ id: u.id, name: u.name, phone: u.phone, email: u.email, avatar: undefined, role: u.role });
    return true;
  },
  logout: async () => {
    const user = get().user;
    // Call logout API to revoke server-side session
    if (user && !user.id.startsWith('local-')) {
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
      loyaltyPoints: 0,
      walletBalance: 0,
      loyaltyTier: 'bronze',
      isReturningUser: false,
      appliedCoupon: null,
      selectedOrder: null,
      trackingOrderNumber: null,
      unreadNotificationCount: 0,
      accountSubTarget: null,
      favorites: [],
    });
    localStorage.removeItem('mobile_user');
    // Also clear web favorites to keep in sync
    import('@/lib/sync-bridge').then(({ syncMobileToFavoritesStore }) => {
      syncMobileToFavoritesStore([]);
    }).catch(() => {});
    useUIStore.getState().logout();
  },

  // Data
  products: [],
  categories: [],
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
        // Preserve children arrays from API response — each parent category may include a children array
        const categories = (data.categories || []).map((cat: Category & { children?: Subcategory[] }) => ({
          ...cat,
          children: cat.children || [],
        }));
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
  toggleFavorite: (productId) => {
    const user = get().user;
    set((state) => {
      const next = state.favorites.includes(productId)
        ? state.favorites.filter((id) => id !== productId)
        : [...state.favorites, productId];
      saveLocal('mobile_favorites', next);
      return { favorites: next };
    });
    // Sync to server if logged in
    if (user && !user.id.startsWith('local-')) {
      fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).catch(() => {});
    }
    // ─── Cross-store sync: update web favorites store too ───
    const updatedFavs = get().favorites;
    import('@/lib/sync-bridge').then(({ syncMobileToFavoritesStore, dispatchSyncEvent }) => {
      syncMobileToFavoritesStore(updatedFavs);
      dispatchSyncEvent('nabdh:favorites-changed', updatedFavs);
    }).catch(() => {});
  },
  cleanupOrphanedFavorites: () => {
    const { favorites, products } = get();
    if (favorites.length === 0 || products.length === 0) return;
    const productIds = new Set(products.map((p) => p.id));
    const validFavorites = favorites.filter((id) => productIds.has(id));
    if (validFavorites.length !== favorites.length) {
      const removed = favorites.length - validFavorites.length;
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

  // Dark mode — always on (dark only app)
  darkMode: true,
  setDarkMode: (_darkMode: boolean) => {
    // Dark mode is always on — no-op
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

  // Coupon
  appliedCoupon: null,
  applyCoupon: async (code, subtotal) => {
    const upperCode = code.toUpperCase();
    const userId = get().user?.id;
    // Try public API first
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: upperCode, subtotal, userId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.valid && data.coupon) {
          set({ appliedCoupon: { code: data.coupon.code, type: data.coupon.type, value: Number(data.coupon.value), discount: Number(data.coupon.discount) || 0 } });
          return true;
        }
        // Return false with error info
        return false;
      }
    } catch {
      console.warn('Coupon validation API failed, using offline fallback');
    }
    // Offline fallback: hardcoded coupons (match seed data)
    const hardcodedCoupons: Record<string, { type: string; value: number }> = {
      WELCOME10: { type: 'percentage', value: 10 },
      KITCHEN25: { type: 'fixed', value: 25 },
      SAVE15: { type: 'percentage', value: 15 },
    };
    const coupon = hardcodedCoupons[upperCode];
    if (coupon) {
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = Math.round(subtotal * coupon.value) / 100;
      } else {
        discount = Math.min(coupon.value, subtotal);
      }
      set({ appliedCoupon: { code: upperCode, type: coupon.type, value: coupon.value, discount } });
      return true;
    }
    return false;
  },
  removeCoupon: () => {
    set({ appliedCoupon: null });
  },
  getCouponDiscount: (subtotal) => {
    const coupon = get().appliedCoupon;
    if (!coupon) return 0;
    // Use pre-computed discount from API if available
    if (coupon.discount && coupon.discount > 0) return coupon.discount;
    // Fallback calculation
    if (coupon.type === 'percentage') {
      return Math.round(subtotal * coupon.value) / 100;
    }
    // Fixed type
    return Math.min(coupon.value, subtotal);
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
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          set({
            loyaltyPoints: data.user.loyaltyPoints || 0,
            loyaltyTier: data.user.loyaltyTier || 'bronze',
            walletBalance: data.user.walletBalance || 0,
          });
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
      // For each favorite, ensure it exists on server
      for (const productId of favorites) {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });
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
        const serverFavorites = (data.favorites || []).map((f: any) => f.productId);
        // Merge with local favorites (union)
        const localFavorites = get().favorites;
        const merged = [...new Set([...localFavorites, ...serverFavorites])];
        set({ favorites: merged });
        saveLocal('mobile_favorites', merged);
        // ─── Cross-store sync: update web favorites store too ───
        import('@/lib/sync-bridge').then(({ syncMobileToFavoritesStore }) => {
          syncMobileToFavoritesStore(merged);
        }).catch(() => {});
      }
    } catch { /* silent */ }
  },
}));

// ─── Initialize store from localStorage ───────────────────────────────
export function initMobileStore() {
  const savedUser = loadLocal<MobileUser>('mobile_user');
  // Convert +218 to 0 in case user was saved with international format
  if (savedUser && savedUser.phone && savedUser.phone.startsWith('+218')) {
    savedUser.phone = savedUser.phone.replace(/^\+218/, '0');
  }
  const _onboardingDone = loadLocal<boolean>('mobile_onboarding_done'); // kept for localStorage compat
  const savedFavs = loadLocal<string[]>('mobile_favorites');
  // Dark mode is always on — no longer reading from localStorage
  const savedAddresses = loadLocal<Address[]>('mobile_addresses');

  const updates: Partial<MobileAppState> = {};
  if (savedFavs) updates.favorites = savedFavs;
  if (savedUser) updates.user = savedUser;
  // darkMode is always true — no longer loading saved preference
  if (savedAddresses) updates.addresses = savedAddresses;

  if (Object.keys(updates).length > 0) {
    useMobileStore.setState(updates);
  }

  // ─── Initial bidirectional favorites sync ───
  // Merge web store favorites with mobile store favorites on startup
  import('@/lib/sync-bridge').then(({ syncFavoritesBidirectional, setupSyncListeners }) => {
    // Setup cross-component event listeners
    setupSyncListeners();
    // Do an initial bidirectional merge of favorites
    if (savedFavs && savedFavs.length > 0) {
      syncFavoritesBidirectional();
    }
  }).catch(() => {});

  // Fetch initial data
  useMobileStore.getState().fetchProducts().then(() => {
    // Clean up orphaned favorites after products are loaded
    useMobileStore.getState().cleanupOrphanedFavorites();
  });
  useMobileStore.getState().fetchCategories();
  useMobileStore.getState().fetchDeliveryZones();

  // Fetch user profile if logged in
  if (savedUser && !savedUser.id.startsWith('local-')) {
    useMobileStore.getState().fetchUserProfile();
    useMobileStore.getState().fetchAddresses();
    useMobileStore.getState().fetchFavoritesFromServer();
    // Sync cart with server (dynamic import to avoid circular dep)
    import('@/stores/cart-store').then((m) => m.useCartStore.getState().fetchFromServer()).catch(() => {});
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
        // Sync favorites from server periodically
        useMobileStore.getState().fetchFavoritesFromServer();
      }
    }, 5 * 60 * 1000);

    // Pause interval when app is backgrounded, resume when foregrounded
    if (!_visibilityListenerAdded) {
      _visibilityListenerAdded = true;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // App is backgrounded — clear the interval to save battery/CPU
          if (_refreshIntervalId !== null) {
            clearInterval(_refreshIntervalId);
            _refreshIntervalId = null;
          }
        } else {
          // App is foregrounded — resume refresh and do an immediate refresh
          useMobileStore.getState().refreshData();
          const user = useMobileStore.getState().user;
          if (user && !user.id.startsWith('local-')) {
            useMobileStore.getState().fetchUserProfile();
            useMobileStore.getState().fetchFavoritesFromServer();
            // Also sync cart from server
            import('@/stores/cart-store').then((m) => m.useCartStore.getState().fetchFromServer()).catch(() => {});
          }
          _refreshIntervalId = setInterval(() => {
            useMobileStore.getState().refreshData();
            const u = useMobileStore.getState().user;
            if (u && !u.id.startsWith('local-')) {
              useMobileStore.getState().fetchUserProfile();
              useMobileStore.getState().fetchFavoritesFromServer();
            }
          }, 5 * 60 * 1000);
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
}
