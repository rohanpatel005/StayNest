const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);

// Example of protected routes (for testing)
router.get('/profile', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.get('/host/dashboard', protect, authorizeRoles('host'), (req, res) => {
  res.json({ success: true, message: 'Welcome to Host Dashboard' });
});

module.exports = router;
