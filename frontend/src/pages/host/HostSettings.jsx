import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, CreditCard, HelpCircle } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';

const HostSettings = () => {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-8 pb-12">
      <motion.h1 variants={fadeUp} className="text-3xl font-bold text-gray-900">Settings</motion.h1>

      <motion.div variants={fadeUp} className="space-y-4">
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-gray-300 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Bell className="w-6 h-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            <p className="text-gray-500 text-sm mt-1">Choose what we get in touch about and how.</p>
          </div>
        </div>



        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-gray-300 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-brand-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">Payments & Payouts</h3>
            <p className="text-gray-500 text-sm mt-1">Review payments, payouts, coupons, and gift cards.</p>
          </div>
        </div>



      </motion.div>
    </motion.div>
  );
};

export default HostSettings;
