const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Playlist = sequelize.define(
  'Playlist',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  },
  {
    tableName: 'playlists',
    timestamps: true
  }
)

module.exports = Playlist
