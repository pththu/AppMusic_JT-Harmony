import axiosClient from "@/lib/axiosClient";

const GetAllArtist = async () => {
  try {
    const response = await axiosClient.get('/artists');
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

const GetAllFollowUser = async () => {
  try {
    const response = await axiosClient.get('/follows/follow-users');
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

const GetAllFollowArtist = async () => {
  try {
    const response = await axiosClient.get('/follows/follow-artists');
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
  GetAllArtist,
  GetAllFollowUser,
  GetAllFollowArtist
}