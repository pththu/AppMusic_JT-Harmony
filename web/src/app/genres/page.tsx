"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Eye, Trash2, Music, Edit, Plus } from "lucide-react";
import {
  Button,
  Input,
  Label,
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
} from "@/components/ui";
import { mockGenres, type Genres } from "@/lib/mock-data";

export default function GenresPage() {
  const [genres, setGenres] = useState<Genres[]>(mockGenres);
  const [selectedGenre, setSelectedGenre] = useState<Genres | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genres | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  const handleDeleteGenre = (genreId: number) => {
    setGenres(genres.filter((genre) => genre.id !== genreId));
  };

  const handleViewGenre = (genre: Genres) => {
    setSelectedGenre(genre);
    setIsViewDialogOpen(true);
  };

  const handleAddGenre = () => {
    const newGenre: Genres = {
      id: Math.max(...genres.map((g) => g.id)) + 1,
      name: formData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setGenres([...genres, newGenre]);
    setFormData({ name: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditGenre = () => {
    if (!editingGenre) return;
    setGenres(
      genres.map((genre) =>
        genre.id === editingGenre.id
          ? {
              ...genre,
              name: formData.name,
              updatedAt: new Date().toISOString(),
            }
          : genre
      )
    );
    setFormData({ name: "" });
    setIsEditDialogOpen(false);
    setEditingGenre(null);
  };

  const openEditDialog = (genre: Genres) => {
    setEditingGenre(genre);
    setFormData({
      name: genre.name,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Thể Loại</h1>
          <p className="text-gray-600">Quản lý các thể loại nhạc</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Thể Loại
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Thể Loại Mới</DialogTitle>
              <DialogDescription>
                Thêm thể loại nhạc mới vào hệ thống.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên Thể Loại
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
              <Button onClick={handleAddGenre}>Thêm Thể Loại</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Genres Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thể Loại</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead>Ngày Cập Nhật</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {genres.map((genre) => (
              <TableRow key={genre.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Music className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {genre.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(genre.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(genre.updatedAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewGenre(genre)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem Chi Tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(genre)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteGenre(genre.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa Thể Loại
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Genre Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi Tiết Thể Loại</DialogTitle>
            <DialogDescription>Xem thông tin thể loại nhạc</DialogDescription>
          </DialogHeader>
          {selectedGenre && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Music className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedGenre.name}
                    </h3>
                  </div>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    Tạo ngày:{" "}
                    {format(
                      new Date(selectedGenre.createdAt),
                      "MMM dd, yyyy 'lúc' HH:mm"
                    )}
                  </p>
                  <p>
                    Cập nhật:{" "}
                    {format(
                      new Date(selectedGenre.updatedAt),
                      "MMM dd, yyyy 'lúc' HH:mm"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Genre Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Thể Loại</DialogTitle>
            <DialogDescription>Cập nhật thông tin thể loại.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Tên Thể Loại
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
            <Button onClick={handleEditGenre}>Cập Nhật Thể Loại</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
