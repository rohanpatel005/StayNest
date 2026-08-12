const express = require('express');
const router = express.Router();
const { getReviews, replyToReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('host'));

router.get('/', getReviews);
router.patch('/:id/reply', replyToReview);

module.exports = router;
