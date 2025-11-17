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