import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeUp } from '../../animations/motionVariants';

const HostCTA = () => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={containerRef} className="py-24 bg-white px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden bg-gray-900 min-h-[500px]">
        
        {/* Left: Image with Parallax */}
        <div className="w-full lg:w-1/2 relative h-[400px] lg:h-auto overflow-hidden">
          <motion.img 
            style={{ y: y1 }}
            src="https://images.unsplash.com/photo-1556912173-3bb406ef7e77?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Host your home" 
            className="absolute inset-0 w-full h-[120%] object-cover object-center"
          />
        </div>

        {/* Right: Content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-12 lg:p-20 relative">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 z-0"></div>
          
          <motion.div 
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="relative z-10 max-w-md"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Have a space to share?
            </motion.h2>
            
            <motion.p variants={fadeUp} className="text-gray-300 text-lg mb-10">
              Turn your property into an opportunity. Join thousands of hosts earning extra income on StayNest.
            </motion.p>
            
            <motion.button 
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 px-8 rounded-lg flex items-center gap-3 transition-colors duration-300"
            >
              <span>Become a Host</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HostCTA;
