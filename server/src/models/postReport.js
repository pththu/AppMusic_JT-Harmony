const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const PostReport = sequelize.define('PostReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'posts',
            key: 'id'
        }
    },
    reporterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reason: { // lý do báo cáo
        type: DataTypes.ENUM(
            'adult_content',
            'self_harm',
            'misinformation',
            'unwanted_content'
        ),
        allowNull: false,
    },
    status: { // trạng thái báo cáo
        type: DataTypes.ENUM('pending', 'reviewed', 'resolved'), // đang chờ, đã xem xét, đã giải quyết
        defaultValue: 'pending',
    },
    reportedAt: { // thời gian báo cáo
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    reviewedAt: { // thời gian xem xét
        type: DataTypes.DATE,
        allowNull: true,
    },
    adminNotes: { // ghi chú của admin khi xem xét báo cáo
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'post_reports',
    timestamps: false,
});

module.exports = PostReport;