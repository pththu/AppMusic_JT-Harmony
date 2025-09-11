const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Album = sequelize.define(
  'Album',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    artistId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    coverUrl: {
      type: DataTypes.STRING
    },
    releaseDate: {
      type: DataTypes.DATE
    }
  },
  {
    tableName: 'albums',
    timestamps: true
  }
)

module.exports = Album
