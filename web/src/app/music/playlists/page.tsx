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
  Database,
  X,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  Delete
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
import { useHistoryStore, useMusicStore, useUserStore } from "@/store";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import ViewDetailModal from "@/components/music/playlist/view-detail-modal";
import AddModal from "@/components/music/playlist/add-modal";
import { is } from "date-fns/locale";
import { AddPlaylist, DeletePlaylists } from "@/services";
import toast from "react-hot-toast";

// --- COMPONENTS CON (SelectNative, Modal, DropdownMenu, StatCard) ---
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

// --- 3. MAIN PAGE COMPONENT ---

export default function PlaylistsPage() {
  const { users, fetchUsers } = useUserStore();
  const { playlists, setPlaylists, fetchPlaylists } = useMusicStore();
  const { listenHistories, fetchListenHistories } = useHistoryStore();

  // --- States ---
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  // FIX: Đặt giá trị mặc định là "all" để khớp với value của option placeholder trong SelectNative
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [filterSource, setFilterSource] = useState("all");

  const [sortConfig, setSortConfig] = useState<{ key: string | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  // Form State (New Playlist)
  const [newPlaylistData, setNewPlaylistData] = useState({
    name: "",
    description: "",
    type: "playlist",
    isPublic: true,
    userId: null,
    sharedCount: 0,
    image: null,
    imagePreview: null
  });

  // --- LOGIC 1: STATISTICS ---
  const stats = useMemo(() => {
    const totalPlaylists = playlists.length;
    const totalTracks = playlists.reduce((acc, curr) => acc + curr.totalTracks, 0);

    const publicCount = playlists.filter(p => p.isPublic).length;
    const privateCount = totalPlaylists - publicCount;
    const visibilityData = [
      { name: 'Công Khai', value: publicCount, color: '#22c55e' },
      { name: 'Riêng Tư', value: privateCount, color: '#64748b' }
    ].filter(i => i.value > 0);

    const playCounts: Record<number, number> = {};
    listenHistories.forEach((h) => {
      if (h.itemType === 'playlist') {
        if (h.itemId) playCounts[h.itemId] = (playCounts[h.itemId] || 0) + 1;
      }
    });

    const topPlaylistsData = playlists
      .map(p => ({
        name: p.name.length > 25 ? p.name.slice(0, 22) + '...' : p.name,
        fullTitle: p.name.length > 25 ? p.name.slice(0, 22) + '...' : p.name,
        plays: p.id ? (playCounts[p.id] || 0) : 0,
      }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    return { totalPlaylists, totalTracks, visibilityData, topPlaylistsData };
  }, [playlists, listenHistories]);

  // --- LOGIC 2: FILTER & SORT (UPDATED) ---
  const processedPlaylists = useMemo(() => {
    let result = [...playlists];

    // Filter Logic
    if (searchTerm || filterType !== 'all' || filterVisibility !== 'all' || filterSource !== 'all') {
      result = result.filter(item => {
        // 1. Search (Name & Owner)
        const ownerName = item.userId ? (users.find(u => u.id === item.userId)?.fullName || "") : "";
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ownerName.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Type (Hiện tại UI chưa có dropdown chọn type, mặc định 'all')
        const matchesType = filterType === 'all' || item.type === filterType;

        // 3. Visibility (Public/Private)
        const matchesVisibility = filterVisibility === 'all' ||
          (filterVisibility === 'public' && item.isPublic) ||
          (filterVisibility === 'private' && !item.isPublic);

        // 4. Source (Local/Spotify) - FIX LOGIC
        const matchesSource = filterSource === 'all' ||
          (filterSource === 'spotify' && !!item.spotifyId) || // Có spotifyId là Spotify
          (filterSource === 'local' && !item.spotifyId);      // Không có là Local

        return matchesSearch && matchesType && matchesVisibility && matchesSource;
      });
    }

    // Sort Logic
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: any = sortConfig.key === 'ownerName'
          ? (a.userId ? users.find(u => u.id === a.userId)?.fullName : "")
          : (a as any)[sortConfig.key!];

        let bValue: any = sortConfig.key === 'ownerName'
          ? (b.userId ? users.find(u => u.id === b.userId)?.fullName : "")
          : (b as any)[sortConfig.key!];

        // Handle null/undefined for sort
        if (!aValue) aValue = "";
        if (!bValue) bValue = "";

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return sortConfig.direction === 'asc' ? (aValue - bValue) : (bValue - aValue);
      });
    }
    return result;
  }, [playlists, users, searchTerm, filterType, filterVisibility, filterSource, sortConfig]);

  // --- LOGIC 3: PAGINATION ---
  const totalPages = Math.ceil(processedPlaylists.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return processedPlaylists.slice(indexOfFirstItem, indexOfLastItem);
  }, [processedPlaylists, currentPage, itemsPerPage]);

  // Reset page when filter changes
  useEffect(() => setCurrentPage(1), [searchTerm, filterType, filterVisibility, filterSource]);

  // --- LOGIC 4: SELECTION & ACTIONS ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const ids = currentItems.map(item => item.id);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number | string) => {
    const newSelected = [...selectedIds];
    if (newSelected.includes(id)) {
      newSelected.splice(newSelected.indexOf(id), 1);
    } else {
      newSelected.push(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const response = await DeletePlaylists(selectedIds);
    console.log('response', response)
    if (!response.success) {
      toast.error(`Lỗi khi xóa playlisDt: ${response.message || 'Unknown error'}`);
      return;
    }

    const newPlaylists = playlists.filter((p) => p.id && !selectedIds.includes(p.id));
    setPlaylists(newPlaylists);

    setSelectedIds([]);
    toast.success("Xóa playlist thành công!")
  };

  const handleAddPlaylist = async () => {
    const newPlaylist = {
      name: newPlaylistData.name,
      description: newPlaylistData.description,
      isPublic: newPlaylistData.isPublic,
      userId: newPlaylistData.userId,
      sharedCount: newPlaylistData.sharedCount,
      image: newPlaylistData.image
    }

    setPlaylists([{
      id: `temp-${Date.now()}`,
      name: newPlaylistData.name,
      description: newPlaylistData.description,
      isPublic: newPlaylistData.isPublic,
      userId: newPlaylistData.userId,
      sharedCount: newPlaylistData.sharedCount,
      imageUrl: newPlaylistData.image
    }, ...playlists]);
    const response = await AddPlaylist(newPlaylist);
    if (!response.success) {
      toast.error(`Lỗi khi thêm playlist: ${response.message || 'Unknown error'}`);
      return;
    }

    const newPlaylists = playlists.map((p) => {
      if (p.id.toString().startsWith('temp-')) {
        p.id = response.playlist.id;
        p.imageUrl = response.playlist.imageUrl;
        p.createdAt = response.playlist.createdAt;
      }
      return p;
    })
    setPlaylists(newPlaylists);
    setIsAddDialogOpen(false);
    setNewPlaylistData({
      name: "",
      description: "",
      type: "playlist",
      isPublic: true,
      userId: null,
      sharedCount: 0,
      image: null,
      imagePreview: null
    });
    toast.success("Thêm playlist thành công!")
  };

  const requestSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  useEffect(() => {
    if (users.length === 0) fetchUsers();
    if (playlists.length === 0) fetchPlaylists();
    if (listenHistories.length === 0) fetchListenHistories();
  }, []);

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 opacity-50" />;
    return <ArrowUpDown className={`ml-2 h-4 w-4 text-blue-600 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />;
  };

  return (
    <div className="space-y-6 pb-10 bg-gray-50/30 min-h-screen p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Danh Sách Phát</h1>
          <p className="text-gray-500">Quản lý playlist, album và theo dõi thống kê lượt nghe.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Thêm danh sách phát
          </Button>
        </div>
      </div>

      {/* --- SECTION 1: STATISTICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3 flex flex-col gap-4">
          <StatCard title="Tổng Playlist" value={stats.totalPlaylists} subtext="Playlist & Album" icon={ListMusic} colorClass="bg-blue-500" />
          <StatCard title="Tổng Bài Hát" value={stats.totalTracks.toLocaleString()} subtext="Toàn hệ thống" icon={Music} colorClass="bg-purple-500" />
        </div>

        <Card className="md:col-span-5 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Top Playlist (Lượt Nghe Cao Nhất)</CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-2">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={stats.topPlaylistsData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
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

        <Card className="md:col-span-4 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Quyền Riêng Tư</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.visibilityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stats.visibilityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                <div className="text-xl font-bold text-gray-900">{stats.totalPlaylists}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- SECTION 2: FILTERS --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Tìm kiếm theo tên, người tạo..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} className="pl-10 w-full" />
        </div>
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-2 border-r border-gray-200 pr-2 mr-2">
            <Filter className="w-4 h-4 text-gray-500" /> <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Bộ lọc:</span>
          </div>
          <div className="w-[200px] flex-shrink-0">
            <SelectNative
              value={filterVisibility}
              onChange={setFilterVisibility}
              placeholder="Tất cả Quyền riêng tư"
              options={[
                { value: 'public', label: 'Công Khai' },
                { value: 'private', label: 'Riêng Tư' }
              ]}
            />
          </div>
          <div className="w-[200px] flex-shrink-0">
            <SelectNative
              value={filterSource}
              onChange={setFilterSource}
              placeholder="Tất cả Nguồn"
              options={[
                { value: 'local', label: 'Local DB' },
                { value: 'spotify', label: 'Spotify' }
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 w-full items-end justify-end">
        {selectedIds.length > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected} className="animate-in fade-in zoom-in duration-200">
            <Trash2 className="mr-2 h-4 w-4" /> Xóa ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* --- SECTION 3: DATA TABLE --- */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="w-[40px] text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onChange={handleSelectAll}
                  checked={currentItems.length > 0 && currentItems.every(p => selectedIds.includes(p.id))}
                />
              </TableHead>
              <TableHead className="w-[50px] text-center font-bold text-gray-700">STT</TableHead>
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer hover:text-blue-600">
                <div className="flex items-center">Tên {getSortIcon('name')}</div>
              </TableHead>
              <TableHead>Nguồn / ID</TableHead>
              <TableHead onClick={() => requestSort('ownerName')} className="cursor-pointer hover:text-blue-600">
                <div className="flex items-center">Người Tạo {getSortIcon('ownerName')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('totalTracks')} className="text-right cursor-pointer hover:text-blue-600">
                <div className="flex items-center justify-end">Số Bài {getSortIcon('totalTracks')}</div>
              </TableHead>
              <TableHead className="text-center">Trạng Thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((playlist, idx) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                const itemId = playlist.id || playlist.spotifyId;
                const isSelected = selectedIds.includes(itemId!);
                const owner = playlist.userId ? users.find(u => u.id === playlist.userId) : null;

                return (
                  <TableRow key={idx} className={isSelected ? "bg-blue-50" : ""}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={isSelected}
                        onChange={() => handleSelectOne(itemId!)}
                      />
                    </TableCell>
                    <TableCell className="text-center text-gray-500 font-mono text-xs">{globalIndex}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          {playlist.imageUrl ? <img src={playlist.imageUrl} alt="" className="w-full h-full object-cover" /> : <ListMusic className="w-4 h-4 m-auto text-gray-400 mt-2" />}
                        </div>
                        <div className="flex flex-col max-w-[200px]">
                          <span className="text-gray-900 font-semibold truncate" title={playlist.name}>{playlist.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {playlist.spotifyId ? (
                        <Badge variant="outline" className="text-[10px] text-green-700 bg-green-50 border-green-200">Spotify</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50 border-blue-200">Local DB</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700">{owner?.fullName || "Unknown"}</TableCell>
                    <TableCell className="text-right font-mono">{playlist.totalTracks}</TableCell>
                    <TableCell className="text-center">
                      {playlist.isPublic ? <Badge variant="secondary">Public</Badge> : <Badge variant="secondary">Private</Badge>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu
                        trigger={<Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>}
                        items={[
                          { label: "Chi Tiết", icon: Eye, onClick: () => { setSelectedPlaylist(playlist); setIsViewDialogOpen(true); } },
                          { label: "Sửa", icon: Edit, onClick: () => { setSelectedPlaylist(playlist); setIsEditDialogOpen(true); } },
                          { label: "Xóa", icon: Trash2, className: "text-red-600", onClick: () => { /* Single Delete Logic */ } }
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-gray-500">Không tìm thấy dữ liệu phù hợp.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* --- PAGINATION CONTROLS --- */}
        {processedPlaylists.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Hiển thị <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(currentPage * itemsPerPage, processedPlaylists.length)}</strong> trong <strong>{processedPlaylists.length}</strong> kết quả
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, currentPage - 2),
                Math.min(totalPages, currentPage + 1)
              ).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL: ADD PLAYLIST --- */}
      <AddModal
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        newPlaylistData={newPlaylistData}
        setNewPlaylistData={setNewPlaylistData}
        handleAddPlaylist={handleAddPlaylist}
      />

      {/* --- MODAL: VIEW DETAILS --- */}
      <ViewDetailModal
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        selectedPlaylist={selectedPlaylist}
      />

      {/* --- MODAL: EDIT --- */}
      <Modal isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} title="Chỉnh sửa">
        <div className="py-8 text-center text-gray-500">Form chỉnh sửa sẽ được đặt tại đây</div>
      </Modal>

    </div>
  );
}