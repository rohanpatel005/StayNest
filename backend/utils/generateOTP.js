const crypto = require('crypto');

const generateOTP = () => {
  // Generate a secure 6-digit OTP
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = generateOTP;
