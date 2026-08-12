import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../../animations/motionVariants';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const DestinationCard = ({ destination }) => {
  return (
    <motion.div 
      variants={fadeUp}
      className="relative w-full h-full rounded-2xl overflow-hidden group cursor-pointer"
    >
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500 z-10" />
      
      <motion.img 
        src={destination.image} 
        alt={destination.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{destination.name}</h3>
          <p className="text-white/90 text-sm font-medium">{destination.properties}</p>
        </div>
      </div>
      
      <div className="absolute top-6 right-6 z-20 opacity-0 transform -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
        <div className="bg-white/20 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center border border-white/30">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      </div>
      
      {/* Animated border on hover */}
      <div className="absolute inset-4 border border-white/0 rounded-xl transition-colors duration-500 group-hover:border-white/20 z-10 pointer-events-none" />
    </motion.div>
  );
};

export default DestinationCard;
