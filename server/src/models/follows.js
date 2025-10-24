const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
const Sequelize = require('sequelize'); // Import module gốc
const Op = Sequelize.Op; // Lấy toán tử Op từ module gốc

const Follow = sequelize.define(
    'Follow', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        followerId: { // user theo dõi
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'follower_id',
        },
        userFolloweeId: { // user duoc theo doi
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'user_followee_id'
        },
        artistFolloweeId: { // artist duoc theo doi
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'artist_followee_id'
        },
        followedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'followed_at',
        }
    }, {
        tableName: 'follows',
        timestamps: true,

        // 🆕 THÊM UNIQUE COMPOSITE INDEX để ngăn người dùng theo dõi 1 người 2 lần
        indexes: [{
            unique: true,
            fields: ['follower_id', 'user_followee_id'],
            where: {
                user_followee_id: {
                    [Op.not]: null
                }
            }
        }]
    }
)

module.exports = Follow