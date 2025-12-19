// src/services/chatService.js
const { ConversationMember, User, Notification } = require("../models");
const notificationService = require("./notificationService");

const registerChatEvents = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // ==================== JOIN CONVERSATION ====================
    handleJoinConversation(socket, userId);

    // ==================== LEAVE CONVERSATION ====================
    handleLeaveConversation(socket, userId);

    // ==================== SEND MESSAGE ====================
    handleSendMessage(socket, io, userId);

    // ==================== TYPING INDICATOR ====================
    handleTypingIndicator(socket, userId);

    // ==================== MARK AS READ ====================
    handleMarkAsRead(socket, userId);

    // ==================== DELETE MESSAGE ====================
    handleDeleteMessage(socket, io, userId);
  });
};

/**
 * Handle join conversation
 */
const handleJoinConversation = (socket, userId) => {
  socket.on("chat:join_conversation", async (conversationId, callback) => {
    try {
      // Validate: Kiểm tra user có phải member không
      const member = await ConversationMember.findOne({
        where: {
          conversationId,
          userId,
          status: "active",
        },
      });

      if (!member) {
        if (callback) {
          callback({
            status: "error",
            message: "You are not a member of this conversation",
          });
        }
        return;
      }

      // Join room
      const roomName = `conversation_${conversationId}`;
      socket.join(roomName);

      console.log(`✅ User ${userId} joined conversation room: ${roomName}`);

      // Thông báo cho các members khác
      socket.to(roomName).emit("chat:user_joined", {
        userId,
        username: socket.user.username,
        conversationId,
      });

      if (callback) {
        callback({ status: "ok", conversationId });
      }
    } catch (error) {
      console.error("❌ Error joining conversation:", error);
      if (callback) {
        callback({ status: "error", message: error.message });
      }
    }
  });
};

/**
 * Handle leave conversation
 */
const handleLeaveConversation = (socket, userId) => {
  socket.on("chat:leave_conversation", (conversationId) => {
    const roomName = `conversation_${conversationId}`;
    socket.leave(roomName);

    console.log(`👋 User ${userId} left conversation room: ${roomName}`);

    // Thông báo cho các members khác
    socket.to(roomName).emit("chat:user_left", {
      userId,
      username: socket.user.username,
      conversationId,
    });
  });
};

/**
 * Handle send message
 * CHỈ XỬ LÝ BROADCAST, KHÔNG LƯU DB
 */
const handleSendMessage = (socket, io, userId) => {
  socket.on("chat:send_message", async (data, callback) => {
    const { conversationId, messageData } = data;

    // Validate input
    if (!conversationId || !messageData) {
      return callback?.({
        status: "error",
        message: "ConversationId and messageData are required",
      });
    }

    try {
      // Kiểm tra member status
      const member = await ConversationMember.findOne({
        where: {
          conversationId,
          userId,
          status: "active",
        },
      });

      if (!member) {
        return callback?.({
          status: "error",
          message: "You are not a member of this conversation",
        });
      }

      // Broadcast message đến tất cả members trong room
      const roomName = `conversation_${conversationId}`;
      io.to(roomName).emit("chat:new_message", messageData);

      console.log(`📤 Message broadcasted to room: ${roomName}`);

      // Gửi notification cho members khác
      // await broadcastMessageNotification(io, conversationId, userId, messageData);
      await createAndBroadcastMessageNotification(conversationId, userId, messageData);

      // Response về client
      callback?.({
        status: "ok",
        message: "Message broadcasted successfully",
      });
    } catch (error) {
      console.error("❌ Error broadcasting message:", error);
      callback?.({
        status: "error",
        message: "Failed to broadcast message",
      });
    }
  });
};

const createAndBroadcastMessageNotification = async (conversationId, senderId, messageData) => {
  try {
    // 1. Lấy danh sách người nhận (Members trừ sender)
    const members = await ConversationMember.findAll({
      where: { conversationId, status: "active" },
      attributes: ["userId"],
    });

    const sender = await User.findByPk(senderId, {
      attributes: ["id", "username", "fullName", "avatarUrl"],
    });

    const receivers = members.filter((m) => m.userId !== senderId);

    // 2. Tạo Notification cho từng người nhận
    for (const member of receivers) {
      // Lưu vào DB
      const notification = await Notification.create({
        userId: member.userId,
        actorId: senderId,
        type: "message",
        message: `${sender.fullName || sender.username} gửi bạn tin nhắn: ${messageData.content ? messageData.content.slice(0, 50) : "[Media]"}`,
        metadata: {
          conversationId,
          messageId: messageData.id,
          contentSnippet: messageData.content ? messageData.content.slice(0, 50) : "[Media]",
        },
        isRead: false,
      });

      // Format dữ liệu để trả về client (kèm thông tin Actor)
      const fullNotification = notification.toJSON();
      fullNotification.Actor = sender.toJSON();

      // 3. Gọi NotificationService để bắn Socket
      notificationService.emitNewNotification(member.userId, fullNotification);
    }
  } catch (error) {
    console.error("❌ Error creating message notifications:", error);
  }
};

/**
 * Handle typing indicator
 */
const handleTypingIndicator = (socket, userId) => {
  socket.on("chat:typing_start", (conversationId) => {
    const roomName = `conversation_${conversationId}`;

    socket.to(roomName).emit("chat:user_typing", {
      conversationId,
      userId,
      username: socket.user.username,
      isTyping: true,
    });
  });

  socket.on("chat:typing_stop", (conversationId) => {
    const roomName = `conversation_${conversationId}`;

    socket.to(roomName).emit("chat:user_typing", {
      conversationId,
      userId,
      username: socket.user.username,
      isTyping: false,
    });
  });
};

/**
 * Handle mark as read
 */
const handleMarkAsRead = (socket, userId) => {
  socket.on("chat:mark_read", async (data, callback) => {
    try {
      const { conversationId, lastMessageId } = data;

      if (!conversationId || !lastMessageId) {
        return callback?.({
          status: "error",
          message: "ConversationId and lastMessageId are required",
        });
      }

      // Thông báo cho các members khác
      socket.to(`conversation_${conversationId}`).emit("chat:messages_read", {
        userId,
        conversationId,
        lastMessageId,
      });

      callback?.({ status: "ok" });
    } catch (error) {
      console.error("❌ Error marking messages as read:", error);
      callback?.({ status: "error", message: error.message });
    }
  });
};

/**
 * Handle delete message
 */
const handleDeleteMessage = (socket, io, userId) => {
  socket.on("chat:delete_message", async (data, callback) => {
    const { messageId, conversationId, senderId } = data;

    try {
      // Kiểm tra quyền: Chỉ sender hoặc admin mới có quyền xóa
      if (senderId !== userId && socket.user.roleId !== 1) {
        return callback?.({
          status: "error",
          message: "You don't have permission to delete this message",
        });
      }

      // Broadcast đến room
      io.to(`conversation_${conversationId}`).emit("chat:message_deleted", {
        messageId,
        conversationId,
      });

      callback?.({ status: "ok" });
    } catch (error) {
      console.error("❌ Error broadcasting message deletion:", error);
      callback?.({ status: "error", message: error.message });
    }
  });
};


module.exports = registerChatEvents;