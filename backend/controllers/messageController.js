const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Booking = require('../models/Booking');

// POST /api/messages/conversations/from-booking/:bookingId
exports.createOrGetConversationFromBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const userId = req.user._id;
    const isHost = req.user.role === 'host';

    const booking = await Booking.findById(bookingId).populate('listing');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Must be CONFIRMED or COMPLETED
    if (!['CONFIRMED', 'COMPLETED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Messaging is only allowed for confirmed or completed bookings' });
    }

    // Verify ownership
    if (isHost && booking.host.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (!isHost && booking.guest.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    let conversation = await Conversation.findOne({
      booking: booking._id,
    })
      .populate('guest', 'name profileImage')
      .populate('host', 'name profileImage')
      .populate('listing', 'title images location');

    if (!conversation) {
      // Only the guest should normally initiate, but host might from their dashboard if we let them.
      // We allow either, since they own the booking.
      conversation = await Conversation.create({
        guest: booking.guest,
        host: booking.host,
        listing: booking.listing._id,
        booking: booking._id,
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('guest', 'name profileImage')
        .populate('host', 'name profileImage')
        .populate('listing', 'title images location');
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    const isHost = req.user.role === 'host';
    const query = isHost ? { host: req.user._id } : { guest: req.user._id };

    const conversations = await Conversation.find(query)
      .populate('guest', 'name profileImage')
      .populate('host', 'name profileImage')
      .populate('listing', 'title images location')
      .populate('booking', 'status checkIn checkOut razorpayOrderId')
      .sort('-lastMessageAt');

    // Calculate unread counts
    const conversationIds = conversations.map(c => c._id);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          receiver: req.user._id,
          isRead: false
        }
      },
      {
        $group: {
          _id: '$conversation',
          count: { $sum: 1 }
        }
      }
    ]);

    const countMap = unreadCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const enrichedConversations = conversations.map(c => ({
      ...c.toObject(),
      unreadCount: countMap[c._id.toString()] || 0
    }));

    res.status(200).json({ success: true, data: enrichedConversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/messages/conversations/:id
exports.getConversation = async (req, res) => {
  try {
    const isHost = req.user.role === 'host';
    const query = { _id: req.params.id };
    
    if (isHost) {
      query.host = req.user._id;
    } else {
      query.guest = req.user._id;
    }

    const conversation = await Conversation.findOne(query)
      .populate('guest', 'name profileImage')
      .populate('host', 'name profileImage')
      .populate('listing', 'title images location')
      .populate('booking', 'status checkIn checkOut pricing guests');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found or unauthorized' });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/messages/conversations/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const isHost = req.user.role === 'host';
    const query = { _id: req.params.id };
    
    if (isHost) query.host = req.user._id;
    else query.guest = req.user._id;

    const conversation = await Conversation.findOne(query);
    if (!conversation) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // Simple pagination (fetch latest 50 for now)
    const messages = await Message.find({ conversation: conversation._id })
      .sort('createdAt') // Ascending order
      .limit(200);

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/messages/conversations/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const isHost = req.user.role === 'host';
    const query = { _id: req.params.id };
    
    if (isHost) query.host = req.user._id;
    else query.guest = req.user._id;

    const conversation = await Conversation.findOne(query);
    if (!conversation) return res.status(403).json({ success: false, message: 'Unauthorized' });

    await Message.updateMany(
      {
        conversation: conversation._id,
        receiver: req.user._id,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
