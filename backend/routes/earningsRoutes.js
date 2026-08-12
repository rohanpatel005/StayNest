const express = require('express');
const router = express.Router();
const { 
  getEarnings, 
  getEarningsOverview, 
  getTransactions 
} = require('../controllers/earningsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('host'));

router.get('/', getEarnings);
router.get('/overview', getEarningsOverview);
router.get('/transactions', getTransactions);

module.exports = router;
