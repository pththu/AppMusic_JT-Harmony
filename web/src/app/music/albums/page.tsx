"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
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
  Layers
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
import { Badge, Button, Input } from "@/components/ui";

// --- 1. SIMPLIFIED UI COMPONENTS (INLINED) ---

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

// --- 3. UTILS & HELPER COMPONENTS ---

const getAlbumIdDisplay = (a) => {
  if (a.id) return { label: `ID: ${a.id}`, type: 'local', icon: Database };
  if (a.spotifyId) return { label: `SP: ${a.spotifyId}`, type: 'spotify', icon: Globe };
  return { label: 'No ID', type: 'none', icon: X };
};

const formatNumber = (num) => num.toLocaleString('en-US');

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
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

export default function AlbumsPage() {
  // const [albums, setAlbums] = useState<Album[]>(MOCK_ALBUMS);
  const { albums, setAlbums, fetchAlbums } = useMusicStore();
  
  // Dialog States
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // --- STATISTICS LOGIC ---
  const stats = useMemo(() => {
    const totalAlbums = albums.length;
    const totalTracks = albums.reduce((acc, curr) => acc + curr.totalTracks, 0);
    const totalShares = albums.reduce((acc, curr) => acc + curr.shareCount, 0);
    
    // Top Albums by Track Count
    const topAlbumsByTracks = [...albums]
      .sort((a, b) => b.totalTracks - a.totalTracks)
      .slice(0, 5)
      .map(a => ({
        name: a.name.length > 15 ? a.name.substring(0, 15) + '...' : a.name,
        tracks: a.totalTracks,
        fullTitle: a.name
      }));

    // Release Year Distribution
    const yearCounts: Record<string, number> = {};
    albums.forEach(a => {
      if (a.releaseDate) {
        const year = new Date(a.releaseDate).getFullYear().toString();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      } else {
        yearCounts["Unknown"] = (yearCounts["Unknown"] || 0) + 1;
      }
    });

    const releaseYearData = Object.entries(yearCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => parseInt(b.name) - parseInt(a.name)); // Sort years desc

    return { totalAlbums, totalTracks, totalShares, topAlbumsByTracks, releaseYearData };
  }, [albums]);

  // --- FILTER & SORT LOGIC ---
  const processedAlbums = useMemo(() => {
    let result = [...albums];

    // 1. Filter
    if (searchTerm) {
      result = result.filter(item => {
        return (
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.spotifyId && item.spotifyId.toLowerCase().includes(searchTerm.toLowerCase()))
        );
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
  }, [albums, searchTerm, sortConfig]);

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

  const handleDeleteAlbum = (id: number) => {
    if(confirm("Bạn có chắc muốn xóa album này khỏi hệ thống?")) {
      // setAlbums(prev => prev.filter(p => p.id !== id));
      const newAlbums = albums.filter(a => a.id !== id);
      setAlbums(newAlbums);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return (
    <div className="space-y-6 pb-10 bg-gray-50/30 min-h-screen p-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Album</h1>
          <p className="text-gray-500">Quản lý kho album nhạc, thống kê số lượng bài hát và chia sẻ.</p>
        </div>
        {/* <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Thêm Album Mới
        </Button> */}
      </div>

      {/* --- SECTION 1: STATISTICS & CHARTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Stat Cards */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <StatCard 
            title="Tổng Album" 
            value={stats.totalAlbums} 
            subtext="Trong cơ sở dữ liệu"
            icon={Disc} 
            colorClass="bg-blue-500"
          />
          <StatCard 
            title="Tổng Bài Hát" 
            value={formatNumber(stats.totalTracks)} 
            subtext="Trong tất cả album"
            icon={Music} 
            colorClass="bg-green-500"
          />
          <StatCard 
            title="Tổng Lượt Chia Sẻ" 
            value={formatNumber(stats.totalShares)} 
            subtext="Tương tác người dùng"
            icon={Share2} 
            colorClass="bg-orange-500"
          />
        </div>

        {/* Chart: Top Albums by Tracks */}
        <Card className="md:col-span-5 shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center">
              Top Album (Nhiều bài hát nhất)
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-0 pb-2">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topAlbumsByTracks} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                  <YAxis tick={{fontSize: 10}} width={30} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Bar dataKey="tracks" barSize={30} radius={[4, 4, 0, 0]} fill="#3b82f6" />
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
            <div className="h-[200px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.releaseYearData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.releaseYearData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                <div className="text-xl font-bold text-gray-900">{stats.totalAlbums}</div>
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
            placeholder="Tìm kiếm album theo tên hoặc Spotify ID..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                <div className="flex items-center">Album {getSortIcon('name')}</div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">ID / Nguồn</div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('totalTracks')}
              >
                <div className="flex items-center justify-end">Số Bài {getSortIcon('totalTracks')}</div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('shareCount')}
              >
                <div className="flex items-center justify-end">Lượt Chia Sẻ {getSortIcon('shareCount')}</div>
              </TableHead>
              <TableHead className="w-[120px]">Ngày Phát Hành</TableHead>
              <TableHead className="w-[80px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedAlbums.length > 0 ? (
              processedAlbums.map((album, idx) => {
                const idInfo = getAlbumIdDisplay(album);
                const Icon = idInfo.icon;
                return (
                  <TableRow key={idx} className="group hover:bg-blue-50/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          {album.imageUrl ? (
                            <img src={album.imageUrl} alt={album.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full"><Disc className="w-5 h-5 text-gray-400"/></div>
                          )}
                        </div>
                        <span className="text-gray-900 font-semibold">{album.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit">
                        <Icon className={`w-3 h-3 ${idInfo.type === 'spotify' ? 'text-green-600' : 'text-blue-600'}`} />
                        <span className="font-mono">{idInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-mono">{album.totalTracks}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-gray-700">
                      {formatNumber(album.shareCount)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {album.releaseDate ? format(new Date(album.releaseDate), "dd/MM/yyyy") : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu 
                        trigger={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>}
                        items={[
                          { label: "Xem Chi Tiết", icon: Eye, onClick: () => { setSelectedAlbum(album); setIsViewDialogOpen(true); } },
                          { label: "Chỉnh Sửa", icon: Edit, onClick: () => { setSelectedAlbum(album); setIsEditDialogOpen(true); } },
                          { label: "Xóa", icon: Trash2, className: "text-red-600", onClick: () => handleDeleteAlbum(album.id) }
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  Không tìm thấy album nào phù hợp.
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
        title="Thông tin Album"
      >
        {selectedAlbum && (
          <div className="flex flex-col items-center text-center gap-6 pt-4">
            <div className="relative">
              <img 
                src={selectedAlbum.imageUrl || "https://placehold.co/150?text=No+Image"} 
                alt="Cover" 
                className="w-40 h-40 rounded-lg shadow-lg object-cover border-4 border-white ring-1 ring-gray-200" 
              />
              <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                {selectedAlbum.spotifyId ? <Globe className="w-5 h-5 text-green-500"/> : <Database className="w-5 h-5 text-blue-500"/>}
              </div>
            </div>

            <div className="space-y-2 w-full">
              <h3 className="text-2xl font-bold text-gray-900">{selectedAlbum.name}</h3>
              <p className="text-gray-500 text-sm">
                Phát hành: {selectedAlbum.releaseDate ? format(new Date(selectedAlbum.releaseDate), "dd MMMM yyyy") : 'Không rõ'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-600 uppercase font-bold tracking-wide">Số Bài Hát</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Layers className="w-5 h-5 text-blue-600"/>
                  <p className="font-bold text-2xl text-gray-900">{selectedAlbum.totalTracks}</p>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="text-xs text-orange-600 uppercase font-bold tracking-wide">Lượt Chia Sẻ</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Share2 className="w-5 h-5 text-orange-600"/>
                  <p className="font-bold text-2xl text-gray-900">{formatNumber(selectedAlbum.shareCount)}</p>
                </div>
              </div>
            </div>

            {/* IDs Section */}
            <div className="w-full space-y-3 border-t border-gray-100 pt-4 text-left">
              <h4 className="text-sm font-semibold text-gray-900">Thông tin định danh</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-600 font-medium">Database ID</span>
                  <span className="font-mono text-gray-900">{selectedAlbum.id !== null ? selectedAlbum.id : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-600 font-medium">Spotify ID</span>
                  <span className="font-mono text-gray-900">{selectedAlbum.spotifyId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded text-sm">
                  <span className="text-gray-600 font-medium">Ngày tạo (Hệ thống)</span>
                  <span className="font-mono text-gray-900">{format(new Date(selectedAlbum.createdAt), "dd/MM/yyyy HH:mm")}</span>
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
        title="Chỉnh sửa Album"
        description="Cập nhật thông tin chi tiết."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>Lưu Thay Đổi</Button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-sm text-gray-500 italic">Form chỉnh sửa sẽ được đặt tại đây (Tên, Ảnh bìa, Ngày phát hành...)</p>
        </div>
      </Modal>

    </div>
  );
}