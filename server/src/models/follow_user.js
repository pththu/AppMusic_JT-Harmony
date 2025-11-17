const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const FollowUser = sequelize.define(
  'FollowUser',
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
    followeeId: { // user duoc theo doi
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'followee_id'
    },
  },
  {
    tableName: 'follow_users',
    timestamps: true,
    indexes: [
      {
        fields: ['follower_id', 'followee_id']
      }
    ]
  }
)

module.exports = FollowUser
