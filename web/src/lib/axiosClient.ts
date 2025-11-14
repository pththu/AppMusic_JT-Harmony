import { authStore } from "@/store/authStore";
import axios, { InternalAxiosRequestConfig } from "axios";

function resolveBaseURL() {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE;
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const port = window.location.port;
    if (port && port !== "3000") return "http://localhost:3000/api/v1";
    return "/api/v1";
  }
  return process.env.API_BASE || "http://localhost:3000/api/v1";
}

const axiosClient = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    "Content-Type": "application/json; charset=UTF-8",
  },
});

// Request interceptor -> luôn gắn token
axiosClient.interceptors.request.use(
  function async(config) {
    let token = authStore.getState().token;
    if (!token && typeof window !== "undefined") {
      try {
        const persisted = localStorage.getItem("auth-storage");
        if (persisted) {
          const parsed = JSON.parse(persisted);
          token =
            parsed?.state?.token ??
            parsed?.state?.user?.accessToken ??
            parsed?.token ??
            null;
        }
      } catch {}
    }
    if (!(config as any).skipAuth && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
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

export default axiosClient;
