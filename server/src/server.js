const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { sequelize, User } = require("./models");
const { API_PREFIX } = require("./configs/constants");
const { authenticateToken, authorizeRole } = require("./middlewares/authentication");
const seedDatabase = require("./utils/seeder");
const { connectRedis } = require('./configs/redis');

const dotenv = require("dotenv");
const { Server } = require("socket.io");

const chatEvents = require("./sockets/chatEvents");
const notificationEvents = require("./sockets/notificationEvents");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ==========================================================
// CẤU HÌNH SOCKET.IO
// ==========================================================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001",
      "http://192.168.32.101:3000",
      "exp://192.168.32.101:8081",
      "http://192.168.32.101:3000",
      "exp://192.168.32.101:8081",
      "exp://192.168.1.12:8081",
      "exp://192.168.1.14:8081",
      "exp://10.172.55.251:8081",
      "http://192.168.1.22:3000",
      "exp://192.168.1.22:8081",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 60000,
  transports: ["websocket", "polling"],
});

// Middleware xác thực JWT cho Socket.IO
io.use(async (socket, next) => {
  // Lấy token từ handshake query (hoặc header, tùy cách client gửi)
  const token = socket.handshake.auth.token;
  console.log('token', token)

  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);
    console.log('user', user)
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

app.set("trust proxy", true);
app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://192.168.32.101:3000",
      "http://192.168.1.22:3000",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use("/static", express.static(path.join(__dirname, "public")));
app.use(
  `${API_PREFIX}/uploads/avatars`,
  express.static(path.join(__dirname, "uploads", "avatars"))
);

// --- KHAI BÁO ROUTES Ở PHẠM VI TOÀN CỤC ---
const protectedRoutes = [
  'notifications', // Thông báo
  'genres', // Xem thể loại nhạc
  'artists', // Xem thông tin nghệ sĩ
  'albums', // Xem album
  "conversations",
  "upload", // Upload hình ảnh, file
  "tracks", // Xem bài hát (public), upload bài hát (private)
];
const publicRoutes = [
  "auth",
  "users",
  "posts",
  'follows', // Theo dõi người dùng, nghệ sĩ
  "music",
  "comments",
  'favorites', // Yêu thích
  'histories', // Lịch sử nghe nhạc
  'playlists', // Playlist cá nhân
  "recommendations",
];

// 1. Xử lý các route yêu cầu authentication bắt buộc
publicRoutes.forEach((route) => {
  app.use(`${API_PREFIX}/${route}`, require(`./routes/${route}Route`));
});

protectedRoutes.forEach((route) => {
  app.use(
    `${API_PREFIX}/${route}`,
    authenticateToken,
    require(`./routes/${route}Route`)
  );
});

// // 2. Xử lý các route public/ đặc biệt
// publicRoutes.forEach((route) => {
//   app.use(`${API_PREFIX}/${route}`, require(`./routes/${route}Route`));
// });

app.use(
  `${API_PREFIX}/admin/metrics`,
  authenticateToken,
  authorizeRole,
  require('./routes/adminMetricsRoute')
);

// Start server
async function startServer() {
  try {
    // Đồng bộ cơ sở dữ liệu (tạo bảng nếu chưa có, cập nhật cấu trúc)
    // await sequelize.sync({ alter: true });
    // await sequelize.sync();
    // console.log('✅ Database synchronized successfully')
    // await seedDatabase();

    await connectRedis();

    server.listen(process.env.PORT || 3001, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT || 3001}`);
    });
  } catch (e) {
    console.error("❌ Server startup error:", e.message);
    process.exit(1);
  }
}

startServer();
