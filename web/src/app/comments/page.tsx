"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { CreateComment, deleteCommentAdmin } from "@/services/commentService";
import { usePostStore, useUserStore } from "@/store";
import EditDialog from "@/components/comment/edit-dialog";
import ViewDetailDialog from "@/components/comment/view-detail-dialog";
import AddDialog from "@/components/comment/add-dialog";
import toast from "react-hot-toast";

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

export default function CommentsPage() {
  const router = useRouter();
  // Lấy data từ Store
  const { comments, posts, setComments, fetchComments, fetchPosts } = usePostStore();
  const { users, fetchUsers } = useUserStore();

  // Client-side Filtered State
  const [filteredComments, setFilteredComments] = useState<any[]>([]);

  // UI States
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedComment, setSelectedComment] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<any | null>(null);

  // Pagination
  const ITEMS_PER_PAGE = 50;
  const [page, setPage] = useState<number>(1);

  // Filter States
  const [filterPostId, setFilterPostId] = useState<string>("");
  const [filterUserQuery, setFilterUserQuery] = useState<string>(""); // Thay thế filterUserId
  const [q, setQ] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Form Data
  const [formData, setFormData] = useState({
    content: "",
    postId: posts.length > 0 ? posts[0].id : 1,
    parentId: undefined as number | undefined,
    userId: users.length > 0 ? users[0].id : 1,
    fileUrl: "",
  });

  // --- Initial Fetch ---
  useEffect(() => {
    if (comments.length === 0) fetchComments();
    if (users.length === 0) fetchUsers();
    if (posts.length === 0) fetchPosts();
  }, []);

  // Sync filteredComments with Store
  useEffect(() => {
    setFilteredComments(comments);
  }, [comments]);

  // --- Filter Logic (Client Side) ---
  const handleApplyFilter = () => {
    let result = [...comments];

    // 1. Filter by Content
    if (q.trim()) {
      const lowerQ = q.toLowerCase();
      result = result.filter((c) => c.content?.toLowerCase().includes(lowerQ));
    }

    // 2. Filter by Post ID
    if (filterPostId.trim()) {
      const pid = parseInt(filterPostId, 10);
      if (!isNaN(pid)) {
        result = result.filter((c) => c.postId === pid);
      }
    }

    // 3. Filter by User Info (Username, Email, FullName)
    if (filterUserQuery.trim()) {
      const lowerQuery = filterUserQuery.toLowerCase();
      result = result.filter((c) => {
        const author = users.find((u) => u.id === c.userId);
        if (!author) return false;

        const matchUsername = author.username?.toLowerCase().includes(lowerQuery);
        const matchEmail = author.email?.toLowerCase().includes(lowerQuery);
        const matchFullName = author.fullName?.toLowerCase().includes(lowerQuery);

        return matchUsername || matchEmail || matchFullName;
      });
    }

    // 4. Filter by Date
    if (dateFrom || dateTo) {
      const start = dateFrom ? startOfDay(parseISO(dateFrom)) : new Date(0);
      const end = dateTo ? endOfDay(parseISO(dateTo)) : new Date();

      result = result.filter((c) => {
        const cDate = new Date(c.commentedAt);
        return cDate >= start && cDate <= end;
      });
    }

    setFilteredComments(result);
  };

  const resetFilters = () => {
    setFilterPostId("");
    setFilterUserQuery("");
    setQ("");
    setDateFrom("");
    setDateTo("");
    setFilteredComments(comments);
  };

  // --- Sort & Pagination ---
  const sortedComments = useMemo(() => {
    return [...filteredComments].sort((a: any, b: any) => {
      const av = new Date(a.commentedAt).getTime();
      const bv = new Date(b.commentedAt).getTime();
      if (av === bv) return 0;
      return sortDir === "asc" ? av - bv : bv - av;
    });
  }, [filteredComments, sortDir]);

  const totalPages = Math.ceil(sortedComments.length / ITEMS_PER_PAGE);

  const paginatedComments = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return sortedComments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedComments, page]);


  // --- Actions ---
  const handleDeleteComment = async (commentId: number) => {
    const response = await deleteCommentAdmin(commentId);

    if (!response.success) {
      toast.error('Lỗi khi xóa bình luận: ' + response.message);
      return;
    }

    const newComments = comments.filter((comment) => comment.id !== commentId);
    setComments(newComments);
    setFilteredComments(prev => prev.filter(c => c.id !== commentId));
    setSelectedIds((prev) => prev.filter((id) => id !== commentId));
    toast.success('Xóa bình luận thành công');
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const idsToDelete = [...selectedIds];
    await Promise.all(idsToDelete.map((id) => deleteCommentAdmin(id)));

    toast.success('Xóa các bình luận đã chọn thành công');
    // Update Store
    const newComments = comments.filter((comment) => !idsToDelete.includes(comment.id));
    setComments(newComments);

    // Update Local
    setFilteredComments(prev => prev.filter(c => !idsToDelete.includes(c.id)));
    setSelectedIds([]);
  };

  const handleAddComment = async () => {
    const newComment: any = {
      content: formData.content,
      postId: formData.postId || null,
      parentId: formData.parentId || null,
      userId: formData.userId,
      fileUrl: formData.fileUrl || null,
      commentedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response = await CreateComment(newComment);
    if (!response.success) {
      toast.error('Lỗi khi tạo bình luận: ' + response.message);
      return;
    }

    setComments([{
      id: response.data.id,
      ...newComment
    }, ...comments]);
    setFormData({
      content: "",
      postId: posts.length > 0 ? posts[0].id : 1,
      parentId: undefined,
      userId: users.length > 0 ? users[0].id : 1,
      fileUrl: "",
    });
    toast.success('Tạo bình luận thành công');
    setIsAddDialogOpen(false);
  };

  const handleEditComment = () => {
    if (!editingComment) return;
    const updatedData = {
      ...editingComment,
      content: formData.content,
      fileUrl: formData.fileUrl || undefined,
    };

    const newComments = comments.map((comment) =>
      comment.id === editingComment.id ? updatedData : comment
    );
    setComments(newComments);
    setFilteredComments(prev => prev.map(c => c.id === editingComment.id ? updatedData : c));

    setFormData({
      content: "",
      postId: 1,
      parentId: undefined,
      userId: 1,
      fileUrl: "",
    });
    setIsEditDialogOpen(false);
    setEditingComment(null);
  };

  // --- Helper Functions ---
  const handleViewComment = (comment: any) => {
    setSelectedComment(comment);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (comment: any) => {
    setEditingComment(comment);
    setFormData({
      content: comment.content,
      postId: Number(comment.postId),
      parentId: comment.parentId,
      userId: comment.userId,
      fileUrl: comment.fileUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const getCommentType = (comment: any) => {
    return comment.parentId ? "Phản hồi" : "Bình luận";
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllCurrentPage = (currentPageComments: any[]) => {
    const ids = currentPageComments.map((c) => c.id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản Lý Bình Luận
          </h1>
          <p className="text-gray-600">Quản lý bình luận và phản hồi</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Bình Luận
              </Button>
            </DialogTrigger>
            <AddDialog
              formData={formData}
              setFormData={setFormData}
              handleAddComment={handleAddComment}
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
              <Label className="text-sm font-medium">ID bài đăng</Label>
              <Input value={filterPostId} onChange={(e) => setFilterPostId(e.target.value)} className="w-32" />
            </div>
            {/* Filter User updated */}
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
              <Label className="text-sm font-medium">Tìm kiếm (Nội dung)</Label>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nội dung" className="w-56" />
            </div>
            <div>
              <Label className="text-sm font-medium">Từ ngày</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Đến ngày</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button onClick={handleApplyFilter}>Áp dụng</Button>
              <Button variant="outline" onClick={resetFilters}>Đặt lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
          <span>
            Đã chọn <span className="font-semibold">{selectedIds.length}</span> bình luận
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
            >
              Xóa các bình luận đã chọn
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  onChange={() => toggleSelectAllCurrentPage(paginatedComments)}
                  checked={
                    paginatedComments.length > 0 &&
                    paginatedComments.every((comment: any) => selectedIds.includes(comment.id))
                  }
                />
              </TableHead>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              <TableHead className="w-[80px] text-center">ID</TableHead>
              <TableHead>Bình Luận</TableHead>
              <TableHead>Người Dùng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
              >
                Thời Gian
              </TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedComments.length > 0 ? (
              paginatedComments.map((comment, index) => {
                // Find user from store instead of rely on comment.User
                const author = users.find(u => u.id === comment.userId);
                const replies = comments.filter((c) => c.parentId === comment.id);
                const itemNumber = (page - 1) * ITEMS_PER_PAGE + index + 1;

                return (
                  <TableRow key={comment.id}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedIds.includes(comment.id)}
                        onChange={() => toggleSelect(comment.id)}
                      />
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500">{itemNumber}</TableCell>
                    <TableCell className="text-center text-xs text-gray-500">{comment.id}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="max-w-xs text-left"
                        onClick={() => handleViewComment(comment)}
                      >
                        <p className="text-sm text-gray-900 truncate underline decoration-dotted">
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Post ID: {comment.postId}
                        </p>
                        {comment.fileUrl && (
                          <p className="text-xs text-green-600 mt-1">
                            Có file đính kèm
                          </p>
                        )}
                        {replies.length > 0 && (
                          <Badge variant="outline" className="mt-1">
                            {replies.length} phản hồi
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          {author?.avatarUrl ? (
                            <img
                              src={author.avatarUrl}
                              alt={author.username}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">
                              {author?.username?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-sm block">{author?.fullName || author?.username || "Unknown"}</span>
                          <span className="text-xs text-gray-500 block">@{author?.username}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCommentType(comment)}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(comment.commentedAt), "dd/MM/yyyy 'lúc' HH:mm")}
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
                            onClick={() => handleViewComment(comment)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem Chi Tiết
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() => openEditDialog(comment)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh Sửa
                          </DropdownMenuItem> */}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa Bình Luận
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">Không tìm thấy bình luận nào.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Updated Pagination */}
      <div className="flex items-center justify-between px-2 sm:px-0">
        <div className="text-sm text-gray-600">
          Hiển thị <strong>{paginatedComments.length}</strong> trên tổng số <strong>{sortedComments.length}</strong> bình luận (Trang {page}/{totalPages || 1})
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

      {/* View Comment Dialog */}
      <ViewDetailDialog
        isViewDialogOpen={isViewDialogOpen}
        setIsViewDialogOpen={setIsViewDialogOpen}
        selectedComment={selectedComment}
        getCommentType={getCommentType}
        format={format}
      />

      {/* Edit Comment Dialog */}
      <EditDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        handleEditComment={handleEditComment}
      />
    </div>
  );
}