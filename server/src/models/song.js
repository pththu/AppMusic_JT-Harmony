const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

const Song = sequelize.define(
    'Song', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        spotifyTrackId: {
            type: DataTypes.STRING,
            unique: true,
            field: 'spotify_track_id'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lyrics: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'file_url'
        },
        duration: {
            type: DataTypes.INTEGER
        },
        playCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'play_count'
        },
        shareCount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'share_count'
        },
        releaseDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'release_date'
        }
    }, {
        tableName: 'songs',
        timestamps: true
    }
)

module.exports = Song