import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// TypeScript interfaces
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  permissions?: string[];
}

interface AuthState {
  // State
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  
  // Helper methods
  isTokenExpired: () => boolean;
  getUserPermissions: () => string[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

// CÁCH 1: Sử dụng type assertion (đơn giản nhất)
export const useAuthStore = create(
  persist(
    (set, get): AuthState => ({
      // === STATE ===
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // === ACTIONS ===
      setAccessToken: (token: string) => {
        set({ 
          accessToken: token,
          isAuthenticated: !!token 
        });
      },

      setRefreshToken: (token: string) => {
        set({ refreshToken: token });
      },

      setUser: (user: User) => {
        set({ user });
      },

      login: (accessToken: string, refreshToken: string, user: User) => {
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // === HELPERS ===
      isTokenExpired: (): boolean => {
        const { accessToken } = get();
        if (!accessToken) return true;

        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          const currentTime = Date.now() / 1000;
          return payload.exp < currentTime;
        } catch (error) {
          console.error('Error checking token expiration:', error);
          return true;
        }
      },

      getUserPermissions: (): string[] => {
        const { user } = get();
        return user?.permissions || [];
      },

      hasPermission: (permission: string): boolean => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },

      hasRole: (role: string): boolean => {
        const { user } = get();
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);