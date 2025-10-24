const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const Album = sequelize.define(
    'Album', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            unique: true,
            primaryKey: true
        },
        spotifyId: {
            type: DataTypes.STRING,
            field: 'spotify_id',
            unique: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'image_url'
        },
        totalTracks: {
            type: DataTypes.INTEGER,
            field: 'total_tracks'
        },
        releaseDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'release_date'
        }
    }, {
        tableName: 'albums',
        timestamps: true,
        indexes: [{
            fields: ['id', 'name', 'spotify_id', 'release_date']
        }]
    }
)

module.exports = Album