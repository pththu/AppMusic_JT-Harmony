const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')

const HideItem = sequelize.define(
  'HideItem',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    itemId: {
      type: DataTypes.INTEGER,
      field: 'item_id'
    },
    type: {
      type: DataTypes.STRING,
      field: 'item_type'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hiddenAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'hidden_at'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    }
  },
  {
    tableName: 'hide_items',
    timestamps: true,
    indexes: [
      {
        fields: ['item_id', 'user_id'],
        unique: true
      }
    ]
  }
)

module.exports = HideItem