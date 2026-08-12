import React from 'react';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import { fadeUp } from '../../animations/motionVariants';

const Hero = () => {
  return (
    <div className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax & Reveal */}
      <motion.div 
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
          alt="Beautiful coastal home" 
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="relative z-10 text-center px-4 w-full max-w-6xl mx-auto pt-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: { transition: { staggerChildren: 0.2 } }
          }}
          className="mb-8"
        >
          <div className="overflow-hidden mb-2">
            <motion.h1 
              variants={fadeUp}
              className="text-5xl md:text-7xl font-bold text-white tracking-tight"
            >
              Find a place
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h1 
              variants={fadeUp}
              className="text-5xl md:text-7xl font-bold text-white tracking-tight"
            >
              you'll <span className="relative inline-block">
                love
                <motion.span 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-1 left-0 h-3 bg-brand-500/80 -z-10 rounded-sm"
                ></motion.span>
              </span> to stay.
            </motion.h1>
          </div>
        </motion.div>

        <SearchBar />
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-[-10vh] left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-white text-sm font-medium mb-2 opacity-80">Explore stays</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          >
            ↓
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
