import axiosClient from "@/lib/axiosClient";

// === INTERFACES ===
export interface Conversation {
  id: number;
  type: "private" | "group";
  name?: string;
  lastMessageId?: number;
  creatorId?: number;
  createdAt: string;
  updatedAt: string;
  members?: ConversationMember[];
  lastMessage?: Message;
}

export interface ConversationMember {
  id: number;
  conversationId: number;
  userId: number;
  isAdmin: boolean;
  lastReadMessageId?: number;
  status: "active" | "left" | "removed";
  createdAt: string;
  updatedAt: string;
  User?: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content?: string;
  type: "text" | "image" | "video" | "file" | "system";
  fileUrl?: string;
  replyToId?: number;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  replyTo?: Message;
}

// === API FUNCTIONS ===

/**
 * Lấy danh sách cuộc trò chuyện của user hiện tại
 * Endpoint: GET /conversations
 */
export const fetchConversations = async (
  filters?: {
    type?: "private" | "group";
    q?: string;
    memberId?: number;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<Conversation[]> => {
  try {
    // Determine if current user is admin (roleId = 1)
    let isAdmin = false;
    if (typeof window !== "undefined") {
      try {
        const persisted = localStorage.getItem("auth-storage");
        if (persisted) {
          const parsed = JSON.parse(persisted);
          const user = parsed?.state?.user ?? parsed?.user ?? null;
          const roleId = user?.roleId ?? user?.role_id ?? user?.role?.id;
          isAdmin = roleId === 1;
        }
      } catch {}
    }

    const response = await axiosClient.get("/conversations", {
      params: isAdmin
        ? {
            all: true,
            ...(filters?.type ? { type: filters.type } : {}),
            ...(filters?.q ? { q: filters.q } : {}),
            ...(filters?.memberId ? { memberId: filters.memberId } : {}),
            ...(filters?.dateFrom ? { dateFrom: filters.dateFrom } : {}),
            ...(filters?.dateTo ? { dateTo: filters.dateTo } : {}),
          }
        : undefined,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách cuộc trò chuyện:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết cuộc trò chuyện theo ID
 * Endpoint: GET /conversations/:conversationId
 */
export const fetchConversationById = async (
  conversationId: number
): Promise<Conversation> => {
  try {
    const response = await axiosClient.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết cuộc trò chuyện:", error);
    throw error;
  }
};

/**
 * Lấy tin nhắn của cuộc trò chuyện
 * Endpoint: GET /conversations/:conversationId/messages
 */
export const fetchConversationMessages = async (
  conversationId: number,
  limit = 50,
  offset = 0
): Promise<Message[]> => {
  try {
    const response = await axiosClient.get(
      `/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải tin nhắn cuộc trò chuyện:", error);
    throw error;
  }
};

/**
 * Xóa tin nhắn
 * Endpoint: DELETE /conversations/messages/:messageId
 */
export const deleteMessage = async (
  messageId: number
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.delete(
      `/conversations/messages/${messageId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa tin nhắn:", error);
    throw error;
  }
};

/**
 * Ẩn tin nhắn
 * Endpoint: POST /conversations/messages/:messageId/hide
 */
export const hideMessage = async (
  messageId: number
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.post(
      `/conversations/messages/${messageId}/hide`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi ẩn tin nhắn:", error);
    throw error;
  }
};

/**
 * Xóa cuộc trò chuyện
 * Endpoint: DELETE /conversations/:conversationId
 */
export const deleteConversation = async (
  conversationId: number
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.delete(
      `/conversations/${conversationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa cuộc trò chuyện:", error);
    throw error;
  }
};

/**
 * Tạo cuộc trò chuyện mới (private hoặc group)
 * Endpoint: POST /conversations
 */
export const createConversation = async (
  type: "private" | "group",
  name?: string,
  memberIds?: number[]
): Promise<Conversation> => {
  try {
    const response = await axiosClient.post("/conversations", {
      type,
      name,
      memberIds,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo cuộc trò chuyện:", error);
    throw error;
  }
};

/**
 * Gửi tin nhắn
 * Endpoint: POST /conversations/:conversationId/messages
 */
export const sendMessage = async (
  conversationId: number,
  content?: string,
  type: "text" | "image" | "video" | "file" = "text",
  fileUrl?: string,
  replyToId?: number
): Promise<Message> => {
  try {
    const response = await axiosClient.post(
      `/conversations/${conversationId}/messages`,
      {
        content,
        type,
        fileUrl,
        replyToId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    throw error;
  }
};

/**
 * Thêm thành viên vào cuộc trò chuyện nhóm
 * Endpoint: POST /conversations/:conversationId/members
 */
export const addConversationMember = async (
  conversationId: number,
  userId: number
): Promise<ConversationMember> => {
  try {
    const response = await axiosClient.post(
      `/conversations/${conversationId}/members`,
      {
        userId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm thành viên:", error);
    throw error;
  }
};

/**
 * Xóa thành viên khỏi cuộc trò chuyện nhóm
 * Endpoint: DELETE /conversations/:conversationId/members/:userId
 */
export const removeConversationMember = async (
  conversationId: number,
  userId: number
): Promise<{ message: string }> => {
  try {
    const response = await axiosClient.delete(
      `/conversations/${conversationId}/members/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa thành viên:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin cuộc trò chuyện
 * Endpoint: PUT /conversations/:conversationId
 */
export const updateConversation = async (
  conversationId: number,
  name?: string
): Promise<Conversation> => {
  try {
    const response = await axiosClient.put(`/conversations/${conversationId}`, {
      name,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật cuộc trò chuyện:", error);
    throw error;
  }
};

export const createPrivateConversationWithUser = async (
  userId: number
): Promise<{ conversationId: number; message: string }> => {
  try {
    const response = await axiosClient.post(`/conversations/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo cuộc trò chuyện riêng tư:", error);
    throw error;
  }
};
