const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { sequelize, User } = require("./models");
const { API_PREFIX } = require("./configs/constants");
const { authenticateToken } = require("./middlewares/authentication");
const seedDatabase = require("./utils/seeder");

const dotenv = require("dotenv");
const { Server } = require("socket.io");

const chatEvents = require("./sockets/chatEvents");

dotenv.config();

const app = express();
const server = http.createServer(app);

// ==========================================================
// CẤU HÌNH SOCKET.IO
// ==========================================================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://192.168.1.12:3000",
      "exp://192.168.1.12:8081",
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

  if (!token) {
    return next(new Error("Authentication error: Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 1. Kiểm tra User tồn tại
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

// Khởi tạo các sự kiện chat sau khi xác thực
chatEvents(io);

// ==========================================================
// CẤU HÌNH EXPRESS MIDDLEWARE
// ==========================================================
app.set("trust proxy", true);

// Middleware CORS cho Express
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.1.12:3000"],
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

// Danh sách các route yêu cầu xác thực và không yêu cầu xác thực
const protectedRoutes = [
  // 'favorites', // Yêu thích
  // 'history', // Lịch sử nghe nhạc
  "notifications", // Thông báo
  "playlists", // Playlist cá nhân
  "comments", // Comment (cần đăng nhập mới comment được)
  // 'genres', // Xem thể loại nhạc
  // 'artists', // Xem thông tin nghệ sĩ
  // 'albums', // Xem album
  // 'search', // Tìm kiếm công khai
  // 'recommend', // Gợi ý (có thể cá nhân hóa nếu đăng nhập)
  "conversations",
  "upload", // Upload hình ảnh, file
  "music",
  // 'genres',    // Xem thể loại nhạc
  // 'track',        // Xem bài hát (public), upload bài hát (private)
  // 'recommend',    // Gợi ý (có thể cá nhân hóa nếu đăng nhập)
];
// const protectedRoutes = ['albums', 'songs', 'playlists', 'genres', 'follows', 'notifications', 'recommendations', 'history', 'downloads', 'conversations'];
const publicRoutes = ["auth", "users", "posts"]; // posts được xử lý riêng

// 1. Xử lý các route yêu cầu authentication bắt buộc
// Setup public routes
publicRoutes.forEach((route) => {
  app.use(`${API_PREFIX}/${route}`, require(`./routes/${route}Route`));
});

// 2. TẠO NGOẠI LỆ CHO GET /posts (LOAD FEED CÔNG KHAI)
// Dòng này đảm bảo chỉ request GET /posts được xử lý mà không cần Token
app.get(`${API_PREFIX}/posts`, require("./routes/postsRoute"));

// 3. Setup protected routes với authentication bắt buộc
protectedRoutes.forEach((route) => {
  // Các route này cần authenticateToken toàn cục
  app.use(
    `${API_PREFIX}/${route}`,
    authenticateToken,
    require(`./routes/${route}Route`)
  );
});

// 2. Xử lý các route public/ đặc biệt
publicRoutes.forEach((route) => {
  // Posts cần xử lý đặc biệt vì nó chứa cả public (GET /) và private (POST, PUT, DELETE, GET /mine)
  // Chúng ta sẽ gọi router trực tiếp mà không có middleware toàn cục nào
  app.use(`${API_PREFIX}/${route}`, require(`./routes/${route}Route`));
});

// Start server
async function startServer() {
  try {
    // Đồng bộ cơ sở dữ liệu (tạo bảng nếu chưa có, cập nhật cấu trúc)
    //await sequelize.sync({ alter: true });
    // await sequelize.sync();
    // console.log("✅ Database synchronized successfully");
    // await seedDatabase();

    server.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (e) {
    console.error("❌ Server startup error:", e.message);
    process.exit(1);
  }
}

// Gọi hàm khởi động server
startServer();
