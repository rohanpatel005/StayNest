import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, CheckCircle, Smartphone } from 'lucide-react';
import { cn } from '../../utils/cn';

const features = [
  {
    id: '01',
    title: 'Verified stays',
    description: 'Every home is verified for quality and comfort before it joins our platform.',
    icon: CheckCircle,
    color: 'bg-emerald-500'
  },
  {
    id: '02',
    title: 'Trusted hosts',
    description: 'Connect with reliable hosts who are committed to providing great stays.',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: '03',
    title: 'Secure booking',
    description: 'Your payment and personal details are protected by industry-leading security.',
    icon: Shield,
    color: 'bg-purple-500'
  },
  {
    id: '04',
    title: 'Easy experiences',
    description: 'Manage everything from booking to check-out right from your device.',
    icon: Smartphone,
    color: 'bg-brand-500'
  }
];

const WhyStayNest = () => {
  const [activeFeature, setActiveFeature] = useState(features[0].id);

  return (
    <section className="py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why StayNest</h2>
          <p className="text-gray-500 text-lg">Designed for peace of mind.</p>
        </div>

        <div className="flex flex-col md:flex-row border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
          {features.map((feature) => {
            const isActive = activeFeature === feature.id;
            const Icon = feature.icon;

            return (
              <div 
                key={feature.id}
                onMouseEnter={() => setActiveFeature(feature.id)}
                onClick={() => setActiveFeature(feature.id)}
                className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 last:border-0 relative cursor-pointer group"
              >
                {/* Active Background */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeFeatureBg"
                      className="absolute inset-0 bg-gray-50 z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[240px]">
                  <div>
                    <motion.div 
                      layout
                      className={cn(
                        "text-4xl font-bold mb-6 transition-colors duration-300",
                        isActive ? "text-gray-900" : "text-gray-300 group-hover:text-gray-400"
                      )}
                    >
                      {feature.id}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  </div>
                  
                  <div className="h-[80px]">
                    <AnimatePresence mode="wait">
                      {isActive ? (
                        <motion.p
                          key="desc"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-600 text-sm leading-relaxed"
                        >
                          {feature.description}
                        </motion.p>
                      ) : (
                        <motion.div
                          key="icon"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-end h-full"
                        >
                          <Icon className="w-8 h-8 text-gray-300 group-hover:text-gray-400 transition-colors" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyStayNest;
