"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import axiosClient from "@/lib/axiosClient";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store";

interface AuthCheckProps {
  children: React.ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes không cần authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Wait for hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const verifyAuth = async () => {
      if (isPublicRoute) {
        setIsLoading(false);
        return;
      }

      // 2. Verify token với server (token trong cookie)
      try {
        const response = await axiosClient.get('/auth/verify');

        if (response.data.valid) {
          const userData = response.data.user;
          console.log('user', userData)

          // Cập nhật user info nếu chưa có hoặc đã thay đổi
          if (!user || user.id !== userData.id) {
            login(userData);
          }

          // Kiểm tra role (chỉ admin được vào)
          if (userData.roleId !== 1) {
            toast.error("Bạn không có quyền truy cập vào trang này.");
            logout();
            router.replace("/login");
            return;
          }

          setIsLoading(false);
        }

      } catch (error: any) {
        // console.error('Auth verification failed:', error);
        toast.error('Lỗi xác thực: ' + error)

        // Axios interceptor sẽ tự động xử lý:
        // - Nếu TOKEN_EXPIRED: tự động refresh
        // - Nếu refresh thành công: retry verify
        // - Nếu refresh thất bại: logout + redirect

        // Chỉ handle các lỗi không phải 401 (401 đã được interceptor xử lý)
        if (error.response?.status !== 401) {
          console.error('Unexpected error:', error);
          logout();
          router.replace("/login");
        }

        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [isHydrated, pathname, isPublicRoute]);

  // Wait for hydration
  if (!isHydrated) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Public routes - render without layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes - render with layout
  if (isLoggedIn && user) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    );
  }

  // Fallback - đang trong quá trình redirect
  return null;
}