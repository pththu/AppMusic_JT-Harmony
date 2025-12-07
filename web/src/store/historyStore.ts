import { GetAllListenHistories, GetAllSearchHistories } from "@/services";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HistoryState {
  listenHistories: any[];
  searchHistories: any[];

  setListenHistories: (listenHistories: any[]) => void;
  setSearchHistories: (searchHistories: any[]) => void;

  fetchListenHistories: () => Promise<void>;
  fetchSearchHistories: () => Promise<void>;

  clearHistoryData: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      listenHistories: [],
      searchHistories: [],

      setListenHistories: (listenHistories) => set({ listenHistories }),
      setSearchHistories: (searchHistories) => set({ searchHistories }),

      fetchListenHistories: async () => {
        try {
          const response = await GetAllListenHistories();
          if (response.success) {
            set({ listenHistories: response.data });
          } else {
            set({ listenHistories: [] });
          }
        } catch (error) {
          toast.error('Lỗi khi tải lịch sử nghe: ' + error.message);
        }
      },
      fetchSearchHistories: async () => {
        try {
          const response = await GetAllSearchHistories();
          if (response.success) {
            set({ searchHistories: response.data });
          } else {
            set({ searchHistories: [] });
          }
        } catch (error) {
          toast.error('Lỗi khi tải lịch sử tìm kiếm: ' + error.message);
        }
      },
      clearHistoryData: () => set({ listenHistories: [], searchHistories: [] }),
    }),
    {
      name: "history-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        console.log("History store rehydrated");
      }
    }
  )
);