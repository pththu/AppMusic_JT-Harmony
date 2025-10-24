const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');


const Recommendation = sequelize.define(
    'Recommendation', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'user_id'
        },
        songId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'song_id'
        },
        score: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        isClicked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            field: 'is_clicked'
        },
        generatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'generated_at'
        }
    }, {
        tableName: 'recommendations',
        timestamps: true
    }
)

module.exports = Recommendation