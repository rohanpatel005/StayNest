import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import api from '../../api/axios';
import PageLoader from '../../components/PageLoader/PageLoader';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/guest');
        if (res.data?.success) {
          setReviews(res.data.data);
        }
      } catch (err) {
        setError('Unable to load reviews.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

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

      {error ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
           <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load reviews</h3>
           <p className="text-gray-500 mb-6">{error}</p>
         </div>
      ) : reviews.length > 0 ? (
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
      )}
    </motion.div>
  );
};

export default Reviews;
