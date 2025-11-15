import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';

interface PlayerState {
  // state lưu
  currentTrack: any | null;
  currentPlaylist: any | null;
  currentIndex: number;
  currentAlbum: any | null;
  playbackPosition: number;
  listTrack: any[];
  playlistTracksPlaying: any[];
  myPlaylists: any[];
  queue: any[];

  // state không lưu
  isLastIndex: boolean;
  isPlaying: boolean;
  tabBarHeight: number;
  seekTrigger: number | null;
  targetSeekMs?: number | null;

  volume: number;
  currentTime: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isLoading: boolean;
  isMiniPlayerVisible: boolean;
  uiOverlayOpen: boolean;

  // basic actions
  setCurrentTrack: (track: any) => void;
  setCurrentPlaylist: (playlist: any) => void;
  setCurrentAlbum: (album: any) => void;
  setListTrack: (tracks: any[]) => void;
  setPlaylistTracksPlaying: (tracks: any[]) => void;
  setMyPlaylists: (playlists: any[]) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackPosition: (position: number) => void;
  setTabBarHeight: (height: number) => void;
  setQueue: (tracks: any[]) => void;
  setMiniPlayerVisible: (visible: boolean) => void;
  setDuration: (duration: number) => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  setIsShuffled: (shuffled: boolean) => void;

  // playlst
  addToMyPlaylists: (playlist: any) => void;
  addTrackToPlaylist: (track: any) => void;
  updateCurrentTrack: (track: any) => void;
  updateTrack: (track: any) => void;
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
  playTrackFromQueue: (track: any) => void;

  // queue actions
  addTrackToQueue: (tracks: any[]) => void;
  shuffleQueue: () => void;
  unShuffleQueue: () => void;
  removeTrackFromQueue: (tracks: any[]) => void;
  clearQueue: () => void;
  clearPlayerStore: () => void;
  setTargetSeekMs?: (ms: number | null) => void;
  setUiOverlayOpen?: (open: boolean) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // === STATE ===
      listTrack: [],
      playlistTracksPlaying: [],
      myPlaylists: [],
      queue: [],
      volume: 1,
      currentIndex: -1,
      playbackPosition: 0,
      tabBarHeight: 0,
      currentTime: 0,
      duration: 0,
      currentTrack: null,
      currentPlaylist: null,
      currentAlbum: null,
      seekTrigger: null,
      targetSeekMs: null,
      isLastIndex: false,
      isPlaying: false,
      isShuffled: false,
      isLoading: false,
      isMiniPlayerVisible: false,
      uiOverlayOpen: false,
      repeatMode: 'none',

      // === BASIC ACTIONS ===
      setCurrentTrack: (track) => {
        const { listTrack } = get();
        const index = listTrack.findIndex(s => s?.id === track?.id) || -1;
        set({
          currentTrack: track,
          currentIndex: index !== -1 ? index : -1,
          currentTime: 0,
          seekTrigger: Date.now(),
          playbackPosition: 0,
          isLastIndex: index === listTrack?.length - 1,
        });
      },
      setCurrentPlaylist: (playlist) => {
        set({ currentPlaylist: playlist });
      },
      setCurrentAlbum: (album) => {
        set({ currentAlbum: album });
      },
      setPlaylistTracksPlaying: (tracks) => {
        set({ playlistTracksPlaying: tracks });
      },
      setMyPlaylists: (playlists) => {
        set({ myPlaylists: playlists });
      },
      setListTrack: (tracks) => {
        set({ listTrack: tracks });
      },
      setQueue: (tracks) => {
        set({ queue: tracks });
      },
      addToMyPlaylists: (playlist) => {
        const { myPlaylists } = get();
        const existingIndex = myPlaylists.findIndex(p => p?.id === playlist?.id);
        if (existingIndex !== -1) return;
        set({ myPlaylists: [...myPlaylists, playlist] });
      },
      addTrackToPlaylist: (track) => {
        const { listTrack } = get();
        console.log('store: ', track);
        set({ listTrack: [...listTrack, track] });
      },
      updateCurrentTrack: (track) => {
        set({ currentTrack: track });
      },
      updateTrack: (track) => {
        const { listTrack } = get();
        const updatedTracks = listTrack.map(t => t.spotifyId === track.spotifyId ? track : t);
        set({ listTrack: updatedTracks });
      },
      updateCurrentPlaylist: (playlist) => {
        set({ currentPlaylist: playlist });
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
          if (p?.id === playlistId) {
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
          if (p?.id === playlistId) {
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
        const updatedPlaylists = myPlaylists.map(p => p?.id === playlist?.id ? playlist : p);
        set({ myPlaylists: updatedPlaylists });
      },
      updatePrivacy: (playlistId) => {
        const { currentPlaylist, myPlaylists } = get();
        if (currentPlaylist && currentPlaylist?.id === playlistId) {
          set({
            currentPlaylist: {
              ...currentPlaylist,
              isPublic: !currentPlaylist.isPublic,
            }
          });
        }
        const updatedPlaylists = myPlaylists.map(p => {
          if (p?.id === playlistId) {
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
        const newPlaylists = myPlaylists.filter(p => p?.id !== playlistId);
        set({ myPlaylists: newPlaylists });
      },
      removeTrackFromPlaylist: (playlistTrackId) => {
        const { listTrack } = get();
        const newTracks = listTrack.filter(t => t.playlistTrack?.id !== playlistTrackId);
        set({ listTrack: newTracks });
      },
      playPlaylist: (tracks, startIndex = 0) =>
        set({
          playlistTracksPlaying: tracks,
          currentIndex: startIndex,
          currentTrack: tracks[startIndex],
          isPlaying: true,
          playbackPosition: 0,
          seekTrigger: Date.now(),
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
        const { queue, playlistTracksPlaying, currentIndex, isShuffled, repeatMode } = get();
        if (playlistTracksPlaying.length === 0) return;

        if (isShuffled) {
          if (queue.length > 0) {
            const nextTrack = queue[0];
            const newQueue = queue.slice(1);
            // Tìm index của track mới trong playlist GỐC
            const newCurrentIndex = playlistTracksPlaying.findIndex(t =>
              (t.spotifyId && t.spotifyId === nextTrack.spotifyId) || (t?.id && t?.id === nextTrack?.id)
            );

            set({
              currentTrack: nextTrack,
              queue: newQueue,
              currentIndex: newCurrentIndex !== -1 ? newCurrentIndex : 0,
              isPlaying: true,
              playbackPosition: 0,
              seekTrigger: Date.now(),
              isLastIndex: newQueue.length === 0,
            });
          } else {
            // Hàng đợi shuffle đã hết
            if (repeatMode === 'all') {
              // Nếu lặp lại tất cả, xáo trộn lại toàn bộ
              const { currentTrack } = get();
              const otherTracks = playlistTracksPlaying.filter(t =>
                (t.spotifyId ? t.spotifyId !== currentTrack?.spotifyId : t?.id !== currentTrack?.id)
              );
              for (let i = otherTracks.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
              }

              if (otherTracks.length > 0) {
                const nextTrack = otherTracks[0];
                const newQueue = otherTracks.slice(1);
                const newCurrentIndex = playlistTracksPlaying.findIndex(t =>
                  (t.spotifyId && t.spotifyId === nextTrack.spotifyId) || (t?.id && t?.id === nextTrack?.id)
                );
                set({
                  currentTrack: nextTrack,
                  queue: newQueue,
                  currentIndex: newCurrentIndex !== -1 ? newCurrentIndex : 0,
                  isPlaying: true,
                  playbackPosition: 0,
                  seekTrigger: Date.now(),
                  isLastIndex: newQueue.length === 0,
                });
              }
            } else {
              set({ isPlaying: false, isLastIndex: true });
            }
          }
        } else {
          const nextIndex = currentIndex + 1;

          if (nextIndex >= playlistTracksPlaying.length) {
            // Đã đến cuối danh sách
            if (repeatMode === 'all') {
              const nextTrack = playlistTracksPlaying[0];
              set({
                currentTrack: nextTrack,
                currentIndex: 0,
                queue: playlistTracksPlaying.slice(1), // Đặt lại queue
                isPlaying: true,
                playbackPosition: 0,
                seekTrigger: Date.now(),
                isLastIndex: playlistTracksPlaying.length === 1,
              });
            } else {
              set({ isPlaying: false, isLastIndex: true });
            }
          } else {
            // Phát bài tiếp theo bình thường
            const nextTrack = playlistTracksPlaying[nextIndex];
            set({
              currentTrack: nextTrack,
              currentIndex: nextIndex,
              queue: playlistTracksPlaying.slice(nextIndex + 1), // Đặt lại queue
              isPlaying: true,
              playbackPosition: 0,
              seekTrigger: Date.now(),
              isLastIndex: nextIndex === playlistTracksPlaying.length - 1,
            });
          }
        }
      },
      playPrevious: () => {
        const { playlistTracksPlaying, currentIndex, isShuffled } = get();
        if (playlistTracksPlaying.length === 0) return;

        // Logic 'previous' chỉ hoạt động dựa trên thứ tự playlist gốc
        const prevIndex = currentIndex - 1;

        // (Logic ở SongScreen sẽ handle việc seekTo(0) nếu currentIndex === 0)
        if (prevIndex < 0) return;

        const prevTrack = playlistTracksPlaying[prevIndex];
        let newQueue = [];

        if (isShuffled) {
          // Nếu đang shuffle, việc nhấn 'previous' không nên thay đổi hàng đợi đã shuffle
          // Chúng ta chỉ phát bài hát trước đó từ playlist gốc
          const { queue } = get();
          newQueue = queue;
        } else {
          // Nếu không shuffle, đặt lại hàng đợi là tất cả các bài sau bài mới
          newQueue = playlistTracksPlaying.slice(prevIndex + 1);
        }

        set({
          currentIndex: prevIndex,
          currentTrack: prevTrack,
          isPlaying: true,
          playbackPosition: 0,
          seekTrigger: Date.now(),
          queue: newQueue,
          isLastIndex: false,
        });
      },
      playTrackFromQueue: (track) => {
        const { queue, playlistTracksPlaying, isShuffled } = get();

        // Tìm vị trí của track được nhấn trong 'queue' HIỆN TẠI
        const trackIndexInQueue = queue.findIndex(t =>
          (t?.spotifyId && t?.spotifyId === track?.spotifyId) || (t?.id && t?.id === track?.id)
        );

        let newQueue = [];
        if (trackIndexInQueue !== -1) {
          // Nếu tìm thấy, 'queue' mới là tất cả các bài sau nó
          newQueue = queue.slice(trackIndexInQueue + 1);
        } else {
          // Không tìm thấy (lỗi hiếm gặp), fallback:
          if (isShuffled) {
            newQueue = queue; // Giữ nguyên queue
          }
        }

        // Tìm index của track trong playlist GỐC để cập nhật currentIndex
        const newCurrentIndex = playlistTracksPlaying.findIndex(t =>
          (t?.spotifyId && t?.spotifyId === track?.spotifyId) || (t?.id && t?.id === track?.id)
        );

        set({
          currentTrack: track,
          currentIndex: newCurrentIndex !== -1 ? newCurrentIndex : 0,
          queue: newQueue,
          isPlaying: true,
          playbackPosition: 0,
          seekTrigger: Date.now(),
          isLastIndex: newQueue.length === 0,
        });
      },
      setDuration: (duration) => {
        set({ duration });
      },
      setRepeatMode: (mode) => {
        set({ repeatMode: mode });
      },
      setIsShuffled: (shuffled) => {
        set({ isShuffled: shuffled });
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
        const { playlistTracksPlaying, currentTrack } = get();

        if (!currentTrack) {
          console.log('Shuffle failed: No current track');
          return;
        }

        const otherTracks = playlistTracksPlaying.filter(t => {
          if (currentTrack?.spotifyId) {
            return t?.spotifyId !== currentTrack?.spotifyId;
          }
          return t?.id !== currentTrack?.id;
        });

        for (let i = otherTracks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
        }

        set({
          queue: otherTracks,
          isShuffled: true,
          currentIndex: 0
        });
      },
      unShuffleQueue: () => {
        const { playlistTracksPlaying, currentTrack } = get();
        if (!currentTrack) return;
        const newCurrentIndex = playlistTracksPlaying.findIndex(t => t?.id === currentTrack?.id);
        set({
          queue: playlistTracksPlaying.filter((_, index) => index > newCurrentIndex),
          isShuffled: false,
          currentIndex: newCurrentIndex
        });
      },
      removeTrackFromQueue: (tracks) => {
        const { queue } = get();
        const trackIdsToRemove = tracks.map(t => t?.id);
        const newQueue = queue.filter(t => !trackIdsToRemove.includes(t?.id));
        set({ queue: newQueue });
      },
      clearQueue: () => {
        set({ queue: [] });
      },
      setMiniPlayerVisible: (visible) => set({ isMiniPlayerVisible: visible }),
      clearPlayerStore: () => set({
        currentTrack: null,
        currentPlaylist: null,
        currentAlbum: null,
        listTrack: [],
        playlistTracksPlaying: [],
        myPlaylists: [],
        currentIndex: -1,
        playbackPosition: 0,
        tabBarHeight: 0,
        queue: [],
        seekTrigger: null,
        isLastIndex: false,
        isPlaying: false,
        volume: 1,
        currentTime: 0,
        duration: 0,
        isShuffled: false,
        repeatMode: 'none',
        isLoading: false,
        isMiniPlayerVisible: false,
        uiOverlayOpen: false,
        targetSeekMs: null,
      }),
      setTargetSeekMs: (ms: number | null) => set({ targetSeekMs: ms })
      , setUiOverlayOpen: (open: boolean) => set({ uiOverlayOpen: open })
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
        listTrack: state.listTrack,
        currentIndex: state.currentIndex,
        playbackPosition: state.playbackPosition,
        myPlaylists: state.myPlaylists,
      }),
    }
  )
);
