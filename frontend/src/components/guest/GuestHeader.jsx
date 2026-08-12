import React, { useState, useEffect } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/notificationApi';

const GuestHeader = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Guest';
  const profileImage = user?.profileImage;

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationApi.getNotifications();
        if (res.success) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Failed to load notifications');
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Dynamic Subtitle based on route
  let subtitle = "Find your next stay.";
  if (location.pathname.startsWith('/guest/trips')) subtitle = "Keep track of your upcoming and past stays.";
  if (location.pathname.startsWith('/guest/wishlist')) subtitle = "Your favorite places, all in one place.";
  if (location.pathname.startsWith('/guest/messages')) subtitle = "Stay connected with your hosts.";
  if (location.pathname.startsWith('/guest/reviews')) subtitle = "Share your travel experiences.";
  if (location.pathname.startsWith('/property')) subtitle = "Property details.";
  if (location.pathname.startsWith('/guest/search')) subtitle = "Search results.";

  const handleSearchClick = () => {
    navigate('/guest/search');
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-10 shrink-0 sticky top-0 z-20">
      
      {/* Mobile Menu Button - Left */}
      <button className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
        <Menu className="w-6 h-6" />
      </button>

      {/* Greeting - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Good morning, {firstName} 👋</h1>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{subtitle}</p>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4 ml-auto lg:ml-0">
        
        {/* Search */}
        <div className="hidden md:flex items-center relative cursor-text" onClick={handleSearchClick}>
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search stays..." 
            readOnly
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all w-48 lg:w-64 cursor-pointer"
          />
        </div>

        {/* Notifications */}
        <button 
          onClick={() => navigate('/guest/messages')} // or notifications page if created
          className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* User Avatar */}
        <button className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200">
          {profileImage ? (
            <img src={profileImage} alt={firstName} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {firstName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-bold text-gray-700 hidden sm:block">{firstName}</span>
        </button>
      </div>

    </header>
  );
};

export default GuestHeader;
