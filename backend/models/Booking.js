const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['flights', 'hotels', 'buses'],
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  travelDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  passengers: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 passenger required'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
