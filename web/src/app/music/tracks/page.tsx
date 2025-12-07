"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { formatDuration } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Play,
  Edit,
  Plus,
  Share2,
  Music,
  Search,
  ArrowUpDown,
  Disc,
  X,
  ChevronRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight
} from "lucide-react";
import { Button, Input, StatCard, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import DropdownMenu from "@/components/music/track/dropdown-menu";
import SelectNative from "@/components/music/track/select-native";
import DetailModal from "@/components/music/track/detail-modal";
import EditModal from "@/components/music/track/edit-modal";
import ChartTopTrack from "@/components/music/track/chart-top-track";
import { formatArtists } from "@/utils";
import { useHistoryStore, useMusicStore } from "@/store";
import { useRouter } from "next/navigation";

export default function TracksPage() {
  const router = useRouter();
  const { tracks, fetchTracks, setTracks } = useMusicStore();
  const { listenHistories, fetchListenHistories } = useHistoryStore();

  // Dialog States
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExplicit, setFilterExplicit] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof any | 'albumName' | 'artistName' | null, direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

  // --- STATISTICS LOGIC ---
  const stats = useMemo(() => {
    const totalTracks = tracks.length;
    const totalPlays = tracks.reduce((acc, curr) => acc + curr.playCount, 0);
    const totalShares = tracks.reduce((acc, curr) => acc + curr.shareCount, 0);

    console.log('totalPlays: ', totalPlays)

    const topTracksData = [...tracks]
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10)
      .map(t => ({
        name: t.name.length > 15 ? t.name.substring(0, 15) + '...' : t.name,
        plays: t.playCount,
        fullTitle: t.name
      }));

    return { totalTracks, totalPlays, totalShares, topTracksData };
  }, [tracks]);

  // --- FILTER & SORT LOGIC ---
  const processedTracks = useMemo(() => {
    let result = [...tracks];

    // Filter
    if (searchTerm || filterExplicit !== 'all') {
      result = result.filter(track => {
        const matchesSearch =
          track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          track.album.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          track.artists.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesExplicit =
          filterExplicit === 'all' ||
          (filterExplicit === 'explicit' && track.explicit) ||
          (filterExplicit === 'clean' && !track.explicit);

        return matchesSearch && matchesExplicit;
      });
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'albumName') {
          aValue = a.album.name;
          bValue = b.album.name;
        } else if (sortConfig.key === 'artistName') {
          aValue = a.artists[0]?.name || '';
          bValue = b.artists[0]?.name || '';
        } else {
          aValue = a[sortConfig.key as keyof any];
          bValue = b[sortConfig.key as keyof any];
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
  }, [tracks, searchTerm, filterExplicit, sortConfig]);

  // ======== PAGINATION LOGIC ========
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterExplicit, itemsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedTracks.slice(startIndex, endIndex);
  }, [processedTracks, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedTracks.length / itemsPerPage);

  // Pagination text
  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, processedTracks.length);

  // Handlers
  const requestSort = (key: keyof any | 'albumName' | 'artistName') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 opacity-50" />;
    return <ArrowUpDown className={`ml-2 h-4 w-4 text-blue-600 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />;
  };

  const handleDeleteTrack = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa bài hát này?")) {
      setTracks(tracks.filter(t => t.id !== id));
    }
  };

  useEffect(() => {
    if (tracks.length === 0) fetchTracks();
    if (listenHistories.length === 0) fetchListenHistories();
  }, [fetchTracks, tracks.length, fetchListenHistories, listenHistories.length]);

  return (
    <div className="space-y-6 pb-10 bg-gray-50/30 min-h-screen p-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản Lý Bài Hát</h1>
          <p className="text-gray-500">Quản lý kho nhạc, thống kê lượt nghe và chia sẻ.</p>
        </div>
        {/* <Button variant="default" size="sm" onClick={() => router.push('/music/add-track')}>
          <Plus className="h-4 w-4 mr-2" /> Thêm Bài Hát
        </Button> */}
      </div>

      {/* --- SECTION 1: STATISTICS & CHARTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
        {/* Stat Cards */}
        <div className="space-y-4">
          <StatCard
            title="Tổng Bài Hát"
            value={stats.totalTracks}
            subtext="Trong cơ sở dữ liệu"
            icon={Music}
            colorClass="bg-blue-500"
          />
          <StatCard
            title="Tổng Lượt Nghe"
            value={stats.totalPlays.toLocaleString()}
            subtext="Tăng 12% so với tháng trước"
            icon={Play}
            colorClass="bg-green-500"
          />
          <StatCard
            title="Tổng Lượt Chia Sẻ"
            value={stats.totalShares.toLocaleString()}
            subtext="Hoạt động tương tác cao"
            icon={Share2}
            colorClass="bg-purple-500"
          />
        </div>

        {/* Chart: Top Songs */}
        <ChartTopTrack stats={stats} />
      </div>

      {/* --- SECTION 2: FILTERS --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên bài hát, nghệ sĩ, album..."
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="w-[180px]">
          <SelectNative
            value={filterExplicit}
            onChange={setFilterExplicit}
            placeholder="Tất cả nội dung"
            options={[
              { value: 'explicit', label: 'Chỉ Explicit (18+)' },
              { value: 'clean', label: 'Chỉ Clean' },
            ]}
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
                <div className="flex items-center">Bài Hát {getSortIcon('name')}</div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('artistName')}
              >
                <div className="flex items-center">Nghệ Sĩ {getSortIcon('artistName')}</div>
              </TableHead>
              <TableHead
                className="hidden md:table-cell cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('albumName')}
              >
                <div className="flex items-center">Album {getSortIcon('albumName')}</div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('duration')}
              >
                <div className="flex items-center justify-end">Thời Lượng {getSortIcon('duration')}</div>
              </TableHead>
              <TableHead
                className="text-right cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => requestSort('playCount')}
              >
                <div className="flex items-center justify-end">Lượt Nghe {getSortIcon('playCount')}</div>
              </TableHead>
              <TableHead className="w-[80px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((track) => (
                <TableRow key={track.id} className="group hover:bg-blue-50/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {track.imageUrl ? (
                          <img src={track.imageUrl} alt={track.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><Music className="w-5 h-5 text-gray-400" /></div>
                        )}
                        {track.explicit && (
                          <span className="absolute bottom-0 right-0 bg-gray-900 text-white text-[8px] px-1 font-bold">E</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-semibold line-clamp-1" title={track.name}>{track.name.slice(0, 20).concat('...')}</span>
                        <span className="text-xs text-gray-500 md:hidden">{formatArtists(track.artists)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatArtists(track.artists)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500">
                    <div className="flex items-center gap-2">
                      <Disc className="w-4 h-4 text-gray-400" />
                      <span className="truncate max-w-[150px]" title={track.album.name}>{track.album.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-gray-600 font-mono text-xs">
                    {formatDuration(track.duration)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-semibold text-gray-700">{track.playCount.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu
                      trigger={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button>}
                      items={[
                        { label: "Xem Chi Tiết", icon: Eye, onClick: () => { setSelectedTrack(track); setIsViewDialogOpen(true); } },
                        { label: "Chỉnh Sửa", icon: Edit, onClick: () => { setSelectedTrack(track); setIsEditDialogOpen(true); } },
                        { label: "Xóa", icon: Trash2, className: "text-red-600", onClick: () => handleDeleteTrack(track.id) }
                      ]}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  Không tìm thấy bài hát nào phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* --- PAGINATION CONTROLS --- */}
        {processedTracks.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-medium text-gray-900">{startRecord}</span> đến <span className="font-medium text-gray-900">{endRecord}</span> trong tổng số <span className="font-medium text-gray-900">{processedTracks.length}</span> kết quả
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="hidden sm:flex"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Trước
              </Button>

              <div className="flex items-center px-2">
                <span className="text-sm font-medium text-gray-700">Trang {currentPage} / {totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="hidden sm:flex"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL: VIEW DETAILS --- */}
      <DetailModal
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        selectedTrack={selectedTrack}
        formatArtists={formatArtists}
      />

      {/* --- MODAL: EDIT (Placeholder) --- */}
      <EditModal
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
      />
    </div>
  );
}