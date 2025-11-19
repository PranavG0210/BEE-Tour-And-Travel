const express = require('express');
const {
  getAllHotels,
  getHotelById,
} = require('../controllers/hotelController');

const router = express.Router();

router.get('/', getAllHotels);
router.get('/:id', getHotelById);

module.exports = router;
