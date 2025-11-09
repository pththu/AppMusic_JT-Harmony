"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Music,
  User,
  Edit,
  Plus,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  mockPlaylists,
  mockUsers,
  getUserById,
  getTracksByPlaylistId,
  type Playlist,
} from "@/lib/mock-data";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    isPublic: true,
    type: "playlist" as "playlist" | "album",
    userId: 1 as number,
  });

  const handleDeletePlaylist = (playlistId: number) => {
    setPlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
  };

  const handleViewPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsViewDialogOpen(true);
  };

  const handleAddPlaylist = () => {
    const newPlaylist: Playlist = {
      id: Math.max(...playlists.map((p) => p.id)) + 1,
      spotifyId: `playlist${Math.max(...playlists.map((p) => p.id)) + 1}`,
      name: formData.name,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      isPublic: formData.isPublic,
      type: formData.type,
      totalTracks: 0,
      shareCount: 0,
      userId: formData.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlaylists([...playlists, newPlaylist]);
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      isPublic: true,
      type: "playlist",
      userId: 1,
    });
    setIsAddDialogOpen(false);
  };

  const handleEditPlaylist = () => {
    if (!editingPlaylist) return;
    setPlaylists(
      playlists.map((playlist) =>
        playlist.id === editingPlaylist.id
          ? {
            ...playlist,
            name: formData.name,
            description: formData.description || undefined,
            imageUrl: formData.imageUrl || undefined,
            isPublic: formData.isPublic,
            type: formData.type,
          }
          : playlist
      )
    );
    setFormData({
      name: "",
      description: "",
      imageUrl: "",
      isPublic: true,
      type: "playlist",
      userId: 1,
    });
    setIsEditDialogOpen(false);
    setEditingPlaylist(null);
  };

  const openEditDialog = (playlist: any) => {
    setEditingPlaylist(playlist);
    setFormData({
      name: playlist.name,
      description: playlist.description || "",
      imageUrl: playlist.imageUrl || "",
      isPublic: playlist.isPublic,
      type: playlist.type,
      userId: playlist.userId,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh Sách Phát</h1>
          <p className="text-gray-600">Quản lý danh sách phát của người dùng</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Danh Sách Phát
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Danh Sách Phát Mới</DialogTitle>
              <DialogDescription>
                Thêm danh sách phát mới vào hệ thống.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Mô Tả
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  URL Hình Ảnh
                </Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isPublic" className="text-right">
                  Quyền Riêng Tư
                </Label>
                <Select
                  value={formData.isPublic ? "public" : "private"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isPublic: value === "public" })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Công Khai</SelectItem>
                    <SelectItem value="private">Riêng Tư</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Loại
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "playlist" | "album") =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="playlist">Danh Sách Phát</SelectItem>
                    <SelectItem value="album">Album</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  Người Tạo
                </Label>
                <Select
                  value={formData.userId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, userId: parseInt(value) })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPlaylist}>Thêm Danh Sách Phát</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Playlists Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Danh Sách Phát</TableHead>
              <TableHead>Spotify ID</TableHead>
              <TableHead>Người Tạo</TableHead>
              <TableHead>Tổng Bài Hát</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Quyền Riêng Tư</TableHead>
              <TableHead>Lượt Chia Sẻ</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists.map((playlist) => {
              const creator = getUserById(Number(playlist.userId));
              return (
                <TableRow key={playlist.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        {playlist.imageUrl ? (
                          <img
                            src={playlist.imageUrl}
                            alt={playlist.name}
                            className="w-10 h-10 rounded"
                          />
                        ) : (
                          <Music className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {playlist.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {playlist.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{playlist.spotifyId}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="text-sm">
                        {creator?.username || "Unknown"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {playlist.totalTracks} bài hát
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {playlist.type === "playlist"
                        ? "Danh Sách Phát"
                        : "Album"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={playlist.isPublic ? "default" : "secondary"}
                    >
                      {playlist.isPublic ? "Công Khai" : "Riêng Tư"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{playlist.shareCount}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(playlist.createdAt), "MMM dd, yyyy")}
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
                          onClick={() => handleViewPlaylist(playlist)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(playlist)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeletePlaylist(playlist.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa Danh Sách Phát
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

      {/* View Playlist Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Danh Sách Phát</DialogTitle>
            <DialogDescription>
              Xem thông tin danh sách phát và bài hát
            </DialogDescription>
          </DialogHeader>
          {selectedPlaylist && (
            <div className="space-y-4">
              {/* Playlist Info */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    {selectedPlaylist.imageUrl ? (
                      <img
                        src={selectedPlaylist.imageUrl}
                        alt={selectedPlaylist.name}
                        className="w-12 h-12 rounded"
                      />
                    ) : (
                      <Music className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedPlaylist.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      bởi {getUserById(Number(selectedPlaylist.userId))?.username}
                    </p>
                  </div>
                  <Badge
                    variant={
                      selectedPlaylist.isPublic ? "default" : "secondary"
                    }
                  >
                    {selectedPlaylist.isPublic ? "Công Khai" : "Riêng Tư"}
                  </Badge>
                </div>
                {selectedPlaylist.description && (
                  <p className="text-gray-700">
                    {selectedPlaylist.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>{selectedPlaylist.totalTracks} bài hát</span>
                  <span>{selectedPlaylist.shareCount} lượt chia sẻ</span>
                  <span>
                    Loại:{" "}
                    {selectedPlaylist.type === "playlist"
                      ? "Danh Sách Phát"
                      : "Album"}
                  </span>
                  <span>
                    Tạo ngày{" "}
                    {format(
                      new Date(selectedPlaylist.createdAt),
                      "MMM dd, yyyy"
                    )}
                  </span>
                </div>
              </div>

              {/* Tracks */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Bài Hát</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {getTracksByPlaylistId(selectedPlaylist.id).map(
                    (track, index) => (
                      <div
                        key={track.id}
                        className="flex items-center space-x-3 p-2 rounded bg-white border"
                      >
                        <span className="text-sm font-medium text-gray-500 w-6">
                          {index + 1}
                        </span>
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <Music className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">
                            {track.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {track.artist}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.floor(track.duration / 60)}:
                          {(track.duration % 60).toString().padStart(2, "0")}
                        </div>
                      </div>
                    )
                  )}
                  {getTracksByPlaylistId(selectedPlaylist.id).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Không có bài hát nào trong danh sách phát này
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Playlist Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Danh Sách Phát</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh sách phát.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Tên
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Mô Tả
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-imageUrl" className="text-right">
                URL Hình Ảnh
              </Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isPublic" className="text-right">
                Quyền Riêng Tư
              </Label>
              <Select
                value={formData.isPublic ? "public" : "private"}
                onValueChange={(value) =>
                  setFormData({ ...formData, isPublic: value === "public" })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Công Khai</SelectItem>
                  <SelectItem value="private">Riêng Tư</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Loại
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "playlist" | "album") =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="playlist">Danh Sách Phát</SelectItem>
                  <SelectItem value="album">Album</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditPlaylist}>
              Cập Nhật Danh Sách Phát
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
