// services/UnifiedSocketService.ts
import { ENV } from "@/config/env";
import useAuthStore from "@/store/authStore";
import { io, Socket } from "socket.io-client";

type SocketEventCallback = (...args: any[]) => void;

interface SocketListeners {
  [event: string]: Set<SocketEventCallback>;
}

// Private state variables
let socket: Socket | null = null;
let isConnecting: boolean = false;
let reconnectAttempts: number = 0;
const maxReconnectAttempts: number = 5;
const listeners: SocketListeners = {};
const joinedRooms: Set<string> = new Set();

let cachedOnlineUsers: number[] = [];

/**
 * Setup các listeners cơ bản
 */
const setupCoreListeners = (): void => {
  if (!socket) return;

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
    reconnectAttempts = 0;
    rejoinRooms();
    emit("socket:connected", { socketId: socket?.id });
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
    emit("socket:disconnected", { reason });

    if (reason === "io server disconnect") {
      socket?.connect();
    }
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Connection error:", error.message);
    reconnectAttempts++;

    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error("❌ Max reconnect attempts reached");
      emit("socket:max_reconnect_reached");
    }
  });

  // User presence events
  socket.on("users:list", (users: number[]) => {
    cachedOnlineUsers = users; // Lưu vào cache
    emit("users:list", users); // Bắn ra cho hook
  });

  // 2. CẬP NHẬT CACHE KHI CÓ NGƯỜI MỚI ONLINE
  socket.on("user:online", (data: { userId: number }) => {
    if (!cachedOnlineUsers.includes(data.userId)) {
      cachedOnlineUsers = [...cachedOnlineUsers, data.userId];
    }
    emit("user:online", data);
  });

  // 3. CẬP NHẬT CACHE KHI CÓ NGƯỜI OFFLINE
  socket.on("user:offline", (data: { userId: number }) => {
    cachedOnlineUsers = cachedOnlineUsers.filter(id => id !== data.userId);
    emit("user:offline", data);
  });

  // Chat events
  socket.on("chat:new_message", (message) => emit("chat:new_message", message));
  socket.on("chat:user_typing", (data) => emit("chat:user_typing", data));
  socket.on("chat:messages_read", (data) => emit("chat:messages_read", data));
  socket.on("chat:message_deleted", (data) => emit("chat:message_deleted", data));
  socket.on("chat:user_joined", (data) => emit("chat:user_joined", data));
  socket.on("chat:user_left", (data) => emit("chat:user_left", data));

  // Notification events
  socket.on("notification:new", (notification) => emit("notification:new", notification));

  // Comment events
  socket.on("comment:new", (data) => emit("comment:new", data));
};

/**
 * Rejoin tất cả rooms khi reconnect
 */
const rejoinRooms = (): void => {
  if (!socket?.connected) return;

  joinedRooms.forEach((room) => {
    if (room.startsWith("conversation_")) {
      const convId = parseInt(room.replace("conversation_", ""));
      joinConversation(convId);
    } else if (room.startsWith("post_")) {
      const postId = parseInt(room.replace("post_", ""));
      joinPost(postId);
    }
  });
};

/**
 * Emit to local listeners (internal use)
 */
export const emit = (event: string, data?: any): void => {
  if (listeners[event]) {
    listeners[event].forEach((callback) => callback(data));
  }
};

/**
 * Khởi tạo và kết nối socket
 */
export const connect = async (): Promise<Socket | null> => {
  if (socket?.connected) {
    // console.log("✅ Socket already connected");
    return socket;
  }

  if (isConnecting) {
    console.log("⏳ Socket connection in progress...");
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isConnecting) {
          clearInterval(checkInterval);
          resolve(socket);
        }
      }, 100);
    });
  }

  isConnecting = true;

  try {
    const token = useAuthStore.getState().token;

    if (!token) {
      console.warn("❌ No auth token found");
      isConnecting = false;
      return null;
    }

    socket = io(ENV.SOCKET_SERVER_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    setupCoreListeners();
    isConnecting = false;

    console.log("🔌 Socket connecting...");
    return socket;
  } catch (error) {
    console.error("❌ Socket connection failed:", error);
    isConnecting = false;
    return null;
  }
};

/**
 * Ngắt kết nối
 */
export const disconnect = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    Object.keys(listeners).forEach((key) => delete listeners[key]);
    joinedRooms.clear();
    console.log("🔌 Socket disconnected manually");
  }
};

// ==================== CHAT METHODS ====================

/**
 * Join conversation room
 */
export const joinConversation = async (conversationId: number) => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Socket not connected"));
      return;
    }

    const roomName = `conversation_${conversationId}`;
    joinedRooms.add(roomName);

    socket.emit("chat:join_conversation", conversationId, (response: any) => {
      if (response?.status === "ok") {
        console.log(`✅ Joined conversation ${conversationId}`);
        resolve(response);
      } else {
        console.error(`❌ Failed to join conversation ${conversationId}`, response);
        reject(response);
      }
    });
  });
};

/**
 * Leave conversation room
 */
export const leaveConversation = async (conversationId: number) => {
  if (!socket?.connected) return;

  const roomName = `conversation_${conversationId}`;
  joinedRooms.delete(roomName);
  socket.emit("chat:leave_conversation", conversationId);
  console.log(`👋 Left conversation ${conversationId}`);
};

/**
 * Send message (BROADCAST ONLY - message đã được lưu DB)
 */
export const sendMessage = async (data: {
  conversationId: number;
  messageData: any;
}) => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Socket not connected"));
      return;
    }

    socket.emit("chat:send_message", data, (response: any) => {
      if (response?.status === "ok") {
        console.log(`✅ Message broadcasted to conversation ${data.conversationId}`);
        resolve(response);
      } else {
        console.error("❌ Failed to broadcast message:", response);
        reject(response);
      }
    });
  });
};

/**
 * Start typing indicator
 */
export const startTyping = (conversationId: number): void => {
  if (socket?.connected) {
    socket.emit("chat:typing_start", conversationId);
  }
};

/**
 * Stop typing indicator
 */
export const stopTyping = (conversationId: number): void => {
  if (socket?.connected) {
    socket.emit("chat:typing_stop", conversationId);
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = (data: {
  conversationId: number;
  lastMessageId: number;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Socket not connected"));
      return;
    }

    socket.emit("chat:mark_read", data, (response: any) => {
      if (response?.status === "ok") {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

/**
 * Delete message (broadcast deletion event)
 */
export const deleteMessage = (data: {
  messageId: number;
  conversationId: number;
  senderId: number;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Socket not connected"));
      return;
    }

    socket.emit("chat:delete_message", data, (response: any) => {
      if (response?.status === "ok") {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

// ==================== NOTIFICATION METHODS ====================

/**
 * Join post room (for real-time comments)
 */
export const joinPost = (postId: number): void => {
  if (!socket?.connected) return;

  const roomName = `post_${postId}`;
  joinedRooms.add(roomName);
  socket.emit("notification:join_post", postId);
  console.log(`✅ Joined post ${postId}`);
};

/**
 * Leave post room
 */
export const leavePost = (postId: number): void => {
  if (!socket?.connected) return;

  const roomName = `post_${postId}`;
  joinedRooms.delete(roomName);
  socket.emit("notification:leave_post", postId);
  console.log(`👋 Left post ${postId}`);
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = (notificationId): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Socket not connected"));
      return;
    }

    socket.emit("notification:mark_read", notificationId, (response: any) => {
      if (response?.status === "ok") {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error("Socket not connected"));
      return;
    }

    socket.emit("notification:mark_all_read", {}, (response: any) => {
      if (response?.status === "ok") {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
};

// ==================== EVENT MANAGEMENT ====================

/**
 * Subscribe to an event
 */
export const on = (event: string, callback: SocketEventCallback) => {
  if (!listeners[event]) {
    listeners[event] = new Set();
  }

  listeners[event].add(callback);

  return () => {
    off(event, callback);
  };
};

/**
 * Unsubscribe from an event
 */
export const off = (event: string, callback: SocketEventCallback) => {
  if (listeners[event]) {
    listeners[event].delete(callback);
  }
};

/**
 * Get connection status
 */
export const isConnected = (): boolean => {
  return socket?.connected || false;
};

/**
 * Get socket ID
 */
export const getSocketId = (): string | undefined => {
  return socket?.id;
};

export const getOnlineUsers = (): number[] => {
  return cachedOnlineUsers;
};

export const getNotifications = (
  options: { limit?: number; offset?: number } = {},
  callback: (response: { notifications: any[] } | { error: string }) => void
): void => {
  if (!socket?.connected) {
    callback({ error: 'Socket not connected' });
    return;
  }

  const { limit = 20, offset = 0 } = options;
  socket.emit('get_notifications', { limit, offset }, callback);
};

const UnifiedSocketService = {
  connect,
  disconnect,
  joinConversation,
  leaveConversation,
  sendMessage,
  startTyping,
  stopTyping,
  markMessagesAsRead,
  deleteMessage,
  joinPost,
  leavePost,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  on,
  off,
  emit,
  isConnected,
  getSocketId,
  getOnlineUsers,
  getNotifications,
};

export default UnifiedSocketService;