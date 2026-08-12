import React from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Bell, Shield, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';

const GuestSettings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="pb-12 max-w-3xl mx-auto"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
        <div className="bg-gray-100 p-2 rounded-xl text-gray-700">
          <Settings className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
      </motion.div>

      <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        
        <div className="p-6 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-full text-blue-500"><Bell className="w-5 h-5"/></div>
            <div>
              <h4 className="font-bold text-gray-900">Notifications</h4>
              <p className="text-sm text-gray-500">Manage how we contact you</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-full text-emerald-500"><Shield className="w-5 h-5"/></div>
            <div>
              <h4 className="font-bold text-gray-900">Privacy & Security</h4>
              <p className="text-sm text-gray-500">Manage your connected devices and data</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-full text-purple-500"><CreditCard className="w-5 h-5"/></div>
            <div>
              <h4 className="font-bold text-gray-900">Payments & Payouts</h4>
              <p className="text-sm text-gray-500">Manage your payment methods</p>
            </div>
          </div>
        </div>

        <div 
          onClick={handleLogout}
          className="p-6 flex items-center justify-between cursor-pointer hover:bg-red-50 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-50 group-hover:bg-red-100 p-3 rounded-full text-red-500 transition-colors"><LogOut className="w-5 h-5"/></div>
            <div>
              <h4 className="font-bold text-red-600">Log out</h4>
              <p className="text-sm text-red-400">Sign out of your account</p>
            </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
};

export default GuestSettings;
