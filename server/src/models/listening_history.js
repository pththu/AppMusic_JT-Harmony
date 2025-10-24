const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

const ListeningHistory = sequelize.define(
    'ListeningHistory', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            primaryKey: true
        },
        songId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'song_id',
            primaryKey: true
        },
        listenedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'listened_at'
        },
        durationListened: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'duration_listened'
        }
    }, {
        tableName: 'listening_histories',
        timestamps: true
    }
)

module.exports = ListeningHistory