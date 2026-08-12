import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageCircle, MessageSquare } from 'lucide-react';
import { reviewApi } from '../../api/reviewApi';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';

const HostReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [overall, setOverall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await reviewApi.getReviews({ limit: 20 });
      setReviews(res.data.items);
      setOverall(res.data.overall);
    } catch (err) {
      setError('Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const submitReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      await reviewApi.replyToReview(id, replyText);
      setReviews(reviews.map(r => r._id === id ? { ...r, hostReply: replyText } : r));
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      alert('Failed to submit reply.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-900 font-bold text-lg mb-2">Something went wrong.</p>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={fetchReviews} className="px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition">Try Again</button>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 pb-12">
      <motion.h1 variants={fadeUp} className="text-3xl font-bold text-gray-900">Reviews</motion.h1>

      {reviews.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <MessageCircle className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No reviews yet.</h2>
          <p className="text-gray-500 max-w-md">Guest reviews will appear here after they complete their stays.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Rating Summary Sidebar */}
          <motion.div variants={fadeUp} className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <div className="text-center border-b border-gray-100 pb-6 mb-6">
                <div className="text-5xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-2">
                  <Star className="w-8 h-8 fill-brand-500 text-brand-500" />
                  {overall?.averageRating || 0}
                </div>
                <div className="text-sm font-bold text-gray-500">Overall Rating</div>
                <div className="text-xs text-gray-400 mt-1">Based on {overall?.totalReviews} reviews</div>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = overall?.distribution?.[star] || 0;
                  const percentage = overall?.totalReviews > 0 ? (count / overall.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="text-sm font-bold text-gray-500 w-4">{star}</div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-brand-500 rounded-full"
                        ></motion.div>
                      </div>
                      <div className="text-xs font-medium text-gray-400 w-8 text-right">{percentage.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Reviews List */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {reviews.map((review) => (
                <motion.div 
                  key={review._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        {review.guest?.profileImage ? (
                          <img src={review.guest.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold text-lg">
                            {review.guest?.name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{review.guest?.name}</h4>
                        <div className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 text-sm font-medium text-brand-500 bg-brand-50 px-3 py-1 rounded-md inline-block">
                    Stayed at {review.listing?.title}
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                  {review.hostReply ? (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 ml-4 relative">
                      <div className="absolute -left-2 top-4 w-4 h-4 bg-gray-50 border-l border-b border-gray-100 transform rotate-45"></div>
                      <div className="flex items-center gap-2 font-bold text-gray-900 text-sm mb-1">
                        <MessageSquare className="w-4 h-4 text-gray-400" /> Response from you
                      </div>
                      <p className="text-gray-600 text-sm">{review.hostReply}</p>
                    </div>
                  ) : (
                    replyingTo === review._id ? (
                      <div className="mt-4">
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a public response..."
                          className="w-full p-3 border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none resize-none h-24 mb-2"
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setReplyingTo(null); setReplyText(''); }} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                          <button onClick={() => submitReply(review._id)} className="px-4 py-2 text-sm font-bold bg-gray-900 text-white hover:bg-black rounded-lg transition-colors">Submit Reply</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setReplyingTo(review._id)}
                        className="text-sm font-bold text-brand-500 hover:text-brand-600 underline"
                      >
                        Reply to guest
                      </button>
                    )
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

        </div>
      )}
    </motion.div>
  );
};

export default HostReviews;
