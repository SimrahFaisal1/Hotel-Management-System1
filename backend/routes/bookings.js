const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const auth = require('../middleware/auth');

const router = express.Router();

// Create booking
// Only regular users can create bookings (admins are not allowed)
router.post('/', auth, async (req, res) => {
  try {
    const { hotelId, roomType, checkIn, checkOut, guests } = req.body;
    const userId = req.user && (req.user.id || req.user._id);

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return res.status(403).json({ error: 'Admins cannot create bookings' });
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const room = hotel.rooms.find(r => r.roomType === roomType);
    if (!room) {
      return res.status(404).json({ error: 'Room type not found' });
    }

    // Count overlapping bookings to check availability
    const overlappingBookings = await Booking.countDocuments({
      hotel: hotelId,
      roomType,
      status: { $ne: 'cancelled' },
      $or: [
        {
          checkIn: { $lt: new Date(checkOut) },
          checkOut: { $gt: new Date(checkIn) }
        }
      ]
    });

    const availableRooms = room.totalRooms - overlappingBookings;

    if (availableRooms <= 0) {
      return res.status(400).json({ error: 'No rooms available for selected dates' });
    }

    // Calculate price
    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = room.pricePerNight * nights;

    // Create booking
    const booking = new Booking({
      user: userId,
      hotel: hotelId,
      roomType,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests,
      totalPrice,
      status: 'confirmed'
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking confirmed',
      booking: await booking.populate('hotel')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user bookings
// Users can only fetch their own bookings; admins can fetch any user's bookings
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;

    if (req.user.role !== 'admin' && (req.user.id !== requestedUserId && req.user._id !== requestedUserId)) {
      return res.status(403).json({ error: 'Not authorized to view these bookings' });
    }

    const bookings = await Booking.find({ user: requestedUserId })
      .populate('hotel')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings (Admin - with AGGREGATION for analytics)
// Admin-only
router.get('/admin/analytics', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  try {
    // AGGREGATION PIPELINE: Calculate revenue, bookings, etc.
    const analytics = await Booking.aggregate([
      {
        $match: { status: 'confirmed' }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          avgBookingValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    // Bookings by hotel
    const bookingsByHotel = await Booking.aggregate([
      {
        $match: { status: 'confirmed' }
      },
      {
        $group: {
          _id: '$hotel',
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotelInfo'
        }
      },
      {
        $unwind: '$hotelInfo'
      },
      {
        $project: {
          hotelName: '$hotelInfo.name',
          city: '$hotelInfo.city',
          bookings: '$count',
          revenue: 1
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    res.json({
      overview: analytics[0] || { totalBookings: 0, totalRevenue: 0, avgBookingValue: 0 },
      byHotel: bookingsByHotel
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings (Admin only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('hotel', 'name city')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status (Admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('hotel')
      .populate('user');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking updated', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking (Admin only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;