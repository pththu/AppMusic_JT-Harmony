const { User, Message, Conversation, ConversationMember, sequelize } = require('../models');

/**
 * 💡 Export một hàm nhận instance của Socket.IO Server (io)
 * @param {import('socket.io').Server} io - Instance của Socket.IO Server
 */
module.exports = function(io) {
    // Sự kiện khi một client kết nối thành công
    io.on('connection', (socket) => {
        const userId = socket.user.id;
        console.log(`[CONNECT] User ID: ${userId} connected. Socket ID: ${socket.id}`);

        // 1. 🚀 Đánh dấu người dùng là ONLINE và tham gia phòng cá nhân của họ

        // Tạo một "room" cho cá nhân người dùng để gửi thông báo/trạng thái riêng
        const personalRoom = `user_${userId}`;
        socket.join(personalRoom);

        // Cập nhật trạng thái ONLINE (Cần một cơ chế lưu trạng thái user)
        // Hiện tại, ta chỉ thông báo tới các người dùng khác (ví dụ: những người đang theo dõi)
        // io.emit('user_status', { userId, status: 'online' }); // Quá tốn kém
        // => Tốt hơn: Chỉ thông báo cho những người dùng trong cùng một conversation mà họ đang tham gia.

        // 2. 👂 Xử lý sự kiện `disconnect` (Ngắt kết nối)
        socket.on('disconnect', () => {
            console.log(`[DISCONNECT] User ID: ${userId} disconnected. Socket ID: ${socket.id}`);
            // Xử lý logic OFFLINE ở đây (sau khi có cơ chế lưu trữ trạng thái)
            // io.emit('user_status', { userId, status: 'offline' }); 
        });

        // 3. 💬 Xử lý sự kiện `send_message` (Gửi tin nhắn)
        socket.on('send_message', async(data, callback) => {
            const { conversationId, content, type = 'text', fileUrl = null } = data;

            if (!conversationId || (!content && !fileUrl)) {
                return callback({ status: 'error', message: 'Dữ liệu tin nhắn không hợp lệ.' });
            }

            try {
                // Kiểm tra người dùng có phải thành viên của conversation không
                const member = await ConversationMember.findOne({
                    where: { conversationId, userId },
                    raw: true,
                });

                if (!member || member.status !== 'active') {
                    return callback({ status: 'error', message: 'Bạn không phải là thành viên của cuộc trò chuyện này.' });
                }

                // Lưu tin nhắn vào DB
                const newMessage = await Message.create({
                    conversationId,
                    senderId: userId,
                    content,
                    type,
                    fileUrl,
                });

                // Cập nhật LastMessage cho Conversation
                await Conversation.update({ lastMessageId: newMessage.id }, { where: { id: conversationId } });

                // Lấy thông tin chi tiết của tin nhắn và người gửi
                const messageWithSender = await Message.findByPk(newMessage.id, {
                    include: [{ model: User, as: 'Sender', attributes: ['id', 'username', 'avatarUrl', 'fullName'] }],
                    raw: false,
                    nest: true,
                });

                // Gửi tin nhắn tới tất cả thành viên trong phòng Chat
                io.to(`conversation_${conversationId}`).emit('receive_message', messageWithSender);

                // Cập nhật trạng thái "đã đọc" cho chính người gửi
                await ConversationMember.update({ lastReadMessageId: newMessage.id }, { where: { conversationId, userId } });

                // Gửi thông báo thành công cho client
                callback({ status: 'ok', message: messageWithSender });

            } catch (error) {
                console.error('[ERROR] send_message:', error);
                callback({ status: 'error', message: 'Lỗi server khi gửi tin nhắn.' });
            }
        });

        // 4. 🚪 Xử lý sự kiện `join_conversation` (Tham gia phòng chat)
        socket.on('join_conversation', (conversationId) => {
            const roomName = `conversation_${conversationId}`;
            socket.join(roomName);
            console.log(`[JOIN ROOM] User ID: ${userId} joined room: ${roomName}`);

        });

        // 5. ✍️ Xử lý sự kiện `typing_start` (Đang gõ)
        socket.on('typing_start', (conversationId) => {
            // Phát sóng tới tất cả thành viên trong phòng (trừ người gửi)
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                conversationId,
                userId,
                isTyping: true
            });
        });

        // 6. 🛑 Xử lý sự kiện `typing_stop` (Dừng gõ)
        socket.on('typing_stop', (conversationId) => {
            // Phát sóng tới tất cả thành viên trong phòng (trừ người gửi)
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                conversationId,
                userId,
                isTyping: false
            });
        });

    });
};