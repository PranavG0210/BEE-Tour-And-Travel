const express = require('express');
const {
  getAllFlights,
  getFlightById,
} = require('../controllers/flightController');

const router = express.Router();

router.get('/', getAllFlights);
router.get('/:id', getFlightById);

module.exports = router;
