const { Conversation, Message, User, ConversationMember, MessageHide, sequelize } = require('../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// ==========================================================
// 1. LẤY DANH SÁCH CONVERSATIONS CỦA USER HIỆN TẠI
// [GET] /api/v1/conversations
// ==========================================================
exports.getConversations = async(req, res) => {
    const currentUserId = req.user.id;

    try {
        // Trước tiên, lấy danh sách conversationId mà user là thành viên active
        const userConversations = await ConversationMember.findAll({
            where: {
                userId: currentUserId,
                status: 'active'
            },
            attributes: ['conversationId'],
            raw: true,
        });

        const conversationIds = userConversations.map(cm => cm.conversationId);

        if (conversationIds.length === 0) {
            return res.status(200).json([]);
        }

        // Lọc chỉ lấy conversations có ít nhất 2 thành viên (để loại bỏ self-chat)
        const validConversationIds = [];

        for (const convId of conversationIds) {
            const memberCount = await ConversationMember.count({
                where: { conversationId: convId }
            });
            if (memberCount >= 2) {
                validConversationIds.push(convId);
            }
        }

        if (validConversationIds.length === 0) {
            return res.status(200).json([]);
        }

        const conversations = await Conversation.findAll({
            where: {
                id: {
                    [Op.in]: validConversationIds
                }
            },
            // Tìm Conversation mà người dùng là thành viên
            include: [{
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

        //  Xử lý tên cho Private Chat (Lấy tên người còn lại)
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
    const targetUserId = parseInt(req.params.userId, 10); // Chuyển sang số nguyên

    if (isNaN(targetUserId) || currentUserId === targetUserId) {
        return res.status(400).json({ message: 'Invalid request or Cannot chat with yourself' });
    }

    try {
        let conversationId = null;

        // --- TÌM CONVERSATION ID ĐÃ TỒN TẠI ---
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

            //  Bước kiểm tra bổ sung: Đảm bảo Conversation đó là 'private'
            const existingConversation = await Conversation.findOne({
                where: { id: existingId, type: 'private' },
                attributes: ['id']
            });

            if (existingConversation) {
                // Kiểm tra status của user hiện tại trong conversation này
                const currentUserMember = await ConversationMember.findOne({
                    where: {
                        conversationId: existingId,
                        userId: currentUserId,
                    },
                    attributes: ['status']
                });

                // Nếu user hiện tại đã left conversation, reactivate lại thay vì tạo mới
                if (!currentUserMember || currentUserMember.status === 'left') {
                    // Reactivate user hiện tại trong conversation cũ
                    await ConversationMember.update({ status: 'active' }, {
                        where: {
                            conversationId: existingId,
                            userId: currentUserId,
                        }
                    });

                    conversationId = existingConversation.id;

                    return res.status(200).json({
                        message: 'Existing private conversation reactivated successfully.',
                        conversationId: conversationId
                    });
                } else {
                    // User vẫn active, dùng conversation cũ
                    conversationId = existingConversation.id;
                }
            }
        }

        // --- TẠO MỚI NẾU KHÔNG TÌM THẤY ---
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

        // 2. Lấy danh sách tin nhắn, loại bỏ tin nhắn đã bị user ẩn
        const messages = await Message.findAll({
            where: {
                conversationId: conversationId,
                // Loại bỏ tin nhắn đã bị user ẩn
                [Op.not]: {
                    id: {
                        [Op.in]: sequelize.literal(`(
                            SELECT message_id FROM message_hides WHERE user_id = ${currentUserId}
                        )`)
                    }
                }
            },
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

// ==========================================================
// 4. XÓA TIN NHẮN
// [DELETE] /api/v1/conversations/messages/:messageId
// ==========================================================
exports.deleteMessage = async(req, res) => {
    const currentUserId = req.user.id;
    const messageId = parseInt(req.params.messageId, 10);

    if (isNaN(messageId)) {
        return res.status(400).json({ error: 'Invalid message ID.' });
    }

    try {
        // 1. Tìm tin nhắn
        const message = await Message.findByPk(messageId);

        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        // 2. Kiểm tra quyền: Chỉ người gửi mới có thể xóa
        if (message.senderId !== currentUserId) {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own messages.' });
        }

        // 3. Xóa tin nhắn (soft delete nếu paranoid = true)
        await message.destroy();

        res.status(200).json({ message: 'Message deleted successfully.' });

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message.' });
    }
};

// ==========================================================
// 5. ẨN TIN NHẮN
// [POST] /api/v1/conversations/messages/:messageId/hide
// ==========================================================
exports.hideMessage = async(req, res) => {
    const currentUserId = req.user.id;
    const messageId = parseInt(req.params.messageId, 10);

    if (isNaN(messageId)) {
        return res.status(400).json({ error: 'Invalid message ID.' });
    }

    try {
        // 1. Tìm tin nhắn
        const message = await Message.findByPk(messageId);

        if (!message) {
            return res.status(404).json({ error: 'Message not found.' });
        }

        // 2. Kiểm tra người dùng có phải là thành viên của cuộc trò chuyện không
        const isMember = await ConversationMember.findOne({
            where: {
                conversationId: message.conversationId,
                userId: currentUserId,
            }
        });

        if (!isMember) {
            return res.status(403).json({ error: 'Forbidden: Not a member of this conversation.' });
        }

        // 3. Tạo bản ghi ẩn tin nhắn
        await MessageHide.create({
            messageId: messageId,
            userId: currentUserId,
        });

        res.status(200).json({ message: 'Message hidden successfully.' });

    } catch (error) {
        console.error('Error hiding message:', error);
        res.status(500).json({ error: 'Failed to hide message.' });
    }
};

// ==========================================================
// 6. XÓA CUỘC TRÒ CHUYỆN (CHỈ XÓA BÊN PHÍA NGƯỜI DÙNG HIỆN TẠI)
// [DELETE] /api/v1/conversations/:conversationId
// ==========================================================
exports.deleteConversation = async(req, res) => {
    const currentUserId = req.user.id;
    const conversationId = parseInt(req.params.conversationId, 10);

    if (isNaN(conversationId)) {
        return res.status(400).json({ error: 'Invalid conversation ID.' });
    }

    try {
        // 1. Kiểm tra người dùng có phải là thành viên của cuộc trò chuyện không
        const isMember = await ConversationMember.findOne({
            where: {
                conversationId: conversationId,
                userId: currentUserId,
            }
        });

        if (!isMember) {
            return res.status(403).json({ error: 'Forbidden: Not a member of this conversation.' });
        }

        // 2. Xóa tất cả tin nhắn của cuộc trò chuyện cho user hiện tại (ẩn tất cả tin nhắn)
        const messages = await Message.findAll({
            where: { conversationId: conversationId },
            attributes: ['id']
        });

        // Tạo bản ghi ẩn cho tất cả tin nhắn nếu chưa có
        const hidePromises = messages.map(message =>
            MessageHide.findOrCreate({
                where: {
                    messageId: message.id,
                    userId: currentUserId
                },
                defaults: {
                    messageId: message.id,
                    userId: currentUserId
                }
            })
        );

        await Promise.all(hidePromises);

        // 3. Cập nhật trạng thái thành viên của người dùng hiện tại thành 'left'
        await ConversationMember.update({ status: 'left' }, {
            where: {
                conversationId: conversationId,
                userId: currentUserId,
            }
        });

        res.status(200).json({ message: 'Conversation deleted successfully from your side.' });

    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation.' });
    }
};