const { DataTypes } = require('sequelize')
const sequelize = require('./init')

const Song = sequelize.define(
  'Song',
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    jamendoId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artistName: { // tên nghệ sĩ từ Jamendo (string)
      type: DataTypes.STRING
    },
    albumName: { // tên album từ Jamendo (string)
      type: DataTypes.STRING
    },
    audioUrl: {
      type: DataTypes.STRING
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    duration: {
      type: DataTypes.INTEGER
    },
    artistId: { // foreign key -> Artist
      type: DataTypes.BIGINT,
      allowNull: true
    },
    albumId: { // foreign key -> Album
      type: DataTypes.BIGINT,
      allowNull: true
    }
  },
  {
    tableName: 'songs',
    timestamps: true
  }
)

module.exports = Song
