import axiosClient from "@/lib/axiosClient";

const GetAllListenHistories = async () => {
  try {
    const response = await axiosClient.get('/histories/listening-all');
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

const GetAllSearchHistories = async () => {
  try {
    const response = await axiosClient.get('/histories/search-all');
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
  GetAllListenHistories,
  GetAllSearchHistories
}