"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import { getPostLikesAdmin, removePostLikeAdmin, getAllLikesAdmin } from "@/services/postAdminApi";

type LikeItem = {
  id: number;
  userId: number;
  postId: number;
  likedAt: string;
  User?: { id: number; username: string; fullName?: string; avatarUrl?: string };
};

export default function LikesPage() {
  const router = useRouter();
  const [postIdInput, setPostIdInput] = useState<string>("");
  const [likes, setLikes] = useState<LikeItem[]>([]);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [visibleCols, setVisibleCols] = useState({
    id: true,
    user: true,
    post: true,
    likedAt: true,
  });
  const [selectedLike, setSelectedLike] = useState<LikeItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userIdInput, setUserIdInput] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [limit, setLimit] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const loadLikes = async (targetPage?: number) => {
    const pid = parseInt(postIdInput, 10);
    setLoading(true);
    try {
      const commonParams = {
        userId: userIdInput ? parseInt(userIdInput, 10) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: (limit ? parseInt(limit, 10) : undefined),
      } as any;
      const limitNum = parseInt(limit || "50", 10) || 50;
      const currentPage = targetPage && targetPage > 0 ? targetPage : (page > 0 ? page : 1);
      const offsetNum = (currentPage - 1) * limitNum;
      commonParams.limit = limitNum;
      commonParams.offset = offsetNum;
      const data = postIdInput
        ? await getPostLikesAdmin(pid, commonParams)
        : await getAllLikesAdmin(commonParams);
      // data có thể là [{User: {...}}] hoặc chỉ là user list, chuẩn hóa về LikeItem[]
      const normalized: LikeItem[] = Array.isArray(data)
        ? (data as any[]).map((item: any, idx) => {
            if (item && (item.User || item.userId)) {
              return {
                id: item.id ?? idx,
                userId: item.userId ?? item.User?.id,
                postId: (item.postId ?? pid),
                likedAt: item.likedAt || item.liked_at || new Date().toISOString(),
                User: item.User || (item.id ? item : undefined),
              } as LikeItem;
            }
            return {
              id: idx,
              userId: 0,
              postId: (item?.postId ?? pid),
              likedAt: new Date().toISOString(),
            } as LikeItem;
          })
        : [];
      setLikes(normalized);
    } catch (e) {
      console.error("Failed to load likes:", e);
      setLikes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLike = async (like: LikeItem) => {
    try {
      await removePostLikeAdmin(like.postId, like.userId);
      setLikes((prev) => prev.filter((l) => !(l.postId === like.postId && l.userId === like.userId)));
    } catch (e) {
      console.error("Failed to remove like:", e);
    }
  };

  const handleViewLike = (like: LikeItem) => {
    setSelectedLike(like);
    setIsViewDialogOpen(true);
  };

  useEffect(() => {
    // Tự động tải tất cả likes khi mở trang
    loadLikes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFilters = async () => {
    setPostIdInput("");
    setUserIdInput("");
    setDateFrom("");
    setDateTo("");
    setLimit("");
    setPage(1);
    setLoading(true);
    try {
      const data = await getAllLikesAdmin({});
      const normalized: LikeItem[] = Array.isArray(data)
        ? (data as any[]).map((item: any, idx) => ({
            id: item.id ?? idx,
            userId: item.userId,
            postId: item.postId,
            likedAt: item.likedAt || item.liked_at,
            User: item.User,
          }))
        : [];
      setLikes(normalized);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Likes</h1>
          <p className="text-gray-600">Quản lý các lượt thích theo bài đăng</p>
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
                    checked={visibleCols.post}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, post: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Bài đăng</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.likedAt}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, likedAt: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Thời gian like</span>
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <Label htmlFor="postId">ID bài đăng</Label>
              <Input
                id="postId"
                value={postIdInput}
                onChange={(e) => setPostIdInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { loadLikes(); } }}
                className="w-48"
              />
            </div>
            <div>
              <Label htmlFor="userId">ID người dùng</Label>
              <Input
                id="userId"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                className="w-48"
              />
            </div>
            <div>
              <Label htmlFor="dateFrom">Từ ngày</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-44"
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Đến ngày</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-44"
              />
            </div>
            <div>
              <Label htmlFor="limit">Limit</Label>
              <Input
                id="limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-25"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button onClick={() => loadLikes(page)} disabled={loading}>
                {loading ? "Đang tải..." : "Áp dụng"}
              </Button>
              <Button variant="outline" onClick={resetFilters} disabled={loading}>Đặt lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              {visibleCols.id && (
                <TableHead className="w-[80px] text-center">ID</TableHead>
              )}
              {visibleCols.user && <TableHead>Người Dùng</TableHead>}
              {visibleCols.post && <TableHead>Bài Đăng</TableHead>}
              {visibleCols.likedAt && (
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
                >
                  Thời Gian Like
                </TableHead>
              )}
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(likes) && [...likes].sort((a, b) => {
              const av = new Date(a.likedAt).getTime();
              const bv = new Date(b.likedAt).getTime();
              if (av === bv) return 0;
              const res = av > bv ? 1 : -1;
              return sortDir === "asc" ? res : -res;
            }).map((like, index) => {
              const user = (like as any).User;
              const post = (like as any).Post || undefined;
              const limitNum = parseInt(limit || "50", 10) || 50;
              const currentPage = page > 0 ? page : 1;
              const offsetNum = (currentPage - 1) * limitNum;
              return (
                <TableRow key={like.id}>
                  <TableCell className="text-center text-sm text-gray-500">{offsetNum + index + 1}</TableCell>
                  {visibleCols.id && (
                    <TableCell className="text-center text-xs text-gray-500">{like.id}</TableCell>
                  )}
                  {visibleCols.user && (
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
                          {user?.fullName || user?.username || `User #${like.userId}`}
                        </div>
                        <div className="text-sm text-gray-500">@{user?.username} · ID: {user?.id ?? like.userId}</div>
                      </div>
                    </div>
                  </TableCell>
                  )}
                  {visibleCols.post && (
                    <TableCell>
                    <div className="max-w-xs">
                      <div className="text-sm text-gray-900 truncate">{post?.content ? post.content : `Post #${like.postId}`}</div>
                      <div className="text-xs text-gray-500">Post ID: {like.postId}</div>
                    </div>
                  </TableCell>
                  )}
                  {visibleCols.likedAt && (
                    <TableCell>
                      {format(new Date(like.likedAt), "MMM dd, yyyy 'lúc' HH:mm")}
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
                        <DropdownMenuItem onClick={() => handleViewLike(like)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/posts?postId=${like.postId}`)}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Tới Bài Đăng
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteLike(like)}
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

      <div className="flex items-center justify-between px-2 sm:px-0 mt-2">
        <div className="text-sm text-gray-600">Trang {page}</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={async () => {
              if (page <= 1) return;
              const nextPage = page - 1;
              await loadLikes(nextPage);
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
              await loadLikes(nextPage);
              setPage(nextPage);
            }}
          >
            Next
          </Button>
        </div>
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
                      {format(new Date(selectedLike.likedAt), "MMM dd, yyyy 'lúc' HH:mm")}
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Người Dùng</h4>
                  {(() => {
                    const user = selectedLike.User;
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
                {/* Post Info (chỉ hiển thị postId) */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Bài Đăng</h4>
                  <div className="p-3 bg-white rounded border text-sm text-gray-700">
                    Post ID: {selectedLike.postId}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
