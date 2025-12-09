import { GetAllUser } from "@/services";
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserState {
  users: any[];

  setUsers: (users: any[]) => void;
  fetchUsers: () => Promise<void>;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],

      setUsers: (users) => set({ users }),
      fetchUsers: async () => {
        try {
          const response = await GetAllUser();
          if (response.success) {
            set({ users: response.data });
          } else {
            set({ users: [] });
          }
        } catch (error) {
          toast.error('Lỗi khi tải danh sách người dùng: ' + error.message);
        }
      },
      clearUserData: () => { set({ users: [] }); },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        console.log("User store rehydrated");
      }
    }
  )
);