const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redisClient');
const { startWebSocketServer } = require('./websocketServer');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const flightRoutes = require('./routes/flightRoutes');
const busRoutes = require('./routes/busRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const realtimeTrackerRoutes = require('./routes/realtimeTrackerRoutes');

dotenv.config();
connectDB();
connectRedis();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/realtime', realtimeTrackerRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Travel Booking API is running!',
    version: '1.0.0',
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;

// Start HTTP + WebSocket server
const httpServer = startWebSocketServer(app);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
