const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: {
    type: String,
    required: true,
    trim: true,
  },
  flightNumber: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  from: {
    type: String,
    required: true,
    trim: true,
  },
  to: {
    type: String,
    required: true,
    trim: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  arrivalDate: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  seatsAvailable: {
    type: Number,
    default: 0,
    min: [0, 'Seats available cannot be negative'],
  },
  totalSeats: {
    type: Number,
    default: 180,
    min: [1, 'Total seats must be at least 1'],
  },
  aircraftType: {
    type: String,
    default: '',
  },
  duration: {
    type: String,
    default: '',
  },
  stops: {
    type: Number,
    default: 0,
    min: [0, 'Stops cannot be negative'],
  },
}, {
  timestamps: true,
});

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
