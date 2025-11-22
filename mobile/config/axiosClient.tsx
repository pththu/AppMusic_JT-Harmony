import { authStore } from '@/store/authStore';
import axios from 'axios';
import { ENV } from './env';

const axiosClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json;  charset=UTF-8'
  },
});

// Request interceptor -> luôn gắn token
axiosClient.interceptors.request.use(
  function async(config) {
    const token = authStore.getState().token;
    // console.log('🔑 Request token:', token ? 'present' : 'null', 'URL:', config.url);
    if (!config.skipAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor
axios.interceptors.response.use(function onFulfilled(response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
}, function onRejected(error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});

const axiosPublicClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json;  charset=UTF-8'
  },
});

export { axiosPublicClient };
export default axiosClient;
