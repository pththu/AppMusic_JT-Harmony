const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

const DownloadSong = sequelize.define(
    'DownloadSong', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'user_id'
        },
        songId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'song_id',
            primaryKey: true
        },
        localPath: {
            type: DataTypes.STRING,
            field: 'local_path'
        },
        isAvailable: {
            type: DataTypes.BOOLEAN,
            field: 'is_available'
        }
    }, {
        tableName: 'download_songs',
        timestamps: false
    }
);

module.exports = DownloadSong;