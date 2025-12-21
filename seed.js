require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Booking = require('./models/Booking');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@hotel.com',
      password: 'admin123',
      role: 'admin'
    });

    const user1 = await User.create({
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      password: 'user123',
      role: 'user'
    });

    const user2 = await User.create({
      name: 'Sara Khan',
      email: 'sara@example.com',
      password: 'user123',
      role: 'user'
    });

    console.log('✅ Created users');

    // Create hotels
    const hotels = await Hotel.insertMany([
      {
        name: 'Pearl Continental Karachi',
        city: 'Karachi',
        address: 'Club Road, Karachi',
        description: 'Luxury 5-star hotel in the heart of Karachi with stunning city views, world-class dining, and premium amenities.',
        rating: 4.7,
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
        rooms: [
          {
            roomType: 'Single',
            capacity: 1,
            pricePerNight: 8000,
            totalRooms: 20,
            amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'],
            images: []
          },
          {
            roomType: 'Double',
            capacity: 2,
            pricePerNight: 12000,
            totalRooms: 30,
            amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'],
            images: []
          },
          {
            roomType: 'Suite',
            capacity: 4,
            pricePerNight: 25000,
            totalRooms: 10,
            amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Living Room', 'Jacuzzi'],
            images: []
          }
        ],
        amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'Room Service']
      },
      {
        name: 'Avari Towers Karachi',
        city: 'Karachi',
        address: 'Fatima Jinnah Road, Karachi',
        description: 'Premier business hotel offering modern amenities and exceptional service in the business district.',
        rating: 4.5,
        images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'],
        rooms: [
          {
            roomType: 'Single',
            capacity: 1,
            pricePerNight: 7000,
            totalRooms: 25,
            amenities: ['WiFi', 'TV', 'AC'],
            images: []
          },
          {
            roomType: 'Double',
            capacity: 2,
            pricePerNight: 11000,
            totalRooms: 35,
            amenities: ['WiFi', 'TV', 'AC', 'Work Desk'],
            images: []
          },
          {
            roomType: 'Deluxe',
            capacity: 3,
            pricePerNight: 18000,
            totalRooms: 15,
            amenities: ['WiFi', 'TV', 'AC', 'Work Desk', 'Lounge Access'],
            images: []
          }
        ],
        amenities: ['WiFi', 'Spa', 'Restaurant', 'Bar', '24/7 Service', 'Business Center']
      },
      {
        name: 'Marriott Hotel Lahore',
        city: 'Lahore',
        address: 'Shahrah-e-Quaid-e-Azam, Lahore',
        description: 'International luxury hotel in Lahore with world-class facilities and renowned hospitality.',
        rating: 4.8,
        images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
        rooms: [
          {
            roomType: 'Single',
            capacity: 1,
            pricePerNight: 9000,
            totalRooms: 30,
            amenities: ['WiFi', 'TV', 'AC', 'Safe'],
            images: []
          },
          {
            roomType: 'Double',
            capacity: 2,
            pricePerNight: 14000,
            totalRooms: 40,
            amenities: ['WiFi', 'TV', 'AC', 'Safe', 'Coffee Maker'],
            images: []
          },
          {
            roomType: 'Suite',
            capacity: 4,
            pricePerNight: 30000,
            totalRooms: 12,
            amenities: ['WiFi', 'TV', 'AC', 'Safe', 'Coffee Maker', 'Butler Service', 'Panoramic View'],
            images: []
          }
        ],
        amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Multiple Restaurants', 'Lounge', 'Valet Parking']
      },
      {
        name: 'Serena Hotel Islamabad',
        city: 'Islamabad',
        address: 'Khayaban-e-Suhrwardy, Islamabad',
        description: 'Elegant hotel nestled in the foothills of Margalla Hills with breathtaking views and serene ambiance.',
        rating: 4.9,
        images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'],
        rooms: [
          {
            roomType: 'Single',
            capacity: 1,
            pricePerNight: 10000,
            totalRooms: 20,
            amenities: ['WiFi', 'TV', 'AC', 'Mountain View'],
            images: []
          },
          {
            roomType: 'Double',
            capacity: 2,
            pricePerNight: 15000,
            totalRooms: 25,
            amenities: ['WiFi', 'TV', 'AC', 'Mountain View', 'Balcony'],
            images: []
          },
          {
            roomType: 'Deluxe',
            capacity: 3,
            pricePerNight: 22000,
            totalRooms: 18,
            amenities: ['WiFi', 'TV', 'AC', 'Mountain View', 'Balcony', 'Premium Bedding'],
            images: []
          }
        ],
        amenities: ['WiFi', 'Pool', 'Spa', 'Garden', 'Restaurant', 'Concierge', 'Tennis Court']
      }
    ]);

    console.log('✅ Created hotels');

    // Create sample bookings
    const bookings = await Booking.insertMany([
      {
        user: user1._id,
        hotel: hotels[0]._id,
        roomType: 'Double',
        checkIn: new Date('2025-01-15'),
        checkOut: new Date('2025-01-18'),
        guests: 2,
        totalPrice: 36000,
        status: 'confirmed'
      },
      {
        user: user2._id,
        hotel: hotels[1]._id,
        roomType: 'Suite',
        checkIn: new Date('2025-01-20'),
        checkOut: new Date('2025-01-23'),
        guests: 3,
        totalPrice: 54000,
        status: 'confirmed'
      },
      {
        user: user1._id,
        hotel: hotels[2]._id,
        roomType: 'Single',
        checkIn: new Date('2025-02-10'),
        checkOut: new Date('2025-02-12'),
        guests: 1,
        totalPrice: 18000,
        status: 'confirmed'
      }
    ]);

    console.log('✅ Created bookings');

    console.log('\n📊 Database seeded successfully!');
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@hotel.com / admin123');
    console.log('User: ahmed@example.com / user123');
    console.log('User: sara@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();