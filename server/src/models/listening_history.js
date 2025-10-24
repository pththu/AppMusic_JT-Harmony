const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
// const { sequelize } = require('../configs/database');

const ListeningHistory = sequelize.define(
  'ListeningHistory',
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      primaryKey: true
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'item_id',
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
    },
    listenedAt: {
      type: DataTypes.DATE,
      field: 'listened_at'
    },
    durationListened: {
      type: DataTypes.INTEGER,
      field: 'duration_listened'
    }
  },
  {
    tableName: 'listening_histories',
    timestamps: true,
    indexes: [
      {
        fields: ['user_id', 'listened_at', 'item_id']
      }
    ]
  }
)

module.exports = ListeningHistory