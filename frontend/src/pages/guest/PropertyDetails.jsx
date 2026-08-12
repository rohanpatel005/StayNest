import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Users, Bed, Bath, Home, ChevronLeft, ChevronRight, X, Heart, Share, Calendar } from 'lucide-react';
import api from '../../api/axios';
import { guestApi } from '../../api/guestApi';
import { paymentApi } from '../../api/paymentApi';
import PageLoader from '../../components/PageLoader/PageLoader';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';
import PropertyMap from '../../components/map/PropertyMap';
import { formatTimeToAMPM } from '../../utils/timeUtils';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationObj = useLocation();

  const [property, setProperty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse URL params for initial state
  const params = new URLSearchParams(locationObj.search);
  const initialCheckIn = params.get('checkIn') || '';
  const initialCheckOut = params.get('checkOut') || '';
  const initialGuests = parseInt(params.get('guests')) || 1;

  // Booking Card State
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [pricePreview, setPricePreview] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Gallery state
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/listings/public/${id}`);
        setProperty(res.data.data);
      } catch (err) {
        setError('Unable to load property details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  useEffect(() => {
    // If we have both dates, get a price preview
    if (checkIn && checkOut && property) {
      const getPreview = async () => {
        setPreviewLoading(true);
        setBookingError(null);
        try {
          const res = await guestApi.pricePreview({
            listingId: id,
            checkIn,
            checkOut,
            guests
          });
          if (res.success) {
            setPricePreview(res.data);
          }
        } catch (err) {
          setPricePreview(null);
          setBookingError(err.response?.data?.message || 'Dates not available');
        } finally {
          setPreviewLoading(false);
        }
      };
      getPreview();
    } else {
      setPricePreview(null);
      setBookingError(null);
    }
  }, [checkIn, checkOut, guests, id, property]);

  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      setBookingError('Please select check-in and check-out dates.');
      return;
    }
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await guestApi.createOrder({
        listingId: id,
        checkIn,
        checkOut,
        guests
      });
      if (res.success) {
        const resData = res.data;
        const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!scriptLoaded) {
          setBookingError('Failed to load payment gateway. Please check your connection.');
          setBookingLoading(false);
          return;
        }

        const options = {
          key: resData.keyId,
          amount: resData.amount,
          currency: resData.currency,
          name: "StayNest",
          description: `Booking for ${property.title}`,
          order_id: resData.razorpayOrderId,
          handler: async function (response) {
             try {
                setBookingLoading(true);
                const verifyRes = await paymentApi.verifyPayment({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: resData.bookingId
                });
                
                if (verifyRes.success) {
                   navigate(`/bookings/${resData.bookingId}/success`);
                }
             } catch (verifyErr) {
                setBookingError(verifyErr.response?.data?.message || 'Payment verification failed');
                setBookingLoading(false);
             }
          },
          theme: { color: "#ff385c" },
          modal: {
            ondismiss: function() {
              setBookingLoading(false);
              setBookingError('Payment cancelled.');
            }
          }
        };
        
        if (options.key === 'rzp_test_placeholder_key') {
          console.warn("Using placeholder Razorpay key. Simulating successful payment...");
          setTimeout(() => {
            options.handler({
              razorpay_payment_id: `pay_dummy_${Date.now()}`,
              razorpay_order_id: options.order_id,
              razorpay_signature: 'dummy_signature'
            });
          }, 1500);
          return;
        }

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
           setBookingLoading(false);
           setBookingError(response.error.description || 'Payment failed');
        });
        rzp.open();
      }
    } catch (err) {
      setBookingLoading(false);
      setBookingError(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const handleNextImage = () => {
    if (property?.images) {
      setCurrentImgIndex(prev => (prev + 1) % property.images.length);
    }
  };

  const handlePrevImage = () => {
    if (property?.images) {
      setCurrentImgIndex(prev => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  if (isLoading) return <PageLoader />;
  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load stays.</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => navigate('/guest')} className="px-6 py-2 bg-brand-500 text-white rounded-lg">Back to Explore</button>
      </div>
    );
  }

  const images = property.images || [];
  const primaryImage = images.find(img => img.isPrimary)?.url || images[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
  const displayImage = images[currentImgIndex]?.url || primaryImage;

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="pb-24 max-w-7xl mx-auto space-y-8"
    >
      {/* Title & Basics */}
      <motion.div variants={fadeUp} className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{property.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-gray-700">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-gray-900 text-gray-900" />
            <span>{property.rating?.average || 'New'}</span>
            <span className="text-gray-500 underline ml-1">({property.rating?.count || 0} reviews)</span>
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-1 underline">
            <MapPin className="w-4 h-4" />
            {property.location?.city}, {property.location?.country}
          </div>
        </div>
      </motion.div>

      {/* Image Gallery */}
      <motion.div variants={fadeUp} className="relative aspect-[16/9] md:aspect-[2/1] rounded-3xl overflow-hidden bg-gray-100 group">
        <img 
          src={displayImage} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button 
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
              {currentImgIndex + 1} / {images.length}
            </div>
          </>
        )}
        {images.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">No photos available</div>
        )}
      </motion.div>

      {/* Main Content & Sidebar */}
      <div className="flex flex-col lg:flex-row gap-12 relative">
        
        {/* Left column: Details */}
        <motion.div variants={staggerContainer} className="flex-1 space-y-10">
          
          <motion.div variants={fadeUp} className="flex items-center justify-between pb-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hosted by {property.host?.name || 'StayNest Host'}</h2>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1"><Users className="w-5 h-5"/> {property.capacity?.guests} guests</span>
                <span className="flex items-center gap-1"><Bed className="w-5 h-5"/> {property.capacity?.bedrooms} bedrooms</span>
                <span className="flex items-center gap-1"><Bath className="w-5 h-5"/> {property.capacity?.bathrooms} baths</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-brand-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
               {property.host?.profileImage ? (
                  <img src={property.host.profileImage} alt="Host" className="w-full h-full object-cover" />
               ) : (
                  <span className="text-xl font-bold text-brand-600">{property.host?.name?.charAt(0) || 'H'}</span>
               )}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="pb-6 border-b border-gray-200">
             <h3 className="text-xl font-bold text-gray-900 mb-4">About this place</h3>
             
             <div className="flex gap-8 mb-6 p-4 bg-gray-50 rounded-xl">
               <div>
                 <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Check-in</p>
                 <p className="text-gray-900 font-medium">
                   {property.checkInTime ? formatTimeToAMPM(property.checkInTime) : 'Not specified'}
                 </p>
               </div>
               <div>
                 <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Checkout</p>
                 <p className="text-gray-900 font-medium">
                   {property.checkOutTime ? formatTimeToAMPM(property.checkOutTime) : 'Not specified'}
                 </p>
               </div>
             </div>

             <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
               {property.description}
             </p>
          </motion.div>

          <motion.div variants={fadeUp} className="pb-6 border-b border-gray-200">
             <h3 className="text-xl font-bold text-gray-900 mb-4">What this place offers</h3>
             <div className="grid grid-cols-2 gap-4">
               {property.amenities?.map((amenity, idx) => (
                 <div key={idx} className="flex items-center gap-3 text-gray-700">
                   <Home className="w-5 h-5 text-gray-400" />
                   <span>{amenity}</span>
                 </div>
               ))}
             </div>
           </motion.div>

          <motion.div variants={fadeUp} className="pb-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Where you'll be</h3>
            
            {(() => {
              const lat = Number(property.location?.latitude);
              const lng = Number(property.location?.longitude);
              const isValid = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0);
              
              return isValid ? (
                <>
                  <PropertyMap latitude={lat} longitude={lng} />
                  <p className="mt-4 text-gray-600">
                    {property.location.city}, {property.location.state}, {property.location.country}
                  </p>
                </>
              ) : (
                <div className="bg-gray-50 border rounded-2xl p-8 text-center">
                  <p className="text-gray-500 font-medium">Location information is currently unavailable.</p>
                </div>
              );
            })()}
          </motion.div>
          
        </motion.div>

        {/* Right column: Booking Card (Sticky) */}
        <motion.div variants={fadeUp} className="w-full lg:w-[400px] shrink-0 relative">
          <div className="sticky top-28 bg-white p-6 rounded-3xl border border-gray-200 shadow-xl">
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-2xl font-bold text-gray-900">${property.pricing?.perNight}</span>
              <span className="text-gray-500">night</span>
            </div>

            <div className="border border-gray-300 rounded-xl overflow-hidden mb-4">
              <div className="flex border-b border-gray-300">
                <div className="p-3 w-1/2 border-r border-gray-300">
                  <label className="block text-xs font-bold text-gray-900 uppercase">CHECK-IN</label>
                  <input 
                    type="date" 
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (checkOut && new Date(e.target.value) >= new Date(checkOut)) {
                        setCheckOut('');
                      }
                    }}
                    className="w-full outline-none text-gray-700 mt-1 bg-transparent"
                  />
                </div>
                <div className="p-3 w-1/2">
                  <label className="block text-xs font-bold text-gray-900 uppercase">CHECKOUT</label>
                  <input 
                    type="date" 
                    value={checkOut}
                    min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full outline-none text-gray-700 mt-1 bg-transparent"
                  />
                </div>
              </div>
              <div className="p-3">
                <label className="block text-xs font-bold text-gray-900 uppercase">GUESTS</label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full outline-none text-gray-700 mt-1 bg-transparent"
                >
                  {[...Array(property.capacity?.guests || 1)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} guest{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {bookingError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4 font-medium">
                {bookingError}
              </div>
            )}

            <button 
              onClick={handleReserve}
              disabled={bookingLoading || previewLoading || bookingError}
              className="w-full py-3.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingLoading ? 'Processing...' : 'Reserve & Pay'}
            </button>

            {pricePreview && !previewLoading && !bookingError && (
              <div className="mt-6 space-y-4">
                <p className="text-center text-gray-500 text-sm">You won't be charged yet</p>
                <div className="flex justify-between text-gray-600">
                  <span>${property.pricing?.perNight} x {pricePreview.nights} nights</span>
                  <span>${pricePreview.nightlyTotal}</span>
                </div>
                {pricePreview.cleaningFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Cleaning fee</span>
                    <span>${pricePreview.cleaningFee}</span>
                  </div>
                )}
                {pricePreview.serviceFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Service fee</span>
                    <span>${pricePreview.serviceFee}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>${pricePreview.total}</span>
                </div>
              </div>
            )}
            {previewLoading && (
              <div className="mt-6 text-center text-gray-500 text-sm">Calculating price...</div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PropertyDetails;
