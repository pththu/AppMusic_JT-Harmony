import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface PlayerState {
  // state lưu
  currentTrack: any | null;
  currentPlaylist: any | null;
  currentIndex: number;
  playbackPosition: number;
  playlist: any[];
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

  setCurrentTrack: (track: any) => void;
  setPlaylist: (tracks: any[]) => void;
  setCurrentPlaylist: (playlist: any) => void;
  setMyPlaylists: (playlists: any[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackPosition: (position: number) => void;
  setTabBarHeight: (height: number) => void;
  setQueue: (tracks: any[]) => void;

  addToMyPlaylists: (playlist: any) => void;
  updateCurrentPlaylist: (playlist: any) => void;
  updateMyPlaylist: (playlist: any) => void;
  removeFromMyPlaylists: (playlistId: string) => void;

  playTrack: (track: any) => void;
  playPlaylist: (tracks: any[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;

  addTrackToQueue: (tracks: any[]) => void;
  removeTrackFromQueue: (tracks: any[]) => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // === STATE ===
      currentTrack: null,
      playlist: [],
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

      // === BASIC ACTIONS ===
      setCurrentTrack: (track) => {
        const { playlist } = get();
        const index = playlist.findIndex(s => s.id === track.id);
        set({
          currentTrack: track,
          currentIndex: index !== -1 ? index : -1,
          currentTime: 0,
        });
      },
      setPlaylist: (songs) => {
        set({ playlist: songs });
      },
      setCurrentPlaylist: (playlist) => {
        set({ currentPlaylist: playlist });
      },
      setMyPlaylists: (playlists) => {
        set({ myPlaylists: playlists });
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
      updateCurrentPlaylist: (playlist) => {
        set({ currentPlaylist: playlist });
      },
      updateMyPlaylist: (playlist) => {
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
          playlist: tracks,
          currentIndex: startIndex,
          currentTrack: tracks[startIndex],
          isPlaying: true,
          playbackPosition: 0,
        }),

      playTrack: (track) =>
        set({
          playlist: [track],
          currentIndex: 0,
          currentTrack: track,
          isPlaying: true,
          playbackPosition: 0,
        }),

      playNext: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return;
        const nextIndex = (currentIndex + 1) % playlist.length;
        set({
          currentIndex: nextIndex,
          currentTrack: playlist[nextIndex],
          isPlaying: true,
          playbackPosition: 0,
        });
      },

      playPrevious: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return;
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        set({
          currentIndex: prevIndex,
          currentTrack: playlist[prevIndex],
          isPlaying: true,
          playbackPosition: 0,
        });
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
    }),

    {
      name: 'music-player-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        playlist: state.playlist,
        currentIndex: state.currentIndex,
        playbackPosition: state.playbackPosition,
        myPlaylist: state.myPlaylists,
      }),
      version: 1,
    }
  )
);
