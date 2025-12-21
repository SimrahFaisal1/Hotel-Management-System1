const mongoose = require('mongoose');

// REFERENCED DESIGN: Bookings reference User and Hotel by ID
// WHY? Bookings need to query across users/hotels independently
const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // Fast lookup by user
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
    index: true  // Fast lookup by hotel
  },
  roomType: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: true,
    index: true  // CRITICAL: Indexed for date range queries
  },
  checkOut: {
    type: Date,
    required: true,
    index: true  // CRITICAL: Indexed for date range queries
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// COMPOUND INDEX: Critical for availability checking
// Finds overlapping bookings for a hotel + room type + date range
bookingSchema.index({ 
  hotel: 1, 
  roomType: 1, 
  checkIn: 1, 
  checkOut: 1,
  status: 1 
});

// Index for user booking history
bookingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);