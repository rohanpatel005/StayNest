import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const AuthButton = ({ 
  children, 
  isLoading, 
  type = 'button', 
  className,
  disabled,
  onClick
}) => {
  return (
    <motion.button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      whileHover={{ scale: (isLoading || disabled) ? 1 : 1.02 }}
      whileTap={{ scale: (isLoading || disabled) ? 1 : 0.98 }}
      className={cn(
        "group relative w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all duration-300 overflow-hidden",
        (isLoading || disabled) 
          ? "bg-brand-400 cursor-not-allowed opacity-80" 
          : "bg-brand-500 hover:bg-brand-600 hover:shadow-[0_8px_20px_-6px_rgba(255,56,92,0.5)]",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 relative z-10">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Please wait...</span>
          </>
        ) : (
          <>
            <span>{children}</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </div>
    </motion.button>
  );
};

export default AuthButton;
