import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoggedIn: boolean;
  loginType?: string | null; // 'local' | 'google' | 'facebook' | null
  login: (user: any, loginType: string, token: string) => void;
  logout: () => void;
  updateAccessToken: (newToken: string) => void;
  updateUser: (user: any) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      loginType: null,
      login: (user, loginType, token) => set({ user, loginType, token, isLoggedIn: true }),
      logout: () =>
        set({
          user: null,
          token: null,
          isLoggedIn: false,
          loginType: null,
        }),
      updateAccessToken: (newToken) =>
        set({ token: newToken }),
      updateUser: (user) =>
        set({ user }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // gọi khi load từ AsyncStorage xong
        console.log("✅ Auth store rehydrated");
      }
    }
  )
);

export const authStore = useAuthStore;
export default useAuthStore;
export type { AuthState };