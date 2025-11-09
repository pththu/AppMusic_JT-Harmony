"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  MessageCircle,
  Users,
  User,
  Plus,
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
  mockConversations,
  mockConversationMembers,
  mockMessages,
  mockUsers,
  getUserById,
  type Conversation,
} from "@/lib/mock-data";

export default function ConversationsPage() {
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleDeleteConversation = (conversationId: number) => {
    setConversations(
      conversations.filter((conv) => conv.id !== conversationId)
    );
  };

  const handleViewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsViewDialogOpen(true);
  };

  const getConversationType = (conversation: Conversation) => {
    return conversation.type === "private" ? "Riêng tư" : "Nhóm";
  };

  const getMemberCount = (conversationId: number) => {
    return mockConversationMembers.filter(
      (member) => member.conversationId === conversationId
    ).length;
  };

  const getLastMessage = (conversationId: number) => {
    const messages = mockMessages.filter(
      (msg) => msg.conversationId === conversationId
    );
    return messages.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Thêm Cuộc Trò Chuyện
        </Button>
      </div>

      {/* Conversations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cuộc Trò Chuyện</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Thành Viên</TableHead>
              <TableHead>Tin Nhắn Cuối</TableHead>
              <TableHead>Thời Gian</TableHead>
              <TableHead className="w-[70px]">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map((conversation) => {
              const memberCount = getMemberCount(conversation.id);
              const lastMessage = getLastMessage(conversation.id);
              const creator = conversation.creatorId
                ? getUserById(conversation.creatorId)
                : null;

              return (
                <TableRow key={conversation.id}>
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
                        {creator && (
                          <div className="text-sm text-gray-500">
                            Tạo bởi: {creator.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getConversationType(conversation)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{memberCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {lastMessage ? (
                        <div>
                          <p className="text-sm text-gray-900 truncate">
                            {lastMessage.content || "File đính kèm"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getUserById(lastMessage.senderId)?.username}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Chưa có tin nhắn
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(conversation.updatedAt), "MMM dd, yyyy")}
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
                          onClick={() => {
                            window.location.href = `/conversations/${conversation.id}`;
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem Chi Tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // Navigate to messages page for this conversation
                            window.location.href = `/messages?conversationId=${conversation.id}`;
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
                        Tạo:{" "}
                        {format(
                          new Date(selectedConversation.createdAt),
                          "MMM dd, yyyy"
                        )}
                      </span>
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
                  Thành Viên ({getMemberCount(selectedConversation.id)})
                </h4>
                <div className="grid gap-2">
                  {mockConversationMembers
                    .filter(
                      (member) =>
                        member.conversationId === selectedConversation.id
                    )
                    .map((member) => {
                      const user = getUserById(member.userId);
                      return user ? (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-white rounded border"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.username}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <User className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {user.username}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user.fullName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {member.isAdmin && (
                              <Badge variant="secondary">Admin</Badge>
                            )}
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {member.status === "active"
                                ? "Hoạt động"
                                : member.status === "left"
                                  ? "Đã rời"
                                  : "Bị xóa"}
                            </Badge>
                          </div>
                        </div>
                      ) : null;
                    })}
                </div>
              </div>

              {/* Recent Messages */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Tin Nhắn Gần Đây
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mockMessages
                    .filter(
                      (msg) => msg.conversationId === selectedConversation.id
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .slice(0, 10)
                    .map((message) => {
                      const sender = getUserById(message.senderId);
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
                              <p className="text-xs text-blue-600 mt-1">
                                File: {message.fileUrl}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  {mockMessages.filter(
                    (msg) => msg.conversationId === selectedConversation.id
                  ).length === 0 && (
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
    </div>
  );
}
