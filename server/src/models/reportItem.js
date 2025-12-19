const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
// const { sequelize } = require('../configs/database');

const ReportItem = sequelize.define(
  'ReportItem',
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
      type: DataTypes.TEXT, // Mô tả lý do báo cáo: adult content, spam, hate speech, misinformation, self_harm, self_harm.
      allowNull: true
    },
    status: {
      type: DataTypes.STRING, // pending, reviewed, dismissed
      defaultValue: 'pending'
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'admin_notes'
    },
    reportedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'reported_at'
    },
    reviewdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewed_at'
    }
  },
  {
    tableName: 'report_items',
    timestamps: true,
    indexes: [
      {
        fields: ['id', 'user_id', 'item_id'],
        unique: true
      }
    ]
  }
)

module.exports = ReportItem