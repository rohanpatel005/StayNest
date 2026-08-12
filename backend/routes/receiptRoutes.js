const express = require('express');
const router = express.Router({ mergeParams: true }); // Important to get :bookingId
const { downloadReceipt } = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');

// Route requires authentication
router.use(protect);

router.get('/download', downloadReceipt);

module.exports = router;
