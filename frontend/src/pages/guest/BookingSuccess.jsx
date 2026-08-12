import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { guestApi } from '../../api/guestApi';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import PageLoader from '../../components/PageLoader/PageLoader';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import { formatTimeToAMPM } from '../../utils/timeUtils';

const BookingSuccess = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await guestApi.getTrip(id);
        if (res.success) {
          setBooking(res.data);
        } else {
          navigate('/trips');
        }
      } catch (err) {
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handleDownloadReceipt = async (bookingId) => {
    try {
      setIsDownloading(true);
      const blob = await guestApi.downloadReceipt(bookingId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Unable to download receipt. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!booking) return null;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-2xl mx-auto py-20 px-6 text-center">
      <motion.div variants={fadeUp} className="flex justify-center mb-6">
        <CheckCircle className="w-20 h-20 text-emerald-500" />
      </motion.div>
      
      <motion.h1 variants={fadeUp} className="text-3xl font-bold text-gray-900 mb-2">Payment Successful ✓</motion.h1>
      <motion.h2 variants={fadeUp} className="text-xl font-medium text-gray-600 mb-8">Booking Confirmed</motion.h2>

      <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-gray-200 p-8 text-left mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{booking.listing?.title}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="text-gray-500 uppercase text-xs font-bold mb-1">Check-in</p>
            <p>
              {new Date(booking.checkIn).toLocaleDateString()}
              {booking.listing?.checkInTime && `, ${formatTimeToAMPM(booking.listing.checkInTime)}`}
            </p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs font-bold mb-1">Check-out</p>
            <p>
              {new Date(booking.checkOut).toLocaleDateString()}
              {booking.listing?.checkOutTime && `, ${formatTimeToAMPM(booking.listing.checkOutTime)}`}
            </p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs font-bold mb-1">Guests</p>
            <p>{booking.guests}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs font-bold mb-1">Total Paid</p>
            <p className="font-bold">${booking.pricing?.totalAmount}</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
          <p className="text-gray-500 text-xs">Booking ID: {booking._id}</p>
          {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && booking.paymentStatus === 'PAID' && (
            <button 
              onClick={() => handleDownloadReceipt(booking._id)}
              disabled={isDownloading}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 text-sm disabled:opacity-50"
            >
              {isDownloading ? 'Generating...' : 'Download Receipt'}
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to={`/trips`} className="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors">
          View My Trips
        </Link>
        <Link to="/guest" className="px-6 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition-colors">
          Back to Explore
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default BookingSuccess;
