"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Disc,
  Music,
  Calendar,
  Edit,
  Plus,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
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
} from "@/components/ui";
import { mockAlbums, type Album } from "@/lib/mock-data";

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>(mockAlbums);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    totalTracks: 0,
    releaseDate: "",
  });

  const handleDeleteAlbum = (albumId: number) => {
    setAlbums(albums.filter((album) => album.id !== albumId));
  };

  const handleViewAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setIsViewDialogOpen(true);
  };

  const handleAddAlbum = () => {
    const newAlbum: Album = {
      id: Math.max(...albums.map((a) => a.id)) + 1,
      spotifyId: `album${Math.max(...albums.map((a) => a.id)) + 1}`,
      name: formData.name,
      imageUrl: formData.imageUrl || undefined,
      totalTracks: formData.totalTracks,
      releaseDate: formData.releaseDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAlbums([...albums, newAlbum]);
    setFormData({ name: "", imageUrl: "", totalTracks: 0, releaseDate: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditAlbum = () => {
    if (!editingAlbum) return;
    setAlbums(
      albums.map((album) =>
        album.id === editingAlbum.id
          ? {
              ...album,
              name: formData.name,
              imageUrl: formData.imageUrl || undefined,
              totalTracks: formData.totalTracks,
              releaseDate: formData.releaseDate || undefined,
            }
          : album
      )
    );
    setFormData({ name: "", imageUrl: "", totalTracks: 0, releaseDate: "" });
    setIsEditDialogOpen(false);
    setEditingAlbum(null);
  };

  const openEditDialog = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      name: album.name,
      imageUrl: album.imageUrl || "",
      totalTracks: album.totalTracks,
      releaseDate: album.releaseDate || "",
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Album Nhạc</h1>
          <p className="text-gray-600">Quản lý album trong thư viện nhạc</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Album
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Album Mới</DialogTitle>
              <DialogDescription>
                Thêm album mới vào thư viện nhạc.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên Album
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
                <Label htmlFor="totalTracks" className="text-right">
                  Tổng Số Bài Hát
                </Label>
                <Input
                  id="totalTracks"
                  type="number"
                  value={formData.totalTracks}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      totalTracks: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="releaseDate" className="text-right">
                  Ngày Phát Hành
                </Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, releaseDate: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddAlbum}>Thêm Album</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Albums Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Album</TableHead>
              <TableHead>Spotify ID</TableHead>
              <TableHead>Tổng Bài Hát</TableHead>
              <TableHead>Ngày Phát Hành</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {albums.map((album) => (
              <TableRow key={album.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      {album.imageUrl ? (
                        <img
                          src={album.imageUrl}
                          alt={album.name}
                          className="w-10 h-10 rounded"
                        />
                      ) : (
                        <Disc className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {album.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{album.spotifyId}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Music className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{album.totalTracks} bài hát</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {album.releaseDate
                        ? format(new Date(album.releaseDate), "MMM dd, yyyy")
                        : "N/A"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(album.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewAlbum(album)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem Chi Tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(album)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteAlbum(album.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa Album
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Album Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi Tiết Album</DialogTitle>
            <DialogDescription>Xem thông tin album</DialogDescription>
          </DialogHeader>
          {selectedAlbum && (
            <div className="space-y-4">
              {/* Album Info */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {selectedAlbum.imageUrl ? (
                    <img
                      src={selectedAlbum.imageUrl}
                      alt={selectedAlbum.name}
                      className="w-20 h-20 rounded-lg"
                    />
                  ) : (
                    <Disc className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAlbum.name}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Spotify ID:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedAlbum.spotifyId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Tổng Bài Hát:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedAlbum.totalTracks} bài hát
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Ngày Phát Hành:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedAlbum.releaseDate
                      ? format(
                          new Date(selectedAlbum.releaseDate),
                          "MMM dd, yyyy"
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Ngày Tạo:
                  </span>
                  <span className="text-sm text-gray-900">
                    {format(new Date(selectedAlbum.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Album Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Album</DialogTitle>
            <DialogDescription>Cập nhật thông tin album.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Tên Album
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
              <Label htmlFor="edit-totalTracks" className="text-right">
                Tổng Số Bài Hát
              </Label>
              <Input
                id="edit-totalTracks"
                type="number"
                value={formData.totalTracks}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({
                    ...formData,
                    totalTracks: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-releaseDate" className="text-right">
                Ngày Phát Hành
              </Label>
              <Input
                id="edit-releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, releaseDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditAlbum}>Cập Nhật Album</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
