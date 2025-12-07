"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
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
  DialogTrigger,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { updatePostAdmin, deletePostAdmin, CreatePost } from "@/services";
import toast from "react-hot-toast";
import { useMusicStore, usePostStore, useUserStore } from "@/store";
import EditDialog from "@/components/post/edit-dialog";
import PreviewDialog from "@/components/post/preview-dialog";
import AddDialog from "@/components/post/add-dialog";

// Hàm tiện ích phân trang
const getPaginationItems = (currentPage: number, totalPages: number): (number | '...')[] => {
  const MAX_ITEMS = 5;

  if (totalPages <= MAX_ITEMS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();

  pages.add(currentPage);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const finalItems: (number | '...')[] = [];

  if (sortedPages[0] > 1) {
    finalItems.push('...');
  }
  for (const element of sortedPages) {
    finalItems.push(element);
  }
  if (sortedPages[sortedPages.length - 1] < totalPages) {
    finalItems.push('...');
  }

  return finalItems;
};

export default function PostsPage() {
  const router = useRouter();
  const { users, fetchUsers } = useUserStore();
  const { tracks, fetchTracks } = useMusicStore();
  const { posts, setPosts, fetchPosts } = usePostStore();
  
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  
  const [sortKey, setSortKey] = useState<"createdAt" | "likeCount" | "commentCount">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [previewPost, setPreviewPost] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  // Filter states
  const [q, setQ] = useState<string>("");
  // [CHANGE] Đổi tên state từ filterUserId thành filterUserQuery
  const [filterUserQuery, setFilterUserQuery] = useState<string>(""); 
  const [filterIsCover, setFilterIsCover] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  const [limit, setLimit] = useState<string>("50");
  const [page, setPage] = useState<number>(1);

  const [visibleCols, setVisibleCols] = useState({
    id: true,
    author: true,
    content: true,
    likes: true,
    comments: true,
    createdAt: true,
  });

  const [formData, setFormData] = useState({
    content: "",
    userId: 1,
    fileUrl: "",
    songId: undefined as number | undefined,
    isCover: false,
    originalSongId: undefined as number | undefined,
  });

  useEffect(() => {
    if (posts.length === 0) fetchPosts(); 
    if (users.length === 0) fetchUsers();
    if (tracks.length === 0) fetchTracks();
  }, []);

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  // --- Client-side Filter Logic ---
  const handleApplyFilter = () => {
    let result = [...posts];

    // 1. Filter by Content
    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      result = result.filter(p => p.content?.toLowerCase().includes(lowerQ));
    }

    // 2. [CHANGE] Filter by User Info (Username, Email, FullName)
    if (filterUserQuery.trim()) {
      const lowerQuery = filterUserQuery.toLowerCase();
      result = result.filter(p => {
        // Tìm user tương ứng với post này trong danh sách users (đã fetch từ store)
        const author = users.find(u => u.id === p.userId);
        
        if (!author) return false; // Nếu không tìm thấy tác giả, loại bỏ post này

        // Kiểm tra xem query có nằm trong username, email hoặc fullName không
        const matchUsername = author.username?.toLowerCase().includes(lowerQuery);
        const matchEmail = author.email?.toLowerCase().includes(lowerQuery);
        const matchFullName = author.fullName?.toLowerCase().includes(lowerQuery);

        return matchUsername || matchEmail || matchFullName;
      });
    }

    // 3. Filter by Type
    if (filterIsCover !== "all") {
      const isCoverBool = filterIsCover === "cover";
      result = result.filter(p => !!p.isCover === isCoverBool);
    }

    // 4. Filter by Date
    if (dateFrom || dateTo) {
      const start = dateFrom ? startOfDay(parseISO(dateFrom)) : new Date(0);
      const end = dateTo ? endOfDay(parseISO(dateTo)) : new Date();

      result = result.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate >= start && pDate <= end;
      });
    }

    setFilteredPosts(result);
    setPage(1);
  };

  const resetFilters = () => {
    setQ("");
    setFilterUserQuery(""); // [CHANGE] Reset user query
    setFilterIsCover("all");
    setDateFrom("");
    setDateTo("");
    setLimit("50");
    setPage(1);
    setFilteredPosts(posts);
  };

  // --- Sorting & Pagination Logic ---
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a: any, b: any) => {
      let av: any;
      let bv: any;
      if (sortKey === "createdAt") {
        av = new Date(a.createdAt).getTime();
        bv = new Date(b.createdAt).getTime();
      } else if (sortKey === "likeCount") {
        av = (a.likeCount ?? a.heartCount) ?? 0;
        bv = (b.likeCount ?? b.heartCount) ?? 0;
      } else {
        av = a.commentCount ?? 0;
        bv = b.commentCount ?? 0;
      }
      if (av === bv) return 0;
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av > bv ? -1 : 1);
    });
  }, [filteredPosts, sortKey, sortDir]);

  const limitNum = parseInt(limit, 10) || 50;
  const totalPages = Math.ceil(sortedPosts.length / limitNum);
  
  const paginatedPosts = useMemo(() => {
    const startIndex = (page - 1) * limitNum;
    return sortedPosts.slice(startIndex, startIndex + limitNum);
  }, [sortedPosts, page, limitNum]);


  // --- Actions ---
  const handleDeletePost = async (postId: number) => {
    const response = await deletePostAdmin(postId);
    if (!response.success) {
      toast.error('Lỗi khi xóa bài đăng: ' + response.message);
      return;
    }
    const newPostsAll = posts.filter((post) => post.id !== postId);
    setPosts(newPostsAll);
    setSelectedIds((prev) => prev.filter((id) => id !== postId));
    toast.success('Xóa bài đăng thành công');
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const idsToDelete = [...selectedIds];
    await Promise.all(idsToDelete.map((id) => deletePostAdmin(id)));
    const newPostsAll = posts.filter((post) => !idsToDelete.includes(post.id));
    setPosts(newPostsAll);
    setSelectedIds([]);
    toast.success('Xóa các bài đăng đã chọn thành công');
  };

  const handleAddPost = async () => {
    const newPost: any = {
      userId: formData.userId,
      content: formData.content,
      fileUrl: formData.fileUrl || undefined,
      heartCount: 0,
      likeCount: 0,
      shareCount: 0,
      uploadedAt: new Date().toISOString(),
      commentCount: 0,
      songId: formData.songId,
      isCover: formData.isCover,
      originalSongId: formData.originalSongId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = await CreatePost(newPost);
    if (!response.success) {
      toast.error('Lỗi khi thêm bài đăng: ' + response.message);
      return;
    }
    const createdPost = { id: response.data.id, ...newPost };
    setPosts([createdPost, ...posts]);
    setFormData({
      content: "",
      userId: users.length > 0 ? users[0].id : 1,
      fileUrl: "",
      songId: undefined,
      isCover: false,
      originalSongId: undefined,
    });
    toast.success('Thêm bài đăng thành công');
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
    const updatedData = { ...editingPost, content: formData.content, updatedAt: new Date().toISOString() };
    const newPosts = posts.map((post) => post.id === editingPost.id ? updatedData : post);
    setPosts(newPosts);
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
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const openPreviewDialog = (post: any) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };

  const handleSort = (key: "createdAt" | "likeCount" | "commentCount") => {
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Bài Đăng
              </Button>
            </DialogTrigger>
            <AddDialog
              formData={formData}
              setFormData={setFormData}
              handleAddPost={handleAddPost}
            />
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
              <Label className="text-sm font-medium">Tìm kiếm (Nội dung)</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nội dung bài đăng" className="w-56" />
            </div>
            {/* [CHANGE] Cập nhật UI Input User */}
            <div>
              <Label className="text-sm font-medium">Người dùng</Label>
              <Input 
                value={filterUserQuery} 
                onChange={(e) => setFilterUserQuery(e.target.value)} 
                placeholder="Tên, Email hoặc Username" 
                className="w-56" 
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Loại</Label>
              <select
                value={filterIsCover}
                onChange={(e) => setFilterIsCover(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">Tất cả</option>
                <option value="cover">Cover</option>
                <option value="original">Gốc</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Từ ngày</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Đến ngày</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Limit</Label>
              <Input value={limit} onChange={(e) => setLimit(e.target.value)} className="w-24" />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button onClick={handleApplyFilter}>Áp dụng</Button>
              <Button variant="outline" onClick={resetFilters}>Đặt lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
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

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  onChange={() => toggleSelectAllCurrentPage(paginatedPosts)}
                  checked={
                    paginatedPosts.length > 0 &&
                    paginatedPosts.every((post: any) => selectedIds.includes(post.id))
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
                  onClick={() => handleSort("likeCount")}
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
            {paginatedPosts.length > 0 ? (
              paginatedPosts.map((post: any, index: number) => {
                const author = users.find((u) => u.id === post.userId);
                const itemNumber = (page - 1) * limitNum + index + 1;

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
                      {itemNumber}
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
                                {author?.username?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {author?.fullName || author?.username || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{author?.username}
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
                          <span className="text-sm">{post.likeCount ?? post.heartCount ?? 0}</span>
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
                        {format(new Date(post.createdAt), "dd/MM/yyyy")}
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
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Không tìm thấy bài đăng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 sm:px-0">
        <div className="text-sm text-gray-600">
          Hiển thị <strong>{paginatedPosts.length}</strong> trên tổng số <strong>{sortedPosts.length}</strong> bài đăng (Trang {page}/{totalPages || 1})
        </div>
        <div className="flex space-x-1">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(Math.max(1, page - 1))} 
                disabled={page === 1}
            >
                Trước
            </Button>
            
            {getPaginationItems(page, totalPages).map((item, index) => (
                item === '...' ? (
                <span key={`e-${index}`} className="px-2 py-1 text-gray-500 text-sm flex items-center">...</span>
                ) : (
                <Button
                    key={item}
                    variant={page === item ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(item as number)}
                    className={page === item ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                >
                    {item}
                </Button>
                )
            ))}

            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(Math.min(totalPages, page + 1))} 
                disabled={page === totalPages || totalPages === 0}
            >
                Sau
            </Button>
        </div>
      </div>

      {/* Dialogs */}
      <PreviewDialog
        isPreviewOpen={isPreviewOpen}
        setIsPreviewOpen={setIsPreviewOpen}
        previewPost={previewPost}
      />
      <EditDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        handleEditPost={handleEditPost}
      />
    </div>
  );
}