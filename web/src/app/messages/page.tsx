"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  MessageSquare,
  User,
  Paperclip,
  Reply,
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
  fetchMessages,
  fetchAllMessages,
  deleteMessage,
  hideMessage,
  type Message,
} from "@/services/messageApi";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const [filterConvId, setFilterConvId] = useState<string>("");
  const [filterSenderId, setFilterSenderId] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try to get conversationId from query (?conversationId=123)
      const convIdParam = searchParams.get("conversationId");
      const conversationId = convIdParam ? parseInt(convIdParam, 10) : NaN;

      let data: Message[] = [];
      if (!isNaN(conversationId) && conversationId > 0) {
        data = await fetchMessages(conversationId);
      } else {
        // Admin view: fetch all messages with pagination defaults
        const convIdFilterNum = filterConvId ? parseInt(filterConvId, 10) : undefined;
        const senderIdNum = filterSenderId ? parseInt(filterSenderId, 10) : undefined;
        const typeVal = filterType ? (filterType as any) : undefined;
        const dateFrom = filterDateFrom || undefined;
        const dateTo = filterDateTo || undefined;
        data = await fetchAllMessages(50, 0, convIdFilterNum, senderIdNum, typeVal, dateFrom, dateTo);
      }
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Không thể tải dữ liệu tin nhắn");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessage(messageId);
      setMessages(messages.filter((msg) => msg.id !== messageId));
    } catch (err) {
      console.error("Error deleting message:", err);
      setError("Không thể xóa tin nhắn");
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case "text":
        return "Văn bản";
      case "image":
        return "Hình ảnh";
      case "video":
        return "Video";
      case "file":
        return "File";
      case "system":
        return "Hệ thống";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Đang tải tin nhắn...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">
          <p>{error}</p>
          <Button onClick={loadMessages} variant="outline" className="mt-2">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản Lý Tin Nhắn</h1>
          <p className="text-gray-600">
            Quản lý các tin nhắn trong cuộc trò chuyện
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Conversation ID</label>
            <input
              type="number"
              value={filterConvId}
              onChange={(e) => setFilterConvId(e.target.value)}
              placeholder="VD: 123"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ID người gửi</label>
            <input
              type="number"
              value={filterSenderId}
              onChange={(e) => setFilterSenderId(e.target.value)}
              placeholder="VD: 45"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Loại</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Tất cả</option>
              <option value="text">Văn bản</option>
              <option value="image">Hình ảnh</option>
              <option value="video">Video</option>
              <option value="file">File</option>
              <option value="system">Hệ thống</option>
            </select>
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
        <div className="mt-3 flex items-center gap-2">
          <Button onClick={loadMessages}>Áp dụng</Button>
          <Button
            variant="outline"
            onClick={() => {
              setFilterConvId("");
              setFilterSenderId("");
              setFilterType("");
              setFilterDateFrom("");
              setFilterDateTo("");
              loadMessages();
            }}
          >
            Đặt lại
          </Button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tin Nhắn</TableHead>
              <TableHead>Người Gửi</TableHead>
              <TableHead>Cuộc Trò Chuyện</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Thời Gian</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-gray-500">Không có tin nhắn nào</p>
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => {
                const sender = (message as any).Sender || (message as any).User;
                const conversationName = `Cuộc trò chuyện ${message.conversationId}`;

                return (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">
                          {message.content || "File đính kèm"}
                        </p>
                        {message.fileUrl && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Paperclip className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-green-600">
                              Có file
                            </span>
                          </div>
                        )}
                        {message.replyToId && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Reply className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Phản hồi
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                          {sender?.avatarUrl ? (
                            <img
                              src={sender.avatarUrl}
                              alt={sender?.fullName || sender?.username || "sender"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">
                              {(sender?.username || sender?.fullName || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-sm truncate max-w-[160px]">
                          {sender?.fullName || sender?.username || "Không rõ"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {conversationName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getMessageTypeLabel(message.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(message.createdAt), "MMM dd, yyyy")}
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
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem Chi Tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa Tin Nhắn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Tin Nhắn</DialogTitle>
            <DialogDescription>Xem thông tin tin nhắn</DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3 mb-3">
                  <MessageSquare className="h-6 w-6 text-green-500" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Tin Nhắn #{selectedMessage.id}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{getMessageTypeLabel(selectedMessage.type)}</span>
                      <span>
                        {format(
                          new Date(selectedMessage.createdAt),
                          "MMM dd, yyyy 'lúc' HH:mm"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sender Info */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Người Gửi</h4>
                  {(() => {
                    const sender = (selectedMessage as any).Sender || (selectedMessage as any).User;
                    return sender ? (
                      <div className="flex items-center space-x-3 p-3 bg-white rounded border">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
                          {sender.avatarUrl ? (
                            <img
                              src={sender.avatarUrl}
                              alt={sender?.fullName || sender?.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {sender.fullName || sender.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {sender.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {sender.id}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Không tìm thấy thông tin người gửi
                      </p>
                    );
                  })()}
                </div>

                {/* Conversation Info */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Cuộc Trò Chuyện
                  </h4>
                  <div className="p-3 bg-white rounded border">
                    <p className="font-medium text-gray-900">
                      Cuộc trò chuyện {selectedMessage.conversationId}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {selectedMessage.conversationId}
                    </p>
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Nội Dung</h4>
                  <div className="p-3 bg-white rounded border">
                    {selectedMessage.type === "image" && selectedMessage.fileUrl ? (
                      <div className="space-y-2">
                        <img
                          src={selectedMessage.fileUrl}
                          alt="image"
                          className="max-w-[320px] max-h-[260px] rounded border object-cover"
                        />
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <a
                            href={selectedMessage.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-green-600 break-all"
                          >
                            {selectedMessage.fileUrl}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <>
                        {selectedMessage.content ? (
                          <p className="text-gray-900 break-words">
                            {selectedMessage.content}
                          </p>
                        ) : (
                          <p className="text-gray-500 italic">
                            Không có nội dung văn bản
                          </p>
                        )}
                        {selectedMessage.fileUrl && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <Paperclip className="h-4 w-4 text-gray-400" />
                              <a
                                href={selectedMessage.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-green-600 break-all"
                              >
                                {selectedMessage.fileUrl}
                              </a>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {selectedMessage.replyToId && (
                      <div className="mt-2 p-2 bg-green-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Reply className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-600">
                            Phản hồi tin nhắn #{selectedMessage.replyToId}
                          </span>
                        </div>
                      </div>
                    )}
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
