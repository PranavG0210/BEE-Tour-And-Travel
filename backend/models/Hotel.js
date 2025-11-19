const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0,
  },
  amenities: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  roomsAvailable: {
    type: Number,
    default: 0,
    min: [0, 'Rooms available cannot be negative'],
  },
  checkInTime: {
    type: String,
    default: '14:00',
  },
  checkOutTime: {
    type: String,
    default: '11:00',
  },
}, {
  timestamps: true,
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
