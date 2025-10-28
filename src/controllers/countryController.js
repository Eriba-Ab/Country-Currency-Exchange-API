const { fetchCountries, fetchExchangeRates } = require('../utils/fetchExternal');
const { generateSummaryImage } = require('../utils/imageSummary');
const { sequelize, Country } = require('../models');
const { Op } = require('sequelize');
const path = require('path');

const EXTERNAL_TIMEOUT = parseInt(process.env.EXTERNAL_TIMEOUT || '15000', 10);
const SUMMARY_PATH = path.join(__dirname, '..', '..', 'cache', 'summary.png');

function randMultiplier() {
  // integer between 1000 and 2000 inclusive
  return Math.floor(Math.random() * 1001) + 1000;
}

async function postRefresh(req, res) {
  // Fetch external APIs first
  let countriesData, exchangeData;
  try {
    countriesData = await fetchCountries(EXTERNAL_TIMEOUT);
  } catch (err) {
    return res.status(503).json({ error: 'External data source unavailable', details: 'Could not fetch data from Countries API' });
  }
  try {
    exchangeData = await fetchExchangeRates(EXTERNAL_TIMEOUT);
  } catch (err) {
    return res.status(503).json({ error: 'External data source unavailable', details: 'Could not fetch data from Exchange Rates API' });
  }

  if (!Array.isArray(countriesData)) {
    return res.status(503).json({ error: 'External data source unavailable', details: 'Countries API returned unexpected data' });
  }

  const rates = (exchangeData && exchangeData.rates) ? exchangeData.rates : null;
  // wrap DB updates in transaction: do not modify DB if something fails mid-process
  const t = await sequelize.transaction();
  try {
    const now = new Date();
    const processed = [];

    for (const item of countriesData) {
      // Validate name & population presence
      const name = item.name || null;
      const population = (item.population != null) ? Number(item.population) : null;

      if (!name || population == null) {
        // skip invalid record but continue (per spec we require name & population)
        continue;
      }

      const capital = item.capital || null;
      const region = item.region || null;
      const flag_url = item.flag || null;

      // currency handling: if multiple, take first; if empty -> null
      let currency_code = null;
      if (Array.isArray(item.currencies) && item.currencies.length > 0) {
        // each currency item may have 'code'
        const first = item.currencies[0];
        currency_code = first && first.code ? first.code : null;
      }

      let exchange_rate = null;
      let estimated_gdp = null;

      if (!currency_code) {
        // per spec: don't call exchange for this country; set exchange_rate null and estimated_gdp 0
        exchange_rate = null;
        estimated_gdp = 0;
      } else {
        // look up rate in rates (rates are number of units per USD - the API returns USD as base)
        // open.er-api returns rates like { "rates": { "NGN": 1600.23, ... } } meaning 1 USD = 1600.23 NGN
        // The spec wants exchange_rate matched as e.g. NGN -> 1600
        exchange_rate = (rates && Object.prototype.hasOwnProperty.call(rates, currency_code)) ? Number(rates[currency_code]) : null;
        if (exchange_rate == null) {
          estimated_gdp = null;
        } else {
          const mult = randMultiplier();
          estimated_gdp = (population * mult) / exchange_rate;
        }
      }

      // Upsert logic: match by name (case-insensitive)
      const [country, created] = await Country.findOrCreate({
        where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), name.toLowerCase()),
        defaults: {
          name,
          capital,
          region,
          population,
          currency_code,
          exchange_rate,
          estimated_gdp,
          flag_url,
          last_refreshed_at: now
        },
        transaction: t
      });

      if (!created) {
        // Update all fields
        country.capital = capital;
        country.region = region;
        country.population = population;
        country.currency_code = currency_code;
        country.exchange_rate = exchange_rate;
        country.estimated_gdp = estimated_gdp;
        country.flag_url = flag_url;
        country.last_refreshed_at = now;
        await country.save({ transaction: t });
      }

      processed.push(country);
    }

    // commit transaction
    await t.commit();

    // after saving, generate summary image
    // get totals & top5 from DB (fresh query)
    const total = await Country.count();
    const topRows = await Country.findAll({
      where: { estimated_gdp: { [Op.not]: null } },
      order: [['estimated_gdp', 'DESC']],
      limit: 5
    });

    const top5 = topRows.map(r => ({
      name: r.name,
      estimated_gdp: r.estimated_gdp
    }));

    await generateSummaryImage({ total, top5, timestamp: now, outPath: SUMMARY_PATH });

    // Save global last refresh timestamp in a lightweight way: update all rows' last_refreshed_at already done
    return res.json({ message: 'Refresh completed', total_processed: processed.length, last_refreshed_at: now.toISOString() });
  } catch (err) {
    await t.rollback();
    console.error('Refresh failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCountries(req, res) {
  const { region, currency, sort } = req.query;
  const where = {};
  if (region) where.region = region;
  if (currency) where.currency_code = currency;

  const order = [];
  if (sort === 'gdp_desc') order.push(['estimated_gdp', 'DESC']);
  if (sort === 'gdp_asc') order.push(['estimated_gdp', 'ASC']);
  if (order.length === 0) order.push(['name', 'ASC']);

  try {
    const countries = await Country.findAll({ where, order });
    return res.json(countries.map(c => ({
      id: c.id,
      name: c.name,
      capital: c.capital,
      region: c.region,
      population: c.population,
      currency_code: c.currency_code,
      exchange_rate: c.exchange_rate,
      estimated_gdp: c.estimated_gdp,
      flag_url: c.flag_url,
      last_refreshed_at: c.last_refreshed_at ? c.last_refreshed_at.toISOString() : null
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCountryByName(req, res) {
  const name = req.params.name;
  if (!name) return res.status(400).json({ error: 'Validation failed', details: { name: 'is required' } });

  try {
    const country = await Country.findOne({
      where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), name.toLowerCase())
    });
    if (!country) return res.status(404).json({ error: 'Country not found' });

    return res.json({
      id: country.id,
      name: country.name,
      capital: country.capital,
      region: country.region,
      population: country.population,
      currency_code: country.currency_code,
      exchange_rate: country.exchange_rate,
      estimated_gdp: country.estimated_gdp,
      flag_url: country.flag_url,
      last_refreshed_at: country.last_refreshed_at ? country.last_refreshed_at.toISOString() : null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteCountry(req, res) {
  const name = req.params.name;
  if (!name) return res.status(400).json({ error: 'Validation failed', details: { name: 'is required' } });

  try {
    const destroyed = await Country.destroy({
      where: sequelize.where(sequelize.fn('lower', sequelize.col('name')), name.toLowerCase())
    });
    if (!destroyed) return res.status(404).json({ error: 'Country not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getStatus(req, res) {
  try {
    const total = await Country.count();
    const row = await Country.findOne({ order: [['last_refreshed_at', 'DESC']] });
    const last_refreshed_at = row && row.last_refreshed_at ? row.last_refreshed_at.toISOString() : null;
    return res.json({ total_countries: total, last_refreshed_at });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const path = require('path');
const fs = require('fs');
async function getImage(req, res) {
  if (!fs.existsSync(SUMMARY_PATH)) {
    return res.status(404).json({ error: 'Summary image not found' });
  }
  return res.sendFile(SUMMARY_PATH);
}

module.exports = {
  postRefresh,
  getCountries,
  getCountryByName,
  deleteCountry,
  getStatus,
  getImage
};
