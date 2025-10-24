const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

const Genre = sequelize.define(
    'Genre', {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        spotifyGenreId: {
            type: DataTypes.STRING,
            unique: true,
            field: 'spotify_genre_id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        tableName: 'genres',
        timestamps: true
    }
)

module.exports = Genre