const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import DB connection
const connectDB = require("./db");

// Import routes
const authRoutes = require("./routes/auth");
const hotelRoutes = require("./routes/hotels");
const bookingRoutes = require("./routes/bookings");

const app = express();

/* ======================
   Middleware
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   Database Connection
====================== */
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

connectDB();

mongoose.connection.once("open", () => {
  console.log("🌐 Connected to MongoDB Atlas!");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

/* ======================
   Routes
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);

/* ======================
   Health Check
====================== */
app.get("/api", (req, res) => {
  res.json({ message: "✅ Backend is running successfully" });
});

/* ======================
   Export app (NO listen)
====================== */
module.exports = app;
