import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { localProducts } = vi.hoisted(() => ({
  localProducts: [
    { id: 'lp1', nameAr: 'منتج محلي 1', nameEn: 'Local 1', price: 10, stock: 5 },
    { id: 'lp2', nameAr: 'منتج محلي 2', nameEn: 'Local 2', price: 20, stock: 3 },
  ],
}));

vi.mock('../constants', () => ({
  LOCAL_PRODUCTS: localProducts,
  LOCAL_CATEGORIES: [],
}));

vi.mock('@/stores/ui-store', () => ({
  useUIStore: {
    getState: () => ({ login: vi.fn(), logout: vi.fn(), currentUser: null }),
  },
}));

vi.mock('@/lib/phone-utils', () => ({
  normalizePhone: (p: string) => p,
}));

vi.mock('@/lib/theme-sync', () => ({
  syncThemeToServer: vi.fn(),
  fetchThemeFromServer: vi.fn().mockResolvedValue(null),
}));

vi.mock('../helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../helpers')>();
  return {
    ...actual,
    loadLocal: vi.fn(() => null),
    readThemeDark: vi.fn(() => false),
    writeThemeDark: vi.fn(),
  };
});

import { useMobileStore } from '../mobile-store';
import { normalizeProduct } from '../helpers';

const makeProduct = (id: string) => ({
  id,
  nameAr: `منتج ${id}`,
  nameEn: `Product ${id}`,
  price: 100,
  stock: 10,
  images: [`${id}.png`],
});

const okJson = (body: unknown) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response);

describe('mobile-store fetchProducts / pagination', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useMobileStore.setState({
      products: [],
      productsPage: 1,
      productsHasMore: true,
      hasMore: true,
      productsLoading: false,
      searchPage: 1,
      searchHasMore: true,
      searchQuery: '',
    });
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('fetches page 1 and sets hasMore based on server total', async () => {
    const products = Array.from({ length: 20 }, (_, i) => makeProduct(`p${i + 1}`));
    fetchMock.mockReturnValue(okJson({ products, total: 25, limit: 20, offset: 0 }));

    await useMobileStore.getState().fetchProducts();

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('limit=20');
    expect(calledUrl).toContain('offset=0');
    expect(useMobileStore.getState().products).toHaveLength(20);
    expect(useMobileStore.getState().productsHasMore).toBe(true);
    expect(useMobileStore.getState().hasMore).toBe(true);
    expect(useMobileStore.getState().productsLoading).toBe(false);
  });

  it('appends page 2 products without resetting the list', async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => makeProduct(`p${i + 1}`));
    fetchMock.mockReturnValueOnce(okJson({ products: page1, total: 22 }));

    await useMobileStore.getState().fetchProducts();

    const page2 = Array.from({ length: 2 }, (_, i) => makeProduct(`p2${i + 1}`));
    fetchMock.mockReturnValueOnce(okJson({ products: page2, total: 22 }));

    await useMobileStore.getState().loadMore();

    const urls = fetchMock.mock.calls.map((c) => c[0] as string);
    expect(urls[1]).toContain('offset=20');
    expect(useMobileStore.getState().products).toHaveLength(22);
    expect(useMobileStore.getState().productsPage).toBe(2);
    expect(useMobileStore.getState().productsHasMore).toBe(false);
    expect(useMobileStore.getState().productsLoading).toBe(false);
  });

  it('loadMore is a no-op when there is nothing more to load', async () => {
    useMobileStore.setState({ productsHasMore: false, hasMore: false });
    await useMobileStore.getState().loadMore();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(useMobileStore.getState().productsLoading).toBe(false);
  });

  it('loadMore is a no-op while a load is already in flight', async () => {
    useMobileStore.setState({ productsLoading: true });
    await useMobileStore.getState().loadMore();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps loadMore working when the store has more results after a previous full load', async () => {
    // After browsing page 2 out of 2 the store reports no more; starting fresh
    // (refreshData resets the page) must not leave the button dead.
    const products = Array.from({ length: 5 }, (_, i) => makeProduct(`q${i + 1}`));
    fetchMock.mockReturnValue(okJson({ products, total: 5 }));
    useMobileStore.setState({ productsPage: 1, productsHasMore: true, hasMore: true });

    await useMobileStore.getState().fetchProducts();

    expect(useMobileStore.getState().productsHasMore).toBe(false);
    expect(useMobileStore.getState().productsLoading).toBe(false);
  });

  it('aborts a stalled request after 20s and falls back to local catalog', async () => {
    vi.useFakeTimers();
    // Simulate an API that never responds: hang until the AbortSignal fires.
    let abortSignal: AbortSignal | null = null;
    const capturedSignal = () => abortSignal;
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      abortSignal = init?.signal ?? null;
      return new Promise((_resolve, reject) => {
        abortSignal?.addEventListener('abort', () => {
          const err = new Error('The operation was aborted.');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    const pending = useMobileStore.getState().fetchProducts();
    expect(useMobileStore.getState().productsLoading).toBe(true);

    await vi.advanceTimersByTimeAsync(20000);

    expect(capturedSignal()).not.toBeNull();
    expect(capturedSignal()?.aborted).toBe(true);
    await pending;

    // The 20s timeout must never leave productsLoading stuck true (the root
    // cause of the dead "load more" button).
    expect(useMobileStore.getState().productsLoading).toBe(false);
    expect(useMobileStore.getState().products.map((p) => p.id)).toEqual(['lp1', 'lp2']);
    expect(useMobileStore.getState().productsHasMore).toBe(false);
  });

  it('sends the search query on the products request and honors search fallback', async () => {
    fetchMock.mockReturnValue(okJson({ products: [], total: 0 }));
    await useMobileStore.getState().fetchProducts({ page: 1, append: false, search: 'car' });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('search=car');
    expect(useMobileStore.getState().products).toHaveLength(0);
    expect(useMobileStore.getState().hasMore).toBe(false);
  });

  it('loadMoreSearch appends the next page while keeping the search term', async () => {
    useMobileStore.setState({ searchQuery: 'phone' });
    const page1 = Array.from({ length: 20 }, (_, i) => makeProduct(`s${i + 1}`));
    fetchMock.mockReturnValueOnce(okJson({ products: page1, total: 21 }));
    await useMobileStore.getState().fetchProducts({ page: 1, append: false, search: 'phone' });

    const page2 = [makeProduct('s21')];
    fetchMock.mockReturnValueOnce(okJson({ products: page2, total: 21 }));

    await useMobileStore.getState().loadMoreSearch();

    const urls = fetchMock.mock.calls.map((c) => c[0] as string);
    expect(urls[1]).toContain('offset=20');
    expect(urls[1]).toContain('search=phone');
    expect(useMobileStore.getState().products).toHaveLength(21);
    expect(useMobileStore.getState().searchHasMore).toBe(true);
    expect(useMobileStore.getState().productsHasMore).toBe(false);
  });

  it('normalizes server-side raw product rows through normalizeProduct', async () => {
    fetchMock.mockReturnValue(okJson({
      products: [{ id: 'x1', nameAr: 'خام', nameEn: 'Raw', price: '49.9', images: '["a.png"]', stock: 4 }],
      total: 1,
    }));
    await useMobileStore.getState().fetchProducts();
    const p = useMobileStore.getState().products[0];
    expect(p.id).toBe('x1');
    expect(p.price).toBe(49.9);
    expect(p.images).toEqual(['a.png']);
    expect(p.inStock).toBe(true);
    expect(p.nameEn).toBe('Raw');
  });

  it('does not re-run normalizeProduct with a mismatch against the helpers contract', async () => {
    expect(normalizeProduct(makeProduct('z1')).id).toBe('z1');
  });
});

describe('mobile-store favorites (offline-first / server sync)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useMobileStore.setState({
      favorites: [],
      favoriteProducts: [],
      user: null,
      products: [],
    });
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Runs first deliberately: this branch requires a pristine sync meta state
  // (_favLastServerSyncAt === 0 and no pending local edits), which later
  // toggleFavorite tests mutate for the rest of the module.
  it('fetchFavoritesFromServer pulls server favorites without pending local edits', async () => {
    useMobileStore.setState({
      user: { id: 'u1', name: 'Test', phone: '0911111111', role: 'customer' },
      favorites: [],
    });
    fetchMock.mockReturnValue(okJson({ favorites: [{ productId: 'server-1' }, { productId: 'server-2' }] }));

    await useMobileStore.getState().fetchFavoritesFromServer();

    expect(useMobileStore.getState().favorites.sort()).toEqual(['server-1', 'server-2']);
  });

  it('fetchFavoritesFromServer is a no-op for guests', async () => {
    useMobileStore.setState({ user: null });
    await useMobileStore.getState().fetchFavoritesFromServer();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('toggleFavorite adds an id for guests and persists locally', async () => {
    fetchMock.mockResolvedValue({ ok: false });
    useMobileStore.getState().toggleFavorite('p1');
    // The guest favorite-detail fallback may fire, but never a favorites mutation.
    expect(useMobileStore.getState().favorites).toEqual(['p1']);
    expect(localStorage.getItem('mobile_favorites')).toContain('p1');
    const mutationCalls = fetchMock.mock.calls.filter(([url, init]) =>
      String(url).startsWith('/api/favorites') && init && (init.method ?? 'GET') !== 'GET'
    );
    expect(mutationCalls).toHaveLength(0);
  });

  it('toggleFavorite removes an existing favorite', () => {
    useMobileStore.setState({ favorites: ['p1', 'p2'] });
    useMobileStore.getState().toggleFavorite('p1');
    expect(useMobileStore.getState().favorites).toEqual(['p2']);
  });

  it('during pending local edits local favorites win and are pushed to the server', async () => {
    // toggleFavorite above leaves _favLastEditAt ahead of _favLastServerSyncAt,
    // so this exercise mirrors the "I deleted on this device" offline-first rule.
    useMobileStore.setState({
      user: { id: 'u1', name: 'Test', phone: '0911111111', role: 'customer' },
      favorites: ['kept-locally'],
    });
    fetchMock.mockReturnValue(okJson({ favorites: [{ productId: 'server-1' }] }));

    await useMobileStore.getState().fetchFavoritesFromServer();

    expect(useMobileStore.getState().favorites).toEqual(['kept-locally']);
    const put = fetchMock.mock.calls.find(([url, init]) =>
      String(url) === '/api/favorites' && init && init.method === 'PUT'
    );
    expect(put).toBeTruthy();
  });
});