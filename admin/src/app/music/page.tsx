"use client";

import Link from "next/link";
import { Music, Disc, User, ListMusic, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { getStats } from "@/lib/mock-data";

export default function MusicPage() {
  const stats = getStats();

  const musicSections = [
    {
      title: "Bài Hát",
      description: "Quản lý các bài hát riêng lẻ",
      icon: Music,
      href: "/music/tracks",
      count: stats.totalTracks,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Danh Sách Phát",
      description: "Quản lý danh sách phát của người dùng",
      icon: ListMusic,
      href: "/music/playlists",
      count: stats.totalPlaylists,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Nghệ Sĩ",
      description: "Quản lý nghệ sĩ trong thư viện",
      icon: User,
      href: "/music/artists",
      count: 3, // mockArtists.length
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Album",
      description: "Quản lý album và bộ sưu tập",
      icon: Disc,
      href: "/music/albums",
      count: 3, // mockAlbums.length
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Nhạc</h1>
        <p className="text-gray-600">
          Tổng quan về nội dung nhạc trong hệ thống
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {musicSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {section.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${section.bgColor}`}>
                  <Icon className={`h-4 w-4 ${section.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {section.count}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {section.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {musicSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${section.bgColor}`}>
                    <Icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={section.href}>
                  <Button className="w-full">
                    Quản Lý {section.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt Động Nhạc Gần Đây</CardTitle>
          <CardDescription>
            Cập nhật mới nhất trong thư viện nhạc
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Đã thêm bài hát mới</p>
                <p className="text-xs text-gray-600">
                  &ldquo;Summer Nights&rdquo; của The Beach Boys
                </p>
              </div>
              <span className="text-xs text-gray-500">2 giờ trước</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Đã cập nhật danh sách phát
                </p>
                <p className="text-xs text-gray-600">
                  &ldquo;Chill Vibes&rdquo; - Đã thêm 2 bài hát mới
                </p>
              </div>
              <span className="text-xs text-gray-500">5 giờ trước</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Đã cập nhật hồ sơ nghệ sĩ</p>
                <p className="text-xs text-gray-600">
                  Đã cập nhật tiểu sử Queen
                </p>
              </div>
              <span className="text-xs text-gray-500">1 ngày trước</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
