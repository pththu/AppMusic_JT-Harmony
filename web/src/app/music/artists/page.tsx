"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  User,
  Plus,
  Search,
  ArrowUpDown,
  Mic2,
  Globe,
  Database,
  Users,
  X,
  Filter,
  Check,
  ChevronDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { useMusicStore, useFollowStore } from "@/store";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  StatCard,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import AddArtistModal from "@/components/music/artist/add-modal";
import ViewDetailModal from "@/components/music/artist/view-detail-modal";
import { AddArtist } from "@/services";
import toast from "react-hot-toast";


// [NEW] Hàm tính toán hiển thị phân trang thông minh (1 2 3 ... 10)
const getPaginationItems = (currentPage: number, totalPages: number) => {
  const delta = 1; // Số trang hiển thị bên cạnh trang hiện tại
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

const getArtistIdDisplay = (a: any) => {
  if (a.id) return { label: `ID: ${a.id}`, type: 'local', icon: Database };
  if (a.spotifyId) return { label: `SP: ${a.spotifyId}`, type: 'spotify', icon: Globe };
  return { label: 'No ID', type: 'none', icon: X };
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num ? num.toString() : '0';
};

// Custom Hook to detect click outside
function useOnClickOutside(ref: any, handler: any) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export default function ArtistsPage() {
  const { artists, genres, setArtists, setGenres, fetchArtists, fetchGenres } = useMusicStore();
  const { followArtists, fetchFollowArtists } = useFollowStore();

  // --- LOCAL STATES ---
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedGenreId, setSelectedGenreId] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    spotifyId: "",
    imageUrl: "",
    shareCount: 0,
    genres: []
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [followerRange, setFollowerRange] = useState({ min: "", max: "" });

  // Custom Popover State
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const genreRef = useRef(null);
  useOnClickOutside(genreRef, () => setIsGenreOpen(false));

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({
    key: 'calculatedFollowers',
    direction: 'desc',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- LOGIC ---

  const artistsWithStats = useMemo(() => {
    return artists.map(artist => {
      const realFollowerCount = followArtists.filter((f: any) => f.artistId === artist.id).length;
      return {
        ...artist,
        calculatedFollowers: realFollowerCount,
      };
    });
  }, [artists, followArtists]);

  // const allGenres = useMemo(() => {
  //   const genres = new Set<string>();
  //   artists.forEach(a => a.genres?.forEach((g: string) => genres.add(g)));
  //   return Array.from(genres).sort();
  // }, [artists]);

  const filteredArtists = useMemo(() => {
    return artistsWithStats.filter(artist => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        artist.name.toLowerCase().includes(query) ||
        artist.id.toString().includes(query) ||
        (artist.spotifyId && artist.spotifyId.toLowerCase().includes(query));

      const matchGenre = selectedGenres.length === 0 ||
        (artist.genres && artist.genres.some((g: string) => selectedGenres.includes(g)));

      const min = followerRange.min ? parseInt(followerRange.min) : 0;
      const max = followerRange.max ? parseInt(followerRange.max) : Infinity;
      const matchFollowerRange = artist.calculatedFollowers >= min && artist.calculatedFollowers <= max;

      return matchSearch && matchGenre && matchFollowerRange;
    });
  }, [artistsWithStats, searchQuery, selectedGenres, followerRange]);

  const sortedArtists = useMemo(() => {
    const sorted = [...filteredArtists];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof typeof a];
        let bValue = b[sortConfig.key as keyof typeof b];
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue);
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredArtists, sortConfig]);

  const totalPages = Math.ceil(sortedArtists.length / itemsPerPage);
  const paginatedArtists = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedArtists.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedArtists, currentPage]);

  const stats = useMemo(() => {
    const totalArtists = artistsWithStats.length;
    const totalFollowers = artistsWithStats.reduce((acc, curr) => acc + curr.calculatedFollowers, 0);

    const genreCounts: Record<string, number> = {};
    artistsWithStats.forEach(a => {
      a.genres?.forEach((g: string) => genreCounts[g] = (genreCounts[g] || 0) + 1);
    });
    const genreData = Object.entries(genreCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const topArtistsData = [...artistsWithStats]
      .sort((a, b) => b.calculatedFollowers - a.calculatedFollowers)
      .slice(0, 5)
      .map(a => ({
        name: a.name.length > 20 ? a.name.substring(0, 20) + '...' : a.name, // Cắt tên dài cho biểu đồ ngang
        followers: a.calculatedFollowers,
        fullTitle: a.name
      }));

    return { totalArtists, totalFollowers, genreData, topArtistsData };
  }, [artistsWithStats]);

  // --- HANDLERS ---
  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const handleDeleteArtist = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa nghệ sĩ này?")) {
      const newArtists = artists.filter(a => a.id !== id);
      setArtists(newArtists);
    }
  };

  const handleAddArtist = async () => {
    const newArtist = {
      name: formData.name,
      spotifyId: formData.spotifyId,
      imageUrl: formData.imageUrl,
      shareCount: parseInt(formData.shareCount.toString()) || 0,
      followers: 0,
      popularity: 0,
      genres: selectedGenreId ? selectedGenreId : [],
      createdAt: new Date().toISOString()
    };
    const response = await AddArtist(newArtist);
    if (!response.success) {
      toast.error('Lỗi khi thêm nghệ sĩ: ' + response.message);
      return;
    }
    const newId = response.data.id;
    // update genres name list
    const genreNames = [];
    selectedGenreId.forEach((gid) => {
      const genreObj = genres.find(g => g.id === gid);
      genreNames.push(genreObj.name);
    });
    newArtist.genres = genreNames;
    setArtists([...artists, { id: newId, ...newArtist }]);
    setIsAddDialogOpen(false);
    setSelectedGenreId([]);
    setFormData({ name: "", spotifyId: "", imageUrl: "", shareCount: 0, genres: [] });
    toast.success('Thêm nghệ sĩ thành công!');
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 opacity-50" />;
    return <ArrowUpDown className={`ml-2 h-4 w-4 text-blue-600 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />;
  };

  useEffect(() => {
    if (artists.length === 0) fetchArtists();
    if (followArtists.length === 0) fetchFollowArtists();
    if (genres.length === 0) fetchGenres();
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="space-y-6 pb-10 bg-gray-50/30 min-h-screen p-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Nghệ Sĩ</h1>
          <p className="text-gray-500">Theo dõi thông tin, thống kê follower và quản lý hồ sơ.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Thêm Nghệ Sĩ
        </Button>
      </div>

      {/* --- STATISTICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3 flex flex-col gap-4">
          <StatCard
            title="Tổng Nghệ Sĩ"
            value={stats.totalArtists}
            subtext="Đang hoạt động"
            icon={Mic2}
            colorClass="bg-blue-500"
          />
          <StatCard
            title="Tổng Follower"
            value={formatNumber(stats.totalFollowers)}
            subtext="Thực tế từ hệ thống"
            icon={Users}
            colorClass="bg-green-500"
          />
        </div>

        {/* Horizontal Bar Chart */}
        <Card className="md:col-span-5 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Top Nghệ Sĩ (Followers)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-2">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">

                <BarChart
                  layout="vertical"
                  data={stats.topArtistsData}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={formatNumber} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Bar dataKey="followers" barSize={20} radius={[0, 4, 4, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Phân Bố Thể Loại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.genreData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stats.genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- FILTERS --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-4 items-start xl:items-center">
        <div className="relative w-full xl:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm theo tên hoặc ID..."
            value={searchQuery}
            onChange={(e: any) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>

        {/* CUSTOM GENRE FILTER DROPDOWN */}
        <div className="relative w-full xl:w-auto" ref={genreRef}>
          <Button
            variant="outline"
            className="w-full xl:w-auto justify-between min-w-[200px]"
            onClick={() => setIsGenreOpen(!isGenreOpen)}
          >
            <span className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              {selectedGenres.length > 0 ? `Đã chọn ${selectedGenres.length} thể loại` : "Lọc theo thể loại"}
            </span>
            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
          </Button>

          {isGenreOpen && (
            <div className="absolute z-10 mt-2 w-full xl:w-[250px] bg-white rounded-md shadow-lg border border-gray-200 p-2 max-h-[300px] overflow-y-auto">
              <div className="mb-2 px-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">Chọn thể loại</div>
              {genres.length > 0 ? (
                genres.map((genre) => (
                  <button key={genre.id}
                    className="flex items-center justify-between p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                    onClick={() => handleGenreToggle(genre.name)}
                  >
                    <div className={`w-4 h-4 mx-2 border rounded flex items-center justify-center ${selectedGenres.includes(genre.name) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                      {selectedGenres.includes(genre.name) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm capitalize text-gray-700">{genre.name}</span>
                  </button>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500 text-center">Không có dữ liệu thể loại</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full xl:w-auto">
          <Input
            placeholder="Min followers"
            type="number"
            className="w-full xl:w-32"
            value={followerRange.min}
            onChange={(e: any) => setFollowerRange({ ...followerRange, min: e.target.value })}
          />
          <span className="text-gray-400">-</span>
          <Input
            placeholder="Max followers"
            type="number"
            className="w-full xl:w-32"
            value={followerRange.max}
            onChange={(e: any) => setFollowerRange({ ...followerRange, max: e.target.value })}
          />
        </div>

        {(searchQuery || selectedGenres.length > 0 || followerRange.min || followerRange.max) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("");
              setSelectedGenres([]);
              setFollowerRange({ min: "", max: "" });
              setCurrentPage(1);
            }}
            className="text-red-500 hover:text-red-600"
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:text-blue-600">
                <div className="flex items-center">Nghệ Sĩ {getSortIcon('name')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('id')} className="cursor-pointer hover:text-blue-600">
                <div className="flex items-center">ID / Nguồn {getSortIcon('id')}</div>
              </TableHead>
              <TableHead>Thể Loại</TableHead>
              <TableHead onClick={() => handleSort('calculatedFollowers')} className="text-right cursor-pointer hover:text-blue-600">
                <div className="flex items-center justify-end">Followers (Thực) {getSortIcon('calculatedFollowers')}</div>
              </TableHead>
              <TableHead onClick={() => handleSort('shareCount')} className="text-right cursor-pointer hover:text-blue-600">
                <div className="flex items-center justify-end">Lượt chia sẻ {getSortIcon('shareCount')}</div>
              </TableHead>
              <TableHead className="w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedArtists.length > 0 ? (
              paginatedArtists.map((artist, idx) => {
                const idInfo = getArtistIdDisplay(artist);
                const Icon = idInfo.icon;
                return (
                  <TableRow key={artist.id || idx} className="group hover:bg-blue-50/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          {artist.imageUrl ? (
                            <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full"><User className="w-5 h-5 text-gray-400" /></div>
                          )}
                        </div>
                        <span className="text-gray-900 font-semibold">{artist.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit">
                        <Icon className={`w-3 h-3 ${idInfo.type === 'spotify' ? 'text-green-600' : 'text-blue-600'}`} />
                        <span className="font-mono">{idInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {artist.genres?.slice(0, 2).map((g: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{g}</Badge>
                        ))}
                        {artist.genres?.length > 2 && <Badge variant="outline" className="text-[10px]">+{artist.genres.length - 2}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-gray-700">
                      {formatNumber(artist.calculatedFollowers)}
                    </TableCell>
                    <TableCell className="text-right text-gray-600">
                      {formatNumber(artist.shareCount || 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedArtist(artist); setIsViewDialogOpen(true); }}>
                          <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => handleDeleteArtist(artist.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  Không tìm thấy nghệ sĩ phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* [UPDATE] Pagination UI */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Hiển thị {paginatedArtists.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} đến {Math.min(currentPage * itemsPerPage, sortedArtists.length)} trong số {sortedArtists.length} kết quả
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>

            {getPaginationItems(currentPage, totalPages).map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                className={`w-8 ${page === '...' ? 'cursor-default border-none hover:bg-transparent' : ''}`}
                onClick={() => { if (page !== '...') setCurrentPage(Number(page)) }}
                disabled={page === '...'}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>

      <AddArtistModal
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        handleAddArtist={handleAddArtist}
        selectedGenreId={selectedGenreId}
      />

      <ViewDetailModal
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        selectedArtist={selectedArtist}
        formatNumber={formatNumber}
      />

    </div>
  );
}