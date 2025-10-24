const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, optionalAuthenticateToken } = require('../middlewares/authentication');

// --- ROUTE CÔNG KHAI ---
router.get('/', optionalAuthenticateToken, postController.getAllPost); // Lấy tất cả bài đăng (public)
router.get('/:id', postController.getPostById); // Lấy bài đăng theo ID (public)
router.get('/user/:userId', postController.getPostsByUserId); // Lấy bài đăng theo User ID (public)
// ✅ ROUTE MỚI: Lấy bài đăng theo User ID
router.get('/byUser/:userId', authenticateToken, postController.getPostsByUserId);

// --- ROUTE YÊU CẦU LOGIN ---
// Chuyển /mine lên trước /user/:userId để đảm bảo hoạt động
router.get('/mine', authenticateToken, postController.getPostsByMe);
router.post('/', authenticateToken, postController.createPost);
router.post('/:id/like', authenticateToken, postController.toggleLike);
router.put('/update/:id', authenticateToken, postController.updatePost);
router.delete('/remove/:id', authenticateToken, postController.deletePost);

module.exports = router;