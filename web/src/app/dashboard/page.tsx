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
  Share2
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
import { format, subDays, getHours, isSameDay, parseISO } from "date-fns";

// --- TYPES (Updated for Follows/Artists) ---
interface User {
  id: number;
  username: string;
  status: 'active' | 'inactive' | 'locked' | 'banned';
  createdAt: string;
  lastLogin: string | null;
  favoritesGenres: string[];
}

interface ListenHistory {
  id: number;
  userId: number;
  itemType: 'track' | 'album';
  createdAt: string;
}

interface SearchHistory {
  id: number;
  query: string;
  searchedAt: string;
}

interface Track {
  id: number;
  name: string;
  artists: { name: string }[];
}

interface Artist {
  id: number;
  name: string;
}

// Tách biệt Interface Follow User
interface FollowUser {
  id: number;
  followerId: number;
  followeeId: number; // ID người được theo dõi
  createdAt: string;
}

// Tách biệt Interface Follow Artist
interface FollowArtist {
  id: number;
  followerId: number;
  artistId: number; // ID nghệ sĩ được theo dõi
  createdAt: string;
}

// --- UI COMPONENTS ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-2 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "success" | "warning" | "danger" | "default" }) => {
  const styles = {
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    default: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]}`}>{children}</span>;
};

// --- MOCK DATA GENERATORS ---
const generateMockDatabase = () => {
  const now = new Date();

  // 1. Mock Users
  const users: User[] = Array.from({ length: 500 }).map((_, i) => {
    const isInactive = Math.random() > 0.8;
    return {
      id: 3000 + i,
      username: `user_${i}`,
      status: isInactive ? 'inactive' : 'active',
      createdAt: subDays(now, Math.floor(Math.random() * 30)).toISOString(),
      lastLogin: isInactive ? null : subDays(now, Math.floor(Math.random() * 5)).toISOString(),
      favoritesGenres: Math.random() > 0.5 ? ['POP', 'DANCE'] : ['K-POP']
    };
  });

  // 2. Mock Listen History
  const listenHistory: ListenHistory[] = Array.from({ length: 2500 }).map((_, i) => ({
    id: 7000 + i,
    userId: 3000 + Math.floor(Math.random() * 500),
    itemType: Math.random() > 0.8 ? 'album' : 'track',
    createdAt: (() => {
      const date = subDays(now, Math.floor(Math.random() * 7));
      const hour = Math.random() > 0.7 ? 20 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 24);
      date.setHours(hour, Math.floor(Math.random() * 60));
      return date.toISOString();
    })()
  }));

  // 3. Mock Search History
  const searchHistory: SearchHistory[] = Array.from({ length: 1200 }).map((_, i) => ({
    id: 5000 + i,
    query: "BTS",
    searchedAt: subDays(now, Math.floor(Math.random() * 7)).toISOString()
  }));

  // 4. Mock Tracks & Artists
  const tracks: Track[] = Array.from({ length: 200 }).map((_, i) => ({
    id: 5000 + i,
    name: `Song ${i}`,
    artists: [{ name: "Artist" }]
  }));

  const artists: Artist[] = Array.from({ length: 60 }).map((_, i) => ({
    id: 100 + i,
    name: `Artist ${i}`
  }));

  // 5. Mock Follow Users (Table: follow_users)
  const followUsers: FollowUser[] = Array.from({ length: 900 }).map((_, i) => ({
    id: 37000 + i,
    followerId: 3000 + Math.floor(Math.random() * 500),
    followeeId: 3000 + Math.floor(Math.random() * 500),
    createdAt: subDays(now, Math.floor(Math.random() * 30)).toISOString()
  }));

  // 6. Mock Follow Artists (Table: follow_artists)
  const followArtists: FollowArtist[] = Array.from({ length: 600 }).map((_, i) => ({
    id: 13000 + i,
    followerId: 3000 + Math.floor(Math.random() * 500),
    artistId: 100 + Math.floor(Math.random() * 60),
    createdAt: subDays(now, Math.floor(Math.random() * 30)).toISOString()
  }));

  return { users, listenHistory, searchHistory, tracks, artists, followUsers, followArtists };
};

// --- DASHBOARD COMPONENT ---
export default function AnalyticalDashboard() {
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<{
    users: User[];
    listenHistory: ListenHistory[];
    searchHistory: SearchHistory[];
    tracks: Track[];
    artists: Artist[];
    followUsers: FollowUser[];
    followArtists: FollowArtist[];
  } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setDb(generateMockDatabase());
      setLoading(false);
    }, 800);
  }, []);

  const analytics = useMemo(() => {
    if (!db) return null;

    // 1. Hourly Activity (Heatmap)
    const hourlyCounts = new Array(24).fill(0);
    db.listenHistory.forEach(h => hourlyCounts[getHours(parseISO(h.createdAt))]++);
    db.searchHistory.forEach(s => hourlyCounts[getHours(parseISO(s.searchedAt))]++);

    const hourlyData = hourlyCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      activity: count,
      isPeak: false
    }));

    const maxActivity = Math.max(...hourlyCounts);
    const peakHourIndex = hourlyCounts.indexOf(maxActivity);
    hourlyData[peakHourIndex].isPeak = true;

    // 2. User Growth
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
    const growthData = last7Days.map(date => {
      const dayUsers = db.users.filter(u => isSameDay(parseISO(u.createdAt), date));
      const newCount = dayUsers.length;
      const churnCount = dayUsers.filter(u => u.status === 'inactive').length;
      return {
        date: format(date, "dd/MM"),
        newUsers: newCount,
        churnedUsers: churnCount,
        netGrowth: newCount - churnCount
      };
    });
    const totalNetGrowth = growthData.reduce((acc, curr) => acc + curr.netGrowth, 0);

    // 3. Productivity Score (Mức độ năng suất)
    // Tính dựa trên tổng lượng Action trên mỗi User Active
    const activeUsers = db.users.filter(u => u.status === 'active').length;
    // Tổng hợp actions từ tất cả các nguồn
    const totalActions = db.listenHistory.length + db.searchHistory.length + db.followUsers.length + db.followArtists.length;

    // Giả sử benchmark năng suất là 20 actions/user/tuần là 100 điểm
    const productivityRaw = totalActions / (activeUsers || 1);
    const productivityScore = Math.min(Math.round((productivityRaw / 15) * 100), 100);

    // 4. Information Balance (Cân bằng thông tin)
    // Radar Chart: Users, Artists, User Follows, Artist Follows, Tracks, Engagement
    const userCount = db.users.length;
    const artistCount = db.artists.length;
    // Dữ liệu follow lấy từ 2 mảng riêng biệt
    const userFollowsCount = db.followUsers.length;
    const artistFollowsCount = db.followArtists.length;

    // Chuẩn hóa về thang 100 để vẽ biểu đồ
    const radarData = [
      { subject: 'Users', A: Math.min((userCount / 600) * 100, 100), fullMark: 100 },
      { subject: 'Artists', A: Math.min((artistCount / 100) * 100, 100), fullMark: 100 },
      { subject: 'Follow (User)', A: Math.min((userFollowsCount / (userCount * 2)) * 100, 100), fullMark: 100 }, // Avg 2 follows/user is good
      { subject: 'Follow (Artist)', A: Math.min((artistFollowsCount / (userCount * 2)) * 100, 100), fullMark: 100 },
      { subject: 'Tracks', A: Math.min((db.tracks.length / 300) * 100, 100), fullMark: 100 },
      { subject: 'Engagement', A: Math.min((db.listenHistory.length / (userCount * 10)) * 100, 100), fullMark: 100 },
    ];

    return {
      hourlyData,
      peakHour: { hour: `${peakHourIndex}:00`, activity: maxActivity },
      growthData,
      totalNetGrowth,
      productivityScore,
      radarData,
      stats: {
        activeUsers,
        totalActions,
        userFollows: userFollowsCount,
        artistFollows: artistFollowsCount
      }
    };
  }, [db]);

  const getProductivityStatus = (score: number) => {
    if (score >= 80) return { label: "Hiệu suất cao", color: "text-purple-600", icon: Zap };
    if (score >= 60) return { label: "Tích cực", color: "text-blue-600", icon: Activity };
    if (score >= 40) return { label: "Trung bình", color: "text-yellow-600", icon: CheckCircle2 };
    return { label: "Thấp", color: "text-gray-500", icon: AlertTriangle };
  };

  if (loading || !analytics) {
    return <div className="flex h-screen items-center justify-center text-gray-500 animate-pulse">Đang đồng bộ dữ liệu database...</div>;
  }

  const ProdIcon = getProductivityStatus(analytics.productivityScore).icon;

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

        {/* PRODUCTIVITY SCORECARD */}
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mức Độ Năng Suất</p>
            <div className={`text-2xl font-black ${getProductivityStatus(analytics.productivityScore).color} flex items-center gap-2`}>
              {analytics.productivityScore}/100
              <ProdIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div className="text-sm">
            <p className="text-slate-500">Trạng thái:</p>
            <p className={`font-medium ${getProductivityStatus(analytics.productivityScore).color}`}>
              {getProductivityStatus(analytics.productivityScore).label}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: KEY EVALUATIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Insight 1: Activity Peak */}
        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <Badge variant="success">Peak Time</Badge>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Khung Giờ Vàng</h3>
            <p className="text-3xl font-bold mt-2 text-indigo-900">{analytics.peakHour.hour}</p>
            <p className="text-sm text-slate-600 mt-2">
              Đỉnh điểm hoạt động với <span className="font-bold">{analytics.peakHour.activity}</span> tương tác.
              <br />Thời điểm tốt nhất để đẩy thông báo.
            </p>
          </CardContent>
        </Card>

        {/* Insight 2: Retention Analysis */}
        <Card className={`border-l-4 ${analytics.totalNetGrowth > 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${analytics.totalNetGrowth > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <UsersIcon className={`w-6 h-6 ${analytics.totalNetGrowth > 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <Badge variant={analytics.totalNetGrowth > 0 ? 'success' : 'danger'}>
                {analytics.totalNetGrowth > 0 ? 'Tích cực' : 'Tiêu cực'}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Tăng Trưởng Ròng</h3>
            <p className={`text-3xl font-bold mt-2 ${analytics.totalNetGrowth > 0 ? 'text-green-700' : 'text-red-700'}`}>
              {analytics.totalNetGrowth > 0 ? '+' : ''}{analytics.totalNetGrowth}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              User mới trừ đi User Inactive. Hệ thống đang {analytics.totalNetGrowth > 0 ? 'mở rộng' : 'thu hẹp'} quy mô.
            </p>
          </CardContent>
        </Card>

        {/* Insight 3: Connection Volume */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <Badge variant="default">Connections</Badge>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Mạng Lưới Kết Nối</h3>
            <p className="text-3xl font-bold mt-2 text-blue-800">
              {analytics.stats.userFollows + analytics.stats.artistFollows}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Tổng lượt theo dõi (User & Artist). Thể hiện độ gắn kết của cộng đồng.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Radar Chart: Information Balance */}
        <Card className="lg:col-span-1 shadow-md border-none">
          <CardHeader>
            <CardTitle>Cân Bằng Thông Tin</CardTitle>
            <CardDescription>Phân bố Users, Artists và Follows</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analytics.radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Hiện tại"
                    dataKey="A"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="#6366f1"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Composed Chart: Growth vs Churn */}
        <Card className="lg:col-span-2 shadow-md border-none">
          <CardHeader>
            <CardTitle>Biến Động Người Dùng (7 Ngày)</CardTitle>
            <CardDescription>So sánh người dùng mới đăng ký và người dùng ngừng hoạt động</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={analytics.growthData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="newUsers" name="Đăng ký mới" barSize={20} fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="churnedUsers" name="Inactive" barSize={20} fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="netGrowth" name="Tăng trưởng ròng" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} />
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
            <CardTitle>Biểu Đồ Nhiệt: Hoạt Động Theo Giờ</CardTitle>
            <CardDescription>Phân tích mật độ request trong 24h từ Log History</CardDescription>
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
                      fill={entry.isPeak ? '#4f46e5' : '#cbd5e1'}
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
              <h3 className="text-xl font-bold">Báo Cáo Tự Động Từ Cơ Sở Dữ Liệu</h3>
              <div className="mt-4 space-y-3 text-slate-300 text-sm leading-relaxed">
                <p>
                  • <strong>Hiệu suất hệ thống:</strong> Đạt mức <span className="text-white font-bold">{analytics.productivityScore}/100</span>.
                  Tổng cộng <strong>{analytics.stats.totalActions}</strong> hành động (nghe nhạc, tìm kiếm, follow) được thực hiện bởi {analytics.stats.activeUsers} user active.
                </p>
                <p>
                  • <strong>Mạng lưới thông tin:</strong> Biểu đồ Radar cho thấy sự cân bằng giữa Users và Artists.
                  Tỷ lệ <strong>{analytics.stats.userFollows}</strong> follow user so với <strong>{analytics.stats.artistFollows}</strong> follow artist cho thấy cộng đồng quan tâm nhiều hơn đến tương tác xã hội/nghệ sĩ.
                </p>
                <p>
                  • <strong>Khuyến nghị:</strong> Tận dụng khung giờ vàng <strong>{analytics.peakHour.hour}</strong> để tối ưu hóa việc phân phối nội dung mới, giúp tăng thêm chỉ số Engagement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}