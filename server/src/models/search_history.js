const { DataTypes } = require('sequelize')
const sequelize = require('../configs/database')
    // const { sequelize } = require('../configs/database');

const SearchHistory = sequelize.define(
    'SearchHistory', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id'
        },
        query: {
            type: DataTypes.STRING,
            allowNull: false
        },
        searchedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'searched_at'
        }
    }, {
        tableName: 'search_histories',
        timestamps: true
    }
)

module.exports = SearchHistory