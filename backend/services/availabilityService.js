const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

exports.hasOverlappingBooking = async (listingId, checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const overlappingBookings = await Booking.find({
    listing: listingId,
    status: 'CONFIRMED',
    $or: [
      { 
        // Existing booking starts before requested checkout AND ends after requested checkin
        checkIn: { $lt: end }, 
        checkOut: { $gt: start } 
      }
    ]
  });

  if (overlappingBookings.length > 0) return true;

  // Check if dates overlap with manually blocked dates
  const listing = await Listing.findById(listingId);
  if (!listing) return false;
  
  if (listing.availability && listing.availability.blockedDates) {
    const hasBlockedDateOverlap = listing.availability.blockedDates.some(block => {
      const blockStart = new Date(block.startDate);
      const blockEnd = new Date(block.endDate);
      return blockStart < end && blockEnd > start;
    });
    if (hasBlockedDateOverlap) return true;
  }

  // Check if listing is globally unavailable
  if (listing.status !== 'published') return true;

  return false;
};
