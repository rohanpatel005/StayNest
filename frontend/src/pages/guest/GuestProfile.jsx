import React from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staggerContainer, fadeUp } from '../../animations/motionVariants';

const GuestProfile = () => {
  const { user } = useAuth();

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="pb-12 max-w-3xl mx-auto"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
        <div className="bg-brand-50 p-2 rounded-xl text-brand-500">
          <UserIcon className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Your Profile</h2>
      </motion.div>

      <motion.div variants={fadeUp} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-3xl overflow-hidden">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'G'
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" /> Guest since {new Date(user?.createdAt || Date.now()).getFullYear()}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">Email Address</label>
            <div className="flex items-center gap-3 text-gray-900 font-medium bg-gray-50 p-4 rounded-xl">
              <Mail className="w-5 h-5 text-gray-400" />
              {user?.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">Phone Number</label>
            <div className="flex items-center gap-3 text-gray-900 font-medium bg-gray-50 p-4 rounded-xl">
              <Phone className="w-5 h-5 text-gray-400" />
              {user?.phone || 'Not provided'}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GuestProfile;
