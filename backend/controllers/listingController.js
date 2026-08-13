const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

exports.getListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const listings = await Listing.find({ host: req.user._id })
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const total = await Listing.countDocuments({ host: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        items: listings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      host: req.user._id,
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createListing = async (req, res) => {
  try {
    // Inject the authenticated user as the host
    req.body.host = req.user._id;

    // Validate coordinates explicitly
    const { latitude, longitude, address } = req.body.location || {};
    if (!latitude || !longitude || !address) {
      return res.status(400).json({ success: false, message: 'Please select a valid location.' });
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates provided.' });
    }

    // Validate times
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (req.body.checkInTime && !timeRegex.test(req.body.checkInTime)) {
      return res.status(400).json({ success: false, message: 'Invalid check-in time.' });
    }
    if (req.body.checkOutTime && !timeRegex.test(req.body.checkOutTime)) {
      return res.status(400).json({ success: false, message: 'Invalid check-out time.' });
    }

    const listing = await Listing.create(req.body);

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message || 'Invalid Data' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    // Ensure host cannot change ownership
    if (req.body.host) {
      delete req.body.host;
    }

    if (req.body.location) {
      const { latitude, longitude, address } = req.body.location;
      if (latitude === undefined || longitude === undefined || !address) {
        return res.status(400).json({ success: false, message: 'Please select a valid location.' });
      }
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ success: false, message: 'Invalid coordinates provided.' });
      }
    }

    // Validate times
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (req.body.checkInTime && !timeRegex.test(req.body.checkInTime)) {
      return res.status(400).json({ success: false, message: 'Invalid check-in time.' });
    }
    if (req.body.checkOutTime && !timeRegex.test(req.body.checkOutTime)) {
      return res.status(400).json({ success: false, message: 'Invalid check-out time.' });
    }

    let listing = await Listing.findOne({ _id: req.params.id, host: req.user._id });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Invalid Data' });
  }
};

exports.updateListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['draft', 'published', 'unpublished'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, host: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findOneAndDelete({
      _id: req.params.id,
      host: req.user._id,
    });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Cascade deletes
    const listingId = req.params.id;
    await Booking.deleteMany({ listing: listingId });
    await Review.deleteMany({ listing: listingId });
    await Wishlist.updateMany(
      { listings: listingId },
      { $pull: { listings: listingId } }
    );

    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'staynest/listings' },
          (error, result) => {
            if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    const results = await Promise.all(uploadPromises);

    const images = results.map((result, index) => ({
      url: result.url,
      publicId: result.publicId,
      isPrimary: index === 0, // Default first uploaded image to primary if not handled on frontend
      order: index
    }));

    res.status(200).json({ success: true, images });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload images' });
  }
};

exports.searchListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const startIndex = (page - 1) * limit;

    const query = { status: 'published' };

    // Filtering
    if (req.query.location) {
      const locRegex = new RegExp(req.query.location, 'i');
      query.$or = [
        { 'location.city': locRegex },
        { 'location.state': locRegex },
        { 'location.country': locRegex },
        { title: locRegex }
      ];
    }
    
    if (req.query.guests) {
      query['capacity.guests'] = { $gte: parseInt(req.query.guests) };
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      query['pricing.perNight'] = {};
      if (req.query.minPrice) query['pricing.perNight'].$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) query['pricing.perNight'].$lte = parseInt(req.query.maxPrice);
    }

    if (req.query.propertyType) {
      query.propertyType = req.query.propertyType;
    }

    if (req.query.amenities) {
      const amenitiesArr = req.query.amenities.split(',');
      query.amenities = { $all: amenitiesArr };
    }

    // Availability checking
    if (req.query.checkIn && req.query.checkOut) {
      const searchCheckIn = new Date(req.query.checkIn);
      const searchCheckOut = new Date(req.query.checkOut);
      
      // Find bookings that overlap with the requested dates
      // Overlap condition: booking.checkIn < searchCheckOut AND booking.checkOut > searchCheckIn
      const overlappingBookings = await Booking.find({
        status: { $in: ['CONFIRMED', 'COMPLETED', 'PENDING_PAYMENT'] },
        $and: [
          { checkIn: { $lt: searchCheckOut } },
          { checkOut: { $gt: searchCheckIn } }
        ]
      }).select('listing');
      
      const bookedListingIds = overlappingBookings.map(b => b.listing);
      
      if (bookedListingIds.length > 0) {
        query._id = { $nin: bookedListingIds };
      }
    }

    const listings = await Listing.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort(req.query.sort === 'price_asc' ? 'pricing.perNight' : req.query.sort === 'price_desc' ? '-pricing.perNight' : '-createdAt');

    const total = await Listing.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        listings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const User = require('../models/User');

exports.getPublicListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, status: 'published' }).populate('host', 'name profileImage createdAt');
    
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Record recently viewed if user is authenticated
    if (req.user && req.user.role === 'guest') {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { recentlyViewed: listing._id }
        });
        
        // Keep only the last 10 recently viewed
        const user = await User.findById(req.user._id);
        if (user.recentlyViewed.length > 10) {
          user.recentlyViewed = user.recentlyViewed.slice(-10);
          await user.save();
        }
      } catch (err) {
        console.error('Failed to update recently viewed:', err);
      }
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const availabilityService = require('../services/availabilityService');

exports.deleteListingImage = async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, host: req.user._id });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const imageId = req.params.imageId;
    const image = listing.images.id(imageId);
    
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    if (listing.images.length <= 1) return res.status(400).json({ success: false, message: 'Listing must have at least one image' });

    // Remove from Cloudinary
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (err) {
        console.error('Failed to delete from Cloudinary:', err);
      }
    }

    // Remove from array
    listing.images.pull(imageId);
    
    // Ensure one primary image
    if (image.isPrimary && listing.images.length > 0) {
      listing.images[0].isPrimary = true;
    }

    await listing.save();
    res.status(200).json({ success: true, images: listing.images });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.blockDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'Missing dates' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) return res.status(400).json({ success: false, message: 'Invalid date range' });

    const listing = await Listing.findOne({ _id: req.params.id, host: req.user._id });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Check if there are confirmed bookings in this range
    const Booking = require('../models/Booking');
    const overlappingBookings = await Booking.find({
      listing: listing._id,
      status: { $in: ['PENDING_PAYMENT', 'CONFIRMED'] },
      $or: [
        { checkIn: { $lt: end }, checkOut: { $gt: start } }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot block dates. There is already a confirmed booking during this period.' });
    }

    listing.availability.blockedDates.push({ startDate: start, endDate: end });
    await listing.save();

    res.status(200).json({ success: true, blockedDates: listing.availability.blockedDates });
  } catch (error) {
    console.error('Error blocking dates:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.unblockDates = async (req, res) => {
  try {
    const listing = await Listing.findOne({ _id: req.params.id, host: req.user._id });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    const blockId = req.params.blockId;
    listing.availability.blockedDates.pull(blockId);
    await listing.save();

    res.status(200).json({ success: true, blockedDates: listing.availability.blockedDates });
  } catch (error) {
    console.error('Error unblocking dates:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
