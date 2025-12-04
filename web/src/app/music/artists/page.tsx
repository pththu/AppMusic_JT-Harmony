"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  User,
  Edit,
  Plus,
  Search,
  ArrowUpDown,
  Mic2,
  Globe,
  Music,
  X,
  Database,
  TrendingUp,
  Users
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
import { useMusicStore } from "@/store";

// --- 1. SIMPLIFIED UI COMPONENTS (INLINED) ---

const Button = ({ children, variant = "default", size = "default", className = "", ...props }: any) => {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow",
    ghost: "hover:bg-gray-100 text-gray-700",
    outline: "border border-gray-200 bg-white hover:bg-gray-100 text-gray-900",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    icon: "h-9 w-9",
  };
  const finalClass = `${base} ${variants[variant as keyof typeof variants] || variants.default} ${sizes[size as keyof typeof sizes] || sizes.default} ${className}`;
  return <button className={finalClass} {...props}>{children}</button>;
};

const Input = ({ className = "", ...props }: any) => (
  <input
    className={`flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const variants = {
    default: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
    secondary: "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "text-gray-700 border border-gray-200",
    success: "border-transparent bg-green-100 text-green-700",
    purple: "border-transparent bg-purple-100 text-purple-700",
  };
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant as keyof typeof variants] || variants.default} ${className}`}>
      {children}
    </div>
  );
};

const Card = ({ className = "", ...props }: any) => <div className={`rounded-xl border bg-white text-gray-950 shadow ${className}`} {...props} />;
const CardContent = ({ className = "", ...props }: any) => <div className={`p-6 pt-0 ${className}`} {...props} />;
const CardHeader = ({ className = "", ...props }: any) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />;
const CardTitle = ({ className = "", ...props }: any) => <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props} />;

const Table = ({ className = "", ...props }: any) => <div className="w-full overflow-auto"><table className={`w-full caption-bottom text-sm ${className}`} {...props} /></div>;
const TableHeader = ({ className = "", ...props }: any) => <thead className={`[&_tr]:border-b ${className}`} {...props} />;
const TableBody = ({ className = "", ...props }: any) => <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />;
const TableRow = ({ className = "", ...props }: any) => <tr className={`border-b transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-100 ${className}`} {...props} />;
const TableHead = ({ className = "", ...props }: any) => <th className={`h-10 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />;
const TableCell = ({ className = "", ...props }: any) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props} />;

// Custom Native Select
const SelectNative = ({ value, onChange, options, placeholder = "Select...", className = "" }: any) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    <option value="all">{placeholder}</option>
    {options.map((opt: any) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

// Custom Modal
const Modal = ({ isOpen, onClose, title, description, children, footer }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-lg border border-gray-200 flex flex-col max-h-[90vh]">
        <div className="flex flex-col space-y-1.5 p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold leading-none tracking-tight text-lg">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="flex items-center p-6 pt-0 border-t border-gray-100">{footer}</div>}
      </div>
    </div>
  );
};

// Custom Dropdown
const DropdownMenu = ({ trigger, items }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer inline-block">{trigger}</div>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-md z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
          {items.map((item: any, idx: number) => (
            <button
              key={idx}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${item.className || 'text-gray-700'}`}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- 2. TYPES & MOCK DATA ---

type Artist = {
  id: number | null;
  spotifyId: string | null;
  name: string;
  genres: string[];
  imageUrl: string;
  // Augmented fields for statistics demo
  followers: number;
  popularity: number; // 0-100
  createdAt: string;
};


// --- 3. UTILS & HELPER COMPONENTS ---

const getArtistIdDisplay = (a: Artist) => {
  if (a.id) return { label: `ID: ${a.id}`, type: 'local', icon: Database };
  if (a.spotifyId) return { label: `SP: ${a.spotifyId}`, type: 'spotify', icon: Globe };
  return { label: 'No ID', type: 'none', icon: X };
};

const formatFollowers = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num ? num.toString() : '0';
};

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <Card className="flex-1 min-w-[200px] shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// --- 4. MAIN PAGE COMPONENT ---

export default function ArtistsPage() {
  // const [artists, setArtists] = useState<Artist[]>(MOCK_ARTISTS);
  const { artists, setArtists, fetchArtists } = useMusicStore();

  // Dialog States
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // --- STATISTICS LOGIC ---
  const stats = useMemo(() => {
    const totalArtists = artists.length;
    const totalFollowers = artists.reduce((acc, curr) => acc + curr.followers, 0);

    // Genre Distribution Logic
    const genreCounts: Record<string, number> = {};
    artists.forEach(a => {
      a.genres?.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });

    // Convert to Chart Data (Top 5 Genres)
    const genreData = Object.entries(genreCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Add "Others" if needed
    const otherCount = Object.values(genreCounts).reduce((a, b) => a + b, 0) - genreData.reduce((a, b) => a + b.value, 0);
    if (otherCount > 0) genreData.push({ name: 'Others', value: otherCount });

    // Top Artists by Followers
    const topArtistsData = [...artists]
      .sort((a, b) => b.followers - a.followers)
      .slice(0, 5)
      .map(a => ({
        name: a.name.length > 15 ? a.name.substring(0, 15) + '...' : a.name,
        followers: a.followers,
        fullTitle: a.name
      }));

    return { totalArtists, totalFollowers, genreData, topArtistsData, allGenres: Object.keys(genreCounts) };
  }, [artists]);

  // --- FILTER & SORT LOGIC ---
  const processedArtists = useMemo(() => {
    let result = [...artists];

    // 1. Filter
    if (searchTerm || filterGenre !== 'all') {
      result = result.filter(item => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.spotifyId && item.spotifyId.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesGenre = filterGenre === 'all' || item.genres.includes(filterGenre);

        return matchesSearch && matchesGenre;
      });
    }

    // 2. Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = (a as any)[sortConfig.key as string];
        let bValue = (b as any)[sortConfig.key as string];

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

    return result;
  }, [artists, searchTerm, filterGenre, sortConfig]);

  // Handlers
  const requestSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 opacity-50" />;
    return <ArrowUpDown className={`ml-2 h-4 w-4 text-blue-600 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />;
  };

  const handleDeleteArtist = (id: number | null, spotifyId: string | null) => {
    if (confirm("Bạn có chắc muốn xóa nghệ sĩ này khỏi hệ thống?")) {
      // setArtists(prev => prev.filter(p => {
      //   if (id !== null && p.id === id) return false;
      //   if (id === null && spotifyId !== null && p.spotifyId === spotifyId) return false;
      //   return true;
      // }));
      const newArtists = artists.filter(p => {
        if (id !== null && p.id === id) return false;
        if (id === null && spotifyId !== null && p.spotifyId === spotifyId) return false;
        return true;
      });
      setArtists(newArtists);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  useEffect(() => {
    fetchArtists();
  }, []);

  return (
    <div className="space-y-6 pb-10 bg-gray-50/30 min-h-screen p-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nghệ Sĩ</h1>
          <p className="text-gray-500">Quản lý hồ sơ nghệ sĩ, thể loại nhạc và thống kê.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Thêm Mới
        </Button>
      </div>

      {/* --- SECTION 1: STATISTICS & CHARTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Stat Cards */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <StatCard
            title="Tổng Nghệ Sĩ"
            value={stats.totalArtists}
            subtext="Đang hoạt động"
            icon={Mic2}
            colorClass="bg-blue-500"
          />
          <StatCard
            title="Tổng Người Theo Dõi"
            value={formatFollowers(stats.totalFollowers)}
            subtext="Trên toàn hệ thống"
            icon={Users}
            colorClass="bg-green-500"
          />
        </div>

        {/* Chart: Top Artists */}
        <Card className="md:col-span-5 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center">
              Top Nghệ Sĩ (Theo followers)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-2">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topArtistsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} width={40} tickFormatter={formatFollowers} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                    formatter={(value: number) => [formatFollowers(value), "Followers"]}
                  />
                  <Bar dataKey="followers" barSize={30} radius={[4, 4, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart: Genre Distribution */}
        <Card className="md:col-span-4 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Phân Bố Thể Loại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.genreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                <div className="text-xl font-bold text-gray-900">{stats.genreData.length}</div>
                <div className="text-[10px] text-gray-500 uppercase">Genres</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- SECTION 2: FILTERS --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm nghệ sĩ theo tên hoặc ID..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="w-[200px]">
          <SelectNative
            value={filterGenre}
            onChange={setFilterGenre}
            placeholder="Tất cả thể loại"
            options={stats.allGenres.sort().map(g => ({ value: g, label: g.charAt(0).toUpperCase() + g.slice(1) }))}
          />
        </div>
      </div>

      {/* --- SECTION 3: DATA TABLE --- */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead
                className="cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center">Nghệ Sĩ {getSortIcon('name')}</div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">ID / Nguồn</div>
              </TableHead>
              <TableHead>Thể Loại</TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('followers')}
              >
                <div className="flex items-center justify-end">Followers {getSortIcon('followers')}</div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('popularity')}
              >
                <div className="flex items-center justify-end">Độ Hot {getSortIcon('popularity')}</div>
              </TableHead>
              <TableHead className="w-[80px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedArtists.length > 0 ? (
              processedArtists.map((artist, idx) => {
                const idInfo = getArtistIdDisplay(artist);
                const Icon = idInfo.icon;

                return (
                  <TableRow key={idx} className="group hover:bg-blue-50/30 transition-colors">
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
                        {artist?.genres?.slice(0, 2).map((g, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] whitespace-nowrap">
                            {g}
                          </Badge>
                        ))}
                        {artist?.genres?.length > 2 && (
                          <Badge variant="outline" className="text-[10px]">+{artist?.genres?.length - 2}</Badge>
                        )}
                        {artist?.genres?.length === 0 && <span className="text-xs text-gray-400 italic">No genres</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-700">
                      {formatFollowers(artist.followers)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
                            style={{ width: `${artist.popularity}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-6">{artist.popularity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu
                        trigger={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>}
                        items={[
                          { label: "Xem Chi Tiết", icon: Eye, onClick: () => { setSelectedArtist(artist); setIsViewDialogOpen(true); } },
                          { label: "Chỉnh Sửa", icon: Edit, onClick: () => { setSelectedArtist(artist); setIsEditDialogOpen(true); } },
                          { label: "Xóa", icon: Trash2, className: "text-red-600", onClick: () => handleDeleteArtist(artist.id, artist.spotifyId) }
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  Không tìm thấy nghệ sĩ nào phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MODAL: VIEW DETAILS --- */}
      <Modal
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        title="Thông tin nghệ sĩ"
      >
        {selectedArtist && (
          <div className="flex flex-col items-center text-center gap-6 pt-4">
            <div className="relative">
              <img
                src={selectedArtist.imageUrl || "https://placehold.co/150?text=No+Image"}
                alt="Avatar"
                className="w-32 h-32 rounded-full shadow-lg object-cover border-4 border-white ring-1 ring-gray-200"
              />
              <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                {selectedArtist.spotifyId ? <Globe className="w-5 h-5 text-green-500" /> : <Database className="w-5 h-5 text-blue-500" />}
              </div>
            </div>

            <div className="space-y-2 w-full">
              <h3 className="text-2xl font-bold text-gray-900">{selectedArtist.name}</h3>

              <div className="flex justify-center gap-2 flex-wrap">
                {selectedArtist.genres.map((g, i) => (
                  <Badge key={i} variant="purple">{g}</Badge>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 uppercase font-bold tracking-wide">Followers</p>
                <p className="font-bold text-2xl text-gray-900 mt-1">{selectedArtist.followers.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <p className="text-xs text-purple-600 uppercase font-bold tracking-wide">Popularity</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <p className="font-bold text-2xl text-gray-900">{selectedArtist.popularity}/100</p>
                </div>
              </div>
            </div>

            {/* IDs Section */}
            <div className="w-full space-y-3 border-t border-gray-100 pt-4 text-left">
              <h4 className="text-sm font-semibold text-gray-900">Thông tin định danh</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-600 font-medium">Database ID</span>
                  <span className="font-mono text-gray-900">{selectedArtist.id !== null ? selectedArtist.id : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-600 font-medium">Spotify ID</span>
                  <span className="font-mono text-gray-900">{selectedArtist.spotifyId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-600 font-medium">Ngày tạo</span>
                  <span className="font-mono text-gray-900">{format(new Date(selectedArtist.createdAt), "dd/MM/yyyy HH:mm")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* --- MODAL: EDIT (Placeholder) --- */}
      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Chỉnh sửa nghệ sĩ"
        description="Cập nhật thông tin chi tiết."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>Lưu Thay Đổi</Button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-sm text-gray-500 italic">Form chỉnh sửa sẽ được đặt tại đây (Tên, Thể loại, Ảnh đại diện...)</p>
        </div>
      </Modal>

    </div>
  );
}