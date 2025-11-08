import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favoriteItems: any[];
  setFavoriteItems: (items: any[]) => void;
  isFavorite: (itemType: string, itemId: number, itemSpotifyId: string) => boolean;
  addFavoriteItem: (item: any) => void;
  removeFavoriteItem: (item: any) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteItems: [],
      setFavoriteItems: (items) => set({ favoriteItems: items }),
      isFavorite: (itemType, itemId, itemSpotifyId) => {
        const { favoriteItems } = get();
        return favoriteItems.some(
          (item) => item.itemType === itemType && (item.itemId === itemId || item.itemSpotifyId === itemSpotifyId)
        );
      },
      addFavoriteItem: (item) => set((state) => ({ favoriteItems: [...state.favoriteItems, item] })),
      removeFavoriteItem: (item) => {
        const { favoriteItems } = get();
        const favoritesItemsUpdated = favoriteItems.filter(
          (favItem) => favItem.id !== item.id
        );
        set({ favoriteItems: favoritesItemsUpdated });
      },
      clearFavorites: () => set({ favoriteItems: [] }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // gọi khi load từ AsyncStorage xong
        console.log("✅ Favorites store rehydrated");
      }
    }
  )
);