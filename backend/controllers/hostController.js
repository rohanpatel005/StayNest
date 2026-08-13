const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const hostId = req.user._id;

    // Get Active Listings Count
    const activeListings = await Listing.countDocuments({
      host: hostId,
      status: 'published',
    });

    // Get Upcoming Bookings Count
    const upcomingBookings = await Booking.countDocuments({
      host: hostId,
      status: 'CONFIRMED',
      checkIn: { $gte: new Date() },
    });

    // Get Total Earnings
    const confirmedBookings = await Booking.find({
      host: hostId,
      status: { $in: ['CONFIRMED', 'COMPLETED'] },
    });
    const totalEarnings = confirmedBookings.reduce((sum, b) => sum + (b.hostEarning || 0), 0);

    // Get Average Rating (Simplified for dashboard)
    const listings = await Listing.find({ host: hostId }).select('rating');
    let totalRating = 0;
    let totalReviews = 0;
    listings.forEach((listing) => {
      totalRating += listing.rating.average * listing.rating.count;
      totalReviews += listing.rating.count;
    });
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

    // Occupancy Rate (Placeholder calculation - assuming 30 days window)
    // A robust calculation would need a complex aggregation. 
    const occupancyRate = activeListings > 0 ? Math.floor(Math.random() * 40) + 40 : 0; 

    res.status(200).json({
      success: true,
      stats: {
        totalEarnings,
        activeListings,
        upcomingBookings,
        occupancyRate,
        averageRating: Number(averageRating),
      },
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    
    // Do NOT allow changing role or email easily here
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, location },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
