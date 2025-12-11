import { GetAllAlbum, GetAllPlaylist, GetAllTrack, GetAllArtist, GetDataAnalyticsSearch, GetAllGenres } from "@/services";
import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface MusicState {
  tracks: any[];
  playlists: any[];
  albums: any[];
  artists: any[];
  topKeywords: any[];
  trendsOverTime: any[];
  genres: any[];

  setTracks: (tracks: any[]) => void;
  setPlaylists: (playlists: any[]) => void;
  setAlbums: (albums: any[]) => void;
  setArtists: (artists: any[]) => void;
  setGenres: (genres: any[]) => void;
  setTopKeywords: (topKeywords: any[]) => void;
  setTrendsOverTime: (trendsOverTime: any[]) => void;

  fetchTracks: () => Promise<void>;
  fetchPlaylists: () => Promise<void>;
  fetchAlbums: () => Promise<void>;
  fetchArtists: () => Promise<void>;
  fetchGenres: () => Promise<void>;
  fetchDataAnalyticsSearch: (searchHistories: any[]) => Promise<void>;

  clearMusicData: () => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      tracks: [],
      playlists: [],
      albums: [],
      artists: [],
      genres: [],
      topKeywords: [],
      trendsOverTime: [],

      setTracks: (tracks) => set({ tracks }),
      setPlaylists: (playlists) => set({ playlists }),
      setAlbums: (albums) => set({ albums }),
      setArtists: (artists) => set({ artists }),
      setGenres: (genres) => set({ genres }),
      setTopKeywords: (topKeywords) => set({ topKeywords }),
      setTrendsOverTime: (trendsOverTime) => set({ trendsOverTime }),

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
          if (response.success) {
            set({ artists: response.data });
          } else {
            set({ artists: [] });
          }
        } catch (err) {
          toast.error('Lỗi khi tải danh sách nghệ sĩ: ' + err.message);
        }
      },
      fetchGenres: async () => {
        try {
          const response = await GetAllGenres();
          if (response.success) {
            set({ genres: response.data });
          } else {
            set({ genres: [] });
          }
        } catch (error) {
          toast.error('Lỗi khi tải danh sách thể loại: ' + error.message);
        }
      },
      fetchDataAnalyticsSearch: async (searchHistories) => {
        try {
          const response = await GetDataAnalyticsSearch(searchHistories);
          if (response.success) {
            set({
              topKeywords: response.data.topKeywords,
              trendsOverTime: response.data.trendsOverTime
            });
          } else {
            set({ topKeywords: [], trendsOverTime: [] });
          }
        } catch (error) {
          toast.error('Lỗi khi tải dữ liệu phân tích tìm kiếm: ' + error.message);
        }
      },
      clearMusicData: () => set({
        tracks: [],
        playlists: [],
        albums: [],
        artists: [],
        topKeywords: [],
        trendsOverTime: [],
        genres: [],
      }),
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