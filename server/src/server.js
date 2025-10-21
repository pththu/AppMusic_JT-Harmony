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
const seedDatabase = require('./utils/seeder');

const dotenv = require("dotenv");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.set("trust proxy", true);

// Middleware CORS - Giữ lại 1 khối cors để tránh trùng lặp và xung đột
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

// --- KHAI BÁO ROUTES Ở PHẠM VI TOÀN CỤC ---

// PUBLIC ROUTES - Các route KHÔNG cần đăng nhập
const publicRoutes = [
    'auth', // Login/register
    'roles', // Admin routes (chỉ các route xem thông tin)
    'users', // Quản lý profile user (chỉ các route xem thông tin)
    'posts'

];

// PROTECTED ROUTES - Bắt buộc phải đăng nhập
const protectedRoutes = [
    // 'favorites', // Yêu thích
    'follows', // Theo dõi
    // 'history', // Lịch sử nghe nhạc
    'notifications', // Thông báo
    // 'playlists',     // Playlist cá nhân
    'posts',         // Đăng bài
    'comments',       // Comment (cần đăng nhập mới comment được)
    // 'genres',    // Xem thể loại nhạc
    // 'artists',   // Xem thông tin nghệ sĩ
    // 'albums',    // Xem album
    // 'search',     // Tìm kiếm công khai
    // 'track',        // Xem bài hát (public), upload bài hát (private)
    // 'recommend',    // Gợi ý (có thể cá nhân hóa nếu đăng nhập)
    // 'albumSongs',
    'upload',        // Upload hình ảnh, file
    'music'          // Các route liên quan đến Spotify và YouTube
]

// Setup public routes
publicRoutes.forEach(route => {
    app.use(`${API_PREFIX}/${route}`, require(`./routes/${route}Route`))
})

// 2. TẠO NGOẠI LỆ CHO GET /posts (LOAD FEED CÔNG KHAI)
// Dòng này đảm bảo chỉ request GET /posts được xử lý mà không cần Token
app.get(`${API_PREFIX}/posts`, require('./routes/postsRoute'));

// 3. Setup protected routes với authentication bắt buộc
protectedRoutes.forEach(route => {
    // Vì 'posts' nằm trong protectedRoutes, nên POST/PUT/DELETE /posts vẫn được bảo vệ
    app.use(`${API_PREFIX}/${route}`, authenticateToken, require(`./routes/${route}Route`))
})

// Start server
async function startServer() {
    try {

        // await sequelize.sync()
        // console.log('✅ Database synchronized successfully')

        // await seedDatabase();

        server.listen(process.env.PORT || 8000, () => {
            console.log(`🎶 Music Server is running at http://localhost:${process.env.PORT || 8000}`)
        })

    } catch (error) {
        console.error('❌ Error starting server:', error)
    }
}

startServer();