const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetOTP = require('../models/PasswordResetOTP');
const { generateToken, generateResetToken } = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const transporter = require('../config/mailer');
const { resetPasswordEmailTemplate } = require('../utils/emailTemplates');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Validate role
    if (!['guest', 'host'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });
    
    // Do not reveal whether user exists
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'If an account exists with this email, an OTP has been sent.' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Hash OTP
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Remove any existing OTP for this email
    await PasswordResetOTP.deleteMany({ email: user.email });

    // Store OTP in database (Expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await PasswordResetOTP.create({
      email: user.email,
      otpHash,
      expiresAt
    });

    // Send Email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"StayNest Team" <noreply@staynest.com>',
        to: user.email,
        subject: 'StayNest Password Reset OTP',
        html: resetPasswordEmailTemplate(user.name, otp)
      });
      console.log(`OTP for ${user.email} is ${otp}`); // For testing without real email service
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Even if email fails, we shouldn't expose it to avoid email enumeration
      // But we log it for debugging
    }

    res.status(200).json({ 
      success: true, 
      message: 'If an account exists with this email, an OTP has been sent.' 
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const otpRecord = await PasswordResetOTP.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Check expiration manually as a fallback (TTL index might take up to 60s to delete)
    if (otpRecord.expiresAt < new Date()) {
      await PasswordResetOTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Prevent brute force by tracking attempts
    if (otpRecord.attempts >= 5) {
      await PasswordResetOTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }

    // Check OTP
    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP is valid - create reset token
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const resetToken = generateResetToken(user._id);

    // Delete OTP record as it's been successfully used
    await PasswordResetOTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide token and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword
};
