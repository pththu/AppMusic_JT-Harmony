"use client";

import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import {
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Logout } from "@/services";
import toast from "react-hot-toast";

export function Header() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {

    try {
      const response = await Logout();
      console.log('response', response)
      if (response.success) {
        logout();
        toast.success('Đăng xuất thành công!', {
          duration: 3000, // ✅ Yêu cầu 1: Hiển thị trong 3 giây (3000ms)
          style: {
            fontWeight: 600,
            fontSize: '20px',
          },
        });
        router.push("/login");
      } else {
        toast.error('Đăng xuất thất bại. Vui lòng thử lại.', {
          duration: 3000,
          style: {
            fontWeight: 600,
            fontSize: '15px',
          },
        });
      }
    } catch (error) {
      toast.error('Lỗi khi đăng xuất: ' + error.message, {
        duration: 3000,
        style: {
          fontWeight: 600,
          fontSize: '15px',
        },
      });
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Tìm kiếm..." className="pl-10 w-full" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="hidden lg:flex">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 p-2">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
              <span className="text-sm font-medium text-gray-900 hidden sm:block">
                Admin
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {/* <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
