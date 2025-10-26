import axiosClient from "@/config/axiosClient";

export const GetPlaylistsForYou = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/playlist-for-you`, {
      playlistName: payload,
      limit: 3
    });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}

export const GetAlbumsForYou = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/album-for-you`, {
      albumName: payload,
      limit: 3
    });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}

export const GetArtistsForYou = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/artist-for-you`, {
      artistName: payload,
      limit: 3
    });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}

export const GetTracksByPlaylistId = async (payload) => {
  try {
    const response = await axiosClient.get(`/music/playlist/${payload}/tracks`);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}

export const GetTracksByAlbumId = async (payload) => {
  try {
    const response = await axiosClient.get(`/music/album/${payload}/tracks`);
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}