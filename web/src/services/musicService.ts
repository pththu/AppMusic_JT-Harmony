import axiosClient from "@/lib/axiosClient";

const GetAllTrack = async () => {
  try {
    const response = await axiosClient.get('/music/all-tracks');
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

const GetAllPlaylist = async () => {
  try {
    const response = await axiosClient.get('/playlists');
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

const GetAllAlbum = async () => {
  try {
    const response = await axiosClient.get('/albums');
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

const GetAllGenres = async () => {
  try {
    const response = await axiosClient.get('/genres');
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

const AddArtist = async (payload) => {
  try {
    const response = await axiosClient.post('/artists', payload);
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

const AddAlbum = async (payload) => {
  try {
    const response = await axiosClient.post('/albums', payload);
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

const AddTrack = async (payload) => {
  try {
    const response = await axiosClient.post('/music/add-track', payload);
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

const AddPlaylist = async (payload) => {
  try {
    console.log("payload", payload)
    const formData = new FormData();

    if (payload.image && payload.image instanceof File) {
      formData.append("image", payload.image);
    }

    formData.append("name", payload.name);
    formData.append("description", payload.description);
    formData.append("isPublic", payload.isPublic);
    formData.append("userId", payload.userId);
    formData.append("sharedCount", payload.sharedCount);

    console.log('formData', formData)

    const response = await axiosClient.post(`/playlists/new`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log('response', response.data)
    return response.data;
  } catch (error) {
    console.log(error)
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

const DeletePlaylists = async (playlistIds) => {
  try {
    const response = await axiosClient.post('/playlists/remove-many', playlistIds);
    console.log(response)
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

export {
  GetAllTrack,
  GetAllPlaylist,
  GetAllAlbum,
  GetAllGenres,
  AddArtist,
  AddAlbum,
  AddTrack,
  AddPlaylist,
  DeletePlaylists,
}