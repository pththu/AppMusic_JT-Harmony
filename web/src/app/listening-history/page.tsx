"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Play,
  Clock,
  Music,
  User,
  Plus,
  Filter,
} from "lucide-react";
import {
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import {
  mockListeningHistories,
  mockUsers,
  mockTracks,
  getUserById,
  type ListeningHistory,
} from "@/lib/mock-data";

export default function ListeningHistoryPage() {
  const [listeningHistories, setListeningHistories] = useState<
    ListeningHistory[]
  >(mockListeningHistories);
  const [selectedHistory, setSelectedHistory] =
    useState<ListeningHistory | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleDeleteHistory = (index: number) => {
    setListeningHistories(listeningHistories.filter((_, i) => i !== index));
  };

  const handleViewHistory = (history: ListeningHistory) => {
    setSelectedHistory(history);
    setIsViewDialogOpen(true);
  };

  const getTrackById = (id: number) => {
    return mockTracks.find((track) => track.id === id);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "track":
        return "Bài hát";
      case "playlist":
        return "Playlist";
      case "album":
        return "Album";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Lịch Sử Nghe Nhạc
          </h1>
          <p className="text-gray-600">
            Quản lý lịch sử nghe nhạc của người dùng
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm
          </Button>
        </div>
      </div>

      {/* Listening History Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người Dùng</TableHead>
              <TableHead>Mục Nghe</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Thời Gian Nghe</TableHead>
              <TableHead>Thời Lượng</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listeningHistories.map((history, index) => {
              const user = getUserById(history.userId);
              const track =
                history.type === "track" ? getTrackById(history.itemId) : null;

              return (
                <TableRow
                  key={`${history.userId}-${history.itemId}-${history.listenedAt}-${index}`}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <User className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user?.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user?.fullName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {track ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Music className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {track.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {track.artist}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Play className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {getItemTypeLabel(history.type)} #{history.itemId}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getItemTypeLabel(history.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(
                      new Date(history.listenedAt),
                      "MMM dd, yyyy 'lúc' HH:mm"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatDuration(history.durationListened)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewHistory(history)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteHistory(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa Lịch Sử
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* View History Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Lịch Sử Nghe</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết về hoạt động nghe nhạc
            </DialogDescription>
          </DialogHeader>
          {selectedHistory && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <Play className="h-6 w-6 text-green-500" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Hoạt Động Nghe Nhạc
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{getItemTypeLabel(selectedHistory.type)}</span>
                      <span>
                        {format(
                          new Date(selectedHistory.listenedAt),
                          "MMM dd, yyyy 'lúc' HH:mm"
                        )}
                      </span>
                      <span>
                        {formatDuration(selectedHistory.durationListened)} nghe
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Người Dùng</h4>
                  {(() => {
                    const user = getUserById(selectedHistory.userId);
                    return user ? (
                      <div className="flex items-center space-x-3 p-3 bg-white rounded border">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-400">ID: {user.id}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Không tìm thấy thông tin người dùng
                      </p>
                    );
                  })()}
                </div>

                {/* Item Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Mục Nghe</h4>
                  {(() => {
                    const track =
                      selectedHistory.type === "track"
                        ? getTrackById(selectedHistory.itemId)
                        : null;
                    return track ? (
                      <div className="p-3 bg-white rounded border">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Music className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {track.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {track.artist}
                            </p>
                            <p className="text-xs text-gray-400">
                              Album: {track.album}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>🎵 {formatDuration(track.duration)}</span>
                          <span>▶️ {track.playCount} lượt nghe</span>
                          <span>❤️ {track.shareCount} chia sẻ</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-white rounded border">
                        <p className="font-medium text-gray-900">
                          {getItemTypeLabel(selectedHistory.type)} #
                          {selectedHistory.itemId}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID mục: {selectedHistory.itemId}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
