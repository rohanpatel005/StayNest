const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const generateResetToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.RESET_TOKEN_SECRET,
    { expiresIn: '15m' } // Short-lived token for password reset
  );
};

module.exports = { generateToken, generateResetToken };
