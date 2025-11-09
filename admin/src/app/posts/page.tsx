"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Trash2,
  MessageSquare,
  Heart,
  Edit,
  Plus,
  Eye,
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
} from "@/components/ui";
import {
  mockPosts,
  mockUsers,
  mockTracks,
  getUserById,
  getCommentsByPostId,
  type Post,
} from "@/lib/mock-data";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    userId: 1, // Default to first user for demo
    fileUrl: "",
    songId: undefined as number | undefined,
    isCover: false,
    originalSongId: undefined as number | undefined,
  });
  const [filterIsCover, setFilterIsCover] = useState<string>("all");
  const [filterSongId, setFilterSongId] = useState<string>("all");

  const filteredPosts = posts.filter((post) => {
    const matchesIsCover =
      filterIsCover === "all" ||
      (filterIsCover === "cover" && post.isCover) ||
      (filterIsCover === "original" && !post.isCover);

    const matchesSongId =
      filterSongId === "all" || post.songId?.toString() === filterSongId;

    return matchesIsCover && matchesSongId;
  });

  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handleAddPost = () => {
    const newPost: Post = {
      id: Math.max(...posts.map((p) => p.id)) + 1,
      userId: formData.userId,
      content: formData.content,
      fileUrl: formData.fileUrl || undefined,
      heartCount: 0,
      shareCount: 0,
      uploadedAt: new Date().toISOString(),
      commentCount: 0,
      songId: formData.songId,
      isCover: formData.isCover,
      originalSongId: formData.originalSongId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPosts([...posts, newPost]);
    setFormData({
      content: "",
      userId: 1,
      fileUrl: "",
      songId: undefined,
      isCover: false,
      originalSongId: undefined,
    });
    setIsAddDialogOpen(false);
  };

  const handleEditPost = () => {
    if (!editingPost) return;
    setPosts(
      posts.map((post) =>
        post.id === editingPost.id
          ? {
              ...post,
              content: formData.content,
              userId: formData.userId,
              fileUrl: formData.fileUrl || undefined,
              songId: formData.songId,
              isCover: formData.isCover,
              originalSongId: formData.originalSongId,
              updatedAt: new Date().toISOString(),
            }
          : post
      )
    );
    setFormData({
      content: "",
      userId: 1,
      fileUrl: "",
      songId: undefined,
      isCover: false,
      originalSongId: undefined,
    });
    setIsEditDialogOpen(false);
    setEditingPost(null);
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setFormData({
      content: post.content,
      userId: post.userId,
      fileUrl: post.fileUrl || "",
      songId: post.songId,
      isCover: post.isCover || false,
      originalSongId: post.originalSongId,
    });
    setIsEditDialogOpen(true);
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Bài Đăng</h1>
          <p className="text-gray-600">
            Quản lý bài đăng của người dùng và kiểm duyệt nội dung
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Bài Đăng
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Bài Đăng Mới</DialogTitle>
              <DialogDescription>
                Thêm bài đăng mới vào hệ thống.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  Nội Dung
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="col-span-3"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  Người Dùng
                </Label>
                <select
                  id="userId"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      userId: parseInt(e.target.value),
                    })
                  }
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  {mockUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName || user.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fileUrl" className="text-right">
                  URL File
                </Label>
                <Input
                  id="fileUrl"
                  value={formData.fileUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="https://example.com/file.mp3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="songId" className="text-right">
                  Bài Hát
                </Label>
                <select
                  id="songId"
                  value={formData.songId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      songId: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Không chọn</option>
                  {mockTracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isCover" className="text-right">
                  Loại
                </Label>
                <select
                  id="isCover"
                  value={formData.isCover ? "cover" : "original"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isCover: e.target.value === "cover",
                    })
                  }
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="original">Gốc</option>
                  <option value="cover">Cover</option>
                </select>
              </div>
              {formData.isCover && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="originalSongId" className="text-right">
                    Bài Gốc
                  </Label>
                  <select
                    id="originalSongId"
                    value={formData.originalSongId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        originalSongId: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Không chọn</option>
                    {mockTracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleAddPost}>Thêm Bài Đăng</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <Label htmlFor="filter-isCover" className="text-sm font-medium">
          Lọc theo loại:
        </Label>
        <select
          id="filter-isCover"
          value={filterIsCover}
          onChange={(e) => setFilterIsCover(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Tất cả</option>
          <option value="cover">Cover</option>
          <option value="original">Gốc</option>
        </select>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tác Giả</TableHead>
              <TableHead>Nội Dung</TableHead>
              <TableHead>Lượt Thích</TableHead>
              <TableHead>Bình Luận</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => {
              const author = getUserById(post.userId);
              return (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        {author?.avatarUrl ? (
                          <img
                            src={author.avatarUrl}
                            alt={author.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {author?.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {author?.fullName || author?.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{author?.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">
                        {truncateContent(post.content)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{post.heartCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{post.commentCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(post.createdAt), "MMM dd, yyyy")}
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
                          onClick={() => router.push(`/posts/${post.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(post)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa Bài Đăng
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

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Bài Đăng</DialogTitle>
            <DialogDescription>Cập nhật thông tin bài đăng.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-content" className="text-right">
                Nội Dung
              </Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-userId" className="text-right">
                Người Dùng
              </Label>
              <select
                id="edit-userId"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    userId: parseInt(e.target.value),
                  })
                }
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              >
                {mockUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fileUrl" className="text-right">
                URL File
              </Label>
              <Input
                id="edit-fileUrl"
                value={formData.fileUrl}
                onChange={(e) =>
                  setFormData({ ...formData, fileUrl: e.target.value })
                }
                className="col-span-3"
                placeholder="https://example.com/file.mp3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-songId" className="text-right">
                Bài Hát
              </Label>
              <select
                id="edit-songId"
                value={formData.songId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    songId: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Không chọn</option>
                {mockTracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-isCover" className="text-right">
                Loại
              </Label>
              <select
                id="edit-isCover"
                value={formData.isCover ? "cover" : "original"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isCover: e.target.value === "cover",
                  })
                }
                className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="original">Gốc</option>
                <option value="cover">Cover</option>
              </select>
            </div>
            {formData.isCover && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-originalSongId" className="text-right">
                  Bài Gốc
                </Label>
                <select
                  id="edit-originalSongId"
                  value={formData.originalSongId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originalSongId: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Không chọn</option>
                  {mockTracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleEditPost}>Cập Nhật Bài Đăng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
