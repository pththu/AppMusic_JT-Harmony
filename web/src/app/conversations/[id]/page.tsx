"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, MessageCircle, Users, User, Send } from "lucide-react";
import { Button, Badge, Input } from "@/components/ui";
import {
  mockConversations,
  mockConversationMembers,
  mockMessages,
  mockUsers,
  getUserById,
  type Conversation,
  type Message,
} from "@/lib/mock-data";

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = parseInt(params.id as string);

  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cuộc trò chuyện không tồn tại.</p>
      </div>
    );
  }

  const members = mockConversationMembers.filter(
    (member) => member.conversationId === conversationId
  );
  const messages = mockMessages
    .filter((msg) => msg.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi Tiết Cuộc Trò Chuyện
          </h1>
          <p className="text-gray-600">ID: {conversation.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              {conversation.type === "group" ? (
                <Users className="h-8 w-8 text-gray-600" />
              ) : (
                <MessageCircle className="h-8 w-8 text-gray-600" />
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {conversation.name || `Cuộc trò chuyện ${conversation.id}`}
                </h2>
                <Badge variant="outline" className="mt-1">
                  {conversation.type === "private" ? "Riêng tư" : "Nhóm"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <span className="font-medium">Tạo bởi:</span>{" "}
                {conversation.creatorId
                  ? getUserById(conversation.creatorId)?.username
                  : "N/A"}
              </div>
              <div>
                <span className="font-medium">Thời gian tạo:</span>{" "}
                {format(
                  new Date(conversation.createdAt),
                  "MMM dd, yyyy 'at' HH:mm"
                )}
              </div>
              <div>
                <span className="font-medium">Cập nhật cuối:</span>{" "}
                {format(
                  new Date(conversation.updatedAt),
                  "MMM dd, yyyy 'at' HH:mm"
                )}
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">
              Thành Viên ({members.length})
            </h3>
            <div className="space-y-3">
              {members.map((member) => {
                const user = getUserById(member.userId);
                return user ? (
                  <div key={member.id} className="flex items-center space-x-3">
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
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {member.isAdmin && (
                        <Badge variant="secondary" className="text-xs">
                          Admin
                        </Badge>
                      )}
                      <Badge
                        variant={
                          member.status === "active" ? "default" : "outline"
                        }
                        className="text-xs"
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
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Tin Nhắn ({messages.length})
            </h3>

            {/* Messages List */}
            <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const sender = getUserById(message.senderId);
                  return (
                    <div
                      key={message.id}
                      className="flex items-start space-x-3"
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
                            {sender?.fullName || sender?.username}
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
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-900 break-words">
                            {message.content || "File đính kèm"}
                          </p>
                          {message.fileUrl && (
                            <p className="text-xs text-blue-600 mt-2">
                              File: {message.fileUrl}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Chưa có tin nhắn nào trong cuộc trò chuyện này.
                  </p>
                </div>
              )}
            </div>

            {/* Send Message */}
            <div className="flex items-center space-x-2 pt-4 border-t">
              <Input placeholder="Nhập tin nhắn..." className="flex-1" />
              <Button size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
