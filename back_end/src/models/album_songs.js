const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const AlbumSong = sequelize.define('AlbumSong', {
  albumId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  songId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_index',
  }
}, {
  tableName: 'album_songs',
  timestamps: false
});

module.exports = AlbumSong;
