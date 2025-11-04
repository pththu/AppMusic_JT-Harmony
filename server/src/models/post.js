const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database')

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
        fileUrl: { // URL tệp đính kèm (nếu có)
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
        uploadedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'uploaded_at'
        },
        commentCount: { // Số lượng bình luận
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'comment_count'
        },
        songId: { // Liên kết đến bài hát nếu bài đăng chia sẻ bài hát
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'song_id'
        }
    }, {
        tableName: 'posts',
        timestamps: true,
        underscored: false
    }
);

module.exports = Post;