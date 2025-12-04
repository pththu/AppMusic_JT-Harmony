import { authStore } from "@/store/authStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE;


const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
  },
  withCredentials: true,
});

// Flag để tránh multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Xử lý queue khi refresh thành công/thất bại
const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Request interceptor -> luôn gắn token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Web client: Token được gửi tự động qua httpOnly cookie, không cần thêm gì vào header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  function onFulfilled(response) {
    return response;
  },
  function onRejected(error) {
    // Handle token refresh logic here if needed
    return Promise.reject(error);
  }
);

// Response Interceptor - Auto refresh token
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Không có response hoặc config
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const errorData = error.response.data as any;

    // 1. Kiểm tra lỗi 401 và chưa retry
    if (error.response.status === 401 && !originalRequest._retry) {

      // 2. Nếu là TOKEN_EXPIRED, thử refresh
      if (errorData?.code === 'TOKEN_EXPIRED') {

        // Nếu đang refresh, đưa request vào queue
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return axiosClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // 3. Gọi API refresh token: Server sẽ tự động đọc refreshToken từ cookie
          const response = await axios.post(
            `${BASE_URL}/auth/refresh`,
            {}, // Empty body - server đọc từ cookie
            {
              withCredentials: true, // Gửi cookie
            }
          );

          console.log('Token refreshed successfully');

          // 4. Server đã set cookie mới tự động
          // Không cần update gì ở client

          // 5. Process queue
          processQueue(null);

          // 6. Retry request gốc
          return axiosClient(originalRequest);

        } catch (refreshError: any) {
          // 7. Refresh thất bại -> Logout
          console.error('Token refresh failed:', refreshError);

          processQueue(refreshError);

          // Logout user
          const { logout } = authStore.getState();
          logout();

          // Clear cookies bằng cách gọi logout endpoint
          try {
            await axios.post(
              `${BASE_URL}/auth/logout`,
              {},
              { withCredentials: true }
            );
          } catch (logoutError) {
            console.error('Logout request failed:', logoutError);
          }

          // Redirect to login
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              window.location.href = '/login';
            }, 10000);
          }

          return Promise.reject(refreshError);

        } finally {
          isRefreshing = false;
        }
      }

      // Nếu là lỗi 401 khác (TOKEN_INVALID, TOKEN_MISSING, REFRESH_TOKEN_EXPIRED)
      if (
        errorData?.code === 'TOKEN_INVALID' ||
        errorData?.code === 'TOKEN_MISSING' ||
        errorData?.code === 'REFRESH_TOKEN_EXPIRED'
      ) {
        console.warn('Auth error:', errorData?.code);

        const { logout } = authStore.getState();
        logout();

        // Clear cookies
        try {
          await axios.post(
            `${BASE_URL}/auth/logout`,
            {},
            { withCredentials: true }
          );
        } catch (logoutError) {
          console.error('Logout request failed:', logoutError);
        }

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);


//public route

const axiosClientPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
  }
})

axiosClientPublic.interceptors.response.use(
  function onFulfilled(response) {
    return response;
  },
  function onRejected(error) {
    // Handle token refresh logic here if needed
    return Promise.reject(error);
  }
);

export { axiosClientPublic };
export default axiosClient;
