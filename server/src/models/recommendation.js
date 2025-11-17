const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const Recommendation = sequelize.define(
    'Recommendation',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        query: {
            type: DataTypes.TEXT,
            field: 'query'
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'type'
        },
        reason: {
            type: DataTypes.STRING,
        },
        confidence: {
            type: DataTypes.FLOAT,
        }
    },
    {
        tableName: 'recommendations',
        timestamps: true,
        indexes: [
            { fields: ['user_id'] }
        ]
    }
)

module.exports = Recommendation