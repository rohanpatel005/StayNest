import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [activeField, setActiveField] = useState(null);
  const navigate = useNavigate();
  
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'checkIn' && updated.checkOut && new Date(value) >= new Date(updated.checkOut)) {
        updated.checkOut = '';
      }
      return updated;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchParams.location) queryParams.append('location', searchParams.location);
    if (searchParams.checkIn) queryParams.append('checkIn', searchParams.checkIn);
    if (searchParams.checkOut) queryParams.append('checkOut', searchParams.checkOut);
    if (searchParams.guests > 1) queryParams.append('guests', searchParams.guests);

    navigate(`/search?${queryParams.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = searchParams.checkIn 
    ? new Date(new Date(searchParams.checkIn).getTime() + 86400000).toISOString().split('T')[0]
    : new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full max-w-4xl mx-auto mt-10"
    >
      <form onSubmit={handleSearch} className="bg-white rounded-full shadow-xl border border-gray-200 flex flex-col md:flex-row items-center p-2 relative">
        
        {/* Where */}
        <div 
          className="flex-1 relative w-full"
          onMouseEnter={() => setActiveField('where')}
          onMouseLeave={() => setActiveField(null)}
        >
          <div className={cn(
            "px-6 py-3 rounded-full transition-all duration-300 relative z-10 flex flex-col justify-center h-full",
            activeField === 'where' ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"
          )}>
            <label htmlFor="location" className="text-xs font-bold text-gray-900 tracking-wide cursor-pointer">Where</label>
            <input 
              id="location"
              type="text" 
              name="location"
              value={searchParams.location}
              onChange={handleInputChange}
              placeholder="Search destinations" 
              className="text-sm text-gray-700 bg-transparent outline-none w-full placeholder:text-gray-500"
            />
          </div>
          <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-px bg-gray-200 transition-opacity" style={{ opacity: activeField === 'where' || activeField === 'checkIn' ? 0 : 1 }} />
        </div>

        {/* Check in */}
        <div 
          className="flex-1 relative w-full"
          onMouseEnter={() => setActiveField('checkIn')}
          onMouseLeave={() => setActiveField(null)}
        >
          <div className={cn(
            "px-6 py-3 rounded-full transition-all duration-300 relative z-10 flex flex-col justify-center h-full",
            activeField === 'checkIn' ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"
          )}>
            <label htmlFor="checkIn" className="text-xs font-bold text-gray-900 tracking-wide cursor-pointer">Check in</label>
            <input 
              id="checkIn"
              type="date" 
              name="checkIn"
              min={today}
              value={searchParams.checkIn}
              onChange={handleInputChange}
              className="text-sm text-gray-700 bg-transparent outline-none w-full"
            />
          </div>
          <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-px bg-gray-200 transition-opacity" style={{ opacity: activeField === 'checkIn' || activeField === 'checkOut' ? 0 : 1 }} />
        </div>

        {/* Check out */}
        <div 
          className="flex-1 relative w-full"
          onMouseEnter={() => setActiveField('checkOut')}
          onMouseLeave={() => setActiveField(null)}
        >
          <div className={cn(
            "px-6 py-3 rounded-full transition-all duration-300 relative z-10 flex flex-col justify-center h-full",
            activeField === 'checkOut' ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"
          )}>
            <label htmlFor="checkOut" className="text-xs font-bold text-gray-900 tracking-wide cursor-pointer">Check out</label>
            <input 
              id="checkOut"
              type="date" 
              name="checkOut"
              min={minCheckOut}
              value={searchParams.checkOut}
              onChange={handleInputChange}
              className="text-sm text-gray-700 bg-transparent outline-none w-full"
            />
          </div>
          <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-px bg-gray-200 transition-opacity" style={{ opacity: activeField === 'checkOut' || activeField === 'who' ? 0 : 1 }} />
        </div>

        {/* Who */}
        <div 
          className="flex-1 relative w-full"
          onMouseEnter={() => setActiveField('who')}
          onMouseLeave={() => setActiveField(null)}
        >
          <div className={cn(
            "px-6 py-3 rounded-full transition-all duration-300 relative z-10 flex flex-col justify-center h-full",
            activeField === 'who' ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"
          )}>
            <label htmlFor="guests" className="text-xs font-bold text-gray-900 tracking-wide cursor-pointer">Who</label>
            <input 
              id="guests"
              type="number" 
              name="guests"
              min="1"
              value={searchParams.guests}
              onChange={handleInputChange}
              className="text-sm text-gray-700 bg-transparent outline-none w-full"
            />
          </div>
        </div>
        
        <div className="pr-2 pl-4 pt-4 md:pt-0 pb-2 md:pb-0 w-full md:w-auto flex justify-center">
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-500 hover:bg-brand-600 text-white p-4 rounded-full flex items-center justify-center transition-colors shadow-md group w-full md:w-auto"
          >
            <Search className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default SearchBar;
