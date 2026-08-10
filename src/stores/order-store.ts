import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderItem {
  productId: string;
  nameAr: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface StatusLogEntry {
  status: string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  subtotal: number;
  status: string;
  paymentMethod: string;
  shippingAddress?: ShippingAddress;
  notes?: string;
  createdAt: string;
  statusHistory: StatusLogEntry[];
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  cityId: string;
  zone?: string;
  zoneId?: string;
  area?: string;
  areaId?: string;
  address: string;
  notes?: string;
}

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  cityId: string;
  zone?: string;
  zoneId?: string;
  area?: string;
  areaId?: string;
  address: string;
  notes?: string;
  isDefault: boolean;
}

interface OrderState {
  orders: Order[];
  addresses: Address[];

  // Order actions
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string, note?: string) => void;
  deleteOrder: (id: string) => void;
  clearOrders: () => void;
  getOrders: () => Order[];
  getOrderById: (id: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;

  // Address actions
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => Address | undefined;
}

const generateOrderNumber = (): string => {
  const prefix = 'NM';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      addresses: [],

      // Order actions
      addOrder: (orderData) => {
        const orderNumber = orderData.orderNumber || generateOrderNumber();
        const order: Order = {
          ...orderData,
          orderNumber,
          status: 'pending',
          statusHistory: [
            { status: 'pending', timestamp: new Date().toISOString(), note: 'Order created' },
          ],
        };
        set((state) => ({
          orders: [order, ...state.orders],
        }));
      },

      updateOrderStatus: (orderId, status, note) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  statusHistory: [
                    ...order.statusHistory,
                    { status, timestamp: new Date().toISOString(), note },
                  ],
                }
              : order
          ),
        }));
      },

      deleteOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        }));
      },

      clearOrders: () => {
        set({ orders: [] });
      },

      getOrders: () => {
        return get().orders;
      },

      getOrderById: (id) => {
        return get().orders.find((o) => o.id === id);
      },

      getOrderByNumber: (orderNumber) => {
        return get().orders.find((o) => o.orderNumber === orderNumber);
      },

      // Address actions
      addAddress: (addressData) => {
        const id = `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const address: Address = { ...addressData, id };
        set((state) => ({
          addresses: addressData.isDefault
            ? [...state.addresses.map((a) => ({ ...a, isDefault: false })), address]
            : [...state.addresses, address],
        }));
      },

      updateAddress: (id, updates) => {
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
        }));
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        }));
      },

      getDefaultAddress: () => {
        const addresses = get().addresses;
        return addresses.find((a) => a.isDefault) || addresses[0];
      },
    }),
    {
      name: 'nabdh-orders-storage',
    }
  )
);
