require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function start() {
  try {
    // Add a small delay to ensure database is ready
    if (process.env.DATABASE_URL) {
      console.log('Waiting for database to be ready...');
      await wait(5000); // 5 second delay
    }
    
    await sequelize.authenticate();
    console.log('DB connected');
    // ensure table exists using sync (suitable for dev). In production use migrations.
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}

start();
