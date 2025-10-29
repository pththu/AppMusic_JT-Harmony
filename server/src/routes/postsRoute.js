const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, optionalAuthenticateToken } = require('../middlewares/authentication');

// --- ROUTE CÔNG KHAI ---
router.get('/', optionalAuthenticateToken, postController.getAllPost); // Lấy tất cả bài đăng (public)
router.get('/:id', postController.getPostById); // Lấy bài đăng theo ID (public)
router.get('/user/:userId', postController.getPostsByUserId); // Lấy bài đăng theo User ID (public)


// --- ROUTE YÊU CẦU LOGIN ---
router.get('/byUser/:userId', authenticateToken, postController.getPostsByUserId); // Lấy bài đăng theo User ID
router.get('/mine', authenticateToken, postController.getPostsByMe); // Lấy bài đăng của chính mình
router.post('/', authenticateToken, postController.createPost); // Tạo bài đăng mới
router.post('/:id/like', authenticateToken, postController.toggleLike); // Thích/ bỏ thích bài đăng
router.get('/:id/likes', authenticateToken, postController.getLikesByPostId); // Lấy danh sách người đã thích bài đăng
router.put('/update/:id', authenticateToken, postController.updatePost); // Cập nhật bài đăng
router.delete('/remove/:id', authenticateToken, postController.deletePost); // Xóa bài đăng
router.post('/:id/report', authenticateToken, postController.reportPost); // Báo cáo bài đăng

module.exports = router;