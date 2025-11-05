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
  playlistTracksPlaying: any[];
  myPlaylists: any[];
  queue: any[];

  // state không lưu
  isLastIndex: boolean;
  isPlaying: boolean;
  tabBarHeight: number;

  volume: number;
  currentTime: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isLoading: boolean;
  isMiniPlayerVisible: boolean;

  // basic actions
  setCurrentTrack: (track: any) => void;
  setPlaylistTracks: (tracks: any[]) => void;
  setCurrentPlaylist: (playlist: any) => void;
  setPlaylistTracksPlaying: (tracks: any[]) => void;
  setMyPlaylists: (playlists: any[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackPosition: (position: number) => void;
  setTabBarHeight: (height: number) => void;
  setQueue: (tracks: any[]) => void;
  setMiniPlayerVisible: (visible: boolean) => void;
  setDuration: (duration: number) => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;

  // playlst
  addToMyPlaylists: (playlist: any) => void;
  addTrackToPlaylist: (track: any) => void;
  updateCurrentTrack: (track: any) => void;
  updateCurrentPlaylist: (playlist: any) => void;
  updateTotalTracksInCurrentPlaylist: (total: number) => void;
  updateTotalTracksInMyPlaylists: (playlistId: string, total: number) => void;
  updateSharedCountPlaylist: (playlistId: string) => void;
  updateMyPlaylists: (playlist: any) => void;
  updatePrivacy: (playlistId: boolean) => void;
  removeFromMyPlaylists: (playlistId: string) => void;
  removeTrackFromPlaylist: (trackId: string) => void;

  // play actions
  playTrack: (track: any) => void;
  playPlaylist: (tracks: any[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;

  // queue actions
  addTrackToQueue: (tracks: any[]) => void;
  shuffleQueue: () => void;
  unShuffleQueue: () => void;
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
      playlistTracksPlaying: [],
      myPlaylists: [],
      currentIndex: -1,
      playbackPosition: 0,
      tabBarHeight: 0,
      queue: [],

      isLastIndex: false,
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
          isLastIndex: index === playlistTracks.length - 1,
        });
      },
      setCurrentPlaylist: (playlist) => {
        set({ currentPlaylist: playlist });
      },
      setPlaylistTracksPlaying: (tracks) => {
        set({ playlistTracksPlaying: tracks });
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
      updateCurrentTrack: (track) => {
        set({ currentTrack: track });
      },
      updateCurrentPlaylist: (playlist) => {
        set({ currentPlaylist: playlist });
        // also update in myPlaylists
        const { myPlaylists } = get();
        const updatedPlaylists = myPlaylists.map(p => p.spotifyId === playlist.spotifyId ? playlist : p);
        set({ myPlaylists: updatedPlaylists });
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
      updateSharedCountPlaylist: (playlistId) => {
        const { myPlaylists } = get();
        const updatedPlaylists = myPlaylists.map(p => {
          if (p.id === playlistId) {
            return {
              ...p,
              sharedCount: (p.sharedCount || 0) + 1,
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
      updatePrivacy: (playlistId) => {
        const { currentPlaylist, myPlaylists } = get();
        if (currentPlaylist && currentPlaylist.id === playlistId) {
          set({
            currentPlaylist: {
              ...currentPlaylist,
              isPublic: !currentPlaylist.isPublic,
            }
          });
        }
        const updatedPlaylists = myPlaylists.map(p => {
          if (p.id === playlistId) {
            return {
              ...p,
              isPublic: !p.isPublic,
            };
          }
          return p;
        });
        set({ myPlaylists: updatedPlaylists });
      },
      removeFromMyPlaylists: (playlistId) => {
        const { myPlaylists } = get();
        const newPlaylists = myPlaylists.filter(p => p.id !== playlistId);
        set({ myPlaylists: newPlaylists });
      },
      removeTrackFromPlaylist: (playlistTrackId) => {
        const { playlistTracks } = get();
        const newTracks = playlistTracks.filter(t => t.playlistTrack.id !== playlistTrackId);
        set({ playlistTracks: newTracks });
      },
      playPlaylist: (tracks, startIndex = 0) =>
        set({
          playlistTracksPlaying: tracks,
          currentIndex: startIndex,
          currentTrack: tracks[startIndex],
          isPlaying: true,
          playbackPosition: 0,
          isLastIndex: startIndex === tracks.length - 1,
        }),
      playTrack: (track) =>
        set({
          playlistTracksPlaying: [track],
          currentIndex: 0,
          currentTrack: track,
          isPlaying: true,
          playbackPosition: 0,
          queue: [],
        }),

      playNext: () => {
        const { queue, playlistTracksPlaying, currentIndex } = get();
        if (playlistTracksPlaying.length === 0) return;
        if (queue.length === 0) {
          set({
            currentTrack: playlistTracksPlaying[0],
            currentIndex: 0,
            isPlaying: true,
            playbackPosition: 0,
            queue: playlistTracksPlaying.filter(t => t.id !== playlistTracksPlaying[0].id),
            isLastIndex: false,
          });
        } else {
          const nextIndex = (currentIndex + 1) % playlistTracksPlaying.length;
          set({
            currentIndex: nextIndex,
            currentTrack: playlistTracksPlaying[nextIndex],
            isPlaying: true,
            playbackPosition: 0,
            queue: queue.filter(t => t.id !== playlistTracksPlaying[nextIndex].id),
            isLastIndex: nextIndex === playlistTracksPlaying.length - 1,
          });
        }
      },

      playPrevious: () => {
        const { playlistTracksPlaying, currentIndex } = get();
        if (playlistTracksPlaying.length === 0) return;
        const prevIndex = (currentIndex - 1 + playlistTracksPlaying.length) % playlistTracksPlaying.length;
        if (prevIndex < 0 || prevIndex >= playlistTracksPlaying.length) return;
        if (currentIndex === 0) return;
        set({
          currentIndex: prevIndex,
          currentTrack: playlistTracksPlaying[prevIndex],
          isPlaying: true,
          playbackPosition: 0,
          queue: playlistTracksPlaying.filter((_, index) => index > prevIndex),
          isLastIndex: false,
        });
      },
      setDuration: (duration) => {
        set({ duration });
      },
      setRepeatMode: (mode) => {
        set({ repeatMode: mode });
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
      shuffleQueue: () => {
        /* Trộn cả playlist bao gồm các bài đã phát */
        const { playlistTracksPlaying, currentTrack, currentIndex } = get();
        if (!currentTrack) return;
        const originalCurrentIndex = playlistTracksPlaying.findIndex(t => t.id === currentTrack.id);
        const pastAndCurrent = playlistTracksPlaying.slice(0, originalCurrentIndex + 1);
        const upcoming = playlistTracksPlaying.slice(originalCurrentIndex + 1);

        for (let i = upcoming.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [upcoming[i], upcoming[j]] = [upcoming[j], upcoming[i]];
        }
        set({
          queue: [...pastAndCurrent, ...upcoming],
          isShuffled: true,
          currentIndex: originalCurrentIndex
        });
      },
      unShuffleQueue: () => {
        const { playlistTracksPlaying, currentTrack } = get();
        if (!currentTrack) return;
        const newCurrentIndex = playlistTracksPlaying.findIndex(t => t.id === currentTrack.id);
        set({
          queue: playlistTracksPlaying.filter((_, index) => index > newCurrentIndex),
          isShuffled: false,
          currentIndex: newCurrentIndex
        });
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
