const Listing = require('../models/Listing');

exports.getRecommendations = async (user, limit = 10) => {
  // A simple rule-based recommendation engine.
  // We can look at the user's recentlyViewed, or simply return highly rated published properties.
  
  const query = { status: 'published' };
  
  // 1. Fetch recently viewed properties to understand user preferences
  const recentlyViewedIds = user.recentlyViewed || [];
  
  let recommendedListings = [];

  // If user has recently viewed, we might want to show properties in the same city
  if (recentlyViewedIds.length > 0) {
    const recentListings = await Listing.find({ _id: { $in: recentlyViewedIds }, status: 'published' }).select('location.city');
    const cities = recentListings.map(l => l.location.city).filter(Boolean);
    
    if (cities.length > 0) {
      // Find other listings in the same cities, excluding the ones already viewed
      recommendedListings = await Listing.find({
        status: 'published',
        'location.city': { $in: cities },
        _id: { $nin: recentlyViewedIds }
      })
      .sort('-createdAt')
      .limit(limit);
    }
  }

  // Fallback: If not enough recommendations, pad with generic popular/new listings
  if (recommendedListings.length < limit) {
    const excludeIds = [
      ...recentlyViewedIds,
      ...recommendedListings.map(l => l._id)
    ];

    const fallbackListings = await Listing.find({
      status: 'published',
      _id: { $nin: excludeIds }
    })
    .sort('-pricing.perNight') // Just an example sort
    .limit(limit - recommendedListings.length);

    recommendedListings = [...recommendedListings, ...fallbackListings];
  }

  return recommendedListings;
};
