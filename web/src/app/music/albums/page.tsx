"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Disc,
  Music,
  Edit,
  Plus,
  Search,
  ArrowUpDown,
  Share2,
  Globe,
  Database,
  X,
  Layers,
  Calendar as CalendarIcon,
  Filter,
  XCircle,
  Check,
  User,
  Trash2Icon
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
import { useHistoryStore, useMusicStore } from "@/store"; // Giả sử có useArtistStore
import { Badge, Button, Input, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";

// --- 1. UTILS ---

const ITEMS_PER_PAGE = 10;

const getPaginationItems = (currentPage: number, totalPages: number) => {
  const MAX_ITEMS = 5;
  if (totalPages <= MAX_ITEMS) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>();
  pages.add(currentPage);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const finalItems: (number | '...')[] = [];
  if (sortedPages[0] > 1) finalItems.push('...');
  sortedPages.forEach(p => finalItems.push(p));
  if (sortedPages[sortedPages.length - 1] < totalPages) finalItems.push('...');
  return finalItems;
};

const formatNumber = (num: number) => num.toLocaleString('en-US');

// --- 2. COMPONENTS CON ---

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
        {footer && <div className="flex items-center justify-end gap-2 p-6 pt-0 border-t border-gray-100 mt-auto pt-4">{footer}</div>}
      </div>
    </div>
  );
};

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
              onClick={() => { item.onClick(); setIsOpen(false); }}
            >
              {item.icon && <item.icon className="w-4 h-4" />} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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

// --- 3. MAIN PAGE ---

export default function AlbumsPage() {
  const { albums, artists, setArtists, setAlbums, fetchAlbums, fetchArtists } = useMusicStore();
  const { listenHistories, fetchListenHistories } = useHistoryStore();

  // States
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);

  // Filter & Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());

  // Form State (New Album)
  const [newAlbumData, setNewAlbumData] = useState({
    name: "",
    spotifyId: "",
    imageUrl: "",
    selectedArtistIds: [] as number[],
    artistSearchTerm: ""
  });

  // --- LOGIC 1: STATISTICS (Updated with Listen Histories) ---
  const stats = useMemo(() => {
    const totalAlbums = albums.length;
    const totalTracks = albums.reduce((acc, curr) => acc + curr.totalTracks, 0);
    const totalShares = albums.reduce((acc, curr) => acc + curr.shareCount, 0);

    // Tính lượt nghe từ history
    const playCounts: Record<number, number> = {};
    listenHistories.forEach((h) => {
      // Giả sử itemType là 'album' hoặc check theo context
      if (h.itemType === 'album' && h.itemId) {
        playCounts[h.itemId] = (playCounts[h.itemId] || 0) + 1;
      }
    });

    // Top Albums by Plays (Horizontal Bar Data)
    const topAlbumsData = albums
      .map(a => ({
        name: a.name.length > 20 ? a.name.slice(0, 18) + '...' : a.name,
        plays: a.id ? (playCounts[a.id] || 0) : 0,
        fullTitle: a.name
      }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    // Release Year Distribution (Pie Chart)
    const yearCounts: Record<string, number> = {};
    albums.forEach(a => {
      const year = a.releaseDate ? new Date(a.releaseDate).getFullYear().toString() : "Unknown";
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    const releaseYearData = Object.entries(yearCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => parseInt(b.name) - parseInt(a.name));

    return { totalAlbums, totalTracks, totalShares, topAlbumsData, releaseYearData };
  }, [albums, listenHistories]);

  // --- LOGIC 2: FILTER & SORT ---
  const processedAlbums = useMemo(() => {
    let result = [...albums];

    // Filter
    if (searchTerm || dateFilter.start || dateFilter.end) {
      result = result.filter(item => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.spotifyId && item.spotifyId.toLowerCase().includes(searchTerm.toLowerCase()));

        let matchesDate = true;
        if (dateFilter.start || dateFilter.end) {
          const releaseDate = new Date(item.releaseDate);
          if (dateFilter.start && releaseDate < startOfDay(new Date(dateFilter.start))) matchesDate = false;
          if (dateFilter.end && releaseDate > endOfDay(new Date(dateFilter.end))) matchesDate = false;
        }

        return matchesSearch && matchesDate;
      });
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: any = (a as any)[sortConfig.key!];
        let bValue: any = (b as any)[sortConfig.key!];

        if (sortConfig.key === 'releaseDate') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sortConfig.direction === 'asc' ? (aValue - bValue) : (bValue - aValue);
      });
    }
    return result;
  }, [albums, searchTerm, dateFilter, sortConfig]);

  // --- LOGIC 3: PAGINATION ---
  const totalPages = Math.ceil(processedAlbums.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return processedAlbums.slice(indexOfFirstItem, indexOfLastItem);
  }, [processedAlbums, currentPage]);

  useEffect(() => setCurrentPage(1), [searchTerm, dateFilter]); // Reset page on filter

  // --- LOGIC 4: ACTIONS ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(currentItems.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Xóa ${selectedIds.size} album đã chọn?`)) {
      const newAlbums = albums.filter(a => !selectedIds.has(a.id));
      setAlbums(newAlbums);
      setSelectedIds(new Set());
    }
  };

  const handleCreateAlbum = () => {
    const newId = Math.max(...albums.map(a => a.id), 0) + 1;
    const newAlbum = {
      id: newId,
      name: newAlbumData.name,
      spotifyId: newAlbumData.spotifyId || null,
      imageUrl: newAlbumData.imageUrl || null,
      totalTracks: 0,
      shareCount: 0,
      releaseDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      artists: artists.filter(a => newAlbumData.selectedArtistIds.includes(a.id)) // Map selected IDs to objects
    };

    // @ts-ignore
    setAlbums([newAlbum, ...albums]);
    setIsCreateDialogOpen(false);
    setNewAlbumData({ name: "", spotifyId: "", imageUrl: "", selectedArtistIds: [], artistSearchTerm: "" }); // Reset
  };

  const toggleArtistSelection = (artistId: number) => {
    setNewAlbumData(prev => {
      const currentIds = prev.selectedArtistIds;
      if (currentIds.includes(artistId)) {
        return { ...prev, selectedArtistIds: currentIds.filter(id => id !== artistId) };
      } else {
        return { ...prev, selectedArtistIds: [...currentIds, artistId] };
      }
    });
  };

  const requestSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredArtists = artists.filter(a =>
    a.name.toLowerCase().includes(newAlbumData.artistSearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (albums.length === 0) fetchAlbums();
    if (listenHistories.length === 0) fetchListenHistories();
  }, []);

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 opacity-50" />;
    return <ArrowUpDown className={`ml-2 h-4 w-4 text-blue-600 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="space-y-6 pb-10 bg-gray-50/50 min-h-screen p-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Album</h1>
          <p className="text-gray-500">Quản lý kho album nhạc, thống kê lượt nghe và phát hành.</p>
        </div>
        <Button variant="default" onClick={() => setIsCreateDialogOpen(true)} >
          <Plus className="w-4 h-4" /> Thêm Album
        </Button>
      </div>

      {/* --- SECTION 1: STATISTICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Stat Cards */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <StatCard title="Tổng Album" value={stats.totalAlbums} subtext="Trong cơ sở dữ liệu" icon={Disc} colorClass="bg-blue-500" />
          <StatCard title="Tổng Bài Hát" value={formatNumber(stats.totalTracks)} subtext="Trong tất cả album" icon={Music} colorClass="bg-green-500" />
          <StatCard title="Lượt Chia Sẻ" value={formatNumber(stats.totalShares)} subtext="Tương tác người dùng" icon={Share2} colorClass="bg-orange-500" />
        </div>

        {/* Chart: Top Albums (Horizontal Bar) */}
        <Card className="md:col-span-5 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Top Album (Lượt nghe cao nhất)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={stats.topAlbumsData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} interval={0} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="plays" barSize={20} radius={[0, 4, 4, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart: Release Year Distribution */}
        <Card className="md:col-span-4 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Phân Bố Năm Phát Hành</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.releaseYearData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stats.releaseYearData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                <div className="text-xl font-bold text-gray-900">{stats.totalAlbums}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- SECTION 2: FILTERS & ACTIONS --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        {/* Top Row: Search & Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên, Spotify ID..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500 mr-2">
              <Filter className="w-4 h-4 mr-2" /> Bộ lọc:
            </div>
            {/* From Date */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={dateFilter.start}
                onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                className="h-9 w-full sm:w-[160px] rounded-md border border-gray-200 bg-white pl-10 pr-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-600 cursor-pointer"
              />
            </div>
            <span className="text-gray-400">-</span>
            {/* To Date */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={dateFilter.end}
                onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                className="h-9 w-full sm:w-[160px] rounded-md border border-gray-200 bg-white pl-10 pr-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-600 cursor-pointer"
              />
            </div>

            {(searchTerm || dateFilter.start || dateFilter.end) && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setDateFilter({ start: "", end: "" }) }} className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-1" /> Xóa lọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            className="w-full md:w-auto flex items-center justify-center gap-2"
          >
            <Trash2Icon className="w-4 h-4" /> Xóa ({selectedIds.size})
          </Button>
        </div>
      )}

      {/* --- SECTION 3: DATA TABLE --- */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80">
                <TableHead className="w-[40px] text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={currentItems.length > 0 && currentItems.every(a => selectedIds.has(a.id))}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead onClick={() => requestSort('name')} className="cursor-pointer hover:text-blue-600">
                  <div className="flex items-center">Album {getSortIcon('name')}</div>
                </TableHead>
                <TableHead>Nghệ sĩ</TableHead>
                <TableHead onClick={() => requestSort('totalTracks')} className="text-right cursor-pointer hover:text-blue-600">
                  <div className="flex items-center justify-end">Số Bài {getSortIcon('totalTracks')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('shareCount')} className="text-right cursor-pointer hover:text-blue-600">
                  <div className="flex items-center justify-end">Chia Sẻ {getSortIcon('shareCount')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('releaseDate')} className="cursor-pointer hover:text-blue-600">
                  <div className="flex items-center">Ngày Phát Hành {getSortIcon('releaseDate')}</div>
                </TableHead>
                <TableHead className="w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((album, idx) => (
                  <TableRow key={idx} className={selectedIds.has(album.id) ? "bg-blue-50" : "hover:bg-gray-50/50"}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIds.has(album.id)}
                        onChange={() => handleSelectOne(album.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          {album.imageUrl ? (
                            <img src={album.imageUrl} alt={album.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full"><Disc className="w-5 h-5 text-gray-400" /></div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-semibold truncate max-w-[200px]">{album.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit border border-gray-200">
                        {album.artists && album.artists.length > 0 ? (
                          album.artists.map((artist: any, aIdx: number) => (
                            <span key={aIdx} className="font-medium text-gray-800">{artist.name}</span>
                          ))
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{album.totalTracks}</TableCell>
                    <TableCell className="text-right font-medium text-gray-700">{formatNumber(album.shareCount)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {album.releaseDate ? format(new Date(album.releaseDate), "dd/MM/yyyy") : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu
                        trigger={<Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>}
                        items={[
                          { label: "Xem Chi Tiết", icon: Eye, onClick: () => { setSelectedAlbum(album); setIsViewDialogOpen(true); } },
                          { label: "Chỉnh Sửa", icon: Edit, onClick: () => { setSelectedAlbum(album); setIsEditDialogOpen(true); } },
                          { label: "Xóa", icon: Trash2, className: "text-red-600", onClick: () => { if (confirm("Xóa album?")) setAlbums(albums.filter(a => a.id !== album.id)) } }
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 p-4 rounded-full mb-3"><Disc className="w-8 h-8 text-gray-400" /></div>
                      <p className="text-base font-medium text-gray-900">Không tìm thấy album</p>
                      <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {processedAlbums.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Hiển thị <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong>{Math.min(currentPage * ITEMS_PER_PAGE, processedAlbums.length)}</strong> trong <strong>{processedAlbums.length}</strong> kết quả
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Trước</Button>
              {getPaginationItems(currentPage, totalPages).map((item, idx) => (
                item === '...' ? <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span> :
                  <Button
                    key={item}
                    variant={currentPage === item ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(item as number)}
                    className={currentPage === item ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                  >
                    {item}
                  </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Sau</Button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL: CREATE ALBUM --- */}
      <Modal
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Thêm Album Mới"
        description="Nhập thông tin chi tiết cho album mới."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleCreateAlbum} className="bg-blue-600 hover:bg-blue-700">Tạo Album</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên Album</label>
            <Input
              placeholder="Nhập tên album..."
              value={newAlbumData.name}
              onChange={(e: any) => setNewAlbumData({ ...newAlbumData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Spotify ID (Optional)</label>
              <Input
                placeholder="VD: 4aawyAB9vmqN3uQ7FjRGTy"
                value={newAlbumData.spotifyId}
                onChange={(e: any) => setNewAlbumData({ ...newAlbumData, spotifyId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ảnh Bìa (URL)</label>
              <Input
                placeholder="https://..."
                value={newAlbumData.imageUrl}
                onChange={(e: any) => setNewAlbumData({ ...newAlbumData, imageUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Artist Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn Nghệ Sĩ</label>
            <div className="border border-gray-200 rounded-md p-3 bg-gray-50/50">
              <div className="relative mb-3">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <input
                  className="w-full pl-7 pr-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Tìm nghệ sĩ..."
                  value={newAlbumData.artistSearchTerm}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, artistSearchTerm: e.target.value })}
                />
              </div>
              <div className="max-h-[120px] overflow-y-auto space-y-1">
                {filteredArtists.length > 0 ? (
                  filteredArtists.map(artist => (
                    <div
                      key={artist.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer group"
                      onClick={() => toggleArtistSelection(artist.id)}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${newAlbumData.selectedArtistIds.includes(artist.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                        {newAlbumData.selectedArtistIds.includes(artist.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm text-gray-700">{artist.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">Không tìm thấy nghệ sĩ</p>
                )}
              </div>
              {/* Selected Chips */}
              {newAlbumData.selectedArtistIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-gray-200">
                  {artists.filter(a => newAlbumData.selectedArtistIds.includes(a.id)).map(a => (
                    <Badge key={a.id} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 gap-1 pr-1">
                      {a.name}
                      <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => toggleArtistSelection(a.id)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* --- MODAL: VIEW DETAILS (Simplified) --- */}
      <Modal isOpen={isViewDialogOpen} onClose={() => setIsViewDialogOpen(false)} title="Thông tin Album">
        {selectedAlbum && (
          <div className="flex gap-4">
            <img src={selectedAlbum.imageUrl || "https://placehold.co/150"} className="w-24 h-24 rounded object-cover shadow-sm bg-gray-100" />
            <div>
              <h3 className="font-bold text-lg">{selectedAlbum.name}</h3>
              <div className="text-sm text-gray-500 space-y-1 mt-1">
                <p>Tracks: {selectedAlbum.totalTracks}</p>
                <p>ID: {selectedAlbum.id} / Spotify: {selectedAlbum.spotifyId || 'N/A'}</p>
                <p>Phát hành: {selectedAlbum.releaseDate ? format(new Date(selectedAlbum.releaseDate), "dd/MM/yyyy") : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}