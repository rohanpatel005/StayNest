const express = require('express');
const router = express.Router();
const { 
  createReview, 
  getListingReviews, 
  getGuestReviews,
  getReviewByBooking
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/listing/:listingId', getListingReviews);

router.use(protect);
router.post('/', createReview);
router.get('/guest', getGuestReviews);
router.get('/booking/:bookingId', getReviewByBooking);

module.exports = router;
