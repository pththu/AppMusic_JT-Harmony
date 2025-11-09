"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Heart,
  User,
  MessageSquare,
} from "lucide-react";
import {
  Button,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import {
  mockLikes,
  mockUsers,
  mockPosts,
  getUserById,
  getPostById,
  type Like,
} from "@/lib/mock-data";

export default function LikesPage() {
  const [likes, setLikes] = useState<Like[]>(mockLikes);
  const [selectedLike, setSelectedLike] = useState<Like | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleDeleteLike = (likeId: number) => {
    setLikes(likes.filter((like) => like.id !== likeId));
  };

  const handleViewLike = (like: Like) => {
    setSelectedLike(like);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Likes</h1>
          <p className="text-gray-600">Quản lý các lượt thích theo bài đăng</p>
        </div>
      </div>

      {/* Likes Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người Dùng</TableHead>
              <TableHead>Bài Đăng</TableHead>
              <TableHead>Thời Gian Like</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {likes.map((like) => {
              const user = getUserById(like.userId);
              const post = getPostById(like.postId);
              return (
                <TableRow key={like.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user?.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user?.fullName}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">
                        {post?.content.substring(0, 50)}...
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          {post?.heartCount} likes
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {post?.commentCount} comments
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(like.likedAt), "MMM dd, yyyy 'lúc' HH:mm")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewLike(like)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteLike(like.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa Like
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

      {/* View Like Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Like</DialogTitle>
            <DialogDescription>Xem thông tin lượt thích</DialogDescription>
          </DialogHeader>
          {selectedLike && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <Heart className="h-6 w-6 text-red-500" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lượt Thích
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(
                        new Date(selectedLike.likedAt),
                        "MMM dd, yyyy 'lúc' HH:mm"
                      )}
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Người Dùng</h4>
                  {(() => {
                    const user = getUserById(selectedLike.userId);
                    return user ? (
                      <div className="flex items-center space-x-3 p-3 bg-white rounded border">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-400">ID: {user.id}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Không tìm thấy thông tin người dùng
                      </p>
                    );
                  })()}
                </div>

                {/* Post Info */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Bài Đăng</h4>
                  {(() => {
                    const post = getPostById(selectedLike.postId);
                    return post ? (
                      <div className="p-3 bg-white rounded border">
                        <p className="text-gray-900 mb-2">{post.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>❤️ {post.heartCount} likes</span>
                          <span>💬 {post.commentCount} comments</span>
                          <span>
                            📅{" "}
                            {format(new Date(post.createdAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Không tìm thấy thông tin bài đăng
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
