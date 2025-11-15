import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface HistoriesState {
  searchHistory: any[];
  listenHistory: any[];

  setSearchHistory: (history: any[]) => void;
  setListenHistory: (history: any[]) => void;

  addSearchHistory: (item: any) => void;
  addListenHistory: (item: any) => void;

  clearListenHistory: () => void;
  clearSearchHistory: () => void;
}

export const useHistoriesStore = create<HistoriesState>()(
  persist(
    (set, get) => ({
      searchHistory: [],
      listenHistory: [],
      setSearchHistory: (history) => set({ searchHistory: history }),
      setListenHistory: (history) => set({ listenHistory: history }),
      addSearchHistory: (item) => {
        const currentHistory = get().searchHistory;
        const updatedHistory = [item, ...currentHistory.filter(i => i !== item)];
        set({ searchHistory: updatedHistory });
      },
      addListenHistory: (item) => {
        const currentHistory = get().listenHistory;
        const updatedHistory = [item, ...currentHistory.filter(i => i.id !== item.id)];
        set({ listenHistory: updatedHistory });
      },
      clearListenHistory: () => set({ listenHistory: [] }),
      clearSearchHistory: () => set({ searchHistory: [] }),
    }),
    {
      name: 'histories-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)