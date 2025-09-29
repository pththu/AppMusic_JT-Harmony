import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://192.168.1.5:3000/api/v1/', // Thêm /v1/ vào đây
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Hàm để lấy token từ localStorage hoặc sessionStorage
const getAuthToken = () => {
  // Có thể lấy từ localStorage, sessionStorage, hoặc cookie
  return localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken') ||
    null;
};

// Hàm để lưu token mới
const setAuthToken = (token) => {
  localStorage.setItem('accessToken', token);
};

// Hàm để xóa token
const removeAuthToken = () => {
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
};

// Bạn có thể thêm các interceptor để xử lý request và response ở đây
// Ví dụ: thêm token vào header cho mỗi request
axiosClient.interceptors.request.use(
  async (config) => {
    // Thêm token vào header nếu có
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Thêm timestamp để tránh cache
    config.headers['X-Request-Time'] = Date.now();

    // Log request trong development
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;

  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    // Log response trong development
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    // Trả về data thay vì toàn bộ response object
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý lỗi 401 (Unauthorized) - Token hết hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Thử refresh token nếu có API refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            'http://192.168.1.30:3000/api/v1/auth/refresh',
            { refreshToken }
          );

          const newToken = response.data.accessToken;
          setAuthToken(newToken);

          // Retry request gốc với token mới
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Redirect to login page
        removeAuthToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác
    let errorMessage = 'Có lỗi xảy ra';
    let errorCode = 'UNKNOWN_ERROR';

    if (error.response) {
      // Server trả về response với status code lỗi
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data?.message || 'Dữ liệu không hợp lệ';
          errorCode = 'BAD_REQUEST';
          break;
        case 401:
          errorMessage = 'Không có quyền truy cập';
          errorCode = 'UNAUTHORIZED';
          removeAuthToken();
          break;
        case 403:
          errorMessage = 'Không có quyền thực hiện hành động này';
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorMessage = 'Không tìm thấy tài nguyên';
          errorCode = 'NOT_FOUND';
          break;
        case 422:
          errorMessage = data?.message || 'Dữ liệu không hợp lệ';
          errorCode = 'VALIDATION_ERROR';
          break;
        case 429:
          errorMessage = 'Quá nhiều yêu cầu, vui lòng thử lại sau';
          errorCode = 'TOO_MANY_REQUESTS';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ nội bộ';
          errorCode = 'INTERNAL_SERVER_ERROR';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = 'Máy chủ đang bảo trì, vui lòng thử lại sau';
          errorCode = 'SERVER_UNAVAILABLE';
          break;
        default:
          errorMessage = data?.message || `Lỗi ${status}`;
          errorCode = `HTTP_${status}`;
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      errorMessage = 'Không thể kết nối đến máy chủ';
      errorCode = 'NETWORK_ERROR';
    } else {
      // Lỗi khác
      errorMessage = error.message || 'Có lỗi xảy ra';
      errorCode = 'REQUEST_ERROR';
    }

    // Log error
    console.error('❌ API Error:', {
      code: errorCode,
      message: errorMessage,
      originalError: error,
      url: error.config?.url,
      method: error.config?.method,
    });

    // Tạo error object với thông tin chi tiết
    interface CustomError extends Error {
      code?: string;
      status?: number;
      data?: any;
      originalError?: any;
    }
    const customError = new Error(errorMessage) as CustomError;
    customError.code = errorCode;
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    customError.originalError = error;

    return Promise.reject(customError);
  }
);


export default axiosClient;
