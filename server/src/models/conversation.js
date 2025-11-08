// chat room

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Conversation = sequelize.define(
    'Conversation', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        type: {
            type: DataTypes.ENUM('private', 'group'), // Loại: 1-1 hoặc Nhóm
            allowNull: false,
            defaultValue: 'private',
        },
        name: { // Tên cuộc trò chuyện, chỉ cần cho nhóm
            type: DataTypes.STRING,
            allowNull: true, // Chỉ cần cho nhóm
        },
        lastMessageId: { // Tin nhắn cuối cùng trong cuộc trò chuyện
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'last_message_id',
        },
    }, {
        tableName: 'conversations',
        timestamps: true,
        indexes: [{ fields: ['type'] }], // Tạo index để tăng tốc truy vấn theo loại cuộc trò chuyện
    }
);

module.exports = Conversation;