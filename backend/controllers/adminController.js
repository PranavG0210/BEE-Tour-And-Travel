const User = require('../models/User');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const Flight = require('../models/Flight');
const Bus = require('../models/Bus');
const { deleteCache, deleteCachePattern } = require('../config/redisClient');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalBookings = await Booking.countDocuments();
    const totalHotels = await Hotel.countDocuments();
    const totalFlights = await Flight.countDocuments();
    const totalBuses = await Bus.countDocuments();

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          users: {
            total: totalUsers,
            admins: totalAdmins,
          },
          bookings: {
            total: totalBookings,
            pending: pendingBookings,
            confirmed: confirmedBookings,
            cancelled: cancelledBookings,
          },
          items: {
            hotels: totalHotels,
            flights: totalFlights,
            buses: totalBuses,
          },
        },
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (user or admin)',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: { bookings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    
    await deleteCachePattern('hotels:*');
    
    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: { hotel },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const updateHotel = async (req, res) => {
  try {
    let hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }
    
    hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    await deleteCache(`hotels:${req.params.id}`);
    await deleteCache('hotels:all');
    
    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: { hotel },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }
    
    await hotel.deleteOne();
    
    await deleteCache(`hotels:${req.params.id}`);
    await deleteCache('hotels:all');
    
    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    
    await deleteCachePattern('flights:*');
    
    res.status(201).json({
      success: true,
      message: 'Flight created successfully',
      data: { flight },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const updateFlight = async (req, res) => {
  try {
    let flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found',
      });
    }
    
    flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    await deleteCache(`flights:${req.params.id}`);
    await deleteCache('flights:all');
    
    res.status(200).json({
      success: true,
      message: 'Flight updated successfully',
      data: { flight },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found',
      });
    }
    
    await flight.deleteOne();
    
    await deleteCache(`flights:${req.params.id}`);
    await deleteCache('flights:all');
    
    res.status(200).json({
      success: true,
      message: 'Flight deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    
    await deleteCachePattern('buses:*');
    
    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: { bus },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const updateBus = async (req, res) => {
  try {
    let bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }
    
    bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    await deleteCache(`buses:${req.params.id}`);
    await deleteCache('buses:all');
    
    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      data: { bus },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found',
      });
    }
    
    await bus.deleteOne();
    
    await deleteCache(`buses:${req.params.id}`);
    await deleteCache('buses:all');
    
    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
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
};
