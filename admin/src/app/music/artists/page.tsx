"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  User,
  Calendar,
  Edit,
  Plus,
} from "lucide-react";
import {
  Button,
  Input,
  Label,
  Textarea,
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
import { mockArtists, type Artist } from "@/lib/mock-data";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>(mockArtists);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  const handleDeleteArtist = (artistId: number) => {
    setArtists(artists.filter((artist) => artist.id !== artistId));
  };

  const handleViewArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsViewDialogOpen(true);
  };

  const handleAddArtist = () => {
    const newArtist: Artist = {
      id: Math.max(...artists.map((a) => a.id)) + 1,
      spotifyId: `artist${Math.max(...artists.map((a) => a.id)) + 1}`,
      name: formData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setArtists([...artists, newArtist]);
    setFormData({ name: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditArtist = () => {
    if (!editingArtist) return;
    setArtists(
      artists.map((artist) =>
        artist.id === editingArtist.id
          ? {
              ...artist,
              name: formData.name,
            }
          : artist
      )
    );
    setFormData({ name: "" });
    setIsEditDialogOpen(false);
    setEditingArtist(null);
  };

  const openEditDialog = (artist: Artist) => {
    setEditingArtist(artist);
    setFormData({
      name: artist.name,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nghệ Sĩ</h1>
          <p className="text-gray-600">Quản lý nghệ sĩ trong thư viện nhạc</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Nghệ Sĩ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Nghệ Sĩ Mới</DialogTitle>
              <DialogDescription>
                Thêm nghệ sĩ mới vào thư viện nhạc.
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
            </div>
            <DialogFooter>
              <Button onClick={handleAddArtist}>Thêm Nghệ Sĩ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Artists Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nghệ Sĩ</TableHead>
              <TableHead>Spotify ID</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artists.map((artist) => (
              <TableRow key={artist.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {artist.imageUrl ? (
                        <img
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {artist.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{artist.spotifyId}</TableCell>
                <TableCell>
                  {format(new Date(artist.createdAt), "MMM dd, yyyy")}
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
                        onClick={() => handleViewArtist(artist)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Xem Chi Tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(artist)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteArtist(artist.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa Nghệ Sĩ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Artist Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi Tiết Nghệ Sĩ</DialogTitle>
            <DialogDescription>Xem thông tin nghệ sĩ</DialogDescription>
          </DialogHeader>
          {selectedArtist && (
            <div className="space-y-4">
              {/* Artist Info */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  {selectedArtist.imageUrl ? (
                    <img
                      src={selectedArtist.imageUrl}
                      alt={selectedArtist.name}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedArtist.name}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Spotify ID:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedArtist.spotifyId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Ngày Tạo:
                  </span>
                  <span className="text-sm text-gray-900">
                    {format(new Date(selectedArtist.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Artist Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Nghệ Sĩ</DialogTitle>
            <DialogDescription>Cập nhật thông tin nghệ sĩ.</DialogDescription>
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
          </div>
          <DialogFooter>
            <Button onClick={handleEditArtist}>Cập Nhật Nghệ Sĩ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
