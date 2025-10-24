const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

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
        }
    }, {
        tableName: 'notifications',
        timestamps: true
    }
)

module.exports = Notification