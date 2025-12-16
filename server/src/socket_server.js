const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { User } = require("./models"); // Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn
const chatEvents = require("./sockets/chatEvents");
const notificationEvents = require("./sockets/notificationEvents");
require("dotenv").config();

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = [
          "http://localhost:3000",      // Local Web
          "http://localhost:3001",      // Local Web 2
          "http://192.168.32.101:3000",
          "exp://192.168.32.101:8081",
          "http://192.168.32.101:3000",
          "exp://192.168.32.101:8081",
          "exp://192.168.1.28:8081",
          "exp://192.168.1.14:8081",
          "exp://192.168.1.28:8081",
          "http://192.168.1.14:3000",
          "exp://10.172.55.251:8081",
          "http://192.168.1.28:3000",
          "exp://192.168.1.28:8081",
          'https://admin-jt-harmony.vercel.app',
          'https://jt-harmony.vercel.app',                   // Domain Vercel (Production)
        ];

        // 1. Cho phép các origin trong danh sách whitelist
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // 2. QUAN TRỌNG: Cho phép Mobile App (thường không gửi Origin hoặc gửi null/undefined)
        // Nếu bạn muốn bảo mật tuyệt đối, hãy bỏ dòng này, nhưng mobile có thể bị chặn.
        if (!origin) {
          return callback(null, true);
        }

        // 3. Chặn các origin lạ
        console.log("Blocked origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
    transports: ["websocket", "polling"],
  });
  // const io = new Server(server, {
  //   cors: {
  //     origin: [
  //       "http://localhost:3000",
  //       "http://localhost:3001",
  //       "http://192.168.32.101:3000",
  //       "exp://192.168.32.101:8081",
  //       "http://192.168.32.101:3000",
  //       "exp://192.168.32.101:8081",
  //       "exp://192.168.1.28:8081",
  //       "exp://192.168.1.28:8081",
  //       "exp://10.172.55.251:8081",
  //       "http://192.168.1.28:3000",
  //       "exp://192.168.1.28:8081",
  //     ],
  //     methods: ["GET", "POST"],
  //     credentials: true,
  //   },
  //   pingInterval: 25000,
  //   pingTimeout: 60000,
  //   transports: ["websocket", "polling"],
  // });

  // Middleware xác thực JWT cho Socket.IO
  io.use(async (socket, next) => {
    // Lấy token từ handshake query (hoặc header, tùy cách client gửi)
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: Token not provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // 2. Gắn thông tin User vào socket để sử dụng trong các sự kiện chat
      socket.user = user;

      console.log(
        ` Socket ID: ${socket.id} - User ID: ${user.id} authenticated.`
      );
      next();
    } catch (error) {
      console.error("❌ Socket Auth Error:", error.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  chatEvents(io);
  notificationEvents(io);

  return io;
};