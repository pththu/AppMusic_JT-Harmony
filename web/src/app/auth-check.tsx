"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function AuthCheck({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      // Nếu đang ở trang login, không cần kiểm tra auth
      if (pathname === "/login") {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Đọc từ Zustand persist (auth-storage) để đồng bộ với hệ thống auth hiện tại
      let token: string | null = null;
      let user: any = null;
      try {
        const persisted = localStorage.getItem("auth-storage");
        if (persisted) {
          const parsed = JSON.parse(persisted);
          user = parsed?.state?.user ?? parsed?.user ?? null;
          token =
            parsed?.state?.token ??
            user?.accessToken ??
            parsed?.token ??
            null;
        }
      } catch {}

      if (token && user) {
        const roleId = user?.roleId ?? user?.role_id ?? user?.role?.id;
        if (roleId === 1) {
          setIsAuthenticated(true);
        } else {
          router.push("/login");
        }
      } else {
        // Chưa đăng nhập, chuyển hướng đến login
        router.push("/login");
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Nếu đang ở trang login, chỉ hiển thị trang login mà không có sidebar và header
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Nếu đã authenticated, hiển thị layout đầy đủ với sidebar và header
  if (isAuthenticated) {
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

  // Nếu chưa authenticated và không phải trang login, sẽ chuyển hướng trong useEffect
  return null;
}
