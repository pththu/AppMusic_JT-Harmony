import { create } from "zustand";

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
}

interface PlayerState {
  currentSong: Song | null;
  setCurrentSong: (song: Song) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  setCurrentSong: (song) => set({ currentSong: song }),
}));
