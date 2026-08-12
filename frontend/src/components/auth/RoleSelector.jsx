import React from 'react';
import { motion } from 'framer-motion';
import { Home, User, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const RoleSelector = ({ selectedRole, onChange }) => {
  return (
    <div className="mb-6">
      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-3 pl-1">
        I want to
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Guest Option */}
        <div 
          onClick={() => onChange('guest')}
          className={cn(
            "relative flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group",
            selectedRole === 'guest' 
              ? "border-brand-500 bg-brand-50/50" 
              : "border-gray-100 hover:border-gray-200 bg-white"
          )}
        >
          {selectedRole === 'guest' && (
            <motion.div 
              layoutId="roleActive" 
              className="absolute inset-0 bg-brand-50/50 z-0" 
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex flex-col items-center text-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
              selectedRole === 'guest' ? "bg-brand-100 text-brand-600" : "bg-gray-50 text-gray-400 group-hover:text-gray-600"
            )}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className={cn("font-bold text-sm mb-0.5 transition-colors", selectedRole === 'guest' ? "text-brand-700" : "text-gray-900")}>Guest</div>
              <div className="text-xs text-gray-500">Find your perfect stay.</div>
            </div>
          </div>
          {selectedRole === 'guest' && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-3 right-3 text-brand-500 z-10"
            >
              <CheckCircle2 className="w-5 h-5" />
            </motion.div>
          )}
        </div>

        {/* Host Option */}
        <div 
          onClick={() => onChange('host')}
          className={cn(
            "relative flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group",
            selectedRole === 'host' 
              ? "border-brand-500 bg-brand-50/50" 
              : "border-gray-100 hover:border-gray-200 bg-white"
          )}
        >
          {selectedRole === 'host' && (
            <motion.div 
              layoutId="roleActive" 
              className="absolute inset-0 bg-brand-50/50 z-0" 
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <div className="relative z-10 flex flex-col items-center text-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
              selectedRole === 'host' ? "bg-brand-100 text-brand-600" : "bg-gray-50 text-gray-400 group-hover:text-gray-600"
            )}>
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className={cn("font-bold text-sm mb-0.5 transition-colors", selectedRole === 'host' ? "text-brand-700" : "text-gray-900")}>Host</div>
              <div className="text-xs text-gray-500">Share your space.</div>
            </div>
          </div>
          {selectedRole === 'host' && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-3 right-3 text-brand-500 z-10"
            >
              <CheckCircle2 className="w-5 h-5" />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
