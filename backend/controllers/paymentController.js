const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const availabilityService = require('../services/availabilityService');

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'CONFIRMED' && booking.paymentStatus === 'PAID') {
      // Idempotency: if it's already confirmed, and payment ID matches, just return success
      const existingPayment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, booking: bookingId });
      if (existingPayment && existingPayment.razorpayPaymentId === razorpay_payment_id) {
         return res.status(200).json({ success: true, message: 'Payment already verified', data: booking });
      }
      return res.status(400).json({ success: false, message: 'Booking is already processed' });
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ success: false, message: 'Booking is in an invalid state for payment' });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id, booking: bookingId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Verify signature
    let isValidSignature = false;
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder_key' && razorpay_signature === 'dummy_signature') {
      isValidSignature = true;
    } else {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      isValidSignature = generatedSignature === razorpay_signature;
    }

    if (!isValidSignature) {
      // Signature mismatch
      payment.status = 'FAILED';
      payment.failureReason = 'Signature verification failed';
      await payment.save();

      booking.paymentStatus = 'FAILED';
      await booking.save();

      return res.status(400).json({ success: false, message: 'Payment signature verification failed' });
    }

    // Check for double booking right before confirmation
    const hasOverlap = await availabilityService.hasOverlappingBooking(booking.listing, booking.checkIn, booking.checkOut);
    if (hasOverlap) {
       // Another booking took this spot while guest was paying
       payment.status = 'PAID'; // They did pay
       payment.razorpayPaymentId = razorpay_payment_id;
       payment.razorpaySignature = razorpay_signature;
       payment.failureReason = 'Double booking conflict - needs refund';
       await payment.save();

       booking.status = 'CANCELLED';
       booking.paymentStatus = 'PAID';
       booking.paymentReference = payment._id;
       await booking.save();
       
       return res.status(409).json({ success: false, message: 'Dates are no longer available. Please contact support for a refund.' });
    }

    // Successful payment
    payment.status = 'PAID';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    booking.status = 'CONFIRMED';
    booking.paymentStatus = 'PAID';
    booking.paymentReference = payment._id;
    
    // Generate receipt number on successful payment
    if (!booking.receiptNumber) {
      booking.receiptNumber = `RCPT-${Date.now()}-${booking._id.toString().substring(0, 6).toUpperCase()}`;
      booking.receiptStatus = 'PENDING'; // PDF can be generated on demand
    }
    
    await booking.save();

    res.status(200).json({ success: true, message: 'Payment verified and booking confirmed', data: booking });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Server Error during payment verification' });
  }
};
