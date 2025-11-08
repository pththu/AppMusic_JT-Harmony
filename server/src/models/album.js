const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const Album = sequelize.define(
  'Album',
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
      field: 'spotify_id',
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
    },
    imageUrl: {
      type: DataTypes.STRING,
      field: 'image_url'
    },
    totalTracks: {
      type: DataTypes.INTEGER,
      field: 'total_tracks'
    },
    shareCount: {
      type: DataTypes.INTEGER,
      field: 'share_count',
      defaultValue: 0
    },
    releaseDate: {
      type: DataTypes.DATE,
      field: 'release_date'
    }
  },
  {
    tableName: 'albums',
    timestamps: true,
    indexes: [
      {
        fields: ['id', 'name', 'spotify_id']
      }
    ]
  }
)

module.exports = Album