const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllBookings,
  createHotel,
  updateHotel,
  deleteHotel,
  createFlight,
  updateFlight,
  deleteFlight,
  createBus,
  updateBus,
  deleteBus,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/bookings', getAllBookings);

router.post('/hotels', createHotel);
router.put('/hotels/:id', updateHotel);
router.delete('/hotels/:id', deleteHotel);

router.post('/flights', createFlight);
router.put('/flights/:id', updateFlight);
router.delete('/flights/:id', deleteFlight);

router.post('/buses', createBus);
router.put('/buses/:id', updateBus);
router.delete('/buses/:id', deleteBus);

module.exports = router;
