const express = require('express');
const router = express.Router();
const { 
  getBookings, 
  getRecentBookings, 
  getBooking, 
  updateBookingStatus 
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('host'));

router.get('/', getBookings);
router.get('/recent', getRecentBookings);
router.get('/:id', getBooking);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
