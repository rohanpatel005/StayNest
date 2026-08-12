import React from 'react';
import { Outlet } from 'react-router-dom';
import GuestSidebar from './GuestSidebar';
import GuestHeader from './GuestHeader';

const GuestLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar - hidden on mobile, visible on lg screens */}
      <div className="hidden lg:block">
        <GuestSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <GuestHeader />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default GuestLayout;
