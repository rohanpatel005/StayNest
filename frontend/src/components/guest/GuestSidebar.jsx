import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Luggage, Heart, MessageCircle, Star, User, Settings, LogOut, Home as HomeIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { messageApi } from '../../api/messageApi';

const navItems = [
  { name: 'Explore', path: '/guest', icon: Compass },
  { name: 'Trips', path: '/trips', icon: Luggage },
  { name: 'Wishlist', path: '/wishlist', icon: Heart },
  { name: 'Messages', path: '/messages', icon: MessageCircle },
  { name: 'Reviews', path: '/reviews', icon: Star },
];

const secondaryItems = [
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const GuestSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [unreadTotal, setUnreadTotal] = React.useState(0);

  React.useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await messageApi.getConversations();
        if (res.success) {
          const total = res.data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
          setUnreadTotal(total);
        }
      } catch (err) {}
    };
    fetchUnread();
  }, [location.pathname]); // refetch on navigation

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/guest') return location.pathname === '/guest' || location.pathname === '/search' || location.pathname.startsWith('/property');
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item }) => {
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        className={cn(
          "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group mb-1",
          active ? "text-brand-700 font-bold" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium"
        )}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active-guest"
            className="absolute inset-0 bg-brand-50 rounded-xl z-0 border border-brand-100"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <item.icon className={cn("w-5 h-5 relative z-10", active ? "text-brand-500" : "text-gray-400 group-hover:text-gray-600")} />
        <span className="relative z-10 flex-1">{item.name}</span>
        {item.name === 'Messages' && unreadTotal > 0 && (
          <span className="relative z-10 w-2 h-2 rounded-full bg-red-500 shadow-sm" title={`${unreadTotal} unread`} />
        )}
      </Link>
    );
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col justify-between py-6 px-4">
      <div>
        <Link to="/guest" className="flex items-center gap-2 px-2 mb-10 group">
          <div className="bg-brand-500 text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform">
            <HomeIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-xl text-gray-900 leading-none tracking-tight">StayNest</div>
            <div className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-0.5">Guest</div>
          </div>
        </Link>

        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>
      </div>

      <div>
        <div className="h-px bg-gray-100 w-full my-4"></div>
        <div className="flex flex-col gap-1">
          {secondaryItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-colors group mt-2"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestSidebar;
