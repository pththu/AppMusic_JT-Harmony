"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Music,
  User,
  Edit,
  Plus,
  Search,
  ArrowUpDown,
  ListMusic,
  Globe,
  Lock,
  Disc,
  X,
  Database
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
import { useMusicStore } from "@/store/musicStore";

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

const Label = ({ className = "", ...props }: any) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props} />
);

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const variants = {
    default: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
    secondary: "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "text-gray-700 border border-gray-200",
    success: "border-transparent bg-green-100 text-green-700",
    warning: "border-transparent bg-yellow-100 text-yellow-800",
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

type Owner = {
  id: number | null;
  spotifyId: string | null;
  name: string;
};

type Playlist = {
  id: number | null; // Database ID can be null
  spotifyId: string | null; // Spotify ID can be null
  name: string;
  owner: Owner;
  description: string | null;
  imageUrl: string | null;
  totalTracks: number;
  isPublic: boolean;
  type: "playlist" | "album";
  shareCount?: number; // Added field for stats
  createdAt: string;
};

const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: null,
    spotifyId: "7DgPQwzEoUVfQYBiMLER9Z",
    name: "Top 100 Most Popular Rock Songs",
    owner: {
      id: null,
      spotifyId: "27d103o3ymbwx8jp9ctithyau",
      name: "Redlist - Biggest Songs"
    },
    description: "Find our playlist with these keywords: classic rock hits...",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Rock",
    totalTracks: 100,
    isPublic: true,
    type: "playlist",
    shareCount: 1205,
    createdAt: new Date(Date.now() - 10000000).toISOString()
  },
  {
    id: null,
    spotifyId: "1GXRoQWlxTNQiMNkOe7RqA",
    name: "Hard Rock /Metal",
    owner: {
      id: null,
      spotifyId: "roddmar",
      name: "rodney martin"
    },
    description: "The ideal compilation of Hard Rock and Heavy Metal...",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Metal",
    totalTracks: 294,
    isPublic: true,
    type: "playlist",
    shareCount: 850,
    createdAt: new Date(Date.now() - 50000000).toISOString()
  },
  {
    id: 101,
    spotifyId: null, // Local DB playlist
    name: "My Chill Mix",
    owner: {
      id: 55,
      spotifyId: null,
      name: "Local User A"
    },
    description: "Just for coding",
    imageUrl: null,
    totalTracks: 25,
    isPublic: false,
    type: "playlist",
    shareCount: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 102,
    spotifyId: "37i9dQZF1DXcBWIGoYBM5M",
    name: "Today's Top Hits",
    owner: {
      id: null,
      spotifyId: "spotify",
      name: "Spotify"
    },
    description: "Jung Kook is on top of the Hottest 50!",
    imageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Hits",
    totalTracks: 50,
    isPublic: true,
    type: "playlist",
    shareCount: 54000,
    createdAt: new Date(Date.now() - 2000000).toISOString()
  },
  {
    id: 103,
    spotifyId: null,
    name: "Workout 2024",
    owner: {
      id: 55,
      spotifyId: null,
      name: "Local User A"
    },
    description: null,
    imageUrl: null,
    totalTracks: 15,
    isPublic: false,
    type: "playlist",
    shareCount: 2,
    createdAt: new Date(Date.now() - 80000000).toISOString()
  }
];

// --- 3. UTILS & HELPER COMPONENTS ---

const getPlaylistIdDisplay = (p: Playlist) => {
  if (p.id) return { label: `ID: ${p.id}`, type: 'local', icon: Database };
  if (p.spotifyId) return { label: `SP: ${p.spotifyId}`, type: 'spotify', icon: Globe };
  return { label: 'No ID', type: 'none', icon: X };
};

const getOwnerDisplay = (owner) => {
  if (owner?.name) return owner.name;
  if (owner?.spotifyId) return `SP: ${owner.spotifyId}`;
  if (owner?.id) return `User #${owner.id}`;
  return "Unknown";
};

// --- 4. STAT CARD COMPONENT ---

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

// --- 5. MAIN PAGE COMPONENT ---

export default function PlaylistsPage() {
  // const [playlists, setPlaylists] = useState<Playlist[]>(MOCK_PLAYLISTS);
  const { playlists, setPlaylists, fetchPlaylists } = useMusicStore();

  // Dialog States
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterVisibility, setFilterVisibility] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // --- STATISTICS LOGIC ---
  const stats = useMemo(() => {
    const totalPlaylists = playlists.length;
    const totalTracks = playlists.reduce((acc, curr) => acc + curr.totalTracks, 0);

    // Visibility Distribution
    const publicCount = playlists.filter(p => p.isPublic).length;
    const privateCount = totalPlaylists - publicCount;
    const visibilityData = [
      { name: 'Công Khai', value: publicCount, color: '#22c55e' }, // Green
      { name: 'Riêng Tư', value: privateCount, color: '#64748b' }  // Slate
    ].filter(i => i.value > 0);

    // Top Playlists by Tracks
    const topPlaylistsData = [...playlists]
      .sort((a, b) => b.totalTracks - a.totalTracks)
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
        tracks: p.totalTracks,
        fullTitle: p.name
      }));

    return { totalPlaylists, totalTracks, visibilityData, topPlaylistsData };
  }, [playlists]);

  // --- FILTER & SORT LOGIC ---
  const processedPlaylists = useMemo(() => {
    let result = [...playlists];

    // 1. Filter
    if (searchTerm || filterType !== 'all' || filterVisibility !== 'all') {
      result = result.filter(item => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.spotifyId && item.spotifyId.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = filterType === 'all' || item.type === filterType;

        const matchesVisibility =
          filterVisibility === 'all' ||
          (filterVisibility === 'public' && item.isPublic) ||
          (filterVisibility === 'private' && !item.isPublic);

        return matchesSearch && matchesType && matchesVisibility;
      });
    }

    // 2. Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'ownerName') {
          aValue = a.owner.name;
          bValue = b.owner.name;
        } else {
          aValue = (a as any)[sortConfig.key as string];
          bValue = (b as any)[sortConfig.key as string];
        }

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
  }, [playlists, searchTerm, filterType, filterVisibility, sortConfig]);

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

  const handleDeletePlaylist = (id, spotifyId) => {
    if (confirm("Bạn có chắc muốn xóa danh sách phát này?")) {
      const newPlaylists = playlists.filter(p => {
        if (id !== null && p.id === id) return false;
        if (id === null && spotifyId !== null && p.spotifyId === spotifyId) return false;
        return true;
      });
      setPlaylists(newPlaylists);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return (
    <div className="space-y-6 pb-10 bg-gray-50/30 min-h-screen p-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Danh Sách Phát</h1>
          <p className="text-gray-500">Quản lý danh sách phát và album trong hệ thống.</p>
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
            title="Tổng Playlist"
            value={stats.totalPlaylists}
            subtext="Danh sách phát & Album"
            icon={ListMusic}
            colorClass="bg-blue-500"
          />
          <StatCard
            title="Tổng Bài Hát"
            value={stats.totalTracks.toLocaleString()}
            subtext="Trong tất cả playlist"
            icon={Music}
            colorClass="bg-purple-500"
          />
        </div>

        {/* Chart: Top Playlists by Tracks */}
        <Card className="md:col-span-5 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center">
              Top Playlist (Theo số bài hát)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-2">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topPlaylistsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Bar dataKey="tracks" barSize={30} radius={[4, 4, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart: Visibility Distribution */}
        <Card className="md:col-span-4 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Phân Bố Quyền Riêng Tư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.visibilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.visibilityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                <div className="text-xl font-bold text-gray-900">{stats.totalPlaylists}</div>
                <div className="text-[10px] text-gray-500 uppercase">Items</div>
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
            placeholder="Tìm kiếm theo tên, người tạo, Spotify ID..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="w-[150px]">
            <SelectNative
              value={filterType}
              onChange={setFilterType}
              placeholder="Tất cả loại"
              options={[
                { value: 'playlist', label: 'Playlist' },
                { value: 'album', label: 'Album' },
              ]}
            />
          </div>
          <div className="w-[150px]">
            <SelectNative
              value={filterVisibility}
              onChange={setFilterVisibility}
              placeholder="Quyền riêng tư"
              options={[
                { value: 'public', label: 'Công Khai' },
                { value: 'private', label: 'Riêng Tư' },
              ]}
            />
          </div>
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
                <div className="flex items-center">Tên {getSortIcon('name')}</div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">ID / Nguồn</div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('ownerName')}
              >
                <div className="flex items-center">Người Tạo {getSortIcon('ownerName')}</div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('totalTracks')}
              >
                <div className="flex items-center justify-end">Số Bài {getSortIcon('totalTracks')}</div>
              </TableHead>
              <TableHead className="text-center">Loại</TableHead>
              <TableHead className="text-center">Riêng Tư</TableHead>
              <TableHead className="w-[80px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedPlaylists.length > 0 ? (
              processedPlaylists.map((playlist, idx) => {
                const idInfo = getPlaylistIdDisplay(playlist);
                const Icon = idInfo.icon;

                return (
                  <TableRow key={idx} className="group hover:bg-blue-50/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          {playlist.imageUrl ? (
                            <img src={playlist.imageUrl} alt={playlist.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full"><ListMusic className="w-5 h-5 text-gray-400" /></div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-semibold line-clamp-1 max-w-[200px]" title={playlist.name}>{playlist.name}</span>
                          <span className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{playlist.description || "Không có mô tả"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit">
                        <Icon className={`w-3 h-3 ${idInfo.type === 'spotify' ? 'text-green-600' : 'text-blue-600'}`} />
                        <span className="font-mono">{idInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 text-sm">
                      {getOwnerDisplay(playlist.owner)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-gray-900">{playlist.totalTracks}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-[10px] capitalize bg-white">{playlist.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {playlist.isPublic ? (
                        <Badge variant="success" className="text-[10px]"><Globe className="w-3 h-3 mr-1" /> Public</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]"><Lock className="w-3 h-3 mr-1" /> Private</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu
                        trigger={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>}
                        items={[
                          { label: "Xem Chi Tiết", icon: Eye, onClick: () => { setSelectedPlaylist(playlist); setIsViewDialogOpen(true); } },
                          { label: "Chỉnh Sửa", icon: Edit, onClick: () => { setSelectedPlaylist(playlist); setIsEditDialogOpen(true); } },
                          { label: "Xóa", icon: Trash2, className: "text-red-600", onClick: () => handleDeletePlaylist(playlist.id, playlist.spotifyId) }
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  Không tìm thấy danh sách phát nào phù hợp.
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
        title="Thông tin danh sách phát"
      >
        {selectedPlaylist && (
          <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex gap-5 items-start">
              <img
                src={selectedPlaylist.imageUrl || "https://placehold.co/150?text=No+Image"}
                alt="Cover"
                className="w-32 h-32 rounded-lg shadow-md object-cover border border-gray-100 flex-shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedPlaylist.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <User className="w-3 h-3" />
                    <span>{getOwnerDisplay(selectedPlaylist.owner)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge className="capitalize">{selectedPlaylist.type}</Badge>
                  {selectedPlaylist.isPublic ? (
                    <Badge variant="success">Public</Badge>
                  ) : (
                    <Badge variant="secondary">Private</Badge>
                  )}
                </div>

                <p className="text-xs text-gray-400 pt-1">
                  Tạo ngày: {format(new Date(selectedPlaylist.createdAt), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold">Tổng Bài Hát</p>
                <p className="font-bold text-xl text-gray-800 mt-1">{selectedPlaylist.totalTracks}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-semibold">Lượt Chia Sẻ</p>
                <p className="font-bold text-xl text-gray-800 mt-1">{selectedPlaylist.shareCount || 0}</p>
              </div>
            </div>

            {/* IDs Section */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-900">Thông tin định danh</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded text-sm">
                  <span className="text-blue-700 font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" /> Database ID
                  </span>
                  <span className="font-mono text-gray-700">{selectedPlaylist.id !== null ? selectedPlaylist.id : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-green-50 p-3 rounded text-sm">
                  <span className="text-green-700 font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Spotify ID
                  </span>
                  <span className="font-mono text-gray-700">{selectedPlaylist.spotifyId || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedPlaylist.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Mô tả</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                  {selectedPlaylist.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* --- MODAL: EDIT (Placeholder) --- */}
      <Modal
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Chỉnh sửa danh sách phát"
        description="Cập nhật thông tin chi tiết."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>Lưu Thay Đổi</Button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-sm text-gray-500 italic">Form chỉnh sửa sẽ được đặt tại đây (Tên, Mô tả, Quyền riêng tư...)</p>
        </div>
      </Modal>

    </div>
  );
}