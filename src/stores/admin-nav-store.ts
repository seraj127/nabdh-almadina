import { create } from 'zustand';

export type AdminViewType =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'financial'
  | 'customers'
  | 'logistics'
  | 'walletLoyalty'
  | 'coupons'
  | 'reviews'
  | 'analytics'
  | 'auditLog'
  | 'settings';

interface AdminNavState {
  activeView: AdminViewType;
  navigate: (view: AdminViewType) => void;
}

export const useAdminNavStore = create<AdminNavState>()((set) => ({
  activeView: 'dashboard',
  navigate: (view) => set({ activeView: view }),
}));
