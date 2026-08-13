const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Never return password by default
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true,
    default: 'Earth'
  },
  role: {
    type: String,
    enum: ['guest', 'host'],
    required: [true, 'Role is required']
  },
  recentlyViewed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
