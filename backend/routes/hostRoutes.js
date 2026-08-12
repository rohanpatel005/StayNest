const express = require('express');
const router = express.Router();
const { getDashboard, getProfile, updateProfile } = require('../controllers/hostController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorizeRoles('host'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
