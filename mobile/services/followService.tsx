import axiosClient from "@/config/axiosClient";

export const FollowArtist = async (payload) => {
  try {
    const response = await axiosClient.post(`follows/follow-artist`, {
      artistId: payload.artistId,
      artistSpotifyId: payload.artistSpotifyId,
    })
    console.log('api response: ', response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

export const UnfollowArtist = async (payload) => {
  try {
    const response = await axiosClient.delete(`follows/unfollow-artist/${payload.followId}`);
    console.log('api del: ', response.data);
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
    console.log('api get followers: ', response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const GetArtistFollowed = async () => {
  try {
    const response = await axiosClient.get(`/follows/mine/followed-artists`);
    console.log('api get followed artists: ', response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}