import axiosClient, { axiosPublicClient } from "@/config/axiosClient";

export const ShareArtist = async (payload) => {
  try {
    const response = await axiosClient.post(`/artists/share`, {
      artistId: payload.artistId,
      artistSpotifyId: payload.artistSpotifyId,
    });
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const FollowArtist = async (payload) => {
  try {
    const response = await axiosClient.post(`follows/follow-artist`, {
      artistId: payload.artistId,
      artistSpotifyId: payload.artistSpotifyId,
    })
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const UnfollowArtist = async (payload) => {
  try {
    const response = await axiosClient.delete(`follows/unfollow-artist/${payload.followId}`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const GetFollowersOfArtist = async (payload) => {
  try {
    const response = await axiosClient.post(`/follows/artist/follower`, {
      artistSpotifyId: payload.artistSpotifyId,
    });
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const GetArtistFollowed = async (userId) => {
  try {
    const response = await axiosPublicClient.get(`/follows/${userId}/followed-artists`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

// =================== User Follow ===================
export const FollowUser = async (followeeId) => {
  try {
    const response = await axiosClient.post(`/follows/follow-user/${followeeId}`);
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

export const UnfollowUser = async (payload) => {
  try {
    const response = await axiosClient.delete(`/follows/unfollow-user?followeeId=${payload.followeeId}&&followerId=${payload.followerId}`);
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


// người theo dõi user
export const GetFollowers = async (userId) => {
  try {
    const response = await axiosPublicClient.get(`/follows/${userId}/followers`);
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

export const GetFollowees = async (userId) => {
  try {
    const response = await axiosPublicClient.get(`/follows/${userId}/followees`);
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

export const GetUserProfileSocial = async (userId) => {
  try {
    const response = await axiosPublicClient.get(`/follows/${userId}/profile-social`);
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