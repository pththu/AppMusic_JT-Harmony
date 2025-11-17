"use client";

import { useEffect, useState } from "react";
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { type Post as MockPost } from "@/lib/mock-data";
import { fetchPostsAdmin, updatePostAdmin, deletePostAdmin, type AdminPost } from "@/services/postAdminApi";
import { getUserById, mockUsers, mockTracks, getCommentsByPostId } from "@/lib/mock-data";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<(AdminPost | any)[]>([]);
  const [sortKey, setSortKey] = useState<"createdAt" | "heartCount" | "commentCount">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [visibleCols, setVisibleCols] = useState({
    id: true,
    author: true,
    content: true,
    likes: true,
    comments: true,
    createdAt: true,
  });
  const [previewPost, setPreviewPost] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    userId: 1, // Default to first user for demo
    fileUrl: "",
    songId: undefined as number | undefined,
    isCover: false,
    originalSongId: undefined as number | undefined,
  });
  // Server-side filters
  const [q, setQ] = useState<string>("");
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [filterIsCover, setFilterIsCover] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [limit, setLimit] = useState<string>("50");
  const [page, setPage] = useState<number>(1);

  const loadPosts = async (targetPage?: number) => {
    try {
      const params: any = {};
      if (q) params.q = q;
      if (filterUserId) params.userId = parseInt(filterUserId, 10);
      if (filterIsCover === "cover") params.isCover = true;
      if (filterIsCover === "original") params.isCover = false;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const limitNum = parseInt(limit, 10) || 50;
      const currentPage = targetPage && targetPage > 0 ? targetPage : (page > 0 ? page : 1);
      const offsetNum = (currentPage - 1) * limitNum;
      params.limit = limitNum;
      params.offset = offsetNum;
      const data = await fetchPostsAdmin(params);
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load admin posts:', e);
      setPosts([]);
    }
  };

  const resetFilters = async () => {
    setQ("");
    setFilterUserId("");
    setFilterIsCover("all");
    setDateFrom("");
    setDateTo("");
    setLimit("50");
    setPage(1);
    await loadPosts(1);
  };

  const handleDeletePost = async (postId: number) => {
    await deletePostAdmin(postId);
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setSelectedIds((prev) => prev.filter((id) => id !== postId));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const idsToDelete = [...selectedIds];
    await Promise.all(idsToDelete.map((id) => deletePostAdmin(id)));
    setPosts((prev) => prev.filter((post) => !idsToDelete.includes(post.id)));
    setSelectedIds([]);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCurrentPage = (currentPagePosts: any[]) => {
    const ids = currentPagePosts.map((p) => p.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleAddPost = () => {
    const newPost: any = {
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

  const handleEditPost = async () => {
    if (!editingPost) return;
    await updatePostAdmin(editingPost.id, {
      content: formData.content,
      fileUrls: formData.fileUrl ? [formData.fileUrl] : [],
      songId: formData.songId ?? null,
      isCover: formData.isCover,
      originalSongId: formData.originalSongId ?? null,
    });
    setPosts((prev) =>
      prev.map((post) =>
        post.id === editingPost.id
          ? { ...post, content: formData.content, updatedAt: new Date().toISOString() }
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

  const openEditDialog = (post: any) => {
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

  const openPreviewDialog = (post: any) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };

  useEffect(() => {
    loadPosts(1);
  }, []);

  const sortedPosts = (Array.isArray(posts) ? posts : []).slice().sort((a: any, b: any) => {
    let av: any;
    let bv: any;
    if (sortKey === "createdAt") {
      av = new Date(a.createdAt).getTime();
      bv = new Date(b.createdAt).getTime();
    } else if (sortKey === "heartCount") {
      av = a.heartCount ?? 0;
      bv = b.heartCount ?? 0;
    } else {
      av = a.commentCount ?? 0;
      bv = b.commentCount ?? 0;
    }
    if (av === bv) return 0;
    const res = av > bv ? 1 : -1;
    return sortDir === "asc" ? res : -res;
  });

  const handleSort = (key: "createdAt" | "heartCount" | "commentCount") => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir("desc");
      return key;
    });
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
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.id}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, id: e.target.checked }))
                    }
                  />
                  <span className="text-sm">ID</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.author}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, author: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Tác giả</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.content}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, content: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Nội dung</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.likes}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, likes: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Lượt thích</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.comments}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, comments: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Bình luận</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.createdAt}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, createdAt: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Ngày tạo</span>
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <Label className="text-sm font-medium">Tìm kiếm</Label>
              <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Nội dung" className="w-56" />
            </div>
            <div>
              <Label className="text-sm font-medium">ID người dùng</Label>
              <Input value={filterUserId} onChange={(e)=>setFilterUserId(e.target.value)} className="w-32" />
            </div>
            <div>
              <Label className="text-sm font-medium">Loại</Label>
              <select
                value={filterIsCover}
                onChange={(e)=>setFilterIsCover(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Tất cả</option>
                <option value="cover">Cover</option>
                <option value="original">Gốc</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Từ ngày</Label>
              <Input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Đến ngày</Label>
              <Input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Limit</Label>
              <Input value={limit} onChange={(e)=>setLimit(e.target.value)} className="w-24" />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button onClick={() => loadPosts(page)}>Áp dụng</Button>
              <Button variant="outline" onClick={resetFilters}>Đặt lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
          <span>
            Đã chọn <span className="font-semibold">{selectedIds.length}</span> bài đăng
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
            >
              Xóa các bài đã chọn
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds([])}
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  onChange={() => toggleSelectAllCurrentPage(sortedPosts)}
                  checked={
                    sortedPosts.length > 0 &&
                    sortedPosts.every((post: any) => selectedIds.includes(post.id))
                  }
                />
              </TableHead>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              {visibleCols.id && (
                <TableHead className="w-[80px] text-center">ID</TableHead>
              )}
              {visibleCols.author && <TableHead>Tác Giả</TableHead>}
              {visibleCols.content && <TableHead>Nội Dung</TableHead>}
              {visibleCols.likes && (
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("heartCount")}
                >
                  Lượt Thích
                </TableHead>
              )}
              {visibleCols.comments && (
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("commentCount")}
                >
                  Bình Luận
                </TableHead>
              )}
              {visibleCols.createdAt && (
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("createdAt")}
                >
                  Ngày Tạo
                </TableHead>
              )}
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPosts.map((post: any, index: number) => {
              const author = post.User || post.user || null;
              const limitNum = parseInt(limit, 10) || 50;
              const currentPage = page > 0 ? page : 1;
              const offsetNum = (currentPage - 1) * limitNum;
              return (
                <TableRow key={post.id}>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedIds.includes(post.id)}
                      onChange={() => toggleSelect(post.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-500">
                    {offsetNum + index + 1}
                  </TableCell>
                  {visibleCols.id && (
                    <TableCell className="text-center text-xs text-gray-500">{post.id}</TableCell>
                  )}
                  {visibleCols.author && (
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
                            @{author?.username} · ID: {author?.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {visibleCols.content && (
                    <TableCell>
                      <button
                        type="button"
                        className="max-w-xs text-left"
                        onClick={() => openPreviewDialog(post)}
                      >
                        <p className="text-sm text-gray-900 truncate underline decoration-dotted">
                          {truncateContent(post.content)}
                        </p>
                      </button>
                    </TableCell>
                  )}
                  {visibleCols.likes && (
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{post.heartCount}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleCols.comments && (
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{post.commentCount}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleCols.createdAt && (
                    <TableCell>
                      {format(new Date(post.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                  )}
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
                        <DropdownMenuItem
                          onClick={() => router.push(`/comments?postId=${post.id}`)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Xem Bình Luận
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/likes?postId=${post.id}`)}
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          Xem Likes
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

      <div className="flex items-center justify-between px-2 sm:px-0">
        <div className="text-sm text-gray-600">
          Trang {page}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={async () => {
              if (page <= 1) return;
              const nextPage = page - 1;
              await loadPosts(nextPage);
              setPage(nextPage);
            }}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const nextPage = page + 1;
              await loadPosts(nextPage);
              setPage(nextPage);
            }}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Preview Post Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview Bài Đăng</DialogTitle>
            <DialogDescription>Xem nhanh nội dung bài đăng.</DialogDescription>
          </DialogHeader>
          {previewPost && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">ID: {previewPost.id}</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {previewPost.content}
                </p>
              </div>
              {previewPost.fileUrl && (
                <div className="text-sm text-green-700 break-all">
                  File: {previewPost.fileUrl}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
