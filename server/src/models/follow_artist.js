const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
const Sequelize = require('sequelize'); // Import module gốc
const Op = Sequelize.Op; // Lấy toán tử Op từ module gốc

const FollowArtist = sequelize.define(
  'FollowArtist',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    followerId: {  // user theo dõi
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'follower_id',
    },
    artistId: { // artist duoc theo doi
      type: DataTypes.INTEGER,
      field: 'artist_id'
    },
    artistSpotifyId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'artist_spotify_id',
    }
  },
  {
    tableName: 'follow_artists',
    timestamps: true,
    uniqueKeys: {
      unique_follow: {
        fields: ['follower_id', 'artist_id']
      }
    },
    indexes: [
      {
        fields: ['id', 'follower_id', 'artist_id']
      }
    ]
  }
)

module.exports = FollowArtist
