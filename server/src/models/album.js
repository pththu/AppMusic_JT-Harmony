const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const Album = sequelize.define(
  'Album',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    spotifyAlbumId: {
      type: DataTypes.STRING,
      field: 'spotify_album_id'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'artist_id'
    },
    coverUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'cover_url'
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'release_date'
    }
  },
  {
    tableName: 'albums',
    timestamps: true
  }
)

module.exports = Album
