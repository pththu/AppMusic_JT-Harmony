import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (user: any, token: string) => void;
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
      login: (user, token) => set({ user, token, isLoggedIn: true }),
      logout: () =>
        set({
          user: null,
          token: null,
          isLoggedIn: false
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
        console.log("✅ Auth store rehydrated", state);
      }
    }
  )
);

export const authStore = useAuthStore;
export default useAuthStore;
export type { AuthState };