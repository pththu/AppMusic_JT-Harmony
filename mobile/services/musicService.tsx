import axiosClient from "@/config/axiosClient";

// get
export const GetPlaylistsForYou = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/playlist-for-you`, {
      playlistName: payload,
      limit: 3,
    });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

export const GetAlbumsForYou = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/album-for-you`, {
      albumName: payload,
      limit: 3,
    });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

export const GetArtistsForYou = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/artist-for-you`, {
      artistNames: payload.artistNames,
      genres: payload.genres,
      limit: 3,
    });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

export const GetTracksByPlaylistId = async (payload) => {
  try {
    const response = await axiosClient.post(`music/playlist/${payload.playlistId}/tracks`, {
      type: payload.type
    })
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
};

export const GetTracksByAlbumId = async (payload) => {
  try {
    const response = await axiosClient.get(`/music/album/${payload}/tracks`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const GetTopTracksOfArtist = async (payload) => {
  try {
    const response = await axiosClient.get(`/music/artist/${payload}/top-tracks`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const GetAlbumsOfArtist = async (payload) => {
  try {
    const response = await axiosClient.get(`/music/artist/${payload}/albums`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const GetMyPlaylists = async () => {
  try {
    const response = await axiosClient.get(`/music/mine/playlists`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const GetTracks = async (payload) => {
  try {
    console.log('payload: ', payload);
    const response = await axiosClient.post(`/music//search-track`, payload);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const GetVideoId = async (payload) => {
  try {
    const response = await axiosClient.get(`/music/track/${payload}/video-id`);
    console.log('tim video id', response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// add
export const AddTrackToPlaylist = async (payload) => {
  try {
    console.log('payload 1 api: ', payload);
    const response = await axiosClient.post(`/music/playlist/${payload.playlistId}/add-track`, {
      trackId: payload.trackId,
      trackSpotifyId: payload.trackSpotifyId
    });
    console.log('response add 1 api: ', response.data);
    return response.data;
  } catch (error) {
    console.log(error.message)
    throw error;
  }
};

export const AddTrackToPlaylistAfterConfirm = async (payload) => {
  try {
    console.log('payload 2 api: ', payload);
    const response = await axiosClient.post(`/music/playlist/${payload.playlistId}/add-track-confirm`, {
      trackId: payload.trackId,
      trackSpotifyId: payload.trackSpotifyId
    });
    console.log('response add 2 api: ', response.data);
    return response.data;
  } catch (error) {
    console.log(error.data);
    throw error;
  }
}

export const AddTracksToPlaylists = async (payload) => {
  try {
    console.log(payload);
    const response = await axiosClient.post(`/music/playlist/add-tracks`, {
      playlistIds: payload.playlistIds,
      trackIds: payload.trackSpotifyIds,
    })
    console.log('response add multiple api: ', response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

// create
export const CreatePlaylist = async (payload) => {
  try {
    const formData = new FormData();
    if (payload.image !== null) {
      const imageUri = payload.image;
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);
    }

    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("isPublic", payload.isPublic);

    const response = await axiosClient.post(`/playlists/new`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

// update
export const UpdatePlaylist = async (payload) => {
  try {
    const formData = new FormData();
    if (payload.image !== null) {
      const imageUri = payload.image;
      const filename = imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);
    }

    formData.append("id", payload.id);
    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("isPublic", payload.isPublic);

    const response = await axiosClient.put(`/playlists/update`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const SharePlaylist = async (payload) => {
  try {
    const response = await axiosClient.post(`/playlists/share`, {
      playlistId: payload.playlistId,
      playlistSpotifyId: payload.playlistSpotifyId
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const ShareTrack = async (payload) => {
  try {
    const response = await axiosClient.post(`/tracks/share`, {
      trackId: payload.trackId,
      trackSpotifyId: payload.trackSpotifyId
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const ShareAlbum = async (payload) => {
  try {
    console.log('payload', payload)
    const response = await axiosClient.post(`/albums/share`, {
      albumId: payload.albumId,
      albumSpotifyId: payload.albumSpotifyId
    });
    console.log('res: ', response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const UpdatePlaylistPrivacy = async (payload) => {
  try {
    const response = await axiosClient.put(`/playlists/${payload.playlistId}/update-privacy`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// delete
export const DeletePlaylist = async (playlistId) => {
  try {
    console.log("playlistId", playlistId);
    const response = await axiosClient.delete(`/playlists/${playlistId}`);
    console.log("response", response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const RemoveTrackFromPlaylist = async (payload) => {
  try {
    const response = await axiosClient.delete(`/music/playlist/${payload.playlistId}/remove-track/${payload.playlistTrackId}`);
    console.log('response remove track', response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// đang test
export const fetchTracks = async () => {
  try {
    const response = await axiosClient.get(`/music/tracks`);
    return response.data.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

// SEARCH APIs
// ============================================

/**
 * Tìm kiếm tracks với các tham số linh hoạt
 * @param payload - { trackName?, artist?, album?, genre?, limit? }
 */
export const SearchTracks = async (payload: {
  trackName?: string;
  artist?: string | string[];
  album?: string | string[];
  genre?: string | string[];
  limit?: number;
}) => {
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
export const SearchPlaylists = async (payload: {
  name: string;
  artist?: string | string[];
}) => {
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
export const SearchAlbums = async (payload: {
  name: string;
  artist?: string;
}) => {
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
export const SearchArtists = async (payload: { name: string }) => {
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
 */
export const SearchUsers = async (query: string) => {
  try {
    const response = await axiosClient.get(`/users/search?q=${encodeURIComponent(query)}`);
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
export const SearchAll = async (query: string, limit: number = 10) => {
  try {
    // Call song song tất cả các API
    const [tracks, playlists, albums, artists] = await Promise.allSettled([
      SearchTracks({ trackName: query, limit }),
      SearchPlaylists({ name: query }),
      SearchAlbums({ name: query }),
      SearchArtists({ name: query }),
    ]);

    return {
      tracks: tracks.status === "fulfilled" ? tracks.value.data : [],
      playlists: playlists.status === "fulfilled" ? playlists.value.data : [],
      albums: albums.status === "fulfilled" ? albums.value.data : [],
      artists: artists.status === "fulfilled" ? artists.value.data : [],
    };
  } catch (error: any) {
    console.error("SearchAll error:", error.message);
    throw error;
  }
};

// ============================================
// QUERY SUGGESTIONS
// ============================================

/**
 * Lấy gợi ý tìm kiếm dựa trên query hiện tại
 * @param query - chuỗi query đang nhập
 */
export const GetSearchSuggestions = async (query: string) => {
  try {
    // Có thể implement endpoint riêng cho suggestions
    // Hoặc dùng search nhanh với limit nhỏ
    const response = await axiosClient.get(
      `/music/search-suggestions?q=${encodeURIComponent(query)}`
    );
    return response.data;
  } catch (error: any) {
    console.error("GetSearchSuggestions error:", error.message);
    // Fallback: return empty array
    return { data: [] };
  }
};

// ============================================
// SEARCH HISTORY (Local Storage hoặc API)
// ============================================

/**
 * Lưu lịch sử tìm kiếm
 * Có thể lưu local hoặc sync lên server
 */
export const SaveSearchHistory = async (searchItem: {
  type: string;
  title: string;
  subtitle?: string;
}) => {
  try {
    // Option 1: Lưu vào AsyncStorage (local)
    // const history = await AsyncStorage.getItem('searchHistory');
    // const historyArray = history ? JSON.parse(history) : [];
    // historyArray.unshift(searchItem);
    // await AsyncStorage.setItem('searchHistory', JSON.stringify(historyArray.slice(0, 20)));

    // Option 2: Sync lên server (nếu cần)
    // await axiosClient.post('/users/search-history', searchItem);

    return { success: true };
  } catch (error: any) {
    console.error("SaveSearchHistory error:", error.message);
    return { success: false };
  }
};

/**
 * Lấy lịch sử tìm kiếm
 */
export const GetSearchHistory = async () => {
  try {
    // Option 1: Lấy từ AsyncStorage
    // const history = await AsyncStorage.getItem('searchHistory');
    // return history ? JSON.parse(history) : [];

    // Option 2: Lấy từ server
    // const response = await axiosClient.get('/users/search-history');
    // return response.data;

    return [];
  } catch (error: any) {
    console.error("GetSearchHistory error:", error.message);
    return [];
  }
};

/**
 * Xóa lịch sử tìm kiếm
 */
export const ClearSearchHistory = async () => {
  try {
    // Option 1: Xóa local
    // await AsyncStorage.removeItem('searchHistory');

    // Option 2: Xóa trên server
    // await axiosClient.delete('/users/search-history');

    return { success: true };
  } catch (error: any) {
    console.error("ClearSearchHistory error:", error.message);
    return { success: false };
  }
};

// ============================================
// GENRE/CATEGORY APIs
// ============================================

/**
 * Lấy danh sách items theo genre/category
 * @param category - tên category (TAMIL, POP, HIP-HOP, etc.)
 */
export const GetCategoryContent = async (category: string) => {
  try {
    const response = await axiosClient.get(
      `/music/category/${encodeURIComponent(category)}`
    );
    console.log('categori: ', response.data)
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