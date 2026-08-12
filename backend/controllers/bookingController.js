const Booking = require('../models/Booking');

exports.getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const query = { host: req.user._id };
    
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('guest', 'name email profileImage')
      .populate('listing', 'title images location')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        items: bookings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getRecentBookings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    const bookings = await Booking.find({ host: req.user._id })
      .populate('guest', 'name email profileImage')
      .populate('listing', 'title images')
      .sort('-createdAt')
      .limit(limit);

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error in getRecentBookings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      host: req.user._id,
    })
      .populate('guest', 'name email phone')
      .populate('listing');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Basic state machine validation
    const allowedTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    const booking = await Booking.findOne({ _id: req.params.id, host: req.user._id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!allowedTransitions[booking.status].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot transition booking from ${booking.status} to ${status}` 
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
