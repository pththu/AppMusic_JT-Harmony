// src/services/notificationService.js

/**
 * Đăng ký các event handlers cho notification (Client -> Server)
 */
const registerNotificationEvents = (io) => {  
  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Join Post Room (cho comment real-time)
    socket.on("notification:join_post", (postId) => {
      const roomName = `post_${postId}`;
      socket.join(roomName);
    });

    socket.on("notification:leave_post", (postId) => {
      const roomName = `post_${postId}`;
      socket.leave(roomName);
    });
  });
}

const emitNewNotification = (userId, notificationData) => {
  const io = global.io;
  if (!io) return;

  io.to(`user_${userId}`).emit("notification:new", notificationData);
  console.log(`🔔 Emitted notification:new to user_${userId}`);
}

/**
 * [Server -> Client] Bắn sự kiện comment mới vào phòng Post
 */
const emitNewComment = (postId, commentData) => {
  const io = global.io;
  if (!io) return;

  io.to(`post_${postId}`).emit("comment:new", {
    postId,
    comment: commentData,
  });
  console.log(`💬 Emitted comment:new to post_${postId}`);
}

module.exports = {
  registerNotificationEvents,
  emitNewNotification,
  emitNewComment,
};