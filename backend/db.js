const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect using environment variable
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");

    // Optional: create indexes for optimization
    const Hotel = require("./models/Hotel");
    const Booking = require("./models/Booking");

    await Hotel.createIndexes();
    await Booking.createIndexes();

    console.log("✅ Indexes created for fast queries");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Do NOT exit process in serverless
  }
};

module.exports = connectDB;
