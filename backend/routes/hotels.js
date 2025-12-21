const express = require('express');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Search hotels with availability (ADVANCED AGGREGATION)
router.get('/search', async (req, res) => {
  try {
    const { city, checkIn, checkOut, guests } = req.query;

    if (!city || !checkIn || !checkOut) {
      return res.status(400).json({ error: 'City, check-in, and check-out are required' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Step 1: Find hotels in the city
    const hotels = await Hotel.find({ 
      city: new RegExp(city, 'i') 
    });

    // Step 2: For each hotel, calculate availability using AGGREGATION
    const hotelsWithAvailability = await Promise.all(
      hotels.map(async (hotel) => {
        const roomsWithAvailability = await Promise.all(
          hotel.rooms.map(async (room) => {
            // AGGREGATION PIPELINE: Count overlapping bookings
            const bookedCount = await Booking.aggregate([
              {
                $match: {
                  hotel: hotel._id,
                  roomType: room.roomType,
                  status: { $ne: 'cancelled' },
                  $or: [
                    {
                      checkIn: { $lt: checkOutDate },
                      checkOut: { $gt: checkInDate }
                    }
                  ]
                }
              },
              {
                $count: 'total'
              }
            ]);

            const bookedRooms = bookedCount[0]?.total || 0;
            const availableRooms = room.totalRooms - bookedRooms;

            return {
              ...room.toObject(),
              availableRooms,
              isAvailable: availableRooms > 0
            };
          })
        );

        const hasAvailability = roomsWithAvailability.some(r => r.isAvailable);

        return {
          ...hotel.toObject(),
          rooms: roomsWithAvailability,
          hasAvailability
        };
      })
    );

    // Filter hotels with available rooms
    const availableHotels = hotelsWithAvailability.filter(h => h.hasAvailability);

    res.json({
      hotels: availableHotels,
      count: availableHotels.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check availability by room type and date
// Usage: GET /api/hotels/availability/check?roomType=Deluxe&date=2025-12-15
router.get('/availability/check', async (req, res) => {
  try {
    const { roomType, date } = req.query;

    if (!roomType || !date) {
      return res.status(400).json({ 
        error: 'Room type and date are required',
        example: '/api/hotels/availability/check?roomType=Deluxe&date=2025-12-15'
      });
    }

    // Parse the date
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(checkDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Find all hotels with the requested room type
    const hotels = await Hotel.find({
      'rooms.roomType': roomType
    });

    if (hotels.length === 0) {
      return res.json({
        available: false,
        roomType: roomType,
        date: date,
        message: `Sorry, no hotels have ${roomType} rooms available.`
      });
    }

    // Check booking conflicts for each hotel
    const availabilityResults = await Promise.all(
      hotels.map(async (hotel) => {
        const room = hotel.rooms.find(r => r.roomType === roomType);
        if (!room) return null;

        // Count overlapping bookings for this date
        const bookedCount = await Booking.countDocuments({
          hotel: hotel._id,
          roomType: roomType,
          status: { $ne: 'cancelled' },
          $or: [
            {
              checkIn: { $lt: nextDate },
              checkOut: { $gt: checkDate }
            }
          ]
        });

        const availableRooms = room.totalRooms - bookedCount;
        return {
          hotelName: hotel.name,
          hotelCity: hotel.city,
          roomType: roomType,
          availableRooms: Math.max(0, availableRooms),
          totalRooms: room.totalRooms,
          pricePerNight: room.pricePerNight,
          available: availableRooms > 0
        };
      })
    );

    // Filter out null results
    const validResults = availabilityResults.filter(r => r !== null);
    const availableHotels = validResults.filter(r => r.available);

    res.json({
      roomType: roomType,
      date: date,
      totalHotels: validResults.length,
      availableCount: availableHotels.length,
      available: availableHotels.length > 0,
      hotels: availableHotels.length > 0 
        ? availableHotels 
        : validResults.map(h => ({ ...h, status: 'Fully booked' }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add hotel (Admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json({ message: 'Hotel created', hotel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update hotel (Admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json({ message: 'Hotel updated', hotel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete hotel (Admin only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    res.json({ message: 'Hotel deleted', hotel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all hotels (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all cities (for autocomplete)
router.get('/autocomplete/cities', async (req, res) => {
  try {
    const cities = await Hotel.distinct('city');
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;