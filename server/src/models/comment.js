// models/comment.js
const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')


const Comment = sequelize.define(
    'Comment', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'post_id'
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        parentId: { // id comment
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'parent_id'
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'file_url'
        },
        commentedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'commented_at',
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'comments',
        timestamps: true
    }
)

module.exports = Comment