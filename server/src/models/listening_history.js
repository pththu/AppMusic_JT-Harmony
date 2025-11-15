const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
// const { sequelize } = require('../configs/database');

const ListeningHistory = sequelize.define(
  'ListeningHistory',
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
      field: 'user_id',
    },
    itemId: {
      type: DataTypes.INTEGER,
      field: 'item_id',
    },
    itemSpotifyId: {
      type: DataTypes.STRING,
      field: 'item_spotify_id'
    },
    itemType: {
      type: DataTypes.STRING,
      field: 'item_type'
    },
    durationListened: {
      type: DataTypes.DOUBLE,
      field: 'duration_listened'
    }
  },
  {
    tableName: 'listening_histories',
    timestamps: true,
    indexes: [
      {
        fields: ['id', 'user_id']
      }
    ]
  }
)

module.exports = ListeningHistory