import axiosClient from "@/config/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Tìm kiếm tracks với các tham số linh hoạt
 * @param payload - { trackName?, artist?, album?, genre?, limit? }
 * payload: {
  trackName?: string;
  artist?: string | string[];
  album?: string | string[];
  genre?: string | string[];
  limit?: number;
}
 */
export const SearchTracks = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/search-track`, payload);
    return response.data;
  } catch (error: any) {
    console.error("SearchTracks error:", error.message);
    throw error;
  }
};

/**
 * Tìm kiếm playlists
 * @param payload - { name, artist? }
 */
export const SearchPlaylists = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/search-playlist`, payload);
    return response.data;
  } catch (error: any) {
    console.error("SearchPlaylists error:", error.message);
    throw error;
  }
};

/**
 * Tìm kiếm albums
 * @param payload - { name, artist? }
 */
export const SearchAlbums = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/search-album`, payload);
    return response.data;
  } catch (error: any) {
    console.error("SearchAlbums error:", error.message);
    throw error;
  }
};

/**
 * Tìm kiếm artists
 * @param payload - { name }
 */
export const SearchArtists = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/search-artist`, payload);
    return response.data;
  } catch (error: any) {
    console.error("SearchArtists error:", error.message);
    throw error;
  }
};

/**
 * Tìm kiếm users (social feature)
 * @param query - search query string
 * username, fullName
 */
export const SearchUsers = async (payload) => {
  try {
    const response = await axiosClient.post(`/users/search-all`, payload);
    return response.data;
  } catch (error: any) {
    console.error("SearchUsers error:", error.message);
    throw error;
  }
};

/**
 * Tìm kiếm tổng hợp (All)
 * @param query - search query string
 * @param limit - số lượng kết quả mỗi loại
 */
export const SearchAll = async (query, limit = 10) => {
  try {
    const [tracks, playlists, albums, artists, users] = await Promise.allSettled([
      SearchTracks({ trackName: query, artist: query, limit }),
      SearchPlaylists({ name: query }),
      SearchAlbums({ name: query, artist: query }),
      SearchArtists({ name: query }),
      SearchUsers({ username: query, fullName: query, email: query }),
    ]);

    return {
      tracks: tracks.status === "fulfilled" ? tracks.value.data : [],
      playlists: playlists.status === "fulfilled" ? playlists.value.data : [],
      albums: albums.status === "fulfilled" ? albums.value.data : [],
      artists: artists.status === "fulfilled" ? artists.value.data : [],
      users: users.status === "fulfilled" ? users.value.data : [],
    };
  } catch (error: any) {
    console.error("SearchAll error:", error.message);
    throw error;
  }
};

/**
 * Lấy gợi ý tìm kiếm dựa trên query hiện tại
 * @param query - chuỗi query đang nhập
 */
export const GetSearchSuggestions = async (query: string) => {
  try {
    const response = await axiosClient.get(
      `/music/search-suggestions?q=${encodeURIComponent(query)}` // -> update endpoint sau
    );
    return response.data;
  } catch (error: any) {
    console.error("GetSearchSuggestions error:", error.message);
    return { data: [] };
  }
};

/**
 * Lưu lịch sử tìm kiếm
 * Có thể lưu local hoặc sync lên server
 */
export const SaveSearchHistory = async (query) => {
  try {
    const response = await axiosClient.post('/histories/search', { query });
    return response.data;
  } catch (error: any) {
    console.error("SaveSearchHistory error:", error.message);
    return { success: false };
  }
};

/**
 * Lấy danh sách items theo genre/category
 * @param category - tên category (TAMIL, POP, HIP-HOP, etc.)
 */
export const GetCategoryContent = async (category: string) => {
  try {
    const response = await axiosClient.get(
      `/music/category/${encodeURIComponent(category)}`
    );
    return response.data;
  } catch (error: any) {
    console.error("GetCategoryContent error:", error.message);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả genres
 */
export const GetAllGenres = async () => {
  try {
    const response = await axiosClient.get(`/genres`);
    return response.data;
  } catch (error: any) {
    console.error("GetAllGenres error:", error.message);
    throw error;
  }
};