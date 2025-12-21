const mongoose = require('mongoose');

// EMBEDDED DESIGN: Rooms are embedded in Hotel document
// WHY? Rooms are tightly coupled to hotels, updated together, and queried together
const roomSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Suite', 'Deluxe']
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [String],
  images: [String]
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true,
    index: true  // CRITICAL: Indexed for fast city searches
  },
  address: {
    type: String,
    required: true
  },
  description: String,
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4
  },
  images: [String],
  
  // EMBEDDED: Rooms are part of hotel document (read-optimized)
  rooms: [roomSchema],
  
  amenities: [String],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// COMPOUND INDEX: Fast search by city AND availability calculation
hotelSchema.index({ city: 1, 'rooms.roomType': 1 });

// TEXT INDEX: Search by hotel name or city
hotelSchema.index({ name: 'text', city: 'text', description: 'text' });

module.exports = mongoose.model('Hotel', hotelSchema);