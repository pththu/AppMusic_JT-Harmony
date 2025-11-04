const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const MessageHide = sequelize.define(
    'MessageHide', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        messageId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'message_id',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
        },
    }, {
        tableName: 'message_hides',
        timestamps: true,
        indexes: [
            { fields: ['message_id'] },
            { fields: ['user_id'] },
            { unique: true, fields: ['message_id', 'user_id'] }, // Một user chỉ có thể ẩn một tin nhắn một lần
        ],
    }
);

module.exports = MessageHide;