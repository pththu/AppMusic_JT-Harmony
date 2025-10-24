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
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_admin',
        },
        // Dùng để đánh dấu đã đọc đến tin nhắn nào
        lastReadMessageId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'last_read_message_id',
        },
        // Status: 'active', 'left', 'removed'
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
        ],
    }
);

module.exports = ConversationMember;