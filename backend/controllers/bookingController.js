const Booking = require('../models/Booking');

const createBooking = async (req, res) => {
  try {
    const { type, item, bookingDate, travelDate, returnDate, passengers, price } = req.body;

    if (!type || !item || !bookingDate || !travelDate || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required booking details',
      });
    }

    const booking = await Booking.create({
      user: req.user.id,
      type,
      item,
      bookingDate,
      travelDate,
      returnDate,
      passengers: passengers || 1,
      price,
      status: 'pending',
    });

    await booking.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
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

const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this booking',
      });
    }

    await booking.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
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
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  deleteBooking,
};
