import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

const SearchBar = () => {
  const [activeField, setActiveField] = useState(null);

  const fields = [
    { id: 'where', label: 'Where', placeholder: 'Search destinations' },
    { id: 'checkIn', label: 'Check in', placeholder: 'Add dates' },
    { id: 'checkOut', label: 'Check out', placeholder: 'Add dates' },
    { id: 'who', label: 'Who', placeholder: 'Add guests' }
  ];

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-20 w-full max-w-4xl mx-auto mt-10"
    >
      <div className="bg-white rounded-full shadow-xl border border-gray-200 flex items-center p-2 relative">
        {fields.map((field, index) => (
          <div 
            key={field.id}
            className="flex-1 relative"
            onMouseEnter={() => setActiveField(field.id)}
            onMouseLeave={() => setActiveField(null)}
          >
            <div className={cn(
              "px-6 py-3 rounded-full cursor-pointer transition-all duration-300 relative z-10",
              activeField === field.id ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"
            )}>
              <div className="text-xs font-bold text-gray-900 tracking-wide">{field.label}</div>
              <div className="text-sm text-gray-500 truncate">{field.placeholder}</div>
            </div>
            
            {/* Divider */}
            {index < fields.length - 1 && (
              <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gray-200 transition-opacity" 
                style={{ opacity: activeField === field.id || activeField === fields[index + 1].id ? 0 : 1 }}
              />
            )}
          </div>
        ))}
        
        <div className="pr-2 pl-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-500 hover:bg-brand-600 text-white p-4 rounded-full flex items-center justify-center transition-colors shadow-md group"
          >
            <Search className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SearchBar;
