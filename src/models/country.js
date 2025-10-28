const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Country = sequelize.define('Country', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  capital: { type: DataTypes.STRING },
  region: { type: DataTypes.STRING },
  population: { type: DataTypes.BIGINT, allowNull: false },
  currency_code: { type: DataTypes.STRING },
  exchange_rate: { type: DataTypes.DOUBLE },
  estimated_gdp: { type: DataTypes.DOUBLE },
  flag_url: { type: DataTypes.TEXT },
  last_refreshed_at: { type: DataTypes.DATE }
}, {
  tableName: 'countries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Country;
