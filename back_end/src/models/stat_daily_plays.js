const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const StatDailyPlays = sequelize.define(
  'StatDailyPlays',
  {
    songId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'song_id',
      primaryKey: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true
    },
    playCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'play_count'
    }
  },
  {
    tableName: 'stat_daily_plays',
    timestamps: false
  }
);

module.exports = StatDailyPlays;