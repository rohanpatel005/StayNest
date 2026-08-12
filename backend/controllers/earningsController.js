const Booking = require('../models/Booking');

exports.getEarnings = async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.user._id, paymentStatus: 'PAID' });
    
    let totalEarnings = 0;
    let pendingPayout = 0;
    let platformFees = 0;
    let completedPayout = 0;
    
    // Simple current month calculation
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let currentMonthEarnings = 0;

    bookings.forEach(b => {
      totalEarnings += b.hostEarning || 0;
      platformFees += b.platformFee || 0;
      
      if (b.status === 'CONFIRMED') {
        pendingPayout += b.hostEarning || 0;
      } else if (b.status === 'COMPLETED') {
        completedPayout += b.hostEarning || 0;
      }

      const txDate = new Date(b.createdAt);
      if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
        currentMonthEarnings += b.hostEarning || 0;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        currentMonthEarnings,
        pendingPayout,
        completedPayout,
        platformFees,
        netEarnings: totalEarnings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getEarningsOverview = async (req, res) => {
  try {
    // This is a simplified chart data generator for demonstration
    // A robust system would group transactions by month/week using MongoDB aggregations
    
    const bookings = await Booking.find({ host: req.user._id, status: 'COMPLETED' }).sort('createdAt');
    
    const chartData = {};
    
    bookings.forEach(b => {
      const month = new Date(b.createdAt).toLocaleString('default', { month: 'short' });
      if (!chartData[month]) {
        chartData[month] = { name: month, revenue: 0, bookings: 0 };
      }
      chartData[month].revenue += b.hostEarning || 0;
      chartData[month].bookings += 1;
    });

    res.status(200).json({
      success: true,
      data: Object.values(chartData)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const bookings = await Booking.find({ host: req.user._id, paymentStatus: 'PAID' })
      .populate('guest', 'name')
      .populate('listing', 'title')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const total = await Booking.countDocuments({ host: req.user._id, paymentStatus: 'PAID' });

    // Map bookings to the expected transaction shape for the frontend
    const mappedTransactions = bookings.map(b => ({
      _id: b._id,
      createdAt: b.createdAt,
      listing: b.listing,
      amount: {
        gross: b.pricing?.totalAmount || 0,
        platformFee: b.platformFee || 0,
        net: b.hostEarning || 0,
      },
      status: b.status === 'COMPLETED' ? 'completed' : b.status === 'CONFIRMED' ? 'pending' : 'cancelled'
    }));

    res.status(200).json({
      success: true,
      data: {
        items: mappedTransactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
