import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   password: string;
//   accountType: string;
//   fullName: string | null;
//   avatarUrl?: string | null;
//   bio: string | null;
//   dob: string | null;
//   gender: string | null;
//   notificationEnabled: boolean;
//   streamQuality: string;
//   status: string;
//   roleId: number;
//   lastLogin: string;
// }
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
    }
  )
);

export const authStore = useAuthStore;
export default useAuthStore;
export type { AuthState };