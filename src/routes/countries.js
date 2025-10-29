const express = require('express');
const router = express.Router();
const controller = require('../controllers/countryController');

// POST & GET /countries/refresh
router.post('/refresh', controller.postRefresh);
router.get('/refresh', controller.postRefresh);  // Add GET support for easier testing

// GET /countries
router.get('/', controller.getCountries);

// GET /countries/image
router.get('/image', controller.getImage);

// GET /countries/:name
router.get('/:name', controller.getCountryByName);

// DELETE /countries/:name
router.delete('/:name', controller.deleteCountry);

module.exports = router;
