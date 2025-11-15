import axiosClient from "@/config/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { th } from "date-fns/locale";

export const SaveToListeningHistory = async (payload) => {
  try {
    console.log('payload save to listening history', payload)
    const response = await axiosClient.post(`/histories/listening`, payload);
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const GetListeningHistory = async () => {
  try {
    const response = await axiosClient.get('/histories/listening/user/me');
    return response.data;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

export const GetSearchHistory = async () => {
  try {
    const response = await axiosClient.get('/histories/search/user/me');
    return response.data;
  } catch (error: any) {
    console.error("GetSearchHistory error:", error.message);
    return [];
  }
};

export const ClearSearchHistory = async (SEARCH_HISTORY_KEY) => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    const response = await axiosClient.delete('/histories/search/user/me');
    return response.data;
  } catch (error: any) {
    console.error("ClearSearchHistory error:", error.message);
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
    console.error("RemoveItemSearchHistory error:", error.message);
    throw error;
  }
}