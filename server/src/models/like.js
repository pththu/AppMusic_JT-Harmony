const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database')

const Like = sequelize.define('Like', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        // Khóa ngoại: Tham chiếu đến bảng 'users'
        references: {
            model: 'users',
            key: 'id'
        }
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'post_id',
        // Khóa ngoại: Tham chiếu đến bảng 'posts'
        references: {
            model: 'posts',
            key: 'id'
        }
    }
}, {
    tableName: 'likes', // Tên bảng trong DB
    timestamps: true, // Thường dùng cho tracking created/updated
    createdAt: 'liked_at',
    updatedAt: false, // Không cần updated
    // ⚠️ TẠO UNIQUE INDEX: Đảm bảo một user chỉ thích một bài đăng 1 lần
    indexes: [{
        unique: true,
        fields: ['user_id', 'post_id']
    }]
});

module.exports = Like;