// src/config/socket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // ... (Giữ nguyên cấu hình CORS của bạn)
        const allowedOrigins = [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://192.168.1.13:3000",
          "http://192.168.1.28:3000",
          "http://192.168.32.101:3000",
          "exp://192.168.1.28:8081",
          "exp://192.168.32.101:8081",
          "exp://10.172.55.251:8081",
          "https://admin-jt-harmony.vercel.app",
          "https://jt-harmony.vercel.app",
          "https://appmusic-jt-harmony-087.onrender.com:443",
        ];
        if (allowedOrigins.includes(origin) || !origin) {
          return callback(null, true);
        }
        console.log("❌ Blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
    transports: ["websocket", "polling"],
  });

  // Middleware xác thực JWT (Giữ nguyên)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error: Token not provided"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "username", "fullName", "avatarUrl", "roleId"],
      });

      if (!user) return next(new Error("Authentication error: User not found"));

      socket.user = user.toJSON();
      console.log(`✅ Socket authenticated - User: ${user.username} (ID: ${user.id})`);
      next();
    } catch (error) {
      console.error("❌ Socket Auth Error:", error.message);
      return next(new Error("Authentication error"));
    }
  });

  // --- Helper lấy danh sách User Online ---
  const getOnlineUserIds = () => {
    const onlineIds = new Set();
    // Duyệt qua tất cả socket đang kết nối
    for (const [_, socket] of io.of("/").sockets) {
      if (socket.user && socket.user.id) {
        onlineIds.add(socket.user.id);
      }
    }
    return Array.from(onlineIds);
  };

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    const personalRoom = `user_${userId}`;

    // 1. Join room cá nhân
    socket.join(personalRoom);
    console.log(`✅ User ${userId} joined personal room: ${personalRoom}`);

    // 2. [MỚI] Gửi danh sách user đang online cho người vừa kết nối
    const onlineUsers = getOnlineUserIds();
    console.log('onlineUsers', onlineUsers)
    socket.emit("users:list", onlineUsers);

    // 3. Broadcast cho những người KHÁC biết user này vừa online
    socket.broadcast.emit("user:online", {
      userId,
      username: socket.user.username,
      fullName: socket.user.fullName,
      avatarUrl: socket.user.avatarUrl,
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ User ${userId} disconnected. Reason: ${reason}`);
      // Broadcast user offline
      socket.broadcast.emit("user:offline", { userId });
    });

    socket.on("error", (error) => {
      console.error(`❌ Socket error for user ${userId}:`, error);
    });
  });

  global.io = io;
  console.log("✅ Socket.IO server initialized");
  return io;
};

module.exports = initializeSocketIO;