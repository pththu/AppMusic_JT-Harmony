const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const FavoriteItem = sequelize.define(
  'FavoriteItem',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    itemId: {
      type: DataTypes.INTEGER,
      field: 'item_id'
    },
    itemSpotifyId: {
      type: DataTypes.STRING,
      field: 'item_spotify_id'
    },
    itemType: {
      type: DataTypes.STRING,
      field: 'item_type'
    }
  },
  {
    tableName: 'favorite_items',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['item_id', 'user_id']
      }
    ]
  }
)

module.exports = FavoriteItem