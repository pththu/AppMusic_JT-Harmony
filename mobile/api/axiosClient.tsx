import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://10.49.158.251:3000/api/v1/', // Thêm /v1/ vào đây
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Bạn có thể thêm các interceptor để xử lý request và response ở đây
// Ví dụ: thêm token vào header cho mỗi request
axiosClient.interceptors.request.use(async config => {
  // Xử lý request trước khi gửi
  return config;
});

axiosClient.interceptors.response.use(
  response => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  error => {
    // Xử lý lỗi
    throw error;
  },
);

export default axiosClient;
