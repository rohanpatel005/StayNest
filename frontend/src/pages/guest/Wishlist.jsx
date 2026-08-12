import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { guestApi } from '../../api/guestApi';
import GuestListingCard from '../../components/guest/GuestListingCard';
import PageLoader from '../../components/PageLoader/PageLoader';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await guestApi.getWishlist();
        if (res.success) {
          setWishlist(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleToggleWishlist = async (listingId, isAdding) => {
    try {
      if (isAdding) {
        await guestApi.addToWishlist(listingId);
        // Normally we'd add, but this is the wishlist page. 
        // We only really remove here in practice if they un-heart it.
      } else {
        await guestApi.removeFromWishlist(listingId);
        setWishlist(prev => prev.filter(item => item._id !== listingId));
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
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
        <div className="bg-brand-50 p-2 rounded-xl text-brand-500">
          <Heart className="w-6 h-6 fill-brand-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Your Wishlist</h2>
      </motion.div>

      {wishlist.length > 0 ? (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map(property => (
            <GuestListingCard 
              key={property._id} 
              property={property} 
              isWishlisted={true}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-10">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty.</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Save the places you love and find them here later.
          </p>
          <button 
            onClick={() => navigate('/guest')}
            className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors"
          >
            Explore Stays
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Wishlist;
