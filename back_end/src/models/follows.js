const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const Follow = sequelize.define(
  'Follow',
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
    userFolloweeId: { // user duoc theo doi
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_followee_id'
    },
    artistFolloweeId: { // artist duoc theo doi
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'artist_followee_id'
    },
    followedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'followed_at',
    }
  },
  {
    tableName: 'follows',
    timestamps: true
  }
)

module.exports = Follow
