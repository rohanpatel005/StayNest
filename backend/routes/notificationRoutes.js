const express = require('express');
const router = express.Router();
const { 
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Both guests and hosts

router.route('/')
  .get(getNotifications);

router.route('/read-all')
  .patch(markAllAsRead);

router.route('/:id/read')
  .patch(markAsRead);

module.exports = router;
