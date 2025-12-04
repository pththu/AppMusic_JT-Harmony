import { GetAllFavoriteItems } from "@/services";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface favoritesState {
  favoriteTracks: any[];
  favoritePlaylists: any[];
  favoriteAlbums: any[];

  setFavoriteTracks: (favoriteTracks: any[]) => void;
  setFavoritePlaylists: (favoritePlaylists: any[]) => void;
  setFavoriteAlbums: (favoriteAlbums: any[]) => void;

  fetchFavoriteItems: () => Promise<void>;

  clearFavoritesData: () => void;
}

export const useFavoritesStore = create<favoritesState>()(
  persist(
    (set, get) => ({
      favoriteTracks: [],
      favoritePlaylists: [],
      favoriteAlbums: [],

      setFavoriteTracks: (favoriteTracks) => set({ favoriteTracks }),
      setFavoritePlaylists: (favoritePlaylists) => set({ favoritePlaylists }),
      setFavoriteAlbums: (favoriteAlbums) => set({ favoriteAlbums }),

      fetchFavoriteItems: async () => {
        try {
          const response = await GetAllFavoriteItems();
          if (response.success) {
            const favTracks = [];
            const favPlaylists = [];
            const favAlbums = [];

            for (const item of response.data) {
              if (item.itemType === 'track') {
                favTracks.push(item);
              } else if (item.itemType === 'playlist') {
                favPlaylists.push(item);
              } else if (item.itemType === 'album') {
                favAlbums.push(item);
              }
            }
            set({
              favoriteTracks: favTracks,
              favoritePlaylists: favPlaylists,
              favoriteAlbums: favAlbums,
            });
          } else {
            set({
              favoriteTracks: [],
              favoritePlaylists: [],
              favoriteAlbums: []
            });
          }
        } catch (error) {
          toast.error('Lỗi khi tải danh sách yêu thích: ' + error.message);
        }
      },
      clearFavoritesData: () => set({
        favoriteTracks: [],
        favoritePlaylists: [],
        favoriteAlbums: []
      }),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        console.log("Favorites store rehydrated");
      }
    }
  )
);