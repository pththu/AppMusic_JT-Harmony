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
      artistName: payload,
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
