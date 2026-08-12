import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HostHeader = () => {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Host';

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-10 shrink-0 sticky top-0 z-20">
      
      {/* Mobile Menu Button - Left */}
      <button className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
        <Menu className="w-6 h-6" />
      </button>

      {/* Greeting - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Good morning, {firstName} 👋</h1>
        <p className="text-xs font-medium text-gray-500 mt-0.5">Here's what's happening with your properties.</p>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4 ml-auto lg:ml-0">
        
        {/* Search (Optional/Decorative for now) */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all w-48 lg:w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* User Avatar */}
        <button className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200">
          <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-bold text-gray-700 hidden sm:block">{firstName}</span>
        </button>
      </div>

    </header>
  );
};

export default HostHeader;
