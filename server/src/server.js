const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const { API_PREFIX } = require("./configs/constants");
const { authenticateToken } = require("./middlewares/authentication");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.set("trust proxy", true);

// Middleware
app.use(
    cors({
        origin: ["http://localhost:3000", "http://192.168.1.30:3000"], // Thêm địa chỉ IP của bạn
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

const setupRoutes = () => {
    // PUBLIC ROUTES
    const publicRoutes = [
        "auth", // Login/register
        "roles", // Admin routes
        "users", // Quản lý profile user
    ];

    // PROTECTED ROUTES - Bắt buộc phải đăng nhập
    // Đã hợp nhất từ hai định nghĩa protectedRoutes bị xung đột.
    const protectedRoutes = [
        "users", // Quản lý profile user (từ stash)
        "favorites", // Yêu thích
        "follows", // Theo dõi
        "history", // Lịch sử nghe nhạc
        "notifications", // Thông báo
        "playlists", // Playlist cá nhân
        "posts", // Đăng bài
        "comments", // Comment (cần đăng nhập mới comment được)
        "genres", // Xem thể loại nhạc
        "artists", // Xem thông tin nghệ sĩ
        "albums", // Xem album
        "search", // Tìm kiếm công khai
        "songs", // Xem bài hát (public), upload bài hát (private)
        "recommend", // Gợi ý (có thể cá nhân hóa nếu đăng nhập)
        "albumSongs", // Từ stash
        "auth", // Login/register (từ upstream - nếu cần bảo vệ một số route auth)
        "roles", // Admin routes (từ upstream - nếu cần bảo vệ một số route roles)
    ];

    // Setup public routes
    publicRoutes.forEach((route) => {
        app.use(`${API_PREFIX}/${route}`, require(`./routes/${route}Route`));
    });

    // Setup protected routes với authentication bắt buộc
    protectedRoutes.forEach((route) => {
        app.use(
            `${API_PREFIX}/${route}`,
            authenticateToken,
            require(`./routes/${route}Route`)
        );
    });
};

setupRoutes();

// Start server
async function startServer() {
    try {
        await sequelize.sync();
        console.log("✅ Database synchronized successfully");
        server.listen(process.env.PORT || 8000, () => {
            // Đã sửa PORT thành 8000 để khớp với console.log
            console.log(
                `🎶 Music Server is running at http://192.168.1.30:${
          process.env.PORT || 8000
        }`
            );
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
    }
}

startServer();