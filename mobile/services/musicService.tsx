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

export const GetMyPlaylists = async () => {
  try {
    const response = await axiosClient.get(`/music/mine/playlists`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const CreatePlaylist = async (payload) => {
  try {
    const formData = new FormData();
    console.log('payload', payload);
    if (payload.image !== null) {
      const imageUri = payload.image;
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type
      } as any);
    }

    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('isPublic', payload.isPublic);

    const response = await axiosClient.post(`/playlists/new`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(response)
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}