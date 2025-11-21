// Đây là Model trung gian quản lý thành viên và trạng thái đọc tin nhắn trong cuộc trò chuyện.

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const ConversationMember = sequelize.define(
    'ConversationMember', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        conversationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'conversation_id',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
        },
        isAdmin: { // Xác định thành viên có phải quản trị viên nhóm không
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_admin',
        },
        lastReadMessageId: { // Dùng để đánh dấu đã đọc đến tin nhắn nào
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'last_read_message_id',
        },
        status: {
            type: DataTypes.ENUM('active', 'left', 'removed'),
            allowNull: false,
            defaultValue: 'active',
        },
    }, {
        tableName: 'conversation_members',
        timestamps: true,
        indexes: [
            { unique: true, fields: ['conversation_id', 'user_id'] },
            { fields: ['user_id'] },
        ], // Tạo index để tăng tốc truy vấn theo user_id
    }
);

// Hook: Không cho phép private conversation có hơn 2 thành viên active
async function ensurePrivateConversationLimit(instance) {
    if (!instance || !instance.conversationId) return;

    // Import Conversation lazily để tránh vòng lặp require
    const Conversation = require('./conversation');

    const conversation = await Conversation.findByPk(instance.conversationId, {
        attributes: ['id', 'type'],
    });
    if (!conversation || conversation.type !== 'private') return;

    const currentCount = await ConversationMember.count({
        where: {
            conversationId: instance.conversationId,
            status: 'active',
        },
    });

    if (currentCount >= 2) {
        throw new Error('Private conversation cannot have more than 2 active members');
    }
}

ConversationMember.addHook('beforeCreate', async (instance, options) => {
    await ensurePrivateConversationLimit(instance);
});

ConversationMember.addHook('beforeBulkCreate', async (instances, options) => {
    if (!Array.isArray(instances)) return;
    for (const inst of instances) {
        await ensurePrivateConversationLimit(inst);
    }
});

module.exports = ConversationMember;