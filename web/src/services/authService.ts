import axiosClient, { axiosClientPublic } from '@/lib/axiosClient';

export const Login = async (payload) => {
  try {
    const response = await axiosClientPublic.post('/auth/login', {
      email: payload.email,
      password: payload.password,
    });
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

export const Logout = async () => {
  try {
    const response = await axiosClient.get(`/auth/logout`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      console.log('err: ', error)
      return {
        success: false,
        status: status,
        message: data.message
      }
    }
  }
}
