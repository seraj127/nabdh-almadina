import { create } from 'zustand';

interface UserInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: string;
}

type AuthView = 'none' | 'login' | 'register' | 'profile' | 'favorites' | 'cart' | 'checkout' | 'settings' | 'addresses' | 'delivery-zones' | 'points-rewards' | 'terms' | 'privacy' | 'returns' | 'product-detail' | 'order-tracking' | 'contact' | 'sitemap' | 'downloads' | 'category-page';

interface UIState {
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isChatOpen: boolean;
  isOrderTrackingOpen: boolean;
  isAdminMode: boolean;
  activeSection: string;
  isLoggedIn: boolean;
  currentUser: UserInfo | null;
  authView: AuthView;
  selectedProductId: string | null;
  notifications: number;
  isReturningUser: boolean;
  pendingAuthView: AuthView | null; // Where to redirect after login
  profileScrollTo: 'top' | 'orders' | 'addresses'; // Scroll target when navigating to profile
  setProfileScrollTo: (target: 'top' | 'orders' | 'addresses') => void;
  catalogSearchQuery: string; // Search query to filter the product catalog
  catalogSearchTotal: number; // Total results count for search feedback
  selectedCategorySlug: string | null; // Slug of the selected category for category page

  // Toggle functions
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  toggleOrderTracking: () => void;
  openOrderTracking: () => void;
  closeOrderTracking: () => void;
  setAuthView: (view: AuthView) => void;
  clearAuthView: () => void;
  navigateTo: (view: AuthView) => void;
  setNotifications: (count: number) => void;
  toggleAdminMode: () => void;
  setActiveSection: (section: string) => void;
  login: (user: UserInfo, isReturning?: boolean) => void;
  logout: () => Promise<void>;

  openProductDetail: (productId: string) => void;
  setCatalogSearch: (query: string) => void; // Set search query for catalog
  clearCatalogSearch: () => void; // Clear search and return to normal catalog
  setCatalogSearchTotal: (total: number) => void; // Set total results count
  // Navigate to category page
  openCategoryPage: (slug: string) => void;
  // Clear category page state
  clearCategoryPage: () => void;
  // Update current user fields (e.g. avatar after upload)
  updateCurrentUser: (partial: Partial<UserInfo>) => void;
  // Manual persistence
  rehydrate: () => void;
}

function saveUIState(state: Partial<UIState>) {
  try {
    const toSave: Record<string, unknown> = {
      isLoggedIn: state.isLoggedIn,
      currentUser: state.currentUser,
      activeSection: state.activeSection,
      isReturningUser: state.isReturningUser,
    };
    // Strip large avatar data URLs from persistence to avoid exceeding localStorage limits.
    // The full avatar is always fetched from the server via rehydrate → /api/auth/profile.
    if (toSave.currentUser && typeof toSave.currentUser === 'object') {
      const user = toSave.currentUser as Record<string, unknown>;
      if (typeof user.avatar === 'string' && user.avatar.length > 5000) {
        toSave.currentUser = { ...user, avatar: undefined };
      }
    }
    localStorage.setItem('ui-store', JSON.stringify(toSave));
  } catch { /* ignore */ }
}

function loadUIState(): Partial<UIState> {
  try {
    const raw = localStorage.getItem('ui-store');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

// ─── Lazy store accessor (set after module init to avoid circular deps) ────
// cart-store imports ui-store, so ui-store cannot import cart-store at module level.
// Instead, we store a reference that gets set from page.tsx after all modules load.
type CartStoreType = { getState: () => { fetchFromServer: () => Promise<void>; clearCart: () => void } };
type FavoritesStoreType = { getState: () => { fetchFavorites: () => Promise<void>; clearFavorites: () => void } };

let _cartStore: CartStoreType | null = null;
let _favoritesStore: FavoritesStoreType | null = null;
let _couponStore: any | null = null;

/** Called once from page.tsx after stores are created */
export function registerCartStore(store: CartStoreType) { _cartStore = store; }
export function registerFavoritesStore(store: FavoritesStoreType) { _favoritesStore = store; }
export function registerCouponStore(store: any) { _couponStore = store; }

function safeCartOp(fn: (store: CartStoreType) => void) {
  try { if (_cartStore) fn(_cartStore); } catch { /* ignore */ }
}
function safeFavoritesOp(fn: (store: FavoritesStoreType) => void) {
  try { if (_favoritesStore) fn(_favoritesStore); } catch { /* ignore */ }
}
function safeCouponOp(fn: (store: any) => void) {
  try { if (_couponStore) fn(_couponStore); } catch { /* ignore */ }
}

export const useUIStore = create<UIState>()((set) => ({
  isCartOpen: false,
  isSearchOpen: false,
  isChatOpen: false,
  isOrderTrackingOpen: false,
  isAdminMode: false,
  activeSection: 'home',
  isLoggedIn: false,
  currentUser: null,
  authView: 'none',
  selectedProductId: null,
  notifications: 0,
  isReturningUser: false,
  pendingAuthView: null,
  profileScrollTo: 'top',
  catalogSearchQuery: '',
  catalogSearchTotal: 0,
  selectedCategorySlug: null,

  // Cart toggles
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  // Search toggles
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  // Chat toggles
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),

  // Order Tracking toggles
  toggleOrderTracking: () => set((state) => ({ isOrderTrackingOpen: !state.isOrderTrackingOpen })),
  openOrderTracking: () => set({ isOrderTrackingOpen: true }),
  closeOrderTracking: () => set({ isOrderTrackingOpen: false }),

  // Auth view
  setAuthView: (view: AuthView) => set({ authView: view }),
  setProfileScrollTo: (target: 'top' | 'orders' | 'addresses') => set({ profileScrollTo: target }),
  clearAuthView: () => set({ authView: 'none', selectedProductId: null, pendingAuthView: null }),

  // Catalog search
  setCatalogSearch: (query: string) => set({ catalogSearchQuery: query, authView: 'none' }),
  clearCatalogSearch: () => set({ catalogSearchQuery: '', catalogSearchTotal: 0 }),
  setCatalogSearchTotal: (total: number) => set({ catalogSearchTotal: total }),
  openProductDetail: (productId: string) => {
    set({ authView: 'product-detail', selectedProductId: productId });
    // Scroll to top on navigation (for web store view)
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
    }
  },

  // Notifications
  setNotifications: (count: number) => set({ notifications: count }),

  // Admin mode
  toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),

  // Active section
  setActiveSection: (section: string) => {
    set({ activeSection: section });
    saveUIState({ activeSection: section } as Partial<UIState>);
  },

  // Auth
  login: (user: UserInfo, isReturning?: boolean) => {
    const pending = useUIStore.getState().pendingAuthView;
    const targetView = pending || 'none';
    const update = { isLoggedIn: true, currentUser: user, authView: targetView as AuthView, isReturningUser: isReturning || false, pendingAuthView: null as AuthView | null };
    set(update);
    saveUIState(update);
    // Fetch user-specific data from server after login
    setTimeout(() => {
      safeCartOp((s) => { s.getState().fetchFromServer().catch(() => {}); });
      safeFavoritesOp((s) => { s.getState().fetchFavorites().catch(() => {}); });
    }, 200);
    // ─── Cross-store sync: notify mobile store of login (unified session) ───
    import('@/lib/sync-bridge').then(({ syncAllFromServer, dispatchSyncEvent, syncWebUserToMobile }) => {
      dispatchSyncEvent('nabdh:auth-changed');
      syncWebUserToMobile(user).catch(() => {});
    }).catch(() => {});
  },

  // Navigate to page view (profile, favorites, etc.) — also scrolls to top
  navigateTo: (view: AuthView) => {
    set({ authView: view });
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      console.warn('Logout API call failed, clearing client state anyway');
    }
    const update = { isLoggedIn: false, currentUser: null, isReturningUser: false, authView: 'none' as AuthView, selectedProductId: null, pendingAuthView: null as AuthView | null };
    set(update);
    saveUIState(update);
    // Clear user-specific data stores on logout
    safeCartOp((s) => { s.getState().clearCart(); });
    safeFavoritesOp((s) => { s.getState().clearFavorites(); });
    // Clear coupon on logout — user-specific data
    safeCouponOp((s) => { s.getState().removeCoupon(); });
    // ─── Cross-store sync: clear mobile store on web logout ───
    import('@/lib/sync-bridge').then(({ dispatchSyncEvent, syncFavoritesToMobileStore }) => {
      dispatchSyncEvent('nabdh:auth-changed');
      syncFavoritesToMobileStore([]);
      // Also clear mobile store user state
      import('@/components/mobile/lib/mobile-store').then(({ useMobileStore }) => {
        useMobileStore.setState({
          user: null,
          avatar: null,
          favorites: [],
          addresses: [],
          loyaltyPoints: 0,
          walletBalance: 0,
          loyaltyTier: 'bronze',
        });
        try { localStorage.removeItem('mobile_user'); } catch { /* ignore */ }
        try { localStorage.removeItem('mobile_user_photo'); } catch { /* ignore */ }
        try { localStorage.removeItem('mobileAvatar'); } catch { /* ignore */ }
      }).catch(() => {});
    }).catch(() => {});
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
    }
  },

  // Navigate to category page
  openCategoryPage: (slug: string) => {
    set({ authView: 'category-page', selectedCategorySlug: slug });
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
    }
  },

  // Clear category page state
  clearCategoryPage: () => {
    set({ selectedCategorySlug: null });
  },

  // Update current user fields (e.g. avatar, name) and persist
  updateCurrentUser: (partial: Partial<UserInfo>) => {
    const current = useUIStore.getState().currentUser;
    if (!current) return;
    const updated = { ...current, ...partial };
    const update = { currentUser: updated };
    set(update);
    saveUIState({ ...useUIStore.getState(), ...update } as Partial<UIState>);
  },

  // Manual rehydration — call once on mount
  rehydrate: () => {
    const saved = loadUIState();
    if (Object.keys(saved).length > 0) {
      set(saved);
    }
    // Validate session with server — heavily deferred to not block initial paint
    // Auth validation is not critical for first paint; delay it significantly
    if (saved.isLoggedIn && saved.currentUser?.id) {
      setTimeout(() => {
        fetch('/api/auth/profile', { method: 'GET' })
          .then((res) => {
            if (res.status === 401) {
              const update = { isLoggedIn: false, currentUser: null, isReturningUser: false, authView: 'none' as AuthView, pendingAuthView: null as AuthView | null };
              set(update);
              saveUIState(update);
              safeCartOp((s) => { s.getState().clearCart(); });
              safeFavoritesOp((s) => { s.getState().clearFavorites(); });
            } else if (res.ok) {
              res.json().then((data) => {
                if (data.user) {
                  const updatedUser: UserInfo = {
                    id: data.user.id,
                    name: data.user.name || '',
                    phone: data.user.phone,
                    email: data.user.email || undefined,
                    avatar: data.user.avatar || undefined,
                    role: data.user.role || 'customer',
                  };
                  const update = { currentUser: updatedUser };
                  set(update);
                  saveUIState({ ...useUIStore.getState(), ...update } as Partial<UIState>);
                  // Unify the mobile session with the validated web session
                  import('@/lib/sync-bridge').then(({ syncWebUserToMobile }) => {
                    syncWebUserToMobile(updatedUser).catch(() => {});
                  }).catch(() => {});
                  // Apply server-side language + notification preferences
                  if (data.user.language === 'ar' || data.user.language === 'en') {
                    import('@/stores/language-store').then(({ useLanguageStore }) => {
                      useLanguageStore.getState().applyServerLanguage(data.user.language);
                    }).catch(() => {});
                  }
                  const notif = data.user.preferences?.notifications;
                  if (notif && typeof notif === 'object') {
                    const merged: Record<string, boolean> = {};
                    if (typeof notif.orders === 'boolean') merged.orders = notif.orders;
                    if (typeof notif.offers === 'boolean') merged.offers = notif.offers;
                    if (typeof notif.points === 'boolean') merged.points = notif.points;
                    if (typeof notif.news === 'boolean') merged.news = notif.news;
                    if (Object.keys(merged).length > 0) {
                      try { localStorage.setItem('nabdh-notif-prefs', JSON.stringify(merged)); } catch { /* ignore */ }
                    }
                  }
                }
              }).catch(() => {});
              // Sync cart and favorites from server (non-blocking)
              safeCartOp((s) => { s.getState().fetchFromServer().catch(() => {}); });
              safeFavoritesOp((s) => { s.getState().fetchFavorites().catch(() => {}); });
            }
          })
          .catch(() => {
            // Network error — don't auto-logout, might be offline
          });
      }, 800);
    }
  },
}));

// ─── Session watchdog: auto-logout when the session is revoked elsewhere ───
let _authWatchdogStarted = false;
let _authCheckInFlight = false;

/**
 * Periodically validates the session against the server via the lightweight
 * /api/auth/session endpoint. If the session was revoked on another device
 * (or expired), the client performs a full logout so it can't keep operating
 * with a dead session. This gives cross-device logout sync: logging out on
 * one device logs out all of them.
 */
export function setupAuthWatchdog(): void {
  if (_authWatchdogStarted || typeof window === 'undefined') return;
  _authWatchdogStarted = true;

  const isNativeApp = typeof (window as unknown as { Capacitor?: unknown }).Capacitor !== 'undefined';

  const check = async () => {
    const s = useUIStore.getState();
    const user = s.currentUser;
    if (!user || !user.id || user.id.startsWith('local-')) return;
    if (_authCheckInFlight) return;
    _authCheckInFlight = true;
    try {
      const res = await fetch('/api/auth/session', { method: 'GET', credentials: 'include' });
      if (res.status === 401) {
        await useUIStore.getState().logout();
      }
    } catch {
      // Network error — assume offline, keep the session
    } finally {
      _authCheckInFlight = false;
    }
  };

  // Run every 3 minutes (covers the native app as well)
  window.setInterval(check, 3 * 60 * 1000);

  // Also check when the page regains focus/visibility (web only;
  // the mobile app performs its own foreground refresh)
  if (!isNativeApp) {
    const onVisibility = () => {
      if (!document.hidden) check();
    };
    window.addEventListener('focus', onVisibility);
    document.addEventListener('visibilitychange', onVisibility);
  }
}
