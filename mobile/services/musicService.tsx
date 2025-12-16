import axiosClient, { axiosPublicClient } from "@/config/axiosClient";

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
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
};

export const GetTracksByPlaylistId = async (payload) => {
  try {
    const response = await axiosClient.post(`music/playlist/${payload.playlistId}/tracks`, {
      type: payload.type
    })
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
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

export const GetMyPlaylists = async (userId) => {
  try {
    const response = await axiosPublicClient.get(`/music/${userId}/playlists`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
};

export const GetTracks = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/get-tracks`, { queries: payload });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

export const GetVideoId = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/track/video-id`, {
      title: payload.title,
      artists: payload.artists
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

export const getUrlTrackOnSoundCloud = async (payload) => {
  try {
    const response = await axiosPublicClient.post(`/music/track/soundcloud`, {
      title: payload.title,
      artists: payload.artists
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

// add
export const AddTrackToPlaylist = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/playlist/${payload.playlistId}/add-track`, {
      trackId: payload.trackId,
      trackSpotifyId: payload.trackSpotifyId
    });
    return response.data;
  } catch (error) {
    console.log(error.message)
    throw error;
  }
};

export const AddTrackToPlaylistAfterConfirm = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/playlist/${payload.playlistId}/add-track-confirm`, {
      trackId: payload.trackId,
      trackSpotifyId: payload.trackSpotifyId
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const AddTracksToPlaylists = async (payload) => {
  try {
    const response = await axiosClient.post(`/music/playlist/add-tracks`, {
      playlistIds: payload.playlistIds,
      trackIds: payload.trackSpotifyIds,
    })
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
    const response = await axiosClient.post(`/albums/share`, {
      albumId: payload.albumId,
      albumSpotifyId: payload.albumSpotifyId
    });
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
    const response = await axiosClient.delete(`/playlists/${playlistId}`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const RemoveTrackFromPlaylist = async (payload) => {
  try {
    const response = await axiosClient.delete(`/music/playlist/${payload.playlistId}/remove-track/${payload.playlistTrackId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const GetTracksForCover = async () => {
  try {
    const response = await axiosPublicClient.get(`/music/track-for-cover`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const FindTrackById = async (trackId) => {
  try {
    const response = await axiosPublicClient.get(`/music/track/${trackId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

export const FindTrackByNameAndArtists = async (payload) => {
  try {
    const response = await axiosPublicClient.post(`/music/track-by-name-artist`, payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

export const GetTracksFromRecommend = async (payload) => {
  try {
    const response = await axiosPublicClient.post(`/music/tracks-from-recommend`, payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}

export const GetExternalUrl = async (trackId) => {
  try {
    const response = await axiosClient.get(`/music/track/get-url/${trackId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}