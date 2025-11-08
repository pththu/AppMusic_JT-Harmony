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

module.exports = ConversationMember;