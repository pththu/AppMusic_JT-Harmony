const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const coverController = require("../controllers/coverController");
const {
  authenticateToken,
  optionalAuthenticateToken,
} = require("../middlewares/authentication");

// --- ROUTE CÔNG KHAI ---
router.get("/", optionalAuthenticateToken, postController.getAllPost); // Lấy tất cả bài đăng (public)
router.get("/:id", postController.getPostById); // Lấy bài đăng theo ID (public)
router.get("/user/:userId", postController.getPostsByUserId); // Lấy bài đăng theo User ID (public)

// --- ROUTE COVER ---
router.get("/covers/song/:songId", coverController.getCoversBySongId); // Lấy covers theo song ID
router.get("/covers/top", coverController.getTopCovers); // Lấy top covers
router.get("/covers/user/:userId", coverController.getCoversByUserId); // Lấy covers theo user ID
router.post("/:id/vote", authenticateToken, coverController.voteCover); // Vote cho cover

// --- ROUTE YÊU CẦU LOGIN ---
router.get(
  "/byUser/:userId",
  authenticateToken,
  postController.getPostsByUserId
); // Lấy bài đăng theo User ID
router.get("/mine", authenticateToken, postController.getPostsByMe); // Lấy bài đăng của chính mình
router.post("/", authenticateToken, postController.createPost); // Tạo bài đăng mới
router.post("/:id/like", authenticateToken, postController.toggleLike); // Thích/ bỏ thích bài đăng
router.get("/:id/likes", authenticateToken, postController.getLikesByPostId); // Lấy danh sách người đã thích bài đăng
router.put("/update/:id", authenticateToken, postController.updatePost); // Cập nhật bài đăng
router.delete("/remove/:id", authenticateToken, postController.deletePost); // Xóa bài đăng
router.post("/:id/report", authenticateToken, postController.reportPost); // Báo cáo bài đăng
router.post("/:id/hide", authenticateToken, postController.hidePost); // Ẩn bài đăng

module.exports = router;
