const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const Notification = sequelize.define(
    'Notification', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        actorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'actor_id'
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'post_id'
        },
        message: {
            type: DataTypes.TEXT
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        tableName: 'notifications',
        timestamps: true
    }
)

module.exports = Notification