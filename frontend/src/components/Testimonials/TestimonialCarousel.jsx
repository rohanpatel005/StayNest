import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    location: 'Stayed in Bali',
    text: 'StayNest made finding our dream villa so easy. The property exceeded our expectations and the host was incredibly accommodating.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 2,
    name: 'David Chen',
    location: 'Stayed in Tokyo',
    text: 'The interface is beautiful and booking was seamless. I love the curated selections that highlight unique architectural spaces.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    location: 'Host in Barcelona',
    text: 'As a host, the tools provided are top-notch. I feel supported and my property is constantly booked with wonderful guests.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  }
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, type: "spring", stiffness: 100, damping: 20 }
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 }
    })
  };

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What our community says</h2>
            <p className="text-gray-500 text-lg">Stories from hosts and guests.</p>
          </div>
          <div className="hidden md:flex gap-4 items-center">
            <span className="text-sm font-semibold text-gray-400">
              0{currentIndex + 1} / 0{testimonials.length}
            </span>
            <div className="flex gap-2">
              <button onClick={prev} className="p-3 rounded-full border border-gray-200 hover:border-gray-900 bg-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} className="p-3 rounded-full border border-gray-200 hover:border-gray-900 bg-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-[300px] md:h-[250px] w-full max-w-4xl mx-auto">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col justify-between"
            >
              <Quote className="w-10 h-10 text-brand-100 mb-4 absolute top-8 right-8" />
              
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
                "{testimonials[currentIndex].text}"
              </p>
              
              <div className="flex items-center gap-4 mt-8">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonials[currentIndex].name}</h4>
                  <p className="text-sm text-gray-500">{testimonials[currentIndex].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Mobile controls */}
        <div className="flex md:hidden justify-between items-center mt-8">
          <span className="text-sm font-semibold text-gray-400">
            0{currentIndex + 1} / 0{testimonials.length}
          </span>
          <div className="flex gap-2">
            <button onClick={prev} className="p-3 rounded-full border border-gray-200 bg-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="p-3 rounded-full border border-gray-200 bg-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
