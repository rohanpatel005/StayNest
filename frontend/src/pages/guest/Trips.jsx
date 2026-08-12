import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { guestApi } from '../../api/guestApi';
import { messageApi } from '../../api/messageApi';
import PageLoader from '../../components/PageLoader/PageLoader';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';
import CancelBookingModal from '../../components/CancelBookingModal/CancelBookingModal';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const navigate = useNavigate();

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const res = await guestApi.getTrips();
      if (res.success) setTrips(res.data);
    } catch (err) {
      setError('Unable to load trips.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleCancelClick = (id) => {
    setSelectedBookingId(id);
    setCancelModalOpen(true);
  };

  const handleCancelSuccess = () => {
    setCancelModalOpen(false);
    setSelectedBookingId(null);
    fetchTrips();
  };

  const handleMessageHost = async (bookingId) => {
    try {
      const res = await messageApi.getConversationFromBooking(bookingId);
      if (res.success) {
        navigate(`/messages/${res.data._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start conversation');
    }
  };

  const getFilteredTrips = () => {
    const now = new Date();
    if (activeTab === 'upcoming') {
      return trips.filter(t => ['PENDING_PAYMENT', 'CONFIRMED', 'pending', 'confirmed'].includes(t.status) && new Date(t.checkOut) > now);
    }
    if (activeTab === 'past') {
      return trips.filter(t => t.status === 'COMPLETED' || t.status === 'completed' || (new Date(t.checkOut) <= now && !['CANCELLED', 'cancelled'].includes(t.status)));
    }
    if (activeTab === 'cancelled') {
      return trips.filter(t => ['CANCELLED', 'cancelled'].includes(t.status));
    }
    return [];
  };

  if (isLoading) return <PageLoader />;

  const filteredTrips = getFilteredTrips();

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="pb-12 max-w-7xl mx-auto"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Your Trips</h2>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} className="flex items-center gap-4 border-b border-gray-200 mb-8">
        {['upcoming', 'past', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 font-semibold capitalize transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-brand-500 text-brand-500' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {error ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
           <div className="bg-red-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-red-500">
             <X className="w-8 h-8" />
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load trips</h3>
           <p className="text-gray-500 mb-6">{error}</p>
           <button onClick={fetchTrips} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Try Again</button>
         </div>
      ) : filteredTrips.length > 0 ? (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map(trip => {
            const property = trip.listing;
            const canCancel = ['PENDING_PAYMENT', 'CONFIRMED', 'pending', 'confirmed'].includes(trip.status);
            
            return (
              <motion.div 
                key={trip._id} 
                variants={fadeUp}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col group"
              >
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img 
                    src={property?.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'} 
                    alt={property?.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {trip.status.replace('_', ' ')}
                    </div>
                    {trip.paymentStatus && (
                      <div className={`backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${trip.paymentStatus === 'PAID' ? 'bg-emerald-500/90' : 'bg-orange-500/90'}`}>
                        {trip.paymentStatus}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{property?.location?.city}, {property?.location?.country}</h3>
                  <p className="text-gray-500 text-sm truncate mb-4">{property?.title}</p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-gray-500">Check-in</p>
                        <p className="font-semibold text-gray-900">{new Date(trip.checkIn).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500">Checkout</p>
                        <p className="font-semibold text-gray-900">{new Date(trip.checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4">
                      <span className="text-gray-500">Total Paid</span>
                      <span className="font-bold text-gray-900 text-lg">₹{trip.pricing?.totalAmount}</span>
                    </div>

                    {trip.status === 'CANCELLED' && trip.refundAmount !== undefined && (
                      <div className="flex justify-between items-center text-sm pt-2 text-emerald-600 font-medium">
                        <span>Refunded</span>
                        <span>₹{trip.refundAmount}</span>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => navigate(`/property/${property._id}`)}
                        className="flex-1 py-2 bg-gray-50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 text-sm"
                      >
                        View Place
                      </button>
                      
                      {canCancel && (
                        <button 
                          onClick={() => handleMessageHost(trip._id)}
                          className="flex-1 py-2 bg-brand-50 text-brand-700 font-semibold rounded-xl hover:bg-brand-100 transition-colors border border-brand-200 text-sm"
                        >
                          Message Host
                        </button>
                      )}

                      {canCancel && (
                        <button 
                          onClick={() => handleCancelClick(trip._id)}
                          className="flex-1 py-2 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors border border-red-100 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Compass className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No {activeTab} trips yet.</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Find a stay for your next trip and start exploring the world.
          </p>
          <button 
            onClick={() => navigate('/guest/search')}
            className="px-6 py-3 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
          >
            Explore Stays
          </button>
        </motion.div>
      )}
      
      <CancelBookingModal 
        isOpen={cancelModalOpen} 
        onClose={() => setCancelModalOpen(false)} 
        bookingId={selectedBookingId} 
        onSuccess={handleCancelSuccess} 
      />
    </motion.div>
  );
};

export default Trips;
