import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, MousePointerClick, CalendarCheck } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';

const steps = [
  { id: '01', title: 'Search', description: 'Find your perfect destination.', icon: Search },
  { id: '02', title: 'Choose', description: 'Select the best property for you.', icon: MousePointerClick },
  { id: '03', title: 'Book', description: 'Reserve securely and instantly.', icon: CalendarCheck }
];

const HowItWorks = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="py-24 bg-white px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
        <p className="text-gray-500 text-lg">Your journey begins here.</p>
      </div>

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative flex flex-col md:flex-row justify-between max-w-4xl mx-auto"
      >
        {/* Animated Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-100 z-0">
          <motion.div className="h-full bg-brand-500 origin-left" style={{ width: lineWidth }} />
        </div>

        {/* Animated Connecting Line (Mobile) */}
        <div className="md:hidden absolute top-0 bottom-0 left-12 w-0.5 bg-gray-100 z-0">
          <motion.div className="w-full bg-brand-500 origin-top" style={{ height: lineHeight }} />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div key={step.id} variants={fadeUp} className="relative z-10 flex flex-row md:flex-col items-center gap-6 md:gap-0 mb-10 md:mb-0">
              <div className="w-24 h-24 md:w-24 md:h-24 flex-shrink-0 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center relative md:mb-6">
                {/* Active pulse effect logic could go here based on scroll, simplifying for now */}
                <div className="absolute inset-0 rounded-full border border-gray-200"></div>
                <Icon className="w-8 h-8 text-brand-500" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                  {step.id}
                </div>
              </div>
              
              <div className="text-left md:text-center md:max-w-[200px]">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500">{step.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default HowItWorks;
