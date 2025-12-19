import axiosClient from "@/config/axiosClient";

const sendMessageApi = async (payload) => {
  try {
    const response = await axiosClient.post('/conversations/send-message', payload);
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
  sendMessageApi
};

