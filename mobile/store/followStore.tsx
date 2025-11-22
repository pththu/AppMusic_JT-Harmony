import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface FollowState {
  currentArtist: any | null;
  isFollowing: boolean;
  popularTracks: any[];
  albums: any[];
  followers: any[];
  artistFollowed: any[];
  userFollowed: any[];

  setArtistFollowed: (artists: any[]) => void;
  setUserFollowed: (users: any[]) => void;
  setIsFollowing: (following: boolean) => void;
  setCurrentArtist: (artist: any) => void;
  setPopularTracks: (tracks: any[]) => void;
  setFollowers: (followers: any[]) => void;
  setAlbums: (albums: any[]) => void;
  addArtistFollowed: (artist: any) => void;
  removeArtistFollowed: (followId: number) => void;
  toggleFollow: (boolean) => void;
  addFollower: (follower: any) => void;
  removeFollower: (followId: any) => void;
  clearFollowStore: () => void;
}

export const useFollowStore = create<FollowState>()(
  persist(
    (set, get) => ({
      currentArtist: null,
      isFollowing: false,
      popularTracks: [],
      albums: [],
      artistFollowed: [],
      followers: [],
      userFollowed: [],

      setUserFollowed: (users) => set({ userFollowed: users }),
      setArtistFollowed: (artists) => set({ artistFollowed: artists }),
      addArtistFollowed: (artist) => {
        set((state) => ({
          artistFollowed: [...state.artistFollowed, artist],
        }))
      },
      removeArtistFollowed: (followId) => set((state) => ({
        artistFollowed: state.artistFollowed.filter(a => a.id !== followId),
      })),
      setCurrentArtist: (artist) => set({ currentArtist: artist }),
      setIsFollowing: (following) => set({ isFollowing: following }),
      setFollowers: (followers) => set({ followers: followers }),
      setPopularTracks: (tracks) => set({ popularTracks: tracks }),
      setAlbums: (albums) => set({ albums: albums }),
      toggleFollow: (following) => set({ isFollowing: following }),
      addFollower: (follower) => {
        set((state) => ({
          followers: [...state.followers, follower],
        }))
      },
      removeFollower: (followId) => set((state) => ({
        followers: state.followers.filter(f => f.id !== followId),
      })),
      clearFollowStore: () => set({
        currentArtist: null,
        isFollowing: false,
        popularTracks: [],
        albums: [],
        followers: [],
        artistFollowed: [],
      }),
    }),
    {
      name: 'follow-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log("Follow store rehydrated");
      }
    }
  )
)