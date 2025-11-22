"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  MessageCircle,
  Users,
  User,
  Plus,
  Loader2,
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
  fetchConversations,
  fetchConversationMessages,
  deleteConversation,
  createPrivateConversationWithUser,
  type Conversation,
  type Message,
} from "@/services/conversationApi";

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sortKey, setSortKey] = useState<"updatedAt" | "memberCount">("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [visibleCols, setVisibleCols] = useState({
    id: true,
    name: true,
    type: true,
    members: true,
    lastMessage: true,
    updatedAt: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<{[key: number]: Message[]}>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterQ, setFilterQ] = useState<string>("");
  const [filterMemberId, setFilterMemberId] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConversations({
        type: (filterType as any) || undefined,
        q: filterQ || undefined,
        memberId: filterMemberId ? parseInt(filterMemberId, 10) : undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
      });
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Không thể tải dữ liệu cuộc trò chuyện");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await deleteConversation(conversationId);
      setConversations(conversations.filter((conv) => conv.id !== conversationId));
    } catch (err) {
      console.error("Error deleting conversation:", err);
      setError("Không thể xóa cuộc trò chuyện");
    }
  };

  const handleViewConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsViewDialogOpen(true);

    // Fetch messages for this conversation if not already loaded
    if (!conversationMessages[conversation.id]) {
      try {
        const messages = await fetchConversationMessages(conversation.id);
        setConversationMessages(prev => ({
          ...prev,
          [conversation.id]: messages,
        }));
      } catch (err) {
        console.error("Failed to fetch conversation messages:", err);
      }
    }
  };

  const getConversationType = (conversation: Conversation) => {
    return conversation.type === "private" ? "Riêng tư" : "Nhóm";
  };

  const getMemberCount = (conversation: Conversation) => {
    return conversation.members?.length || 0;
  };

  const getLastMessage = (conversation: Conversation) => {
    return conversation.lastMessage;
  };

  const sortedConversations = (Array.isArray(conversations) ? conversations : []).slice().sort((a: any, b: any) => {
    if (sortKey === "memberCount") {
      const av = (a.members?.length || 0);
      const bv = (b.members?.length || 0);
      if (av === bv) return 0;
      const res = av > bv ? 1 : -1;
      return sortDir === "asc" ? res : -res;
    }
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    if (aTime === bTime) return 0;
    const res = aTime > bTime ? 1 : -1;
    return sortDir === "asc" ? res : -res;
  });

  const handleSort = (key: "updatedAt" | "memberCount") => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir("desc");
      return key;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Lỗi: {error}</p>
          <Button onClick={loadConversations}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản Lý Cuộc Trò Chuyện
          </h1>
          <p className="text-gray-600">
            Quản lý các cuộc trò chuyện và tin nhắn
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
                    checked={visibleCols.name}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, name: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Cuộc trò chuyện</span>
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
                    checked={visibleCols.members}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, members: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Thành viên</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.lastMessage}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, lastMessage: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Tin nhắn cuối</span>
                </label>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={visibleCols.updatedAt}
                    onChange={(e) =>
                      setVisibleCols((prev) => ({ ...prev, updatedAt: e.target.checked }))
                    }
                  />
                  <span className="text-sm">Thời gian</span>
                </label>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Cuộc Trò Chuyện
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Loại</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="private">Riêng tư</option>
              <option value="group">Nhóm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Từ khóa tên</label>
            <input
              type="text"
              value={filterQ}
              onChange={(e) => setFilterQ(e.target.value)}
              placeholder="Nhập từ khóa"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ID thành viên</label>
            <input
              type="number"
              value={filterMemberId}
              onChange={(e) => setFilterMemberId(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Từ ngày</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Đến ngày</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 justify-end">
          <Button onClick={loadConversations}>Áp dụng</Button>
          <Button
            variant="outline"
            onClick={() => {
              setFilterType("");
              setFilterQ("");
              setFilterMemberId("");
              setFilterDateFrom("");
              setFilterDateTo("");
              loadConversations();
            }}
          >
            Đặt lại
          </Button>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">STT</TableHead>
              {visibleCols.id && (
                <TableHead className="w-[80px] text-center">ID</TableHead>
              )}
              {visibleCols.name && <TableHead>Cuộc Trò Chuyện</TableHead>}
              {visibleCols.type && <TableHead>Loại</TableHead>}
              {visibleCols.members && (
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("memberCount")}
                >
                  Thành Viên
                </TableHead>
              )}
              {visibleCols.lastMessage && <TableHead>Tin Nhắn Cuối</TableHead>}
              {visibleCols.updatedAt && (
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("updatedAt")}
                >
                  Thời Gian
                </TableHead>
              )}
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedConversations.map((conversation, index) => {
              const memberCount = getMemberCount(conversation);
              const lastMessage = getLastMessage(conversation);

              return (
                <TableRow key={conversation.id}>
                  <TableCell className="text-center text-sm text-gray-500">{index + 1}</TableCell>
                  {visibleCols.id && (
                    <TableCell className="text-center text-xs text-gray-500">{conversation.id}</TableCell>
                  )}
                  {visibleCols.name && (
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          {conversation.type === "group" ? (
                            <Users className="h-5 w-5 text-gray-600" />
                          ) : (
                            <MessageCircle className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {conversation.name ||
                              `Cuộc trò chuyện ${conversation.id}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {visibleCols.type && (
                    <TableCell>
                      <Badge variant="outline">
                        {getConversationType(conversation)}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleCols.members && (
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{memberCount}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleCols.lastMessage && (
                    <TableCell>
                      <div className="max-w-xs">
                        {lastMessage ? (
                          <div>
                            <p className="text-sm text-gray-900 truncate">
                              {lastMessage.content || "File đính kèm"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {lastMessage.User?.username}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Chưa có tin nhắn
                          </p>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {visibleCols.updatedAt && (
                    <TableCell>
                      {format(new Date(conversation.updatedAt), "MMM dd, yyyy")}
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
                          onClick={() => handleViewConversation(conversation)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            router.push(`/messages?conversationId=${conversation.id}`);
                          }}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Xem Tin Nhắn
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            handleDeleteConversation(conversation.id)
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa Cuộc Trò Chuyện
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

      {/* View Conversation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Cuộc Trò Chuyện</DialogTitle>
            <DialogDescription>
              Xem thông tin cuộc trò chuyện và các thành viên
            </DialogDescription>
          </DialogHeader>
          {selectedConversation && (
            <div className="space-y-6">
              {/* Conversation Info */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  {selectedConversation.type === "group" ? (
                    <Users className="h-8 w-8 text-gray-600" />
                  ) : (
                    <MessageCircle className="h-8 w-8 text-gray-600" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedConversation.name ||
                        `Cuộc trò chuyện ${selectedConversation.id}`}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{getConversationType(selectedConversation)}</span>
                      <span>
                        Cập nhật:{" "}
                        {format(
                          new Date(selectedConversation.updatedAt),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Members */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Thành Viên ({getMemberCount(selectedConversation)})
                </h4>
                <div className="grid gap-2">
                  {(selectedConversation.members as any[])?.map((member) => {
                    const u: any = (member as any).User || (member as any);
                    return (
                      <div
                        key={(member as any).id}
                        className="flex items-center justify-between p-3 bg-white rounded border"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {u?.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.username || u.fullName || "member"}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <User className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {u?.username || u?.fullName || "Người dùng"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {u?.fullName || ""}
                            </p>
                          </div>
                        </div>
                        <Badge variant="default">Hoạt động</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Messages */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Tin Nhắn Gần Đây
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {conversationMessages[selectedConversation.id]?.slice(0, 10).map((message) => {
                    const sender = message.User;
                    return (
                      <div
                        key={message.id}
                        className="flex items-start space-x-3 p-3 bg-white rounded border"
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {sender?.avatarUrl ? (
                            <img
                              src={sender.avatarUrl}
                              alt={sender.username}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <User className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {sender?.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(
                                new Date(message.createdAt),
                                "MMM dd, HH:mm"
                              )}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {message.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-900 break-words">
                            {message.content || "File đính kèm"}
                          </p>
                          {message.fileUrl && (
                            <p className="text-xs text-green-600 mt-1">
                              File: {message.fileUrl}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(!conversationMessages[selectedConversation.id] || conversationMessages[selectedConversation.id].length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Chưa có tin nhắn nào
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Conversation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm Cuộc Trò Chuyện</DialogTitle>
            <DialogDescription>
              Tạo cuộc trò chuyện riêng tư với User ID chỉ định
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">User ID</label>
              <input
                type="number"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Nhập User ID"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={async () => {
                  const uid = parseInt(targetUserId, 10);
                  if (!uid || uid <= 0) return;
                  try {
                    const res = await createPrivateConversationWithUser(uid);
                    setIsAddDialogOpen(false);
                    setTargetUserId("");
                    router.push(`/messages?conversationId=${res.conversationId}`);
                  } catch (err) {
                    console.error("Failed to create private conversation:", err);
                  }
                }}
              >
                Tạo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
