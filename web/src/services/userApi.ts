import axiosClient from "@/lib/axiosClient"

export const GetAllUser = async () => {
  try {
    const response = await axiosClient.get('/users');
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