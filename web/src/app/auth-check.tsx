"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import useAuthStore from "@/store/authStore";
import { userAgent } from "next/server";
import toast from "react-hot-toast";

export function AuthCheck({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isHydrated = useAuthStore?.persist?.hasHydrated();
  const hasStorageData = typeof window !== 'undefined' && localStorage.getItem('auth-storage');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const performAuthCheck = () => {

      if (!isHydrated && hasStorageData) {
        return;
      }

      if (isLoggedIn && user) {
        console.log("user", user)
        console.log('isLoggedIn', isLoggedIn)
        const roleId = user.roleId;
        console.log('role: ', roleId)

        // Giả sử roleId = 1 là Admin
        if (roleId === 1) {
          setIsLoading(false);
        } else {
          toast.error("Bạn không có quyền truy cập vào trang này.");
          setIsLoading(false);
        }
      } else {
        router.replace("/login");
      }
    };

    performAuthCheck();
  }, [router, pathname, user, isLoggedIn]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Nếu đã authenticated, hiển thị layout đầy đủ với sidebar và header
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

  // Nếu chưa authenticated và không phải trang login, sẽ chuyển hướng trong useEffect
  return null;
}
