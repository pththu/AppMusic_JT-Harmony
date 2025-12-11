"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import {
  Music,
  Disc,
  ListMusic,
  TrendingUp,
  Search,
  Clock,
  Mic2,
  Calendar,
  Database,
  Heart,
  MousePointerClick
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
import { useMusicStore, useUserStore } from "@/store";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useHistoryStore } from "@/store/historyStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

// --- UI COMPONENTS ---
// const Card = ({ children, className = "" }) => (
//   <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
// );
// const CardHeader = ({ children, className = "" }) => (
//   <div className={`p-6 pb-2 ${className}`}>{children}</div>
// );
// const CardTitle = ({ children, className = "" }) => (
//   <h3 className={`font-semibold text-gray-900 ${className}`}>{children}</h3>
// );
// const CardDescription = ({ children, className = "" }) => (
//   <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
// );
// const CardContent = ({ children, className = "" }) => (
//   <div className={`p-6 pt-2 ${className}`}>{children}</div>
// );

// --- HELPER FUNCTIONS ---
const getQualityScore = (durationListened, totalDuration) => {
  if (!totalDuration || totalDuration === 0) return 0;
  return (durationListened / totalDuration) > 0.3 ? 1 : 0;
};

// --- ANALYTICS LOGIC ---
const analyzeData = ({
  timeRangeDays,
  listenHistories,
  searchHistories,
  favoriteTracks,
  favoritePlaylists,
  favoriteAlbums,
  tracks,
  artists,
  albums,
  playlists,
  users
}) => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (timeRangeDays * 24 * 60 * 60 * 1000));

  // 1. DATABASE TOTALS (Không lọc theo thời gian)
  const dbTotals = {
    tracks: tracks.length,
    playlists: playlists.length,
    artists: artists.length,
    albums: albums.length,
  };

  // 2. FILTER DATA BY TIME RANGE
  const filteredHistory = listenHistories.filter(item => new Date(item.createdAt) >= pastDate);
  const filteredSearches = searchHistories.filter(item => new Date(item.searchedAt) >= pastDate);

  // Lọc Favorites từ 3 nguồn riêng biệt
  const filteredFavTracks = favoriteTracks.filter(item => new Date(item.createdAt) >= pastDate);
  const filteredFavPlaylists = favoritePlaylists.filter(item => new Date(item.createdAt) >= pastDate);
  const filteredFavAlbums = favoriteAlbums.filter(item => new Date(item.createdAt) >= pastDate);

  // 3. TREND CHART DATA (LINE CHART)
  const trendMap = new Map();
  // Tạo khung thời gian liên tục
  const step = Math.max(1, Math.floor(timeRangeDays / 30)); // Giảm điểm dữ liệu nếu khoảng thời gian dài
  for (let i = 0; i <= timeRangeDays; i += step) {
    const d = new Date(pastDate.getTime() + (i * 24 * 60 * 60 * 1000));
    if (d <= now) {
      const dateKey = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      trendMap.set(dateKey, { name: dateKey, plays: 0, searches: 0 });
    }
  }

  filteredHistory.forEach(item => {
    const date = new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    if (trendMap.has(date)) trendMap.get(date).plays += 1;
  });

  filteredSearches.forEach(item => {
    const date = new Date(item.searchedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    if (trendMap.has(date)) trendMap.get(date).searches += 1;
  });

  const trendData = Array.from(trendMap.values());

  // 4. TOP CONTENT (Tracks/Artists/Albums) - Có trọng số chất lượng
  const trackStats = [];
  const artistStats = [];
  const albumStats = [];

  filteredHistory.forEach(history => {
    if (history.itemType === 'track') {
      const track = tracks.find(t => t.id === history.itemId);
      if (track) {
        const qualityPoint = getQualityScore(history.durationListened, track.duration);
        if (!trackStats[track.name]) trackStats[track.name] = {
          count: 0,
          qualityCount: 0,
          playCount: 0,
          artist: track.artists?.map(a => a.name).join(', ') || 'N/A'
        };

        trackStats[track.name].count += 1;
        trackStats[track.name].playCount = track.playCount;
        trackStats[track.name].qualityCount += qualityPoint;

        const artistName = track.artists[0].name;
        if (!artistStats[artistName]) artistStats[artistName] = 0;
        artistStats[artistName] += 1;
      }
    } else if (history.itemType === 'artist') {
      const artist = artists.find(a => a.id === history.itemId);
      if (artist) {
        artistStats[artist.name] = (artistStats[artist.name] || 0) + 1;
      }
    } else if (history.itemType === 'album') {
      const album = albums.find(a => a.id === history.itemId);
      if (album) {
        albumStats[album.name] = (albumStats[album.name] || 0) + 1;
      }
    }
  });

  const topTracks = Object.entries(trackStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a: any, b: any) => b.qualityCount - a.qualityCount).slice(0, 5);

  const topArtists = Object.entries(artistStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count).slice(0, 5);
  const topAlbums = Object.entries(albumStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count).slice(0, 5);

  // 5. BEHAVIOR & FAVORITE RATE ANALYSIS
  // Tỷ lệ yêu thích = (Tổng số mục được thêm vào 3 danh sách Favorites trong kỳ) / (Tổng số Item unique đã tương tác trong kỳ) * 100
  const uniqueItemsInteracted = new Set(filteredHistory.map(h => `${h.itemType}_${h.itemId}`)).size;
  const favoritesAdded = filteredFavTracks.length + filteredFavPlaylists.length + filteredFavAlbums.length;

  const favoriteRate = uniqueItemsInteracted > 0
    ? ((favoritesAdded / uniqueItemsInteracted) * 100).toFixed(1)
    : "0";

  const wordCounts: Record<string, number> = {};

  filteredSearches.forEach(search => {
    // Tách chuỗi tìm kiếm thành các từ, bỏ khoảng trắng dư thừa
    const words = search?.query?.toLowerCase().trim().split(/\s+/);
    words?.forEach(word => {
      // Chỉ đếm các từ có ý nghĩa (độ dài > 1 ký tự)
      if (word.length > 1) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });

  const topKeywords = Object.entries(wordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Tỷ lệ Search-to-Play (Trung bình bao nhiêu lượt nghe cho 1 lần tìm kiếm)
  const searchToPlayRatio = filteredSearches.length > 0
    ? (filteredHistory.length / filteredSearches.length).toFixed(1)
    : "0";

  // 6. PEAK HOUR & GENRES
  const hourMap = new Array(24).fill(0);
  filteredHistory.forEach(item => hourMap[new Date(item.createdAt).getHours()] += 1);
  const peakHourIndex = hourMap.indexOf(Math.max(...hourMap));
  const peakHourStr = `${peakHourIndex}:00 - ${peakHourIndex + 1}:00`;

  const genreCounts = {};
  users.forEach(user => user?.favoritesGenres?.forEach(g => genreCounts[g] = (genreCounts[g] || 0) + 1));
  const genreData = Object.entries(genreCounts).map(([name, value], i) => ({
    name, value, color: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#22c55e", "#ef4444"][i % 7]
  }));

  const totalGenreCount = genreData.reduce((sum, g: any) => sum + g.value, 0);

  return {
    dbTotals,
    trendData,
    topTracks,
    topArtists,
    topAlbums,
    peakHourStr,
    genreData,
    favoriteRate,
    topKeywords,
    searchToPlayRatio,
    totalGenreCount
  };
};

const renderCustomTooltip = ({ active, payload, label }, totalGenreCount) => {
  if (active && payload && payload.length) {
    // Lấy dữ liệu từ payload (chỉ cần phần tử đầu tiên)
    const data = payload[0];
    const genreName = data.name;
    const rawValue = data.value;
    const totalCount = totalGenreCount;

    // Tính phần trăm
    const percentage = totalCount > 0 ? ((rawValue / totalCount) * 100).toFixed(1) : 0;

    return (
      <div
        style={{
          backgroundColor: '#fff',
          padding: '5px 10px',
          border: '1px solid #ccc',
          // ĐIỀU CHỈNH CỠ CHỮ NHỎ HƠN Ở ĐÂY
          fontSize: '12px'
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>{genreName}</p>
        {/* HIỂN THỊ PHẦN TRĂM */}
        <p style={{ margin: 0 }}>{`${percentage}% (${rawValue} )`}</p>
      </div>
    );
  }
  return null;
};

export default function MusicDashboard() {
  const [timeRange, setTimeRange] = useState(30); // Default 30 days

  const { users, fetchUsers } = useUserStore();
  const { tracks, albums, playlists, artists, fetchTracks, fetchArtists, fetchAlbums, fetchPlaylists } = useMusicStore();
  const { favoriteTracks, favoritePlaylists, favoriteAlbums, fetchFavoriteItems } = useFavoritesStore();
  const { searchHistories, listenHistories, fetchSearchHistories, fetchListenHistories } = useHistoryStore();

  const {
    dbTotals,
    trendData,
    topTracks,
    topArtists,
    topAlbums,
    peakHourStr,
    genreData,
    favoriteRate,
    topKeywords,
    searchToPlayRatio,
    totalGenreCount
  } = useMemo(() => analyzeData({
    timeRangeDays: timeRange,
    listenHistories,
    searchHistories,
    favoriteTracks,
    favoritePlaylists,
    favoriteAlbums,
    tracks,
    artists,
    albums,
    playlists,
    users
  }), [
    timeRange,
    listenHistories,
    searchHistories,
    favoriteTracks,
    favoritePlaylists,
    favoriteAlbums,
    tracks,
    artists,
    albums,
    playlists
  ]);

  useEffect(() => {
    if (listenHistories.length === 0) fetchListenHistories();
    if (searchHistories.length === 0) fetchSearchHistories();
    if (tracks.length === 0) fetchTracks();
    if (artists.length === 0) fetchArtists();
    if (albums.length === 0) fetchAlbums();
    if (playlists.length === 0) fetchPlaylists();
    if (users.length === 0) fetchUsers();
    if (favoriteTracks.length === 0 || favoritePlaylists.length === 0 || favoriteAlbums.length === 0) {
      fetchFavoriteItems();
    }
  }, [fetchListenHistories, fetchSearchHistories, fetchTracks, fetchArtists, fetchAlbums, fetchPlaylists, fetchUsers, fetchFavoriteItems]);

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen font-sans text-slate-800">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tổng quan thống kê dữ liệu</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Phân tích dữ liệu & Xu hướng
          </p>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          {[
            { label: '7 Ngày', value: 7 },
            { label: '30 Ngày', value: 30 },
            { label: '6 Tháng', value: 180 },
            { label: 'Năm nay', value: 365 }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${timeRange === range.value
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. DATABASE TOTALS (Static Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Tổng Bài Hát", value: dbTotals.tracks, icon: Music, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Tổng Playlist", value: dbTotals.playlists, icon: ListMusic, color: "text-green-600", bg: "bg-green-50" },
          { title: "Tổng Nghệ Sĩ", value: dbTotals.artists, icon: Mic2, color: "text-purple-600", bg: "bg-purple-50" },
          { title: "Tổng Album", value: dbTotals.albums, icon: Disc, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((item, idx) => (
          <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{item.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{item.value.toLocaleString()}</h3>
                <span className="text-xs text-gray-400">items in database</span>
              </div>
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Behavior Analytics Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search & Behavior */}
          <Card className="shadow-md border-none bg-white">
            <CardHeader>
              <CardTitle>Hành Vi & Tìm Kiếm</CardTitle>
              <CardDescription>Phân tích từ khóa và tương tác</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Top Keywords */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center">
                  <Search className="w-3 h-3 mr-1" /> Từ khóa phổ biến
                </h4>
                <div className="flex flex-wrap gap-2">
                  {topKeywords.length > 0 ? topKeywords.map((k, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {k.keyword} <span className="text-gray-400 ml-1">{k.count}</span>
                    </span>
                  )) : <span className="text-gray-400 text-sm">Chưa có dữ liệu</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Search to Play Ratio */}
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="text-indigo-600 mb-1"><MousePointerClick className="w-5 h-5" /></div>
                  <div className="text-2xl font-bold text-gray-900">{searchToPlayRatio}</div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase">Lượt nghe / Tìm kiếm</div>
                </div>

                {/* Favorite Rate */}
                <div className="p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <div className="text-pink-600 mb-1"><Heart className="w-5 h-5" /></div>
                  <div className="text-2xl font-bold text-gray-900">{favoriteRate}%</div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase">Tỷ lệ Yêu thích</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peak Hour */}
          <Card className="shadow-md border-none bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg"><Clock className="w-5 h-5 text-yellow-400" /></div>
                <div>
                  <div className="text-sm text-gray-300 font-medium">Khung giờ vàng</div>
                  <div className="text-2xl font-bold text-white">{peakHourStr}</div>
                </div>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 w-3/4 rounded-full"></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Người dùng hoạt động tích cực nhất</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Lists Column */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Tracks */}
          <Card className="shadow-md border-none h-full">
            <CardHeader>
              <CardTitle>Top Bài Hát</CardTitle>
              <CardDescription>Xếp hạng theo chất lượng nghe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topTracks.length > 0 ? topTracks.map((track, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">{track.name}</p>
                        <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900 block">{track?.playCount}</span>
                      <span className="text-[10px] text-gray-400">plays</span>
                    </div>
                  </div>
                )) : <p className="text-gray-400 text-center text-sm">Chưa có dữ liệu</p>}
              </div>
            </CardContent>
          </Card>

          {/* Top Artists & Albums */}
          <div className="space-y-6">
            <Card className="shadow-md border-none">
              <CardHeader className="pb-2">
                <CardTitle>Top Nghệ Sĩ</CardTitle>
              </CardHeader>
              <CardContent>
                {topArtists.slice(0, 3).map((artist, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-100">
                    <span className="text-sm font-medium text-gray-700">{artist.name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{artist.count} plays</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-md border-none">
              <CardHeader className="pb-2">
                <CardTitle>Tỉ lệ yêu thích theo thể loại</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="h-28 w-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={genreData} innerRadius={30} outerRadius={45} paddingAngle={5} dataKey="value">
                        {genreData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      {/* <Tooltip /> */}
                      <Tooltip
                        content={(props: any) => renderCustomTooltip(props, totalGenreCount)}
                      // Có thể bỏ qua 'contentStyle' vì style đã nằm trong custom component
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-1">
                  {genreData.sort((a: any, b: any) => b?.value - a?.value).slice(0, 4).map((g, i) => (
                    <div key={i} className="flex items-center text-xs">
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: g.color }}></div>
                      <span className="truncate">{g.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 2. Main Trend Chart - UPDATED TO LINE CHART */}
      <Card className="shadow-md border-none overflow-hidden">
        <CardHeader className="border-b border-gray-100 flex justify-between items-center">
          <div>
            <CardTitle>Xu Hướng Hoạt Động</CardTitle>
            <CardDescription>Lượt nghe và tìm kiếm trong {timeRange} ngày qua</CardDescription>
          </div>
          <Calendar className="text-gray-400 w-5 h-5" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="plays"
                  name="Lượt nghe"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="searches"
                  name="Tìm kiếm"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Behavior & Top Lists */}

    </div>
  );
}