import axiosClient from "@/lib/axiosClient";

const GetAllFavoriteItems = async () => {
  try {
    const response = await axiosClient.get('/favorites');
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

export {
  GetAllFavoriteItems
}