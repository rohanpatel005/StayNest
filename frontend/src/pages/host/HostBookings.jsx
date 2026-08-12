import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { bookingApi } from '../../api/bookingApi';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await bookingApi.getBookings({ status: filter });
      setBookings(res.data.items);
    } catch (err) {
      setError('Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await bookingApi.updateBookingStatus(id, status);
      // Optimistically update UI
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PENDING_PAYMENT': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.h1 variants={fadeUp} className="text-3xl font-bold text-gray-900">Bookings</motion.h1>
        <motion.div variants={fadeUp} className="flex bg-white rounded-xl border border-gray-200 p-1">
          {['all', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="bg-white border rounded-3xl p-12 text-center shadow-sm">
          <p className="text-red-500 font-bold mb-4">{error}</p>
          <button onClick={fetchBookings} className="px-6 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600">Try Again</button>
        </div>
      ) : bookings.length === 0 ? (
        <motion.div variants={fadeUp} className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookings found.</h2>
          <p className="text-gray-500 max-w-md">Once guests start booking your properties, they will appear here.</p>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Guest</th>
                  <th className="p-4 font-bold">Property</th>
                  <th className="p-4 font-bold">Dates</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {bookings.map((booking) => (
                    <motion.tr 
                      key={booking._id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold overflow-hidden shrink-0">
                            {booking.guest?.profileImage ? (
                              <img src={booking.guest.profileImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              booking.guest?.name?.charAt(0) || '?'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{booking.guest?.name}</div>
                            <div className="text-xs text-gray-500">{booking.guests} Guests</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900 truncate max-w-[200px]">{booking.listing?.title}</div>
                        <div className="text-xs text-gray-500">{booking.listing?.location?.city}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                          {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">₹{booking.pricing?.totalAmount?.toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                          {booking.status === 'PENDING_PAYMENT' && <Clock className="w-3 h-3" />}
                          {booking.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3" />}
                          {booking.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                          {booking.status.replace('_', ' ')}
                        </span>
                        {booking.paymentStatus && (
                          <div className={`mt-2 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${booking.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                            {booking.paymentStatus}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-sm font-bold text-brand-500 hover:text-brand-600 underline">View Details</button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HostBookings;
