import { create } from "zustand";

interface QueueState {
  nowPlaying: any | null; // bạn có thể thay `any` = kiểu Song
  queue: any[];
  setNowPlaying: (song: any) => void;
  setQueue: (songs: any[]) => void;
  addToQueue: (song: any) => void;
  clearQueue: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  nowPlaying: null,
  queue: [],

  setNowPlaying: (song) => set({ nowPlaying: song }),
  setQueue: (songs) => set({ queue: songs }),
  addToQueue: (song) =>
    set((state) => ({ queue: [...state.queue, song] })),
  clearQueue: () => set({ queue: [] }),
}));
