import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

const AuthInput = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  icon: Icon, 
  error, 
  placeholder,
  required,
  disabled 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasValue = value && value.length > 0;

  return (
    <div className="flex flex-col gap-1 mb-4">
      <div 
        className={cn(
          "relative flex items-center border rounded-xl overflow-hidden transition-all duration-300 bg-white",
          isFocused 
            ? "border-brand-500 shadow-[0_0_0_3px_rgba(255,56,92,0.1)]" 
            : error 
              ? "border-red-500 bg-red-50/30" 
              : "border-gray-200 hover:border-gray-300",
          disabled && "opacity-50 cursor-not-allowed bg-gray-50"
        )}
      >
        {/* Left Icon */}
        {Icon && (
          <div className="pl-4 pr-2 flex items-center justify-center text-gray-400">
            <Icon className={cn(
              "w-5 h-5 transition-colors duration-300",
              isFocused ? "text-brand-500" : error ? "text-red-500" : ""
            )} />
          </div>
        )}

        {/* Input & Floating Label Container */}
        <div className="relative flex-1 px-3 py-3 h-14">
          <label 
            htmlFor={name}
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none text-gray-400 z-10",
              (isFocused || hasValue) 
                ? "text-[10px] uppercase font-bold tracking-wider top-1.5" 
                : "text-sm top-1/2 -translate-y-1/2"
            )}
          >
            {label} {required && '*'}
          </label>
          <input
            id={name}
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={(isFocused || hasValue) ? placeholder : ''}
            className="w-full h-full pt-4 bg-transparent outline-none text-gray-900 text-sm font-medium placeholder:text-gray-300"
          />
        </div>

        {/* Password Toggle */}
        {isPassword && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPassword(!showPassword)}
            className="pr-4 pl-2 flex items-center justify-center text-gray-400 hover:text-gray-600 outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </motion.button>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-red-500 text-xs font-medium pl-1 flex items-center gap-1"
          >
            <span>⚠</span> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthInput;
