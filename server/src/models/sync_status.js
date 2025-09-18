const { DataTypes } = require('sequelize');
const sequelize = require('../configs/database');

const SyncStatus = sequelize.define(
  'SyncStatus',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    deviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'device_id'
    },
    lastSync: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'last_sync'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'sync_status',
    timestamps: false
  }
);

module.exports = SyncStatus;