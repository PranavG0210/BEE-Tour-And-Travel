const express = require('express');
const {
  getAllBuses,
  getBusById,
} = require('../controllers/busController');

const router = express.Router();

router.get('/', getAllBuses);
router.get('/:id', getBusById);

module.exports = router;
