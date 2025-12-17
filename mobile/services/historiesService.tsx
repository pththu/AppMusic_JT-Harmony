import axiosClient, { axiosPublicClient } from "@/config/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SaveToListeningHistory = async (payload) => {
  try {
    const response = await axiosClient.post(`/histories/listening`, payload);
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

export const GetListeningHistory = async (payload) => {
  try {
    const response = await axiosPublicClient.get(`/histories/listening/user/${payload}`);
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

export const GetSearchHistory = async (userId) => {
  try {
    const response = await axiosClient.get(`/histories/search/user/${userId}`);
    return response.data;
  } catch (error: any) {
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

export const ClearSearchHistory = async (SEARCH_HISTORY_KEY) => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    const response = await axiosClient.delete('/histories/search/user/me');
    return response.data;
  } catch (error: any) {
    console.log("ClearSearchHistory error:", error.message);
    return { success: false };
  }
};

export const RemoveItemSearchHistory = async (payload) => {
  try {
    console.log('payload', payload)
    const response = await axiosClient.delete(`/histories/search/${payload}`);
    console.log('response api remove search history item: ', response.data);
    return response.data;
  } catch (error) {
    console.log("RemoveItemSearchHistory error:", error.message);
    throw error;
  }
}