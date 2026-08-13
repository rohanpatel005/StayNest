import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, PenLine } from 'lucide-react';
import api from '../../api/axios';
import { guestApi } from '../../api/guestApi';
import PageLoader from '../../components/PageLoader/PageLoader';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';
import WriteReviewModal from '../../components/guest/WriteReviewModal';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [unreviewedTrips, setUnreviewedTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('to_write'); // 'to_write' or 'written'
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch both reviews and all completed trips in parallel
      const [reviewsRes, tripsRes] = await Promise.all([
        api.get('/reviews/guest'),
        guestApi.getCompletedTrips()
      ]);

      let fetchedReviews = [];
      if (reviewsRes.data?.success) {
        fetchedReviews = reviewsRes.data.data;
        setReviews(fetchedReviews);
      }

      if (tripsRes.success) {
        // Filter out completed trips that already have a review
        const tripsNeedsReview = tripsRes.data.filter(trip => 
          !fetchedReviews.some(review => review.booking === trip._id)
        );
        setUnreviewedTrips(tripsNeedsReview);
      }
    } catch (err) {
      setError('Unable to load reviews data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReviewSuccess = () => {
    setSelectedBookingForReview(null);
    setActiveTab('written');
    fetchData(); // Refetch to update both lists
  };

  if (isLoading) return <PageLoader />;

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="pb-12 max-w-7xl mx-auto"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-50 p-2 rounded-xl text-yellow-500">
          <Star className="w-6 h-6 fill-yellow-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Your Reviews</h2>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex items-center gap-6 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('to_write')}
          className={`pb-4 font-semibold transition-colors border-b-2 ${
            activeTab === 'to_write' 
              ? 'border-brand-500 text-brand-500' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Reviews to write ({unreviewedTrips.length})
        </button>
        <button
          onClick={() => setActiveTab('written')}
          className={`pb-4 font-semibold transition-colors border-b-2 ${
            activeTab === 'written' 
              ? 'border-brand-500 text-brand-500' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Reviews you've written ({reviews.length})
        </button>
      </motion.div>

      {error ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
           <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong.</h3>
           <p className="text-gray-500 mb-6">{error}</p>
         </div>
      ) : activeTab === 'to_write' ? (
        // Reviews to Write Section
        unreviewedTrips.length > 0 ? (
          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unreviewedTrips.map(trip => (
              <motion.div key={trip._id} variants={fadeUp} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img 
                    src={trip.listing?.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'} 
                    alt={trip.listing?.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{trip.listing?.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{trip.listing?.location?.city}, {trip.listing?.location?.country}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium mb-4">
                      Stayed {new Date(trip.checkIn).toLocaleDateString()} - {new Date(trip.checkOut).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={() => setSelectedBookingForReview(trip)}
                      className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <PenLine className="w-4 h-4" />
                      Write Review
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You don't have any past trips that need a review right now.
            </p>
          </motion.div>
        )
      ) : (
        // Reviews Written Section
        reviews.length > 0 ? (
          <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <motion.div key={review._id} variants={fadeUp} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{review.listing?.title}</h3>
                    <p className="text-sm text-gray-500">{review.listing?.location?.city}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-lg text-brand-700 font-bold text-sm">
                    <Star className="w-4 h-4 fill-brand-500 text-brand-500" />
                    {review.rating}
                  </div>
                </div>
                
                <p className="text-gray-700 whitespace-pre-wrap mb-4">"{review.comment}"</p>
                
                <p className="text-xs text-gray-400 font-medium">
                  Written on {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet.</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Once you complete a trip, you can write a review to help other guests.
            </p>
          </motion.div>
        )
      )}

      {selectedBookingForReview && (
        <WriteReviewModal 
          isOpen={true} 
          onClose={() => setSelectedBookingForReview(null)} 
          booking={selectedBookingForReview}
          onSuccess={handleReviewSuccess}
        />
      )}
    </motion.div>
  );
};

export default Reviews;
