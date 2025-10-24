// Post.js (Backend Sequelize Model)

const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

const Post = sequelize.define(
    'Post', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        content: {
            type: DataTypes.TEXT,
        },
        fileUrl: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'file_url'
        },
        heartCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'heart_count'
        },
        shareCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'share_count'
        },
        // Cột thời gian tùy chỉnh được giữ lại
        uploadedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW, // Sequelize tự động điền giá trị này
            field: 'uploaded_at'
        },
        commentCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'comment_count'
        },
        songId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'song_id'
        }
    }, {
        tableName: 'posts',
        // CHÍNH XÁC: TẮT timestamps vì bạn dùng uploadedAt
        timestamps: true,
        // Giữ underscored vì các trường DB là snake_case
        underscored: false
    }
);

module.exports = Post;