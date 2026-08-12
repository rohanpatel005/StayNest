import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Star, MoreVertical, Edit2, Eye, Trash2, House } from 'lucide-react';
import { listingApi } from '../../api/listingApi';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';

const HostListings = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  const fetchListings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await listingApi.getListings({ limit: 50 }); // Simplified pagination for now
      setListings(res.data.items);
    } catch (err) {
      setError('Failed to load listings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        await listingApi.deleteListing(id);
        setListings(listings.filter(l => l._id !== id));
      } catch (err) {
        alert('Failed to delete listing.');
      }
    }
  };

  const toggleStatus = async (listing) => {
    const newStatus = listing.status === 'published' ? 'unpublished' : 'published';
    try {
      await listingApi.updateListingStatus(listing._id, newStatus);
      setListings(listings.map(l => l._id === listing._id ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert('Failed to update status.');
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
        <button onClick={fetchListings} className="px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.h1 variants={fadeUp} className="text-3xl font-bold text-gray-900">My Listings</motion.h1>
        <motion.div variants={fadeUp}>
          <Link 
            to="/host/listings/create" 
            className="inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand-600 hover:shadow-lg transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Add New Property
          </Link>
        </motion.div>
      </div>

      {listings.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <House className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You haven't listed a property yet.</h2>
          <p className="text-gray-500 mb-8 max-w-md">Share your space with travelers and start earning on StayNest today.</p>
          <Link 
            to="/host/listings/create" 
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Property
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {listings.map((listing) => (
              <motion.div 
                key={listing._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group relative"
              >
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  {listing.images && listing.images.length > 0 ? (
                    <img 
                      src={listing.images[0].url} 
                      alt={listing.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                      listing.status === 'published' ? 'bg-emerald-500/90 text-white' : 
                      listing.status === 'draft' ? 'bg-gray-900/80 text-white' : 
                      'bg-orange-500/90 text-white'
                    }`}>
                      {listing.status}
                    </span>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="absolute top-3 right-3">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === listing._id ? null : listing._id)}
                      className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors shadow-sm"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {openDropdown === listing._id && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20"
                        >
                          <button onClick={() => toggleStatus(listing)} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                            {listing.status === 'published' ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {listing.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <Link to={`/host/listings/${listing._id}/edit`} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Edit Listing
                          </Link>
                          <div className="h-px bg-gray-100 my-1"></div>
                          <button onClick={() => handleDelete(listing._id)} className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 truncate pr-4">{listing.title}</h3>
                    <div className="flex items-center gap-1 text-sm font-bold shrink-0">
                      <Star className="w-3.5 h-3.5 fill-gray-900 text-gray-900" />
                      {listing.rating?.average || 'New'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{listing.location?.city}, {listing.location?.country}</span>
                  </div>

                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-50">
                    <div>
                      <span className="font-bold text-gray-900">₹{listing.pricing?.perNight?.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm"> / night</span>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{listing.propertyType}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HostListings;
