import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import api from '../../api/axios';
import GuestListingCard from '../../components/guest/GuestListingCard';
import PageLoader from '../../components/PageLoader/PageLoader';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';
import { guestApi } from '../../api/guestApi';

const Search = () => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    guests: 1,
    minPrice: '',
    maxPrice: ''
  });
  
  const [results, setResults] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // Load wishlist so hearts work correctly
  useEffect(() => {
    guestApi.getWishlist().then(res => {
      if (res.success) setWishlist(res.data.map(i => i._id));
    }).catch(() => {});
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchParams.location) queryParams.append('location', searchParams.location);
      if (searchParams.guests) queryParams.append('guests', searchParams.guests);
      if (searchParams.minPrice) queryParams.append('minPrice', searchParams.minPrice);
      if (searchParams.maxPrice) queryParams.append('maxPrice', searchParams.maxPrice);

      const res = await api.get(`/listings/search?${queryParams.toString()}`);
      setResults(res.data.data.listings || []);
    } catch (err) {
      setError('Unable to load stays. Something went wrong while loading properties.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleWishlist = async (listingId, isAdding) => {
    try {
      if (isAdding) {
        await guestApi.addToWishlist(listingId);
        setWishlist(prev => [...prev, listingId]);
      } else {
        await guestApi.removeFromWishlist(listingId);
        setWishlist(prev => prev.filter(id => id !== listingId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-8">
      
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 md:p-6 rounded-3xl border border-gray-200 shadow-sm"
      >
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-gray-700 mb-1">Where</label>
            <input 
              type="text" 
              placeholder="Destination" 
              value={searchParams.location}
              onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm font-bold text-gray-700 mb-1">Guests</label>
            <input 
              type="number" 
              min="1"
              value={searchParams.guests}
              onChange={(e) => setSearchParams({...searchParams, guests: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm font-bold text-gray-700 mb-1">Min Price</label>
            <input 
              type="number" 
              placeholder="₹0"
              value={searchParams.minPrice}
              onChange={(e) => setSearchParams({...searchParams, minPrice: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="block text-sm font-bold text-gray-700 mb-1">Max Price</label>
            <input 
              type="number" 
              placeholder="₹15000"
              value={searchParams.maxPrice}
              onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button 
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors flex items-center justify-center gap-2"
          >
            <SearchIcon className="w-5 h-5" />
            Search
          </button>
        </form>
      </motion.div>

      {/* Results Area */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(n => (
              <div key={n} className="animate-pulse flex flex-col gap-3">
                <div className="bg-gray-200 aspect-square rounded-2xl w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
             <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-red-500">
               <X className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load stays</h3>
             <p className="text-gray-500 mb-6">{error}</p>
             <button onClick={handleSearch} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Try Again</button>
           </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No stays found</h3>
            <p className="text-gray-500 mb-6">Try changing your destination, dates, or filters.</p>
            <button 
              onClick={() => {
                setSearchParams({ location: '', guests: 1, minPrice: '', maxPrice: '' });
                setHasSearched(false);
                setResults([]);
              }} 
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(property => (
              <GuestListingCard 
                key={property._id} 
                property={property} 
                isWishlisted={wishlist.includes(property._id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default Search;
