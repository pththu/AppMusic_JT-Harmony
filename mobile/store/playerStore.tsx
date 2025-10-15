import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface Artist {
  name: string;
  image: string;
}

interface Song {
  id: string;
  title: string;
  artists: Artist[];
  image: string;
  album: string;
  itag: string;
  mimeType: string;
  bitrate: string;
  youtubeUrl: string;
  downloadUrl: string;
  fileUri: string;
}

interface PlayerState {
  // === STATE ===
  currentSong: Song | null;
  playlist: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isLoading: boolean;

  // === BASIC ACTIONS ===
  setCurrentSong: (song: Song) => void;
  setPlaylist: (songs: Song[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsLoading: (loading: boolean) => void;

  // === PLAYER ACTIONS ===
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;

  // === PLAYLIST ACTIONS ===
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (songId: string) => void;
  clearPlaylist: () => void;
  playFromPlaylist: (index: number) => void;

  // === CONTROL ACTIONS ===
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;

  // === HELPER FUNCTIONS ===
  getCurrentSongIndex: () => number;
  hasNextSong: () => boolean;
  hasPreviousSong: () => boolean;
  getPlaylistDuration: () => number;
  findSongInPlaylist: (songId: string) => Song | undefined;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // === STATE ===
      currentSong: null,
      playlist: [],
      currentIndex: -1,
      isPlaying: false,
      volume: 1,
      currentTime: 0,
      duration: 0,
      isShuffled: false,
      repeatMode: 'none',
      isLoading: false,

      // === BASIC ACTIONS ===
      setCurrentSong: (song) => {
        const { playlist } = get();
        const index = playlist.findIndex(s => s.id === song.id);

        set({
          currentSong: song,
          currentIndex: index !== -1 ? index : -1,
          currentTime: 0,
        });
      },

      setPlaylist: (songs) => {
        set({ playlist: songs });
      },

      setIsPlaying: (playing) => {
        set({ isPlaying: playing });
      },

      setVolume: (volume) => {
        // Clamp volume between 0 and 1
        const clampedVolume = Math.max(0, Math.min(1, volume));
        set({ volume: clampedVolume });
      },

      setCurrentTime: (time) => {
        set({ currentTime: Math.max(0, time) });
      },

      setDuration: (duration) => {
        set({ duration: Math.max(0, duration) });
      },

      setIsLoading: (loading) => {
        set({ isLoading: loading });
      },

      // === PLAYER ACTIONS ===
      play: () => {
        set({ isPlaying: true });
      },

      pause: () => {
        set({ isPlaying: false });
      },

      togglePlay: () => {
        const { isPlaying } = get();
        set({ isPlaying: !isPlaying });
      },

      nextSong: () => {
        const { playlist, currentIndex, isShuffled, repeatMode } = get();

        if (playlist.length === 0) return;

        let nextIndex = currentIndex;

        if (repeatMode === 'one') {
          // Repeat current song - don't change index
          return;
        }

        if (isShuffled) {
          // Random next song
          nextIndex = Math.floor(Math.random() * playlist.length);
        } else {
          nextIndex = currentIndex + 1;

          if (nextIndex >= playlist.length) {
            if (repeatMode === 'all') {
              nextIndex = 0; // Loop back to start
            } else {
              // End of playlist
              set({ isPlaying: false });
              return;
            }
          }
        }

        const nextSong = playlist[nextIndex];
        if (nextSong) {
          set({
            currentSong: nextSong,
            currentIndex: nextIndex,
            currentTime: 0,
          });
        }
      },

      previousSong: () => {
        const { playlist, currentIndex } = get();

        if (playlist.length === 0 || currentIndex <= 0) return;

        const prevIndex = currentIndex - 1;
        const prevSong = playlist[prevIndex];

        if (prevSong) {
          set({
            currentSong: prevSong,
            currentIndex: prevIndex,
            currentTime: 0,
          });
        }
      },

      seekTo: (time) => {
        const { duration } = get();
        const clampedTime = Math.max(0, Math.min(duration, time));
        set({ currentTime: clampedTime });
      },

      // === PLAYLIST ACTIONS ===
      addToPlaylist: (song) => {
        const { playlist } = get();

        // Check if song already exists
        const existingIndex = playlist.findIndex(s => s.id === song.id);
        if (existingIndex !== -1) return;

        set({ playlist: [...playlist, song] });
      },

      removeFromPlaylist: (songId) => {
        const { playlist, currentSong, currentIndex } = get();
        const newPlaylist = playlist.filter(song => song.id !== songId);

        // Update current index if needed
        let newCurrentIndex = currentIndex;
        if (currentSong?.id === songId) {
          // Removed current song
          set({
            currentSong: null,
            currentIndex: -1,
            isPlaying: false,
            playlist: newPlaylist,
          });
          return;
        } else if (currentIndex > -1) {
          // Recalculate index
          const newIndex = newPlaylist.findIndex(s => s.id === currentSong?.id);
          newCurrentIndex = newIndex;
        }

        set({
          playlist: newPlaylist,
          currentIndex: newCurrentIndex,
        });
      },

      clearPlaylist: () => {
        set({
          playlist: [],
          currentSong: null,
          currentIndex: -1,
          isPlaying: false,
          currentTime: 0,
        });
      },

      playFromPlaylist: (index) => {
        const { playlist } = get();

        if (index < 0 || index >= playlist.length) return;

        const song = playlist[index];
        set({
          currentSong: song,
          currentIndex: index,
          currentTime: 0,
          isPlaying: true,
        });
      },

      // === CONTROL ACTIONS ===
      toggleShuffle: () => {
        const { isShuffled } = get();
        set({ isShuffled: !isShuffled });
      },

      toggleRepeat: () => {
        const { repeatMode } = get();
        const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
        const currentModeIndex = modes.indexOf(repeatMode);
        const nextModeIndex = (currentModeIndex + 1) % modes.length;

        set({ repeatMode: modes[nextModeIndex] });
      },

      setRepeatMode: (mode) => {
        set({ repeatMode: mode });
      },

      // === HELPER FUNCTIONS ===
      getCurrentSongIndex: () => {
        const { currentIndex } = get();
        return currentIndex;
      },

      hasNextSong: () => {
        const { playlist, currentIndex, repeatMode } = get();

        if (repeatMode === 'one' || repeatMode === 'all') return true;

        return currentIndex < playlist.length - 1;
      },

      hasPreviousSong: () => {
        const { currentIndex } = get();
        return currentIndex > 0;
      },

      getPlaylistDuration: () => {
        const { playlist } = get();
        // This would need actual song durations
        return playlist.length * 180; // Assuming 3 minutes per song
      },

      findSongInPlaylist: (songId) => {
        const { playlist } = get();
        return playlist.find(song => song.id === songId);
      },
    }),
    {
      name: 'music-player-storage',
      storage: createJSONStorage(() => localStorage),

      // Only persist necessary data
      partialize: (state) => ({
        currentSong: state.currentSong,
        playlist: state.playlist,
        currentIndex: state.currentIndex,
        volume: state.volume,
        isShuffled: state.isShuffled,
        repeatMode: state.repeatMode,
      }),

      version: 1,
    }
  )
);
