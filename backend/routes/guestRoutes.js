const express = require('express');
const router = express.Router();
const { 
  getDashboard,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getTrips,
  getTrip,
  pricePreview,
  createOrder,
  cancelBooking,
  getRefundPreview,
  getRecommendations
} = require('../controllers/guestController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('guest'));

router.get('/dashboard', getDashboard);

// Wishlist
router.route('/wishlist')
  .get(getWishlist);
router.route('/wishlist/:listingId')
  .post(addToWishlist)
  .delete(removeFromWishlist);

// Trips & Bookings
router.route('/bookings/price-preview')
  .post(pricePreview);
router.route('/bookings/create-order')
  .post(createOrder);
router.route('/bookings')
  .get(getTrips);
router.route('/bookings/:id')
  .get(getTrip);
router.route('/bookings/:id/cancel')
  .post(cancelBooking);
router.route('/bookings/:id/refund')
  .get(getRefundPreview);

// Recommendations
router.route('/recommendations')
  .get(getRecommendations);

module.exports = router;
