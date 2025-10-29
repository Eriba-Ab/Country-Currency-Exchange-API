const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Check if we're running on Railway (it provides DATABASE_URL)
if (process.env.DATABASE_URL) {
  // Parse the DATABASE_URL to extract the components
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  sequelize = new Sequelize({
    dialect: 'mysql',
    host: dbUrl.hostname,
    port: dbUrl.port,
    username: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substr(1), // Remove the leading '/'
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
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
