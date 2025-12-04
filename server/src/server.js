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

const initSocket = require("./socket_server");

dotenv.config();

const app = express();
const server = http.createServer(app);

initSocket(server);

app.set("trust proxy", true);
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.1.14:3001",
      "http://192.168.1.14:3000",
      "http://192.168.32.101:3000",
      "http://192.168.1.28:3000",
      'https://app-music-jt-harmony-web.vercel.app/',
      'https://app-music-jt-harmony.vercel.app/',
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
  "roles", // Quản lý vai trò người dùng
];
const publicRoutes = [
  'playlists', // Playlist cá nhân
  "auth",
  "users",
  "posts",
  'follows', // Theo dõi người dùng, nghệ sĩ
  "music",
  "comments",
  'favorites', // Yêu thích
  'histories', // Lịch sử nghe nhạc
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
    // console.log('✅ Database synchronized successfully')
    // await seedDatabase();
    await connectRedis();

    server.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (e) {
    console.error("❌ Server startup error:", e.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;