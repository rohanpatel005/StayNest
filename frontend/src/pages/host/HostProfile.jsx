import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hostApi } from '../../api/hostApi';
import { fadeUp, staggerContainer } from '../../animations/motionVariants';

const HostProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await hostApi.updateProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully');
      // In a real app, we'd update AuthContext user here too.
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-8 pb-12">
      <motion.h1 variants={fadeUp} className="text-3xl font-bold text-gray-900">Host Profile</motion.h1>

      <motion.div variants={fadeUp} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-brand-500"></div>
        
        <div className="relative pt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-100 text-brand-600 flex items-center justify-center text-4xl font-bold">
                {user?.name?.charAt(0) || 'H'}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 font-medium">Host since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gray-100 text-gray-900 px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="w-full p-4 border rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                className="w-full p-4 border rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors flex items-center gap-2"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
              {!isLoading && <CheckCircle2 className="w-5 h-5" />}
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Email Address</div>
                <div className="font-bold text-gray-900">{user?.email}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Phone Number</div>
                <div className="font-bold text-gray-900">{user?.phone || 'Not provided'}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Role</div>
                <div className="font-bold text-gray-900 capitalize">{user?.role}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Location</div>
                <div className="font-bold text-gray-900">Earth</div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default HostProfile;
