"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  mockComments,
  mockUsers,
  mockPosts,
  getUserById,
  getPostById,
  type Comment,
} from "@/lib/mock-data";

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [formData, setFormData] = useState({
    content: "",
    postId: 1,
    parentId: undefined as number | undefined,
    userId: 1,
    fileUrl: "",
  });

  const handleDeleteComment = (commentId: number) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  const handleViewComment = (comment: Comment) => {
    setSelectedComment(comment);
    setIsViewDialogOpen(true);
  };

  const handleAddComment = () => {
    const newComment: Comment = {
      id: Math.max(...comments.map((c) => c.id)) + 1,
      content: formData.content,
      postId: formData.postId,
      parentId: formData.parentId,
      userId: formData.userId,
      fileUrl: formData.fileUrl || undefined,
      commentedAt: new Date().toISOString(),
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

  const openEditDialog = (comment: Comment) => {
    setEditingComment(comment);
    setFormData({
      content: comment.content,
      postId: comment.postId,
      parentId: comment.parentId,
      userId: comment.userId,
      fileUrl: comment.fileUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const getCommentType = (comment: Comment) => {
    return comment.parentId ? "Phản hồi" : "Bình luận";
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

      {/* Comments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bình Luận</TableHead>
              <TableHead>Người Dùng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Thời Gian</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comments.map((comment) => {
              const author = getUserById(comment.userId);
              const replies = comments.filter((c) => c.parentId === comment.id);
              return (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">
                        {comment.content}
                      </p>
                      {comment.fileUrl && (
                        <p className="text-xs text-blue-600 mt-1">
                          Có file đính kèm
                        </p>
                      )}
                      {replies.length > 0 && (
                        <Badge variant="outline" className="mt-1">
                          {replies.length} phản hồi
                        </Badge>
                      )}
                    </div>
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
                            {author?.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm">{author?.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCommentType(comment)}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(comment.commentedAt), "MMM dd, yyyy")}
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
                  <div className="text-sm text-blue-600">
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
                    .map((reply) => {
                      const replyAuthor = getUserById(reply.userId);
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
                                  {replyAuthor?.username
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {replyAuthor?.username}
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
                            <p className="text-xs text-blue-600 mt-1">
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
