require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const bookingRoutes = require('./routes/bookings');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);

// Serve frontend static files from ../frontend
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Serve index.html for root and for any non-API GET requests (SPA support)
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, () => {
  const base = `http://${HOST}:${PORT}`;
  console.log(`\n🚀 Server running at ${base}`);
  console.log(`🔗 API base: ${base}/api`);
  console.log(`\n📖 Open ${base} in your browser to view the frontend.\n`);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('📝 DEMO CREDENTIALS FOR TESTING');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n👤 REGULAR USER:');
  console.log('   Email: ahmed@example.com');
  console.log('   Password: user123');
  console.log('\n👤 ANOTHER USER:');
  console.log('   Email: sara@example.com');
  console.log('   Password: user123');
  console.log('\n🔐 ADMIN USER:');
  console.log('   Email: admin@hotel.com');
  console.log('   Password: admin123');
  console.log('═══════════════════════════════════════════════════════\n');
});

// Handle server errors
server.on('error', (err) => {
  console.error(`❌ Server error: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown on signals
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});