const { Sequelize } = require('sequelize')

const databaseInfo = {
  host: process.env.DB_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
}

const sequelize = new Sequelize(
  databaseInfo.database,
  databaseInfo.user,
  databaseInfo.password,
  {
    host: databaseInfo.host,
    dialect: 'mysql',
    port: databaseInfo.port,
    timezone: '+07:00'
  }
)

module.exports = sequelize