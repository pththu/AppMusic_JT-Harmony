const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const PlaylistSong = sequelize.define(
  'PlaylistSong',
  {

    playlistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'playlist_id',
      primaryKey: true
    },
    songId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'song_id',
      primaryKey: true
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_index'
    }
  },
  {
    tableName: 'playlist_songs',
    timestamps: true
  }
)

module.exports = PlaylistSong
