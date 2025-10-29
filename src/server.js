require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    console.log('Attempting to connect to database...');
    console.log('Environment:', process.env.RAILWAY_ENVIRONMENT ? 'Railway' : 'Local');
    
    if (process.env.RAILWAY_ENVIRONMENT) {
      console.log('Database Host:', process.env.MYSQLHOST);
      console.log('Database Port:', process.env.MYSQLPORT);
      console.log('Database Name:', process.env.MYSQLDATABASE);
      console.log('Database User:', process.env.MYSQLUSER);
    }
    
    await sequelize.authenticate();
    console.log('DB connected successfully');
    
    // ensure table exists using sync (suitable for dev). In production use migrations.
    await sequelize.sync();
    console.log('Database synchronized');
    
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}

start();
