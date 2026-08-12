import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fadeUp } from '../../animations/motionVariants';
import { cn } from '../../utils/cn';

const GuestListingCard = ({ property, onToggleWishlist, isWishlisted = false, numberOfNights, searchParams }) => {
  const [favorite, setFavorite] = useState(isWishlisted);

  const handleFavoriteClick = async (e) => {
    e.preventDefault(); // prevent navigation
    e.stopPropagation();
    
    // Optimistic UI update
    setFavorite(!favorite);
    if (onToggleWishlist) {
      await onToggleWishlist(property._id, !favorite);
    }
  };

  const primaryImage = property.images?.find(img => img.isPrimary)?.url || property.images?.[0]?.url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  const location = `${property.location?.city || ''}, ${property.location?.country || ''}`;
  const price = property.pricing?.perNight || 0;
  const rating = property.rating?.average || 'New';
  
  let linkTo = `/property/${property._id}`;
  if (searchParams) {
    const query = new URLSearchParams();
    if (searchParams.checkIn) query.append('checkIn', searchParams.checkIn);
    if (searchParams.checkOut) query.append('checkOut', searchParams.checkOut);
    if (searchParams.guests) query.append('guests', searchParams.guests);
    if (query.toString()) {
      linkTo += `?${query.toString()}`;
    }
  }

  return (
    <Link to={linkTo}>
      <motion.div 
        variants={fadeUp}
        className="group flex flex-col gap-3 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl">
          <motion.img 
            src={primaryImage} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Favorite Button */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 z-10"
          >
            <Heart 
              className={cn(
                "w-6 h-6 transition-colors duration-300",
                favorite ? "fill-brand-500 text-brand-500" : "fill-black/30 text-white hover:fill-black/50"
              )} 
            />
          </motion.button>

          {/* View details overlay on hover (desktop) */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 hidden md:block" />
        </div>

        <div className="flex flex-col transform transition-transform duration-300 group-hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-gray-900 truncate pr-2">{location}</h4>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
              <span>{rating}</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm truncate">{property.title}</p>
          <div className="mt-1 text-gray-500 text-sm">
            {property.capacity?.guests} guests · {property.capacity?.bedrooms} beds
          </div>
          {numberOfNights > 0 ? (
            <div className="mt-2 flex flex-col">
              <span className="font-semibold text-gray-900 border-b border-gray-900 w-max pb-0.5 mb-1">
                ₹{(price * numberOfNights).toLocaleString()} total
              </span>
              <div className="flex items-baseline gap-1 text-gray-500 text-sm">
                <span>₹{price.toLocaleString()}</span>
                <span>night</span>
                <span>· {numberOfNights} nights</span>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-semibold text-gray-900">₹{price.toLocaleString()}</span>
              <span className="text-gray-500 text-sm">night</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default GuestListingCard;
