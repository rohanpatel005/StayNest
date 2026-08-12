const Wishlist = require('../models/Wishlist');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Upcoming Trips
    const upcomingTrips = await Booking.find({
      guest: userId,
      checkIn: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    }).populate('listing').sort('checkIn').limit(3);

    // Recently Viewed
    const user = await User.findById(userId).populate('recentlyViewed');
    const recentlyViewed = user.recentlyViewed || [];

    // Recommended (Basic recommendation: randomly pick 4 published listings not owned by user)
    const recommended = await Listing.aggregate([
      { $match: { status: 'published', host: { $ne: userId } } },
      { $sample: { size: 4 } }
    ]);
    
    // We need to populate the recommended after aggregate if needed, but aggregate returns raw docs
    // Let's just do a normal find with limit for simplicity and robustness if aggregate is complex
    const simpleRecommended = await Listing.find({ status: 'published', host: { $ne: userId } }).limit(4);

    res.status(200).json({
      success: true,
      data: {
        upcomingTrips,
        recentlyViewed,
        recommended: simpleRecommended
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ guest: req.user._id }).populate('listings');
    if (!wishlist) {
      wishlist = await Wishlist.create({ guest: req.user._id, listings: [] });
    }
    res.status(200).json({ success: true, data: wishlist.listings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ guest: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ guest: req.user._id, listings: [] });
    }
    
    if (!wishlist.listings.includes(req.params.listingId)) {
      wishlist.listings.push(req.params.listingId);
      await wishlist.save();
    }
    
    // Return populated wishlist
    wishlist = await Wishlist.findOne({ guest: req.user._id }).populate('listings');
    res.status(200).json({ success: true, data: wishlist.listings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ guest: req.user._id });
    if (wishlist) {
      wishlist.listings = wishlist.listings.filter(id => id.toString() !== req.params.listingId);
      await wishlist.save();
    }
    wishlist = await Wishlist.findOne({ guest: req.user._id }).populate('listings');
    res.status(200).json({ success: true, data: wishlist ? wishlist.listings : [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate('listing')
      .populate('host', 'name email profileImage')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getTrip = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, guest: req.user._id })
      .populate('listing')
      .populate('host', 'name email profileImage');
      
    if (!booking) return res.status(404).json({ success: false, message: 'Trip not found' });
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const pricingService = require('../services/pricingService');
const availabilityService = require('../services/availabilityService');

exports.pricePreview = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    
    // Check for overlapping bookings using availabilityService
    const hasOverlap = await availabilityService.hasOverlappingBooking(listingId, checkIn, checkOut);
    if (hasOverlap) {
      return res.status(409).json({ success: false, message: 'Dates are not available' });
    }

    try {
      const pricing = pricingService.calculateBookingPrice(listing, checkIn, checkOut, guests);
      res.status(200).json({ success: true, data: pricing });
    } catch (pricingError) {
      return res.status(400).json({ success: false, message: pricingError.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    
    // Prevent booking own listing
    if (listing.host.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot book your own listing' });
    }

    // Check for overlapping bookings using availabilityService
    const hasOverlap = await availabilityService.hasOverlappingBooking(listingId, checkIn, checkOut);
    if (hasOverlap) {
      return res.status(409).json({ success: false, message: 'Dates are not available' });
    }

    // Calculate prices again using pricingService
    let pricing;
    try {
      pricing = pricingService.calculateBookingPrice(listing, checkIn, checkOut, guests);
    } catch (pricingError) {
      return res.status(400).json({ success: false, message: pricingError.message });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const amountInPaise = Math.round(pricing.total * 100);

    // Create Razorpay Order
    let razorpayOrderId;
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder_key') {
      razorpayOrderId = `order_dummy_${Date.now()}`;
    } else {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const orderOptions = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${req.user._id.toString().substring(0, 5)}`,
      };

      const razorpayOrder = await razorpay.orders.create(orderOptions);
      razorpayOrderId = razorpayOrder.id;
    }

    const booking = await Booking.create({
      guest: req.user._id,
      host: listing.host,
      listing: listingId,
      checkIn: start,
      checkOut: end,
      guests,
      pricing: {
        perNight: listing.pricing.perNight,
        nights: pricing.nights,
        cleaningFee: pricing.cleaningFee,
        serviceFee: pricing.serviceFee,
        totalAmount: pricing.total
      },
      platformFee: 0,
      hostEarning: pricing.total,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      razorpayOrderId: razorpayOrderId
    });

    const payment = await Payment.create({
      user: req.user._id,
      booking: booking._id,
      property: listingId,
      host: listing.host,
      razorpayOrderId: razorpayOrderId,
      amount: pricing.total,
      currency: 'INR',
      status: 'PENDING',
      platformFee: 0,
      hostEarning: pricing.total
    });

    booking.paymentReference = payment._id;
    await booking.save();

    res.status(201).json({ 
      success: true, 
      data: {
        bookingId: booking._id,
        razorpayOrderId: razorpayOrderId,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID
      } 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const calculateRefund = (booking) => {
  if (booking.status === 'PENDING_PAYMENT') return { refundAmount: 0, refundPercentage: 0 };
  
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const diffTime = checkIn - now;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  let refundPercentage = 0;
  if (diffDays >= 7) {
    refundPercentage = 100;
  } else if (diffDays >= 3) {
    refundPercentage = 50;
  } else {
    refundPercentage = 0;
  }

  const refundAmount = (booking.pricing.totalAmount * refundPercentage) / 100;
  return { refundAmount, refundPercentage, diffDays };
};

exports.getRefundPreview = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, guest: req.user._id })
      .populate('listing', 'title location');
      
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['COMPLETED', 'CANCELLED', 'REFUNDED', 'EXPIRED'].includes(booking.status.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Cancellation is no longer available for this booking.' });
    }

    const { refundAmount, refundPercentage, diffDays } = calculateRefund(booking);

    let policyMessage = "No refund because cancellation is less than 3 days before check-in.";
    if (diffDays >= 7) policyMessage = "Full refund because cancellation is more than 7 days before check-in.";
    else if (diffDays >= 3) policyMessage = "50% refund because cancellation is 3-6 days before check-in.";

    res.status(200).json({
      success: true,
      data: {
        amountPaid: booking.pricing.totalAmount,
        expectedRefund: refundAmount,
        refundPercentage,
        cancellationPolicy: policyMessage,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        propertyTitle: booking.listing?.title
      }
    });
  } catch (error) {
    console.error('Error in getRefundPreview:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, guest: req.user._id });
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (['COMPLETED', 'CANCELLED', 'REFUNDED', 'EXPIRED'].includes(booking.status.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled or cannot be cancelled.' });
    }

    // Allow cancellation anytime, but calculateRefund will return 0% if past check-in

    const payment = await Payment.findOne({ booking: booking._id });
    const { refundAmount } = calculateRefund(booking);

    let razorpayRefundId = null;
    let finalRefundStatus = 'NOT_REQUIRED';
    let finalPaymentStatus = payment?.status || 'PENDING';

    if (payment && payment.status === 'PAID' && refundAmount > 0) {
      if (payment.refundStatus === 'PROCESSED' || payment.refundId) {
        return res.status(400).json({ success: false, message: 'Refund has already been processed for this booking.' });
      }

      try {
        if (process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder_key') {
          razorpayRefundId = `rfnd_dummy_${Date.now()}`;
        } else {
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });

          const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: Math.round(refundAmount * 100),
            receipt: `rfnd_${booking._id}`,
          });
          razorpayRefundId = refund.id;
        }

        finalRefundStatus = 'PROCESSED';
        
        if (refundAmount === payment.amount) {
          finalPaymentStatus = 'REFUNDED';
        } else {
          finalPaymentStatus = 'PARTIALLY_REFUNDED';
        }
      } catch (refundError) {
        console.error('Razorpay refund error:', refundError);
        return res.status(500).json({ 
          success: false, 
          message: 'Cancellation could not be completed because the refund could not be processed. Please try again.' 
        });
      }
    } else if (booking.status === 'PENDING_PAYMENT') {
       finalPaymentStatus = 'FAILED'; 
       finalRefundStatus = 'NOT_REQUIRED';
    }

    booking.status = 'CANCELLED';
    booking.paymentStatus = finalPaymentStatus;
    booking.refundAmount = refundAmount;
    booking.refundStatus = finalRefundStatus;
    booking.cancellationReason = req.body.reason || 'User cancelled';
    booking.cancelledAt = new Date();
    booking.hostEarning = booking.pricing.totalAmount - refundAmount;
    await booking.save();

    if (payment) {
      payment.status = finalPaymentStatus;
      payment.refundId = razorpayRefundId;
      payment.refundAmount = refundAmount;
      payment.refundStatus = finalRefundStatus;
      payment.refundedAt = new Date();
      payment.hostEarning = payment.amount - refundAmount;
      await payment.save();
    }

    await Notification.create([{
      recipient: booking.guest,
      type: 'booking_update',
      title: 'Booking Cancelled',
      message: `Your booking has been cancelled successfully. ${refundAmount > 0 ? `A refund of ₹${refundAmount} is being processed.` : ''}`,
      link: '/guest/trips'
    }]);

    await Notification.create([{
      recipient: booking.host,
      type: 'booking_update',
      title: 'Booking Cancelled',
      message: `A guest cancelled their booking.`,
      link: '/host/bookings'
    }]);

    res.status(200).json({ 
      success: true, 
      message: 'Booking cancelled successfully',
      data: {
        bookingId: booking._id,
        bookingStatus: booking.status,
        paymentStatus: booking.paymentStatus,
        refundAmount: booking.refundAmount,
        refundStatus: booking.refundStatus
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const recommendationService = require('../services/recommendationService');

exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const recommendations = await recommendationService.getRecommendations(user);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


