"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, subDays, subMonths, startOfYear, isAfter } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Trophy,
  Users,
  Music,
  TrendingUp,
  Search,
  MoreHorizontal,
  Eye,
  ArrowRight,
  Calendar,
  Filter,
  X,
  Trash2,
  User as UserIcon,
  Mail,
  MapPin,
  Clock
} from "lucide-react";

// --- 1. TYPES & MOCK DATA ---

type User = {
  id: number;
  username: string;
  fullName: string;
  gender: "Male" | "Female" | "Other";
  avatarUrl: string;
  email?: string; // Added for detail view
  location?: string; // Added for detail view
  joinDate?: string; // Added for detail view
};

type Artist = {
  id: number;
  name: string;
  imageUrl: string;
  spotifyId: string;
};

type FollowArtist = {
  id: number;
  followerId: number;
  artistId: number;
  artistSpotifyId: string;
  createdAt: string;
};

type FollowUser = {
  id: number;
  followerId: number; // Người đi follow
  followeeId: number; // Người được follow
  createdAt: string;
};

// Mock Data Generators
const MOCK_USERS: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  username: `user_${i + 1}`,
  fullName: i % 2 === 0 ? `Nguyễn Văn ${String.fromCharCode(65 + (i % 26))}` : `Trần Thị ${String.fromCharCode(65 + (i % 26))}`,
  gender: i % 2 === 0 ? "Male" : "Female",
  avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
  email: `user${i + 1}@example.com`,
  location: i % 3 === 0 ? "Hà Nội" : i % 3 === 1 ? "TP. Hồ Chí Minh" : "Đà Nẵng",
  joinDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
}));

const MOCK_ARTISTS: Artist[] = [
  { id: 101, name: "Sơn Tùng M-TP", imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=ST", spotifyId: "st_mtp_01" },
  { id: 102, name: "Đen Vâu", imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=DV", spotifyId: "den_vau_02" },
  { id: 103, name: "Chillies", imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=CH", spotifyId: "chillies_03" },
  { id: 104, name: "Hoàng Thùy Linh", imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=HTL", spotifyId: "htl_04" },
  { id: 105, name: "Mono", imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MN", spotifyId: "mono_05" },
  { id: 106, name: "Mỹ Tâm", imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MT", spotifyId: "my_tam_06" },
  { id: 107, name: "Hà Anh Tuấn", imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=HAT", spotifyId: "hat_07" },
];

// Generate random follows
const INIT_FOLLOW_ARTISTS: FollowArtist[] = Array.from({ length: 300 }, (_, i) => {
  const artist = MOCK_ARTISTS[Math.floor(Math.random() * MOCK_ARTISTS.length)];
  return {
    id: i + 1,
    followerId: Math.floor(Math.random() * 50) + 1,
    artistId: artist.id,
    artistSpotifyId: artist.spotifyId,
    // Random date within last year
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
  };
});

const INIT_FOLLOW_USERS: FollowUser[] = Array.from({ length: 200 }, (_, i) => {
  const followerId = Math.floor(Math.random() * 50) + 1;
  let followeeId = Math.floor(Math.random() * 50) + 1;
  while (followeeId === followerId) followeeId = Math.floor(Math.random() * 50) + 1;

  return {
    id: i + 1,
    followerId,
    followeeId,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
  };
});

// --- 2. HELPER FUNCTIONS ---

const getUserById = (id: number) => MOCK_USERS.find((u) => u.id === id);
const getArtistById = (id: number) => MOCK_ARTISTS.find((a) => a.id === id);

// --- 3. UI COMPONENTS ---

const Card = ({ children, className = "" }: any) => <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>{children}</div>;
const Badge = ({ children, className = "" }: any) => <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>{children}</span>;

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children, className = "" }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col ${className}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- 4. MAIN PAGE COMPONENT ---

export default function FollowsStatsPage() {
  const [activeTab, setActiveTab] = useState<"artists" | "users">("artists");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Data State
  const [followArtists, setFollowArtists] = useState<FollowArtist[]>(INIT_FOLLOW_ARTISTS);
  const [followUsers, setFollowUsers] = useState<FollowUser[]>(INIT_FOLLOW_USERS);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<"7days" | "30days" | "6months" | "year">("30days");
  const [visibleCount, setVisibleCount] = useState(10); // Pagination limit

  // Modal State
  const [showAllFollowersModal, setShowAllFollowersModal] = useState(false);
  const [selectedFollowerDetail, setSelectedFollowerDetail] = useState<User | null>(null);

  // --- LOGIC ---

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, timeFilter, activeTab]);

  // Handle Delete Follow
  const handleDeleteFollow = (recordId: number, type: "artist" | "user") => {
    if (confirm("Bạn có chắc chắn muốn xóa lượt theo dõi này không?")) {
      if (type === "artist") {
        setFollowArtists(prev => prev.filter(f => f.id !== recordId));
      } else {
        setFollowUsers(prev => prev.filter(f => f.id !== recordId));
      }
    }
  };

  // Filter Data by Time
  const filterByTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    switch (timeFilter) {
      case "7days": return isAfter(date, subDays(now, 7));
      case "30days": return isAfter(date, subDays(now, 30));
      case "6months": return isAfter(date, subMonths(now, 6));
      case "year": return isAfter(date, startOfYear(now));
      default: return true;
    }
  };

  // 1. Calculate Top Artists
  const topArtists = useMemo(() => {
    const filteredFollows = followArtists.filter(f => filterByTime(f.createdAt));
    const counts: Record<number, number> = {};

    filteredFollows.forEach((f) => {
      counts[f.artistId] = (counts[f.artistId] || 0) + 1;
    });

    let result = Object.entries(counts)
      .map(([artistId, count]) => {
        const artist = getArtistById(Number(artistId));
        return { ...artist, followerCount: count, rank: 0 };
      })
      .filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.followerCount - a.followerCount)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return result;
  }, [followArtists, timeFilter, searchQuery]);

  // 2. Calculate Top Users
  const topUsers = useMemo(() => {
    const filteredFollows = followUsers.filter(f => filterByTime(f.createdAt));
    const counts: Record<number, number> = {};

    filteredFollows.forEach((f) => {
      counts[f.followeeId] = (counts[f.followeeId] || 0) + 1;
    });

    let result = Object.entries(counts)
      .map(([userId, count]) => {
        const user = getUserById(Number(userId));
        return { ...user, followerCount: count, rank: 0 };
      })
      .filter(item =>
        item.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.followerCount - a.followerCount)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return result;
  }, [followUsers, timeFilter, searchQuery]);

  // 3. Stats
  const totalArtistFollows = followArtists.length;
  const totalUserFollows = followUsers.length;
  const mostPopularArtist = topArtists[0];
  const mostPopularUser = topUsers[0];

  // Get Followers for Selected Item
  const getFollowersOfSelected = (limit?: number) => {
    if (!selectedItem) return [];
    let list = [];

    if (activeTab === "artists") {
      list = followArtists
        .filter(f => f.artistId === selectedItem.id)
        .map(f => ({ ...f, follower: getUserById(f.followerId) }));
    } else {
      list = followUsers
        .filter(f => f.followeeId === selectedItem.id)
        .map(f => ({ ...f, follower: getUserById(f.followerId) }));
    }

    // Sort by newest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return limit ? list.slice(0, limit) : list;
  };

  const followersList = getFollowersOfSelected(); // Full list for modal
  const followersPreview = getFollowersOfSelected(10); // Preview list for sidebar

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8 font-sans text-gray-900">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Thống Kê Theo Dõi</h1>
          <p className="text-gray-500 mt-1">Tổng quan về xu hướng quan tâm của người dùng trên hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-lg flex items-center p-1 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400 ml-2" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer py-1 pl-2 pr-8"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="6months">6 tháng qua</option>
              <option value="year">Năm nay</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors">
            <TrendingUp className="w-4 h-4" /> Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-start justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng Follow Artist</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalArtistFollows}</h3>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded mt-2 inline-block">Toàn thời gian</span>
          </div>
          <div className="p-3 bg-pink-100 rounded-lg text-pink-600">
            <Music className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-start justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng Follow User</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalUserFollows}</h3>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-2 inline-block">Toàn thời gian</span>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-start justify-between relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500">Artist Hot Nhất ({timeFilter})</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1 truncate max-w-[150px]">{mostPopularArtist?.name || "N/A"}</h3>
            <p className="text-xs text-gray-500 mt-1">{mostPopularArtist?.followerCount || 0} lượt theo dõi mới</p>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600 relative z-10">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-amber-50 to-transparent rounded-full opacity-50" />
        </Card>

        <Card className="p-5 flex items-start justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-gray-500">User Hot Nhất ({timeFilter})</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1 truncate max-w-[150px]">{mostPopularUser?.fullName || "N/A"}</h3>
            <p className="text-xs text-gray-500 mt-1">{mostPopularUser?.followerCount || 0} lượt theo dõi mới</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: LEADERBOARD LIST */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white sticky top-0 z-10 gap-4">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("artists")}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "artists"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Top Nghệ Sĩ
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "users"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Top Người Dùng
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Tìm kiếm ${activeTab === 'artists' ? 'nghệ sĩ' : 'người dùng'}...`}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider sticky top-0">
                    <th className="px-6 py-4 font-semibold w-16 text-center">Hạng</th>
                    <th className="px-6 py-4 font-semibold">{activeTab === "artists" ? "Nghệ Sĩ" : "Người Dùng"}</th>
                    <th className="px-6 py-4 font-semibold text-right">Lượt Theo Dõi</th>
                    <th className="px-6 py-4 font-semibold text-right hidden sm:table-cell">Mức Độ</th>
                    <th className="px-6 py-4 font-semibold w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(activeTab === "artists" ? topArtists : topUsers).slice(0, visibleCount).map((item) => {
                    const maxCount = activeTab === "artists" ? (topArtists[0]?.followerCount || 1) : (topUsers[0]?.followerCount || 1);
                    const percentage = Math.round(((item as any).followerCount / maxCount) * 100);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-blue-50/50 transition-colors group cursor-pointer ${selectedItem?.id === item.id ? 'bg-blue-50/80 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <td className="px-6 py-4 text-center">
                          {item.rank === 1 && <span className="text-xl drop-shadow-sm">🥇</span>}
                          {item.rank === 2 && <span className="text-xl drop-shadow-sm">🥈</span>}
                          {item.rank === 3 && <span className="text-xl drop-shadow-sm">🥉</span>}
                          {item.rank > 3 && <span className="text-sm font-bold text-gray-400">#{item.rank}</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={item.avatarUrl || (item as any).imageUrl}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-110 transition-transform"
                              />
                              {activeTab === "artists" && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border border-white">
                                  <Music className="w-2 h-2" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {activeTab === "artists" ? (item as any).name : (item as any).fullName}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {activeTab === "artists" ? `ID: ${(item as any).spotifyId}` : `@${(item as any).username}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-gray-900">{(item as any).followerCount}</span>
                        </td>
                        <td className="px-6 py-4 text-right w-32 hidden sm:table-cell">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${activeTab === 'artists' ? 'bg-pink-500' : 'bg-blue-500'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8">{percentage}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                            className={`p-2 rounded-full hover:shadow-sm transition-all ${selectedItem?.id === item.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-white'}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {(activeTab === "artists" ? topArtists : topUsers).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        Không tìm thấy kết quả nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(activeTab === "artists" ? topArtists : topUsers).length > visibleCount && (
              <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                <button
                  onClick={() => setVisibleCount(20)}
                  className="text-sm text-blue-600 font-medium hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  Xem top 20 kết quả <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: SELECTED DETAILS */}
        <div className="lg:col-span-1">
          {selectedItem ? (
            <Card className="sticky top-6 animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-white to-gray-50 rounded-t-xl relative">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center text-center">
                  <img
                    src={selectedItem.avatarUrl || selectedItem.imageUrl}
                    alt="Detail Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-900 px-2">
                    {activeTab === "artists" ? selectedItem.name : selectedItem.fullName}
                  </h3>
                  <Badge className={`mt-2 ${activeTab === 'artists' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                    #{selectedItem.rank} {activeTab === 'artists' ? 'Top Nghệ Sĩ' : 'Top User'}
                  </Badge>

                  <div className="grid grid-cols-2 gap-4 w-full mt-6">
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Followers</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{selectedItem.followerCount}</p>
                      <p className="text-[10px] text-gray-400 mt-1">trong {timeFilter === '7days' ? '7 ngày' : timeFilter === '30days' ? '30 ngày' : 'giai đoạn này'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Xu Hướng</p>
                      <p className="text-lg font-bold text-green-600 flex items-center justify-center gap-1 mt-1">
                        <TrendingUp className="w-4 h-4" /> High
                      </p>
                      <p className="text-[10px] text-green-600/70 mt-1">Đang tăng trưởng</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" /> Followers gần đây
                </h4>
                <button
                  onClick={() => setShowAllFollowersModal(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline px-2 py-1 rounded"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                {followersPreview.length > 0 ? (
                  followersPreview.map((record: any) => (
                    <div key={record.id} className="flex items-center p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-100 mb-1">
                      <img
                        src={record.follower?.avatarUrl}
                        className="w-9 h-9 rounded-full bg-gray-200 object-cover"
                        alt="follower"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{record.follower?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(record.createdAt), "dd MMM, HH:mm", { locale: vi })}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedFollowerDetail(record.follower)}
                        className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-full transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                    <Users className="w-8 h-8 text-gray-300 mb-2" />
                    Chưa có lượt theo dõi nào trong khoảng thời gian này.
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-64 flex flex-col items-center justify-center text-gray-400 p-6 text-center border-dashed border-2 bg-gray-50/30 sticky top-6">
              <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                <Filter className="w-8 h-8 text-blue-300" />
              </div>
              <p className="font-medium text-gray-500">Chọn một mục để xem chi tiết</p>
              <p className="text-sm text-gray-400 mt-1">Nhấp vào hàng bất kỳ trong bảng bên trái</p>
            </Card>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Modal Xem Tất Cả Followers */}
      <Modal
        isOpen={showAllFollowersModal}
        onClose={() => setShowAllFollowersModal(false)}
        title={`Danh sách người theo dõi (${selectedItem?.followerCount || 0})`}
        className="max-w-2xl h-[600px]"
      >
        <div className="divide-y divide-gray-100">
          {followersList.map((record: any) => (
            <div key={record.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={record.follower?.avatarUrl}
                  className="w-10 h-10 rounded-full bg-gray-200 object-cover border border-gray-100"
                  alt="follower"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{record.follower?.fullName}</p>
                  <p className="text-xs text-gray-500">@{record.follower?.username}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Đã theo dõi: {format(new Date(record.createdAt), "dd MMM yyyy 'lúc' HH:mm", { locale: vi })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-2">
                <button
                  onClick={() => setSelectedFollowerDetail(record.follower)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  Chi tiết
                </button>
                <button
                  onClick={() => handleDeleteFollow(record.id, activeTab === "artists" ? "artist" : "user")}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa lượt theo dõi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {followersList.length === 0 && (
            <div className="p-12 text-center text-gray-500">Không có dữ liệu.</div>
          )}
        </div>
      </Modal>

      {/* 2. Modal Chi Tiết Người Dùng */}
      <Modal
        isOpen={!!selectedFollowerDetail}
        onClose={() => setSelectedFollowerDetail(null)}
        title="Thông tin người dùng"
        className="max-w-md"
      >
        {selectedFollowerDetail && (
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <img
                src={selectedFollowerDetail.avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-md mb-3 object-cover"
              />
              <h2 className="text-xl font-bold text-gray-900">{selectedFollowerDetail.fullName}</h2>
              <p className="text-gray-500 font-medium">@{selectedFollowerDetail.username}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                  <p className="text-sm text-gray-900 break-all">{selectedFollowerDetail.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Giới tính</p>
                  <p className="text-sm text-gray-900">
                    {selectedFollowerDetail.gender === 'Male' ? 'Nam' : selectedFollowerDetail.gender === 'Female' ? 'Nữ' : 'Khác'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Khu vực</p>
                  <p className="text-sm text-gray-900">{selectedFollowerDetail.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Ngày tham gia</p>
                  <p className="text-sm text-gray-900">
                    {selectedFollowerDetail.joinDate
                      ? format(new Date(selectedFollowerDetail.joinDate), "dd MMM yyyy", { locale: vi })
                      : "N/A"
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setSelectedFollowerDetail(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Gửi tin nhắn
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}