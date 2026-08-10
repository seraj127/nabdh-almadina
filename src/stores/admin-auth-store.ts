import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  role: string;
  avatar: string | null;
  language: string;
  lastLoginAt: string | null;
  loginCount: number;
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isReturningUser: boolean;

  // Actions
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  clearError: () => void;

  // Helper: get headers for authenticated API calls
  getAuthHeaders: () => Record<string, string>;
  // Helper: authenticated fetch (auto-handles 401)
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isReturningUser: false,

      login: async (phone: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password, platform: 'admin' }),
          });

          const data = await res.json();

          if (!res.ok) {
            set({ isLoading: false, error: data.error || 'Login failed' });
            return false;
          }

          if (data.user.role !== 'admin') {
            set({ isLoading: false, error: 'Access denied. Admin only.' });
            return false;
          }

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isReturningUser: data.isReturningUser || false,
          });
          return true;
        } catch {
          set({ isLoading: false, error: 'Network error' });
          return false;
        }
      },

      logout: async () => {
        try {
          // Call the logout API to revoke the session server-side
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch {
          // Even if the API call fails, clear client state
          console.warn('Logout API call failed, clearing client state anyway');
        }

        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isReturningUser: false,
        });
      },

      logoutAll: async () => {
        try {
          // Revoke all sessions for this user
          await fetch('/api/auth/logout?all=true', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
        } catch {
          console.warn('Logout-all API call failed');
        }

        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isReturningUser: false,
        });
      },

      clearError: () => set({ error: null }),

      getAuthHeaders: () => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        // Auth is now handled via JWT cookies (session_token/admin_session)
        // No need to send x-user-id header — it's been removed from server auth
        return headers;
      },

      authFetch: async (url: string, options: RequestInit = {}) => {
        const headers = get().getAuthHeaders();
        const isFormData = options.body instanceof FormData;
        // Remove Content-Type for FormData so browser can set multipart boundary
        if (isFormData) {
          delete headers['Content-Type'];
        }

        // Merge with provided headers, but allow overrides
        const mergedHeaders = {
          ...headers,
          ...(options.headers instanceof Headers
            ? Object.fromEntries(options.headers.entries())
            : Array.isArray(options.headers)
            ? Object.fromEntries(options.headers)
            : (options.headers as Record<string, string> || {})),
        };

        const res = await fetch(url, { ...options, headers: mergedHeaders });

        // Auto-logout on 401 (session expired or unauthorized)
        if (res.status === 401) {
          get().logout();
        }

        return res;
      },
    }),
    {
      name: 'nabdh-admin-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isReturningUser: state.isReturningUser,
      }),
    }
  )
);
