const express = require('express');
const router = express.Router();
const { 
  getConversations,
  getConversation,
  getMessages,
  markAsRead,
  createOrGetConversationFromBooking
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Both hosts and guests can use messages

router.route('/conversations')
  .get(getConversations);

router.route('/conversations/:id')
  .get(getConversation);

router.route('/conversations/:id/messages')
  .get(getMessages);

router.route('/conversations/:id/read')
  .post(markAsRead);

router.route('/conversations/from-booking/:bookingId')
  .post(createOrGetConversationFromBooking);

module.exports = router;
