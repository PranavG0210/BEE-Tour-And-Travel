const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({

  busNumber: {
    type: String,
    required: true,
    trim: true,
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
    default: 50,
    min: [1, 'Total seats must be at least 1'],
  },
  busType: {
    type: String,
    enum: ['Standard', 'Sleeper', 'Semi-Sleeper', 'AC', 'Non-AC'],
    default: 'Standard',
  },
  amenities: {
    type: [String],
    default: [],
  },
  duration: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;
