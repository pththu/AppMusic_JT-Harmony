import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  token: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  loginType?: string | null; // 'local' | 'google' | 'facebook' | null
  login: (user: any, loginType: string, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateAccessToken: (newToken: string) => void;
  updateRefreshToken: (newToken: string) => void;
  updateUser: (user: any) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      loginType: null,
      login: (user, loginType, token, refreshToken) =>
        set({ user, loginType, token, refreshToken, isLoggedIn: true }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isLoggedIn: false,
          loginType: null,
        }),
      updateAccessToken: (newToken) =>
        set({ token: newToken }),
      updateRefreshToken: (newToken) =>
        set({ refreshToken: newToken }),
      updateUser: (user) =>
        set({ user }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        console.log("Auth store rehydrated");
      }
    }
  )
);

export const authStore = useAuthStore;
export default useAuthStore;
export type { AuthState };
