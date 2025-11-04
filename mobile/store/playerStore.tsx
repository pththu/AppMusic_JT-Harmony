import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface PlayerState {
  // state lưu
  currentTrack: any | null;
  currentPlaylist: any | null;
  currentIndex: number;
  playbackPosition: number;
  playlistTracks: any[];
  myPlaylists: any[];
  queue: any[];

  // state không lưu
  isPlaying: boolean;
  tabBarHeight: number;

  volume: number;
  currentTime: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isLoading: boolean;
  isMiniPlayerVisible: boolean;

  setCurrentTrack: (track: any) => void;
  setPlaylistTracks: (tracks: any[]) => void;
  setCurrentPlaylist: (playlist: any) => void;
  setMyPlaylists: (playlists: any[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackPosition: (position: number) => void;
  setTabBarHeight: (height: number) => void;
  setQueue: (tracks: any[]) => void;
  setMiniPlayerVisible: (visible: boolean) => void;
  setDuration: (duration: number) => void;

  addToMyPlaylists: (playlist: any) => void;
  addTrackToPlaylist: (track: any) => void;
  updateCurrentPlaylist: (playlist: any) => void;
  updateTotalTracksInCurrentPlaylist: (total: number) => void;
  updateTotalTracksInMyPlaylists: (playlistId: string, total: number) => void;
  updateMyPlaylists: (playlist: any) => void;
  removeFromMyPlaylists: (playlistId: string) => void;

  playTrack: (track: any) => void;
  playPlaylist: (tracks: any[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;

  addTrackToQueue: (tracks: any[]) => void;
  removeTrackFromQueue: (tracks: any[]) => void;
  clearQueue: () => void;
  clear: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // === STATE ===
      currentTrack: null,
      playlistTracks: [],
      currentPlaylist: null,
      myPlaylists: [],
      currentIndex: -1,
      playbackPosition: 0,
      tabBarHeight: 0,
      queue: [],

      isPlaying: false,
      volume: 1,
      currentTime: 0,
      duration: 0,
      isShuffled: false,
      repeatMode: 'none',
      isLoading: false,
      isMiniPlayerVisible: false,

      // === BASIC ACTIONS ===
      setCurrentTrack: (track) => {
        const { playlistTracks } = get();
        const index = playlistTracks.findIndex(s => s.id === track.id);
        set({
          currentTrack: track,
          currentIndex: index !== -1 ? index : -1,
          currentTime: 0,
        });
      },
      setCurrentPlaylist: (playlist) => {
        set({ currentPlaylist: playlist });
      },
      setMyPlaylists: (playlists) => {
        set({ myPlaylists: playlists });
      },
      setPlaylistTracks: (tracks) => {
        set({ playlistTracks: tracks });
      },
      setQueue: (tracks) => {
        set({ queue: tracks });
      },
      addToMyPlaylists: (playlist) => {
        const { myPlaylists } = get();
        const existingIndex = myPlaylists.findIndex(p => p.id === playlist.id);
        if (existingIndex !== -1) return;
        set({ myPlaylists: [...myPlaylists, playlist] });
      },
      addTrackToPlaylist: (track) => {
        const { playlistTracks } = get();
        set({ playlistTracks: [...playlistTracks, track] });
      },
      updateCurrentPlaylist: (playlist) => {
        set({ currentPlaylist: playlist });
      },
      updateTotalTracksInCurrentPlaylist: (total) => {
        const { currentPlaylist } = get();
        if (currentPlaylist) {
          set({
            currentPlaylist: {
              ...currentPlaylist,
              totalTracks: currentPlaylist.totalTracks + total,
            }
          });
        }
      },
      updateTotalTracksInMyPlaylists: (playlistId, total) => {
        const { myPlaylists } = get();
        const updatedPlaylists = myPlaylists.map(p => {
          console.log(p, playlistId);
          if (p.id === playlistId) {
            return {
              ...p,
              totalTracks: p.totalTracks + total,
            };
          }
          return p;
        });
        set({ myPlaylists: updatedPlaylists });
      },
      updateMyPlaylists: (playlist) => {
        const { myPlaylists } = get();
        const updatedPlaylists = myPlaylists.map(p => p.id === playlist.id ? playlist : p);
        set({ myPlaylists: updatedPlaylists });
      },
      removeFromMyPlaylists: (playlistId) => {
        const { myPlaylists } = get();
        const newPlaylists = myPlaylists.filter(p => p.id !== playlistId);
        set({ myPlaylists: newPlaylists });
      },
      playPlaylist: (tracks, startIndex = 0) =>
        set({
          playlistTracks: tracks,
          currentIndex: startIndex,
          currentTrack: tracks[startIndex],
          isPlaying: true,
          playbackPosition: 0,
        }),

      playTrack: (track) =>
        set({
          playlistTracks: [track],
          currentIndex: 0,
          currentTrack: track,
          isPlaying: true,
          playbackPosition: 0,
        }),

      playNext: () => {
        const { playlistTracks, currentIndex } = get();
        if (playlistTracks.length === 0) return;
        const nextIndex = (currentIndex + 1) % playlistTracks.length;
        set({
          currentIndex: nextIndex,
          currentTrack: playlistTracks[nextIndex],
          isPlaying: true,
          playbackPosition: 0,
        });
      },

      playPrevious: () => {
        const { playlistTracks, currentIndex } = get();
        if (playlistTracks.length === 0) return;
        const prevIndex = (currentIndex - 1 + playlistTracks.length) % playlistTracks.length;
        set({
          currentIndex: prevIndex,
          currentTrack: playlistTracks[prevIndex],
          isPlaying: true,
          playbackPosition: 0,
        });
      },
      setDuration: (duration) => {
        set({ duration });
      },
      // Dùng cho nút play/pause ở SongScreen, MiniPlayer
      togglePlayPause: () => {
        set((state) => ({ isPlaying: !state.isPlaying }))
      },
      // Dùng cho YoutubePlayer component
      setIsPlaying: (playing) => {
        set({ isPlaying: playing })
      },
      setPlaybackPosition: (position) => {
        set({ playbackPosition: position })
      },
      // Dùng cho TabBar
      setTabBarHeight: (height) => {
        set({ tabBarHeight: height })
      },
      addTrackToQueue: (tracks) => {
        const { queue } = get();
        set({ queue: [...queue, ...tracks] });
      },
      removeTrackFromQueue: (tracks) => {
        const { queue } = get();
        const trackIdsToRemove = tracks.map(t => t.id);
        const newQueue = queue.filter(t => !trackIdsToRemove.includes(t.id));
        set({ queue: newQueue });
      },
      clearQueue: () => {
        set({ queue: [] });
      },
      setMiniPlayerVisible: (visible) => set({ isMiniPlayerVisible: visible }),
      clear: () => set({
        currentTrack: null,
        isPlaying: false,
        currentIndex: -1,
        playbackPosition: 0,
        playlistTracks: [],
        currentPlaylist: null,
        myPlaylists: [],
        tabBarHeight: 0,
        queue: [],
        volume: 1,
        currentTime: 0,
        duration: 0,
        isShuffled: false,
        repeatMode: 'none',
        isLoading: false,
        isMiniPlayerVisible: false,
      }),
    }),

    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // gọi khi load từ AsyncStorage xong
        console.log("✅ Player store rehydrated");
      },
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        playlistTracks: state.playlistTracks,
        currentIndex: state.currentIndex,
        playbackPosition: state.playbackPosition,
        myPlaylists: state.myPlaylists,
      }),
    }
  )
);
