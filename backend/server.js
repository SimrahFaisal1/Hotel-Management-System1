const express = require("express");
const cors = require("cors");
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
   Export app (serverless)
====================== */
module.exports = app;
