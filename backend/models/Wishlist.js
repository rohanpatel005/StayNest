const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // One wishlist document per user
    },
    listings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);
