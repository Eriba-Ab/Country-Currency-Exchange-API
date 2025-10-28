const axios = require('axios');

const COUNTRIES_URL = 'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
const EXCHANGE_URL = 'https://open.er-api.com/v6/latest/USD';

async function fetchWithTimeout(url, timeout) {
  const source = axios.CancelToken.source();
  const timer = setTimeout(() => source.cancel(`Timeout after ${timeout}ms`), timeout);
  try {
    const res = await axios.get(url, { cancelToken: source.token, timeout });
    clearTimeout(timer);
    return res.data;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function fetchCountries(timeoutMs) {
  return await fetchWithTimeout(COUNTRIES_URL, timeoutMs);
}

async function fetchExchangeRates(timeoutMs) {
  return await fetchWithTimeout(EXCHANGE_URL, timeoutMs);
}

module.exports = {
  fetchCountries,
  fetchExchangeRates
};
