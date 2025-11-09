"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  getStats,
  mockUsers,
  mockPosts,
  mockPostReports,
  mockStatDailyPlays,
} from "@/lib/mock-data";
import {
  Users,
  FileText,
  Music,
  Flag,
  UserCheck,
  UserX,
  Ban,
  TrendingUp,
  Heart,
  MessageCircle,
  UserPlus,
  MessageSquare,
  Mail,
  Headphones,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { format, subDays, isWithinInterval } from "date-fns";

const stats = getStats();

// Detailed stats
const userStatusData = [
  {
    name: "Active",
    value: mockUsers.filter((u) => u.status === "active").length,
    color: "#10B981",
  },
  {
    name: "Inactive",
    value: mockUsers.filter((u) => u.status === "inactive").length,
    color: "#F59E0B",
  },
  {
    name: "Banned",
    value: mockUsers.filter((u) => u.status === "banned").length,
    color: "#EF4444",
  },
];

const postsOverTimeData = Array.from({ length: 7 }, (_, i) => {
  const date = subDays(new Date(), i);
  const posts = mockPosts.filter((p) =>
    isWithinInterval(new Date(p.createdAt), {
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    })
  ).length;
  return {
    date: format(date, "MMM dd"),
    posts,
  };
}).reverse();

const statCards = [
  {
    title: "Tổng Người Dùng",
    value: stats.totalUsers,
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Tổng Bài Đăng",
    value: stats.totalPosts,
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Tổng Bài Hát",
    value: stats.totalTracks,
    icon: Music,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Báo Cáo Chờ Xử Lý",
    value: stats.totalReports,
    icon: Flag,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
];

const detailedStatCards = [
  {
    title: "Người Dùng Hoạt Động",
    value: mockUsers.filter((u) => u.status === "active").length,
    icon: UserCheck,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Người Dùng Không Hoạt Động",
    value: mockUsers.filter((u) => u.status === "inactive").length,
    icon: UserX,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    title: "Người Dùng Bị Cấm",
    value: mockUsers.filter((u) => u.status === "banned").length,
    icon: Ban,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    title: "Bài Đăng Trong Tuần",
    value: mockPosts.filter((p) =>
      isWithinInterval(new Date(p.createdAt), {
        start: subDays(new Date(), 7),
        end: new Date(),
      })
    ).length,
    icon: TrendingUp,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "Tổng Lượt Thích",
    value: stats.totalLikes,
    icon: Heart,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    title: "Tổng Bình Luận",
    value: stats.totalComments,
    icon: MessageCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Tổng Theo Dõi",
    value: stats.totalFollows,
    icon: UserPlus,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Tổng Cuộc Trò Chuyện",
    value: stats.totalConversations,
    icon: MessageSquare,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
  },
  {
    title: "Tổng Tin Nhắn",
    value: stats.totalMessages,
    icon: Mail,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Tổng Lịch Sử Nghe",
    value: stats.totalListeningHistories,
    icon: Headphones,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển</h1>
        <p className="text-gray-600">
          Chào mừng đến với Bảng Điều Khiển Admin AppMusic
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {detailedStatCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trạng Thái Người Dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    name,
                    percent,
                  }: {
                    name: string;
                    percent: number;
                  }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bài Đăng Theo Thời Gian (7 Ngày)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={postsOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="posts"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: "#8884d8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lượt Phát Hàng Ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockStatDailyPlays}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="plays" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt Động Gần Đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPosts.slice(0, 3).map((post) => {
                const author = mockUsers.find((u) => u.id === post.userId);
                return (
                  <div key={post.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {author?.avatarUrl ? (
                        <img
                          src={author.avatarUrl}
                          alt={author.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {author?.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {author?.fullName || author?.username} đã đăng bài mới
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(post.createdAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })}
              {mockPostReports.slice(0, 2).map((report) => {
                const reporter = mockUsers.find(
                  (u) => u.id === report.reporterId
                );
                return (
                  <div key={report.id} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Flag className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {reporter?.username} báo cáo nội dung
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(report.reportedAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng Thái Hệ Thống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Trạng Thái Máy Chủ</span>
                <span className="text-sm text-green-600 font-medium">
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cơ Sở Dữ Liệu</span>
                <span className="text-sm text-green-600 font-medium">
                  Đã Kết Nối
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Thời Gian Phản Hồi API</span>
                <span className="text-sm text-green-600 font-medium">
                  120ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
