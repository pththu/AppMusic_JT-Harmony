const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'full_name'
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'avatar_url'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dob: { // date of birth
      type: DataTypes.DATE,
      allowNull: true,
      field: 'dob'
    },
    gender: {
      type: DataTypes.BOOLEAN, // true: male, false: female
      allowNull: true
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'access_token'
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'refresh_token'
    },
    expiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expireOtp: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expire_otp'
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'email_verified'
    },
    notificationEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'notification_enabled'
    },
    streamQuality: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: true,
      defaultValue: 'low',
      field: 'stream_quality'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'banned'),
      allowNull: true,
      defaultValue: 'active'
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'role_id'
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login'
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        fields: ['email']
      }
    ]
  }
)

module.exports = User
