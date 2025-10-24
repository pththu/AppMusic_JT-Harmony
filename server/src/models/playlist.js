const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
// const { sequelize } = require('../configs/database');

const Playlist = sequelize.define(
  'Playlist',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    spotifyId: {
      type: DataTypes.STRING,
      field: 'spotify_id'
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'user_id'
    },
    description: {
      type: DataTypes.TEXT
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_public'
    },
    totalTracks: {
      type: DataTypes.INTEGER,
      field: 'total_tracks'
    },
    shareCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'share_count'
    }
  },
  {
    tableName: 'playlists',
    timestamps: true,
    indexes: [
      {
        fields: ['id', 'name', 'spotify_id', 'user_id']
      }
    ]
  }
)

module.exports = Playlist