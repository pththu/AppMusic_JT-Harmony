const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
// const { sequelize } = require('../configs/database');

const Artist = sequelize.define(
  'Artist',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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
    }
  },
  {
    tableName: 'artists',
    timestamps: true,
    indexes: [
      {
        fields: ['id', 'name', 'spotify_id']
      }
    ]
  }
)

module.exports = Artist