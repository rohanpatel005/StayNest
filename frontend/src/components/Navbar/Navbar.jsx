import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Home as HomeIcon } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import Button from '../Button/Button';
import { cn } from '../../utils/cn';

const navLinks = [
  { name: 'Stays', path: '/' },
  { name: 'Experiences', path: '#' },
  { name: 'Become a Host', path: '/host' },
];

const Navbar = ({ transparentOnTop = false }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(!transparentOnTop);
  const [hoveredLink, setHoveredLink] = useState(null);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (transparentOnTop) {
      if (latest > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDarkText = isScrolled || !transparentOnTop;

  return (
    <motion.nav 
      initial={false}
      animate={{
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0)",
        backdropFilter: isScrolled ? "blur(12px)" : "blur(0px)",
        boxShadow: isScrolled ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "0 0px 0px rgba(0,0,0,0)",
        paddingTop: isScrolled ? "0.5rem" : "1rem",
        paddingBottom: isScrolled ? "0.5rem" : "1rem",
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <HomeIcon className={cn("h-8 w-8 transition-colors duration-300", isDarkText ? "text-brand-500" : "text-white group-hover:text-gray-200")} />
              <span className={cn("font-bold text-xl tracking-tight transition-colors duration-300", isDarkText ? "text-brand-500" : "text-white")}>StayNest</span>
            </Link>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
                className="relative py-2"
              >
                <span className={cn(
                  "text-sm font-medium transition-colors duration-300", 
                  isDarkText ? "text-gray-700 hover:text-gray-900" : "text-white/90 hover:text-white"
                )}>
                  {link.name}
                </span>
                {hoveredLink === link.name && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className={cn("absolute bottom-0 left-0 right-0 h-0.5 rounded-full", isDarkText ? "bg-gray-900" : "bg-white")}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className={cn("text-sm font-medium hidden sm:block", isDarkText ? "text-gray-700" : "text-white")}>
                  {user?.name}
                </span>
                
                <div className="relative group">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center gap-2 border rounded-full p-2 transition-all duration-300",
                      isDarkText ? "border-gray-300 hover:shadow-md bg-white" : "border-white/30 hover:border-white hover:bg-white/10 text-white"
                    )}
                  >
                    <UserIcon className={cn("h-5 w-5", isDarkText ? "text-gray-500" : "text-white")} />
                  </motion.button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-1 ring-1 ring-black ring-opacity-5 hidden group-hover:block overflow-hidden">
                    {user?.role === 'host' && (
                      <Link to="/host" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        Host Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className={cn("text-sm font-medium transition-colors duration-300", isDarkText ? "text-gray-700 hover:text-brand-500" : "text-white hover:text-gray-200")}>
                  Log in
                </Link>
                <Link to="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant={isDarkText ? "primary" : "secondary"} size="sm" className={cn("rounded-full font-semibold border-0", !isDarkText && "bg-white text-gray-900 hover:bg-gray-100")}>
                      Sign up
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
