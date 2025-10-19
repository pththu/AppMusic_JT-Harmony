const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const Genres = sequelize.define(
  'Genres',
  {
    id: {
      type: DataTypes.INTEGER,
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
    timestamps: true,
    indexes: [
      {
        fields: ['id', 'name']
      }
    ]
  }
)

module.exports = Genres
