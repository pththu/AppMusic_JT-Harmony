import axiosClient from "@/lib/axiosClient";

// === INTERFACES ===
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
  Sender?: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  replyTo?: Message;
  isHidden?: boolean;
}

// === API FUNCTIONS ===

/**
 * Lấy tin nhắn của cuộc trò chuyện
 * Endpoint: GET /conversations/:conversationId/messages
 */
export const fetchMessages = async (
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
    console.error("Lỗi khi tải tin nhắn:", error);
    throw error;
  }
};

/**
 * ADMIN: Lấy toàn bộ tin nhắn (tùy chọn lọc theo conversationId)
 * Endpoint: GET /conversations/messages?limit&offset&conversationId
 */
export const fetchAllMessages = async (
  limit = 50,
  offset = 0,
  conversationId?: number,
  senderId?: number,
  type?: "text" | "image" | "video" | "file" | "system",
  dateFrom?: string,
  dateTo?: string
): Promise<Message[]> => {
  try {
    const response = await axiosClient.get(`/conversations/messages`, {
      params: {
        limit,
        offset,
        ...(conversationId ? { conversationId } : {}),
        ...(senderId ? { senderId } : {}),
        ...(type ? { type } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải tất cả tin nhắn (admin):", error);
    throw error;
  }
};

/**
 * Gửi tin nhắn mới
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
 * Chỉnh sửa tin nhắn
 * Endpoint: PUT /conversations/messages/:messageId
 */
export const editMessage = async (
  messageId: number,
  content: string
): Promise<Message> => {
  try {
    const response = await axiosClient.put(
      `/conversations/messages/${messageId}`,
      {
        content,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi chỉnh sửa tin nhắn:", error);
    throw error;
  }
};

/**
 * Lấy chi tiết tin nhắn theo ID
 * Endpoint: GET /conversations/messages/:messageId
 */
export const fetchMessageById = async (messageId: number): Promise<Message> => {
  try {
    const response = await axiosClient.get(
      `/conversations/messages/${messageId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải chi tiết tin nhắn:", error);
    throw error;
  }
};

/**
 * Upload file cho tin nhắn
 * Endpoint: POST /upload/message-file
 */
export const uploadMessageFile = async (
  file: File
): Promise<{ fileUrl: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post("/upload/message-file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi upload file:", error);
    throw error;
  }
};
