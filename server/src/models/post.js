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
        // songId: ID bài hát được gắn trực tiếp vào bài đăng thường (post chia sẻ bài hát)
        // Dùng để biết bài đăng này liên quan đến bài hát nào (thống kê, lọc theo bài hát,...)
        songId: { // Liên kết đến bài hát nếu bài đăng chia sẻ bài hát
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'song_id'
        },
        isCover: { // Đánh dấu đây là bài cover hay không
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_cover'
        },
        // originalSongId: ID của bài hát gốc
        // - Với cover (isCover = true): là bài hát gốc mà cover tham chiếu tới
        // - Với bài đăng thường có gắn bài hát: dùng cùng ID để tạo quan hệ OriginalSong (Track)
        //   giúp load đầy đủ thông tin bài hát (tên, nghệ sĩ) cho feed
        originalSongId: { // ID của bài hát gốc nếu là cover
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'original_song_id'
        },
        originalPostId: { // ID của bài đăng gốc nếu là re-share
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'original_post_id'
        }
    }, {
        tableName: 'posts',
        timestamps: true,
        underscored: false
    }
);

module.exports = Post;