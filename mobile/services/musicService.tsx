import axiosClient from "@/config/axiosClient";

export const GetPlaylistsForYou = async (payload) => {
  try {
    console.log(payload);
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
    console.log(payload);
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
    console.log(payload);
    const response = await axiosClient.post(`/music/artist-for-you`, {
      artistName: payload,
      limit: 3
    });
    return response.data;
  } catch (error) {
    return { message: error.message, status: "error" };
  }
}