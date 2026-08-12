const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const { initSocket } = require('./socket');
initSocket(server);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Routes
app.get('/api/test', (req, res) => res.send('TEST_SERVER_JS'));

const hostRoutes = require('./routes/hostRoutes');
const listingRoutes = require('./routes/listingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const earningsRoutes = require('./routes/earningsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const guestRoutes = require('./routes/guestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);

// Host APIs
app.use('/api/host', hostRoutes);
app.use('/api/host/listings', listingRoutes);
app.use('/api/host/bookings', bookingRoutes);
app.use('/api/host/earnings', earningsRoutes);
app.use('/api/host/reviews', reviewRoutes);

// Guest APIs
app.use('/api/guest', guestRoutes);

// Shared/Public APIs
app.use('/api/listings', listingRoutes); // for /search and /public/:id
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', require('./routes/sharedReviewRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
