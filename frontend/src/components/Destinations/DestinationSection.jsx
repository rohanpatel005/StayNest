import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';
import DestinationCard from './DestinationCard';

const destinations = [
  { id: 1, name: 'Goa', properties: '1,245 stays', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', featured: true },
  { id: 2, name: 'Mumbai', properties: '850 stays', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', featured: false },
  { id: 3, name: 'Jaipur', properties: '620 stays', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', featured: false },
  { id: 4, name: 'Dubai', properties: '3,100 stays', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', featured: false },
];

const DestinationSection = () => {
  return (
    <section className="py-24 bg-white px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Destinations travelers love</h2>
          <p className="text-gray-500 text-lg">Explore these popular destinations.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-[400px]">
            <DestinationCard destination={destinations[0]} />
          </div>
          <div className="grid grid-cols-1 gap-6 h-[400px]">
            <div className="h-[188px]">
              <DestinationCard destination={destinations[1]} />
            </div>
            <div className="h-[188px]">
              <DestinationCard destination={destinations[2]} />
            </div>
          </div>
          <div className="md:col-span-3 h-[300px] mt-2 md:mt-0">
             <DestinationCard destination={destinations[3]} />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DestinationSection;
