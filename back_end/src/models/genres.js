const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const Genre = sequelize.define(
  'Genre',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: 'genres',
    timestamps: true
  }
)

module.exports = Genre
