import axiosClient from "@/config/axiosClient";

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

export const GetArtistFollowed = async () => {
  try {
    const response = await axiosClient.get(`/follows/mine/followed-artists`);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}