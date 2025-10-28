const express = require('express');
const bodyParser = require('body-parser');
const countriesRouter = require('./routes/countries');

const app = express();
app.use(bodyParser.json());

// simple health
app.get('/status', (req,res) => res.json({ message: 'Service up' }));

// Mount router at /countries
app.use('/countries', countriesRouter);

// Provided top-level status endpoint requested in spec: GET /status (show totals & last refresh)
const { getStatus } = require('./controllers/countryController');
app.get('/status', getStatus);

// global error handler fallback (ensures JSON)
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
