// models/CommentLike.js (Tạo mới)

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

const CommentLike = sequelize.define(
    'CommentLike', {
        // user_id và comment_id sẽ là Khóa Chính kép, không cần id
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'user_id'
        },
        commentId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            field: 'comment_id'
        },
        likedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'liked_at'
        }
    }, {
        tableName: 'comment_likes',
        timestamps: false // Không cần created/updatedAt
    }
);

module.exports = CommentLike;