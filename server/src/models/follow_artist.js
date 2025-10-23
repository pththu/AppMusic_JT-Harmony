const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

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
      allowNull: false,
      field: 'artist_id'
    },
    followedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'followed_at',
    }
  },
  {
    tableName: 'follows',
    timestamps: true,
    indexes: [
      {
        fields: ['follower_id', 'artist_id']
      }
    ]
  }
)

module.exports = FollowArtist
