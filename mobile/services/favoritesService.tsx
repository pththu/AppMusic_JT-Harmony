import axiosClient from "@/config/axiosClient";

export const GetFavoriteItemsGrouped = async () => {
  try {
    const response = await axiosClient.get(`/favorites/grouped/items`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const AddFavoriteItem = async (payload) => {
  try {
    const response = await axiosClient.post(`/favorites`, {
      itemType: payload.itemType,
      itemId: payload.itemId,
      itemSpotifyId: payload.itemSpotifyId
    })
    console.log('api: ', response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const RemoveFavoriteItem = async (payload) => {
  try {
    const response = await axiosClient.delete(`/favorites/remove/${payload}`);
    console.log('api: ', response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}