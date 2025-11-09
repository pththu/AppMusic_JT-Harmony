import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface ArtistState {
  currentArtist: any | null;
  isFollowing: boolean;
  totalFollowers: number;
  popularTracks: any[];
  albums: any[];

  setIsFollowing: (following: boolean) => void;
  setCurrentArtist: (artist: any) => void;
  setTotalFollowers: (count: number) => void;
  setPopularTracks: (tracks: any[]) => void;
  setAlbums: (albums: any[]) => void;
  addFollower: () => void;
  removeFollower: () => void;
  clearArtistStore: () => void;
}

export const useArtistStore = create<ArtistState>()(
  persist(
    (set, get) => ({
      currentArtist: null,
      isFollowing: false,
      totalFollowers: 0,
      popularTracks: [],
      albums: [],

      setCurrentArtist: (artist) => set({ currentArtist: artist }),
      setIsFollowing: (following) => set({ isFollowing: following }),
      setTotalFollowers: (count) => set({ totalFollowers: count }),
      setPopularTracks: (tracks) => set({ popularTracks: tracks }),
      setAlbums: (albums) => set({ albums: albums }),
      addFollower: () => set((state) => ({ totalFollowers: state.totalFollowers + 1 })),
      removeFollower: () => set((state) => ({
        totalFollowers: state.totalFollowers > 0 ? state.totalFollowers - 1 : 0
      })),
      clearArtistStore: () => set({
        currentArtist: null,
        isFollowing: false,
        totalFollowers: 0,
        popularTracks: [],
        albums: [],
      }),
    }),
    {
      name: 'artist-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Perform any necessary actions after rehydrating the state
        }
      }
    }
  )
)