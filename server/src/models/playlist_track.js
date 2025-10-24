const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const PlaylistTrack = sequelize.define(
  'PlaylistTrack',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    playlistId: {
      type: DataTypes.INTEGER,
      field: 'playlist_id'
    },
    trackId: {
      type: DataTypes.INTEGER,
      field: 'track_id'
    },
    playlistSpotifyId: {
      type: DataTypes.STRING,
      field: 'playlist_spotify_id'
    },
    trackSpotifyId: {
      type: DataTypes.STRING,
      field: 'track_spotify_id'
    },
  },
  {
    tableName: 'playlist_tracks',
    timestamps: true,
    indexes: [
      {
        fields: ['id', 'playlist_id', 'playlist_spotify_id']
      }
    ]
  }
)

module.exports = PlaylistTrack