const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const PostHide = sequelize.define(
    'PostHide', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'post_id',
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
        },
    }, {
        tableName: 'post_hides',
        timestamps: true,
        indexes: [
            { fields: ['post_id'] },
            { fields: ['user_id'] },
            { unique: true, fields: ['post_id', 'user_id'] }, // Một user chỉ có thể ẩn một bài viết một lần
        ],
    }
);

module.exports = PostHide;