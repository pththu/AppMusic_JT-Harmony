"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  MessageSquare,
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
import { mockUsers, mockPosts, getUserById, getPostById, type Comment as MockComment } from "@/lib/mock-data";
import { fetchAllComments, deleteCommentAdmin, type AdminComment } from "@/services/commentService";

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<(AdminComment | any)[]>([]);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [visibleCols, setVisibleCols] = useState({
    id: true,
    content: true,
    user: true,
    type: true,
    commentedAt: true,
  });
  const [selectedComment, setSelectedComment] = useState<any | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    postId: 1,
    parentId: undefined as number | undefined,
    userId: 1,
    fileUrl: "",
  });
  // Server-side filters
  const [filterPostId, setFilterPostId] = useState<string>("");
  const [filterUserId, setFilterUserId] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [limit, setLimit] = useState<string>("50");
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleDeleteComment = async (commentId: number) => {
    await deleteCommentAdmin(commentId);
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setSelectedIds((prev) => prev.filter((id) => id !== commentId));
  };

  const resetFilters = async () => {
    setFilterPostId("");
    setFilterUserId("");
    setQ("");
    setDateFrom("");
    setDateTo("");
    setLimit("50");
    setPage(1);
    await loadComments(1);
  };

  const handleViewComment = (comment: any) => {
    setSelectedComment(comment);
    setIsViewDialogOpen(true);
  };

  const handleAddComment = () => {
    const newComment: any = {
      id: Math.max(...comments.map((c) => c.id)) + 1,
      content: formData.content,
      postId: formData.postId,
      parentId: formData.parentId,
      userId: formData.userId,
      fileUrl: formData.fileUrl || undefined,
      commentedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
    setFormData({
      content: "",
      postId: 1,
      parentId: undefined,
      userId: 1,
      fileUrl: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditComment = () => {
    if (!editingComment) return;
    setComments(
      comments.map((comment) =>
        comment.id === editingComment.id
          ? {
            ...comment,
            content: formData.content,
            fileUrl: formData.fileUrl || undefined,
          }
          : comment
      )
    );
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

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const idsToDelete = [...selectedIds];
    await Promise.all(idsToDelete.map((id) => deleteCommentAdmin(id)));
    setComments((prev) => prev.filter((comment) => !idsToDelete.includes(comment.id)));
    setSelectedIds([]);
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

  const loadComments = async (targetPage?: number) => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterPostId) params.postId = parseInt(filterPostId, 10);
      if (filterUserId) params.userId = parseInt(filterUserId, 10);
      if (q) params.q = q;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const limitNum = parseInt(limit, 10) || 50;
      const currentPage = targetPage && targetPage > 0 ? targetPage : (page > 0 ? page : 1);
      const offsetNum = (currentPage - 1) * limitNum;
      params.limit = limitNum;
      params.offset = offsetNum;
      const data = await fetchAllComments(params);
      setComments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load comments admin:', e);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(1);
  }, []);

  const sortedComments = comments.slice().sort((a: any, b: any) => {
    const av = new Date(a.commentedAt).getTime();
    const bv = new Date(b.commentedAt).getTime();
    if (av === bv) return 0;
    const res = av > bv ? 1 : -1;
    return sortDir === "asc" ? res : -res;
  });

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
                    checked={visibleCols.content}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, content: e.target.checked }))
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
                    checked={visibleCols.user}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, user: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Người dùng</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.type}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, type: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Loại</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.commentedAt}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, commentedAt: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Thời gian</span>
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Bình Luận
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm Bình Luận Mới</DialogTitle>
              <DialogDescription>
                Thêm bình luận mới vào hệ thống.
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="col-span-3"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postId" className="text-right">
                  Bài Đăng
                </Label>
                <Select
                  value={formData.postId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, postId: parseInt(value) })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPosts.map((post) => (
                      <SelectItem key={post.id} value={post.id.toString()}>
                        {post.content.substring(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentId" className="text-right">
                  Phản Hồi Cho
                </Label>
                <Select
                  value={formData.parentId?.toString() || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      parentId: value ? parseInt(value) : undefined,
                    })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Không phản hồi" />
                  </SelectTrigger>
                  <SelectContent>
                    {comments.map((comment) => (
                      <SelectItem
                        key={comment.id}
                        value={comment.id.toString()}
                      >
                        {comment.content.substring(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                  Người Dùng
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fileUrl" className="text-right">
                  URL File
                </Label>
                <Input
                  id="fileUrl"
                  value={formData.fileUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, fileUrl: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="URL của file đính kèm (tùy chọn)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddComment}>Thêm Bình Luận</Button>
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
              <Label className="text-sm font-medium">ID bài đăng</Label>
              <Input value={filterPostId} onChange={(e)=>setFilterPostId(e.target.value)} className="w-32" />
            </div>
            <div>
              <Label className="text-sm font-medium">ID người dùng</Label>
              <Input value={filterUserId} onChange={(e)=>setFilterUserId(e.target.value)} className="w-32" />
            </div>
            <div>
              <Label className="text-sm font-medium">Tìm kiếm</Label>
              <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Nội dung" className="w-56" />
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
              <Button onClick={() => loadComments(page)} disabled={loading}>{loading ? 'Đang tải...' : 'Áp dụng'}</Button>
              <Button variant="outline" onClick={resetFilters} disabled={loading}>Đặt lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Table */}
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

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px] text-center">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  onChange={() => toggleSelectAllCurrentPage(sortedComments)}
                  checked={
                    sortedComments.length > 0 &&
                    sortedComments.every((comment: any) => selectedIds.includes(comment.id))
                  }
                />
              </TableHead>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              {visibleCols.id && (
                <TableHead className="w-[80px] text-center">ID</TableHead>
              )}
              {visibleCols.content && <TableHead>Bình Luận</TableHead>}
              {visibleCols.user && <TableHead>Người Dùng</TableHead>}
              {visibleCols.type && <TableHead>Loại</TableHead>}
              {visibleCols.commentedAt && (
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
                >
                  Thời Gian
                </TableHead>
              )}
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedComments.map((comment, index) => {
              const author = (comment as any).User || null;
              const replies = comments.filter((c) => c.parentId === comment.id);
              const limitNum = parseInt(limit, 10) || 50;
              const currentPage = page > 0 ? page : 1;
              const offsetNum = (currentPage - 1) * limitNum;
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
                  <TableCell className="text-center text-sm text-gray-500">{offsetNum + index + 1}</TableCell>
                  {visibleCols.id && (
                    <TableCell className="text-center text-xs text-gray-500">{comment.id}</TableCell>
                  )}
                  {visibleCols.content && (
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
                  )}
                  {visibleCols.user && (
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
                        <span className="text-sm block">{author?.fullName || author?.username}</span>
                        <span className="text-xs text-gray-500 block">ID: {author?.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  )}
                  {visibleCols.type && (
                    <TableCell>
                    <Badge variant="outline">{getCommentType(comment)}</Badge>
                  </TableCell>
                  )}
                  {visibleCols.commentedAt && (
                    <TableCell>
                      {format(new Date(comment.commentedAt), "MMM dd, yyyy")}
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
                          onClick={() => handleViewComment(comment)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEditDialog(comment)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh Sửa
                        </DropdownMenuItem>
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
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 sm:px-0">
        <div className="text-sm text-gray-600">Trang {page}</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={async () => {
              if (page <= 1) return;
              const nextPage = page - 1;
              await loadComments(nextPage);
              setPage(nextPage);
            }}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={async () => {
              const nextPage = page + 1;
              await loadComments(nextPage);
              setPage(nextPage);
            }}
          >
            Next
          </Button>
        </div>
      </div>

      {/* View Comment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Bình Luận</DialogTitle>
            <DialogDescription>
              Xem thông tin bình luận và các phản hồi
            </DialogDescription>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              {/* Comment Info */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {(() => {
                      const author = getUserById(selectedComment.userId);
                      return author?.avatarUrl ? (
                        <img
                          src={author.avatarUrl}
                          alt={author.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {author?.username.charAt(0).toUpperCase()}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {getUserById(selectedComment.userId)?.username}
                      </span>
                      <Badge variant="outline">
                        {getCommentType(selectedComment)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(
                        new Date(selectedComment.commentedAt),
                        "MMM dd, yyyy 'lúc' HH:mm"
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-900 mb-2">{selectedComment.content}</p>
                {selectedComment.fileUrl && (
                  <div className="text-sm text-green-600">
                    File đính kèm: {selectedComment.fileUrl}
                  </div>
                )}
              </div>

              {/* Replies */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Phản Hồi (
                  {
                    comments.filter((c) => c.parentId === selectedComment.id)
                      .length
                  }
                  )
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comments
                    .filter((c) => c.parentId === selectedComment.id)
                    .map((reply: any) => {
                      const replyAuthor = reply.User || null;
                      return (
                        <div
                          key={reply.id}
                          className="border rounded p-3 bg-white ml-6"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              {replyAuthor?.avatarUrl ? (
                                <img
                                  src={replyAuthor.avatarUrl}
                                  alt={replyAuthor.username}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-600">
                                  {replyAuthor?.username?.charAt(0)?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {replyAuthor?.fullName || replyAuthor?.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(
                                new Date(reply.commentedAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">
                            {reply.content}
                          </p>
                          {reply.fileUrl && (
                            <p className="text-xs text-green-600 mt-1">
                              File: {reply.fileUrl}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  {comments.filter((c) => c.parentId === selectedComment.id)
                    .length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Chưa có phản hồi nào
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Comment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Bình Luận</DialogTitle>
            <DialogDescription>Cập nhật nội dung bình luận.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-content" className="text-right">
                Nội Dung
              </Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fileUrl" className="text-right">
                URL File
              </Label>
              <Input
                id="edit-fileUrl"
                value={formData.fileUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, fileUrl: e.target.value })
                }
                className="col-span-3"
                placeholder="URL của file đính kèm (tùy chọn)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditComment}>Cập Nhật Bình Luận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
