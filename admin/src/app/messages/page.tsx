"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  MessageSquare,
  User,
  Paperclip,
  Reply,
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
  mockMessages,
  mockUsers,
  mockConversations,
  getUserById,
  type Message,
} from "@/lib/mock-data";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleDeleteMessage = (messageId: number) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
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

  const getConversationName = (conversationId: number) => {
    const conversation = mockConversations.find((c) => c.id === conversationId);
    return conversation?.name || `Cuộc trò chuyện ${conversationId}`;
  };

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
            {messages.map((message) => {
              const sender = getUserById(message.senderId);
              const conversationName = getConversationName(
                message.conversationId
              );

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
                          <span className="text-xs text-blue-600">Có file</span>
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
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        {sender?.avatarUrl ? (
                          <img
                            src={sender.avatarUrl}
                            alt={sender.username}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {sender?.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm">{sender?.username}</span>
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
            })}
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
                  <MessageSquare className="h-6 w-6 text-blue-500" />
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
                    const sender = getUserById(selectedMessage.senderId);
                    return sender ? (
                      <div className="flex items-center space-x-3 p-3 bg-white rounded border">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {sender.avatarUrl ? (
                            <img
                              src={sender.avatarUrl}
                              alt={sender.username}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {sender.username}
                          </p>
                          <p className="text-sm text-gray-500">
                            {sender.fullName}
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
                      {getConversationName(selectedMessage.conversationId)}
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
                    {selectedMessage.content ? (
                      <p className="text-gray-900">{selectedMessage.content}</p>
                    ) : (
                      <p className="text-gray-500 italic">
                        Không có nội dung văn bản
                      </p>
                    )}

                    {selectedMessage.fileUrl && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-blue-600">
                            {selectedMessage.fileUrl}
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedMessage.replyToId && (
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Reply className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-blue-600">
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
