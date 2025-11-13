"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Music,
  Flag,
  Settings,
  Menu,
  X,
  Heart,
  UserPlus,
  MessageCircle,
  MessageSquare,
  Play,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Bảng Điều Khiển", href: "/dashboard", icon: LayoutDashboard },
  { name: "Người Dùng", href: "/users", icon: Users,
    subItems: [
        { name: "Theo Dõi", href: "/follows", icon: UserPlus },
    ],
  },
  { name: "Vai Trò", href: "/roles", icon: Shield },
  {
    name: "Bài Đăng",
    href: "/posts",
    icon: FileText,
    subItems: [
      { name: "Bình Luận", href: "/comments", icon: MessageSquare },
      { name: "Likes", href: "/likes", icon: Heart },
      { name: "Báo Cáo", href: "/reports", icon: Flag },
    ],
  },
  {
    name: "Nhạc",
    href: "/music",
    icon: Music,
    subItems: [
      { name: "Bài hát", href: "/music/tracks", icon: Play },
      { name: "Danh sách phát", href: "/music/playlists", icon: Music },
      { name: "Album", href: "/music/albums", icon: Music },
      { name: "Nghệ sĩ", href: "/music/artists", icon: Users },
      { name: "Lịch sử nghe", href: "/listening-history", icon: Play },
    ],
  },
  {
    name: "Cuộc Trò Chuyện",
    href: "/conversations",
    icon: MessageCircle,
    subItems: [{ name: "Tin nhắn", href: "/messages", icon: MessageSquare }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-md bg-white shadow-md border border-gray-200"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-full w-64 flex-col bg-white border-r border-gray-200",
          "lg:translate-x-0 lg:static lg:inset-0",
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">JT-Harmony Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isExpanded = expandedItems.includes(item.name);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.name}>
                {hasSubItems ? (
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive ||
                          item.subItems?.some((sub) => pathname === sub.href)
                          ? "bg-green-50 text-green-700 border-r-2 border-green-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="p-1 rounded-md hover:bg-gray-100"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-green-50 text-green-700 border-r-2 border-green-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )}

                {hasSubItems && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            isSubActive
                              ? "bg-green-50 text-green-700 border-r-2 border-green-700"
                              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          )}
                        >
                          <subItem.icon className="mr-3 h-4 w-4" />
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Quản trị viên</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
