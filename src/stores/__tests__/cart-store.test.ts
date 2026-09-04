import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cart-store';

// Clear persisted state between tests
beforeEach(() => {
  localStorage.clear();
  useCartStore.getState().clearCart();
});

const DEFAULT_DELIVERY_FEE = 10;

describe('cart-store', () => {
  const sample = {
    productId: 'p1',
    nameAr: 'منتج',
    nameEn: 'Product',
    price: 100,
    image: '/p1.png',
    stock: 10,
  };

  it('starts empty and totals reflect the default delivery fee only', () => {
    const s = useCartStore.getState();
    expect(s.items).toHaveLength(0);
    expect(s.getTotalItems()).toBe(0);
    expect(s.getSubtotal()).toBe(0);
    expect(s.getTotal()).toBe(DEFAULT_DELIVERY_FEE);
  });

  it('addItem adds a product and computes totals', () => {
    useCartStore.getState().addItem(sample);
    const s = useCartStore.getState();
    expect(s.items).toHaveLength(1);
    expect(s.items[0].quantity).toBe(1);
    expect(s.getTotalItems()).toBe(1);
    expect(s.getSubtotal()).toBe(100);
  });

  it('addItem twice increments the quantity of the existing line', () => {
    const store = useCartStore.getState();
    store.addItem(sample);
    store.addItem(sample);
    const s = useCartStore.getState();
    expect(s.items).toHaveLength(1);
    expect(s.items[0].quantity).toBe(2);
    // subtotal=200 + default delivery fee
    expect(s.getTotal()).toBe(200 + DEFAULT_DELIVERY_FEE);
  });

  it('updateQuantity clamps quantity within available stock', () => {
    const store = useCartStore.getState();
    store.addItem(sample);
    // set to a huge value — should clamp to stock (10)
    store.updateQuantity('p1', 999);
    const qty = useCartStore.getState().items[0].quantity;
    expect(qty).toBeLessThanOrEqual(10);
  });

  it('removeItem removes the line', () => {
    useCartStore.getState().addItem(sample);
    useCartStore.getState().removeItem('p1');
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('respects available < stock when allowed quantity is lower', () => {
    const limited = { ...sample, available: 3 };
    useCartStore.getState().addItem(limited);
    // try to raise beyond availability
    useCartStore.getState().updateQuantity('p1', 9);
    expect(useCartStore.getState().items[0].quantity).toBeLessThanOrEqual(3);
  });
});
