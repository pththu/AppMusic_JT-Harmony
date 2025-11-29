import { GetAllArtist } from "@/services/followApi";
import { GetAllAlbum, GetAllPlaylist, GetAllTrack } from "@/services/musicApi";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface MusicState {
  tracks: any[];
  playlists: any[];
  albums: any[];
  artists: any[];
  setTracks: (tracks: any[]) => void;
  setPlaylists: (playlists: any[]) => void;
  setAlbums: (albums: any[]) => void;
  setArtists: (artists: any[]) => void;

  fetchTracks: () => Promise<void>;
  fetchPlaylists: () => Promise<void>;
  fetchAlbums: () => Promise<void>;
  fetchArtists: () => Promise<void>;

  clearMusicData: () => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      tracks: [],
      playlists: [],
      albums: [],
      artists: [],

      setTracks: (tracks) => set({ tracks }),
      setPlaylists: (playlists) => set({ playlists }),
      setAlbums: (albums) => set({ albums }),
      setArtists: (artists) => set({ artists }),

      fetchTracks: async () => {
        try {
          const response = await GetAllTrack();
          if (response.success) {
            set({ tracks: response.data });
          } else {
            set({ tracks: [] });
          }
        } catch (err) {
          toast.error('Lỗi khi tải danh sách bài hát: ' + err.message);
        }
      },
      fetchPlaylists: async () => {
        try {
          const response = await GetAllPlaylist();
          if (response.success) {
            set({ playlists: response.data });
          } else {
            set({ playlists: [] });
          }
        } catch (err) {
          toast.error('Lỗi khi tải danh sách playlist: ' + err.message);
        }
      },
      fetchAlbums: async () => {
        try {
          const response = await GetAllAlbum();
          if (response.success) {
            set({ albums: response.data });
          } else {
            set({ albums: [] });
          }
        } catch (err) {
          toast.error('Lỗi khi tải danh sách album: ' + err.message);
        }
      },
      fetchArtists: async () => {
        try {
          const response = await GetAllArtist();
          console.log(response.data.slice(0, 3))
          if (response.success) {
            set({ artists: response.data });
          } else {
            set({ artists: [] });
          }
        } catch (err) {
          toast.error('Lỗi khi tải danh sách nghệ sĩ: ' + err.message);
        }
      },
      clearMusicData: () => set({ tracks: [], playlists: [], albums: [], artists: [] }),
    }),
    {
      name: "music-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        console.log("Music store rehydrated");
      }
    }
  )
)