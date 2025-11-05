const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const Track = sequelize.define(
  'Track',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    spotifyId: {
      type: DataTypes.STRING,
      unique: true,
      field: 'spotify_id',
      allowNull: false
    },
    videoId: {
      type: DataTypes.STRING,
      field: 'video_id'
    },
    name: {
      type: DataTypes.STRING,
    },
    lyrics: {
      type: DataTypes.TEXT,
    },
    externalUrl: {
      type: DataTypes.STRING,
      field: 'external_url'
    },
    duration: {
      type: DataTypes.INTEGER
    },
    albumId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'album_id',
    },
    discNumber: {
      type: DataTypes.INTEGER,
      field: 'disc_number',
      defaultValue: 1
    },
    trackNumber: {
      type: DataTypes.INTEGER,
      field: 'track_number',
    },
    explicit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    playCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'play_count'
    },
    shareCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'share_count'
    },
    releaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'release_date'
    }
  },
  {
    tableName: 'tracks',
    timestamps: true,
    indexes: [
      {
        fields: ['id', 'name', 'spotify_id', 'album_id', 'release_date']
      }
    ]
  }
)

module.exports = Track;