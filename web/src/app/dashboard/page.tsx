"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  BrainCircuit,
  Users as UsersIcon,
  Music,
  Share2,
  Calendar,
  ArrowRightLeft,
  Smile,
  Meh,
  Frown,
  Video,
  ImageIcon,
  Heart,
  MessageCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line,
  Legend,
  Cell
} from "recharts";
import { format, subDays, getHours, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, subMonths, isSameMonth } from "date-fns";
import { useFollowStore, useHistoryStore, useMusicStore, usePostStore, useUserStore } from "@/store";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

// --- DASHBOARD COMPONENT ---
export default function AnalyticalDashboard() {
  const [loading, setLoading] = useState(true);
  const [growthRange, setGrowthRange] = useState<'7d' | '30d' | '6m' | '1y'>('7d');
  const { users, fetchUsers } = useUserStore();
  const { tracks, artists, fetchArtists, fetchTracks } = useMusicStore();
  const { followArtists, followUsers, fetchFollowUsers, fetchFollowArtists } = useFollowStore();
  const { listenHistories, searchHistories, fetchListenHistories, fetchSearchHistories } = useHistoryStore();
  const { posts, fetchPosts } = usePostStore();

  useEffect(() => {
    setTimeout(() => {
      if (users.length === 0) fetchUsers();
      if (artists.length === 0) fetchArtists();
      if (tracks.length === 0) fetchTracks();
      if (followArtists.length === 0) fetchFollowArtists();
      if (followUsers.length === 0) fetchFollowUsers();
      if (listenHistories.length === 0) fetchListenHistories();
      if (searchHistories.length === 0) fetchSearchHistories();
      if (posts.length === 0) fetchPosts();
      setLoading(false);
    }, 800);
  }, []);

  const analytics = useMemo(() => {
    if (!users || !tracks || !artists || !followArtists || !followUsers || !listenHistories || !searchHistories || !posts) return null;

    // 1. Hourly Activity (Heatmap)
    const hourlyCounts = new Array(24).fill(0);
    listenHistories.forEach(h => hourlyCounts[getHours(parseISO(h.createdAt))]++);
    searchHistories.forEach(s => hourlyCounts[getHours(parseISO(s.searchedAt))]++);
    posts.forEach(p => hourlyCounts[getHours(parseISO(p.createdAt))]++);

    const hourlyData = hourlyCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      activity: count,
      isPeak: false
    }));

    const maxActivity = Math.max(...hourlyCounts);
    const peakHourIndex = hourlyCounts.indexOf(maxActivity);
    hourlyData[peakHourIndex].isPeak = true;

    const now = new Date();
    let timePoints: Date[] = [];
    let isMonthly = false;

    // 2. User Growth Logic (Dynamic Time Range)
    if (growthRange === '7d') {
      timePoints = eachDayOfInterval({ start: subDays(now, 6), end: now });
    } else if (growthRange === '30d') {
      timePoints = eachDayOfInterval({ start: subDays(now, 29), end: now });
    } else if (growthRange === '6m') {
      timePoints = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
      isMonthly = true;
    } else if (growthRange === '1y') {
      timePoints = eachMonthOfInterval({ start: subMonths(now, 11), end: now });
      isMonthly = true;
    }

    const growthData = timePoints.map(date => {
      let dayUsers = [];
      let label = "";

      if (isMonthly) {
        label = format(date, "MM/yyyy");
        dayUsers = users.filter(u => isSameMonth(parseISO(u.createdAt), date));
      } else {
        label = format(date, "dd/MM");
        dayUsers = users.filter(u => isSameDay(parseISO(u.createdAt), date));
      }

      const active = dayUsers.filter(u => u.status === 'active').length;
      const banned = dayUsers.filter(u => u.status === 'banned').length;
      const locked = dayUsers.filter(u => u.status === 'locked').length;
      const inactive = dayUsers.filter(u => u.status === 'inactive').length;
      const total = dayUsers.length;

      return {
        date: label,
        active,
        banned,
        locked,
        inactive,
        total
      };
    });

    const totalActiveGrowth = growthData.reduce((acc, curr) => acc + curr.active, 0);

    // 3. Productivity Score
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalActions = listenHistories.length + searchHistories.length + followUsers.length + followArtists.length;
    const productivityRaw = totalActions / (activeUsers || 1);
    const productivityScore = Math.min(Math.round((productivityRaw / 15) * 100), 100);

    // 4. Information Balance (Cân bằng thông tin)
    const userCount = users.length;
    const artistCount = artists.length;
    const userFollowsCount = followUsers.length;
    const artistFollowsCount = followArtists.length;

    // Tỷ lệ Follow
    const totalFollows = userFollowsCount + artistFollowsCount;
    const userFollowRatio = totalFollows > 0 ? (userFollowsCount / totalFollows) * 100 : 0;
    const artistFollowRatio = totalFollows > 0 ? (artistFollowsCount / totalFollows) * 100 : 0;
    const followLean = userFollowRatio > artistFollowRatio ? 'Users' : 'Artists';

    // Radar Data
    const radarData = [
      { subject: 'Users', A: Math.min((userCount / 600) * 100, 100), fullMark: 100 },
      { subject: 'Artists', A: Math.min((artistCount / 100) * 100, 100), fullMark: 100 },
      { subject: 'Follow (User)', A: Math.min((userFollowsCount / (userCount * 2)) * 100, 100), fullMark: 100 },
      { subject: 'Follow (Artist)', A: Math.min((artistFollowsCount / (userCount * 2)) * 100, 100), fullMark: 100 },
      { subject: 'Tracks', A: Math.min((tracks.length / 300) * 100, 100), fullMark: 100 },
    ];

    // 5. Quality of Users (Chất lượng người dùng)
    const userStatusCount = {
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      locked: users.filter(u => u.status === 'locked').length,
      banned: users.filter(u => u.status === 'banned').length,
    };

    const qualityUserRates = {
      active: userStatusCount.active > 0 ? (userStatusCount.active / users.length) * 100 : 0,
      inactive: userStatusCount.inactive > 0 ? (userStatusCount.inactive / users.length) * 100 : 0,
      locked: userStatusCount.locked > 0 ? (userStatusCount.locked / users.length) * 100 : 0,
      banned: userStatusCount.banned > 0 ? (userStatusCount.banned / users.length) * 100 : 0,
    };

    // 6. Post Analytics
    const postStats = {
      total: posts.length,
      totalHearts: posts.reduce((sum, p) => sum + (p.heartCount || 0), 0),
      totalComments: posts.reduce((sum, p) => sum + (p.commentCount || 0), 0),
      totalShares: posts.reduce((sum, p) => sum + (p.shareCount || 0), 0),
      covers: posts.filter(p => p.isCover).length,
      // Kiểm tra fileUrl để biết là video hay ảnh (dựa trên sample data bạn đưa: có chứa "/videos/" hoặc "/images/")
      videos: posts.filter(p => p.fileUrl && p.fileUrl.includes('/videos/')).length,
      images: posts.filter(p => p.fileUrl && p.fileUrl.includes('/images/')).length,
    };

    const postGrowthData = timePoints.map(date => {
      let dayPosts = [];
      let label = "";

      if (isMonthly) {
        label = format(date, "MM/yyyy");
        dayPosts = posts.filter(p => isSameMonth(parseISO(p.createdAt), date));
      } else {
        label = format(date, "dd/MM");
        dayPosts = posts.filter(p => isSameDay(parseISO(p.createdAt), date));
      }

      const postCount = dayPosts.length;
      const heartCount = dayPosts.reduce((sum, p) => sum + (p.heartCount || 0), 0);
      const commentCount = dayPosts.reduce((sum, p) => sum + (p.commentCount || 0), 0);

      return {
        date: label,
        posts: postCount,
        engagement: heartCount + commentCount, // Tổng tương tác
        hearts: heartCount
      };
    });

    return {
      hourlyData,
      peakHour: { hour: `${peakHourIndex}:00`, activity: maxActivity },
      growthData,
      totalActiveGrowth,
      productivityScore,
      qualityUserRates,
      radarData,
      followStats: {
        total: totalFollows,
        userRatio: userFollowRatio.toFixed(1),
        artistRatio: artistFollowRatio.toFixed(1),
        lean: followLean
      },
      stats: {
        activeUsers,
        totalActions,
        userFollows: userFollowsCount,
        artistFollows: artistFollowsCount
      },
      postStats,
      postGrowthData
    };
  }, [users, artists, listenHistories, searchHistories, followUsers, followArtists, tracks, posts, growthRange]);

  const getUserQualityStatus = (rate: number) => {
    if (rate >= 80) return { label: "Rất Tốt", color: "text-green-600", icon: Smile };
    if (rate >= 60) return { label: "Tốt", color: "text-blue-600", icon: TrendingUp };
    if (rate >= 40) return { label: "Trung Bình", color: "text-yellow-600", icon: Meh };
    return { label: "Kém", color: "text-red-600", icon: Frown };
  }

  if (loading || !analytics) {
    return <div className="flex h-screen items-center justify-center text-gray-500 animate-pulse">Đang đồng bộ dữ liệu database...</div>;
  }

  return (
    <div className="space-y-6 min-h-screen bg-slate-50 p-6 pb-20 font-sans text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-indigo-600" />
            Trung Tâm Phân Tích
          </h1>
          <p className="text-slate-500 mt-1">
            Tổng hợp dữ liệu tương tác từ {analytics.stats.activeUsers} người dùng tích cực
          </p>
        </div>
      </div>

      {/* SECTION 1: KEY EVALUATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Insight 1: Activity Peak */}
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <Badge variant="default">Peak Time</Badge>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Khung Giờ Vàng</h3>
            <p className="text-3xl font-bold mt-2 text-indigo-900">{analytics.peakHour.hour}</p>
            <p className="text-sm text-slate-600 mt-2">
              Đỉnh điểm hoạt động với <span className="font-bold">{analytics.peakHour.activity}</span> tương tác.
            </p>
          </CardContent>
        </Card>

        {/* Insight 3: Connection Volume */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="default">Connections</Badge>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Mạng Lưới Kết Nối</h3>
            <p className="text-3xl font-bold mt-2 text-blue-800">
              {analytics.followStats.total}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Tổng lượt theo dõi (User & Artist).
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 shadow-md border-none flex flex-col">
          <CardHeader>
            <CardTitle>Cân Bằng Thông Tin</CardTitle>
            <CardDescription>Tỷ lệ Follow User vs Artist</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* COMPARISON BAR */}
            <div className="mb-6 bg-slate-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-500">XU HƯỚNG</span>
                <Badge variant={analytics.followStats.lean === 'Users' ? 'default' : 'secondary'}>
                  Nghiêng về {analytics.followStats.lean}
                </Badge>
              </div>
              <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${analytics.followStats.userRatio}%` }}
                  title="Follow Users"
                />
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${analytics.followStats.artistRatio}%` }}
                  title="Follow Artists"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium">
                <div className="text-blue-600">{analytics.followStats.userRatio}% Users</div>
                <div className="text-green-600">{analytics.followStats.artistRatio}% Artists</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3 shadow-md border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Biến Động Người Dùng</CardTitle>
              <CardDescription>Phân loại theo trạng thái tài khoản khi đăng ký</CardDescription>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['7d', '30d', '6m', '1y'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setGrowthRange(range)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${growthRange === range
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {range === '7d' ? '7 Ngày' : range === '30d' ? '30 Ngày' : range === '6m' ? '6 Tháng' : '1 Năm'}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.growthData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="active" name="Hoạt động" stackId="a" barSize={growthRange === '1y' || growthRange === '6m' ? 30 : 20} fill="#22c55e" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="banned" name="Bị khóa (Admin)" stackId="a" barSize={growthRange === '1y' || growthRange === '6m' ? 30 : 20} fill="#ef4444" />
                  <Bar dataKey="locked" name="Tự khóa" stackId="a" barSize={growthRange === '1y' || growthRange === '6m' ? 30 : 20} fill="#eab308" radius={[4, 4, 0, 0]} />

                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3.5: POST ANALYTICS (MỚI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột 1: Thống kê tổng quan & Phân loại nội dung */}
        <div className="space-y-6">
          <Card className="shadow-md border-none">
            <CardHeader>
              <CardTitle>Tổng Quan Bài Đăng</CardTitle>
              <CardDescription>Phân tích loại nội dung</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-indigo-50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <Video className="w-6 h-6 text-indigo-600 mb-2" />
                  <span className="text-2xl font-bold text-indigo-900">{analytics.postStats.videos}</span>
                  <span className="text-xs text-indigo-600 font-medium">Video</span>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <ImageIcon className="w-6 h-6 text-pink-600 mb-2" />
                  <span className="text-2xl font-bold text-pink-900">{analytics.postStats.images}</span>
                  <span className="text-xs text-pink-600 font-medium">Hình ảnh</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-2 text-slate-600"><Music className="w-4 h-4" /> Cover Âm Nhạc</span>
                  <span className="font-bold">{analytics.postStats.covers} bài</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(analytics.postStats.covers / (analytics.postStats.total || 1)) * 100}%` }}></div>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-slate-500 mb-1 flex justify-center items-center gap-1">
                      <Heart className="w-3 h-3" /> Hearts</p>
                    <p className="font-bold text-slate-800">{analytics.postStats.totalHearts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 flex justify-center items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> Comments</p>
                    <p className="font-bold text-slate-800">{analytics.postStats.totalComments}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1 flex justify-center items-center gap-1"><Share2 className="w-3 h-3" /> Shares</p>
                    <p className="font-bold text-slate-800">{analytics.postStats.totalShares}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột 2 & 3: Biểu đồ xu hướng đăng bài & Tương tác */}
        <Card className="md:col-span-2 shadow-md border-none">
          <CardHeader>
            <CardTitle>Hiệu Suất Nội Dung</CardTitle>
            <CardDescription>Số lượng bài đăng và tương tác theo thời gian ({growthRange})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.postGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Bài đăng', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#f43f5e', fontSize: 12 }} label={{ value: 'Tương tác', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Legend verticalAlign="top" height={36} />

                  {/* Cột hiển thị số lượng bài post */}
                  <Bar yAxisId="left" dataKey="posts" name="Số bài đăng" barSize={30} fill="#6366f1" radius={[4, 4, 0, 0]} />

                  {/* Đường hiển thị tương tác (Tim + Comment) */}
                  <Area yAxisId="right" type="monotone" dataKey="engagement" name="Tương tác (Tim+Cmt)" stroke="#f43f5e" fillOpacity={1} fill="url(#colorEngagement)" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: ACTIVITY HEATMAP */}
      <Card className="shadow-md border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Biểu Đồ Hoạt Động Theo Giờ</CardTitle>
            <CardDescription>Phân tích mật độ request trong 24h</CardDescription>
          </div>
          <BarChart3 className="text-slate-400 w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hourlyData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="hour"
                  interval={2}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-lg">
                          <p className="font-bold">{payload[0].payload.hour}</p>
                          <p>Tương tác: {payload[0].value}</p>
                          {payload[0].payload.isPeak && <p className="text-yellow-400 mt-1">⚡ Cao điểm nhất</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="activity" radius={[4, 4, 0, 0]}>
                  {analytics.hourlyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPeak ? '#4f46e5' : '#7BBCF4'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: AUTO-GENERATED REPORT */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Báo cáo phân tích từ tổng quan dữ Liệu</h3>
              <div className="mt-4 space-y-3 text-slate-300 text-sm leading-relaxed">
                <p>
                  • Tổng cộng <strong>{analytics.stats.totalActions}</strong> hành động (nghe nhạc, tìm kiếm, follow) được thực hiện bởi {analytics.stats.activeUsers} user active.
                </p>
                <p>
                  • Hệ thống đang nghiêng về <strong>{analytics.followStats.lean === 'Users' ? 'Kết nối xã hội' : 'Nội dung nghệ sĩ'}</strong> với tỷ lệ {analytics.followStats.lean === 'Users' ? analytics.followStats.userRatio : analytics.followStats.artistRatio}%.
                </p>
                <p>
                  • <strong>Khuyến nghị:</strong> Tận dụng khung giờ vàng <strong>{analytics.peakHour.hour}</strong> để tối ưu hóa việc phân phối nội dung mới, giúp tiếp cận người dùng hiệu quả hơn.
                </p>
                <p>
                  • Chất lượng người dùng hiện đang ở mức <strong>{getUserQualityStatus(analytics.qualityUserRates.active).label}</strong> với {analytics.qualityUserRates.active.toFixed(1)}% user active. Cần duy trì và nâng cao trải nghiệm người dùng để giữ chân nhóm này.
                </p>
                <p>
                  • Tổng số bài đăng là <strong>{analytics.postStats.total}</strong> với mức tương tác đáng kể. Nên tiếp tục khuyến khích người dùng tạo nội dung đa dạng để duy trì sự sôi động trên nền tảng.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}