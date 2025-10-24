const { Conversation, Message, User, ConversationMember, sequelize } = require('../models');
const Sequelize = require('sequelize'); // Import module gốc
const Op = Sequelize.Op; // Lấy toán tử Op từ module gốc

// ==========================================================
// 1. LẤY DANH SÁCH CONVERSATIONS CỦA USER HIỆN TẠI
// [GET] /api/v1/conversations
// ==========================================================
exports.getConversations = async(req, res) => {
    const currentUserId = req.user.id;

    try {
        const conversations = await Conversation.findAll({
            // Tìm Conversation mà người dùng là thành viên
            include: [{
                model: ConversationMember,
                as: 'Members',
                where: { userId: currentUserId },
                attributes: [] // Không cần lấy trường từ ConversationMember
            }, {
                // Lấy tin nhắn cuối cùng
                model: Message,
                as: 'LastMessage',
                attributes: ['content', 'createdAt', 'senderId'],
                include: [{
                    model: User,
                    as: 'Sender',
                    attributes: ['id', 'username', 'fullName'],
                }]
            }, {
                // Lấy tất cả thành viên (trừ người dùng hiện tại, nếu là private chat)
                model: ConversationMember,
                as: 'Members',
                attributes: ['userId'],
                include: [{
                    model: User,
                    as: 'User',
                    attributes: ['id', 'username', 'fullName', 'avatarUrl'],
                }]
            }],
            order: [
                [{ model: Message, as: 'LastMessage' }, 'createdAt', 'DESC'], // Sắp xếp theo tin nhắn cuối cùng
            ],
        });

        // 💡 Xử lý tên cho Private Chat (Lấy tên người còn lại)
        const formattedConversations = conversations.map(conv => {
            const isPrivate = conv.type === 'private';
            let chatTitle = conv.name;

            if (isPrivate) {
                // Lấy thành viên còn lại (không phải user hiện tại)
                const otherMember = conv.Members.find(member => member.User.id !== currentUserId);

                // Đặt tên cuộc trò chuyện là tên người còn lại
                chatTitle = otherMember ? (otherMember.User.fullName || otherMember.User.username) : "Tự trò chuyện";
            }

            return {
                id: conv.id,
                type: conv.type,
                name: chatTitle,
                lastMessage: conv.LastMessage,
                updatedAt: conv.updatedAt,
                members: conv.Members.map(m => m.User) // Chỉ lấy đối tượng User
            };
        });

        res.status(200).json(formattedConversations);

    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ error: 'Failed to retrieve conversations' });
    }
};

// ==========================================================
// 2. TẠO HOẶC LẤY PRIVATE CONVERSATION
// [POST] /api/v1/conversations/user/:userId
// ==========================================================
exports.createOrGetPrivateConversation = async(req, res) => {
    // 1. Lấy ID người dùng
    const currentUserId = req.user.id;
    const targetUserId = parseInt(req.params.userId, 10);

    if (isNaN(targetUserId) || currentUserId === targetUserId) {
        return res.status(400).json({ message: 'Invalid request or Cannot chat with yourself' });
    }

    try {
        let conversationId = null;

        // --- BƯỚC 1: TÌM CONVERSATION ID ĐÃ TỒN TẠI ---
        // Truy vấn bảng trung gian ConversationMember để tìm Conversation ID
        const existingConversationMembers = await ConversationMember.findAll({
            // Chỉ chọn conversationId và đếm số lượng thành viên
            attributes: [
                'conversationId', [Sequelize.fn('COUNT', Sequelize.col('user_id')), 'memberCount'],
            ],
            // Điều kiện: Chứa cả hai userId
            where: {
                userId: {
                    [Op.in]: [currentUserId, targetUserId]
                }
            },
            group: ['conversationId'],
            // Điều kiện nhóm: Phải có ĐÚNG 2 thành viên
            having: Sequelize.literal('COUNT("user_id") = 2'),
            raw: true, // Lấy kết quả thô để đơn giản hóa
            limit: 1,
        });

        if (existingConversationMembers.length > 0) {
            const existingId = existingConversationMembers[0].conversationId;

            // 💡 Bước kiểm tra bổ sung: Đảm bảo Conversation đó là 'private'
            const existingConversation = await Conversation.findOne({
                where: { id: existingId, type: 'private' },
                attributes: ['id']
            });

            if (existingConversation) {
                conversationId = existingConversation.id;
            }
        }

        // --- BƯỚC 2: TẠO MỚI NẾU KHÔNG TÌM THẤY ---
        if (!conversationId) {
            // Tạo Conversation mới
            const newConversation = await Conversation.create({
                type: 'private',
                creatorId: currentUserId, // Hoặc null nếu không cần
            });
            conversationId = newConversation.id;

            // Thêm 2 thành viên vào bảng ConversationMember
            await ConversationMember.bulkCreate([
                { conversationId: newConversation.id, userId: currentUserId },
                { conversationId: newConversation.id, userId: targetUserId }
            ]);

            return res.status(201).json({
                message: 'New private conversation created successfully.',
                conversationId: conversationId
            });
        }

        // --- BƯỚC 3: TRẢ VỀ ID ĐÃ TỒN TẠI ---
        return res.status(200).json({
            message: 'Existing private conversation retrieved successfully.',
            conversationId: conversationId
        });

    } catch (error) {
        console.error('Error creating/getting private conversation:', error);
        return res.status(500).json({ error: 'Failed to create or get private conversation.' });
    }
};


// ==========================================================
// 3. LẤY LỊCH SỬ TIN NHẮN
// [GET] /api/v1/conversations/:conversationId/messages
// ==========================================================
exports.getConversationMessages = async(req, res) => {
    const currentUserId = req.user.id;
    const conversationId = parseInt(req.params.conversationId);
    // Phân trang đơn giản (lấy 50 tin nhắn cuối cùng)
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0; // Để load thêm tin nhắn cũ

    try {
        // 1. Kiểm tra người dùng có phải là thành viên của Conversation không
        const isMember = await ConversationMember.findOne({
            where: {
                conversationId: conversationId,
                userId: currentUserId,
            }
        });

        if (!isMember) {
            return res.status(403).json({ error: 'Forbidden: Not a member of this conversation.' });
        }

        // 2. Lấy danh sách tin nhắn
        const messages = await Message.findAll({
            where: { conversationId: conversationId },
            include: [{
                model: User,
                as: 'Sender',
                attributes: ['id', 'username', 'fullName', 'avatarUrl'],
            }],
            limit: limit,
            offset: offset,
            order: [
                ['createdAt', 'DESC']
            ], // Lấy tin nhắn mới nhất trước (cho inverted list)
        });

        res.status(200).json(messages);

    } catch (error) {
        console.error('Error getting conversation messages:', error);
        res.status(500).json({ error: 'Failed to retrieve messages.' });
    }
};