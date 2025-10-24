// routes/conversationsRoute.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/conversationsController');
const { authenticateToken } = require('../middlewares/authentication');

// 🔐 [GET] /api/v1/conversations: Lấy danh sách các cuộc trò chuyện của người dùng hiện tại
router.get('/', authenticateToken, controller.getConversations);

// 🔐 [POST] /api/v1/conversations/user/:userId: Tạo hoặc lấy Conversation Private với 1 người dùng khác
router.post('/user/:userId', authenticateToken, controller.createOrGetPrivateConversation);

// 🔐 [GET] /api/v1/conversations/:conversationId/messages: Lấy lịch sử tin nhắn của 1 cuộc trò chuyện
router.get('/:conversationId/messages', authenticateToken, controller.getConversationMessages);

// 🔐 [POST] /api/v1/conversations/group: Tạo Conversation Group
// router.post('/group', authenticateToken, controller.createGroupConversation); // Logic này sẽ phức tạp hơn, để lại sau

module.exports = router;