const fs = require('fs');
const path = require('path');
const sequelize = require('../config/sequelize');

async function runMigration() {
  try {
    await sequelize.authenticate();
    const sql = fs.readFileSync(path.join(__dirname, 'countries_table.sql'), 'utf8');
    await sequelize.query(sql);
    console.log('Migration applied.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
