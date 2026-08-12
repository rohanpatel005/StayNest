import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Clock, Sparkles } from 'lucide-react';
import { guestApi } from '../../api/guestApi';
import GuestListingCard from '../../components/guest/GuestListingCard';
import PageLoader from '../../components/PageLoader/PageLoader';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';

const Explore = () => {
  const [data, setData] = useState({
    upcomingTrips: [],
    recentlyViewed: [],
    recommended: []
  });
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, wishlistRes] = await Promise.all([
          guestApi.getDashboard(),
          guestApi.getWishlist()
        ]);
        
        if (dashRes.success) setData(dashRes.data);
        if (wishlistRes.success) setWishlist(wishlistRes.data.map(item => item._id));
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleWishlist = async (listingId, isAdding) => {
    try {
      if (isAdding) {
        await guestApi.addToWishlist(listingId);
        setWishlist(prev => [...prev, listingId]);
      } else {
        await guestApi.removeFromWishlist(listingId);
        setWishlist(prev => prev.filter(id => id !== listingId));
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
      className="pb-12 space-y-12 max-w-7xl mx-auto"
    >
      
      {/* Recommended Section (Always visible) */}
      <section>
        <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
          <div className="bg-brand-50 p-2 rounded-xl text-brand-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
        </motion.div>
        
        {data.recommended.length > 0 ? (
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.recommended.map(property => (
              <GuestListingCard 
                key={property._id} 
                property={property} 
                isWishlisted={wishlist.includes(property._id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </motion.div>
        ) : (
          <p className="text-gray-500 bg-white p-8 rounded-2xl border border-gray-100 text-center">
            No recommendations right now. Start exploring to find great places!
          </p>
        )}
      </section>

      {/* Recently Viewed Section */}
      {data.recentlyViewed.length > 0 && (
        <section>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Recently Viewed</h2>
          </motion.div>
          
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.recentlyViewed.map(property => (
              <GuestListingCard 
                key={property._id} 
                property={property} 
                isWishlisted={wishlist.includes(property._id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </motion.div>
        </section>
      )}

      {/* Upcoming Trips */}
      {data.upcomingTrips.length > 0 && (
        <section>
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Trips</h2>
          </motion.div>
          
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.upcomingTrips.map(trip => (
              <div key={trip._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex">
                <div className="w-32 h-32 shrink-0 bg-gray-100 overflow-hidden">
                   <img 
                      src={trip.listing?.images?.[0]?.url} 
                      alt="Trip" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                   />
                </div>
                <div className="p-4 flex flex-col justify-center">
                  <h3 className="font-bold text-gray-900 truncate">{trip.listing?.location?.city}</h3>
                  <p className="text-sm text-gray-500">{new Date(trip.checkIn).toLocaleDateString()} - {new Date(trip.checkOut).toLocaleDateString()}</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-2 uppercase tracking-wide">{trip.status}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>
      )}

    </motion.div>
  );
};

export default Explore;
