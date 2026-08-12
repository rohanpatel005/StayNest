const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    pricing: {
      perNight: { type: Number, required: true },
      nights: { type: Number, required: true },
      cleaningFee: { type: Number, required: true },
      serviceFee: { type: Number, required: true },
      totalAmount: { type: Number, required: true },
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    hostEarning: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING_PAYMENT',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
      default: 'PENDING',
    },
    paymentReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    razorpayOrderId: {
      type: String,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ['NOT_REQUESTED', 'PENDING', 'PROCESSED', 'FAILED', 'NOT_REQUIRED'],
      default: 'NOT_REQUESTED',
    },
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
