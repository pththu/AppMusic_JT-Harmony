// socket_server.js
const initializeSocketIO = require("./configs/socket");
const registerChatEvents = require("./services/chatService");
const { registerNotificationEvents } = require("./services/notificationService");

/**
 * Khởi tạo Socket.IO server với tất cả event handlers
 * @param {http.Server} server - HTTP Server instance
 * @returns {import('socket.io').Server} - Socket.IO Server instance
 */
module.exports = (server) => {
  // 1. Khởi tạo Socket.IO với cấu hình và middleware
  const io = initializeSocketIO(server);

  // 2. Đăng ký các event handlers
  registerChatEvents(io);
  registerNotificationEvents(io);

  // 3. Log khi hoàn tất setup
  console.log("✅ All Socket.IO event handlers registered");

  return io;
};