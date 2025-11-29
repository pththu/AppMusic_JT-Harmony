"use client";

import React, { useMemo } from "react";
// Đã loại bỏ import "next/link" gây lỗi
import {
  Music,
  Disc,
  User,
  ListMusic,
  ArrowRight,
  TrendingUp,
  Search,
  Heart,
  Clock,
  Activity,
  PlayCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// --- UI COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h3 className={`font-semibold text-gray-900 ${className}`}>{children}</h3>
);
const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-2 ${className}`}>{children}</div>
);
const Button = ({ children, className = "", variant = "primary", ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-gray-300 hover:bg-gray-100 text-gray-700"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- MOCK DATA GENERATOR ---
const generateMockData = () => {
  const stats = {
    totalTracks: 12450,
    totalPlaylists: 84,
    totalArtists: 432,
    totalAlbums: 315,
  };

  const activityData = [
    { name: "T2", plays: 45, searches: 12 },
    { name: "T3", plays: 52, searches: 15 },
    { name: "T4", plays: 38, searches: 8 },
    { name: "T5", plays: 65, searches: 24 },
    { name: "T6", plays: 89, searches: 30 },
    { name: "T7", plays: 120, searches: 45 },
    { name: "CN", plays: 95, searches: 35 },
  ];

  const genreData = [
    { name: "Pop Ballad", value: 40, color: "#3b82f6" },
    { name: "Indie", value: 25, color: "#10b981" },
    { name: "R&B", value: 20, color: "#8b5cf6" },
    { name: "Rock", value: 10, color: "#f59e0b" },
    { name: "Khác", value: 5, color: "#9ca3af" },
  ];

  const topArtists = [
    { name: "Sơn Tùng M-TP", plays: 1250, trend: "+12%" },
    { name: "Vũ.", plays: 980, trend: "+5%" },
    { name: "Den", plays: 850, trend: "-2%" },
    { name: "Chillies", plays: 720, trend: "+8%" },
  ];

  const topSearches = [
    { keyword: "nhạc chill học bài", count: 450 },
    { keyword: "top hits 2024", count: 320 },
    { keyword: "lofi hip hop", count: 210 },
    { keyword: "piano không lời", count: 180 },
  ];

  return { stats, activityData, genreData, topArtists, topSearches };
};

export default function MusicDashboard() {
  const { stats, activityData, genreData, topArtists, topSearches } = useMemo(() => generateMockData(), []);

  const overviewCards = [
    {
      title: "Bài Hát",
      value: stats.totalTracks.toLocaleString(),
      description: "+124 tuần này",
      icon: Music,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "#/music/tracks",
    },
    {
      title: "Danh Sách Phát",
      value: stats.totalPlaylists,
      description: "8 danh sách công khai",
      icon: ListMusic,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "#/music/playlists",
    },
    {
      title: "Nghệ Sĩ",
      value: stats.totalArtists,
      description: "Top: Sơn Tùng M-TP",
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "#/music/artists",
    },
    {
      title: "Album",
      value: stats.totalAlbums,
      description: "Mới nhất: Loi Choi",
      icon: Disc,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "#/music/albums",
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Nhạc</h1>
          <p className="text-gray-500 mt-1">
            Tổng quan hệ thống, phân tích xu hướng nghe và quản lý thư viện.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Activity className="w-4 h-4 mr-2" /> Báo cáo chi tiết</Button>
          <Button><PlayCircle className="w-4 h-4 mr-2" /> Quản lý nhanh</Button>
        </div>
      </div>

      {/* 1. Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 border-none shadow-md cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
                  </div>
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Đang tăng
                  </span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-gray-500">{card.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 2. Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Trend Chart */}
        <Card className="lg:col-span-2 shadow-md border-none">
          <CardHeader>
            <CardTitle>Xu Hướng Hoạt Động</CardTitle>
            <CardDescription>Số lượt nghe và tìm kiếm trong 7 ngày qua</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line
                    type="monotone"
                    name="Lượt nghe"
                    dataKey="plays"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    name="Tìm kiếm"
                    dataKey="searches"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Genre Distribution */}
        <Card className="shadow-md border-none">
          <CardHeader>
            <CardTitle>Phân Tích Gu Âm Nhạc</CardTitle>
            <CardDescription>Tỷ lệ các thể loại trong thư viện yêu thích</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-xs text-gray-500">Thể loại</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {genreData.map((genre) => (
                <div key={genre.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: genre.color }}></div>
                    <span className="text-gray-700">{genre.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{genre.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Detailed Lists & User Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Top Artists */}
        <Card className="shadow-md border-none col-span-1 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Nghệ Sĩ</CardTitle>
              <a href="#/music/artists" className="text-blue-600 text-sm hover:underline">Xem tất cả</a>
            </div>
            <CardDescription>Nghệ sĩ được nghe nhiều nhất tháng này</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {topArtists.map((artist, i) => (
                <div key={artist.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{artist.name}</p>
                      <p className="text-xs text-gray-500">{artist.plays.toLocaleString()} lượt nghe</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${artist.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {artist.trend}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search & Insights */}
        <Card className="shadow-md border-none col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Phân Tích Hành Vi & Tìm Kiếm</CardTitle>
            <CardDescription>Hiểu rõ nhu cầu người dùng qua từ khóa và thói quen</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Search Keywords */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <Search className="w-4 h-4 mr-2" /> Từ khóa phổ biến
              </h4>
              <div className="flex flex-wrap gap-2">
                {topSearches.map((search) => (
                  <span key={search.keyword} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors">
                    {search.keyword} <span className="text-gray-400 text-xs ml-1">{search.count}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Smart Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <span className="text-xs font-semibold text-pink-700 uppercase">Tỷ lệ yêu thích</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">12.5%</p>
                <p className="text-xs text-gray-600 mt-1">Bài hát nghe xong được tim</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-700 uppercase">Giờ cao điểm</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">20:00</p>
                <p className="text-xs text-gray-600 mt-1">Người dùng nghe nhiều nhất</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-gray-900">Quản lý nhanh</h3>
          <p className="text-gray-500 text-sm">Truy cập nhanh vào các khu vực quản trị quan trọng.</p>
        </div>
        <div className="flex gap-4 justify-end">
          <a href="#/music/tracks/new" className="w-full sm:w-auto block">
            <Button className="w-full">
              Thêm bài hát mới <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <a href="#/music/playlists" className="w-full sm:w-auto block">
            <Button variant="outline" className="w-full">
              Duyệt Playlist
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}