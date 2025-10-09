const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

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
            type: DataTypes.STRING,
            allowNull: false,
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
        }
    }, {
        tableName: 'posts',
        timestamps: true
    }
);

module.exports = Post;