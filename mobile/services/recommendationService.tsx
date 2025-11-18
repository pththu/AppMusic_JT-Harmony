import axiosClient from "@/config/axiosClient";

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