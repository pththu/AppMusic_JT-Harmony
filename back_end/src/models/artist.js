const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Artist = sequelize.define(
  'Artist',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bio: {
      type: DataTypes.TEXT
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    country: {
      type: DataTypes.STRING
    }
  },
  {
    tableName: 'artists',
    timestamps: true
  }
)

module.exports = Artist
