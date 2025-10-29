const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Check if we're running on Railway (it provides MYSQLDATABASE, MYSQLHOST, etc.)
if (process.env.RAILWAY_ENVIRONMENT) {
  sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    logging: false,
    dialectOptions: {
      ssl: process.env.MYSQL_ATTR_SSL_CA ? {
        require: true,
        rejectUnauthorized: false,
        ca: process.env.MYSQL_ATTR_SSL_CA
      } : false
    }
  });
} else {
  // Local development configuration
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false
    }
  );
}

module.exports = sequelize;
