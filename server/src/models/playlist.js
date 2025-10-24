const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

const Playlist = sequelize.define(
    'Playlist', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        spotifyPlaylistId: {
            type: DataTypes.STRING,
            field: 'spotify_playlist_id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            // allowNull: false,
            field: 'user_id'
        },
        description: {
            type: DataTypes.TEXT
        },
        coverImg: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'cover_img'
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'is_public'
        },
        shareCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'share_count'
        }
    }, {
        tableName: 'playlists',
        timestamps: true
    }
)

module.exports = Playlist