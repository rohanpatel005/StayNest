import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { staggerContainer } from '../../animations/motionVariants';
import PropertyCard from './PropertyCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const properties = [
  { id: 1, location: 'Bali, Indonesia', title: 'Luxury Villa with Infinity Pool', rating: '4.98', price: 350, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 2, location: 'Santorini, Greece', title: 'Cliffside Cave House', rating: '4.95', price: 420, image: 'https://images.unsplash.com/photo-1469796466635-455ede14929b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 3, location: 'Tulum, Mexico', title: 'Eco-Chic Jungle Treehouse', rating: '4.89', price: 280, image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 4, location: 'Kyoto, Japan', title: 'Traditional Machiya Stay', rating: '4.99', price: 310, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 5, location: 'Aspen, Colorado', title: 'Modern Ski Chalet', rating: '4.92', price: 650, image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

const FeaturedStays = () => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-white px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Stay somewhere special</h2>
          <p className="text-gray-500 text-lg">Curated properties for extraordinary trips.</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button onClick={() => scroll('left')} className="p-3 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scroll('right')} className="p-3 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar snap-x snap-mandatory"
        >
          {properties.map((property) => (
            <div key={property.id} className="min-w-[280px] md:min-w-[320px] max-w-[320px] snap-start flex-shrink-0">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
      </motion.div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
};

export default FeaturedStays;
