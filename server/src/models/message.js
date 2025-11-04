const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const Message = sequelize.define(
    'Message', {
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
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'sender_id',
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM('text', 'image', 'video', 'file', 'system'),
            allowNull: false,
            defaultValue: 'text',
        },
        fileUrl: {
            type: DataTypes.STRING, // Chứa URL file nếu type là media/file
            allowNull: true,
            field: 'file_url',
        },
        replyToId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'reply_to_id',
        },
    }, {
        tableName: 'messages',
        timestamps: true,
        paranoid: true, // Cho phép soft-delete
        indexes: [
            { fields: ['conversation_id'] },
            { fields: ['sender_id'] },
        ],
    }
);

module.exports = Message;