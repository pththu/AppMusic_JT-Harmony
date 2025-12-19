import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any | null;
  token: string | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  loginType?: string | null; // 'local' | 'google' | 'facebook' | null
  showLoginWall: boolean; // Trạng thái hiển thị Login Wall
  guestSongPlayCount: number;

  login: (user: any, loginType: string, token: string) => void;
  logout: () => void;
  setIsGuest: (isGuest: boolean) => void;
  updateAccessToken: (newToken: string) => void;
  updateUser: (user: any) => void;
  setShowLoginWall: (show: boolean) => void;
  setGuestSongPlayCount: (count: number) => void;
  incrementGuestSongPlayCount: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isGuest: true,
      loginType: null,
      showLoginWall: false,
      guestSongPlayCount: 0,

      login: (user, loginType, token) => set({ user, loginType, token, isLoggedIn: true, isGuest: false }),
      logout: () =>
        set({
          user: null,
          token: null,
          isLoggedIn: false,
          loginType: null,
          isGuest: true,
        }),
      setIsGuest: (isGuest) => set({ isGuest }),
      updateAccessToken: (newToken) => set({ token: newToken }),
      updateUser: (user) => set({ user }),
      setShowLoginWall: (show) => set({ showLoginWall: show }),
      setGuestSongPlayCount: (count) => set({ guestSongPlayCount: count }),
      incrementGuestSongPlayCount: () => {
        const currentCount = useAuthStore.getState().guestSongPlayCount;
        const newCount = currentCount + 1;
        if (newCount > 3) {
          set({ showLoginWall: true });
        }
        set({ guestSongPlayCount: newCount });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log(" Auth store rehydrated"); // gọi khi load từ AsyncStorage xong
      }
    }
  )
);

export const authStore = useAuthStore;
export default useAuthStore;
export type { AuthState };