import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { guestApi } from '../../api/guestApi';
import Button from '../Button/Button';

const CancelBookingModal = ({ isOpen, onClose, bookingId, onSuccess }) => {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('Change of plans');

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchPreview();
    } else {
      setPreviewData(null);
      setError('');
      setReason('Change of plans');
    }
  }, [isOpen, bookingId]);

  const fetchPreview = async () => {
    try {
      setLoadingPreview(true);
      setError('');
      const res = await guestApi.getRefundPreview(bookingId);
      if (res.success) {
        setPreviewData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate refund preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setCancelling(true);
      setError('');
      const res = await guestApi.cancelBooking(bookingId, { reason });
      if (res.success) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={cancelling ? undefined : onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Cancel Booking</h2>
            <button
              onClick={onClose}
              disabled={cancelling}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {loadingPreview ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-medium text-sm">Calculating cancellation policy...</p>
              </div>
            ) : previewData ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">{previewData.propertyTitle}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Check-in</p>
                      <p className="font-semibold text-gray-900">{new Date(previewData.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Check-out</p>
                      <p className="font-semibold text-gray-900">{new Date(previewData.checkOut).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-semibold text-gray-900">₹{previewData.amountPaid}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900">Expected Refund</span>
                    <span className={previewData.expectedRefund > 0 ? "text-emerald-600" : "text-gray-900"}>
                      ₹{previewData.expectedRefund}
                    </span>
                  </div>
                </div>

                <div className="bg-orange-50 text-orange-800 p-4 rounded-xl border border-orange-100 text-sm">
                  <span className="font-bold block mb-1">Cancellation Policy:</span>
                  {previewData.cancellationPolicy}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for cancellation (optional)</label>
                  <select 
                    value={reason} 
                    onChange={e => setReason(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  >
                    <option value="Change of plans">Change of plans</option>
                    <option value="Found a different place">Found a different place</option>
                    <option value="Travel cancelled">Travel cancelled</option>
                    <option value="Host asked me to cancel">Host asked me to cancel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl bg-white"
              onClick={onClose}
              disabled={cancelling}
            >
              Keep Booking
            </Button>
            <Button
              variant="primary"
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-white"
              onClick={handleConfirm}
              disabled={cancelling || loadingPreview || !previewData}
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CancelBookingModal;
