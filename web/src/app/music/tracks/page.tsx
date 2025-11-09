"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Play,
  Clock,
  Edit,
  Plus,
  Heart,
  Share,
} from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  mockTracks,
  mockAlbums,
  mockGenres,
  type Track,
} from "@/lib/mock-data";
import { Search } from "lucide-react";

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>(mockTracks);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    duration: 0,
    explicit: false,
    playCount: 0,
    shareCount: 0,
    releaseDate: "",
  });
  const [filterExplicit, setFilterExplicit] = useState<string>("all");
  const [filterGenre, setFilterGenre] = useState<string>("all");

  // Filter tracks based on search and filters
  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.album.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesExplicit =
      filterExplicit === "all" ||
      (filterExplicit === "explicit" && track.explicit) ||
      (filterExplicit === "clean" && !track.explicit);

    const matchesGenre = filterGenre === "all" || track.genre === filterGenre;

    return matchesSearch && matchesExplicit && matchesGenre;
  });

  const handleDeleteTrack = (trackId: number) => {
    setTracks(tracks.filter((track) => track.id !== trackId));
  };

  const handleViewTrack = (track: Track) => {
    setSelectedTrack(track);
    setIsViewDialogOpen(true);
  };

  const handleAddTrack = () => {
    const newTrack: Track = {
      id: Math.max(...tracks.map((t) => t.id)) + 1,
      spotifyId: `track${Math.max(...tracks.map((t) => t.id)) + 1}`,
      title: formData.title,
      artist: formData.artist,
      album: formData.album,
      genre: formData.genre,
      duration: formData.duration,
      discNumber: 1,
      explicit: formData.explicit,
      playCount: formData.playCount,
      shareCount: formData.shareCount,
      releaseDate: formData.releaseDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTracks([...tracks, newTrack]);
    setFormData({
      title: "",
      artist: "",
      album: "",
      genre: "",
      duration: 0,
      explicit: false,
      playCount: 0,
      shareCount: 0,
      releaseDate: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditTrack = () => {
    if (!editingTrack) return;
    setTracks(
      tracks.map((track) =>
        track.id === editingTrack.id
          ? {
              ...track,
              title: formData.title,
              artist: formData.artist,
              album: formData.album,
              genre: formData.genre,
              duration: formData.duration,
              explicit: formData.explicit,
              playCount: formData.playCount,
              shareCount: formData.shareCount,
              releaseDate: formData.releaseDate || undefined,
            }
          : track
      )
    );
    setFormData({
      title: "",
      artist: "",
      album: "",
      genre: "",
      duration: 0,
      explicit: false,
      playCount: 0,
      shareCount: 0,
      releaseDate: "",
    });
    setIsEditDialogOpen(false);
    setEditingTrack(null);
  };

  const openEditDialog = (track: Track) => {
    setEditingTrack(track);
    setFormData({
      title: track.title,
      artist: track.artist,
      album: track.album,
      genre: track.genre,
      duration: track.duration,
      explicit: track.explicit,
      playCount: track.playCount,
      shareCount: track.shareCount,
      releaseDate: track.releaseDate || "",
    });
    setIsEditDialogOpen(true);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bài Hát</h1>
          <p className="text-gray-600">Quản lý bài hát trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Bài Hát
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Bài Hát Mới</DialogTitle>
              <DialogDescription>
                Thêm bài hát mới vào thư viện nhạc.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Tiêu Đề
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="artist" className="text-right">
                  Nghệ Sĩ
                </Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) =>
                    setFormData({ ...formData, artist: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="album" className="text-right">
                  Album
                </Label>
                <Input
                  id="album"
                  value={formData.album}
                  onChange={(e) =>
                    setFormData({ ...formData, album: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="genre" className="text-right">
                  Thể Loại
                </Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) =>
                    setFormData({ ...formData, genre: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn thể loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockGenres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.name}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Thời Lượng (giây)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="playCount" className="text-right">
                  Lượt Nghe
                </Label>
                <Input
                  id="playCount"
                  type="number"
                  value={formData.playCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      playCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shareCount" className="text-right">
                  Lượt Chia Sẻ
                </Label>
                <Input
                  id="shareCount"
                  type="number"
                  value={formData.shareCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shareCount: parseInt(e.target.value) || 0,
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
                  onChange={(e) =>
                    setFormData({ ...formData, releaseDate: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="explicit" className="text-right">
                  Explicit
                </Label>
                <Select
                  value={formData.explicit ? "true" : "false"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, explicit: value === "true" })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Clean</SelectItem>
                    <SelectItem value="true">Explicit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTrack}>Thêm Bài Hát</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterExplicit} onValueChange={setFilterExplicit}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Explicit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="explicit">Explicit</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Thể loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {mockGenres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.name}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tracks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu Đề</TableHead>
              <TableHead>Nghệ Sĩ</TableHead>
              <TableHead>Album</TableHead>
              <TableHead>Thể Loại</TableHead>
              <TableHead>Thời Lượng</TableHead>
              <TableHead>Lượt Nghe</TableHead>
              <TableHead>Lượt Chia Sẻ</TableHead>
              <TableHead>Ngày Phát Hành</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((track) => (
              <TableRow key={track.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      <Play className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {track.title}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{track.artist}</TableCell>
                <TableCell>{track.album}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{track.genre}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{track.playCount}</TableCell>
                <TableCell>{track.shareCount}</TableCell>
                <TableCell>
                  {track.releaseDate
                    ? format(new Date(track.releaseDate), "MMM dd, yyyy")
                    : "N/A"}
                </TableCell>
                <TableCell>
                  {format(new Date(track.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewTrack(track)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem Chi Tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(track)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh Sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteTrack(track.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa Bài Hát
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Track Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi Tiết Bài Hát</DialogTitle>
            <DialogDescription>Xem thông tin bài hát</DialogDescription>
          </DialogHeader>
          {selectedTrack && (
            <div className="space-y-4">
              {/* Track Info */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedTrack.title}
                </h3>
                <p className="text-gray-600">{selectedTrack.artist}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Album:
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedTrack.album}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Thể Loại:
                  </span>
                  <Badge variant="secondary">{selectedTrack.genre}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Thời Lượng:
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDuration(selectedTrack.duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Ngày Tạo:
                  </span>
                  <span className="text-sm text-gray-900">
                    {format(new Date(selectedTrack.createdAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Track Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Bài Hát</DialogTitle>
            <DialogDescription>Cập nhật thông tin bài hát.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-title" className="text-right">
                Tiêu Đề
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-artist" className="text-right">
                Nghệ Sĩ
              </Label>
              <Input
                id="edit-artist"
                value={formData.artist}
                onChange={(e) =>
                  setFormData({ ...formData, artist: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-album" className="text-right">
                Album
              </Label>
              <Input
                id="edit-album"
                value={formData.album}
                onChange={(e) =>
                  setFormData({ ...formData, album: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-genre" className="text-right">
                Thể Loại
              </Label>
              <Select
                value={formData.genre}
                onValueChange={(value) =>
                  setFormData({ ...formData, genre: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Chọn thể loại" />
                </SelectTrigger>
                <SelectContent>
                  {mockGenres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.name}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-duration" className="text-right">
                Thời Lượng (giây)
              </Label>
              <Input
                id="edit-duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-playCount" className="text-right">
                Lượt Nghe
              </Label>
              <Input
                id="edit-playCount"
                type="number"
                value={formData.playCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    playCount: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-shareCount" className="text-right">
                Lượt Chia Sẻ
              </Label>
              <Input
                id="edit-shareCount"
                type="number"
                value={formData.shareCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shareCount: parseInt(e.target.value) || 0,
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
                onChange={(e) =>
                  setFormData({ ...formData, releaseDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-explicit" className="text-right">
                Explicit
              </Label>
              <Select
                value={formData.explicit ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData({ ...formData, explicit: value === "true" })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Clean</SelectItem>
                  <SelectItem value="true">Explicit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditTrack}>Cập Nhật Bài Hát</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
