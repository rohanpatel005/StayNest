const Review = require('../models/Review');

exports.getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const query = { host: req.user._id };

    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    const reviews = await Review.find(query)
      .populate('guest', 'name profileImage')
      .populate('listing', 'title images')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const totalReviews = await Review.countDocuments(query);
    
    // Aggregation for rating distribution
    const distribution = await Review.aggregate([
      { $match: { host: req.user._id } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    
    let totalRatingSum = 0;
    let absoluteTotal = 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    distribution.forEach(d => {
      ratingDistribution[d._id] = d.count;
      totalRatingSum += (d._id * d.count);
      absoluteTotal += d.count;
    });

    const averageRating = absoluteTotal > 0 ? (totalRatingSum / absoluteTotal).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        items: reviews,
        overall: {
          averageRating: Number(averageRating),
          totalReviews: absoluteTotal,
          distribution: ratingDistribution
        },
        pagination: {
          page,
          limit,
          total: totalReviews,
          totalPages: Math.ceil(totalReviews / limit),
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const { hostReply } = req.body;
    
    if (!hostReply) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, host: req.user._id },
      { hostReply },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, guest: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'completed') return res.status(400).json({ success: false, message: 'Can only review completed stays' });

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) return res.status(400).json({ success: false, message: 'Review already exists for this booking' });

    const review = await Review.create({
      guest: req.user._id,
      host: booking.host,
      listing: booking.listing,
      booking: bookingId,
      rating,
      comment
    });

    // Recalculate listing rating
    const stats = await Review.aggregate([
      { $match: { listing: booking.listing } },
      { $group: { _id: '$listing', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
      await Listing.findByIdAndUpdate(booking.listing, {
        'rating.average': stats[0].averageRating.toFixed(1),
        'rating.count': stats[0].reviewCount
      });
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('guest', 'name profileImage')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getGuestReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ guest: req.user._id })
      .populate('listing', 'title images location')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
