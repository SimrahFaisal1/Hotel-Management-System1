const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Mongoose 6+ uses sensible defaults; passing legacy options causes errors
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully');
    
    // Create indexes for optimization
    const Hotel = require('./models/Hotel');
    const Booking = require('./models/Booking');
    
    await Hotel.createIndexes();
    await Booking.createIndexes();
    
    console.log('✅ Indexes created for fast queries');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;