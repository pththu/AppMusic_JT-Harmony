import { GetAllFollowArtist, GetAllFollowUser } from "@/services";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface FollowState {

  followArtists: any[];
  followUsers: any[];

  setFollowArtists: (followArtists: any[]) => void;
  setFollowUsers: (followUsers: any[]) => void;

  fetchFollowArtists: () => Promise<void>;
  fetchFollowUsers: () => Promise<void>;

  clearFollowData: () => void;
}

export const useFollowStore = create<FollowState>()(
  persist(
    (set, get) => ({
      followArtists: [],
      followUsers: [],

      setFollowArtists: (followArtists) => set({ followArtists }),
      setFollowUsers: (followUsers) => set({ followUsers }),

      fetchFollowArtists: async () => {
        try {
          const response = await GetAllFollowArtist();
          if (response.success) {
            set({ followArtists: response.data });
          } else {
            set({ followArtists: [] });
          }
        } catch (error) {
          toast.error('Lỗi khi tải danh sách nghệ sĩ theo dõi: ' + error.message);
        }
      },
      fetchFollowUsers: async () => {
        try {
          const response = await GetAllFollowUser();
          if (response.success) {
            set({ followUsers: response.data });
          } else {
            set({ followUsers: [] });
          }
        } catch (error) {
          toast.error('Lỗi khi tải danh sách người dùng theo dõi: ' + error.message);
        }
      },
      clearFollowData: () => set({ followArtists: [], followUsers: [] }),
    }),
    {
      name: "follow-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        console.log("Follow store rehydrated");
      }
    }
  )
)