const { DataTypes } = require('sequelize')

const sequelize = require('../configs/database')

const FavoriteSong = sequelize.define(
  'FavoriteSong',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    songId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'song_id'
    },
    likedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'liked_at'
    }
  },
  {
    tableName: 'favorite_songs',
    timestamps: true
  }
)

module.exports = FavoriteSong
