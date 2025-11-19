import axiosClient from "@/config/axiosClient";
import { hi } from "date-fns/locale";

export const GetRecommendationsByUser = async () => {
  try {
    const response = await axiosClient.get('/recommendations/me');
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

export const GenerateFromActivity = async (payload) => {
  try {
    const response = await axiosClient.post('/recommendations/generate-from-activity', { activity: payload });
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

export const GenerateFromMood = async (payload) => {
  try {
    const response = await axiosClient.post('/recommendations/generate-from-mood', { mood: payload });
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

export const GenerateFromTimeOfDay = async () => {
  try {
    const response = await axiosClient.get('/recommendations/generate-from-time-of-day');
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

export const GenerateFromHistories = async (payload) => {
  try {
    const response = await axiosClient.post('/recommendations/generate-from-histories', { histories: payload });
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

export const GenerateFromFollowedArtists = async (payload) => {
  try {
    const response = await axiosClient.post('/recommendations/generate-from-followed-artists', { followedArtists: payload });
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

export const GenerateFromFavorites = async (payload) => {
  try {
    const response = await axiosClient.post('/recommendations/generate-from-favorites', { favorites: payload });
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

export const GenerateFromGenres = async (payload) => {
  try {
    const response = await axiosClient.post('/recommendations/generate-from-genres', { genres: payload });
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