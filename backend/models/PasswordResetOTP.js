const mongoose = require('mongoose');

const passwordResetOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

// TTL index to automatically delete expired OTP documents
// The document will be automatically deleted when the current time reaches expiresAt
passwordResetOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetOTP', passwordResetOTPSchema);
