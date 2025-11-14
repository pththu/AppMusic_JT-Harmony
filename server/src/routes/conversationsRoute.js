// routes/conversationsRoute.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/conversationsController');
const { authenticateToken } = require('../middlewares/authentication');


router.get('/', authenticateToken, controller.getConversations); // Lấy danh sách các cuộc trò chuyện của người dùng hiện tại
router.get('/messages', authenticateToken, controller.getAllMessagesAdmin); // Admin: Lấy toàn bộ tin nhắn (phân trang)
router.post('/user/:userId', authenticateToken, controller.createOrGetPrivateConversation); // Tạo hoặc lấy cuộc trò chuyện riêng với 1 người dùng
router.get('/:conversationId/messages', authenticateToken, controller.getConversationMessages); //  Lấy lịch sử tin nhắn của 1 cuộc trò chuyện

router.delete('/messages/:messageId', authenticateToken, controller.deleteMessage); // Xóa tin nhắn
router.post('/messages/:messageId/hide', authenticateToken, controller.hideMessage); // Ẩn tin nhắn

router.delete('/:conversationId', authenticateToken, controller.deleteConversation); // Xóa cuộc trò chuyện (chỉ xóa bên phía người dùng hiện tại)

// router.post('/group', authenticateToken, controller.createGroupConversation); // Tạo cuộc trò chuyện Group

module.exports = router;