const express = require('express');
const {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
