const express = require('express');
const router = express.Router();
const { 
  createReview, 
  getListingReviews, 
  getGuestReviews 
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/listing/:listingId', getListingReviews);

router.use(protect);
router.post('/', createReview);
router.get('/guest', getGuestReviews);

module.exports = router;
