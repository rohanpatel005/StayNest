import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { fadeUp } from '../../animations/motionVariants';
import { cn } from '../../utils/cn';

const PropertyCard = ({ property }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div 
      variants={fadeUp}
      className="group flex flex-col gap-3 cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        <motion.img 
          src={property.image} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Favorite Button */}
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 z-10"
        >
          <Heart 
            className={cn(
              "w-6 h-6 transition-colors duration-300",
              isFavorite ? "fill-brand-500 text-brand-500" : "fill-black/30 text-white hover:fill-black/50"
            )} 
          />
        </motion.button>

        {/* View details overlay on hover (desktop) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 hidden md:block" />
      </div>

      <div className="flex flex-col transform transition-transform duration-300 group-hover:-translate-y-1">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-gray-900 truncate pr-2">{property.location}</h4>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-gray-900 text-gray-900" />
            <span>{property.rating}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm">{property.title}</p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-semibold text-gray-900">${property.price}</span>
          <span className="text-gray-500 text-sm">night</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
