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
  userFollowees: any[];
  userFollowers: any[];

  setIsFollowing: (following: boolean) => void;
  toggleFollow: (boolean) => void;
  // artist follow
  setArtistFollowed: (artists: any[]) => void;
  setCurrentArtist: (artist: any) => void;
  setPopularTracks: (tracks: any[]) => void;
  setAlbums: (albums: any[]) => void;
  addArtistFollowed: (artist: any) => void;
  removeArtistFollowed: (followId: number) => void;

  // user follow
  setFollowers: (followers: any[]) => void; // danh sách người theo dõi mình
  setFollowees: (users: any[]) => void; // danh sách người mình theo dõi
  addFollower: (follower: any) => void; // thêm vào danh sách người theo dõi mình
  addFollowee: (followee: any) => void; // thêm vào danh sách người mình theo dõi
  removeFollower: (followId: any) => void; // xóa khỏi danh sách người theo dõi mình
  removeFollowee: (followId: any) => void; // xóa khỏi danh sách người mình theo dõi

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
      userFollowees: [],
      userFollowers: [],

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
      setFollowees: (users) => set({ userFollowees: users }),
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
      addFollowee: (followee) => {
        set((state) => ({
          userFollowees: [...state.userFollowees, followee],
        }))
      },
      removeFollowee: (followId) => set((state) => ({
        userFollowees: state.userFollowees.filter(f => f.id !== followId),
      })),
      clearFollowStore: () => set({
        currentArtist: null,
        isFollowing: false,
        popularTracks: [],
        albums: [],
        followers: [],
        artistFollowed: [],
        userFollowees: [],
        userFollowers: [],
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